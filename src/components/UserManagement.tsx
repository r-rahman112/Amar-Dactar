import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { Search, Plus, MoreVertical, Edit, ShieldBan, ShieldAlert, Key, UserCheck, UserX, Download, FileSpreadsheet, Eye, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';

interface UserData {
  id: string;
  fullname: string;
  email: string;
  mobile: string;
  role: string;
  status: string;
  violations: number;
  profile: string;
  createdat: string;
}

export default function UserManagement({ viewMode = 'users' }: { viewMode?: string }) {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // View Profile
  const [selectedProfile, setSelectedProfile] = useState<UserData | null>(null);

  // Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'user', mobile: '' });

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data = await res.json();
        setUsers(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleAction = async (id: string, action: string, value?: string) => {
    let url = `/api/users/${id}`;
    let method = 'DELETE';
    let body;

    if (action === 'status') {
      url += '/status'; method = 'PATCH'; body = { status: value };
    } else if (action === 'role') {
      url += '/role'; method = 'PATCH'; body = { role: value };
    } else if (action === 'reset_password') {
      url += '/reset-password'; method = 'PATCH'; body = { newPassword: value || '12345678A!' };
    }

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      ...(body ? { body: JSON.stringify(body) } : {})
    });
    fetchUsers();
  };

  // Parsing JSON safely
  const getProfileData = (u: UserData) => {
    try { return u.profile ? JSON.parse(u.profile) : {}; } catch { return {}; }
  };

  const toggleSelection = (id: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIds(newSelection);
  };
  
  const toggleAll = () => {
    if (selectedIds.size === filteredUsers.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(filteredUsers.map(u => u.id)));
  };

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Apply ViewMode
    if (viewMode === 'suspended_users') filtered = filtered.filter(u => u.status === 'suspended');
    if (viewMode === 'banned_users') filtered = filtered.filter(u => u.status === 'banned');

    // Apply Status Filter
    if (statusFilter !== 'All') {
       if (statusFilter === 'Verified') filtered = filtered.filter(u => getProfileData(u).nidStatus === 'Verified');
       else if (statusFilter === 'Pending Verification') filtered = filtered.filter(u => getProfileData(u).nidStatus === 'Pending' || !getProfileData(u).nidStatus);
       else filtered = filtered.filter(u => u.status.toLowerCase() === statusFilter.toLowerCase());
    }

    // Apply Search (Name, email, phone, ID)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        (u.fullname || '').toLowerCase().includes(q) ||
        (u.email || '').toLowerCase().includes(q) ||
        (u.mobile || '').toLowerCase().includes(q) ||
        u.id.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [users, viewMode, statusFilter, searchQuery]);

  const handleExport = async (format: 'xlsx' | 'csv') => {
     let dataToExport = filteredUsers;
     if (selectedIds.size > 0) {
        dataToExport = filteredUsers.filter(u => selectedIds.has(u.id));
     }

     const exportData = dataToExport.map(u => {
        const p = getProfileData(u);
        return {
          'User ID': u.id,
          'Registration Date': new Date(u.createdat).toLocaleString(),
          'Full Name': u.fullname,
          'Mobile Number': u.mobile || '-',
          'Email': u.email,
          'Date of Birth': p.dob || '-',
          'Age': p.age || '-',
          'Gender': p.gender || '-',
          'Blood Group': p.bloodGroup || '-',
          'Height (cm)': p.height || '-',
          'Weight (kg)': p.weight || '-',
          'BMI': p.bmi || '-',
          'Diabetes Status': p.medical?.diabetes || '-',
          'High BP Status': p.medical?.highBp || '-',
          'Asthma Status': p.medical?.asthma || '-',
          'Heart Disease Status': p.medical?.heartDisease || '-',
          'Chronic Diseases': p.medical?.chronicDiseases || '-',
          'Current Medications': p.medical?.currentMeds || '-',
          'Drug Allergies': p.medical?.allergies || '-',
          'Surgery History': p.medical?.surgeryHistory || '-',
          'Family Disease History': p.medical?.familyDisease || '-',
          'Smoking Status': p.medical?.smokingStatus || '-',
          'Alcohol Consumption Status': p.medical?.alcoholStatus || '-',
          'Mental Health Information': p.medical?.mentalHealth || '-',
          'Emergency Contact Name': p.emergencyContact?.name || '-',
          'Emergency Contact Relation': p.emergencyContact?.relation || '-',
          'Emergency Contact Number': p.emergencyContact?.mobile || '-',
          'NID Verification': p.nidStatus || 'Pending',
          'Account Status': u.status,
          'User Role': u.role
        };
     });

     if (exportData.length === 0) return;

     const workbook = new ExcelJS.Workbook();
     const worksheet = workbook.addWorksheet("Patients");
     
     // Add headers
     const headers = Object.keys(exportData[0]);
     worksheet.addRow(headers);
     
     // Add data
     exportData.forEach(data => {
       worksheet.addRow(Object.values(data));
     });

     if (format === 'xlsx') {
        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        saveAs(blob, `Patient_Data_${new Date().getTime()}.xlsx`);
     } else {
        const buffer = await workbook.csv.writeBuffer();
        const blob = new Blob(['\uFEFF', buffer], { type: 'text/csv;charset=utf-8;' });
        saveAs(blob, `Patient_Data_${new Date().getTime()}.csv`);
     }
  };

  if (loading) return <div className="p-8">Loading users...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            {viewMode === 'users' ? 'User Management' : 
             viewMode === 'suspended_users' ? 'Suspended Users' :
             viewMode === 'banned_users' ? 'Banned Users' : 'Export Data'}
          </h2>
          <p className="text-sm text-slate-500">Manage patient records and account status.</p>
        </div>
        
        <div className="flex gap-2">
           <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 font-bold rounded-xl shadow-sm hover:bg-blue-100 transition-all"><Plus className="h-4 w-4" /> Add User</button>
           <button onClick={() => handleExport('csv')} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl shadow-sm transition-all"><FileSpreadsheet className="h-4 w-4" /> {t('Export CSV')}</button>
           <button onClick={() => handleExport('xlsx')} className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-sm transition-all"><Download className="h-4 w-4" /> {t('Export Excel')}</button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
         <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
            <input 
              type="text" 
              placeholder={t('Search users by name, id or email...')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
            />
         </div>
         <select 
           value={statusFilter} 
           onChange={(e) => setStatusFilter(e.target.value)} 
           className="px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl outline-none font-medium text-slate-700 focus:border-blue-500"
         >
            <option value="All">All Filter ({filteredUsers.length})</option>
            <option value="Verified">Verified</option>
            <option value="Pending Verification">Pending Verification</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="banned">Banned</option>
         </select>
      </div>

      <div className="bg-white border text-left border-slate-200 rounded-2xl shadow-sm overflow-hidden overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
            <tr>
              <th className="px-6 py-4">
                <input type="checkbox" checked={selectedIds.size > 0 && selectedIds.size === filteredUsers.length} onChange={toggleAll} className="w-4 h-4 rounded border-slate-300 text-blue-600" />
              </th>
              <th className="px-6 py-4">Patient Info</th>
              <th className="px-6 py-4">Contact</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredUsers.map(u => {
              const p = getProfileData(u);
              return (
              <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4">
                  <input type="checkbox" checked={selectedIds.has(u.id)} onChange={() => toggleSelection(u.id)} className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 shrink-0">
                      {(u.fullname || '?').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">{u.fullname}</div>
                      <div className="text-slate-500 text-xs mt-0.5 flex items-center gap-1">ID: <span className="font-mono text-[10px] bg-slate-100 px-1 rounded">{u.id.split('-')[0]}</span></div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="font-medium text-slate-700">{u.mobile || '-'}</div>
                  <div className="text-slate-500 text-xs">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={u.role} 
                    onChange={(e) => handleAction(u.id, 'role', e.target.value)}
                    disabled={user?.role !== 'superadmin'}
                    className="border-none bg-slate-50 rounded-lg py-1 px-2 font-bold text-slate-700 text-xs tracking-wider uppercase cursor-pointer"
                  >
                    <option value="user">User</option>
                    <option value="assistant_admin">Ast. Admin</option>
                    <option value="admin">Admin</option>
                    <option value="superadmin">Superadmin</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                    u.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                    u.status === 'suspended' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {u.status}
                  </span>
                  {p.nidStatus === 'Verified' && (
                    <span className="ml-2 inline-flex items-center px-2 py-1 rounded border border-blue-200 text-blue-600 text-[10px] font-bold">✓ NID</span>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setSelectedProfile(u)} title="View Profile" className="p-2 text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"><Eye className="h-4 w-4" /></button>
                    
                    {user?.role === 'superadmin' && (
                      <>
                        {u.status !== 'suspended' && (
                          <button onClick={() => handleAction(u.id, 'status', 'suspended')} title="Suspend" className="p-2 text-amber-600 bg-amber-50 rounded-lg hover:bg-amber-100 transition-colors"><ShieldAlert className="h-4 w-4" /></button>
                        )}
                        {u.status !== 'banned' && (
                          <button onClick={() => handleAction(u.id, 'status', 'banned')} title="Ban" className="p-2 text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"><ShieldBan className="h-4 w-4" /></button>
                        )}
                        {(u.status === 'suspended' || u.status === 'banned') && (
                          <button onClick={() => handleAction(u.id, 'status', 'active')} title="Reactivate" className="p-2 text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"><UserCheck className="h-4 w-4" /></button>
                        )}
                        <button onClick={() => { if(confirm('Reset password for user?')) handleAction(u.id, 'reset_password') }} title="Reset Password" className="p-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"><Key className="h-4 w-4" /></button>
                        <button onClick={() => { if(confirm('Permanently delete user?')) handleAction(u.id, 'delete') }} title="Delete" className="p-2 text-red-600 hover:text-red-700 transition-colors"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )})}
            {filteredUsers.length === 0 && (
               <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-slate-500 font-medium">No users found matching your criteria.</td>
               </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* View Profile Modal */}
      {selectedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-xl font-bold text-slate-900">Patient Profile Details</h2>
                <button onClick={() => setSelectedProfile(null)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <UserX className="h-5 w-5" />
                </button>
              </div>
              <div className="p-6 md:p-8 flex-1 overflow-y-auto space-y-8 text-left">
                
                {/* 1. Header Info */}
                <div className="flex items-center gap-6">
                  <div className="h-20 w-20 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 text-3xl">
                     {(selectedProfile.fullname || '?').charAt(0).toUpperCase()}
                  </div>
                  <div>
                     <h3 className="text-2xl font-bold text-slate-900">{selectedProfile.fullname}</h3>
                     <p className="text-slate-500 font-medium">{selectedProfile.email} • {selectedProfile.mobile || 'No Mobile'}</p>
                     <div className="flex gap-2 mt-2">
                        <span className={`px-2.5 py-1 text-xs font-bold rounded-lg ${selectedProfile.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>{selectedProfile.status.toUpperCase()} ACCOUNT</span>
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-slate-100 text-slate-600">ROLE: {selectedProfile.role.toUpperCase()}</span>
                        <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 text-indigo-700">Violations: {selectedProfile.violations || 0}</span>
                     </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   {/* 2. Registration Details */}
                   <div className="space-y-4">
                     <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Registration Information</h4>
                     <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                       <dt className="text-slate-500">User ID</dt><dd className="font-medium text-slate-900 break-all">{selectedProfile.id}</dd>
                       <dt className="text-slate-500">Joined Date</dt><dd className="font-medium text-slate-900">{new Date(selectedProfile.createdat).toLocaleDateString()}</dd>
                       <dt className="text-slate-500">Gender</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).gender || '-'}</dd>
                       <dt className="text-slate-500">Date of Birth</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).dob || '-'}</dd>
                       <dt className="text-slate-500">Age</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).age || '-'}</dd>
                       <dt className="text-slate-500">Blood Group</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).bloodGroup || '-'}</dd>
                       <dt className="text-slate-500">Physical</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).height ? `${getProfileData(selectedProfile).height}cm` : '-'}, {getProfileData(selectedProfile).weight ? `${getProfileData(selectedProfile).weight}kg` : '-'}</dd>
                       <dt className="text-slate-500">BMI</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).bmi || '-'}</dd>
                     </dl>
                   </div>

                   {/* 3. Emergency Contact & Verification */}
                   <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Emergency & Validation</h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                       <dt className="text-slate-500">Emg. Name</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).emergencyContact?.name || '-'}</dd>
                       <dt className="text-slate-500">Relation</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).emergencyContact?.relation || '-'}</dd>
                       <dt className="text-slate-500">Emg. Mobile</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).emergencyContact?.mobile || '-'}</dd>
                       <dt className="text-slate-500">NID Status</dt><dd className="font-bold text-blue-600">{getProfileData(selectedProfile).nidStatus || 'Pending'}</dd>
                     </dl>
                   </div>
                </div>

                {/* 4. Medical Information */}
                <div className="space-y-4">
                   <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Medical Conditions</h4>
                   <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                     {['diabetes', 'highBp', 'asthma', 'heartDisease'].map(field => {
                        const val = getProfileData(selectedProfile).medical?.[field];
                        return (
                          <div key={field} className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div className="text-xs text-slate-500 font-bold capitalize mb-1">{field.replace(/([A-Z])/g, ' $1').trim()}</div>
                            <div className={`font-bold ${val === 'Yes' ? 'text-red-600' : 'text-slate-900'}`}>{val || '-'}</div>
                          </div>
                        )
                     })}
                   </div>

                   <dl className="space-y-3 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100 mt-4">
                       <div><dt className="text-slate-500 font-bold mb-0.5">Chronic Diseases</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.chronicDiseases || '-'}</dd></div>
                       <div><dt className="text-slate-500 font-bold mb-0.5">Current Medications</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.currentMeds || '-'}</dd></div>
                       <div><dt className="text-slate-500 font-bold mb-0.5">Drug Allergies</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.allergies || '-'}</dd></div>
                       <div><dt className="text-slate-500 font-bold mb-0.5">Surgery History</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.surgeryHistory || '-'}</dd></div>
                       <div><dt className="text-slate-500 font-bold mb-0.5">Family Disease History</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.familyDisease || '-'}</dd></div>
                       <div><dt className="text-slate-500 font-bold mb-0.5">Smoking Status</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.smokingStatus || '-'}</dd></div>
                       <div><dt className="text-slate-500 font-bold mb-0.5">Alcohol Consumption</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.alcoholStatus || '-'}</dd></div>
                       <div><dt className="text-slate-500 font-bold mb-0.5">Mental Health Info</dt><dd className="font-medium text-slate-900">{getProfileData(selectedProfile).medical?.mentalHealth || '-'}</dd></div>
                   </dl>
                </div>

                {/* 5. Documents & Activity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Uploaded Reports</h4>
                      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex flex-col items-center justify-center text-center">
                         <div className="text-slate-400 mb-2 mt-4"><Download className="h-8 w-8 mx-auto opacity-50" /></div>
                         <div className="text-sm font-bold text-slate-700">No Reports Available</div>
                         <div className="text-xs text-slate-500 mb-4">Patient has not uploaded any medical reports yet.</div>
                      </div>
                   </div>

                   <div className="space-y-4">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider border-b pb-2">Chat Statistics</h4>
                      <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm bg-slate-50 p-5 rounded-2xl border border-slate-100">
                         <dt className="text-slate-500">Total Queries</dt><dd className="font-medium text-slate-900">0</dd>
                         <dt className="text-slate-500">Last Active</dt><dd className="font-medium text-slate-900">-</dd>
                         <dt className="text-slate-500">Avg. Response Time</dt><dd className="font-medium text-slate-900">-</dd>
                         <dt className="text-slate-500">Feedback Score</dt><dd className="font-medium text-slate-900">N/A</dd>
                      </dl>
                   </div>
                </div>
                
              </div>
           </div>
        </div>
      )}

      {showAddForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
           <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden flex flex-col">
              <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <h2 className="text-lg font-bold text-slate-900">Add New User</h2>
                <button onClick={() => setShowAddForm(false)} className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                  <UserX className="h-5 w-5" />
                </button>
              </div>
              <form onSubmit={async (e) => {
                 e.preventDefault();
                 setLoading(true);
                 try {
                    await fetch('/api/users', {
                       method: 'POST',
                       headers: { 'Content-Type': 'application/json' },
                       body: JSON.stringify(formData)
                    });
                    setShowAddForm(false);
                    setFormData({ fullName: '', email: '', password: '', role: 'user', mobile: '' });
                    fetchUsers();
                 } catch (err) {
                    console.error(err);
                    setLoading(false);
                 }
              }} className="p-6 space-y-4 text-left">
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Full Name</label>
                    <input type="text" required value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Email</label>
                    <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Mobile</label>
                    <input type="text" required value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                    <input type="password" required minLength={8} value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none" />
                 </div>
                 <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Role</label>
                    <select required value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none">
                       <option value="user">User</option>
                       <option value="assistant_admin">Assistant Admin</option>
                       <option value="admin">Admin</option>
                       {user?.role === 'superadmin' && <option value="superadmin">Superadmin</option>}
                    </select>
                 </div>
                 <div className="pt-2">
                    <button type="submit" disabled={loading} className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all">Create User</button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
