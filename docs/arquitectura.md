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

**Frontend (Fase 10–12):**

```text
src/app/
├── core/           # config (apiUrl), layout (AppShell)
├── features/
│   ├── auth/       # login, register, AuthService, guards, interceptor
│   ├── shipments/  # listado, creación, detalle con timeline y transiciones; ShipmentsService
│   └── tracking/   # /tracking (layout público propio)
├── app.routes.ts   # loadChildren por feature
└── app.config.ts   # Router, HttpClient + interceptor, Material theme
```

Rutas principales con lazy loading. Autenticación frontend (Fase 11): JWT en `localStorage`, interceptor `Authorization: Bearer`, guards de navegación; el backend mantiene la autoridad real con JWT Guard y RolesGuard.

**Shipments frontend (Fase 12):** `ShipmentsService` consume `GET /shipments` (paginación y filtro `status` server-side) y `POST /shipments`. Listado con `MatTable` + `MatPaginator`; formulario reactivo de creación en `/shipments/new`. Modelos y tipos en `features/shipments/models/` (sin imports Prisma).

**Detalle de envío frontend (Fase 13):** `/shipments/:id` consume `GET /shipments/:id` (incluye historial con `responsibleUser`), `PATCH /shipments/:id/status` (ubicación obligatoria, notas opcionales) y `DELETE /shipments/:id` (cancelación lógica). Timeline CSS con eventos ordenados; utilidad `shipment-transitions.util.ts` limita transiciones en UI (el backend valida la máquina de estados real). Estados terminales ocultan controles de transición/cancelación.

**Asignación de vehículos frontend (Fase 17):** `/shipments/assign-vehicles` consume `GET /shipments?status=IN_WAREHOUSE` para listar envíos disponibles y `POST /shipments/assign-vehicles` para obtener la propuesta FFD calculada en backend. No recalcula FFD ni persiste vehículos; muestra el resultado como propuesta de distribución.

**Tracking público frontend (Fase 14):** `/tracking` es una ruta pública sin `authGuard` ni AppShell obligatorio. `TrackingService` consume `GET /tracking/:trackingCode` sin JWT (el interceptor excluye `/tracking`). Modelos en `features/tracking/models/public-tracking.models.ts` reflejan únicamente el contrato público del backend (sin `id`, `contactPhone`, `responsibleUser` ni datos de usuario interno). La página muestra formulario de búsqueda, resumen del envío e historial/timeline público; reutiliza `SHIPMENT_STATUS_LABELS` de shipments.
