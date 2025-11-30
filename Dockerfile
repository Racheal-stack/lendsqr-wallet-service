# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
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
RUN npm ci --only=production

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Copy database migration files from source
COPY --from=builder /app/src/database/migrations ./dist/database/migrations
COPY --from=builder /app/src/database/seeds ./dist/database/seeds

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Expose port (default 3000, can be overridden by PORT env var)
EXPOSE 3000
EXPOSE 10000

# Set environment to production
ENV NODE_ENV=production

# Start the application using entrypoint script
ENTRYPOINT ["./docker-entrypoint.sh"]
