import { Star, Quote } from 'lucide-react';
import { TESTIMONIALS_DATA } from '../data';
import { TestimonialItem } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export default function Testimonials() {
  const { t } = useTranslation();

  return (
    <section id="testimonials" className="py-20 bg-slate-50/50 border-y border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 border border-emerald-100 rounded-full text-emerald-800 text-xs font-semibold uppercase tracking-wider"
          >
            {t('User Validation')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            {t('Trusted by Patients, Loved by Professionals')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-slate-600 text-base sm:text-lg"
          >
            {t('Read how everyday health-conscious individuals and medical practitioners are utilizing AI-driven summarization to refine their consultation practices.')}
          </motion.p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS_DATA.map((testimonial: TestimonialItem, index) => (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              key={testimonial.id}
              id={`testimonial-card-${testimonial.id}`}
              className="bg-white border border-slate-100/80 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col justify-between relative"
            >
              {/* Quote Mark Icon */}
              <div className="absolute top-6 right-6 text-slate-150 pointer-events-none">
                <Quote className="h-8 w-8 text-blue-50/70" />
              </div>

              {/* Stars Rating */}
              <div className="flex space-x-1 mb-5">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4.5 w-4.5 fill-amber-400 text-amber-400" />
                ))}
              </div>

              {/* Quote Content */}
              <p className="text-slate-600 text-sm leading-relaxed mb-6 font-normal italic">
                "{t(testimonial.quote)}"
              </p>

              {/* Bio block */}
              <div className="flex items-center gap-3.5 pt-4 border-t border-slate-50">
                {/* Initials Avatar */}
                <div className={`h-11 w-11 ${testimonial.avatarBg} rounded-xl font-bold text-sm flex items-center justify-center`}>
                  {testimonial.initials}
                </div>
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 leading-none">
                    {testimonial.name}
                  </h4>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {t(testimonial.role)}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
