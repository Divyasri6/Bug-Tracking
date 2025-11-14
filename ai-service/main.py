import os
import hashlib
from typing import List, Literal

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field, field_validator
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from rag_utils import add_bug_to_vector_store, retrieve_similar_bugs
from langchain_openai import ChatOpenAI
from langchain_core.messages import SystemMessage, HumanMessage
from langchain_core.output_parsers import PydanticOutputParser

# Load environment variables from .env file
load_dotenv()

# ----------------------------
# Pydantic models
# ----------------------------

class BugQuery(BaseModel):
    title: str = Field(..., example="Login button not working")
    description: str = Field(..., example="The login button does not respond when clicked on the homepage.")
    resolution: str | None = Field(
        default=None,
        example="Rolled back auth-service to v1.2.3 and purged CDN cache. Root cause was missing CSRF token.",
        description="Optional resolution or fix summary once the bug is resolved."
    )

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
app = FastAPI(title="AI Suggestion Service for Bug Tracker with RAG")

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
    OPENAI_API_KEY = None
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  

# ----------------------------
# System prompt generation
# ----------------------------
def get_system_prompt() -> str:
    """
    Generate system prompt for bug analysis.
    Provides business-focused analysis with technical context.
    """
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

def build_context_section(docs) -> str:
    if not docs:
        return "No relevant historical bug reports were found in the knowledge base."
    lines: List[str] = []
    for idx, doc in enumerate(docs, start=1):
        bug_id = doc.metadata.get("bug_id", f"similar_bug_{idx}")
        snippet = doc.page_content.replace("\n", " ")
        snippet = snippet[:350] + ("..." if len(snippet) > 350 else "")
        lines.append(f"{idx}. Bug ID: {bug_id} -> {snippet}")
    return "\n".join(lines)


def get_human_prompt(
    title: str,
    description: str,
    format_instructions: str,
    context_section: str,
    resolution: str | None = None,
) -> str:
    """
    Generate human prompt for bug analysis.
    """
    base_prompt = (
        f"{format_instructions}\n\n"
        "BUG REPORT:\n"
        f"Title: {title}\n\n"
        f"Description: {description}\n\n"
    )
    
    if resolution:
        base_prompt += f"Existing Resolution Notes:\n{resolution}\n\n"

    base_prompt += (
        "CONTEXT FROM KNOWN BUG REPORTS:\n"
        f"{context_section}\n\n"
        "Use the context above when it is relevant. If it is not helpful, clearly state that new investigation is required.\n\n"
            "Based on the bug title and description above, analyze the issue from a business perspective and provide:\n"
            "- Business impact: How does this affect users, operations, or revenue?\n"
            "- Possible causes: 2-3 likely root causes (explain in business terms with some technical context)\n"
            "- Resolutions: Actionable steps including business-level actions and technical notes\n"
            "- A predicted priority level (LOW, MEDIUM, or HIGH) based on business impact\n\n"
            "Please return only the JSON object as instructed. Do not include any extra explanation."
        )
    
    return base_prompt

# ----------------------------
# Helper: call LLM and parse structured output
# ----------------------------
def call_llm_and_parse(
    title: str,
    description: str,
    context_section: str,
    resolution: str | None = None,
) -> AiSuggestion:
    """
    Call LLM with bug title and description, return structured AiSuggestion.
    
    Args:
        title: Bug title
        description: Bug description
        context_section: Context from similar bugs
        resolution: Optional resolution notes
    
    Returns:
        AiSuggestion with suggestion and predictedPriority
    """
    if not OPENAI_API_KEY:
        raise RuntimeError("OPENAI_API_KEY is not set in environment variables")

    try:
        # Create the ChatOpenAI model
        llm = ChatOpenAI(
            model=OPENAI_MODEL,
            temperature=0.0,
            api_key=OPENAI_API_KEY,
        )
        
        # Use PydanticOutputParser for structured output
        parser = PydanticOutputParser(pydantic_object=AiSuggestion)
        format_instructions = parser.get_format_instructions()
        
        # Get prompts
        system_prompt = get_system_prompt()
        print("system_prompt:--------------------------------")
        print(system_prompt)
        human_message_content = get_human_prompt(
            title, description, format_instructions, context_section, resolution
        )
        print("human_message_content:--------------------------------")
        print(human_message_content)
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
        
    except Exception as e:
        raise RuntimeError(f"Failed to call LLM or parse response: {e}")

# ----------------------------
# Endpoint
# ----------------------------
@app.post("/ai/suggest", response_model=AiSuggestion)
async def suggest_ai(bug: BugQuery):
    """
    Accepts a bug title, description, and optional resolution notes. 
    Asks the LLM for a suggested fix and predicted priority (LOW/MEDIUM/HIGH),
    and returns a structured AiSuggestion.
    
    Provides business-focused analysis with technical context.
    
    Request body:
    {
        "title": "Login button not working",
        "description": "The login button does not respond when clicked.",
        "resolution": "Optional resolution notes if bug is resolved"
    }
    """
    try:
        # Use only title + description for retrieval (not resolution)
        # This ensures we find similar bugs based on the problem, not the solution
        query_text = f"{bug.title} {bug.description}"
        
        # Store the full text including resolution for future queries
        store_text = f"{bug.title}\n\n{bug.description}"
        if bug.resolution:
            store_text += f"\n\nResolution:\n{bug.resolution}"
        
        print("🔍 Retrieving similar bugs for query:", query_text[:100])
        context_docs = retrieve_similar_bugs(query_text, k=3)
        print(f"📋 Found {len(context_docs)} similar bugs")
        context_section = build_context_section(context_docs)
        
        ai_response = call_llm_and_parse(
            bug.title, bug.description, context_section, bug.resolution
        )

        # Store bug after generating response (so it's available for future queries)
        bug_hash = hashlib.sha1(store_text.encode("utf-8")).hexdigest()
        add_bug_to_vector_store(bug.title, bug.description, bug_hash, bug.resolution)

        return ai_response
    except RuntimeError as e:
        # Provide helpful error info in dev, but keep message safe for production
        raise HTTPException(status_code=500, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {e}")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "OK"}

# ----------------------------
# Run app
# ----------------------------
if __name__ == "__main__":
    # Default uvicorn host/port; change as needed
    uvicorn.run("main:app", host="0.0.0.0", port=5001, reload=True)

