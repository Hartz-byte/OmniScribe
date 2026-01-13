import { useState } from 'react';
import { X, Send, AlertTriangle } from 'lucide-react';
import { submitFeedback } from '../../services/api';
import type { Message } from '../../types';

interface FeedbackModalProps {
    message: Message;
    onClose: () => void;
    onSuccess: () => void;
}

export function FeedbackModal({ message, onClose, onSuccess }: FeedbackModalProps) {
    const [correction, setCorrection] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!correction.trim() || !message.query) return;

        setIsSubmitting(true);
        setError(null);

        try {
            await submitFeedback(message.query, correction.trim());
            onSuccess();
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to submit feedback');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-bg-secondary rounded-2xl border border-border shadow-2xl animate-slide-up">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-border">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
                            <AlertTriangle className="w-5 h-5 text-warning" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-text-primary">Correct This Response</h3>
                            <p className="text-sm text-text-secondary">Help me learn from your feedback</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Original Query */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Original Question
                        </label>
                        <div className="p-3 bg-bg-primary rounded-xl border border-border text-text-primary">
                            {message.query || 'No query available'}
                        </div>
                    </div>

                    {/* AI Response */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            My Response (Incorrect)
                        </label>
                        <div className="p-3 bg-error/10 rounded-xl border border-error/30 text-text-primary max-h-32 overflow-y-auto">
                            {message.content}
                        </div>
                    </div>

                    {/* Correction Input */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            Correct Answer
                        </label>
                        <textarea
                            value={correction}
                            onChange={(e) => setCorrection(e.target.value)}
                            placeholder="Provide the correct answer here..."
                            rows={4}
                            className="w-full px-4 py-3 rounded-xl bg-bg-tertiary border border-border text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none transition-all"
                            required
                        />
                    </div>

                    {/* Error */}
                    {error && (
                        <p className="text-sm text-error">{error}</p>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-3 rounded-xl border border-border text-text-secondary hover:text-text-primary hover:bg-bg-tertiary transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!correction.trim() || isSubmitting}
                            className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-muted text-white font-medium flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                        >
                            <Send className="w-4 h-4" />
                            {isSubmitting ? 'Submitting...' : 'Submit Correction'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
