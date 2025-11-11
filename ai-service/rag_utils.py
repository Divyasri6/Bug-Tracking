# Vector DB helpers for RAG
# This file is used to add bug reports to the vector DB and retrieve similar bugs
# It is used to improve the accuracy of the AI suggestions

import os
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document

# Directory for local persistent vector DB
CHROMA_DB_DIR = "bug_rag_db"

# Initialize embedding model
_api_key = os.getenv("OPENAI_API_KEY")
embeddings = OpenAIEmbeddings(openai_api_key=_api_key) if _api_key else None
vector_store = (
    Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=embeddings)
    if embeddings
    else None
)

def add_bug_to_vector_store(title: str, description: str, bug_id: int, resolution: str | None = None):
    """Embed and store a new bug report."""
    if not vector_store:
        return
    body = f"{title}\n\n{description}"
    if resolution:
        body += f"\n\nResolution:\n{resolution}"
    doc = Document(page_content=body, metadata={"bug_id": bug_id, "has_resolution": bool(resolution)})
    vector_store.add_documents([doc])
    vector_store.persist()
    print(f"✅ Bug {bug_id} added to vector store.")

def retrieve_similar_bugs(query: str, k: int = 3):
    """Retrieve top-k similar bug reports."""
    if not vector_store:
        return []
    return vector_store.similarity_search(query, k=k)
