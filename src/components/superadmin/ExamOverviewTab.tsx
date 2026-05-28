/**
 * ExamOverviewTab — Command Center Dashboard for a single exam
 * Shows: student engagement, content stats, recent activity, pending approvals, feedback
 */
import React, { useState, useEffect, useCallback } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import {
  Users, TrendingUp, Target, Trophy, Video, FileText, CheckCircle2,
  BookOpen, Clock, AlertTriangle, Activity, Star, Eye, EyeOff,
  Pencil, Check, BarChart3, MessageSquare, Bell, ChevronRight,
  ArrowUp, ArrowDown, Minus, RefreshCw, ThumbsUp, ThumbsDown,
  GraduationCap, Award, Zap, Shield,
} from 'lucide-react';
import { loadSyllabusStore } from '@/hooks/useSyllabusData';
import type { useExamCatalog } from '@/hooks/useExamCatalog';

// ─── Types ───────────────────────────────────────────────────────────────────

interface ExamStats {
  totalRegistered: number;
  activeLearners: number;
  primaryTarget: number;
  secondaryTarget: number;
  backupGoal: number;
  totalCleared: number;
}

interface AuditEntry {
  id: string;
  action: string;
  entityType: 'test' | 'pdf' | 'video' | 'stage' | 'story' | 'topic' | 'subject' | 'other';
  entityName: string;
  performedBy: string;
  timestamp: string;
  details?: string;
}

interface StudentFeedback {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
  category: 'test' | 'content' | 'platform' | 'general';
  showOnStudentPage: boolean;
  examId: string;
}

const STATS_KEY = (examId: string) => `examStats_${examId}`;
const AUDIT_KEY = (examId: string) => `examAuditLog_${examId}`;
const FEEDBACK_KEY = (examId: string) => `examFeedback_${examId}`;

