import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/app/providers';
import { useStudentData } from '@/app/providers';
import {
  TrendingUp, TrendingDown, Users, DollarSign, BarChart3, MapPin,
  Bell, PhoneCall, Star, AlertTriangle, Download, Settings,
  Activity, Target, Zap, ChevronRight, ArrowUpRight, ArrowDownRight,
  Eye, Layers, BookOpen, Calendar, Video, FileText, Brain,
} from 'lucide-react';

// ─── Mock data ────────────────────────────────────────────────────────────────

const funnelData = {
  visitors: 12400,
  registered: 3100,
  subscribed: 640,
};

const retentionWindows = [
  { label: 'Last 7 days', users: 1240, pct: 82 },
  { label: 'Last 15 days', users: 1890, pct: 74 },
  { label: 'Last 30 days', users: 2640, pct: 65 },
  { label: 'Last 45 days', users: 2980, pct: 58 },
  { label: 'Last 60 days', users: 3100, pct: 51 },
  { label: 'Last 75 days', users: 3210, pct: 44 },
  { label: 'Last 100 days', users: 3280, pct: 38 },
];

const categoryGrowth = [
  { name: 'Banking', students: 18400, growth: +14, revenue: '₹46L' },
  { name: 'SSC', students: 12800, growth: +9, revenue: '₹32L' },
  { name: 'Railway', students: 8200, growth: +18, revenue: '₹20.5L' },
  { name: 'UPSC', students: 5600, growth: +6, revenue: '₹14L' },
  { name: 'State PSC', students: 4100, growth: +11, revenue: '₹10.2L' },
  { name: 'Defence', students: 2300, growth: +4, revenue: '₹5.7L' },
];

const stateGrowth = [
  { state: 'Tamil Nadu', students: 4800, growth: +18 },
  { state: 'Uttar Pradesh', students: 6200, growth: +12 },
  { state: 'Maharashtra', students: 3900, growth: +9 },
  { state: 'Karnataka', students: 3100, growth: +15 },
  { state: 'Bihar', students: 2800, growth: +7 },
  { state: 'Rajasthan', students: 2400, growth: +5 },
];

const trafficSources = [
  { source: 'Google', pct: 42, users: 1302 },
  { source: 'Instagram', pct: 28, users: 868 },
  { source: 'YouTube', pct: 18, users: 558 },
  { source: 'Referral', pct: 12, users: 372 },
];

const revenueSummary = {
  total: '₹1.28 Cr',
  renewal: '68%',
  churn: '7.2%',
  plans: [
    { plan: 'Monthly ₹499', sales: 820, revenue: '₹4.09L' },
    { plan: 'Quarterly ₹999', sales: 340, revenue: '₹3.39L' },
    { plan: 'Yearly ₹1999', sales: 210, revenue: '₹4.19L' },
    { plan: 'Premium ₹2999', sales: 90, revenue: '₹2.69L' },
  ],
};

const featureUsage = [
  { feature: 'Tests', icon: BookOpen, visits: 48200, trend: +12 },
  { feature: 'Dashboard', icon: BarChart3, visits: 38700, trend: +8 },
  { feature: 'Current Affairs', icon: FileText, visits: 29400, trend: +22 },
  { feature: 'Videos', icon: Video, visits: 18900, trend: +5 },
  { feature: 'Calendar', icon: Calendar, visits: 12400, trend: -3 },
  { feature: 'Mentorship', icon: Brain, visits: 8300, trend: +14 },
  { feature: 'PDFs', icon: Layers, visits: 6100, trend: +1 },
  { feature: 'Strict Mode', icon: Zap, visits: 3200, trend: +31 },
];

const staffRanking = {
  admins: [
    { name: 'Priya S.', growth: '+24%', active: 1840, score: 96 },
    { name: 'Ravi K.', growth: '+18%', active: 1620, score: 91 },
    { name: 'Anita M.', growth: '+12%', active: 1280, score: 84 },
  ],
  employees: [
    { name: 'Deepak R.', accuracy: '98%', engagement: '92%', completion: '100%', score: 97 },
    { name: 'Swetha N.', accuracy: '96%', engagement: '88%', completion: '94%', score: 93 },
    { name: 'Kiran J.', accuracy: '93%', engagement: '85%', completion: '90%', score: 89 },
  ],
};

