/**
 * ExamTestsTab — Professional test management table with:
 *  • Table view: name, type, difficulty, questions, marks, duration, attempts, completion%, avg score, status, created by, approved by, date, actions
 *  • Status: published, draft, scheduled, pending-approval, rejected, archived
 *  • Approval workflow: Approve / Reject / Flag Mistake buttons
 *  • Student error reports per test
 *  • Bulk select + bulk actions
 *  • Status filter bar
 *  • Dynamic test tabs (Prelims, Mains, etc.) + sub-tabs
 */
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, Upload, Grid3X3, List, Check,
  X, Tag, Filter, CheckSquare, Square, ChevronDown, AlertTriangle,
  Clock, Target, BookOpen, MoreVertical, Copy, Archive, Send,
  ShieldCheck, ShieldX, AlertCircle, Search, RotateCcw, Play, Star,
} from 'lucide-react';
import {
  useExamCatalog, type CatalogTestItem, type TestDifficulty, type TestSubject,
} from '@/hooks/useExamCatalog';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { appendAuditLog } from './ExamOverviewTab';

// ─── Extended types ───────────────────────────────────────────────────────────

type TestStatus = 'published' | 'draft' | 'pending' | 'rejected' | 'archived' | 'scheduled';

interface ExtendedTest extends CatalogTestItem {
  status?: TestStatus;
  createdBy?: string;
  approvedBy?: string;
  scheduledAt?: string;
  attempts?: number;
  completionRate?: number;
  avgScore?: number;
  subjectId?: string;  // links test to a subject section chip
  errorReports?: { id: string; question: number; issue: string; reporter: string; date: string; resolved: boolean }[];
  rejectedReason?: string;
}

