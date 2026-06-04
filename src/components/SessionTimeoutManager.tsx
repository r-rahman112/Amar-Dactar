import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, Clock } from 'lucide-react';

const INACTIVITY_TIMEOUT = 30 * 60 * 1000; // 30 minutes
const WARNING_BEFORE = 5 * 60 * 1000; // Show warning 5 minutes before expiration

export default function SessionTimeoutManager() {
  const { isAuthenticated, logout } = useAuth();
  const [showWarning, setShowWarning] = useState(false);
  const [timeLeft, setTimeLeft] = useState(WARNING_BEFORE / 1000);
  
  const lastActiveTimeRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const resetActivity = useCallback(() => {
    if (showWarning) {
      // Do not reset activity implicitly if the warning is displayed (forces them to click extend)
      return;
    }
    lastActiveTimeRef.current = Date.now();
  }, [showWarning]);

  const extendSession = () => {
    lastActiveTimeRef.current = Date.now();
    setShowWarning(false);
    
    // Also ping the server to keep the session alive if necessary, 
    // but the JWT token expiration is handled on backend. 
    // A simple endpoint fetch could be done here if needed.
    fetch('/api/users/me').catch(e => console.error("Failed to extend session via ping:", e));
  };

  const handleLogout = useCallback(() => {
    setShowWarning(false);
    logout();
  }, [logout]);

  useEffect(() => {
    if (!isAuthenticated) {
      setShowWarning(false);
      return;
    }

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => document.addEventListener(event, resetActivity));

    checkIntervalRef.current = setInterval(() => {
      const inactiveDuration = Date.now() - lastActiveTimeRef.current;
      const timeRemaining = INACTIVITY_TIMEOUT - inactiveDuration;

      if (timeRemaining <= 0) {
        // Session expired
        handleLogout();
      } else if (timeRemaining <= WARNING_BEFORE) {
        // Show warning
        if (!showWarning) {
          setShowWarning(true);
        }
        setTimeLeft(Math.ceil(timeRemaining / 1000));
      } else {
        // Back to normal
        if (showWarning) {
          setShowWarning(false);
        }
      }
    }, 1000);

    return () => {
      events.forEach(event => document.removeEventListener(event, resetActivity));
      if (checkIntervalRef.current) clearInterval(checkIntervalRef.current);
    };
  }, [isAuthenticated, resetActivity, showWarning, handleLogout]);

  if (!isAuthenticated) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <AnimatePresence>
      {showWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-slate-100"
          >
            <div className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center text-amber-600 shrink-0">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-display font-bold text-slate-900">Session Warning</h3>
                  <p className="text-sm text-slate-500">Your session is about to expire</p>
                </div>
              </div>
              
              <div className="bg-amber-50 rounded-xl p-4 mb-6 border border-amber-100/50">
                <p className="text-amber-800 text-sm font-medium leading-relaxed">
                  For your security, you will be automatically logged out due to inactivity in:
                </p>
                <div className="flex items-center gap-2 mt-3 text-amber-700 font-mono font-bold text-lg">
                  <Clock className="w-5 h-5 shadow-sm" />
                  <span>
                    {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <button
                  onClick={handleLogout}
                  className="px-5 py-2.5 text-sm font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors duration-200"
                >
                  Log Out
                </button>
                <button
                  onClick={extendSession}
                  className="px-5 py-2.5 text-sm font-bold bg-blue-600 text-white rounded-xl shadow-sm hover:hover:bg-blue-700 hover:shadow-md transition-all duration-200"
                >
                  Keep Me Logged In
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
