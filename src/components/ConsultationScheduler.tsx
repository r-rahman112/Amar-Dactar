import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { X, Calendar as CalendarIcon, Clock, ArrowRight, ShieldCheck } from 'lucide-react';
import { DoctorInfo } from '../types';

interface ConsultationSchedulerProps {
  doctor: DoctorInfo;
  onClose: () => void;
  onScheduleSelected: (date: string, time: string, endTime: string) => void;
}

export default function ConsultationScheduler({ doctor, onClose, onScheduleSelected }: ConsultationSchedulerProps) {  const { t } = useTranslation();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string>('');
  
  const [schedule, setSchedule] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);

  useEffect(() => {
    fetchSchedule();
  }, []);

  useEffect(() => {
    if (selectedDate) fetchBooked();
  }, [selectedDate]);

  const fetchSchedule = async () => {
    try {
      const res = await fetch(`/api/appointments/doctor-schedule/${doctor.id}`, {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setSchedule(await res.json());
    } catch(e) {} finally {
      setLoadingSchedule(false);
    }
  };

  const fetchBooked = async () => {
    if(!selectedDate) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await fetch(`/api/appointments/doctor/${doctor.id}/slots?date=${dateStr}`, {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setBookedSlots(await res.json());
    } catch(e) {}
  };

  const upcomingDays = useMemo(() => {
    return Array.from({ length: 14 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
  }, []);

  const timeSlots = useMemo(() => {
    if (!schedule || !schedule.start_time) return [];
    const slots = [];
    let [h, m] = schedule.start_time.split(':').map(Number);
    const [eh, em] = schedule.end_time.split(':').map(Number);
    const dur = schedule.duration_minutes || 30;
    
    while (h * 60 + m + dur <= eh * 60 + em) {
      const st = `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
      slots.push(st);
      m += dur;
      if (m >= 60) {
        h += Math.floor(m / 60);
        m = m % 60;
      }
    }
    return slots;
  }, [schedule]);

  const calculateEndTime = (startTime: string) => {
    if (!schedule) return startTime;
    const dur = schedule.duration_minutes || 30;
    let [h, m] = startTime.split(':').map(Number);
    m += dur;
    if (m >= 60) {
      h += Math.floor(m/60);
      m = m % 60;
    }
    return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 leading-none">{t('Schedule Consultation')}</h3>
            <p className="text-xs text-slate-500 mt-1">Select an available time slot for {doctor.fullName}</p>
          </div>
          <button onClick={onClose} className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors">
             <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
           {/* Doctor Info summary */}
           <div className="flex items-center justify-between mb-6 bg-blue-50/50 p-4 rounded-2xl border border-blue-100/50">
              <div className="flex items-center gap-3">
                 <div className="h-10 w-10 border border-slate-200 rounded-full overflow-hidden shrink-0 bg-white">
                   {doctor.photoUrl && <img src={doctor.photoUrl} alt="doc" className="w-full h-full object-cover" />}
                 </div>
                 <div>
                    <h4 className="font-bold text-sm text-slate-900">{doctor.fullName}</h4>
                    <p className="text-[10px] text-blue-600 font-semibold">{doctor.availableHours}</p>
                 </div>
              </div>
           </div>

           <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
             <CalendarIcon className="w-4 h-4 text-slate-400" /> {t('Select Date')}
           </h4>
           <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
             {upcomingDays.map((date, i) => {
               const isSelected = selectedDate?.toDateString() === date.toDateString();
               const isToday = i === 0;
               const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
               const dateStr = date.toISOString().split('T')[0];
               const isAvailableDate = schedule && schedule.available_days?.includes(weekday) && !schedule.blocked_dates?.includes(dateStr);

               return (
                 <button
                   key={i}
                   disabled={!isAvailableDate}
                   onClick={() => { setSelectedDate(date); setSelectedTime(''); }}
                   className={`flex flex-col items-center justify-center p-3 sm:px-5 sm:py-3 rounded-2xl border-2 min-w-[70px] sm:min-w-[80px] shrink-0 transition-all ${
                     !isAvailableDate ? 'opacity-50 cursor-not-allowed bg-slate-100 border-slate-50 text-slate-400' :
                     isSelected ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-slate-100 bg-slate-50 text-slate-600 hover:border-slate-300'
                   }`}
                 >
                   <span className="text-[10px] font-bold uppercase tracking-wider mb-1">
                     {isToday ? 'Today' : date.toLocaleDateString('en-US', { weekday: 'short' })}
                   </span>
                   <span className="text-xl sm:text-2xl font-black">{date.getDate()}</span>
                   <span className="text-[10px] font-semibold">{date.toLocaleDateString('en-US', { month: 'short' })}</span>
                 </button>
               );
             })}
           </div>

           {selectedDate && (
             <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-2">
               <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                 <Clock className="w-4 h-4 text-slate-400" /> {t('Select Time Slot')}
               </h4>
               <div className="grid grid-cols-3 gap-3">
                 {timeSlots.map(time => {
                   const isBooked = bookedSlots.includes(time);
                   return (
                   <button
                     key={time}
                     disabled={isBooked}
                     onClick={() => setSelectedTime(time)}
                     className={`py-2 px-1 text-center rounded-xl border-2 text-xs font-bold transition-all ${
                       isBooked ? 'border-slate-100 bg-slate-100 text-slate-400 cursor-not-allowed' :
                       selectedTime === time ? 'border-slate-900 bg-slate-900 text-white shadow-sm' : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300'
                     }`}
                   >
                     {time}
                   </button>
                 )})}
               </div>
             </motion.div>
           )}
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
           <div className="flex-1">
             <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                <ShieldCheck className="w-3.5 h-3.5" /> {t('Secured Booking')}
             </div>
           </div>
           
           <button 
             onClick={() => {
                if(selectedDate && selectedTime) {
                   const yyyymmdd = selectedDate.toISOString().split('T')[0];
                   onScheduleSelected(yyyymmdd, selectedTime, calculateEndTime(selectedTime));
                }
             }}
             disabled={!selectedDate || !selectedTime}
             className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2"
           >
             {t('Continue')} <ArrowRight className="w-4 h-4" />
           </button>
        </div>
      </motion.div>
    </div>
  );
}
