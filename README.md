# TransLog

Sistema de gestión logística de envíos. Prueba técnica Fullstack Junior/Mid.

## Stack

- NestJS, TypeScript
- Angular 22 (cumple requisito Angular 17+), Angular Material
- PostgreSQL, Prisma
- pnpm

## Funcionalidades

- Autenticación JWT con roles (`OPERATOR`, `SUPERVISOR`)
- Gestión de envíos con máquina de estados y timeline de eventos
- Tracking público por código de seguimiento
- Asignación de vehículos con heurística First Fit Decreasing (FFD)
- Interfaz web para operaciones y propuesta FFD

## Inicio rápido con Docker

Requisito: Docker y Docker Compose.

```bash
docker compose up --build
```

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:4200 |
| API | http://localhost:3000 |
| Swagger | http://localhost:3000/docs |

Credenciales supervisor demo (defaults Docker): `supervisor@translog.local` / `Supervisor123!`

En una base de datos Docker limpia, el seed crea un supervisor demo y **6 envíos demo** en distintos estados (incluye dos en `IN_WAREHOUSE` de 60 kg y 40 kg).

Parar servicios:

```bash
docker compose down
docker compose down -v   # elimina también la base de datos del volumen
```

Las variables `POSTGRES_PASSWORD`, `JWT_SECRET`, `SUPERVISOR_EMAIL` y `SUPERVISOR_PASSWORD` pueden sobrescribirse en el entorno antes de `docker compose up`.

## Prueba rápida del FFD

1. Inicia sesión como supervisor.
2. Ve a **Asignar vehículos** (`/shipments/assign-vehicles`).
3. Selecciona los envíos demo de 60 kg y 40 kg.
4. Indica capacidad **100** kg.
5. La propuesta debe agruparlos en un solo vehículo.

## Desarrollo local

1. Copia `apps/backend/.env.example` a `apps/backend/.env` y ajusta los valores.
2. Asegúrate de tener PostgreSQL en ejecución.
3. Instala dependencias y prepara la base de datos:

```bash
pnpm install
pnpm db:migrate
pnpm db:seed
```

4. Arranca los servicios:

```bash
pnpm dev:backend    # http://localhost:3000
pnpm dev:frontend   # http://localhost:4200
```

Variables adicionales en `.env`: `JWT_SECRET`, `JWT_EXPIRES_IN`, `CORS_ORIGIN` (ver `.env.example`).

## Tests y calidad

```bash
pnpm lint:backend
pnpm test:backend
pnpm --filter frontend test
pnpm build
```

## API / Swagger

Documentación interactiva: [http://localhost:3000/docs](http://localhost:3000/docs)

- Endpoints internos (`/auth/register`, `/shipments/**`): autenticación JWT Bearer (botón **Authorize**).
- `POST /auth/login` y `GET /tracking/:trackingCode`: públicos.

## First Fit Decreasing

El endpoint `POST /shipments/assign-vehicles` calcula una propuesta de distribución:

1. Ordena los envíos por peso descendente.
2. Coloca cada envío en el primer vehículo con capacidad suficiente.
3. Abre un vehículo nuevo si no cabe en ninguno.

Usa pesos reales de la base de datos y exige que todos los envíos estén en `IN_WAREHOUSE`. Es una heurística: no garantiza el número mínimo de vehículos. La asignación **no se persiste**.

## Decisiones técnicas

Monorepo con pnpm, arquitectura hexagonal ligera en el backend, componentes standalone en Angular, JWT en `localStorage`, seed idempotente. Detalle en [`docs/decisiones-tecnicas.md`](docs/decisiones-tecnicas.md).

## Documentación

Documentación del sistema en [`docs/`](docs/).
