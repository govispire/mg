
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
  Bell, AlertCircle, AlertTriangle, Search,
} from 'lucide-react';
import {
  ExamAlertEntry, ExamStatusType,
  getExamAlerts, saveExamAlerts,
  STATUS_OPTIONS, EXAM_CATEGORY_OPTIONS,
} from '@/data/examAlertsStore';

// ── Blank form ────────────────────────────────────────────────────────────────
const BLANK: Omit<ExamAlertEntry, 'id'> = {
  examName: '', organisation: '', categoryIds: ['banking'],
  vacancies: 0, qualification: 'Any Graduate', location: 'Pan India',
  applicationStartDate: '', applicationEndDate: '', examDate: '',
  statusType: 'application-open', description: '',
  isNew: false, isHot: false, isActive: true,
  urls: { notificationPdf: '', applicationForm: '', admitCardDownload: '', resultPage: '' },
};

// ── Status badge helper ───────────────────────────────────────────────────────
const STATUS_COLORS: Record<ExamStatusType, string> = {
  'application-open':     'bg-emerald-100 text-emerald-700 border-emerald-200',
  'notification-released':'bg-blue-100 text-blue-700 border-blue-200',
  'hall-ticket-out':      'bg-violet-100 text-violet-700 border-violet-200',
  'prelims-result-out':   'bg-amber-100 text-amber-700 border-amber-200',
  'mains-result-out':     'bg-amber-100 text-amber-700 border-amber-200',
  'overall-result-out':   'bg-orange-100 text-orange-700 border-orange-200',
  'waiting-list-out':     'bg-slate-100 text-slate-700 border-slate-200',
  'upcoming':             'bg-sky-100 text-sky-700 border-sky-200',
};

// ── Field helpers ─────────────────────────────────────────────────────────────
const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="block text-[10px] font-semibold text-gray-500 uppercase tracking-wide mb-1">{children}</label>
);

const TextField: React.FC<{ label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }> = ({ label, value, onChange, placeholder, required }) => (
  <div>
    <Label>{label}{required && ' *'}</Label>
    <input
      className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 bg-white"
      value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
    />
  </div>
);

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div>
    <div className="flex items-center gap-2 mb-3">
      <div className="h-px flex-1 bg-gray-100" />
      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{title}</span>
      <div className="h-px flex-1 bg-gray-100" />
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

