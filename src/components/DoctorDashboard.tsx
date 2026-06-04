import toast from "react-hot-toast";
import { useTranslation } from '../contexts/LanguageContext';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, DollarSign, Activity, Calendar, Settings,
  LogOut, User as UserIcon, CheckCircle2, XCircle
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useAuth } from '../contexts/AuthContext';

import DoctorScheduleManager from './DoctorScheduleManager';
import DoctorAppointmentsView from './DoctorAppointmentsView';
import AnimatedCounter from './AnimatedCounter';

interface DoctorDashboardProps {
  onLogout: () => void;
  onOpenConsultation: (sessionId: string, patientId?: string) => void;
}

export default function DoctorDashboard({ onLogout, onOpenConsultation }: DoctorDashboardProps) {  const { t } = useTranslation();

  const [stats, setStats] = useState<any>(null);
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'dashboard'|'appointments'|'schedule'|'settings'|'verification'>('dashboard');
  const [verification, setVerification] = useState<any>(null);

  useEffect(() => {
    fetchData();
    fetchVerification();
  }, []);

  const fetchVerification = async () => {
    try {
      const res = await fetch('/api/doctors/verify/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setVerification(await res.json());
      }
    } catch(e) {}
  };

  const uploadFile = async (file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await fetch('/api/upload/file', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
      body: fd
    });
    if (!res.ok) throw new Error('Failed to upload file');
    const data = await res.json();
    if (data.url.startsWith('http')) return data.url;
    return window.location.origin + data.url;
  };

  const submitVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const form = e.target as HTMLFormElement;
      
      const bmdcFile = (form.elements.namedItem('bmdc') as HTMLInputElement).files?.[0];
      const degreeFile = (form.elements.namedItem('degree') as HTMLInputElement).files?.[0];
      const nidFrontFile = (form.elements.namedItem('nid_front') as HTMLInputElement).files?.[0];
      const nidBackFile = (form.elements.namedItem('nid_back') as HTMLInputElement).files?.[0];
      const photoFile = (form.elements.namedItem('photo') as HTMLInputElement).files?.[0];

      if(!bmdcFile && !verification?.details?.bmdc_cert_url) return toast.error('Please upload BMDC certificate');
      if(!degreeFile && !verification?.details?.degree_cert_url) return toast.error('Please upload Degree certificate');
      if(!nidFrontFile && !verification?.details?.nid_front_url) return toast.error('Please upload NID Front');
      if(!nidBackFile && !verification?.details?.nid_back_url) return toast.error('Please upload NID Back');
      if(!photoFile && !verification?.details?.photo_url) return toast.error('Please upload Professional Photo');

      const payload = {
        bmdc_cert_url: verification?.details?.bmdc_cert_url,
        degree_cert_url: verification?.details?.degree_cert_url,
        nid_front_url: verification?.details?.nid_front_url,
        nid_back_url: verification?.details?.nid_back_url,
        photo_url: verification?.details?.photo_url
      };

      if(bmdcFile) payload.bmdc_cert_url = await uploadFile(bmdcFile);
      if(degreeFile) payload.degree_cert_url = await uploadFile(degreeFile);
      if(nidFrontFile) payload.nid_front_url = await uploadFile(nidFrontFile);
      if(nidBackFile) payload.nid_back_url = await uploadFile(nidBackFile);
      if(photoFile) payload.photo_url = await uploadFile(photoFile);

      const res = await fetch('/api/doctors/verify/upload', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        toast.success('Verification documents submitted successfully!');
        fetchVerification();
      } else {
        const errorData = await res.json();
        toast.error('Error: ' + errorData.error);
      }
    } catch(err: any) {
      toast.error('Error submitting documents: ' + err.message);
    }
  };

  const fetchData = async () => {
    try {
      const headers = { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      };


      const [statsRes, patientsRes] = await Promise.all([
        fetch('/api/doctors/dashboard/stats', { headers }),
        fetch('/api/doctors/dashboard/patients', { headers })
      ]);

      if (statsRes.ok) {
        setStats(await statsRes.json());
      }
      if (patientsRes.ok) {
        setPatients(await patientsRes.json());
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-center items-center">
        <BrandLogo />
        <div className="mt-6 flex items-center gap-2 text-slate-500">
          <div className="w-4 h-4 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin" />
          {t('Loading secure doctor portal...')}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto">
        <div className="flex-1 py-6 px-4 space-y-2">
           <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-sm transition-colors ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
             <Activity className="h-5 w-5" /> {t('Dashboard')}
           </button>
           <button onClick={() => setActiveTab('appointments')} className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-sm transition-colors ${activeTab === 'appointments' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
             <Users className="h-5 w-5" /> {t('Appointments')}
           </button>
           <button onClick={() => setActiveTab('schedule')} className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-sm transition-colors ${activeTab === 'schedule' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
             <Calendar className="h-5 w-5" /> {t('Schedule')}
           </button>
           <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-sm transition-colors ${activeTab === 'settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
             <Settings className="h-5 w-5" /> {t('Settings')}
           </button>
           <button onClick={() => setActiveTab('verification')} className={`w-full flex items-center gap-3 px-4 py-3 font-semibold rounded-xl text-sm transition-colors ${activeTab === 'verification' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'}`}>
             <CheckCircle2 className="h-5 w-5" /> {t('Verification')}
           </button>
        </div>
        <div className="p-4 border-t border-slate-100">
           <button 
             onClick={onLogout}
             className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 font-bold rounded-xl text-sm transition-colors"
           >
             <LogOut className="h-5 w-5" /> {t('Logout')}
           </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-10 overflow-y-auto">
        <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 font-display">Welcome, {user?.fullName || user?.email?.split('@')[0]}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('Manage your appointments and virtual clinic securely.')}</p>
          </div>
          <div className="flex items-center gap-3">
             <span className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs font-bold border border-emerald-100">
               <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> {t('Online')}
             </span>
             <div className="h-10 w-10 bg-slate-200 rounded-full flex items-center justify-center text-slate-600 shrink-0 border border-slate-300">
                <UserIcon className="h-5 w-5" />
             </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
        {/* Unified Statistics Grid */}
        {activeTab === 'dashboard' && (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm premium-card-hover">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Activity className="h-6 w-6" /></div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900">
                  <AnimatedCounter value={stats?.activeConsultations || 0} />
                </h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">{t('Active Consultations')}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm premium-card-hover">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl"><Calendar className="h-6 w-6" /></div>
                </div>
                <h3 className="text-3xl font-bold text-slate-900">
                  <AnimatedCounter value={stats?.todayAppointments || 0} />
                </h3>
                <p className="text-sm font-semibold text-slate-500 mt-1">{t('Today\'s Appointments')}</p>
              </motion.div>

              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white border border-slate-200 p-6 rounded-3xl shadow-sm col-span-1 sm:col-span-2 lg:col-span-2 premium-card-hover">
                <div className="flex justify-between items-start mb-4">
                   <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl"><DollarSign className="h-6 w-6" /></div>
                   <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                     {t('Available to withdraw:')} <AnimatedCounter value={stats?.earnings?.withdrawable || 0} prefix="৳" />
                   </span>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                     <h3 className="text-3xl font-bold text-slate-900">
                       <AnimatedCounter value={stats?.earnings?.monthly || 0} prefix="৳" />
                     </h3>
                     <p className="text-sm font-semibold text-slate-500 mt-1">{t('Monthly Earnings')}</p>
                  </div>
                  <div className="text-right">
                     <p className="text-sm text-slate-600 font-medium">{t('Daily:')} <span className="text-slate-900 font-bold"><AnimatedCounter value={stats?.earnings?.daily || 0} prefix="৳" /></span></p>
                     <p className="text-sm text-slate-600 font-medium">{t('Weekly:')} <span className="text-slate-900 font-bold"><AnimatedCounter value={stats?.earnings?.weekly || 0} prefix="৳" /></span></p>
                  </div>
                </div>
              </motion.div>
            </div>

            {/* Patients & Appointments List */}
            <div className="bg-white border border-slate-200 rounded-3xl shadow-sm overflow-hidden mb-10">
              <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                 <h2 className="text-lg font-bold text-slate-900 font-display">Recent Approvals & Consultations</h2>
              </div>
              <div className="overflow-x-auto">
                 <table className="w-full min-w-[600px] text-left border-collapse">
                   <thead>
                     <tr>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Patient')}</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">Date & Time</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Duration')}</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Revenue')}</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Status')}</th>
                       <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-100">{t('Actions')}</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {patients.length > 0 ? patients.map((pt) => (
                       <tr key={pt.session_id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="text-sm font-bold text-slate-900">{pt.patient_name}</div>
                            <div className="text-xs text-slate-500">ID: {pt.patient_id.substring(0,8)}...</div>
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">
                            {new Date(pt.created_at).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-medium text-slate-600">
                            {pt.package_minutes} Mins
                          </td>
                          <td className="px-6 py-4 text-sm font-bold text-slate-900">
                            ৳{pt.amount}
                          </td>
                          <td className="px-6 py-4">
                            {pt.status === 'active' && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 font-bold rounded-full border border-blue-200">{t('Active')}</span>}
                            {pt.status === 'completed' && <span className="text-xs px-2 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-full border border-emerald-200">{t('Completed')}</span>}
                            {pt.status === 'pending' && <span className="text-xs px-2 py-1 bg-slate-100 text-slate-600 font-bold rounded-full border border-slate-200">{t('Pending')}</span>}
                          </td>
                          <td className="px-6 py-4">
                            {pt.status === 'active' && (
                              <button 
                                onClick={() => onOpenConsultation(pt.session_id, pt.patient_id)}
                                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-lg transition-colors"
                              >
                                {t('Enter Chat')}
                              </button>
                            )}
                            {pt.status === 'completed' && (
                              <button 
                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-colors"
                              >
                                {t('View Summary')}
                              </button>
                            )}
                          </td>
                       </tr>
                     )) : (
                       <tr>
                         <td colSpan={6} className="px-6 py-10 text-center text-slate-500 font-medium">
                           {t('No consultation records found.')}
                         </td>
                       </tr>
                     )}
                   </tbody>
                 </table>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === 'appointments' && (
           <motion.div
            key="appointments"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
           >
             <DoctorAppointmentsView />
           </motion.div>
        )}

        {activeTab === 'schedule' && (
           <motion.div
            key="schedule"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
           >
             <DoctorScheduleManager />
           </motion.div>
        )}

        {activeTab === 'settings' && (
          <motion.div
            key="settings"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
          <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 mb-10 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 mb-6 font-display border-b border-slate-100 pb-4">{t('Doctor Settings')}</h2>
            
            <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); toast('Settings saved (Mock)!'); }}>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('Full Name')}</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" defaultValue="Dr. Demo" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('Specialty')}</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" defaultValue="Cardiologist" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('BMDC Registration No')}</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" defaultValue="A-54321" />
                 </div>
                 <div>
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Base Consultation Fee (৳)</label>
                   <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" defaultValue="1200" />
                 </div>
                 <div className="md:col-span-2">
                   <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('Available Hours')}</label>
                   <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" defaultValue="5:00 PM - 9:00 PM (Sat-Thu)" />
                 </div>
               </div>

               <div className="flex items-center gap-4 border-t border-slate-100 pt-6">
                 <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors">
                   {t('Save Changes')}
                 </button>
                 <label className="flex items-center gap-2 cursor-pointer">
                   <input type="checkbox" className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                   <span className="text-sm font-semibold text-slate-700">Online & Accepting Patients</span>
                 </label>
               </div>
            </form>
          </div>
          </motion.div>
        )}

        {activeTab === 'verification' && (
          <motion.div
            key="verification"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 mb-10 max-w-4xl mx-auto"
          >
            <h2 className="text-xl font-bold text-slate-900 mb-6 font-display border-b border-slate-100 pb-4">Identity & Credential Verification</h2>
            
            <div className={`p-4 rounded-xl mb-6 font-medium text-sm flex items-start gap-3 ${
              verification?.status === 'Verified' ? 'bg-emerald-50 text-emerald-800' :
              verification?.status === 'Rejected' ? 'bg-red-50 text-red-800' :
              verification?.status === 'Suspended' ? 'bg-orange-50 text-orange-800' :
              verification?.status === 'Under Review' ? 'bg-blue-50 text-blue-800' :
              'bg-slate-50 text-slate-800'
            }`}>
               <CheckCircle2 className="h-5 w-5 shrink-0" />
               <div>
                  <p className="font-bold">Status: {verification?.status || 'Pending'}</p>
                  {verification?.details?.rejection_reason && (
                    <p className="mt-1 opacity-90"><span className="font-bold">{t('Reason:')} </span>{verification.details.rejection_reason}</p>
                  )}
                  {verification?.status === 'Pending' && <p className="mt-1 opacity-90">{t('Please submit your credentials to activate your account and receive patient consultations.')}</p>}
               </div>
            </div>

            {(!verification?.status || verification?.status === 'Pending' || verification?.status === 'Rejected') && (
              <form className="space-y-6" onSubmit={submitVerification}>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('BMDC Registration Certificate')}</label>
                    {verification?.details?.bmdc_cert_url && <a href={verification.details.bmdc_cert_url} target="_blank" className="text-blue-600 text-xs mb-2 block">{t('View Current Document')}</a>}
                    <input type="file" name="bmdc" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('Medical Degree Certificate')}</label>
                    {verification?.details?.degree_cert_url && <a href={verification.details.degree_cert_url} target="_blank" className="text-blue-600 text-xs mb-2 block">{t('View Current Document')}</a>}
                    <input type="file" name="degree" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('NID Front')}</label>
                      {verification?.details?.nid_front_url && <a href={verification.details.nid_front_url} target="_blank" className="text-blue-600 text-xs mb-2 block">{t('View Current Document')}</a>}
                      <input type="file" name="nid_front" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('NID Back')}</label>
                      {verification?.details?.nid_back_url && <a href={verification.details.nid_back_url} target="_blank" className="text-blue-600 text-xs mb-2 block">{t('View Current Document')}</a>}
                      <input type="file" name="nid_back" accept="image/*,.pdf" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">{t('Professional Photo')}</label>
                    {verification?.details?.photo_url && <a href={verification.details.photo_url} target="_blank" className="text-blue-600 text-xs mb-2 block">{t('View Current Document')}</a>}
                    <input type="file" name="photo" accept="image/*" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:ring-2 focus:ring-blue-500/20" />
                  </div>
                </div>
                <div className="pt-6 border-t border-slate-100">
                  <button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl py-3 transition-colors">
                    {t('Submit Documents for Review')}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        )}
        </AnimatePresence>
      </main>
    </div>
  );
}
