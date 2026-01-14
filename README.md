# 🧠 OmniScribe

**AI-Powered Knowledge Assistant with Multimodal Ingestion**

OmniScribe is an intelligent knowledge management system that ingests audio, images, and documents, stores them in a vector database, and answers questions using a local LLM with RAG (Retrieval-Augmented Generation).

---

## ✨ Features

- 🎤 **Audio Transcription** - Whisper-powered speech-to-text
- 👁️ **OCR Extraction** - PaddleOCR for text from images
- 📄 **Document Ingestion** - Support for TXT, MD, PDF, DOCX
- 🔍 **Semantic Search** - ChromaDB vector database with BGE embeddings
- 🤖 **Local LLM** - Llama 3.1 8B via Ollama (GPU accelerated)
- 🌐 **Web Research** - Tavily API fallback for unknown queries
- 🔄 **Self-Learning** - Human feedback loop for corrections
- 🐳 **Docker Ready** - Full containerization with GPU support

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Frontend (React)                      │
│              Nginx on port 80 (Docker)                   │
└─────────────────────────┬───────────────────────────────┘
                          │
┌─────────────────────────▼───────────────────────────────┐
│                  Backend (FastAPI)                       │
│                     Port 8000                            │
├──────────────┬──────────────┬──────────────┬────────────┤
│   Whisper    │  PaddleOCR   │  ChromaDB    │  LangGraph │
│   (Audio)    │   (Images)   │  (VectorDB)  │   (Agent)  │
└──────────────┴──────────────┴──────────────┴─────┬──────┘
                                                   │
┌──────────────────────────────────────────────────▼──────┐
│                    Ollama (LLM)                          │
│              Llama 3.1 8B - Port 11434                   │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Component | Technology |
|-----------|------------|
| Frontend | React 19, TypeScript, Tailwind CSS, Vite |
| Backend | FastAPI, Python 3.11, LangGraph |
| LLM | Ollama + Llama 3.1 8B |
| Audio | Faster-Whisper (whisper-small) |
| OCR | PaddleOCR |
| Vector DB | ChromaDB + BGE-Small embeddings |
| Web Search | Tavily API |
| Containerization | Docker, Docker Compose |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.11+
- Node.js 20+
- Ollama with `llama3.1:8b` model
- NVIDIA GPU (optional, for acceleration)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yourusername/OmniScribe.git
cd OmniScribe

# Setup backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
python setup_models.py  # Download AI models

# Start backend
python main.py

# In another terminal - Setup frontend
cd frontend
npm install
npm run dev
```

Access at: **http://localhost:5173**

### Docker Deployment

```bash
# Build and run all services
docker-compose up --build

# First time: warm up the LLM (takes ~2 min)
# Then enjoy fast responses!
```

Access at: **http://localhost**

---

## 📁 Project Structure

```
OmniScribe/
├── backend/              # FastAPI backend
│   ├── main.py           # API endpoints
│   ├── agent_engine.py   # LangGraph workflow
│   ├── ingestion.py      # Whisper + PaddleOCR
│   ├── vector_store.py   # ChromaDB connection
│   └── config.py         # Configuration
├── frontend/             # React frontend
│   ├── src/
│   │   ├── components/   # UI components
│   │   ├── services/     # API client
│   │   └── App.tsx       # Main app
├── docker/               # Docker config files
├── models/               # Downloaded AI models
├── knowledge/            # Documents for ingestion
└── docker-compose.yml    # Container orchestration
```

---

## 🔧 Configuration

Create a `.env` file in the project root:

```env
TAVILY_API_KEY=your_tavily_api_key_here
```

---

## 📖 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/` | Health check |
| POST | `/chat` | Query the knowledge base |
| POST | `/ingest/audio` | Upload audio file |
| POST | `/ingest/image` | Upload image for OCR |
| POST | `/ingest/text` | Upload document (txt/md/pdf/docx) |
| POST | `/ingest/scan` | Scan knowledge folder |
| POST | `/feedback` | Submit correction |

---

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.