import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, BookOpen, Brain, Calendar, ChevronLeft, ChevronRight,
  ExternalLink, HelpCircle, Users, Trophy, FileText, Zap,
  List, MoreVertical, RefreshCw, Trash2, UserCog, ArrowLeft, ArrowRight, Plus
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ChangeTargetDrawer } from './ChangeTargetDrawer';
import { UpdateExamDateModal, ChangePriorityModal, RemoveTargetModal, ViewAllTargetsModal, KeepAsSecondaryModal } from './TargetExamModals';
import { getTargetExamRoute } from '@/utils/targetExamRoute';
import { differenceInDays } from 'date-fns';
import { getActiveAds, recordClick, recordImpression, getSlideDuration, AdBanner } from '@/data/adsStore';
import { WeaknessDetectionModal } from '@/components/student/exam/WeaknessDetectionModal';
import { HowToStartModal } from '@/components/student/exam/HowToStartModal';

interface TargetExamCardProps {
  targetExam: string;
  examCategory: string;
  userName: string;
  preparationStartDate: Date | null;
  liveOverallPct?: number;
}

interface ExamMeta {
  vacancies: string;
  logo: string;
  examDate: string;
  preliTotal: number;
  mainsTotal: number;
  liveTotal: number;
  gradient: string;
}

