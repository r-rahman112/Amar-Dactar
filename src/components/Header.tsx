import { useState, useEffect, useRef } from 'react';
import { Menu, X, ShieldCheck, User, LogOut, LayoutDashboard } from 'lucide-react';
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
    case 'user': return t('User');
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
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  
  const { t } = useTranslation();
  const { isAuthenticated, user, logout } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const closeMenu = () => {
       setIsMobileMenuOpen(false);
       setIsUserMenuOpen(false);
    };
    window.addEventListener('navigateHome', closeMenu);
    return () => window.removeEventListener('navigateHome', closeMenu);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
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
      } else {
        // Handle case where we are not on the landing page
        window.history.pushState({}, '', '/');
        window.dispatchEvent(new PopStateEvent('popstate'));
        setTimeout(() => {
           const retryElement = document.getElementById(id);
           if (retryElement) retryElement.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      }
    }
  };

  const handleLogout = async () => {
     setIsUserMenuOpen(false);
     setIsMobileMenuOpen(false);
     await logout();
     window.history.pushState({}, '', '/');
     window.dispatchEvent(new PopStateEvent('popstate'));
  };

  return (
    <header
      id="header-navigation"
      className={`sticky top-0 z-50 w-full transition-all duration-300 ease-out ${
        isScrolled
          ? 'bg-white/85 backdrop-blur-md shadow-sm border-b border-slate-200/50 py-2 sm:py-2.5'
          : 'bg-white/95 lg:bg-white/50 lg:backdrop-blur-md py-3 sm:py-4 border-b border-slate-100'
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
            
            <button
              id="cta-start-consultation-header"
              onClick={onStartConsultation}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-xl shadow-sm hover:shadow transition-all duration-200 cursor-pointer"
            >
              {t('Start Consultation')}
            </button>

            {isAuthenticated && user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 px-3 py-1.5 hover:bg-slate-50 text-slate-800 border border-slate-200 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100"
                  aria-expanded={isUserMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="bg-blue-100 text-blue-600 p-1 rounded-lg">
                    <User className="h-4 w-4" />
                  </div>
                  <span>{user.fullName || user.email?.split('@')[0]}</span>
                </button>
                <AnimatePresence>
                  {isUserMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1"
                    >
                      <button 
                        onClick={() => { setIsUserMenuOpen(false); onOpenDashboard(); }} 
                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-slate-700 text-sm font-medium flex items-center transition-colors cursor-pointer"
                      >
                        <LayoutDashboard className="h-4 w-4 mr-2 text-slate-400" />
                        {t('Dashboard')}
                      </button>
                      <div className="h-px bg-slate-100 my-1 font-medium"></div>
                      <button 
                        onClick={handleLogout} 
                        className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-red-600 text-sm font-medium flex items-center transition-colors cursor-pointer"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        {t('Logout')}
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/login');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="px-4 py-2 text-slate-700 hover:text-blue-600 hover:bg-slate-50 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                >
                  {t('Sign In')}
                </button>
                <button
                  onClick={() => {
                    window.history.pushState({}, '', '/signup');
                    window.dispatchEvent(new PopStateEvent('popstate'));
                  }}
                  className="px-4 py-2 hover:bg-slate-50 text-blue-600 border border-blue-200 text-sm font-medium rounded-xl transition-all duration-200 cursor-pointer"
                >
                  {t('Sign Up')}
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="lg:hidden flex items-center space-x-3 ml-auto">
            {isAuthenticated && <NotificationDropdown />}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-100"
              aria-label="Toggle menu"
              aria-expanded={isMobileMenuOpen}
              aria-controls="mobile-menu-panel"
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
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden fixed inset-0 bg-slate-900/40 z-40 backdrop-blur-sm"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Close Mobile Menu Overlay"
            />
            <motion.div
              id="mobile-menu-panel"
              role="dialog"
              aria-modal="true"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="lg:hidden fixed top-0 right-0 bottom-0 w-[320px] bg-white shadow-2xl z-50 flex flex-col overflow-y-auto"
            >
              <div className="p-4 flex items-center justify-between border-b border-slate-100">
                {isAuthenticated && user ? (
                  <div className="flex items-center space-x-3 max-w-[240px]">
                    <div className="bg-blue-100 text-blue-600 p-2 rounded-full shrink-0">
                      <User className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-slate-800 text-[15px] leading-tight truncate">
                        {user.fullName || user.email?.split('@')[0]}
                      </h3>
                      <div className="inline-block px-1.5 py-0.5 mt-0.5 bg-blue-50 text-blue-700 text-[11px] font-semibold rounded-md">
                        {getRoleDisplay(user.role, t)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <BrandLogo />
                )}
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors shrink-0 cursor-pointer"
                  aria-label="Close menu"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
              
              <div className="p-5 flex flex-col space-y-6 flex-1">
                {isAuthenticated && user ? (
                  <div className="flex flex-col space-y-2">
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); onOpenDashboard(); }}
                      className="w-full text-left px-4 py-3 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-800 font-medium rounded-xl flex items-center transition-colors cursor-pointer"
                    >
                      <LayoutDashboard className="h-5 w-5 mr-3 text-slate-500" />
                      {t('Dashboard')}
                    </button>
                    <button 
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-3 bg-red-50 border border-red-100 hover:bg-red-100 text-red-600 font-medium rounded-xl flex items-center transition-colors cursor-pointer"
                    >
                      <LogOut className="h-5 w-5 mr-3" />
                      {t('Logout')}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-col space-y-2 text-slate-700 font-medium text-[15px]">
                      <button onClick={() => scrollToSection('home')} className="w-full text-left hover:text-blue-600 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">{t('home')}</button>
                      <button onClick={() => scrollToSection('features')} className="w-full text-left hover:text-blue-600 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">{t('features')}</button>
                      <button onClick={() => scrollToSection('faq')} className="w-full text-left hover:text-blue-600 px-4 py-2 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer">{t('FAQ')}</button>
                    </div>

                    <div className="flex flex-col space-y-3 pt-4 border-t border-slate-100">
                      <button
                        id="cta-start-consultation-mobile"
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          onStartConsultation();
                        }}
                        className="w-full text-center px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-sm transition-colors cursor-pointer"
                      >
                        {t('Start Consultation')}
                      </button>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.history.pushState({}, '', '/login');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="w-full text-center px-4 py-3 bg-white border border-blue-200 text-blue-600 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {t('Sign In')}
                      </button>

                      <button
                        onClick={() => {
                          setIsMobileMenuOpen(false);
                          window.history.pushState({}, '', '/signup');
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }}
                        className="w-full text-center px-4 py-3 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-bold rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        {t('Sign Up')}
                      </button>
                    </div>
                  </>
                )}
                
                <div className="mt-auto pt-6 border-t border-slate-100 flex flex-col space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-slate-600">{t('Language')}</span>
                    <LanguageToggle />
                  </div>
                  
                  {/* Security Information */}
                  <div className="flex items-center text-xs text-emerald-700 bg-emerald-50 border border-emerald-200/80 px-3 py-2.5 rounded-xl font-medium space-x-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>{t('HIPAA Compliant')}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
