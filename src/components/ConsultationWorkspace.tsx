import toast from "react-hot-toast";
import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Plus, 
  MessageSquare, 
  Calendar, 
  ArrowLeft, 
  Menu, 
  X, 
  Send, 
  Mic, 
  MicOff, 
  Image as ImageIcon, 
  Video as VideoIcon, 
  FileText, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Search, 
  Sparkles, 
  ShieldCheck,
  ChevronRight,
  MoreVertical,
  HelpCircle,
  Clock
} from 'lucide-react';
import { Message, AttachmentItem, ConsultationSession, DoctorInfo } from '../types';
import { useTranslation } from '../contexts/LanguageContext';
import BrandLogo from './BrandLogo';
import PaymentModal from './PaymentModal';
import PaidDoctorChat from './PaidDoctorChat';
import ConsultationScheduler from './ConsultationScheduler';

interface ConsultationWorkspaceProps {
  onBackToHome: () => void;
  initialUploadType?: 'symptom' | 'report' | null;
}

// Initial mockup data for history list
const INITIAL_SESSIONS: ConsultationSession[] = [
  {
    id: 'session-1',
    title: 'Lower Back Muscle Stiffness',
    date: 'May 28, 2026',
    category: 'Symptom Triage',
    messages: [
      {
        id: 'msg-1-1',
        sender: 'user',
        text: 'I have stiff muscle pain in my lumbar lower-back region since lifting boxes.',
        timestamp: '10:14 AM'
      },
      {
        id: 'msg-1-2',
        sender: 'assistant',
        text: 'Hello! I have reviewed your lumbar stiffness parameters. Lifting overexertion commonly induces localized paravertebral muscular strain rather than spinal disc compromise. I suggest keeping movement moderate and continuing back-support training. Please consult a physical therapist if sharp posture blockages continue.',
        timestamp: '10:15 AM'
      }
    ]
  },
  {
    id: 'session-2',
    title: 'Routine CBC Blood Panel Translation',
    date: 'Apr 14, 2026',
    category: 'Lab Report Decoder',
    messages: [
      {
        id: 'msg-2-1',
        sender: 'user',
        text: 'Here is my metabolic lab PDF.',
        timestamp: '3:22 PM',
        attachments: [
          {
            id: 'att-2-1',
            name: 'Standard_CBC_Blood_Count.pdf',
            type: 'pdf',
            size: '184 KB'
          }
        ]
      },
      {
        id: 'msg-2-2',
        sender: 'assistant',
        text: 'I parsed your Complete Blood Count. Your Hemoglobin at 14.2 g/dL indicates ideal blood oxygen transport. Your White Blood cell count is slightly elevated, suggesting your immune layout is safely recovering from a recent minor throat inflammation.',
        timestamp: '3:24 PM'
      }
    ]
  }
];

