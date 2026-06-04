import { useState } from 'react';
import { X, Activity, MessageSquare, HeartPulse, Check, UserCheck, AlertCircle, Copy, CheckCircle2 } from 'lucide-react';

interface SymptomModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SYMPTOM_PRESETS = [
  {
    label: 'Flu & Dry Cough',
    text: 'Mild fever, dry tickling cough, joint aches, and general fatigue over the last 3 days.'
  },
  {
    label: 'Tension Headache',
    text: 'Dull, squeezing headache localized around the temples and neck band. Feels slightly relief with rest.'
  },
  {
    label: 'Knee Joint Strain',
    text: 'Stiffness in the right knee joint after playing basketball. Squeaks slightly upon bending with faint swelling.'
  }
];

export default function SymptomModal({ isOpen, onClose }: SymptomModalProps) {
  const [symptomText, setSymptomText] = useState('');
  const [status, setStatus] = useState<'input' | 'analyzing' | 'result'>('input');
  const [assessmentResult, setAssessmentResult] = useState<any>(null);

  if (!isOpen) return null;

  const handleAnalyze = () => {
    if (!symptomText.trim()) return;

    setStatus('analyzing');

    // Simulate clinical analysis time
    setTimeout(() => {
      // Formulate a beautiful, personalized, clinically-styled response card
      let findings = {
        educationalRisk: 'Low to Moderate',
        colorClass: 'text-amber-600 bg-amber-50 border-amber-200/50',
        alertIconColor: 'text-amber-500',
        specialty: 'Family General Practitioner',
        possibleCauses: 'General viral cold screening, upper respiratory irritation, or light sinus tension.',
        summary: 'Your described conditions point primarily to benign, frequent symptoms. The timeline suggests typical transient discomfort rather than hyper-acute inflammation.',
        questionsList: [
          'Does the cough aggravate primarily at night or in response to dry air?',
          'Do you have any histories of asthma or seasonal inhalant allergies?',
          'Have public contact groups at your home/work had active cold symptoms?'
        ]
      };

      if (symptomText.toLowerCase().includes('headache') || symptomText.toLowerCase().includes('migraine')) {
        findings = {
          educationalRisk: 'Low',
          colorClass: 'text-blue-600 bg-blue-50 border-blue-200/50',
          alertIconColor: 'text-blue-500',
          specialty: 'Neurologist / Stress Specialist',
          possibleCauses: 'Slight stress headache, cervical muscle strain, or dehydration-induced cerebral pressure.',
          summary: 'Temples throbbing generally correlates with hydration thresholds, poor sleep, or sustained screen posture.',
          questionsList: [
            'Have you consumed adequate fluids or missed meals today?',
            'Does bright sunlight, loud audio, or rapid head motion worsen the pattern?',
            'Has your sleep pattern been erratic or compressed over the preceding week?'
          ]
        };
      } else if (symptomText.toLowerCase().includes('knee') || symptomText.toLowerCase().includes('joint') || symptomText.toLowerCase().includes('strain')) {
        findings = {
          educationalRisk: 'Moderate',
          colorClass: 'text-amber-600 bg-amber-50 border-amber-200/50',
          alertIconColor: 'text-amber-500',
          specialty: 'Orthopedist / Physical Therapist',
          possibleCauses: 'Mild ligament strain, minor patellar tendon friction, or inflammatory synovitis response.',
          summary: 'Joint stiffness after dynamic play indicates mechanical load strain. Applying standard orthopedic R.I.C.E protocol is helpful for temporary self-care.',
          questionsList: [
            'Does weight-bearing or putting pressure directly on the kneecap cause immediate sharp pain?',
            'Did you feel or hear an audible popping sound when the initial injury happened?',
            'Are you able to fully extend and straighten the leg without mechanical blocking?'
          ]
        };
      }

      setAssessmentResult(findings);
      setStatus('result');
    }, 2000);
  };

  const handleReset = () => {
    setSymptomText('');
    setStatus('input');
    setAssessmentResult(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      {/* Container Card */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-zoom-in border border-slate-100">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center bg-blue-50/50 px-6 py-4.5 border-b border-blue-50">
          <div className="flex items-center space-x-2.5 text-blue-800">
            <HeartPulse className="h-5.5 w-5.5 text-blue-600 animate-pulse" />
            <h3 className="font-display font-bold text-lg text-slate-900">AI Symptom Evaluation Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Core Body */}
        <div className="p-6">
          
          {status === 'input' && (
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-bold text-slate-800">Describe what you are currently feeling:</label>
                <p className="text-xs text-slate-500">Explain your symptoms in simple language. Include details like duration and severity.</p>
              </div>

              {/* Presets Row */}
              <div className="space-y-2">
                <span className="text-xs text-slate-400 block font-semibold uppercase tracking-wider">Or click a sample scenario to test instantly:</span>
                <div className="flex flex-wrap gap-2.5">
                  {SYMPTOM_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      onClick={() => setSymptomText(preset.text)}
                      className={`text-xs px-3.5 py-2 font-medium rounded-xl border transition-all cursor-pointer ${
                        symptomText === preset.text
                          ? 'bg-blue-100 border-blue-300 text-blue-800 font-semibold'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border-slate-200/80'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Text Input area */}
              <textarea
                value={symptomText}
                onChange={(e) => setSymptomText(e.target.value)}
                placeholder="Example: I have been experiencing a mild dry cough and slight nasal congestion for two days, with mild fatigue..."
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl focus:border-blue-400 focus:outline-none text-slate-850 placeholder:text-slate-400 text-sm transition-all shadow-inner bg-slate-50/50"
              />

              {/* Submitting Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={!symptomText.trim()}
                  className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer ${
                    symptomText.trim()
                      ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow'
                      : 'bg-slate-200 text-slate-400 pointer-events-none'
                  }`}
                >
                  <Activity className="h-4 w-4" />
                  <span>Analyze Symptoms</span>
                </button>
              </div>
            </div>
          )}

          {status === 'analyzing' && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="relative flex items-center justify-center">
                <div className="h-16 w-16 bg-blue-100 rounded-full animate-ping opacity-75 absolute"></div>
                <div className="h-16 w-16 bg-blue-500 rounded-full flex items-center justify-center text-white relative shadow-lg">
                  <Activity className="h-8 w-8 animate-pulse" />
                </div>
              </div>
              <div className="text-center space-y-1 max-w-sm">
                <h4 className="font-display font-semibold text-base text-slate-900 leading-none">আপনার তথ্য বিশ্লেষণ করা হচ্ছে...</h4>
              </div>
              
              {/* Progress visual bar */}
              <div className="w-[200px] h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500 animate-infinite-loading w-[40%] rounded-full"></div>
              </div>
            </div>
          )}

          {status === 'result' && assessmentResult && (
            <div className="space-y-6">
              
              {/* Educational alert box banner */}
              <div className={`p-4 rounded-2xl border flex gap-3.5 items-start ${assessmentResult.colorClass}`}>
                <AlertCircle className={`h-5 w-5 mt-0.5 shrink-0 ${assessmentResult.alertIconColor}`} />
                <div>
                  <h4 className="text-sm font-bold leading-none mb-1">
                    Education Triage Tier: {assessmentResult.educationalRisk} Risk
                  </h4>
                  <p className="text-xs font-normal leading-relaxed opacity-95">
                    This automated response represents public health references. It is not an actual diagnosis or therapy.
                  </p>
                </div>
              </div>

              {/* Assessment body details */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Likely Area of Analysis</span>
                    <p className="text-sm font-semibold text-slate-900 leading-snug">{assessmentResult.possibleCauses}</p>
                  </div>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-1">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Recommended Specialist Category</span>
                    <p className="text-sm font-semibold text-slate-900 leading-snug flex items-center gap-1.5">
                      <UserCheck className="h-4 w-4 text-emerald-600" />
                      {assessmentResult.specialty}
                    </p>
                  </div>
                </div>

                <div className="bg-blue-50/20 border border-blue-50/50 rounded-2xl p-5 space-y-2">
                  <h4 className="text-sm font-bold text-slate-900">Summary & Wellness Focus</h4>
                  <p className="text-slate-600 text-sm leading-relaxed">{assessmentResult.summary}</p>
                </div>

                {/* Important Doctor Questions list */}
                <div className="space-y-2.5">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Ask Your General Doctor These Questions:</h4>
                  <div className="space-y-2">
                    {assessmentResult.questionsList.map((q: string, idx: number) => (
                      <div key={idx} className="flex gap-2.5 items-start text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-100/65">
                        <Check className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                        <p className="leading-snug">{q}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex justify-between items-center pt-3 border-t border-slate-100">
                <p className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Verified Educational Output
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  >
                    Test Another Symptom
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer animate-fade-in"
                  >
                    Done
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
}
