import { ShipmentStatus } from '../../generated/prisma/client.js';

const FLOW_TRANSITIONS: Partial<Record<ShipmentStatus, ShipmentStatus[]>> = {
  [ShipmentStatus.CREATED]: [ShipmentStatus.IN_WAREHOUSE],
  [ShipmentStatus.IN_WAREHOUSE]: [ShipmentStatus.IN_TRANSIT],
  [ShipmentStatus.IN_TRANSIT]: [ShipmentStatus.OUT_FOR_DELIVERY],
  [ShipmentStatus.OUT_FOR_DELIVERY]: [
    ShipmentStatus.DELIVERED,
    ShipmentStatus.RETURNED,
  ],
};

const ACTIVE_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.CREATED,
  ShipmentStatus.IN_WAREHOUSE,
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.OUT_FOR_DELIVERY,
];

const TERMINAL_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.DELIVERED,
  ShipmentStatus.RETURNED,
  ShipmentStatus.CANCELED,
];

export function getAllowedTransitions(status: ShipmentStatus): ShipmentStatus[] {
  return FLOW_TRANSITIONS[status] ?? [];
}

export function isValidTransition(
  currentStatus: ShipmentStatus,
  nextStatus: ShipmentStatus,
): boolean {
  return getAllowedTransitions(currentStatus).includes(nextStatus);
}

export function canCancelShipment(status: ShipmentStatus): boolean {
  return ACTIVE_STATUSES.includes(status);
}

export function isTerminalStatus(status: ShipmentStatus): boolean {
  return TERMINAL_STATUSES.includes(status);
}
