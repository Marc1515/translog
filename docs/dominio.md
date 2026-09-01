# Dominio

## Entidades

### User

- id, email, passwordHash, role, createdAt, updatedAt

### Shipment

- id, trackingCode, originAddress, destinationAddress, recipientName
- contactPhone (opcional), weight, status, deliveredAt (opcional)
- createdById, createdAt, updatedAt

### ShipmentEvent

- id, shipmentId, status, userId, location, notes, createdAt

## Roles

- **OPERATOR:** operaciones de envíos.
- **SUPERVISOR:** puede registrar usuarios y realizar operaciones de OPERATOR.

## Estados de envío

`CREATED` → `IN_WAREHOUSE` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED` | `RETURNED`

Estados activos pueden cancelarse → `CANCELED`.

**Terminales:** `DELIVERED`, `RETURNED`, `CANCELED`.

## Reglas

- Al crear un Shipment se genera un `ShipmentEvent` inicial con estado `CREATED`.
- `DELETE /shipments/:id` es cancelación lógica (conserva historial).
- `deliveredAt` se establece al pasar a `DELIVERED`.
