import React, { useState } from 'react';
import { ArrowLeft, MessageSquare, HeadphonesIcon, HelpCircle, AlertCircle, CheckCircle2, ShieldCheck, Send } from 'lucide-react';
import { useTranslation } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { motion } from 'motion/react';

interface SupportProps {
  onBack: () => void;
}

export default function Support({ onBack }: SupportProps) {
  const { t, language } = useTranslation();
  const isBengali = language === 'bn';

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successStatus, setSuccessStatus] = useState(false);
  const [errorStatus, setErrorStatus] = useState(false);

  const heroTitle = isBengali ? 'আমরা সাহায্য করতে প্রস্তুত' : 'We Are Here To Help';
  const heroSubtitle = isBengali
    ? 'আপনার প্রশ্ন, মতামত অথবা প্রযুক্তিগত সমস্যার সমাধানে আমাদের সাথে যোগাযোগ করুন।'
    : 'Contact us for questions, feedback, or technical assistance.';
  
  const formLabels = {
    name: isBengali ? 'নাম' : 'Name',
    email: isBengali ? 'ইমেইল' : 'Email',
    subject: isBengali ? 'বিষয়' : 'Subject',
    message: isBengali ? 'বার্তা' : 'Message',
    submit: isBengali ? 'পাঠান' : 'Send',
    sending: isBengali ? 'পাঠানো হচ্ছে...' : 'Sending...',
  };

  const successMessage = isBengali
    ? 'আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা যত দ্রুত সম্ভব যোগাযোগ করব।'
    : 'Your message has been sent successfully. We will respond as soon as possible.';
    
  const errorMessage = isBengali
    ? 'বার্তা পাঠানো যায়নি। অনুগ্রহ করে পরে আবার চেষ্টা করুন।'
    : 'Failed to send message. Please try again later.';

  React.useEffect(() => {
    document.title = isBengali ? "সাপোর্ট | আমার ডাক্তার" : "Support | Amar Daktar";
  }, [isBengali]);

  const supportCardTitle = isBengali ? 'আমাদের সাপোর্ট' : 'Our Support';
  
  const supportItems = isBengali ? [
    { title: 'প্রযুক্তিগত সহায়তা', icon: <HeadphonesIcon className="w-5 h-5" /> },
    { title: 'অ্যাকাউন্ট সংক্রান্ত সমস্যা', icon: <AlertCircle className="w-5 h-5" /> },
    { title: 'ফিডব্যাক ও পরামর্শ', icon: <MessageSquare className="w-5 h-5" /> },
    { title: 'সাধারণ জিজ্ঞাসা', icon: <HelpCircle className="w-5 h-5" /> }
  ] : [
    { title: 'Technical Assistance', icon: <HeadphonesIcon className="w-5 h-5" /> },
    { title: 'Account Issues', icon: <AlertCircle className="w-5 h-5" /> },
    { title: 'Feedback & Suggestions', icon: <MessageSquare className="w-5 h-5" /> },
    { title: 'General Inquiries', icon: <HelpCircle className="w-5 h-5" /> }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errorStatus) setErrorStatus(false);
    if (successStatus) setSuccessStatus(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) return;

    setIsSubmitting(true);
    setSuccessStatus(false);
    setErrorStatus(false);

    try {
      console.log("SUPABASE URL:", import.meta.env.VITE_SUPABASE_URL ? "Loaded" : "Missing");
      console.log("SUPABASE ANON KEY:", import.meta.env.VITE_SUPABASE_ANON_KEY ? "Loaded" : "Missing");

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

      if (!supabaseUrl || !supabaseAnonKey) {
        const missingVars = [];
        if (!import.meta.env.VITE_SUPABASE_URL) missingVars.push('VITE_SUPABASE_URL');
        if (!import.meta.env.VITE_SUPABASE_ANON_KEY) missingVars.push('VITE_SUPABASE_ANON_KEY');
        const errorMessage = `Supabase configuration missing: ${missingVars.join(', ')}`;
        toast.error(errorMessage);
        throw new Error(errorMessage);
      }

      // Moderate first
      const modRes = await fetch('/api/users/support/moderate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: formData.message })
      });
      
      const modData = await modRes.json();
      if (!modRes.ok) {
         throw new Error(modData.error || 'Moderation failed');
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/send-support-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabaseAnonKey}`
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          subject: formData.subject,
          message: formData.message
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to send support email: ${response.status} ${response.statusText} - ${errorText}`);
      }

      setSuccessStatus(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success(successMessage);
    } catch (error) {
      console.error('Email sending failed:', error);
      setErrorStatus(true);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[100dvh] bg-slate-50 flex flex-col relative font-sans">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
        
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full mb-6 font-medium text-sm"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>{supportCardTitle}</span>
          </motion.div>
          <motion.h1 
             initial={{ opacity: 0, y: 20 }}
             animate={{ opacity: 1, y: 0 }}
             transition={{ delay: 0.1 }}
             className="text-4xl sm:text-5xl font-display font-bold text-slate-900 tracking-tight"
          >
            {heroTitle}
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            {heroSubtitle}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          
          {/* Left Column: Form & Info */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Visual Illustration Card */}
            <div className="bg-slate-900 rounded-[2rem] p-8 overflow-hidden relative shadow-lg min-h-[300px] flex items-center justify-center">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-screen filter blur-[80px] opacity-20"></div>
               
               <div className="relative text-center z-10 flex flex-col items-center">
                  <div className="w-32 h-32 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20 mb-6">
                    <div className="relative">
                      <HeadphonesIcon className="w-16 h-16 text-blue-400 stroke-[1.5]" />
                      <div className="absolute -top-1 -right-2 flex w-4 h-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-400 border-2 border-slate-900"></span>
                      </div>
                    </div>
                  </div>
                  <h3 className="text-white font-bold text-2xl mb-2">{isBengali ? 'আমরা শুনছি' : 'We Are Listening'}</h3>
                  <p className="text-slate-400 max-w-[250px] leading-relaxed">
                     {isBengali ? 'আমাদের সাপোর্ট টিম সবসময় আপনার সেবায় প্রস্তুত' : 'Our support team is always ready to assist you'}
                  </p>
               </div>
            </div>

            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8 sm:p-10">
              
              {successStatus && (
                <div className="mb-8 p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start space-x-4">
                  <div className="bg-emerald-100 p-2 rounded-full text-emerald-600 shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-emerald-900 text-lg mb-1">{t('Success')}</h3>
                    <p className="text-emerald-700 font-medium">{successMessage}</p>
                  </div>
                </div>
              )}

              {errorStatus && (
                <div className="mb-8 p-6 bg-red-50 rounded-2xl border border-red-100 flex items-start space-x-4">
                  <div className="bg-red-100 p-2 rounded-full text-red-600 shrink-0">
                    <AlertCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-red-900 text-lg mb-1">{t('Error')}</h3>
                    <p className="text-red-700 font-medium">{errorMessage}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2 text-left">
                    <label htmlFor="name" className="text-sm font-bold text-slate-700 block">
                      {formLabels.name} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="name"
                      name="name"
                      type="text"
                      required
                      maxLength={100}
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition-all text-slate-800"
                      placeholder={isBengali ? 'আপনার পুরো নাম' : 'John Doe'}
                    />
                  </div>

                  <div className="space-y-2 text-left">
                    <label htmlFor="email" className="text-sm font-bold text-slate-700 block">
                      {formLabels.email} <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      required
                      maxLength={150}
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition-all text-slate-800"
                      placeholder="hello@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="subject" className="text-sm font-bold text-slate-700 block">
                    {formLabels.subject}
                  </label>
                  <input
                    id="subject"
                    name="subject"
                    type="text"
                    maxLength={200}
                    value={formData.subject}
                    onChange={handleInputChange}
                    className="w-full h-12 px-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition-all text-slate-800"
                    placeholder={isBengali ? 'কী বিষয়ে জানতে চান?' : 'How can we help you?'}
                  />
                </div>

                <div className="space-y-2 text-left">
                  <label htmlFor="message" className="text-sm font-bold text-slate-700 block">
                    {formLabels.message} <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    maxLength={1000}
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={5}
                    className="w-full p-4 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-100/50 transition-all text-slate-800 resize-none"
                    placeholder={isBengali ? 'আপনার বার্তা লিখুন...' : 'Write your message here...'}
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || !formData.name.trim() || !formData.email.trim() || !formData.message.trim()}
                  className="w-full sm:w-auto px-8 h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-[0_4px_12px_-4px_rgba(37,99,235,0.3)] transition-all flex items-center justify-center space-x-2 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin h-5 w-5 border-2 border-white/20 border-t-white rounded-full"></div>
                      <span>{formLabels.sending}</span>
                    </>
                  ) : (
                    <>
                      <span>{formLabels.submit}</span>
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Column: Info Only */}
          <div className="lg:col-span-5 space-y-8 flex flex-col h-full">
            
            {/* Support Info Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm">
              <h3 className="font-bold text-slate-800 text-lg mb-6 pb-4 border-b border-slate-100 flex items-center">
                <span className="bg-slate-100 text-slate-600 p-2 rounded-lg mr-3">
                  <HelpCircle className="w-5 h-5" />
                </span>
                {supportCardTitle}
              </h3>
              <ul className="space-y-4">
                {supportItems.map((item, idx) => (
                  <li key={idx} className="flex items-center space-x-4 text-slate-600">
                    <div className="text-blue-600 bg-blue-50 p-2.5 rounded-xl shrink-0">
                      {item.icon}
                    </div>
                    <span className="font-medium text-[15px]">{item.title}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}