const alerts = [
  { type: 'warning', message: 'Active users down 8% vs last week', time: '2h ago' },
  { type: 'danger', message: 'Railway category growth stalled — check content', time: '5h ago' },
  { type: 'info', message: 'Server load at 71% — approaching threshold', time: '1d ago' },
  { type: 'success', message: 'Instagram campaign ROI +34% this month', time: '1d ago' },
];

const forecast = {
  low: 1200,
  high: 1350,
  basis: 'Based on 90-day trend + campaign activity',
};

// ─── Reusable mini components ─────────────────────────────────────────────────

const StatPill: React.FC<{ label: string; value: string | number; sub?: string; up?: boolean | null }> = ({ label, value, sub, up }) => (
  <div className="flex flex-col gap-0.5">
    <p className="text-xs text-muted-foreground">{label}</p>
    <p className="text-xl font-bold text-foreground">{value}</p>
    {sub && (
      <p className={`text-xs font-medium flex items-center gap-0.5 ${up === true ? 'text-green-600' : up === false ? 'text-red-500' : 'text-muted-foreground'}`}>
        {up === true && <ArrowUpRight className="h-3 w-3" />}
        {up === false && <ArrowDownRight className="h-3 w-3" />}
        {sub}
      </p>
    )}
  </div>
);

