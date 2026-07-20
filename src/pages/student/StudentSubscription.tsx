import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { Transaction } from '@/types/pricing';
import {
  Crown, Check, Calendar, ArrowRight, RefreshCw, Download,
  BookOpen, FileText, Brain, BookA, Newspaper, ShieldCheck,
  Zap, Package, Star, CreditCard, AlertTriangle, ChevronLeft,
  ChevronRight, Layers, X,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const STATUS_CONFIG = {
  completed: { cls: 'bg-emerald-100 text-emerald-700 border-emerald-200', label: 'Paid' },
  failed:    { cls: 'bg-red-100 text-red-600 border-red-200',             label: 'Failed' },
  pending:   { cls: 'bg-amber-100 text-amber-700 border-amber-200',       label: 'Pending' },
  refunded:  { cls: 'bg-slate-100 text-slate-600 border-slate-200',       label: 'Refunded' },
};

const ADDON_ICONS: Record<string, React.FC<{ className?: string }>> = {
  mentorship: Brain, vocabulary: BookA, 'current-affairs-premium': Newspaper,
  'pdf-bundle': FileText, 'strict-mode': ShieldCheck,
};

function daysFromNow(days: number): string {
  const d = new Date(Date.now() + days * 86400000);
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function daysLeft(expiry: string): number {
  return Math.max(0, Math.round((new Date(expiry).getTime() - Date.now()) / 86400000));
}

const PLAN_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  free:      { bg: 'from-slate-800 to-slate-900',     border: 'border-slate-600', text: 'text-slate-200', badge: 'bg-slate-600 text-white' },
  smart:     { bg: 'from-emerald-700 to-emerald-900', border: 'border-emerald-500', text: 'text-emerald-100', badge: 'bg-emerald-500 text-white' },
  pro:       { bg: 'from-indigo-700 to-purple-900',   border: 'border-indigo-400', text: 'text-indigo-100', badge: 'bg-indigo-500 text-white' },
  'pro-max': { bg: 'from-amber-700 to-orange-900',    border: 'border-amber-400', text: 'text-amber-100', badge: 'bg-amber-500 text-white' },
};

// ─── Mock Student Access (simulated current plan) ─────────────────────────────
// In a real app this comes from auth context / backend

const MOCK_PLAN_ID = 'pro';
const MOCK_PLAN_EXPIRY = daysFromNow(28);
const MOCK_ACTIVE_ADDONS = ['addon-mentorship', 'addon-vocabulary'];
const MOCK_ACTIVE_PACKAGES = ['pkg-banking'];

// ─── Current Plan Card ────────────────────────────────────────────────────────

const CurrentPlanCard: React.FC = () => {
  const navigate = useNavigate();
  const { getPlanById } = usePricingStore();
  const plan = getPlanById(MOCK_PLAN_ID);
  if (!plan) return null;

  const colors = PLAN_COLORS[plan.id] ?? PLAN_COLORS.free;
  const expiry = MOCK_PLAN_EXPIRY;
  const left = daysLeft(expiry);
  const total = plan.monthlyPrice > 0 ? 30 : 0;
  const pct = total > 0 ? Math.round((left / total) * 100) : 100;

  return (
    <Card className={`border-2 ${colors.border} bg-gradient-to-br ${colors.bg} text-white overflow-hidden`}>
      <CardContent className="p-6 space-y-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-300" />
              <span className="text-lg font-black">{plan.name} Plan</span>
              {plan.badge && (
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.badge}`}>{plan.badge}</span>
              )}
            </div>
            <p className={`text-sm ${colors.text}`}>{plan.description}</p>
          </div>
          <Badge className="bg-emerald-500/30 text-emerald-200 border-emerald-400/50">Active</Badge>
        </div>

        {plan.monthlyPrice > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className={colors.text}>Days remaining</span>
              <span className="font-bold">{left} / {total} days</span>
            </div>
            <Progress value={pct} className="h-2 bg-white/20" />
            <p className={`text-xs ${colors.text}`}>Expires on: {expiry}</p>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {plan.features.filter(f => f.value !== false).slice(0, 4).map(f => (
            <div key={f.id} className="flex items-center gap-1.5 text-xs">
              <Check className="h-3.5 w-3.5 text-emerald-300 flex-shrink-0" />
              <span className={colors.text}>{f.label}</span>
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            className="bg-white text-indigo-700 hover:bg-white/90 font-semibold gap-2"
            onClick={() => navigate(`/student/checkout?type=plan&id=${plan.id}&billing=monthly`)}
          >
            <RefreshCw className="h-4 w-4" /> Renew Plan
          </Button>
          <Button
            variant="outline"
            className="border-white/40 text-white hover:bg-white/10 gap-2"
            onClick={() => navigate('/student/pricing')}
          >
            <ArrowRight className="h-4 w-4" /> Upgrade Plan
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// ─── Active Add-ons ───────────────────────────────────────────────────────────

const ActiveAddons: React.FC = () => {
  const navigate = useNavigate();
  const { getActiveAddons } = usePricingStore();
  const { toast } = useToast();
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);

  const addons = getActiveAddons().filter(a => MOCK_ACTIVE_ADDONS.includes(a.id));

  if (addons.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center space-y-3">
          <Zap className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="font-medium text-foreground">No active add-ons</p>
          <p className="text-sm text-muted-foreground">Supercharge your preparation with feature add-ons</p>
          <Button variant="outline" onClick={() => navigate('/student/pricing#addons')} className="gap-2">
            Browse Add-ons <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {addons.map(addon => {
          const Icon = ADDON_ICONS[addon.featureKey] ?? Zap;
          const expiry = daysFromNow(addon.isRecurring ? 22 : 180);
          const left = daysLeft(expiry);
          return (
            <Card key={addon.id} className="border-0 shadow-sm">
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                    <Icon className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm text-foreground">{addon.name}</p>
                    <p className="text-xs text-muted-foreground">{addon.isRecurring ? 'Monthly renewal' : 'One-time'}</p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Expires: {expiry}</span>
                  <Badge variant="outline" className={left < 7 ? 'border-red-300 text-red-600' : ''}>{left}d left</Badge>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1 text-xs" onClick={() => navigate(`/student/checkout?type=addon&id=${addon.id}`)}>
                    <RefreshCw className="h-3.5 w-3.5" /> Renew
                  </Button>
                  <Button size="sm" variant="ghost" className="text-red-500 hover:text-red-700 hover:bg-red-50 text-xs" onClick={() => setRemoveTarget(addon.id)}>
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <AlertDialog open={!!removeTarget} onOpenChange={o => !o && setRemoveTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove Add-on?</AlertDialogTitle>
            <AlertDialogDescription>This add-on will be deactivated at the end of your current billing period.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep It</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
              toast({ title: 'Add-on Scheduled for Removal', description: 'It will remain active until your billing period ends.' });
              setRemoveTarget(null);
            }}>Remove</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

// ─── Active Packages ──────────────────────────────────────────────────────────

const ActivePackages: React.FC = () => {
  const navigate = useNavigate();
  const { getActivePackages } = usePricingStore();

  const packages = getActivePackages().filter(p => MOCK_ACTIVE_PACKAGES.includes(p.id));

  if (packages.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center space-y-3">
          <Package className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="font-medium text-foreground">No exam packages</p>
          <p className="text-sm text-muted-foreground">Get targeted packages for specific exam categories</p>
          <Button variant="outline" onClick={() => navigate('/student/pricing#packages')} className="gap-2">
            Browse Packages <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>
    );
  }

  const CAT_COLORS: Record<string, string> = {
    Banking: 'bg-blue-100 text-blue-700', SSC: 'bg-orange-100 text-orange-700',
    Railway: 'bg-green-100 text-green-700', UPSC: 'bg-purple-100 text-purple-700',
    TNPSC: 'bg-rose-100 text-rose-700',
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {packages.map(pkg => {
        const catColor = CAT_COLORS[pkg.category] ?? 'bg-slate-100 text-slate-700';
        const expiry = daysFromNow(240);
        const left = daysLeft(expiry);
        return (
          <Card key={pkg.id} className="border-0 shadow-sm">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-foreground">{pkg.name}</p>
                  <Badge className={`text-xs mt-1 ${catColor}`}>{pkg.category}</Badge>
                </div>
                <Badge variant="outline" className="text-xs">{left}d left</Badge>
              </div>
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span><BookOpen className="h-3.5 w-3.5 inline mr-1" />{pkg.includedTests} Tests</span>
                <span><FileText className="h-3.5 w-3.5 inline mr-1" />{pkg.includedPDFs} PDFs</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {pkg.includedExams.slice(0, 3).map(e => (
                  <span key={e} className="text-[10px] bg-muted border rounded px-2 py-0.5">{e}</span>
                ))}
                {pkg.includedExams.length > 3 && <span className="text-[10px] text-muted-foreground">+{pkg.includedExams.length - 3} more</span>}
              </div>
              <Button size="sm" variant="outline" className="w-full gap-1 text-xs" onClick={() => navigate('/student/tests')}>
                View Tests <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

// ─── Billing History ──────────────────────────────────────────────────────────

const BillingHistory: React.FC = () => {
  const { toast } = useToast();
  const { transactions } = usePricingStore();
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 5;

  const sorted = [...transactions].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const total = sorted.length;
  const pages = Math.ceil(total / PAGE_SIZE);
  const slice = sorted.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  if (sorted.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center space-y-3">
          <CreditCard className="h-10 w-10 text-muted-foreground/40 mx-auto" />
          <p className="font-medium text-foreground">No billing history yet</p>
          <p className="text-sm text-muted-foreground">Your payment history will appear here</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px]">
          <thead>
            <tr className="border-b bg-muted/30">
              {['Date', 'Description', 'Amount', 'Method', 'Status', 'Invoice'].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border/50">
            {slice.map(txn => {
              const sc = STATUS_CONFIG[txn.status] ?? STATUS_CONFIG.pending;
              return (
                <tr key={txn.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {new Date(txn.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-foreground">
                    {txn.items.map(i => i.name).join(', ')}
                  </td>
                  <td className="px-4 py-3 text-sm font-bold text-foreground">{fmt(txn.total)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{txn.paymentMethod}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Button variant="ghost" size="sm" className="h-7 text-xs gap-1" onClick={() => toast({ title: 'Invoice', description: 'Invoice download will be available once integrated with backend.' })}>
                      <Download className="h-3.5 w-3.5" /> PDF
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {pages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t bg-muted/20">
          <span className="text-xs text-muted-foreground">Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, total)} of {total}</span>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)} className="h-7 w-7 p-0">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" disabled={page >= pages - 1} onClick={() => setPage(p => p + 1)} className="h-7 w-7 p-0">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const StudentSubscription: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [cancelConfirm, setCancelConfirm] = useState(false);

  // Success banner
  useEffect(() => {
    const success = searchParams.get('success');
    const item = searchParams.get('item');
    if (success === 'true' && item) {
      toast({
        title: '🎉 Payment Successful!',
        description: `${decodeURIComponent(item)} is now active on your account.`,
      });
    }
  }, []);

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Crown className="h-6 w-6 text-amber-500" /> My Subscription
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Manage your plan, add-ons, and billing history</p>
        </div>
        <Button onClick={() => navigate('/student/pricing')} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Star className="h-4 w-4" /> Upgrade Plan
        </Button>
      </div>

      {/* Current Plan */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-600" /> Current Plan
        </h2>
        <CurrentPlanCard />
      </section>

      {/* Active Add-ons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Zap className="h-4 w-4 text-indigo-600" /> Active Add-ons
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/pricing#addons')} className="gap-1.5 text-xs">
            <ArrowRight className="h-3.5 w-3.5" /> Browse Add-ons
          </Button>
        </div>
        <ActiveAddons />
      </section>

      {/* Packages */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Package className="h-4 w-4 text-indigo-600" /> Exam Packages
          </h2>
          <Button variant="outline" size="sm" onClick={() => navigate('/student/pricing#packages')} className="gap-1.5 text-xs">
            <ArrowRight className="h-3.5 w-3.5" /> Browse Packages
          </Button>
        </div>
        <ActivePackages />
      </section>

      {/* Billing History */}
      <section className="space-y-3">
        <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-indigo-600" /> Billing History
        </h2>
        <BillingHistory />
      </section>

      {/* Quick Actions */}
      <section>
        <Separator className="mb-5" />
        <div className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={() => toast({ title: 'Coming soon', description: 'Payment method management will be available soon.' })}>
            <CreditCard className="h-4 w-4" /> Change Payment Method
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-muted-foreground" onClick={() => toast({ title: 'Support', description: 'Email us at support@exament.in' })}>
            Contact Support
          </Button>
          <Button variant="outline" size="sm" className="gap-2 text-red-500 border-red-200 hover:bg-red-50" onClick={() => setCancelConfirm(true)}>
            <X className="h-4 w-4" /> Cancel Subscription
          </Button>
        </div>
      </section>

      {/* Cancel Confirm */}
      <AlertDialog open={cancelConfirm} onOpenChange={setCancelConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" /> Cancel Subscription?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>You will lose access to:</p>
              <ul className="text-left space-y-1 mt-2">
                <li className="flex items-center gap-2"><X className="h-3.5 w-3.5 text-red-500" /> All premium mock tests</li>
                <li className="flex items-center gap-2"><X className="h-3.5 w-3.5 text-red-500" /> AI-powered analytics</li>
                <li className="flex items-center gap-2"><X className="h-3.5 w-3.5 text-red-500" /> Mentorship sessions</li>
                <li className="flex items-center gap-2"><X className="h-3.5 w-3.5 text-red-500" /> Full current affairs access</li>
              </ul>
              <p className="mt-2 font-medium">You will retain access until the end of your billing period.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Subscription</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => {
              toast({ title: 'Subscription Cancelled', description: 'Your plan will remain active until the billing period ends.' });
              setCancelConfirm(false);
            }}>
              Cancel Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default StudentSubscription;
