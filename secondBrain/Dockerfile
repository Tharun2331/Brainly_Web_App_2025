# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production && cp -R node_modules /prod_modules
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Run
FROM node:20-alpine
RUN addgroup app && adduser -S -G app app
WORKDIR /app
COPY --from=builder /prod_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./
ENV NODE_ENV=production
RUN chown -R app:app /app
USER app
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s CMD wget -qO- http://localhost:3000/api/v1/health || exit 1
CMD ["node", "dist/index.js"]
