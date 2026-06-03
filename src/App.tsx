import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
import HealthVault from './components/HealthVault';
import DoctorRecommendation from './components/DoctorRecommendation';
import AuthUI from './components/AuthUI';
import AdminDashboard from './components/AdminDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import PaidDoctorChat from './components/PaidDoctorChat';
import TermsOfService from './components/TermsOfService';
import Support from './components/Support';
import { useAuth } from './contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

import PatientRegistration from './components/PatientRegistration';

export default function App() {
  const { isAuthenticated, user, logout } = useAuth();
  const [view, setView] = useState<'landing' | 'consultation' | 'dashboard' | 'upload' | 'doctors' | 'auth' | 'admin' | 'doctorPortal' | 'doctorChat' | 'terms' | 'support'>('landing');
  const [initialUploadType, setInitialUploadType] = useState<'symptom' | 'report' | null>(null);
  const [isSymptomOpen, setIsSymptomOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [doctorActiveChatId, setDoctorActiveChatId] = useState<string | null>(null);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  useEffect(() => {
    const handleNavigateHome = () => {
      setView('landing');
      setInitialUploadType(null);
      setTimeout(() => {
        const heroEl = document.getElementById('hero-section');
        if (heroEl) {
          heroEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    };

    window.addEventListener('navigateHome', handleNavigateHome);
    return () => window.removeEventListener('navigateHome', handleNavigateHome);
  }, []);

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

  const renderView = () => {
    if (view === 'admin') {
      if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'assistant_admin')) {
        setTimeout(() => setView('auth'), 0);
        return null;
      }
      return <AdminDashboard onLogout={() => setView('landing')} />;
    }

    if (view === 'doctorPortal') {
       if (!isAuthenticated || user?.role !== 'doctor') {
         setTimeout(() => setView('auth'), 0);
         return null;
       }
       return (
         <DoctorDashboard 
           onLogout={() => setView('landing')}
           onOpenConsultation={(sessionId, patientId) => {
             setDoctorActiveChatId(sessionId);
             setActivePatientId(patientId || null);
             setView('doctorChat');
           }}
         />
       );
    }

    if (view === 'doctorChat' && doctorActiveChatId) {
       return (
          <div className="h-[100dvh] w-full relative bg-slate-50 flex flex-col">
            <PaidDoctorChat 
              sessionId={doctorActiveChatId} 
              doctor={{ id: user?.id || 'doc-1', fullName: 'You', specialty: 'Doctor', photoUrl: '', bmdcRegistration: '', availableHours: '', availableStatus: '', consultationFee: 0, degree: '', experience: '', hospitalAffiliation: '', ratings: '', reviews: 0 }} 
              patientId={activePatientId || undefined}
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

    const needsProfileCompletion = isAuthenticated && user?.role === 'user' && !user?.profileCompleted;

    if (needsProfileCompletion && view !== 'landing') {
      return (
         <div className="bg-slate-50 min-h-[100dvh] py-12">
           <PatientRegistration 
              isCompletingProfile={true} 
              initialStep={2} 
              onSuccess={handleOpenDashboard} 
              onLoginClick={() => logout()} 
           />
         </div>
      );
    }

    if (view === 'consultation') {
      if (!isAuthenticated) {
        setTimeout(() => setView('auth'), 0);
        return null;
      }
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
      if (!isAuthenticated) {
        setTimeout(() => setView('auth'), 0);
        return null;
      }
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
      if (!isAuthenticated) {
        setTimeout(() => setView('auth'), 0);
        return null;
      }
      return <HealthVault onBack={() => setView('dashboard')} />;
    }

    if (view === 'doctors') {
      return <DoctorRecommendation onBack={() => setView('dashboard')} />;
    }

    if (view === 'terms') {
      return <TermsOfService onBack={() => setView('landing')} />;
    }

    if (view === 'support') {
      return <Support onBack={() => setView('landing')} />;
    }

    return (
      <div className="relative min-h-[100dvh] bg-slate-50 text-slate-800 selection:bg-blue-100 selection:text-blue-800 antialiased">
        <Header 
          onStartConsultation={() => handleStartConsultation('symptom')} 
          onOpenDashboard={handleOpenDashboard}
        />
        <main>
          <Hero 
            onStartConsultation={() => handleStartConsultation('symptom')} 
            onUploadReport={() => handleStartConsultation('report')} 
            onOpenDashboard={handleOpenDashboard}
          />
          <Features />
          <HowItWorks />
          <Testimonials />
          <FAQ />
        </main>
        <Footer onTermsClick={() => setView('terms')} onSupportClick={() => setView('support')} />
        <SymptomModal isOpen={isSymptomOpen} onClose={() => setIsSymptomOpen(false)} />
        <ReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />
      </div>
    );
  };

  return (
    <>
      <Toaster position="top-center" />
      <AnimatePresence mode="wait">
        <motion.div 
          key={view}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="w-full"
        >
          {renderView()}
        </motion.div>
      </AnimatePresence>
    </>
  );
}
