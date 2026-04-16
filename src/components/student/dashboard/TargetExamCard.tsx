import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Play,
  BookOpen,
  Target,
  TrendingUp,
  Calendar,
  Award,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { getTargetExamRoute } from '@/utils/targetExamRoute';
import { differenceInDays } from 'date-fns';
import { getActiveAds, recordClick, recordImpression, getSlideDuration, AdBanner } from '@/data/adsStore';

interface TargetExamCardProps {
  targetExam: string;
  examCategory: string;
  userName: string;
  preparationStartDate: Date | null;
  /** Live overall % from real quiz scores; overrides the static default when provided */
  liveOverallPct?: number;
}

interface ExamMeta {
  subtitle: string;
  vacancies: string;
  notification: string;
  region: string;
  duration: string;
  marks: string;
  sections: { name: string; color: string; pct: number }[];
  overallPct: number;
  gradient: string;
  examDate: string;
}

const getExamMeta = (exam: string): ExamMeta => {
  const n = exam.toLowerCase();

  if (n.includes('sbi clerk') || n.includes('sbi-clerk'))
    return {
      subtitle: 'Preliminary Examination',
      vacancies: '13,735 Vacancies',
      notification: 'Nov 2026',
      region: 'All India',
      duration: '60 min',
      marks: '100 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 62 },
        { name: 'Reasoning', color: '#a78bfa', pct: 74 },
        { name: 'English', color: '#34d399', pct: 78 },
        { name: 'Gen. Awareness', color: '#fb923c', pct: 55 },
      ],
      overallPct: 64,
      gradient: 'from-[#1a3a6e] via-[#1e4fa0] to-[#2563eb]',
      examDate: '2026-08-15',
    };

  if (n.includes('sbi po') || n.includes('sbi-po'))
    return {
      subtitle: 'Phase I — Preliminary',
      vacancies: '2,000 Vacancies',
      notification: 'Jul 2026',
      region: 'All India',
      duration: '60 min',
      marks: '100 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 58 },
        { name: 'Reasoning', color: '#a78bfa', pct: 70 },
        { name: 'English', color: '#34d399', pct: 72 },
        { name: 'Gen. Awareness', color: '#fb923c', pct: 48 },
      ],
      overallPct: 60,
      gradient: 'from-[#1e3a5f] via-[#1d4e89] to-[#1e6a9f]',
      examDate: '2026-10-05',
    };

  if (n.includes('ibps clerk') || n.includes('ibps-clerk'))
    return {
      subtitle: 'Preliminary Examination',
      vacancies: '6,128 Vacancies',
      notification: 'Jul 2026',
      region: 'All India',
      duration: '60 min',
      marks: '100 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 60 },
        { name: 'Reasoning', color: '#a78bfa', pct: 72 },
        { name: 'English', color: '#34d399', pct: 76 },
        { name: 'Gen. Awareness', color: '#fb923c', pct: 50 },
      ],
      overallPct: 64,
      gradient: 'from-[#1a2e5e] via-[#1e3f8c] to-[#2855c4]',
      examDate: '2026-10-25',
    };

  if (n.includes('ibps po') || n.includes('ibps-po'))
    return {
      subtitle: 'Preliminary Examination',
      vacancies: '4,455 Vacancies',
      notification: 'Jun 2026',
      region: 'All India',
      duration: '60 min',
      marks: '100 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 65 },
        { name: 'Reasoning', color: '#a78bfa', pct: 76 },
        { name: 'English', color: '#34d399', pct: 80 },
        { name: 'Gen. Awareness', color: '#fb923c', pct: 52 },
      ],
      overallPct: 68,
      gradient: 'from-[#1a2e5e] via-[#1e3f8c] to-[#2855c4]',
      examDate: '2026-09-10',
    };

  if (n.includes('ibps rrb') || n.includes('ibps-rrb') || n.includes('rrb po') || n.includes('rrb clerk'))
    return {
      subtitle: 'Preliminary Examination',
      vacancies: '9,985 Vacancies',
      notification: 'Jul 2026',
      region: 'All India',
      duration: '45 min',
      marks: '80 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 62 },
        { name: 'Reasoning', color: '#a78bfa', pct: 70 },
        { name: 'English', color: '#34d399', pct: 65 },
        { name: 'Gen. Awareness', color: '#fb923c', pct: 58 },
      ],
      overallPct: 64,
      gradient: 'from-[#1a2e5e] via-[#1e3f8c] to-[#2855c4]',
      examDate: '2026-10-05',
    };

  if (n.includes('lic ado') || n.includes('lic-ado'))
    return {
      subtitle: 'Apprentice Development Officer',
      vacancies: '5,000+ Vacancies',
      notification: 'Mar 2026',
      region: 'All India',
      duration: '60 min',
      marks: '300 Marks',
      sections: [
        { name: 'Reasoning', color: '#38bdf8', pct: 68 },
        { name: 'Numeracy', color: '#a78bfa', pct: 72 },
        { name: 'English', color: '#34d399', pct: 76 },
        { name: 'Gen. Knowledge', color: '#fb923c', pct: 60 },
      ],
      overallPct: 69,
      gradient: 'from-[#0f2b5b] via-[#1a4080] to-[#1d5c9e]',
      examDate: '2026-06-15',
    };

  if (n.includes('lic aao') || n.includes('lic-aao'))
    return {
      subtitle: 'Assistant Administrative Officer',
      vacancies: '300 Vacancies',
      notification: 'Jun 2026',
      region: 'All India',
      duration: '120 min',
      marks: '300 Marks',
      sections: [
        { name: 'Reasoning', color: '#38bdf8', pct: 70 },
        { name: 'Quantitative', color: '#a78bfa', pct: 65 },
        { name: 'English', color: '#34d399', pct: 78 },
        { name: 'Gen. Knowledge', color: '#fb923c', pct: 55 },
      ],
      overallPct: 67,
      gradient: 'from-[#0f2b5b] via-[#1a4080] to-[#1d5c9e]',
      examDate: '2026-09-01',
    };

  if (n.includes('rbi grade b') || n.includes('rbi-grade-b'))
    return {
      subtitle: 'Grade B Officer',
      vacancies: '291 Vacancies',
      notification: 'May 2026',
      region: 'All India',
      duration: '120 min',
      marks: '200 Marks',
      sections: [
        { name: 'Economics', color: '#38bdf8', pct: 58 },
        { name: 'Reasoning', color: '#a78bfa', pct: 72 },
        { name: 'English', color: '#34d399', pct: 75 },
        { name: 'Gen. Awareness', color: '#fb923c', pct: 62 },
      ],
      overallPct: 66,
      gradient: 'from-[#4a1508] via-[#7c2210] to-[#c0392b]',
      examDate: '2026-08-01',
    };

  if (n.includes('rrb ntpc') || n.includes('rrb-ntpc'))
    return {
      subtitle: 'CBT Stage 1',
      vacancies: '11,558 Vacancies',
      notification: 'Aug 2026',
      region: 'All India',
      duration: '90 min',
      marks: '100 Marks',
      sections: [
        { name: 'Mathematics', color: '#38bdf8', pct: 60 },
        { name: 'Reasoning', color: '#a78bfa', pct: 72 },
        { name: 'Gen. Awareness', color: '#34d399', pct: 65 },
        { name: 'Gen. Science', color: '#fb923c', pct: 50 },
      ],
      overallPct: 62,
      gradient: 'from-[#2d1b69] via-[#4a2d9c] to-[#6d3fd6]',
      examDate: '2026-11-15',
    };

  if (n.includes('rrb group d') || n.includes('rrb-group-d'))
    return {
      subtitle: 'Computer Based Test',
      vacancies: '32,438 Vacancies',
      notification: 'Aug 2026',
      region: 'All India',
      duration: '90 min',
      marks: '100 Marks',
      sections: [
        { name: 'Mathematics', color: '#38bdf8', pct: 55 },
        { name: 'Reasoning', color: '#a78bfa', pct: 68 },
        { name: 'Gen. Awareness', color: '#34d399', pct: 62 },
        { name: 'Gen. Science', color: '#fb923c', pct: 58 },
      ],
      overallPct: 60,
      gradient: 'from-[#2d1b69] via-[#4a2d9c] to-[#6d3fd6]',
      examDate: '2026-11-25',
    };

  if (n.includes('ssc cgl') || n.includes('ssc-cgl'))
    return {
      subtitle: 'Tier I Examination',
      vacancies: '17,727 Vacancies',
      notification: 'Jun 2026',
      region: 'All India',
      duration: '60 min',
      marks: '200 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 58 },
        { name: 'Reasoning', color: '#a78bfa', pct: 68 },
        { name: 'English', color: '#34d399', pct: 75 },
        { name: 'Gen. Studies', color: '#fb923c', pct: 55 },
      ],
      overallPct: 63,
      gradient: 'from-[#1a4d2e] via-[#1e6b3c] to-[#22c55e]',
      examDate: '2026-09-20',
    };

  if (n.includes('ssc chsl') || n.includes('ssc-chsl'))
    return {
      subtitle: 'Tier I Examination',
      vacancies: '3,712 Vacancies',
      notification: 'Jul 2026',
      region: 'All India',
      duration: '60 min',
      marks: '200 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 56 },
        { name: 'Reasoning', color: '#a78bfa', pct: 65 },
        { name: 'English', color: '#34d399', pct: 72 },
        { name: 'Gen. Studies', color: '#fb923c', pct: 52 },
      ],
      overallPct: 61,
      gradient: 'from-[#1a4d2e] via-[#1e6b3c] to-[#22c55e]',
      examDate: '2026-10-15',
    };

  if (n.includes('ssc mts') || n.includes('ssc-mts'))
    return {
      subtitle: 'Multi-Tasking Staff',
      vacancies: '8,326 Vacancies',
      notification: 'Sep 2026',
      region: 'All India',
      duration: '90 min',
      marks: '150 Marks',
      sections: [
        { name: 'Quantitative', color: '#38bdf8', pct: 55 },
        { name: 'Reasoning', color: '#a78bfa', pct: 62 },
        { name: 'English', color: '#34d399', pct: 68 },
        { name: 'Gen. Studies', color: '#fb923c', pct: 50 },
      ],
      overallPct: 58,
      gradient: 'from-[#1a4d2e] via-[#1e6b3c] to-[#22c55e]',
      examDate: '2026-11-30',
    };

  if (n.includes('upsc'))
    return {
      subtitle: 'Preliminary Examination',
      vacancies: '979 Vacancies',
      notification: 'May 2026',
      region: 'All India',
      duration: '120 min',
      marks: '200 Marks',
      sections: [
        { name: 'History', color: '#38bdf8', pct: 55 },
        { name: 'Geography', color: '#a78bfa', pct: 62 },
        { name: 'Polity', color: '#34d399', pct: 70 },
        { name: 'Current Affairs', color: '#fb923c', pct: 48 },
      ],
      overallPct: 58,
      gradient: 'from-[#4a1942] via-[#7b1f6e] to-[#c026d3]',
      examDate: '2026-08-20',
    };

  return {
    subtitle: 'Upcoming Examination',
    vacancies: 'Multiple Vacancies',
    notification: '2026',
    region: 'All India',
    duration: '60 min',
    marks: '100 Marks',
    sections: [
      { name: 'Quantitative', color: '#38bdf8', pct: 60 },
      { name: 'Reasoning', color: '#a78bfa', pct: 65 },
      { name: 'English', color: '#34d399', pct: 72 },
      { name: 'Gen. Awareness', color: '#fb923c', pct: 52 },
    ],
    overallPct: 62,
    gradient: 'from-[#1a3a6e] via-[#1e4fa0] to-[#2563eb]',
    examDate: '2026-12-31',
  };
};

