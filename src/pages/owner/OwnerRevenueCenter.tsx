// src/pages/owner/OwnerRevenueCenter.tsx
// Owner Revenue Control Center — main payment & business intelligence hub.
// Route: /owner/payments-plans

import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Download, Settings, ChevronRight, TrendingUp, TrendingDown,
  IndianRupee, Users, BarChart3, RefreshCw, Package, Zap, Tag,
  Ticket, ClipboardList, Search, Eye, ArrowUpRight, ArrowDownRight,
  ShoppingCart, Star, Percent, RotateCcw, CreditCard, Wallet,
  Landmark, Smartphone,
} from 'lucide-react';
import { usePricingStore } from '@/hooks/usePricingStore';
import { useToast } from '@/hooks/use-toast';
import type { Transaction, TransactionStatus } from '@/types/pricing';

// ─── Currency formatter ────────────────────────────────────────────────────────

const fmt = (amount: number): string =>
  `₹${amount.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`;

const fmtCompact = (amount: number): string => {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(2)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(1)}K`;
  return `₹${amount.toLocaleString('en-IN')}`;
};

// ─── Payment method icon ───────────────────────────────────────────────────────

const MethodIcon: React.FC<{ method: string }> = ({ method }) => {
  const map: Record<string, React.ReactNode> = {
    upi: <Smartphone className="h-3.5 w-3.5" />,
    card: <CreditCard className="h-3.5 w-3.5" />,
    netbanking: <Landmark className="h-3.5 w-3.5" />,
    wallet: <Wallet className="h-3.5 w-3.5" />,
  };
  return <span className="text-slate-400">{map[method] ?? <CreditCard className="h-3.5 w-3.5" />}</span>;
};

// ─── Status badge ──────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: TransactionStatus }> = ({ status }) => {
  const styles: Record<TransactionStatus, string> = {
    completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25',
    failed:    'bg-red-500/10 text-red-400 border-red-500/25',
    pending:   'bg-amber-500/10 text-amber-400 border-amber-500/25',
    refunded:  'bg-slate-500/10 text-slate-400 border-slate-500/25',
  };
  const dots: Record<TransactionStatus, string> = {
    completed: 'bg-emerald-400', failed: 'bg-red-400',
    pending: 'bg-amber-400', refunded: 'bg-slate-400',
  };
  return (
    <span className={`inline-flex items-center gap-1.5 text-[10px] px-2.5 py-1 rounded-full border font-bold capitalize ${styles[status]}`}>
      {status === 'pending' ? (
        <span className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-amber-400" />
        </span>
      ) : (
        <span className={`w-1.5 h-1.5 rounded-full ${dots[status]}`} />
      )}
      {status}
    </span>
  );
};

// ─── KPI Card ──────────────────────────────────────────────────────────────────

interface KpiCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  trend?: number;
  trendLabel?: string;
  accent: string;     // Tailwind class string for icon bg + text
  iconBg: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ icon, label, value, trend, trendLabel, accent, iconBg }) => {
  const isUp = trend !== undefined ? trend >= 0 : null;
  return (
    <div className="relative rounded-xl bg-slate-900 border border-slate-800 p-4 hover:border-slate-700 transition-all duration-200 group overflow-hidden">
      {/* subtle glow on hover */}
      <div className={`absolute inset-0 opacity-0 group-hover:opacity-5 transition-opacity ${accent} pointer-events-none`} />
      <div className="flex items-start justify-between mb-3">
        <div className={`p-2 rounded-lg ${iconBg}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`flex items-center gap-0.5 text-[11px] font-semibold ${isUp ? 'text-emerald-400' : 'text-red-400'}`}>
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-black text-white tracking-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wide">{label}</p>
      {trendLabel && (
        <p className="text-[11px] text-slate-600 mt-0.5">{trendLabel}</p>
      )}
    </div>
  );
};

// ─── Quick Action Card ─────────────────────────────────────────────────────────

interface QuickActionProps {
  emoji: string;
  title: string;
  description: string;
  route: string;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ emoji, title, description, route }) => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(route)}
      className="flex items-center gap-3 w-full rounded-xl bg-slate-900 border border-slate-800 p-3.5 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all duration-200 group text-left"
    >
      <span className="text-2xl flex-shrink-0">{emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{title}</p>
        <p className="text-[11px] text-slate-500 truncate">{description}</p>
      </div>
      <ChevronRight className="h-4 w-4 text-slate-600 group-hover:text-indigo-400 flex-shrink-0 transition-colors group-hover:translate-x-0.5 duration-200" />
    </button>
  );
};