// ── Main component ────────────────────────────────────────────────────────────
const ExamAlertsManager: React.FC = () => {
  const [entries, setEntries] = useState<ExamAlertEntry[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<Omit<ExamAlertEntry, 'id'>>(BLANK);
  const [searchQ, setSearchQ] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<ExamAlertEntry | null>(null);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => { setEntries(getExamAlerts()); }, []);

  const showToast = (msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const persist = (updated: ExamAlertEntry[]) => {
    setEntries(updated);
    saveExamAlerts(updated);
  };

  const setF = (partial: Partial<Omit<ExamAlertEntry, 'id'>>) => setForm(p => ({ ...p, ...partial }));
  const setUrl = (key: keyof ExamAlertEntry['urls'], val: string) =>
    setForm(p => ({ ...p, urls: { ...p.urls, [key]: val } }));

  const validate = () => {
    if (!form.examName.trim()) { showToast('Exam name is required', 'error'); return false; }
    if (!form.organisation.trim()) { showToast('Organisation is required', 'error'); return false; }
    return true;
  };

  const saveAdd = () => {
    if (!validate()) return;
    const entry: ExamAlertEntry = { id: `alert-${Date.now()}`, ...form };
    persist([...entries, entry]);
    setAdding(false); setForm(BLANK);
    showToast(`"${form.examName}" added successfully`);
  };

  const saveEdit = () => {
    if (!validate()) return;
    persist(entries.map(e => e.id === editingId ? { ...e, ...form } : e));
    setEditingId(null);
    showToast('Exam alert updated');
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;
    persist(entries.filter(e => e.id !== deleteTarget.id));
    showToast(`"${deleteTarget.examName}" deleted`, 'error');
    setDeleteTarget(null);
  };

  const startEdit = (entry: ExamAlertEntry) => {
    setEditingId(entry.id); setAdding(false);
    setForm({ ...entry, urls: { ...entry.urls } });
  };

  const cancelForm = () => { setAdding(false); setEditingId(null); setForm(BLANK); };

  const toggleActive = (id: string) =>
    persist(entries.map(e => e.id === id ? { ...e, isActive: !e.isActive } : e));

  const filtered = entries.filter(e =>
    e.examName.toLowerCase().includes(searchQ.toLowerCase()) ||
    e.organisation.toLowerCase().includes(searchQ.toLowerCase())
  );

  // ── Form Panel ──────────────────────────────────────────────────────────────
  const FormPanel = () => (
    <Card className="border-2 border-blue-100 bg-blue-50/30 mb-5">
      <CardHeader className="pb-2 pt-4 px-5">
        <CardTitle className="text-sm font-bold text-gray-800">
          {adding ? '➕ Add New Exam Alert' : '✏️ Edit Exam Alert'}
        </CardTitle>
      </CardHeader>
      <CardContent className="px-5 pb-5 space-y-5">
        <Section title="Basic Info">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Exam Name" value={form.examName} onChange={v => setF({ examName: v })} placeholder="e.g. IBPS PO 2025" required />
            <TextField label="Organisation" value={form.organisation} onChange={v => setF({ organisation: v })} placeholder="e.g. IBPS" required />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label>Category *</Label>
              <select
                className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                value={form.categoryIds[0]}
                onChange={e => setF({ categoryIds: [e.target.value] })}
              >
                {EXAM_CATEGORY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <TextField label="Qualification" value={form.qualification} onChange={v => setF({ qualification: v })} placeholder="Any Graduate" />
            <div>
              <Label>Total Vacancies</Label>
              <input type="number" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                value={form.vacancies || ''} onChange={e => setF({ vacancies: parseInt(e.target.value) || 0 })} placeholder="e.g. 4455" />
            </div>
          </div>
        </Section>

        <Section title="Dates & Location">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Apply Window Start</Label>
              <input type="date" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                value={form.applicationStartDate === 'TBA' ? '' : form.applicationStartDate}
                onChange={e => setF({ applicationStartDate: e.target.value })} />
            </div>
            <div>
              <Label>Apply Window End</Label>
              <input type="date" className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                value={form.applicationEndDate === 'TBA' ? '' : form.applicationEndDate}
                onChange={e => setF({ applicationEndDate: e.target.value })} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Exam Date (display text)" value={form.examDate} onChange={v => setF({ examDate: v })} placeholder="e.g. Oct 2025" />
            <TextField label="Location" value={form.location} onChange={v => setF({ location: v })} placeholder="Pan India" />
          </div>
        </Section>

        <Section title="Status">
          <div>
            <Label>Current Status *</Label>
            <select
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              value={form.statusType}
              onChange={e => setF({ statusType: e.target.value as ExamStatusType })}
            >
              {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </Section>

        <Section title="URLs">
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Notification PDF URL" value={form.urls.notificationPdf || ''} onChange={v => setUrl('notificationPdf', v)} placeholder="https://..." />
            <TextField label="Application Form URL" value={form.urls.applicationForm || ''} onChange={v => setUrl('applicationForm', v)} placeholder="https://..." />
            <TextField label="Admit Card Download URL" value={form.urls.admitCardDownload || ''} onChange={v => setUrl('admitCardDownload', v)} placeholder="https://..." />
            <TextField label="Result Page URL" value={form.urls.resultPage || ''} onChange={v => setUrl('resultPage', v)} placeholder="https://..." />
          </div>
        </Section>

        <Section title="Description">
          <div>
            <Label>Exam Description (shown to students)</Label>
            <textarea
              rows={3}
              className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/30 resize-none"
              value={form.description} onChange={e => setF({ description: e.target.value })}
              placeholder="Brief description about the exam, selection process, important info..."
            />
          </div>
        </Section>

        <Section title="Badges & Visibility">
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input type="checkbox" className="rounded" checked={form.isNew} onChange={e => setF({ isNew: e.target.checked })} />
              <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">NEW</span> Badge
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input type="checkbox" className="rounded" checked={form.isHot} onChange={e => setF({ isHot: e.target.checked })} />
              <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded font-bold">HOT</span> Badge
            </label>
            <label className="flex items-center gap-2 text-xs font-medium cursor-pointer select-none">
              <input type="checkbox" className="rounded" checked={form.isActive} onChange={e => setF({ isActive: e.target.checked })} />
              Visible to Students
            </label>
          </div>
        </Section>

        <div className="flex gap-2 pt-2 border-t border-gray-100">
          <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 gap-1.5"
            onClick={adding ? saveAdd : saveEdit}>
            <Save size={13} />{adding ? 'Add Exam Alert' : 'Save Changes'}
          </Button>
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5" onClick={cancelForm}>
            <X size={13} />Cancel
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="flex-1 overflow-y-auto p-6 space-y-5 max-w-5xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Bell size={18} className="text-blue-600" />
            Exam Alerts Manager
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Create and manage exam alerts shown on the student Exam Alerts page. Changes are live immediately.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {entries.length} entries · {entries.filter(e => e.isActive).length} active
          </Badge>
          {!adding && !editingId && (
            <Button size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700 gap-1"
              onClick={() => { setAdding(true); setEditingId(null); setForm(BLANK); }}>
              <Plus size={13} />Add Exam
            </Button>
          )}
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border ${
          toast.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {toast.type === 'success' ? <Check size={14} /> : <AlertCircle size={14} />}
          {toast.msg}
        </div>
      )}

      {/* Form Panel */}
      {(adding || editingId) && <FormPanel />}

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text" value={searchQ} onChange={e => setSearchQ(e.target.value)}
          placeholder="Search exam alerts..."
          className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/30 bg-white"
        />
      </div>

      {/* Entries List */}
      <div className="space-y-2">
        {filtered.length === 0 && !adding && (
          <div className="text-center py-16 text-gray-400">
            <Bell size={40} className="mx-auto mb-3 opacity-20" />
            <p className="font-medium">No exam alerts yet</p>
            <p className="text-sm mt-1">Click "Add Exam" to create the first alert</p>
          </div>
        )}

        {filtered.map(entry => {
          const isEditing = editingId === entry.id;
          if (isEditing) return null; // form is shown above
          const statusLabel = STATUS_OPTIONS.find(s => s.value === entry.statusType)?.label ?? entry.statusType;
          const statusCls = STATUS_COLORS[entry.statusType] ?? 'bg-gray-100 text-gray-700 border-gray-200';

          return (
            <Card key={entry.id} className={`border transition-all ${!entry.isActive ? 'opacity-50' : ''}`}>
              <div className="p-4 flex items-center justify-between gap-4">
                {/* Left info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <p className="font-semibold text-sm text-gray-900">{entry.examName}</p>
                    {entry.isNew && <span className="bg-red-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">NEW</span>}
                    {entry.isHot && <span className="bg-orange-500 text-white text-[9px] px-1.5 py-0.5 rounded font-bold">HOT</span>}
                    {!entry.isActive && <span className="bg-gray-200 text-gray-500 text-[9px] px-1.5 py-0.5 rounded font-bold">HIDDEN</span>}
                  </div>
                  <p className="text-xs text-gray-500">{entry.organisation}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusCls}`}>
                      {statusLabel}
                    </span>
                    <span className="text-[11px] text-gray-400">Vacancies: {entry.vacancies.toLocaleString()}</span>
                    <span className="text-[11px] text-gray-400">Exam: {entry.examDate}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button onClick={() => toggleActive(entry.id)}
                    title={entry.isActive ? 'Hide from students' : 'Show to students'}
                    className="p-1.5 rounded-md hover:bg-gray-100 text-gray-400 transition-colors">
                    {entry.isActive ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>
                  <button onClick={() => startEdit(entry)}
                    className="p-1.5 rounded-md hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition-colors">
                    <Edit2 size={15} />
                  </button>
                  <button onClick={() => setDeleteTarget(entry)}
                    className="p-1.5 rounded-md hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Info note */}
      <div className="flex items-start gap-2 bg-blue-50 border border-blue-100 rounded-lg px-4 py-3 text-xs text-blue-700">
        <Bell size={13} className="mt-0.5 flex-shrink-0" />
        <div>
          <strong>Live changes</strong> — All changes are immediately reflected on the student Exam Alerts page.
          Use the <strong>Eye icon</strong> to temporarily hide an entry without deleting it.
        </div>
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={open => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" /> Delete Exam Alert?
            </AlertDialogTitle>
            <AlertDialogDescription>
              You are about to permanently delete <strong>"{deleteTarget?.examName}"</strong>.<br /><br />
              This will <strong>immediately remove it from the student Exam Alerts page</strong>. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeleteTarget(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={confirmDelete}>
              Yes, Delete Permanently
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ExamAlertsManager;
