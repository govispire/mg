import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { Coupon, CouponType } from '@/types/pricing';
import {
  Tag, Plus, Search, Copy, Check, Trash2, Pencil, Ticket,
  Percent, IndianRupee, Calendar, Users, TrendingDown, Shuffle,
  Filter, ToggleLeft, ToggleRight, AlertTriangle, RefreshCw,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const isExpired = (validTo: string) => new Date(validTo) < new Date();
const isUpcoming = (validFrom: string) => new Date(validFrom) > new Date();

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

type CouponStatus = 'active' | 'inactive' | 'expired' | 'upcoming';
function couponStatus(c: Coupon): CouponStatus {
  if (!c.isActive) return 'inactive';
  if (isExpired(c.validTo)) return 'expired';
  if (isUpcoming(c.validFrom)) return 'upcoming';
  return 'active';
}

const STATUS_CONFIG = {
  active:   { label: 'Active',    cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  inactive: { label: 'Inactive',  cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  expired:  { label: 'Expired',   cls: 'bg-red-100 text-red-600 border-red-200' },
  upcoming: { label: 'Upcoming',  cls: 'bg-blue-100 text-blue-700 border-blue-200' },
};

// ─── Copy Badge ───────────────────────────────────────────────────────────────

const CopyCode: React.FC<{ code: string }> = ({ code }) => {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <button
      onClick={copy}
      className="flex items-center gap-1.5 font-mono font-bold text-sm text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded px-2 py-0.5 transition-colors"
    >
      {code}
      {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3 opacity-60" />}
    </button>
  );
};

// ─── Blank Coupon ─────────────────────────────────────────────────────────────

const blankCoupon = (): Omit<Coupon, 'id' | 'usedCount' | 'createdAt'> => ({
  code: '',
  type: 'percent',
  value: 10,
  minCartValue: 0,
  maxUses: 0,
  validFrom: new Date().toISOString().split('T')[0],
  validTo: new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0],
  applicableTo: ['all'],
  applicableIds: [],
  isActive: true,
  description: '',
});

// ─── Coupon Sheet (Add / Edit) ────────────────────────────────────────────────

interface CouponSheetProps {
  open: boolean;
  onClose: () => void;
  initial?: Coupon | null;
  onSave: (data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) => void;
}

const CouponSheet: React.FC<CouponSheetProps> = ({ open, onClose, initial, onSave }) => {
  const [form, setForm] = useState(() => initial ? {
    code: initial.code, type: initial.type as CouponType, value: initial.value,
    minCartValue: initial.minCartValue, maxUses: initial.maxUses,
    validFrom: initial.validFrom, validTo: initial.validTo,
    applicableTo: initial.applicableTo, applicableIds: initial.applicableIds,
    isActive: initial.isActive, description: initial.description ?? '',
  } : blankCoupon());

  React.useEffect(() => {
    setForm(initial ? {
      code: initial.code, type: initial.type as CouponType, value: initial.value,
      minCartValue: initial.minCartValue, maxUses: initial.maxUses,
      validFrom: initial.validFrom, validTo: initial.validTo,
      applicableTo: initial.applicableTo, applicableIds: initial.applicableIds,
      isActive: initial.isActive, description: initial.description ?? '',
    } : blankCoupon());
  }, [initial, open]);

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const toggleAppliesTo = (val: string) => {
    if (val === 'all') { set('applicableTo', ['all']); return; }
    const cur = form.applicableTo.filter(x => x !== 'all');
    const next = cur.includes(val as any) ? cur.filter(x => x !== val) : [...cur, val];
    set('applicableTo', next.length === 0 ? ['all'] : next);
  };

  const [saving, setSaving] = useState(false);
  const handleSave = async () => {
    if (!form.code.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSave({ ...form, code: form.code.trim().toUpperCase() });
    setSaving(false);
  };

  return (
    <Sheet open={open} onOpenChange={v => !v && onClose()}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-indigo-600" />
            {initial ? 'Edit Coupon' : 'Create Coupon'}
          </SheetTitle>
        </SheetHeader>

        <div className="space-y-5">
          {/* Code */}
          <div className="space-y-2">
            <Label>Coupon Code *</Label>
            <div className="flex gap-2">
              <Input
                value={form.code}
                onChange={e => set('code', e.target.value.toUpperCase())}
                placeholder="e.g. WELCOME50"
                className="font-mono font-bold uppercase"
              />
              <Button type="button" variant="outline" size="sm" onClick={() => set('code', generateCode())}>
                <Shuffle className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Input value={form.description} onChange={e => set('description', e.target.value)} placeholder="Internal note for this coupon" />
          </div>

          {/* Type + Value */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Discount Type</Label>
              <Select value={form.type} onValueChange={v => set('type', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent"><span className="flex items-center gap-2"><Percent className="h-4 w-4" /> Percentage %</span></SelectItem>
                  <SelectItem value="fixed"><span className="flex items-center gap-2"><IndianRupee className="h-4 w-4" /> Fixed ₹</span></SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Discount Value {form.type === 'percent' ? '(%)' : '(₹)'}</Label>
              <Input type="number" min={1} value={form.value} onChange={e => set('value', Number(e.target.value))} />
            </div>
          </div>

          {/* Min Cart + Max Uses */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Min Cart Value ₹</Label>
              <Input type="number" min={0} value={form.minCartValue} onChange={e => set('minCartValue', Number(e.target.value))} placeholder="0 = no minimum" />
            </div>
            <div className="space-y-2">
              <Label>Max Uses</Label>
              <Input type="number" min={0} value={form.maxUses} onChange={e => set('maxUses', Number(e.target.value))} placeholder="0 = unlimited" />
            </div>
          </div>

          {/* Validity */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Valid From</Label>
              <Input type="date" value={form.validFrom} onChange={e => set('validFrom', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Valid To</Label>
              <Input type="date" value={form.validTo} onChange={e => set('validTo', e.target.value)} />
            </div>
          </div>

          {/* Applies To */}
          <div className="space-y-2">
            <Label>Applies To</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {(['all', 'plan', 'package', 'addon'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => toggleAppliesTo(opt)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors capitalize ${
                    form.applicableTo.includes(opt)
                      ? 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-600 border-slate-300 hover:border-indigo-300'
                  }`}
                >
                  {opt === 'all' ? 'All Items' : opt === 'plan' ? 'Plans' : opt === 'package' ? 'Packages' : 'Add-ons'}
                </button>
              ))}
            </div>
          </div>

          {/* Active */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted/40 border">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground">Coupon can be used by students</p>
            </div>
            <Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} />
          </div>
        </div>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave} disabled={saving || !form.code.trim()} className="bg-indigo-600 hover:bg-indigo-700">
            {saving ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
            {initial ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};

// ─── Main Page ────────────────────────────────────────────────────────────────

const OwnerCouponManager: React.FC = () => {
  const { toast } = useToast();
  const { coupons, addCoupon, updateCoupon, deleteCoupon } = usePricingStore();

  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<Coupon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Coupon | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  const filtered = coupons.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.code.toLowerCase().includes(q) || (c.description ?? '').toLowerCase().includes(q);
    const matchType = filterType === 'all' || c.type === filterType;
    const st = couponStatus(c);
    const matchStatus = filterStatus === 'all' || st === filterStatus;
    const matchTab = activeTab === 'all' || st === activeTab;
    return matchSearch && matchType && matchStatus && matchTab;
  });

  // KPIs
  const activeCoupons = coupons.filter(c => couponStatus(c) === 'active').length;
  const totalUses = coupons.reduce((s, c) => s + c.usedCount, 0);
  const totalDiscount = coupons.reduce((s, c) => {
    if (c.type === 'fixed') return s + c.usedCount * c.value;
    return s + c.usedCount * (c.value / 100) * 499; // estimate avg order ₹499
  }, 0);
  const mostUsed = coupons.reduce((best, c) => (!best || c.usedCount > best.usedCount) ? c : best, null as Coupon | null);

  const handleSave = (data: Omit<Coupon, 'id' | 'usedCount' | 'createdAt'>) => {
    if (editTarget) {
      updateCoupon(editTarget.id, data);
      toast({ title: 'Coupon Updated', description: `${data.code} has been updated.` });
    } else {
      const newCoupon: Coupon = {
        ...data, id: `coup-${Date.now()}`, usedCount: 0,
        createdAt: new Date().toISOString(),
      };
      addCoupon(newCoupon);
      toast({ title: 'Coupon Created', description: `${data.code} is now active.` });
    }
    setSheetOpen(false);
    setEditTarget(null);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteCoupon(deleteTarget.id);
    toast({ title: 'Coupon Deleted', description: `${deleteTarget.code} has been removed.`, variant: 'destructive' });
    setDeleteTarget(null);
  };

  const openAdd = () => { setEditTarget(null); setSheetOpen(true); };
  const openEdit = (c: Coupon) => { setEditTarget(c); setSheetOpen(true); };

  const kpis = [
    { label: 'Active Coupons', value: activeCoupons, icon: Ticket, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { label: 'Total Uses', value: totalUses, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Discounts Given', value: fmt(Math.round(totalDiscount)), icon: TrendingDown, color: 'text-rose-600', bg: 'bg-rose-50' },
    { label: 'Most Used', value: mostUsed?.code ?? '—', icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Ticket className="h-6 w-6 text-indigo-600" /> Coupon Manager
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Create and manage promotional discount codes</p>
        </div>
        <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 gap-2">
          <Plus className="h-4 w-4" /> Create Coupon
        </Button>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <Card key={k.label} className="border-0 shadow-sm">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{k.label}</p>
                <p className="text-lg font-bold text-foreground">{k.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filter Bar */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by code or description..." className="pl-9" />
            </div>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full sm:w-40">
                <Filter className="h-4 w-4 mr-1 opacity-60" />
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="percent">Percentage %</SelectItem>
                <SelectItem value="fixed">Fixed ₹</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="expired">Expired</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabs + Table */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-muted/50">
          {(['all', 'active', 'inactive', 'expired', 'upcoming'] as const).map(t => (
            <TabsTrigger key={t} value={t} className="capitalize text-xs">
              {t === 'all' ? `All (${coupons.length})` : `${t.charAt(0).toUpperCase() + t.slice(1)} (${coupons.filter(c => couponStatus(c) === t).length})`}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={activeTab} className="mt-3">
          <Card className="border-0 shadow-sm overflow-hidden">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                <Ticket className="h-12 w-12 mb-4 opacity-30" />
                <p className="font-medium">No coupons found</p>
                <p className="text-sm">Try adjusting your filters or create a new coupon</p>
                <Button onClick={openAdd} className="mt-4 gap-2 bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4" /> Create Coupon
                </Button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[800px]">
                  <thead>
                    <tr className="border-b bg-muted/30">
                      {['Code', 'Type', 'Value', 'Min Cart', 'Usage', 'Validity', 'Applies To', 'Status', 'Actions'].map(h => (
                        <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {filtered.map(c => {
                      const st = couponStatus(c);
                      const sc = STATUS_CONFIG[st];
                      return (
                        <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3"><CopyCode code={c.code} /></td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${c.type === 'percent' ? 'bg-violet-100 text-violet-700' : 'bg-emerald-100 text-emerald-700'}`}>
                              {c.type === 'percent' ? <Percent className="h-3 w-3" /> : <IndianRupee className="h-3 w-3" />}
                              {c.type === 'percent' ? 'Percent' : 'Fixed'}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-bold text-foreground">
                            {c.type === 'percent' ? `${c.value}%` : fmt(c.value)}
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">
                            {c.minCartValue > 0 ? fmt(c.minCartValue) : '—'}
                          </td>
                          <td className="px-4 py-3 text-sm">
                            <span className="font-semibold text-foreground">{c.usedCount}</span>
                            <span className="text-muted-foreground"> / {c.maxUses === 0 ? '∞' : c.maxUses}</span>
                          </td>
                          <td className="px-4 py-3 text-xs text-muted-foreground">
                            <div className={isExpired(c.validTo) ? 'text-red-500' : ''}>
                              {c.validFrom} → {c.validTo}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-wrap gap-1">
                              {c.applicableTo.map(a => (
                                <Badge key={a} variant="outline" className="text-[10px] capitalize">{a === 'all' ? 'All' : a}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${sc.cls}`}>{sc.label}</span>
                              <Switch
                                checked={c.isActive}
                                onCheckedChange={v => {
                                  updateCoupon(c.id, { isActive: v });
                                  toast({ title: v ? 'Coupon Enabled' : 'Coupon Disabled', description: c.code });
                                }}
                                className="scale-75"
                              />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(c)}>
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>
      </Tabs>

      {/* Sheet */}
      <CouponSheet open={sheetOpen} onClose={() => { setSheetOpen(false); setEditTarget(null); }} initial={editTarget} onSave={handleSave} />

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Coupon?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete coupon <span className="font-mono font-bold text-foreground">{deleteTarget?.code}</span>.
              {deleteTarget && deleteTarget.usedCount > 0 && (
                <span className="block mt-2 text-amber-600 flex items-center gap-1">
                  <AlertTriangle className="h-4 w-4 inline" /> This coupon has been used {deleteTarget.usedCount} times.
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerCouponManager;
