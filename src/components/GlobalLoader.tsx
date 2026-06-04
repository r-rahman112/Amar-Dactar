import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldPlus } from 'lucide-react';

export default function GlobalLoader() {
  const { t } = useTranslation();

  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Simulate loading progress
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(timer);
          return 90;
        }
        return prev + Math.floor(Math.random() * 15) + 5;
      });
    }, 100);

    const handleLoad = () => {
      setProgress(100);
      setTimeout(() => {
        setIsLoading(false);
      }, 400); // Wait a bit after 100% to let users see it
    };

    if (document.readyState === 'complete') {
      setTimeout(handleLoad, 400);
    } else {
      window.addEventListener('load', handleLoad);
      // Fallback
      setTimeout(handleLoad, 3000);
    }

    return () => {
      clearInterval(timer);
      window.removeEventListener('load', handleLoad);
    };
  }, []);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, filter: 'blur(4px)' }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-4 m-0 top-0 left-0 right-0 bottom-0 overflow-hidden"
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center justify-center w-full max-w-sm mb-16"
          >
            <div className="relative">
              {/* Soft pulse animation background */}
              <div className="absolute inset-0 bg-blue-100 rounded-2xl animate-ping opacity-70"></div>
              {/* Main Icon */}
              <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-600/20 relative z-10">
                <ShieldPlus className="w-12 h-12 md:w-16 md:h-16" />
              </div>
            </div>
            
            <h1 className="mt-8 text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight whitespace-nowrap font-brand">
              আমার ডাক্তার
            </h1>
            
            {/* Progress Indicator */}
            <div className="w-48 md:w-56 mt-8">
              <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-600 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: "easeOut", duration: 0.2 }}
                />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
