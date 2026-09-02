FROM node:22-alpine

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@11.1.2 --activate

COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY apps/backend/package.json apps/backend/
COPY apps/frontend/package.json apps/frontend/

RUN pnpm install --frozen-lockfile

COPY apps/backend apps/backend

RUN DATABASE_URL="postgresql://build:build@localhost:5432/translog?schema=public" pnpm build:backend

WORKDIR /app/apps/backend

EXPOSE 3000

CMD ["sh", "-c", "pnpm exec prisma migrate deploy && pnpm prisma:seed && pnpm start:prod"]
