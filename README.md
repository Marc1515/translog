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

## Envíos (Fase 5)

Todos los endpoints requieren JWT (`Authorization: Bearer <token>`).

- `POST /shipments` — crear envío (genera `trackingCode`, estado inicial `CREATED`)
- `GET /shipments` — listado paginado (`page`, `limit`, filtro opcional `status`)
- `GET /shipments/:id` — detalle con historial de eventos

## Comandos

```bash
pnpm install
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:4200
pnpm build          # compila backend y frontend
```

## Documentación

La documentación del sistema está centralizada en [`docs/`](docs/).

**Estado actual:** Fase 5 completada (núcleo de envíos). Siguiente fase: reglas de dominio de envíos (Fase 6).
