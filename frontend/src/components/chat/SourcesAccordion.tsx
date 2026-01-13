import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface SourcesAccordionProps {
    sources: string[];
}

export function SourcesAccordion({ sources }: SourcesAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!sources || sources.length === 0) {
        return null;
    }

    return (
        <div className="mt-3 border-t border-border pt-3">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
            >
                <ChevronDown
                    className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                />
                <span>View Sources ({sources.length})</span>
            </button>

            {isOpen && (
                <div className="mt-3 space-y-2 animate-slide-up">
                    {sources.map((source, index) => (
                        <div
                            key={index}
                            className="p-3 bg-bg-primary rounded-lg border border-border text-sm text-text-secondary"
                        >
                            <p className="line-clamp-3">{source}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
