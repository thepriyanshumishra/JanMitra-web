"use client";

import { useState, useRef } from "react";
import { UploadCloud, Image as ImageIcon, FileText, Video, Mic, X } from "lucide-react";

interface EvidenceZoneProps {
    onUpload: (files: File[]) => void;
}

export function EvidenceZone({ onUpload }: EvidenceZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFiles(Array.from(e.target.files));
        }
    };

    const handleFiles = (newFiles: File[]) => {
        // Here we could validate file types/sizes
        const combined = [...files, ...newFiles].slice(0, 3); // Max 3 files for now
        setFiles(combined);
        onUpload(combined);
    };

    const removeFile = (index: number) => {
        const updated = files.filter((_, i) => i !== index);
        setFiles(updated);
        onUpload(updated);
    };

    const evidenceTypes = [
        { label: "Photo", icon: ImageIcon, color: "text-blue-500" },
        { label: "Video", icon: Video, color: "text-purple-500" },
        { label: "Document", icon: FileText, color: "text-amber-500" },
        { label: "Audio", icon: Mic, color: "text-green-500" },
    ];

    return (
        <div className="w-full space-y-3 animate-in fade-in slide-in-from-bottom-2 mt-2">
            <div className="flex flex-wrap gap-2 mb-2">
                <span className="text-xs text-muted-foreground mr-1 flex items-center">Types:</span>
                {evidenceTypes.map((type, i) => {
                    const Icon = type.icon;
                    return (
                        <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-secondary/50 border border-foreground/5 text-xs font-medium cursor-pointer hover:bg-secondary transition-colors" onClick={() => fileInputRef.current?.click()}>
                            <Icon className={`w-3.5 h-3.5 ${type.color}`} />
                            {type.label}
                        </div>
                    );
                })}
            </div>

            <div
                className={`w-full max-w-sm rounded-xl border-2 border-dashed transition-all duration-200 flex flex-col items-center justify-center p-6 cursor-pointer
                    ${isDragging
                        ? "border-primary bg-primary/5 scale-[1.02]"
                        : "border-foreground/15 hover:border-foreground/30 hover:bg-secondary/30"
                    }
                `}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    multiple
                    accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                    onChange={handleFileInput}
                />
                <div className="w-12 h-12 rounded-full bg-secondary/50 flex items-center justify-center mb-3">
                    <UploadCloud className={`w-6 h-6 ${isDragging ? "text-primary animate-bounce" : "text-muted-foreground"}`} />
                </div>
                <p className="text-sm font-medium text-foreground mb-1">
                    {isDragging ? "Drop files here" : "Click or drag to upload"}
                </p>
                <p className="text-xs text-muted-foreground">Max 3 files (Images, Docs, Video)</p>
            </div>

            {files.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3 max-w-sm">
                    {files.map((file, i) => (
                        <div key={i} className="relative group rounded-lg overflow-hidden border border-foreground/10 bg-secondary w-16 h-16 flex items-center justify-center shrink-0">
                            {file.type.startsWith("image/") ? (
                                /* eslint-disable-next-line @next/next/no-img-element */
                                <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                            ) : (
                                <FileText className="w-6 h-6 text-muted-foreground" />
                            )}
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(i); }}
                                className="absolute top-0 right-0 p-1 bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity rounded-bl-lg"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
