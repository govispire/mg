import React, { useState, useEffect } from 'react';
import { Calendar, Trash2, ArrowUp, Minus, ArrowDown, X } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';

// ── UPDATE EXAM DATE MODAL ──────────────────────────────────────────────────
export const UpdateExamDateModal = ({ isOpen, onClose, currentExam, currentDate }: { isOpen: boolean, onClose: () => void, currentExam: string, currentDate: string }) => {
  const [selectedDate, setSelectedDate] = useState(currentDate);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">Update Exam Date</DialogTitle>
          <p className="text-sm text-slate-500">Select new exam date</p>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
            <input 
              type="text" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              placeholder="e.g. 5 Oct 2026"
            />
          </div>
          
          <div className="bg-violet-50 text-violet-700 px-4 py-3 rounded-xl flex items-center gap-3">
            <Calendar className="w-5 h-5 text-violet-500" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-500">Current Date</p>
              <p className="font-bold">{currentDate}</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <button 
            onClick={onClose}
            className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Update Date
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── CHANGE PRIORITY MODAL ───────────────────────────────────────────────────
export const ChangePriorityModal = ({ 
  isOpen, 
  onClose, 
  currentExam,
  currentType,
  onSave
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  currentExam: string,
  currentType: string,
  onSave: (newType: string) => void
}) => {
  const [priority, setPriority] = useState(currentType || 'Primary Target');

  // Update local state if currentType changes when modal opens
  useEffect(() => {
    if (isOpen) setPriority(currentType || 'Primary Target');
  }, [isOpen, currentType]);

  const priorities = [
    { id: 'Primary Target', label: 'Primary Target', desc: 'Main focus, shows on top', icon: ArrowUp, iconColor: 'text-emerald-500', iconBg: 'bg-emerald-50' },
    { id: 'Secondary Target', label: 'Secondary Target', desc: 'Backup exam preparation', icon: Minus, iconColor: 'text-blue-500', iconBg: 'bg-blue-50' },
    { id: 'Backup Target', label: 'Backup Target', desc: 'Lower priority exam', icon: ArrowDown, iconColor: 'text-amber-500', iconBg: 'bg-amber-50' },
  ];

  const handleSave = () => {
    onSave(priority);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">Change Priority</DialogTitle>
          <p className="text-sm text-slate-500">Select priority level for {currentExam}</p>
        </DialogHeader>
        
        <div className="space-y-3">
          {priorities.map((p) => {
            const isSelected = priority === p.id;
            const Icon = p.icon;
            return (
              <div 
                key={p.id}
                onClick={() => setPriority(p.id)}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-emerald-500 bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${p.iconBg}`}>
                  <Icon className={`w-5 h-5 ${p.iconColor}`} />
                </div>
                <div className="flex-1">
                  <h4 className={`font-bold ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>{p.label}</h4>
                  <p className="text-xs text-slate-500 font-medium">{p.desc}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-emerald-500' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6">
          <button 
            onClick={handleSave}
            className="w-full bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Save Priority
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── REMOVE TARGET MODAL ─────────────────────────────────────────────────────
export const RemoveTargetModal = ({ isOpen, onClose, currentExam }: { isOpen: boolean, onClose: () => void, currentExam: string }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl text-center">
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center border-4 border-red-100">
            <Trash2 className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-slate-900 mx-auto">Remove Target</DialogTitle>
        </DialogHeader>
        
        <div className="mb-8">
          <p className="text-slate-600 mb-1">Are you sure you want to remove</p>
          <p className="text-2xl font-black text-red-600 mb-2">{currentExam}</p>
          <p className="text-xs font-semibold text-slate-400">This action cannot be undone.</p>
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={onClose}
            className="flex-1 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button 
            onClick={onClose}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm shadow-red-200"
          >
            Remove Target
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── VIEW ALL TARGETS MODAL ──────────────────────────────────────────────────
export const ViewAllTargetsModal = ({ 
  isOpen, 
  onClose, 
  targets, 
  activeIndex, 
  setActiveIndex 
}: { 
  isOpen: boolean, 
  onClose: () => void, 
  targets: { exam: string, category: string, type: string }[], 
  activeIndex: number, 
  setActiveIndex: (idx: number) => void 
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl">
        <DialogHeader className="mb-4">
          <DialogTitle className="text-xl font-bold text-slate-900">Your Target Exams</DialogTitle>
          <p className="text-sm text-slate-500">Select an exam to focus on</p>
        </DialogHeader>
        
        <div className="space-y-3">
          {targets.map((target, idx) => {
            const isSelected = activeIndex === idx;
            return (
              <div 
                key={idx}
                onClick={() => { setActiveIndex(idx); onClose(); }}
                className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                  isSelected ? 'border-[#16a34a] bg-emerald-50/30' : 'border-slate-100 hover:border-slate-200 bg-white'
                }`}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${isSelected ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                  <span className="font-black text-lg">{idx + 1}</span>
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-black leading-tight ${isSelected ? 'text-emerald-900' : 'text-slate-900'}`}>{target.exam}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{target.category}</span>
                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                      target.type.toLowerCase().includes('primary') ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {target.type}
                    </span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  isSelected ? 'border-[#16a34a]' : 'border-slate-300'
                }`}>
                  {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-[#16a34a]" />}
                </div>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// ── KEEP AS SECONDARY MODAL ─────────────────────────────────────────────────
export const KeepAsSecondaryModal = ({
  isOpen,
  onClose,
  oldExam,
  onKeep,
  onRemove
}: {
  isOpen: boolean;
  onClose: () => void;
  oldExam: string;
  onKeep: () => void;
  onRemove: () => void;
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md p-6 rounded-3xl text-center">
        <DialogHeader className="mb-2">
          <DialogTitle className="text-xl font-bold text-slate-900 mx-auto">Keep Previous Target?</DialogTitle>
        </DialogHeader>
        
        <div className="mb-6">
          <p className="text-slate-600 mb-1">Do you want to keep</p>
          <p className="text-2xl font-black text-slate-900 mb-2">{oldExam}</p>
          <p className="text-sm font-semibold text-slate-500">as a secondary target?</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <button 
            onClick={() => { onRemove(); onClose(); }}
            className="flex-1 border border-slate-200 text-red-600 hover:bg-red-50 hover:border-red-200 font-bold py-3.5 rounded-xl transition-colors"
          >
            Remove Completely
          </button>
          <button 
            onClick={() => { onKeep(); onClose(); }}
            className="flex-1 bg-[#16a34a] hover:bg-[#15803d] text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm"
          >
            Move to Secondary
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
