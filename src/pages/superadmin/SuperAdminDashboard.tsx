import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers';
import {
  Users, BarChart3, BookOpen, CheckCircle2, Clock, AlertTriangle,
  ChevronRight, ArrowUpRight, ArrowDownRight, Upload, Archive,
  Eye, Star, Target, Activity, TrendingUp, TrendingDown,
  MapPin, Layers, FileText, Video, Brain, Calendar, Zap,
  UserPlus, ClipboardList, Bell, Search, Edit, RefreshCw,
} from 'lucide-react';

// ─── Mock data ─────────────────────────────────────────────────────────────

const dailyOps = {
  newStudentsToday: 84,
  activeStudents7d: 2640,
  testsUploadedToday: 12,
  tasksPending: 7,
  contentAwaitingApproval: 3,
};

const contentItems = [
  { title: 'IBPS PO Prelims Mock 14', category: 'Banking', status: 'draft', by: 'Deepak R.', time: '2h ago' },
  { title: 'SSC CGL Tier-1 Reasoning Set 8', category: 'SSC', status: 'published', by: 'Swetha N.', time: '4h ago' },
  { title: 'RRB NTPC GK Module 3', category: 'Railway', status: 'draft', by: 'Kiran J.', time: 'Yesterday' },
  { title: 'UPSC Polity Notes 2025', category: 'UPSC', status: 'archived', by: 'Ravi K.', time: '2d ago' },
  { title: 'SBI Clerk DI Speed Set', category: 'Banking', status: 'published', by: 'Deepak R.', time: '3d ago' },
];

const studentPerformance = {
  examWise: [
    { exam: 'IBPS PO', avgScore: 71, attempts: 18400 },
    { exam: 'SSC CGL', avgScore: 66, attempts: 12800 },
    { exam: 'RRB NTPC', avgScore: 74, attempts: 8200 },
    { exam: 'SBI PO', avgScore: 69, attempts: 6100 },
    { exam: 'UPSC CSE', avgScore: 58, attempts: 2900 },
  ],
  sectionWise: [
    { section: 'Quantitative Aptitude', avg: 64, weak: true },
    { section: 'Reasoning', avg: 71, weak: false },
    { section: 'English', avg: 68, weak: false },
    { section: 'General Awareness', avg: 59, weak: true },
  ],
  weakTopics: [
    { topic: 'Data Interpretation', accuracy: 42, drop: -9 },
    { topic: 'Number Series', accuracy: 51, drop: -5 },
    { topic: 'Puzzles & Seating', accuracy: 48, drop: -7 },
    { topic: 'Static GK — Economy', accuracy: 39, drop: -12 },
  ],
};

const tasks = [
  { title: 'Upload SSC CGL Tier-2 Tests', assignedTo: 'Admin – Priya S.', due: 'Today', status: 'overdue' },
  { title: 'Fix DI explanation errors', assignedTo: 'Emp – Deepak R.', due: 'Tomorrow', status: 'pending' },
  { title: 'Prepare Puzzle PDF Pack', assignedTo: 'Emp – Swetha N.', due: 'Feb 25', status: 'in-progress' },
  { title: 'Create Speed Drill – Quant', assignedTo: 'Emp – Kiran J.', due: 'Feb 26', status: 'pending' },
  { title: 'Update Banking GA Questions', assignedTo: 'Admin – Ravi K.', due: 'Mar 1', status: 'completed' },
];

const admins = [
  { name: 'Priya S.', category: 'Banking', students: 1840, growth: '+24%', status: 'active' },
  { name: 'Ravi K.', category: 'SSC', students: 1620, growth: '+18%', status: 'active' },
  { name: 'Anita M.', category: 'Railway', students: 1280, growth: '+12%', status: 'active' },
];

const weakAreaAlerts = [
  { area: 'Data Interpretation', affected: 3200, drop: '-9%', severity: 'high' },
  { area: 'Puzzles & Seating', affected: 2100, drop: '-7%', severity: 'medium' },
  { area: 'Static GK Economy', affected: 4100, drop: '-12%', severity: 'high' },
  { area: 'Number Series', affected: 1800, drop: '-5%', severity: 'low' },
];

