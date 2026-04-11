import React, { useEffect, useState } from 'react';
import { Calendar, TrendingUp, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  UpcomingExamEntry,
  getUpcomingExams,
  daysUntil,
  formatDisplayDate,
} from '@/data/upcomingExamsStore';

/* ── Cloudinary logo map (fallback by exam name keywords) ── */
const examLogos: Record<string, string> = {
  ibps:  'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
  sbi:   'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  rrb:   'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  ssc:   'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
  upsc:  'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  rbi:   'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  nabard:'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
};

const getLogoByName = (name: string): string => {
  const n = name.toLowerCase();
  if (n.includes('ibps'))                    return examLogos.ibps;
  if (n.includes('sbi'))                     return examLogos.sbi;
  if (n.includes('rrb') || n.includes('railway')) return examLogos.rrb;
  if (n.includes('ssc'))                     return examLogos.ssc;
  if (n.includes('upsc'))                    return examLogos.upsc;
  if (n.includes('rbi'))                     return examLogos.rbi;
  if (n.includes('nabard'))                  return examLogos.nabard;
  return '';
};

/* ── Logo resolver — stored logo → catalog → name map ── */
const resolveLogo = (exam: UpcomingExamEntry): string => {
  if (exam.logo) return exam.logo;
  try {
    const raw = localStorage.getItem('superadmin_exam_catalog');
    if (raw) {
      const catalog: { sections: { exams: { id: string; name: string; logo: string }[] }[] }[] = JSON.parse(raw);
      const nameLower = exam.examName.toLowerCase();
      for (const cat of catalog)
        for (const sec of cat.sections)
          for (const e of sec.exams)
            if (e.name.toLowerCase() === nameLower || e.id === nameLower.replace(/\s+/g, '-'))
              if (e.logo) return e.logo;
    }
  } catch { /* ignore */ }
  // Final fallback: match by keyword
  return getLogoByName(exam.examName);
};

/* ── Component ───────────────────────────────────────── */
export const UpcomingExamsWidget: React.FC = () => {
  const [exams, setExams] = useState<UpcomingExamEntry[]>([]);

  const loadExams = () => {
    const active = getUpcomingExams()
      .filter(e => e.isActive)
      .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
    setExams(active);
  };

  useEffect(() => {
    loadExams();
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'superadmin_upcoming_exams' || e.key === 'superadmin_exam_catalog') loadExams();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  if (exams.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5">

      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
          </div>
          <h3 className="font-bold text-[17px] text-slate-800">Upcoming Exams</h3>
        </div>
        <Link
          to="/student/exam-notifications"
          className="text-[12px] font-semibold text-emerald-600 hover:text-emerald-700 flex items-center gap-1"
        >
          View All <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Cards row */}
      <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-1">
        {exams.map((exam) => {
          const days = daysUntil(exam.examDate);
          const logo = resolveLogo(exam);
          const daysLabel = days < 0 ? 'Past' : days === 0 ? 'Today!' : `${days} DAYS LEFT`;

          return (
            <Link
              key={exam.id}
              to={`/student/tests/${exam.category}`}
              className="group shrink-0 w-48 flex flex-col bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 overflow-hidden"
            >
              {/* Green top accent bar */}
              <div className="h-[4px] w-full bg-emerald-500 rounded-t-2xl" />

              <div className="flex flex-col items-center text-center px-4 pt-5 pb-5 gap-3">

                {/* Logo box */}
                <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-center overflow-hidden shadow-sm">
                  {logo ? (
                    <img src={logo} alt={exam.examName} className="w-12 h-12 object-contain" />
                  ) : (
                    <Calendar className="h-7 w-7 text-slate-400" />
                  )}
                </div>

                {/* Name + Stage */}
                <div>
                  <p className="font-bold text-[15px] text-slate-800 leading-snug group-hover:text-emerald-600 transition-colors">
                    {exam.examName}
                  </p>
                  {exam.stage && (
                    <p className="text-[12px] text-slate-500 mt-0.5">{exam.stage}</p>
                  )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                  <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                  <span>{formatDisplayDate(exam.examDate)}</span>
                </div>

                {/* Days left pill — solid green */}
                <div className="w-full bg-emerald-500 hover:bg-emerald-600 transition-colors rounded-full px-3 py-2 flex items-center justify-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-white opacity-90 shrink-0" />
                  <span className="text-white font-black text-[13px] tracking-wide uppercase whitespace-nowrap">
                    {daysLabel}
                  </span>
                </div>

              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default UpcomingExamsWidget;
