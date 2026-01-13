interface ThinkingIndicatorProps {
    message?: string;
}

export function ThinkingIndicator({ message = 'Thinking...' }: ThinkingIndicatorProps) {
    return (
        <div className="flex items-start gap-4 animate-slide-up">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent to-accent-muted flex items-center justify-center shrink-0">
                <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse-glow" style={{ animationDelay: '300ms' }} />
                </div>
            </div>
            <div className="flex-1 py-2">
                <p className="text-text-secondary italic">{message}</p>
            </div>
        </div>
    );
}
