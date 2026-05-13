FROM node:20-alpine

RUN addgroup app && adduser -S -G app app
WORKDIR /app

# Copy package files and install dependencies as root
COPY package*.json ./
RUN npm install

# Copy the rest of the application
COPY . .

# Change ownership of everything to the app user
RUN chown -R app:app /app

# Switch to the non-root user
USER app

EXPOSE 5173

CMD ["npm", "run", "dev"]