# ============ 1. Build stage ============
FROM node:18-alpine AS builder

# Create working directory
WORKDIR /app

# Copy only package files first for better layer caching
COPY package*.json ./

# Install all dependencies (including devDependencies for TypeScript, Jest, etc.)
RUN npm ci

# Copy the rest of the source code
COPY . .

# Build TypeScript -> JavaScript in dist/
# This uses your "build": "npx tsc" script from package.json
RUN npm run build



# ============ 2. Runtime stage ============
FROM node:18-alpine

WORKDIR /app

# Copy package files again
COPY package*.json ./

# Install only production dependencies to keep image small
# (Node 18+ supports --omit=dev. If it ever complains, switch back to --only=production)
RUN npm ci --omit=dev

# Copy compiled app from build stage
COPY --from=builder /app/dist ./dist

# Expose the port your app listens on (inside the container)
EXPOSE 3000

# Always run in production mode in the container
ENV NODE_ENV=production

# Start the compiled application
CMD ["node", "dist/index.js"]
