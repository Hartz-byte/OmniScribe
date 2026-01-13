import { CheckCircle, XCircle, Loader2, FileAudio, FileImage } from 'lucide-react';
import type { ProcessingLog } from '../../types';

interface ProcessingLogsProps {
    logs: ProcessingLog[];
}

export function ProcessingLogs({ logs }: ProcessingLogsProps) {
    if (logs.length === 0) {
        return null;
    }

    return (
        <div className="p-4 bg-bg-tertiary rounded-xl border border-border">
            <h4 className="text-sm font-medium text-text-secondary mb-3">Processing Status</h4>

            <div className="space-y-2 max-h-48 overflow-y-auto">
                {logs.map((log) => {
                    const Icon = log.type === 'audio' ? FileAudio : FileImage;

                    return (
                        <div
                            key={log.id}
                            className="flex items-start gap-3 p-3 rounded-lg bg-bg-primary animate-fade-in"
                        >
                            <Icon className="w-4 h-4 text-text-muted shrink-0 mt-0.5" />

                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-text-primary truncate">
                                    {log.filename}
                                </p>
                                <p className="text-xs text-text-secondary truncate">
                                    {log.message}
                                </p>
                            </div>

                            <div className="shrink-0">
                                {log.status === 'processing' && (
                                    <Loader2 className="w-4 h-4 text-accent animate-spin" />
                                )}
                                {log.status === 'success' && (
                                    <CheckCircle className="w-4 h-4 text-success" />
                                )}
                                {log.status === 'error' && (
                                    <XCircle className="w-4 h-4 text-error" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
