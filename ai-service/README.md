# AI Suggestion Service

FastAPI service that provides AI-powered bug analysis and suggestions using OpenAI.

## Setup

1. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env and add your OPENAI_API_KEY
   ```

3. **Run the service:**
   ```bash
   python main.py
   ```
   
   Or with uvicorn directly:
   ```bash
   uvicorn main:app --host 0.0.0.0 --port 5001 --reload
   ```

The service will run on `http://localhost:5001`

## API Endpoints

### POST `/ai/suggest`
Get AI suggestions for a bug with customizable analysis type.

**Request Body:**
```json
{
  "title": "Login button not working",
  "description": "The login button does not respond when clicked.",
  "userType": "developer"  // Optional: "developer" (default) or "business"
}
```

**Response:**
```json
{
  "suggestion": "Possible Causes: 1) onClick handler not bound... Resolutions: Check the onClick handler...",
  "predictedPriority": "HIGH"
}
```

**User Types:**
- `"developer"` (default): Provides technical root causes, code hints, and fix suggestions
- `"business"`: Provides non-technical summary, business impact assessment, and suggested priority with some technical context

### GET `/health`
Health check endpoint.

## Environment Variables

- `OPENAI_API_KEY` (required): Your OpenAI API key
- `OPENAI_MODEL` (optional): Model to use (default: gpt-4o-mini)

## CORS

Currently configured to allow all origins. For production, update the CORS middleware in `main.py` to restrict to your frontend domain.

