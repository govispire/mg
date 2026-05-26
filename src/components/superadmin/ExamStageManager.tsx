/**
 * ExamStageManager
 * ─────────────────────────────────────────────────────────────────────────────
 * Full-featured stage management panel for SuperAdmin.
 * Embedded inside SuperAdminExamManager as a tab or collapsible section.
 *
 * Features:
 *  • Add / edit / delete stages
 *  • Free-text stage name (no restriction)
 *  • Date picker
 *  • Status: upcoming | live | completed | postponed | cancelled | custom
 *  • Visibility toggle (students see/hide)
 *  • Reorder (up/down)
 *  • Custom colour picker (SuperAdmin picks a gradient per stage)
 *  • Optional notes (admin-only)
 *  • Optional link/attachment URL
 *  • Real-time preview of how the countdown widget will look
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useExamStages, getDaysLeft, type ExamStageItem, type StageStatus,
} from '@/hooks/useExamStages';
import {
  Plus, Pencil, Trash2, Eye, EyeOff, ArrowUp, ArrowDown,
  Calendar, Clock, Link, FileText, AlertTriangle, CheckCircle2,
  Radio, Info, ChevronRight, Zap, RefreshCw, Palette,
} from 'lucide-react';

// ─── Preset colour swatches ───────────────────────────────────────────────────

export const STAGE_GRADIENTS = [
  { label: 'Ocean Blue',   value: 'linear-gradient(160deg,#1e40af,#2563eb,#0ea5e9)' },
  { label: 'Royal Purple', value: 'linear-gradient(160deg,#4c1d95,#7c3aed,#a855f7)' },
  { label: 'Emerald',      value: 'linear-gradient(160deg,#065f46,#059669,#34d399)' },
  { label: 'Rose Red',     value: 'linear-gradient(160deg,#9f1239,#e11d48,#fb7185)' },
  { label: 'Sky Blue',     value: 'linear-gradient(160deg,#1e3a5f,#0369a1,#38bdf8)' },
  { label: 'Amber Gold',   value: 'linear-gradient(160deg,#78350f,#d97706,#fbbf24)' },
  { label: 'Indigo',       value: 'linear-gradient(160deg,#312e81,#4338ca,#818cf8)' },
  { label: 'Teal',         value: 'linear-gradient(160deg,#134e4a,#0f766e,#2dd4bf)' },
  { label: 'Hot Pink',     value: 'linear-gradient(160deg,#831843,#be185d,#f472b6)' },
  { label: 'Sunset',       value: 'linear-gradient(160deg,#7c2d12,#ea580c,#fb923c)' },
  { label: 'Mint',         value: 'linear-gradient(160deg,#14532d,#16a34a,#86efac)' },
  { label: 'Crimson',      value: 'linear-gradient(160deg,#450a0a,#b91c1c,#f87171)' },
];

// ─── Status config ─────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
  upcoming:  { label: 'Upcoming',  color: 'text-blue-700',  bg: 'bg-blue-50 border-blue-200',  icon: <Clock className="h-3 w-3" /> },
  live:      { label: 'Live Now',  color: 'text-green-700', bg: 'bg-green-50 border-green-200', icon: <Radio className="h-3 w-3 animate-pulse" /> },
  completed: { label: 'Completed', color: 'text-gray-600',  bg: 'bg-gray-100 border-gray-200', icon: <CheckCircle2 className="h-3 w-3" /> },
  postponed: { label: 'Postponed', color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <AlertTriangle className="h-3 w-3" /> },
  cancelled: { label: 'Cancelled', color: 'text-red-700',   bg: 'bg-red-50 border-red-200',    icon: <AlertTriangle className="h-3 w-3" /> },
};

function getStatusConfig(status: string) {
  return STATUS_CONFIG[status] ?? {
    label: status,
    color: 'text-purple-700',
    bg: 'bg-purple-50 border-purple-200',
    icon: <Zap className="h-3 w-3" />,
  };
}

// ─── Default form ─────────────────────────────────────────────────────────────

const defaultForm = (): Omit<ExamStageItem, 'id' | 'examId' | 'createdAt' | 'updatedAt'> => ({
  name: '',
  order: 1,
  date: '',
  status: 'upcoming',
  isVisible: true,
  notes: '',
  link: '',
  color: STAGE_GRADIENTS[0].value,
});

// ─── Stage Card ───────────────────────────────────────────────────────────────

const StageCard: React.FC<{
  stage: ExamStageItem;
  idx: number;
  total: number;
  onEdit: () => void;
  onDelete: () => void;
  onToggleVisibility: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}> = ({ stage, idx, total, onEdit, onDelete, onToggleVisibility, onMoveUp, onMoveDown }) => {
  const daysLeft = getDaysLeft(stage.date);
  const sc = getStatusConfig(stage.status);
  const isOverdue = daysLeft !== null && daysLeft < 0 && stage.status !== 'completed' && stage.status !== 'cancelled';
  // Show a small colour swatch from the stage's stored colour
  const stageColor = stage.color || STAGE_GRADIENTS[idx % STAGE_GRADIENTS.length].value;

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-all
      ${!stage.isVisible ? 'opacity-60 border-dashed bg-gray-50' : 'bg-white shadow-sm'}
      ${isOverdue ? 'border-red-300' : ''}`}>

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Order badge with stage colour */}
          <div
            className="w-7 h-7 rounded-full text-white text-xs font-black flex items-center justify-center shrink-0 shadow-sm"
            style={{ background: stageColor }}
          >
            {stage.order}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-bold text-sm text-foreground">{stage.name}</p>
              {!stage.isVisible && (
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-gray-200 text-gray-500 font-medium">Hidden</span>
              )}
              {/* Colour swatch chip */}
              <span
                className="inline-block w-12 h-3 rounded-full border border-white/40 shadow-sm"
                style={{ background: stageColor }}
                title={STAGE_GRADIENTS.find(g => g.value === stage.color)?.label || 'Custom colour'}
              />
            </div>
            {/* Status badge */}
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${sc.bg} ${sc.color}`}>
                {sc.icon}{sc.label}
              </span>
              {stage.date && (
                <span className={`text-[10px] font-medium flex items-center gap-1
                  ${isOverdue ? 'text-red-600' : daysLeft !== null && daysLeft <= 7 ? 'text-amber-600' : 'text-muted-foreground'}`}>
                  <Calendar className="h-3 w-3" />
                  {new Date(stage.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  {daysLeft !== null && (
                    <span className="ml-1 font-bold">
                      {isOverdue ? `(${Math.abs(daysLeft)}d ago)` :
                       daysLeft === 0 ? '(Today!)' :
                       `(${daysLeft}d left)`}
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={onMoveUp} disabled={idx === 0}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="Move up"
          >
            <ArrowUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onMoveDown} disabled={idx === total - 1}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-gray-100 disabled:opacity-30 transition-colors"
            title="Move down"
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onToggleVisibility}
            className="p-1 rounded text-muted-foreground hover:text-foreground hover:bg-gray-100 transition-colors"
            title={stage.isVisible ? 'Hide from students' : 'Show to students'}
          >
            {stage.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
          </button>
          <button
            onClick={onEdit}
            className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors"
            title="Edit"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Delete"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Notes / Link */}
      {(stage.notes || stage.link) && (
        <div className="pl-10 space-y-1">
          {stage.notes && (
            <p className="text-[11px] text-muted-foreground flex items-start gap-1.5">
              <FileText className="h-3 w-3 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{stage.notes}</span>
            </p>
          )}
          {stage.link && (
            <a href={stage.link} target="_blank" rel="noopener noreferrer"
              className="text-[11px] text-primary flex items-center gap-1.5 hover:underline">
              <Link className="h-3 w-3 shrink-0" />
              Official Notice / Attachment
              <ChevronRight className="h-3 w-3" />
            </a>
          )}
        </div>
      )}
    </div>
  );
};

// ─── Colour Picker ────────────────────────────────────────────────────────────

const ColourPicker: React.FC<{
  value: string;
  onChange: (val: string) => void;
}> = ({ value, onChange }) => {
  const [showCustom, setShowCustom] = useState(false);
  const isPreset = STAGE_GRADIENTS.some(g => g.value === value);

  return (
    <div className="space-y-3">
      {/* Preset swatches grid */}
      <div className="grid grid-cols-6 gap-2">
        {STAGE_GRADIENTS.map(g => (
          <button
            key={g.value}
            type="button"
            title={g.label}
            onClick={() => { onChange(g.value); setShowCustom(false); }}
            className={`h-8 rounded-lg transition-all border-2 ${
              value === g.value ? 'border-white ring-2 ring-primary scale-110 shadow-lg' : 'border-transparent hover:scale-105'
            }`}
            style={{ background: g.value }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <p className="text-[10px] text-muted-foreground">
          {isPreset
            ? `Selected: ${STAGE_GRADIENTS.find(g => g.value === value)?.label}`
            : 'Custom gradient active'}
        </p>
        <button
          type="button"
          onClick={() => setShowCustom(v => !v)}
          className="text-[10px] text-primary underline"
        >
          {showCustom ? 'Hide custom input' : 'Use custom CSS gradient →'}
        </button>
      </div>
      {showCustom && (
        <div className="space-y-1">
          <Input
            placeholder="e.g. linear-gradient(160deg,#1a1a2e,#16213e,#0f3460)"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="font-mono text-xs"
          />
          <p className="text-[10px] text-muted-foreground">
            Paste any valid CSS gradient. Preview updates instantly.
          </p>
        </div>
      )}
    </div>
  );
};

// ─── Stage Dialog ─────────────────────────────────────────────────────────────

const StageDialog: React.FC<{
  open: boolean;
  initial: Omit<ExamStageItem, 'id' | 'examId' | 'createdAt' | 'updatedAt'>;
  onSave: (form: Omit<ExamStageItem, 'id' | 'examId' | 'createdAt' | 'updatedAt'>) => void;
  onClose: () => void;
  isEditing: boolean;
  nextOrder: number;
}> = ({ open, initial, onSave, onClose, isEditing, nextOrder }) => {
  const [form, setForm] = useState(initial);
  const [customStatus, setCustomStatus] = useState(
    Object.keys(STATUS_CONFIG).includes(initial.status) ? '' : initial.status,
  );
  const [useCustomStatus, setUseCustomStatus] = useState(
    !Object.keys(STATUS_CONFIG).includes(initial.status),
  );

  React.useEffect(() => {
    setForm(initial);
    const isKnown = Object.keys(STATUS_CONFIG).includes(initial.status);
    setUseCustomStatus(!isKnown);
    setCustomStatus(!isKnown ? initial.status : '');
  }, [initial, open]);

  const ef = (field: keyof typeof form, value: string | boolean | number) =>
    setForm(f => ({ ...f, [field]: value }));

  const handleSave = () => {
    const finalStatus = useCustomStatus && customStatus.trim() ? customStatus.trim() : form.status;
    onSave({ ...form, status: finalStatus, order: form.order || nextOrder });
  };

  const previewBg = form.color || STAGE_GRADIENTS[0].value;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            {isEditing ? 'Edit Stage' : 'Add New Stage'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Stage Name */}
          <div>
            <Label className="text-xs font-semibold">Stage Name *</Label>
            <Input
              className="mt-1" placeholder="e.g. Prelims, Mains, Interview, Document Verification…"
              value={form.name} onChange={e => ef('name', e.target.value)}
            />
            <p className="text-[10px] text-muted-foreground mt-1">Any name — completely free text, no restrictions</p>
          </div>

          {/* Order + Date row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs font-semibold">Stage Order</Label>
              <Input
                className="mt-1" type="number" min={1} placeholder="1"
                value={form.order} onChange={e => ef('order', parseInt(e.target.value) || nextOrder)}
              />
            </div>
            <div>
              <Label className="text-xs font-semibold">Exam Date</Label>
              <Input
                className="mt-1" type="date"
                value={form.date ?? ''} onChange={e => ef('date', e.target.value)}
              />
            </div>
          </div>

          {/* Status */}
          <div>
            <Label className="text-xs font-semibold">Status</Label>
            <div className="mt-1 space-y-2">
              {!useCustomStatus ? (
                <Select value={form.status} onValueChange={v => ef('status', v)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>
                        <span className={v.color}>{v.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="e.g. Registration Open, Admit Card Released, Result Awaited…"
                  value={customStatus}
                  onChange={e => setCustomStatus(e.target.value)}
                />
              )}
              <button
                type="button"
                onClick={() => { setUseCustomStatus(!useCustomStatus); setCustomStatus(''); }}
                className="text-[10px] text-primary underline"
              >
                {useCustomStatus ? '← Use standard status' : 'Use custom status label →'}
              </button>
            </div>
          </div>

          {/* ── Countdown Colour Picker ── */}
          <div>
            <Label className="text-xs font-semibold flex items-center gap-1.5">
              <Palette className="h-3.5 w-3.5 text-primary" />
              Countdown Card Colour
            </Label>
            <p className="text-[10px] text-muted-foreground mb-2 mt-0.5">
              Pick a colour for this stage's countdown card on both dashboard and test page.
            </p>
            <ColourPicker value={form.color || STAGE_GRADIENTS[0].value} onChange={v => ef('color', v)} />
          </div>

          {/* Visibility */}
          <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg">
            <Switch checked={form.isVisible} onCheckedChange={v => ef('isVisible', v)} id="stage-visible" />
            <Label htmlFor="stage-visible" className="cursor-pointer flex-1">
              <p className="text-sm font-semibold">Visible to Students</p>
              <p className="text-xs text-muted-foreground">
                {form.isVisible ? 'Students can see this stage in their dashboard' : 'Hidden — only admins can see this stage'}
              </p>
            </Label>
            {form.isVisible ? <Eye className="h-4 w-4 text-green-600" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
          </div>

          {/* Notes */}
          <div>
            <Label className="text-xs font-semibold">Admin Notes (optional)</Label>
            <textarea
              className="w-full mt-1 border border-border rounded-lg p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-16"
              placeholder="Internal notes — not visible to students"
              value={form.notes} onChange={e => ef('notes', e.target.value)}
            />
          </div>

          {/* Link */}
          <div>
            <Label className="text-xs font-semibold">Attachment / Official Notice URL (optional)</Label>
            <Input
              className="mt-1" placeholder="https://official-notice-link.com"
              value={form.link} onChange={e => ef('link', e.target.value)}
            />
          </div>

          {/* Live Preview */}
          {form.name && (
            <div>
              <Label className="text-xs font-semibold mb-2 block">Live Preview — Countdown Card</Label>
              <div
                className="rounded-xl p-5 text-white text-center relative overflow-hidden shadow-lg"
                style={{ background: previewBg }}
              >
                <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                <div className="absolute bottom-4 -left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-70 mb-1">Your Countdown</p>
                  <p className="text-5xl font-black leading-none">{Math.max(0, form.date ? (getDaysLeft(form.date) ?? 0) : 0)}</p>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-90 mt-1">Days Left</p>
                  <div className="mt-2 w-8 h-0.5 bg-white/40 rounded-full mx-auto" />
                  <p className="text-[10px] mt-1.5 opacity-70 uppercase tracking-wide">To {form.name || '…'} Day</p>
                  {form.date && (
                    <div className="mt-3 bg-white/15 border border-white/25 rounded-xl px-3 py-2 flex items-center gap-2 mx-auto w-fit">
                      <Calendar className="w-3 h-3" />
                      <div>
                        <p className="font-black text-xs">
                          {new Date(form.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                        <p className="text-[9px] opacity-65">{form.name} Exam Date</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={!form.name.trim()}>
            {isEditing ? 'Save Changes' : 'Add Stage'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

interface ExamStageManagerProps {
  examId: string;
  examName: string;
}

const ExamStageManager: React.FC<ExamStageManagerProps> = ({ examId, examName }) => {
  const { toast } = useToast();
  const { stages, addStage, updateStage, deleteStage, toggleVisibility, reorder, nextStage } = useExamStages(examId);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formInitial, setFormInitial] = useState<Omit<ExamStageItem, 'id' | 'examId' | 'createdAt' | 'updatedAt'>>(defaultForm());
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const nextOrder = stages.length > 0 ? Math.max(...stages.map(s => s.order)) + 1 : 1;

  const openAdd = () => {
    setEditingId(null);
    setFormInitial({ ...defaultForm(), order: nextOrder });
    setDialogOpen(true);
  };

  const openEdit = (stage: ExamStageItem) => {
    setEditingId(stage.id);
    setFormInitial({
      name: stage.name, order: stage.order, date: stage.date,
      status: stage.status, isVisible: stage.isVisible,
      notes: stage.notes, link: stage.link,
      color: stage.color || STAGE_GRADIENTS[0].value,
    });
    setDialogOpen(true);
  };

  const handleSave = (form: Omit<ExamStageItem, 'id' | 'examId' | 'createdAt' | 'updatedAt'>) => {
    if (editingId) {
      updateStage(editingId, form);
      toast({
        title: '✅ Stage Updated',
        description: `"${form.name}" updated — colour & data reflect instantly everywhere.`,
      });
    } else {
      addStage(form);
      toast({
        title: '✅ Stage Added',
        description: `"${form.name}" added — students will see it immediately with your chosen colour.`,
      });
    }
    setDialogOpen(false);
  };

  const handleDelete = (stageId: string) => {
    deleteStage(stageId);
    toast({ title: 'Stage deleted', variant: 'destructive' });
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Exam Stages
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage all stages for <strong>{examName}</strong>. Updates reflect instantly everywhere.
          </p>
        </div>
        <Button size="sm" onClick={openAdd} className="gap-1.5 h-9">
          <Plus className="h-4 w-4" /> Add Stage
        </Button>
      </div>

      {/* Sync indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2.5 flex items-center gap-2 text-xs text-green-700">
        <RefreshCw className="h-3.5 w-3.5" />
        <span>
          <strong>Live Sync:</strong> Any changes here update the student dashboard, test page, countdown widget, calendar, and notification system <strong>instantly</strong>.
        </span>
      </div>

      {/* Next stage summary */}
      {nextStage && (
        <div
          className="border border-white/20 rounded-xl p-4 flex items-center gap-4 text-white shadow-md"
          style={{ background: nextStage.color || STAGE_GRADIENTS[0].value }}
        >
          <div className="w-12 h-12 rounded-full bg-white/20 text-white flex flex-col items-center justify-center shrink-0">
            <span className="text-lg font-black leading-none">{Math.max(0, getDaysLeft(nextStage.date) ?? 0)}</span>
            <span className="text-[8px] font-bold uppercase">days</span>
          </div>
          <div>
            <p className="text-xs font-semibold opacity-70 uppercase tracking-wide">Next Upcoming Stage</p>
            <p className="font-bold">{nextStage.name}</p>
            {nextStage.date && (
              <p className="text-xs opacity-70 mt-0.5">
                {new Date(nextStage.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs opacity-70">This is what students see in the countdown</p>
          </div>
        </div>
      )}

      {/* Stages list */}
      {stages.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed rounded-xl">
          <Calendar className="h-12 w-12 mx-auto mb-3 text-muted-foreground/30" />
          <p className="font-semibold text-muted-foreground">No stages yet</p>
          <p className="text-sm text-muted-foreground/70 mt-1 mb-4">
            Add stages like Prelims, Mains, Interview — students will see countdown & preparation tabs
          </p>
          <Button size="sm" onClick={openAdd} className="gap-1.5">
            <Plus className="h-4 w-4" /> Add First Stage
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {stages.map((stage, idx) => (
            <StageCard
              key={stage.id}
              stage={stage}
              idx={idx}
              total={stages.length}
              onEdit={() => openEdit(stage)}
              onDelete={() => setDeleteTarget(stage.id)}
              onToggleVisibility={() => {
                toggleVisibility(stage.id);
                toast({ title: stage.isVisible ? 'Stage hidden from students' : 'Stage visible to students' });
              }}
              onMoveUp={() => reorder(stage.id, 'up')}
              onMoveDown={() => reorder(stage.id, 'down')}
            />
          ))}
        </div>
      )}

      {/* Student view preview */}
      {stages.filter(s => s.isVisible).length > 0 && (
        <Card className="border-dashed">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Student View Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4">
            <p className="text-xs text-muted-foreground mb-3">This is how students see the stages in their dashboard:</p>
            <div className="flex flex-wrap gap-2">
              {stages.filter(s => s.isVisible).map((stage, idx) => {
                const daysLeft = getDaysLeft(stage.date);
                const stageColor = stage.color || STAGE_GRADIENTS[idx % STAGE_GRADIENTS.length].value;
                return (
                  <div key={stage.id} className="bg-white border rounded-xl px-3 py-2 flex items-center gap-2 shadow-sm">
                    <div
                      className="w-6 h-6 rounded-md flex items-center justify-center text-white text-[10px] font-black shadow-sm"
                      style={{ background: stageColor }}
                    >
                      {stage.order}
                    </div>
                    <div>
                      <p className="text-xs font-bold">{stage.name}</p>
                      {daysLeft !== null && (
                        <p className={`text-[10px] ${daysLeft < 0 ? 'text-red-500' : daysLeft <= 7 ? 'text-amber-500' : 'text-muted-foreground'}`}>
                          {daysLeft < 0 ? `${Math.abs(daysLeft)}d ago` : daysLeft === 0 ? 'Today!' : `${daysLeft}d left`}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-3 p-3 bg-blue-50 rounded-lg">
              <p className="text-xs font-semibold text-blue-800 mb-1">📱 What students see:</p>
              <ul className="text-xs text-blue-700 space-y-0.5">
                {nextStage && <li>• <strong>Next:</strong> {nextStage.name} — {Math.max(0, getDaysLeft(nextStage.date) ?? 0)} days left</li>}
                <li>• Each stage shows in its chosen colour on the countdown card</li>
                <li>• Dashboard & test page stay in sync automatically</li>
                <li>• Calendar marks exam stage dates</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stage dialog */}
      <StageDialog
        open={dialogOpen}
        initial={formInitial}
        onSave={handleSave}
        onClose={() => setDialogOpen(false)}
        isEditing={!!editingId}
        nextOrder={nextOrder}
      />

      {/* Delete confirmation */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-sm p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Trash2 className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="font-bold">Delete Stage?</p>
                <p className="text-sm text-muted-foreground mt-1">
                  This will remove the stage from student dashboard and countdown. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Cancel</Button>
              <Button variant="destructive" onClick={() => handleDelete(deleteTarget)}>Delete</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamStageManager;
