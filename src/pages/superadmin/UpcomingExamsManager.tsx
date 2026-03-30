import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Trash2, Edit2, Save, X, Check, Eye, EyeOff,
  Calendar, Bell, AlertCircle, GraduationCap, AlertTriangle,
} from 'lucide-react';
import {
  UpcomingExamEntry,
  getUpcomingExams,
  saveUpcomingExams,
  daysUntil,
  formatDisplayDate,
} from '@/data/upcomingExamsStore';
import { allSyllabusData } from '@/data/syllabusData';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const urgencyClass = (days: number) => {
  if (days < 0) return 'bg-slate-100 text-slate-500';
  if (days <= 30) return 'bg-red-100 text-red-700';
  if (days <= 90) return 'bg-amber-100 text-amber-700';
  return 'bg-emerald-100 text-emerald-700';
};

// ─── All exam categories from syllabusData ────────────────────────────────────
const EXAM_CATEGORIES = [
  { value: 'all',             label: '— All Categories —' },
  { value: 'banking',         label: '🏦 Banking' },
  { value: 'ssc',             label: '📋 SSC' },
  { value: 'railways-rrb',    label: '🚂 Railways / RRB' },
  { value: 'civil-services',  label: '🏛️ Civil Services (UPSC)' },
  { value: 'insurance',       label: '🛡️ Insurance' },
  { value: 'state-psc',       label: '📜 State PSC' },
  { value: 'defence',         label: '⚔️ Defence' },
];

const BLANK_ENTRY: Omit<UpcomingExamEntry, 'id'> = {
  examName: '',
  fullName: '',
  stage: 'Prelims',
  examDate: '',
  registrationDeadline: '',
  logo: '',
  category: 'banking',
  isActive: true,
  note: '',
};

