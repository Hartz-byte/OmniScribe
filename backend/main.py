# Import torch first to initialize CUDA DLLs
import torch
import os

os.environ["KMP_DUPLICATE_LIB_OK"] = "TRUE"

# Standard Imports
import shutil
import uvicorn
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import sys
import types

# Shim patch
try:
    import langchain_core.documents
    sys.modules["langchain.docstore.document"] = types.ModuleType("langchain.docstore.document")
    sys.modules["langchain.docstore.document"].Document = langchain_core.documents.Document
except: pass

# Custom Modules
from ingestion import ingestion_engine
from vector_store import get_vector_store
from agent_engine import agent_app

app = FastAPI(title="Omni-Scribe API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Database
try:
    vector_db = get_vector_store()
except Exception as e:
    print(f"⚠️ Vector DB Init Warning: {e}")

@app.get("/")
def health_check():
    return {"status": "Omni-Scribe Brain is Active 🧠"}

@app.post("/ingest/audio")
async def ingest_audio(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        print(f"🎤 Transcribing {file.filename}...")
        text = ingestion_engine.transcribe_audio(temp_path)
        
        vector_db.add_texts(texts=[text], metadatas=[{"source": "audio", "filename": file.filename}])
        return {"status": "success", "text_snippet": text[:100] + "..."}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/ingest/image")
async def ingest_image(file: UploadFile = File(...)):
    temp_path = f"temp_{file.filename}"
    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        print(f"👁️ Analyzing Image {file.filename}...")
        text = ingestion_engine.extract_text_from_image(temp_path)
        
        vector_db.add_texts(texts=[text], metadatas=[{"source": "image", "filename": file.filename}])
        return {"status": "success", "extracted_text": text[:100] + "..."}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if os.path.exists(temp_path):
            os.remove(temp_path)

@app.post("/chat")
async def chat(query: str = Form(...)):
    print(f"💬 Processing Query: {query}")
    inputs = {"query": query, "context": [], "response": "", "is_sufficient": False}
    
    # Trigger LangGraph workflow
    result = agent_app.invoke(inputs)

    print(f"🤖 AI Response: {result['response']}")
    print("-" * 50)
    
    return {
        "answer": result["response"],
        "context_used": result["context"]
    }

@app.post("/feedback")
async def learn_from_feedback(
    original_query: str = Form(...), 
    correct_answer: str = Form(...)
):
    """
    Implements the Self-Learning Memory System.
    Ingests human corrections as 'High Priority' context.
    """
    print(f"🧠 Self-Learning triggered for: {original_query}")
    
    # Create a synthetic document with the correction
    learning_text = f"[HUMAN CORRECTION] Question: {original_query}\nAnswer: {correct_answer}"
    
    # Save to Vector DB immediately
    vector_db.add_texts(
        texts=[learning_text],
        metadatas=[{"source": "human_feedback", "type": "correction"}]
    )
    
    return {"status": "learned", "message": "Memory updated. I won't make that mistake again."}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
