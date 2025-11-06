# AI Service Setup Guide

## Quick Start

1. **Navigate to the AI service directory:**
   ```bash
   cd ai-service
   ```

2. **Create a virtual environment (recommended):**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   # Create .env file
   echo "OPENAI_API_KEY=your_api_key_here" > .env
   echo "OPENAI_MODEL=gpt-4o-mini" >> .env
   ```
   
   Or manually create `.env` file:
   ```
   OPENAI_API_KEY=sk-your-openai-api-key
   OPENAI_MODEL=gpt-4o-mini
   ```

5. **Run the service:**
   ```bash
   python main.py
   ```
   
   The service will start on `http://localhost:5001`

## Testing

Test the health endpoint:
```bash
curl http://localhost:5001/health
```

Test the AI suggestion endpoint:
```bash
curl -X POST http://localhost:5001/ai/suggest \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Login button not working",
    "description": "The login button does not respond when clicked."
  }'
```

## Frontend Integration

The frontend is already configured to call this service at `http://localhost:5001`. 

Make sure:
- AI service is running on port 5001
- OpenAI API key is set in `.env`
- CORS is enabled (already configured)

## Troubleshooting

- **"OPENAI_API_KEY is not set"**: Make sure you created the `.env` file with your API key
- **Connection errors**: Ensure the service is running on port 5001
- **Import errors**: Make sure all dependencies are installed: `pip install -r requirements.txt`

