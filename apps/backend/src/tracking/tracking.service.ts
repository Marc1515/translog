import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Shipment, ShipmentStatus } from '../generated/prisma/client.js';
import { isValidTrackingCodeFormat } from '../shipments/domain/tracking-code.generator.js';
import { ShipmentsRepository } from '../shipments/infrastructure/shipments.repository.js';

type ShipmentWithPublicEvents = Shipment & {
  events: Array<{
    status: ShipmentStatus;
    location: string | null;
    notes: string | null;
    createdAt: Date;
  }>;
};

export type PublicTrackingResponse = {
  trackingCode: string;
  originAddress: string;
  destinationAddress: string;
  recipientName: string;
  status: ShipmentStatus;
  weight: number;
  deliveredAt: Date | null;
  createdAt: Date;
  events: Array<{
    status: ShipmentStatus;
    location: string | null;
    notes: string | null;
    createdAt: Date;
  }>;
};

@Injectable()
export class TrackingService {
  constructor(private readonly shipmentsRepository: ShipmentsRepository) {}

  async findByTrackingCode(trackingCode: string): Promise<PublicTrackingResponse> {
    if (!isValidTrackingCodeFormat(trackingCode)) {
      throw new BadRequestException('Formato de código de seguimiento inválido.');
    }

    const shipment =
      await this.shipmentsRepository.findByTrackingCodeWithEvents(trackingCode);

    if (!shipment) {
      throw new NotFoundException();
    }

    return this.toPublicResponse(shipment);
  }

  private toPublicResponse(shipment: ShipmentWithPublicEvents): PublicTrackingResponse {
    return {
      trackingCode: shipment.trackingCode,
      originAddress: shipment.originAddress,
      destinationAddress: shipment.destinationAddress,
      recipientName: shipment.recipientName,
      status: shipment.status,
      weight: Number(shipment.weight),
      deliveredAt: shipment.deliveredAt,
      createdAt: shipment.createdAt,
      events: shipment.events.map((event) => ({
        status: event.status,
        location: event.location,
        notes: event.notes,
        createdAt: event.createdAt,
      })),
    };
  }
}
