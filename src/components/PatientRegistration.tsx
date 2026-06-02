import { useTranslation } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowRight, ArrowLeft, Check, Eye, EyeOff, User, Mail, Phone, Lock, Activity, AlertCircle } from 'lucide-react';
import BrandLogo from './BrandLogo';

interface PatientRegistrationProps {
  onSuccess: () => void;
  onLoginClick: () => void;
}

export default function PatientRegistration({ onSuccess, onLoginClick }: PatientRegistrationProps) {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Form Data
  const [formData, setFormData] = useState({
    // Step 1: Account
    fullName: '',
    mobile: '',
    email: '',
    password: '',
    confirmPassword: '',

    // Step 2: Basic Info
    dob: '',
    gender: '',
    bloodGroup: '',
    height: '',
    weight: '',
    
    // Emergency Contact
    emgName: '',
    emgRelation: '',
    emgMobile: '',

    // Step 3: Medical Info (Optional)
    diabetes: '',
    highBp: '',
    asthma: '',
    heartDisease: '',
    chronicDiseases: '',
    currentMeds: '',
    allergies: '',
    surgeryHistory: '',
    familyDisease: '',
    smokingStatus: '',
    alcoholStatus: '',
    mentalHealth: ''
  });

  // Derived states
  const [age, setAge] = useState<number | ''>('');
  const [bmi, setBmi] = useState<string>('');
  const [bmiStatus, setBmiStatus] = useState<string>('');

  // Password Validation States
  const [passReqs, setPassReqs] = useState({
    length: false,
    upper: false,
    lower: false,
    num: false,
    special: false
  });
  const [passStrength, setPassStrength] = useState<number>(0);

  useEffect(() => {
    // Password strength & requirements
    const p = formData.password;
    const reqs = {
      length: p.length >= 8,
      upper: /[A-Z]/.test(p),
      lower: /[a-z]/.test(p),
      num: /[0-9]/.test(p),
      special: /[^A-Za-z0-9]/.test(p)
    };
    setPassReqs(reqs);

    let score = Object.values(reqs).filter(Boolean).length;
    setPassStrength(score);
  }, [formData.password]);

  useEffect(() => {
    // Age calculator
    if (formData.dob) {
      const birthDate = new Date(formData.dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      setAge(calculatedAge >= 0 ? calculatedAge : 0);
    } else {
      setAge('');
    }
  }, [formData.dob]);

  useEffect(() => {
    // BMI Calculator
    if (formData.weight && formData.height) {
      const w = parseFloat(formData.weight);
      const hMs = parseFloat(formData.height) / 100;
      if (w > 0 && hMs > 0) {
        const val = w / (hMs * hMs);
        setBmi(val.toFixed(1));
        if (val < 18.5) setBmiStatus('Underweight');
        else if (val >= 18.5 && val <= 24.9) setBmiStatus('Normal');
        else setBmiStatus('Overweight');
      } else {
        setBmi('');
        setBmiStatus('');
      }
    } else {
      setBmi('');
      setBmiStatus('');
    }
  }, [formData.weight, formData.height]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorMsg) setErrorMsg(null);
  };

  const getStrengthLabel = () => {
    if (passStrength <= 1) return { label: 'Very Weak', color: 'bg-red-500', text: 'text-red-600' };
    if (passStrength === 2 || passStrength === 3) return { label: 'Medium', color: 'bg-amber-400', text: 'text-amber-600' };
    if (passStrength === 4) return { label: 'Strong', color: 'bg-emerald-500', text: 'text-emerald-600' };
    return { label: t('Very Strong'), color: 'bg-emerald-600', text: 'text-emerald-700' };
  };

  const strengthInfo = getStrengthLabel();

  const handleNextStep = () => {
    setErrorMsg(null);
    if (step === 1) {
      if (!formData.fullName || !formData.mobile || !formData.email || !formData.password || !formData.confirmPassword) {
        setErrorMsg(t('Please fill all required fields.'));
        return;
      }
      if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
        setErrorMsg(t('Please enter a valid email address.'));
        return;
      }
      if (!/^(?:\+88|88)?(01[3-9]\d{8})$/.test(formData.mobile)) {
        setErrorMsg(t('Please enter a valid mobile number (e.g., 01xxxxxxxxx).'));
        return;
      }
      if (passStrength < 5) {
         setErrorMsg(t('Password must meet all requirements.'));
         return;
      }
      if (formData.password !== formData.confirmPassword) {
        setErrorMsg(t('Passwords do not match.'));
        return;
      }
    }
    if (step === 2) {
      if (!formData.dob || !formData.gender || !formData.emgName || !formData.emgMobile) {
         setErrorMsg(t('Please fill out basic info and emergency contact.'));
         return;
      }
    }
    setStep(step + 1);
  };

  const handlePrevStep = () => {
    setStep(step - 1);
    setErrorMsg(null);
  };

  const handleSubmit = async () => {
    setErrorMsg(null);
    setLoading(true);

    try {
      // Structure metadata
      const profile = {
        age, bmi, bmiStatus,
        dob: formData.dob,
        gender: formData.gender,
        bloodGroup: formData.bloodGroup,
        height: formData.height,
        weight: formData.weight,
        emergencyContact: {
          name: formData.emgName,
          relation: formData.emgRelation,
          mobile: formData.emgMobile
        },
        medical: {
          diabetes: formData.diabetes,
          highBp: formData.highBp,
          asthma: formData.asthma,
          heartDisease: formData.heartDisease,
          chronicDiseases: formData.chronicDiseases,
          currentMeds: formData.currentMeds,
          allergies: formData.allergies,
          surgeryHistory: formData.surgeryHistory,
          familyDisease: formData.familyDisease,
          smokingStatus: formData.smokingStatus,
          alcoholStatus: formData.alcoholStatus,
          mentalHealth: formData.mentalHealth
        }
      };

      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          fullName: formData.fullName, 
          email: formData.email, 
          password: formData.password, 
          mobile: formData.mobile,
          role: 'user',
          profile 
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      
      // Auto-login (since we don't have direct mock login without generating token properly properly, we will just call normal login endpoint)
      const loginRes = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email, password: formData.password })
      });
      const loginData = await loginRes.json();
      
      if (loginRes.ok) {
         login(loginData.user);
         onSuccess();
      } else {
         onSuccess(); // fallback
      }

    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };


  const progress = (step / 4) * 100;

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col items-center relative">
      <div className="mb-6 flex justify-center">
        <BrandLogo iconSize="h-8 w-8" />
      </div>
      <div className="w-full bg-white rounded-[2rem] shadow-xl border border-slate-100 overflow-hidden relative">
        {/* Progress Bar Header */}
        <div className="bg-slate-50 px-6 py-6 border-b border-slate-100 relative">
         <div className="absolute top-0 left-0 h-1.5 bg-blue-600 transition-all duration-500 ease-out z-10" style={{ width: `${progress}%` }}></div>
         <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-50"></div>
         <div className="flex justify-between items-center text-sm font-semibold tracking-tight">
            <span className={step >= 1 ? 'text-blue-600' : 'text-slate-400'}>{t('1. Account')}</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className={step >= 2 ? 'text-blue-600' : 'text-slate-400'}>{t('2. Basic Info')}</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className={step >= 3 ? 'text-blue-600' : 'text-slate-400'}>{t('3. Medical Info')}</span>
            <ArrowRight className="w-4 h-4 text-slate-300" />
            <span className={step === 4 ? 'text-blue-600' : 'text-slate-400'}>{t('4. Review')}</span>
         </div>
      </div>

      <div className="p-6 md:p-8">
        
        {errorMsg && (
          <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} className="mb-6 p-4 bg-red-50 text-red-600 text-sm font-semibold rounded-2xl flex items-center gap-3">
            <AlertCircle className="w-5 h-5" />
            {errorMsg}
          </motion.div>
        )}

        <div className="min-h-[400px]">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: ACCOUNT INFO */}
            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-5">
                <h2 className="text-2xl font-bold text-slate-900 mb-6 font-display">{t('Create Account')}</h2>
                
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Full Name')} <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder={t("Enter your full name")} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Mobile Number')}<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="tel" name="mobile" value={formData.mobile} onChange={handleChange} placeholder={t("01XXXXXXXXX")} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Email Address')}<span className="text-red-500">*</span></label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder={t("Your Email")} className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Password')}<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} placeholder={t("Create new password")} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium tracking-wide" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-blue-600 transition-colors">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Password Strength Meter */}
                  {formData.password.length > 0 && (
                    <div className="mt-3">
                      <div className="flex gap-1 h-1.5 w-full rounded-full overflow-hidden bg-slate-100">
                        <div className={`h-full flex-1 transition-colors duration-300 ${passStrength >= 1 ? strengthInfo.color : ''}`}></div>
                        <div className={`h-full flex-1 transition-colors duration-300 ${passStrength >= 2 ? strengthInfo.color : ''}`}></div>
                        <div className={`h-full flex-1 transition-colors duration-300 ${passStrength >= 3 ? strengthInfo.color : ''}`}></div>
                        <div className={`h-full flex-1 transition-colors duration-300 ${passStrength >= 4 ? strengthInfo.color : ''}`}></div>
                        <div className={`h-full flex-1 transition-colors duration-300 ${passStrength >= 5 ? strengthInfo.color : ''}`}></div>
                      </div>
                      <p className={`text-xs mt-1.5 font-bold ${strengthInfo.text}`}>{strengthInfo.label} {t('Password')}</p>
                      
                      {/* Requirements */}
                      <ul className="mt-2 text-xs text-slate-500 grid grid-cols-2 lg:grid-cols-3 gap-y-1">
                         <li className="flex items-center gap-1.5"><Check className={`w-3.5 h-3.5 ${passReqs.length ? 'text-emerald-500' : 'text-slate-300'}`}/> {t('8 characters')}</li>
                         <li className="flex items-center gap-1.5"><Check className={`w-3.5 h-3.5 ${passReqs.upper ? 'text-emerald-500' : 'text-slate-300'}`}/> {t('Uppercase (A-Z)')}</li>
                         <li className="flex items-center gap-1.5"><Check className={`w-3.5 h-3.5 ${passReqs.lower ? 'text-emerald-500' : 'text-slate-300'}`}/> {t('Lowercase (a-z)')}</li>
                         <li className="flex items-center gap-1.5"><Check className={`w-3.5 h-3.5 ${passReqs.num ? 'text-emerald-500' : 'text-slate-300'}`}/> {t('Number (0-9)')}</li>
                         <li className="flex items-center gap-1.5 col-span-2"><Check className={`w-3.5 h-3.5 ${passReqs.special ? 'text-emerald-500' : 'text-slate-300'}`}/> {t('Special character (!@#$%)')}</li>
                      </ul>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Confirm Password')}<span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input type={showPassword ? 'text' : 'password'} name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder={t("Re-enter password")} className="w-full pl-11 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-2xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all font-medium tracking-wide" />
                  </div>
                </div>

              </motion.div>
            )}

            {/* STEP 2: BASIC INFO */}
            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">{t('Patient Basic Info')}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t('Please fill in your basic info for proper treatment.')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Date of Birth')}<span className="text-red-500">*</span></label>
                    <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Age')}</label>
                    <div className="w-full px-4 py-3 bg-slate-100 border border-transparent rounded-xl text-slate-600 font-bold">
                       {age !== '' ? `${age} ${t('Years')}` : t('Auto calculated')}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Gender')}<span className="text-red-500">*</span></label>
                    <select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium appearance-none">
                       <option value="">{t('Select')}</option>
                       <option value="Male">{t('Male')}</option>
                       <option value="Female">{t('Female')}</option>
                       <option value="Other">{t('Other')}</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Blood Group')}</label>
                    <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium appearance-none">
                       <option value="">{t('Unknown / Select')}</option>
                       <option value="A+">A+</option>
                       <option value="A-">A-</option>
                       <option value="B+">B+</option>
                       <option value="B-">B-</option>
                       <option value="AB+">AB+</option>
                       <option value="AB-">AB-</option>
                       <option value="O+">O+</option>
                       <option value="O-">O-</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-blue-50/50 rounded-2xl border border-blue-100">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Height (cm)')}</label>
                    <input type="number" name="height" value={formData.height} onChange={handleChange} placeholder={t("e.g. 165")} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium" />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Weight (kg)')}</label>
                    <input type="number" name="weight" value={formData.weight} onChange={handleChange} placeholder={t("e.g. 65")} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 font-medium" />
                  </div>
                  {bmi && (
                    <motion.div initial={{opacity:0}} animate={{opacity:1}} className="col-span-4 mt-2 p-3 bg-white rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                       <div className="font-semibold text-slate-600 text-sm">{t('BMI Calculation:')}</div>
                       <div className="font-bold text-slate-900 flex items-center gap-2">
                         {bmi} 
                         <span className={`text-xs px-2.5 py-0.5 rounded-full ${bmiStatus === 'Normal' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>{bmiStatus}</span>
                       </div>
                    </motion.div>
                  )}
                </div>

                <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-900 font-display mb-4">{t('Emergency Contact')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Name')}<span className="text-red-500">*</span></label>
                        <input type="text" name="emgName" value={formData.emgName} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Relation')}</label>
                        <input type="text" name="emgRelation" value={formData.emgRelation} onChange={handleChange} placeholder={t("Father/Mother/Brother")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{t('Mobile')}<span className="text-red-500">*</span></label>
                        <input type="tel" name="emgMobile" value={formData.emgMobile} onChange={handleChange} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-medium" />
                      </div>
                    </div>
                </div>

              </motion.div>
            )}


            {/* STEP 3: MEDICAL INFO */}
            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                    <div className="flex justify-between items-start">
                        <div>
                            <h2 className="text-2xl font-bold text-slate-900 font-display">{t('Health Information')}</h2>
                            <p className="text-slate-500 text-sm mt-1">{t('This is optional. You can fill it now or update later from dashboard.')}</p>
                        </div>
                        <span className="bg-slate-100 text-slate-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">{t('Optional')}</span>
                    </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                   {[
                     { label: 'Have Diabetes?', name: 'diabetes' },
                     { label: 'Have High BP?', name: 'highBp' },
                     { label: 'Have Asthma?', name: 'asthma' },
                     { label: 'Have Heart Disease?', name: 'heartDisease' }
                   ].map(item => (
                     <div key={item.name}>
                        <label className="block text-sm font-semibold text-slate-700 mb-2">{item.label}</label>
                        <select name={item.name} value={(formData as any)[item.name]} onChange={handleChange} className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium">
                           <option value="">{t('Select')}</option>
                           <option value="Yes">{t('Yes')}</option>
                           <option value="No">{t('No')}</option>
                        </select>
                     </div>
                   ))}
                </div>

                <div className="space-y-4">
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">{t('Have Chronic Diseases?')}</label>
                     <textarea name="chronicDiseases" rows={2} value={formData.chronicDiseases} onChange={handleChange} placeholder={t("Please detail (if any)")} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">{t('Current Medications')}</label>
                     <textarea name="currentMeds" rows={2} value={formData.currentMeds} onChange={handleChange} placeholder={t('Enter medicine names')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea>
                   </div>
                   <div>
                     <label className="block text-sm font-semibold text-slate-700 mb-1">{t('Any drug allergies?')}</label>
                     <textarea name="allergies" rows={2} value={formData.allergies} onChange={handleChange} placeholder={t('Enter medicine names (if any)')} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl resize-none"></textarea>
                   </div>
                </div>
              </motion.div>
            )}

            
            {/* STEP 4: REVIEW */}
            {step === 4 && (
              <motion.div key="step4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-6">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 font-display">{t('Review')}</h2>
                    <p className="text-slate-500 text-sm mt-1">{t('Please verify and confirm your provided information.')}</p>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-sm space-y-4">
                   <div className="flex justify-between items-center border-b pb-4">
                     <div>
                       <h3 className="font-bold text-slate-900">{formData.fullName}</h3>
                       <p className="text-sm text-slate-500">{formData.email} • {formData.mobile}</p>
                     </div>
                     <button onClick={() => setStep(1)} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">{t('Change')}</button>
                   </div>

                   <div className="flex justify-between items-center border-b pb-4 pt-2">
                     <div>
                       <h3 className="font-bold text-slate-900 text-sm mb-1">{t('Basic Info')}</h3>
                       <p className="text-sm text-slate-500">{t('Age')}: {age || '-'}, {t('Gender')}: {formData.gender === 'Male' ? t('Male') : formData.gender === 'Female' ? t('Female') : formData.gender || '-'}, BMI: {bmi || '-'}</p>
                     </div>
                     <button onClick={() => setStep(2)} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">{t('Change')}</button>
                   </div>
                   
                   <div className="flex justify-between items-center pt-2">
                     <div>
                       <h3 className="font-bold text-slate-900 text-sm mb-1">{t('Health Info')}</h3>
                       <p className="text-sm text-slate-500">
                          {formData.diabetes || formData.highBp || formData.asthma || formData.chronicDiseases ? t('Updated') : t('Not Updated')}
                       </p>
                     </div>
                     <button onClick={() => setStep(3)} className="text-blue-600 font-bold text-sm bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">{t('Change')}</button>
                   </div>
                </div>

                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 flex gap-3 text-emerald-800">
                  <Check className="w-5 h-5 shrink-0 mt-0.5" />
                  <p className="text-sm font-medium">{t('I certify that all provided information is true to my knowledge and correct for medical usage.')}</p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse md:flex-row items-center justify-between gap-4">
            
            {step === 1 ? (
              <p className="text-slate-600 font-medium text-sm text-center">
                 {t('Already have an account?')} <button onClick={onLoginClick} className="text-blue-600 font-bold hover:underline">{t('Log in')}</button>
              </p>
            ) : (
              <button type="button" onClick={handlePrevStep} className="w-full md:w-auto px-6 py-3.5 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 font-bold rounded-2xl transition-all flex items-center justify-center gap-2">
                <ArrowLeft className="w-5 h-5" /> {t('Previous Step')}
              </button>
            )}

            {step < 4 ? (
              <button 
                type="button" 
                onClick={handleNextStep} 
                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover-scale transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2"
              >
                {t('Next Step')} <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button 
                type="button" 
                onClick={handleSubmit} 
                disabled={loading}
                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 text-white font-bold rounded-2xl hover-scale transition-all shadow-[0_8px_20px_-6px_rgba(37,99,235,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                   <span className="flex items-center gap-2">
                     <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                     </svg>
                     {t('Please wait...')}
                   </span>
                ) : (
                   <><Check className="w-5 h-5" /> {t('Create Profile')}</>
                )}
              </button>
            )}

        </div>
      </div>
    </div>
    </div>
  );
}
