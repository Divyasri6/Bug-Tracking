# Vector DB helpers for RAG
# This file is used to add bug reports to the vector DB and retrieve similar bugs
# It is used to improve the accuracy of the AI suggestions

import os
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.schema import Document

# Directory for local persistent vector DB
CHROMA_DB_DIR = "bug_rag_db"

# Global variables for lazy initialization
_vector_store = None
_embeddings = None

def _get_vector_store():
    """Lazy initialization of vector store."""
    global _vector_store, _embeddings
    
    if _vector_store is not None:
        print("♻️ Using existing vector store instance.")
        return _vector_store
    
    _api_key = os.getenv("OPENAI_API_KEY")
    if not _api_key:
        print("⚠️ OPENAI_API_KEY not found in environment variables.")
        return None
    
    try:
        print(f"🔧 Initializing vector store with API key: {_api_key[:20]}...")
        _embeddings = OpenAIEmbeddings(openai_api_key=_api_key)
        _vector_store = Chroma(persist_directory=CHROMA_DB_DIR, embedding_function=_embeddings)
        
        # Verify initialization succeeded
        if _vector_store is None:
            print("❌ Vector store is None after initialization.")
            return None
        
        print("✅ Vector store initialized successfully.")
        
        # Verify we can access the collection (don't fail if this errors)
        try:
            collection = _vector_store._collection
            if collection:
                count = collection.count()
                print(f"📊 Verified vector store has {count} documents.")
        except Exception as e:
            print(f"⚠️ Warning: Could not verify collection (this is OK): {e}")
            # Don't fail initialization if verification fails
        
        # Final check before returning
        if _vector_store is None:
            print("❌ Vector store became None after verification.")
            return None
        
        print(f"✅ Returning vector store: {type(_vector_store)}")
        return _vector_store
    except Exception as e:
        print(f"❌ Error initializing vector store: {e}")
        import traceback
        traceback.print_exc()
        _vector_store = None
        _embeddings = None
        return None

def add_bug_to_vector_store(title: str, description: str, bug_id: str, resolution: str | None = None):
    """Embed and store a new bug report."""
    vector_store = _get_vector_store()
    # Use explicit None check instead of truthiness check (Chroma objects can evaluate to False)
    if vector_store is None:
        print("⚠️ Vector store not initialized. Skipping adding bug.")
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
    vector_store = _get_vector_store()
    # Use explicit None check instead of truthiness check (Chroma objects can evaluate to False)
    if vector_store is None:
        print("⚠️ Vector store not initialized. Skipping retrieval.")
        return []
    
    try:
        # Get collection to check if it has documents
        collection = vector_store._collection
        if collection:
            count = collection.count()
            print(f"📊 Vector store has {count} documents.")
        
        results = vector_store.similarity_search(query, k=k)
        print(f"🔍 Retrieved {len(results)} similar bugs for query: {query[:100]}...")
        return results
    except Exception as e:
        print(f"❌ Error retrieving similar bugs: {e}")
        return []
