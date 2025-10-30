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

ARG VITE_API_URL
ARG VITE_DOMAIN_URL
ARG NODE_ENV=production

ENV VITE_API_URL=${VITE_API_URL}
ENV VITE_DOMAIN_URL=${VITE_DOMAIN_URL}
ENV NODE_ENV=${NODE_ENV}

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN yarn build && ls -la /app/dist

# ============================================
# Stage 3: Production (serve)
# ============================================
FROM node:20-alpine AS production

WORKDIR /app

# Install serve globally
RUN npm install -g serve

# Copy built files only
COPY --from=builder /app/dist ./dist

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:3000 || exit 1

# Start serve
CMD ["serve", "-s", "dist", "-l", "3000"]
