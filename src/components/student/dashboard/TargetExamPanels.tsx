import React, { useState, useRef } from 'react';
import { X, Search, ChevronLeft, CheckCircle, AlertTriangle, GripVertical, ArrowUpDown } from 'lucide-react';
import { useTargetExams, getPriorityLabel, TargetExam } from '@/hooks/useTargetExams';
import { useExamCatalog, type CatalogCategory } from '@/hooks/useExamCatalog';

// ── Normalized flat exam shape used internally ────────────────────────────────
interface PickerExam {
  id: string;
  name: string;
  subtitle: string;  // category name
  logo: string;
  categoryId: string;
  categoryName: string;
}

// ── SHARED: CATEGORY + EXAM PICKER (dynamic from global catalog) ──────────────
const ExamPicker: React.FC<{
  onClose: () => void;
  onSelect: (exam: PickerExam) => void;
  title: string;
  subtitle?: string;
  excludeNames?: string[];
}> = ({ onClose, onSelect, title, subtitle, excludeNames = [] }) => {
  const { catalog, loading } = useExamCatalog();
  const [step, setStep] = useState<'cat' | 'exam'>('cat');
  const [catId, setCatId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [picked, setPicked] = useState<string | null>(null);

  // Only show visible categories that have at least one exam
  const visibleCats = catalog.filter(c =>
    c.isVisible && c.sections.some(s => s.exams.length > 0)
  );

  // Flatten all exams for the selected category (deduplicated by name)
  const allExamsForCat: PickerExam[] = (() => {
    const cat = catalog.find(c => c.id === catId);
    if (!cat) return [];
    const seen = new Set<string>();
    const result: PickerExam[] = [];
    cat.sections.forEach(sec => {
      sec.exams.forEach(ex => {
        if (!seen.has(ex.name)) {
          seen.add(ex.name);
          result.push({
            id: ex.id,
            name: ex.name,
            subtitle: cat.name,
            logo: ex.logo || '📝',
            categoryId: cat.id,
            categoryName: cat.name,
          });
        }
      });
    });
    return result;
  })();

  // For search: flatten across ALL visible categories
  const allExamsFlat: PickerExam[] = (() => {
    const seen = new Set<string>();
    const result: PickerExam[] = [];
    visibleCats.forEach(cat => {
      cat.sections.forEach(sec => {
        sec.exams.forEach(ex => {
          if (!seen.has(ex.name)) {
            seen.add(ex.name);
            result.push({
              id: ex.id,
              name: ex.name,
              subtitle: cat.name,
              logo: ex.logo || '📝',
              categoryId: cat.id,
              categoryName: cat.name,
            });
          }
        });
      });
    });
    return result;
  })();

  const filtered: PickerExam[] = search
    ? allExamsFlat.filter(e =>
        !excludeNames.includes(e.name) &&
        (e.name.toLowerCase().includes(search.toLowerCase()) ||
         e.categoryName.toLowerCase().includes(search.toLowerCase()))
      )
    : allExamsForCat.filter(e => !excludeNames.includes(e.name));

  const pickedExam = allExamsFlat.find(e => e.name === picked);

  // Helper: render a logo — it may be a URL string or an emoji
  const renderLogo = (logo: string) => {
    if (logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/')) {
      return <img src={logo} alt="" className="w-7 h-7 object-contain rounded" />;
    }
    return <span className="text-xl">{logo}</span>;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center gap-3 shrink-0">
        {step === 'exam' && (
          <button onClick={() => { setStep('cat'); setPicked(null); setSearch(''); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}
        <div className="flex-1">
          <h3 className="font-bold text-slate-800 text-sm">{title}</h3>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Step pills */}
      <div className="px-5 pt-3 pb-1 flex items-center gap-2 shrink-0">
        {['Category', 'Exam'].map((s, i) => (
          <React.Fragment key={s}>
            <div className={`text-[11px] font-bold flex items-center gap-1.5 ${
              (step === 'cat' && i === 0) || (step === 'exam' && i === 1) ? 'text-emerald-600' :
              i === 0 && step === 'exam' ? 'text-slate-400' : 'text-slate-300'
            }`}>
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${
                (step === 'cat' && i === 0) || (step === 'exam' && i === 1) ? 'bg-emerald-500 text-white' :
                i === 0 && step === 'exam' ? 'bg-slate-200 text-slate-500' : 'bg-slate-100 text-slate-300'
              }`}>{i + 1}</div>
              {s}
            </div>
            {i === 0 && <div className="flex-1 h-px bg-slate-200" />}
          </React.Fragment>
        ))}
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex-1 flex items-center justify-center">
          <p className="text-slate-400 text-sm">Loading exams...</p>
        </div>
      )}

      {/* Step 1 — Category Grid */}
      {!loading && step === 'cat' && (
        <div className="flex-1 overflow-y-auto p-4">
          {visibleCats.length === 0 ? (
            <div className="text-center py-10 text-slate-400 text-sm">No exam categories available yet.</div>
          ) : (
            <div className="space-y-1.5">
              {visibleCats.map(cat => {
                const examCount = cat.sections.reduce((n, s) => n + s.exams.length, 0);
                const logo = cat.logo;
                return (
                  <button key={cat.id}
                    onClick={() => { setCatId(cat.id); setStep('exam'); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50 bg-white transition-all text-left">
                    <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 overflow-hidden">
                      {logo.startsWith('http') || logo.startsWith('data:') || logo.startsWith('/')
                        ? <img src={logo} alt="" className="w-7 h-7 object-contain" />
                        : <span className="text-xl">{logo}</span>
                      }
                    </div>
                    <span className="font-semibold text-slate-800 text-sm flex-1">{cat.name}</span>
                    <span className="text-[10px] text-slate-400">{examCount} exams →</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Step 2 — Exam List */}
      {!loading && step === 'exam' && (
        <>
          <div className="px-4 pt-2 pb-2 shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search exams..."
                className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-emerald-400" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
            {filtered.map(ex => (
              <button key={ex.id} onClick={() => setPicked(ex.name)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left ${
                  picked === ex.name ? 'bg-emerald-50 border border-emerald-200' : 'hover:bg-slate-50 border border-transparent'
                }`}>
                <div className="w-8 h-8 flex items-center justify-center shrink-0">
                  {renderLogo(ex.logo)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm truncate">{ex.name}</div>
                  <div className="text-[11px] text-slate-400 truncate">{ex.subtitle}</div>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                  picked === ex.name ? 'bg-emerald-500 border-emerald-500' : 'border-slate-300'
                }`} />
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-center text-slate-400 text-sm py-8">No exams found</p>
            )}
          </div>
          <div className="px-4 py-4 border-t border-slate-100 shrink-0">
            <button
              onClick={() => { if (pickedExam) onSelect(pickedExam); }}
              disabled={!picked || !pickedExam}
              className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl disabled:opacity-40 transition-colors">
              Continue
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ── 1. ADD TARGET EXAM PANEL ──────────────────────────────────────────────────
export const AddTargetPanel: React.FC<{ onClose: () => void; onDone: () => void }> = ({ onClose, onDone }) => {
  const { addTargetExam, targetExams } = useTargetExams();
  const [confirming, setConfirming] = useState<PickerExam | null>(null);

  if (confirming) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-800 text-sm">Confirm Add Target</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center">
            <span className="text-3xl">{confirming.logo}</span>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Add as Target #{targetExams.length + 1}</p>
            <h2 className="font-black text-2xl text-slate-800 mt-1">{confirming.name}</h2>
            <p className="text-xs text-slate-400 mt-1">{confirming.subtitle}</p>
            <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-full">
              <span className="text-[11px] font-bold text-emerald-700">
                Will be added as — {getPriorityLabel(targetExams.length)}
              </span>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={() => setConfirming(null)} className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => {
              addTargetExam({ id: confirming.id, name: confirming.name, category: confirming.categoryId });
              onDone();
            }}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
            Confirm Add
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExamPicker
      onClose={onClose}
      onSelect={ex => setConfirming(ex)}
      title="Add Target Exam"
      subtitle="Step 1 of 2 — Select category & exam"
      excludeNames={targetExams.map(e => e.name)}
    />
  );
};

// ── 2. CHANGE TARGET EXAM PANEL ───────────────────────────────────────────────
export const ChangeTargetPanel: React.FC<{ onClose: () => void; examIdx: number; examName: string; onDone: () => void }> = ({ onClose, examIdx, examName, onDone }) => {
  const { replaceTargetExam, targetExams } = useTargetExams();
  const [confirming, setConfirming] = useState<PickerExam | null>(null);

  if (confirming) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-800 text-sm">Confirm Change</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
          <div className="w-full bg-slate-50 rounded-2xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-left">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Replacing</p>
                <p className="font-black text-lg text-red-500">{examName}</p>
              </div>
              <div className="text-2xl">→</div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">With</p>
                <p className="font-black text-lg text-emerald-600">{confirming.name}</p>
              </div>
            </div>
            <div className="border-t border-slate-200 pt-3">
              <p className="text-xs text-slate-500">Priority position <strong>#{examIdx + 1}</strong> remains the same</p>
            </div>
          </div>
        </div>
        <div className="px-4 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={() => setConfirming(null)} className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          <button
            onClick={() => {
              replaceTargetExam(examIdx, { id: confirming.id, name: confirming.name, category: confirming.categoryId });
              onDone();
            }}
            className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
            Change Exam
          </button>
        </div>
      </div>
    );
  }

  return (
    <ExamPicker
      onClose={onClose}
      onSelect={ex => setConfirming(ex)}
      title="Change Target Exam"
      subtitle={`Replacing: ${examName}`}
      excludeNames={targetExams.filter((_, i) => i !== examIdx).map(e => e.name)}
    />
  );
};

// ── 3. CHANGE PRIORITY PANEL ───────────────────────────────────────────────────
export const ChangePriorityPanel: React.FC<{ onClose: () => void; onDone: () => void }> = ({ onClose, onDone }) => {
  const { targetExams, setTargetExams } = useTargetExams();
  const [order, setOrder] = useState([...targetExams]);
  const [confirming, setConfirming] = useState(false);
  const dragIdx = useRef<number | null>(null);

  const handleDragStart = (i: number) => { dragIdx.current = i; };
  const handleDrop = (i: number) => {
    if (dragIdx.current === null || dragIdx.current === i) return;
    const next = [...order];
    const [moved] = next.splice(dragIdx.current, 1);
    next.splice(i, 0, moved);
    setOrder(next);
    dragIdx.current = null;
  };

  const colors = [
    { bg: '#10b981', label: 'Main Focus',      num: '#ecfdf5', numText: '#065f46' },
    { bg: '#3b82f6', label: 'Secondary Focus',  num: '#eff6ff', numText: '#1e3a8a' },
    { bg: '#f59e0b', label: 'Backup Goal',      num: '#fffbeb', numText: '#78350f' },
  ];

  if (confirming) {
    return (
      <div className="flex flex-col h-full">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
          <h3 className="font-bold text-slate-800 text-sm">Save Priority Order?</h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-4 h-4" /></button>
        </div>
        <div className="flex-1 flex flex-col justify-center px-5 gap-4">
          <p className="text-sm text-slate-600 text-center">Confirm the new priority order for your target exams:</p>
          <div className="space-y-2">
            {order.map((ex, i) => {
              const c = colors[i] || colors[2];
              return (
                <div key={ex.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm text-white" style={{ background: c.bg }}>{i + 1}</div>
                  <div className="flex-1">
                    <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                    <p className="text-[10px] font-semibold" style={{ color: c.bg }}>{c.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        <div className="px-4 py-4 border-t border-slate-100 flex gap-3 shrink-0">
          <button onClick={() => setConfirming(false)} className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={() => { setTargetExams(order); onDone(); }} className="flex-1 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
            Save Priority
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Change Priority</h3>
          <p className="text-[11px] text-slate-400 mt-0.5">Drag to reorder your target exams</p>
        </div>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <div className="flex items-center gap-2 mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
          <ArrowUpDown className="w-4 h-4 text-blue-500 shrink-0" />
          <p className="text-xs text-blue-700 font-medium">Drag the <GripVertical className="w-3 h-3 inline" /> handle to reorder exams</p>
        </div>

        <div className="space-y-2">
          {order.map((ex, i) => {
            const c = colors[i] || colors[2];
            return (
              <div
                key={ex.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={e => e.preventDefault()}
                onDrop={() => handleDrop(i)}
                className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-slate-100 bg-white hover:border-slate-200 transition-all cursor-grab active:cursor-grabbing select-none"
              >
                <GripVertical className="w-4 h-4 text-slate-300 shrink-0" />
                <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0" style={{ background: c.bg }}>{i + 1}</div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800 text-sm">{ex.name}</p>
                  <p className="text-[10px] font-semibold" style={{ color: c.bg }}>{c.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-slate-100 shrink-0">
        <button onClick={() => setConfirming(true)} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">
          Save Priority
        </button>
      </div>
    </div>
  );
};

// ── 4. REMOVE EXAM PANEL ──────────────────────────────────────────────────────
export const RemoveTargetPanel: React.FC<{ onClose: () => void; examIdx: number; examName: string; onDone: () => void }> = ({ onClose, examIdx, examName, onDone }) => {
  const { removeTargetExam, targetExams } = useTargetExams();
  const canRemove = targetExams.length > 1;

  return (
    <div className="flex flex-col h-full">
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between shrink-0">
        <h3 className="font-bold text-red-600 text-sm">Remove Exam</h3>
        <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-4 h-4" /></button>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${canRemove ? 'bg-red-50' : 'bg-slate-50'}`}>
          {canRemove ? <span className="text-3xl">🗑️</span> : <AlertTriangle className="w-8 h-8 text-amber-400" />}
        </div>
        <div>
          {canRemove ? (
            <>
              <p className="text-slate-500 text-sm">Are you sure you want to remove</p>
              <h2 className="font-black text-2xl text-red-500 mt-1">{examName}</h2>
              <p className="text-xs text-slate-400 mt-2">This exam will be removed from your targets.<br />Remaining exams will auto-reorder.</p>
            </>
          ) : (
            <>
              <h2 className="font-bold text-lg text-slate-700 mt-1">Cannot Remove</h2>
              <p className="text-sm text-slate-500 mt-2">At least 1 target exam must remain active.</p>
              <div className="mt-4 px-4 py-3 bg-amber-50 border border-amber-100 rounded-xl">
                <p className="text-xs font-semibold text-amber-700">You currently have only 1 target exam. Add another before removing this one.</p>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="px-4 py-4 border-t border-slate-100 flex gap-3 shrink-0">
        <button onClick={onClose} className="flex-1 py-3 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-50 transition-colors">Cancel</button>
        <button
          onClick={() => { removeTargetExam(targetExams[examIdx]?.id); onDone(); }}
          disabled={!canRemove}
          className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          Remove Exam
        </button>
      </div>
    </div>
  );
};

// ── SUCCESS PANEL ─────────────────────────────────────────────────────────────
export const SuccessPanel: React.FC<{ onClose: () => void; message: string }> = ({ onClose, message }) => (
  <div className="flex flex-col h-full">
    <div className="px-5 py-4 flex justify-end shrink-0">
      <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50"><X className="w-4 h-4" /></button>
    </div>
    <div className="flex-1 flex flex-col items-center justify-center px-6 gap-5 text-center">
      <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center">
        <CheckCircle className="w-10 h-10 text-emerald-500" />
      </div>
      <div>
        <h3 className="font-black text-xl text-slate-800">Done! 🎉</h3>
        <p className="text-sm text-slate-500 mt-2">{message}</p>
      </div>
    </div>
    <div className="px-4 py-4 shrink-0">
      <button onClick={onClose} className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors">Back to Dashboard</button>
    </div>
  </div>
);
