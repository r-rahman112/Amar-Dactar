import React, { useState } from 'react';
import { useTranslation } from '../contexts/LanguageContext';
import { motion } from 'framer-motion';
import { X, CheckCircle2, ShieldCheck, Clock, CreditCard } from 'lucide-react';
import { DoctorInfo } from '../types';

interface PaymentModalProps {
  doctor: DoctorInfo;
  onClose: () => void;
  onPaymentComplete: (sessionId: string) => void;
}

export default function PaymentModal({ doctor, onClose, onPaymentComplete }: PaymentModalProps) {
  const { t } = useTranslation();
  const [selectedPackage, setSelectedPackage] = useState<number>(10);
  const [selectedMethod, setSelectedMethod] = useState<string>('bKash');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');

  const packages = [
    { mins: 10, price: 500 },
    { mins: 20, price: 800 },
    { mins: 30, price: 1000 },
    { mins: 60, price: 1500 }
  ];

  const paymentMethods = [
    { id: 'bKash', name: 'bKash', color: 'bg-pink-600' },
    { id: 'Nagad', name: 'Nagad', color: 'bg-orange-500' },
    { id: 'Rocket', name: 'Rocket', color: 'bg-purple-600' },
    { id: 'Upay', name: 'Upay', color: 'bg-blue-600' }
  ];

  const handlePayment = async () => {
    setProcessing(true);
    setError('');
    try {
      // Intiate payment
      const initRes = await fetch('/api/payment/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          doctorId: doctor.id,
          packageMinutes: selectedPackage,
          paymentMethod: selectedMethod
        })
      });
      const initData = await initRes.json();
      if (!initData.success) {
        throw new Error(initData.error || 'Failed to initiate payment');
      }

      // Simulate Gateway Delay
      await new Promise(r => setTimeout(r, 2000));

      // Complete payment
      const compRes = await fetch('/api/payment/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          sessionId: initData.sessionId
        })
      });
      const compData = await compRes.json();
      if (!compData.success) {
        throw new Error(compData.error || 'Failed to complete payment');
      }

      onPaymentComplete(compData.sessionId);
    } catch (err: any) {
      setError(err.message);
      setProcessing(false);
    }
  };

  const selectedPrice = packages.find(p => p.mins === selectedPackage)?.price || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={processing ? undefined : onClose} />
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
      >
        <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Consultation Payment</h3>
            <p className="text-xs text-slate-500 mt-1">Select package and continue to secure payment</p>
          </div>
          {!processing && (
            <button onClick={onClose} className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <div className="p-6 overflow-y-auto">
          {error && (
            <div className="mb-4 text-xs font-bold text-red-600 bg-red-50 border border-red-100 p-3 rounded-xl text-center">
              {error}
            </div>
          )}

          <div className="flex items-center gap-4 mb-6 bg-slate-50 p-4 rounded-2xl border border-slate-100">
             <div className="h-12 w-12 rounded-xl overflow-hidden shrink-0 border border-slate-200 bg-white">
                {doctor.photoUrl ? (
                  <img src={doctor.photoUrl} alt={doctor.fullName} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-100" />
                )}
             </div>
             <div>
                <h4 className="font-bold text-slate-900">{doctor.fullName}</h4>
                <p className="text-xs text-blue-600 font-semibold">{doctor.specialty}</p>
             </div>
          </div>

          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-slate-400" /> Select Time Package
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-6">
            {packages.map(pkg => (
              <button
                key={pkg.mins}
                onClick={() => setSelectedPackage(pkg.mins)}
                className={`p-3 rounded-xl border-2 text-left transition-all ${
                  selectedPackage === pkg.mins 
                  ? 'border-blue-600 bg-blue-50/50 shadow-sm' 
                  : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="text-sm font-bold text-slate-900">{pkg.mins} Minutes</div>
                <div className="text-xs text-slate-500 font-medium">৳ {pkg.price}</div>
              </button>
            ))}
          </div>

          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
            <CreditCard className="w-4 h-4 text-slate-400" /> Payment Method
          </h4>
          <div className="grid grid-cols-2 gap-3 mb-4">
            {paymentMethods.map(method => (
              <button
                key={method.id}
                onClick={() => setSelectedMethod(method.id)}
                className={`p-3 rounded-xl border-2 flex items-center justify-center transition-all ${
                  selectedMethod === method.id 
                  ? `border-slate-900 bg-slate-900 text-white shadow-sm` 
                  : 'border-slate-100 bg-slate-50 text-slate-700 hover:border-slate-300'
                }`}
              >
                <span className="font-bold text-sm tracking-wide">{method.name}</span>
              </button>
            ))}
          </div>
          
          <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium mt-2 mb-2">
            <ShieldCheck className="w-3 h-3" /> Secure SSL Encrypted Payment Gateway
          </div>
        </div>

        <div className="p-5 border-t border-slate-100 bg-slate-50 flex items-center justify-between">
           <div>
             <span className="block text-xs font-semibold text-slate-500">Total Payable</span>
             <span className="block text-2xl font-bold text-slate-900">৳ {selectedPrice}</span>
           </div>
           
           <button 
             onClick={handlePayment}
             disabled={processing}
             className="px-8 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md transition-colors flex items-center gap-2"
           >
             {processing ? (
               <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Processing...</>
             ) : (
               <>Pay ৳ {selectedPrice} & Start</>
             )}
           </button>
        </div>
      </motion.div>
    </div>
  );
}
