import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, ExternalLink } from 'lucide-react';
import { examNotifications } from '@/data/examNotificationData';
import {
  SBI_LOGO, IBPS_LOGO, SSC_LOGO, RAILWAY_LOGO,
  NIACL_LOGO, UPSC_LOGO,
} from '@/data/examData';

// ── Brand colour ────────────────────────────────────────────────────────────
const EM = '#10b981';

// Cloudinary logos already used & proven throughout the app
const RBI_LOGO    = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp';
const LIC_LOGO    = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061919/jaiib_stprpj.png';
const IAS_LOGO    = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png';
const IDBI_LOGO   = 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125078/idbi.png_lyvlvv.webp';

// ── Exam logo map — keyed by exam id ────────────────────────────────────────
const LOGO_MAP: Record<string, string> = {
  // Banking — IBPS
  'ibps-po-2025':        IBPS_LOGO,
  'ibps-clerk-2025':     IBPS_LOGO,
  'rrb-po-2025':         IBPS_LOGO,
  'rrb-clerk-2025':      IBPS_LOGO,
  'iob-lbo-2025':        SBI_LOGO,
  'idbi-jam-2025':       IDBI_LOGO,
  // Banking — SBI
  'sbi-po-2025':         SBI_LOGO,
  'sbi-clerk-2025':      SBI_LOGO,
  // Insurance
  'lic-aao-2025':        LIC_LOGO,
  'niacl-ao-2025':       NIACL_LOGO,
  // Regulatory
  'rbi-grade-b-2025':    RBI_LOGO,
  'nabard-grade-a-2025': RBI_LOGO,
  // SSC
  'ssc-cgl-2025':        SSC_LOGO,
  'ssc-chsl-2025':       SSC_LOGO,
  'ssc-mts-2025':        SSC_LOGO,
  'ssc-gd-2025':         SSC_LOGO,
  // Railway
  'rrb-ntpc-2025':       RAILWAY_LOGO,
  'rrb-group-d-2025':    RAILWAY_LOGO,
  'rrb-je-2025':         RAILWAY_LOGO,
  // UPSC / Defence / Civil Services
  'upsc-cse-2025':       IAS_LOGO,
  'upsc-cds-2025':       IAS_LOGO,
  'upsc-capf-2025':      IAS_LOGO,
  'nda-2025':            IAS_LOGO,
  'afcat-2025':          UPSC_LOGO,
  // State PSC
  'tnpsc-group-2-2025':  IAS_LOGO,
  'tnpsc-group-4-2025':  IAS_LOGO,
  'mppsc-2025':          IAS_LOGO,
  'uppsc-2025':          IAS_LOGO,
};

