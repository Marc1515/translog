import { ShipmentStatus } from '../models/shipment.models';

const ALLOWED_TRANSITIONS: Record<ShipmentStatus, ShipmentStatus[]> = {
  CREATED: ['IN_WAREHOUSE'],
  IN_WAREHOUSE: ['IN_TRANSIT'],
  IN_TRANSIT: ['OUT_FOR_DELIVERY'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'RETURNED'],
  DELIVERED: [],
  RETURNED: [],
  CANCELED: [],
};

const CANCELABLE_STATUSES: ShipmentStatus[] = [
  'CREATED',
  'IN_WAREHOUSE',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
];

export function getAllowedTransitions(status: ShipmentStatus): ShipmentStatus[] {
  return ALLOWED_TRANSITIONS[status];
}

export function canCancelShipment(status: ShipmentStatus): boolean {
  return CANCELABLE_STATUSES.includes(status);
}

export function isTerminalStatus(status: ShipmentStatus): boolean {
  return status === 'DELIVERED' || status === 'RETURNED' || status === 'CANCELED';
}
