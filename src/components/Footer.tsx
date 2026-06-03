import { AlertCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'motion/react';

export default function Footer({ onTermsClick, onSupportClick }: { onTermsClick?: () => void; onSupportClick?: () => void }) {
  const currentYear = new Date().getFullYear();
  const { t } = useTranslation();

  return (
    <footer id="footer-section" className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Core Sections Grid */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-12 border-b border-slate-800"
        >
          {/* Brand Info */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-2.5 text-white">
              <BrandLogo light />
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              {t('Pioneering private, accessible, and ultra-fast wellness triage dashboards to decode clinical symptoms and blood metrics intelligently.')}
            </p>
          </div>

          {/* Quick links columns */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('Product Links')}</h4>
            <ul className="space-y-2.5 text-sm p-0 m-0 list-none">
              <li>
                <a href="#features" className="hover:text-blue-400 transition-colors">
                  {t('Core Features')}
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-blue-400 transition-colors">
                  {t('How It Works')}
                </a>
              </li>
              <li>
                <a href="#testimonials" className="hover:text-blue-400 transition-colors">
                  {t('User Reviews')}
                </a>
              </li>
              <li>
                <a href="#faq" className="hover:text-blue-400 transition-colors">
                  {t('FAQ Helpdesk')}
                </a>
              </li>
            </ul>
          </div>

          {/* Secure details Column */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">{t('Privacy & Compliance')}</h4>
            <ul className="space-y-2.5 text-sm p-0 m-0 list-none">
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>{t('HIPAA-Compliant Storage Method')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>{t('Zero-Knowledge Secure Cryptography')}</span>
              </li>
              <li className="flex items-center space-x-2">
                <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full shrink-0" />
                <span>{t('GDPR-Compliant Data Erasure')}</span>
              </li>
            </ul>
          </div>
        </motion.div>

        {/* Clinical Health Warning Board (Mandatory for medical apps) */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="mt-8 p-5 bg-slate-950 rounded-2xl border border-slate-800 flex gap-4 items-start"
        >
          <AlertCircle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h5 className="text-xs font-bold text-slate-200">{t('Class 1 General Wellness Triage Disclaimer')}</h5>
            <p className="text-[11px] leading-relaxed text-slate-500">
              {t('Disclaimer: This is an interactive health triage demonstration intended strictly for general wellness literacy and educational simulation purposes. It does not represent a licensed computer diagnostic device, clinical diagnosis generator, or clinical advisor. If you are experiencing serious or sudden physical symptoms, seek emergency medical care.')}
            </p>
          </div>
        </motion.div>

        {/* Bottom copyright section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
          className="mt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500"
        >
          <div className="flex items-center space-x-1">
            <span>© {currentYear} আমার ডাক্তার AI. {t('All rights reserved.')}</span>
          </div>
          
          <div className="flex items-center space-x-4">
            <button onClick={onSupportClick} className="hover:text-blue-400 transition-colors cursor-pointer">{t('Support')}</button>
            <span className="text-slate-700">•</span>
            <button onClick={onTermsClick} className="hover:text-blue-400 transition-colors cursor-pointer">{t('Terms of Triage Service')}</button>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
