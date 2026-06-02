import { useState } from 'react';
import { X, Upload, FileText, CheckCircle, AlertTriangle, HelpCircle, ArrowRight, ArrowDownToLine, Loader2, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const REPORT_TEMPLATES = [
  {
    id: 'cbc',
    name: 'Standard CBC Blood Count Panel.pdf',
    size: '184 KB',
    updatedAt: 'May 2026',
    title: 'Complete Blood Count (CBC) Panel Study',
    metrics: [
      {
        name: 'Hemoglobin (Hb)',
        value: '14.2 g/dL',
        status: 'Optimal',
        range: '13.5 - 17.5 g/dL',
        color: 'emerald',
        gaugePercent: '55%',
        remark: 'Hemoglobin levels are in optimal bands. It supports strong cell oxygenation and active cardiovascular performance.'
      },
      {
        name: 'White Blood Cell (WBC)',
        value: '11.8 x10^3 / µL',
        status: 'Slightly Elevated',
        range: '4.5 - 11.0 x10^3 / µL',
        color: 'amber',
        gaugePercent: '82%',
        remark: 'Slight elevations frequently indicate a normal physiological recovery from a minor underlying cold, scratch, or recent physical workout.'
      },
      {
        name: 'Platelet Count',
        value: '220 x10^3 / µL',
        status: 'Optimal',
        range: '150 - 450 x10^3 / µL',
        color: 'emerald',
        gaugePercent: '40%',
        remark: 'Healthy count. Supports correct thrombocyte self-healing thresholds without hyper-coagulant risk markers.'
      }
    ],
    generalInsights: 'Overall excellent biometric trends. Moderate cellular immune recovery noted via mildly elevated leukocytes, likely responding to seasonal cold patterns. General hydration is excellent.'
  },
  {
    id: 'lipid',
    name: 'Routine Lipid Metabolic Panel.pdf',
    size: '142 KB',
    updatedAt: 'April 2026',
    title: 'Lipid Cardiovascular Metabolism Panel Study',
    metrics: [
      {
        name: 'Total Cholesterol',
        value: '235 mg/dL',
        status: 'Elevated Risk',
        range: '< 200 mg/dL',
        color: 'amber',
        gaugePercent: '78%',
        remark: 'Elevated total boundary. Frequently relates to dietary lipid quantities or metabolic oxidation speed.'
      },
      {
        name: 'HDL (Good Cholesterol)',
        value: '38 mg/dL',
        status: 'Slightly Low',
        range: '> 40 mg/dL',
        color: 'amber',
        gaugePercent: '30%',
        remark: 'Optimal HDL acts as a circulatory cleanser. Low ratios can indicate a sedentary period or low unsaturated fat intake.'
      },
      {
        name: 'LDL (Bad Cholesterol)',
        value: '124 mg/dL',
        status: 'Optimal Boundary',
        range: '< 130 mg/dL',
        color: 'emerald',
        gaugePercent: '60%',
        remark: 'LDL maintains safe levels. Continue prioritizing soluble fibers like oats and flaxseeds to support liver filtration.'
      }
    ],
    generalInsights: 'Mild lipid profile imbalances. Improving cardiovascular HDL ratios is highly recommended through active aerobic exertion (e.g. 150 minutes weekly) and adding essential omega lipids to your diet.'
  }
];

export default function ReportModal({ isOpen, onClose }: ReportModalProps) {
  const [activeTemplate, setActiveTemplate] = useState<any>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanStep, setScanStep] = useState('');

  if (!isOpen) return null;

  const handleSelectTemplate = (template: any) => {
    setIsScanning(true);
    setScanStep('Initializing Zero-Knowledge Sandboxed Parser...');

    setTimeout(() => {
      setScanStep('Decrypting PDF Layout Tables & Metatags...');
      setTimeout(() => {
        setScanStep('Comparing extracted biometric ranges against CDC clinical references...');
        setTimeout(() => {
          setActiveTemplate(template);
          setIsScanning(false);
        }, 800);
      }, 800);
    }, 600);
  };

  const handleReset = () => {
    setActiveTemplate(null);
    setIsScanning(false);
    setScanStep('');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
      
      {/* Box container */}
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-xl overflow-hidden animate-zoom-in border border-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header absolute position */}
        <div className="flex justify-between items-center bg-blue-50/50 px-6 py-4.5 border-b border-blue-50 shrink-0">
          <div className="flex items-center space-x-2.5 text-blue-800">
            <Upload className="h-5 w-5 text-blue-600" />
            <h3 className="font-display font-bold text-lg text-slate-900">AI Report Translator Simulator</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Modal Core Content */}
        <div className="overflow-y-auto p-6 flex-1">
          
          {/* Default Upload & Choice selection */}
          {!isScanning && !activeTemplate && (
            <div className="space-y-6">
              
              {/* Alert standard text disclaimer */}
              <div className="bg-blue-50/30 border border-blue-100/60 p-4.5 rounded-2xl space-y-1">
                <h4 className="text-sm font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-blue-600" />
                  How does the simulator function?
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Our core system uses Optical Character Recognition (OCR) to convert dense PDF files. Since healthcare safety is paramount, select one of the safe presets below to evaluate the system in action.
                </p>
              </div>

              {/* Mock Upload Area */}
              <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 rounded-2xl p-8 transition-colors flex flex-col items-center justify-center text-center space-y-3.5 bg-slate-50/20">
                <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl shadow-sm text-center">
                  <Upload className="h-6 w-6 mx-auto" />
                </div>
                <div className="space-y-1">
                  <p className="text-sm font-bold text-slate-800">Select test PDF file or drop here</p>
                  <p className="text-xs text-slate-400">Accepted formats: PDF, PNG, JPG (Max 15MB size)</p>
                </div>
                {/* Visual file choice trigger */}
                <button
                  onClick={() => handleSelectTemplate(REPORT_TEMPLATES[0])}
                  className="px-4 py-1.5 bg-white border border-slate-250 hover:bg-slate-50 text-xs font-semibold text-slate-700 hover:text-blue-600 rounded-xl transition-all cursor-pointer shadow-sm"
                >
                  Browse Device Records
                </button>
              </div>

              {/* Preset templates choice selection */}
              <div className="space-y-3 pt-3">
                <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Ready-made Mock Lab Reports to Test:</span>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {REPORT_TEMPLATES.map((template) => (
                    <div
                      key={template.id}
                      onClick={() => handleSelectTemplate(template)}
                      className="group border border-slate-100 bg-white hover:border-blue-200.p-4 rounded-2xl p-4.5 cursor-pointer shadow-sm hover:shadow-md transition-all flex justify-between items-center"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                          <FileText className="h-5 w-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                            {template.name}
                          </h4>
                          <span className="text-[10px] text-slate-400">{template.size} • Last Updated {template.updatedAt}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all shrink-0 ml-2" />
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* Scanning Progress */}
          {isScanning && (
            <div className="py-16 flex flex-col items-center justify-center space-y-5 text-center">
              <Loader2 className="h-10 w-10 text-blue-600 animate-spin" />
              <div className="space-y-1">
                <h4 className="font-display font-bold text-base text-slate-900">Uploading & Scanning Health Report</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">{scanStep}</p>
              </div>
              <div className="w-[240px] h-1.5 bg-slate-150 rounded-full overflow-hidden">
                <div className="h-full bg-blue-600 animate-infinite-loading rounded-full"></div>
              </div>
            </div>
          )}

          {/* Render parsed elements */}
          {!isScanning && activeTemplate && (
            <div className="space-y-6">
              
              {/* Loaded report file header */}
              <div className="flex justify-between items-start pb-4 border-b border-slate-100">
                <div>
                  <h4 className="text-xs text-blue-600 font-bold uppercase tracking-wider">Active Analysis Result</h4>
                  <h3 className="text-lg font-bold text-slate-950 font-display">{activeTemplate.title}</h3>
                </div>
                <button
                  onClick={handleReset}
                  className="px-3.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Change Report File
                </button>
              </div>

              {/* General Insights card overview */}
              <div className="bg-sky-50/20 border border-sky-100 p-5 rounded-2xl space-y-1.5">
                <h4 className="text-xs font-bold text-blue-800 uppercase tracking-widest leading-none">AI Overall Bio-Physiological Summary:</h4>
                <p className="text-sm text-slate-700 leading-relaxed font-normal">{activeTemplate.generalInsights}</p>
              </div>

              {/* Individual parsed Metrics rendering */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Simplified Metrics Analysis:</h4>
                
                <div className="space-y-4">
                  {activeTemplate.metrics.map((metric: any, idx: number) => {
                    const isOptimal = metric.status === 'Optimal';

                    return (
                      <div
                        key={idx}
                        className="bg-white border border-slate-100 rounded-2xl p-5 space-y-3 shadow-sm"
                      >
                        {/* Title and Badge row */}
                        <div className="flex justify-between items-start">
                          <div className="space-y-0.5">
                            <h5 className="font-display font-bold text-sm text-slate-950">{metric.name}</h5>
                            <span className="text-[11px] text-slate-400">Reference Clinical Range: {metric.range}</span>
                          </div>
                          
                          <div className="text-right">
                            <span className="text-sm font-bold text-slate-900 block">{metric.value}</span>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              isOptimal 
                                ? 'bg-emerald-100 text-emerald-800' 
                                : 'bg-amber-100 text-amber-800'
                            }`}>
                              {metric.status}
                            </span>
                          </div>
                        </div>

                        {/* Gauge percent display */}
                        <div className="space-y-1">
                          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
                            {/* Color bar relative position */}
                            <div
                              style={{ width: metric.gaugePercent }}
                              className={`h-full rounded-full ${isOptimal ? 'bg-emerald-500' : 'bg-amber-500'}`}
                            />
                          </div>
                        </div>

                        {/* Remark clinical breakdown */}
                        <p className="text-slate-500 text-xs leading-relaxed font-normal bg-slate-50 p-2.5 rounded-xl border border-slate-100/50">
                          {metric.remark}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Close Button / Download simulation banner */}
              <div className="flex justify-between items-center pt-4 border-t border-slate-100">
                <div className="text-[11px] text-slate-400 flex items-center gap-1">
                  <CheckCircle className="h-4 w-4 text-emerald-600 shrink-0" /> Local Cryptography Enforced
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Test Lipid Profile
                  </button>
                  <button
                    onClick={onClose}
                    className="px-4.5 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
                  >
                    Close Simulation
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
