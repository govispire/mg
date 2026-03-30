import React, { useEffect, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ChevronRight, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  UpcomingExamEntry,
  getUpcomingExams,
  daysUntil,
  formatDisplayDate,
} from '@/data/upcomingExamsStore';

// Urgency colour for countdown badge
const urgencyClass = (days: number) => {
  if (days < 0) return 'bg-slate-100 text-slate-500';
  if (days <= 30) return 'bg-red-50 text-red-600 border-red-200';
  if (days <= 90) return 'bg-amber-50 text-amber-700 border-amber-200';
  return 'bg-emerald-50 text-emerald-700 border-emerald-200';
};

const urgencyDot = (days: number) => {
  if (days < 0) return 'bg-slate-400';
  if (days <= 30) return 'bg-red-500 animate-pulse';
  if (days <= 90) return 'bg-amber-500';
  return 'bg-emerald-500';
};

export const UpcomingExamsWidget: React.FC = () => {
  const [exams, setExams] = useState<UpcomingExamEntry[]>([]);

  useEffect(() => {
    const all = getUpcomingExams();
    const active = all
      .filter(e => e.isActive)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    setExams(active);
  }, []);

  return (
    <Card className="p-5 bg-white border border-slate-200 shadow-sm rounded-2xl flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <h3 className="font-bold text-[15px] text-slate-800">Upcoming Exams</h3>
        </div>
        <span className="text-[11px] text-primary font-semibold bg-primary/10 border border-primary/20 px-2 py-0.5 rounded-full flex items-center gap-1">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
          </span>
          {exams.length} exams
        </span>
      </div>

      {/* Exam rows */}
      <div className="space-y-2.5 flex-1">
        {exams.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground text-sm">
            <Bell className="h-8 w-8 mb-2 opacity-30" />
            <p>No upcoming exams scheduled</p>
          </div>
        )}
        {exams.slice(0, 5).map((exam) => {
          const days = daysUntil(exam.examDate);
          return (
            <div
              key={exam.id}
              className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 transition-all group"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Logo or icon */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                  {exam.logo ? (
                    <img src={exam.logo} alt={exam.examName} className="w-6 h-6 object-contain" />
                  ) : (
                    <Calendar className="h-4 w-4 text-primary" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="font-semibold text-[12.5px] text-slate-800 truncate group-hover:text-primary transition-colors">
                      {exam.examName}
                    </p>
                    <span className="text-[10px] text-muted-foreground shrink-0">· {exam.stage}</span>
                  </div>
                  <div className="text-[10px] text-slate-500 flex items-center gap-2 mt-0.5">
                    <Calendar className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                    <span>{formatDisplayDate(exam.examDate)}</span>
                    {exam.registrationDeadline && (
                      <>
                        <span className="text-slate-300">•</span>
                        <Clock className="h-2.5 w-2.5 text-slate-400 shrink-0" />
                        <span>Reg. by {formatDisplayDate(exam.registrationDeadline)}</span>
                      </>
                    )}
                  </div>
                  {exam.note && (
                    <p className="text-[9px] text-primary/70 mt-0.5 truncate">{exam.note}</p>
                  )}
                </div>
              </div>

              {/* Countdown badge */}
              <div className={`shrink-0 ml-3 flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${urgencyClass(days)}`}>
                <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${urgencyDot(days)}`} />
                {days < 0 ? 'Past' : days === 0 ? 'Today!' : `${days}d`}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <Link
        to="/student/exam-alerts"
        className="mt-4 flex items-center justify-center gap-1 w-full py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary text-[13px] font-semibold transition-colors"
      >
        View All Exam Alerts <ChevronRight className="h-3.5 w-3.5" />
      </Link>
    </Card>
  );
};

export default UpcomingExamsWidget;
