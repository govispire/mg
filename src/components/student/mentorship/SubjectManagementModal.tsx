import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { X, Check, Lock, ShieldCheck, Sparkles, Plus, Zap, CreditCard } from 'lucide-react';

export interface SubjectOption {
  id: string;
  name: string;
  pricePerMonth: number;
  isEnrolled: boolean;
  topicCount: number;
  icon: string;
}

const ALL_SUBJECTS: SubjectOption[] = [
  { id: 'quant', name: 'Quantitative Aptitude', pricePerMonth: 299, isEnrolled: true, topicCount: 14, icon: '∑' },
  { id: 'reasoning', name: 'Reasoning Ability', pricePerMonth: 299, isEnrolled: true, topicCount: 12, icon: '⬡' },
  { id: 'english', name: 'English Language', pricePerMonth: 199, isEnrolled: false, topicCount: 10, icon: 'Aa' },
  { id: 'ga', name: 'General & Banking Awareness', pricePerMonth: 199, isEnrolled: false, topicCount: 8, icon: '₹' },
  { id: 'computer', name: 'Computer Awareness', pricePerMonth: 149, isEnrolled: false, topicCount: 6, icon: '💻' },
];

interface SubjectManagementModalProps {
  isOpen: boolean;
  examName?: string;
  onClose: () => void;
  onUpgradeSuccess: (newEnrolledIds: string[]) => void;
}

export const SubjectManagementModal: React.FC<SubjectManagementModalProps> = ({
  isOpen,
  examName = 'NABARD Grade A (Mains)',
  onClose,
  onUpgradeSuccess
}) => {
  const [selectedNewIds, setSelectedNewIds] = useState<string[]>([]);

  if (!isOpen) return null;

  const toggleSubject = (id: string) => {
    if (selectedNewIds.includes(id)) {
      setSelectedNewIds(prev => prev.filter(i => i !== id));
    } else {
      setSelectedNewIds(prev => [...prev, id]);
    }
  };

  const selectAllRemaining = () => {
    const remaining = ALL_SUBJECTS.filter(s => !s.isEnrolled).map(s => s.id);
    setSelectedNewIds(remaining);
  };

  const newSubjectsTotal = ALL_SUBJECTS
    .filter(s => selectedNewIds.includes(s.id))
    .reduce((sum, s) => sum + s.pricePerMonth, 0);

  // Prorated 18 days remaining calculation
  const proratedTotal = Math.round(newSubjectsTotal * (18 / 30));
  const hasDiscount = selectedNewIds.length >= 2;
  const finalPrice = hasDiscount ? Math.round(proratedTotal * 0.8) : proratedTotal;

  const handleCheckout = () => {
    if (selectedNewIds.length === 0) {
      alert('Please select at least one subject to upgrade.');
      return;
    }
    alert(`Success! Upgraded mentorship plan with ${selectedNewIds.length} new subjects for ₹${finalPrice}.`);
    onUpgradeSuccess(selectedNewIds);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
              FLEXIBLE SUBJECT MENTORSHIP
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
              Customize Your Mentorship Coverage
            </h2>
            <p className="text-xs text-slate-500 font-medium">
              Target Exam: <span className="font-bold text-slate-800">{examName}</span>
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Subject Selection Grid */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400">
              Select Subjects to Add
            </span>

            <button
              onClick={selectAllRemaining}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-1"
            >
              <Zap className="w-3.5 h-3.5 fill-blue-600" />
              <span>Select All & Save 20%</span>
            </button>
          </div>

          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            {ALL_SUBJECTS.map(subject => {
              const isAlreadyEnrolled = subject.isEnrolled;
              const isSelected = selectedNewIds.includes(subject.id);

              return (
                <div
                  key={subject.id}
                  onClick={() => !isAlreadyEnrolled && toggleSubject(subject.id)}
                  className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                    isAlreadyEnrolled
                      ? 'bg-emerald-50/60 border-emerald-200 text-slate-700 cursor-default'
                      : isSelected
                      ? 'bg-blue-50/90 border-blue-600 ring-2 ring-blue-500/20 cursor-pointer'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isAlreadyEnrolled
                        ? 'bg-emerald-600 text-white'
                        : isSelected
                        ? 'bg-blue-600 text-white'
                        : 'bg-slate-100 text-slate-600'
                    }`}>
                      {isAlreadyEnrolled ? <Check className="w-5 h-5" /> : subject.icon}
                    </div>

                    <div>
                      <h4 className="font-extrabold text-slate-900 text-sm flex items-center gap-2">
                        {subject.name}
                        {isAlreadyEnrolled && (
                          <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300 px-2 py-0.5 rounded-full">
                            Active Enrolled
                          </span>
                        )}
                      </h4>
                      <p className="text-xs text-slate-500 font-medium">
                        {subject.topicCount} Topics · Custom Tasks & Mentor Guidance
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    {isAlreadyEnrolled ? (
                      <span className="text-xs font-bold text-emerald-700">Included in Plan</span>
                    ) : (
                      <div>
                        <span className="text-sm font-black text-slate-900">+ ₹{subject.pricePerMonth}/mo</span>
                        <span className="text-[10px] text-slate-400 block font-medium">Prorated available</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Price Breakdown Footer */}
        {selectedNewIds.length > 0 && (
          <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-600">
              <span>{selectedNewIds.length} New Subjects Added (18 days remaining)</span>
              <span>₹{proratedTotal}</span>
            </div>

            {hasDiscount && (
              <div className="flex items-center justify-between text-xs font-bold text-emerald-600">
                <span>Multi-Subject Bundle Discount (20% OFF)</span>
                <span>- ₹{proratedTotal - finalPrice}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-slate-900 font-black text-sm">
              <span>Total Payable Now</span>
              <span className="text-base text-blue-600">₹{finalPrice}</span>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center gap-3 pt-2">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-slate-200 text-slate-700 font-bold text-xs rounded-xl"
          >
            Cancel
          </Button>

          <Button
            onClick={handleCheckout}
            disabled={selectedNewIds.length === 0}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl shadow-md gap-2"
          >
            <CreditCard className="w-4 h-4" />
            <span>
              {selectedNewIds.length > 0
                ? `Upgrade Mentorship Now (₹${finalPrice})`
                : 'Select Subjects Above'}
            </span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SubjectManagementModal;
