import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { CheckCircle2, XCircle, User } from 'lucide-react';
import { apiClient } from '../apiClient';

export default function DoctorAppointmentsView() {  const { t } = useTranslation();

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await apiClient('/api/appointments/doctor', {
         headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        setAppointments(await res.json());
      }
    } catch(e) {} finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      const res = await apiClient(`/api/appointments/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) fetchAppointments();
    } catch(e) {}
  };

  if (loading) return <div>{t('Loading...')}</div>;

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 mb-10 max-w-4xl mx-auto shadow-sm">
      <h2 className="text-xl font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">{t('My Appointments')}</h2>
      <div className="space-y-4">
        {appointments.length === 0 && <p className="text-slate-500 text-center py-4">{t('No appointments found.')}</p>}
        {appointments.map(appt => (
          <div key={appt.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="font-bold text-slate-900">{appt.patient_name}</p>
              <p className="text-sm text-slate-500">{appt.date} • {appt.start_time} - {appt.end_time}</p>
              <div className="mt-2">
                <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-full tracking-wider ${
                  appt.status === 'Pending' ? 'bg-orange-50 text-orange-700 border border-orange-100' :
                  appt.status === 'Confirmed' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                  appt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' :
                  'bg-red-50 text-red-700 border border-red-100'
                }`}>
                  {appt.status}
                </span>
              </div>
            </div>
            {appt.status === 'Pending' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(appt.id, 'Confirmed')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">{t('Confirm')}</button>
                <button onClick={() => updateStatus(appt.id, 'Cancelled')} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors">{t('Cancel')}</button>
              </div>
            )}
            {appt.status === 'Confirmed' && (
              <div className="flex gap-2">
                <button onClick={() => updateStatus(appt.id, 'Completed')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors">{t('Mark Completed')}</button>
                <button onClick={() => updateStatus(appt.id, 'Cancelled')} className="px-3 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-xs font-bold transition-colors">{t('Cancel')}</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
