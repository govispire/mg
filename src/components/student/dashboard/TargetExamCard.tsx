import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Play,
  BookOpen,
  Calendar,
  MapPin,
  Clock,
  Target,
  TrendingUp,
  Bell
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

  const journeyDays = preparationStartDate
    ? Math.max(0, differenceInDays(new Date(), new Date(preparationStartDate)))
    : 0;

  return (
    <div
      className={`relative rounded-xl overflow-hidden bg-white text-slate-900 border border-slate-200 shadow-sm h-full flex flex-col md:flex-row`}
      style={{ minHeight: 220 }}
    >
      {/* Left Content Area */}
      <div className="relative z-10 p-5 md:p-7 flex-1 flex flex-col justify-between">
        <div>
          {/* Top Header Label */}
          <div className="flex items-center gap-2 mb-1">
            <Target className="h-4 w-4 text-emerald-600 shrink-0" strokeWidth={2.5} />
            <span className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
              Target Examination
            </span>
          </div>
          
          {/* Title & Subtitle */}
          <h2 className="text-3xl md:text-[34px] font-bold leading-tight tracking-tight mb-8 text-slate-900">
            {targetExam.toUpperCase()}
          </h2>

          {/* Progress Bars Section */}
          <div className="space-y-4 pr-0 lg:pr-6">
            {/* Overall */}
            <div>
              <div className="flex items-center justify-between text-xs text-slate-600 font-medium mb-2">
                <span>Overall Preparation</span>
                <span className="font-bold text-slate-900">{meta.overallPct}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-1000"
                  style={{ width: `${meta.overallPct}%` }}
                />
              </div>
            </div>

            {/* Section-wise Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-3 pt-2">
              {meta.sections.map((s, idx) => {
                // Determine exact colors matching screenshot
                const colors = ['bg-sky-400', 'bg-violet-400', 'bg-orange-400', 'bg-emerald-400'];
                const barColor = colors[idx % colors.length];

                return (
                  <div key={s.name}>
                    <div className="flex items-center justify-between text-[11px] text-slate-600 font-medium mb-1.5">
                      <span>{s.name}</span>
                      <span className="font-bold text-slate-900">{s.pct}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${barColor} rounded-full`}
                        style={{ width: `${s.pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3 mt-6">
          <Button
            size="sm"
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium px-4 py-4 gap-2 rounded-lg shadow-sm"
            onClick={() => navigate(mockRoute)}
          >
            <Play className="h-3.5 w-3.5" />
            Start Full Mock
          </Button>

          <Button
            size="sm"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-4 py-4 gap-2 rounded-lg shadow-sm"
            onClick={() => navigate('/student/syllabus')}
          >
            <BookOpen className="h-3.5 w-3.5" />
            View Syllabus
          </Button>

          <Button
            size="sm"
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium px-4 py-4 gap-2 rounded-lg shadow-sm"
            onClick={() => navigate('/student/performance-analytics')}
          >
            <TrendingUp className="h-3.5 w-3.5" />
            Score Prediction
          </Button>
        </div>
      </div>

      {/* Right Side Days Left Panel */}
      <div className="hidden md:flex flex-col items-center justify-center p-6 bg-slate-50 border border-slate-200 rounded-[16px] m-6 min-w-[130px] shadow-sm h-fit self-start shrink-0">
        <div className="text-center">
          <div className="text-[44px] font-bold leading-none text-emerald-600 tracking-tight mb-0.5">
            {daysLeft !== null ? daysLeft : '—'}
          </div>
          <div className="text-[11px] font-medium text-slate-500 mb-3 tracking-wide">
            {daysLeft !== null ? 'Days Left' : 'TBA'}
          </div>
          <div className="w-12 h-px bg-slate-200 mx-auto mb-3" />
          <div className="text-[10px] text-slate-500 font-medium mb-0.5">
            Exam Date
          </div>
          <div className="text-xs font-bold text-slate-900">
            {new Date(meta.examDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TargetExamCard;
