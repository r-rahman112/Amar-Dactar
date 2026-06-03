import React, { useState, useRef, useCallback } from 'react';
import { 
  Upload, FileText, Image as ImageIcon, Video, X, 
  CheckCircle2, Download, Eye, Edit2, 
  Trash2, ArrowLeft, ChevronDown, Check, Loader2, Play
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';

export type FileCategory = 
  | 'Uncategorized'
  | 'Blood Test'
  | 'Prescription'
  | 'X-Ray'
  | 'MRI'
  | 'CT Scan'
  | 'Ultrasound'
  | 'Symptom Photo'
  | 'Symptom Video';

export interface UploadedFile {
  id: string;
  file?: File;
  name: string;
  size: number;
  type: string; // 'pdf' | 'image' | 'video' | 'other'
  category: FileCategory;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
  url: string;
  date: string;
}

interface MedicalReportUploadProps {
  onBack: () => void;
}

const CATEGORIES: FileCategory[] = [
  'Blood Test',
  'Prescription',
  'X-Ray',
  'MRI',
  'CT Scan',
  'Ultrasound',
  'Symptom Photo',
  'Symptom Video'
];

export default function MedicalReportUpload({ onBack }: MedicalReportUploadProps) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');
  const [previewFile, setPreviewFile] = useState<UploadedFile | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const getFileType = (file: File) => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type.startsWith('video/')) return 'video';
    if (file.type === 'application/pdf') return 'pdf';
    return 'other';
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(f => 
      f.type.startsWith('image/') || 
      f.type.startsWith('video/') || 
      f.type === 'application/pdf'
    );

    const uploads = validFiles.map(file => {
      const id = Math.random().toString(36).substring(7);
      const newUpload: UploadedFile = {
        id,
        file,
        name: file.name,
        size: file.size,
        type: getFileType(file),
        category: 'Uncategorized',
        progress: 0,
        status: 'uploading',
        url: URL.createObjectURL(file), // Generate local preview URL
        date: new Date().toLocaleDateString()
      };
      
      simulateUpload(id);
      return newUpload;
    });

    setFiles(prev => [...uploads, ...prev]);
  };

  const simulateUpload = (id: string) => {
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.floor(Math.random() * 15) + 5;
      if (progress >= 100) {
        progress = 100;
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress, status: 'completed' } : f));
        clearInterval(interval);
      } else {
        setFiles(prev => prev.map(f => f.id === id ? { ...f, progress } : f));
      }
    }, 200);
  };

  const removeFile = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFiles(prev => {
      const fileToRem = prev.find(f => f.id === id);
      if (fileToRem && fileToRem.url) URL.revokeObjectURL(fileToRem.url);
      return prev.filter(f => f.id !== id);
    });
  };

  const downloadFile = (file: UploadedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = file.url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const startRename = (file: UploadedFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.id);
    setEditingName(file.name);
  };

  const saveRename = (id: string) => {
    if (editingName.trim()) {
      setFiles(prev => prev.map(f => f.id === id ? { ...f, name: editingName.trim() } : f));
    }
    setEditingFileId(null);
  };

  const changeCategory = (id: string, category: FileCategory) => {
    setFiles(prev => prev.map(f => f.id === id ? { ...f, category } : f));
  };

  const viewFile = (file: UploadedFile) => {
    if (file.status === 'completed') {
      setPreviewFile(file);
    }
  };

  const FileIcon = ({ type, className = "h-6 w-6" }: { type: string, className?: string }) => {
    if (type === 'image') return <ImageIcon className={className} />;
    if (type === 'video') return <Video className={className} />;
    return <FileText className={className} />;
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col items-center py-6 px-4 sm:px-6 lg:px-8 w-full">
      <div className="w-full max-w-3xl space-y-6">
        
        {/* Header */}
        <div className="flex items-center space-x-4 mb-8">
          <button
            onClick={onBack}
            className="p-2 hover:bg-slate-150 rounded-full text-slate-500 hover:text-slate-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">{t('Upload Medical Records')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('Securely add PDFs, images, or videos to your profile.')}</p>
          </div>
        </div>

        {/* Upload Dropzone */}
        <div 
          className={`relative border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center transition-all duration-200 cursor-pointer ${
            isDragging 
              ? 'border-blue-500 bg-blue-50/50 scale-[1.01]' 
              : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileInput} 
            className="hidden" 
            multiple
            accept="image/*,video/*,application/pdf"
          />
          <div className="mx-auto w-16 h-16 mb-4 bg-slate-100 text-blue-600 rounded-full flex items-center justify-center">
            <Upload className={`h-8 w-8 ${isDragging ? 'animate-bounce' : ''}`} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-2">{t('Tap to upload or drag & drop')}</h3>
          <p className="text-sm text-slate-500 max-w-xs mx-auto">
            {t('Supported formats: PDF, JPEG, PNG, MP4.')}
          </p>
        </div>

        {/* Uploaded Files List */}
        {files.length > 0 && (
          <div className="space-y-4 pt-4">
            <h4 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">{t('Your Files')}</h4>
            
            <div className="space-y-3">
              <AnimatePresence>
                {files.map(file => (
                  <motion.div
                    key={file.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row gap-4 sm:items-center justify-between shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
                    onClick={() => viewFile(file)}
                  >
                    
                    {/* File Icon & Info */}
                    <div className="flex items-center gap-4 flex-1 MIN-W-0">
                      <div className="relative shrink-0 h-14 w-14 rounded-xl overflow-hidden bg-slate-100 flex items-center justify-center text-blue-500 border border-slate-200/60">
                        {file.type === 'image' && file.url ? (
                          <img src={file.url} alt="preview" className="w-full h-full object-cover" />
                        ) : (
                          <FileIcon type={file.type} className="h-6 w-6" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0 pr-4">
                        {editingFileId === file.id ? (
                          <div className="flex items-center gap-2 mb-1" onClick={(e) => e.stopPropagation()}>
                            <input
                              autoFocus
                              value={editingName}
                              onChange={(e) => setEditingName(e.target.value)}
                              onKeyDown={(e) => e.key === 'Enter' && saveRename(file.id)}
                              onBlur={() => saveRename(file.id)}
                              className="text-sm font-semibold text-slate-900 border-b-2 border-blue-500 bg-transparent focus:outline-none w-full max-w-[200px]"
                            />
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="text-sm font-semibold text-slate-900 truncate" title={file.name}>
                              {file.name}
                            </h5>
                            {file.status === 'completed' && (
                              <motion.div
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </motion.div>
                            )}
                            {file.status === 'completed' && (
                              <button 
                                onClick={(e) => startRename(file, e)}
                                className="p-1 text-slate-400 hover:text-blue-600 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                title="Rename File"
                              >
                                <Edit2 className="h-3 w-3" />
                              </button>
                            )}
                          </div>
                        )}
                        
                        <div className="flex items-center text-xs text-slate-500 gap-3">
                          <span>{formatSize(file.size)}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                          <span>{file.date}</span>
                        </div>
                      </div>
                    </div>

                    {/* Progress / Actions / Category */}
                    <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto" onClick={(e) => e.stopPropagation()}>
                      <AnimatePresence mode="wait">
                        {file.status === 'uploading' ? (
                          <motion.div 
                            key="upload_progress"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="flex items-center gap-3 w-full sm:w-48"
                          >
                            <div className="flex-1 bg-slate-100 rounded-full h-2 relative overflow-hidden">
                              <motion.div 
                                className="absolute top-0 bottom-0 left-0 bg-blue-600 rounded-full" 
                                initial={{ width: "0%" }}
                                animate={{ width: `${file.progress}%` }}
                                transition={{ type: "spring", stiffness: 100, damping: 20 }}
                              >
                                <motion.div 
                                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent w-full"
                                  initial={{ x: "-100%" }}
                                  animate={{ x: "100%" }}
                                  transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                />
                              </motion.div>
                            </div>
                            <span className="text-xs font-medium text-slate-600 w-8 tabular-nums">{file.progress}%</span>
                          </motion.div>
                        ) : (
                          <motion.div
                            key="upload_complete"
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2 }}
                            className="flex flex-col-reverse sm:flex-row items-start sm:items-center gap-3 sm:gap-4 w-full sm:w-auto"
                          >
                            
                            {/* Categorization Native Dropdown */}
                          <div className="relative">
                            <select
                              value={file.category}
                              onChange={(e) => changeCategory(file.id, e.target.value as FileCategory)}
                              className="appearance-none bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-lg pl-3 pr-8 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer w-full sm:w-36 truncate"
                            >
                              <option value="Uncategorized">{t('Uncategorized')}</option>
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{t(cat)}</option>
                              ))}
                            </select>
                            <ChevronDown className="h-3.5 w-3.5 text-slate-500 absolute right-2.5 top-2.5 pointer-events-none" />
                          </div>

                          {/* Action Buttons */}
                          <div className="flex items-center gap-1">
                            <button 
                              onClick={(e) => downloadFile(file, e)}
                              className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors rounded-xl"
                              title={t('Download')}
                            >
                              <Download className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={(e) => removeFile(file.id, e)}
                              className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors rounded-xl"
                              title={t('Delete')}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}

      </div>

      {/* Preview Modal overlay */}
      <AnimatePresence>
        {previewFile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-4 sm:p-8"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-black border border-slate-800 rounded-3xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden shadow-2xl relative"
            >
              {/* Toolbar */}
              <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between z-10">
                <div className="flex items-center gap-3 text-white">
                  <FileIcon type={previewFile.type} className="h-6 w-6 text-slate-300" />
                  <span className="font-semibold">{previewFile.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => downloadFile(previewFile, e)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <Download className="h-5 w-5" />
                  </button>
                  <button 
                    onClick={() => setPreviewFile(null)}
                    className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
              
              {/* Content rendering */}
              <div className="flex-1 flex items-center justify-center bg-slate-950 p-4">
                {previewFile.type === 'image' ? (
                  <img src={previewFile.url} alt={previewFile.name} className="max-w-full max-h-full object-contain rounded-xl" />
                ) : previewFile.type === 'video' ? (
                  <video src={previewFile.url} controls className="max-w-full max-h-full rounded-xl" autoPlay />
                ) : previewFile.type === 'pdf' ? (
                  <iframe src={previewFile.url} className="w-full h-full rounded-xl bg-white" title="PDF Preview" />
                ) : (
                  <div className="text-slate-400 text-center space-y-3">
                    <FileText className="h-16 w-16 mx-auto opacity-50" />
                    <p>{t('Preview not available for this file type.')}</p>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
