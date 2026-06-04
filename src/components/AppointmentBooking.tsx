import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, Clock, Video, MapPin, CheckCircle2, ChevronLeft, ChevronRight } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import { apiClient } from '../apiClient';

interface Doctor {
  id: string;
  name: string;
  specialty: string;
  image: string;
  price: number;
  availableOnline: boolean;
  availableOffline: boolean;
}

interface AppointmentBookingProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function AppointmentBooking({ doctor, isOpen, onClose }: AppointmentBookingProps) {
  const { t } = useTranslation();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [visitType, setVisitType] = useState<'online' | 'offline' | null>(null);
  
  const [schedule, setSchedule] = useState<any>(null);
  const [bookedSlots, setBookedSlots] = useState<string[]>([]);
  const [loadingSchedule, setLoadingSchedule] = useState(true);
  const [bookingFailed, setBookingFailed] = useState<string | null>(null);

  useEffect(() => {
    if (doctor && isOpen) {
      fetchSchedule();
    }
  }, [doctor, isOpen]);

  useEffect(() => {
    if (doctor && selectedDate && isOpen) fetchBooked();
  }, [doctor, selectedDate, isOpen]);

  const fetchSchedule = async () => {
    setLoadingSchedule(true);
    try {
      const res = await apiClient(`/api/appointments/doctor-schedule/${doctor?.id}`, {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setSchedule(await res.json());
    } catch(e) {} finally {
      setLoadingSchedule(false);
    }
  };

  const fetchBooked = async () => {
    if(!selectedDate || !doctor) return;
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const res = await apiClient(`/api/appointments/doctor/${doctor.id}/slots?date=${dateStr}`, {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) setBookedSlots(await res.json());
    } catch(e) {}
  };

  const getDayName = (date: Date) => {
    return date.toLocaleString('en-US', { weekday: 'long' });
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
    
    // Check if selected date is in available_days
    const dayName = getDayName(selectedDate);
    let isDayAvailable = false;
    
    if (schedule.available_days) {
       let daysArr = [];
       try { 
         daysArr = typeof schedule.available_days === 'string' ? JSON.parse(schedule.available_days) : schedule.available_days;
       } catch (e) {}
       isDayAvailable = Array.isArray(daysArr) ? daysArr.includes(dayName) : false;
    }

    if (!isDayAvailable) return [];

    // Check if blocked date
    const dateStr = selectedDate.toISOString().split('T')[0];
    if (schedule.blocked_dates) {
       let blockedArr = [];
       try { 
         blockedArr = typeof schedule.blocked_dates === 'string' ? JSON.parse(schedule.blocked_dates) : schedule.blocked_dates;
       } catch (e) {}
       if (Array.isArray(blockedArr) && blockedArr.includes(dateStr)) return [];
    }

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
  }, [schedule, selectedDate]);

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

  const handleClose = () => {
    setStep(1);
    setSelectedTime(null);
    setVisitType(null);
    setBookingFailed(null);
    onClose();
  };

  const handleConfirm = async () => {
    if(!selectedTime || !doctor) return;
    setBookingFailed(null);
    try {
      const dateStr = selectedDate.toISOString().split('T')[0];
      const endTime = calculateEndTime(selectedTime);
      const res = await apiClient('/api/appointments/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          doctor_id: doctor.id,
          date: dateStr,
          start_time: selectedTime,
          end_time: endTime
        })
      });
      if (res.ok) {
        setStep(3);
      } else {
        const data = await res.json();
        setBookingFailed(data.error || 'Failed to book slot');
      }
    } catch(err: any) {
      setBookingFailed(err.message || 'Error occurred');
    }
  };

  if (!doctor) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-x-0 bottom-0 z-50 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:w-full md:max-w-md bg-white rounded-t-3xl md:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                {step === 2 && (
                  <button onClick={() => setStep(1)} className="p-1 -ml-1 text-slate-400 hover:text-slate-800 transition-colors">
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 leading-tight">
                    {step === 3 ? t('Confirmed!') : t('Book Appointment')}
                  </h3>
                  {step !== 3 && <p className="text-xs text-slate-500 font-medium">{t(doctor.name)}</p>}
                </div>
              </div>
              <button 
                onClick={handleClose}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Content */}
            <div className="p-5 overflow-y-auto overflow-x-hidden relative flex-1">
              <AnimatePresence mode="popLayout">
                {/* Step 1: Date, Time & Visit Type */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    {/* Doctor Mini Card */}
                    <div className="flex gap-4 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <img src={doctor.image} alt={doctor.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div>
                        <h4 className="font-bold text-slate-900 text-sm">{t(doctor.name)}</h4>
                        <p className="text-xs text-blue-600 font-medium">{t(doctor.specialty)}</p>
                      </div>
                    </div>

                    {/* Visit Type */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span>{t('Consultation Type')}</span>
                      </h4>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setVisitType('online')}
                          disabled={!doctor.availableOnline}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${!doctor.availableOnline ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' : visitType === 'online' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                        >
                          <Video className={`h-6 w-6 mb-2 ${visitType === 'online' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-semibold">{t('Video Consult')}</span>
                        </button>
                        <button
                          onClick={() => setVisitType('offline')}
                          disabled={!doctor.availableOffline}
                          className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${!doctor.availableOffline ? 'opacity-50 cursor-not-allowed bg-slate-50 border-slate-100' : visitType === 'offline' ? 'border-blue-600 bg-blue-50/50 text-blue-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                        >
                          <MapPin className={`h-6 w-6 mb-2 ${visitType === 'offline' ? 'text-blue-600' : 'text-slate-400'}`} />
                          <span className="text-sm font-semibold">{t('Clinic Visit')}</span>
                        </button>
                      </div>
                    </div>

                    {/* Date Selection */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="text-sm font-bold text-slate-900">{t('Select Date')}</h4>
                        <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">
                          {selectedDate.toLocaleString('default', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <div className="flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                        {upcomingDays.map((date, idx) => {
                          const isSelected = selectedDate.getDate() === date.getDate() && selectedDate.getMonth() === date.getMonth();
                          const isToday = date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth();
                          
                          return (
                            <button
                              key={idx}
                              onClick={() => setSelectedDate(date)}
                              className={`flex flex-col items-center justify-center shrink-0 w-14 h-16 rounded-2xl border transition-all ${isSelected ? 'bg-slate-900 border-slate-900 text-white shadow-md' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'}`}
                            >
                              <span className={`text-xs font-medium mb-0.5 ${isSelected ? 'text-slate-300' : 'text-slate-500'}`}>
                                {isToday ? 'Today' : date.toLocaleString('default', { weekday: 'short' })}
                              </span>
                              <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                                {date.getDate()}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Time Selection */}
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 mb-3">{t('Available Slots')}</h4>
                      {loadingSchedule ? (
                        <p className="text-sm text-slate-500">Loading schedule...</p>
                      ) : timeSlots.length === 0 ? (
                        <p className="text-sm text-red-500 font-medium">Doctor is not available on this date.</p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {timeSlots.map((time) => {
                            const isBooked = bookedSlots.includes(time);
                            return (
                              <button
                                key={time}
                                onClick={() => setSelectedTime(time)}
                                disabled={isBooked}
                                className={`py-2.5 rounded-xl text-xs font-semibold border transition-all ${isBooked ? 'bg-slate-50 border-slate-100 text-slate-400 cursor-not-allowed opacity-50' : selectedTime === time ? 'bg-blue-600 border-blue-600 text-white shadow-sm shadow-blue-200/50' : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300 hover:bg-slate-50'}`}
                              >
                                {time}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {/* Step 2: Confirmation / Payment details */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="space-y-6"
                  >
                    <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100">
                      <h4 className="text-sm font-bold text-slate-900 mb-4 px-1">{t('Appointment Details')}</h4>
                      
                      <div className="space-y-4">
                        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                            <CalendarIcon className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-0.5">{t('Date & Time')}</p>
                            <p className="text-sm font-bold text-slate-900">
                              {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                            </p>
                            <p className="text-sm font-semibold text-blue-600 mt-0.5">{selectedTime}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 shrink-0">
                            {visitType === 'online' ? <Video className="h-5 w-5" /> : <MapPin className="h-5 w-5" />}
                          </div>
                          <div>
                            <p className="text-xs text-slate-500 font-medium mb-0.5">{t('Consultation Type')}</p>
                            <p className="text-sm font-bold text-slate-900">
                              {visitType === 'online' ? t('Video Consult') : t('Clinic Visit ')}
                            </p>
                            {visitType === 'offline' && <p className="text-xs text-slate-500 mt-1">123 Medical Center, Health St.</p>}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="px-1">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-bold text-slate-800">{t('Consultation Fee')}</span>
                        <span className="text-xl font-bold text-slate-900">${doctor.price}</span>
                      </div>
                      <p className="text-xs text-slate-500">{t('Pay securely via the patient portal or at the clinic.')}</p>
                    </div>
                  </motion.div>
                )}

                {/* Step 3: Success */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center justify-center py-10 text-center"
                  >
                    <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-6 border border-green-100">
                      <CheckCircle2 className="h-10 w-10 text-green-500" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 mb-2">{t('Confirmed!')}</h3>
                    <p className="text-slate-500 text-sm max-w-[250px] mx-auto mb-8">
                      {t('Your appointment with')} {t(doctor.name)} {t('is confirmed for')} {selectedDate.toLocaleDateString()} {t('at')} {selectedTime}.
                    </p>
                    
                    <div className="w-full bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-4 text-left">
                      <p className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-2">Booking ID</p>
                      <p className="font-mono text-slate-800 text-sm font-bold">#APT-{(Math.random() * 100000).toFixed(0).padStart(6, '0')}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Footer / Actions */}
            <div className="p-5 border-t border-slate-100 bg-white">
              {step === 1 && (
                <button
                  onClick={() => setStep(2)}
                  disabled={!selectedTime || !visitType}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-2xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  {t('Continue')}
                </button>
              )}
              {step === 2 && (
                <div className="space-y-3">
                  {bookingFailed && (
                    <div className="p-3 bg-red-50 text-red-600 text-sm rounded-xl font-medium border border-red-100 text-center">
                      {bookingFailed}
                    </div>
                  )}
                  <button
                    onClick={handleConfirm}
                    className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-semibold transition-all shadow-sm shadow-blue-200 flex items-center justify-center gap-2"
                  >
                    {t('Confirm Appointment')}
                  </button>
                </div>
              )}
              {step === 3 && (
                <button
                  onClick={handleClose}
                  className="w-full py-3.5 bg-slate-900 hover:bg-black text-white rounded-2xl font-semibold transition-colors"
                >
                  {t('Done')}
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