// Responsive sizes: use smaller values on mobile via a viewport-aware approach
const CircularProgress: React.FC<{
  pct: number;
  color: string;
  label: string;
  size?: number;
  mobileSize?: number;
  strokeWidth?: number;
}> = ({ pct, color, label, size = 90, mobileSize, strokeWidth = 7 }) => {
  // Use CSS custom properties via inline style for responsive sizing
  const displaySize = mobileSize ?? Math.round(size * 0.78);
  const r = (size - strokeWidth * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      {/* Wrapper scales the SVG via CSS on mobile */}
      <div
        className="relative shrink-0"
        style={{
          width: size,
          height: size,
          '--mobile-size': `${displaySize}px`,
        } as React.CSSProperties}
      >
        {/* Track */}
        <svg width={size} height={size} className="-rotate-90 absolute inset-0" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#e2e8f0" strokeWidth={strokeWidth + 1}
          />
        </svg>
        {/* Progress */}
        <svg width={size} height={size} className="-rotate-90 absolute inset-0" viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)` }}
          />
        </svg>
        {/* Percentage inside */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="font-bold text-slate-800" style={{ fontSize: Math.round(size * 0.15) }}>{pct}%</span>
        </div>
      </div>
      <span className="text-[10px] font-medium text-slate-600 text-center leading-tight">{label}</span>
    </div>
  );
};

// Responsive hook-free approach: render two sizes and show/hide via CSS
const ResponsiveCircles: React.FC<{
  sections: { name: string; color: string; pct: number }[];
  overallPct: number;
  labelOverall: string;
}> = ({ sections, overallPct, labelOverall }) => (
  <>
    {/* Mobile layout: smaller circles in a horizontal scroll row */}
    <div className="flex md:hidden flex-wrap items-end gap-3 mb-4">
      <CircularProgress pct={overallPct} color="#10b981" label={labelOverall} size={80} strokeWidth={7} />
      <div className="w-px h-14 bg-slate-200 self-center" />
      {sections.map((s) => (
        <CircularProgress key={s.name} pct={s.pct} color={s.color} label={s.name} size={64} strokeWidth={6} />
      ))}
    </div>
    {/* Desktop layout: original sizes */}
    <div className="hidden md:flex flex-wrap items-end gap-5 mb-5">
      <CircularProgress pct={overallPct} color="#10b981" label={labelOverall} size={112} strokeWidth={9} />
      <div className="h-20 w-px bg-slate-200 self-center" />
      {sections.map((s) => (
        <CircularProgress key={s.name} pct={s.pct} color={s.color} label={s.name} size={88} strokeWidth={7} />
      ))}
    </div>
  </>
);

const TargetExamCard: React.FC<TargetExamCardProps> = ({
  targetExam,
  examCategory,
  userName,
  preparationStartDate,
  liveOverallPct,
}) => {
  const navigate = useNavigate();
  const meta = getExamMeta(targetExam);
  const mockRoute = getTargetExamRoute(targetExam);

  const daysLeft = (() => {
    try {
      const d = differenceInDays(new Date(meta.examDate), new Date());
      return d > 0 ? d : null;
    } catch {
      return null;
    }
  })();

  // ── Unified slide state: slot 0 = Days Left, slots 1..n = active ads ──────
  const [ads, setAds] = useState<AdBanner[]>([]);
  const [slideIdx, setSlideIdx] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const impressionTracked = useRef<Set<string>>(new Set());

  const loadAds = useCallback(() => {
    // Pass full student context so exam-level targeting works correctly
    const examId = targetExam
      ? `${examCategory.toLowerCase()}-${targetExam.toLowerCase().replace(/\s+/g, '-')}`
      : undefined;
    setAds(getActiveAds(
      { categoryId: examCategory.toLowerCase() || undefined, examId },
      'days_left_panel',
    ));
  }, [examCategory, targetExam]);

  useEffect(() => {
    loadAds();
    const h = (e: StorageEvent) => { if (e.key === 'superadmin_ad_banners') loadAds(); };
    window.addEventListener('storage', h);
    return () => window.removeEventListener('storage', h);
  }, [loadAds]);

  // total slides = 1 (days-left) + ads.length
  const totalSlides = 1 + ads.length;

  // Record impression when an ad slide is shown
  useEffect(() => {
    if (slideIdx === 0) return;
    const ad = ads[slideIdx - 1];
    if (ad && !impressionTracked.current.has(ad.id)) {
      impressionTracked.current.add(ad.id);
      recordImpression(ad.id);
    }
  }, [slideIdx, ads]);

  // Auto-advance
  useEffect(() => {
    if (totalSlides <= 1) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    const currentAd = slideIdx > 0 ? ads[slideIdx - 1] : null;
    const ms = currentAd ? getSlideDuration(currentAd.adType) : 6000;
    timerRef.current = setTimeout(() => {
      setSlideIdx(prev => (prev + 1) % totalSlides);
    }, ms);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [slideIdx, totalSlides, ads]);

  // ── Guard: if active ads change (e.g. admin disables all ads),
  //    reset slideIdx to 0 so Days Left is always visible.
  //    Without this, slideIdx stays at 1+ while totalSlides drops to 1
  //    → Days Left gets opacity:0 and is stuck invisible forever.
  useEffect(() => {
    if (slideIdx >= totalSlides) {
      setSlideIdx(0);
    }
  }, [totalSlides]); // eslint-disable-line react-hooks/exhaustive-deps


  const goTo = (idx: number) => { setSlideIdx(idx); };
  const goPrev = () => setSlideIdx(prev => (prev - 1 + totalSlides) % totalSlides);
  const goNext = () => setSlideIdx(prev => (prev + 1) % totalSlides);

  const handleAdClick = (ad: AdBanner) => {
    recordClick(ad.id);
    if (ad.ctaUrl) {
      ad.ctaUrl.startsWith('/') ? (window.location.href = ad.ctaUrl) : window.open(ad.ctaUrl, '_blank', 'noopener,noreferrer');
    }
  };

  // Current ad (null for slide 0)
  const currentAd = slideIdx > 0 ? ads[slideIdx - 1] : null;

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* ── Main card row: stacks on mobile, side-by-side on md+ ── */}
      <div className="bg-white flex flex-col md:flex-row">
        {/* ── LEFT: all content ── */}
        <div className="flex-1 min-w-0">
          {/* Top gradient accent */}
          <div className={`h-1.5 bg-gradient-to-r ${meta.gradient}`} />

        <div className="p-5 sm:p-6">

          {/* Header: icon + exam name */}
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-sm flex-shrink-0">
              <Target className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Target Examination</span>
              <h2 className="text-2xl font-bold text-slate-900 leading-tight">
                {targetExam.toUpperCase()}
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">{meta.subtitle} • {meta.vacancies}</p>
            </div>
          </div>

          {/* Exam meta pills */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-5 text-xs text-slate-600">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium">{new Date(meta.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5 text-slate-400" />
              <span className="font-medium">{meta.duration} • {meta.marks}</span>
            </div>
          </div>

          {/* ── Circles Row: responsive via ResponsiveCircles ── */}
          <ResponsiveCircles
            sections={meta.sections}
            overallPct={liveOverallPct !== undefined && liveOverallPct > 0 ? liveOverallPct : meta.overallPct}
            labelOverall={liveOverallPct !== undefined && liveOverallPct > 0 ? 'Your Score' : 'Overall'}
          />

          {/* Action Buttons — wrap on small screens */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary/90 text-white font-semibold px-4 py-2 gap-2 rounded-xl text-xs shadow-sm"
              onClick={() => navigate(mockRoute)}
            >
              <Play className="h-3.5 w-3.5" />
              Start Full Mock
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-slate-700 border-slate-200 font-medium px-4 py-2 gap-2 rounded-xl text-xs hover:bg-slate-50"
              onClick={() => navigate('/student/syllabus')}
            >
              <BookOpen className="h-3.5 w-3.5" />
              View Syllabus
            </Button>

            <Button
              size="sm"
              variant="outline"
              className="text-slate-700 border-slate-200 font-medium px-4 py-2 gap-2 rounded-xl text-xs hover:bg-slate-50"
              onClick={() => navigate('/student/performance-analytics')}
            >
              <TrendingUp className="h-3.5 w-3.5" />
              Score Prediction
            </Button>
          </div>
        </div>
        </div>{/* ── end flex-1 left section ── */}

        {/* ── RIGHT: Unified slide container (Days Left + Ads) ── */}
        {/*
          KEY LAYOUT RULES:
          - Container always has the Days-Left gradient bg (ads overlay on top via absolute)
          - self-stretch ensures it fills the full row height from flexbox
          - min-h-[220px] gives absolute children a real height to fill
          - Slides are absolute inset-0 and use opacity for transitions
        */}
        {/*
          RIGHT PANEL:
          - Mobile: full-width horizontal banner (h-36)
          - md+: sidebar (w-80, self-stretch)
        */}
        <div
          className="flex-shrink-0 w-full md:w-80 h-44 md:h-auto md:self-stretch relative overflow-hidden group select-none"
          style={{ background: 'linear-gradient(160deg, #1e40af 0%, #0ea5e9 35%, #10b981 100%)' }}
        >
          {/* ── Slide 0: Days Left ── */}
          <div
            className="absolute inset-0 flex flex-col items-center justify-center text-white transition-opacity duration-500"
            style={{ opacity: slideIdx === 0 ? 1 : 0, pointerEvents: slideIdx === 0 ? 'auto' : 'none' }}
          >
            {/* Decorative blobs */}
            <div className="absolute -top-6 -right-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-20 h-20 bg-white/10 rounded-full" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 border border-white/10 rounded-full" />
            <div className="relative z-10 flex flex-col items-center">
              <div
                className="text-5xl sm:text-7xl font-black leading-none mb-1.5 drop-shadow-md"
                style={{ fontFamily: "'Outfit', sans-serif", textShadow: '0 2px 12px rgba(0,0,0,0.2)' }}
              >
                {daysLeft !== null ? daysLeft : '—'}
              </div>
              <div className="text-[11px] sm:text-[13px] font-bold uppercase tracking-widest opacity-90 text-center px-2">
                {daysLeft !== null ? 'Days Left' : 'TBA'}
              </div>
              <div className="mt-2 w-10 h-0.5 bg-white/40 rounded-full" />
              <div className="mt-1.5 text-[9px] sm:text-[10px] opacity-70 tracking-wide font-medium">
                to exam day
              </div>
            </div>
          </div>

          {/* ── Slides 1..n: Ads ── */}
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
              {/* Full-cover background image — object-contain so never cropped */}
              {ad.imageDataUrl && (
                <img
                  src={ad.imageDataUrl}
                  alt={ad.title || 'Ad'}
                  className="absolute inset-0 w-full h-full object-cover"
                  draggable={false}
                />
              )}

              {/*
                AD CONTENT LAYOUT:
                IMAGE-ONLY MODE (no title): clean image, subtle dark bottom strip for CTA only.
                TEXT MODE (title set): full 3-zone layout with gradient overlay.
              */}
              {ad.title ? (
                // ── TEXT MODE: gradient overlay + 3-zone layout ──────────────
                <>
                  {ad.imageDataUrl && <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/10 to-black/65" />}
                  <div className="relative z-10 flex flex-col h-full">
                    {/* Zone 1 — type badge */}
                    <div className="pt-3 px-3 shrink-0">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-white/70 bg-black/25 px-2 py-0.5 rounded-full">
                        {ad.adType === 'exam' ? '🎯 Exam' : ad.adType === 'course' ? '📚 Course' : ad.adType === 'announcement' ? '📢 News' : '🔥 Offer'}
                      </span>
                    </div>
                    {/* Zone 2 — title + subtitle centered */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-2 gap-1.5">
                      <p className="font-black text-white text-sm leading-tight line-clamp-4"
                        style={{ fontFamily: "'Outfit', sans-serif", textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                        {ad.title}
                      </p>
                      {ad.subtitle && (
                        <p className="text-white/80 text-[10px] leading-snug line-clamp-2" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                          {ad.subtitle}
                        </p>
                      )}
                    </div>
                    {/* Zone 3 — CTA pinned at bottom */}
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
                // ── IMAGE-ONLY MODE: no text overlay, clean image ─────────────
                // Just a subtle dark bottom strip so CTA button is readable
                ad.ctaText && (
                  <>
                    <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-black/60 to-transparent z-10" />
                    <div className="absolute bottom-2 left-0 right-0 z-20 flex justify-center" style={{ bottom: ads.length > 0 ? '1.75rem' : '0.5rem' }}>
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

          {/* ── Navigation (only when there are actual ads) ── */}
          {ads.length > 0 && (
            <>
              {/* Prev / Next arrows — show on hover */}
              <button
                type="button"
                onClick={goPrev}
                className="absolute left-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronLeft className="h-3 w-3" />
              </button>
              <button
                type="button"
                onClick={goNext}
                className="absolute right-1 top-1/2 -translate-y-1/2 w-6 h-6 bg-white/20 backdrop-blur-sm hover:bg-white/40 text-white rounded-full flex items-center justify-center z-20 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ChevronRight className="h-3 w-3" />
              </button>

              {/* Dot indicators — pinned at very bottom */}
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1 z-30">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => goTo(idx)}
                    className={`rounded-full transition-all duration-300 ${
                      idx === slideIdx ? 'w-4 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>

      </div>{/* ── end bg-white flex row ── */}
    </div>
  );
};

export default TargetExamCard;
