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
          <div className="lg:col-span-7 flex flex-col space-y-6 text-left">
            {/* Tagline */}
            <div className="inline-flex self-start items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100/90 rounded-full text-blue-700 text-xs font-semibold tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse"></span>
              {t('heroTagline')}
            </div>

            {/* Headline */}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 leading-[1.1] tracking-tight">
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

          {/* Hero Right Graphic Mockup */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 flex justify-center">
            <div className="relative w-full max-w-[420px] aspect-[4/5] bg-white rounded-[2.5rem] border border-slate-100 p-5 shadow-2xl shadow-slate-100/80">
              
              {/* Header inside the Mockup */}
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-500 rounded-lg flex items-center justify-center text-white">
                    <HeartPulse className="h-4 w-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 leading-none">{t('Diagnostic Assistant')}</h4>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                      {t('AI Health Vault Ready')}
                    </span>
                  </div>
                </div>
                <div className="px-2.5 py-1 bg-blue-50 text-blue-700 text-[10px] font-bold rounded-lg uppercase">
                  {t('ACTIVE SESSION')}
                </div>
              </div>

              {/* Chat Interface Sim / Content items */}
              <div className="space-y-4 pt-4 overflow-hidden">
                {/* Simulated User Input */}
                <div className="flex flex-col items-end space-y-1.5 align-right">
                  <div className="text-[10px] text-slate-400 pr-1">{t('User Symptom Statement')}</div>
                  <div className="bg-slate-50 text-slate-800 text-xs px-3.5 py-2.5 rounded-2xl rounded-tr-sm max-w-[85%] border border-slate-100/50">
                    "{t('I had localized stiffness in my lower back after heavy lifting on Tuesday, combined with a dull headache today.')}"
                  </div>
                </div>

                {/* Simulated AI Response */}
                <div className="flex flex-col items-start space-y-1.5">
                  <div className="text-[10px] text-blue-500 font-medium pl-1 flex items-center gap-1">
                    <Activity className="h-3 w-3 inline" /> {t('Analyzing Symptoms...')}
                  </div>
                  <div className="bg-blue-50/60 text-slate-700 text-xs px-3.5 py-3 rounded-2xl rounded-tl-sm max-w-[90%] border border-blue-50">
                    <p className="font-semibold text-slate-900 mb-1">{t('Assessment findings:')}</p>
                    <ul className="space-y-1.5 text-[11px] list-none p-0 m-0">
                      <li className="flex items-baseline gap-1.5">
                        <span className="text-blue-500">■</span> {t('Likely muscle soreness or strain from lifting technique overexertion.')}
                      </li>
                      <li className="flex items-baseline gap-1.5">
                        <span className="text-blue-500">■</span> {t('Headache may rest on mild hydration deficit or cervical stress.')}
                      </li>
                    </ul>
                  </div>
                </div>

                {/* Report Analysis card representation */}
                <div className="bg-emerald-50/40 border border-emerald-100 rounded-2xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="text-[11px] font-bold text-slate-800 flex items-center gap-1">
                      <span className="p-1 bg-emerald-100 text-emerald-700 rounded-md">
                        <Upload className="h-3 w-3" />
                      </span>
                      {t('Lab Analysis: CBC Blood Panel')}
                    </div>
                    <span className="text-[9px] bg-emerald-100/70 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                      {t('TRANSLATED')}
                    </span>
                  </div>
                  
                  {/* Metric indicator simulated */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>{t('Hemoglobin Level')}</span>
                      <span className="font-bold text-slate-800">{t('14.2 g/dL (Optimal)')}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                      <div className="w-[30%] bg-amber-400" />
                      <div className="w-[45%] bg-emerald-500" />
                      <div className="w-[25%] bg-amber-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative float elements to show rich UI */}
              <div className="absolute -top-6 -right-6 bg-white border border-slate-50 p-3 rounded-xl shadow-lg flex items-center gap-3.5 animate-bounce [animation-duration:5s] pointer-events-none">
                <div className="h-10 w-10 bg-emerald-100/80 rounded-lg flex items-center justify-center text-emerald-600">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">{t('100% Privacy')}</h5>
                  <p className="text-[10px] text-slate-400">{t('Zero-Knowledge Dev Only')}</p>
                </div>
              </div>

              <div className="absolute -bottom-4 -left-6 bg-white border border-slate-50 p-3.5 rounded-xl shadow-lg flex items-center gap-3.5 animate-bounce [animation-duration:4s] pointer-events-none">
                <div className="h-10 w-10 bg-sky-100/80 rounded-lg flex items-center justify-center text-sky-600">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h5 className="text-xs font-bold text-slate-800">{t('Smart Referrals')}</h5>
                  <p className="text-[10px] text-slate-400">{t('Physicians Near You')}</p>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
