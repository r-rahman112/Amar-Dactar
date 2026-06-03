import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { 
  LayoutDashboard, Users, Stethoscope, FileText, Calendar, 
  DollarSign, Settings, LogOut, Menu, X, 
  Bell, Search, MoreVertical, TrendingUp, CheckCircle2, Clock,
  ShieldCheck
} from 'lucide-react';
import BrandLogo from './BrandLogo';
import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from './UserManagement';
import DoctorVerificationsManagement from './DoctorVerificationsManagement';
import ConsentHistory from './ConsentHistory';
import { getRoleDisplay } from './Header';
import AnimatedCounter from './AnimatedCounter';

interface AdminDashboardProps {
  onLogout: () => void;
}

const REVENUE_DATA = [
  { name: 'Jan', revenue: 4000 },
  { name: 'Feb', revenue: 3000 },
  { name: 'Mar', revenue: 5000 },
  { name: 'Apr', revenue: 4500 },
  { name: 'May', revenue: 6000 },
  { name: 'Jun', revenue: 5500 },
];

const APPOINTMENT_DATA = [
  { name: 'Mon', online: 24, offline: 12 },
  { name: 'Tue', online: 35, offline: 15 },
  { name: 'Wed', online: 28, offline: 18 },
  { name: 'Thu', online: 45, offline: 20 },
  { name: 'Fri', online: 32, offline: 25 },
  { name: 'Sat', online: 15, offline: 8 },
  { name: 'Sun', online: 10, offline: 5 },
];

const RECENT_APPOINTMENTS = [
  { id: '1', patient: 'Sarah Jenkins', doctor: 'Dr. Michael Chen', type: 'Online', status: 'Completed', time: '10:00 AM' },
  { id: '2', patient: 'Robert Smith', doctor: 'Dr. Emily Davis', type: 'Offline', status: 'Upcoming', time: '02:30 PM' },
  { id: '3', patient: 'Amanda Clark', doctor: 'Dr. James Wilson', type: 'Online', status: 'In Progress', time: '11:15 AM' },
  { id: '4', patient: 'John Matthews', doctor: 'Dr. Emily Davis', type: 'Offline', status: 'Upcoming', time: '04:00 PM' },
];

type MenuKey = 'dashboard' | 'users' | 'suspended_users' | 'banned_users' | 'export_data' | 'profile_edit' | 'account_settings' | 'doctor_verifications' | 'consent_history';

