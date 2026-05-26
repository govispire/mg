import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useStaffTasks } from '@/hooks/useStaffTasks';
import { useAuth } from '@/app/providers';
import { StaffTask, TaskStatus, PRIORITY_CONFIG, STATUS_CONFIG } from '@/types/roles';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, Ban,
  Calendar, User, ChevronRight, RefreshCw, Bell, MessageSquare, RotateCcw,
} from 'lucide-react';

// ── Update Status Modal (same as Employee) ───────────────────
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

  React.useEffect(() => {
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
            <p className="text-sm font-semibold">{task.title}</p>
            <span className={`text-[10px] px-2 py-0.5 rounded-full mt-1 inline-block ${PRIORITY_CONFIG[task.priority].bg} ${PRIORITY_CONFIG[task.priority].color}`}>
              {PRIORITY_CONFIG[task.priority].label}
            </span>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">New Status</label>
            <Select value={newStatus} onValueChange={v => setNewStatus(v as TaskStatus)}>
              <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(['assigned', 'in_progress', 'completed', 'blocked'] as TaskStatus[]).map(s => (
                  <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground">Update Note</label>
            <textarea
              className="w-full mt-1 border border-border rounded-lg p-3 text-sm bg-background focus:outline-none resize-none h-20"
              placeholder="What update do you want to share?"
              value={comment} onChange={e => setComment(e.target.value)}
            />
          </div>
          {newStatus === 'completed' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Proof Link (optional)</label>
              <Input placeholder="Paste a URL to your completed work" value={proofUrl}
                onChange={e => setProofUrl(e.target.value)} className="mt-1" />
            </div>
          )}
          {newStatus === 'blocked' && (
            <div>
              <label className="text-xs font-semibold text-muted-foreground text-amber-600">Blocker Reason</label>
              <textarea
                className="w-full mt-1 border border-amber-200 bg-amber-50 rounded-lg p-3 text-sm focus:outline-none resize-none h-16"
                placeholder="What is blocking you?"
                value={extensionReason} onChange={e => setExtensionReason(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleUpdate} disabled={saving}>{saving ? 'Updating...' : 'Update'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Mentor My Tasks Page ──────────────────────────────────────
const MentorMyTasks: React.FC = () => {
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

  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed');

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> My Tasks
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Tasks assigned to you by Superadmin / Owner
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Total', value: summary.total, color: 'text-blue-600' },
          { label: 'In Progress', value: summary.in_progress, color: 'text-amber-600' },
          { label: 'Completed', value: summary.completed, color: 'text-green-600' },
          { label: 'Overdue', value: summary.overdue, color: 'text-red-600' },
        ].map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-3 text-center">
              <p className={`text-xl font-bold ${k.color}`}>{k.value}</p>
              <p className="text-[10px] text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Overdue alert */}
      {overdueTasks.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <Bell className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-red-800">
              {overdueTasks.length} overdue task{overdueTasks.length !== 1 ? 's' : ''} need action
            </p>
            <p className="text-xs text-red-600 mt-0.5">
              Update status or request an extension immediately
            </p>
          </div>
        </div>
      )}

      {/* Status filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { value: '', label: 'All' },
          { value: 'assigned', label: 'Assigned' },
          { value: 'in_progress', label: 'In Progress' },
          { value: 'completed', label: 'Done' },
          { value: 'blocked', label: 'Blocked' },
        ].map(f => (
          <button
            key={f.value}
            onClick={() => setFilterStatus(f.value as TaskStatus | '')}
            className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-all
              ${filterStatus === f.value
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:border-primary/40'}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <CheckCircle2 className="h-10 w-10 mx-auto mb-2 opacity-30" />
          <p className="text-sm">No tasks found</p>
        </div>
      ) : (
        <div className="space-y-3">
          {[...tasks]
            .sort((a, b) => {
              const aOverdue = a.due_date && new Date(a.due_date) < new Date() && a.status !== 'completed';
              const bOverdue = b.due_date && new Date(b.due_date) < new Date() && b.status !== 'completed';
              if (aOverdue && !bOverdue) return -1;
              if (!aOverdue && bOverdue) return 1;
              return 0;
            })
            .map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
              const p = PRIORITY_CONFIG[task.priority];
              const s = STATUS_CONFIG[task.status];
              return (
                <div key={task.id} className={`rounded-xl border p-4 space-y-3
                  ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border/50 bg-card'}`}>
                  <div className="flex items-start gap-2 justify-between">
                    <div>
                      <p className="font-semibold text-sm">{task.title}</p>
                      {task.description && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>}
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.bg} ${p.color}`}>{p.label}</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                    {task.category && <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{task.category}</span>}
                    {isOverdue && <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-600">OVERDUE</span>}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><User className="h-3 w-3" /> From: {task.assigned_by_name}</span>
                    {task.due_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(task.due_date).toLocaleDateString('en-IN')}</span>}
                  </div>
                  {task.status !== 'completed' && (
                    <Button size="sm" variant="outline" onClick={() => setUpdateTarget(task)} className="w-full gap-2">
                      <MessageSquare className="h-3.5 w-3.5" /> Update Status
                      <ChevronRight className="h-3.5 w-3.5 ml-auto" />
                    </Button>
                  )}
                </div>
              );
            })}
        </div>
      )}

      <UpdateStatusModal
        task={updateTarget}
        onClose={() => setUpdateTarget(null)}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
};

export default MentorMyTasks;
