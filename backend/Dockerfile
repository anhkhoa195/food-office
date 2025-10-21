FROM node:22-alpine AS builder

WORKDIR /app

# Install required libraries for Prisma
RUN apk add --no-cache openssl-dev && \
    apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/v3.16/main openssl1.1-compat || \
    apk add --no-cache openssl

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install all dependencies first (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# Copy source code
COPY . .

# Generate Prisma client with relaxed SSL verification
ENV NODE_TLS_REJECT_UNAUTHORIZED=0
RUN npx prisma generate
ENV NODE_TLS_REJECT_UNAUTHORIZED=1

# Build the application
RUN npm run build

# Production stage
FROM node:22-alpine AS production

WORKDIR /app

# Install dumb-init and required libraries for Prisma
RUN apk add --no-cache dumb-init openssl-dev && \
    apk add --no-cache --repository=http://dl-cdn.alpinelinux.org/alpine/v3.16/main openssl1.1-compat || \
    apk add --no-cache openssl

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nestjs -u 1001

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist
COPY --from=builder --chown=nestjs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma

# Copy startup script
COPY --chown=nestjs:nodejs start.sh ./start.sh
RUN chmod +x start.sh

# Create uploads directory
RUN mkdir -p uploads && chown nestjs:nodejs uploads

# Switch to non-root user
USER nestjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node dist/health-check.js

# Start the application
ENTRYPOINT ["dumb-init", "--"]
CMD ["./start.sh"]
