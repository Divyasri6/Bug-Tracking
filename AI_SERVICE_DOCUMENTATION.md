# AI Service Documentation

## Overview

The AI Service is a Python FastAPI application that provides AI-powered bug analysis and suggestions using OpenAI's GPT models. It analyzes bug reports and provides intelligent suggestions for fixing issues.

**Tech Stack:**
- Python 3.9+
- FastAPI (Web Framework)
- LangChain (LLM Integration)
- OpenAI API (GPT Models)
- Pydantic (Data Validation)
- Uvicorn (ASGI Server)

**Features:**
- Bug analysis with possible causes and resolutions
- Priority prediction (LOW, MEDIUM, HIGH)
- Developer and Business user modes
- Structured JSON responses

---

## **Complete Flow:**

```
1. Frontend Request
   POST /ai/suggest
   {
     "title": "Login button not working",
     "description": "...",
     "userType": "business",
     "resolution": null
   }
   ↓
2. FastAPI Receives Request
   - Validates BugQuery
   - Extracts title, description, userType, resolution
   ↓
3. Build Query Text
   query_text = title + description + resolution (if exists)
   ↓
4. RAG: Retrieve Similar Bugs
   - Generate embedding for query_text (OpenAI Embeddings API)
   - Search ChromaDB vector store (similarity_search)
   - Get top 3 similar bugs
   ↓
5. Build Context Section
   - Format similar bugs into readable text
   - Include bug IDs and snippets
   ↓
6. Build Prompts
   - System prompt (role definition based on userType)
   - Human prompt (bug + context + instructions)
   - Format instructions (PydanticOutputParser)
   ↓
7. Call LLM (OpenAI)
   - Send system + human messages
   - LLM generates response with context
   - Response includes suggestion and predictedPriority
   ↓
8. Parse Response
   - PydanticOutputParser validates and parses
   - Returns AiSuggestion object
   ↓
9. Store Bug in Vector Store
   - Generate bug hash (SHA1)
   - Create Document with title + description + resolution
   - Add to ChromaDB and persist
   ↓
10. Return Response
    {
      "suggestion": "Business Impact: ... Possible Causes: ... Resolutions: ...",
      "predictedPriority": "HIGH"
    }
```
## Prerequisites

Before you begin, ensure you have:

