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

## Arquitectura backend

Lightweight Hexagonal pragmática: separación de capas cuando aporta valor, sin sobreabstracción ni carpetas vacías anticipadas.

## Arquitectura frontend

Componentes standalone, lazy loading por features, servicios HTTP, Route Guard e HTTP Interceptor (se implementarán en fases correspondientes).

## Modelado

No se crean tablas `Vehicle`, `Warehouse` ni `Address`. El dominio se limita a `User`, `Shipment` y `ShipmentEvent`. Los vehículos del endpoint FFD son parámetros de entrada, no entidades persistidas.
