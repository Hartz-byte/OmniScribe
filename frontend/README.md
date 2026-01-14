# 🎨 OmniScribe Frontend

Modern React frontend with a sleek dark theme for interacting with the OmniScribe AI assistant.

---

## ✨ Features

- 💬 **Chat Interface** - Real-time conversation with AI
- 📤 **Multi-Modal Ingestion** - Upload audio, images, and documents
- 🎤 **Audio Recording** - Built-in microphone recording
- 📂 **Folder Scanning** - One-click document import
- 📝 **Feedback System** - Correct AI responses for learning
- 🌙 **Dark Theme** - Premium glassmorphism design

---

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Tailwind CSS | Styling |
| Vite | Build Tool |
| Lucide React | Icons |
| React Dropzone | File Upload |

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── chat/
│   │   │   ├── ChatWindow.tsx       # Main chat interface
│   │   │   ├── MessageBubble.tsx    # Message display
│   │   │   ├── SourcesAccordion.tsx # Source citations
│   │   │   └── ThinkingIndicator.tsx
│   │   ├── ingestion/
│   │   │   ├── IngestionDashboard.tsx  # Upload dashboard
│   │   │   ├── AudioRecorder.tsx       # Mic recording
│   │   │   ├── FileDropzone.tsx        # Drag & drop
│   │   │   └── ProcessingLogs.tsx      # Status logs
│   │   ├── feedback/
│   │   │   └── FeedbackModal.tsx    # Correction modal
│   │   └── layout/
│   │       └── Sidebar.tsx          # Navigation
│   ├── services/
│   │   └── api.ts                   # API client
│   ├── hooks/
│   │   └── useAudioRecorder.ts      # Audio hook
│   ├── types/
│   │   └── index.ts                 # TypeScript types
│   ├── App.tsx                      # Main app
│   ├── main.tsx                     # Entry point
│   └── index.css                    # Global styles
├── package.json
├── vite.config.ts
├── tailwind.config.js
└── tsconfig.json
```

---

## 🚀 Setup

### Prerequisites
- Node.js 20+
- npm or yarn

### Installation

```bash
cd frontend
npm install
```

### Development

```bash
npm run dev
```

Opens at: **http://localhost:5173**

### Production Build

```bash
npm run build
```

Output in `dist/` folder.

---

## 🎨 Design System

### Color Palette

| Token | Color | Usage |
|-------|-------|-------|
| `--bg-primary` | `#0a0a0f` | Main background |
| `--bg-secondary` | `#12121a` | Cards/panels |
| `--accent` | `#7c3aed` | Primary accent (purple) |
| `--success` | `#22c55e` | Success states |
| `--error` | `#ef4444` | Error states |

### Components

- **Glassmorphism** - `backdrop-blur` with subtle borders
- **Micro-animations** - Smooth transitions on interactions
- **Responsive** - Works on desktop and tablet

---

## 🔌 API Integration

The frontend communicates with the backend via REST API:

```typescript
// services/api.ts

sendChatMessage(query: string)      // POST /chat
ingestAudio(file: Blob)             // POST /ingest/audio
ingestImage(file: File)             // POST /ingest/image
ingestText(file: File)              // POST /ingest/text
scanKnowledgeFolder()               // POST /ingest/scan
submitFeedback(query, answer)       // POST /feedback
healthCheck()                       // GET /
```

---

## 🐳 Docker

The frontend is served via Nginx in Docker:

```nginx
# Serves static files from /usr/share/nginx/html
# Proxies /api/* to backend:8000
```

Access at: **http://localhost** (port 80)

---

## 📝 Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm run lint` | Run ESLint |
