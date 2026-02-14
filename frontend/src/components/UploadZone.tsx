import React, { useCallback, useState } from 'react';
import { UploadCloud, File, X, FileText, Table, Sparkles, Image as ImageIcon } from 'lucide-react';

interface UploadZoneProps {
    onFilesSelected: (files: File[]) => void;
}

export function UploadZone({ onFilesSelected }: UploadZoneProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [files, setFiles] = useState<File[]>([]);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const droppedFiles = Array.from(e.dataTransfer.files);
        setFiles(prev => [...prev, ...droppedFiles]);
        onFilesSelected(droppedFiles);
    }, [onFilesSelected]);

    const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files);
            setFiles(prev => [...prev, ...selectedFiles]);
            onFilesSelected(selectedFiles);
        }
    }, [onFilesSelected]);

    const removeFile = (index: number) => {
        setFiles(prev => {
            const newFiles = [...prev];
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const getFileIcon = (fileName: string) => {
        const ext = fileName.split('.').pop()?.toLowerCase();
        if (['xlsx', 'xls', 'csv'].includes(ext || '')) return <Table style={{ width: '1.25rem', height: '1.25rem', color: '#4ade80' }} />;
        if (['doc', 'docx'].includes(ext || '')) return <FileText style={{ width: '1.25rem', height: '1.25rem', color: '#60a5fa' }} />;
        if (['png', 'jpg', 'jpeg'].includes(ext || '')) return <ImageIcon style={{ width: '1.25rem', height: '1.25rem', color: '#a78bfa' }} />;
        return <File style={{ width: '1.25rem', height: '1.25rem', color: '#94a3b8' }} />;
    }

    return (
        <div style={{ width: '100%' }}>
            <div
                style={{
                    position: 'relative',
                    borderRadius: '1.5rem',
                    padding: '3rem',
                    cursor: 'pointer',
                    transition: 'all 0.5s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    textAlign: 'center',
                    background: isDragging ? 'rgba(37, 99, 235, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                    border: isDragging ? '2px dashed var(--primary)' : '1px solid rgba(255, 255, 255, 0.05)'
                }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => document.getElementById('file-input')?.click()}
                onMouseEnter={(e) => {
                    if (!isDragging) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                    }
                }}
                onMouseLeave={(e) => {
                    if (!isDragging) {
                        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.02)';
                        e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                    }
                }}
            >
                {/* Background Grid Pattern */}
                <div style={{
                    position: 'absolute',
                    inset: 0,
                    opacity: 0.03,
                    pointerEvents: 'none',
                    backgroundImage: 'radial-gradient(rgba(255, 255, 255, 0.3) 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }} />

                <input
                    type="file"
                    id="file-input"
                    style={{ display: 'none' }}
                    multiple
                    onChange={handleFileInput}
                    accept=".xlsx,.xls,.csv,.doc,.docx,.png,.jpg,.jpeg"
                />

                <div style={{ position: 'relative', zIndex: 10, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem' }}>
                    <div style={{
                        background: 'var(--bg-deep)',
                        padding: '1.5rem',
                        borderRadius: '1.5rem',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        transition: 'transform 0.5s'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.1)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                        }}>
                        <UploadCloud style={{
                            width: '3rem',
                            height: '3rem',
                            color: isDragging ? 'var(--primary)' : '#64748b',
                            transition: 'color 0.3s'
                        }} />
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        <h3 style={{
                            fontFamily: 'var(--font-heading)',
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            letterSpacing: '-0.02em',
                            color: 'white',
                            margin: 0
                        }}>
                            {isDragging ? 'Drop Intelligence Here' : 'Import Project Data'}
                        </h3>
                        <p style={{
                            color: 'var(--text-muted)',
                            fontWeight: '500',
                            fontSize: '0.875rem',
                            maxWidth: '240px',
                            margin: '0 auto',
                            lineHeight: '1.5'
                        }}>
                            Drop <span style={{ color: '#60a5fa' }}>Excel</span>, <span style={{ color: '#4ade80' }}>CSV</span>, or <span style={{ color: '#a78bfa' }}>Screenshots</span> to begin synthesis.
                        </p>
                    </div>

                    <div style={{
                        display: 'flex',
                        gap: '0.5rem',
                        alignItems: 'center',
                        padding: '0.5rem 1rem',
                        borderRadius: '9999px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                        fontSize: '0.625rem',
                        fontWeight: 'bold',
                        textTransform: 'uppercase',
                        letterSpacing: '0.1em',
                        color: 'var(--text-dim)',
                        transition: 'color 0.3s'
                    }}>
                        <Sparkles style={{ width: '0.75rem', height: '0.75rem', color: 'var(--accent)' }} />
                        AI Analysis Ready
                    </div>
                </div>
            </div>

            {files.length > 0 && (
                <div style={{
                    marginTop: '2rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.75rem',
                    maxHeight: '240px',
                    overflowY: 'auto',
                    paddingRight: '0.5rem'
                }}>
                    {files.map((file, idx) => (
                        <div
                            key={`${file.name}-${idx}`}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '1rem',
                                background: 'rgba(15, 23, 42, 0.7)',
                                backdropFilter: 'blur(12px)',
                                borderRadius: '1rem',
                                border: '1px solid rgba(255, 255, 255, 0.05)',
                                transition: 'all 0.3s',
                                opacity: 0,
                                animation: `slideIn 0.6s cubic-bezier(0.22, 1, 0.36, 1) ${idx * 0.1}s forwards`
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
                            }}
                        >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <div style={{
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    padding: '0.5rem',
                                    borderRadius: '0.75rem',
                                    border: '1px solid rgba(255, 255, 255, 0.05)',
                                    boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.1)'
                                }}>
                                    {getFileIcon(file.name)}
                                </div>
                                <div style={{ textAlign: 'left', overflow: 'hidden' }}>
                                    <p style={{
                                        fontSize: '0.875rem',
                                        fontWeight: 'bold',
                                        margin: '0 0 0.25rem 0',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                        whiteSpace: 'nowrap',
                                        maxWidth: '180px'
                                    }}>{file.name}</p>
                                    <p style={{
                                        fontSize: '0.625rem',
                                        fontWeight: '500',
                                        color: 'var(--text-dim)',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        margin: 0
                                    }}>{(file.size / 1024).toFixed(1)} KB &bull; Ready</p>
                                </div>
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                style={{
                                    padding: '0.5rem',
                                    background: 'transparent',
                                    border: 'none',
                                    borderRadius: '0.75rem',
                                    cursor: 'pointer',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = 'transparent';
                                }}
                            >
                                <X style={{ width: '1rem', height: '1rem', color: 'var(--text-dim)', transition: 'color 0.2s' }}
                                    onMouseEnter={(e) => { e.currentTarget.style.color = '#ef4444'; }}
                                    onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-dim)'; }}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <style>{`
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
