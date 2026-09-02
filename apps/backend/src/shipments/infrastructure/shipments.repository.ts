import { Injectable } from '@nestjs/common';
import { Prisma, ShipmentStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../prisma/prisma.service.js';

export type CreateShipmentData = {
  trackingCode: string;
  originAddress: string;
  destinationAddress: string;
  recipientName: string;
  contactPhone?: string;
  weight: number;
  createdById: string;
};

@Injectable()
export class ShipmentsRepository {
  constructor(private readonly prisma: PrismaService) {}

  createWithInitialEvent(data: CreateShipmentData) {
    return this.prisma.$transaction(async (tx) => {
      return tx.shipment.create({
        data: {
          trackingCode: data.trackingCode,
          originAddress: data.originAddress,
          destinationAddress: data.destinationAddress,
          recipientName: data.recipientName,
          contactPhone: data.contactPhone,
          weight: data.weight,
          status: ShipmentStatus.CREATED,
          createdById: data.createdById,
          events: {
            create: {
              status: ShipmentStatus.CREATED,
              userId: data.createdById,
              location: null,
              notes: null,
            },
          },
        },
      });
    });
  }

  findManyPaginated(params: {
    page: number;
    limit: number;
    status?: ShipmentStatus;
  }) {
    const where: Prisma.ShipmentWhereInput = params.status
      ? { status: params.status }
      : {};

    const skip = (params.page - 1) * params.limit;

    return Promise.all([
      this.prisma.shipment.findMany({
        where,
        skip,
        take: params.limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.shipment.count({ where }),
    ]);
  }

  findById(id: string) {
    return this.prisma.shipment.findUnique({
      where: { id },
    });
  }

  findByIds(ids: string[]) {
    return this.prisma.shipment.findMany({
      where: { id: { in: ids } },
      select: {
        id: true,
        trackingCode: true,
        weight: true,
        status: true,
      },
    });
  }

  findByIdWithEvents(id: string) {
    return this.prisma.shipment.findUnique({
      where: { id },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
          select: {
            id: true,
            status: true,
            location: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });
  }

  findByTrackingCodeWithEvents(trackingCode: string) {
    return this.prisma.shipment.findUnique({
      where: { trackingCode },
      include: {
        events: {
          orderBy: { createdAt: 'asc' },
          select: {
            status: true,
            location: true,
            notes: true,
            createdAt: true,
          },
        },
      },
    });
  }

  updateStatusWithEvent(params: {
    shipmentId: string;
    status: ShipmentStatus;
    userId: string;
    location: string;
    notes?: string;
    deliveredAt?: Date;
  }) {
    return this.prisma.$transaction(async (tx) => {
      return tx.shipment.update({
        where: { id: params.shipmentId },
        data: {
          status: params.status,
          ...(params.deliveredAt !== undefined && {
            deliveredAt: params.deliveredAt,
          }),
          events: {
            create: {
              status: params.status,
              userId: params.userId,
              location: params.location,
              notes: params.notes ?? null,
            },
          },
        },
      });
    });
  }

  cancelWithEvent(params: { shipmentId: string; userId: string }) {
    return this.prisma.$transaction(async (tx) => {
      return tx.shipment.update({
        where: { id: params.shipmentId },
        data: {
          status: ShipmentStatus.CANCELED,
          events: {
            create: {
              status: ShipmentStatus.CANCELED,
              userId: params.userId,
              location: null,
              notes: null,
            },
          },
        },
      });
    });
  }
}
