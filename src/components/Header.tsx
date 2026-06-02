import { useState, useEffect } from 'react';
import { Menu, X, ShieldCheck, User } from 'lucide-react';
import BrandLogo from './BrandLogo';
import LanguageToggle from './LanguageToggle';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import NotificationDropdown from './NotificationDropdown';

interface HeaderProps {
  onStartConsultation: () => void;
  onOpenDashboard: () => void;
}

export const getRoleDisplay = (role: string) => {
  switch (role) {
    case 'user': return 'রোগী';
    case 'doctor': return 'ডাক্তার';
    case 'admin': return 'অ্যাডমিন';
    case 'superadmin': return 'সুপার অ্যাডমিন';
    case 'assistant_admin': return 'অ্যাসিস্ট্যান্ট অ্যাডমিন';
    default: return 'User';
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

  return (
    <header
      id="header-navigation"
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/90 backdrop-blur-md shadow-sm border-b border-blue-50/80 py-3'
          : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo & Brand */}
          <BrandLogo />

          <div className="hidden md:flex items-center space-x-4 ml-auto">
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
                <span>{user.fullName || user.email?.split('@')[0]} ({getRoleDisplay(user.role)})</span>
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
          <div className="md:hidden flex items-center space-x-3 ml-auto">
            <LanguageToggle isMobile={false} />
            {isAuthenticated && <NotificationDropdown />}
            <button
              id="mobile-menu-toggle"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Panel */}
      {isMobileMenuOpen && (
        <div className="md:hidden animate-fade-in bg-white border-b border-slate-100 shadow-lg absolute top-full left-0 right-0 py-4 px-4 space-y-3 z-50">
          <div className="pt-4 border-t border-slate-100 flex flex-col space-y-3">
            <div className="flex items-center text-xs text-emerald-600 bg-emerald-50 border border-emerald-100/80 px-3 py-1.5 rounded-full font-medium space-x-1.5 self-start">
              <ShieldCheck className="h-4 w-4" />
              <span>{t('HIPAA Compliant Standard')}</span>
            </div>
            {isAuthenticated && user ? (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 text-base font-medium rounded-xl transition-colors cursor-pointer"
              >
                <div className="bg-blue-100 text-blue-600 p-1 rounded-lg">
                  <User className="h-4 w-4" />
                </div>
                <span>{user.fullName || user.email?.split('@')[0]} ({getRoleDisplay(user.role)})</span>
              </button>
            ) : (
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenDashboard();
                }}
                className="w-full text-center px-4 py-2.5 bg-slate-50 border border-slate-200 text-blue-600 text-base font-medium rounded-xl transition-colors cursor-pointer"
              >
                {t('Sign In')}
              </button>
            )}
            <button
              id="cta-start-consultation-mobile"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onStartConsultation();
              }}
              className="w-full text-center px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-base font-medium rounded-xl shadow transition-colors cursor-pointer"
            >
              {t('Start Consultation')}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
