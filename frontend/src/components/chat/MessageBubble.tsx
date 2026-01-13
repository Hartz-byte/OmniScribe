import { User, Bot, ThumbsDown, Pencil } from 'lucide-react';
import { SourcesAccordion } from './SourcesAccordion';
import type { Message } from '../../types';

interface MessageBubbleProps {
    message: Message;
    onFeedbackClick?: (message: Message) => void;
}

export function MessageBubble({ message, onFeedbackClick }: MessageBubbleProps) {
    const isUser = message.role === 'user';

    return (
        <div className={`flex items-start gap-4 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isUser
                    ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
                    : 'bg-gradient-to-br from-accent to-accent-muted'
                }`}>
                {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>

            {/* Message Content */}
            <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
                <div className={`inline-block p-4 rounded-2xl ${isUser
                        ? 'bg-gradient-to-br from-emerald-500/20 to-teal-600/20 border border-emerald-500/30'
                        : 'bg-bg-tertiary border border-border'
                    }`}>
                    <p className="text-text-primary whitespace-pre-wrap">{message.content}</p>

                    {/* Sources for AI messages */}
                    {!isUser && message.sources && (
                        <SourcesAccordion sources={message.sources} />
                    )}
                </div>

                {/* Feedback buttons for AI messages */}
                {!isUser && onFeedbackClick && (
                    <div className="mt-2 flex gap-2">
                        <button
                            onClick={() => onFeedbackClick(message)}
                            className="p-2 rounded-lg text-text-muted hover:text-error hover:bg-error/10 transition-colors"
                            title="Report incorrect response"
                        >
                            <ThumbsDown className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onFeedbackClick(message)}
                            className="p-2 rounded-lg text-text-muted hover:text-accent-glow hover:bg-accent/10 transition-colors"
                            title="Edit response"
                        >
                            <Pencil className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {/* Timestamp */}
                <p className={`mt-1 text-xs text-text-muted ${isUser ? 'text-right' : ''}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        </div>
    );
}
