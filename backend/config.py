import os
import sys

# Project Paths
BASE_DIR = r"D:\AIML-Projects\OmniScribe"
BACKEND_DIR = os.path.join(BASE_DIR, "backend")
MODELS_DIR = os.path.join(BASE_DIR, "models")

# GLOBAL DIRECTORY OVERRIDES
os.environ["PADDLE_HOME"] = MODELS_DIR
os.environ["PADDLEX_HOME"] = MODELS_DIR
os.environ["HF_HOME"] = MODELS_DIR

# Model Specific Paths
EMBEDDING_MODEL_PATH = os.path.join(MODELS_DIR, "bge-small-en")
WHISPER_MODEL_PATH = os.path.join(MODELS_DIR, "whisper-small")
OCR_MODEL_DIR = os.path.join(MODELS_DIR, "paddleocr")

# Database Paths
VECTOR_DB_PATH = os.path.join(BACKEND_DIR, "chroma_db")
COLLECTION_NAME = "omni_knowledge"

# LLM Settings
LLM_MODEL_NAME = "llama3.1:8b"
OLLAMA_BASE_URL = "http://localhost:11434"

# Hardware Settings
EMBEDDING_DEVICE = "cpu" 
WHISPER_DEVICE = "cuda"
WHISPER_COMPUTE_TYPE = "int8"
