import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  ArrowRight
} from 'lucide-react';
import { examNotifications } from '@/data/examNotificationData';

const examLogos: Record<string, string> = {
  ibps: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
  sbi: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  rrb: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  ssc: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
  upsc: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  rbi: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  default: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
};

const getLogo = (name: string) => {
  const n = name.toLowerCase();
  if (n.includes('ibps')) return examLogos.ibps;
  if (n.includes('sbi')) return examLogos.sbi;
  if (n.includes('rrb') || n.includes('railway')) return examLogos.rrb;
  if (n.includes('ssc')) return examLogos.ssc;
  if (n.includes('upsc')) return examLogos.upsc;
  if (n.includes('rbi') || n.includes('nabard')) return examLogos.rbi;
  return examLogos.default;
};

const statusConfig = {
  new:         { label: 'Applications Open', color: 'bg-emerald-500/15 text-emerald-600 border-emerald-500/30', dot: 'bg-emerald-500' },
  apply:       { label: 'Apply Now',          color: 'bg-sky-500/15 text-sky-600 border-sky-500/30',             dot: 'bg-sky-500' },
  applied:     { label: 'Applied',            color: 'bg-violet-500/15 text-violet-600 border-violet-500/30',    dot: 'bg-violet-500' },
  declared:    { label: 'Result Out',         color: 'bg-amber-500/15 text-amber-600 border-amber-500/30',       dot: 'bg-amber-500' },
};

/**
 * Compact dashboard section: show the latest 5 exam notifications as rich cards.
 */
const RecentExamNotifications: React.FC = () => {
  const navigate = useNavigate();

  // Take latest 5 relevant (new/apply) exams first, then others
  const sorted = [...examNotifications].sort((a, b) => {
    const priority = (e: typeof a) =>
      e.notificationStatus === 'new' ? 0 : e.applyStatus === 'new' ? 1 : e.applyStatus === 'apply' ? 2 : 3;
    return priority(a) - priority(b);
  });
  const visible = sorted.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-5 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-1 h-5 bg-primary rounded-full" />
          <Bell className="h-5 w-5 text-primary" />
          <h3 className="font-semibold text-base text-slate-800">Recent Exam Notifications</h3>
        </div>
        <Button
          variant="ghost"
          className="text-primary hover:text-primary/80 hover:bg-primary/10 text-sm font-medium pr-0 pt-0 pb-0 h-auto"
          onClick={() => navigate('/student/exam-notifications')}
        >
          View All <ArrowRight className="h-4 w-4 ml-1" />
        </Button>
      </div>

      {/* List View */}
      <div className="flex flex-col gap-2.5 px-5 pb-5 w-full overflow-x-auto min-w-[500px]">
        {visible.map((exam, index) => {
          // Status mapping
          const isNew = exam.notificationStatus === 'new';
          
          // Screenshot specific alternating background colors
          const bgClass = index % 2 === 0 ? 'bg-[#f0f4f8]' : 'bg-[#e2e8f0]';

          return (
            <div
              key={exam.id}
              className={`flex items-center justify-between p-3.5 pr-6 rounded-2xl cursor-pointer hover:brightness-95 transition-all ${bgClass}`}
              onClick={() => navigate('/student/exam-notifications')}
            >
              {/* Left Side */}
              <div className="flex items-center gap-4">
                {/* Document Icon Box */}
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                </div>
                
                {/* Information */}
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="font-semibold text-[13px] text-slate-800 leading-none">{exam.examName}</h4>
                    {isNew && (
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded uppercase tracking-wider">
                        NEW
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 font-medium tracking-wide">
                    Apply: {exam.applicationPeriod.startDate || "01/06/2025"} - {exam.applicationPeriod.endDate}
                    <span className="mx-2 text-slate-300">•</span>
                    {exam.vacancies.toLocaleString()} Vacancies
                    <span className="mx-2 text-slate-300">•</span>
                    {exam.qualification}
                  </p>
                </div>
              </div>

              {/* Right Side */}
              <div className="flex items-center gap-5 shrink-0">
                 <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-teal-500/20 bg-teal-500/10">
                   <div className="w-1.5 h-1.5 rounded-full bg-teal-600" />
                   <span className="text-[11px] font-semibold text-teal-700">Applications Open</span>
                 </div>
                 <span className="font-bold text-sm text-slate-800 hover:text-sky-600 transition-colors cursor-pointer block w-10 text-right">
                   Apply
                 </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RecentExamNotifications;