function loadStats(examId: string): ExamStats {
  try {
    const raw = localStorage.getItem(STATS_KEY(examId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return { totalRegistered: 0, activeLearners: 0, primaryTarget: 0, secondaryTarget: 0, backupGoal: 0, totalCleared: 0 };
}
function saveStats(examId: string, s: ExamStats) {
  localStorage.setItem(STATS_KEY(examId), JSON.stringify(s));
}
export function loadAuditLog(examId: string): AuditEntry[] {
  try {
    const raw = localStorage.getItem(AUDIT_KEY(examId));
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}
export function appendAuditLog(examId: string, entry: Omit<AuditEntry, 'id' | 'timestamp'>) {
  const log = loadAuditLog(examId);
  log.unshift({ ...entry, id: `al_${Date.now()}`, timestamp: new Date().toISOString() });
  localStorage.setItem(AUDIT_KEY(examId), JSON.stringify(log.slice(0, 100)));
}
function loadFeedback(examId: string): StudentFeedback[] {
  try {
    const raw = localStorage.getItem(FEEDBACK_KEY(examId));
    if (raw) return JSON.parse(raw);
  } catch {}
  // Seed demo data
  return [
    { id: 'f1', studentName: 'Priya S.', rating: 5, comment: 'Excellent mock tests! The sectional tests are very helpful.', date: '2026-05-25', category: 'test', showOnStudentPage: true, examId },
    { id: 'f2', studentName: 'Rahul M.', rating: 4, comment: 'Good content but need more PYQ papers for Mains.', date: '2026-05-24', category: 'content', showOnStudentPage: true, examId },
    { id: 'f3', studentName: 'Anjali K.', rating: 5, comment: 'The video explanations are clear and concise. Loving it!', date: '2026-05-23', category: 'content', showOnStudentPage: false, examId },
    { id: 'f4', studentName: 'Suresh P.', rating: 3, comment: 'Some questions seem outdated. Please update the 2025 pattern.', date: '2026-05-22', category: 'test', showOnStudentPage: false, examId },
    { id: 'f5', studentName: 'Meena R.', rating: 5, comment: 'Best platform for SBI PO prep. Cleared prelims with 98%ile!', date: '2026-05-21', category: 'general', showOnStudentPage: true, examId },
  ];
}
function saveFeedback(examId: string, f: StudentFeedback[]) {
  localStorage.setItem(FEEDBACK_KEY(examId), JSON.stringify(f));
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatCard: React.FC<{
  label: string; value: number | string; icon: React.ReactNode;
  color: string; bg: string; border: string; trend?: 'up' | 'down' | 'flat';
  trendValue?: string; onClick?: () => void;
}> = ({ label, value, icon, color, bg, border, trend, trendValue, onClick }) => (
  <div onClick={onClick} className={`${bg} ${border} border rounded-xl p-4 flex items-start gap-3 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`}>
    <div className={`w-10 h-10 rounded-lg ${bg} flex items-center justify-center ${color} shrink-0 border ${border}`}>
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs text-muted-foreground font-medium">{label}</p>
      <p className={`text-2xl font-black ${color} leading-tight`}>{value}</p>
      {trend && trendValue && (
        <div className={`flex items-center gap-0.5 mt-0.5 text-[11px] font-semibold ${trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-rose-600' : 'text-slate-400'}`}>
          {trend === 'up' ? <ArrowUp className="h-3 w-3" /> : trend === 'down' ? <ArrowDown className="h-3 w-3" /> : <Minus className="h-3 w-3" />}
          {trendValue}
        </div>
      )}
    </div>
  </div>
);

const entityIcon: Record<string, React.ReactNode> = {
  test: <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />,
  pdf: <FileText className="h-3.5 w-3.5 text-rose-500" />,
  video: <Video className="h-3.5 w-3.5 text-blue-500" />,
  stage: <Clock className="h-3.5 w-3.5 text-amber-500" />,
  story: <Trophy className="h-3.5 w-3.5 text-amber-500" />,
  topic: <BookOpen className="h-3.5 w-3.5 text-indigo-500" />,
  subject: <GraduationCap className="h-3.5 w-3.5 text-violet-500" />,
  other: <Activity className="h-3.5 w-3.5 text-slate-400" />,
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  examId: string;
  examName: string;
  totalTests: number;
  visibleTests: number;
  successStoriesCount: number;
  pendingApprovalTests?: number;
}

const ExamOverviewTab: React.FC<Props> = ({
  examId, examName, totalTests, visibleTests, successStoriesCount, pendingApprovalTests = 0,
}) => {
  const [stats, setStats] = useState<ExamStats>(() => loadStats(examId));
  const [auditLog, setAuditLog] = useState<AuditEntry[]>(() => loadAuditLog(examId));
  const [feedback, setFeedback] = useState<StudentFeedback[]>(() => loadFeedback(examId));
  const [editStatsOpen, setEditStatsOpen] = useState(false);
  const [statsForm, setStatsForm] = useState<ExamStats>(stats);
  const [addFeedbackOpen, setAddFeedbackOpen] = useState(false);
  const [feedbackForm, setFeedbackForm] = useState({ studentName: '', rating: 5, comment: '', category: 'general' as StudentFeedback['category'] });

  // Load syllabus content stats
  const syllabusStats = React.useMemo(() => {
    const store = loadSyllabusStore();
    const doc = store[examId] as any;
    if (!doc?.tiers) return { topics: 0, videos: 0, pdfs: 0, syllabusTestes: 0, subjects: 0, stages: 0 };
    let topics = 0, videos = 0, pdfs = 0, syllabusTestes = 0, subjects = 0;
    const stages = doc.tiers.length;
    for (const tier of doc.tiers) {
      for (const sub of (tier.subjects || [])) {
        subjects++;
        for (const tp of (sub.topics || [])) {
          topics++;
          videos += (tp.videos || []).length;
          pdfs += (tp.pdfs || []).length;
          syllabusTestes += (tp.tests || []).length;
        }
      }
    }
    return { topics, videos, pdfs, syllabusTestes, subjects, stages };
  }, [examId]);

  const refreshLog = () => setAuditLog(loadAuditLog(examId));

  const saveStatsForm = () => {
    setStats(statsForm);
    saveStats(examId, statsForm);
    setEditStatsOpen(false);
  };

  const toggleFeedbackVisibility = (id: string) => {
    const updated = feedback.map(f => f.id === id ? { ...f, showOnStudentPage: !f.showOnStudentPage } : f);
    setFeedback(updated);
    saveFeedback(examId, updated);
  };

  const deleteFeedback = (id: string) => {
    const updated = feedback.filter(f => f.id !== id);
    setFeedback(updated);
    saveFeedback(examId, updated);
  };

  const addFeedback = () => {
    if (!feedbackForm.studentName.trim() || !feedbackForm.comment.trim()) return;
    const nf: StudentFeedback = {
      id: `f_${Date.now()}`,
      examId,
      date: new Date().toISOString().slice(0, 10),
      showOnStudentPage: true,
      ...feedbackForm,
    };
    const updated = [nf, ...feedback];
    setFeedback(updated);
    saveFeedback(examId, updated);
    setAddFeedbackOpen(false);
    setFeedbackForm({ studentName: '', rating: 5, comment: '', category: 'general' });
  };

  const totalContent = syllabusStats.videos + syllabusStats.pdfs + syllabusStats.syllabusTestes + totalTests;
  const targetTotal = stats.primaryTarget + stats.secondaryTarget + stats.backupGoal;

  return (
    <div className="space-y-6">
      {/* ── Alert: Pending Approvals ── */}
      {pendingApprovalTests > 0 && (
        <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold text-amber-800 text-sm">
              {pendingApprovalTests} test{pendingApprovalTests > 1 ? 's' : ''} awaiting your approval
            </p>
            <p className="text-xs text-amber-700">Review and approve employee-uploaded tests in the Tests tab</p>
          </div>
          <Badge className="bg-amber-500 text-white text-xs">{pendingApprovalTests}</Badge>
        </div>
      )}

      {/* ── Section: Student Engagement ── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-bold text-slate-800 flex items-center gap-2"><Users className="h-4 w-4 text-indigo-500" /> Student Engagement</h3>
            <p className="text-xs text-muted-foreground">Live enrollment and targeting data for {examName}</p>
          </div>
          <Button size="sm" variant="outline" className="h-7 gap-1 text-xs" onClick={() => { setStatsForm(stats); setEditStatsOpen(true); }}>
            <Pencil className="h-3 w-3" /> Update Stats
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <StatCard label="Total Registered" value={stats.totalRegistered.toLocaleString()} icon={<Users className="h-4 w-4" />} color="text-indigo-700" bg="bg-indigo-50" border="border-indigo-200" trend="up" trendValue="+12% this month" />
          <StatCard label="Active Learners" value={stats.activeLearners.toLocaleString()} icon={<Zap className="h-4 w-4" />} color="text-blue-700" bg="bg-blue-50" border="border-blue-200" trend="up" trendValue="+8% last 30d" />
          <StatCard label="Primary Target" value={stats.primaryTarget.toLocaleString()} icon={<Target className="h-4 w-4" />} color="text-emerald-700" bg="bg-emerald-50" border="border-emerald-200" />
          <StatCard label="Secondary Goal" value={stats.secondaryTarget.toLocaleString()} icon={<Shield className="h-4 w-4" />} color="text-teal-700" bg="bg-teal-50" border="border-teal-200" />
          <StatCard label="Backup Goal" value={stats.backupGoal.toLocaleString()} icon={<Award className="h-4 w-4" />} color="text-violet-700" bg="bg-violet-50" border="border-violet-200" />
          <StatCard label="Total Cleared" value={successStoriesCount} icon={<Trophy className="h-4 w-4" />} color="text-amber-700" bg="bg-amber-50" border="border-amber-200" trend="up" trendValue="+3 this year" />
        </div>

        {/* Target breakdown bar */}
        {targetTotal > 0 && (
          <div className="mt-3 p-3 bg-slate-50 rounded-xl border">
            <p className="text-xs font-semibold text-slate-600 mb-2">Target Goal Distribution</p>
            <div className="flex h-3 rounded-full overflow-hidden gap-0.5">
              <div className="bg-emerald-400 transition-all" style={{ width: `${(stats.primaryTarget / targetTotal) * 100}%` }} title={`Primary: ${stats.primaryTarget}`} />
              <div className="bg-teal-400 transition-all" style={{ width: `${(stats.secondaryTarget / targetTotal) * 100}%` }} title={`Secondary: ${stats.secondaryTarget}`} />
              <div className="bg-violet-400 transition-all" style={{ width: `${(stats.backupGoal / targetTotal) * 100}%` }} title={`Backup: ${stats.backupGoal}`} />
            </div>
            <div className="flex items-center gap-4 mt-1.5 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400" /> Primary</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-teal-400" /> Secondary</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-violet-400" /> Backup</span>
            </div>
          </div>
        )}
      </div>

      {/* ── Section: Content Stats ── */}
      <div>
        <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-3"><BarChart3 className="h-4 w-4 text-blue-500" /> Content Repository</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Tests Created', value: totalTests, icon: <CheckCircle2 className="h-4 w-4" />, color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200' },
            { label: 'Visible Tests', value: visibleTests, icon: <Eye className="h-4 w-4" />, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
            { label: 'Syllabus Stages', value: syllabusStats.stages, icon: <GraduationCap className="h-4 w-4" />, color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200' },
            { label: 'Subjects', value: syllabusStats.subjects, icon: <BookOpen className="h-4 w-4" />, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200' },
            { label: 'Topics', value: syllabusStats.topics, icon: <Target className="h-4 w-4" />, color: 'text-violet-700', bg: 'bg-violet-50', border: 'border-violet-200' },
            { label: 'Total Content', value: totalContent, icon: <Star className="h-4 w-4" />, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
          ].map(s => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* Content detail bar */}
        <div className="mt-3 grid grid-cols-3 gap-3">
          {[
            { label: 'Videos', value: syllabusStats.videos, icon: <Video className="h-4 w-4 text-blue-500" />, color: 'bg-blue-500' },
            { label: 'PDFs', value: syllabusStats.pdfs, icon: <FileText className="h-4 w-4 text-rose-500" />, color: 'bg-rose-500' },
            { label: 'Syllabus Tests', value: syllabusStats.syllabusTestes, icon: <CheckCircle2 className="h-4 w-4 text-emerald-500" />, color: 'bg-emerald-500' },
          ].map(item => (
            <div key={item.label} className="bg-white border rounded-xl p-3 flex items-center gap-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-slate-50 border`}>{item.icon}</div>
              <div>
                <p className="text-xs text-muted-foreground">{item.label}</p>
                <p className="text-xl font-black text-slate-800">{item.value}</p>
              </div>
              <div className="ml-auto">
                <div className={`w-2 h-8 rounded-full ${item.value > 0 ? item.color : 'bg-slate-200'} opacity-60`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom split: Activity Log + Feedback ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Activity Log */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><Activity className="h-4 w-4 text-indigo-500" /> Recent Activity</h3>
            <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={refreshLog} title="Refresh"><RefreshCw className="h-3.5 w-3.5 text-slate-400" /></Button>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {auditLog.length === 0 ? (
              <div className="py-10 text-center text-muted-foreground text-sm">
                <Activity className="h-8 w-8 mx-auto mb-2 text-slate-200" />
                <p>No activity yet</p>
                <p className="text-xs mt-1">Actions like adding tests, uploading PDFs will appear here</p>
              </div>
            ) : auditLog.map(entry => (
              <div key={entry.id} className="flex items-start gap-3 px-4 py-2.5 hover:bg-slate-50/60">
                <div className="mt-0.5 shrink-0">{entityIcon[entry.entityType] || entityIcon.other}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{entry.action}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{entry.entityName}</p>
                  {entry.details && <p className="text-[10px] text-slate-400 mt-0.5">{entry.details}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-[10px] text-muted-foreground whitespace-nowrap">{timeAgo(entry.timestamp)}</p>
                  <p className="text-[10px] text-slate-400">{entry.performedBy}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Student Feedback */}
        <div className="bg-white border rounded-xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-slate-50">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 text-sm"><MessageSquare className="h-4 w-4 text-indigo-500" /> Student Feedback</h3>
            <Button size="sm" className="h-7 gap-1 text-xs bg-indigo-600 hover:bg-indigo-700" onClick={() => setAddFeedbackOpen(true)}>+ Add</Button>
          </div>
          <div className="divide-y max-h-72 overflow-y-auto">
            {feedback.map(fb => (
              <div key={fb.id} className={`px-4 py-3 hover:bg-slate-50/60 ${!fb.showOnStudentPage ? 'opacity-60' : ''}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-800">{fb.studentName}</p>
                      <div className="flex">{Array.from({ length: 5 }).map((_, i) => <Star key={i} className={`h-3 w-3 ${i < fb.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />)}</div>
                      <Badge variant="outline" className="text-[10px] capitalize px-1">{fb.category}</Badge>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">{fb.comment}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{fb.date}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button onClick={() => toggleFeedbackVisibility(fb.id)} className={`p-1 rounded hover:bg-slate-100 transition-colors ${fb.showOnStudentPage ? 'text-emerald-600' : 'text-slate-400'}`} title={fb.showOnStudentPage ? 'Visible on student page — click to hide' : 'Hidden from students — click to show'}>
                      {fb.showOnStudentPage ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </button>
                    <button onClick={() => deleteFeedback(fb.id)} className="p-1 rounded hover:bg-rose-50 hover:text-rose-600 text-slate-400 transition-colors"><span className="text-[10px]">✕</span></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 py-2 border-t bg-slate-50 flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <Eye className="h-3 w-3 text-emerald-500" />{feedback.filter(f => f.showOnStudentPage).length} visible on student page
            </div>
            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground ml-4">
              <EyeOff className="h-3 w-3 text-slate-400" />{feedback.filter(f => !f.showOnStudentPage).length} hidden
            </div>
          </div>
        </div>
      </div>

      {/* ── Edit Stats Modal ── */}
      <Dialog open={editStatsOpen} onOpenChange={setEditStatsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><Users className="h-5 w-5 text-indigo-500" /> Update Student Stats</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            {[
              { key: 'totalRegistered', label: 'Total Registered' },
              { key: 'activeLearners', label: 'Active Learners' },
              { key: 'primaryTarget', label: 'Primary Target' },
              { key: 'secondaryTarget', label: 'Secondary Goal' },
              { key: 'backupGoal', label: 'Backup Goal' },
              { key: 'totalCleared', label: 'Total Cleared' },
            ].map(field => (
              <div key={field.key}>
                <Label className="text-xs font-semibold">{field.label}</Label>
                <Input
                  type="number" min={0} className="mt-1 h-9"
                  value={(statsForm as any)[field.key]}
                  onChange={e => setStatsForm(p => ({ ...p, [field.key]: +e.target.value || 0 }))}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={saveStatsForm} className="bg-indigo-600 hover:bg-indigo-700">Save Stats</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Add Feedback Modal ── */}
      <Dialog open={addFeedbackOpen} onOpenChange={setAddFeedbackOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle className="flex items-center gap-2"><MessageSquare className="h-5 w-5 text-indigo-500" /> Add Student Feedback</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Student Name</Label><Input className="mt-1 h-9" value={feedbackForm.studentName} onChange={e => setFeedbackForm(p => ({ ...p, studentName: e.target.value }))} /></div>
            <div>
              <Label className="text-xs font-semibold">Rating</Label>
              <div className="flex gap-1 mt-1.5">
                {[1,2,3,4,5].map(r => (
                  <button key={r} onClick={() => setFeedbackForm(p => ({ ...p, rating: r }))} className="p-1">
                    <Star className={`h-5 w-5 ${r <= feedbackForm.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} />
                  </button>
                ))}
              </div>
            </div>
            <div><Label className="text-xs font-semibold">Category</Label>
              <div className="flex gap-2 mt-1.5 flex-wrap">
                {(['test', 'content', 'platform', 'general'] as const).map(c => (
                  <button key={c} onClick={() => setFeedbackForm(p => ({ ...p, category: c }))} className={`px-3 py-1 rounded-full text-xs font-semibold border transition-all capitalize ${feedbackForm.category === c ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-slate-50 text-slate-500 border-slate-200'}`}>{c}</button>
                ))}
              </div>
            </div>
            <div><Label className="text-xs font-semibold">Comment</Label><textarea className="mt-1 w-full text-sm border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-300" rows={3} value={feedbackForm.comment} onChange={e => setFeedbackForm(p => ({ ...p, comment: e.target.value }))} /></div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={addFeedback} disabled={!feedbackForm.studentName.trim() || !feedbackForm.comment.trim()} className="bg-indigo-600 hover:bg-indigo-700">Add Feedback</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExamOverviewTab;
