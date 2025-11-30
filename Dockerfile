# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# Run stage
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY --from=builder /app/dist ./dist

# Expose app port
EXPOSE 3000

ENV NODE_ENV=production

# 👇 no entrypoint script for now, just start the app
CMD ["node", "dist/index.js"]
