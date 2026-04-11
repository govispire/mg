import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Calendar, ChevronRight, TrendingUp } from 'lucide-react';
import {
  UpcomingExamEntry,
  getUpcomingExams,
  daysUntil,
  formatDisplayDate,
} from '@/data/upcomingExamsStore';

// ── Days-left badge — always solid emerald-500 to match Upcoming Exams cards ──
const getDaysColor = (_days: number) => ({
  bg: 'bg-emerald-500',
  text: 'text-white',
  dot: 'bg-white',
});

// Tag badge for exams based on urgency
const getTagLabel = (days: number): { label: string; className: string } | null => {
  if (days < 0)  return { label: 'Past',          className: 'bg-slate-100 text-slate-500' };
  if (days <= 3)  return { label: '🔥 Hot',         className: 'bg-red-100 text-red-600' };
  if (days <= 14) return { label: '⏰ Closing',     className: 'bg-amber-100 text-amber-700' };
  if (days <= 60) return { label: '✨ Coming Soon', className: 'bg-blue-100 text-blue-700' };
  return null;
};

export const TrendingExams: React.FC = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState<UpcomingExamEntry[]>([]);

  // Load from SuperAdmin-managed store on mount
  useEffect(() => {
    const all = getUpcomingExams();
    const active = all
      .filter(e => e.isActive)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    setExams(active);
  }, []);

  const handleExamClick = (exam: UpcomingExamEntry) => {
    navigate(`/student/tests/${exam.category}/${exam.id.replace('upcoming-', '')}`);
  };

  if (exams.length === 0) return null;

  return (
    <Card className="p-4 bg-white border border-slate-200 shadow-md rounded-2xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-emerald-500 rounded-lg">
            <TrendingUp className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-base">Upcoming Exams</h3>
        </div>
        <button
          onClick={() => navigate('/student/exam-alerts')}
          className="flex items-center gap-1 text-xs text-emerald-600 font-semibold hover:text-emerald-700 hover:underline"
        >
          View All
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Horizontally scrollable exam cards */}
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {exams.map((exam) => {
          const days = daysUntil(exam.examDate);
          const color = getDaysColor(days);
          const tag = getTagLabel(days);

          return (
            <button
              key={exam.id}
              onClick={() => handleExamClick(exam)}
              className="flex-shrink-0 w-36 flex flex-col items-center gap-2 p-3 rounded-xl border border-border bg-white dark:bg-card hover:bg-primary/5 hover:border-primary/40 hover:shadow-md transition-all duration-200 group text-center"
            >
              {/* Logo box */}
              <div className="w-16 h-16 flex items-center justify-center rounded-2xl bg-muted/50 border border-border/60 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                {exam.logo ? (
                  <img
                    src={exam.logo}
                    alt={exam.examName}
                    className="w-12 h-12 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp';
                    }}
                  />
                ) : (
                  <span className="text-2xl">📚</span>
                )}
              </div>

              {/* Exam Name */}
              <p className="text-xs font-semibold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors w-full">
                {exam.examName}
                {exam.stage && (
                  <span className="block text-[10px] font-normal text-muted-foreground mt-0.5">
                    {exam.stage}
                  </span>
                )}
              </p>

              {/* Date line */}
              <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                <Calendar className="h-3 w-3 flex-shrink-0" />
                <span>{formatDisplayDate(exam.examDate)}</span>
              </div>

              {/* ── Days left counter (LARGER) ── */}
              {days >= 0 ? (
                <div className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-full px-3 py-2 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white opacity-90 shrink-0" />
                  <span className="text-white font-black text-[12px] tracking-wide uppercase whitespace-nowrap">
                    {days === 0 ? 'Today!' : `${days} DAYS LEFT`}
                  </span>
                </div>
              ) : tag ? (
                <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full w-full text-center ${tag.className}`}>
                  {tag.label}
                </span>
              ) : null}

              {/* Tag badge overlay for non-past exams */}
              {days > 0 && tag && (
                <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${tag.className}`}>
                  {tag.label}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Footer note */}
      <p className="text-[10px] text-muted-foreground mt-3 text-right">
        ✓ Live data · updated by admin
      </p>
    </Card>
  );
};
