# 🔧 OmniScribe Backend

FastAPI-powered backend with AI/ML capabilities for knowledge ingestion and retrieval.

---

## 🏗️ Architecture

```
main.py (FastAPI)
    │
    ├── ingestion.py ──────► Whisper (Audio) + PaddleOCR (Images)
    │
    ├── vector_store.py ───► ChromaDB + BGE Embeddings
    │
    └── agent_engine.py ───► LangGraph Workflow
                                  │
                                  ├── retrieve_node (Memory Search)
                                  ├── grade_and_generate_node (LLM)
                                  └── research_node (Tavily Web Search)
```

---

## 🛠️ Tech Stack

| Component | Technology | Purpose |
|-----------|------------|---------|
| Web Framework | FastAPI + Uvicorn | REST API |
| LLM Orchestration | LangGraph | Agent workflow |
| LLM | Ollama + Llama 3.1 8B | Response generation |
| Audio | Faster-Whisper (small) | Speech-to-text |
| OCR | PaddleOCR | Text extraction from images |
| Vector DB | ChromaDB | Semantic search |
| Embeddings | BGE-Small-EN | Text embeddings |
| Web Search | Tavily API | Fallback research |

---

## 📁 File Structure

```
backend/
├── main.py            # FastAPI app & endpoints
├── agent_engine.py    # LangGraph agent workflow
├── ingestion.py       # Whisper + PaddleOCR engine
├── vector_store.py    # ChromaDB connection
├── config.py          # Configuration & paths
├── setup_models.py    # Model download script
├── requirements.txt   # Python dependencies
└── chroma_db/         # Vector database storage
```

---

## 🚀 Setup

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or
source venv/bin/activate  # Linux/Mac
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt

# For GPU support (optional):
pip install torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
```

### 3. Download Models

```bash
python setup_models.py
```

This downloads:
- BGE-Small-EN embeddings
- Whisper-Small model
- PaddleOCR models

### 4. Configure Environment

Create `.env` in project root:
```env
TAVILY_API_KEY=your_key_here
```

### 5. Start Ollama

```bash
ollama serve
ollama pull llama3.1:8b
```

### 6. Run Backend

```bash
python main.py
```

Server runs at: **http://localhost:8000**

API Docs: **http://localhost:8000/docs**

---

## 📖 API Endpoints

### Health Check
```http
GET /
```

### Chat Query
```http
POST /chat
Content-Type: multipart/form-data

query: "What is emotion drift detection?"
```

### Audio Ingestion
```http
POST /ingest/audio
Content-Type: multipart/form-data

file: recording.wav
```

### Image OCR
```http
POST /ingest/image
Content-Type: multipart/form-data

file: screenshot.png
```

### Document Upload
```http
POST /ingest/text
Content-Type: multipart/form-data

file: notes.pdf
```
Supports: `.txt`, `.md`, `.pdf`, `.docx`

### Folder Scan
```http
POST /ingest/scan
```
Scans `knowledge/` folder for documents.

### Feedback Learning
```http
POST /feedback
Content-Type: multipart/form-data

original_query: "question"
correct_answer: "correct answer"
```

---

## ⚙️ Configuration

Edit `config.py` to customize:

| Setting | Default | Description |
|---------|---------|-------------|
| `LLM_MODEL_NAME` | `llama3.1:8b` | Ollama model |
| `OLLAMA_BASE_URL` | `http://localhost:11434` | Ollama server |
| `WHISPER_DEVICE` | `cpu` | Whisper device |
| `EMBEDDING_DEVICE` | `cpu` | Embeddings device |

---

## 🐳 Docker

The backend is containerized with NVIDIA CUDA support:

```dockerfile
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04
```

GPU passthrough enabled via `docker-compose.yml`.
