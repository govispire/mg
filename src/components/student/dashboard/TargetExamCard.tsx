import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PlayCircle, BookOpen, Brain, Calendar, ChevronLeft, ChevronRight,
  ExternalLink, HelpCircle, Users, Trophy, FileText, Zap,
} from 'lucide-react';
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
  const meta = getExamMeta(targetExam);
  const mockRoute = getTargetExamRoute(targetExam);
  const [weaknessOpen, setWeaknessOpen] = useState(false);
  const [howToStartOpen, setHowToStartOpen] = useState(false);

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
    <div className="flex flex-col md:flex-row bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* ══ LEFT PANEL ══ */}
      <div className="flex-1 p-4 sm:p-5 flex flex-col gap-4">

        {/* Row 1: Identity + Progress Rings */}
        <div className="flex flex-col sm:flex-row sm:items-start gap-6">
          <div className="flex-1">
            <div className="text-[10px] font-extrabold text-primary uppercase tracking-widest mb-2">Target Examination</div>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm">
                <span className="text-2xl">{meta.logo}</span>
              </div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-gray-900 leading-none">{targetExam}</h2>
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
        className="md:w-[260px] flex-shrink-0 relative overflow-hidden group select-none"
        style={{ background: 'linear-gradient(160deg,#2563eb,#0ea5e9,#06b6d4)', minHeight: 220 }}
      >
        {/* Slide 0 — Days Left */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-white transition-opacity duration-500 p-6"
          style={{ opacity: slideIdx === 0 ? 1 : 0, pointerEvents: slideIdx === 0 ? 'auto' : 'none' }}
        >
          <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute bottom-8 -left-8 w-28 h-28 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center text-center">
            <div className="text-[10px] font-extrabold uppercase tracking-widest opacity-75 mb-1">Your Countdown</div>
            <div className="font-black leading-none tabular-nums drop-shadow-lg" style={{ fontSize: 68 }}>
              {daysLeft !== null ? daysLeft : '—'}
            </div>
            <div className="text-[13px] font-black uppercase tracking-[0.2em] opacity-90 mt-1">Days Left</div>
            <div className="mt-2 w-10 h-0.5 bg-white/40 rounded-full" />
            <div className="mt-1.5 text-[10px] opacity-70 tracking-wide font-medium uppercase">To Exam Day</div>
            <div className="mt-4 bg-white/15 border border-white/25 rounded-xl px-3 py-2 flex items-center gap-2 w-full">
              <Calendar className="w-3.5 h-3.5 text-white flex-shrink-0" />
              <div>
                <div className="font-black text-white text-xs leading-tight">
                  {new Date(meta.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </div>
                <div className="text-[9px] text-white/65 font-semibold">Prelims Exam Date</div>
              </div>
            </div>
          </div>
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

    </div>
  );
};

export default TargetExamCard;