// ─── Component ────────────────────────────────────────────────────────────────
const UpcomingExamsManager: React.FC = () => {
  const [entries, setEntries] = useState<UpcomingExamEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<UpcomingExamEntry, 'id'>>(BLANK_ENTRY);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [availableTiers, setAvailableTiers] = useState<string[]>([]);
  const [formCategory, setFormCategory] = useState<string>('all');   // category filter for catalog picker
  const [deleteTarget, setDeleteTarget] = useState<UpcomingExamEntry | null>(null); // for delete confirmation

  // All exams from catalog
  const catalogExams = Object.values(allSyllabusData);

  // Filtered exams based on selected category in the form
  const filteredCatalogExams = formCategory === 'all'
    ? catalogExams
    : catalogExams.filter(e => e.category === formCategory);

  useEffect(() => {
    setEntries(getUpcomingExams());
  }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const persist = (updated: UpcomingExamEntry[]) => {
    setEntries(updated);
    saveUpcomingExams(updated);
  };

  // ── CRUD helpers ──────────────────────────────────────────────────────────
  const startEdit = (entry: UpcomingExamEntry) => {
    setEditingId(entry.id);
    setAvailableTiers([]);
    // Pre-set category filter to the exam's category
    setFormCategory(entry.category || 'all');
    setForm({
      examName: entry.examName,
      fullName: entry.fullName,
      stage: entry.stage,
      examDate: entry.examDate,
      registrationDeadline: entry.registrationDeadline || '',
      logo: entry.logo || '',
      category: entry.category,
      isActive: entry.isActive,
      note: entry.note || '',
    });
  };

  const saveEdit = () => {
    if (!form.examName || !form.examDate) {
      showToast('Exam name and date are required', 'error');
      return;
    }
    const updated = entries.map(e =>
      e.id === editingId ? { ...e, ...form } : e
    );
    persist(updated);
    setEditingId(null);
    showToast('Exam updated');
  };

  const saveAdd = () => {
    if (!form.examName || !form.examDate) {
      showToast('Exam name and date are required', 'error');
      return;
    }
    const newEntry: UpcomingExamEntry = {
      id: `upcoming-${Date.now()}`,
      ...form,
    };
    persist([...entries, newEntry]);
    setAdding(false);
    setForm(BLANK_ENTRY);
    setFormCategory('all');
    showToast(`"${form.examName}" added to dashboard`);
  };

  // Called after user CONFIRMS deletion in the AlertDialog
  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(entries.filter(e => e.id !== deleteTarget.id));
    showToast(`"${deleteTarget.examName}" removed`, 'error');
    setDeleteTarget(null);
  };

  const toggleActive = (id: string) => {
    const updated = entries.map(e =>
      e.id === id ? { ...e, isActive: !e.isActive } : e
    );
    persist(updated);
  };

  // Auto-fill form from catalog when an exam is selected
  const onCatalogSelect = (examId: string) => {
    const exam = allSyllabusData[examId];
    if (!exam) return;
    const tiers = exam.tiers.map(t => t.name);
    setAvailableTiers(tiers);
    setForm(prev => ({
      ...prev,
      examName: exam.examName,
      fullName: exam.fullName,
      logo: exam.logo || '',
      category: exam.category,
      stage: tiers[0] || 'Prelims',
    }));
  };

  // When category filter changes in form, reset catalog selection
  const onFormCategoryChange = (cat: string) => {
    setFormCategory(cat);
    // Update the form category too (if not 'all')
    if (cat !== 'all') {
      setForm(prev => ({ ...prev, category: cat }));
    }
    setAvailableTiers([]);
  };

  // ── Form panel ────────────────────────────────────────────────────────────
  const FormPanel = () => (
    <Card className="border-2 border-[#003366]/30 bg-[#003366]/[0.02]">
      <CardHeader className="pb-3 pt-4 px-4">
        <CardTitle className="text-sm font-bold text-[#003366]">
          {adding ? 'Add New Upcoming Exam' : 'Edit Exam Entry'}
        </CardTitle>

        {/* Step 1: Category filter */}
        <div className="mt-3 space-y-1">
          <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
            Step 1 — Select Exam Category
          </label>
          <div className="flex flex-wrap gap-1.5">
            {EXAM_CATEGORIES.map(cat => (
              <button
                key={cat.value}
                onClick={() => onFormCategoryChange(cat.value)}
                className={`text-[11px] font-medium px-2.5 py-1 rounded-full border transition-all ${
                  formCategory === cat.value
                    ? 'bg-[#003366] text-white border-[#003366]'
                    : 'bg-white text-slate-600 border-slate-200 hover:border-[#003366]/40 hover:bg-[#003366]/5'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Catalog picker filtered by category */}
        <div className="mt-3">
          <label className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">
            Step 2 — Quick-fill from Exam Catalog
          </label>
          <select
            className="mt-1 w-full text-xs border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
            defaultValue=""
            onChange={e => onCatalogSelect(e.target.value)}
          >
            <option value="" disabled>
              {filteredCatalogExams.length === 0
                ? 'No exams in this category…'
                : `Select from ${filteredCatalogExams.length} exam(s)…`}
            </option>
            {filteredCatalogExams.map(e => (
              <option key={e.examId} value={e.examId}>{e.examName} — {e.fullName}</option>
            ))}
          </select>
          {filteredCatalogExams.length === 0 && formCategory !== 'all' && (
            <p className="text-[10px] text-amber-600 mt-1">
              ⚠ No catalog exams found for this category. You can still fill manually below.
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-4 space-y-3">
        <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide -mb-1">
          Step 3 — Fill / Confirm Details
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Exam Name *</label>
            <input className="mt-1 w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              placeholder="e.g. IBPS PO"
              value={form.examName}
              onChange={e => setForm(p => ({ ...p, examName: e.target.value }))} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Stage</label>
            {availableTiers.length > 0 ? (
              <select
                className="mt-1 w-full text-xs border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
                value={form.stage}
                onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}
              >
                {availableTiers.map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            ) : (
              <input className="mt-1 w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
                placeholder="Prelims / Mains / Interview"
                value={form.stage}
                onChange={e => setForm(p => ({ ...p, stage: e.target.value }))} />
            )}
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Full Name</label>
          <input className="mt-1 w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
            placeholder="e.g. Institute of Banking Personnel Selection — PO"
            value={form.fullName}
            onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))} />
        </div>

        {/* Category (manual override) */}
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
          <select
            className="mt-1 w-full text-xs border rounded-md px-2 py-1.5 bg-white focus:outline-none focus:ring-1 focus:ring-[#003366]"
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
          >
            {EXAM_CATEGORIES.filter(c => c.value !== 'all').map(cat => (
              <option key={cat.value} value={cat.value}>{cat.label}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Exam Date *</label>
            <input type="date" className="mt-1 w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.examDate}
              onChange={e => setForm(p => ({ ...p, examDate: e.target.value }))} />
          </div>
          <div>
            <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Reg. Deadline</label>
            <input type="date" className="mt-1 w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
              value={form.registrationDeadline || ''}
              onChange={e => setForm(p => ({ ...p, registrationDeadline: e.target.value }))} />
          </div>
        </div>

        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Note (shown to students)</label>
          <input className="mt-1 w-full text-xs border rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#003366]"
            placeholder="e.g. Notification expected in August"
            value={form.note || ''}
            onChange={e => setForm(p => ({ ...p, note: e.target.value }))} />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
            <input type="checkbox" className="rounded"
              checked={form.isActive}
              onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))} />
            Show on student dashboard
          </label>
        </div>

        <div className="flex gap-2 pt-1">
          <Button size="sm" className="h-8 text-xs bg-[#003366] gap-1"
            onClick={adding ? saveAdd : saveEdit}>
            <Save size={12} />{adding ? 'Add to Dashboard' : 'Save Changes'}
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1"
            onClick={() => { setAdding(false); setEditingId(null); setForm(BLANK_ENTRY); setAvailableTiers([]); setFormCategory('all'); }}>
            <X size={12} />Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  // ── Render ────────────────────────────────────────────────────────────────
  const sorted = [...entries].sort((a, b) =>
    new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-4xl">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-foreground flex items-center gap-2">
            <Bell size={18} className="text-[#003366]" />
            Upcoming Exams Manager
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Control which exam countdowns appear on the student dashboard. Changes are live immediately.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {sorted.length} exams · {sorted.filter(e => e.isActive).length} active
          </Badge>
          {!adding && !editingId && (
            <Button size="sm" className="h-8 text-xs bg-[#003366] gap-1"
              onClick={() => { setAdding(true); setForm(BLANK_ENTRY); setFormCategory('all'); }}>
              <Plus size={13} />Add Exam
            </Button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${toast.type === 'success'
          ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
          : 'bg-red-50 border-red-200 text-red-700'}`}>
          {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Add form */}
      {adding && <FormPanel />}

      {/* Exam list */}
      <div className="space-y-3">
        {sorted.length === 0 && !adding && (
          <div className="text-center py-16 text-muted-foreground">
            <Bell size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No exams added yet</p>
            <p className="text-sm mt-1">Click "Add Exam" to schedule the first upcoming exam</p>
          </div>
        )}

        {sorted.map(entry => {
          const days = daysUntil(entry.examDate);
          const isEditing = editingId === entry.id;

          return (
            <div key={entry.id}>
              {isEditing ? (
                <FormPanel />
              ) : (
                <Card className={`border transition-all ${!entry.isActive ? 'opacity-50' : ''}`}>
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-3">
                      {/* Left: logo + info */}
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 rounded-lg bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden border">
                          {entry.logo ? (
                            <img src={entry.logo} alt={entry.examName} className="w-8 h-8 object-contain" />
                          ) : (
                            <GraduationCap size={18} className="text-muted-foreground" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <p className="font-bold text-sm">{entry.examName}</p>
                            <span className="text-[10px] text-muted-foreground border rounded-full px-1.5 py-0.5">{entry.stage}</span>
                            <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 rounded-full px-1.5 py-0.5 capitalize">
                              {entry.category}
                            </span>
                            {!entry.isActive && (
                              <span className="text-[10px] bg-slate-100 text-slate-500 rounded-full px-1.5 py-0.5">Hidden</span>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate">{entry.fullName}</p>
                          <div className="flex items-center gap-3 mt-1 text-[11px] text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Calendar size={10} />
                              {formatDisplayDate(entry.examDate)}
                            </span>
                            {entry.registrationDeadline && (
                              <span className="flex items-center gap-1 text-amber-600">
                                Reg. deadline: {formatDisplayDate(entry.registrationDeadline)}
                              </span>
                            )}
                          </div>
                          {entry.note && (
                            <p className="text-[10px] text-primary/70 mt-0.5">{entry.note}</p>
                          )}
                        </div>
                      </div>

                      {/* Right: countdown + actions */}
                      <div className="flex items-center gap-2 shrink-0">
                        <div className={`flex flex-col items-center px-3 py-1.5 rounded-lg ${urgencyClass(days)}`}>
                          <span className="text-xl font-black leading-none">
                            {days < 0 ? '—' : days === 0 ? '🎯' : days}
                          </span>
                          <span className="text-[9px] font-semibold uppercase tracking-wide opacity-80">
                            {days < 0 ? 'Past' : days === 0 ? 'Today!' : 'days left'}
                          </span>
                        </div>

                        {/* Toggle visibility */}
                        <button
                          onClick={() => toggleActive(entry.id)}
                          title={entry.isActive ? 'Hide from students' : 'Show to students'}
                          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
                        >
                          {entry.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => startEdit(entry)}
                          className="p-1.5 rounded-md hover:bg-muted/50 text-muted-foreground transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>

                        {/* Delete — opens confirmation dialog */}
                        <button
                          onClick={() => setDeleteTarget(entry)}
                          className="p-1.5 rounded-md hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          );
        })}
      </div>

      {/* Live preview note */}
      <div className="flex items-start gap-2 bg-sky-50 border border-sky-200 rounded-lg px-4 py-3 text-xs text-sky-700">
        <Bell size={13} className="mt-0.5 shrink-0" />
        <div>
          <strong>Live changes</strong> — All edits are immediately reflected on the student dashboard.
          Use <strong>Eye icon</strong> to temporarily hide an exam without deleting it.
          Exams are automatically sorted by exam date on the student widget.
        </div>
      </div>

      {/* ── Delete Confirmation AlertDialog ── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Delete Upcoming Exam?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete{' '}
              <strong>"{deleteTarget?.examName} — {deleteTarget?.stage}"</strong>.
              <br /><br />
              This will <strong>immediately remove it from the student dashboard</strong>.
              This action cannot be undone. If you want to temporarily hide it instead, use the{' '}
              <strong>Eye icon</strong> to toggle visibility.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>
              Cancel — Keep It
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDelete}
            >
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default UpcomingExamsManager;
