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

## Comandos

```bash
pnpm install
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:4200
pnpm build          # compila backend y frontend
```

## Documentación

La documentación del sistema está centralizada en [`docs/`](docs/).

**Estado actual:** Fase 2 completada (monorepo y documentación base). La base de datos se configurará en la Fase 3.