// ─── Status config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<TestStatus, { label: string; color: string; dot: string }> = {
  published: { label: 'Published', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  draft: { label: 'Draft', color: 'bg-slate-100 text-slate-600 border-slate-200', dot: 'bg-slate-400' },
  pending: { label: 'Pending Approval', color: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  rejected: { label: 'Rejected', color: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  archived: { label: 'Archived', color: 'bg-slate-50 text-slate-400 border-slate-200', dot: 'bg-slate-300' },
  scheduled: { label: 'Scheduled', color: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
};

const DIFF_STYLE: Record<TestDifficulty, string> = {
  easy: 'bg-green-100 text-green-700',
  medium: 'bg-amber-100 text-amber-700',
  hard: 'bg-rose-100 text-rose-700',
};

const defaultForm = (): Omit<CatalogTestItem, 'createdAt'> & { status: TestStatus; createdBy: string; scheduledAt: string; subjectId: string } => ({
  id: '', name: '', maxScore: 100, totalQuestions: 100, durationMinutes: 60,
  difficulty: 'medium', isVisible: true, status: 'draft', createdBy: 'SuperAdmin', scheduledAt: '', subjectId: '',
});

// Type for building sub-tabs in the creation dialog
interface NewSubTabEntry {
  name: string;
  hasSubjects: boolean;
  subjects: string[];
  subjectInput: string;
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  examId: string; examName: string;
  categoryId: string; sectionId: string;
}

const ExamTestsTab: React.FC<Props> = ({ examId, examName, categoryId, sectionId }) => {
  const { catalog, loading, addTest, updateTest, deleteTest, addSubject, updateSubject, deleteSubject, updateSlotLabel, addSlot, deleteSlot } = useExamCatalog();
  const { toast } = useToast();
  const navigate = useNavigate();

  const exam = useMemo(() => {
    const cat = catalog.find(c => c.id === categoryId);
    const sec = cat?.sections.find(s => s.id === sectionId);
    return sec?.exams.find(e => e.id === examId);
  }, [catalog, categoryId, sectionId, examId]);

  // ── Tab state ────────────────────────────────────────────────────────────────
  const mainTabs = useMemo(() => {
    if (!exam) return [];
    const seen = new Set<string>();
    const tabs: string[] = [];
    for (const slot of exam.testSlots) {
      if (!seen.has(slot.tab)) { seen.add(slot.tab); tabs.push(slot.tab); }
    }
    return tabs;
  }, [exam]);

  const [activeMainTab, setActiveMainTab] = useState<string>(() => mainTabs[0] ?? '');
  const [activeSubTabKey, setActiveSubTabKey] = useState<string>('');

  React.useEffect(() => {
    if (!mainTabs.includes(activeMainTab) && mainTabs.length > 0) {
      setActiveMainTab(mainTabs[0]);
      setSelectedSubject(null);
    }
  }, [mainTabs, activeMainTab]);

  const subTabs = useMemo(() => exam?.testSlots.filter(s => s.tab === activeMainTab && s.subTab !== null) ?? [], [exam, activeMainTab]);
  const simpleSlot = useMemo(() => exam?.testSlots.find(s => s.tab === activeMainTab && s.subTab === null), [exam, activeMainTab]);

  React.useEffect(() => {
    if (subTabs.length > 0 && !subTabs.find(s => s.key === activeSubTabKey)) {
      setActiveSubTabKey(subTabs[0].key);
      setSelectedSubject(null);
    }
    if (subTabs.length === 0) { setActiveSubTabKey(''); setSelectedSubject(null); }
  }, [subTabs, activeSubTabKey]);

  const currentSlotKey = subTabs.length > 0
    ? (subTabs.find(s => s.key === activeSubTabKey)?.key ?? subTabs[0]?.key ?? '')
    : simpleSlot?.key ?? '';

  // ── Filter & view state ──────────────────────────────────────────────────────
  const [statusFilter, setStatusFilter] = useState<TestStatus | 'all'>('all');
  const [diffFilter, setDiffFilter] = useState<TestDifficulty | 'all'>('all');
  const [searchQ, setSearchQ] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  // Subject filter — selecting a chip filters tests to that subject only
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  // ── Dialog state ──────────────────────────────────────────────────────────────
  const [testDialog, setTestDialog] = useState(false);
  const [editingTestId, setEditingTestId] = useState<string | null>(null);
  const [testForm, setTestForm] = useState(defaultForm());
  const [deleteTarget, setDeleteTarget] = useState<{ slotKey: string; testId: string; name: string } | null>(null);
  const [rejectDialog, setRejectDialog] = useState<{ testId: string; slotKey: string; name: string } | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [errorReportDialog, setErrorReportDialog] = useState<ExtendedTest | null>(null);
  const [renamingKey, setRenamingKey] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [deleteSlotTarget, setDeleteSlotTarget] = useState<{ key: string; label: string; isMain: boolean } | null>(null);

  // Subject management (inline panel)
  const [newSubjectName, setNewSubjectName] = useState('');
  const [showAddSubject, setShowAddSubject] = useState(false);
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [editingSubjectName, setEditingSubjectName] = useState('');

  // ── Add Main Tab dialog state ─────────────────────────────────────────────────
  const [addTabOpen, setAddTabOpen] = useState(false);
  const [newTabLabel, setNewTabLabel] = useState('');
  const [newTabHasSubs, setNewTabHasSubs] = useState(true);
  const [newSubTabsList, setNewSubTabsList] = useState<NewSubTabEntry[]>([
    { name: 'Full Test', hasSubjects: false, subjects: [], subjectInput: '' },
  ]);

  // ── Add Sub-tab dialog state ──────────────────────────────────────────────────
  const [addSubTabOpen, setAddSubTabOpen] = useState(false);
  const [newSubTabLabel, setNewSubTabLabel] = useState('');
  const [newSubTabHasSubjects, setNewSubTabHasSubjects] = useState(false);
  const [newSubTabSubjects, setNewSubTabSubjects] = useState<string[]>([]);
  const [newSubTabSubjectInput, setNewSubTabSubjectInput] = useState('');

  if (loading || !exam) {
    return <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">Loading...</div>;
  }

  // Current tests with filtering
  const currentSlot = exam.testSlots.find(s => s.key === currentSlotKey);
  const currentTests: ExtendedTest[] = (currentSlot?.tests ?? []) as ExtendedTest[];
  const filteredTests = currentTests.filter(t => {
    const s = (t as ExtendedTest).status ?? (t.isVisible ? 'published' : 'draft');
    if (statusFilter !== 'all' && s !== statusFilter) return false;
    if (diffFilter !== 'all' && t.difficulty !== diffFilter) return false;
    if (searchQ && !t.name.toLowerCase().includes(searchQ.toLowerCase())) return false;
    // Subject section filter — only apply if a subject is selected
    if (selectedSubject && (t as any).subjectId !== selectedSubject) return false;
    return true;
  });

  const pendingTests = currentTests.filter(t => (t as ExtendedTest).status === 'pending');

  // ── Handlers ──────────────────────────────────────────────────────────────────

  const openAdd = (slotKey: string) => {
    const slot = exam.testSlots.find(s => s.key === slotKey);
    setEditingTestId(null);

    let defaultName = '';
    if (slot) {
      const subjectObj = slot.subjects?.find(s => s.id === selectedSubject);
      if (subjectObj) {
        // Dynamic subject-wise name and counter
        const count = slot.tests.filter(t => (t as any).subjectId === selectedSubject).length;
        const mainLabel = tabDisplayLabel(slot.tab); // e.g. "Prelims"
        const subLabel = slot.subTab ? tabDisplayLabel(slot.subTab) : ''; // e.g. "Sectional"
        if (subLabel) {
          defaultName = `${mainLabel} - ${subjectObj.name} ${subLabel} Test ${count + 1}`;
        } else {
          defaultName = `${subjectObj.name} ${mainLabel} Test ${count + 1}`;
        }
      } else {
        // Fallback for general (no subject active or 'All' filter selected)
        const n = slot.tests.length + 1;
        defaultName = `${slot.label ?? slotKey} ${n}`;
      }
    } else {
      defaultName = `${slotKey} 1`;
    }

    // Auto-tag the test to the currently selected subject (if any)
    setTestForm({
      ...defaultForm(),
      name: defaultName,
      subjectId: selectedSubject ?? '',
    } as any);
    setTestDialog(true);
  };

  const openEdit = (slotKey: string, test: ExtendedTest) => {
    setEditingTestId(test.id);
    setTestForm({
      id: test.id, name: test.name, maxScore: test.maxScore,
      totalQuestions: test.totalQuestions, durationMinutes: test.durationMinutes,
      difficulty: test.difficulty, isVisible: test.isVisible,
      status: test.status ?? 'published', createdBy: test.createdBy ?? 'SuperAdmin',
      scheduledAt: test.scheduledAt ?? '', subjectId: test.subjectId ?? '',
    });
    setTestDialog(true);
  };

  const saveTest = () => {
    if (!testForm.name.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
    const id = editingTestId || testForm.id.trim() || `${currentSlotKey}-${Date.now()}`;
    if (editingTestId) {
      updateTest(categoryId, sectionId, examId, currentSlotKey, editingTestId, { ...testForm });
      toast({ title: 'Test updated' });
      appendAuditLog(examId, { action: 'Test updated', entityType: 'test', entityName: testForm.name, performedBy: 'SuperAdmin' });
    } else {
      addTest(categoryId, sectionId, examId, currentSlotKey, { ...testForm, id });
      toast({ title: 'Test added', description: testForm.name });
      appendAuditLog(examId, { action: 'Test created', entityType: 'test', entityName: testForm.name, performedBy: testForm.createdBy || 'SuperAdmin' });
    }
    setTestDialog(false);
  };

  const approveTest = (slotKey: string, test: ExtendedTest) => {
    updateTest(categoryId, sectionId, examId, slotKey, test.id, { ...test, status: 'published', approvedBy: 'SuperAdmin', isVisible: true } as any);
    toast({ title: '✅ Test approved and published!', description: test.name });
    appendAuditLog(examId, { action: 'Test approved & published', entityType: 'test', entityName: test.name, performedBy: 'SuperAdmin' });
  };

  const rejectTest = () => {
    if (!rejectDialog) return;
    updateTest(categoryId, sectionId, examId, rejectDialog.slotKey, rejectDialog.testId, { status: 'rejected', rejectedReason: rejectReason } as any);
    toast({ title: 'Test rejected', description: rejectReason, variant: 'destructive' });
    appendAuditLog(examId, { action: 'Test rejected', entityType: 'test', entityName: rejectDialog.name, performedBy: 'SuperAdmin', details: rejectReason });
    setRejectDialog(null);
    setRejectReason('');
  };

  const toggleVisibility = (slotKey: string, test: CatalogTestItem) => {
    updateTest(categoryId, sectionId, examId, slotKey, test.id, { isVisible: !test.isVisible });
    toast({ title: test.isVisible ? 'Hidden from students' : 'Visible to students' });
  };

  const bulkAction = (action: string) => {
    selectedIds.forEach(id => {
      const test = currentTests.find(t => t.id === id);
      if (!test) return;
      if (action === 'publish') updateTest(categoryId, sectionId, examId, currentSlotKey, id, { isVisible: true, status: 'published' } as any);
      if (action === 'hide') updateTest(categoryId, sectionId, examId, currentSlotKey, id, { isVisible: false, status: 'draft' } as any);
      if (action === 'archive') updateTest(categoryId, sectionId, examId, currentSlotKey, id, { status: 'archived' } as any);
      if (action === 'delete') deleteTest(categoryId, sectionId, examId, currentSlotKey, id);
    });
    toast({ title: `Bulk ${action} applied to ${selectedIds.size} test(s)` });
    setSelectedIds(new Set());
  };

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id); else next.add(id);
    setSelectedIds(next);
  };

  const selectAll = () => setSelectedIds(filteredTests.length === selectedIds.size ? new Set() : new Set(filteredTests.map(t => t.id)));

  // Tab management
  const addMainTab = () => {
    if (!newTabLabel.trim()) return;
    const tabKey = newTabLabel.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    if (newTabHasSubs) {
      // Create all sub-tabs from the list in one shot
      const validSubs = newSubTabsList.filter(s => s.name.trim());
      if (validSubs.length === 0) {
        // Fallback: create one default sub-tab
        addSlot(categoryId, sectionId, examId, { key: `${tabKey}_full`, tab: tabKey, subTab: 'full', label: `${newTabLabel.trim()} – Full Test` });
      } else {
        validSubs.forEach((st, idx) => {
          const subKey = st.name.trim().toLowerCase().replace(/\s+/g, '_');
          const slotKey = `${tabKey}_${subKey}_${idx}`;
          addSlot(categoryId, sectionId, examId, { key: slotKey, tab: tabKey, subTab: subKey, label: st.name.trim() });
          // Add subjects if the sub-tab has them
          if (st.hasSubjects) {
            st.subjects.filter(Boolean).forEach(subName => {
              const id = subName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now() + Math.random();
              addSubject(categoryId, sectionId, examId, slotKey, { id, name: subName });
            });
          }
        });
      }
    } else {
      addSlot(categoryId, sectionId, examId, { key: tabKey, tab: tabKey, subTab: null, label: newTabLabel.trim() });
    }
    toast({ title: `Tab "${newTabLabel}" added` });
    setActiveMainTab(tabKey);
    setAddTabOpen(false);
    setNewTabLabel('');
    setNewSubTabsList([{ name: 'Full Test', hasSubjects: false, subjects: [], subjectInput: '' }]);
    setNewTabHasSubs(true);
    appendAuditLog(examId, { action: 'Test tab added', entityType: 'other', entityName: newTabLabel, performedBy: 'SuperAdmin' });
  };

  const addSubTab = () => {
    if (!newSubTabLabel.trim()) return;
    const subKey = newSubTabLabel.trim().toLowerCase().replace(/\s+/g, '_');
    const slotKey = `${activeMainTab}_${subKey}_${Date.now()}`;
    addSlot(categoryId, sectionId, examId, { key: slotKey, tab: activeMainTab, subTab: subKey, label: newSubTabLabel.trim() });
    // Add subjects immediately
    if (newSubTabHasSubjects) {
      newSubTabSubjects.filter(Boolean).forEach(subName => {
        const id = subName.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now() + Math.random();
        addSubject(categoryId, sectionId, examId, slotKey, { id, name: subName });
      });
    }
    toast({ title: `Sub-tab "${newSubTabLabel}" added` });
    setActiveSubTabKey(slotKey);
    setAddSubTabOpen(false);
    setNewSubTabLabel('');
    setNewSubTabHasSubjects(false);
    setNewSubTabSubjects([]);
    setNewSubTabSubjectInput('');
  };

  const commitRename = () => {
    if (!renamingKey || !renameValue.trim()) { setRenamingKey(null); return; }
    if (renamingKey.startsWith('__main__')) {
      const tabVal = renamingKey.replace('__main__', '');
      exam.testSlots.filter(s => s.tab === tabVal).forEach(sl => {
        updateSlotLabel(categoryId, sectionId, examId, sl.key, sl.subTab ? `${renameValue} – ${sl.label.split('–').slice(1).join('–').trim() || sl.subTab}` : renameValue);
      });
    } else {
      updateSlotLabel(categoryId, sectionId, examId, renamingKey, renameValue);
    }
    toast({ title: 'Renamed' });
    setRenamingKey(null);
  };

  const deleteSlotConfirm = () => {
    if (!deleteSlotTarget) return;
    if (deleteSlotTarget.isMain) {
      exam.testSlots.filter(s => s.tab === activeMainTab).forEach(sl => deleteSlot(categoryId, sectionId, examId, sl.key));
      toast({ title: `Tab deleted`, variant: 'destructive' });
    } else {
      deleteSlot(categoryId, sectionId, examId, deleteSlotTarget.key);
      toast({ title: `Sub-tab deleted`, variant: 'destructive' });
    }
    setDeleteSlotTarget(null);
  };

  const handleAddSubject = () => {
    const name = newSubjectName.trim();
    if (!name || !currentSlotKey) return;
    const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
    addSubject(categoryId, sectionId, examId, currentSlotKey, { id, name });
    toast({ title: 'Subject added' });
    setNewSubjectName(''); setShowAddSubject(false);
  };

  const renderStatusBadge = (test: ExtendedTest) => {
    const s = test.status ?? (test.isVisible ? 'published' : 'draft');
    const cfg = STATUS_CONFIG[s as TestStatus] ?? STATUS_CONFIG.draft;
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[11px] font-semibold cursor-pointer ${cfg.color}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
            <ChevronDown className="h-3 w-3 ml-0.5" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="text-xs">
          {(Object.entries(STATUS_CONFIG) as [TestStatus, typeof STATUS_CONFIG[TestStatus]][]).map(([key, val]) => (
            <DropdownMenuItem key={key} onClick={() => updateTest(categoryId, sectionId, examId, currentSlotKey, test.id, { status: key, isVisible: key === 'published' } as any)} className="gap-2">
              <span className={`w-2 h-2 rounded-full ${val.dot}`} /> {val.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  const slotTabCount = (tabVal: string) => exam.testSlots.filter(s => s.tab === tabVal).reduce((a, s) => a + s.tests.length, 0);
  const tabDisplayLabel = (tabVal: string) => tabVal.replace(/_\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  const currentSubjects: TestSubject[] = currentSlot?.subjects ?? [];
  // Show subject panel for ANY slot that has subjects (not just sectional/speed)
  const showSubjectPanel = currentSlotKey && currentSubjects.length > 0;

  return (
    <div className="space-y-4">
      {/* ── Main test tab bar ── */}
      <div className="bg-slate-50 border rounded-xl overflow-hidden">
        <div className="flex items-center gap-0 border-b overflow-x-auto px-3 pt-0">
          {mainTabs.map(tabVal => {
            const isActive = activeMainTab === tabVal;
            const count = slotTabCount(tabVal);
            const label = tabDisplayLabel(tabVal);
            return (
              <div key={tabVal} className="relative flex items-center group shrink-0">
                {renamingKey === `__main__${tabVal}` ? (
                  <div className="flex items-center gap-1 px-2 py-2">
                    <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                      onBlur={commitRename} onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingKey(null); }}
                      className="text-sm border rounded px-2 h-7 outline-none focus:ring-1 ring-primary w-28" />
                    <button onClick={commitRename} className="text-emerald-600"><Check className="h-3.5 w-3.5" /></button>
                    <button onClick={() => setRenamingKey(null)} className="text-slate-400"><X className="h-3.5 w-3.5" /></button>
                  </div>
                ) : (
                  <button onClick={() => setActiveMainTab(tabVal)}
                    className={`flex items-center gap-1.5 px-4 py-3 text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${isActive ? 'border-indigo-600 text-indigo-700 bg-white' : 'border-transparent text-muted-foreground hover:text-slate-700 hover:border-slate-300'}`}>
                    <BookOpen className="h-3.5 w-3.5" />
                    {label}
                    {count > 0 && <span className="bg-indigo-100 text-indigo-700 text-[10px] font-bold px-1.5 rounded-full">{count}</span>}
                  </button>
                )}
                {isActive && !renamingKey && (
                  <div className="flex items-center gap-0.5 pb-0.5">
                    <button onClick={() => { setRenamingKey(`__main__${tabVal}`); setRenameValue(label); }} className="h-5 w-5 rounded text-slate-300 hover:text-indigo-500 flex items-center justify-center"><Pencil className="h-3 w-3" /></button>
                    <button onClick={() => setDeleteSlotTarget({ key: '', label, isMain: true })} className="h-5 w-5 rounded text-slate-300 hover:text-rose-500 flex items-center justify-center"><Trash2 className="h-3 w-3" /></button>
                  </div>
                )}
              </div>
            );
          })}
          <button onClick={() => setAddTabOpen(true)}
            className="flex items-center gap-1 px-3 py-3 text-xs text-indigo-600 border-b-2 border-transparent hover:border-indigo-200 hover:bg-indigo-50 transition-all whitespace-nowrap ml-1">
            <Plus className="h-3 w-3" /> Add Tab
          </button>
          <div className="flex-1 border-b-2 border-transparent" />
        </div>

        {/* ── Sub-tabs + filters ── */}
        <div className="p-3 space-y-3">
          {mainTabs.length === 0 ? (
            <div className="text-center py-16 border-2 border-dashed rounded-xl">
              <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-2" />
              <p className="font-semibold text-slate-400 text-sm">No test tabs yet</p>
              <p className="text-xs text-slate-400 mb-3">Add tabs like Prelims, Mains, PYQ to organise tests</p>
              <Button onClick={() => setAddTabOpen(true)} className="gap-1 bg-indigo-600 hover:bg-indigo-700"><Plus className="h-4 w-4" /> Add First Tab</Button>
            </div>
          ) : (
            <>
              {/* Sub-tab bar */}
              {subTabs.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {subTabs.map(st => (
                    <div key={st.key} className="relative group/sub flex items-center">
                      {renamingKey === st.key ? (
                        <div className="flex items-center gap-1">
                          <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                            onBlur={commitRename} onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingKey(null); }}
                            className="text-xs border rounded px-2 h-7 w-28 outline-none focus:ring-1 ring-primary" />
                          <button onClick={commitRename} className="text-emerald-600"><Check className="h-3.5 w-3.5" /></button>
                          <button onClick={() => setRenamingKey(null)} className="text-slate-400"><X className="h-3.5 w-3.5" /></button>
                        </div>
                      ) : (
                        <Button size="sm" variant={activeSubTabKey === st.key ? 'default' : 'outline'} onClick={() => setActiveSubTabKey(st.key)}
                          className={`text-xs h-8 gap-1 pr-1 ${activeSubTabKey === st.key ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}>
                          {st.label}
                          {st.tests.length > 0 && <span className="text-[10px] bg-white/20 px-1 rounded-full">{st.tests.length}</span>}
                          <span className="flex items-center gap-0.5 ml-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                            <span className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-black/10" onClick={e => { e.stopPropagation(); setRenamingKey(st.key); setRenameValue(st.label); }}><Pencil className="h-2.5 w-2.5" /></span>
                            <span className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-destructive/20 text-destructive" onClick={e => { e.stopPropagation(); setDeleteSlotTarget({ key: st.key, label: st.label, isMain: false }); }}><X className="h-2.5 w-2.5" /></span>
                          </span>
                        </Button>
                      )}
                    </div>
                  ))}
                  <button onClick={() => setAddSubTabOpen(true)}
                    className="flex items-center gap-1 h-8 px-2 text-xs text-indigo-600 border border-dashed border-indigo-300 rounded hover:bg-indigo-50 transition-colors">
                    <Plus className="h-3 w-3" /> Sub-tab
                  </button>
                </div>
              )}

              {/* Subject section panel — appears for any slot that has subjects */}
              {(showSubjectPanel || (currentSlotKey && currentSubjects.length > 0)) && (
                <div className="border rounded-lg p-3 bg-blue-50/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-blue-500" /> Subject Sections
                      <span className="text-[10px] font-normal text-blue-500">(click to filter tests)</span>
                    </h4>
                    <Button size="sm" variant="outline" className="h-6 text-[11px] gap-1" onClick={() => { setShowAddSubject(true); setNewSubjectName(''); }}>
                      <Plus className="h-2.5 w-2.5" /> Add Subject
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {/* "All" chip to clear filter */}
                    {currentSubjects.length > 0 && (
                      <button
                        onClick={() => setSelectedSubject(null)}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                          selectedSubject === null
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                            : 'bg-white text-slate-500 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                        }`}
                      >
                        All
                      </button>
                    )}
                    {currentSubjects.map(sub => (
                      <div key={sub.id} className="relative group/subj">
                        {editingSubjectId === sub.id ? (
                          <div className="flex items-center gap-1 bg-white border rounded-full px-2.5 py-1">
                            <input
                              value={editingSubjectName}
                              onChange={e => setEditingSubjectName(e.target.value)}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && editingSubjectName.trim()) {
                                  updateSubject(categoryId, sectionId, examId, currentSlotKey, sub.id, editingSubjectName.trim());
                                  setEditingSubjectId(null);
                                }
                                if (e.key === 'Escape') setEditingSubjectId(null);
                              }}
                              className="h-5 text-xs w-24 border-0 p-0 focus-visible:ring-0 bg-transparent"
                              autoFocus
                            />
                            <button onClick={() => { if (editingSubjectName.trim()) { updateSubject(categoryId, sectionId, examId, currentSlotKey, sub.id, editingSubjectName.trim()); setEditingSubjectId(null); } }} className="text-emerald-600"><Check className="h-3 w-3" /></button>
                            <button onClick={() => setEditingSubjectId(null)} className="text-slate-400"><X className="h-3 w-3" /></button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setSelectedSubject(selectedSubject === sub.id ? null : sub.id)}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
                              selectedSubject === sub.id
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                            }`}
                          >
                            {sub.name}
                            {/* Edit & delete shown on hover */}
                            <span
                              className="hidden group-hover/subj:inline-flex items-center gap-0.5 ml-0.5"
                              onClick={e => e.stopPropagation()}
                            >
                              <span
                                className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-black/10"
                                onClick={e => { e.stopPropagation(); setEditingSubjectId(sub.id); setEditingSubjectName(sub.name); }}
                                title="Rename"
                              ><Pencil className="h-2.5 w-2.5" /></span>
                              <span
                                className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-rose-100 text-rose-400"
                                onClick={e => { e.stopPropagation(); deleteSubject(categoryId, sectionId, examId, currentSlotKey, sub.id); if (selectedSubject === sub.id) setSelectedSubject(null); toast({ title: 'Subject removed' }); }}
                                title="Delete"
                              ><X className="h-2.5 w-2.5" /></span>
                            </span>
                          </button>
                        )}
                      </div>
                    ))}
                    {/* Add subject inline */}
                    {!showAddSubject && currentSubjects.length === 0 && (
                      <p className="text-xs text-muted-foreground italic">No subjects yet — add subjects to filter tests</p>
                    )}
                    {showAddSubject && (
                      <div className="flex items-center gap-1.5">
                        <input
                          value={newSubjectName}
                          onChange={e => setNewSubjectName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); if (e.key === 'Escape') setShowAddSubject(false); }}
                          placeholder="Subject name"
                          className="h-7 text-xs border rounded px-2 w-36 outline-none focus:ring-1 ring-indigo-300"
                          autoFocus
                        />
                        <button onClick={handleAddSubject} className="h-7 px-2 bg-indigo-600 text-white text-xs rounded">Add</button>
                        <button onClick={() => setShowAddSubject(false)} className="h-7 px-2 text-slate-400 text-xs border rounded">Cancel</button>
                      </div>
                    )}
                  </div>
                  {selectedSubject && (
                    <p className="text-[11px] text-indigo-600 font-semibold">
                      Filtering by: <span className="underline">{currentSubjects.find(s => s.id === selectedSubject)?.name}</span>
                      {' '}— {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''}
                    </p>
                  )}
                </div>
              )}
              {/* "Add Subject Sections" button for any slot that doesn't have subjects yet */}
              {currentSlotKey && currentSubjects.length === 0 && !showSubjectPanel && (
                <Button
                  size="sm" variant="outline"
                  className="h-7 text-xs gap-1 text-blue-600 border-blue-200 hover:bg-blue-50"
                  onClick={() => { setShowAddSubject(true); setNewSubjectName(''); }}
                >
                  <Tag className="h-3 w-3" /> Add Subject Sections
                </Button>
              )}
              {showAddSubject && currentSubjects.length === 0 && (
                <div className="flex items-center gap-1.5 border rounded-lg p-2.5 bg-blue-50/40">
                  <input
                    value={newSubjectName}
                    onChange={e => setNewSubjectName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); if (e.key === 'Escape') setShowAddSubject(false); }}
                    placeholder="First subject name"
                    className="h-7 text-xs border rounded px-2 w-40 outline-none focus:ring-1 ring-indigo-300"
                    autoFocus
                  />
                  <button onClick={handleAddSubject} className="h-7 px-2 bg-indigo-600 text-white text-xs rounded">Add</button>
                  <button onClick={() => setShowAddSubject(false)} className="h-7 px-2 text-slate-400 text-xs border rounded">Cancel</button>
                </div>
              )}

              {/* Pending approval banner */}
              {pendingTests.length > 0 && (
                <div className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                  <p className="text-sm text-amber-800 font-semibold flex-1">{pendingTests.length} test(s) pending your approval</p>
                  <Badge className="bg-amber-500 text-white text-xs">{pendingTests.length}</Badge>
                </div>
              )}

              {/* Filter bar + actions */}
              <div className="flex items-center gap-2 flex-wrap">
                {/* Search */}
                <div className="relative flex-1 min-w-[160px]">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <Input placeholder="Search tests…" className="pl-8 h-8 text-xs" value={searchQ} onChange={e => setSearchQ(e.target.value)} />
                </div>

                {/* Status filter */}
                <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                  <SelectTrigger className="h-8 text-xs w-[140px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    {(Object.entries(STATUS_CONFIG) as [TestStatus, any][]).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>

                {/* Difficulty filter */}
                <Select value={diffFilter} onValueChange={v => setDiffFilter(v as any)}>
                  <SelectTrigger className="h-8 text-xs w-[120px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                <div className="ml-auto flex items-center gap-2">
                  {/* View toggle */}
                  <div className="flex border rounded-lg p-0.5 gap-0.5">
                    <Button size="sm" variant={viewMode === 'table' ? 'default' : 'ghost'} className="h-7 w-7 p-0" onClick={() => setViewMode('table')}><List className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant={viewMode === 'grid' ? 'default' : 'ghost'} className="h-7 w-7 p-0" onClick={() => setViewMode('grid')}><Grid3X3 className="h-3.5 w-3.5" /></Button>
                  </div>
                  {/* Add Test: disabled when slot has subjects but "All" (null) is selected */}
                  <div className="relative group/addtest">
                    <Button
                      size="sm"
                      className="h-8 gap-1 bg-indigo-600 hover:bg-indigo-700 text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                      onClick={() => openAdd(currentSlotKey)}
                      disabled={!currentSlotKey || (currentSubjects.length > 0 && selectedSubject === null)}
                    >
                      <Plus className="h-3.5 w-3.5" /> Add Test
                    </Button>
                    {/* Tooltip when disabled because no subject is selected */}
                    {currentSubjects.length > 0 && selectedSubject === null && (
                      <div className="absolute bottom-full right-0 mb-1.5 hidden group-hover/addtest:block z-50">
                        <div className="bg-slate-800 text-white text-[11px] px-2.5 py-1.5 rounded-lg whitespace-nowrap shadow-lg">
                          Select a subject section first
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Bulk action toolbar */}
              {selectedIds.size > 0 && (
                <div className="flex items-center gap-2 p-2.5 bg-indigo-50 border border-indigo-200 rounded-lg">
                  <span className="text-xs font-semibold text-indigo-700">{selectedIds.size} selected</span>
                  <div className="flex gap-1.5 ml-2">
                    <Button size="sm" className="h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => bulkAction('publish')}><Send className="h-3 w-3" /> Publish</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => bulkAction('hide')}><EyeOff className="h-3 w-3" /> Hide</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => bulkAction('archive')}><Archive className="h-3 w-3" /> Archive</Button>
                    <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-rose-600 border-rose-200 hover:bg-rose-50" onClick={() => bulkAction('delete')}><Trash2 className="h-3 w-3" /> Delete</Button>
                  </div>
                  <button onClick={() => setSelectedIds(new Set())} className="ml-auto text-indigo-400 hover:text-indigo-700"><X className="h-4 w-4" /></button>
                </div>
              )}

              {/* Stats bar */}
              {currentTests.length > 0 && (
                <div className="flex items-center gap-4 bg-slate-50 border rounded-lg px-4 py-2 text-xs text-muted-foreground">
                  <span><strong className="text-slate-800">{currentTests.length}</strong> total</span>
                  <span><strong className="text-emerald-600">{currentTests.filter(t => (t as ExtendedTest).status !== 'archived' && t.isVisible).length}</strong> published</span>
                  <span><strong className="text-slate-500">{currentTests.filter(t => !t.isVisible || (t as ExtendedTest).status === 'draft').length}</strong> draft</span>
                  <span><strong className="text-amber-600">{pendingTests.length}</strong> pending</span>
                  {filteredTests.length !== currentTests.length && <span className="ml-auto text-indigo-600 font-semibold">Showing {filteredTests.length} filtered</span>}
                </div>
              )}

              {/* TABLE VIEW */}
              {viewMode === 'table' && (
                filteredTests.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="font-semibold text-slate-400 text-sm">{currentTests.length === 0 ? 'No tests yet' : 'No tests match filters'}</p>
                    {currentTests.length === 0 && <Button size="sm" className="mt-3 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => openAdd(currentSlotKey)}><Plus className="h-3.5 w-3.5" /> Add First Test</Button>}
                  </div>
                ) : (
                  <div className="border rounded-xl overflow-hidden">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 border-b">
                        <tr>
                          <th className="px-3 py-2.5 w-8">
                            <button onClick={selectAll} className="flex items-center justify-center">
                              {selectedIds.size === filteredTests.length && filteredTests.length > 0 ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4 text-slate-300" />}
                            </button>
                          </th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">#</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Test Name</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Difficulty</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Questions</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Marks</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Duration</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Attempts</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Avg Score</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Status</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Created By</th>
                          <th className="px-3 py-2.5 text-left text-xs font-semibold text-muted-foreground">Date</th>
                          <th className="px-3 py-2.5 text-right text-xs font-semibold text-muted-foreground">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTests.map((test, i) => {
                          const ext = test as ExtendedTest;
                          const status = ext.status ?? (test.isVisible ? 'published' : 'draft');
                          const errorCount = (ext.errorReports || []).filter(r => !r.resolved).length;
                          return (
                            <tr key={test.id} className={`hover:bg-slate-50/60 ${selectedIds.has(test.id) ? 'bg-indigo-50/40' : ''}`}>
                              <td className="px-3 py-3">
                                <button onClick={() => toggleSelect(test.id)} className="flex items-center justify-center">
                                  {selectedIds.has(test.id) ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4 text-slate-300" />}
                                </button>
                              </td>
                              <td className="px-3 py-3 text-xs text-muted-foreground">{i + 1}</td>
                              <td className="px-3 py-3">
                                <div>
                                  <p className="font-semibold text-slate-800 text-sm leading-tight">{test.name}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    {ext.approvedBy && <span className="text-[10px] text-emerald-600 flex items-center gap-0.5"><ShieldCheck className="h-3 w-3" /> Approved</span>}
                                    {errorCount > 0 && <span className="text-[10px] text-rose-600 flex items-center gap-0.5 cursor-pointer hover:underline" onClick={() => setErrorReportDialog(ext)}><AlertCircle className="h-3 w-3" /> {errorCount} error{errorCount > 1 ? 's' : ''}</span>}
                                  </div>
                                </div>
                              </td>
                              <td className="px-3 py-3"><span className={`text-[11px] px-2 py-0.5 rounded font-semibold ${DIFF_STYLE[test.difficulty]}`}>{test.difficulty}</span></td>
                              <td className="px-3 py-3 text-xs font-semibold text-slate-700">{test.totalQuestions}</td>
                              <td className="px-3 py-3 text-xs font-semibold text-slate-700">{test.maxScore}</td>
                              <td className="px-3 py-3 text-xs text-slate-600">{test.durationMinutes}m</td>
                              <td className="px-3 py-3 text-xs text-slate-600">{ext.attempts ?? 0}</td>
                              <td className="px-3 py-3 text-xs text-slate-600">{ext.avgScore ? `${ext.avgScore}%` : '—'}</td>
                              <td className="px-3 py-3">{renderStatusBadge(ext)}</td>
                              <td className="px-3 py-3 text-xs text-slate-600">{ext.createdBy ?? 'SuperAdmin'}</td>
                              <td className="px-3 py-3 text-xs text-slate-500">{test.createdAt ? new Date(test.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : '—'}</td>
                              <td className="px-3 py-3">
                                <div className="flex items-center gap-0.5 justify-end">
                                  {status === 'pending' && (
                                    <>
                                      <Button size="sm" className="h-6 text-[11px] gap-0.5 bg-emerald-600 hover:bg-emerald-700 px-2" onClick={() => approveTest(currentSlotKey, ext)}><ShieldCheck className="h-3 w-3" /> Approve</Button>
                                      <Button size="sm" variant="outline" className="h-6 text-[11px] gap-0.5 text-rose-600 border-rose-200 px-2 ml-0.5" onClick={() => setRejectDialog({ testId: test.id, slotKey: currentSlotKey, name: test.name })}><ShieldX className="h-3 w-3" /> Reject</Button>
                                    </>
                                  )}
                                  {status !== 'pending' && (
                                    <>
                                      <button onClick={() => navigate(`/super-admin/test-catalog/${categoryId}/${sectionId}/${examId}/${currentSlotKey}/${test.id}/questions`)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600" title="Upload Questions"><Upload className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => toggleVisibility(currentSlotKey, test)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-slate-700" title={test.isVisible ? 'Hide' : 'Show'}>{test.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                                      <button onClick={() => openEdit(currentSlotKey, ext)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600"><Pencil className="h-3.5 w-3.5" /></button>
                                      <button onClick={() => setDeleteTarget({ slotKey: currentSlotKey, testId: test.id, name: test.name })} className="p-1.5 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600"><Trash2 className="h-3.5 w-3.5" /></button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                    <div className="px-4 py-2 bg-slate-50 border-t text-xs text-muted-foreground">
                      Showing {filteredTests.length} of {currentTests.length} tests
                    </div>
                  </div>
                )
              )}

              {/* GRID VIEW */}
              {viewMode === 'grid' && (
                filteredTests.length === 0 ? (
                  <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <BookOpen className="h-10 w-10 text-slate-200 mx-auto mb-2" />
                    <p className="text-sm text-slate-400">{currentTests.length === 0 ? 'No tests yet' : 'No tests match filters'}</p>
                    {currentTests.length === 0 && <Button size="sm" className="mt-3 gap-1 bg-indigo-600 hover:bg-indigo-700" onClick={() => openAdd(currentSlotKey)}><Plus className="h-3.5 w-3.5" /> Add First Test</Button>}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                    {filteredTests.map((test, i) => {
                      const ext = test as ExtendedTest;
                      const status = ext.status ?? (test.isVisible ? 'published' : 'draft');
                      const cfg = STATUS_CONFIG[status as TestStatus] ?? STATUS_CONFIG.draft;
                      const errorCount = (ext.errorReports || []).filter(r => !r.resolved).length;
                      return (
                        <div key={test.id} className={`border rounded-xl p-4 space-y-3 hover:shadow-md transition-all relative ${selectedIds.has(test.id) ? 'ring-2 ring-indigo-400 bg-indigo-50/30' : 'bg-white'}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <button onClick={() => toggleSelect(test.id)} className="absolute top-3 right-3">
                                {selectedIds.has(test.id) ? <CheckSquare className="h-4 w-4 text-indigo-600" /> : <Square className="h-4 w-4 text-slate-300" />}
                              </button>
                              <p className="font-semibold text-sm pr-6">{test.name}</p>
                              <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                                <span className={`text-[11px] px-1.5 py-0.5 rounded font-semibold ${DIFF_STYLE[test.difficulty]}`}>{test.difficulty}</span>
                                <span className={`text-[11px] px-1.5 py-0.5 rounded border font-semibold ${cfg.color}`}>{cfg.label}</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            <div><p className="text-muted-foreground">Questions</p><p className="font-bold text-indigo-600">{test.totalQuestions}</p></div>
                            <div><p className="text-muted-foreground">Marks</p><p className="font-bold text-blue-600">{test.maxScore}</p></div>
                            <div><p className="text-muted-foreground">Duration</p><p className="font-bold">{test.durationMinutes}m</p></div>
                            <div><p className="text-muted-foreground">Attempts</p><p className="font-bold text-slate-700">{ext.attempts ?? 0}</p></div>
                            <div><p className="text-muted-foreground">Avg Score</p><p className="font-bold text-emerald-600">{ext.avgScore ? `${ext.avgScore}%` : '—'}</p></div>
                            <div><p className="text-muted-foreground">By</p><p className="font-bold text-slate-600 truncate text-[11px]">{ext.createdBy ?? 'SA'}</p></div>
                          </div>
                          {errorCount > 0 && (
                            <button onClick={() => setErrorReportDialog(ext)} className="w-full flex items-center gap-1.5 text-xs text-rose-600 bg-rose-50 border border-rose-100 rounded-lg px-2 py-1.5 hover:bg-rose-100">
                              <AlertCircle className="h-3.5 w-3.5" /> {errorCount} unresolved student report{errorCount > 1 ? 's' : ''}
                            </button>
                          )}
                          <div className="flex gap-1.5">
                            {status === 'pending' ? (
                              <>
                                <Button size="sm" className="flex-1 h-7 text-xs gap-1 bg-emerald-600 hover:bg-emerald-700" onClick={() => approveTest(currentSlotKey, ext)}><ShieldCheck className="h-3 w-3" /> Approve</Button>
                                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 text-rose-600 border-rose-200" onClick={() => setRejectDialog({ testId: test.id, slotKey: currentSlotKey, name: test.name })}><ShieldX className="h-3 w-3" /> Reject</Button>
                              </>
                            ) : (
                              <>
                                <Button size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => navigate(`/super-admin/test-catalog/${categoryId}/${sectionId}/${examId}/${currentSlotKey}/${test.id}/questions`)}><Upload className="h-3 w-3" /> Questions</Button>
                                <button onClick={() => openEdit(currentSlotKey, ext)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 hover:text-indigo-600 border"><Pencil className="h-3.5 w-3.5" /></button>
                                <button onClick={() => toggleVisibility(currentSlotKey, test)} className="p-1.5 rounded hover:bg-slate-100 text-slate-400 border">{test.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}</button>
                                <button onClick={() => setDeleteTarget({ slotKey: currentSlotKey, testId: test.id, name: test.name })} className="p-1.5 rounded hover:bg-rose-50 text-rose-400 border"><Trash2 className="h-3.5 w-3.5" /></button>
                              </>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Dialogs ── */}

      {/* Add/Edit Test */}
      <Dialog open={testDialog} onOpenChange={setTestDialog}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2">{editingTestId ? <Pencil className="h-4 w-4 text-indigo-500" /> : <Plus className="h-4 w-4 text-indigo-500" />}{editingTestId ? 'Edit Test' : 'Add New Test'}</DialogTitle></DialogHeader>
          <div className="space-y-3 py-2">
            <div><Label className="text-xs font-semibold">Test Name *</Label><Input className="mt-1 h-9" autoFocus value={testForm.name} onChange={e => setTestForm(f => ({ ...f, name: e.target.value }))} /></div>
            {!editingTestId && <div><Label className="text-xs font-semibold">Test ID (auto if blank)</Label><Input className="mt-1 h-9" value={testForm.id} onChange={e => setTestForm(f => ({ ...f, id: e.target.value }))} placeholder="e.g. prelims-full-1" /></div>}
            <div className="grid grid-cols-3 gap-3">
              <div><Label className="text-xs font-semibold">Questions</Label><Input type="number" className="mt-1 h-9" min={1} value={testForm.totalQuestions} onChange={e => setTestForm(f => ({ ...f, totalQuestions: +e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Max Score</Label><Input type="number" className="mt-1 h-9" min={1} value={testForm.maxScore} onChange={e => setTestForm(f => ({ ...f, maxScore: +e.target.value }))} /></div>
              <div><Label className="text-xs font-semibold">Duration (min)</Label><Input type="number" className="mt-1 h-9" min={1} value={testForm.durationMinutes} onChange={e => setTestForm(f => ({ ...f, durationMinutes: +e.target.value }))} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label className="text-xs font-semibold">Difficulty</Label>
                <Select value={testForm.difficulty} onValueChange={v => setTestForm(f => ({ ...f, difficulty: v as TestDifficulty }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent><SelectItem value="easy">Easy</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="hard">Hard</SelectItem></SelectContent>
                </Select>
              </div>
              <div><Label className="text-xs font-semibold">Status</Label>
                <Select value={testForm.status} onValueChange={v => setTestForm(f => ({ ...f, status: v as TestStatus, isVisible: v === 'published' }))}>
                  <SelectTrigger className="mt-1 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>{(Object.entries(STATUS_CONFIG) as [TestStatus, any][]).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div><Label className="text-xs font-semibold">Created By</Label><Input className="mt-1 h-9" value={testForm.createdBy} onChange={e => setTestForm(f => ({ ...f, createdBy: e.target.value }))} placeholder="SuperAdmin" /></div>
            {testForm.status === 'scheduled' && <div><Label className="text-xs font-semibold">Schedule Date & Time</Label><Input type="datetime-local" className="mt-1 h-9" value={testForm.scheduledAt} onChange={e => setTestForm(f => ({ ...f, scheduledAt: e.target.value }))} /></div>}
            {/* Subject section tag — only shown when the current slot has subject sections */}
            {currentSubjects.length > 0 && (
              <div>
                <Label className="text-xs font-semibold">Subject Section</Label>
                <Select value={(testForm as any).subjectId || 'none'} onValueChange={v => setTestForm(f => ({ ...f, subjectId: v === 'none' ? '' : v } as any))}>
                  <SelectTrigger className="mt-1 h-9 text-xs"><SelectValue placeholder="Select subject section (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No subject (general)</SelectItem>
                    {currentSubjects.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                  </SelectContent>
                </Select>
                <p className="text-[10px] text-muted-foreground mt-0.5">Tag this test to a subject so clicking that subject chip filters to show it.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={saveTest} className="bg-indigo-600 hover:bg-indigo-700">{editingTestId ? 'Save' : 'Add Test'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={!!rejectDialog} onOpenChange={o => !o && setRejectDialog(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-rose-700"><ShieldX className="h-5 w-5" /> Reject Test</DialogTitle></DialogHeader>
          <div className="py-2 space-y-3">
            <p className="text-sm text-muted-foreground">Rejecting: <strong>{rejectDialog?.name}</strong></p>
            <div><Label className="text-xs font-semibold">Reason for Rejection</Label>
              <textarea className="mt-1 w-full text-sm border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-rose-300" rows={3} placeholder="Explain what needs to be fixed…" value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={rejectTest} className="bg-rose-600 hover:bg-rose-700">Reject & Notify</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Error Reports Dialog */}
      <Dialog open={!!errorReportDialog} onOpenChange={o => !o && setErrorReportDialog(null)}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader><DialogTitle className="flex items-center gap-2 text-rose-700"><AlertCircle className="h-5 w-5" /> Student Error Reports — {errorReportDialog?.name}</DialogTitle></DialogHeader>
          <div className="max-h-80 overflow-y-auto space-y-2 py-2">
            {(errorReportDialog?.errorReports ?? []).length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-8">No error reports</p>
            ) : (errorReportDialog?.errorReports ?? []).map(r => (
              <div key={r.id} className={`p-3 border rounded-lg ${r.resolved ? 'opacity-50 bg-slate-50' : 'bg-rose-50 border-rose-100'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold">Q#{r.question} — {r.issue}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Reported by {r.reporter} on {r.date}</p>
                  </div>
                  {!r.resolved && <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded font-bold">Unresolved</span>}
                  {r.resolved && <span className="text-[10px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-bold">Resolved</span>}
                </div>
              </div>
            ))}
          </div>
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Test */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete test?</AlertDialogTitle>
            <AlertDialogDescription>Permanently delete <strong>{deleteTarget?.name}</strong>. This cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => { if (deleteTarget) { deleteTest(categoryId, sectionId, examId, deleteTarget.slotKey, deleteTarget.testId); toast({ title: 'Deleted', variant: 'destructive' }); setDeleteTarget(null); appendAuditLog(examId, { action: 'Test deleted', entityType: 'test', entityName: deleteTarget.name, performedBy: 'SuperAdmin' }); } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Slot */}
      <AlertDialog open={!!deleteSlotTarget} onOpenChange={o => !o && setDeleteSlotTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {deleteSlotTarget?.isMain ? 'tab' : 'sub-tab'}?</AlertDialogTitle>
            <AlertDialogDescription>Delete <strong>"{deleteSlotTarget?.label}"</strong> and all its tests. Cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteSlotConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ======== Add Main Tab Dialog ======== */}
      <Dialog open={addTabOpen} onOpenChange={o => { setAddTabOpen(o); if (!o) { setNewTabLabel(''); setNewTabHasSubs(true); setNewSubTabsList([{ name: 'Full Test', hasSubjects: false, subjects: [], subjectInput: '' }]); } }}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-500" /> Add New Test Tab
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {/* Tab name */}
            <div>
              <Label className="text-xs font-semibold">Tab Name *</Label>
              <Input autoFocus className="mt-1 h-9" value={newTabLabel}
                onChange={e => setNewTabLabel(e.target.value)}
                placeholder="e.g. Prelims, Mains 2025, PYQ" />
            </div>

            {/* Has sub-tabs toggle */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
              <input type="checkbox" id="has-subs" checked={newTabHasSubs}
                onChange={e => setNewTabHasSubs(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
              <div>
                <Label htmlFor="has-subs" className="text-sm font-semibold cursor-pointer">This tab has sub-tabs</Label>
                <p className="text-[11px] text-muted-foreground">E.g. Prelims → Full Test, Sectional Test, Speed Test</p>
              </div>
            </div>

            {/* Sub-tab builder */}
            {newTabHasSubs && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs font-semibold text-slate-700">Sub-tabs</Label>
                  <button
                    onClick={() => setNewSubTabsList(prev => [...prev, { name: '', hasSubjects: false, subjects: [], subjectInput: '' }])}
                    className="text-xs text-indigo-600 flex items-center gap-1 hover:underline">
                    <Plus className="h-3 w-3" /> Add sub-tab
                  </button>
                </div>

                <div className="space-y-3">
                  {newSubTabsList.map((st, idx) => (
                    <div key={idx} className="border rounded-lg p-3 bg-white space-y-2">
                      {/* Sub-tab row */}
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded shrink-0">{idx + 1}</span>
                        <Input
                          className="h-8 text-xs flex-1"
                          placeholder={`Sub-tab name (e.g. Full Test, Sectional)`}
                          value={st.name}
                          onChange={e => setNewSubTabsList(prev => prev.map((s, i) => i === idx ? { ...s, name: e.target.value } : s))}
                        />
                        {newSubTabsList.length > 1 && (
                          <button onClick={() => setNewSubTabsList(prev => prev.filter((_, i) => i !== idx))} className="text-slate-300 hover:text-rose-500">
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* "Has subject sections?" toggle per sub-tab */}
                      <div className="flex items-center gap-2 pl-1">
                        <input
                          type="checkbox"
                          id={`sub-has-subj-${idx}`}
                          checked={st.hasSubjects}
                          onChange={e => setNewSubTabsList(prev => prev.map((s, i) => i === idx ? { ...s, hasSubjects: e.target.checked } : s))}
                          className="h-3.5 w-3.5 rounded border-slate-300 accent-indigo-600"
                        />
                        <Label htmlFor={`sub-has-subj-${idx}`} className="text-xs cursor-pointer text-slate-600">
                          Has subject sections (e.g. Reasoning, English, Quant)
                        </Label>
                      </div>

                      {/* Subject input for this sub-tab */}
                      {st.hasSubjects && (
                        <div className="pl-1 space-y-1.5">
                          <div className="flex flex-wrap gap-1.5">
                            {st.subjects.map((subj, si) => (
                              <span key={si} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                                {subj}
                                <button
                                  onClick={() => setNewSubTabsList(prev => prev.map((s, i) => i === idx ? { ...s, subjects: s.subjects.filter((_, j) => j !== si) } : s))}
                                  className="text-indigo-400 hover:text-rose-500 ml-0.5">
                                  <X className="h-2.5 w-2.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                          <div className="flex items-center gap-1.5">
                            <input
                              value={st.subjectInput}
                              onChange={e => setNewSubTabsList(prev => prev.map((s, i) => i === idx ? { ...s, subjectInput: e.target.value } : s))}
                              onKeyDown={e => {
                                if (e.key === 'Enter' && st.subjectInput.trim()) {
                                  setNewSubTabsList(prev => prev.map((s, i) => i === idx ? { ...s, subjects: [...s.subjects, s.subjectInput.trim()], subjectInput: '' } : s));
                                }
                              }}
                              placeholder="Type subject & press Enter (e.g. Reasoning)"
                              className="h-7 text-xs border rounded px-2 flex-1 outline-none focus:ring-1 ring-indigo-300"
                            />
                            <button
                              onClick={() => { if (st.subjectInput.trim()) setNewSubTabsList(prev => prev.map((s, i) => i === idx ? { ...s, subjects: [...s.subjects, s.subjectInput.trim()], subjectInput: '' } : s)); }}
                              className="h-7 px-2 bg-indigo-600 text-white text-xs rounded shrink-0">
                              + Add
                            </button>
                          </div>
                          <p className="text-[10px] text-muted-foreground">Press Enter or click + Add after each subject</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={addMainTab} disabled={!newTabLabel.trim()} className="bg-indigo-600 hover:bg-indigo-700">Add Tab</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ======== Add Sub-Tab Dialog ======== */}
      <Dialog open={addSubTabOpen} onOpenChange={o => { setAddSubTabOpen(o); if (!o) { setNewSubTabLabel(''); setNewSubTabHasSubjects(false); setNewSubTabSubjects([]); setNewSubTabSubjectInput(''); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Sub-Tab</DialogTitle>
          </DialogHeader>
          <div className="py-2 space-y-4">
            <p className="text-xs text-muted-foreground">Adding to: <strong className="text-slate-800">{tabDisplayLabel(activeMainTab)}</strong></p>

            <div>
              <Label className="text-xs font-semibold">Sub-Tab Name *</Label>
              <Input autoFocus className="mt-1 h-9" value={newSubTabLabel}
                onChange={e => setNewSubTabLabel(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !newSubTabHasSubjects) addSubTab(); }}
                placeholder="e.g. Full Test, Sectional, PYQ, Speed Test" />
            </div>

            {/* Has subject sections */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border">
              <input type="checkbox" id="subtab-has-subj" checked={newSubTabHasSubjects}
                onChange={e => setNewSubTabHasSubjects(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 accent-indigo-600" />
              <div>
                <Label htmlFor="subtab-has-subj" className="text-sm font-semibold cursor-pointer">Has subject sections</Label>
                <p className="text-[11px] text-muted-foreground">E.g. Reasoning, English, Quant (filters tests by subject)</p>
              </div>
            </div>

            {newSubTabHasSubjects && (
              <div className="space-y-2">
                <Label className="text-xs font-semibold">Subject Sections</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[28px]">
                  {newSubTabSubjects.map((subj, i) => (
                    <span key={i} className="inline-flex items-center gap-1 bg-indigo-50 border border-indigo-200 text-indigo-700 text-[11px] font-semibold px-2 py-0.5 rounded-full">
                      {subj}
                      <button onClick={() => setNewSubTabSubjects(prev => prev.filter((_, j) => j !== i))} className="text-indigo-400 hover:text-rose-500 ml-0.5">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </span>
                  ))}
                  {newSubTabSubjects.length === 0 && <p className="text-xs text-muted-foreground italic">No subjects added yet</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <input
                    value={newSubTabSubjectInput}
                    onChange={e => setNewSubTabSubjectInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter' && newSubTabSubjectInput.trim()) {
                        setNewSubTabSubjects(prev => [...prev, newSubTabSubjectInput.trim()]);
                        setNewSubTabSubjectInput('');
                      }
                    }}
                    placeholder="Type subject name & press Enter"
                    className="h-8 text-xs border rounded px-2 flex-1 outline-none focus:ring-1 ring-indigo-300"
                  />
                  <button
                    onClick={() => { if (newSubTabSubjectInput.trim()) { setNewSubTabSubjects(prev => [...prev, newSubTabSubjectInput.trim()]); setNewSubTabSubjectInput(''); } }}
                    className="h-8 px-3 bg-indigo-600 text-white text-xs rounded shrink-0">
                    + Add
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground">Press Enter after each subject. You can add more from the Subject Sections panel later.</p>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
            <Button onClick={addSubTab} disabled={!newSubTabLabel.trim()} className="bg-indigo-600 hover:bg-indigo-700">Add Sub-Tab</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  );
};

export default ExamTestsTab;
