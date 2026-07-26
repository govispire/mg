import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ExamApplicationDialog from '@/components/student/ExamApplicationDialog';
import {
  Search, Bell, ChevronDown, ChevronUp,
  Calendar, Clock, MapPin, Building2, GraduationCap,
  ExternalLink, Download, CheckCircle, FileText,
  Train, Landmark, Shield, TrendingUp, Users, BookOpen, Radio,
  Bookmark, BookmarkCheck, Filter, ArrowUpRight, Zap
} from 'lucide-react';
import {
  ExamAlertEntry, ExamStatusType,
  getExamAlerts, saveExamAlerts, formatAlertDate,
  EXAM_CATEGORY_OPTIONS, QUALIFICATION_OPTIONS
} from '@/data/examAlertsStore';
import { useAllExamStages, getDaysLeft } from '@/hooks/useExamStages';

// ── Exam logo helpers ───────────────────────────────────────────────────────
const EXAM_LOGOS: Record<string, string> = {
  'banking':          'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'banking-insurance':'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'ibps':             'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
  'sbi':              'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'rrb':              'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'ssc':              'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
  'railway':          'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'railways-rrb':     'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'upsc':             'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  'civil-services':   'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  'rbi':              'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  'regulatory':       'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  'defence':          'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
};

function getExamLogo(entry: ExamAlertEntry): string {
  const n = entry.examName.toLowerCase();
  if (n.includes('ibps')) return EXAM_LOGOS['ibps'];
  if (n.includes('sbi')) return EXAM_LOGOS['sbi'];
  if (n.includes('rrb') || n.includes('railway')) return EXAM_LOGOS['railway'];
  if (n.includes('ssc')) return EXAM_LOGOS['ssc'];
  if (n.includes('upsc')) return EXAM_LOGOS['upsc'];
  if (n.includes('rbi')) return EXAM_LOGOS['rbi'];
  for (const cat of entry.categoryIds) {
    if (EXAM_LOGOS[cat]) return EXAM_LOGOS[cat];
  }
  return EXAM_LOGOS['banking'];
}

function getCategoryLabel(categoryIds: string[]): string {
  const p = categoryIds[0] || '';
  if (p.includes('banking')) return 'Banking & Insurance';
  if (p.includes('ssc')) return 'SSC';
  if (p.includes('railway') || p.includes('rrb')) return 'Railways';
  if (p.includes('upsc') || p.includes('civil')) return 'UPSC / IAS';
  if (p.includes('defence')) return 'Defence';
  if (p.includes('state')) return 'State PSC';
  return 'Gov. Exam';
}

function getCategoryIcon(categoryIds: string[]) {
  const p = categoryIds[0] || '';
  if (p.includes('banking') || p.includes('insurance')) return <Building2 className="h-3.5 w-3.5 text-blue-600" />;
  if (p.includes('ssc')) return <GraduationCap className="h-3.5 w-3.5 text-indigo-600" />;
  if (p.includes('railway') || p.includes('rrb')) return <Train className="h-3.5 w-3.5 text-amber-600" />;
  if (p.includes('upsc') || p.includes('civil')) return <Landmark className="h-3.5 w-3.5 text-purple-600" />;
  if (p.includes('defence')) return <Shield className="h-3.5 w-3.5 text-emerald-600" />;
  return <BookOpen className="h-3.5 w-3.5 text-slate-600" />;
}

// Helper to calculate days left for deadline
function getApplicationDaysLeft(endDateStr: string): number | null {
  if (!endDateStr || endDateStr === 'TBA') return null;
  try {
    const end = new Date(endDateStr + 'T23:59:59');
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 ? diff : null;
  } catch {
    return null;
  }
}

// ── Status config ────────────────────────────────────────────────────────────
interface StatusConfig {
  label: string;
  dot: string;
  text: string;
  bg: string;
  border: string;
  actionLabel: string | null;
  actionBg: string | null;
  actionKey: keyof ExamAlertEntry['urls'] | null;
}

