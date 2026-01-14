import { useState } from 'react';
import { Upload, Mic, Image, FileText, FolderSearch } from 'lucide-react';
import { AudioRecorder } from './AudioRecorder';
import { FileDropzone } from './FileDropzone';
import { ProcessingLogs } from './ProcessingLogs';
import { ingestAudio, ingestImage, ingestText, scanKnowledgeFolder } from '../../services/api';
import type { ProcessingLog } from '../../types';

type TabType = 'audio' | 'image' | 'documents';

export function IngestionDashboard() {
    const [activeTab, setActiveTab] = useState<TabType>('audio');
    const [logs, setLogs] = useState<ProcessingLog[]>([]);
    const [isScanning, setIsScanning] = useState(false);

    const addLog = (log: Omit<ProcessingLog, 'id' | 'timestamp'>) => {
        const newLog: ProcessingLog = {
            ...log,
            id: Date.now().toString(),
            timestamp: new Date(),
        };
        setLogs(prev => [newLog, ...prev].slice(0, 20)); // Keep last 20 logs
    };

    const updateLog = (filename: string, updates: Partial<ProcessingLog>) => {
        setLogs(prev => prev.map(log =>
            log.filename === filename ? { ...log, ...updates } : log
        ));
    };

    const handleAudioFiles = async (files: File[]) => {
        for (const file of files) {
            addLog({
                type: 'audio',
                filename: file.name,
                status: 'processing',
                message: 'Transcribing audio...'
            });

            try {
                const response = await ingestAudio(file, file.name);
                updateLog(file.name, {
                    status: 'success',
                    message: response.text_snippet || 'Transcription complete!'
                });
            } catch (err) {
                updateLog(file.name, {
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Transcription failed'
                });
            }
        }
    };

    const handleImageFiles = async (files: File[]) => {
        for (const file of files) {
            addLog({
                type: 'image',
                filename: file.name,
                status: 'processing',
                message: 'Extracting text from image...'
            });

            try {
                const response = await ingestImage(file);
                updateLog(file.name, {
                    status: 'success',
                    message: response.extracted_text || 'Text extraction complete!'
                });
            } catch (err) {
                updateLog(file.name, {
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Text extraction failed'
                });
            }
        }
    };

    const handleTextFiles = async (files: File[]) => {
        for (const file of files) {
            addLog({
                type: 'text',
                filename: file.name,
                status: 'processing',
                message: 'Ingesting text document...'
            });

            try {
                const response = await ingestText(file);
                updateLog(file.name, {
                    status: 'success',
                    message: `${response.chunks_created} chunk(s) created: ${response.text_snippet}`
                });
            } catch (err) {
                updateLog(file.name, {
                    status: 'error',
                    message: err instanceof Error ? err.message : 'Text ingestion failed'
                });
            }
        }
    };

    const handleFolderScan = async () => {
        setIsScanning(true);
        addLog({
            type: 'text',
            filename: 'Knowledge Folder',
            status: 'processing',
            message: 'Scanning knowledge folder...'
        });

        try {
            const response = await scanKnowledgeFolder();
            updateLog('Knowledge Folder', {
                status: response.files_processed > 0 ? 'success' : 'error',
                message: response.message || `Processed ${response.files_processed} file(s): ${response.files?.join(', ') || 'none'}`
            });
        } catch (err) {
            updateLog('Knowledge Folder', {
                status: 'error',
                message: err instanceof Error ? err.message : 'Folder scan failed'
            });
        } finally {
            setIsScanning(false);
        }
    };

    const tabs: { id: TabType; label: string; icon: typeof Mic }[] = [
        { id: 'audio', label: 'Audio', icon: Mic },
        { id: 'image', label: 'Images', icon: Image },
        { id: 'documents', label: 'Documents', icon: FileText },
    ];

    return (
        <div className="flex flex-col h-full">
            {/* Header */}
            <div className="p-6 border-b border-border">
                <h2 className="text-xl font-bold text-text-primary flex items-center gap-2">
                    <Upload className="w-5 h-5 text-accent" />
                    Ingestion Dashboard
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                    Upload audio, images, and documents to build your knowledge base
                </p>
            </div>

            {/* Tabs */}
            <div className="px-6 pt-6">
                <div className="flex gap-2 p-1 bg-bg-secondary rounded-xl">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-bg-tertiary text-text-primary'
                                    : 'text-text-secondary hover:text-text-primary'
                                    }`}
                            >
                                <Icon className="w-4 h-4" />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 overflow-y-auto">
                <div className="grid gap-6">
                    {activeTab === 'audio' && (
                        <>
                            <AudioRecorder
                                onLogUpdate={(log) => {
                                    if (log.status === 'processing') {
                                        addLog(log);
                                    } else {
                                        updateLog(log.filename, log);
                                    }
                                }}
                            />
                            <FileDropzone
                                acceptedFileTypes="audio"
                                onFileDrop={handleAudioFiles}
                            />
                        </>
                    )}

                    {activeTab === 'image' && (
                        <FileDropzone
                            acceptedFileTypes="image"
                            onFileDrop={handleImageFiles}
                        />
                    )}

                    {activeTab === 'documents' && (
                        <>
                            <FileDropzone
                                acceptedFileTypes="text"
                                onFileDrop={handleTextFiles}
                            />

                            {/* Folder Scan Section */}
                            <div className="p-6 bg-bg-secondary rounded-2xl border border-border">
                                <div className="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 className="text-lg font-semibold text-text-primary flex items-center gap-2">
                                            <FolderSearch className="w-5 h-5 text-accent" />
                                            Scan Knowledge Folder
                                        </h3>
                                        <p className="text-sm text-text-secondary mt-1">
                                            Automatically ingest all .txt and .md files from the knowledge folder
                                        </p>
                                        <p className="text-xs text-text-muted mt-2 font-mono">
                                            D:\AIML-Projects\OmniScribe\knowledge
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleFolderScan}
                                        disabled={isScanning}
                                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-accent to-accent-muted text-white font-semibold flex items-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all glow-accent shrink-0"
                                    >
                                        <FolderSearch className={`w-5 h-5 ${isScanning ? 'animate-pulse' : ''}`} />
                                        {isScanning ? 'Scanning...' : 'Scan Folder'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}

                    {/* Processing Logs */}
                    <ProcessingLogs logs={logs} />
                </div>
            </div>
        </div>
    );
}

