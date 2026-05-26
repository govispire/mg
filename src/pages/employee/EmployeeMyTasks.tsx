import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useStaffTasks } from '@/hooks/useStaffTasks';
import { useAuth } from '@/app/providers';
import { StaffTask, StaffTaskLog, TaskStatus, PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/roles';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, Ban,
  Calendar, Tag, MessageSquare, Upload, RotateCcw,
  ChevronRight, RefreshCw, Bell, User,
} from 'lucide-react';

// ── Task Status Update Modal ──────────────────────────────────
const UpdateStatusModal: React.FC<{
  task: StaffTask | null;
  onClose: () => void;
  onUpdate: (taskId: number, status: TaskStatus, comment?: string, proof?: string, extension?: string) => Promise<void>;
}> = ({ task, onClose, onUpdate }) => {
  const { toast } = useToast();
  const [newStatus, setNewStatus] = useState<TaskStatus>('in_progress');
  const [comment, setComment] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [extensionReason, setExtensionReason] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (task) { setNewStatus(task.status); setComment(''); setProofUrl(''); setExtensionReason(''); }
  }, [task]);

  const handleUpdate = async () => {
    if (!task) return;
    setSaving(true);
    try {
      await onUpdate(task.id, newStatus, comment || undefined, proofUrl || undefined, extensionReason || undefined);
      toast({ title: `✅ Status Updated`, description: `Task marked as ${STATUS_CONFIG[newStatus].label}.` });
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-base">Update Task Status</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="p-3 bg-muted/40 rounded-lg">
            <p className="text-sm font-semibold line-clamp-2">{task.title}</p>
            <div className="flex gap-2 mt-1">
              <span className={`text-[10px] px-2 py-0.5 rounded-full ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].color}`}>
                {PRIORITY_CONFIG[task.priority].label}
              </span>
              {task.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{task.category}</span>}
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">New Status</label>
            <Select value={newStatus} onValueChange={v => setNewStatus(v as TaskStatus)}>
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(['assigned', 'in_progress', 'completed', 'blocked'] as TaskStatus[]).map(s => (
                  <SelectItem key={s} value={s}>
                    <span className={STATUS_CONFIG[s].color}>{STATUS_CONFIG[s].label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Comment</label>
            <textarea
              className="w-full mt-1 border border-border rounded-lg p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
              placeholder="Add an update note for your manager..."
              value={comment}
              onChange={e => setComment(e.target.value)}
            />
          </div>

          {newStatus === 'completed' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Proof URL (optional)</label>
              <Input placeholder="Link to completed work, Google Drive, etc." value={proofUrl}
                onChange={e => setProofUrl(e.target.value)} className="mt-1" />
            </div>
          )}

          {newStatus === 'blocked' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide flex items-center gap-1">
                <RotateCcw className="h-3 w-3" /> Extension Request Reason
              </label>
              <textarea
                className="w-full mt-1 border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-300 resize-none h-16"
                placeholder="Explain what's blocking you..."
                value={extensionReason}
                onChange={e => setExtensionReason(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={saving}>{saving ? 'Updating...' : 'Update Status'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Task Card ─────────────────────────────────────────────────
const MyTaskCard: React.FC<{
  task: StaffTask;
  onUpdate: (task: StaffTask) => void;
}> = ({ task, onUpdate }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const p = PRIORITY_CONFIG[task.priority];
  const s = STATUS_CONFIG[task.status];
  const daysUntilDue = task.due_date ? Math.ceil((new Date(task.due_date).getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : null;

  return (
    <div className={`rounded-2xl border p-4 space-y-3 transition-all hover:shadow-md
      ${task.status === 'completed' ? 'opacity-70 border-border/30 bg-muted/20' :
        isOverdue ? 'border-red-300 bg-red-50/40 shadow-sm' :
        task.priority === 'critical' ? 'border-red-200 bg-red-50/20' :
        task.priority === 'high' ? 'border-orange-200 bg-orange-50/20' :
        'border-border/50 bg-card'}`}>

      {/* Top row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.bg} ${p.color}`}>{p.label}</span>
            {isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600 animate-pulse">⚠ OVERDUE</span>}
          </div>
          <p className="font-semibold text-sm text-foreground leading-tight">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{task.description}</p>
          )}
        </div>
      </div>

      {/* Status + Category */}
      <div className="flex flex-wrap gap-2">
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex items-center gap-1 ${s.bg} ${s.color}`}>
          {task.status === 'completed' && <CheckCircle2 className="h-3 w-3" />}
          {task.status === 'in_progress' && <Clock className="h-3 w-3" />}
          {task.status === 'blocked' && <Ban className="h-3 w-3" />}
          {task.status === 'assigned' && <AlertCircle className="h-3 w-3" />}
          {s.label}
        </span>
        {task.category && (
          <span className="text-xs px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
            <Tag className="h-3 w-3" />{task.category}
          </span>
        )}
      </div>

      {/* Meta */}
      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          <span>From: <span className="font-medium text-foreground">{task.assigned_by_name}</span></span>
        </div>
        {task.due_date && (
          <div className={`flex items-center gap-1.5 ${isOverdue ? 'text-red-600 font-medium' : daysUntilDue !== null && daysUntilDue <= 2 ? 'text-orange-600' : ''}`}>
            <Calendar className="h-3.5 w-3.5" />
            <span>
              {isOverdue ? `${Math.abs(daysUntilDue!)}d overdue` :
               daysUntilDue === 0 ? 'Due today!' :
               daysUntilDue === 1 ? 'Due tomorrow' :
               `${new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}`}
            </span>
          </div>
        )}
      </div>

      {/* Action */}
      {task.status !== 'completed' && (
        <Button
          size="sm"
          variant={isOverdue ? 'destructive' : 'outline'}
          onClick={() => onUpdate(task)}
          className="w-full gap-2 mt-1"
        >
          <MessageSquare className="h-3.5 w-3.5" />
          Update Status
          <ChevronRight className="h-3.5 w-3.5 ml-auto" />
        </Button>
      )}
      {task.status === 'completed' && task.completed_at && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle2 className="h-3 w-3" />
          Completed on {new Date(task.completed_at).toLocaleDateString('en-IN')}
        </p>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const EmployeeMyTasks: React.FC = () => {
  const { user } = useAuth();
  const [updateTarget, setUpdateTarget] = useState<StaffTask | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');

  const { tasks, summary, isLoading, error, refetch, updateStatus } = useStaffTasks({
    status: filterStatus || undefined,
  });

  const handleStatusUpdate = async (taskId: number, status: TaskStatus, comment?: string, proof_url?: string, extension_reason?: string) => {
    await updateStatus(taskId, status, comment, proof_url, extension_reason);
    await refetch();
  };

  const urgentTasks = tasks.filter(t =>
    t.status !== 'completed' &&
    (t.priority === 'critical' || t.priority === 'high' ||
     (t.due_date && new Date(t.due_date) < new Date()))
  );

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> My Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hello, {user?.name || 'Employee'} — here are your assigned tasks
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: summary.total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'In Progress', value: summary.in_progress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'Completed', value: summary.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Overdue', value: summary.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
        ].map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <k.icon className={`h-4 w-4 mx-auto mb-1 ${k.color}`} />
              <p className="text-xl font-bold text-foreground">{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance score */}
      <Card className="border-border/50 bg-gradient-to-r from-primary/5 to-primary/10">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Your Performance Score</p>
              <p className="text-3xl font-black text-primary mt-1">
                {summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}%
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                {summary.completed} of {summary.total} tasks completed
                {summary.overdue > 0 && ` · ${summary.overdue} overdue`}
              </p>
            </div>
            <div className="w-20 h-20 relative flex-shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--muted))" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none" stroke="hsl(var(--primary))" strokeWidth="3"
                  strokeDasharray={`${summary.total > 0 ? Math.round((summary.completed / summary.total) * 100) : 0}, 100`} />
              </svg>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Urgent tasks alert */}
      {urgentTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {urgentTasks.length} task{urgentTasks.length !== 1 ? 's' : ''} need{urgentTasks.length === 1 ? 's' : ''} attention
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              {urgentTasks.filter(t => t.due_date && new Date(t.due_date) < new Date()).length} overdue ·{' '}
              {urgentTasks.filter(t => t.priority === 'critical').length} critical priority
            </p>
          </div>
        </div>
      )}

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'All Tasks' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Completed' },
          { value: 'blocked', label: 'Blocked' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value as TaskStatus | '')}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
              ${filterStatus === f.value
                ? 'bg-primary text-primary-foreground border-primary shadow-sm'
                : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            {f.label}
            {f.value && (
              <span className="ml-1.5 opacity-70">
                ({summary[f.value as keyof typeof summary] || 0})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm text-muted-foreground">{error}</p>
          <Button variant="outline" size="sm" onClick={refetch} className="mt-2">Retry</Button>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">
            {filterStatus ? `No ${STATUS_CONFIG[filterStatus as TaskStatus]?.label || ''} tasks` : 'No tasks assigned yet'}
          </p>
          <p className="text-xs mt-1">Tasks assigned by your manager will appear here</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sort: overdue first, then critical, then by date */}
          {[...tasks]
            .sort((a, b) => {
              const aOverdue = a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed';
              const bOverdue = b.due_date && new Date(b.due_date) < new Date() && b.status !== 'completed';
              if (aOverdue && !bOverdue) return -1;
              if (!aOverdue && bOverdue) return 1;
              const pOrder = { critical: 0, high: 1, medium: 2, low: 3 };
              return (pOrder[a.priority] || 2) - (pOrder[b.priority] || 2);
            })
            .map(task => (
              <MyTaskCard key={task.id} task={task} onUpdate={setUpdateTarget} />
            ))}
        </div>
      )}

      {/* Platform governance reminder */}
      <div className="bg-muted/40 rounded-xl p-4 text-xs text-muted-foreground space-y-1 border border-border/40">
        <p className="font-semibold text-foreground">📌 Reminders</p>
        <p>• All task updates are timestamped and visible to your manager</p>
        <p>• Upload proof of completion when marking tasks complete</p>
        <p>• Use "Blocked" status with a reason if you need an extension</p>
        <p>• Overdue tasks trigger automatic reminders to your manager</p>
      </div>

      {/* Update Status Modal */}
      <UpdateStatusModal
        task={updateTarget}
        onClose={() => setUpdateTarget(null)}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default EmployeeMyTasks;
