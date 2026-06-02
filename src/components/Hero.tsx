import { useState } from 'react';
import { Play, Upload, MessageSquare, ShieldCheck, CheckCircle2, ChevronRight, Activity, Calendar, HeartPulse } from 'lucide-react';
import { motion } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';

interface HeroProps {
  onStartConsultation: () => void;
  onUploadReport: () => void;
  onOpenDashboard: () => void;
}

export default function Hero({ onStartConsultation, onUploadReport, onOpenDashboard }: HeroProps) {
  const { t } = useTranslation();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <section
      id="hero-section"
      className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-radial from-blue-50/50 via-white to-white"
    >
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/30 rounded-full blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[30%] left-[-100px] w-[400px] h-[400px] bg-sky-100/20 rounded-full blur-3xl -z-10 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-6 flex flex-col space-y-6 text-left order-1">
            {/* Tagline */}
            <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100/90 rounded-full text-blue-700 text-xs font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              {t('heroTagline')}
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-5xl xl:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
              {t('Your Reliable Health')} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-sky-500">
                {t('Assistant')}
              </span>
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-lg sm:text-xl max-w-xl font-normal leading-relaxed">
              {t('Experience instant, AI-guided health consultations, seamless doctor appointments, and smart report analysis in one unified platform.')}
            </p>

            {/* Bullet Point Trust Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="flex items-center space-x-2.5 text-slate-700 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{t('Instant Symptom Analysis Overview')}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-700 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{t('Simplified Lab Report Guide')}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-700 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{t('Specialist Referrals Match')}</span>
              </div>
              <div className="flex items-center space-x-2.5 text-slate-700 text-sm">
                <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                <span>{t('Zero-Knowledge Privacy Guarantee')}</span>
              </div>
            </div>

            {/* CTA Container */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4 sm:items-center">
              <button
                id="cta-hero-start-consult"
                onClick={onStartConsultation}
                className="inline-flex items-center justify-center gap-2 group px-7 py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-medium rounded-2xl shadow-lg shadow-blue-100 hover:shadow-xl transition-all duration-200 cursor-pointer text-base"
              >
                <MessageSquare className="h-5 w-5" />
                <span>{t('Start Consultation')}</span>
                <ChevronRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                id="cta-hero-upload-report"
                onClick={onUploadReport}
                className="inline-flex items-center justify-center gap-2 px-7 py-3.5 bg-white border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 text-slate-700 hover:text-blue-700 font-medium rounded-2xl shadow-sm transition-all duration-200 cursor-pointer text-base"
              >
                <Upload className="h-5 w-5" />
                <span>{t('Upload Report')}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-sm pt-1">
              <span className="text-slate-500">{t('Already have an account? ')}</span>
              <button
                onClick={onOpenDashboard}
                className="text-blue-600 font-bold hover:text-blue-700 underline underline-offset-4 cursor-pointer"
              >
                {t('Sign in to your account →')}
              </button>
            </div>

            {/* Quick HIPAA trust badge below buttons */}
            <div className="flex items-center space-x-2 text-xs text-slate-400 font-normal pt-2">
              <ShieldCheck className="h-4 w-4 text-slate-400 shrink-0" />
              <span>{t('HIPAA Compliant Security')}</span>
            </div>
          </div>

          {/* Hero Right Graphic */}
          <div className="lg:col-span-6 relative mt-12 lg:mt-0 flex justify-center w-full order-2">
            <div className="relative w-full max-w-[450px] md:w-[90%] md:max-w-[600px] lg:w-full lg:max-w-[600px] xl:max-w-[700px] aspect-square mx-auto">
              
              {/* Skeleton Loader */}
              <div 
                className={`absolute inset-0 bg-slate-100/80 rounded-3xl animate-pulse transition-opacity duration-700 select-none pointer-events-none ${
                  isImageLoaded ? 'opacity-0 hidden' : 'opacity-100'
                }`}
              />

              <picture className={`w-full h-full flex justify-center relative z-10 transition-opacity duration-700 ${isImageLoaded ? 'opacity-100' : 'opacity-0'}`}>
                <source 
                  srcSet="https://res.cloudinary.com/duwydl2nl/image/upload/f_auto,q_auto/v1780412962/ChatGPT_Image_May_31_2026_02_44_03_PM_a1auya.webp" 
                  type="image/webp" 
                />
                <img
                  src="https://res.cloudinary.com/duwydl2nl/image/upload/v1780412962/ChatGPT_Image_May_31_2026_02_44_03_PM_a1auya.png"
                  srcSet="
                    https://res.cloudinary.com/duwydl2nl/image/upload/w_450/v1780412962/ChatGPT_Image_May_31_2026_02_44_03_PM_a1auya.png 450w,
                    https://res.cloudinary.com/duwydl2nl/image/upload/w_600/v1780412962/ChatGPT_Image_May_31_2026_02_44_03_PM_a1auya.png 600w,
                    https://res.cloudinary.com/duwydl2nl/image/upload/w_700/v1780412962/ChatGPT_Image_May_31_2026_02_44_03_PM_a1auya.png 700w"
                  sizes="(max-width: 767px) 100vw, (max-width: 1023px) 90vw, 50vw"
                  alt="AI Doctor Assistant - Human Doctor and Artificial Intelligence Healthcare Assistant"
                  loading="eager"
                  fetchPriority="high"
                  width="700"
                  height="700"
                  onLoad={() => setIsImageLoaded(true)}
                  onError={() => setIsImageLoaded(true)}
                  ref={(img) => {
                    if (img?.complete) {
                      setIsImageLoaded(true);
                    }
                  }}
                  className="w-full h-full object-contain block mx-auto"
                  style={{ aspectRatio: '1/1' }}
                />
              </picture>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
