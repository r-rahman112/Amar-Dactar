import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { ShieldCheck, CheckCircle2, XCircle, Search, FileText } from 'lucide-react';

export default function DoctorVerificationsManagement() {  const { t } = useTranslation();

  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVerif, setSelectedVerif] = useState<any>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/admin/doctor-verifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setVerifications(await res.json());
      }
    } catch(e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const overrideStatus = async (doctorId: string, status: string, reason?: string) => {
    try {
      const res = await fetch(`/api/admin/doctor-verifications/${doctorId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}` 
        },
        body: JSON.stringify({ status, rejection_reason: reason })
      });
      if (res.ok) {
        fetchVerifications();
        setSelectedVerif(null);
      }
    } catch(e) {}
  };

  if (loading) return <div className="p-10 text-center text-slate-500">{t('Loading verifications...')}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">{t('Doctor Verifications')}</h2>
          <p className="text-sm text-slate-500">{t('Approve or reject doctor applications.')}</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Doctor')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Status')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Submitted At')}</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {verifications.map((v) => (
                <tr key={v.doctor_id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <p className="text-sm font-bold text-slate-900">{v.fullname}</p>
                    <p className="text-xs text-slate-500">{v.email}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      v.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                      v.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                      v.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                      'bg-slate-100 text-slate-800'
                    }`}>
                      {v.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500">
                    {new Date(v.created_at).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button onClick={() => setSelectedVerif(v)} className="text-blue-600 font-bold hover:underline">{t('Review Documents')}</button>
                  </td>
                </tr>
              ))}
              {verifications.length === 0 && (
                <tr><td colSpan={4} className="px-6 py-8 text-center text-slate-500">{t('No verifications found.')}</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedVerif && (
        <div className="fixed inset-0 z-50 flex justify-center items-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedVerif(null)} />
          <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-display font-bold text-xl text-slate-900">Review Application: {selectedVerif.fullname}</h3>
              <button className="text-slate-400 hover:text-slate-600" onClick={() => setSelectedVerif(null)}>
                 <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('BMDC Certificate')}</p>
                   <a href={selectedVerif.bmdc_cert_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 p-3 rounded-xl break-all">
                     <FileText className="w-4 h-4 shrink-0" /> {selectedVerif.bmdc_cert_url}
                   </a>
                 </div>
                 <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Medical Degree')}</p>
                   <a href={selectedVerif.degree_cert_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 p-3 rounded-xl break-all">
                     <FileText className="w-4 h-4 shrink-0" /> {selectedVerif.degree_cert_url}
                   </a>
                 </div>
                 <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('NID Front')}</p>
                   <a href={selectedVerif.nid_front_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 p-3 rounded-xl break-all">
                     <FileText className="w-4 h-4 shrink-0" /> {selectedVerif.nid_front_url}
                   </a>
                 </div>
                 <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('NID Back')}</p>
                   <a href={selectedVerif.nid_back_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 p-3 rounded-xl break-all">
                     <FileText className="w-4 h-4 shrink-0" /> {selectedVerif.nid_back_url}
                   </a>
                 </div>
                 <div className="space-y-2">
                   <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t('Professional Photo')}</p>
                   <a href={selectedVerif.photo_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-blue-600 hover:underline bg-blue-50 p-3 rounded-xl break-all">
                     <FileText className="w-4 h-4 shrink-0" /> {selectedVerif.photo_url}
                   </a>
                 </div>
              </div>
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button 
                onClick={() => {
                  const reason = prompt("Enter rejection reason:");
                  if (reason !== null) {
                    overrideStatus(selectedVerif.doctor_id, 'Rejected', reason);
                  }
                }}
                className="px-6 py-2.5 bg-red-100 text-red-700 hover:bg-red-200 font-bold rounded-xl transition-colors"
                disabled={selectedVerif.status === 'Rejected'}
              >
                {t('Reject Application')}
              </button>
              <button 
                onClick={() => overrideStatus(selectedVerif.doctor_id, 'Verified')}
                className="px-6 py-2.5 bg-emerald-600 text-white hover:bg-emerald-700 font-bold rounded-xl transition-colors"
                disabled={selectedVerif.status === 'Verified'}
              >
                {t('Approve as Verified')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
