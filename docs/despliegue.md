# Despliegue

## Actual (Fase 3)

Ejecución local:

- Backend: `pnpm dev:backend` → puerto 3000
- Frontend: `pnpm dev:frontend` → puerto 4200
- PostgreSQL: instalación local manual (servicio en ejecución)
- Variables: `apps/backend/.env` (ver `.env.example`)
- Migraciones: `pnpm db:migrate`
- Seed supervisor: `pnpm db:seed`

## Fase 16 (bonus)

Docker Compose para orquestar backend, frontend y PostgreSQL.

## Despliegue público

Opcional y posterior. No es requisito para la prueba técnica.
