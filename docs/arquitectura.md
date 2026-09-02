# Arquitectura

## Visión general

```text
[Angular SPA]  --HTTP/REST-->  [NestJS API]  --Prisma-->  [PostgreSQL]
```

- **Frontend** (`apps/frontend`): SPA Angular 22 con componentes standalone, estructura por features (`auth`, `shipments`, `tracking`), lazy loading en rutas (`loadChildren` / `loadComponent`), layout compartido (`core/layout`) y Angular Material. `HttpClient` configurado; servicios HTTP e interceptores en fases posteriores.
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

**Frontend (Fase 10):**

```text
src/app/
├── core/           # config (apiUrl), layout (AppShell)
├── features/
│   ├── auth/       # /auth/login (sin shell)
│   ├── shipments/  # /shipments/** (con AppShell)
│   └── tracking/   # /tracking (layout público propio)
├── app.routes.ts   # loadChildren por feature
└── app.config.ts   # Router, HttpClient, Material theme
```

Rutas principales con lazy loading; placeholders mínimos hasta Fases 11–14.
