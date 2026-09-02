import { describe, expect, it } from 'vitest';
import { ShipmentStatus } from '../../generated/prisma/client.js';
import {
  canCancelShipment,
  getAllowedTransitions,
  isTerminalStatus,
  isValidTransition,
} from './shipment-status-transitions.js';

describe('shipment-status-transitions', () => {
  it('allows the valid forward sequence', () => {
    expect(
      isValidTransition(ShipmentStatus.CREATED, ShipmentStatus.IN_WAREHOUSE),
    ).toBe(true);
    expect(
      isValidTransition(
        ShipmentStatus.IN_WAREHOUSE,
        ShipmentStatus.IN_TRANSIT,
      ),
    ).toBe(true);
    expect(
      isValidTransition(
        ShipmentStatus.IN_TRANSIT,
        ShipmentStatus.OUT_FOR_DELIVERY,
      ),
    ).toBe(true);
    expect(
      isValidTransition(
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.DELIVERED,
      ),
    ).toBe(true);
  });

  it('allows RETURNED only from OUT_FOR_DELIVERY', () => {
    expect(
      isValidTransition(
        ShipmentStatus.OUT_FOR_DELIVERY,
        ShipmentStatus.RETURNED,
      ),
    ).toBe(true);
    expect(
      isValidTransition(ShipmentStatus.IN_TRANSIT, ShipmentStatus.RETURNED),
    ).toBe(false);
  });

  it('rejects invalid jumps such as CREATED to IN_TRANSIT', () => {
    expect(
      isValidTransition(ShipmentStatus.CREATED, ShipmentStatus.IN_TRANSIT),
    ).toBe(false);
  });

  it('treats terminal statuses as having no transitions', () => {
    for (const status of [
      ShipmentStatus.DELIVERED,
      ShipmentStatus.RETURNED,
      ShipmentStatus.CANCELED,
    ]) {
      expect(getAllowedTransitions(status)).toEqual([]);
      expect(isTerminalStatus(status)).toBe(true);
    }
  });

  it('allows active statuses to be cancelled', () => {
    for (const status of [
      ShipmentStatus.CREATED,
      ShipmentStatus.IN_WAREHOUSE,
      ShipmentStatus.IN_TRANSIT,
      ShipmentStatus.OUT_FOR_DELIVERY,
    ]) {
      expect(canCancelShipment(status)).toBe(true);
    }

    for (const status of [
      ShipmentStatus.DELIVERED,
      ShipmentStatus.RETURNED,
      ShipmentStatus.CANCELED,
    ]) {
      expect(canCancelShipment(status)).toBe(false);
    }
  });
});
