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
}
