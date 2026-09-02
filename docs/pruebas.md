# Estrategia de pruebas

## Backend

Tests unitarios de lógica de negocio en `apps/backend/src/**`:

| Área | Archivo | Qué cubre |
|------|---------|-----------|
| Máquina de estados | `shipments/domain/shipment-status-transitions.spec.ts` | Transiciones válidas/inválidas, estados terminales, cancelación |
| ShipmentsService | `shipments/application/shipments.service.spec.ts` | Transiciones inválidas (409), `deliveredAt`, cancelación, not found |
| FFD | `shipments/domain/first-fit-decreasing.spec.ts` | Caso obligatorio 60+40 / 50+30+20, pesos decimales, capacidad 0.3 |
| Tracking | `tracking/tracking.service.spec.ts` | Código inválido, not found, respuesta pública sin datos sensibles |
| Tracking code | `shipments/domain/tracking-code.generator.spec.ts` | Generación y validación de formato |

### Comandos

```bash
pnpm test:backend
pnpm lint:backend
pnpm build:backend
```

## Frontend

- Verificación manual de flujos principales.
- Tests de componentes solo en piezas críticas si hay tiempo.

## Criterio

Cubrir reglas de negocio relevantes. No se persigue cobertura total.

## CI (GitHub Actions)

El workflow `.github/workflows/ci.yml` se ejecuta en `push` y `pull_request` y valida:

- instalación reproducible (`pnpm install --frozen-lockfile`);
- generación del cliente Prisma (`pnpm db:generate`);
- lint del backend (`pnpm lint:backend`);
- tests del backend (`pnpm test:backend`);
- tests del frontend (`pnpm --filter frontend test`);
- build completo (`pnpm build`).

No se levanta PostgreSQL en CI: los tests actuales son unitarios y `prisma generate` usa una `DATABASE_URL` dummy del job.

## Pruebas de integración

Flujos comprobados en Fase 15 (smoke test manual + API):

- **Autenticación:** login válido/incorrecto, persistencia de sesión tras refresh, logout, redirección sin sesión.
- **Roles:** SUPERVISOR ve enlace «Registrar usuario» y accede a `/auth/register`; OPERATOR no ve enlace y el guard redirige desde register.
- **Alta de usuario:** registro de operador, email duplicado (409 con mensaje descriptivo), supervisor mantiene sesión.
- **Create shipment:** validaciones, peso entre 0.01 y 99999999.99 kg (máx. 2 decimales), teléfono opcional, Bearer en POST, `trackingCode` y estado `CREATED`.
- **Listado:** columnas, paginación server-side (`page`/`limit`), filtro por status, reset a página 1 al cambiar filtro, empty state, error con backend caído.
- **Detalle:** datos del envío, timeline con `responsibleUser.email`, sin `passwordHash`.
- **Transiciones:** máquina de estados completa, location requerida (incl. solo espacios), reload tras PATCH.
- **Cancelación:** confirmación, DELETE lógico, evento `CANCELED`, sin acciones posteriores.
- **Tracking público:** sin Authorization, datos públicos, sin teléfono ni operadores; `deliveredAt` si entregado.
- **Privacidad:** sin `passwordHash`, `createdById`, `contactPhone` ni `responsibleUser` en respuesta pública.
- **Responsive:** revisión en 375px, 768px y desktop (overflow tabla, formularios).
- **Errores HTTP:** mensajes legibles desde `message` del backend (400, 401, 403, 404, 409, conexión caída).
- **Validación espacios:** tracking, email login/register, campos required de envío y location en transiciones (backend rechaza cadenas de solo espacios con 400).
- **Validación weight (cierre):** peso 0, negativo, >2 decimales, por debajo de 0.01 o por encima de 99999999.99 → 400 (sin 500 por overflow de `Decimal(10,2)`).
