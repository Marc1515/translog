# Arquitectura

## Visión general

```text
[Angular SPA]  --HTTP/REST-->  [NestJS API]  --Prisma-->  [PostgreSQL]
```

- **Frontend** (`apps/frontend`): SPA con componentes standalone, lazy loading por features (futuro) y servicios HTTP.
- **Backend** (`apps/backend`): API REST con arquitectura Lightweight Hexagonal pragmática. Módulos: `PrismaModule`, `AuthModule` (Fase 4), `ShipmentsModule` (Fase 5). Futuro: `tracking`.
- **Datos:** PostgreSQL con Prisma (Fase 3). Modelos: `User`, `Shipment`, `ShipmentEvent`. Acceso mediante `PrismaModule` / `PrismaService` en el backend.

## Principios

- Monorepo simple con pnpm workspaces.
- Separación frontend/backend sin microservicios.
- La documentación de sistema vive en `/docs`, no en READMEs de cada app.

## Estructura futura (referencia)

**Backend:** módulos por dominio (`auth`, `shipments`, futuro `tracking`) con separación ligera presentation / application / domain / infrastructure cuando aporta claridad.

**ShipmentsModule (Fase 5):** `presentation` (controller + DTOs), `application` (service), `domain` (generador de trackingCode), `infrastructure` (repository Prisma).

**Frontend:** carpetas por feature (`auth`, `shipments`, `tracking`) con lazy loading en rutas.
