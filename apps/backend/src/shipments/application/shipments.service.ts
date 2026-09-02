import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Shipment, ShipmentStatus, UserRole } from '../../generated/prisma/client.js';
import { generateTrackingCode } from '../domain/tracking-code.generator.js';
import {
  canCancelShipment,
  isValidTransition,
} from '../domain/shipment-status-transitions.js';
import { firstFitDecreasing } from '../domain/first-fit-decreasing.js';
import { CreateShipmentDto } from '../presentation/dto/create-shipment.dto.js';
import { AssignVehiclesDto } from '../presentation/dto/assign-vehicles.dto.js';
import { ListShipmentsQueryDto } from '../presentation/dto/list-shipments-query.dto.js';
import { UpdateShipmentStatusDto } from '../presentation/dto/update-shipment-status.dto.js';
import { ShipmentsRepository } from '../infrastructure/shipments.repository.js';

const MAX_TRACKING_CODE_ATTEMPTS = 5;

type ShipmentWithEvents = Shipment & {
  events: Array<{
    id: string;
    status: Shipment['status'];
    location: string | null;
    notes: string | null;
    createdAt: Date;
    user: {
      id: string;
      email: string;
      role: UserRole;
    };
  }>;
};

@Injectable()
export class ShipmentsService {
  constructor(private readonly shipmentsRepository: ShipmentsRepository) {}

  async create(dto: CreateShipmentDto, userId: string) {
    for (let attempt = 0; attempt < MAX_TRACKING_CODE_ATTEMPTS; attempt++) {
      const trackingCode = generateTrackingCode();

      try {
        const shipment = await this.shipmentsRepository.createWithInitialEvent({
          trackingCode,
          originAddress: dto.originAddress,
          destinationAddress: dto.destinationAddress,
          recipientName: dto.recipientName,
          contactPhone: dto.contactPhone,
          weight: dto.weight,
          createdById: userId,
        });

        return this.toShipmentResponse(shipment);
      } catch (error) {
        if (this.isTrackingCodeConflict(error)) {
          continue;
        }
        throw error;
      }
    }

    throw new ConflictException(
      'No se pudo generar un código de seguimiento único.',
    );
  }

  async findAll(query: ListShipmentsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const [shipments, total] =
      await this.shipmentsRepository.findManyPaginated({
        page,
        limit,
        status: query.status,
      });

    return {
      data: shipments.map((shipment) => this.toShipmentResponse(shipment)),
      meta: {
        page,
        limit,
        total,
        totalPages: total === 0 ? 0 : Math.ceil(total / limit),
      },
    };
  }

  async findById(id: string) {
    const shipment = await this.shipmentsRepository.findByIdWithEvents(id);

    if (!shipment) {
      throw new NotFoundException();
    }

    return this.toShipmentDetailResponse(shipment);
  }

  async updateStatus(id: string, dto: UpdateShipmentStatusDto, userId: string) {
    const shipment = await this.shipmentsRepository.findById(id);

    if (!shipment) {
      throw new NotFoundException();
    }

    if (!isValidTransition(shipment.status, dto.status)) {
      throw new ConflictException(
        `No se puede cambiar el envío de ${shipment.status} a ${dto.status}.`,
      );
    }

    const deliveredAt =
      dto.status === ShipmentStatus.DELIVERED ? new Date() : undefined;

    const updated = await this.shipmentsRepository.updateStatusWithEvent({
      shipmentId: id,
      status: dto.status,
      userId,
      location: dto.location,
      notes: dto.notes,
      deliveredAt,
    });

    return this.toShipmentResponse(updated);
  }

  async assignVehicles(dto: AssignVehiclesDto) {
    const shipments = await this.shipmentsRepository.findByIds(dto.shipmentIds);

    if (shipments.length !== dto.shipmentIds.length) {
      throw new NotFoundException('Uno o más envíos no existen.');
    }

    const invalidStatus = shipments.find(
      (shipment) => shipment.status !== ShipmentStatus.IN_WAREHOUSE,
    );

    if (invalidStatus) {
      throw new ConflictException(
        'Todos los envíos deben estar en estado IN_WAREHOUSE.',
      );
    }

    for (const shipment of shipments) {
      const weight = Number(shipment.weight);

      if (weight > dto.vehicleCapacity) {
        throw new BadRequestException(
          `El envío ${shipment.trackingCode} pesa ${weight} kg y supera la capacidad del vehículo de ${dto.vehicleCapacity} kg.`,
        );
      }
    }

    const ffdInput = shipments.map((shipment) => ({
      shipmentId: shipment.id,
      trackingCode: shipment.trackingCode,
      weight: Number(shipment.weight),
    }));

    return firstFitDecreasing(ffdInput, dto.vehicleCapacity);
  }

  async cancel(id: string, userId: string) {
    const shipment = await this.shipmentsRepository.findById(id);

    if (!shipment) {
      throw new NotFoundException();
    }

    if (!canCancelShipment(shipment.status)) {
      throw new ConflictException(
        `No se puede cancelar un envío en estado ${shipment.status}.`,
      );
    }

    const updated = await this.shipmentsRepository.cancelWithEvent({
      shipmentId: id,
      userId,
    });

    return this.toShipmentResponse(updated);
  }

  private isTrackingCodeConflict(error: unknown): boolean {
    return (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === 'P2002' &&
      Array.isArray(error.meta?.target) &&
      error.meta.target.includes('trackingCode')
    );
  }

  private toShipmentResponse(shipment: Shipment) {
    return {
      id: shipment.id,
      trackingCode: shipment.trackingCode,
      originAddress: shipment.originAddress,
      destinationAddress: shipment.destinationAddress,
      recipientName: shipment.recipientName,
      contactPhone: shipment.contactPhone,
      weight: Number(shipment.weight),
      status: shipment.status,
      deliveredAt: shipment.deliveredAt,
      createdAt: shipment.createdAt,
    };
  }

  private toShipmentDetailResponse(shipment: ShipmentWithEvents) {
    return {
      ...this.toShipmentResponse(shipment),
      events: shipment.events.map((event) => ({
        id: event.id,
        status: event.status,
        location: event.location,
        notes: event.notes,
        createdAt: event.createdAt,
        responsibleUser: event.user,
      })),
    };
  }
}
