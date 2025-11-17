# Bug Tracking System

A comprehensive bug tracking application with AI-powered analysis capabilities.

## 🚀 Quick Start

### Backend (Spring Boot)
```bash
cd backend
./gradlew bootRun
```
Runs on: `http://localhost:8080`

### Frontend (React)
```bash
cd bug-tracker-frontend
npm install
npm run dev
```
Runs on: `http://localhost:5173`

### AI Service (Python FastAPI)
```bash
cd ai-service
pip install -r requirements.txt
python main.py
```
Runs on: `http://localhost:5001`

## 📚 Documentation

Each service has its own comprehensive README:

- **[Backend Documentation](./backend/README.md)** - Setup, configuration, and API reference for Spring Boot service
- **[Frontend Documentation](./bug-tracker-frontend/README.md)** - Complete guide for React frontend
- **[AI Service Documentation](./ai-service/README.md)** - Complete guide for Python AI service with RAG implementation

## 🏗️ Architecture

- **Backend:** Spring Boot + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS
- **AI Service:** FastAPI + OpenAI

## 📖 Component Overview

### AI (FastAPI + OpenAI + RAG)
The AI microservice uses Retrieval-Augmented Generation (RAG) to provide context-aware bug analysis. It retrieves similar past bugs from a vector store (ChromaDB) and uses that context to generate intelligent suggestions. The service analyzes bug titles and descriptions to suggest possible causes and resolutions, predicts priority levels (LOW, MEDIUM, HIGH), and stores resolved bugs back into the vector store for future reference. The AI runs as a separate FastAPI service with persistent vector storage and communicates with the frontend via REST API. All responses are structured JSON for easy integration.

### Frontend (React + Vite)
The React frontend allows users to create, update, and view bugs with a clean, styled interface. It features a dashboard with summary statistics and bug listing with table and card view modes. Users can search and filter bugs, trigger AI suggestions directly from the bug view page, and assign tasks to employees. It communicates with both the Spring Boot backend (for CRUD) and the FastAPI AI service (for insights). All API calls use Axios, and Tailwind plus external CSS ensure responsive design. Built with Vite for fast development and optimized builds.

### Backend (Spring Boot + PostgreSQL)
The backend is a RESTful API server that manages all CRUD operations for bugs and employees. It stores and retrieves bug data from PostgreSQL using Spring Data JPA for database operations. It exposes REST APIs with Swagger documentation for easy testing and integration. It also handles automatic bug assignment to available employees and ensures data consistency.

## ✨ Features

- Bug CRUD operations with resolution tracking
- Employee management and assignment
- AI-powered bug analysis with RAG (Retrieval-Augmented Generation)
- Vector store for learning from past bugs
- Dashboard with statistics
- Table and Card view modes
- Search and filtering
- Responsive design

## 📁 Project Structure

```
Bug-Tracking/
├── backend/              # Spring Boot backend
├── bug-tracker-frontend/ # React frontend
├── ai-service/          # FastAPI AI service with RAG
├── k8s/                 # Kubernetes deployment manifests
├── Terraform/           # Infrastructure as Code
└── *.md                 # Documentation files
```

## 🐳 Docker Deployment

All services can be run using Docker:

```bash
# Build images
docker build -t bug-tracking-backend:v7 -f backend/Dockerfile .
docker build -t bug-tracking-frontend:v7 -f bug-tracker-frontend/Dockerfile .
docker build -t bug-tracking-ai:v4 -f ai-service/Dockerfile .

# Run containers
docker run -d --name bug-backend-local -p 8080:8080 \
  -e DB_URL="jdbc:postgresql://host.docker.internal:5432/bugtracker" \
  -e DB_USERNAME=postgres -e DB_PASSWORD=yourpassword \
  bug-tracking-backend:v7

docker run -d --name bug-ai-local -p 5001:5001 \
  -e OPENAI_API_KEY="your-key" \
  -v ai-vector-store:/app/bug_rag_db \
  bug-tracking-ai:v4

docker run -d --name bug-frontend-local -p 5173:80 \
  bug-tracking-frontend:v7
```

## ☸️ Kubernetes Deployment

Kubernetes manifests are located in the `k8s/` folder:

```bash
kubectl apply -f k8s/deployment_backend.yaml
kubectl apply -f k8s/deployment_ai.yaml
kubectl apply -f k8s/deployment_frontend.yaml
kubectl apply -f k8s/services.yaml
kubectl apply -f k8s/ingress.yaml
```

## 📝 License

MIT
