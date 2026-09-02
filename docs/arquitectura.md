# Arquitectura

## Visión general

```text
[Angular SPA]  --HTTP/REST-->  [NestJS API]  --Prisma-->  [PostgreSQL]
```

- **Frontend** (`apps/frontend`): SPA con componentes standalone, lazy loading por features (futuro) y servicios HTTP.
- **Backend** (`apps/backend`): API REST con arquitectura Lightweight Hexagonal pragmática. Módulos: `PrismaModule`, `AuthModule` (Fase 4), `ShipmentsModule` (Fase 5), `TrackingModule` (Fase 7).
- **Datos:** PostgreSQL con Prisma (Fase 3). Modelos: `User`, `Shipment`, `ShipmentEvent`. Acceso mediante `PrismaModule` / `PrismaService` en el backend.

## Principios

- Monorepo simple con pnpm workspaces.
- Separación frontend/backend sin microservicios.
- La documentación de sistema vive en `/docs`, no en READMEs de cada app.

## Estructura futura (referencia)

**Backend:** módulos por dominio (`auth`, `shipments`, `tracking`) con separación ligera presentation / application / domain / infrastructure cuando aporta claridad.

**TrackingModule:** endpoint público `GET /tracking/:trackingCode` sin autenticación. Reutiliza `ShipmentsRepository` para consultar por `trackingCode` con eventos ordenados; el service mapea una respuesta pública sin datos internos de usuario.

**ShipmentsModule:** `presentation` (controller + DTOs), `application` (service), `domain` (trackingCode, máquina de estados, FFD), `infrastructure` (repository Prisma).

**Asignación FFD (Fase 8):** `POST /shipments/assign-vehicles` valida envíos en `IN_WAREHOUSE` desde PostgreSQL, convierte pesos `Decimal` a `number` y delega en `first-fit-decreasing.ts` (dominio puro, sin NestJS/Prisma). El resultado es una propuesta calculada; no se persisten vehículos ni se modifica el estado de los envíos. Detalle del algoritmo en [`decisiones-tecnicas.md`](decisiones-tecnicas.md).

**Frontend:** carpetas por feature (`auth`, `shipments`, `tracking`) con lazy loading en rutas.
