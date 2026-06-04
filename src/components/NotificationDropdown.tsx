import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, X, Trash2, CheckCheck } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../contexts/LanguageContext';
import { apiClient } from '../apiClient';

export default function NotificationDropdown() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Polling could be added here or WebSocket event
      const interval = setInterval(fetchNotifications, 10000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await apiClient('/api/notifications', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setNotifications(await res.json());
    } catch(e) {}
  };

  const markAllRead = async () => {
    try {
      await apiClient('/api/notifications/read-all', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => ({...n, is_read: true})));
    } catch(e) {}
  };

  const markRead = async (id: string) => {
    try {
      await apiClient(`/api/notifications/${id}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.map(n => n.id === id ? {...n, is_read: true} : n));
    } catch(e) {}
  };

  const deleteNotification = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient(`/api/notifications/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      setNotifications(notifications.filter(n => n.id !== id));
    } catch(e) {}
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-slate-500 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white shadow-sm" />
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 shadow-xl rounded-2xl z-50 overflow-hidden"
          >
             <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
               <div>
                  <h3 className="font-bold text-slate-900">{t('Notifications')}</h3>
                  <p className="text-xs text-slate-500">{unreadCount} {t('unread messages')}</p>
               </div>
               {unreadCount > 0 && (
                 <button onClick={markAllRead} className="text-xs flex items-center gap-1 text-slate-500 hover:text-blue-600 font-medium bg-white px-2 py-1 border border-slate-200 rounded-lg shadow-sm">
                   <CheckCheck className="w-3.5 h-3.5" /> Read All
                 </button>
               )}
             </div>

             <div className="max-h-96 overflow-y-auto">
               {notifications.length === 0 ? (
                 <div className="p-8 text-center text-slate-500 flex flex-col items-center">
                    <Bell className="w-10 h-10 text-slate-200 mb-3" />
                    <p className="text-sm">You're all caught up!</p>
                 </div>
               ) : (
                 <div className="divide-y divide-slate-100">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        onClick={() => { if(!notification.is_read) markRead(notification.id); }}
                        className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer group flex gap-3 ${!notification.is_read ? 'bg-blue-50/30' : ''}`}
                      >
                         <div className={`mt-0.5 shrink-0 w-2 h-2 rounded-full ${!notification.is_read ? 'bg-blue-500' : 'bg-transparent'}`} />
                         <div className="flex-1">
                            <div className="flex justify-between items-start mb-1">
                              <p className={`text-sm ${!notification.is_read ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                                {notification.type.replace(/_/g, ' ')}
                              </p>
                              <button onClick={(e) => deleteNotification(notification.id, e)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-xs text-slate-500 leading-relaxed mb-2">{notification.message}</p>
                            <span className="text-[10px] font-medium text-slate-400">
                              {new Date(notification.created_at).toLocaleString()}
                            </span>
                         </div>
                      </div>
                    ))}
                 </div>
               )}
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
