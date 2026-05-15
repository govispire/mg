import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, BookOpen, Brain, Calendar, ChevronLeft, ChevronRight,
  ExternalLink, HelpCircle, Users, Trophy, FileText, Zap,
  MoreVertical, ArrowUp, ArrowDown, Plus, Trash2
} from 'lucide-react';
import { getTargetExamRoute } from '@/utils/targetExamRoute';
import { differenceInDays } from 'date-fns';
import { getActiveAds, recordClick, recordImpression, getSlideDuration, AdBanner } from '@/data/adsStore';
import { WeaknessDetectionModal } from '@/components/student/exam/WeaknessDetectionModal';
import { HowToStartModal } from '@/components/student/exam/HowToStartModal';
import { useTargetExams, getPriorityLabel, getPriorityColor } from '@/hooks/useTargetExams';
import { useExamCatalog } from '@/hooks/useExamCatalog';
import { AddTargetPanel, ChangeTargetPanel, ChangePriorityPanel, RemoveTargetPanel, SuccessPanel } from './TargetExamPanels';

interface TargetExamCardProps {
  targetExam?: string;
  examCategory?: string;
  userName?: string;
  preparationStartDate?: Date | null;
  liveOverallPct?: number;
}

interface ExamMeta {
  vacancies: string;
  logo: string;
  examDate: string;
  mainsDate: string;
  preliTotal: number;
  mainsTotal: number;
  liveTotal: number;
  gradient: string;
}

