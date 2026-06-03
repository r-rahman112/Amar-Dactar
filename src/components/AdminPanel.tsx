import toast from "react-hot-toast";
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ShieldCheck, CheckCircle2, XCircle, FileText, UserCheck, ShieldAlert } from 'lucide-react';

export default function AdminPanel() {
  const { user } = useAuth();
  const [verifications, setVerifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [rejectionReason, setRejectionReason] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null);

  useEffect(() => {
    fetchVerifications();
  }, []);

  const fetchVerifications = async () => {
    try {
      const res = await fetch('/api/admin/doctor-verifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if(res.ok) setVerifications(await res.json());
    } catch(e) {} finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    if (status === 'Rejected' && (!rejectionReason || !selectedDoctor)) {
      setSelectedDoctor(id);
      return;
    }

    try {
      const res = await fetch(`/api/admin/doctor-verifications/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status, rejection_reason: status === 'Rejected' ? rejectionReason : null })
      });
      if(res.ok) {
        toast(`Status updated to ${status}`);
        setSelectedDoctor(null);
        setRejectionReason('');
        fetchVerifications();
      } else {
        const d = await res.json();
        toast.error('Error: ' + d.error);
      }
    } catch(e: any) {
      toast.error('Error updating status: ' + e.message);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <div className="p-10 text-center text-red-600 font-bold">Unauthorized. Admin access required.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center gap-4 mb-8 pb-6 border-b border-slate-200">
         <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center">
            <ShieldCheck className="w-6 h-6" />
         </div>
         <div>
            <h1 className="text-3xl font-bold font-display text-slate-900">Admin Control Panel</h1>
            <p className="text-slate-500 mt-1">Manage doctor verifications and system requests</p>
         </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1 space-y-2">
          <button className="w-full text-left px-5 py-3.5 bg-blue-50 text-blue-700 font-bold rounded-2xl flex items-center gap-3">
             <UserCheck className="w-5 h-5" /> Doctor Verification
          </button>
        </div>

        <div className="md:col-span-3">
           <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
             <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Verification Requests</h2>
             
             {loading ? <p>Loading requests...</p> : verifications.length === 0 ? <p className="text-slate-500">No requests found.</p> : (
               <div className="space-y-6">
                 {verifications.map(v => (
                   <div key={v.doctor_id} className="p-5 border border-slate-200 rounded-2xl">
                      <div className="flex justify-between items-start mb-4 pb-4 border-b border-slate-100">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900">{v.fullname}</h3>
                          <p className="text-sm text-slate-600">{v.degree} • {v.specialty}</p>
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold uppercase rounded-full tracking-wider ${
                          v.status === 'Verified' ? 'bg-emerald-100 text-emerald-800' :
                          v.status === 'Under Review' ? 'bg-blue-100 text-blue-800' :
                          v.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-slate-100 text-slate-800'
                        }`}>
                          {v.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
                         <a href={v.bmdc_cert_url} target="_blank" className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                           <FileText className="w-6 h-6 text-slate-400 mb-2" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-center">BMDC</span>
                         </a>
                         <a href={v.degree_cert_url} target="_blank" className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                           <FileText className="w-6 h-6 text-slate-400 mb-2" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-center">Degree</span>
                         </a>
                         <a href={v.nid_front_url} target="_blank" className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                           <FileText className="w-6 h-6 text-slate-400 mb-2" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-center">NID Front</span>
                         </a>
                         <a href={v.nid_back_url} target="_blank" className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                           <FileText className="w-6 h-6 text-slate-400 mb-2" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-center">NID Back</span>
                         </a>
                         <a href={v.photo_url} target="_blank" className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors">
                           <img src={v.photo_url} alt="Doctor" className="w-8 h-8 object-cover rounded-full mb-2" />
                           <span className="text-[10px] font-bold uppercase tracking-wider text-center">Photo</span>
                         </a>
                      </div>

                      {selectedDoctor === v.doctor_id ? (
                        <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex items-start gap-3">
                           <input 
                             type="text" 
                             placeholder="Reason for rejection..." 
                             className="flex-1 bg-white border border-red-200 rounded-lg px-4 py-2 text-sm"
                             value={rejectionReason}
                             onChange={e => setRejectionReason(e.target.value)}
                           />
                           <button onClick={() => updateStatus(v.doctor_id, 'Rejected')} className="px-4 py-2 bg-red-600 text-white font-bold rounded-lg text-sm">Submit Reject</button>
                           <button onClick={() => setSelectedDoctor(null)} className="px-4 py-2 bg-white text-slate-600 border border-slate-200 font-bold rounded-lg text-sm">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-3">
                          {v.status !== 'Verified' && (
                            <button onClick={() => updateStatus(v.doctor_id, 'Verified')} className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                              <CheckCircle2 className="w-4 h-4" /> Approve & Verify
                            </button>
                          )}
                          {v.status !== 'Rejected' && (
                            <button onClick={() => updateStatus(v.doctor_id, 'Rejected')} className="flex-1 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                              <XCircle className="w-4 h-4" /> Reject Request
                            </button>
                          )}
                           {v.status === 'Verified' && (
                            <button onClick={() => updateStatus(v.doctor_id, 'Suspended')} className="py-2.5 px-6 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                              <ShieldAlert className="w-4 h-4" /> Suspend
                            </button>
                          )}
                          {v.status === 'Pending' && (
                             <button onClick={() => updateStatus(v.doctor_id, 'Under Review')} className="py-2.5 px-6 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2">
                              Mark Under Review
                            </button>
                          )}
                        </div>
                      )}
                   </div>
                 ))}
               </div>
             )}
           </div>
        </div>
      </div>
    </div>
  );
}
