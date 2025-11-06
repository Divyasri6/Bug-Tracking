import os
from typing import Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Note: LangChain imports are done conditionally inside the function
# to support both modern and legacy versions

# ----------------------------
# Pydantic models
# ----------------------------

class BugQuery(BaseModel):
    title: str = Field(..., example="Login button not working")
    description: str = Field(..., example="The login button does not respond when clicked on the homepage.")

class AiSuggestion(BaseModel):
    suggestion: str = Field(..., example="Check the onClick handler; ensure event is bound and preventing default isn't blocking it.")
    predictedPriority: Literal["LOW", "MEDIUM", "HIGH"]

    @field_validator("predictedPriority")
    @classmethod
    def uppercase_and_validate(cls, v: str):
        if v is None:
            raise ValueError("predictedPriority must be provided")
        v_up = str(v).strip().upper()
        if v_up not in {"LOW", "MEDIUM", "HIGH"}:
            raise ValueError("predictedPriority must be one of LOW, MEDIUM, HIGH")
        return v_up

# ----------------------------
# FastAPI app + CORS
# ----------------------------
app = FastAPI(title="AI Suggestion Service for Bug Tracker")

# Allow all CORS origins (React dev server can call this)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For production, restrict this to your frontend origin(s)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------------------
# Setup LangChain/OpenAI model & Structured Output parser
# ----------------------------
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
if not OPENAI_API_KEY:
    # We won't fail on import, but will raise when endpoint is used
    OPENAI_API_KEY = None

# Choose a model; you may override via env var OPENAI_MODEL
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # change to preferred model if needed

# System message to define role
SYSTEM_PROMPT = (
    "You are an expert software engineer and triage manager. "
    "Analyze bug reports (title + description) and produce a helpful, concise technical suggestion "
    "and a single priority level. The response MUST be strictly valid JSON matching the format instructions provided."
)

# ----------------------------
# Helper: call LLM and parse structured output
# ----------------------------
def call_llm_and_parse(title: str, description: str) -> AiSuggestion:
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set in environment variables")

    try:
        # Try modern langchain_openai first
        from langchain_openai import ChatOpenAI
        from langchain_core.messages import SystemMessage, HumanMessage
        from langchain_core.output_parsers import PydanticOutputParser
        
        # Create the ChatOpenAI model
        llm = ChatOpenAI(
            model=OPENAI_MODEL,
            temperature=0.0,
            api_key=OPENAI_API_KEY,
        )
        
        # Use PydanticOutputParser for structured output
        parser = PydanticOutputParser(pydantic_object=AiSuggestion)
        format_instructions = parser.get_format_instructions()
        
        # Build human prompt including format instructions
        human_message_content = (
            f"{format_instructions}\n\n"
            "BUG REPORT:\n"
            f"Title: {title}\n\n"
            f"Description: {description}\n\n"
            "Please return only the JSON object as instructed. Do not include any extra explanation."
        )

        # Call the model
        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=human_message_content),
        ]

        response = llm.invoke(messages)
        content = response.content if hasattr(response, 'content') else str(response)
        
        # Parse using PydanticOutputParser
        parsed = parser.parse(content)
        return parsed
        
    except ImportError:
        # Fallback to older langchain version
        from langchain.chat_models import ChatOpenAI
        from langchain.schema import SystemMessage, HumanMessage
        from langchain.output_parsers import StructuredOutputParser, ResponseSchema
        
        response_schemas = [
            ResponseSchema(
                name="suggestion",
                description="A concise technical suggestion or likely cause and recommended fix. Be concrete and include steps or code pointers if helpful."
            ),
            ResponseSchema(
                name="predictedPriority",
                description='Predicted priority for the bug. MUST be one of the strings: "LOW", "MEDIUM", "HIGH".'
            ),
        ]
        
        parser = StructuredOutputParser.from_response_schemas(response_schemas)
        format_instructions = parser.get_format_instructions()
        
        llm = ChatOpenAI(
            model_name=OPENAI_MODEL,
            temperature=0.0,
            openai_api_key=OPENAI_API_KEY,
        )

        human_message_content = (
            f"{format_instructions}\n\n"
            "BUG REPORT:\n"
            f"Title: {title}\n\n"
            f"Description: {description}\n\n"
            "Please return only the JSON object as instructed. Do not include any extra explanation."
        )

        messages = [
            SystemMessage(content=SYSTEM_PROMPT),
            HumanMessage(content=human_message_content),
        ]

        response = llm(messages)
        content = response.content if hasattr(response, "content") else str(response)

        try:
            parsed = parser.parse(content)
        except Exception as e:
            raise RuntimeError(f"Failed to parse model output as structured JSON. Raw output:\n{content}\n\nError: {e}")

        try:
            ai = AiSuggestion(
                suggestion=parsed.get("suggestion", "").strip(),
                predictedPriority=str(parsed.get("predictedPriority", "")).strip().upper()
            )
            return ai
        except Exception as e:
            raise RuntimeError(f"Parsed output did not match AiSuggestion schema: {e}. Parsed content: {parsed}")

# ----------------------------
# Endpoint
# ----------------------------
@app.post("/ai/suggest", response_model=AiSuggestion)
async def suggest_ai(bug: BugQuery):
    """
    Accepts a bug title and description, asks the LLM for a suggested fix and predicted priority (LOW/MEDIUM/HIGH),
    and returns a structured AiSuggestion.
    """
    try:
        ai_response = call_llm_and_parse(bug.title, bug.description)
        return ai_response
    except RuntimeError as e:
        # Provide helpful error info in dev, but keep message safe for production
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "AI Suggestion Service"}

# ----------------------------
# Run app
# ----------------------------
if __name__ == "__main__":
    # Default uvicorn host/port; change as needed
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)

