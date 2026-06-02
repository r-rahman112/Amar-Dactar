import { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Features from './components/Features';
import HowItWorks from './components/HowItWorks';
import Testimonials from './components/Testimonials';
import FAQ from './components/FAQ';
import Footer from './components/Footer';
import SymptomModal from './components/SymptomModal';
import ReportModal from './components/ReportModal';
import ConsultationWorkspace from './components/ConsultationWorkspace';
import PatientDashboard from './components/PatientDashboard';
import MedicalReportUpload from './components/MedicalReportUpload';
import DoctorRecommendation from './components/DoctorRecommendation';
import AuthUI from './components/AuthUI';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PaidDoctorChat from './components/PaidDoctorChat';
import { useAuth } from './contexts/AuthContext';

export default function App() {
  const { isAuthenticated, user } = useAuth();
  const [view, setView] = useState<'landing' | 'consultation' | 'dashboard' | 'upload' | 'doctors' | 'auth' | 'admin' | 'doctorPortal' | 'doctorChat'>('landing');
  const [initialUploadType, setInitialUploadType] = useState<'symptom' | 'report' | null>(null);
  const [isSymptomOpen, setIsSymptomOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [doctorActiveChatId, setDoctorActiveChatId] = useState<string | null>(null);

  const handleStartConsultation = (type?: 'symptom' | 'report') => {
    if (!isAuthenticated) {
      setView('auth');
      return;
    }
    setInitialUploadType(type || null);
    setView('consultation');
  };

  const handleOpenDashboard = () => {
    if (!isAuthenticated) {
      setView('auth');
      return;
    }
    if (user?.role === 'admin' || user?.role === 'superadmin' || user?.role === 'assistant_admin') {
      setView('admin');
    } else if (user?.role === 'doctor') {
      setView('doctorPortal');
    } else {
      setView('dashboard');
    }
  };

  if (view === 'admin') {
    if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'assistant_admin')) {
      setView('auth');
      return null;
    }
    return (
      <AdminDashboard 
        onLogout={() => setView('landing')}
      />
    );
  }

  if (view === 'doctorPortal') {
     if (!isAuthenticated || user?.role !== 'doctor') {
       setView('auth');
       return null;
     }
     return (
       <DoctorDashboard 
         onLogout={() => setView('landing')}
         onOpenConsultation={(sessionId) => {
           setDoctorActiveChatId(sessionId);
           setView('doctorChat');
         }}
       />
     );
  }

  if (view === 'doctorChat' && doctorActiveChatId) {
     return (
        <div className="h-screen w-screen relative bg-slate-50 flex flex-col">
          <PaidDoctorChat 
            sessionId={doctorActiveChatId} 
            doctor={{ id: user?.id || 'doc-1', fullName: 'You', specialty: 'Doctor', photoUrl: '', bmdcRegistration: '', availableHours: '', availableStatus: '', consultationFee: 0, degree: '', experience: '', hospitalAffiliation: '', ratings: '', reviews: 0 }} 
            onExit={() => setView('doctorPortal')} 
          />
        </div>
     );
  }

  if (view === 'auth') {
    return (
      <AuthUI 
        onSuccess={() => handleOpenDashboard()}
        onBack={() => setView('landing')}
      />
    );
  }

  if (view === 'consultation') {
    if (!isAuthenticated) return <AuthUI onSuccess={() => setView('consultation')} onBack={() => setView('landing')} />;
    return (
      <ConsultationWorkspace 
        onBackToHome={() => {
          setView('landing');
          setInitialUploadType(null);
        }}
        initialUploadType={initialUploadType}
      />
    );
  }

  if (view === 'dashboard') {
    if (!isAuthenticated) return <AuthUI onSuccess={() => setView('dashboard')} onBack={() => setView('landing')} />;
    return (
      <PatientDashboard
        onBackToHome={() => setView('landing')}
        onStartConsultation={handleStartConsultation}
        onUploadReport={() => setView('upload')}
        onFindDoctor={() => setView('doctors')}
      />
    );
  }

  if (view === 'upload') {
    if (!isAuthenticated) return <AuthUI onSuccess={() => setView('upload')} onBack={() => setView('landing')} />;
    return (
      <MedicalReportUpload onBack={() => setView('dashboard')} />
    );
  }

  if (view === 'doctors') {
    return (
      <DoctorRecommendation onBack={() => setView('dashboard')} />
    );
  }

  return (
    <div className="relative min-h-screen bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-800 overflow-x-hidden antialiased">
      {/* Dynamic Header */}
      <Header 
        onStartConsultation={() => handleStartConsultation('symptom')} 
        onOpenDashboard={handleOpenDashboard}
      />

      {/* Main Sections */}
      <main>
        {/* Hero Section */}
        <Hero 
          onStartConsultation={() => handleStartConsultation('symptom')} 
          onUploadReport={() => handleStartConsultation('report')} 
          onOpenDashboard={handleOpenDashboard}
        />

        {/* Features Section */}
        <Features />

        {/* How It Works Section */}
        <HowItWorks />

        {/* Testimonials Section */}
        <Testimonials />

        {/* FAQ Section */}
        <FAQ />
      </main>

      {/* Footer */}
      <Footer />

      {/* Interactive Questionnaire Consultation Simulator Popup */}
      <SymptomModal 
        isOpen={isSymptomOpen} 
        onClose={() => setIsSymptomOpen(false)} 
      />

      {/* Interactive Report Parser/Expaliner Selector Popup */}
      <ReportModal 
        isOpen={isReportOpen} 
        onClose={() => setIsReportOpen(false)} 
      />
    </div>
  );
}
