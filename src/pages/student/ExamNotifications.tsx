
import React, { useState, useEffect, useMemo } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import ExamApplicationDialog from '@/components/student/ExamApplicationDialog';
import {
  Search, Bell, ChevronDown, ChevronUp,
  Calendar, Clock, MapPin, Building2, GraduationCap,
  ExternalLink, Download, CheckCircle, FileText,
  Train, Landmark, Shield, TrendingUp, Users, BookOpen,
} from 'lucide-react';
import {
  ExamAlertEntry, ExamStatusType,
  getExamAlerts, formatAlertDate,
} from '@/data/examAlertsStore';

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

// ── Category helpers ─────────────────────────────────────────────────────────
function getCategoryLabel(categoryIds: string[]): string {
  const p = categoryIds[0] || '';
  if (p.includes('banking')) return 'Banking Exam';
  if (p.includes('ssc')) return 'SSC Exam';
  if (p.includes('railway') || p.includes('rrb')) return 'Railway Exam';
  if (p.includes('upsc') || p.includes('civil')) return 'UPSC Exam';
  if (p.includes('defence')) return 'Defence Exam';
  if (p.includes('insurance')) return 'Insurance Exam';
  if (p.includes('regulatory')) return 'Regulatory Exam';
  return 'Gov. Exam';
}

