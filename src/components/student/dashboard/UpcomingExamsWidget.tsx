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

const urgencyAccentBar = (days: number) => {
  if (days < 0) return '#94a3b8';
  if (days <= 30) return '#ef4444';
  if (days <= 90) return '#f59e0b';
  return '#10b981';
};

/** Resolve logo: prefer stored logo, fall back to catalog logo by exam name/id */
const resolveLogo = (exam: UpcomingExamEntry): string => {
  if (exam.logo) return exam.logo;
  try {
    const raw = localStorage.getItem('superadmin_exam_catalog');
    if (!raw) return '';
    const catalog: { sections: { exams: { id: string; name: string; logo: string }[] }[] }[] = JSON.parse(raw);
    const nameLower = exam.examName.toLowerCase();
    for (const cat of catalog) {
      for (const sec of cat.sections) {
        for (const e of sec.exams) {
          if (e.name.toLowerCase() === nameLower || e.id === nameLower.replace(/\s+/g, '-')) {
            return e.logo || '';
          }
        }
      }
    }
  } catch { /* ignore */ }
  return '';
};

export const UpcomingExamsWidget: React.FC = () => {
  const [exams, setExams] = useState<UpcomingExamEntry[]>([]);

  const loadExams = () => {
    const all = getUpcomingExams();
    const active = all
      .filter(e => e.isActive)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    setExams(active);
  };

  useEffect(() => {
    loadExams();
    // Re-fetch when admin updates storage
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'superadmin_upcoming_exams' || e.key === 'superadmin_exam_catalog') loadExams();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
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
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary/5 border border-primary/10 flex items-center justify-center text-2xl mb-3 shadow-sm">
              📅
            </div>
            <p className="text-[13px] font-bold text-slate-600">No upcoming exams</p>
            <p className="text-[11px] text-slate-400 mt-1">Check back after admin updates</p>
          </div>
        )}
        {exams.slice(0, 5).map((exam) => {
          const days = daysUntil(exam.examDate);
          const logo = resolveLogo(exam);
          return (
            <div
              key={exam.id}
              className="relative flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-primary/30 hover:bg-primary/5 overflow-hidden group cursor-pointer"
              style={{ transition: 'transform 0.15s ease, box-shadow 0.15s ease' }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(-1px)';
                el.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)';
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLElement;
                el.style.transform = 'translateY(0)';
                el.style.boxShadow = 'none';
              }}
            >
              {/* Left urgency accent bar */}
              <span
                className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl"
                style={{ background: urgencyAccentBar(days) }}
              />
              <div className="flex items-center gap-3 min-w-0 flex-1">
                {/* Logo or icon */}
                <div className="shrink-0 w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center overflow-hidden">
                  {logo ? (
                    <img src={logo} alt={exam.examName} className="w-6 h-6 object-contain" />
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
