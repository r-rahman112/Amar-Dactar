import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowLeft, Upload, FileText, Image as ImageIcon, Video, 
  Search, Trash2, Download, Eye, Lock, Filter, Activity, Stethoscope, FilePlus, ShieldCheck 
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';

type VaultRecord = {
  id: string;
  title: string;
  category: string;
  file_url: string;
  mimetype: string;
  size: number;
  is_encrypted: boolean;
  created_at: string;
  _note?: string;
};

const CATEGORIES = ['All', 'Blood Tests', 'Imaging', 'Prescriptions', 'Consultations', 'Other'];

export default function HealthVault({ onBack, userRole = 'PATIENT', patientId = null }: { onBack: () => void, userRole?: string, patientId?: string | null }) {
  const { t } = useTranslation();
  const [records, setRecords] = useState<VaultRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [previewFile, setPreviewFile] = useState<VaultRecord | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchRecords();
  }, [category, search]);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      let endpoint = '/api/vault';
      if (userRole === 'DOCTOR' && patientId) {
        endpoint = `/api/vault/doctor-access/${patientId}`;
      }

      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'All') params.append('category', category);

      const res = await fetch(`${endpoint}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setRecords(Array.isArray(data) ? data : []);
      } else {
         console.error('Failed to fetch records:', data.error);
         setRecords([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    
    // We expect it to be a health record. Let's upload
    setUploading(true);
    setUploadProgress(10);
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadRes = await fetch('/api/upload/file', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      
      setUploadProgress(50);
      const uploadData = await uploadRes.json();
      
      if (uploadData.success) {
        setUploadProgress(80);
        // Now register in vault
        const docCat = category === 'All' ? 'Other' : category;
        const vaultRes = await fetch('/api/vault', {
          method: 'POST',
          headers: {
             'Authorization': `Bearer ${localStorage.getItem('token')}`,
             'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: file.name,
            category: docCat,
            file_url: uploadData.url,
            mimetype: uploadData.mimetype,
            size: file.size
          })
        });
        
        if (vaultRes.ok) {
          fetchRecords();
        }
      }
    } catch (error) {
      console.error('Upload failed', error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const deleteRecord = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/vault/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setRecords(records.filter(r => r.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  const downloadFile = (record: VaultRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    const a = document.createElement('a');
    a.href = record.file_url;
    a.download = record.title;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const FileIcon = ({ mimetype, className = "h-6 w-6" }: { mimetype: string, className?: string }) => {
    if (!mimetype) return <FileText className={className} />;
    if (mimetype.startsWith('image/')) return <ImageIcon className={className} />;
    if (mimetype.startsWith('video/')) return <Video className={className} />;
    return <FileText className={className} />;
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 px-4 py-4 md:px-8 flex items-center justify-between shadow-sm">
        <div className="flex items-center space-x-4">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-500 hover:text-slate-900">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-600" /> {t('Secure Health Vault')}
            </h1>
            <p className="text-xs text-slate-500 font-medium">{t('Encrypted personal medical records')}</p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 mt-8 flex flex-col lg:flex-row gap-8">
        
        {/* Left side - Search and Filters */}
        <div className="w-full lg:w-1/4 space-y-6">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
            <div className="relative mb-6">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={t('Search records...')} 
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3 px-1">{t('Categories')}</h3>
            <div className="space-y-1">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm font-medium transition-all flex justify-between items-center ${category === cat ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}
                >
                  {t(cat)}
                </button>
              ))}
            </div>
          </div>

          {userRole === 'PATIENT' && (
            <div className="bg-indigo-600 rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <Lock className="w-24 h-24" />
              </div>
              <Lock className="w-6 h-6 mb-4 text-indigo-200" />
              <h3 className="text-base font-bold mb-2">{t('End-to-End Encrypted')}</h3>
              <p className="text-xs text-indigo-100 font-medium leading-relaxed">
                {t('Your records are encrypted at rest. Only you and authorized doctors during active consultations can access them.')}
              </p>
            </div>
          )}
        </div>

        {/* Right side - Record List */}
        <div className="flex-1 space-y-6">
          
          {userRole === 'PATIENT' && (
            <div 
              onClick={() => !uploading && fileInputRef.current?.click()}
              className={`border-2 border-dashed border-slate-300 bg-white rounded-3xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
            >
              <input 
                 type="file" 
                 ref={fileInputRef} 
                 onChange={handleFileUpload} 
                 className="hidden" 
              />
              <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-4">
                {uploading ? <Activity className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
              </div>
              <h3 className="text-base font-bold text-slate-800 mb-1">
                {uploading ? t('Encrypting and Uploading...') : t('Upload New Record')}
              </h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">
                {uploading ? `${uploadProgress}% completed` : t('Securely store Medical Reports, Prescriptions, X-Rays, Lab Results.')}
              </p>
            </div>
          )}

          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
            <div className="border-b border-slate-100 px-6 py-4 flex justify-between items-center bg-slate-50/50">
              <h2 className="font-bold text-slate-800">{category === 'All' ? t('All Records') : t(category)}</h2>
              <span className="text-xs font-semibold bg-slate-200 text-slate-600 px-2 py-1 rounded-md">{records.length} {t('Items')}</span>
            </div>

            <div className="divide-y divide-slate-100">
              {loading ? (
                <div className="p-8 text-center text-slate-500 font-medium animate-pulse">Loading records...</div>
              ) : records.length === 0 ? (
                <div className="p-12 text-center flex flex-col items-center">
                  <FilePlus className="w-12 h-12 text-slate-300 mb-4" />
                  <h3 className="text-slate-700 font-bold mb-1">{t('No records found')}</h3>
                  <p className="text-sm text-slate-500">{t('Upload your first document to securely store it.')}</p>
                </div>
              ) : (
                records.map(record => (
                  <div key={record.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group cursor-pointer" onClick={() => setPreviewFile(record)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shrink-0">
                        <FileIcon mimetype={record.mimetype} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900 leading-snug truncate max-w-[200px] sm:max-w-xs">{record.title}</h4>
                        <div className="flex items-center gap-3 mt-1.5 text-xs font-medium text-slate-500">
                          <span className="px-2 py-0.5 bg-slate-100 rounded-md">{record.category}</span>
                          <span>{new Date(record.created_at).toLocaleDateString()}</span>
                          <span className="hidden sm:inline-block text-slate-300">•</span>
                          <span className="hidden sm:inline-block">{formatSize(record.size)}</span>
                        </div>
                        {record.is_encrypted ? (
                          <div className="flex items-center gap-1 mt-1.5 text-[10px] text-emerald-600 font-bold px-1.5 py-0.5 bg-emerald-50 w-fit rounded-sm">
                            <Lock className="w-3 h-3" /> Encrypted at rest
                          </div>
                        ) : record._note && (
                           <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600 font-bold px-1.5 py-0.5 bg-amber-50 w-fit rounded-sm">
                            <Lock className="w-3 h-3" /> {record._note}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 self-end sm:self-auto opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={(e) => downloadFile(record, e)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors tooltip" title={t('Download')}>
                        <Download className="w-4 h-4" />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setPreviewFile(record); }} className="p-2 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-full transition-colors tooltip" title={t('Preview')}>
                        <Eye className="w-4 h-4" />
                      </button>
                      {userRole === 'PATIENT' && (
                        <button onClick={(e) => deleteRecord(record.id, e)} className="p-2 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full transition-colors tooltip" title={t('Delete')}>
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {previewFile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setPreviewFile(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={e => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="flex justify-between items-center p-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex flex-col">
                   <h3 className="font-bold text-slate-900">{previewFile.title}</h3>
                   <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mt-0.5">
                     {previewFile.is_encrypted ? (
                        <span className="flex items-center gap-1 text-emerald-600"><Lock className="w-3 h-3"/> Decrypted for Preview</span>
                     ) : previewFile._note ? (
                        <span className="flex items-center gap-1 text-amber-600 sm:max-w-xs truncate"><Lock className="w-3 h-3"/> {previewFile._note}</span>
                     ) : null}
                   </div>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={(e) => downloadFile(previewFile, e)} className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors">
                    <Download className="w-4 h-4" /> <span className="hidden sm:inline-block">{t('Download')}</span>
                  </button>
                  <button
                    onClick={() => setPreviewFile(null)}
                    className="p-1.5 hover:bg-slate-200 text-slate-500 rounded-lg transition-colors"
                  >
                    <ArrowLeft className="w-5 h-5 text-slate-600 rotate-180" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-auto bg-slate-100/50 p-4 sm:p-8 flex items-center justify-center min-h-[50vh]">
                {previewFile.mimetype?.startsWith('image/') ? (
                   <img src={previewFile.file_url} alt={previewFile.title} className="max-w-full max-h-full rounded-xl shadow-sm border border-slate-200 bg-white object-contain" />
                ) : previewFile.mimetype?.startsWith('video/') ? (
                   <video src={previewFile.file_url} controls className="max-w-full max-h-full rounded-xl shadow-sm border border-slate-200 bg-black outline-none" />
                ) : (
                   <iframe src={previewFile.file_url} className="w-full h-full bg-white rounded-xl shadow-sm border border-slate-200 min-h-[500px]" title={previewFile.title} />
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
