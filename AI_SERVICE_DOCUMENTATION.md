# AI Service Documentation

## Table of Contents
1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Endpoints](#api-endpoints)
6. [Step-by-Step Setup](#step-by-step-setup)
7. [Usage Examples](#usage-examples)
8. [Troubleshooting](#troubleshooting)

---

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

> 📸 **Screenshot Placeholder:** Terminal showing directory navigation

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

> 📸 **Screenshot Placeholder:** Terminal showing virtual environment activation

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

> 📸 **Screenshot Placeholder:** Terminal showing pip install progress

### Step 4: Verify Installation

```bash
pip list | grep -E "fastapi|uvicorn|langchain"
```

> 📸 **Screenshot Placeholder:** Terminal showing installed packages

---

## Configuration

### Step 1: Create Environment File

Create a `.env` file in the `ai-service` directory:

```bash
touch .env
```

> 📸 **Screenshot Placeholder:** File explorer showing .env file creation

### Step 2: Add OpenAI API Key

Open `.env` file and add:

```env
OPENAI_API_KEY=your-actual-api-key-here
OPENAI_MODEL=gpt-4o-mini
```

**Important:** Replace `your-actual-api-key-here` with your actual OpenAI API key.

> 📸 **Screenshot Placeholder:** .env file with API key (key should be blurred/masked)

### Step 3: Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key and paste it in `.env` file

> 📸 **Screenshot Placeholder:** OpenAI platform showing API key creation

---

## API Endpoints

### 1. POST `/ai/suggest`

Get AI-powered bug analysis and priority suggestion.

**Request Body:**
```json
{
  "title": "Login button not working",
  "description": "Users cannot log in when clicking the login button on Safari browser",
  "userType": "developer"
}
```

**Parameters:**
- `title` (string, required): Bug title
- `description` (string, required): Bug description
- `userType` (string, optional): "developer" or "business" (default: "developer")

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

> 📸 **Screenshot Placeholder:** Terminal showing .env file creation

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

> 📸 **Screenshot Placeholder:** Terminal showing AI service starting

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

> 📸 **Screenshot Placeholder:** Browser showing health check response

### Step 4: Test the API

**Using curl:**
```bash
curl -X POST http://localhost:5001/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not working",
    "description": "Users cannot log in when clicking the login button",
    "userType": "developer"
  }'
```

> 📸 **Screenshot Placeholder:** Terminal showing curl request and response

**Using Browser (Swagger UI):**
Navigate to:
```
http://localhost:5001/docs
```

This opens the interactive API documentation where you can test endpoints.

> 📸 **Screenshot Placeholder:** Swagger UI interface

---

## Usage Examples

### Example 1: Developer Mode Analysis

**Request:**
```json
{
  "title": "Database connection timeout",
  "description": "Application fails to connect to PostgreSQL database after 30 seconds",
  "userType": "developer"
}
```

**Expected Response:**
```json
{
  "suggestion": "Possible Causes: 1) Connection pool exhausted, 2) Network latency issues, 3) Database server overloaded. Resolutions: Check connection pool configuration, increase timeout settings, verify database server health, review connection string parameters.",
  "predictedPriority": "HIGH"
}
```

> 📸 **Screenshot Placeholder:** API response in JSON format

### Example 2: Business Mode Analysis

**Request:**
```json
{
  "title": "Payment processing failed",
  "description": "Customers cannot complete purchases at checkout",
  "userType": "business"
}
```

**Expected Response:**
```json
{
  "suggestion": "Business Impact: This directly affects revenue and customer satisfaction. Customers cannot complete purchases, leading to abandoned carts and potential revenue loss. Possible Causes: Payment gateway integration issue, network connectivity problems, or invalid payment credentials. Resolutions: Contact payment gateway provider, verify API credentials, check transaction logs, implement fallback payment method.",
  "predictedPriority": "HIGH"
}
```

> 📸 **Screenshot Placeholder:** Business mode response

### Example 3: Integration with Frontend

The frontend automatically calls this service when:
1. User clicks "Get AI Suggestion" button in Create Bug page
2. User selects analysis type (Developer or Business)
3. Service returns suggestions and predicted priority

> 📸 **Screenshot Placeholder:** Frontend showing AI suggestion results

---

## User Types

### Developer Mode (`userType: "developer"`)

**Focus:**
- Technical root causes
- Code-level issues
- Implementation details
- Debugging steps

**Output Format:**
```
Possible Causes: [technical causes]
Resolutions: [technical solutions with code hints]
```

### Business Mode (`userType: "business"`)

**Focus:**
- Business impact
- User experience effects
- Revenue implications
- Non-technical explanations with technical context

**Output Format:**
```
Business Impact: [impact description]
Possible Causes: [business-friendly explanations]
Resolutions: [actionable business steps with technical notes]
```

> 📸 **Screenshot Placeholder:** Comparison of developer vs business mode outputs

---

## Troubleshooting

### Issue: "OPENAI_API_KEY is not set"

**Error Message:**
```
RuntimeError: OPENAI_API_KEY is not set in environment variables
```

**Solution:**
1. Check `.env` file exists in `ai-service` directory
2. Verify API key is correctly set: `OPENAI_API_KEY=sk-...`
3. Restart the service after adding the key

> 📸 **Screenshot Placeholder:** Error message in terminal

### Issue: "Failed to fetch" or Connection Error

**Possible Causes:**
1. Service not running
2. Wrong port (should be 5001)
3. Firewall blocking connection

**Solutions:**
1. Verify service is running: `curl http://localhost:5001/health`
2. Check port 5001 is not in use
3. Verify firewall settings

> 📸 **Screenshot Placeholder:** Connection error in browser console

### Issue: "Invalid response from AI service"

**Possible Causes:**
1. OpenAI API key invalid or expired
2. API rate limits exceeded
3. Network issues

**Solutions:**
1. Verify API key is valid at https://platform.openai.com/api-keys
2. Check OpenAI account has credits
3. Review API usage limits

> 📸 **Screenshot Placeholder:** Invalid response error

### Issue: Service starts but endpoints return 500

**Possible Causes:**
1. LangChain version incompatibility
2. Missing dependencies
3. Model name incorrect

**Solutions:**
1. Reinstall dependencies: `pip install -r requirements.txt --upgrade`
2. Check `OPENAI_MODEL` in `.env` (default: `gpt-4o-mini`)
3. Review service logs for detailed error messages

> 📸 **Screenshot Placeholder:** Service logs showing error details

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
```

> 📸 **Screenshot Placeholder:** .env file with model configuration

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

> 📸 **Screenshot Placeholder:** Swagger UI documentation page

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
    "userType": "developer"
  }'
```

### Using Python Requests

```python
import requests

response = requests.post(
    "http://localhost:5001/ai/suggest",
    json={
        "title": "Test bug",
        "description": "This is a test bug description",
        "userType": "developer"
    }
)

print(response.json())
```

> 📸 **Screenshot Placeholder:** Python script execution

### Using Postman

1. Create new POST request
2. URL: `http://localhost:5001/ai/suggest`
3. Headers: `Content-Type: application/json`
4. Body (raw JSON):
```json
{
  "title": "Test bug",
  "description": "This is a test bug description",
  "userType": "developer"
}
```

> 📸 **Screenshot Placeholder:** Postman request configuration

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

> 📸 **Screenshot Placeholder:** Frontend showing AI integration

---

## Security Notes

1. **Never commit `.env` file** - It contains your API key
2. **Use environment variables** in production
3. **Restrict CORS** in production (currently allows all origins)
4. **Rate limiting** - Consider implementing rate limits for production

---

## Cost Considerations

- **gpt-4o-mini:** ~$0.15 per 1M input tokens, ~$0.60 per 1M output tokens
- **gpt-4o:** ~$2.50 per 1M input tokens, ~$10 per 1M output tokens
- Average request: ~500-1000 tokens
- Monitor usage at https://platform.openai.com/usage

> 📸 **Screenshot Placeholder:** OpenAI usage dashboard

---

## Next Steps

1. Add screenshots to each section marked with 📸
2. Test all endpoints thoroughly
3. Configure production settings
4. Set up monitoring and logging
5. Implement rate limiting if needed

---

## Support

For issues or questions:
1. Check the Troubleshooting section
2. Review service logs
3. Check OpenAI API status
4. Verify all dependencies are installed

---

**Last Updated:** November 2025

