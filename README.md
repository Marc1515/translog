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

## Comandos

```bash
pnpm install
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:4200
pnpm build          # compila backend y frontend
```

## Documentación

La documentación del sistema está centralizada en [`docs/`](docs/).

**Estado actual:** Fase 3 en curso (PostgreSQL + Prisma configurados; pendiente aplicar migración y seed con credenciales locales válidas).
