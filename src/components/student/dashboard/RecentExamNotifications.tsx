import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Bell,
  ExternalLink,
  ChevronRight,
  Calendar,
  Users,
  Clock,
  TrendingUp,
  CheckCircle,
  AlertCircle,
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
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-red-500/10 rounded-lg">
            <Bell className="h-4 w-4 text-red-500" />
          </div>
          <div>
            <h3 className="font-semibold text-sm text-foreground">Recent Exam Notifications</h3>
            <p className="text-[11px] text-muted-foreground">Latest govt exam updates & alerts</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-primary hover:text-primary gap-1 h-7"
          onClick={() => navigate('/student/exam-notifications')}
        >
          View All <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3">
        {visible.map((exam) => {
          const cfg =
            exam.resultStatus === 'declared'
              ? statusConfig.declared
              : exam.applyStatus === 'new'
              ? statusConfig.new
              : exam.applyStatus === 'apply'
              ? statusConfig.apply
              : statusConfig.applied;

          return (
            <Card
              key={exam.id}
              className="relative overflow-hidden border border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group p-0"
              onClick={() => navigate('/student/exam-notifications')}
            >
              {/* Top accent bar */}
              <div
                className={`h-1 w-full ${
                  exam.notificationStatus === 'new'
                    ? 'bg-gradient-to-r from-red-500 to-orange-400'
                    : exam.applyStatus === 'new'
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    : exam.resultStatus === 'declared'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400'
                    : 'bg-gradient-to-r from-sky-500 to-blue-400'
                }`}
              />

              <div className="p-3.5">
                {/* Logo + name */}
                <div className="flex items-start gap-2.5 mb-2.5">
                  <div className="w-9 h-9 rounded-lg bg-muted/50 border border-border/50 flex items-center justify-center shrink-0 overflow-hidden">
                    <img
                      src={getLogo(exam.examName)}
                      alt={exam.examName}
                      className="w-7 h-7 object-contain"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-foreground leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                      {exam.examName}
                    </p>
                    {exam.notificationStatus === 'new' && (
                      <span className="inline-block mt-0.5 text-[9px] font-bold bg-red-500 text-white px-1.5 py-0 rounded-sm uppercase">NEW</span>
                    )}
                  </div>
                </div>

                {/* Stats */}
                <div className="space-y-1.5 mb-3">
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Users className="h-3 w-3 shrink-0 text-primary/70" />
                    <span className="font-medium text-foreground">{exam.vacancies.toLocaleString()}</span>
                    <span>vacancies</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Calendar className="h-3 w-3 shrink-0 text-emerald-500/80" />
                    <span>Apply: <span className="text-foreground font-medium">{exam.applicationPeriod.endDate}</span></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <Clock className="h-3 w-3 shrink-0 text-amber-500/80" />
                    <span>Exam: <span className="text-foreground font-medium">{exam.examDate}</span></span>
                  </div>
                </div>

                {/* Status badge */}
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-1 rounded-full border ${cfg.color}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`} />
                  {cfg.label}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default RecentExamNotifications;
