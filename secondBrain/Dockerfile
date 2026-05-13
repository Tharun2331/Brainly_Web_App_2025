FROM node:20-alpine

RUN addgroup app && adduser -S -G app app
WORKDIR /app

# Copy package files and install dependencies as root
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Build the application (generates the dist folder)
RUN npm run build

# Change ownership of everything to the app user
RUN chown -R app:app /app

# Switch to the non-root user for security
USER app

EXPOSE 3000

CMD ["npm", "start"]