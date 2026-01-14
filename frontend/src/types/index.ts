// API Types
export interface ChatResponse {
    answer: string;
    context_used: string[];
}

export interface IngestResponse {
    status: string;
    text_snippet?: string;
    extracted_text?: string;
}

export interface FeedbackResponse {
    status: string;
    message: string;
}

// Component Types
export interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    sources?: string[];
    timestamp: Date;
    query?: string; // Original query for feedback
}

export interface ProcessingLog {
    id: string;
    type: 'audio' | 'image' | 'text';
    filename: string;
    status: 'processing' | 'success' | 'error';
    message: string;
    timestamp: Date;
}
