import { ChevronDown, Globe, Database } from 'lucide-react';
import { useState } from 'react';

interface SourcesAccordionProps {
    sources: string[];
}

export function SourcesAccordion({ sources }: SourcesAccordionProps) {
    const [isOpen, setIsOpen] = useState(false);

    if (!sources || sources.length === 0) {
        return null;
    }

    // Parse source to determine type and clean content
    const parseSource = (source: string) => {
        if (source.includes('[WEB SEARCH RESULT]')) {
            return {
                type: 'web' as const,
                label: 'Web Search',
                content: source.replace('[WEB SEARCH RESULT]:', '').replace('[WEB SEARCH RESULT]', '').trim()
            };
        } else if (source.includes('[LOCAL MEMORY]')) {
            return {
                type: 'local' as const,
                label: 'Local Memory',
                content: source.replace('[LOCAL MEMORY]:', '').replace('[LOCAL MEMORY]', '').trim()
            };
        }
        return {
            type: 'local' as const,
            label: 'Source',
            content: source
        };
    };

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
                    {sources.map((source, index) => {
                        const parsed = parseSource(source);
                        const isWeb = parsed.type === 'web';

                        return (
                            <div
                                key={index}
                                className="p-3 bg-bg-primary rounded-lg border border-border"
                            >
                                {/* Source Type Badge */}
                                <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium mb-2 ${isWeb
                                        ? 'bg-accent/20 text-accent-glow'
                                        : 'bg-success/20 text-success'
                                    }`}>
                                    {isWeb ? <Globe className="w-3 h-3" /> : <Database className="w-3 h-3" />}
                                    {parsed.label}
                                </div>

                                {/* Source Content */}
                                <p className="text-sm text-text-secondary line-clamp-3">
                                    {parsed.content}
                                </p>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

