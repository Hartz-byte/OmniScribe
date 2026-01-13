import { Mic, Square, Upload, AlertCircle } from 'lucide-react';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { ingestAudio } from '../../services/api';
import { useState } from 'react';

interface AudioRecorderProps {
    onLogUpdate: (log: { type: 'audio'; filename: string; status: 'processing' | 'success' | 'error'; message: string }) => void;
}

export function AudioRecorder({ onLogUpdate }: AudioRecorderProps) {
    const { isRecording, audioBlob, startRecording, stopRecording, clearRecording, error } = useAudioRecorder();
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async () => {
        if (!audioBlob) return;

        setIsUploading(true);
        const filename = `recording_${Date.now()}.wav`;

        onLogUpdate({
            type: 'audio',
            filename,
            status: 'processing',
            message: 'Transcribing audio...'
        });

        try {
            const response = await ingestAudio(audioBlob, filename);
            onLogUpdate({
                type: 'audio',
                filename,
                status: 'success',
                message: response.text_snippet || 'Audio transcribed successfully!'
            });
            clearRecording();
        } catch (err) {
            onLogUpdate({
                type: 'audio',
                filename,
                status: 'error',
                message: err instanceof Error ? err.message : 'Failed to transcribe audio'
            });
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="p-6 bg-bg-tertiary rounded-2xl border border-border">
            <h3 className="text-lg font-semibold text-text-primary mb-4 flex items-center gap-2">
                <Mic className="w-5 h-5 text-accent" />
                Voice Recording
            </h3>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-error/10 border border-error/30 flex items-center gap-2 text-error">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <p className="text-sm">{error}</p>
                </div>
            )}

            <div className="flex flex-col items-center gap-4">
                {/* Recording Button */}
                <button
                    onClick={isRecording ? stopRecording : startRecording}
                    disabled={isUploading}
                    className={`w-24 h-24 rounded-full flex items-center justify-center transition-all duration-300 ${isRecording
                            ? 'bg-error animate-pulse-glow shadow-[0_0_30px_rgba(239,68,68,0.5)]'
                            : 'bg-gradient-to-br from-accent to-accent-muted hover:scale-105 glow-accent'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {isRecording ? (
                        <Square className="w-8 h-8 text-white" />
                    ) : (
                        <Mic className="w-10 h-10 text-white" />
                    )}
                </button>

                <p className="text-text-secondary text-sm">
                    {isRecording ? 'Recording... Click to stop' : 'Click to start recording'}
                </p>

                {/* Upload button appears after recording */}
                {audioBlob && !isRecording && (
                    <div className="flex gap-3 animate-slide-up">
                        <button
                            onClick={clearRecording}
                            className="px-4 py-2 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-bg-elevated transition-colors"
                        >
                            Discard
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading}
                            className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent to-accent-muted text-white font-medium flex items-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
                        >
                            <Upload className="w-4 h-4" />
                            {isUploading ? 'Uploading...' : 'Upload Recording'}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
