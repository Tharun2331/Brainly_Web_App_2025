#Build Stage
FROM node:22-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# install all the dependencies
RUN npm ci

# Copy typscript source code
COPY tsconfig.json ./
COPY src ./src

# Build the typescript to javascript
RUN npm run build

# Production Stage
FROM node:22-alpine AS production

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy built files from builder
COPY --from=builder /app/dist ./dist

COPY procfile ./

ENV NODE_ENV=production

# Expose port
EXPOSE 3000
# Health check (optional but good practice)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node -e "require('http').get('http://localhost:3000/api/v1/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Start the application
CMD [ "npm", "start"]