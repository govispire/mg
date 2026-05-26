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
import { useUserManagement } from '@/hooks/useUserManagement';
import {
  StaffTask, StaffTaskLog, TaskPriority, TaskStatus,
  PRIORITY_CONFIG, STATUS_CONFIG, EXAM_CATEGORIES,
} from '@/types/roles';
import {
  ClipboardList, CheckCircle2, Clock, AlertCircle, Ban,
  Tag, Calendar, User, BarChart3, RefreshCw, Trash2,
  MessageSquare, TrendingUp, ChevronDown, ChevronUp,
} from 'lucide-react';

// ── Task Detail Drawer ────────────────────────────────────────
const TaskDetailPanel: React.FC<{
  taskId: number | null;
  onClose: () => void;
  getTaskWithLogs: (id: number) => Promise<{ task: StaffTask; logs: StaffTaskLog[] }>;
  onDelete: (id: number) => Promise<void>;
}> = ({ taskId, onClose, getTaskWithLogs, onDelete }) => {
  const { toast } = useToast();
  const [data, setData] = useState<{ task: StaffTask; logs: StaffTaskLog[] } | null>(null);
  const [loading, setLoading] = useState(false);

  React.useEffect(() => {
    if (!taskId) { setData(null); return; }
    setLoading(true);
    getTaskWithLogs(taskId).then(setData).finally(() => setLoading(false));
  }, [taskId]);

  if (!taskId) return null;

  const handleDelete = async () => {
    if (!data) return;
    try {
      await onDelete(data.task.id);
      toast({ title: 'Task deleted' });
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    }
  };

  return (
    <Dialog open={!!taskId} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
          </div>
        ) : data ? (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-start gap-2 text-base leading-tight pr-6">
                {data.task.title}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4 py-2">
              {/* Meta badges */}
              <div className="flex flex-wrap gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_CONFIG[data.task.priority].bg} ${PRIORITY_CONFIG[data.task.priority].color}`}>
                  {PRIORITY_CONFIG[data.task.priority].label}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_CONFIG[data.task.status].bg} ${STATUS_CONFIG[data.task.status].color}`}>
                  {STATUS_CONFIG[data.task.status].label}
                </span>
                {data.task.category && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{data.task.category}</span>
                )}
              </div>

              {data.task.description && (
                <p className="text-sm text-muted-foreground">{data.task.description}</p>
              )}

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="space-y-1">
                  <p className="text-muted-foreground">Assigned To</p>
                  <p className="font-semibold">{data.task.assigned_to_name}</p>
                  <p className="text-muted-foreground/70">{data.task.assignee_role}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-muted-foreground">Due Date</p>
                  <p className="font-semibold">{data.task.due_date ? new Date(data.task.due_date).toLocaleDateString('en-IN') : 'No deadline'}</p>
                </div>
                {data.task.completed_at && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Completed At</p>
                    <p className="font-semibold text-green-600">{new Date(data.task.completed_at).toLocaleDateString('en-IN')}</p>
                  </div>
                )}
                {data.task.proof_url && (
                  <div className="space-y-1">
                    <p className="text-muted-foreground">Proof</p>
                    <a href={data.task.proof_url} target="_blank" rel="noreferrer"
                      className="text-primary underline text-xs">View proof</a>
                  </div>
                )}
              </div>

              {/* Extension request */}
              {data.task.extension_requested && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <p className="text-xs font-semibold text-amber-700">⏰ Extension Requested</p>
                  <p className="text-xs text-amber-600 mt-0.5">{data.task.extension_reason}</p>
                </div>
              )}

              {/* Activity Log */}
              <div>
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Activity Log</p>
                {data.logs.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No activity yet</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {data.logs.map(log => (
                      <div key={log.id} className="flex gap-2 text-xs">
                        <div className="w-1 rounded-full bg-primary/30 shrink-0 mt-1" />
                        <div className="flex-1">
                          <span className="font-medium">{log.actor_name}</span>
                          <span className="text-muted-foreground mx-1">·</span>
                          <span className="text-muted-foreground">{log.action.replace('_', ' ')}</span>
                          {log.comment && <p className="text-muted-foreground mt-0.5 italic">"{log.comment}"</p>}
                          <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                            {new Date(log.created_at).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <DialogFooter className="border-t border-border/40 pt-3">
              <Button variant="ghost" size="sm" className="text-red-600 hover:bg-red-50 gap-1" onClick={handleDelete}>
                <Trash2 className="h-3.5 w-3.5" /> Delete Task
              </Button>
              <Button variant="outline" onClick={onClose}>Close</Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

// ── Employee Performance Card ─────────────────────────────────
const PerformanceRow: React.FC<{ user: any; tasks: StaffTask[] }> = ({ user, tasks }) => {
  const myTasks = tasks.filter(t => t.assigned_to === user.id);
  const completed = myTasks.filter(t => t.status === 'completed').length;
  const overdue = myTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
  const rate = myTasks.length > 0 ? Math.round((completed / myTasks.length) * 100) : 0;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
        {user.name.charAt(0)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{user.name}</p>
        <p className="text-xs text-muted-foreground">{user.role} · {user.department || 'No dept'}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold" style={{ color: rate >= 80 ? '#16a34a' : rate >= 50 ? '#d97706' : '#dc2626' }}>
          {rate}%
        </p>
        <p className="text-[10px] text-muted-foreground">{completed}/{myTasks.length} done</p>
        {overdue > 0 && <p className="text-[10px] text-red-500">{overdue} overdue</p>}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const SuperAdminTaskManager: React.FC = () => {
  const { toast } = useToast();
  const [assignModal, setAssignModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<number | null>(null);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState<'' | 'today' | 'this_week' | 'overdue'>('');

  const { tasks, summary, isLoading, error, refetch, assignTask, deleteTask, getTaskWithLogs } = useStaffTasks({
    status: filterStatus || undefined,
    priority: filterPriority || undefined,
    category: filterCategory || undefined,
    date_filter: filterDate || undefined,
  });

  const { users: staffUsers } = useUserManagement({ status: 'active' });
  const employees = staffUsers.filter(u => ['employee', 'mentor'].includes(u.role));

  // Assign modal form
  const [form, setForm] = useState({ title: '', description: '', assigned_to: '', category: '', priority: 'medium' as TaskPriority, due_date: '' });
  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));
  const [saving, setSaving] = useState(false);

  const handleAssign = async () => {
    if (!form.title || !form.assigned_to) {
      toast({ title: 'Required', description: 'Title and assignee are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await assignTask({ ...form, assigned_to: Number(form.assigned_to), category: form.category || undefined, due_date: form.due_date || undefined });
      toast({ title: '✅ Task Assigned' });
      setForm({ title: '', description: '', assigned_to: '', category: '', priority: 'medium', due_date: '' });
      setAssignModal(false);
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const statCards = [
    { label: 'Total', value: summary.total, icon: ClipboardList, color: 'text-blue-600' },
    { label: 'In Progress', value: summary.in_progress, icon: Clock, color: 'text-amber-600' },
    { label: 'Completed', value: summary.completed, icon: CheckCircle2, color: 'text-green-600' },
    { label: 'Overdue', value: summary.overdue, icon: AlertCircle, color: 'text-red-600' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" /> Task Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Assign and track tasks for your team</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button onClick={() => setAssignModal(true)} className="gap-2">
            <ClipboardList className="h-4 w-4" /> Assign Task
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {statCards.map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-4 text-center">
              <k.icon className={`h-5 w-5 mx-auto mb-1 ${k.color}`} />
              <p className="text-2xl font-bold text-foreground">{k.value}</p>
              <p className="text-xs text-muted-foreground">{k.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Task List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(['assigned', 'in_progress', 'completed', 'blocked', 'overdue'] as const).map(s => (
              <button
                key={s}
                onClick={() => s === 'overdue' ? setFilterDate(filterDate === 'overdue' ? '' : 'overdue') : setFilterStatus(filterStatus === s ? '' : s as TaskStatus)}
                className={`text-xs px-3 py-1 rounded-full border transition-all font-medium
                  ${(s === 'overdue' ? filterDate === 'overdue' : filterStatus === s)
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary/50'}`}
              >
                {s.replace('_', ' ')}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <ClipboardList className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm">No tasks found</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map(task => {
                const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
                const p = PRIORITY_CONFIG[task.priority];
                const s = STATUS_CONFIG[task.status];
                return (
                  <div key={task.id}
                    className={`rounded-xl border p-4 cursor-pointer hover:shadow-sm transition-all
                      ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border/50 bg-card hover:border-primary/30'}`}
                    onClick={() => setSelectedTask(task.id)}>
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-semibold text-sm line-clamp-1">{task.title}</p>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.bg} ${p.color}`}>{p.label}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${s.bg} ${s.color}`}>{s.label}</span>
                      {task.category && <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600">{task.category}</span>}
                      {isOverdue && <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">OVERDUE</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><User className="h-3 w-3" />{task.assigned_to_name}</span>
                      {task.due_date && <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Performance Sidebar */}
        <div className="space-y-4">
          <Card className="border-border/50">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Team Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {employees.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">No active employees</p>
              ) : employees.map(e => (
                <PerformanceRow key={e.id} user={e} tasks={tasks} />
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Assign Modal */}
      <Dialog open={assignModal} onOpenChange={setAssignModal}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Assign New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Task Title *</label>
              <Input placeholder="Task title..." value={form.title} onChange={e => set('title', e.target.value)} className="mt-1" />
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground">Description</label>
              <textarea className="w-full mt-1 border border-border rounded-lg p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-20"
                placeholder="Task details..." value={form.description} onChange={e => set('description', e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Assign To *</label>
                <Select value={form.assigned_to} onValueChange={v => set('assigned_to', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Select person" /></SelectTrigger>
                  <SelectContent>
                    {employees.map(e => <SelectItem key={e.id} value={String(e.id)}>{e.name} ({e.role})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Category</label>
                <Select value={form.category} onValueChange={v => set('category', v)}>
                  <SelectTrigger className="mt-1"><SelectValue placeholder="Category" /></SelectTrigger>
                  <SelectContent>{EXAM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Priority</label>
                <Select value={form.priority} onValueChange={v => set('priority', v as TaskPriority)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => (
                      <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Due Date</label>
                <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="mt-1" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignModal(false)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={saving}>{saving ? 'Assigning...' : 'Assign Task'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Detail */}
      <TaskDetailPanel
        taskId={selectedTask}
        onClose={() => setSelectedTask(null)}
        getTaskWithLogs={getTaskWithLogs}
        onDelete={deleteTask}
      />
    </div>
  );
};

export default SuperAdminTaskManager;