function getCategoryIcon(categoryIds: string[]) {
  const p = categoryIds[0] || '';
  if (p.includes('banking') || p.includes('insurance')) return <Building2 className="h-3.5 w-3.5" />;
  if (p.includes('ssc')) return <GraduationCap className="h-3.5 w-3.5" />;
  if (p.includes('railway') || p.includes('rrb')) return <Train className="h-3.5 w-3.5" />;
  if (p.includes('upsc') || p.includes('civil')) return <Landmark className="h-3.5 w-3.5" />;
  if (p.includes('defence')) return <Shield className="h-3.5 w-3.5" />;
  if (p.includes('regulatory')) return <TrendingUp className="h-3.5 w-3.5" />;
  return <BookOpen className="h-3.5 w-3.5" />;
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
  'application-open':    { label: 'Applications Open',    dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50',  border: 'border-emerald-200', actionLabel: 'Apply',    actionBg: 'bg-emerald-600 hover:bg-emerald-700 text-white', actionKey: 'applicationForm' },
  'notification-released':{ label: 'Notification Released', dot: 'bg-blue-500',    text: 'text-blue-700',    bg: 'bg-blue-50',     border: 'border-blue-200',    actionLabel: 'View',     actionBg: 'bg-blue-600 hover:bg-blue-700 text-white',     actionKey: 'notificationPdf' },
  'hall-ticket-out':     { label: 'Hall Ticket',           dot: 'bg-violet-500',  text: 'text-violet-700',  bg: 'bg-violet-50',   border: 'border-violet-200',  actionLabel: 'Download', actionBg: 'bg-violet-600 hover:bg-violet-700 text-white', actionKey: 'admitCardDownload' },
  'prelims-result-out':  { label: 'Prelims Result',        dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   actionLabel: 'Result',   actionBg: 'bg-amber-500 hover:bg-amber-600 text-white',   actionKey: 'resultPage' },
  'mains-result-out':    { label: 'Mains Result',          dot: 'bg-amber-500',   text: 'text-amber-700',   bg: 'bg-amber-50',    border: 'border-amber-200',   actionLabel: 'Result',   actionBg: 'bg-amber-500 hover:bg-amber-600 text-white',   actionKey: 'resultPage' },
  'overall-result-out':  { label: 'Result Out',            dot: 'bg-orange-500',  text: 'text-orange-700',  bg: 'bg-orange-50',   border: 'border-orange-200',  actionLabel: 'Result',   actionBg: 'bg-orange-500 hover:bg-orange-600 text-white', actionKey: 'resultPage' },
  'waiting-list-out':    { label: 'Waiting List',          dot: 'bg-slate-500',   text: 'text-slate-600',   bg: 'bg-slate-50',    border: 'border-slate-200',   actionLabel: 'Check',    actionBg: 'bg-slate-600 hover:bg-slate-700 text-white',   actionKey: 'resultPage' },
  'upcoming':            { label: 'Upcoming',              dot: 'bg-sky-500',     text: 'text-sky-700',     bg: 'bg-sky-50',      border: 'border-sky-200',     actionLabel: null,       actionBg: null,                                           actionKey: null },
};

// ── Tabs ─────────────────────────────────────────────────────────────────────
const TABS = [
  { key: 'all',               label: 'All',               icon: Bell,        filter: (_e: ExamAlertEntry) => true },
  { key: 'application-open',  label: 'Applications Open', icon: FileText,    filter: (e: ExamAlertEntry) => e.statusType === 'application-open' },
  { key: 'upcoming',          label: 'Upcoming',          icon: Calendar,    filter: (e: ExamAlertEntry) => e.statusType === 'upcoming' || e.statusType === 'notification-released' },
  { key: 'admit-card',        label: 'Admit Card',        icon: Download,    filter: (e: ExamAlertEntry) => e.statusType === 'hall-ticket-out' },
  { key: 'result-out',        label: 'Result Out',        icon: CheckCircle, filter: (e: ExamAlertEntry) => ['prelims-result-out','mains-result-out','overall-result-out','waiting-list-out'].includes(e.statusType) },
];

// ── Main component ───────────────────────────────────────────────────────────
const ExamNotifications: React.FC = () => {
  const [alerts, setAlerts] = useState<ExamAlertEntry[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean; examName: string;
    actionType: 'notification' | 'apply' | 'result'; url: string;
  }>({ isOpen: false, examName: '', actionType: 'apply', url: '' });

  useEffect(() => { setAlerts(getExamAlerts().filter(e => e.isActive)); }, []);

  // Listen for changes from superadmin (same tab storage event)
  useEffect(() => {
    const onStorage = () => setAlerts(getExamAlerts().filter(e => e.isActive));
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const activeTabObj = TABS.find(t => t.key === activeTab)!;

  const filtered = useMemo(() => {
    let list = alerts.filter(activeTabObj.filter);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(e =>
        e.examName.toLowerCase().includes(q) ||
        e.organisation.toLowerCase().includes(q) ||
        getCategoryLabel(e.categoryIds).toLowerCase().includes(q)
      );
    }
    return list;
  }, [alerts, activeTab, searchQuery]);

  const tabCounts = useMemo(() =>
    Object.fromEntries(TABS.map(t => [t.key, alerts.filter(t.filter).length]))
  , [alerts]);

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
    <div className="space-y-6 max-w-7xl mx-auto">

      {/* ── Search Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search exams by name or organisation..."
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="flex items-center overflow-x-auto scrollbar-hide border-b border-gray-100">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const count = tabCounts[tab.key] ?? 0;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px flex-shrink-0 ${
                  active
                    ? 'border-emerald-500 text-emerald-700'
                    : 'border-transparent text-gray-500 hover:text-gray-800 hover:border-gray-200'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className={`inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 text-[11px] font-bold rounded-full ${
                  active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                }`}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Exam List ── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Bell className="h-12 w-12 text-gray-300 mb-3" />
            <p className="font-medium text-gray-500">No exams found</p>
            <p className="text-sm text-gray-400 mt-1">{searchQuery ? 'Try a different search term.' : 'No exams in this category yet.'}</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map(entry => {
              const cfg = STATUS_CONFIG[entry.statusType];
              const isOpen = expandedId === entry.id;

              return (
                <div key={entry.id}>
                  {/* Collapsed Row */}
                  <div className={`flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors ${isOpen ? 'bg-gray-50' : ''}`}>

                    {/* Exam Logo */}
                    <div className="w-10 h-10 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0 overflow-hidden border border-gray-200">
                      <img
                        src={getExamLogo(entry)}
                        alt={entry.examName}
                        className="w-8 h-8 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-bold text-gray-900">{entry.examName}</span>
                        {entry.isNew && <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 h-4 rounded">NEW</Badge>}
                        {entry.isHot && <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 h-4 rounded">HOT</Badge>}
                      </div>
                      <div className="flex items-center gap-4 text-[12px] text-gray-500">
                        <span className="flex items-center gap-1">
                          {getCategoryIcon(entry.categoryIds)}
                          {getCategoryLabel(entry.categoryIds)}
                        </span>
                        <span className="flex items-center gap-1">
                          <GraduationCap className="h-3.5 w-3.5" />
                          {entry.qualification}
                        </span>
                        <span className="font-medium text-gray-600">Posts: {entry.vacancies.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border text-[12px] font-medium flex-shrink-0 ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                      {cfg.label}
                    </div>

                    {/* Action Button */}
                    {cfg.actionLabel && cfg.actionKey && (
                      <button
                        onClick={e => { e.stopPropagation(); openLink(entry, cfg.actionKey!, cfg.actionKey === 'applicationForm' ? 'apply' : cfg.actionKey === 'resultPage' ? 'result' : 'notification'); }}
                        className={`hidden sm:inline-flex items-center justify-center px-4 py-1.5 text-xs font-semibold rounded-full flex-shrink-0 transition-colors ${cfg.actionBg}`}
                      >
                        {cfg.actionLabel}
                      </button>
                    )}

                    {/* Chevron */}
                    <button
                      onClick={() => setExpandedId(isOpen ? null : entry.id)}
                      className="p-1.5 rounded-full hover:bg-gray-200 transition-colors flex-shrink-0 text-gray-400"
                    >
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isOpen && (
                    <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                      {/* Info Chips */}
                      <div className="flex flex-wrap gap-2 mb-4">
                        {(entry.applicationStartDate !== 'TBA') && (
                          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 shadow-sm">
                            <Calendar className="h-3.5 w-3.5 text-gray-400" />
                            <span className="text-gray-400">Apply Window:</span>
                            <span className="font-semibold">{formatAlertDate(entry.applicationStartDate)} – {formatAlertDate(entry.applicationEndDate)}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 shadow-sm">
                          <Clock className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-400">Exam Date:</span>
                          <span className="font-semibold">{entry.examDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 shadow-sm">
                          <MapPin className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-400">Location:</span>
                          <span className="font-semibold">{entry.location}</span>
                        </div>
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-600 shadow-sm">
                          <Building2 className="h-3.5 w-3.5 text-gray-400" />
                          <span className="text-gray-400">Organisation:</span>
                          <span className="font-semibold">{entry.organisation}</span>
                        </div>
                      </div>

                      {/* Description */}
                      {entry.description && (
                        <div className="border-l-4 border-emerald-500 pl-4 mb-4 bg-white rounded-r-lg py-2.5 pr-3">
                          <p className="text-sm text-gray-700 leading-relaxed">{entry.description}</p>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {entry.urls.applicationForm && (
                          <button
                            onClick={() => openLink(entry, 'applicationForm', 'apply')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <CheckCircle className="h-3.5 w-3.5" /> Apply Now
                          </button>
                        )}
                        {entry.urls.notificationPdf && (
                          <button
                            onClick={() => openLink(entry, 'notificationPdf', 'notification')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <ExternalLink className="h-3.5 w-3.5" /> Official Notification
                          </button>
                        )}
                        {entry.urls.admitCardDownload && (
                          <button
                            onClick={() => openLink(entry, 'admitCardDownload', 'notification')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Download className="h-3.5 w-3.5" /> Download Admit Card
                          </button>
                        )}
                        {entry.urls.resultPage && (
                          <button
                            onClick={() => openLink(entry, 'resultPage', 'result')}
                            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-lg transition-colors"
                          >
                            <FileText className="h-3.5 w-3.5" /> View Result
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Dialog */}
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
