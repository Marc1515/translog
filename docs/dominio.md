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

Flujo principal:

`CREATED` → `IN_WAREHOUSE` → `IN_TRANSIT` → `OUT_FOR_DELIVERY` → `DELIVERED`

Desde `OUT_FOR_DELIVERY` también puede pasar a `RETURNED` (intento de entrega fallido, terminal).

Estados activos (`CREATED`, `IN_WAREHOUSE`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`) pueden cancelarse mediante `DELETE /shipments/:id` → `CANCELED`.

**Terminales:** `DELIVERED`, `RETURNED`, `CANCELED` — no admiten más transiciones.

La lógica de transiciones está centralizada en `shipment-status-transitions.ts`. `PATCH /shipments/:id/status` gestiona el flujo logístico; `DELETE` gestiona la cancelación.

## Reglas

- Al crear un Shipment se genera automáticamente un `trackingCode` con formato `ENV-YYYYMMDD-XXXX`.
- Al crear un Shipment se genera un `ShipmentEvent` inicial con estado `CREATED` (transacción atómica).
- Cada cambio de estado vía `PATCH` crea un `ShipmentEvent` con usuario, ubicación y notas (transacción atómica).
- `DELETE /shipments/:id` es cancelación lógica: establece `CANCELED` y crea evento asociado (conserva historial).
- `deliveredAt` se establece automáticamente al pasar a `DELIVERED`.
- El detalle autenticado (`GET /shipments/:id`) expone el usuario responsable de cada evento (`responsibleUser`: id, email, role). El tracking público (`GET /tracking/:trackingCode`) no expone datos de usuarios ni `contactPhone`.
