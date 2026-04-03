import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Play,
  BookOpen,
  Target,
  TrendingUp,
} from 'lucide-react';
import { getTargetExamRoute } from '@/utils/targetExamRoute';
import { differenceInDays } from 'date-fns';

interface TargetExamCardProps {
  targetExam: string;
  examCategory: string;
  userName: string;
  preparationStartDate: Date | null;
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

/** Map exam name patterns to metadata */
const getExamMeta = (exam: string): ExamMeta => {
  const n = exam.toLowerCase();

  if (n.includes('lic ado') || n.includes('lic-ado'))
    return {
      subtitle: 'Apprentice Development Officer',
      vacancies: '5,000+ Vacancies',
      notification: 'Mar 2026',
      region: 'All India',
      duration: '60 min',
      marks: '300 Marks',
      sections: [
        { name: 'Reasoning', color: 'bg-sky-500', pct: 68 },
        { name: 'Numeracy', color: 'bg-violet-500', pct: 72 },
        { name: 'English', color: 'bg-emerald-500', pct: 76 },
        { name: 'Gen. Knowledge', color: 'bg-amber-500', pct: 60 },
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
        { name: 'Reasoning', color: 'bg-sky-500', pct: 70 },
        { name: 'Quantitative', color: 'bg-violet-500', pct: 65 },
        { name: 'English', color: 'bg-emerald-500', pct: 78 },
        { name: 'Gen. Knowledge', color: 'bg-amber-500', pct: 55 },
      ],
      overallPct: 67,
      gradient: 'from-[#0f2b5b] via-[#1a4080] to-[#1d5c9e]',
      examDate: '2026-09-01',
    };

  if (n.includes('sbi clerk') || n.includes('sbi-clerk'))
    return {
      subtitle: 'Preliminary Examination',
      vacancies: '13,735 Vacancies',
      notification: 'Nov 2026',
      region: 'All India',
      duration: '60 min',
      marks: '100 Marks',
      sections: [
        { name: 'Quantitative', color: 'bg-sky-500', pct: 62 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 74 },
        { name: 'English', color: 'bg-emerald-500', pct: 78 },
        { name: 'Gen. Awareness', color: 'bg-amber-500', pct: 55 },
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
        { name: 'Quantitative', color: 'bg-sky-500', pct: 58 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 70 },
        { name: 'English', color: 'bg-emerald-500', pct: 72 },
        { name: 'Gen. Awareness', color: 'bg-amber-500', pct: 48 },
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
        { name: 'Quantitative', color: 'bg-sky-500', pct: 60 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 72 },
        { name: 'English', color: 'bg-emerald-500', pct: 76 },
        { name: 'Gen. Awareness', color: 'bg-amber-500', pct: 50 },
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
        { name: 'Quantitative', color: 'bg-sky-500', pct: 65 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 76 },
        { name: 'English', color: 'bg-emerald-500', pct: 80 },
        { name: 'Gen. Awareness', color: 'bg-amber-500', pct: 52 },
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
        { name: 'Quantitative', color: 'bg-sky-500', pct: 62 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 70 },
        { name: 'English', color: 'bg-emerald-500', pct: 65 },
        { name: 'Gen. Awareness', color: 'bg-amber-500', pct: 58 },
      ],
      overallPct: 64,
      gradient: 'from-[#1a2e5e] via-[#1e3f8c] to-[#2855c4]',
      examDate: '2026-10-05',
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
        { name: 'Economics', color: 'bg-sky-500', pct: 58 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 72 },
        { name: 'English', color: 'bg-emerald-500', pct: 75 },
        { name: 'Gen. Awareness', color: 'bg-amber-500', pct: 62 },
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
        { name: 'Mathematics', color: 'bg-sky-500', pct: 60 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 72 },
        { name: 'Gen. Awareness', color: 'bg-emerald-500', pct: 65 },
        { name: 'Gen. Science', color: 'bg-amber-500', pct: 50 },
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
        { name: 'Mathematics', color: 'bg-sky-500', pct: 55 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 68 },
        { name: 'Gen. Awareness', color: 'bg-emerald-500', pct: 62 },
        { name: 'Gen. Science', color: 'bg-amber-500', pct: 58 },
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
        { name: 'Quantitative', color: 'bg-sky-500', pct: 58 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 68 },
        { name: 'English', color: 'bg-emerald-500', pct: 75 },
        { name: 'Gen. Studies', color: 'bg-amber-500', pct: 55 },
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
        { name: 'Quantitative', color: 'bg-sky-500', pct: 56 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 65 },
        { name: 'English', color: 'bg-emerald-500', pct: 72 },
        { name: 'Gen. Studies', color: 'bg-amber-500', pct: 52 },
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
        { name: 'Quantitative', color: 'bg-sky-500', pct: 55 },
        { name: 'Reasoning', color: 'bg-violet-500', pct: 62 },
        { name: 'English', color: 'bg-emerald-500', pct: 68 },
        { name: 'Gen. Studies', color: 'bg-amber-500', pct: 50 },
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
        { name: 'History', color: 'bg-sky-500', pct: 55 },
        { name: 'Geography', color: 'bg-violet-500', pct: 62 },
        { name: 'Polity', color: 'bg-emerald-500', pct: 70 },
        { name: 'Current Affairs', color: 'bg-amber-500', pct: 48 },
      ],
      overallPct: 58,
      gradient: 'from-[#4a1942] via-[#7b1f6e] to-[#c026d3]',
      examDate: '2026-08-20',
    };

