import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowLeft, ShieldCheck, Eye, EyeOff, Activity } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './BrandLogo';
import PatientRegistration from './PatientRegistration';

type AuthView = 'login' | 'register' | 'forgot-password' | 'verify-otp';

interface AuthUIProps {
  onSuccess: () => void;
  onBack: () => void;
  onAdminAccess?: () => void;
}

export default function AuthUI({ onSuccess, onBack, onAdminAccess }: AuthUIProps) {
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const { t } = useTranslation();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    otp: ['', '', '', '', '', '']
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...formData.otp];
    newOtp[index] = value;
    setFormData(prev => ({ ...prev, otp: newOtp }));
    
    // Auto-focus next input
    if (value !== '' && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const simulateLoading = (callback: () => void) => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      callback();
    }, 1500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);

    try {
      if (view === 'login') {
        const res = await fetch('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        login(data.user);
        onSuccess();
      } else if (view === 'register') {
        const res = await fetch('/api/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ fullName: formData.name, email: formData.email, password: formData.password, role: 'user' })
        });
        if (res.ok) {
           setView('login');
           // Replaced success msg with a simple alert for brevity or removed
        } else {
           const errData = await res.json();
           throw new Error(errData.error || 'Failed to register');
        }
      } else if (view === 'forgot-password') {
        const res = await fetch('/api/users/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: formData.email, type: 'password_reset' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
        setView('verify-otp');
      } else if (view === 'verify-otp') {
        const res = await fetch('/api/users/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: formData.email, type: 'password_reset', otp: formData.otp.join('') })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
        // Actually here we would change the password, but since this is just OTP verification:
        window.alert("Password reset OTP verified! You can now reset your password.");
        setView('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const titleVariant = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } }
  };

  const formVariant = {
    hidden: { opacity: 0, scale: 0.98 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3, delay: 0.1 } },
    exit: { opacity: 0, scale: 0.98, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="absolute top-6 left-6 cursor-pointer text-slate-500 hover:text-slate-800 transition-colors" onClick={onBack}>
        <ArrowLeft className="h-6 w-6" />
      </div>

      {view === 'register' ? (
        <div className="w-full relative z-10 my-10 mt-20">
           <PatientRegistration onSuccess={onSuccess} onLoginClick={() => setView('login')} />
        </div>
      ) : (
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-slate-200/50 p-8 border border-slate-100 overflow-hidden relative">
        <div className="flex justify-center mb-6">
          <BrandLogo />
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={`header-${view}`}
            variants={titleVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center mb-8"
          >
            <h1 className="text-2xl font-bold text-slate-900 mb-2 font-display">
              {view === 'login' && t('Login to chat with AI Assistant')}
              {view === 'forgot-password' && t('Reset password')}
              {view === 'verify-otp' && t('Verify your email')}
            </h1>
            <p className="text-sm text-slate-500">
              {view === 'login' && t('Sign in to access your healthcare portal.')}
              {view === 'forgot-password' && t("Enter your email and we'll send a code.")}
              {view === 'verify-otp' && `Enter the 6-digit code sent to ${formData.email || 'your email'}.`}
            </p>
          </motion.div>
        </AnimatePresence>

        {errorMsg && (
          <div className="mb-4 p-3 bg-red-50 border border-red-100 text-red-600 text-sm font-medium rounded-xl text-center shadow-sm">
            {errorMsg}
          </div>
        )}

        <AnimatePresence mode="wait">
          <motion.form
            key={`form-${view}`}
            variants={formVariant}
            initial="hidden"
            animate="visible"
            exit="exit"
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {(view === 'login' || view === 'forgot-password') && (
              <div>
                <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1 block">{t('Email Address')}</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="hi@example.com"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-4 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
            )}

            {view === 'login' && (
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-xs font-semibold text-slate-600 uppercase tracking-wider block">{t('Password')}</label>
                  {view === 'login' && (
                    <button type="button" onClick={() => setView('forgot-password')} className="text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors">
                      {t('Forgot?')}
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 pl-10 pr-10 text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {view === 'verify-otp' && (
              <div className="flex justify-between gap-2 max-w-xs mx-auto mb-6">
                {formData.otp.map((digit, i) => (
                  <input
                    key={i}
                    id={`otp-${i}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    className="w-12 h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                  />
                ))}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-6 py-3.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-black transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-slate-400 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {view === 'login' && t('Sign in')}
                  {view === 'forgot-password' && t('Send code')}
                  {view === 'verify-otp' && (
                    <>
                      <ShieldCheck className="h-4 w-4" /> {t('Verify')}
                    </>
                  )}
                </>
              )}
            </button>
          </motion.form>
        </AnimatePresence>

        <div className="mt-8 text-center text-sm font-medium">
          {view === 'login' && (
            <p className="text-slate-500">
              {t("Don't have an account? ")}
              <button 
                type="button" 
                onClick={() => setView('register')} 
                className="text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
              >
                {t('Sign up')}
              </button>
            </p>
          )}
          {(view === 'forgot-password' || view === 'verify-otp') && (
            <button onClick={() => setView('login')} className="text-slate-500 hover:text-slate-800 transition-colors">
              {t('Back to login')}
            </button>
          )}
        </div>
      </div>
      )}
    </div>
  );
}
