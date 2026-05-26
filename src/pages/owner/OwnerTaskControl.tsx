import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useStaffTasks } from '@/hooks/useStaffTasks';
import { useUserManagement } from '@/hooks/useUserManagement';
import {
  StaffTask, TaskPriority, TaskStatus,
  PRIORITY_CONFIG, STATUS_CONFIG, EXAM_CATEGORIES,
} from '@/types/roles';
import {
  ClipboardList, UserPlus, Calendar, Flag, Filter,
  CheckCircle2, Clock, AlertCircle, Ban, ChevronRight,
  Target, BarChart3, User, Tag, RefreshCw,
} from 'lucide-react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

// ── Assign Task Modal ────────────────────────────────────────
const AssignTaskModal: React.FC<{
  open: boolean;
  onClose: () => void;
  onAssigned: () => void;
  assignTask: (p: any) => Promise<StaffTask>;
  employees: any[];
}> = ({ open, onClose, onAssigned, assignTask, employees }) => {
  const { toast } = useToast();
  const [form, setForm] = useState({
    title: '', description: '', assigned_to: '', category: '',
    priority: 'medium' as TaskPriority, due_date: '',
  });
  const [saving, setSaving] = useState(false);

  const set = (k: string, v: string) => setForm(prev => ({ ...prev, [k]: v }));

  const handleSubmit = async () => {
    if (!form.title || !form.assigned_to) {
      toast({ title: 'Required', description: 'Task title and assignee are required.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      await assignTask({
        title: form.title,
        description: form.description || undefined,
        assigned_to: Number(form.assigned_to),
        category: form.category || undefined,
        priority: form.priority,
        due_date: form.due_date || undefined,
      });
      toast({ title: '✅ Task Assigned', description: `"${form.title}" has been assigned.` });
      setForm({ title: '', description: '', assigned_to: '', category: '', priority: 'medium', due_date: '' });
      onAssigned();
      onClose();
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" /> Assign New Task
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Task Title *</label>
            <Input placeholder="e.g. Upload Banking Mock Test Set" value={form.title} onChange={e => set('title', e.target.value)} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Description</label>
            <textarea
              className="w-full mt-1 border border-border rounded-lg p-3 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none h-24"
              placeholder="Describe the task, requirements, and expectations..."
              value={form.description}
              onChange={e => set('description', e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Assign To *</label>
              <Select value={form.assigned_to} onValueChange={v => set('assigned_to', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select person" /></SelectTrigger>
                <SelectContent>
                  {employees.map(e => (
                    <SelectItem key={e.id} value={String(e.id)}>
                      {e.name} ({e.role})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Category</label>
              <Select value={form.category} onValueChange={v => set('category', v)}>
                <SelectTrigger className="mt-1"><SelectValue placeholder="Select category" /></SelectTrigger>
                <SelectContent>
                  {EXAM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Priority</label>
              <Select value={form.priority} onValueChange={v => set('priority', v as TaskPriority)}>
                <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => (
                    <SelectItem key={p} value={p}>
                      <span className={`font-medium ${PRIORITY_CONFIG[p].color}`}>
                        {PRIORITY_CONFIG[p].label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Due Date</label>
              <Input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="mt-1" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={saving}>{saving ? 'Assigning...' : 'Assign Task'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// ── Task Card ─────────────────────────────────────────────────
const TaskCard: React.FC<{ task: StaffTask; onDelete?: (id: number) => void }> = ({ task, onDelete }) => {
  const isOverdue = task.due_date && new Date(task.due_date) < new Date() && task.status !== 'completed';
  const p = PRIORITY_CONFIG[task.priority];
  const s = STATUS_CONFIG[task.status];

  return (
    <div className={`rounded-xl border p-4 space-y-3 transition-all hover:shadow-sm
      ${isOverdue ? 'border-red-200 bg-red-50/30' : 'border-border/50 bg-card'}`}>
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground line-clamp-1">{task.title}</p>
          {task.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{task.description}</p>
          )}
        </div>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${p.bg} ${p.color}`}>
          {p.label}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full flex items-center gap-1 ${s.bg} ${s.color}`}>
          {task.status === 'completed' && <CheckCircle2 className="h-2.5 w-2.5" />}
          {task.status === 'in_progress' && <Clock className="h-2.5 w-2.5" />}
          {task.status === 'blocked' && <Ban className="h-2.5 w-2.5" />}
          {task.status === 'assigned' && <AlertCircle className="h-2.5 w-2.5" />}
          {s.label}
        </span>
        {task.category && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 flex items-center gap-1">
            <Tag className="h-2.5 w-2.5" />{task.category}
          </span>
        )}
        {isOverdue && (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-600 font-semibold">
            ⚠ OVERDUE
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <User className="h-3 w-3" />
          <span className="truncate">{task.assigned_to_name}</span>
          <span className="text-[10px] text-muted-foreground/60">({task.assignee_role})</span>
        </div>
        {task.due_date && (
          <div className="flex items-center gap-1">
            <Calendar className="h-3 w-3" />
            <span>{new Date(task.due_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}</span>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────
const OwnerTaskControl: React.FC = () => {
  const [assignModal, setAssignModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState<TaskStatus | ''>('');
  const [filterPriority, setFilterPriority] = useState<TaskPriority | ''>('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterDate, setFilterDate] = useState<'' | 'today' | 'this_week' | 'overdue'>('');

  const { tasks, summary, isLoading, error, refetch, assignTask, deleteTask } = useStaffTasks({
    status: filterStatus || undefined,
    priority: filterPriority || undefined,
    category: filterCategory || undefined,
    date_filter: filterDate || undefined,
  });

  const { users: staffUsers } = useUserManagement({ status: 'active' });
  const employees = staffUsers.filter(u => ['employee', 'mentor'].includes(u.role));

  const statCards = [
    { label: 'Total Tasks', value: summary.total, icon: ClipboardList, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'In Progress', value: summary.in_progress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Completed', value: summary.completed, icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Overdue', value: summary.overdue, icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" /> Task Control Centre
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">Assign, track and manage all staff tasks</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={refetch} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
          <Button onClick={() => setAssignModal(true)} className="gap-2 shadow-sm">
            <ClipboardList className="h-4 w-4" /> Assign Task
          </Button>
        </div>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterStatus} onValueChange={v => setFilterStatus(v as any)}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            {(['assigned', 'in_progress', 'completed', 'blocked'] as TaskStatus[]).map(s => (
              <SelectItem key={s} value={s}>{STATUS_CONFIG[s].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterPriority} onValueChange={v => setFilterPriority(v as any)}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Priority</SelectItem>
            {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map(p => (
              <SelectItem key={p} value={p}>{PRIORITY_CONFIG[p].label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="All Categories" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {EXAM_CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterDate} onValueChange={v => setFilterDate(v as any)}>
          <SelectTrigger className="w-36 h-9"><SelectValue placeholder="Any Date" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">Any Date</SelectItem>
            <SelectItem value="today">Due Today</SelectItem>
            <SelectItem value="this_week">This Week</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task grid */}
      {isLoading ? (
        <div className="flex items-center justify-center h-48">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="text-center py-12 text-muted-foreground">
          <AlertCircle className="h-8 w-8 mx-auto mb-2 text-red-400" />
          <p className="text-sm">{error}</p>
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="text-sm font-medium">No tasks found</p>
          <p className="text-xs mt-1">Assign a task to get started</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={deleteTask} />
          ))}
        </div>
      )}

      {/* Assign Modal */}
      <AssignTaskModal
        open={assignModal}
        onClose={() => setAssignModal(false)}
        onAssigned={refetch}
        assignTask={assignTask}
        employees={employees}
      />
    </div>
  );
};

export default OwnerTaskControl;
