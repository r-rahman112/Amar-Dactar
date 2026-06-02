import React, { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import HealthVault from './HealthVault';
import { ShieldCheck, Send, CheckCircle2, AlertCircle, Paperclip, Clock, Lock, Image as ImageIcon, Video, Mic, ArrowLeft, FolderHeart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { DoctorInfo } from '../types';
import { useAuth } from '../contexts/AuthContext';

interface PaidDoctorChatProps {
  sessionId: string;
  doctor: DoctorInfo;
  onExit: () => void;
  patientId?: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
  type: string;
  attachmentUrl?: string | null;
}

export default function PaidDoctorChat({ sessionId, doctor, onExit, patientId }: PaidDoctorChatProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [remainingSecs, setRemainingSecs] = useState<number | null>(null);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [myUserId, setMyUserId] = useState<string>('');
  const [showVault, setShowVault] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (!user) return;
    setMyUserId(user.id);

    const newSocket = io(window.location.origin, {
      withCredentials: true
    });

    newSocket.on('connect', () => {
       newSocket.emit('join_session', { sessionId });
    });

    newSocket.on('session_joined', ({ remainingSecs, status }) => {
       if (status === 'completed' || remainingSecs === 0) {
          setIsLocked(true);
          setRemainingSecs(0);
       } else {
          setRemainingSecs(remainingSecs);
       }
    });

    newSocket.on('receive_message', (msg: ChatMessage) => {
       setMessages(prev => [...prev, msg]);
    });

    newSocket.on('session_ended', () => {
       setIsLocked(true);
       setRemainingSecs(0);
    });

    newSocket.on('error', (err) => {
       console.error("Socket Error:", err);
       if (err === 'Session ended') {
          setIsLocked(true);
       }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [sessionId]);

  useEffect(() => {
    if (remainingSecs === null || remainingSecs <= 0 || isLocked) return;
    const interval = setInterval(() => {
       setRemainingSecs(prev => {
          if (prev && prev <= 1) {
             clearInterval(interval);
             setIsLocked(true);
             return 0;
          }
          return (prev || 0) - 1;
       });
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSecs, isLocked]);

  const handleSend = () => {
    if (!input.trim() || isLocked || !socket) return;
    socket.emit('send_message', { sessionId, text: input, type: 'text' });
    setInput('');
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 flex-1 relative">
      <div className="px-5 py-4 border-b border-slate-200 bg-white shadow-sm z-10 flex items-center justify-between shrink-0">
         <div className="flex items-center gap-4">
            <button onClick={onExit} className="p-2 -ml-2 bg-slate-50 hover:bg-slate-100 rounded-full text-slate-500 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="h-10 w-10 rounded-full overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
              {doctor.photoUrl ? (
                <img src={doctor.photoUrl} alt={doctor.fullName} className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-slate-100" />
              )}
            </div>
            <div>
              <h2 className="font-bold text-slate-900 leading-tight flex items-center gap-1.5">
                {doctor.fullName} <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />
              </h2>
              <p className="text-[11px] text-blue-600 font-medium">{doctor.specialty}</p>
            </div>
         </div>
         
         <div className="flex items-center gap-3">
           {user?.role === 'DOCTOR' && patientId && !isLocked && (
             <button onClick={() => setShowVault(true)} className="p-2 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-full transition-colors flex items-center gap-2 px-4 shadow-sm" title="Patient Vault">
               <FolderHeart className="w-4 h-4" />
               <span className="text-xs font-bold hidden sm:block">Patient Vault</span>
             </button>
           )}
           <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
             <Video className="w-4 h-4" />
           </button>
           <button className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors hidden sm:block">
             <Mic className="w-4 h-4" />
           </button>
           <div className={`px-4 py-1.5 rounded-full font-mono text-sm font-bold border flex items-center gap-2 ${isLocked ? 'bg-red-50 text-red-600 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
             <Clock className="w-4 h-4" />
             {remainingSecs !== null ? formatTime(remainingSecs) : '00:00'}
           </div>
         </div>
      </div>

      {showVault && (
        <div className="fixed inset-0 z-50 bg-white">
           <HealthVault onBack={() => setShowVault(false)} userRole="DOCTOR" patientId={patientId} />
        </div>
      )}

      <div className="flex-1 overflow-y-auto w-full max-w-4xl mx-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && !isLocked && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 gap-3 opacity-60">
            <ShieldCheck className="w-12 h-12" />
            <p className="text-sm font-medium">Session is strictly private & encrypted</p>
          </div>
        )}
        
        {messages.map((msg, i) => {
           const isMine = msg.senderId === myUserId;
           return (
             <motion.div 
               key={msg.id}
               initial={{ opacity: 0, y: 5 }}
               animate={{ opacity: 1, y: 0 }}
               className={`flex w-full ${isMine ? 'justify-end' : 'justify-start'}`}
             >
               <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:px-4 sm:py-3 shadow-sm relative group ${isMine ? 'bg-blue-600 text-white rounded-tr-sm' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'}`}>
                 <p className="text-[13px] sm:text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
                 <div className={`text-[9px] font-medium mt-1.5 flex justify-end gap-1 items-center ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                   {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                 </div>
               </div>
             </motion.div>
           );
        })}
        <div ref={messagesEndRef} />
      </div>

      {isLocked && (
        <div className="absolute inset-x-0 bottom-24 flex justify-center z-20 px-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-amber-100 border border-amber-200 text-amber-900 px-5 py-4 rounded-2xl shadow-xl flex items-center gap-3 max-w-md w-full"
          >
            <Lock className="w-6 h-6 text-amber-600 shrink-0" />
            <p className="text-sm font-semibold">আপনার সেশনের সময় শেষ হয়েছে। পুনরায় পরামর্শ চালিয়ে যেতে নতুন সেশন ক্রয় করুন।</p>
          </motion.div>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto px-4 pb-4 shrink-0 bg-slate-50 relative z-10">
         <div className={`flex items-end gap-2 p-2 bg-white border rounded-2xl shadow-sm transition-colors ${isLocked ? 'border-slate-200 bg-slate-50/50' : 'border-slate-300 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100'}`}>
           <div className="flex items-center gap-1 shrink-0 pb-1 pl-1">
             <button disabled={isLocked} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors disabled:opacity-50">
               <Paperclip className="h-4 w-4" />
             </button>
             <button disabled={isLocked} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-slate-50 rounded-xl transition-colors hidden sm:block disabled:opacity-50">
               <ImageIcon className="h-4 w-4" />
             </button>
           </div>
           
           <div className="flex-1 max-h-48 overflow-y-auto">
             <textarea 
               value={input}
               onChange={(e) => setInput(e.target.value)}
               onKeyDown={(e) => {
                 if(e.key === 'Enter' && !e.shiftKey) {
                   e.preventDefault();
                   handleSend();
                 }
               }}
               disabled={isLocked}
               placeholder={isLocked ? "Session ended..." : "Type your message securely..."}
               className="w-full bg-transparent border-none focus:ring-0 resize-none p-2 text-sm text-slate-700 min-h-[44px] disabled:opacity-60 disabled:cursor-not-allowed"
               rows={1}
             />
           </div>
           
           <button 
             onClick={handleSend}
             disabled={!input.trim() || isLocked}
             className="shrink-0 mb-1 mr-1 p-2 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
           >
             <Send className="h-4 w-4" />
           </button>
         </div>
      </div>
    </div>
  );
}
