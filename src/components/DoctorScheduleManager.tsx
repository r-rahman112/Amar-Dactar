import React, { useState, useEffect } from 'react';
import { Calendar, Clock } from 'lucide-react';

export default function DoctorScheduleManager() {
  const [schedule, setSchedule] = useState({
    available_days: [] as string[],
    start_time: '09:00',
    end_time: '17:00',
    duration_minutes: 30,
    blocked_dates: [] as string[]
  });
  const [loading, setLoading] = useState(true);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    fetchSchedule();
  }, []);

  const fetchSchedule = async () => {
    try {
      const res = await fetch('/api/appointments/schedule', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        if (data) {
          setSchedule(data);
        }
      }
    } catch(e) {} finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/appointments/schedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(schedule)
      });
      if (res.ok) {
        alert('Schedule saved successfully!');
      }
    } catch(e) {
      alert('Failed to save schedule');
    }
  };

  const toggleDay = (day: string) => {
    setSchedule(prev => ({
      ...prev,
      available_days: prev.available_days.includes(day) 
        ? prev.available_days.filter(d => d !== day) 
        : [...prev.available_days, day]
    }));
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-10 max-w-4xl mx-auto shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Manage Schedule & Availability</h2>
      <form onSubmit={handleSave} className="space-y-6">
        <div>
          <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Available Days</label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button 
                type="button" 
                key={day} 
                onClick={() => toggleDay(day)}
                className={`px-4 py-2 rounded-xl text-sm font-bold border-2 transition-all ${
                  schedule.available_days.includes(day) ? 'bg-blue-50 border-blue-600 text-blue-700' : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Working Hours (Start)</label>
             <input 
               type="time" 
               className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold" 
               value={schedule.start_time}
               onChange={e => setSchedule({...schedule, start_time: e.target.value})}
               required
             />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Working Hours (End)</label>
             <input 
               type="time" 
               className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold" 
               value={schedule.end_time}
               onChange={e => setSchedule({...schedule, end_time: e.target.value})}
               required
             />
          </div>
        </div>
        <div>
           <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Consultation Duration (Minutes)</label>
           <select 
             className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold"
             value={schedule.duration_minutes}
             onChange={e => setSchedule({...schedule, duration_minutes: parseInt(e.target.value)})}
           >
             <option value={15}>15 Minutes</option>
             <option value={30}>30 Minutes</option>
             <option value={45}>45 Minutes</option>
             <option value={60}>60 Minutes</option>
           </select>
        </div>
        <div>
           <label className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 block">Blocked Dates / Holidays (YYYY-MM-DD)</label>
           <input 
             type="text" 
             placeholder="e.g. 2026-06-01, 2026-06-02" 
             className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm font-bold"
             value={schedule.blocked_dates.join(', ')}
             onChange={e => setSchedule({...schedule, blocked_dates: e.target.value.split(',').map(d => d.trim()).filter(Boolean)})}
           />
        </div>
        <div className="pt-6 border-t border-slate-100 flex justify-end">
           <button type="submit" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-colors">
              Save Schedule
           </button>
        </div>
      </form>
    </div>
  );
}
