Checking the current README and docker-compose.yml to draft a Docker-focused README:


[3 tools called]


Docker-focused README:

```markdown
# SecondBrain Full Stack Application - Docker Version

A containerized full-stack application for managing and organizing your digital content using Docker.

## 🐳 Quick Start with Docker Images

This guide will help you run the application using pre-built Docker images from Docker Hub.

## Prerequisites

- **Docker Desktop** installed and running
  - Download: [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
- **Git** (optional, if cloning repository)

## 🚀 Quick Start (Using Pre-built Images)

### Step 1: Pull Docker Images

Pull the latest images from Docker Hub:

```bash
docker pull tharun2313/secondbrain-backend:latest
docker pull tharun2313/secondbrain-frontend:latest
```

Or use docker-compose to pull automatically (see Step 2).

### Step 2: Create docker-compose.yml

Create a file named `docker-compose.yml` in a new directory:

```yaml
services:
  backend:
    image: tharun2313/secondbrain-backend:latest
    container_name: secondbrain-backend
    restart: unless-stopped
    ports: 
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - PORT=3000
      - MONGODBURI=${MONGODBURI}
      - FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}
      - USER_JWT_SECRET=${USER_JWT_SECRET}
      - OPENAI_API_KEY=${OPENAI_API_KEY}
      - PINECONE_API_KEY=${PINECONE_API_KEY}
    networks: 
      - secondbrain-network
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000/api/v1/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  frontend: 
    image: tharun2313/secondbrain-frontend:latest
    container_name: secondbrain-frontend
    restart: unless-stopped
    ports:
      - "5173:5173"
    environment:
      - VITE_BACKEND_URL=${VITE_BACKEND_URL:-http://localhost:3000}
      - VITE_FRONTEND_URL=${VITE_FRONTEND_URL:-http://localhost:5173}
    depends_on:
      - backend
    networks:
      - secondbrain-network

networks:
  secondbrain-network:
    driver: bridge
```

### Step 3: Create .env File

Create a `.env` file in the same directory as `docker-compose.yml`:

```env
# MongoDB Connection
# Option 1: Local MongoDB
MONGODBURI=mongodb://localhost:27017/secondbrain

# Option 2: MongoDB Atlas (Cloud)
# MONGODBURI=mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority

# Backend Environment Variables
USER_JWT_SECRET=your_jwt_secret_key_here_make_it_long_and_random
OPENAI_API_KEY=sk-your-openai-api-key-here
PINECONE_API_KEY=your-pinecone-api-key-here
FRONTEND_URL=http://localhost:5173

# Frontend Environment Variables
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
```

**Important:** Replace all placeholder values with your actual credentials.

### Step 4: Run the Application

```bash
# Pull latest images (if not already pulled)
docker-compose pull

# Start containers in detached mode
docker-compose up -d

# View logs
docker-compose logs -f
```

### Step 5: Access the Application

Once containers are running, access the application at:

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **Health Check:** http://localhost:3000/api/v1/health

## 📋 Alternative: Manual Docker Run

If you prefer not to use docker-compose, you can run containers individually:

### Run Backend:

```bash
docker run -d \
  --name secondbrain-backend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e MONGODBURI="your_mongodb_uri" \
  -e FRONTEND_URL="http://localhost:5173" \
  -e USER_JWT_SECRET="your_jwt_secret" \
  -e OPENAI_API_KEY="your_openai_key" \
  -e PINECONE_API_KEY="your_pinecone_key" \
  tharun2313/secondbrain-backend:latest
```

### Run Frontend:

```bash
docker run -d \
  --name secondbrain-frontend \
  -p 5173:5173 \
  -e VITE_BACKEND_URL="http://localhost:3000" \
  -e VITE_FRONTEND_URL="http://localhost:5173" \
  tharun2313/secondbrain-frontend:latest
```

## 🛠️ Useful Commands

### Container Management

```bash
# View running containers
docker-compose ps

# View logs
docker-compose logs -f
docker-compose logs backend
docker-compose logs frontend

# Stop containers
docker-compose stop

# Start containers
docker-compose start

# Restart containers
docker-compose restart

# Stop and remove containers
docker-compose down

# Stop and remove containers + volumes
docker-compose down -v
```

### Image Management

```bash
# List all images
docker images

# Remove unused images
docker image prune

# Pull latest images
docker-compose pull

# Check image details
docker inspect tharun2313/secondbrain-backend:latest
```

## 🔍 Troubleshooting

### Containers won't start

```bash
# Check logs for errors
docker-compose logs

# Verify .env file exists and has correct values
cat .env

# Check if ports are already in use
netstat -ano | findstr :3000
netstat -ano | findstr :5173
```

### Backend connection errors

- Verify `MONGODBURI` is correct in `.env`
- Check MongoDB is accessible (if using local MongoDB)
- Ensure all API keys are valid

### Frontend can't connect to backend

- Verify `VITE_BACKEND_URL` is set to `http://localhost:3000`
- Check backend container is running: `docker-compose ps`
- Check backend logs: `docker-compose logs backend`

### Port already in use

If ports 3000 or 5173 are already in use, modify `docker-compose.yml`:

```yaml
ports:
  - "3001:3000"  # Change host port to 3001
```

## 📦 Docker Images

- **Backend:** [tharun2313/secondbrain-backend](https://hub.docker.com/r/tharun2313/secondbrain-backend)
- **Frontend:** [tharun2313/secondbrain-frontend](https://hub.docker.com/r/tharun2313/secondbrain-frontend)

## 🔐 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `MONGODBURI` | MongoDB connection string | Yes |
| `USER_JWT_SECRET` | Secret key for JWT tokens | Yes |
| `OPENAI_API_KEY` | OpenAI API key | Yes |
| `PINECONE_API_KEY` | Pinecone API key | Yes |
| `FRONTEND_URL` | Frontend URL for CORS | Yes |
| `VITE_BACKEND_URL` | Backend API URL | Yes |
| `VITE_FRONTEND_URL` | Frontend URL | Yes |

## 📝 Notes

- Images are automatically pulled from Docker Hub if not present locally
- Containers restart automatically on system reboot (unless stopped)
- All data is stored in your MongoDB instance (no persistent volumes needed)
- Environment variables are loaded from `.env` file

## 🆘 Support

If you encounter any issues:

1. Check the logs: `docker-compose logs`
2. Verify all environment variables are set correctly
3. Ensure Docker Desktop is running
4. Check Docker Hub images are accessible

## 📄 License

[Your License Here]

---

**Happy Coding! 🚀**
```

This README covers:
- Quick start with Docker images
- Step-by-step setup
- Environment variable configuration
- Troubleshooting
- Useful commands
- Alternative methods

You can save this as `README-DOCKER.md` or replace the Docker section in your existing README.
