FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

# Production stage - use Vite preview
FROM node:22-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies (Vite is needed for preview)
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

EXPOSE 5173

# Use Vite preview server
CMD ["npx", "vite", "preview", "--host", "0.0.0.0", "--port", "5173"]