// ─── Main Component ────────────────────────────────────────────────────────────

const OwnerRevenueCenter: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    transactions, plans, packages, addons,
    getRevenueKPIs,
  } = usePricingStore();

  const kpis = useMemo(() => getRevenueKPIs(), [getRevenueKPIs]);

  // ── Transaction table state ──────────────────────────────────────────────────
  const [txnTab, setTxnTab] = useState<'all' | 'completed' | 'failed' | 'pending'>('all');
  const [txnSearch, setTxnSearch] = useState('');
  const [viewTxn, setViewTxn] = useState<Transaction | null>(null);

  const filteredTxns = useMemo(() => {
    let list = [...transactions];
    if (txnTab !== 'all') list = list.filter(t => t.status === txnTab);
    if (txnSearch.trim()) {
      const q = txnSearch.toLowerCase();
      list = list.filter(t =>
        t.id.toLowerCase().includes(q) ||
        t.studentName.toLowerCase().includes(q) ||
        t.studentEmail.toLowerCase().includes(q) ||
        t.items.some(i => i.name.toLowerCase().includes(q))
      );
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [transactions, txnTab, txnSearch]);

  // ── Plan distribution data ───────────────────────────────────────────────────
  const planDist = useMemo(() => {
    // Simulated subscriber counts per plan (deterministic from plan id)
    const MOCK_SUBS: Record<string, number> = {
      free: 8200, smart: 3100, pro: 4600, 'pro-max': 980,
    };
    const total = Object.values(MOCK_SUBS).reduce((s, n) => s + n, 0);
    return plans.map(p => ({
      plan: p,
      subs: MOCK_SUBS[p.id] ?? Math.floor(Math.random() * 500 + 100),
      share: Math.round(((MOCK_SUBS[p.id] ?? 200) / total) * 100),
      revenue: (MOCK_SUBS[p.id] ?? 200) * p.monthlyPrice,
    }));
  }, [plans]);

  // ── Top sellers ──────────────────────────────────────────────────────────────
  const topPackage = useMemo(() => {
    const pkg = packages.find(p => p.id === kpis.topSellingPackageId);
    return pkg ?? packages[0];
  }, [packages, kpis.topSellingPackageId]);

  const topAddon = useMemo(() => {
    const addon = addons.find(a => a.id === kpis.topSellingAddonId);
    return addon ?? addons[0];
  }, [addons, kpis.topSellingAddonId]);

  // ── CSV export ──────────────────────────────────────────────────────────────
  const handleExportCSV = () => {
    const header = ['ID', 'Student', 'Email', 'Items', 'Amount', 'Discount', 'GST', 'Total', 'Method', 'Status', 'Date'];
    const rows = filteredTxns.map(t => [
      t.id,
      t.studentName,
      t.studentEmail,
      t.items.map(i => i.name).join(' + '),
      t.subtotal.toFixed(2),
      t.discountAmount.toFixed(2),
      t.gstAmount.toFixed(2),
      t.total.toFixed(2),
      t.paymentMethod,
      t.status,
      new Date(t.createdAt).toLocaleString('en-IN'),
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `exament-transactions-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: '✅ CSV exported', description: `${filteredTxns.length} records downloaded` });
  };

  const handleExportReport = () => {
    toast({ title: '📊 Generating report…', description: 'Revenue report will be ready shortly.' });
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-950">

      {/* ── PAGE HEADER ─────────────────────────────────────────────────────── */}
      <div className="relative overflow-hidden bg-slate-950 border-b border-slate-800">
        {/* Glowing mesh blobs */}
        <div
          className="absolute top-[-60%] left-[-10%] w-[50%] h-[200%] rounded-full bg-indigo-500/12 blur-[120px] pointer-events-none animate-pulse"
          style={{ animationDuration: '9000ms' }}
        />
        <div
          className="absolute bottom-[-60%] right-[-10%] w-[45%] h-[200%] rounded-full bg-purple-500/12 blur-[120px] pointer-events-none animate-pulse"
          style={{ animationDuration: '7000ms' }}
        />
        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }}
        />

        <div className="relative z-10 px-6 py-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 max-w-[1400px] mx-auto">
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="p-2 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
                  <IndianRupee className="h-5 w-5 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-black text-white tracking-tight">Revenue Control Center</h1>
                <span className="inline-flex items-center gap-1.5 text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 font-bold shadow-[0_0_12px_rgba(16,185,129,0.08)]">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                  </span>
                  Live
                </span>
              </div>
              <p className="text-sm text-slate-400 font-medium pl-14">
                Owner-only business intelligence &amp; payment management
              </p>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportReport}
                className="gap-1.5 bg-slate-900 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white h-9 text-xs transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Download className="h-3.5 w-3.5" />
                Export Report
              </Button>
              <Button
                size="sm"
                onClick={() => navigate('/owner/payment-settings')}
                className="gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold h-9 text-xs shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.03] active:scale-[0.97]"
              >
                <Settings className="h-3.5 w-3.5" />
                Payment Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ── CONTENT ─────────────────────────────────────────────────────────── */}
      <div className="max-w-[1400px] mx-auto px-6 py-6 space-y-6">

        {/* ── KPI STRIP ─────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
          <KpiCard
            icon={<IndianRupee className="h-4 w-4 text-emerald-400" />}
            label="Today's Revenue"
            value={fmtCompact(kpis.todayRevenue)}
            trend={8.4}
            trendLabel="vs yesterday"
            accent="bg-emerald-500"
            iconBg="bg-emerald-500/10"
          />
          <KpiCard
            icon={<BarChart3 className="h-4 w-4 text-indigo-400" />}
            label="Monthly Revenue"
            value={fmtCompact(kpis.monthlyRevenue)}
            trend={12.3}
            trendLabel="vs last month"
            accent="bg-indigo-500"
            iconBg="bg-indigo-500/10"
          />
          <KpiCard
            icon={<TrendingUp className="h-4 w-4 text-violet-400" />}
            label="Yearly Revenue"
            value={fmtCompact(kpis.yearlyRevenue)}
            trend={34.7}
            trendLabel="vs last year"
            accent="bg-violet-500"
            iconBg="bg-violet-500/10"
          />
          <KpiCard
            icon={<Users className="h-4 w-4 text-sky-400" />}
            label="Active Subscribers"
            value={kpis.activeSubscribers.toLocaleString('en-IN')}
            trend={15.2}
            trendLabel="new this month"
            accent="bg-sky-500"
            iconBg="bg-sky-500/10"
          />
          <KpiCard
            icon={<Percent className="h-4 w-4 text-amber-400" />}
            label="Conversion Rate"
            value={`${kpis.conversionRate}%`}
            trend={2.1}
            trendLabel="visitors → paid"
            accent="bg-amber-500"
            iconBg="bg-amber-500/10"
          />
          <KpiCard
            icon={<RefreshCw className="h-4 w-4 text-rose-400" />}
            label="MRR"
            value={fmtCompact(kpis.mrr)}
            trend={12.3}
            trendLabel="monthly recurring"
            accent="bg-rose-500"
            iconBg="bg-rose-500/10"
          />
        </div>

        {/* ── QUICK ACTIONS ─────────────────────────────────────────────────── */}
        <div>
          <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-widest mb-3">Quick Actions</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <QuickActionCard
              emoji="📋"
              title="Plan Manager"
              description="Manage subscription tiers & pricing"
              route="/owner/plan-manager"
            />
            <QuickActionCard
              emoji="📦"
              title="Package Manager"
              description="Exam bundles & category packs"
              route="/owner/package-manager"
            />
            <QuickActionCard
              emoji="⚡"
              title="Addon Manager"
              description="Feature add-ons & standalone items"
              route="/owner/addon-manager"
            />
            <QuickActionCard
              emoji="🏷️"
              title="Category Access"
              description="Category pricing & plan inclusions"
              route="/owner/category-access"
            />
            <QuickActionCard
              emoji="🎟️"
              title="Coupon Manager"
              description="Discounts, promo codes & usage"
              route="/owner/coupon-manager"
            />
          </div>
        </div>

        {/* ── REVENUE WIDGETS ROW ────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* A — Top Sellers */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <Star className="h-4 w-4 text-amber-400" />
              <h3 className="text-sm font-bold text-white">Top Sellers</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {/* Top Package */}
              <div className="px-4 py-3 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-indigo-500/10 flex-shrink-0">
                      <Package className="h-3.5 w-3.5 text-indigo-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {topPackage?.name ?? 'Banking Pack'}
                      </p>
                      <p className="text-[10px] text-slate-500">Top Package</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-emerald-400">
                      {fmt(topPackage?.discountedPrice ?? topPackage?.price ?? 799)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {transactions.filter(t => t.items.some(i => i.id === topPackage?.id)).length} sales
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Addon */}
              <div className="px-4 py-3 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-violet-500/10 flex-shrink-0">
                      <Zap className="h-3.5 w-3.5 text-violet-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {topAddon?.name ?? 'Mentorship'}
                      </p>
                      <p className="text-[10px] text-slate-500">Top Addon</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-emerald-400">
                      {fmt(topAddon?.price ?? 299)}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {transactions.filter(t => t.items.some(i => i.id === topAddon?.id)).length} sales
                    </p>
                  </div>
                </div>
              </div>

              {/* Top Category */}
              <div className="px-4 py-3 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-amber-500/10 flex-shrink-0">
                      <Tag className="h-3.5 w-3.5 text-amber-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">
                        {kpis.topSellingCategoryId}
                      </p>
                      <p className="text-[10px] text-slate-500">Top Category</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-emerald-400">₹199</p>
                    <p className="text-[10px] text-slate-500">Standalone access</p>
                  </div>
                </div>
              </div>

              {/* Coupon usage */}
              <div className="px-4 py-3 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="p-1.5 rounded-lg bg-rose-500/10 flex-shrink-0">
                      <Ticket className="h-3.5 w-3.5 text-rose-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-white truncate">WELCOME50</p>
                      <p className="text-[10px] text-slate-500">Top Coupon</p>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-xs font-bold text-rose-400">−{fmt(kpis.couponImpact)}</p>
                    <p className="text-[10px] text-slate-500">Total discounts</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* B — Financial Metrics */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <BarChart3 className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Financial Metrics</h3>
            </div>
            <div className="divide-y divide-slate-800">
              {[
                {
                  label: 'ARPU',
                  sublabel: 'Avg Revenue Per User',
                  value: fmt(kpis.arpu),
                  accent: 'text-indigo-400',
                  icon: <IndianRupee className="h-3.5 w-3.5 text-indigo-400" />,
                  bg: 'bg-indigo-500/10',
                },
                {
                  label: 'Churn Rate',
                  sublabel: 'Monthly cancellations',
                  value: `${kpis.churnRate}%`,
                  accent: 'text-red-400',
                  icon: <TrendingDown className="h-3.5 w-3.5 text-red-400" />,
                  bg: 'bg-red-500/10',
                },
                {
                  label: 'Renewal Revenue',
                  sublabel: '~68% of MRR',
                  value: fmtCompact(kpis.renewalRevenue),
                  accent: 'text-emerald-400',
                  icon: <RotateCcw className="h-3.5 w-3.5 text-emerald-400" />,
                  bg: 'bg-emerald-500/10',
                },
                {
                  label: 'Coupon Impact',
                  sublabel: 'Total discounts given',
                  value: fmt(kpis.couponImpact),
                  accent: 'text-amber-400',
                  icon: <Ticket className="h-3.5 w-3.5 text-amber-400" />,
                  bg: 'bg-amber-500/10',
                },
              ].map(m => (
                <div key={m.label} className="flex items-center justify-between px-4 py-3 hover:bg-slate-800/50 transition-colors">
                  <div className="flex items-center gap-2.5">
                    <div className={`p-1.5 rounded-lg ${m.bg} flex-shrink-0`}>{m.icon}</div>
                    <div>
                      <p className="text-xs font-semibold text-white">{m.label}</p>
                      <p className="text-[10px] text-slate-500">{m.sublabel}</p>
                    </div>
                  </div>
                  <p className={`text-sm font-black ${m.accent}`}>{m.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* C — Plan Distribution */}
          <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800">
              <ClipboardList className="h-4 w-4 text-violet-400" />
              <h3 className="text-sm font-bold text-white">Plan Distribution</h3>
            </div>
            <div className="p-4 space-y-3.5">
              {planDist.map(({ plan, subs, share, revenue }) => {
                const colorMap: Record<string, { bar: string; text: string }> = {
                  free:     { bar: 'bg-slate-500', text: 'text-slate-400' },
                  smart:    { bar: 'bg-emerald-500', text: 'text-emerald-400' },
                  pro:      { bar: 'bg-indigo-500', text: 'text-indigo-400' },
                  'pro-max':{ bar: 'bg-amber-500', text: 'text-amber-400' },
                };
                const color = colorMap[plan.id] ?? { bar: 'bg-violet-500', text: 'text-violet-400' };
                return (
                  <div key={plan.id}>
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${color.bar} flex-shrink-0`} />
                        <span className="text-xs font-semibold text-white">{plan.name}</span>
                        {plan.badge && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-bold ${color.text} bg-white/5`}>
                            {plan.badge}
                          </span>
                        )}
                      </div>
                      <span className={`text-[11px] font-bold ${color.text}`}>{share}%</span>
                    </div>
                    <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1">
                      <div
                        className={`h-1.5 rounded-full ${color.bar} transition-all duration-700`}
                        style={{ width: `${share}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500">{subs.toLocaleString('en-IN')} subscribers</span>
                      <span className="text-[10px] text-slate-500">
                        {plan.monthlyPrice === 0 ? 'Free' : `${fmtCompact(revenue)}/mo`}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── TRANSACTIONS TABLE ────────────────────────────────────────────── */}
        <div className="rounded-xl bg-slate-900 border border-slate-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ShoppingCart className="h-4 w-4 text-indigo-400" />
              <h3 className="text-sm font-bold text-white">Transactions</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 font-semibold border border-slate-700">
                {filteredTxns.length} records
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
                <Input
                  value={txnSearch}
                  onChange={e => setTxnSearch(e.target.value)}
                  placeholder="Search transactions…"
                  className="pl-8 h-8 text-xs bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 w-52 focus:border-indigo-500"
                />
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExportCSV}
                className="gap-1.5 bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white h-8 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                CSV
              </Button>
            </div>
          </div>

          <Tabs value={txnTab} onValueChange={v => setTxnTab(v as typeof txnTab)}>
            <div className="px-4 pt-3">
              <TabsList className="bg-slate-800 border border-slate-700 h-8">
                {(['all', 'completed', 'failed', 'pending'] as const).map(tab => (
                  <TabsTrigger
                    key={tab}
                    value={tab}
                    className="text-xs capitalize data-[state=active]:bg-indigo-600 data-[state=active]:text-white text-slate-400 h-6 px-3"
                  >
                    {tab}
                    <span className="ml-1.5 text-[9px] px-1 py-0.5 rounded bg-white/10 font-bold">
                      {tab === 'all'
                        ? transactions.length
                        : transactions.filter(t => t.status === tab).length}
                    </span>
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {(['all', 'completed', 'failed', 'pending'] as const).map(tab => (
              <TabsContent key={tab} value={tab} className="mt-0">
                {filteredTxns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <ShoppingCart className="h-10 w-10 text-slate-700 mb-3" />
                    <p className="text-sm font-semibold text-slate-500">No transactions found</p>
                    <p className="text-xs text-slate-600 mt-1">
                      {txnSearch ? 'Try a different search term' : 'No records in this category'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-slate-800">
                          {['Transaction ID', 'Student', 'Items', 'Amount', 'Method', 'Status', 'Date', ''].map(h => (
                            <th
                              key={h}
                              className="text-left px-4 py-2.5 text-[10px] text-slate-500 font-semibold uppercase tracking-wider whitespace-nowrap"
                            >
                              {h}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {filteredTxns.map(txn => (
                          <tr
                            key={txn.id}
                            className="border-b border-slate-800/60 hover:bg-slate-800/30 transition-colors group"
                          >
                            {/* Transaction ID */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                                {txn.id.slice(0, 10)}…
                              </span>
                            </td>

                            {/* Student */}
                            <td className="px-4 py-3">
                              <p className="text-xs font-semibold text-white whitespace-nowrap">{txn.studentName}</p>
                              <p className="text-[10px] text-slate-500 truncate max-w-[140px]">{txn.studentEmail}</p>
                            </td>

                            {/* Items */}
                            <td className="px-4 py-3">
                              <p className="text-xs text-slate-300 max-w-[160px] truncate">
                                {txn.items[0]?.name ?? '—'}
                              </p>
                              {txn.items.length > 1 && (
                                <p className="text-[10px] text-slate-500">+{txn.items.length - 1} more</p>
                              )}
                            </td>

                            {/* Amount */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-xs font-bold text-white">{fmt(txn.total)}</p>
                              {txn.discountAmount > 0 && (
                                <p className="text-[10px] text-rose-400">−{fmt(txn.discountAmount)} off</p>
                              )}
                            </td>

                            {/* Method */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5">
                                <MethodIcon method={txn.paymentMethod} />
                                <span className="text-xs text-slate-400 capitalize">{txn.paymentMethod}</span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <StatusBadge status={txn.status} />
                            </td>

                            {/* Date */}
                            <td className="px-4 py-3 whitespace-nowrap">
                              <p className="text-xs text-slate-400">
                                {new Date(txn.createdAt).toLocaleDateString('en-IN', {
                                  day: '2-digit', month: 'short', year: 'numeric',
                                })}
                              </p>
                              <p className="text-[10px] text-slate-600">
                                {new Date(txn.createdAt).toLocaleTimeString('en-IN', {
                                  hour: '2-digit', minute: '2-digit',
                                })}
                              </p>
                            </td>

                            {/* View */}
                            <td className="px-4 py-3">
                              <button
                                onClick={() => setViewTxn(txn)}
                                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>

      {/* ── TRANSACTION DETAIL MODAL ──────────────────────────────────────── */}
      {viewTxn && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setViewTxn(null)}
        >
          <div
            className="w-full max-w-md rounded-2xl bg-slate-900 border border-slate-700 shadow-2xl overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <p className="text-sm font-bold text-white">Transaction Detail</p>
                <p className="text-[11px] font-mono text-indigo-400 mt-0.5">{viewTxn.id}</p>
              </div>
              <button
                onClick={() => setViewTxn(null)}
                className="text-slate-500 hover:text-white transition-colors p-1"
              >
                ✕
              </button>
            </div>

            {/* Modal body */}
            <div className="p-5 space-y-4">
              {/* Status + amount */}
              <div className="flex items-center justify-between">
                <StatusBadge status={viewTxn.status} />
                <span className="text-xl font-black text-white">{fmt(viewTxn.total)}</span>
              </div>

              {/* Student */}
              <div className="rounded-lg bg-slate-800 p-3 space-y-1">
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider">Student</p>
                <p className="text-sm font-semibold text-white">{viewTxn.studentName}</p>
                <p className="text-xs text-slate-400">{viewTxn.studentEmail}</p>
              </div>

              {/* Items */}
              <div className="rounded-lg bg-slate-800 p-3 space-y-2">
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1">Items Purchased</p>
                {viewTxn.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-semibold capitalize">
                        {item.type}
                      </span>
                      <span className="text-xs text-white">{item.name}</span>
                    </div>
                    <span className="text-xs font-semibold text-slate-300">{fmt(item.price)}</span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="rounded-lg bg-slate-800 p-3 space-y-1.5">
                <p className="text-[10px] text-slate-500 uppercase font-semibold tracking-wider mb-1">Breakdown</p>
                <div className="flex justify-between text-xs text-slate-400">
                  <span>Subtotal</span><span>{fmt(viewTxn.subtotal)}</span>
                </div>
                {viewTxn.discountAmount > 0 && (
                  <div className="flex justify-between text-xs text-rose-400">
                    <span>Discount {viewTxn.couponCode && `(${viewTxn.couponCode})`}</span>
                    <span>−{fmt(viewTxn.discountAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs text-slate-400">
                  <span>GST ({viewTxn.gstRate}%)</span><span>{fmt(viewTxn.gstAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-white border-t border-slate-700 pt-1.5 mt-1">
                  <span>Total</span><span>{fmt(viewTxn.total)}</span>
                </div>
              </div>

              {/* Meta */}
              <div className="flex items-center justify-between text-xs text-slate-500">
                <div className="flex items-center gap-1.5">
                  <MethodIcon method={viewTxn.paymentMethod} />
                  <span className="capitalize">{viewTxn.paymentMethod}</span>
                </div>
                <span>{new Date(viewTxn.createdAt).toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="px-5 py-3 border-t border-slate-800 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewTxn(null)}
                className="bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white text-xs"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OwnerRevenueCenter;
