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
    userType: Literal["developer", "business"] = Field(default="developer", example="developer")

class AiSuggestion(BaseModel):
    suggestion: str = Field(
        ..., 
        examples=[
            "Possible Causes: 1) onClick handler not bound properly, 2) Event propagation blocked. Resolutions: Check the onClick handler binding in the Login component, ensure event.preventDefault() is not blocking the handler, verify the component is properly mounted.",
            "Business Impact: Users cannot access their accounts, leading to support tickets and potential revenue loss. Technical Note: The login functionality appears to be broken. Priority: HIGH - This blocks core user authentication."
        ]
    )
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

# ----------------------------
# Dynamic prompt generation based on user type
# ----------------------------
def get_system_prompt(user_type: str) -> str:
    """
    Generate system prompt based on user type.
    - developer: Technical root causes, code hints, fix suggestions
    - business: Non-technical summary, business impact, with some technical hints
    """
    if user_type == "business":
        return (
            "You are an expert product manager and business analyst. "
            "Analyze bug reports (title + description) and provide:\n"
            "1. Business Impact: Explain how this bug affects users, business operations, or revenue\n"
            "2. Possible Causes: Provide 2-3 likely root causes in non-technical terms, but include some technical context where helpful\n"
            "3. Resolutions: Suggest actionable steps to address the issue, including both business-level actions and technical notes\n"
            "Format your suggestion as: 'Business Impact: [impact]. Possible Causes: [causes]. Resolutions: [resolutions].'\n"
            "Also predict a priority level (LOW, MEDIUM, or HIGH) based on the bug's business impact and user impact.\n"
            "The response MUST be strictly valid JSON matching the format instructions provided."
        )
    else:  # developer (default)
        return (
            "You are an expert software engineer and triage manager. "
            "Analyze bug reports (title + description) and provide:\n"
            "1. Possible Causes: List 2-3 likely root causes for the bug with technical details\n"
            "2. Resolutions: Provide concrete, actionable steps to fix the issue, including code pointers, specific areas to check, and technical implementation details\n"
            "Format your suggestion as: 'Possible Causes: [list causes]. Resolutions: [list resolutions].'\n"
            "Also predict a priority level (LOW, MEDIUM, or HIGH) based on the bug's technical impact and severity.\n"
            "The response MUST be strictly valid JSON matching the format instructions provided."
        )

def get_human_prompt(title: str, description: str, user_type: str, format_instructions: str) -> str:
    """
    Generate human prompt based on user type.
    """
    base_prompt = (
        f"{format_instructions}\n\n"
        "BUG REPORT:\n"
        f"Title: {title}\n\n"
        f"Description: {description}\n\n"
    )
    
    if user_type == "business":
        return (
            f"{base_prompt}"
            "Based on the bug title and description above, analyze the issue from a business perspective and provide:\n"
            "- Business impact: How does this affect users, operations, or revenue?\n"
            "- Possible causes: 2-3 likely root causes (explain in business terms with some technical context)\n"
            "- Resolutions: Actionable steps including business-level actions and technical notes\n"
            "- A predicted priority level (LOW, MEDIUM, or HIGH) based on business impact\n\n"
            "Please return only the JSON object as instructed. Do not include any extra explanation."
        )
    else:  # developer
        return (
            f"{base_prompt}"
            "Based on the bug title and description above, analyze the issue and provide:\n"
            "- Possible causes for this bug (2-3 likely root causes with technical details)\n"
            "- Resolutions with actionable steps to fix the issue, including code pointers and technical implementation details\n"
            "- A predicted priority level (LOW, MEDIUM, or HIGH) based on technical impact\n\n"
            "Please return only the JSON object as instructed. Do not include any extra explanation."
        )

# ----------------------------
# Helper: call LLM and parse structured output
# ----------------------------
def call_llm_and_parse(title: str, description: str, user_type: str = "developer") -> AiSuggestion:
    """
    Call LLM with bug title and description, return structured AiSuggestion.
    
    Args:
        title: Bug title
        description: Bug description
        user_type: "developer" or "business" - determines prompt style
    
    Returns:
        AiSuggestion with suggestion and predictedPriority
    """
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
        
        # Get dynamic prompts based on user type
        system_prompt = get_system_prompt(user_type)
        human_message_content = get_human_prompt(title, description, user_type, format_instructions)

        # Call the model
        messages = [
            SystemMessage(content=system_prompt),
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
        
        # Determine response schema description based on user type
        if user_type == "business":
            suggestion_desc = "A detailed analysis including: 1) Business Impact (how this affects users/operations/revenue), 2) Possible Causes (2-3 likely root causes in business terms with technical context), 3) Resolutions (actionable steps including business-level actions and technical notes). Format as: 'Business Impact: [impact]. Possible Causes: [causes]. Resolutions: [resolutions].'"
        else:
            suggestion_desc = "A detailed analysis including: 1) Possible Causes (2-3 likely root causes with technical details), 2) Resolutions (concrete, actionable steps to fix with code pointers or specific areas to check). Format as: 'Possible Causes: [list]. Resolutions: [list].'"
        
        response_schemas = [
            ResponseSchema(
                name="suggestion",
                description=suggestion_desc
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

        # Get dynamic prompts based on user type
        system_prompt = get_system_prompt(user_type)
        human_message_content = get_human_prompt(title, description, user_type, format_instructions)

        messages = [
            SystemMessage(content=system_prompt),
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
    Accepts a bug title, description, and userType, asks the LLM for a suggested fix and predicted priority (LOW/MEDIUM/HIGH),
    and returns a structured AiSuggestion.
    
    - userType "developer": Provides technical root causes, code hints, and fix suggestions
    - userType "business": Provides non-technical summary, business impact, and suggested priority with some technical hints
    
    Request body:
    {
        "title": "Login button not working",
        "description": "The login button does not respond when clicked.",
        "userType": "developer"  // or "business", defaults to "developer"
    }
    """
    try:
        ai_response = call_llm_and_parse(bug.title, bug.description, bug.userType)
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

