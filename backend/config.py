import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env file at project root
load_dotenv(os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env'))

# Project Paths (configurable via environment for Docker)
BASE_DIR = os.getenv("OMNISCRIBE_BASE_DIR", r"D:\AIML-Projects\OmniScribe")
BACKEND_DIR = os.getenv("OMNISCRIBE_BACKEND_DIR", os.path.join(BASE_DIR, "backend"))
MODELS_DIR = os.getenv("OMNISCRIBE_MODELS_DIR", os.path.join(BASE_DIR, "models"))
KNOWLEDGE_DIR = os.getenv("OMNISCRIBE_KNOWLEDGE_DIR", os.path.join(BASE_DIR, "knowledge"))

# TAVILY API KEY (loaded from .env)
os.environ["TAVILY_API_KEY"] = os.getenv("TAVILY_API_KEY", "") 

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

# LLM Settings (Ollama - configurable for Docker networking)
LLM_MODEL_NAME = os.getenv("LLM_MODEL_NAME", "llama3.1:8b")
OLLAMA_BASE_URL = os.getenv("OLLAMA_BASE_URL", "http://localhost:11434")

# Hardware Settings
EMBEDDING_DEVICE = os.getenv("EMBEDDING_DEVICE", "cpu")
WHISPER_DEVICE = os.getenv("WHISPER_DEVICE", "cpu")
WHISPER_COMPUTE_TYPE = os.getenv("WHISPER_COMPUTE_TYPE", "int8")

