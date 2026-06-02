import * as Icons from 'lucide-react';
import { FEATURES_DATA } from '../data';
import { FeatureItem } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export default function Features() {
  const { t } = useTranslation();

  return (
    <section id="features" className="py-20 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider"
          >
            {t('Premium Features')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight not-italic"
          > 
            {t('How "আমার ডাক্তার" Enhances Your Wellness Triage')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-slate-600 text-base sm:text-lg"
          >
            {t('We merge advanced clinical natural language parsing with certified privacy protocols to make personal preventative support simpler, faster, and stress-free.')}
          </motion.p>
        </div>

        {/* Bento Grid / Modern Card Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES_DATA.map((feature: FeatureItem, index) => {
            // Dynamically resolve lucide icon or fallback to default Activity icon
            const IconComponent = (Icons as any)[feature.iconName] || Icons.Activity;

            // Highlight the primary/popular features with elegant backgrounds
            const isPopular = feature.badge === 'Popular' || feature.id === 'symptom-analysis';

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ delay: index * 0.1, duration: 0.4 }}
                key={feature.id}
                id={`feature-card-${feature.id}`}
                className={`relative group bg-white border rounded-3xl p-8 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between ${
                  isPopular 
                    ? 'border-blue-100/70 shadow-sm shadow-blue-50/50 bg-gradient-to-b from-white to-blue-50/10' 
                    : 'border-slate-100 shadow-sm'
                }`}
              >
                <div>
                  {/* Icon & Badge Row */}
                  <div className="flex justify-between items-center mb-6">
                    <div className={`p-3.5 rounded-2xl flex items-center justify-center ${
                      isPopular 
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-150' 
                        : 'bg-blue-50 text-blue-600'
                    }`}>
                      <IconComponent className="h-6 w-6" />
                    </div>
                    {feature.badge && (
                      <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full ${
                        feature.badge === 'Popular'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200/50'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {t(feature.badge)}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <h3 className="font-display font-bold text-xl text-slate-900 mb-3 group-hover:text-blue-600 transition-colors">
                    {t(feature.title)}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal">
                    {t(feature.description)}
                  </p>
                </div>

                <div className="flex items-center text-xs font-semibold text-blue-600 gap-1 group-hover:gap-1.5 transition-all">
                  <span>{t('Learn more about this capability')}</span>
                  <Icons.ArrowRight className="h-3.5 w-3.5" />
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