const getExamMeta = (exam: string): ExamMeta => {
  const n = exam.toLowerCase();
  if (n.includes('sbi clerk'))    return { vacancies: '13,735', logo: '🏦', examDate: '2026-08-15', mainsDate: '2026-10-05', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a3a6e,#2563eb)' };
  if (n.includes('sbi po'))       return { vacancies: '2,000',  logo: '🏦', examDate: '2026-10-05', mainsDate: '2026-11-30', preliTotal: 20, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#1e3a5f,#1e6a9f)' };
  if (n.includes('ibps clerk'))   return { vacancies: '6,128',  logo: '🏛️', examDate: '2026-10-25', mainsDate: '2026-12-14', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a2e5e,#2855c4)' };
  if (n.includes('ibps po'))      return { vacancies: '4,455',  logo: '🏛️', examDate: '2026-09-10', mainsDate: '2026-11-02', preliTotal: 20, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a2e5e,#2855c4)' };
  if (n.includes('ibps rrb') || n.includes('rrb'))
                                  return { vacancies: '9,985',  logo: '🚂', examDate: '2026-10-05', mainsDate: '2026-11-23', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a2e5e,#2855c4)' };
  if (n.includes('lic ado'))      return { vacancies: '5,000+', logo: '🛡️', examDate: '2026-06-15', mainsDate: '',           preliTotal: 15, mainsTotal: 0,  liveTotal: 5, gradient: 'linear-gradient(160deg,#0f2b5b,#1d5c9e)' };
  if (n.includes('lic aao'))      return { vacancies: '300',    logo: '🛡️', examDate: '2026-09-01', mainsDate: '2026-11-08', preliTotal: 15, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#0f2b5b,#1d5c9e)' };
  if (n.includes('rbi grade b'))  return { vacancies: '291',    logo: '🏦', examDate: '2026-08-01', mainsDate: '2026-09-28', preliTotal: 15, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#4a1508,#c0392b)' };
  if (n.includes('rrb ntpc'))     return { vacancies: '11,558', logo: '🚂', examDate: '2026-11-15', mainsDate: '2027-01-18', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#2d1b69,#6d3fd6)' };
  if (n.includes('ssc cgl'))      return { vacancies: '17,727', logo: '📋', examDate: '2026-09-20', mainsDate: '2026-11-10', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a4d2e,#22c55e)' };
  if (n.includes('ssc chsl'))     return { vacancies: '3,712',  logo: '📋', examDate: '2026-10-15', mainsDate: '2026-12-07', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a4d2e,#22c55e)' };
  if (n.includes('upsc'))         return { vacancies: '979',    logo: '🏛️', examDate: '2026-08-20', mainsDate: '2026-09-19', preliTotal: 15, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#4a1942,#c026d3)' };
  return                               { vacancies: 'Multiple', logo: '📝', examDate: '2026-12-31', mainsDate: '',           preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a3a6e,#2563eb)' };
};

// Small SVG ring used for progress indicators
const Ring: React.FC<{ pct: number; color: string; size: number; stroke: number; textSize: number; label: string }> =
  ({ pct, color, size, stroke, textSize, label }) => {
    const r = (size - stroke) / 2;
    const circ = 2 * Math.PI * r;
    const dash = (Math.max(0, Math.min(pct, 100)) / 100) * circ;
    return (
      <div className="flex flex-col items-center" style={{ gap: 4 }}>
        <div className="relative" style={{ width: size, height: size }}>
          <svg width={size} height={size} className="-rotate-90">
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#f1f5f9" strokeWidth={stroke} />
            <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
              strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
              style={{ transition: 'stroke-dasharray 1s ease-out' }} />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center font-black text-gray-800" style={{ fontSize: textSize }}>{pct}%</span>
        </div>
        <span className="font-bold text-gray-400 uppercase tracking-wider text-center whitespace-nowrap" style={{ fontSize: 8 }}>{label}</span>
      </div>
    );
  };

const TargetExamCard: React.FC<TargetExamCardProps> = ({
  targetExam: fallbackExam = 'SBI PO',
  examCategory: fallbackCategory = 'banking',
  liveOverallPct,
}) => {
  const navigate = useNavigate();
  const { targetExams, removeTargetExam, moveUp, moveDown, addTargetExam } = useTargetExams();
  const { catalog } = useExamCatalog();

  // Local state for which slide we are viewing
  const [viewIndex, setViewIndexRaw] = useState(0);
  const [slideDir, setSlideDir] = useState<'left' | 'right' | null>(null);
  const [animating, setAnimating] = useState(false);
  const lastDirRef = useRef<'left' | 'right'>('left');

  // Animated slide navigation
  const setViewIndex = (updater: number | ((p: number) => number)) => {
    const next = typeof updater === 'function' ? updater(viewIndex) : updater;
    if (next === viewIndex || animating) return;
    const dir = next > viewIndex ? 'left' : 'right';
    lastDirRef.current = dir;
    setSlideDir(dir);
    setAnimating(true);
    setTimeout(() => {
      setViewIndexRaw(next);
      setAnimating(false);
      setSlideDir(null);
    }, 160);
  };

  // Sync viewIndex with valid bounds
  const safeExams = targetExams.length > 0 ? targetExams : [{ id: fallbackExam.toLowerCase().replace(/\s+/g, '-'), name: fallbackExam, category: fallbackCategory, addedAt: Date.now() }];
  const validIndex = Math.min(Math.max(0, viewIndex), safeExams.length - 1);
  const currentExam = safeExams[validIndex];

  const targetExam = currentExam.name;
  const examCategory = currentExam.category;

  // Resolve logo from global catalog (so it updates immediately after Change Exam)
  const resolvedLogo = (() => {
    for (const cat of catalog) {
      for (const sec of cat.sections) {
        const found = sec.exams.find(e => e.id === currentExam.id || e.name === currentExam.name);
        if (found?.logo) return found.logo;
      }
    }
    return null;
  })();

  const displayLogo = resolvedLogo || getExamMeta(targetExam).logo;
  
  const meta = getExamMeta(targetExam);
  const mockRoute = getTargetExamRoute(targetExam);
  const [weaknessOpen, setWeaknessOpen] = useState(false);
  const [howToStartOpen, setHowToStartOpen] = useState(false);
  const [manageTargetsOpen, setManageTargetsOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState<'add' | 'change' | 'priority' | 'remove' | 'success' | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const done = (msg: string) => { setSuccessMsg(msg); setPanelOpen('success'); };
  const [dotMenuOpen, setDotMenuOpen] = useState(false);
  const dotMenuRef = useRef<HTMLDivElement>(null);

  // Close dot-menu on outside click
  useEffect(() => {
    if (!dotMenuOpen) return;
    const handler = (e: MouseEvent) => {
      if (dotMenuRef.current && !dotMenuRef.current.contains(e.target as Node)) {
        setDotMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [dotMenuOpen]);

  // Days left
  const daysLeft = (() => {
    try {
      const d = differenceInDays(new Date(meta.examDate), new Date());
      return d > 0 ? d : null;
    } catch { return null; }
  })();

  // Derive mock progress from liveOverallPct (or 0)
  const overallPct = liveOverallPct && liveOverallPct > 0 ? Math.round(liveOverallPct) : 0;
  const rings = [
    { label: 'OVERALL',   pct: overallPct,                                                  color: '#10b981', size: 82, stroke: 7, textSize: 14 },
    { label: 'QUANT',     pct: Math.min(Math.round(overallPct * 0.9 + 5), 100),             color: '#3b82f6', size: 60, stroke: 5, textSize: 11 },
    { label: 'REASONING', pct: Math.min(Math.round(overallPct * 1.1), 100),                 color: '#8b5cf6', size: 60, stroke: 5, textSize: 11 },
    { label: 'ENGLISH',   pct: Math.min(Math.round(overallPct * 0.85 + 10), 100),          color: '#f59e0b', size: 60, stroke: 5, textSize: 11 },
    { label: 'GEN. AWR.', pct: Math.min(Math.round(overallPct * 0.75 + 15), 100),          color: '#ec4899', size: 60, stroke: 5, textSize: 11 },
  ];

  // Mock test completion counts (will wire to real data later)
  const tabs = [
    { label: 'Prelims',   icon: <FileText className="w-4 h-4" />, total: meta.preliTotal, completed: 0, accent: '#3b82f6', iconBg: '#eff6ff', iconColor: '#2563eb' },
    { label: 'Mains',     icon: <BookOpen className="w-4 h-4" />, total: meta.mainsTotal, completed: 0, accent: '#8b5cf6', iconBg: '#f5f3ff', iconColor: '#7c3aed' },
    { label: 'Live Test', icon: <Zap className="w-4 h-4" />,      total: meta.liveTotal,  completed: 0, accent: '#10b981', iconBg: '#ecfdf5', iconColor: '#059669' },
  ];
  const grandTotal     = tabs.reduce((s, t) => s + t.total, 0);
  const grandCompleted = tabs.reduce((s, t) => s + t.completed, 0);

  // ── Ads panel ──────────────────────────────────────────────────────────────
  const [ads, setAds]             = useState<AdBanner[]>([]);
  const [slideIdx, setSlideIdx]   = useState(0);
  const timerRef                  = useRef<ReturnType<typeof setTimeout> | null>(null);
  const impressionTracked         = useRef<Set<string>>(new Set());

  const loadAds = useCallback(() => {
    const examId = targetExam
      ? `${examCategory.toLowerCase()}-${targetExam.toLowerCase().replace(/\s+/g, '-')}`
      : undefined;
    setAds(getActiveAds({ categoryId: examCategory.toLowerCase() || undefined, examId }, 'days_left_panel'));
  }, [examCategory, targetExam]);

  useEffect(() => {
    loadAds();
    const h = (e: StorageEvent) => { if (e.key === 'superadmin_ad_banners') loadAds(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [loadAds]);

  const totalSlides = 1 + ads.length;

  useEffect(() => {
    if (slideIdx === 0) return;
    const ad = ads[slideIdx - 1];
    if (ad && !impressionTracked.current.has(ad.id)) {
      impressionTracked.current.add(ad.id);
      recordImpression(ad.id);
    }
  }, [slideIdx, ads]);

  useEffect(() => {
    if (totalSlides <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const currentAd = slideIdx > 0 ? ads[slideIdx - 1] : null;
    const ms = currentAd ? getSlideDuration(currentAd.adType) : 6000;
    timerRef.current = setTimeout(() => setSlideIdx(prev => (prev + 1) % totalSlides), ms);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slideIdx, totalSlides, ads]);

  // ── Countdown auto-slide (Prelims ↔ Mains, 10s each) ─────────────────────
  const countdownSlides = [
    { label: 'Prelims', date: meta.examDate },
    ...(meta.mainsDate ? [{ label: 'Mains', date: meta.mainsDate }] : []),
  ];
  const [countdownSlide, setCountdownSlide] = useState(0);

  useEffect(() => {
    // Always reset to Prelims when the exam changes
    setCountdownSlide(0);
    // Only auto-slide if Mains date exists
    if (!meta.mainsDate) return;
    const id = setInterval(() => {
      setCountdownSlide(p => (p === 0 ? 1 : 0));
    }, 10000);
    return () => clearInterval(id);
  }, [meta.examDate, meta.mainsDate]); // re-runs when exam changes

  useEffect(() => {
    if (slideIdx >= totalSlides) setSlideIdx(0);
  }, [totalSlides]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAdClick = (ad: AdBanner) => {
    recordClick(ad.id);
    if (ad.ctaUrl) {
      ad.ctaUrl.startsWith('/') ? (window.location.href = ad.ctaUrl) : window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="flex flex-col lg:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ══ LEFT PANEL ══ */}
      <div className="flex-1 p-4 sm:p-5 lg:p-6 flex flex-col gap-4 min-w-0">

        {/* NEW: Priority Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <h3 className="font-extrabold text-sm text-gray-800">
              {getPriorityLabel(validIndex)}
            </h3>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {validIndex + 1} / {Math.max(3, safeExams.length)}
            </span>
          </div>
          
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* Add Target Exam */}
            {safeExams.length < 3 ? (
              <button
                onClick={() => setPanelOpen('add')}
                className="px-2.5 py-1.5 text-[10px] sm:text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors flex items-center gap-1 shadow-sm"
              >
                <span className="hidden sm:inline">+ Add Exam</span>
                <span className="sm:hidden">+</span>
              </button>
            ) : (
              <span className="px-2 py-1.5 text-[10px] font-bold text-slate-400 bg-slate-50 border border-slate-200 rounded-lg hidden sm:inline-flex">Max 3</span>
            )}
            <button
              onClick={() => setManageTargetsOpen(true)}
              className="px-2.5 py-1.5 text-[10px] sm:text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <FileText className="w-3 h-3" />
              <span className="hidden sm:inline">View All Targets</span>
            </button>
            {/* Arrows */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setViewIndex(p => Math.max(0, p - 1))}
                disabled={validIndex === 0}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors bg-white border border-slate-200 shadow-sm"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewIndex(p => Math.min(safeExams.length - 1, p + 1))}
                disabled={validIndex === safeExams.length - 1}
                className="p-1.5 rounded-md hover:bg-gray-100 disabled:opacity-30 transition-colors bg-white border border-slate-200 shadow-sm"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {/* Three-dot menu */}
            <div className="relative" ref={dotMenuRef}>
              <button
                onClick={() => setDotMenuOpen(o => !o)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-500 bg-white border border-slate-200 shadow-sm transition-colors"
                aria-label="More options"
              >
                <MoreVertical className="w-4 h-4" />
              </button>
              {dotMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-52 bg-white border border-slate-200 shadow-xl rounded-xl overflow-hidden z-50">
                  <div className="p-1">
                    <button
                      onClick={() => { setPanelOpen('change'); setDotMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-md"
                    >
                      ✏️ Change Target Exam
                    </button>
                    <button
                      onClick={() => { setPanelOpen('priority'); setDotMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 rounded-md"
                    >
                      ⇅ Change Priority
                    </button>
                    <div className="mx-2 my-1 border-t border-slate-100" />
                    <button
                      onClick={() => { setPanelOpen('remove'); setDotMenuOpen(false); }}
                      className="w-full text-left px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2.5 rounded-md"
                    >
                      🗑️ Remove Exam
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Slide animation styles injected once ── */}
        <style>{`
          @keyframes slideInLeft {
            from { opacity: 0; transform: translateX(32px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideInRight {
            from { opacity: 0; transform: translateX(-32px); }
            to   { opacity: 1; transform: translateX(0); }
          }
          @keyframes slideOutLeft {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(-32px); }
          }
          @keyframes slideOutRight {
            from { opacity: 1; transform: translateX(0); }
            to   { opacity: 0; transform: translateX(32px); }
          }
          .exam-slide-enter-left  { animation: slideInLeft  0.22s cubic-bezier(.22,.68,0,1.2) forwards; }
          .exam-slide-enter-right { animation: slideInRight 0.22s cubic-bezier(.22,.68,0,1.2) forwards; }
          .exam-slide-exit-left   { animation: slideOutLeft  0.15s ease-in forwards; }
          .exam-slide-exit-right  { animation: slideOutRight 0.15s ease-in forwards; }
        `}</style>

        {/* ── Animated card content: all rows slide together ── */}
        <div
          className={`space-y-5 ${
            animating
              ? lastDirRef.current === 'left' ? 'exam-slide-exit-left' : 'exam-slide-exit-right'
              : lastDirRef.current === 'left' ? 'exam-slide-enter-left' : 'exam-slide-enter-right'
          }`}
        >

        {/* Row 1: Identity + Progress Rings */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">

          <div className="flex-1">
            <div className="flex items-center gap-3 mb-3 pt-1">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm overflow-hidden">
                {displayLogo && (displayLogo.startsWith('http') || displayLogo.startsWith('data:') || displayLogo.startsWith('/'))
                  ? <img src={displayLogo} alt={targetExam} className="w-9 h-9 object-contain" />
                  : <span className="text-2xl">{displayLogo}</span>
                }
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-gray-900 leading-none">{targetExam}</h2>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  <div className="inline-flex items-center gap-1 bg-blue-50 border border-blue-100 text-blue-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    <Users className="w-3 h-3" /> 3.4K+ Students Enrolled
                  </div>
                  <div className="inline-flex items-center gap-1 bg-amber-50 border border-amber-100 text-amber-700 text-[11px] font-semibold px-2.5 py-1 rounded-full">
                    <Trophy className="w-3 h-3" /> {meta.vacancies} Vacancies
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Progress rings — scroll horizontally on mobile */}
          <div className="flex items-end gap-3 sm:gap-4 overflow-x-auto pb-1 shrink-0 scrollbar-none">
            {rings.map((ring, idx) => (
              <div key={idx} className="shrink-0">
                <Ring {...ring}
                  size={idx === 0 ? (window.innerWidth < 640 ? 68 : 82) : (window.innerWidth < 640 ? 50 : 60)}
                  stroke={idx === 0 ? (window.innerWidth < 640 ? 6 : 7) : (window.innerWidth < 640 ? 4 : 5)}
                  textSize={idx === 0 ? (window.innerWidth < 640 ? 12 : 14) : (window.innerWidth < 640 ? 9 : 11)}
                />
              </div>
            ))}
          </div>
        </div>{/* end Row 1 */}

        {/* Row 2: Test completion cards */}
        <div className="rounded-2xl bg-gray-50/60 px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Preparation Progress</span>
            <span className="text-[10px] font-extrabold" style={{ color: '#16a34a' }}>{grandCompleted} / {grandTotal} Total</span>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {tabs.map(tab => {
              const pct = tab.total > 0 ? Math.round((tab.completed / tab.total) * 100) : 0;
              return (
                <div key={tab.label} className="bg-white rounded-xl px-3 py-2.5"
                  style={{ border: '1px solid #EEF2F7', boxShadow: '0 2px 8px rgba(15,23,42,0.04)' }}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0"
                        style={{ background: tab.iconBg, color: tab.iconColor }}>
                        {tab.icon}
                      </div>
                      <span className="text-[11px] font-extrabold uppercase tracking-wide" style={{ color: tab.iconColor }}>{tab.label}</span>
                    </div>
                    <div className="flex items-baseline gap-0.5">
                      <span className="text-[18px] font-black" style={{ color: tab.iconColor }}>{tab.completed}</span>
                      <span className="text-[11px] font-bold text-gray-400">/{tab.total}</span>
                    </div>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: tab.accent }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Row 3: Action buttons — 2-col grid on mobile, row on sm+ */}
        <div className="grid grid-cols-2 sm:flex sm:flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(mockRoute)}
            className="col-span-2 sm:col-span-1 bg-primary hover:bg-primary/90 text-white flex items-center justify-center gap-2 font-bold px-4 py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95 text-sm"
          >
            <PlayCircle className="w-4 h-4" /> Start Full Mock
          </button>
          <button
            onClick={() => navigate('/student/syllabus')}
            className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-3 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-gray-500" />
            <span className="hidden sm:inline">View </span>Syllabus
          </button>
          <button
            onClick={() => setWeaknessOpen(true)}
            className="border border-violet-200 hover:border-violet-300 hover:bg-violet-50 text-violet-700 font-semibold px-3 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Weakness </span>Predictor
            <span className="text-[9px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded">AI</span>
          </button>
          <button
            onClick={() => setHowToStartOpen(true)}
            className="border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-semibold px-3 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center justify-center gap-2"
          >
            <HelpCircle className="w-4 h-4" /> How to Start
          </button>
        </div>

        </div>{/* end animated slide wrapper */}

        {/* Row 4: View All Targets & Slide Indicators */}
        <div className="flex items-center justify-between mt-2 pt-4 border-t border-gray-100">
          {/* Dot Indicators */}
          <div className="flex items-center gap-1.5">
            {safeExams.map((_, idx) => (
               <button 
                 key={idx} 
                 onClick={() => setViewIndex(idx)}
                 className={`h-2 rounded-full transition-all ${idx === validIndex ? 'w-6 bg-primary' : 'w-2 bg-gray-200 hover:bg-gray-300'}`}
               />
            ))}
          </div>
          
          <button 
            onClick={() => setManageTargetsOpen(true)}
            className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
          >
            Manage Targets ({safeExams.length}/3)
          </button>
        </div>

        <WeaknessDetectionModal
          isOpen={weaknessOpen}
          onClose={() => setWeaknessOpen(false)}
          examId={targetExam.toLowerCase().replace(/\s+/g, '-')}
          examName={targetExam}
        />
        <HowToStartModal
          isOpen={howToStartOpen}
          onClose={() => setHowToStartOpen(false)}
          examName={targetExam}
          examId={targetExam.toLowerCase().replace(/\s+/g, '-')}
        />
      </div>

      {/* ══ RIGHT PANEL — Countdown + Superadmin Ads ══ */}
      <div
        className="lg:w-[260px] flex-shrink-0 relative overflow-hidden group select-none"
        style={{ background: '#1e1b4b', minHeight: 120 }}
      >
        {/* Slide 0 — Countdown (auto-cycles Prelims ↔ Mains) */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{ opacity: slideIdx === 0 ? 1 : 0, pointerEvents: slideIdx === 0 ? 'auto' : 'none' }}
        >
          {/* Per-slide background layers — cross-fade between them */}
          <div
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{ background: 'linear-gradient(160deg,#1e40af,#2563eb,#0ea5e9)', opacity: countdownSlide === 0 ? 1 : 0 }}
          />
          <div
            className="absolute inset-0 transition-all duration-700 pointer-events-none"
            style={{ background: 'linear-gradient(160deg,#4c1d95,#7c3aed,#a855f7)', opacity: countdownSlide === 1 ? 1 : 0 }}
          />
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />

          {/* Each countdown sub-slide fades in/out */}
          {countdownSlides.map((cs, i) => {
            const dLeft = differenceInDays(new Date(cs.date), new Date());
            return (
              <div
                key={cs.label}
                className="absolute inset-0 flex flex-row lg:flex-col items-center justify-center text-white px-4 py-4 sm:px-6 lg:p-6 gap-4 lg:gap-0 transition-all duration-500"
                style={{
                  opacity: countdownSlide === i ? 1 : 0,
                  pointerEvents: countdownSlide === i ? 'auto' : 'none',
                  transform: countdownSlide === i ? 'translateX(0)' : (i < countdownSlide ? 'translateX(-12px)' : 'translateX(12px)'),
                }}
              >
                {/* Number */}
                <div className="relative z-10 flex flex-col items-center text-center shrink-0">
                  <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest opacity-75 mb-0.5 lg:mb-1">Your Countdown</div>
                  <div className="font-black leading-none tabular-nums drop-shadow-lg text-5xl sm:text-6xl lg:text-[68px]">
                    {dLeft > 0 ? dLeft : '0'}
                  </div>
                  <div className="text-[11px] sm:text-[13px] font-black uppercase tracking-[0.2em] opacity-90 mt-0.5 lg:mt-1">Days Left</div>
                </div>

                {/* Date badge */}
                <div className="relative z-10 flex flex-col items-center gap-2 lg:mt-2 lg:w-full">
                  <div className="hidden lg:block w-10 h-0.5 bg-white/40 rounded-full" />
                  <div className="text-[9px] sm:text-[10px] opacity-70 tracking-wide font-medium uppercase text-center">To Exam Day</div>
                  <div className="bg-white/15 border border-white/25 rounded-xl px-3 py-1.5 sm:py-2 flex items-center gap-2 w-full">
                    <Calendar className="w-3.5 h-3.5 text-white flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-black text-white text-[11px] sm:text-xs leading-tight text-center">
                        {new Date(cs.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </div>
                      <div className="text-[9px] text-white/65 font-semibold text-center">{cs.label} Exam Date</div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Dot indicator (only when Mains exists) */}
          {countdownSlides.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-20">
              {countdownSlides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCountdownSlide(i)}
                  className={`rounded-full transition-all duration-300 ${
                    i === countdownSlide ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Slides 1..n — Superadmin Ads */}
        {ads.map((ad, idx) => (
          <div
            key={ad.id}
            className="absolute inset-0 flex flex-col transition-opacity duration-500"
            style={{
              opacity: slideIdx === idx + 1 ? 1 : 0,
              pointerEvents: slideIdx === idx + 1 ? 'auto' : 'none',
              background: ad.imageDataUrl ? undefined : (ad.bgColor || 'linear-gradient(135deg,#1e40af,#10b981)'),
            }}
          >
            {ad.imageDataUrl && (
              <img src={ad.imageDataUrl} alt={ad.title || 'Ad'} className="absolute inset-0 w-full h-full object-cover" draggable={false} />
            )}
            {ad.title ? (
              <>
                {ad.imageDataUrl && <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/65" />}
                <div className="relative z-10 flex flex-col h-full">
                  <div className="pt-3 px-3 shrink-0">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-white/70 bg-black/25 px-2 py-0.5 rounded-full">
                      {ad.adType === 'exam' ? '🎯 Exam' : ad.adType === 'course' ? '📚 Course' : ad.adType === 'announcement' ? '📢 News' : '🔥 Offer'}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-2 gap-1.5">
                    <p className="font-black text-white text-sm leading-tight line-clamp-4" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>{ad.title}</p>
                    {ad.subtitle && <p className="text-white/80 text-[10px] leading-snug line-clamp-2">{ad.subtitle}</p>}
                  </div>
                  <div className="shrink-0 pb-8 px-3 flex justify-center">
                    {ad.ctaText && (
                      <button type="button" onClick={() => handleAdClick(ad)}
                        className="inline-flex items-center gap-1 bg-white text-slate-900 font-bold text-[10px] px-3 py-1.5 rounded-full shadow-md hover:scale-105 transition-transform">
                        {ad.ctaText} <ExternalLink className="h-2.5 w-2.5" />
                      </button>
                    )}
                  </div>
                </div>
              </>
            ) : (
              ad.ctaText && (
                <>
                  <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent z-10" />
                  <div className="absolute bottom-7 left-0 right-0 z-20 flex justify-center">
                    <button type="button" onClick={() => handleAdClick(ad)}
                      className="inline-flex items-center gap-1 bg-white text-slate-900 font-bold text-[10px] px-3 py-1.5 rounded-full shadow-md hover:scale-105 transition-transform">
                      {ad.ctaText} <ExternalLink className="h-2.5 w-2.5" />
                    </button>
                  </div>
                </>
              )
            )}
          </div>
        ))}

        {/* Navigation — only when ads exist */}
        {ads.length > 0 && (
          <>
            <button type="button" onClick={() => setSlideIdx(p => (p - 1 + totalSlides) % totalSlides)}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronLeft className="h-3 w-3" />
            </button>
            <button type="button" onClick={() => setSlideIdx(p => (p + 1) % totalSlides)}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity">
              <ChevronRight className="h-3 w-3" />
            </button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
              {Array.from({ length: totalSlides }).map((_, i) => (
                <button type="button" key={i} onClick={() => setSlideIdx(i)}
                  className={`rounded-full transition-all duration-300 ${i === slideIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* ══ VIEW ALL TARGETS — Read-only count list ══ */}
      {manageTargetsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800">Your Target Exams</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">{safeExams.length} of 3 targets set</p>
              </div>
              <button onClick={() => setManageTargetsOpen(false)} className="p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-50">✕</button>
            </div>

            <div className="p-5 space-y-2">
              {safeExams.map((exam, idx) => {
                const c = getPriorityColor(idx);
                const examLogo = (() => {
                  for (const cat of catalog) {
                    for (const sec of cat.sections) {
                      const found = sec.exams.find(e => e.id === exam.id || e.name === exam.name);
                      if (found?.logo) return found.logo;
                    }
                  }
                  return null;
                })();
                return (
                  <div key={exam.id} className="flex items-center gap-3 p-3.5 rounded-xl border border-slate-100 bg-slate-50">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-black shrink-0" style={{ background: c.bg }}>
                      {idx + 1}
                    </div>
                    <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden">
                      {examLogo && (examLogo.startsWith('http') || examLogo.startsWith('data:') || examLogo.startsWith('/'))
                        ? <img src={examLogo} alt={exam.name} className="w-6 h-6 object-contain" />
                        : <span className="text-base">{examLogo || '📝'}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{exam.name}</p>
                      <p className="text-[10px] font-semibold mt-0.5" style={{ color: c.bg }}>{getPriorityLabel(idx)}</p>
                    </div>
                  </div>
                );
              })}

              {/* Slots remaining */}
              {Array.from({ length: 3 - safeExams.length }).map((_, i) => (
                <div key={`empty-${i}`} className="flex items-center gap-3 p-3.5 rounded-xl border-2 border-dashed border-slate-100">
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-sm font-black shrink-0">
                    {safeExams.length + i + 1}
                  </div>
                  <p className="text-sm text-slate-400 font-medium">Empty slot — add a target exam</p>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between">
              <p className="text-xs text-slate-400">Use ⋮ menu to manage targets</p>
              <button onClick={() => setManageTargetsOpen(false)} className="px-5 py-2 bg-slate-900 text-white rounded-lg font-semibold text-sm hover:bg-slate-800 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ══ ACTION PANELS ══ */}
      {panelOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white h-full shadow-2xl animate-in slide-in-from-right duration-300 relative">
            {panelOpen === 'add' && (
              <AddTargetPanel onClose={() => setPanelOpen(null)} onDone={() => done('New target exam added successfully!')} />
            )}
            {panelOpen === 'change' && (
              <ChangeTargetPanel onClose={() => setPanelOpen(null)} examIdx={validIndex} examName={targetExam} onDone={() => done('Target exam changed successfully!')} />
            )}
            {panelOpen === 'priority' && (
              <ChangePriorityPanel onClose={() => setPanelOpen(null)} onDone={() => done('Priority order updated!')} />
            )}
            {panelOpen === 'remove' && (
              <RemoveTargetPanel onClose={() => setPanelOpen(null)} examIdx={validIndex} examName={targetExam} onDone={() => { setViewIndex(Math.max(0, validIndex - 1)); done('Exam removed from your targets.'); }} />
            )}
            {panelOpen === 'success' && (
              <SuccessPanel onClose={() => setPanelOpen(null)} message={successMsg} />
            )}
          </div>
        </div>
      )}

    </div>
  );
};

export default TargetExamCard;
