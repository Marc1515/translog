import { ShipmentStatus } from '../models/shipment.models';

export const SHIPMENT_STATUS_LABELS: Record<ShipmentStatus, string> = {
  CREATED: 'Creado',
  IN_WAREHOUSE: 'En almacén',
  IN_TRANSIT: 'En tránsito',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregado',
  RETURNED: 'Devuelto',
  CANCELED: 'Cancelado',
};

export type StatusFilter = ShipmentStatus | 'ALL';

export interface StatusFilterOption {
  value: StatusFilter;
  label: string;
}

export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: 'ALL', label: 'Todos' },
  { value: 'CREATED', label: SHIPMENT_STATUS_LABELS.CREATED },
  { value: 'IN_WAREHOUSE', label: SHIPMENT_STATUS_LABELS.IN_WAREHOUSE },
  { value: 'IN_TRANSIT', label: SHIPMENT_STATUS_LABELS.IN_TRANSIT },
  { value: 'OUT_FOR_DELIVERY', label: SHIPMENT_STATUS_LABELS.OUT_FOR_DELIVERY },
  { value: 'DELIVERED', label: SHIPMENT_STATUS_LABELS.DELIVERED },
  { value: 'RETURNED', label: SHIPMENT_STATUS_LABELS.RETURNED },
  { value: 'CANCELED', label: SHIPMENT_STATUS_LABELS.CANCELED },
];
