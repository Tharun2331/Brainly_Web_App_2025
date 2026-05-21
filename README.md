# Brainly (Second Brain) Full Stack Application

Brainly is a powerful "Second Brain" application designed to help you save, organize, and search through various types of content (articles, tweets, YouTube videos, notes, and images). It leverages AI for semantic search and intelligent content processing.

## 🚀 Tech Stack

**Backend**
- Node.js & Express
- TypeScript
- MongoDB (Mongoose) for primary data storage
- Pinecone (Vector Database) for Semantic Search
- OpenAI API (Embeddings & AI Chat capabilities)
- Apify & Puppeteer (Web Scraping & Content Processing)

**Frontend**
- React 19
- Vite
- TypeScript
- Redux Toolkit (State Management)
- Tailwind CSS (Styling)
- React Router DOM

## ✨ Features

- **Content Organization:** Save notes, articles, tweets, YouTube videos, audio, and images.
- **Smart Processing:** Automatically extracts content and transcripts (e.g., fetching transcripts from YouTube videos or text from tweets).
- **Semantic Search:** Find your saved content using natural language queries powered by AI embeddings.
- **Chat Interface:** Chat with your second brain to recall information or ask questions based on your saved context.
- **Tagging System:** Organize content with custom tags for easy filtering.
- **Shareable Links:** Generate public links to share specific collections or your entire "brain" with others.

## 📋 Prerequisites

- Docker & Docker Compose (Recommended for local development)
- Node.js (v18+) if running manually
- MongoDB Database (Atlas or local)
- External API Keys: OpenAI, Pinecone, Apify, YouTube Data API

## 🛠️ Getting Started

### 1. Environment Variables

Create a `.env` file in the root directory of the project. You can use the `.env-example` as a template.

```env
# Database
MONGODBURI=mongodb+srv://<user>:<password>@cluster...

# Authentication
USER_JWT_SECRET=your_jwt_secret
RANDOM_STRING=your_random_string

# External APIs
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=brainly-content
PINECONE_ENVIRONMENT=your_environment
APIFY_API_TOKEN=your_apify_token
APIFY_WEBHOOK_SECRET=your_apify_webhook_secret
YOUTUBE_API_KEY=your_youtube_api_key

# Local Application Config
PORT=3000
VITE_BACKEND_URL=http://localhost:3000
VITE_FRONTEND_URL=http://localhost:5173
FRONTEND_URL=http://localhost:5173
```

### 2. Running with Docker (Recommended)

The project includes a `compose.yaml` optimized for local development using Docker Compose Watch. 

Run the following command from the root directory:

```bash
docker compose up --build
```

- The **Frontend** will be available at: `http://localhost:5173`
- The **Backend API** will be available at: `http://localhost:3000`

**Note:** With the Compose Watch configuration, any changes you make to your local frontend or backend source files will automatically sync to the running containers. Changes to `package.json` will trigger a rebuild.

### 3. Running Manually (Without Docker)

If you prefer to run the services directly on your host machine:

**Backend:**
```bash
cd secondBrain
npm install
npm run dev
```

**Frontend:**
```bash
cd secondBrainFrontend
npm install
npm run dev
```

## 📁 Project Structure

```text
.
├── compose.yaml          # Docker compose configuration
├── .env                  # Root environment variables
├── /secondBrain          # Backend Express API
│   ├── src/              # Backend source code (Controllers, Routes, Models, Services)
│   ├── Dockerfile        # Backend Docker configuration
│   └── package.json
└── /secondBrainFrontend  # Frontend React application
    ├── src/              # Frontend source code (Components, Pages, Redux store)
    ├── Dockerfile        # Frontend Docker configuration
    └── package.json
```