const growthData = {
  categories: [
    { name: 'Banking', students: 18400, growth: +14 },
    { name: 'SSC', students: 12800, growth: +9 },
    { name: 'Railway', students: 8200, growth: +18 },
    { name: 'UPSC', students: 5600, growth: +6 },
  ],
  states: [
    { state: 'UP', students: 6200, growth: +12 },
    { state: 'Tamil Nadu', students: 4800, growth: +18 },
    { state: 'Maharashtra', students: 3900, growth: +9 },
    { state: 'Karnataka', students: 3100, growth: +15 },
  ],
  features: [
    { feature: 'Tests', visits: 48200, trend: +12 },
    { feature: 'Current Affairs', visits: 29400, trend: +22 },
    { feature: 'Videos', visits: 18900, trend: +5 },
    { feature: 'Strict Mode', visits: 3200, trend: +31 },
  ],
};

const platformAlerts = [
  { type: 'overdue', msg: 'Task overdue: Upload SSC CGL Tier-2 Tests', time: '2h ago' },
  { type: 'content', msg: 'Content error reported in IBPS Reasoning Set 6', time: '3h ago' },
  { type: 'drop', msg: 'Railway category engagement down 11% this week', time: '5h ago' },
  { type: 'student', msg: '2 student complaints in Mentorship section', time: '1d ago' },
];

// ─── Reusable helpers ──────────────────────────────────────────────────────

