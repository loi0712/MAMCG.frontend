# syntax=docker/dockerfile:1

# ============================================
# Stage 1: Dependencies
# ============================================
FROM node:20-alpine AS deps

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --production=false

# ============================================
# Stage 2: Builder
# ============================================
FROM node:20-alpine AS builder

WORKDIR /app

# Biến VITE_* được nhúng vào bundle lúc build (không đọc lúc chạy container)
ARG VITE_API_URL
ARG VITE_DOMAIN_URL

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DOMAIN_URL=${VITE_DOMAIN_URL}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build

# ============================================
# Stage 3: Production (nginx, không chạy bằng root)
# ============================================
FROM nginxinc/nginx-unprivileged:1.27-alpine AS production

COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://127.0.0.1:8080/healthz || exit 1
