import toast from "react-hot-toast";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, Phone, ArrowLeft, ShieldCheck, Eye, EyeOff, Activity, AlertCircle } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import BrandLogo from './BrandLogo';
import PatientRegistration from './PatientRegistration';
import { auth, googleProvider, facebookProvider, appleProvider, missingFirebaseEnvVars } from '../lib/firebase';
import {
  signInWithPopup,
  signInWithRedirect
} from "firebase/auth";
import { apiClient } from '../apiClient';
type AuthView = 'login' | 'register' | 'forgot-password' | 'verify-otp';

interface AuthUIProps {
  onSuccess: () => void;
  onBack: () => void;
  onAdminAccess?: () => void;
  initialView?: AuthView;
}

export default function AuthUI({ onSuccess, onBack, onAdminAccess, initialView = 'login' }: AuthUIProps) {
  const [view, setView] = useState<AuthView>(initialView);
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
        const res = await apiClient('/api/users/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: formData.email, password: formData.password })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Login failed');
        login(data.user);
        onSuccess();
      } else if (view === 'register') {
        // ... handled in PatientRegistration component initially mapped to 'register' ...
      } else if (view === 'forgot-password') {
        const res = await apiClient('/api/users/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: formData.email, type: 'password_reset' })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to request OTP');
        setView('verify-otp');
      } else if (view === 'verify-otp') {
        const res = await apiClient('/api/users/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ identifier: formData.email, type: 'password_reset', otp: formData.otp.join('') })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
        // Actually here we would change the password, but since this is just OTP verification:
        toast.success('Password reset OTP verified! You can now reset your password.');
        setView('login');
      }
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  const [showSocialConsent, setShowSocialConsent] = useState(false);
  const [socialUserData, setSocialUserData] = useState<{ user: any; provider: string } | null>(null);

  const getProviderInstance = (providerName: string) => {
    switch (providerName) {
      case 'facebook': return facebookProvider;
      case 'apple': return appleProvider;
      case 'google':
      default: return googleProvider;
    }
  };

  const handleSocialSignIn = async (providerName: string, withConsent = false) => {
    setErrorMsg(null);
    setLoading(true);
    try {
      let dataContext = socialUserData;
      let user = dataContext?.user;
      
      if (!user) {
         if (!auth) {
           throw new Error(`Firebase sign-in is unavailable. Missing: ${missingFirebaseEnvVars.join(', ')}`);
         }
         const authProvider = getProviderInstance(providerName);
         try {
           const result = await signInWithPopup(auth, authProvider);
           user = result.user;
         } catch (popupErr: any) {
           console.warn("Popup sign in failed, falling back to redirect. Error:", popupErr);
           // Fallback to redirect on any error since popup issues can happen in many ways on mobile/social apps.
           await signInWithRedirect(auth, authProvider);
           return; // Execution stops here for redirect
         }
         
         setSocialUserData({ user, provider: providerName });
      } else {
         providerName = dataContext!.provider;
      }
      
      const res = await apiClient('/api/users/social-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          idToken: await user.getIdToken(),
          uid: user.uid,
          email: user.email || `${user.uid}@${providerName}.unknown`,
          displayName: user.displayName,
          photoURL: user.photoURL,
          hasAcceptedConsent: withConsent,
          provider: providerName
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || `${providerName} login failed`);
      
      if (data.action === 'REQUIRES_CONSENT') {
        setShowSocialConsent(true);
        setLoading(false);
        return;
      }
      
      setShowSocialConsent(false);
      login(data.user);
      onSuccess();
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Social Sign-In failed');
    } finally {
      if (!showSocialConsent) {
        setLoading(false);
      }
    }
  };

  const titleVariant = {
    hidden: { opacity: 0, y: -5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25 } },
    exit: { opacity: 0, y: -5, transition: { duration: 0.2 } }
  };

  const formVariant = {
    hidden: { opacity: 0, y: 5 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.25, delay: 0.05 } },
    exit: { opacity: 0, y: 5, transition: { duration: 0.2 } }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col justify-center items-center p-4">
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
          <div role="alert" aria-live="assertive" className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-medium rounded-xl flex items-start gap-2 shadow-sm text-left">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-500" aria-hidden="true" />
            <span className="w-full break-words space-y-1">{errorMsg}</span>
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
            
            {view === 'login' && (
              <>
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-white text-slate-500">{t('Or')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('google', false)}
                    disabled={loading}
                    title={t("Continue with Google")}
                    className="w-14 h-14 bg-white border border-slate-200 text-slate-700 rounded-2xl flex justify-center items-center hover:bg-slate-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 group"
                  >
                    <svg className="w-6 h-6 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('facebook', false)}
                    disabled={loading}
                    title={t("Continue with Facebook")}
                    className="w-14 h-14 bg-white border border-slate-200 text-[#1877F2] rounded-2xl flex justify-center items-center hover:bg-slate-50 hover:text-[#166FE5] transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 group"
                  >
                    <svg className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSocialSignIn('apple', false)}
                    disabled={loading}
                    title={t("Continue with Apple")}
                    className="w-14 h-14 bg-white border border-slate-200 text-black rounded-2xl flex justify-center items-center hover:bg-gray-50 transition-all shadow-sm active:scale-[0.98] disabled:opacity-70 group"
                  >
                    <svg className="w-6 h-6 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                       <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.56-1.701z" />
                    </svg>
                  </button>
                </div>
              </>
            )}
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

      {/* Social Consent Modal */}
      {showSocialConsent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-6 font-display">Healthcare Disclaimer</h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 space-y-3 text-slate-700 text-sm font-medium">
              <p>{t('আমি বুঝতে পারছি যে "আমার ডাক্তার" একটি AI সহায়ক প্ল্যাটফর্ম।')}</p>
              <p>{t('AI কোনো চিকিৎসক নয় এবং এটি রোগ নির্ণয় বা চিকিৎসা প্রেসক্রাইব করে না।')}</p>
              <p>{t('জরুরি অবস্থায় আমি সরাসরি চিকিৎসকের সাথে যোগাযোগ করব।')}</p>
            </div>
            
            <div className="flex justify-end gap-3 w-full">
              <button
                onClick={() => setShowSocialConsent(false)}
                className="w-full py-3.5 bg-slate-100 text-slate-700 rounded-xl font-bold hover:bg-slate-200 transition-colors"
              >
                {t('Cancel')}
              </button>
              <button
                onClick={() => handleSocialSignIn('', true)}
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
              >
                {loading ? t('Please wait...') : t('I Accept')}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
}