const BarFill: React.FC<{ pct: number; color?: string }> = ({ pct, color = 'bg-primary' }) => (
  <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
    <div className={`h-full ${color} rounded-full`} style={{ width: `${pct}%` }} />
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const map: Record<string, string> = {
    draft: 'bg-amber-100 text-amber-700',
    published: 'bg-green-100 text-green-700',
    archived: 'bg-muted text-muted-foreground',
    overdue: 'bg-red-100 text-red-600',
    pending: 'bg-amber-100 text-amber-700',
    completed: 'bg-green-100 text-green-700',
    'in-progress': 'bg-blue-100 text-blue-700',
    active: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${map[status] || 'bg-muted'}`}>
      {status}
    </span>
  );
};

// ─── Panel 1: Daily Ops ────────────────────────────────────────────────────

const PanelDailyOps = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {[
        { icon: UserPlus, color: 'text-blue-500', bg: 'bg-blue-50', label: 'New Today', value: dailyOps.newStudentsToday },
        { icon: Users, color: 'text-green-500', bg: 'bg-green-50', label: 'Active (7d)', value: dailyOps.activeStudents7d.toLocaleString() },
        { icon: Upload, color: 'text-purple-500', bg: 'bg-purple-50', label: 'Tests Uploaded', value: dailyOps.testsUploadedToday },
        { icon: ClipboardList, color: 'text-amber-500', bg: 'bg-amber-50', label: 'Tasks Pending', value: dailyOps.tasksPending },
        { icon: CheckCircle2, color: 'text-red-500', bg: 'bg-red-50', label: 'Awaiting Approval', value: dailyOps.contentAwaitingApproval },
      ].map(({ icon: Icon, color, bg, label, value }) => (
        <Card key={label} className="p-4">
          <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center mb-2`}>
            <Icon className={`h-4 w-4 ${color}`} />
          </div>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
        </Card>
      ))}
    </div>

    {/* Alert bar */}
    <Card className="p-4">
      <h4 className="font-semibold text-sm mb-3 flex items-center gap-2">
        <Bell className="h-4 w-4 text-primary" /> Platform Alerts
      </h4>
      <div className="space-y-2">
        {platformAlerts.map((a, i) => (
          <div key={i} className="flex items-start gap-3 p-2.5 rounded-lg border border-border/40 bg-muted/20">
            <AlertTriangle className={`h-3.5 w-3.5 mt-0.5 flex-shrink-0 ${a.type === 'overdue' || a.type === 'drop' ? 'text-red-500' : 'text-amber-500'}`} />
            <p className="text-xs flex-1">{a.msg}</p>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{a.time}</span>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── Panel 2: Content Control ─────────────────────────────────────────────

const PanelContent = () => {
  const [filter, setFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const filtered = filter === 'all' ? contentItems : contentItems.filter(c => c.status === filter);

  return (
    <div className="space-y-4">
      {/* Summary counts */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Draft', count: contentItems.filter(c => c.status === 'draft').length, color: 'text-amber-600', filter: 'draft' as const },
          { label: 'Published', count: contentItems.filter(c => c.status === 'published').length, color: 'text-green-600', filter: 'published' as const },
          { label: 'Archived', count: contentItems.filter(c => c.status === 'archived').length, color: 'text-muted-foreground', filter: 'archived' as const },
        ].map((s) => (
          <Card
            key={s.label}
            className={`p-3 cursor-pointer hover:border-primary/40 transition-colors ${filter === s.filter ? 'border-primary ring-1 ring-primary/20' : ''}`}
            onClick={() => setFilter(filter === s.filter ? 'all' : s.filter)}
          >
            <p className={`text-2xl font-bold ${s.color}`}>{s.count}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold text-sm">Content Registry</h4>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="text-xs h-7 gap-1">
              <Upload className="h-3 w-3" /> Upload New
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((item, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors group">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{item.title}</p>
                <p className="text-[11px] text-muted-foreground">{item.category} · by {item.by} · {item.time}</p>
              </div>
              <StatusBadge status={item.status} />
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button className="p-1 rounded hover:bg-muted"><Eye className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button className="p-1 rounded hover:bg-muted"><Edit className="h-3.5 w-3.5 text-muted-foreground" /></button>
                <button className="p-1 rounded hover:bg-muted"><Archive className="h-3.5 w-3.5 text-muted-foreground" /></button>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

// ─── Panel 3: Student Performance ────────────────────────────────────────

const PanelStudentPerf = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Exam-wise */}
      <Card className="p-5">
        <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary" /> Exam-wise Avg Score
        </h4>
        <div className="space-y-3">
          {studentPerformance.examWise.map((e) => (
            <div key={e.exam} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{e.exam}</span>
                <span className="text-muted-foreground">{e.avgScore}% · {e.attempts.toLocaleString()} attempts</span>
              </div>
              <BarFill pct={e.avgScore} color={e.avgScore >= 70 ? 'bg-green-500' : e.avgScore >= 60 ? 'bg-amber-500' : 'bg-red-400'} />
            </div>
          ))}
        </div>
      </Card>

      {/* Section-wise */}
      <Card className="p-5">
        <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Target className="h-4 w-4 text-primary" /> Section-wise Performance
        </h4>
        <div className="space-y-3">
          {studentPerformance.sectionWise.map((s) => (
            <div key={s.section} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium flex items-center gap-1">
                  {s.section}
                  {s.weak && <Badge className="text-[9px] px-1 py-0 bg-red-100 text-red-600">Weak</Badge>}
                </span>
                <span className="text-muted-foreground">{s.avg}%</span>
              </div>
              <BarFill pct={s.avg} color={s.weak ? 'bg-red-400' : 'bg-green-500'} />
            </div>
          ))}
        </div>
      </Card>
    </div>

    {/* Weak topics */}
    <Card className="p-5">
      <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-red-500" /> Weakest Topics Platform-wide
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {studentPerformance.weakTopics.map((t) => (
          <div key={t.topic} className="p-3 rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900">
            <p className="text-xs font-semibold text-foreground">{t.topic}</p>
            <p className="text-2xl font-black text-red-600 mt-1">{t.accuracy}%</p>
            <p className="text-[11px] text-red-500 flex items-center gap-0.5 mt-0.5">
              <ArrowDownRight className="h-3 w-3" /> {t.drop}% drop
            </p>
            <Button size="sm" variant="outline" className="mt-2 h-6 text-[10px] w-full">Assign Fix</Button>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── Panel 4: Task & Staff ─────────────────────────────────────────────────

const PanelTasksStaff = () => (
  <div className="space-y-4">
    {/* Tasks */}
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" /> Task Board
        </h4>
        <Button size="sm" className="h-7 text-xs gap-1">
          <ClipboardList className="h-3 w-3" /> Assign Task
        </Button>
      </div>
      <div className="space-y-2">
        {tasks.map((t, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 transition-colors">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="text-[11px] text-muted-foreground">{t.assignedTo} · Due: {t.due}</p>
            </div>
            <StatusBadge status={t.status} />
          </div>
        ))}
      </div>

      {/* Summary counts */}
      <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-border/40">
        {[
          { label: 'Total', count: tasks.length, val: null },
          { label: 'Overdue', count: tasks.filter(t => t.status === 'overdue').length, val: 'text-red-500' },
          { label: 'Pending', count: tasks.filter(t => t.status === 'pending').length, val: 'text-amber-500' },
          { label: 'Done', count: tasks.filter(t => t.status === 'completed').length, val: 'text-green-500' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <p className={`text-xl font-bold ${s.val || 'text-foreground'}`}>{s.count}</p>
            <p className="text-[10px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    </Card>

    {/* Admins */}
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-semibold text-sm flex items-center gap-2">
          <Star className="h-4 w-4 text-amber-500" /> Admin Management
        </h4>
        <Button size="sm" variant="outline" className="h-7 text-xs gap-1">
          <UserPlus className="h-3 w-3" /> Add Admin
        </Button>
      </div>
      <div className="space-y-2">
        {admins.map((a, i) => (
          <div key={i} className="flex items-center gap-3 p-3 rounded-xl border border-border/50 hover:bg-muted/30 group transition-colors">
            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
              {a.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold">{a.name}</p>
              <p className="text-[11px] text-muted-foreground">{a.category} · {a.students.toLocaleString()} students</p>
            </div>
            <span className="text-sm font-bold text-green-600">{a.growth}</span>
            <StatusBadge status={a.status} />
            <button className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-muted transition-opacity">
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── Panel 5: Growth Intelligence ─────────────────────────────────────────

const PanelGrowth = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card className="p-5">
        <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" /> Category Growth
        </h4>
        <div className="space-y-3">
          {growthData.categories.map((c) => (
            <div key={c.name} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="font-medium">{c.name}</span>
                <span className="text-muted-foreground">{c.students.toLocaleString()} <span className="text-green-600 font-bold">+{c.growth}%</span></span>
              </div>
              <BarFill pct={Math.round((c.students / growthData.categories[0].students) * 100)} />
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5">
        <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <MapPin className="h-4 w-4 text-primary" /> State Growth
        </h4>
        <div className="space-y-2">
          {growthData.states.map((s) => (
            <div key={s.state} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-primary/5 cursor-pointer transition-colors">
              <div>
                <p className="text-xs font-semibold">{s.state}</p>
                <p className="text-[10px] text-muted-foreground">{s.students.toLocaleString()} students</p>
              </div>
              <span className={`text-xs font-bold ${s.growth > 10 ? 'text-green-600' : 'text-blue-600'}`}>+{s.growth}%</span>
            </div>
          ))}
        </div>
      </Card>
    </div>

    <Card className="p-5">
      <h4 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Layers className="h-4 w-4 text-primary" /> Feature Usage Trends
      </h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {growthData.features.map((f) => (
          <div key={f.feature} className="p-3 rounded-xl border border-border/50 text-center">
            <p className="text-xs text-muted-foreground">{f.feature}</p>
            <p className="text-lg font-bold mt-1">{(f.visits / 1000).toFixed(1)}k</p>
            <p className={`text-xs font-bold flex items-center justify-center gap-0.5 mt-0.5 ${f.trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
              {f.trend > 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
              {f.trend > 0 ? '+' : ''}{f.trend}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

// ─── Main Dashboard ──────────────────────────────────────────────────────

const SuperAdminDashboard = () => {
  const { user } = useAuth();

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground">Mission Control</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hello {user?.name || 'Superadmin'} · Platform operations overview
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <RefreshCw className="h-3.5 w-3.5" /> Sync Data
          </Button>
          <Button size="sm" className="gap-1.5 text-xs">
            <UserPlus className="h-3.5 w-3.5" /> Create Admin
          </Button>
        </div>
      </div>

      {/* Quick alerts strip */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {platformAlerts.map((a, i) => (
          <div key={i} className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium
            ${a.type === 'overdue' || a.type === 'drop' ? 'border-red-200 bg-red-50 text-red-700' : 'border-amber-200 bg-amber-50 text-amber-700'}`}>
            <AlertTriangle className="h-3 w-3" />
            {a.msg}
          </div>
        ))}
      </div>

      {/* 5 panels as tabs */}
      <Tabs defaultValue="ops">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="ops" className="text-xs">Daily Ops</TabsTrigger>
          <TabsTrigger value="content" className="text-xs">Content Control</TabsTrigger>
          <TabsTrigger value="students" className="text-xs">Student Performance</TabsTrigger>
          <TabsTrigger value="tasks" className="text-xs">Tasks & Staff</TabsTrigger>
          <TabsTrigger value="growth" className="text-xs">Growth Intelligence</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="ops">      <PanelDailyOps />      </TabsContent>
          <TabsContent value="content">  <PanelContent />       </TabsContent>
          <TabsContent value="students"> <PanelStudentPerf />   </TabsContent>
          <TabsContent value="tasks">    <PanelTasksStaff />    </TabsContent>
          <TabsContent value="growth">   <PanelGrowth />        </TabsContent>
        </div>
      </Tabs>

    </div>
  );
};

export default SuperAdminDashboard;
