import React, { useState, useEffect, useRef } from 'react';
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
  const { isAuthenticated, user, logout, isLoading } = useAuth();
  const [view, setView] = useState<'landing' | 'consultation' | 'dashboard' | 'upload' | 'doctors' | 'auth' | 'admin' | 'doctorPortal' | 'doctorChat' | 'terms' | 'support' | 'signup'>('landing');
  const [initialUploadType, setInitialUploadType] = useState<'symptom' | 'report' | null>(null);
  const [isSymptomOpen, setIsSymptomOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [doctorActiveChatId, setDoctorActiveChatId] = useState<string | null>(null);
  const [activePatientId, setActivePatientId] = useState<string | null>(null);

  useEffect(() => {
    const handlePathname = () => {
      const path = window.location.pathname;
      if (path === '/signup') {
        setView('signup');
      } else if (path === '/login') {
        setView('auth');
      } else if (path === '/dashboard') {
        setView('dashboard');
      } else if (path === '/doctor-dashboard') {
        setView('doctorPortal');
      } else if (path === '/admin-dashboard') {
        setView('admin');
      } else if (path === '/') {
        setView('landing');
      }
    };

    // Initial check
    handlePathname();

    const handlePopState = () => {
      handlePathname();
    };

    window.addEventListener('popstate', handlePopState);
    
    const handleNavigateHome = () => {
      window.history.pushState({}, '', '/');
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
    return () => {
      window.removeEventListener('navigateHome', handleNavigateHome);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const handleStartConsultation = (type?: 'symptom' | 'report') => {
    if (!isAuthenticated) {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    
    if (type === 'report') {
      setView('upload');
    } else {
      setInitialUploadType(type || null);
      setView('consultation');
    }
  };

  const isAuthenticatedRef = useRef(isAuthenticated);
  const userRef = useRef(user);

  useEffect(() => {
    isAuthenticatedRef.current = isAuthenticated;
    userRef.current = user;
  }, [isAuthenticated, user]);

  useEffect(() => {
    // Auto-redirect away from auth pages if already logged in and session is loaded
    if (!isLoading && isAuthenticated && user) {
      if (view === 'signup' || view === 'auth' || window.location.pathname === '/signup' || window.location.pathname === '/login') {
        const isAdm = user.role === 'admin' || user.role === 'superadmin' || user.role === 'assistant_admin';
        const targetPath = isAdm ? '/admin-dashboard' : (user.role === 'doctor' ? '/doctor-dashboard' : '/dashboard');
        if (window.location.pathname !== targetPath) {
          window.history.pushState({}, '', targetPath);
          window.dispatchEvent(new PopStateEvent('popstate'));
        }
      }
    }
  }, [isLoading, isAuthenticated, user, view]);

  const handleOpenDashboard = () => {
    const isAuth = isAuthenticatedRef.current;
    const currentUser = userRef.current;
    
    if (!isAuth) {
      window.history.pushState({}, '', '/login');
      window.dispatchEvent(new PopStateEvent('popstate'));
      return;
    }
    if (currentUser?.role === 'admin' || currentUser?.role === 'superadmin' || currentUser?.role === 'assistant_admin') {
      window.history.pushState({}, '', '/admin-dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else if (currentUser?.role === 'doctor') {
      window.history.pushState({}, '', '/doctor-dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    } else {
      window.history.pushState({}, '', '/dashboard');
      window.dispatchEvent(new PopStateEvent('popstate'));
    }
  };

  const renderView = () => {
    if (view === 'admin') {
      if (isLoading) return <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div></div>;
      if (!isAuthenticated || (user?.role !== 'admin' && user?.role !== 'superadmin' && user?.role !== 'assistant_admin')) {
        setTimeout(() => {
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 0);
        return null;
      }
      return <AdminDashboard onLogout={() => setView('landing')} />;
    }

    if (view === 'doctorPortal') {
       if (isLoading) return <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div></div>;
       if (!isAuthenticated || user?.role !== 'doctor') {
         setTimeout(() => {
           window.history.pushState({}, '', '/login');
           window.dispatchEvent(new PopStateEvent('popstate'));
         }, 0);
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
          <div className="h-[calc(100dvh-72px)] w-full relative bg-slate-50 flex flex-col">
            <PaidDoctorChat 
              sessionId={doctorActiveChatId} 
              doctor={{ id: user?.id || 'doc-1', fullName: 'You', specialty: 'Doctor', photoUrl: '', bmdcRegistration: '', availableHours: '', availableStatus: '', consultationFee: 0, degree: '', experience: '', hospitalAffiliation: '', ratings: '', reviews: 0 }} 
              patientId={activePatientId || undefined}
              onExit={() => setView('doctorPortal')} 
            />
          </div>
       );
    }

    if (view === 'auth' || view === 'signup') {
      return (
        <AuthUI 
          initialView={view === 'signup' ? 'register' : 'login'}
          onSuccess={() => handleOpenDashboard()}
          onBack={() => {
            window.history.pushState({}, '', '/');
            setView('landing');
          }}
        />
      );
    }

    const needsProfileCompletion = isAuthenticated && user?.role === 'user' && !user?.profileCompleted;

    if (view === 'consultation') {
      if (isLoading) return <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div></div>;
      if (!isAuthenticated) {
        setTimeout(() => {
          window.history.pushState({}, '', '/login');
          window.dispatchEvent(new PopStateEvent('popstate'));
        }, 0);
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
      if (isLoading) return <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div></div>;
      
      if (!isAuthenticated) {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
        return null;
      }

      if (needsProfileCompletion) {
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
      if (isLoading) return <div className="h-[100dvh] w-full flex items-center justify-center bg-slate-50"><div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-blue-600 animate-spin"></div></div>;
      if (!isAuthenticated) {
        window.history.pushState({}, '', '/login');
        window.dispatchEvent(new PopStateEvent('popstate'));
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
      <Header 
        onStartConsultation={() => handleStartConsultation('symptom')} 
        onOpenDashboard={handleOpenDashboard}
      />
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
