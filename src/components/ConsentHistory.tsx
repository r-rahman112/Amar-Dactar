import React, { useState, useEffect } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { ShieldCheck, Info } from 'lucide-react';

type ConsentRecord = {
  id: string;
  user_id: string;
  fullname: string;
  email: string;
  ip_address: string;
  consent_timestamp: string;
};

export default function ConsentHistory() {
  const { t } = useTranslation();
  const [records, setRecords] = useState<ConsentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/admin/consents', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await res.json();
      if (res.ok) {
        setRecords(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-indigo-600" />
            {t('Healthcare Disclaimer Consent History')}
          </h2>
          <p className="text-slate-500 text-sm mt-1">{t('Permanent records of users accepting the AI disclaimer.')}</p>
        </div>
        <div className="bg-indigo-50 text-indigo-700 px-4 py-2 flex items-center gap-2 rounded-xl text-sm font-semibold">
          <Info className="w-4 h-4" />
          {records.length} total consents
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">{t('User')}</th>
                <th className="px-6 py-4">{t('Email')}</th>
                <th className="px-6 py-4">{t('IP Address')}</th>
                <th className="px-6 py-4">{t('Accepted On')}</th>
                <th className="px-6 py-4">{t('Status')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    Loading records...
                  </td>
                </tr>
              ) : records.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No consent records found.
                  </td>
                </tr>
              ) : (
                records.map(record => (
                  <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {record.fullname}
                    </td>
                    <td className="px-6 py-4 text-slate-500">{record.email}</td>
                    <td className="px-6 py-4 text-slate-500">{record.ip_address || 'Unknown'}</td>
                    <td className="px-6 py-4 text-slate-500">
                      {new Date(record.consent_timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700">
                        <ShieldCheck className="w-3 h-3" />
                        Accepted
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