- **Python 3.9 or higher**
- **pip** (Python package manager)
- **OpenAI API Key** (Get from https://platform.openai.com/api-keys)
- **Virtual environment** (recommended)



### Verify Installation

```bash
python --version
pip --version
```

> 📸 **Screenshot Placeholder:** Terminal showing Python and pip versions

---

## Installation

### Step 1: Navigate to AI Service Directory

```bash
cd ai-service
```


### Step 2: Create Virtual Environment (Recommended)

```bash
python -m venv venv
```

**Activate Virtual Environment:**

**On macOS/Linux:**
```bash
source venv/bin/activate
```

**On Windows:**
```bash
venv\Scripts\activate
```

### Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- `fastapi` - Web framework
- `uvicorn` - ASGI server
- `pydantic` - Data validation
- `langchain` - LLM framework
- `langchain-openai` - OpenAI integration
- `python-dotenv` - Environment variables


### Step 4: Verify Installation

```bash
pip list | grep -E "fastapi|uvicorn|langchain"
```

---

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the `ai-service` directory:

```bash
touch .env
```


### Step 2: Add OpenAI API Key

Open `.env` file and add:

```env
OPENAI_API_KEY=your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Important:** Replace `your-actual-api-key-here` with your actual OpenAI API key.

---

## API Endpoints

### 1. POST `/ai/suggest`

Get AI-powered bug analysis and priority suggestion.

**Request Body:**
```json
{
  "title": "Login button not working",
  "description": "Users cannot log in when clicking the login button on Safari browser",
}
```

**Parameters:**
- `title` (string, required): Bug title
- `description` (string, required): Bug description

**Response:**
```json
{
  "suggestion": "Possible Causes: 1) onClick handler not bound properly... Resolutions: Check the onClick handler...",
  "predictedPriority": "HIGH"
}
```

**Response Fields:**
- `suggestion` (string): Detailed analysis with causes and resolutions
- `predictedPriority` (string): "LOW", "MEDIUM", or "HIGH"

### 2. GET `/health`

Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "service": "AI Suggestion Service"
}
```

---

## Step-by-Step Setup

### Step 1: Set Up Environment Variables

1. Navigate to `ai-service` directory
2. Create `.env` file
3. Add your OpenAI API key

```bash
cd ai-service
echo "OPENAI_API_KEY=sk-..." > .env
echo "OPENAI_MODEL=gpt-4o-mini" >> .env
```

### Step 2: Start the AI Service

**Option A: Using Python directly**
```bash
python main.py
```

**Option B: Using Uvicorn directly**
```bash
uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

You should see output like:
```
INFO:     Uvicorn running on http://0.0.0.0:5001 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```


### Step 3: Verify Service is Running

Open your browser and navigate to:
```
http://localhost:5001/health
```

You should see:
```json
{
  "status": "healthy",
  "service": "AI Suggestion Service"
}
```
---
**Output Format:**
```
Business Impact: [impact description]
Possible Causes: [business-friendly explanations]
Resolutions: [actionable business steps with technical notes]
```

### Issue: "Invalid response from AI service"

**Possible Causes:**
1. OpenAI API key invalid or expired
2. API rate limits exceeded
3. Network issues

**Solutions:**
1. Verify API key is valid at https://platform.openai.com/api-keys
2. Check OpenAI account has credits
3. Review API usage limits


### Issue: Service starts but endpoints return 500

**Possible Causes:**
1. LangChain version incompatibility
2. Missing dependencies
3. Model name incorrect

**Solutions:**
1. Reinstall dependencies: `pip install -r requirements.txt --upgrade`
2. Check `OPENAI_MODEL` in `.env` (default: `gpt-4o-mini`)
3. Review service logs for detailed error messages


### Issue: Slow Response Times

**Possible Causes:**
1. Model selection (larger models are slower)
2. Network latency
3. OpenAI API rate limiting

**Solutions:**
1. Use faster model: `gpt-4o-mini` (default) instead of `gpt-4`
2. Check network connectivity
3. Implement retry logic (already included)

---

## Configuration Options

### Environment Variables

**`.env` file:**
```env
# Required
OPENAI_API_KEY=sk-your-api-key-here

# Optional (default: gpt-4o-mini)
OPENAI_MODEL=gpt-4o-mini
```

### Model Selection

Available models:
- `gpt-4o-mini` (default) - Fast and cost-effective
- `gpt-4o` - More capable, slower
- `gpt-4` - Most capable, slowest

Change in `.env`:
```env
OPENAI_MODEL=gpt-4o

---

## Development

### Running in Development Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 5001 --reload
```

The `--reload` flag enables auto-reload on code changes.

### Running in Production Mode

```bash
uvicorn main:app --host 0.0.0.0 --port 5001 --workers 4
```

### Viewing API Documentation

Once the service is running, access:
- **Swagger UI:** http://localhost:5001/docs
- **ReDoc:** http://localhost:5001/redoc


---

## API Testing

### Using cURL

**Health Check:**
```bash
curl http://localhost:5001/health
```

**Get AI Suggestion:**
```bash
curl -X POST http://localhost:5001/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test bug",
    "description": "This is a test bug description",
    
  }'
```

---

## Integration with Frontend

The frontend automatically integrates with this service:

1. **Create Bug Page:**
   - User fills in title and description
   - Clicks "Get AI Suggestion"
   - Frontend calls `POST /ai/suggest`
   - Displays suggestions in formatted sections

2. **Response Handling:**
   - Parses Business Impact, Possible Causes, Resolutions
   - Updates priority field automatically
   - Shows formatted results with icons


---
## 🎯 Key Takeaways

1. **RAG Architecture**: Uses vector store for context-aware suggestions
2. **FastAPI**: Modern, fast Python web framework
3. **LangChain**: Simplifies LLM integration
4. **OpenAI Embeddings**: High-quality semantic search
5. **ChromaDB**: Lightweight, local vector database
6. **Self-Improving**: Gets smarter with each bug stored
7. **Context-Aware**: Uses past bugs for better suggestions
8. **Production-Ready**: Proper error handling, security, monitoring



