import { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle, MessageCircleQuestion } from 'lucide-react';
import { FAQS_DATA } from '../data';
import { FAQItem } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export default function FAQ() {
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<string | null>('faq-1');

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
  };

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-blue-100 rounded-full text-blue-700 text-xs font-semibold uppercase tracking-wider"
          >
            {t('Common Inquiries')}
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="font-display text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight"
          >
            {t('Frequently Asked Questions')}
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="text-slate-600 text-normal sm:text-lg"
          >
            {t('Have questions about accuracy, security, or capabilities? Find simple, reliable answers about the আমার ডাক্তার triage ecosystem below.')}
          </motion.p>
        </div>

        {/* Accordions Stack */}
        <div className="space-y-4">
          {FAQS_DATA.map((faq: FAQItem, index) => {
            const isOpen = openId === faq.id;

            return (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.1 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
                key={faq.id}
                id={`faq-item-${faq.id}`}
                className={`border rounded-2xl transition-all duration-300 ${
                  isOpen 
                    ? 'border-blue-200 bg-blue-50/10 shadow-sm shadow-blue-50/20' 
                    : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                {/* Trigger Head */}
                <button
                  onClick={() => toggleAccordion(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-display font-semibold text-slate-950 hover:text-blue-600 transition-colors focus:outline-none cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 pr-4">
                    <HelpCircle className={`h-5 w-5 shrink-0 ${isOpen ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span className="text-sm sm:text-base leading-snug">{t(faq.question)}</span>
                  </div>
                  <div className="shrink-0 p-1.5 bg-slate-50 rounded-lg text-slate-500">
                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </div>
                </button>

                {/* Collapsible Content */}
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    isOpen ? 'max-h-[500px] border-t border-slate-100/60' : 'max-h-0'
                  }`}
                >
                  <div className="p-5 text-sm leading-relaxed text-slate-600 bg-white rounded-b-2xl">
                    <p className="mb-2 font-semibold text-xs text-blue-600 uppercase tracking-widest">
                      {t('Category')} • {t(faq.category)}
                    </p>
                    {t(faq.answer)}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Live Support / Doctor disclaimer indicator */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-4 items-center justify-between text-center sm:text-left"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <MessageCircleQuestion className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-900 leading-snug">{t('Still have specific questions?')}</p>
              <p className="text-xs text-slate-500">{t('Our support simulation holds answers for customized wellness integrations.')}</p>
            </div>
          </div>
          <a
            href="mailto:support@example.com"
            className="px-4.5 py-2.5 bg-white border border-slate-200 rounded-xl hover:border-blue-400 text-xs font-semibold text-slate-700 hover:text-blue-600 transition-colors"
          >
            {t('Ask Our Helpdesk')}
          </a>
        </motion.div>

      </div>
    </section>
  );
}
