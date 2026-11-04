# ==========================================================
# ETAPA 1: Builder (Compilación y generación de artefactos)
# ==========================================================
FROM node:24-alpine AS builder

# Dependencias nativas (bcrypt) + pnpm
RUN apk add --no-cache libc6-compat python3 make g++ \
  && npm i -g pnpm@11.22.0

WORKDIR /app

# Copiar manifiestos de dependencias y config de Prisma 7
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
COPY prisma.config.ts ./
COPY prisma ./prisma/
COPY tsconfig.json tsconfig.build.json ./

# Instalar TODAS las dependencias (necesarias para build)
RUN pnpm install --frozen-lockfile

# Copiar el código fuente
COPY . .

# Generar el cliente de Prisma (URL dummy solo para cargar la config)
RUN DATABASE_URL="postgresql://postgres:postgres@localhost:5432/fintech_core" \
  pnpm exec prisma generate

# Compilar TypeScript a JavaScript (/dist)
RUN pnpm build

# Dejar solo dependencias de producción para copiar al runner
RUN pnpm prune --prod

# ==========================================================
# ETAPA 2: Runner (Entorno de Ejecución Mínimo en Producción)
# ==========================================================
FROM node:24-alpine AS runner

RUN apk add --no-cache libc6-compat \
  && npm i -g pnpm@11.22.0

WORKDIR /app

ENV NODE_ENV=production

# Reutilizar artefactos del builder (evita un segundo pnpm install)
COPY --from=builder /app/package.json /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/.npmrc ./
COPY --from=builder /app/prisma.config.ts ./
COPY --from=builder /app/prisma ./prisma/
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

EXPOSE 3000

# 1. Aplica migraciones pendientes
# 2. Arranca el servidor compilado
CMD ["sh", "-c", "pnpm dlx prisma@7.10.0 migrate deploy && node dist/server.js"]
