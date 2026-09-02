export type FfdShipmentInput = {
  shipmentId: string;
  trackingCode: string;
  weight: number;
};

export type FfdVehicleAssignment = {
  vehicleNumber: number;
  shipments: FfdShipmentInput[];
  totalWeight: number;
  remainingCapacity: number;
};

export type FfdAssignmentResult = {
  vehicles: FfdVehicleAssignment[];
  totalVehicles: number;
  totalShipments: number;
};

function roundToTwoDecimals(value: number): number {
  return Math.round(value * 100) / 100;
}

/**
 * First Fit Decreasing (FFD) bin packing heuristic.
 *
 * Sorts shipments by weight descending, then assigns each to the first
 * vehicle with enough remaining capacity, opening a new vehicle if needed.
 *
 * Complexity: O(n log n) sort + O(n²) first-fit placement in worst case.
 * Does not guarantee an optimal number of vehicles.
 */
export function firstFitDecreasing(
  shipments: FfdShipmentInput[],
  vehicleCapacity: number,
): FfdAssignmentResult {
  const sorted = [...shipments].sort((a, b) => b.weight - a.weight);

  type InternalVehicle = {
    vehicleNumber: number;
    shipments: FfdShipmentInput[];
    usedCapacity: number;
  };

  const vehicles: InternalVehicle[] = [];

  for (const shipment of sorted) {
    let placed = false;

    for (const vehicle of vehicles) {
      if (vehicle.usedCapacity + shipment.weight <= vehicleCapacity) {
        vehicle.shipments.push(shipment);
        vehicle.usedCapacity += shipment.weight;
        placed = true;
        break;
      }
    }

    if (!placed) {
      vehicles.push({
        vehicleNumber: vehicles.length + 1,
        shipments: [shipment],
        usedCapacity: shipment.weight,
      });
    }
  }

  return {
    vehicles: vehicles.map((vehicle) => ({
      vehicleNumber: vehicle.vehicleNumber,
      shipments: vehicle.shipments,
      totalWeight: roundToTwoDecimals(vehicle.usedCapacity),
      remainingCapacity: roundToTwoDecimals(
        vehicleCapacity - vehicle.usedCapacity,
      ),
    })),
    totalVehicles: vehicles.length,
    totalShipments: shipments.length,
  };
}
