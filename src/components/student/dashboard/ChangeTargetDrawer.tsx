import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { 
  Building2, BookOpen, Train, Landmark, Building, GraduationCap, 
  Shield, FileHeart, MoreHorizontal, Search, CheckCircle2, ChevronRight,
  Target, ArrowRight, Lightbulb, Check
} from 'lucide-react';

interface ChangeTargetDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (details: any) => void;
}

type Step = 1 | 2 | 3 | 4 | 5;

const CATEGORIES = [
  { id: 'banking', name: 'Banking', icon: Building2, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'ssc', name: 'SSC', icon: Landmark, color: 'text-orange-500', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'railways', name: 'Railways', icon: Train, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-200' },
  { id: 'upsc', name: 'UPSC', icon: BookOpen, color: 'text-purple-500', bg: 'bg-purple-50', border: 'border-purple-200' },
  { id: 'state-psc', name: 'State PSC', icon: Building, color: 'text-teal-500', bg: 'bg-teal-50', border: 'border-teal-200' },
  { id: 'teaching', name: 'Teaching', icon: GraduationCap, color: 'text-blue-400', bg: 'bg-blue-50', border: 'border-blue-200' },
  { id: 'defence', name: 'Defence', icon: Shield, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'insurance', name: 'Insurance', icon: FileHeart, color: 'text-orange-400', bg: 'bg-orange-50', border: 'border-orange-200' },
  { id: 'more', name: 'More', icon: MoreHorizontal, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-200' },
];

const EXAMS: Record<string, any[]> = {
  banking: [
    { id: 'sbi-po', name: 'SBI PO', org: 'State Bank of India', popular: true },
    { id: 'sbi-clerk', name: 'SBI Clerk', org: 'State Bank of India' },
    { id: 'ibps-po', name: 'IBPS PO', org: 'Institute of Banking Personnel Selection', popular: true },
    { id: 'ibps-clerk', name: 'IBPS Clerk', org: 'Institute of Banking Personnel Selection' },
    { id: 'rbi-grade-b', name: 'RBI Grade B', org: 'Reserve Bank of India', popular: true },
    { id: 'rbi-assistant', name: 'RBI Assistant', org: 'Reserve Bank of India' },
    { id: 'ibps-rrb-po', name: 'IBPS RRB PO', org: 'Institute of Banking Personnel Selection' },
  ],
  ssc: [
    { id: 'ssc-cgl', name: 'SSC CGL', org: 'Staff Selection Commission', popular: true },
    { id: 'ssc-chsl', name: 'SSC CHSL', org: 'Staff Selection Commission' },
  ]
};

export const ChangeTargetDrawer: React.FC<ChangeTargetDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [step, setStep] = useState<Step>(1);
  const [category, setCategory] = useState<string | null>(null);
  const [exam, setExam] = useState<string | null>(null);
  const [targetType, setTargetType] = useState<'primary' | 'secondary'>('primary');
  const [priority, setPriority] = useState<'high' | 'medium' | 'backup'>('high');
  const [searchQuery, setSearchQuery] = useState('');

  const resetState = () => {
    setStep(1);
    setCategory(null);
    setExam(null);
    setTargetType('primary');
    setPriority('high');
    setSearchQuery('');
  };

  const handleClose = () => {
    setTimeout(resetState, 300);
    onClose();
  };

  const handleConfirm = () => {
    setStep(5);
  };

  const finishFlow = () => {
    if (onSuccess) {
      onSuccess({
        category,
        exam,
        targetType,
        priority
      });
    }
    handleClose();
  };

  const currentCategory = CATEGORIES.find(c => c.id === category);
  const exams = category && EXAMS[category] ? EXAMS[category] : EXAMS['banking'];
  const filteredExams = exams.filter(e => e.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const renderProgress = () => {
    if (step === 5) return null;
    return (
      <div className="flex items-center justify-between px-2 mb-6">
        {[
          { num: 1, label: 'Category' },
          { num: 2, label: 'Exam' },
          { num: 3, label: 'Target Type' },
          { num: 4, label: 'Priority' }
        ].map((s, i) => (
          <React.Fragment key={s.num}>
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-bold transition-colors ${
                step >= s.num 
                  ? 'bg-emerald-500 text-white' 
                  : 'bg-slate-100 text-slate-400'
              }`}>
                {step > s.num ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : s.num}
              </div>
              <span className={`text-[10px] sm:text-xs font-medium hidden sm:block ${
                step >= s.num ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {s.label}
              </span>
            </div>
            {i < 3 && (
              <div className={`flex-1 h-[2px] mx-1 sm:mx-2 ${
                step > s.num ? 'bg-emerald-500' : 'bg-slate-100'
              }`} />
            )}
          </React.Fragment>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Select Exam Category</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {CATEGORIES.map(c => {
            const isSelected = category === c.id;
            const Icon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                  isSelected 
                    ? `${c.bg} ${c.border} ring-1 ring-inset ring-${c.color.split('-')[1]}-500 shadow-sm` 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className={`p-2 rounded-lg ${isSelected ? 'bg-white shadow-sm' : 'bg-slate-100'} ${c.color}`}>
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <span className={`text-xs sm:text-sm font-semibold ${isSelected ? 'text-slate-900' : 'text-slate-700'}`}>
                  {c.name}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Popular in Banking</h3>
        <div className="space-y-2">
          {EXAMS['banking'].slice(0, 3).map(e => (
            <button
              key={e.id}
              onClick={() => {
                setCategory('banking');
                setExam(e.id);
                setStep(3);
              }}
              className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">{e.name}</div>
                  <div className="text-[10px] text-slate-500">{e.org}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </button>
          ))}
        </div>
      </div>
      
      <div className="pt-4 flex justify-end">
        <Button 
          className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!category}
          onClick={() => setStep(2)}
        >
          Continue to Exam <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Selected Category</h3>
        <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg bg-white shadow-sm ${currentCategory?.color}`}>
              {currentCategory && <currentCategory.icon className="w-4 h-4" />}
            </div>
            <span className="text-sm font-semibold text-slate-900">{currentCategory?.name}</span>
          </div>
          <Button variant="outline" size="sm" className="h-8 text-xs font-medium" onClick={() => setStep(1)}>
            Change
          </Button>
        </div>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        <h3 className="text-sm font-semibold text-slate-900 mb-3">Select Exam</h3>
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder={`Search exams in ${currentCategory?.name}...`}
            className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {filteredExams.map(e => {
            const isSelected = exam === e.id;
            return (
              <button
                key={e.id}
                onClick={() => setExam(e.id)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left ${
                  isSelected 
                    ? `border-blue-200 bg-blue-50/50 ring-1 ring-inset ring-blue-500` 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center ${
                    isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-500'
                  }`}>
                    {currentCategory && <currentCategory.icon className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-bold ${isSelected ? 'text-blue-900' : 'text-slate-900'}`}>{e.name}</span>
                      {e.popular && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">Popular</span>
                      )}
                    </div>
                    <div className="text-[10px] sm:text-xs text-slate-500 mt-0.5">{e.org}</div>
                  </div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-blue-600' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                </div>
              </button>
            );
          })}
        </div>

        <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-xs font-bold text-slate-900 mb-0.5">Can't find your exam?</h4>
            <p className="text-[10px] text-slate-500 mb-2">Request an exam and we'll add it for you.</p>
            <Button variant="outline" size="sm" className="h-7 text-[10px] px-3 font-semibold text-blue-600 border-blue-200 hover:bg-blue-50">
              Request Exam
            </Button>
          </div>
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <Button variant="outline" className="w-1/3" onClick={() => setStep(1)}>
          Back
        </Button>
        <Button 
          className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white"
          disabled={!exam}
          onClick={() => setStep(3)}
        >
          Continue to Target Type <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div>
        <h3 className="text-sm font-semibold text-slate-900 mb-4">Select Target Type</h3>
        <p className="text-xs text-slate-500 mb-4">How do you want to set this exam?</p>
        
        <div className="space-y-3">
          <button
            onClick={() => setTargetType('primary')}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              targetType === 'primary' 
                ? 'border-emerald-200 bg-emerald-50/50 ring-1 ring-inset ring-emerald-500' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                targetType === 'primary' ? 'border-emerald-600' : 'border-slate-300'
              }`}>
                {targetType === 'primary' && <div className="w-2 h-2 rounded-full bg-emerald-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Target className={`w-5 h-5 ${targetType === 'primary' ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span className={`text-sm font-bold ${targetType === 'primary' ? 'text-emerald-900' : 'text-slate-900'}`}>Primary Target</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded ml-auto">Recommended</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">This will be your main focus exam.</p>
                <div className={`p-2.5 rounded-lg text-xs font-medium ${
                  targetType === 'primary' ? 'bg-emerald-100/50 text-emerald-800' : 'bg-slate-100 text-slate-600'
                }`}>
                  You can add up to 2 secondary targets along with this.
                </div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setTargetType('secondary')}
            className={`w-full text-left p-4 rounded-xl border transition-all ${
              targetType === 'secondary' 
                ? 'border-purple-200 bg-purple-50/50 ring-1 ring-inset ring-purple-500' 
                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                targetType === 'secondary' ? 'border-purple-600' : 'border-slate-300'
              }`}>
                {targetType === 'secondary' && <div className="w-2 h-2 rounded-full bg-purple-600" />}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className={`w-5 h-5 flex items-center justify-center rounded bg-slate-100 ${
                    targetType === 'secondary' ? 'text-purple-600 bg-purple-100' : 'text-slate-400'
                  }`}>
                    <Target className="w-3.5 h-3.5" />
                  </div>
                  <span className={`text-sm font-bold ${targetType === 'secondary' ? 'text-purple-900' : 'text-slate-900'}`}>Secondary Target</span>
                </div>
                <p className="text-xs text-slate-500 mb-3">Add this as a secondary goal along with your primary target.</p>
                <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0">i</div>
                  <span className="text-[10px] text-slate-600 font-medium">You currently have 0 Secondary Targets. You can add two.</span>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      <div className="pt-4 flex gap-3">
        <Button variant="outline" className="w-1/3" onClick={() => setStep(2)}>
          Back
        </Button>
        <Button 
          className="w-2/3 bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => setStep(4)}
        >
          Continue to Priority <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );

  const renderStep4 = () => {
    const selectedExamInfo = category && exam ? EXAMS[category]?.find(e => e.id === exam) : null;
    
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4 flex flex-col h-full">
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Set Priority</h3>
          <p className="text-xs text-slate-500 mb-4">How important is this exam to you?</p>
          
          <div className="space-y-3 mb-8">
            {[
              { id: 'high', label: 'High Priority', desc: 'Your main focus. Get maximum personalization and tracking.', icon: '↑', color: 'emerald', rec: true },
              { id: 'medium', label: 'Medium Priority', desc: 'Important exam. We\'ll help you prepare consistently.', icon: '−', color: 'amber' },
              { id: 'backup', label: 'Backup Priority', desc: 'Keep as a backup plan while you focus on your primary goals.', icon: '↓', color: 'rose' }
            ].map(p => (
              <button
                key={p.id}
                onClick={() => setPriority(p.id as any)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  priority === p.id 
                    ? `border-${p.color}-200 bg-${p.color}-50/50 ring-1 ring-inset ring-${p.color}-500` 
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 ${
                    priority === p.id ? `border-${p.color}-600` : 'border-slate-300'
                  }`}>
                    {priority === p.id && <div className={`w-2 h-2 rounded-full bg-${p.color}-600`} />}
                  </div>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-lg ${
                    priority === p.id ? `bg-${p.color}-100 text-${p.color}-600` : 'bg-slate-100 text-slate-400'
                  }`}>
                    {p.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`text-sm font-bold ${priority === p.id ? `text-${p.color}-900` : 'text-slate-900'}`}>{p.label}</span>
                      {p.rec && (
                        <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">Recommended</span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mb-2">{p.desc}</p>
                    {priority === p.id && targetType === 'primary' && p.id === 'high' && (
                      <div className="text-[10px] font-medium text-emerald-700 bg-emerald-100/50 px-2 py-1 rounded inline-block">
                        This will be your Primary Target.
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-slate-50 rounded-xl border border-slate-200 p-4">
            <h4 className="text-xs font-bold text-slate-900 mb-3">Your Selection</h4>
            <div className="flex items-center gap-4 bg-white p-3 rounded-lg border border-slate-100 shadow-sm">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${currentCategory?.bg} ${currentCategory?.color}`}>
                {currentCategory && <currentCategory.icon className="w-5 h-5" />}
              </div>
              <div className="flex-1">
                <div className="text-sm font-bold text-slate-900">{selectedExamInfo?.name || 'SBI PO'}</div>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <Target className="w-3 h-3 text-emerald-500" /> 
                    {targetType === 'primary' ? 'Primary Target' : 'Secondary Target'}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-medium text-slate-600">
                    <span className={`w-3 h-3 rounded-full flex items-center justify-center text-[8px] text-white font-bold ${
                      priority === 'high' ? 'bg-emerald-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
                    }`}>
                      {priority === 'high' ? '↑' : priority === 'medium' ? '−' : '↓'}
                    </span>
                    {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Backup'} Priority
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button variant="outline" className="w-1/3" onClick={() => setStep(3)}>
            Back
          </Button>
          <Button 
            className="w-2/3 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={handleConfirm}
          >
            Confirm Target <Check className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    );
  };

  const renderStep5 = () => {
    const selectedExamInfo = category && exam ? EXAMS[category]?.find(e => e.id === exam) : null;
    
    return (
      <div className="h-full flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-300">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 relative">
          <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-20" />
          <CheckCircle2 className="w-12 h-12 text-emerald-600 relative z-10" />
        </div>
        
        <h2 className="text-2xl font-black text-slate-900 mb-2">Target Updated Successfully! 🎉</h2>
        <p className="text-sm text-slate-500 mb-8 max-w-xs">
          Your target examination has been updated with the following details.
        </p>

        <div className="w-full max-w-sm bg-slate-50 rounded-2xl border border-slate-200 p-4 mb-8 space-y-4">
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> Exam
            </span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${currentCategory?.bg} ${currentCategory?.color}`}>
                {currentCategory && <currentCategory.icon className="w-3 h-3" />}
              </div>
              {selectedExamInfo?.name || 'SBI PO'}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <Target className="w-4 h-4" /> Target Type
            </span>
            <span className="text-sm font-bold text-slate-900 flex items-center gap-1.5 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" /> {targetType === 'primary' ? 'Primary Target' : 'Secondary Target'}
            </span>
          </div>
          <div className="flex justify-between items-center pb-4 border-b border-slate-200">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] text-white font-bold ${
                priority === 'high' ? 'bg-emerald-500' : priority === 'medium' ? 'bg-amber-500' : 'bg-rose-500'
              }`}>
                {priority === 'high' ? '↑' : priority === 'medium' ? '−' : '↓'}
              </div> 
              Priority
            </span>
            <span className={`text-sm font-bold flex items-center gap-1.5 ${
              priority === 'high' ? 'text-emerald-600' : priority === 'medium' ? 'text-amber-600' : 'text-rose-600'
            }`}>
              {priority === 'high' ? 'High' : priority === 'medium' ? 'Medium' : 'Backup'} Priority
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs font-medium text-slate-500 flex items-center gap-2">
              <Landmark className="w-4 h-4" /> Exam Date
            </span>
            <span className="text-sm font-bold text-slate-900">
              5 Oct 2026
            </span>
          </div>
        </div>

        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-100 rounded-xl mb-8 w-full max-w-sm text-left">
          <Lightbulb className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-emerald-800 font-medium">
            You can update or change your targets anytime from the target settings.
          </p>
        </div>

        <div className="w-full max-w-sm space-y-3">
          <Button variant="outline" className="w-full" onClick={handleClose}>
            Go to Dashboard
          </Button>
          <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={finishFlow}>
            View Target
          </Button>
        </div>
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent className="w-full sm:max-w-md p-0 flex flex-col bg-white border-l-0 sm:border-l sm:rounded-l-2xl shadow-2xl">
        {step !== 5 && (
          <div className="p-6 pb-4 shrink-0">
            <SheetHeader className="mb-2">
              <SheetTitle className="text-xl font-bold text-slate-900 text-left flex items-center justify-between">
                Change Target
              </SheetTitle>
              <p className="text-sm text-slate-500 text-left">Let's update your target examination.</p>
            </SheetHeader>
          </div>
        )}
        
        <div className="flex-1 overflow-y-auto px-6 pb-6 pt-2 custom-scrollbar">
          {renderProgress()}
          
          <div className="h-full">
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
            {step === 5 && renderStep5()}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