const STATUS_CONFIG: Record<ExamStatusType, StatusConfig> = {
  'application-open':     { label: 'Applications Open',     dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-300', actionLabel: 'Apply',    actionBg: 'bg-emerald-600 hover:bg-emerald-700 text-white',    actionKey: 'applicationForm' },
  'notification-released':{ label: 'Notification Released', dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-300',    actionLabel: 'View',     actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',     actionKey: 'notificationPdf' },
  'hall-ticket-out':      { label: 'Hall Ticket',           dot: 'bg-violet-500',  text: 'text-violet-700',  bg: 'bg-violet-50',   border: 'border-violet-300',  actionLabel: 'Download', actionBg: 'bg-violet-600 hover:bg-violet-700 text-white', actionKey: 'admitCardDownload' },
  'prelims-result-out':   { label: 'Prelims Result',        dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300',   actionLabel: 'Result',   actionBg: 'bg-orange-500 hover:bg-orange-600 text-white', actionKey: 'resultPage' },
  'mains-result-out':     { label: 'Mains Result',          dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300',   actionLabel: 'Result',   actionBg: 'bg-orange-500 hover:bg-orange-600 text-white', actionKey: 'resultPage' },
  'overall-result-out':   { label: 'Result Out',            dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-300',   actionLabel: 'Result',   actionBg: 'bg-orange-500 hover:bg-orange-600 text-white', actionKey: 'resultPage' },
  'waiting-list-out':     { label: 'Waiting List',          dot: 'bg-slate-500',   text: 'text-slate-600',   bg: 'bg-slate-50',    border: 'border-slate-300',   actionLabel: 'Check',    actionBg: 'bg-slate-600 hover:bg-slate-700 text-white',   actionKey: 'resultPage' },
  'upcoming':             { label: 'Upcoming',              dot: 'bg-sky-500',     text: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-300',     actionLabel: null,       actionBg: null,                                           actionKey: null },
};

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',               label: 'All Alerts',        icon: Bell,        filter: (_e: ExamAlertEntry) => true },
  { key: 'application-open',  label: 'Applications Open', icon: FileText,    filter: (e: ExamAlertEntry) => e.statusType === 'application-open' },
  { key: 'upcoming',          label: 'Upcoming',          icon: Calendar,    filter: (e: ExamAlertEntry) => e.statusType === 'upcoming' || e.statusType === 'notification-released' },
  { key: 'admit-card',        label: 'Admit Card',        icon: Download,    filter: (e: ExamAlertEntry) => e.statusType === 'hall-ticket-out' },
  { key: 'result-out',        label: 'Result Out',        icon: CheckCircle, filter: (e: ExamAlertEntry) => ['prelims-result-out','mains-result-out','overall-result-out','waiting-list-out'].includes(e.statusType) },
];

const ExamNotifications: React.FC = () => {
  const [alerts, setAlerts] = useState<ExamAlertEntry[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedQualification, setSelectedQualification] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const [dialogState, setDialogState] = useState<{
    isOpen: boolean; examName: string;
    actionType: 'notification' | 'apply' | 'result'; url: string;
  }>({ isOpen: false, examName: '', actionType: 'apply', url: '' });

  // Live exam stages from SuperAdmin
  const { allStages } = useAllExamStages();
  const urgentStages = useMemo(() => {
    return allStages
      .filter(s => s.isVisible && s.date && s.status !== 'completed' && s.status !== 'cancelled')
      .map(s => ({ ...s, daysLeft: getDaysLeft(s.date) }))
      .filter(s => s.daysLeft !== null && s.daysLeft >= 0 && s.daysLeft <= 30)
      .sort((a, b) => (a.daysLeft ?? 0) - (b.daysLeft ?? 0));
  }, [allStages]);

  useEffect(() => { setAlerts(getExamAlerts().filter(e => e.isActive)); }, []);

  const activeTabObj = TABS.find(t => t.key === activeTab)!;

  const filteredAlerts = useMemo(() => {
    let list = alerts.filter(activeTabObj.filter);

    // Filter by Category
    if (selectedCategory !== 'all') {
      list = list.filter(e => e.categoryIds.some(c => c.includes(selectedCategory)));
    }

    // Filter by Qualification
    if (selectedQualification !== 'all') {
      list = list.filter(e => e.qualification.toLowerCase().includes(selectedQualification));
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.examName.toLowerCase().includes(q) ||
        e.organisation.toLowerCase().includes(q) ||
        getCategoryLabel(e.categoryIds).toLowerCase().includes(q)
      );
    }
    return list;
  }, [alerts, activeTab, selectedCategory, selectedQualification, searchQuery]);

  const openLink = (entry: ExamAlertEntry, key: keyof ExamAlertEntry['urls'], actionType: 'notification' | 'apply' | 'result') => {
    const url = entry.urls[key] || '';
    if (!url) return;
    setDialogState({ isOpen: true, examName: entry.examName, actionType, url });
  };

  const confirmLink = () => {
    window.open(dialogState.url, '_blank', 'noopener,noreferrer');
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── 1. HEADER TITLE ── */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Exam Alerts & Notifications</h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
          Stay updated with official notification releases, deadlines, admit cards, and results.
        </p>
      </div>

      {/* ── 2. LIVE STAGE ALERT BANNER ── */}
      {urgentStages.length > 0 && (
        <div className="bg-gradient-to-r from-red-50 to-amber-50 border border-red-200/90 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center gap-2 mb-3">
            <Radio className="h-4 w-4 text-red-600 animate-pulse" />
            <p className="text-sm font-black text-red-900">
              🚨 Upcoming Exam Stages in Next 30 Days
            </p>
            <span className="ml-auto text-[10px] font-bold text-red-700 bg-red-100 border border-red-200 px-2.5 py-0.5 rounded-full">
              {urgentStages.length} alert{urgentStages.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {urgentStages.map(stage => (
              <div key={stage.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-xs font-semibold
                ${stage.daysLeft === 0 ? 'bg-red-100 border-red-300 text-red-800' :
                  stage.daysLeft! <= 7 ? 'bg-orange-50 border-orange-200 text-orange-800' :
                  'bg-amber-50 border-amber-200 text-amber-800'}`}>
                <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="font-bold">{stage.name}</span>
                <span className="text-[10px] opacity-80 font-black">
                  {stage.daysLeft === 0 ? 'TODAY!' : `${stage.daysLeft}d left`}
                </span>
                {stage.date && (
                  <span className="text-[10px] opacity-70">
                    — {new Date(stage.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── 3. SEARCH & CATEGORY / QUALIFICATION FILTERS ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by exam name (IBPS PO, SSC CGL, SBI Clerk...)"
              className="w-full pl-10 pr-4 py-2.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all"
            />
          </div>

          {/* Qualification Filter */}
          <select
            value={selectedQualification}
            onChange={e => setSelectedQualification(e.target.value)}
            className="w-full md:w-56 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
          >
            {QUALIFICATION_OPTIONS.map(q => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>

        {/* Category Pill Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 pb-1 scrollbar-hide border-t border-slate-100">
          {EXAM_CATEGORY_OPTIONS.map(cat => (
            <button
              key={cat.value}
              onClick={() => setSelectedCategory(cat.value)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                selectedCategory === cat.value
                  ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                  : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 4. STATUS TAB NAVIGATION ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <div className="flex items-center overflow-x-auto scrollbar-hide border-b border-slate-100 px-3 pt-2">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3 text-xs sm:text-sm font-bold whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0 ${
                  active
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-slate-500 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* ── 5. REDESIGNED EXAM CARDS LIST ── */}
        {filteredAlerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-slate-300 mb-3" />
            <p className="font-extrabold text-slate-700">No exams found</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your category, qualification, or search query.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {filteredAlerts.map(entry => {
              const cfg = STATUS_CONFIG[entry.statusType];
              const isOpen = expandedId === entry.id;
              const daysLeft = getApplicationDaysLeft(entry.applicationEndDate);

              return (
                <div key={entry.id} className="transition-all hover:bg-slate-50/50">
                  {/* Card Container Header */}
                  <div className="p-5 space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                      {/* Logo + Exam Title + Category Badge */}
                      <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-slate-200/80 shadow-2xs">
                          <img
                            src={getExamLogo(entry)}
                            alt={entry.examName}
                            className="w-9 h-9 object-contain"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
                              {entry.examName}
                            </h3>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700 flex items-center gap-1">
                              {getCategoryIcon(entry.categoryIds)}
                              <span>{getCategoryLabel(entry.categoryIds)}</span>
                            </span>

                            {entry.isNew && <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full">NEW</span>}
                          </div>

                          {/* Critical Details Line: Posts • Eligibility (Age) • Location */}
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-semibold flex-wrap">
                            <span><strong className="text-slate-800 font-extrabold">Posts:</strong> {entry.vacancies.toLocaleString()}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <GraduationCap className="h-3.5 w-3.5 text-slate-400" />
                              <span>{entry.qualification} {entry.ageLimit ? `(${entry.ageLimit})` : ''}</span>
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5 text-slate-400" />
                              <span>{entry.location}</span>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action Controls: Status Pill + Action Button + Chevron (Matching screenshot) */}
                      <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
                        {/* Status Pill Badge */}
                        <div className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border text-xs font-bold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                          <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                          <span>{cfg.label}</span>
                        </div>

                        {/* Action Pill Button (Apply / Result / Download) */}
                        {cfg.actionLabel && cfg.actionKey && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openLink(entry, cfg.actionKey!, cfg.actionKey === 'applicationForm' ? 'apply' : cfg.actionKey === 'resultPage' ? 'result' : 'notification');
                            }}
                            className={`px-5 py-1.5 text-xs font-extrabold rounded-full transition-all shadow-2xs active:scale-95 whitespace-nowrap ${cfg.actionBg}`}
                          >
                            {cfg.actionLabel}
                          </button>
                        )}

                        {/* Chevron Toggle */}
                        <button
                          onClick={() => setExpandedId(isOpen ? null : entry.id)}
                          className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400 transition-colors ml-0.5"
                          title="Toggle Details"
                        >
                          {isOpen ? <ChevronUp className="h-4 w-4 text-slate-600" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Section (Dates, Description & Links shown within arrow) */}
                  {isOpen && (
                    <div className="px-5 py-4 bg-slate-50 border-t border-slate-100 space-y-4 animate-in fade-in-50 duration-200">
                      {/* Dates Summary Bar inside Arrow Expansion */}
                      <div className="flex flex-wrap gap-2.5">
                        {entry.applicationStartDate !== 'TBA' && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
                            <Calendar className="w-3.5 h-3.5 text-blue-600" />
                            <span className="text-slate-400 font-semibold">Apply Window:</span>
                            <span>{formatAlertDate(entry.applicationStartDate)} – {formatAlertDate(entry.applicationEndDate)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200/90 rounded-xl text-xs font-bold text-slate-700 shadow-2xs">
                          <Clock className="w-3.5 h-3.5 text-indigo-600" />
                          <span className="text-slate-400 font-semibold">Exam Date:</span>
                          <span>{entry.examDate}</span>
                        </div>

                        {daysLeft !== null && (
                          <div className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold border ${
                            daysLeft <= 3
                              ? 'bg-rose-50 border-rose-200 text-rose-700 animate-pulse'
                              : 'bg-amber-50 border-amber-200 text-amber-800'
                          }`}>
                            <Clock className="w-3.5 h-3.5" />
                            <span>{daysLeft === 0 ? 'Ends Today!' : `Ends in ${daysLeft} Days`}</span>
                          </div>
                        )}
                      </div>

                      {/* Description */}
                      <div className="border-l-4 border-blue-600 pl-4 py-1 bg-white rounded-r-xl border-y border-r border-slate-100 p-3 shadow-2xs">
                        <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                          {entry.description}
                        </p>
                      </div>

                      {/* Links */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                        {entry.urls.notificationPdf && (
                          <a
                            href={entry.urls.notificationPdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl hover:bg-slate-100 transition-all shadow-2xs"
                          >
                            <ExternalLink className="h-3.5 w-3.5 text-blue-600" />
                            <span>Official Notification (PDF)</span>
                          </a>
                        )}

                        <span className="text-xs text-slate-400 font-medium ml-auto">
                          Organisation: {entry.organisation}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Application Dialog */}
      <ExamApplicationDialog
        isOpen={dialogState.isOpen}
        onClose={() => setDialogState(p => ({ ...p, isOpen: false }))}
        examName={dialogState.examName}
        actionType={dialogState.actionType}
        url={dialogState.url}
        onConfirm={confirmLink}
      />
    </div>
  );
};

export default ExamNotifications;
