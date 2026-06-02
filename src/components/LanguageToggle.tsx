import { Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useTranslation } from '../contexts/LanguageContext';

interface LanguageToggleProps {
  isMobile?: boolean;
}

export default function LanguageToggle({ isMobile = false }: LanguageToggleProps) {
  const { language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'bn' ? 'en' : 'bn');
  };

  return (
    <button
      onClick={toggleLanguage}
      className={`group relative flex items-center gap-2 overflow-hidden ${
        isMobile
          ? 'p-2 w-full justify-center bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100'
          : 'px-3 py-1.5 bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 text-slate-700 rounded-xl text-sm font-semibold transition-all duration-300'
      }`}
    >
      <motion.div
        animate={{ rotate: language === 'bn' ? 180 : 0 }}
        transition={{ duration: 0.5 }}
      >
        <Globe className={`h-4 w-4 ${isMobile ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
      </motion.div>
      <div className="relative h-5 w-16 flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.span
            key={language}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute text-sm font-bold uppercase tracking-wider"
          >
            {language === 'bn' ? 'EN' : 'বাং'}
          </motion.span>
        </AnimatePresence>
      </div>
    </button>
  );
}
