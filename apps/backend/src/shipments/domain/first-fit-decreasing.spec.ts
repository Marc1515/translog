import { describe, expect, it } from 'vitest';
import {
  firstFitDecreasing,
  type FfdShipmentInput,
} from './first-fit-decreasing.js';

function makeShipment(
  id: string,
  weight: number,
  trackingCode = `ENV-20260902-${id}`,
): FfdShipmentInput {
  return { shipmentId: id, trackingCode, weight };
}

describe('firstFitDecreasing', () => {
  it('assigns 5 shipments into 2 vehicles using FFD (60,50,40,30,20 @ capacity 100)', () => {
    const input = [
      makeShipment('s1', 60),
      makeShipment('s2', 50),
      makeShipment('s3', 40),
      makeShipment('s4', 30),
      makeShipment('s5', 20),
    ];

    const result = firstFitDecreasing(input, 100);

    expect(result.totalVehicles).toBe(2);
    expect(result.totalShipments).toBe(5);

    const vehicle1 = result.vehicles.find((v) => v.vehicleNumber === 1)!;
    const vehicle2 = result.vehicles.find((v) => v.vehicleNumber === 2)!;

    expect(vehicle1.shipments.map((s) => s.shipmentId).sort()).toEqual(
      ['s1', 's3'].sort(),
    );
    expect(vehicle1.totalWeight).toBe(100);
    expect(vehicle1.remainingCapacity).toBe(0);

    expect(vehicle2.shipments.map((s) => s.shipmentId).sort()).toEqual(
      ['s2', 's4', 's5'].sort(),
    );
    expect(vehicle2.totalWeight).toBe(100);
    expect(vehicle2.remainingCapacity).toBe(0);
  });

  it('assigns a single shipment to one vehicle', () => {
    const input = [makeShipment('only', 25)];

    const result = firstFitDecreasing(input, 100);

    expect(result.totalVehicles).toBe(1);
    expect(result.totalShipments).toBe(1);
    expect(result.vehicles[0].vehicleNumber).toBe(1);
    expect(result.vehicles[0].totalWeight).toBe(25);
    expect(result.vehicles[0].remainingCapacity).toBe(75);
  });

  it('handles decimal weights without floating-point drift', () => {
    const input = [makeShipment('decimal', 33.33)];

    const result = firstFitDecreasing(input, 100);

    expect(result.totalVehicles).toBe(1);
    expect(result.vehicles[0].totalWeight).toBe(33.33);
    expect(result.vehicles[0].remainingCapacity).toBe(66.67);
  });

  it('does not mutate the input array', () => {
    const input = [
      makeShipment('x', 30),
      makeShipment('y', 60),
      makeShipment('z', 20),
    ];
    const snapshot = input.map((s) => ({ ...s }));

    firstFitDecreasing(input, 100);

    expect(input).toEqual(snapshot);
  });
});
