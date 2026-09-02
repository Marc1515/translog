export type ShipmentStatus =
  | 'CREATED'
  | 'IN_WAREHOUSE'
  | 'IN_TRANSIT'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'RETURNED'
  | 'CANCELED';

export interface Shipment {
  id: string;
  trackingCode: string;
  originAddress: string;
  destinationAddress: string;
  recipientName: string;
  contactPhone: string | null;
  weight: number;
  status: ShipmentStatus;
  deliveredAt: string | null;
  createdAt: string;
}

export interface CreateShipmentRequest {
  originAddress: string;
  destinationAddress: string;
  recipientName: string;
  contactPhone?: string;
  weight: number;
}

export interface ShipmentsListMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ShipmentsListResponse {
  data: Shipment[];
  meta: ShipmentsListMeta;
}

export interface GetShipmentsParams {
  page: number;
  limit: number;
  status?: ShipmentStatus;
}
