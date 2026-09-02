import { ShipmentStatus } from '../../shipments/models/shipment.models';

export interface PublicTrackingEvent {
  status: ShipmentStatus;
  location: string | null;
  notes: string | null;
  createdAt: string;
}

export interface PublicTrackingResponse {
  trackingCode: string;
  originAddress: string;
  destinationAddress: string;
  recipientName: string;
  status: ShipmentStatus;
  weight: number;
  deliveredAt: string | null;
  createdAt: string;
  events: PublicTrackingEvent[];
}