export default function ConsultationWorkspace({ onBackToHome, initialUploadType }: ConsultationWorkspaceProps) {
  const { t } = useTranslation();
  const [sessions, setSessions] = useState<ConsultationSession[]>(INITIAL_SESSIONS);
  const [activeSessionId, setActiveSessionId] = useState<string>('session-1');
  const [messages, setMessages] = useState<Message[]>(INITIAL_SESSIONS[0].messages);
  const [inputText, setInputText] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  // Attachments State
  const [draftAttachments, setDraftAttachments] = useState<AttachmentItem[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  // Voice Recording simulation values
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);

  // AI thinking state
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [searchHistoryQuery, setSearchHistoryQuery] = useState('');
  
  // Doctor profile modal state
  const [selectedDoctor, setSelectedDoctor] = useState<DoctorInfo | null>(null);
  
  // Payment and Paid Chat state
  const [paymentDoctor, setPaymentDoctor] = useState<DoctorInfo | null>(null);
  const [activePaidSessionId, setActivePaidSessionId] = useState<string | null>(null);
  
  // Scheduler state
  const [schedulerDoctor, setSchedulerDoctor] = useState<DoctorInfo | null>(null);
  const [scheduleDetails, setScheduleDetails] = useState<{date: string, time: string} | null>(null);

  // File Inputs references
  const fileInputRefRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  // Auto Scroll container
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Consent modal state
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  useEffect(() => {
    if (!localStorage.getItem('ai_consent_viewed')) {
      setShowDisclaimer(true);
    }
  }, []);

  const handleAcceptDisclaimer = () => {
    localStorage.setItem('ai_consent_viewed', 'true');
    setShowDisclaimer(false);
  };

  // Trigger modal triggers if initial screen choice exists
  useEffect(() => {
    if (initialUploadType === 'report') {
      // Simulate loaded report
      const mockReportAttachment: AttachmentItem = {
        id: 'att-custom-report',
        name: 'My_Recent_Biochemistry_Panel.pdf',
        type: 'pdf',
        size: '220 KB'
      };
      setDraftAttachments([mockReportAttachment]);
      setInputText('Please translate and explain this biochemistry panel report of mine.');
    } else if (initialUploadType === 'symptom') {
      setInputText('I have been experiencing mild fatigue and nasal stiffness today...');
    }
  }, [initialUploadType]);

  useEffect(() => {
    // Keep active messages in sync with currently active session
    const activeSession = sessions.find(s => s.id === activeSessionId);
    if (activeSession) {
      setMessages(activeSession.messages);
    }
  }, [activeSessionId, sessions]);

  // Scroll to bottom helper
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiTyping]);

  // Timer simulation for voice recording
  useEffect(() => {
    if (isRecording) {
      recordingTimerRef.current = setInterval(() => {
        setRecordingDuration(prev => prev + 1);
      }, 1000);
    } else {
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
      setRecordingDuration(0);
    }
    return () => {
      if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    };
  }, [isRecording]);

  const activeSessionDetail = sessions.find(s => s.id === activeSessionId) || sessions[0];

  // Action: Launch a new fresh session
  const handleStartNewConsultation = () => {
    const newSessionId = `session-${Date.now()}`;
    const newSession: ConsultationSession = {
      id: newSessionId,
      title: 'New Consultation Analysis',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      category: 'General Assessment',
      messages: [
        {
          id: `msg-${Date.now()}-ai-welcome`,
          sender: 'assistant',
          text: 'Hello, welcome to your private আমার ডাক্তার consultation workspace. You can describe your raw symptoms, text a medical question, or drag-and-drop clinical reports below to test instantly.',
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        }
      ]
    };

    setSessions([newSession, ...sessions]);
    setActiveSessionId(newSessionId);
    setDraftAttachments([]);
    setInputText('');
    setIsSidebarOpen(false); // Close sidebar on mobile
  };

  // Action: Delete a session
  const handleDeleteSession = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updatedSessions = sessions.filter(s => s.id !== id);
    if (updatedSessions.length === 0) {
      // Re-add a default blank one if empty
      const defaultId = 'session-default';
      setSessions([{
        id: defaultId,
        title: 'New Consultation Analysis',
        date: 'Today',
        category: 'General Assessment',
        messages: [{ id: 'msg-default', sender: 'assistant', text: 'State your symptoms or upload a diagnostics metric report to start.', timestamp: 'Now' }]
      }]);
      setActiveSessionId(defaultId);
    } else {
      setSessions(updatedSessions);
      if (activeSessionId === id) {
        setActiveSessionId(updatedSessions[0].id);
      }
    }
  };

  // Drag and Drop support
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      let type: 'image' | 'video' | 'pdf' | 'audio' = 'pdf';
      
      if (file.type.includes('image')) type = 'image';
      else if (file.type.includes('video')) type = 'video';
      else if (file.type.includes('audio')) type = 'audio';

      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        const newAttachment: AttachmentItem = {
          id: `att-${Date.now()}`,
          name: file.name,
          type: type,
          size: `${sizeMB} MB`,
          base64Data: base64String,
          mimeType: file.type || 'application/octet-stream'
        };
        setDraftAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Action: Click trigger inputs
  const triggerFileInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    ref.current?.click();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video' | 'pdf') => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
      
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64String = (event.target?.result as string).split(',')[1];
        const newAttachment: AttachmentItem = {
          id: `att-${Date.now()}`,
          name: file.name,
          type: type,
          size: `${sizeMB} MB`,
          base64Data: base64String,
          mimeType: file.type || 'application/octet-stream'
        };
        setDraftAttachments(prev => [...prev, newAttachment]);
      };
      reader.readAsDataURL(file);
    }
  };

  // Voice recording triggers
  const handleToggleVoiceRecording = () => {
    if (isRecording) {
      // Finished
      setIsRecording(false);
      const voiceAttachment: AttachmentItem = {
        id: `att-voice-${Date.now()}`,
        name: `Audio_Memo_${recordingDuration}s.wav`,
        type: 'audio',
        size: '1.2 MB'
      };
      setDraftAttachments([...draftAttachments, voiceAttachment]);
    } else {
      setIsRecording(true);
    }
  };

  // Remove individual drafted files
  const handleRemoveDraftAttachment = (id: string) => {
    setDraftAttachments(draftAttachments.filter(item => item.id !== id));
  };

  // Voice wave format generator
  const formatTime = (sec: number) => {
    const min = Math.floor(sec / 60);
    const remaining = sec % 60;
    return `${min}:${remaining < 10 ? '0' : ''}${remaining}`;
  };

  // Action: Submit Message
  const handleSubmitMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && draftAttachments.length === 0) return;

    const userMessageText = inputText;
    const submittedAttachments = [...draftAttachments];
    
    const userMsgId = `msg-${Date.now()}`;
    const userMsg: Message = {
      id: userMsgId,
      sender: 'user',
      text: userMessageText,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      attachments: submittedAttachments.length > 0 ? submittedAttachments : undefined
    };

    // Calculate update title if original title is default placeholder
    let isDefaultTitle = activeSessionDetail.title === 'New Consultation Analysis' || activeSessionDetail.title === '';
    let updatedTitle = activeSessionDetail.title;
    if (isDefaultTitle && userMessageText.trim()) {
      updatedTitle = userMessageText.slice(0, 32) + (userMessageText.length > 32 ? '...' : '');
    }

    // Append to local messages state immediately
    const updatedMessages = [...messages, userMsg];
    
    // Reset Draft Box
    setInputText('');
    setDraftAttachments([]);

    // Save user message to active session
    const updatedSessions = sessions.map(s => {
      if (s.id === activeSessionId) {
        return {
          ...s,
          title: updatedTitle,
          messages: updatedMessages
        };
      }
      return s;
    });
    setSessions(updatedSessions);

    // AI thinking block trigger
    setIsAiTyping(true);

    const fetchAIResponse = async () => {
      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ messages: updatedMessages })
        });
        const data = await response.json();

        if (!response.ok) {
           throw new Error(data.error || "Failed to process chat. Please check your login status or moderation suspension.");
        }
        
        let rawAiText = data.text || "I'm sorry, I encountered an error and could not process your request.";
        
        // Remove any <think> tags or chain-of-thought blocks emitted by AI reasoning models
        rawAiText = rawAiText.replace(/<think>[\s\S]*?<\/think>/gi, '').trim();
        let recommendedDoctors: any[] | undefined = undefined;

        const escalationMatch = rawAiText.match(/\[ESCALATION_SPECIALTY:\s*([^\]]+)\]/i);
        if (escalationMatch) {
          const specialty = escalationMatch[1].trim();
          rawAiText = rawAiText.replace(/\[ESCALATION_SPECIALTY:\s*([^\]]+)\]/i, '').trim();
          
          try {
             const docRes = await fetch(`/api/doctors/search?specialty=${encodeURIComponent(specialty)}`);
             if (docRes.ok) {
               recommendedDoctors = await docRes.json();
             }
          } catch(e) {
             console.error('Failed to fetch doctors', e);
          }
        }
        
        const aiMsgId = `msg-${Date.now()}-ai`;
        const aiResponseMsg: Message = {
          id: aiMsgId,
          sender: 'assistant',
          text: rawAiText,
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
          recommendedDoctors
        };

        setSessions(prevSessions => prevSessions.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...updatedMessages, aiResponseMsg]
            };
          }
          return s;
        }));
      } catch (error) {
        console.error(error);
        const errorMsg: Message = {
          id: `msg-${Date.now()}-ai-error`,
          sender: 'assistant',
          text: "I am currently unable to reach the diagnostic server. Please try again later.",
          timestamp: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
        };
        setSessions(prevSessions => prevSessions.map(s => {
          if (s.id === activeSessionId) {
            return {
              ...s,
              messages: [...updatedMessages, errorMsg]
            };
          }
          return s;
        }));
      } finally {
        setIsAiTyping(false);
      }
    };

    fetchAIResponse();
  };

  // Preset quick triggers helper
  const handleUsePresetQuestion = (text: string) => {
    setInputText(text);
  };

  // Sessions list filtered based on search bar
  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchHistoryQuery.toLowerCase()) ||
    s.category.toLowerCase().includes(searchHistoryQuery.toLowerCase())
  );

  return (
    <div 
      className="h-[calc(100dvh-72px)] flex text-slate-800 bg-white relative overflow-hidden"
      onDragOver={handleDragOver}
    >
      
      {/* Hidden file inputs configured uniquely */}
      <input 
        type="file" 
        ref={imageInputRef} 
        onChange={(e) => handleInputChange(e, 'image')}
        accept="image/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={videoInputRef} 
        onChange={(e) => handleInputChange(e, 'video')}
        accept="video/*" 
        className="hidden" 
      />
      <input 
        type="file" 
        ref={pdfInputRef} 
        onChange={(e) => handleInputChange(e, 'pdf')}
        accept=".pdf" 
        className="hidden" 
      />

      {/* Drag & Drop Visual overlay */}
      {isDragOver && (
        <div 
          className="absolute inset-0 bg-blue-500/10 backdrop-blur-sm border-4 border-dashed border-blue-500 z-50 flex flex-col items-center justify-center text-blue-800 animate-zoom-in"
          onDragOver={(e) => e.preventDefault()}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="bg-white p-6 rounded-3xl shadow-xl flex flex-col items-center text-center space-y-3 max-w-sm pointer-events-none">
            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl animate-bounce">
              <FileText className="h-8 w-8" />
            </div>
            <div>
              <p className="font-display font-semibold text-lg text-slate-900 leading-none">Drop Your File Anywhere</p>
              <p className="text-xs text-slate-500 mt-1">We will securely attach this file into your active medical sandbox session.</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar: Consultation Session history */}
      {/* Off-canvas sidebar for mobile, persistent on desktop */}
      <aside 
        id="chat-sidebar"
        className={`w-[290px] bg-slate-50 border-r border-slate-100 flex flex-col shrink-0 transition-transform duration-300 z-30 absolute md:relative top-0 bottom-0 left-0 md:translate-x-0 ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Header inside history list */}
        <div className="p-5 border-b border-slate-100 flex flex-col gap-4 bg-slate-50">
          <div className="mb-2">
            <BrandLogo iconSize="h-5 w-5" className="scale-90 origin-left" />
          </div>
          
          {/* Back button to portal index */}
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors font-medium self-start cursor-pointer"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>{t('Patient Portal')}</span>
          </button>

          {/* Core action button */}
          <button
            id="cta-start-new-consultation"
            onClick={handleStartNewConsultation}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold text-sm rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>{t('Start New')}</span>
          </button>
        </div>

        {/* Live Search filtering box */}
        <div className="px-5 py-3 border-b border-slate-100 bg-slate-50">
          <div className="relative">
            <Search className="h-4 w-4 text-slate-400 absolute top-2.5 left-3" />
            <input
              type="text"
              placeholder="Search history..."
              value={searchHistoryQuery}
              onChange={(e) => setSearchHistoryQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 focus:border-blue-400 rounded-xl focus:outline-none text-xs text-slate-800"
            />
          </div>
        </div>

        {/* Sessions list wrapper */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2.5">History Logs</span>
          
          {filteredSessions.map((session) => {
            const isActive = session.id === activeSessionId;

            return (
              <div
                key={session.id}
                onClick={() => {
                  setActiveSessionId(session.id);
                  setIsSidebarOpen(false); // Mobile auto close drawer
                }}
                className={`group relative p-3.5 rounded-xl border transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white border-blue-200 shadow-sm'
                    : 'border-transparent hover:bg-slate-100'
                }`}
              >
                <div className="space-y-1.5 pr-6">
                  {/* Category badge */}
                  <span className="text-[10px] font-bold tracking-wider uppercase text-blue-600">
                    {session.category}
                  </span>
                  
                  {/* Title */}
                  <h4 className={`text-xs font-semibold text-slate-900 line-clamp-1 leading-normal ${
                    isActive ? 'font-bold' : ''
                  }`}>
                    {session.title || 'Untitled Assessment'}
                  </h4>

                  {/* Date information */}
                  <div className="flex items-center text-[10px] text-slate-400 gap-1 font-medium">
                    <Clock className="h-3 w-3" />
                    <span>{session.date}</span>
                    <span className="mx-1">•</span>
                    <span>{session.messages.length} notes</span>
                  </div>
                </div>

                {/* Trash delete action */}
                <button
                  onClick={(e) => handleDeleteSession(session.id, e)}
                  className="absolute right-3 top-3.5 p-1 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                  title="Remove consultation"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })}

          {filteredSessions.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-400">
              No matching records found.
            </div>
          )}
        </div>

        {/* Secure Bottom Seal */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <div className="p-3 bg-white rounded-xl border border-slate-150 flex gap-2.5 items-center">
            <div className="p-1 bg-emerald-50 text-emerald-700 rounded-lg">
              <ShieldCheck className="h-4.5 w-4.5" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-800 leading-none">Sandbox Enclave</p>
              <p className="text-[10px] text-slate-400 leading-none mt-0.5">HIPAA standards encrypted</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile drawer backdrop */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/10 backdrop-blur-xs z-20 cursor-pointer"
        />
      )}

      {/* Core Chat Console Area */}
      {activePaidSessionId && paymentDoctor ? (
        <PaidDoctorChat 
          sessionId={activePaidSessionId} 
          doctor={paymentDoctor} 
          onExit={() => {
             setActivePaidSessionId(null);
             setPaymentDoctor(null);
          }} 
        />
      ) : (
      <section className="flex-1 flex flex-col h-full bg-white relative">
        
        {/* Workspace Sub Header top-bar */}
        <header className="px-5 py-4.5 border-b border-slate-100 flex justify-between items-center bg-white z-10 shrink-0">
          <div className="flex items-center space-x-3">
            {/* Hamburger for mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer"
              aria-label="Open sidebar panel"
            >
              <Menu className="h-5.5 w-5.5" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <h2 className="font-display font-bold text-sm sm:text-base text-slate-900 leading-none">
                  {activeSessionDetail.title || t('Consultation Workspace')}
                </h2>
                <span className="text-[10px] bg-slate-100 text-slate-700 font-bold px-1.5 py-0.5 rounded-md shrink-0">
                  {t('SECURE CHAT')}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 leading-none mt-1">
                {t('Virtual Assistant Specialist: General Family Health & Diagnostics Translator')}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <span className="hidden sm:inline-flex items-center text-[10px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-full font-bold">
              <ShieldCheck className="h-3.5 w-3.5 mr-1" />
              {t('HIPAA compliant transmission')}
            </span>
          </div>
        </header>

        {/* Message logs scroll layer */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-6 bg-slate-50">
          
          {messages.map((msg, index) => {
            const isUser = msg.sender === 'user';

            return (
              <motion.div
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.3, delay: index > 0 ? 0 : 0.1 }}
                key={msg.id}
                className={`flex gap-3 md:gap-4 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : 'mr-auto'}`}
              >
                {/* Avatar Icon */}
                <div className={`h-8 w-8 md:h-10 md:w-10 rounded-2xl shrink-0 flex items-center justify-center font-bold text-[10px] md:text-xs shadow-md ${
                  isUser 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-white text-blue-700 shadow-blue-100/50'
                }`}>
                  {isUser ? 'ME' : 'AI'}
                </div>

                {/* Text Message and Attachments card */}
                <div className="space-y-2">
                  <div className={`p-4 md:p-5 rounded-[1.5rem] border text-sm md:text-base leading-relaxed shadow-sm ${
                    isUser 
                      ? 'bg-blue-600 text-white border-blue-500 rounded-tr-sm shadow-blue-200/50' 
                      : 'bg-white text-slate-800 border-slate-100 rounded-tl-sm shadow-slate-200/40'
                  }`}>
                    {msg.text}
                  </div>

                  {/* Render attachments in this message */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2.5 pt-1">
                      {msg.attachments.map((att) => (
                        <div
                          key={att.id}
                          className="flex items-center gap-3 bg-slate-50 border border-slate-150 rounded-xl p-3 max-w-sm text-xs"
                        >
                          <div className="p-2 bg-blue-100 rounded-lg text-blue-700">
                            <FileText className="h-4.5 w-4.5" />
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{att.name}</p>
                            <span className="text-[10px] text-slate-400">{att.type.toUpperCase()} • {att.size}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Render recommended doctors in this message */}
                  {msg.recommendedDoctors && msg.recommendedDoctors.length > 0 && (
                    <div className="flex flex-col gap-3 pt-2">
                       {msg.recommendedDoctors.map((doc) => (
                         <div key={doc.id} className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row gap-4 items-start shadow-sm">
                           <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                             {doc.photoUrl ? (
                               <img src={doc.photoUrl} alt={doc.fullName} className="h-full w-full object-cover" />
                             ) : (
                               <div className="h-full w-full flex items-center justify-center text-slate-400">
                                 <Sparkles className="h-6 w-6" />
                               </div>
                             )}
                           </div>
                           <div className="flex-1 space-y-1">
                             <div className="flex justify-between items-start">
                               <div>
                                 <div className="flex items-center gap-1.5">
                                   <h4 className="font-bold text-slate-900 leading-tight">{doc.fullName}</h4>
                                   <span className="flex items-center justify-center p-0.5 rounded-full bg-emerald-100 text-emerald-700" title="Verified Doctor">
                                     <ShieldCheck className="h-3 w-3" />
                                   </span>
                                 </div>
                                 <p className="text-xs text-blue-600 font-medium">{doc.specialty}</p>
                               </div>
                               <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                                 {doc.availableStatus === 'available' ? 'Available' : 'Busy'}
                               </span>
                             </div>
                             <p className="text-[11px] text-slate-500 font-medium">{doc.degree}</p>
                             <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-slate-400 mt-1">
                               <span className="flex items-center gap-1"><Sparkles className="h-3 w-3" /> {doc.experience}</span>
                               <span className="flex items-center gap-1">৳ {doc.consultationFee} Fees</span>
                             </div>
                           </div>
                           <button 
                             onClick={() => setSelectedDoctor(doc)}
                             className="w-full sm:w-auto mt-2 sm:mt-0 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                           >
                             যোগাযোগ করুন
                           </button>
                         </div>
                       ))}
                    </div>
                  )}

                  {/* Timestamp detail */}
                  <span className={`text-[10px] text-slate-450 uppercase block font-medium ${isUser ? 'text-right pr-2' : 'pl-2'}`}>
                    {msg.timestamp}
                  </span>
                </div>
              </motion.div>
            );
          })}

          {/* AI Typing loading indicator */}
          {isAiTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="flex gap-4 max-w-3xl mr-auto animate-pulse"
            >
              <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center font-bold text-xs text-blue-700 shrink-0">
                AI
              </div>
              <div className="space-y-1">
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-none flex items-center gap-2 text-xs text-slate-500 font-medium font-sans">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-bounce [animation-delay:0.4s]"></span>
                  <span>আপনার তথ্য বিশ্লেষণ করা হচ্ছে...</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Anchor to scroll */}
          <div ref={chatEndRef} />
        </div>

        {/* Draft Attachment preview cards tray */}
        {draftAttachments.length > 0 && (
          <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-2.5 shrink-0 z-10">
            {draftAttachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs shadow-sm group"
              >
                <div className="p-1 bg-blue-50 text-blue-600 rounded">
                  <FileText className="h-3.5 w-3.5" />
                </div>
                <div className="max-w-[150px]">
                  <p className="font-bold text-slate-900 truncate">{att.name}</p>
                  <span className="text-[10px] text-slate-400 block leading-none mt-0.5">{att.size}</span>
                </div>
                <button
                  onClick={() => handleRemoveDraftAttachment(att.id)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-800 hover:bg-slate-50 ml-1.5 cursor-pointer flex items-center justify-center shrink-0"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Chat input dock wrapper */}
        <div className="border-t border-slate-100 bg-white p-4.5 shrink-0 z-10">
          <div className="max-w-3xl mx-auto space-y-3">
            
            {/* Quick recommendation options prompts */}
            {messages.length <= 1 && (
              <div className="flex flex-wrap gap-2 justify-center py-1">
                <button
                  onClick={() => handleUsePresetQuestion('I have a mild back stiffness and headache.')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-150 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Check common symptoms
                </button>
                <button
                  onClick={() => handleUsePresetQuestion('Explain why low ferritin can trigger hair shedding.')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-150 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Decode lab indicators
                </button>
                <button
                  onClick={() => handleUsePresetQuestion('How to resolve knee pain after playing basketball?')}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-blue-50 border border-slate-150 hover:border-blue-200 text-slate-600 hover:text-blue-700 text-xs font-semibold rounded-lg transition-all cursor-pointer"
                >
                  Post-sport physical relief
                </button>
              </div>
            )}

            {/* Input card controls */}
            <form onSubmit={handleSubmitMessage} className="relative">
              
              {/* Actual Input form wrapper containing buttons inside */}
              <div className="border border-slate-200 focus-within:border-blue-400 focus-within:ring-2 focus-within:ring-blue-100/50 rounded-2xl bg-white overflow-hidden transition-all duration-200 shadow-sm flex flex-col p-2.5">
                
                {/* Voice mode active banner bar */}
                {isRecording && (
                  <div className="px-3.5 py-2 bg-rose-50 border border-rose-100 rounded-xl mb-2.5 flex items-center justify-between text-rose-800 text-xs animate-pulse">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse"></span>
                      <span className="font-bold">Virtual transcription recorder capturing: {formatTime(recordingDuration)}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleToggleVoiceRecording}
                      className="text-[11px] bg-rose-100 text-rose-800 font-bold px-2 py-1 rounded hover:bg-rose-200 cursor-pointer"
                    >
                      Finish Stop
                    </button>
                  </div>
                )}

                {/* Large Text Editor textarea */}
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    // Check for Enter key send
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSubmitMessage();
                    }
                  }}
                  placeholder={t("Describe your symptoms or upload a report...")}
                  rows={2}
                  className="w-full px-3 py-2 text-slate-800 focus:outline-none placeholder:text-slate-400 text-sm sm:text-base resize-none"
                />

                {/* bottom toolbar inside input dock */}
                <div className="flex justify-between items-center bg-slate-50/55 p-1.5 rounded-xl border border-slate-100 mt-2.5">
                  <div className="flex items-center space-x-1.5">
                    {/* Choose Image file */}
                    <button
                      type="button"
                      onClick={() => triggerFileInput(imageInputRef)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Attach skin or physical symptom photo"
                    >
                      <ImageIcon className="h-4.5 w-4.5" />
                    </button>
                    
                    {/* Choose Video file */}
                    <button
                      type="button"
                      onClick={() => triggerFileInput(videoInputRef)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Attach motor physical joint motion video"
                    >
                      <VideoIcon className="h-4.5 w-4.5" />
                    </button>

                    {/* Choose PDF file */}
                    <button
                      type="button"
                      onClick={() => triggerFileInput(pdfInputRef)}
                      className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Attach medical PDF test reports"
                    >
                      <FileText className="h-4.5 w-4.5" />
                    </button>

                    {/* Choose Voice mic record */}
                    <button
                      type="button"
                      onClick={handleToggleVoiceRecording}
                      className={`p-2 rounded-lg transition-all cursor-pointer ${
                        isRecording 
                          ? 'bg-rose-550 text-rose-600 animate-pulse bg-rose-50' 
                          : 'text-slate-500 hover:text-blue-600 hover:bg-blue-50'
                      }`}
                      title={isRecording ? 'Stop voice recording' : 'Record symptom audio memo'}
                    >
                      <Mic className="h-4.5 w-4.5" />
                    </button>
                  </div>

                  {/* Send Button */}
                  <button
                    type="submit"
                    disabled={!inputText.trim() && draftAttachments.length === 0}
                    className={`p-2.5 px-4.5 rounded-xl font-bold flex items-center justify-center gap-1.5 transition-all text-xs cursor-pointer ${
                      (inputText.trim() || draftAttachments.length > 0)
                        ? 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow'
                        : 'bg-slate-100 text-slate-350 pointer-events-none'
                    }`}
                  >
                    <span>{t('Send')}</span>
                    <Send className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            </form>

            {/* Quick alert clinical guidance limits disclaimer */}
            <p className="text-[10px] text-slate-400 text-center leading-normal max-w-xl mx-auto">
              Our automated models help process text records and do not act as clinical decisions. Dial emergency services immediately if you feel acute or critical distress.
            </p>
          </div>
        </div>

      </section>
      )}

      {/* Scheduler Modal */}
      {schedulerDoctor && (
        <ConsultationScheduler 
          doctor={schedulerDoctor}
          onClose={() => setSchedulerDoctor(null)}
          onScheduleSelected={async (date, time, endTime) => {
             setSchedulerDoctor(null);
             try {
               const res = await fetch('/api/appointments/book', {
                 method: 'POST',
                 headers: {
                   'Content-Type': 'application/json',
                   'Authorization': `Bearer ${localStorage.getItem('token')}`
                 },
                 body: JSON.stringify({
                   doctor_id: schedulerDoctor.id,
                   date,
                   start_time: time,
                   end_time: endTime || 'Unknown'
                 })
               });
               const data = await res.json();
               if(data.success) {
                  toast.success('Appointment Booked Successfully!');
               } else {
                  toast.error(data.error || 'Failed to book');
               }
             } catch(e) {
               toast.error('Booking Error');
             }
          }}
        />
      )}

      {/* Payment Modal */}
      {paymentDoctor && !activePaidSessionId && (
        <PaymentModal 
           doctor={paymentDoctor} 
           onClose={() => setPaymentDoctor(null)} 
           onPaymentComplete={(sessionId) => setActivePaidSessionId(sessionId)}
        />
      )}

      {/* Doctor Profile Modal */}
      {selectedDoctor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setSelectedDoctor(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            className="bg-white rounded-3xl shadow-xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]"
          >
            <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h3 className="font-display font-bold text-lg text-slate-900 leading-none">Doctor Profile</h3>
              <button 
                onClick={() => setSelectedDoctor(null)}
                className="p-1.5 bg-slate-200 hover:bg-slate-300 rounded-full text-slate-600 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
                <div className="h-24 w-24 rounded-2xl overflow-hidden shrink-0 border border-slate-100 bg-slate-50">
                  {selectedDoctor.photoUrl ? (
                    <img src={selectedDoctor.photoUrl} alt={selectedDoctor.fullName} className="h-full w-full object-cover" />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-slate-400">
                      <Sparkles className="h-8 w-8" />
                    </div>
                  )}
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <h4 className="font-bold text-xl text-slate-900">{selectedDoctor.fullName}</h4>
                    {/* Assume the profile has verification status if it made it here, adding a shield icon */}
                    <span className="flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                      <ShieldCheck className="w-3 h-3" /> Verified
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 font-bold mt-0.5">{selectedDoctor.specialty}</p>
                  <p className="text-xs text-slate-500 font-medium mt-1">{selectedDoctor.degree}</p>
                  <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-100">
                      BMDC: {selectedDoctor.bmdcRegistration}
                    </span>
                    <span className="flex items-center text-[10px] text-yellow-600 font-bold bg-yellow-50 px-2 py-0.5 rounded-full border border-yellow-100">
                      ★ {selectedDoctor.ratings} ({selectedDoctor.reviews} reviews)
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                  <h5 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Consultation Info</h5>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-slate-500">Experience</p>
                      <p className="font-semibold text-sm text-slate-900">{selectedDoctor.experience}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-500">Consultation Fee</p>
                      <p className="font-semibold text-sm text-slate-900">৳ {selectedDoctor.consultationFee}</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <p className="text-[10px] text-slate-500">Available Hours</p>
                    <p className="font-semibold text-sm text-slate-900">{selectedDoctor.availableHours}</p>
                  </div>
                </div>

                <div className="bg-blue-50 rounded-2xl p-4 border border-blue-100">
                  <h5 className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Hospital Affiliation</h5>
                  <p className="font-semibold text-sm text-blue-900">{selectedDoctor.hospitalAffiliation}</p>
                </div>
              </div>
            </div>
            
            <div className="p-5 border-t border-slate-100 bg-white">
              <button 
                onClick={() => {
                  setSchedulerDoctor(selectedDoctor);
                  setSelectedDoctor(null);
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition-colors"
              >
                পয়েন্টমেন্ট বুক করুন (Schedule)
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* AI Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm shadow-2xl">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl max-w-md w-full p-8 shadow-2xl border border-slate-100"
          >
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
            
            <h3 className="text-xl font-bold text-slate-900 text-center mb-6 font-display">Healthcare Disclaimer</h3>
            
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 mb-8 space-y-3 text-slate-700 text-sm font-medium">
              <p>{t('আমি বুঝতে পারছি যে "আমার ডাক্তার" একটি AI সহায়ক প্ল্যাটফর্ম।')}</p>
              <p>{t('AI কোনো চিকিৎসক নয় এবং এটি রোগ নির্ণয় বা চিকিৎসা প্রেসক্রাইব করে না।')}</p>
              <p>{t('জরুরি অবস্থায় আমি সরাসরি চিকিৎসকের সাথে যোগাযোগ করব।')}</p>
            </div>
            
            <button
              onClick={handleAcceptDisclaimer}
              className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200"
            >
              Log in / Continue
            </button>
          </motion.div>
        </div>
      )}

    </div>
  );
}
