# Multi-stage build for optimized production image
FROM node:18-alpine AS builder

# Install build dependencies
RUN apk add --no-cache python3 make g++

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/client/dist ./client/dist

# Copy other necessary files
COPY server ./server
COPY shared ./shared
COPY drizzle.config.ts ./
COPY tsconfig.json ./
COPY vite.config.ts ./

# Create .env file with defaults
RUN echo "PORT=\${PORT:-5000}" > .env && \
    echo "NODE_ENV=production" >> .env && \
    echo "SESSION_SECRET=change-this-in-production" >> .env

# Expose port (Digital Ocean will set this via PORT env var)
EXPOSE ${PORT:-5000}

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:' + (process.env.PORT || 5000) + '/api/health', (res) => process.exit(res.statusCode === 200 ? 0 : 1))"

# Start the application
CMD ["npm", "start"]