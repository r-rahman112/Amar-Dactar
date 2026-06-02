import * as Icons from 'lucide-react';
import { STEPS_DATA } from '../data';
import { StepItem } from '../types';
import { useTranslation } from '../contexts/LanguageContext';

export default function HowItWorks() {
  const { t } = useTranslation();

  return (
    <section id="how-it-works" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header content */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider">
            {t('Simple 3-Step Process')}
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            {t('How Simple Is It to Use?')}
          </h2>
          <p className="text-slate-600 text-base sm:text-lg">
            {t('Understand your health trends in real-time. Follow our three core steps to experience immediate preventative triage and diagnostic analysis translation.')}
          </p>
        </div>

        {/* Steps timeline connected */}
        <div className="relative mt-12">
          {/* Connecting line on large screen */}
          <div className="hidden lg:block absolute top-[43px] left-[15%] right-[15%] h-0.5 bg-dashed bg-slate-200 -z-10" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
            {STEPS_DATA.map((stepItem: StepItem, index) => {
              const IconComponent = (Icons as any)[stepItem.iconName] || Icons.Sparkles;

              return (
                <div 
                  key={stepItem.step} 
                  id={`how-it-works-step-${stepItem.step}`}
                  className="flex flex-col items-center text-center space-y-4 group"
                >
                  {/* Step bubble */}
                  <div className="relative">
                    <div className="h-20 w-20 bg-blue-50 border border-b-2 border-blue-200/50 rounded-2xl flex items-center justify-center text-blue-600 transition-all duration-300 group-hover:scale-105 group-hover:bg-blue-600 group-hover:text-white group-hover:shadow-lg group-hover:shadow-blue-150">
                      <IconComponent className="h-8 w-8" />
                    </div>
                    {/* Number badge removed */}
                  </div>

                  {/* Title */}
                  <h3 className="font-display font-bold text-lg text-slate-900 pt-2 group-hover:text-blue-600 transition-colors">
                    {t(stepItem.title)}
                  </h3>

                  {/* Description */}
                  <p className="text-slate-500 text-sm leading-relaxed max-w-xs font-normal">
                    {t(stepItem.description)}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
