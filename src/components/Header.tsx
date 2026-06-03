import { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, User } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import BrandLogo from './BrandLogo';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onStartConsultation: () => void;
  onOpenDashboard: () => void;
}

export const getRoleDisplay = (role: string, t: (key: string) => string) => {
  switch (role) {
    case 'user': return t('Patient');
    case 'doctor': return t('Doctor');
    case 'admin': return t('Admin');
    case 'superadmin': return t('Superuser');
    case 'assistant_admin': return t('Admin');
    default: return t('User');
  }
};

export default function Header({ onStartConsultation, onOpenDashboard }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { t } = useTranslation();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => setIsMobileMenuOpen(false);
    window.addEventListener('navigateHome', closeMenu);
    return () => window.removeEventListener('navigateHome', closeMenu);
  }, []);

  // Prevent background scrolling when menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  const scrollToSection = (id: string) => {
    setIsMobileMenuOpen(false);
    if (id === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header
      id="header-navigation"
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-sm lg:backdrop-blur-md shadow-sm border-b border-slate-200/50 py-2 sm:py-2.5'
          : 'bg-white/95 lg:bg-white/50 lg:backdrop-blur-sm py-4 sm:py-5 border-b border-slate-100 lg:border-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <BrandLogo />

          <div className="hidden lg:flex items-center space-x-4 ml-auto">
            <LanguageToggle />
            {isAuthenticated && <NotificationDropdown />}
            <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-2.5 py-1 rounded-full font-medium space-x-1">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>{t('HIPAA Compliant Standard')}</span>
            </div>
            {isAuthenticated && user ? (
              <button
                onClick={onOpenDashboard}
                className="flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
              >
                <div className="bg-blue-100 text-blue-600 p-1 rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <span>{user.fullName || user.email?.split('@')[0]} ({getRoleDisplay(user.role, t)})</span>
              </button>
            ) : (
              <button
                onClick={onOpenDashboard}
                className="px-4 py-2 hover:bg-slate-50 text-blue-600 border border-blue-200 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
              >
                {t('Sign In')}
              </button>
            )}
            <button
              id="cta-start-consultation-header"
              onClick={onStartConsultation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              {t('Start Consultation')}
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center space-x-3 ml-auto">
            {isAuthenticated && <NotificationDropdown />}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Toggle menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Slide-in Menu Panel */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[320px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              <div className="p-4 flex justify-between items-center border-b border-slate-100">
                <span className="font-bold text-slate-800 text-lg tracking-tight">Menu</span>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-5 flex flex-col space-y-6 flex-1">
                {/* Navigation Links */}
                <div className="flex flex-col space-y-4 text-slate-700 font-medium text-[15px]">
                  <button onClick={() => scrollToSection('home')} className="w-full text-left hover:text-blue-600 py-1">{t('Home')}</button>
                  <button onClick={() => scrollToSection('features')} className="w-full text-left hover:text-blue-600 py-1">{t('Features')}</button>
                  <button onClick={() => scrollToSection('faq')} className="w-full text-left hover:text-blue-600 py-1">{t('FAQ')}</button>
                </div>
                
                <div className="border-t border-slate-100 pt-6 flex flex-col space-y-5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">{t('Language')}</span>
                    <LanguageToggle />
                  </div>
                </div>

                {/* Security Information */}
                <div className="flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-2.5 rounded-xl font-medium space-x-2">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{t('HIPAA Compliant')}</span>
                </div>

                <div className="mt-auto pt-8 border-t border-slate-100 flex flex-col space-y-3 pb-8">
                  {isAuthenticated && user ? (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full flex items-center justify-center space-x-2 px-4 py-3.5 bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      <div className="bg-blue-100 text-blue-600 p-1 rounded-lg">
                        <User className="h-4 w-4" />
                      </div>
                      <span>{user.fullName || user.email?.split('@')[0]} ({getRoleDisplay(user.role, t)})</span>
                    </button>
                  ) : (
                    <>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        onOpenDashboard();
                      }}
                      className="w-full text-center px-4 py-3.5 bg-slate-50 border border-slate-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                      {t('Login / Sign Up')}
                    </button>
                    </>
                  )}
                  <button
                    id="cta-start-consultation-mobile"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      onStartConsultation();
                    }}
                    className="w-full text-center px-4 py-3.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-[0_4px_12px_-4px_rgba(37,99,235,0.3)] transition-colors cursor-pointer"
                  >
                    {t('Start Consultation')}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
