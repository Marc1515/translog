# Translog

Sistema de gestión logística de envíos. Prueba técnica Fullstack Junior/Mid.

## Stack

- **Backend:** NestJS, TypeScript
- **Frontend:** Angular 17+ (standalone), Angular Material
- **Base de datos (Fase 3):** PostgreSQL, Prisma

## Estructura

```text
translog/
├── apps/backend/    # API REST NestJS
├── apps/frontend/ # SPA Angular
└── docs/          # Documentación del proyecto
```

## Requisitos

- Node.js LTS
- pnpm
- PostgreSQL (Fase 3)

## Base de datos (Fase 3)

1. Copia `apps/backend/.env.example` a `apps/backend/.env` y ajusta los valores.
2. Asegúrate de tener PostgreSQL en ejecución y accesible con la `DATABASE_URL` configurada.
3. Ejecuta las migraciones: `pnpm db:migrate`
4. Ejecuta el seed del supervisor: `pnpm db:seed`

Comandos útiles adicionales: `pnpm db:generate`, `pnpm db:studio`.

## Autenticación (Fase 4)

Variables adicionales en `apps/backend/.env`: `JWT_SECRET`, `JWT_EXPIRES_IN` (ver `.env.example`).

Endpoints:

- `POST /auth/login` — público
- `POST /auth/register` — requiere JWT con rol `SUPERVISOR`

El supervisor inicial se crea con `pnpm db:seed`.

## Envíos (Fases 5–6)

Todos los endpoints requieren JWT (`Authorization: Bearer <token>`).

- `POST /shipments` — crear envío (genera `trackingCode`, estado inicial `CREATED`)
- `GET /shipments` — listado paginado (`page`, `limit`, filtro opcional `status`)
- `GET /shipments/:id` — detalle con historial de eventos
- `PATCH /shipments/:id/status` — cambiar estado (transiciones validadas, crea `ShipmentEvent`)
- `DELETE /shipments/:id` — cancelación lógica (`CANCELED`, conserva historial)
- `POST /shipments/assign-vehicles` — propuesta de asignación FFD (sin persistencia)

## Tracking público (Fase 7)

Endpoint público (sin JWT):

- `GET /tracking/:trackingCode` — consulta de envío por código de seguimiento con historial de eventos

## Asignación de vehículos (Fase 8)

Endpoint autenticado:

- `POST /shipments/assign-vehicles` — calcula una distribución First Fit Decreasing a partir de envíos en `IN_WAREHOUSE`. Los vehículos no se persisten.

## Backend (Fase 9)

Arrancar la API:

```bash
pnpm dev:backend    # http://localhost:3000
```

Documentación interactiva Swagger: [http://localhost:3000/docs](http://localhost:3000/docs)

- Endpoints internos (`/auth/register`, `/shipments/**`): autenticación JWT Bearer (botón **Authorize** en Swagger).
- `POST /auth/login` y `GET /tracking/:trackingCode`: públicos.

## Comandos

```bash
pnpm install
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:4200
pnpm build          # compila backend y frontend
pnpm build:backend
pnpm test:backend
pnpm lint:backend
```

## Documentación

La documentación del sistema está centralizada en [`docs/`](docs/).

**Estado actual:** Fase 11 completada (autenticación frontend). Siguiente fase: gestión de envíos frontend (Fase 12).

## Desarrollo local

- Frontend: `http://localhost:4200`
- Backend: `http://localhost:3000`
- CORS: configurable con `CORS_ORIGIN` en `apps/backend/.env` (por defecto `http://localhost:4200`)

## Frontend (Fase 10–11)

Arrancar la SPA:

```bash
pnpm dev:frontend   # http://localhost:4200
```

Rutas base: `/auth/login`, `/auth/register` (solo SUPERVISOR), `/shipments` (autenticado), `/tracking` (público). La URL de la API se configura en `apps/frontend/src/environments/environment.ts`.