const getExamMeta = (exam: string): ExamMeta => {
  const n = exam.toLowerCase();
  if (n.includes('sbi clerk'))    return { vacancies: '13,735', logo: '🏦', examDate: '2026-08-15', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a3a6e,#2563eb)' };
  if (n.includes('sbi po'))       return { vacancies: '2,000',  logo: '🏦', examDate: '2026-10-05', preliTotal: 20, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#1e3a5f,#1e6a9f)' };
  if (n.includes('ibps clerk'))   return { vacancies: '6,128',  logo: '🏛️', examDate: '2026-10-25', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a2e5e,#2855c4)' };
  if (n.includes('ibps po'))      return { vacancies: '4,455',  logo: '🏛️', examDate: '2026-09-10', preliTotal: 20, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a2e5e,#2855c4)' };
  if (n.includes('ibps rrb') || n.includes('rrb'))
                                  return { vacancies: '9,985',  logo: '🚂', examDate: '2026-10-05', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a2e5e,#2855c4)' };
  if (n.includes('lic ado'))      return { vacancies: '5,000+', logo: '🛡️', examDate: '2026-06-15', preliTotal: 15, mainsTotal: 0,  liveTotal: 5, gradient: 'linear-gradient(160deg,#0f2b5b,#1d5c9e)' };
  if (n.includes('lic aao'))      return { vacancies: '300',    logo: '🛡️', examDate: '2026-09-01', preliTotal: 15, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#0f2b5b,#1d5c9e)' };
  if (n.includes('rbi grade b'))  return { vacancies: '291',    logo: '🏦', examDate: '2026-08-01', preliTotal: 15, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#4a1508,#c0392b)' };
  if (n.includes('rrb ntpc'))     return { vacancies: '11,558', logo: '🚂', examDate: '2026-11-15', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#2d1b69,#6d3fd6)' };
  if (n.includes('ssc cgl'))      return { vacancies: '17,727', logo: '📋', examDate: '2026-09-20', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a4d2e,#22c55e)' };
  if (n.includes('ssc chsl'))     return { vacancies: '3,712',  logo: '📋', examDate: '2026-10-15', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a4d2e,#22c55e)' };
  if (n.includes('upsc'))         return { vacancies: '979',    logo: '🏛️', examDate: '2026-08-20', preliTotal: 15, mainsTotal: 15, liveTotal: 5, gradient: 'linear-gradient(160deg,#4a1942,#c026d3)' };
  return                               { vacancies: 'Multiple', logo: '📝', examDate: '2026-12-31', preliTotal: 20, mainsTotal: 20, liveTotal: 5, gradient: 'linear-gradient(160deg,#1a3a6e,#2563eb)' };
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
  targetExam,
  examCategory,
  liveOverallPct,
}) => {
  const navigate = useNavigate();
  
  const [targets, setTargets] = useState([
    { exam: targetExam, category: examCategory, type: 'Primary Target' }
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  
  const currentTarget = targets[activeIndex] || targets[0];
  const meta = getExamMeta(currentTarget.exam);
  const mockRoute = getTargetExamRoute(currentTarget.exam);
  
  const [weaknessOpen, setWeaknessOpen] = useState(false);
  const [howToStartOpen, setHowToStartOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [viewAllOpen, setViewAllOpen] = useState(false);
  const [updateDateOpen, setUpdateDateOpen] = useState(false);
  const [changePriorityOpen, setChangePriorityOpen] = useState(false);
  const [removeTargetOpen, setRemoveTargetOpen] = useState(false);
  const [keepSecondaryOpen, setKeepSecondaryOpen] = useState(false);
  const [pendingNewTarget, setPendingNewTarget] = useState<any>(null);

  const makePrimary = () => {
    setTargets(prev => {
      const newTargets = [...prev];
      const primaryIdx = newTargets.findIndex(t => t.type === 'Primary Target');
      if (primaryIdx !== -1 && primaryIdx !== activeIndex) {
        newTargets[primaryIdx].type = 'Secondary Target';
        newTargets[activeIndex].type = 'Primary Target';
        
        // Swap positions so Primary is always at index 0
        const temp = newTargets[primaryIdx];
        newTargets[primaryIdx] = newTargets[activeIndex];
        newTargets[activeIndex] = temp;
      }
      return newTargets;
    });
    setActiveIndex(0);
  };

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
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-xl font-bold text-slate-900">{currentTarget.type}</h2>
            <span className="text-[10px] font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{activeIndex + 1}/{targets.length}</span>
          </div>
          <p className="text-sm text-slate-500">Your focus exam</p>
        </div>
        <div className="flex items-center gap-2">
          <button 
            className="hidden sm:flex items-center text-slate-700 h-9 px-3 rounded-lg border border-slate-200 font-semibold text-sm hover:bg-slate-50" 
            onClick={() => setViewAllOpen(true)}
          >
            <List className="w-4 h-4 mr-2" /> View All Targets
          </button>
          <button 
            onClick={() => setActiveIndex(p => Math.max(0, p - 1))}
            disabled={activeIndex === 0}
            className="flex items-center justify-center h-9 w-9 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setActiveIndex(p => Math.min(targets.length - 1, p + 1))}
            disabled={activeIndex === targets.length - 1}
            className="flex items-center justify-center h-9 w-9 text-slate-700 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* ══ LEFT PANEL ══ */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4">

        {/* Row 1: Identity + Progress Rings */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6 relative">
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-3">
              <div className="inline-flex items-center px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 font-extrabold text-[9px] uppercase tracking-widest">
                {currentTarget.type}
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="h-8 w-8 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 absolute -top-1 -right-1 sm:-top-2 sm:-right-2">
                    <MoreVertical className="w-4 h-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 rounded-xl p-1 shadow-lg border-slate-100 z-50">
                  {currentTarget.type === 'Primary Target' ? (
                    <>
                      {targets.length < 3 && (
                        <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDrawerOpen(true); }} className="gap-2 py-2.5 cursor-pointer font-medium text-[#16a34a]">
                          <Plus className="w-4 h-4 text-[#16a34a]" /> Add Target Exam
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDrawerOpen(true); }} className="gap-2 py-2.5 cursor-pointer font-medium text-slate-700">
                        <RefreshCw className="w-4 h-4 text-slate-500" /> Change Target
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setUpdateDateOpen(true); }} className="gap-2 py-2.5 cursor-pointer font-medium text-slate-700">
                        <Calendar className="w-4 h-4 text-slate-500" /> Update Exam Date
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setChangePriorityOpen(true); }} className="gap-2 py-2.5 cursor-pointer font-medium text-slate-700">
                        <UserCog className="w-4 h-4 text-slate-500" /> Change Priority
                      </DropdownMenuItem>
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      <DropdownMenuItem 
                        disabled={targets.length === 1}
                        onSelect={(e) => { e.preventDefault(); setRemoveTargetOpen(true); }} 
                        className="gap-2 py-2.5 cursor-pointer font-semibold text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="w-4 h-4" /> Remove Target
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <>
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); makePrimary(); }} className="gap-2 py-2.5 cursor-pointer font-bold text-amber-600 hover:bg-amber-50">
                        ⭐ Make Primary
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setDrawerOpen(true); }} className="gap-2 py-2.5 cursor-pointer font-medium text-slate-700">
                        <RefreshCw className="w-4 h-4 text-slate-500" /> Change Exam
                      </DropdownMenuItem>
                      <div className="h-px bg-slate-100 my-1 mx-2" />
                      <DropdownMenuItem onSelect={(e) => { e.preventDefault(); setRemoveTargetOpen(true); }} className="gap-2 py-2.5 cursor-pointer font-semibold text-red-600 hover:bg-red-50 focus:bg-red-50 focus:text-red-700 rounded-lg">
                        <Trash2 className="w-4 h-4" /> Remove Target
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-2xl">{meta.logo}</span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{currentTarget.exam}</h2>
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

          {/* Progress rings */}
          <div className="flex items-end gap-4 flex-wrap shrink-0">
            {rings.map((ring, idx) => (
              <Ring key={idx} {...ring} />
            ))}
          </div>
        </div>

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

        {/* Row 3: Action buttons */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate(mockRoute)}
            className="bg-primary hover:bg-primary/90 text-white flex items-center gap-2 font-bold px-5 py-2.5 rounded-xl shadow-md shadow-primary/20 transition-all active:scale-95 text-sm"
          >
            <PlayCircle className="w-4 h-4" /> Start Full Mock
          </button>
          <button
            onClick={() => navigate('/student/syllabus')}
            className="border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center gap-2"
          >
            <BookOpen className="w-4 h-4 text-gray-500" /> View Syllabus
          </button>
          <button
            onClick={() => setWeaknessOpen(true)}
            className="border border-violet-200 hover:border-violet-300 hover:bg-violet-50 text-violet-700 font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center gap-2"
          >
            <Brain className="w-4 h-4" /> Weakness Predictor
            <span className="text-[9px] font-black bg-violet-600 text-white px-1.5 py-0.5 rounded">AI</span>
          </button>
          <button
            onClick={() => setHowToStartOpen(true)}
            className="border border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 text-emerald-700 font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-95 text-sm flex items-center gap-2"
          >
            <HelpCircle className="w-4 h-4" /> How to Start
          </button>
        </div>

        <WeaknessDetectionModal
          isOpen={weaknessOpen}
          onClose={() => setWeaknessOpen(false)}
          examId={currentTarget.exam.toLowerCase().replace(/\s+/g, '-')}
          examName={currentTarget.exam}
        />
        <HowToStartModal
          isOpen={howToStartOpen}
          onClose={() => setHowToStartOpen(false)}
          examName={currentTarget.exam}
          examId={currentTarget.exam.toLowerCase().replace(/\s+/g, '-')}
        />
      </div>

      {/* ══ RIGHT PANEL (Countdown) ══ */}
      <div 
        className="w-full md:w-[280px] lg:w-[320px] shrink-0 p-6 flex flex-col items-center justify-center text-center relative overflow-hidden" 
        style={{ background: 'linear-gradient(135deg, #0ea5e9, #0284c7)' }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="relative z-10 w-full flex flex-col items-center">
          <p className="text-white/80 font-extrabold tracking-[0.2em] text-[10px] uppercase mb-6">Your Countdown</p>
          
          <div className="flex flex-col items-center justify-center mb-8">
            <span className="text-7xl font-black text-white leading-none tracking-tighter mb-3" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
              {daysLeft !== null ? daysLeft : '--'}
            </span>
            <span className="text-white font-black tracking-[0.15em] text-xs uppercase mb-1">Days Left</span>
            <span className="text-white/70 font-bold text-[9px] uppercase tracking-wider">To Exam Day</span>
          </div>
          
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl py-3.5 px-4 flex items-center justify-center gap-3 w-full max-w-[220px]">
            <Calendar className="w-5 h-5 text-white/90" />
            <div className="text-left">
              <p className="text-white font-bold text-sm leading-tight">
                {new Date(meta.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
              <p className="text-white/70 text-[10px] font-bold">Prelims Exam Date</p>
            </div>
          </div>
        </div>
      </div>
      {/* End of md:flex-row wrapper */}
      </div>

      <ChangeTargetDrawer 
        isOpen={drawerOpen} 
        onClose={() => setDrawerOpen(false)}
        onSuccess={(details) => {
          console.log("Updated target:", details);
          if (currentTarget.type === 'Primary Target' && targets.length < 3) {
            // Case 1: Changing primary but we have room for a secondary.
            // Ask user if they want to keep old primary as secondary
            setPendingNewTarget(details);
            setDrawerOpen(false);
            setKeepSecondaryOpen(true);
          } else {
            // Normal update
            setTargets(prev => {
              const newTargets = [...prev];
              if (newTargets.length < 3 && currentTarget.type !== 'Primary Target') {
                newTargets.push({ exam: details.exam || 'New Exam', category: details.category || 'Banking', type: 'Secondary Target' });
                setActiveIndex(newTargets.length - 1);
              } else {
                newTargets[activeIndex] = { exam: details.exam || 'New Exam', category: details.category || 'Banking', type: newTargets[activeIndex].type };
              }
              return newTargets;
            });
            setDrawerOpen(false);
          }
        }}
      />
      {/* Modals */}
      <KeepAsSecondaryModal
        isOpen={keepSecondaryOpen}
        onClose={() => setKeepSecondaryOpen(false)}
        oldExam={currentTarget.exam}
        onKeep={() => {
          if (pendingNewTarget) {
            setTargets(prev => {
              const newTargets = [...prev];
              newTargets.push({ exam: newTargets[activeIndex].exam, category: newTargets[activeIndex].category, type: 'Secondary Target' });
              newTargets[activeIndex] = { exam: pendingNewTarget.exam || 'New Exam', category: pendingNewTarget.category || 'Banking', type: 'Primary Target' };
              return newTargets;
            });
          }
          setPendingNewTarget(null);
        }}
        onRemove={() => {
          if (pendingNewTarget) {
            setTargets(prev => {
              const newTargets = [...prev];
              newTargets[activeIndex] = { exam: pendingNewTarget.exam || 'New Exam', category: pendingNewTarget.category || 'Banking', type: 'Primary Target' };
              return newTargets;
            });
          }
          setPendingNewTarget(null);
        }}
      />
      <UpdateExamDateModal 
        isOpen={updateDateOpen} 
        onClose={() => setUpdateDateOpen(false)} 
        currentExam={currentTarget.exam}
        currentDate={new Date(meta.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
      />
      <ChangePriorityModal 
        isOpen={changePriorityOpen} 
        onClose={() => setChangePriorityOpen(false)} 
        currentExam={currentTarget.exam}
        currentType={currentTarget.type}
        onSave={(newType) => {
          setTargets(prev => {
            const newTargets = [...prev];
            if (newType === 'Primary Target') {
              newTargets.forEach(t => {
                if (t.type === 'Primary Target') t.type = 'Secondary Target';
              });
            }
            newTargets[activeIndex].type = newType;
            return newTargets;
          });
        }}
      />
      <RemoveTargetModal 
        isOpen={removeTargetOpen} 
        onClose={() => {
          setRemoveTargetOpen(false);
          if (targets.length > 1) {
            setTargets(prev => prev.filter((_, i) => i !== activeIndex));
            setActiveIndex(p => Math.max(0, p - 1));
          }
        }} 
        currentExam={currentTarget.exam} 
      />
      <ViewAllTargetsModal 
        isOpen={viewAllOpen}
        onClose={() => setViewAllOpen(false)}
        targets={targets}
        activeIndex={activeIndex}
        setActiveIndex={setActiveIndex}
      />
    </div>
  );
};

export default TargetExamCard;
