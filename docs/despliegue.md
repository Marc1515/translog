# Despliegue

## Actual (Fase 3)

Ejecución local:

- Backend: `pnpm dev:backend` → puerto 3000
- Frontend: `pnpm dev:frontend` → puerto 4200
- PostgreSQL: instalación local manual (servicio en ejecución)
- Variables: `apps/backend/.env` (ver `.env.example`)
- Migraciones: `pnpm db:migrate`
- Seed supervisor: `pnpm db:seed`

## Fase 16 — Docker Compose

Orquestación reproducible de PostgreSQL, backend NestJS y frontend Angular (Nginx).

### Arquitectura

```text
┌─────────────┐     ┌─────────────┐     ┌──────────────┐
│  Navegador  │────▶│  frontend   │     │   postgres   │
│ localhost   │     │  :4200→80   │     │  (interno)   │
└──────┬──────┘     └─────────────┘     └──────▲───────┘
       │                                        │
       │         ┌─────────────┐                │
       └────────▶│   backend   │────────────────┘
                 │  :3000      │
                 └─────────────┘
```

- **postgres:** imagen `postgres:16-alpine`. No expone el puerto 5432 al host (evita conflicto con PostgreSQL local). Volumen persistente `postgres_data`.
- **backend:** NestJS en producción. Se conecta a `postgres:5432` mediante `DATABASE_URL`. Publica `3000:3000`.
- **frontend:** build estático de Angular servido por Nginx. Publica `4200:80`. El navegador llama a la API en `http://localhost:3000` (no hay proxy inverso complejo).

### Arranque

```bash
docker compose up --build
```

Al iniciar, el backend:

1. Espera a que PostgreSQL esté healthy (`pg_isready`).
2. Ejecuta `prisma migrate deploy`.
3. Ejecuta el seed idempotente del supervisor.
4. Arranca NestJS (`start:prod`).

### Parada y reset

```bash
docker compose down          # para servicios, conserva datos
docker compose down -v       # elimina volumen postgres_data (DB limpia)
```

### Variables (defaults solo desarrollo)

| Variable | Default Docker |
|----------|----------------|
| `POSTGRES_PASSWORD` | `translog_local_password` |
| `JWT_SECRET` | `translog-local-docker-secret` |
| `SUPERVISOR_EMAIL` | `supervisor@translog.local` |
| `SUPERVISOR_PASSWORD` | `Supervisor123!` |

Sobrescribibles en el entorno del host antes de `docker compose up`.

### URLs

- Frontend: http://localhost:4200
- API: http://localhost:3000
- Swagger: http://localhost:3000/docs

Nginx incluye fallback SPA (`try_files … /index.html`) para rutas como `/tracking`, `/auth/login` y `/shipments`.

## Despliegue público

Opcional y posterior. No es requisito para la prueba técnica.