// ── Initials fallback ──────────────────────────────────────────────────────
const getInitials = (name: string) => {
  const words = name.replace(/\d{4}$/, '').trim().split(/\s+/);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

// ── Status config — all unified to brand emerald ───────────────────────────
const statusConfig: Record<string, { label: string; dotColor: string; badgeBg: string; badgeText: string; badgeBorder: string }> = {
  new: {
    label: 'Applications Open',
    dotColor: EM,
    badgeBg: 'rgba(16,185,129,0.08)',
    badgeText: '#059669',
    badgeBorder: 'rgba(16,185,129,0.25)',
  },
  apply: {
    label: 'Apply Now',
    dotColor: EM,
    badgeBg: 'rgba(16,185,129,0.06)',
    badgeText: '#10b981',
    badgeBorder: 'rgba(16,185,129,0.2)',
  },
  applied: {
    label: 'Applied ✓',
    dotColor: '#6366f1',
    badgeBg: 'rgba(99,102,241,0.08)',
    badgeText: '#6366f1',
    badgeBorder: 'rgba(99,102,241,0.2)',
  },
  declared: {
    label: 'Result Out',
    dotColor: '#f59e0b',
    badgeBg: 'rgba(245,158,11,0.08)',
    badgeText: '#d97706',
    badgeBorder: 'rgba(245,158,11,0.2)',
  },
};

const getStatus = (exam: any) => {
  if (exam.notificationStatus === 'new' || exam.applyStatus === 'new') return statusConfig.new;
  if (exam.applyStatus === 'apply')    return statusConfig.apply;
  if (exam.applyStatus === 'applied')  return statusConfig.applied;
  if (exam.applyStatus === 'declared') return statusConfig.declared;
  return statusConfig.new;
};

// ── Exam Logo component ────────────────────────────────────────────────────
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
      <img
        src={logoUrl}
        alt={examName}
        className="w-full h-full object-contain p-1"
        onError={() => setImgFailed(true)}
      />
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────
const RecentExamNotifications: React.FC = () => {
  const navigate = useNavigate();

  // Sort: newest (notificationStatus='new') first, then by applyStatus, then rest
  const sorted = [...examNotifications].sort((a, b) => {
    const priority = (e: typeof a) =>
      e.notificationStatus === 'new' ? 0
      : e.applyStatus === 'new'     ? 1
      : e.applyStatus === 'apply'   ? 2
      : 3;
    return priority(a) - priority(b);
  });

  const visible = sorted.slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden h-full flex flex-col" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.04),0 4px 12px rgba(0,0,0,0.06)' }}>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5">
          <div
            className="w-8 h-8 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            <Bell className="h-4 w-4" style={{ color: EM }} />
          </div>
          <div>
            <h3 className="font-bold text-[15px] text-slate-800 leading-none">Recent Exam Notifications</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Updated in real-time · Sorted by latest</p>
          </div>
        </div>
        <button
          className="flex items-center gap-1 text-[12px] font-semibold px-3 py-1.5 rounded-lg transition-all"
          style={{ color: EM, background: 'rgba(16,185,129,0.07)', border: '1px solid rgba(16,185,129,0.18)' }}
          onClick={() => navigate('/student/exam-notifications')}
        >
          View All <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* ── Notification Rows ────────────────────────────────────────────── */}
      <div className="divide-y divide-slate-100 flex-1">
        {visible.map((exam, idx) => {
          const st = getStatus(exam);
          const isNew = exam.notificationStatus === 'new' || exam.applyStatus === 'new';
          const isVeryRecent = idx === 0; // top item is most recent

          return (
            <div
              key={exam.id}
              className="flex items-center gap-3 px-5 py-3.5 transition-all cursor-pointer"
              style={isVeryRecent ? { background: 'rgba(16,185,129,0.03)' } : undefined}
              onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.04)')}
              onMouseLeave={e => (e.currentTarget.style.background = isVeryRecent ? 'rgba(16,185,129,0.03)' : '')}
              onClick={() => navigate('/student/exam-notifications')}
            >
              {/* Logo */}
              <ExamLogo examId={exam.id} examName={exam.examName} />

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                  <span className="font-bold text-[13px] text-slate-800 truncate">{exam.examName}</span>
                  {isNew && (
                    <span
                      className="text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider leading-none text-white"
                      style={{ background: EM }}
                    >
                      NEW
                    </span>
                  )}
                  {isVeryRecent && (
                    <span
                      className="text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                      style={{ color: '#d97706', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)' }}
                    >
                      ⚡ Just Updated
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                  <span>Apply: {exam.applicationPeriod.startDate} – {exam.applicationPeriod.endDate}</span>
                  <span className="text-slate-300">•</span>
                  <span className="font-semibold" style={{ color: EM }}>{exam.vacancies.toLocaleString()} Vacancies</span>
                  <span className="text-slate-300">•</span>
                  <span>{exam.qualification}</span>
                </p>
              </div>

              {/* Status badge */}
              <div
                className="shrink-0 hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold"
                style={{ color: st.badgeText, background: st.badgeBg, border: `1px solid ${st.badgeBorder}` }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: st.dotColor }} />
                {st.label}
              </div>

              {/* Apply button */}
              <button
                className="shrink-0 text-[12px] font-bold px-3.5 py-1.5 rounded-lg transition-all text-white hover:opacity-90 active:scale-95"
                style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 2px 8px rgba(16,185,129,0.3)' }}
                onClick={(e) => { e.stopPropagation(); navigate('/student/exam-notifications'); }}
              >
                Apply
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-center gap-2 py-3 border-t border-slate-100 text-[12px] font-semibold cursor-pointer transition-colors"
        style={{ color: EM }}
        onClick={() => navigate('/student/exam-notifications')}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(16,185,129,0.04)')}
        onMouseLeave={e => (e.currentTarget.style.background = '')}
      >
        <ExternalLink className="h-3.5 w-3.5" />
        View All Exam Notifications
      </div>
    </div>
  );
};

export default RecentExamNotifications;
