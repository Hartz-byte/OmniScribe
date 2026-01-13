import { useState, useRef, useEffect } from 'react';
import { Send, Sparkles } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ThinkingIndicator } from './ThinkingIndicator';
import { sendChatMessage } from '../../services/api';
import type { Message } from '../../types';

interface ChatWindowProps {
    onFeedbackClick: (message: Message) => void;
}

export function ChatWindow({ onFeedbackClick }: ChatWindowProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const response = await sendChatMessage(userMessage.content);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: response.answer,
                sources: response.context_used,
                timestamp: new Date(),
                query: userMessage.content,
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: 'Sorry, I encountered an error processing your request. Please make sure the backend is running.',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col h-full overflow-hidden">
            {/* Header - Fixed at top */}
            <div className="shrink-0 p-6 border-b border-border bg-bg-primary">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-accent" />
                    Chat with OmniScribe
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                    Ask questions about your ingested knowledge base
                </p>
            </div>

            {/* Messages - Scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent/20 to-accent-muted/20 flex items-center justify-center mb-4">
                            <Sparkles className="w-10 h-10 text-accent" />
                        </div>
                        <h3 className="text-lg font-semibold text-text-primary mb-2">Start a Conversation</h3>
                        <p className="text-text-secondary max-w-sm">
                            I can answer questions based on your ingested audio recordings and images.
                            Try asking me something!
                        </p>
                    </div>
                )}

                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        message={message}
                        onFeedbackClick={message.role === 'assistant' ? onFeedbackClick : undefined}
                    />
                ))}

                {isLoading && <ThinkingIndicator message="Searching memory & reasoning..." />}

                <div ref={messagesEndRef} />
            </div>

            {/* Input - Fixed at bottom */}
            <div className="shrink-0 p-4 bg-bg-primary">
                <form onSubmit={handleSubmit} className="p-5 border border-border bg-bg-secondary/80 rounded-2xl">
                    <div className="flex gap-4 items-stretch">
                        <div className="flex-1">
                            <textarea
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit(e);
                                    }
                                }}
                                placeholder="Ask me anything... (Press Enter to send, Shift+Enter for new line)"
                                rows={2}
                                className="w-full h-full px-5 py-3 rounded-xl bg-bg-tertiary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/50 transition-all resize-none text-base"
                                disabled={isLoading}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!input.trim() || isLoading}
                            className="px-8 min-w-[120px] rounded-xl bg-gradient-to-r from-accent to-accent-muted text-white font-semibold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all glow-accent text-base"
                        >
                            <Send className="w-5 h-5" />
                            Send
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

