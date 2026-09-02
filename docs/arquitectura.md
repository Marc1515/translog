# Arquitectura

## Visión general

```text
[Angular SPA]  --HTTP/REST-->  [NestJS API]  --Prisma-->  [PostgreSQL]
```

- **Frontend** (`apps/frontend`): SPA Angular 22 con componentes standalone, estructura por features (`auth`, `shipments`, `tracking`), lazy loading en rutas (`loadChildren` / `loadComponent`), layout compartido (`core/layout`) y Angular Material. `HttpClient` con interceptor JWT; `AuthService` (signals) persiste sesión en `localStorage`; `authGuard` y `supervisorGuard` protegen rutas en el cliente (la autorización real sigue en NestJS).
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

**Frontend (Fase 10–11):**

```text
src/app/
├── core/           # config (apiUrl), layout (AppShell)
├── features/
│   ├── auth/       # login, register, AuthService, guards, interceptor
│   ├── shipments/  # /shipments/** (con AppShell, authGuard)
│   └── tracking/   # /tracking (layout público propio)
├── app.routes.ts   # loadChildren por feature
└── app.config.ts   # Router, HttpClient + interceptor, Material theme
```

Rutas principales con lazy loading. Autenticación frontend (Fase 11): JWT en `localStorage`, interceptor `Authorization: Bearer`, guards de navegación; el backend mantiene la autoridad real con JWT Guard y RolesGuard.
