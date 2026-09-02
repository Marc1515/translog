# Decisiones técnicas

## Monorepo simple

Un repositorio con `apps/backend` y `apps/frontend`. Sin Nx ni Turborepo.

## pnpm

- Gestión estricta de dependencias (evita phantom dependencies).
- Eficiencia de almacenamiento mediante store global.
- Velocidad en instalaciones.
- Soporte nativo de workspaces/monorepos.

## Stack

| Área | Tecnología |
|------|------------|
| Backend | NestJS, TypeScript, class-validator, JWT, Swagger |
| ORM | Prisma (Fase 3) |
| Frontend | Angular 17+ standalone, Angular Material, Reactive Forms |
| BD | PostgreSQL |

## Prisma (Fase 3)

- ORM: Prisma 7 con `prisma.config.ts`, driver adapter `@prisma/adapter-pg` y cliente generado en `apps/backend/src/generated/prisma`.
- Seed idempotente del primer `SUPERVISOR` mediante variables `SUPERVISOR_EMAIL` y `SUPERVISOR_PASSWORD`.
- Sin tablas adicionales (`Vehicle`, `Warehouse`, `Address`, `Role`, `Status`).

## Arquitectura backend

Lightweight Hexagonal pragmática: separación de capas cuando aporta valor, sin sobreabstracción ni carpetas vacías anticipadas.

## Arquitectura frontend

Componentes standalone, lazy loading por features, servicios HTTP, Route Guard e HTTP Interceptor (Fase 11).

## JWT en localStorage (Fase 11)

El token JWT se almacena en `localStorage` por simplicidad de la prueba técnica. En un entorno con requisitos de seguridad superiores podría preferirse otra estrategia (p. ej. cookies HttpOnly), pero queda fuera del alcance de este proyecto.

## Modelado

No se crean tablas `Vehicle`, `Warehouse` ni `Address`. El dominio se limita a `User`, `Shipment` y `ShipmentEvent`. Los vehículos del endpoint FFD son parámetros de entrada, no entidades persistidas.

## Asignación FFD (Fase 8)

**First Fit Decreasing** es una heurística de bin packing:

1. Ordenar envíos por peso descendente.
2. Para cada envío, colocarlo en el **primer** vehículo con capacidad suficiente.
3. Si no cabe en ninguno, abrir un vehículo nuevo.

No garantiza el número mínimo de vehículos (no es solución óptima). Complejidad aproximada: **O(n log n)** por la ordenación y **O(n²)** en el peor caso por la búsqueda first-fit.

La API devuelve una propuesta con `vehicleNumber` (1-based), pesos redondeados a 2 decimales y totales globales. No hay persistencia de vehículos ni cambio de estado en los envíos.