export default function AdminDashboard({ onLogout }: AdminDashboardProps) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeMenu, setActiveMenu] = useState<MenuKey>('dashboard');

  const menuItems: { id: MenuKey; label: string; icon: React.ElementType }[] = [
    { id: 'dashboard', label: t('Dashboard'), icon: LayoutDashboard },
    { id: 'users', label: t('All Users'), icon: Users },
    { id: 'doctor_verifications', label: t('Doctor Verifications'), icon: ShieldCheck },
    { id: 'consent_history', label: t('Consent History'), icon: FileText },
    { id: 'suspended_users', label: t('Suspended Users'), icon: Clock },
    { id: 'banned_users', label: t('Banned Users'), icon: ShieldCheck },
    { id: 'export_data', label: t('Export Data'), icon: FileText },
  ];

  const handleMenuClick = (id: MenuKey) => {
    setActiveMenu(id);
    setIsSidebarOpen(false);
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white border-r border-slate-100">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <BrandLogo />
        <button className="md:hidden p-2 text-slate-400 hover:text-slate-600" onClick={() => setIsSidebarOpen(false)}>
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-3">{t('Menu')}</div>
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleMenuClick(item.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeMenu === item.id 
                ? 'bg-blue-50 text-blue-700' 
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon className={`h-5 w-5 ${activeMenu === item.id ? 'text-blue-600' : 'text-slate-400'}`} />
            {item.label}
          </button>
        ))}

        <div className="mt-8 mb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('System')}</div>
        <button onClick={() => handleMenuClick('profile_edit')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeMenu === 'profile_edit' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Users className={`h-5 w-5 ${activeMenu === 'profile_edit' ? 'text-blue-600' : 'text-slate-400'}`} />
          {t('Profile Edit')}
        </button>
        <button onClick={() => handleMenuClick('account_settings')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${activeMenu === 'account_settings' ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
          <Settings className={`h-5 w-5 ${activeMenu === 'account_settings' ? 'text-blue-600' : 'text-slate-400'}`} />
          {t('Account Settings')}
        </button>
      </div>

      <div className="p-4 border-t border-slate-100">
        <button 
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <LogOut className="h-5 w-5" />
          {t('Logout')}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex items-start">
      {/* Desktop Sidebar */}
      <aside className="hidden md:block w-64 sticky top-[72px] h-[calc(100vh-72px)] z-20 overflow-y-auto border-r border-slate-100 bg-white">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSidebarOpen(false)}
              className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 border-r w-64 bg-white z-40 md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-[100dvh] max-w-full">
        {/* Top Header */}
        <header className="relative z-10 bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-50 rounded-lg"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder={`${t('Search')}...`}
                className="pl-10 pr-4 py-2 border border-slate-200 rounded-xl text-sm bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none w-64 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="w-px h-6 bg-slate-200 mx-1"></div>
            <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                {(user?.fullName || user?.email || 'A')[0].toUpperCase()}
              </div>
              <div className="hidden sm:block text-sm">
                <p className="font-semibold text-slate-700 leading-none">{user?.fullName || user?.email?.split('@')[0] || t('Admin')}</p>
                <p className="text-xs text-slate-500">{getRoleDisplay(user?.role || 'admin', t)}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <div className="p-4 sm:px-6 lg:px-8 py-8 flex-1 overflow-x-hidden">
          <AnimatePresence mode="wait">
          {activeMenu === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('Overview')}</h2>
                <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1.5 border border-slate-200 rounded-lg shadow-sm">{t('Last 30 Days')}</div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: t('Total Revenue'), value: '$45,231', numeric: 45231, prefix: '$', trend: '+12.5%', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                  { label: t('Appointments'), value: '1,245', numeric: 1245, prefix: '', trend: '+5.2%', icon: Calendar, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: t('Total Patients'), value: '8,409', numeric: 8409, prefix: '', trend: '+2.4%', icon: Users, color: 'text-indigo-600', bg: 'bg-indigo-50' },
                  { label: t('Active Doctors'), value: '142', numeric: 142, prefix: '', trend: '+1.1%', icon: Stethoscope, color: 'text-purple-600', bg: 'bg-purple-50' },
                ].map((stat, idx) => (
                  <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                      <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md">
                        <TrendingUp className="h-3 w-3" />
                        {stat.trend}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-2xl font-bold text-slate-900 mb-1">
                        <AnimatedCounter value={stat.numeric} prefix={stat.prefix} />
                      </h4>
                      <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-96 flex flex-col w-full">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{t('Revenue Analysis')}</h3>
                      <p className="text-xs text-slate-500 font-medium">{t('Monthly revenue tracking')}</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={REVENUE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => `$${val/1000}k`} />
                        <CartesianGrid vertical={false} stroke="#f1f5f9" />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          formatter={(value: number) => [`$${value}`, 'Revenue']}
                        />
                        <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Appointments Chart */}
                <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm h-96 flex flex-col w-full">
                  <div className="flex justify-between items-center mb-6">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{t('Consultations')}</h3>
                      <p className="text-xs text-slate-500 font-medium">{t('Online vs In-Person split')}</p>
                    </div>
                  </div>
                  <div className="flex-1 w-full min-h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={APPOINTMENT_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                        <CartesianGrid vertical={false} stroke="#f1f5f9" />
                        <Tooltip 
                          contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                          cursor={{ fill: '#f8fafc' }}
                        />
                        <Bar dataKey="online" name="Online" stackId="a" fill="#c7d2fe" radius={[0, 0, 4, 4]} />
                        <Bar dataKey="offline" name="In-Person" stackId="a" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Recent Appointments Table */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden mt-6">
                <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-white">
                  <h3 className="text-base font-bold text-slate-900">{t('Recent Appointments')}</h3>
                  <button className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors">{t('View All')}</button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-slate-50/50 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4">{t('Patient')}</th>
                        <th className="px-6 py-4">{t('Doctor')}</th>
                        <th className="px-6 py-4">{t('Type')}</th>
                        <th className="px-6 py-4">{t('Time')}</th>
                        <th className="px-6 py-4">{t('Status')}</th>
                        <th className="px-6 py-4 text-right">{t('Action')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {RECENT_APPOINTMENTS.map((apt) => (
                        <tr key={apt.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 font-bold text-slate-900">{apt.patient}</td>
                          <td className="px-6 py-4 font-medium text-slate-600">{apt.doctor}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                              apt.type === 'Online' ? 'bg-blue-50 text-blue-700' : 'bg-purple-50 text-purple-700'
                            }`}>
                              {apt.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-medium text-slate-500">{apt.time}</td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                              apt.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                              apt.status === 'In Progress' ? 'bg-amber-50 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {apt.status === 'Completed' ? <CheckCircle2 className="h-3.5 w-3.5" /> : <Clock className="h-3.5 w-3.5" />}
                              {apt.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {(activeMenu === 'users' || activeMenu === 'suspended_users' || activeMenu === 'banned_users' || activeMenu === 'export_data') && (
            <motion.div
              key="users_management"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <UserManagement viewMode={activeMenu} />
            </motion.div>
          )}

          {activeMenu === 'doctor_verifications' && (
            <motion.div
              key="doctor_verifications"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <DoctorVerificationsManagement />
            </motion.div>
          )}

          {activeMenu === 'consent_history' && (
            <motion.div
              key="consent_history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <ConsentHistory />
            </motion.div>
          )}

          {activeMenu !== 'dashboard' && activeMenu !== 'users' && activeMenu !== 'suspended_users' && activeMenu !== 'banned_users' && activeMenu !== 'export_data' && activeMenu !== 'doctor_verifications' && activeMenu !== 'consent_history' && (
            <motion.div
              key="placeholder"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="flex-1 flex flex-col items-center justify-center text-center py-32 px-4"
            >
              <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mb-5 border border-slate-200">
                <FileText className="h-8 w-8 text-slate-400" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2 capitalize">{t(activeMenu)} {t('Management')}</h2>
              <p className="text-slate-500 font-medium max-w-sm">
                {t('This module is currently in development. You will be able to manage this section here in the next update.')}
              </p>
            </motion.div>
          )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
