# Estrategia de pruebas

## Backend

Tests unitarios de lógica de negocio en `apps/backend/src/**`:

| Área | Archivo | Qué cubre |
|------|---------|-----------|
| Máquina de estados | `shipments/domain/shipment-status-transitions.spec.ts` | Transiciones válidas/inválidas, estados terminales, cancelación |
| ShipmentsService | `shipments/application/shipments.service.spec.ts` | Transiciones inválidas (409), `deliveredAt`, cancelación, not found |
| FFD | `shipments/domain/first-fit-decreasing.spec.ts` | Caso obligatorio 60+40 / 50+30+20, pesos decimales, capacidad 0.3 |
| Tracking | `tracking/tracking.service.spec.ts` | Código inválido, not found, respuesta pública sin datos sensibles |
| Tracking code | `shipments/domain/tracking-code.generator.spec.ts` | Generación y validación de formato |

### Comandos

```bash
pnpm test:backend
pnpm lint:backend
pnpm build:backend
```

## Frontend

- Verificación manual de flujos principales.
- Tests de componentes solo en piezas críticas si hay tiempo.

## Criterio

Cubrir reglas de negocio relevantes. No se persigue cobertura total.
