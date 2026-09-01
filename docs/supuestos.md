# Supuestos

Decisiones tomadas para resolver ambigüedades o huecos del enunciado:

1. **RETURNED** representa un intento de entrega fallido, se alcanza desde `OUT_FOR_DELIVERY` y es terminal.
2. **SUPERVISOR** puede realizar también las operaciones disponibles para OPERATOR.
3. El primer **SUPERVISOR** se creará mediante seed para permitir el bootstrap del sistema.
4. Al crear un **Shipment** se registrará un **ShipmentEvent** inicial con estado `CREATED`.
5. **DELETE /shipments/:id** realizará una cancelación lógica y conservará el historial.
