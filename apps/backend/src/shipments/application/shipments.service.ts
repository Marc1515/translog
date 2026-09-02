import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Shipment } from '../../generated/prisma/client.js';
import { generateTrackingCode } from '../domain/tracking-code.generator.js';
import { CreateShipmentDto } from '../presentation/dto/create-shipment.dto.js';
import { ListShipmentsQueryDto } from '../presentation/dto/list-shipments-query.dto.js';
import { ShipmentsRepository } from '../infrastructure/shipments.repository.js';

const MAX_TRACKING_CODE_ATTEMPTS = 5;

type ShipmentWithEvents = Shipment & {
  events: Array<{
    id: string;
    status: Shipment['status'];
    location: string | null;
    notes: string | null;
    createdAt: Date;
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
      })),
    };
  }
}
