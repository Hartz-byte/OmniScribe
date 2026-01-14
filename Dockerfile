# ===================================
# OmniScribe Multi-Stage Dockerfile
# Backend: Python + CUDA
# Frontend: Node Build -> Nginx
# ===================================

# ====================
# Stage 1: Frontend Build
# ====================
FROM node:20-alpine AS frontend-builder

WORKDIR /app/frontend

# Copy package files
COPY frontend/package*.json ./

# Install dependencies
RUN npm ci

# Copy frontend source
COPY frontend/ ./

# Build production bundle
RUN npm run build

# ====================
# Stage 2: Backend Runtime
# ====================
FROM nvidia/cuda:12.1.0-runtime-ubuntu22.04 AS backend

# Prevent interactive prompts
ENV DEBIAN_FRONTEND=noninteractive

# Remove problematic NVIDIA apt repo (CUDA runtime already included in base image)
# Then install system dependencies from Ubuntu repos only
RUN rm -f /etc/apt/sources.list.d/cuda*.list && \
    apt-get update && apt-get install -y --no-install-recommends \
    python3.11 \
    python3.11-venv \
    python3-pip \
    libsndfile1 \
    ffmpeg \
    libgl1-mesa-glx \
    libglib2.0-0 \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Set Python 3.11 as default
RUN update-alternatives --install /usr/bin/python python /usr/bin/python3.11 1 \
    && update-alternatives --install /usr/bin/python3 python3 /usr/bin/python3.11 1

WORKDIR /app

# Install PyTorch with CUDA first
RUN pip3 install --no-cache-dir torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121

# Copy and install requirements
COPY docker/requirements.txt ./requirements.txt
RUN pip3 install --no-cache-dir -r requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Create directories for volumes
RUN mkdir -p /app/models /app/knowledge /app/backend/chroma_db

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONPATH=/app/backend
ENV NVIDIA_VISIBLE_DEVICES=all
ENV NVIDIA_DRIVER_CAPABILITIES=compute,utility

# Set working directory to backend for proper imports
WORKDIR /app/backend

# Expose port
EXPOSE 8000

# Default command (run from backend directory)
CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]

# ====================
# Stage 3: Frontend Serve (Nginx)
# ====================
FROM nginx:alpine AS frontend

# Copy custom nginx config
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf

# Copy built frontend from builder stage
COPY --from=frontend-builder /app/frontend/dist /usr/share/nginx/html

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
