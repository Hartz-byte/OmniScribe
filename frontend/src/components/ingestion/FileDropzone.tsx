import { useCallback } from 'react';
import { useDropzone, type Accept } from 'react-dropzone';
import { Upload, FileAudio, FileImage, FileText } from 'lucide-react';

interface FileDropzoneProps {
    onFileDrop: (files: File[]) => void;
    acceptedFileTypes: 'audio' | 'image' | 'text';
}

export function FileDropzone({ onFileDrop, acceptedFileTypes }: FileDropzoneProps) {
    const getAccept = (): Accept => {
        switch (acceptedFileTypes) {
            case 'audio':
                return { 'audio/*': ['.mp3', '.wav'] };
            case 'image':
                return { 'image/*': ['.png', '.jpg', '.jpeg'] };
            case 'text':
                return {
                    'text/*': ['.txt', '.md'],
                    'application/pdf': ['.pdf'],
                    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
                };
        }
    };

    const accept = getAccept();

    const onDrop = useCallback((acceptedFiles: File[]) => {
        onFileDrop(acceptedFiles);
    }, [onFileDrop]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept,
        multiple: true,
    });

    const getIcon = () => {
        switch (acceptedFileTypes) {
            case 'audio':
                return FileAudio;
            case 'image':
                return FileImage;
            case 'text':
                return FileText;
        }
    };

    const Icon = getIcon();

    const getExtensions = () => {
        switch (acceptedFileTypes) {
            case 'audio':
                return '.mp3, .wav';
            case 'image':
                return '.png, .jpg';
            case 'text':
                return '.txt, .md, .pdf, .docx';
        }
    };

    return (
        <div
            {...getRootProps()}
            className={`relative p-8 border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer ${isDragActive
                ? 'border-accent bg-accent/10'
                : 'border-border hover:border-accent/50 hover:bg-bg-tertiary'
                }`}
        >
            <input {...getInputProps()} />

            <div className="flex flex-col items-center text-center">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 ${isDragActive ? 'bg-accent/20' : 'bg-bg-tertiary'
                    }`}>
                    {isDragActive ? (
                        <Upload className="w-8 h-8 text-accent animate-bounce" />
                    ) : (
                        <Icon className="w-8 h-8 text-text-muted" />
                    )}
                </div>

                <p className="text-text-primary font-medium mb-1">
                    {isDragActive ? 'Drop files here' : `Drag & drop ${acceptedFileTypes} files`}
                </p>
                <p className="text-text-muted text-sm">
                    or click to browse • {getExtensions()}
                </p>
            </div>
        </div>
    );
}