  // Default — always future so days left is always a real number
  return {
    subtitle: 'Upcoming Examination',
    vacancies: 'Multiple Vacancies',
    notification: '2026',
    region: 'All India',
    duration: '60 min',
    marks: '100 Marks',
    sections: [
      { name: 'Quantitative', color: 'bg-sky-500', pct: 60 },
      { name: 'Reasoning', color: 'bg-violet-500', pct: 65 },
      { name: 'English', color: 'bg-emerald-500', pct: 72 },
      { name: 'Gen. Awareness', color: 'bg-amber-500', pct: 52 },
    ],
    overallPct: 62,
    gradient: 'from-[#1a3a6e] via-[#1e4fa0] to-[#2563eb]',
    examDate: '2026-12-31',
  };
};

/* ─── Circular Donut Ring Component ─── */
const DonutRing: React.FC<{
  pct: number;
  color: string;
  label: string;
  size?: number;
  stroke?: number;
}> = ({ pct, color, label, size = 72, stroke = 7 }) => {
  const r = (size - stroke * 2) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="relative" style={{ width: size, height: size }}>
        {/* Track */}
        <svg width={size} height={size} className="-rotate-90" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none" stroke="#e2e8f0" strokeWidth={stroke}
          />
        </svg>
        {/* Progress */}
        <svg width={size} height={size} className="-rotate-90" style={{ position: 'absolute', top: 0, left: 0 }}>
          <circle
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            style={{ transition: `stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)` }}
          />
        </svg>
        {/* Label inside */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}
        >
          {pct}%
        </div>
      </div>
      <span className="text-[11px] text-slate-500 font-medium text-center leading-tight">{label}</span>
    </div>
  );
};

/* ─── Segmented Progress Bar ─── */
const SegmentedBar: React.FC<{ pct: number; color?: string }> = ({ pct, color = '#2563eb' }) => {
  const totalSegments = 18;
  const filledSegments = Math.round((pct / 100) * totalSegments);

  return (
    <div className="flex gap-1 items-center w-full">
      {Array.from({ length: totalSegments }).map((_, i) => (
        <div
          key={i}
          className="h-2.5 flex-1 rounded-sm"
          style={{
            background: i < filledSegments ? color : '#e2e8f0',
            transition: `background 0.05s ease ${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
};

/* ─── Section-color mapping (SVG-safe hex colors) ─── */
const SECTION_COLORS = ['#38bdf8', '#a78bfa', '#fb923c', '#34d399'];

const TargetExamCard: React.FC<TargetExamCardProps> = ({
  targetExam,
  examCategory,
  userName,
  preparationStartDate,
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

  return (
    <div
      className="relative rounded-2xl overflow-hidden bg-white text-slate-900 border border-slate-200 shadow-sm h-full flex flex-col md:flex-row"
      style={{ minHeight: 220 }}
    >
      {/* ── Left Content ── */}
      <div className="relative z-10 p-5 md:p-6 flex-1 flex flex-col gap-4">

        {/* Header row */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-3.5 w-3.5 text-emerald-600 shrink-0" strokeWidth={2.5} />
            <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
              Target Examination
            </span>
          </div>
          <h2 className="text-2xl md:text-[28px] font-bold leading-tight tracking-tight text-slate-900">
            {targetExam.toUpperCase()}
          </h2>
        </div>


        {/* Overall Preparation segmented bar */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[12px] font-semibold text-slate-700">Overall Preparation</span>
            <span className="text-[14px] font-bold text-emerald-600">{meta.overallPct}%</span>
          </div>
          <SegmentedBar pct={meta.overallPct} color="#10b981" />
        </div>

        {/* Circular donut rings for each subject */}
        <div className="flex gap-6 flex-wrap">
          {meta.sections.map((s, idx) => (
            <DonutRing
              key={s.name}
              pct={s.pct}
              color={SECTION_COLORS[idx % SECTION_COLORS.length]}
              label={s.name}
            />
          ))}
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5 mt-auto pt-1">
          <Button
            size="sm"
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 gap-2 rounded-lg shadow-sm"
            onClick={() => navigate(mockRoute)}
          >
            <Play className="h-3.5 w-3.5" />
            Start Full Mock
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-slate-700 border-slate-200 font-medium px-4 py-2 gap-2 rounded-lg hover:bg-slate-50"
            onClick={() => navigate('/student/syllabus')}
          >
            <BookOpen className="h-3.5 w-3.5" />
            View Syllabus
          </Button>

          <Button
            size="sm"
            variant="outline"
            className="text-slate-700 border-slate-200 font-medium px-4 py-2 gap-2 rounded-lg hover:bg-slate-50"
            onClick={() => navigate('/student/performance-analytics')}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Score Prediction
          </Button>
        </div>
      </div>

      {/* ── Right: Days Left Panel ── */}
      <div className="hidden md:flex flex-col items-center justify-center bg-slate-50 border-l border-slate-200 px-8 py-6 min-w-[148px] shrink-0 text-center rounded-r-2xl">
        {/* Giant day number */}
        <div
          className="font-black leading-none tracking-tight"
          style={{ fontSize: 64, color: '#10b981', lineHeight: 1 }}
        >
          {daysLeft !== null ? daysLeft : '—'}
        </div>
        <div className="text-[13px] font-semibold text-slate-500 mt-2 mb-4 tracking-wide">
          {daysLeft !== null ? 'Days Left' : 'TBA'}
        </div>
        <div className="w-10 h-px bg-slate-200 mb-4" />
        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">
          Exam Date
        </div>
        <div className="text-[13px] font-bold text-slate-900">
          {new Date(meta.examDate).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })}
        </div>
      </div>
    </div>
  );
};

export default TargetExamCard;

