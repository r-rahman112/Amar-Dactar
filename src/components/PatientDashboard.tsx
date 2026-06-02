import React, { useState, useEffect } from 'react';
import { 
  Heart, 
  Activity, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Plus, 
  Upload, 
  FileText, 
  MessageSquare, 
  ArrowLeft, 
  ChevronRight, 
  Bell, 
  Check, 
  TrendingUp, 
  AlertCircle,
  Sparkles,
  Search,
  User,
  HeartPulse,
  Pill,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './BrandLogo';

interface PatientDashboardProps {
  onBackToHome: () => void;
  onStartConsultation: (type?: 'symptom' | 'report') => void;
  onUploadReport?: () => void;
  onFindDoctor?: () => void;
}

export default function PatientDashboard({ onBackToHome, onStartConsultation, onUploadReport, onFindDoctor }: PatientDashboardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  
  const [appointments, setAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await fetch('/api/appointments/patient', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if(res.ok) setAppointments(await res.json());
      } catch(e) {}
    };
    fetchAppointments();
  }, []);

  const [reminders, setReminders] = useState([
    { id: 'rem-1', name: 'Lisinopril (Blood Pressure)', dosage: '10mg', timing: '8:00 AM', completed: true, iconBg: 'bg-blue-50 text-blue-600' },
    { id: 'rem-2', name: 'Omega-3 Fish Oil Capsule', dosage: '1000mg', timing: '12:30 PM', completed: false, iconBg: 'bg-emerald-50 text-emerald-600' },
    { id: 'rem-3', name: 'Vitamin D3 Drops', dosage: '2000 IU', timing: '6:00 PM', completed: false, iconBg: 'bg-amber-50 text-amber-600' }
  ]);

  const [notifications, setNotifications] = useState([
    { id: 'not-1', text: 'WBC Blood Count scan completed successfully.', time: '2 hours ago', unread: true },
    { id: 'not-2', text: 'Upcoming posture screen check set for Thursday next week.', time: 'Yesterday', unread: false }
  ]);

  const [searchReportQuery, setSearchReportQuery] = useState('');

  // Sample static data for Patient UI metrics
  const vitals = [
    { name: 'Heart Rate', value: '72 bpm', status: 'Optimal', icon: Heart, iconColor: 'text-rose-500 bg-rose-50' },
    { name: 'Blood Pressure', value: '118/76 mmHg', status: 'Optimal', icon: Activity, iconColor: 'text-blue-500 bg-blue-50' },
    { name: 'Blood Oxygen (SpO2)', value: '98%', status: 'Optimal', icon: Sparkles, iconColor: 'text-emerald-500 bg-emerald-50' },
    { name: 'Sleep Target', value: '7.4 hrs', status: 'Healthy', icon: Clock, iconColor: 'text-indigo-500 bg-indigo-50' }
  ];

  const recentConsultations = [
    {
      id: 'c-1',
      title: 'Lower Back Muscle Stiffness Triage',
      date: 'May 28, 2026',
      clinic: 'Orthopedic AI Assistant',
      recommendation: 'Mild paravertebral muscular strain detected. Focus on light hamstring stretches & hot-pack insulation.',
      status: 'Reviewed'
    },
    {
      id: 'c-2',
      title: 'Routine CBC Blood Panel Transcription',
      date: 'Apr 14, 2026',
      clinic: 'Lab Decoder Assistant',
      recommendation: 'Leukocytes slightly high indicating robust common cold healing. Hemoglobin optimal at 14.2 g/dL.',
      status: 'Completed'
    }
  ];

  const uploadedReports = [
    { id: 'rep-1', name: 'Comprehensive_Metabolic_Panel.pdf', size: '184 KB', date: 'May 26, 2026', type: 'Lab PDF' },
    { id: 'rep-2', name: 'Joint_Knee_MRI_Summary.pdf', size: '2.1 MB', date: 'May 12, 2026', type: 'Imaging PDF' },
    { id: 'rep-3', name: 'Allergy_Skin_Screening_Report.png', size: '840 KB', date: 'Apr 02, 2026', type: 'Image File' }
  ];

  const upcomingAppointments = [
    {
      id: 'app-1',
      title: 'Preventative Wellness Care Screen',
      specialist: 'Dr. Evelyn Ramirez (Family General Practitioner)',
      date: 'June 08, 2026',
      time: '10:30 AM',
      location: 'Medical Hub Room 403 / Virtual Link'
    }
  ];

  const activityTimeline = [
    { id: 't-1', action: 'Symptom Consultation Completed', category: 'Back pain logs saved', time: 'May 28, 2026 • 10:15 AM' },
    { id: 't-2', action: 'Completed Lisinopril medication intake tracker', category: 'Therapeutic routine', time: 'May 28, 2026 • 8:02 AM' },
    { id: 't-3', action: 'Biochemistry Blood Panel PDF Translated', category: 'Automated OCR analysis', time: 'May 26, 2026 • 2:44 PM' },
    { id: 't-4', action: 'আমার ডাক্তার Account Initialized Safely', category: 'Security Enclave Created', time: 'May 26, 2026 • 11:00 AM' }
  ];

  const toggleReminder = (id: string) => {
    setReminders(reminders.map(rem => {
      if (rem.id === id) {
        return { ...rem, completed: !rem.completed };
      }
      return rem;
    }));
  };

  const markNotificationRead = (id: string) => {
    setNotifications(notifications.map(not => {
      if (not.id === id) {
        return { ...not, unread: false };
      }
      return not;
    }));
  };

  const filteredReports = uploadedReports.filter(rep => 
    rep.name.toLowerCase().includes(searchReportQuery.toLowerCase()) ||
    rep.type.toLowerCase().includes(searchReportQuery.toLowerCase())
  );

  return (
    <div id="patient-dashboard-wrapper" className="min-h-screen bg-slate-50/50 text-slate-800 flex flex-col pt-16">
      
      {/* Top dashboard control bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-slate-100 flex items-center justify-between px-6 py-3">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBackToHome}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-slate-50 transition-colors cursor-pointer"
            title="Go to main landing page"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-2">
            <BrandLogo iconSize="h-4.5 w-4.5" />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center text-xs text-emerald-600 bg-emerald-50 border border-emerald-100/85 px-3 py-1.5 rounded-full font-bold">
            <ShieldCheck className="h-4 w-4 mr-1 shrink-0" />
            <span>{t('Virtual Medical Enclave Active')}</span>
          </div>

          {/* Consultation CTA */}
          <button
            onClick={() => onStartConsultation('symptom')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm shadow-blue-100 flex items-center gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>{t('Start Consultation')}</span>
          </button>
        </div>
      </nav>

      {/* Main dashboard core area */}
      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 space-y-8 flex-1">
        
        {/* Welcome Section Banner Card */}
        <div className="bg-white border border-slate-100 rounded-[2.2rem] p-6 sm:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
          {/* Decorative background radial color */}
          <div className="absolute right-0 top-0 w-80 h-80 bg-blue-200/10 rounded-full blur-3xl -z-10 pointer-events-none" />
          
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold uppercase tracking-wider rounded-lg">
              <Sparkles className="h-3.5 w-3.5" /> Simulation Sandbox Directory
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-slate-950 tracking-tight">
              {t('Welcome back')}, {user?.fullName || user?.email?.split('@')[0]}
            </h1>
            <p className="text-sm text-slate-500 max-w-xl">
              {t('Understand your vitals trends, evaluate active medication counts, translate uploaded clinical files, and access 24/7 symptom logs. No public tracking active.')}
            </p>
          </div>

          {/* Quick buttons inside card */}
          <div className="flex flex-wrap gap-3 w-full lg:w-auto mt-4 md:mt-0">
            <button
              onClick={() => onStartConsultation('symptom')}
              className="px-5 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm shadow-blue-100 cursor-pointer flex-1 sm:flex-none"
            >
              <MessageSquare className="h-4.5 w-4.5 shrink-0" />
              <span className="whitespace-nowrap">{t('Smart Triage')}</span>
            </button>
            <button
              onClick={() => onStartConsultation('report')}
              className="px-5 py-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none"
            >
              <FileText className="h-4.5 w-4.5 shrink-0" />
              <span className="whitespace-nowrap">{t('Medical Report Analysis')}</span>
            </button>
            <button
              onClick={onUploadReport}
              className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer flex-1 sm:flex-none border border-slate-200"
            >
              <Upload className="h-4.5 w-4.5 shrink-0" />
              <span className="whitespace-nowrap">{t('Upload Report')}</span>
            </button>
            <button
              onClick={onFindDoctor}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-sm font-semibold transition-all flex items-center justify-center gap-1.5 shadow-sm cursor-pointer flex-1 sm:flex-none"
            >
              <User className="h-4.5 w-4.5 shrink-0" />
              <span className="whitespace-nowrap">{t('Find Doctor')}</span>
            </button>
          </div>
        </div>

        {/* Health Summary Vitals Panel - Grid 4 */}
        <div className="space-y-4">
          <h2 className="font-display font-extrabold text-lg text-slate-900 tracking-tight block pl-1">
            {t('Current Wellness Vitals summary')}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {vitals.map((vital, index) => {
              const IconComp = vital.icon;

              return (
                <div
                  key={index}
                  className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex flex-col justify-between"
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs text-slate-450 font-semibold leading-normal">
                      {vital.name}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
                      {vital.status}
                    </span>
                  </div>

                  <div className="flex items-baseline space-x-2">
                    <span className="font-display font-extrabold text-lg sm:text-2xl text-slate-900">
                      {vital.value}
                    </span>
                  </div>

                  {/* Icon indicator row */}
                  <div className="flex items-center gap-2 pt-3 border-t border-slate-50 mt-4">
                    <div className={`p-1.5 rounded-lg ${vital.iconColor}`}>
                      <IconComp className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">Auto-updated via health tracker link</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Main Content Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Left Columns (Recent Consults + Uploaded reports) */}
          <div className="lg:col-span-8 space-y-8 flex flex-col justify-start">
            
            {/* Recent Consultations Case */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex justify-between items-center pb-3 border-b border-slate-50">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-950">{t('Recent Consultation Notes')}</h3>
                  <p className="text-[11px] text-slate-400 leading-none mt-0.5">{t('Direct transcripts of simulations')}</p>
                </div>
                <button
                  onClick={() => onStartConsultation('symptom')}
                  className="text-xs text-blue-600 font-bold hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                >
                  <span>{t('Open active chat console')}</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>

              <div className="space-y-4">
                {recentConsultations.map((consult) => (
                  <div
                    key={consult.id}
                    id={`dashboard-consult-${consult.id}`}
                    className="p-5 bg-slate-50/50 border border-slate-100 rounded-2xl space-y-3 hover:border-blue-200 hover:bg-white transition-all group"
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-0.5">
                        <span className="text-[9px] uppercase font-bold tracking-widest text-slate-400">
                          {consult.clinic}
                        </span>
                        <h4 className="font-display font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
                          {consult.title}
                        </h4>
                      </div>
                      <span className="text-[10px] bg-sky-50 text-sky-800 font-semibold px-2 py-0.5 rounded-full">
                        {consult.date}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-normal bg-white border border-slate-50 p-3 rounded-xl">
                      {consult.recommendation}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Uploaded Reports Cabinet */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-5">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 pb-3 border-b border-slate-55">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-950">{t('Uploaded Medical Reports Registry')}</h3>
                  <p className="text-[11px] text-slate-400 leading-none mt-0.5">{t('Secure, non-shared diagnostic catalog')}</p>
                </div>
                
                {/* Micro search filter */}
                <div className="relative w-full sm:w-48 shrink-0">
                  <Search className="h-3 w-3 text-slate-450 absolute top-2 left-2.5" />
                  <input
                    type="text"
                    placeholder="Search PDF..."
                    value={searchReportQuery}
                    onChange={(e) => setSearchReportQuery(e.target.value)}
                    className="w-full pl-7 pr-3 py-1 bg-slate-50 border border-slate-200 focus:border-blue-300 text-xs rounded-lg"
                  />
                </div>
              </div>

              {/* Reports stack */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {filteredReports.map((report) => (
                  <div
                    key={report.id}
                    id={`cabinet-report-${report.id}`}
                    className="p-4 border border-slate-100 hover:border-blue-100 rounded-2xl flex items-center justify-between group bg-white hover:bg-blue-50/5/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3 MIN-W-0">
                      <div className="p-2.5 bg-blue-50 text-blue-700 rounded-xl shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="truncate">
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors truncate">
                          {report.name}
                        </h4>
                        <span className="text-[10px] text-slate-450 uppercase tracking-widest">{report.type} • {report.size}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onStartConsultation('report')}
                      className="p-1 text-slate-350 hover:text-blue-600 hover:bg-blue-50 rounded"
                      title="Translate and scan this PDF"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ))}

                {filteredReports.length === 0 && (
                  <div className="py-8 text-center text-xs text-slate-400 col-span-2">
                    No matching clinical files located, upload new records.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Right Columns (Appointments, Reminders, Activity) */}
          <div className="lg:col-span-4 space-y-8 flex flex-col justify-start">
            
            {/* Upcoming Appointments schedule */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-display font-bold text-base text-slate-950">{t('Upcoming Appointments')}</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{t('Clinical schedules timeline')}</p>
              </div>

              {appointments.length === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">{t('No upcoming appointments')}</p>
              )}
              {appointments.map((app) => (
                <div key={app.id} className="p-4 border border-blue-50 bg-blue-50/15 rounded-2xl space-y-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-100 text-blue-800 rounded-xl">
                      <Calendar className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">Consultation with {app.doctorname || 'Doctor'}</h4>
                      <p className="text-[10px] text-slate-500 leading-none mt-0.5">{app.specialty || 'General'}</p>
                    </div>
                  </div>

                  <div className="bg-white border border-slate-100/60 p-2.5 rounded-xl flex justify-between items-center text-[11px] text-slate-600 font-medium">
                    <span>📅 {app.date}</span>
                    <span>⏰ {app.start_time} - {app.end_time}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${app.status === 'Pending' ? 'bg-orange-100 text-orange-700' : app.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Medicine Reminders checkbox list */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-display font-bold text-base text-slate-950">{t('Intake Reminders')}</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">{t('Interactive dosage tracker')}</p>
                </div>
                <Pill className="h-5 w-5 text-blue-500" />
              </div>

              <div className="space-y-3">
                {reminders.map((rem) => (
                  <div
                    key={rem.id}
                    onClick={() => toggleReminder(rem.id)}
                    className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      rem.completed
                        ? 'bg-slate-50/80 border-slate-100 text-slate-400 line-through'
                        : 'bg-white border-slate-100 hover:border-blue-100 text-slate-800'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      {/* Check icon placeholder checkbox */}
                      <div className={`h-5 w-5 rounded-md border flex items-center justify-center transition-all shrink-0 ${
                        rem.completed
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}>
                        {rem.completed && <Check className="h-3 w-3" />}
                      </div>

                      <div className="max-w-[150px]">
                        <p className={`text-xs font-bold truncate`}>{rem.name}</p>
                        <span className="text-[9px] block text-slate-400 font-semibold leading-normal">{rem.dosage}</span>
                      </div>
                    </div>

                    <span className="text-[10px] font-semibold text-slate-450 select-none">{rem.timing}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Health Activity Timeline */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4 flex-1">
              <div>
                <h3 className="font-display font-bold text-base text-slate-950">{t('Security Activity Timeline')}</h3>
                <p className="text-[11px] text-slate-400">{t('Verifiable logging of local actions')}</p>
              </div>

              <div className="space-y-4 border-l border-slate-100 pl-4 ml-2.5 pt-2">
                {activityTimeline.map((item) => (
                  <div key={item.id} className="relative space-y-0.5">
                    {/* timeline bullet point */}
                    <span className="absolute -left-[21.5px] top-1.5 h-2 w-2 rounded-full bg-blue-600" />
                    
                    <h5 className="text-xs font-bold text-slate-900 leading-snug">{item.action}</h5>
                    <p className="text-[10px] text-slate-550 leading-none">{item.category}</p>
                    <span className="text-[9px] text-slate-400 block font-medium mt-1 uppercase">{item.time}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* Mandatory clinical warnings footer inside dashboard home as well */}
      <footer className="mt-auto py-8 bg-slate-950 text-slate-500 border-t border-slate-900 shrink-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-3.5">
          <div className="flex gap-3 items-start p-4 bg-slate-900 rounded-xl border border-slate-800">
            <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Disclaimer: Dashboard panels visual represent a local-only preview client configuration to demonstrate health records integrations. আমার ডাক্তার does not execute clinical prescription protocols or render doctor-certified critical decisions. Dial your local emergency unit immediately if you experience acute or life threatening symptoms.
            </p>
          </div>
          <p className="text-[10px] text-center">© {new Date().getFullYear()} আমার ডাক্তার AI. Cryptographically private wellness records.</p>
        </div>
      </footer>

    </div>
  );
}
