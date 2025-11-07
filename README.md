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

- **[Backend Documentation](./BACKEND_DOCUMENTATION.md)** - Setup, configuration, and API reference for Spring Boot service
- **[Frontend Documentation](./FRONTEND_DOCUMENTATION.md)** - Complete guide for React frontend
- **[AI Service Documentation](./AI_SERVICE_DOCUMENTATION.md)** - Complete guide for Python AI service

## 🏗️ Architecture

- **Backend:** Spring Boot + PostgreSQL
- **Frontend:** React + Vite + Tailwind CSS
- **AI Service:** FastAPI + OpenAI

## 📖 Component Overview

### AI (FastAPI + OpenAI)
The AI microservice analyzes each bug's title and description to suggest a possible technical resolution. It predicts a priority level — LOW, MEDIUM, HIGH, or CRITICAL — based on issue severity. It can differentiate between business and developer contexts for better recommendations. The AI runs as a separate FastAPI service and communicates with the frontend via an API call. All AI responses are structured JSON for easy integration into the React interface.

### Frontend (React + Vite)
The React frontend allows users to create, update, and view bugs with a clean, styled interface. It features a dashboard with summary statistics and bug listing with table and card view modes. Users can search and filter bugs, trigger AI suggestions directly from the bug view page, and assign tasks to employees. It communicates with both the Spring Boot backend (for CRUD) and the FastAPI AI service (for insights). All API calls use Axios, and Tailwind plus external CSS ensure responsive design. Built with Vite for fast development and optimized builds.

### Backend (Spring Boot + PostgreSQL)
The backend is a RESTful API server that manages all CRUD operations for bugs and employees. It stores and retrieves bug data from PostgreSQL using Spring Data JPA for database operations. It exposes REST APIs with Swagger documentation for easy testing and integration. It also handles automatic bug assignment to available employees and ensures data consistency.

## ✨ Features

- Bug CRUD operations
- Employee management
- AI-powered bug analysis
- Dashboard with statistics
- Table and Card view modes
- Search and filtering
- Responsive design

## 📝 License

MIT
