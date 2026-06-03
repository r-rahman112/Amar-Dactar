import { Play, Upload, MessageSquare, ShieldCheck, CheckCircle2, ChevronRight, Activity, Calendar, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import heroImage from '../assets/hero.png';
interface HeroProps {
  onStartConsultation: () => void;
  onUploadReport: () => void;
  onOpenDashboard: () => void;
}

export default function Hero({ onStartConsultation, onUploadReport, onOpenDashboard }: HeroProps) {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  
  // Mobile Check
  const [isDesktop, setIsDesktop] = useState(true);

  useEffect(() => {
    const checkMobile = () => {
      setIsDesktop(window.innerWidth >= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <section
      id="hero-section"
      className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden bg-radial from-blue-50/50 via-white to-white"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[30%] left-[-100px] w-[400px] h-[400px] bg-sky-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-5 flex flex-col space-y-6 text-center md:text-left items-center md:items-start order-1">
            {/* Tagline */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100/90 rounded-full text-blue-700 text-xs font-semibold tracking-wider"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              {t('heroTagline')}
            </motion.div>

            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
              className="font-display text-3xl sm:text-4xl md:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-tight tracking-tight"
            >
              {t('Your Reliable Health')} <br className="hidden sm:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                {t('Assistant')}
              </span>
            </motion.h1>

            {/* Description */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
              className="text-slate-600 text-base sm:text-lg md:text-xl max-w-xl font-normal leading-relaxed"
            >
              {t('Experience instant, AI-guided health consultations, seamless doctor appointments, and smart report analysis in one unified platform.')}
            </motion.p>

            {/* Bullet Point Trust Checklist */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 w-fit mx-auto md:w-full md:mx-0"
            >
              <div className="flex items-center justify-start gap-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-[20px] h-[20px] text-emerald-500 shrink-0" />
                <span className="flex-1 text-left">{t('Instant Symptom Analysis Overview')}</span>
              </div>
              <div className="flex items-center justify-start gap-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-[20px] h-[20px] text-emerald-500 shrink-0" />
                <span className="flex-1 text-left">{t('Simplified Lab Report Guide')}</span>
              </div>
              <div className="flex items-center justify-start gap-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-[20px] h-[20px] text-emerald-500 shrink-0" />
                <span className="flex-1 text-left">{t('Specialist Referrals Match')}</span>
              </div>
              <div className="flex items-center justify-start gap-3 text-slate-700 text-sm">
                <CheckCircle2 className="w-[20px] h-[20px] text-emerald-500 shrink-0" />
                <span className="flex-1 text-left">{t('Zero-Knowledge Privacy Guarantee')}</span>
              </div>
            </motion.div>

            {/* CTA Container */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4, ease: "easeOut" }}
              className="flex flex-col sm:flex-row gap-3 pt-4 items-center justify-center md:justify-start w-full"
            >
              <button
                id="cta-hero-start-consult"
                onClick={onStartConsultation}
                className="w-full max-w-[320px] sm:max-w-none sm:w-auto inline-flex items-center justify-center gap-2 group px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all duration-200 cursor-pointer text-base"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{t('Start Consultation')}</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="cta-hero-upload-report"
                onClick={onUploadReport}
                className="w-full max-w-[320px] sm:max-w-none sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 text-slate-700 hover:text-blue-700 font-medium rounded-2xl shadow-sm transition-all duration-200 cursor-pointer text-base"
              >
                <Upload className="h-5 w-5" />
                <span>{t('Upload Report')}</span>
              </button>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5, ease: "easeOut" }}
              className="flex flex-col gap-2 pt-1 w-full"
            >
              {!isAuthenticated && (
                <div className="flex flex-row items-baseline justify-center md:justify-start gap-1.5 mt-2 md:mt-0 pt-1 w-full">
                  <span className="text-slate-500 text-[14px] md:text-sm">{t('Already have Account?')}</span>
                  <button
                    onClick={onOpenDashboard}
                    className="text-blue-600 font-semibold text-[15px] md:text-sm hover:text-blue-700 md:underline md:underline-offset-4 cursor-pointer"
                  >
                    {t('Sign In →')}
                  </button>
                </div>
              )}

              {/* Quick HIPAA trust badge below buttons */}
              <div className="flex items-center justify-center md:justify-start space-x-2 text-xs text-slate-400 font-normal mt-2 w-full">
                <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
                <span>{t('HIPAA Compliant Security')}</span>
              </div>
            </motion.div>
          </div>

          {/* Hero Image */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="lg:col-span-7 flex justify-center items-center order-2 mt-10 lg:mt-0"
          >
            <div className="relative overflow-hidden rounded-[28px] shadow-2xl shadow-blue-100/30 bg-white w-full max-w-full md:max-w-[500px] lg:max-w-[580px] xl:max-w-[620px] 2xl:max-w-[650px] lg:translate-x-[30px] xl:translate-x-[40px] 2xl:translate-x-[60px] flex justify-center items-center">
              <img
                src={heroImage}
                alt="আমার ডাক্তার AI স্বাস্থ্য সহকারী"
                loading="eager"
                decoding="async"
                draggable={false}
                className="w-full h-auto object-contain block select-none"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
