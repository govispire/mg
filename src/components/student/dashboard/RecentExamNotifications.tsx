import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, ExternalLink, CalendarDays, Users } from 'lucide-react';
import { examNotifications } from '@/data/examNotificationData';
import {
  SBI_LOGO, IBPS_LOGO, SSC_LOGO, RAILWAY_LOGO,
  NIACL_LOGO, UPSC_LOGO,
} from '@/data/examData';

// ── Brand colour ────────────────────────────────────────────────────────────
const EM = '#10b981';

const RBI_LOGO    = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp';
const LIC_LOGO    = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png';
const IAS_LOGO    = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png';
const IDBI_LOGO   = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125078/idbi.png_lyvlvv.webp';

const LOGO_MAP: Record<string, string> = {
  'ibps-po-2025': IBPS_LOGO, 'ibps-clerk-2025': IBPS_LOGO, 'rrb-po-2025': IBPS_LOGO,
  'rrb-clerk-2025': IBPS_LOGO, 'iob-lbo-2025': SBI_LOGO, 'idbi-jam-2025': IDBI_LOGO,
  'sbi-po-2025': SBI_LOGO, 'sbi-clerk-2025': SBI_LOGO,
  'lic-aao-2025': LIC_LOGO, 'niacl-ao-2025': NIACL_LOGO,
  'rbi-grade-b-2025': RBI_LOGO, 'nabard-grade-a-2025': RBI_LOGO,
  'ssc-cgl-2025': SSC_LOGO, 'ssc-chsl-2025': SSC_LOGO, 'ssc-mts-2025': SSC_LOGO, 'ssc-gd-2025': SSC_LOGO,
  'rrb-ntpc-2025': RAILWAY_LOGO, 'rrb-group-d-2025': RAILWAY_LOGO, 'rrb-je-2025': RAILWAY_LOGO,
  'upsc-cse-2025': IAS_LOGO, 'upsc-cds-2025': IAS_LOGO, 'upsc-capf-2025': IAS_LOGO,
  'nda-2025': IAS_LOGO, 'afcat-2025': UPSC_LOGO,
  'tnpsc-group-2-2025': IAS_LOGO, 'tnpsc-group-4-2025': IAS_LOGO,
  'mppsc-2025': IAS_LOGO, 'uppsc-2025': IAS_LOGO,
};

const getInitials = (name: string) => {
  const words = name.replace(/\d{4}$/, '').trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// ── Exam Logo ───────────────────────────────────────────────────────────────
const ExamLogo: React.FC<{ examId: string; examName: string }> = ({ examId, examName }) => {
  const [imgFailed, setImgFailed] = React.useState(false);
  const logoUrl = LOGO_MAP[examId];

  if (!logoUrl || imgFailed) {
    return (
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-[11px] shrink-0"
        style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
      >
        {getInitials(examName)}
      </div>
    );
  }
  return (
    <div className="w-10 h-10 rounded-xl border border-slate-100 bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-sm">
      <img src={logoUrl} alt={examName} className="w-full h-full object-contain p-1" onError={() => setImgFailed(true)} />
    </div>
  );
};

// ── Main ────────────────────────────────────────────────────────────────────
const RecentExamNotifications: React.FC = () => {
  const navigate = useNavigate();

  const sorted = [...examNotifications].sort((a, b) => {
    const priority = (e: typeof a) =>
      e.notificationStatus === 'new' ? 0 : e.applyStatus === 'new' ? 1 : e.applyStatus === 'apply' ? 2 : 3;
    return priority(a) - priority(b);
  });

  const visible = sorted.slice(0, 5);

  return (
    <div
      className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col"
      style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06)' }}
    >
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <Bell className="h-4 w-4" style={{ color: EM }} />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-slate-800 leading-none">Recent Exam Notifications</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Updated in real-time ·</p>
          </div>
        </div>
        <button
          className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all shrink-0"
          style={{ color: EM, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}
          onClick={() => navigate('/student/exam-notifications')}
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Rows ── */}
      <div className="divide-y divide-slate-100 flex-1">
        {visible.map((exam, idx) => {
          const isNew = exam.notificationStatus === 'new' || exam.applyStatus === 'new';
          const hasEndDate = !!exam.applicationPeriod.endDate;

          // Format apply date string — "Apply starting DD/MM/YYYY" or with range
          const applyLine = hasEndDate
            ? `Apply starting ${exam.applicationPeriod.startDate} - ${exam.applicationPeriod.endDate}`
            : `Apply starting ${exam.applicationPeriod.startDate}`;

          return (
            <div
              key={exam.id}
              className="flex items-center gap-3 px-4 py-3.5 transition-all cursor-pointer hover:bg-slate-50/70"
              onClick={() => navigate('/student/exam-notifications')}
            >
              {/* Logo */}
              <ExamLogo examId={exam.id} examName={exam.examName} />

              {/* Centre content */}
              <div className="flex-1 min-w-0">
                {/* Name + NEW badge */}
                <div className="flex items-center gap-2 mb-0.5">
                  <span className="font-bold text-[13px] text-slate-800 truncate">{exam.examName}</span>
                  {isNew && (
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none text-white shrink-0"
                      style={{ background: EM }}
                    >
                      NEW
                    </span>
                  )}
                </div>

                {/* Apply date */}
                <p className="text-[11px] text-slate-500 leading-snug">{applyLine}</p>

                {/* Vacancies + Qualification */}
                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                  <span className="text-[11px] font-bold" style={{ color: EM }}>
                    {exam.vacancies.toLocaleString()} Vacancies
                  </span>
                  {exam.qualification && (
                    <>
                      <span className="text-slate-300 text-[10px]">•</span>
                      <span className="text-[10px] text-slate-400">{exam.qualification}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Apply Now button */}
              <button
                className="shrink-0 text-[11px] font-bold px-4 py-2 rounded-xl transition-all text-white hover:opacity-90 active:scale-95 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                onClick={(e) => { e.stopPropagation(); navigate('/student/exam-notifications'); }}
              >
                Apply Now
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Footer ── */}
      <div
        className="flex items-center justify-center gap-2 py-3 border-t border-slate-100 text-[12px] font-semibold cursor-pointer transition-colors hover:bg-slate-50"
        style={{ color: EM }}
        onClick={() => navigate('/student/exam-notifications')}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View All Exam Notifications
      </div>
    </div>
  );
};

export default RecentExamNotifications;
