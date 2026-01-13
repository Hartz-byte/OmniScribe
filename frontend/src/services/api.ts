const API_BASE_URL = 'http://localhost:8000';

import type { ChatResponse, IngestResponse, FeedbackResponse } from '../types';

export async function sendChatMessage(query: string): Promise<ChatResponse> {
    const formData = new FormData();
    formData.append('query', query);

    const response = await fetch(`${API_BASE_URL}/chat`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Chat request failed: ${response.statusText}`);
    }

    return response.json();
}

export async function ingestAudio(file: Blob, filename: string = 'recording.wav'): Promise<IngestResponse> {
    const formData = new FormData();
    formData.append('file', file, filename);

    const response = await fetch(`${API_BASE_URL}/ingest/audio`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Audio ingestion failed: ${response.statusText}`);
    }

    return response.json();
}

export async function ingestImage(file: File): Promise<IngestResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/ingest/image`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Image ingestion failed: ${response.statusText}`);
    }

    return response.json();
}

export async function submitFeedback(originalQuery: string, correctAnswer: string): Promise<FeedbackResponse> {
    const formData = new FormData();
    formData.append('original_query', originalQuery);
    formData.append('correct_answer', correctAnswer);

    const response = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Feedback submission failed: ${response.statusText}`);
    }

    return response.json();
}

export async function healthCheck(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE_URL}/`);
        return response.ok;
    } catch {
        return false;
    }
}