const AlertBadge: React.FC<{ type: string }> = ({ type }) => {
  const map: Record<string, string> = {
    warning: 'bg-amber-100 text-amber-700 border-amber-200',
    danger: 'bg-red-100 text-red-600 border-red-200',
    info: 'bg-blue-100 text-blue-700 border-blue-200',
    success: 'bg-green-100 text-green-700 border-green-200',
  };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${map[type] || map.info}`}>{type}</span>;
};

const BarFill: React.FC<{ pct: number; color?: string }> = ({ pct, color = 'bg-primary' }) => (
  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
    <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
  </div>
);

// ─── 6 Panels ─────────────────────────────────────────────────────────────────

const PanelFunnel = () => {
  const regPct = Math.round((funnelData.registered / funnelData.visitors) * 100);
  const subPct = Math.round((funnelData.subscribed / funnelData.registered) * 100);

  return (
    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Target className="h-4 w-4 text-primary" /> User Funnel
      </h3>
      <div className="space-y-4">
        {[
          { label: 'Website Visitors', value: funnelData.visitors.toLocaleString(), pct: 100, color: 'bg-slate-400' },
          { label: 'Registered Users', value: `${funnelData.registered.toLocaleString()} (${regPct}%)`, pct: regPct, color: 'bg-blue-500' },
          { label: 'Subscribed Users', value: `${funnelData.subscribed.toLocaleString()} (${subPct}% of reg)`, pct: subPct, color: 'bg-green-500' },
        ].map((row) => (
          <div key={row.label} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">{row.label}</span>
              <span className="font-semibold text-foreground">{row.value}</span>
            </div>
            <BarFill pct={row.pct} color={row.color} />
          </div>
        ))}
      </div>
      <p className="text-[11px] text-muted-foreground mt-3 border-t border-border/40 pt-3">
        Overall funnel conversion: <span className="font-bold text-primary">{Math.round((funnelData.subscribed / funnelData.visitors) * 100)}%</span> (visitors → paid)
      </p>
    </Card>
  );
};

const PanelRetention = () => (
  <Card className="p-5">
    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
      <Activity className="h-4 w-4 text-primary" /> Active Users (Retention)
    </h3>
    <div className="space-y-3">
      {retentionWindows.map((w) => (
        <div key={w.label} className="space-y-1">
          <div className="flex justify-between text-xs">
            <span className="text-muted-foreground">{w.label}</span>
            <span className="font-semibold">{w.users.toLocaleString()} <span className="text-muted-foreground font-normal">({w.pct}%)</span></span>
          </div>
          <BarFill pct={w.pct} color={w.pct >= 70 ? 'bg-green-500' : w.pct >= 50 ? 'bg-amber-500' : 'bg-red-400'} />
        </div>
      ))}
    </div>
  </Card>
);

const PanelGrowth = () => (
  <div className="space-y-4">
    {/* By Category */}
    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <BarChart3 className="h-4 w-4 text-primary" /> Growth by Exam Category
      </h3>
      <div className="space-y-2">
        {categoryGrowth.map((cat) => (
          <div key={cat.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/40 transition-colors cursor-pointer group">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium w-28">{cat.name}</span>
              <span className="text-xs text-muted-foreground">{cat.students.toLocaleString()} students</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-foreground">{cat.revenue}</span>
              <Badge className={`text-[10px] px-1.5 py-0 ${cat.growth > 10 ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                +{cat.growth}%
              </Badge>
              <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
            </div>
          </div>
        ))}
      </div>
    </Card>

    {/* By State */}
    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <MapPin className="h-4 w-4 text-primary" /> Growth by State / City
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {stateGrowth.map((s) => (
          <div key={s.state} className="flex items-center justify-between p-2.5 rounded-lg bg-muted/30 hover:bg-primary/5 hover:border-primary/30 border border-transparent transition-all cursor-pointer">
            <div>
              <p className="text-xs font-semibold">{s.state}</p>
              <p className="text-[10px] text-muted-foreground">{s.students.toLocaleString()}</p>
            </div>
            <span className={`text-xs font-bold ${s.growth > 10 ? 'text-green-600' : 'text-blue-600'}`}>+{s.growth}%</span>
          </div>
        ))}
      </div>
    </Card>

    {/* By Traffic Source */}
    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Eye className="h-4 w-4 text-primary" /> Traffic Sources
      </h3>
      <div className="space-y-3">
        {trafficSources.map((src) => (
          <div key={src.source} className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="font-medium">{src.source}</span>
              <span className="text-muted-foreground">{src.users.toLocaleString()} users ({src.pct}%)</span>
            </div>
            <BarFill pct={src.pct} />
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const PanelRevenue = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-3 gap-4">
      <Card className="p-4 text-center">
        <DollarSign className="h-4 w-4 text-green-500 mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">Total Revenue</p>
        <p className="text-xl font-bold text-foreground">{revenueSummary.total}</p>
      </Card>
      <Card className="p-4 text-center">
        <TrendingUp className="h-4 w-4 text-blue-500 mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">Renewal Rate</p>
        <p className="text-xl font-bold text-blue-600">{revenueSummary.renewal}</p>
      </Card>
      <Card className="p-4 text-center">
        <TrendingDown className="h-4 w-4 text-red-500 mx-auto mb-1" />
        <p className="text-xs text-muted-foreground">Churn Rate</p>
        <p className="text-xl font-bold text-red-500">{revenueSummary.churn}</p>
      </Card>
    </div>

    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-4">Subscription Plan Breakdown</h3>
      <div className="space-y-2">
        {revenueSummary.plans.map((plan) => (
          <div key={plan.plan} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
            <span className="text-sm font-medium">{plan.plan}</span>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-muted-foreground">{plan.sales} sales</span>
              <span className="font-bold text-foreground">{plan.revenue}</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const PanelProductUsage = () => (
  <Card className="p-5">
    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
      <Layers className="h-4 w-4 text-primary" /> Feature Usage (This Month)
    </h3>
    <div className="space-y-3">
      {featureUsage.map(({ feature, icon: Icon, visits, trend }) => (
        <div key={feature} className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-primary/10 flex-shrink-0">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between text-xs mb-1">
              <span className="font-medium">{feature}</span>
              <span className="text-muted-foreground">{visits.toLocaleString()} visits</span>
            </div>
            <BarFill pct={Math.round((visits / featureUsage[0].visits) * 100)} />
          </div>
          <span className={`text-[11px] font-bold flex-shrink-0 w-10 text-right ${trend > 0 ? 'text-green-600' : 'text-red-500'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        </div>
      ))}
    </div>
  </Card>
);

const PanelForecast = () => (
  <Card className="p-5">
    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
      <Brain className="h-4 w-4 text-primary" /> 30-Day Registration Forecast
    </h3>
    <div className="flex items-center justify-center py-8">
      <div className="text-center">
        <p className="text-xs text-muted-foreground mb-2">Expected registrations</p>
        <p className="text-4xl font-black text-primary">{forecast.low.toLocaleString()}–{forecast.high.toLocaleString()}</p>
        <p className="text-sm text-muted-foreground mt-2">students</p>
        <p className="text-xs text-muted-foreground mt-4 max-w-xs">{forecast.basis}</p>
      </div>
    </div>
    <div className="border-t border-border/40 pt-3 grid grid-cols-3 gap-3 text-center text-xs">
      <div>
        <p className="text-muted-foreground">Servers</p>
        <p className="font-semibold text-amber-600">Plan upgrade</p>
      </div>
      <div>
        <p className="text-muted-foreground">Marketing budget</p>
        <p className="font-semibold text-foreground">₹1.2L</p>
      </div>
      <div>
        <p className="text-muted-foreground">Staff needed</p>
        <p className="font-semibold text-foreground">+2</p>
      </div>
    </div>
  </Card>
);

// ─── Staff & Calling panels ───────────────────────────────────────────────────

const PanelStaff = () => (
  <div className="space-y-4">
    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 text-amber-500" /> Admin Ranking
      </h3>
      <div className="space-y-2">
        {staffRanking.admins.map((a, i) => (
          <div key={a.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <span className={`text-sm font-black w-5 ${i === 0 ? 'text-amber-500' : 'text-muted-foreground'}`}>#{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{a.name}</p>
              <p className="text-xs text-muted-foreground">{a.active.toLocaleString()} active students</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-green-600">{a.growth}</p>
              <p className="text-[10px] text-muted-foreground">Score: {a.score}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>

    <Card className="p-5">
      <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
        <Star className="h-4 w-4 text-blue-500" /> Employee Ranking
      </h3>
      <div className="space-y-2">
        {staffRanking.employees.map((e, i) => (
          <div key={e.name} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
            <span className={`text-sm font-black w-5 ${i === 0 ? 'text-blue-500' : 'text-muted-foreground'}`}>#{i + 1}</span>
            <div className="flex-1">
              <p className="text-sm font-semibold">{e.name}</p>
              <div className="flex gap-2 mt-0.5">
                <span className="text-[10px] text-muted-foreground">Accuracy: <b>{e.accuracy}</b></span>
                <span className="text-[10px] text-muted-foreground">Engagement: <b>{e.engagement}</b></span>
              </div>
            </div>
            <p className="text-sm font-bold text-blue-600">{e.score}</p>
          </div>
        ))}
      </div>
    </Card>
  </div>
);

const PanelAlerts = () => (
  <Card className="p-5">
    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
      <Bell className="h-4 w-4 text-primary" /> Platform Alerts
    </h3>
    <div className="space-y-3">
      {alerts.map((a, i) => (
        <div key={i} className="flex items-start gap-3 p-3 rounded-lg border border-border/50 bg-muted/20">
          <AlertTriangle className={`h-4 w-4 mt-0.5 flex-shrink-0 ${a.type === 'danger' ? 'text-red-500' : a.type === 'warning' ? 'text-amber-500' : a.type === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground">{a.message}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{a.time}</p>
          </div>
          <AlertBadge type={a.type} />
        </div>
      ))}
    </div>
  </Card>
);

const PanelCalling = () => (
  <Card className="p-5">
    <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
      <PhoneCall className="h-4 w-4 text-primary" /> Calling Campaign Builder
    </h3>
    <div className="grid grid-cols-2 gap-3 mb-4">
      {[
        { label: 'Filter by City', placeholder: 'e.g. Chennai, Patna' },
        { label: 'Filter by Exam', placeholder: 'e.g. IBPS PO' },
        { label: 'User type', placeholder: 'Free / Paid / Churned' },
        { label: 'Last active window', placeholder: 'e.g. Last 7 days' },
      ].map((f) => (
        <div key={f.label} className="space-y-1">
          <label className="text-[11px] text-muted-foreground font-medium">{f.label}</label>
          <div className="h-8 rounded-lg border border-border bg-muted/30 px-3 flex items-center text-xs text-muted-foreground">{f.placeholder}</div>
        </div>
      ))}
    </div>
    <Button size="sm" className="w-full gap-2">
      <PhoneCall className="h-3.5 w-3.5" /> Generate Call List
    </Button>
    <p className="text-[10px] text-muted-foreground text-center mt-2">Estimated list: ~420 students</p>
  </Card>
);

// ─── Main dashboard ───────────────────────────────────────────────────────────

const OwnerDashboard = () => {
  const { user } = useAuth();
  const { analytics } = useStudentData();

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">

      {/* Page header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-foreground flex items-center gap-2">
            Platform Command Centre
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Hello {user?.name || 'Owner'} · Your platform snapshot as of today
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export Report
          </Button>
          <Button size="sm" className="gap-1.5">
            <Settings className="h-3.5 w-3.5" /> Platform Settings
          </Button>
        </div>
      </div>

      {/* Alerts bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {alerts.map((a, i) => (
          <div key={i} className={`flex-shrink-0 flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-medium
            ${a.type === 'danger' ? 'border-red-200 bg-red-50 text-red-700' :
              a.type === 'warning' ? 'border-amber-200 bg-amber-50 text-amber-700' :
                a.type === 'success' ? 'border-green-200 bg-green-50 text-green-700' :
                  'border-blue-200 bg-blue-50 text-blue-700'}`}>
            <AlertTriangle className="h-3 w-3" />
            {a.message}
          </div>
        ))}
      </div>

      {/* Top KPI strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: revenueSummary.total, sub: '+14% MoM', up: true },
          { label: 'Subscribed Users', value: funnelData.subscribed.toLocaleString(), sub: `of ${funnelData.registered.toLocaleString()} registered`, up: null },
          { label: 'Retention (30d)', value: `${retentionWindows[2].pct}%`, sub: 'active last 30 days', up: true },
          { label: 'Churn Rate', value: revenueSummary.churn, sub: '↓ improving', up: true },
        ].map((kpi) => (
          <Card key={kpi.label} className="p-4">
            <StatPill {...kpi} />
          </Card>
        ))}
      </div>

      {/* Main 6-panel tabs */}
      <Tabs defaultValue="funnel">
        <TabsList className="flex-wrap h-auto gap-1 bg-muted/50 p-1">
          <TabsTrigger value="funnel" className="text-xs">User Funnel</TabsTrigger>
          <TabsTrigger value="retention" className="text-xs">Retention</TabsTrigger>
          <TabsTrigger value="growth" className="text-xs">Growth Analytics</TabsTrigger>
          <TabsTrigger value="revenue" className="text-xs">Revenue</TabsTrigger>
          <TabsTrigger value="product" className="text-xs">Product Usage</TabsTrigger>
          <TabsTrigger value="forecast" className="text-xs">Forecast</TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="funnel">    <PanelFunnel />         </TabsContent>
          <TabsContent value="retention"> <PanelRetention />      </TabsContent>
          <TabsContent value="growth">    <PanelGrowth />         </TabsContent>
          <TabsContent value="revenue">   <PanelRevenue />        </TabsContent>
          <TabsContent value="product">   <PanelProductUsage />   </TabsContent>
          <TabsContent value="forecast">  <PanelForecast />       </TabsContent>
        </div>
      </Tabs>

      {/* Bottom row: Staff + Calling + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-1"><PanelAlerts /></div>
        <div className="lg:col-span-1"><PanelStaff /></div>
        <div className="lg:col-span-1"><PanelCalling /></div>
      </div>

    </div>
  );
};

export default OwnerDashboard;
