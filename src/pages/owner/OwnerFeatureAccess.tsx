// src/pages/owner/OwnerFeatureAccess.tsx
// Route: /owner/feature-access
// Owner control panel for per-plan feature access configuration.

import React, { useState, useCallback } from 'react';
import {
  ClipboardList, BookA, Newspaper, Brain, BarChart3,
  ShieldCheck, FileText, Video, Zap, Pencil, CheckCircle2,
  XCircle, Layers, Tag, Activity, ToggleRight, Check,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { FeatureAccess } from '@/types/pricing';

// ─── Icon Map ─────────────────────────────────────────────────────────────────

const ICON_MAP: Record<string, React.ElementType> = {
  ClipboardList, BookA, Newspaper, Brain, BarChart3,
  ShieldCheck, FileText, Video, Zap,
};

const ICON_OPTIONS = [
  'ClipboardList', 'BookA', 'Newspaper', 'Brain',
  'BarChart3', 'ShieldCheck', 'FileText', 'Video', 'Zap',
] as const;

function FeatureIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? Layers;
  return <Icon className={className ?? 'h-4 w-4'} />;
}

// ─── Plan Definitions ─────────────────────────────────────────────────────────

const PLANS = [
  { id: 'free',    label: 'Free',    color: 'text-slate-500',  bg: 'bg-slate-100 dark:bg-slate-800' },
  { id: 'smart',   label: 'Smart',   color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { id: 'pro',     label: 'Pro',     color: 'text-indigo-600',  bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
  { id: 'pro-max', label: 'Pro Max', color: 'text-amber-600',   bg: 'bg-amber-50 dark:bg-amber-900/20' },
] as const;

// ─── Inline Editable Price ────────────────────────────────────────────────────

function InlinePrice({
  value, onSave, disabled,
}: { value: number; onSave: (v: number) => void; disabled?: boolean }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));

  const commit = () => {
    const parsed = parseFloat(draft);
    if (!isNaN(parsed) && parsed >= 0) onSave(parsed);
    setEditing(false);
  };

  if (editing) {
    return (
      <input
        autoFocus
        type="number"
        min={0}
        value={draft}
        onChange={e => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={e => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') setEditing(false); }}
        className="w-20 rounded border border-indigo-400 bg-background px-2 py-0.5 text-sm font-semibold focus:outline-none focus:ring-1 focus:ring-indigo-500"
      />
    );
  }

  return (
    <button
      disabled={disabled}
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="group flex items-center gap-1 rounded px-1.5 py-0.5 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-default disabled:opacity-50"
      title="Click to edit price"
    >
      ₹{value}
      {!disabled && (
        <Pencil className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-50" />
      )}
    </button>
  );
}

// ─── Edit Dialog ──────────────────────────────────────────────────────────────

interface EditDialogProps {
  feature: FeatureAccess | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<FeatureAccess>) => void;
}

function EditDialog({ feature, open, onClose, onSave }: EditDialogProps) {
  const [form, setForm] = useState<Partial<FeatureAccess>>({});
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  // Sync form when feature changes
  React.useEffect(() => {
    if (feature) setForm({ ...feature });
  }, [feature]);

  if (!feature) return null;

  const f = { ...feature, ...form };

  const patch = (updates: Partial<FeatureAccess>) =>
    setForm(prev => ({ ...prev, ...updates }));

  const togglePlan = (planId: string) => {
    const ids = f.includedInPlanIds ?? [];
    patch({
      includedInPlanIds: ids.includes(planId)
        ? ids.filter(p => p !== planId)
        : [...ids, planId],
    });
  };

  const handleSave = async () => {
    if (!f.featureName?.trim()) {
      toast({ title: 'Feature name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSave(feature.id, form);
    toast({ title: `"${f.featureName}" updated`, description: 'Feature access saved successfully.' });
    setSaving(false);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <FeatureIcon name={f.icon ?? 'Zap'} className="h-5 w-5 text-indigo-500" />
            Edit Feature Access
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Row 1: Name + Key */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Feature Name</Label>
              <Input
                value={f.featureName ?? ''}
                onChange={e => patch({ featureName: e.target.value })}
                placeholder="e.g. Vocabulary"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Feature Key <span className="text-muted-foreground text-xs">(slug)</span></Label>
              <Input
                value={f.featureKey ?? ''}
                onChange={e => patch({ featureKey: e.target.value })}
                placeholder="e.g. vocabulary"
              />
            </div>
          </div>

          {/* Row 2: Icon + Validity + Price */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select value={f.icon ?? ''} onValueChange={v => patch({ icon: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Pick icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(icon => (
                    <SelectItem key={icon} value={icon}>
                      <span className="flex items-center gap-2">
                        <FeatureIcon name={icon} className="h-4 w-4" />
                        {icon}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Standalone Price ₹</Label>
              <Input
                type="number"
                min={0}
                value={f.standalonePrice ?? 0}
                onChange={e => patch({ standalonePrice: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Validity Days</Label>
              <Input
                type="number"
                min={1}
                value={f.validityDays ?? 30}
                onChange={e => patch({ validityDays: parseInt(e.target.value) || 30 })}
              />
            </div>
          </div>

          {/* Short Description */}
          <div className="space-y-1.5">
            <Label>Short Description</Label>
            <Input
              value={f.shortDescription ?? ''}
              onChange={e => patch({ shortDescription: e.target.value })}
              placeholder="Shown on pricing cards"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label>Full Description</Label>
            <Textarea
              value={f.description ?? ''}
              onChange={e => patch({ description: e.target.value })}
              rows={3}
              placeholder="Detailed feature description"
            />
          </div>

          <Separator />

          {/* Toggles row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {([
              { key: 'freeAccess',       label: 'Free Access' },
              { key: 'canBuyStandalone', label: 'Can Buy Standalone' },
              { key: 'isRecurring',      label: 'Recurring' },
              { key: 'isActive',         label: 'Active' },
            ] as const).map(({ key, label }) => (
              <div key={key} className="flex items-center gap-2 rounded-lg border p-3">
                <Switch
                  checked={!!(f as any)[key]}
                  onCheckedChange={v => patch({ [key]: v } as any)}
                />
                <Label className="text-sm">{label}</Label>
              </div>
            ))}
          </div>

          <Separator />

          {/* Included Plans */}
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Included in Plans</Label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {PLANS.map(plan => {
                const checked = (f.includedInPlanIds ?? []).includes(plan.id);
                return (
                  <label
                    key={plan.id}
                    className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 p-3 transition ${
                      checked
                        ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                        : 'border-border bg-muted/30 hover:bg-muted'
                    }`}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => togglePlan(plan.id)}
                    />
                    <span className={`text-sm font-medium ${plan.color}`}>{plan.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────

function KpiCard({
  label, value, icon: Icon, color, sublabel,
}: {
  label: string;
  value: number;
  icon: React.ElementType;
  color: string;
  sublabel?: string;
}) {
  return (
    <Card className="relative overflow-hidden border-0 shadow-md">
      <div className={`absolute inset-0 opacity-5 ${color}`} />
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold text-foreground">{value}</p>
            {sublabel && <p className="mt-0.5 text-xs text-muted-foreground">{sublabel}</p>}
          </div>
          <div className={`rounded-xl p-2.5 ${color} bg-opacity-10`}>
            <Icon className={`h-5 w-5 ${color.replace('bg-', 'text-')}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerFeatureAccess() {
  const { featureAccess, updateFeatureAccess, plans } = usePricingStore();
  const { toast } = useToast();
  const [editingFeature, setEditingFeature] = useState<FeatureAccess | null>(null);

  // ── KPIs ──────────────────────────────────────────────────────────────────

  const totalFeatures     = featureAccess.length;
  const freeFeatures      = featureAccess.filter(f => f.freeAccess).length;
  const purchasable       = featureAccess.filter(f => f.canBuyStandalone).length;
  const inProMax          = featureAccess.filter(f => f.includedInPlanIds.includes('pro-max')).length;

  // ── Helpers ───────────────────────────────────────────────────────────────

  const handleTogglePlan = useCallback((feature: FeatureAccess, planId: string) => {
    const has = feature.includedInPlanIds.includes(planId);
    const next = has
      ? feature.includedInPlanIds.filter(p => p !== planId)
      : [...feature.includedInPlanIds, planId];
    updateFeatureAccess(feature.id, { includedInPlanIds: next });
    toast({
      title: has
        ? `Removed from ${PLANS.find(p => p.id === planId)?.label}`
        : `Added to ${PLANS.find(p => p.id === planId)?.label}`,
      description: `"${feature.featureName}" plan access updated.`,
    });
  }, [updateFeatureAccess, toast]);

  const handleToggle = useCallback(
    (feature: FeatureAccess, key: keyof FeatureAccess) => {
      const next = !(feature[key] as boolean);
      updateFeatureAccess(feature.id, { [key]: next } as Partial<FeatureAccess>);
      toast({
        title: `"${feature.featureName}" ${String(key)} ${next ? 'enabled' : 'disabled'}`,
      });
    },
    [updateFeatureAccess, toast]
  );

  const handlePriceSave = useCallback((feature: FeatureAccess, price: number) => {
    updateFeatureAccess(feature.id, { standalonePrice: price });
    toast({ title: `"${feature.featureName}" price set to ₹${price}` });
  }, [updateFeatureAccess, toast]);

  // ── Plan Comparison Data ──────────────────────────────────────────────────

  const planFeatureMap = PLANS.map(plan => ({
    ...plan,
    features: featureAccess.filter(f =>
      f.isActive && f.includedInPlanIds.includes(plan.id)
    ),
  }));

  return (
    <div className="min-h-screen bg-background">
      {/* ── Dark Header ───────────────────────────────────────────────────── */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-6 py-8">
        <div className="mx-auto max-w-screen-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 ring-1 ring-indigo-400/30">
                  <ToggleRight className="h-5 w-5 text-indigo-400" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  Feature Access Manager
                </h1>
              </div>
              <p className="pl-[52px] text-sm text-slate-400">
                Configure which platform features are unlocked per subscription plan
              </p>
            </div>
            <Badge className="self-start border border-indigo-400/40 bg-indigo-500/15 px-3 py-1.5 text-xs font-medium text-indigo-300 sm:self-auto">
              <Activity className="mr-1.5 h-3 w-3" />
              Changes reflect instantly on student pricing page
            </Badge>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-screen-xl space-y-8 px-6 py-8">

        {/* ── KPI Strip ─────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Total Features"     value={totalFeatures} icon={Layers}      color="bg-indigo-500"  sublabel="configured" />
          <KpiCard label="Free Features"      value={freeFeatures}  icon={CheckCircle2} color="bg-emerald-500" sublabel="free plan access" />
          <KpiCard label="Standalone Add-ons" value={purchasable}   icon={Tag}          color="bg-violet-500"  sublabel="purchasable" />
          <KpiCard label="In Pro Max"         value={inProMax}      icon={Zap}           color="bg-amber-500"   sublabel="highest tier" />
        </div>

        {/* ── Feature Access Matrix ──────────────────────────────────────── */}
        <Card className="border border-border/60 shadow-lg">
          <CardHeader className="border-b border-border/60 pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base font-semibold">
                <ClipboardList className="h-4 w-4 text-indigo-500" />
                Feature Access Matrix
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {featureAccess.length} features · click inline prices to edit
              </p>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                {/* Table Head */}
                <thead>
                  <tr className="border-b border-border/60 bg-muted/30">
                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Feature
                    </th>
                    {PLANS.map(plan => (
                      <th
                        key={plan.id}
                        className={`px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider ${plan.color}`}
                      >
                        {plan.label}
                      </th>
                    ))}
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-violet-600">
                      Standalone
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Status
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Edit
                    </th>
                  </tr>
                </thead>

                {/* Table Body */}
                <tbody className="divide-y divide-border/40">
                  {featureAccess.map((feature, idx) => (
                    <tr
                      key={feature.id}
                      className={`transition-colors hover:bg-muted/20 ${
                        idx % 2 === 0 ? '' : 'bg-muted/5'
                      } ${!feature.isActive ? 'opacity-50' : ''}`}
                    >
                      {/* Feature Name + Icon */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-900/20 ring-1 ring-indigo-200 dark:ring-indigo-700">
                            <FeatureIcon name={feature.icon} className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{feature.featureName}</p>
                            <p className="text-xs text-muted-foreground">{feature.shortDescription}</p>
                          </div>
                        </div>
                      </td>

                      {/* Plan Switches */}
                      {PLANS.map(plan => {
                        const included = feature.includedInPlanIds.includes(plan.id);
                        return (
                          <td key={plan.id} className="px-4 py-4 text-center">
                            <div className="flex flex-col items-center gap-1">
                              <Switch
                                checked={included}
                                onCheckedChange={() => handleTogglePlan(feature, plan.id)}
                                className={included ? 'data-[state=checked]:bg-indigo-600' : ''}
                              />
                              {included ? (
                                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                              ) : (
                                <XCircle className="h-3 w-3 text-muted-foreground/40" />
                              )}
                            </div>
                          </td>
                        );
                      })}

                      {/* Standalone */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5">
                          <Switch
                            checked={feature.canBuyStandalone}
                            onCheckedChange={() => handleToggle(feature, 'canBuyStandalone')}
                            className="data-[state=checked]:bg-violet-600"
                          />
                          {feature.canBuyStandalone ? (
                            <InlinePrice
                              value={feature.standalonePrice}
                              onSave={price => handlePriceSave(feature, price)}
                            />
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <Switch
                            checked={feature.isActive}
                            onCheckedChange={() => handleToggle(feature, 'isActive')}
                            className="data-[state=checked]:bg-emerald-600"
                          />
                          <span className={`text-[10px] font-medium ${feature.isActive ? 'text-emerald-600' : 'text-muted-foreground'}`}>
                            {feature.isActive ? 'Active' : 'Off'}
                          </span>
                        </div>
                      </td>

                      {/* Edit */}
                      <td className="px-4 py-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setEditingFeature(feature)}
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* ── Visual Plan Comparison ─────────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-indigo-500" />
            <h2 className="text-base font-semibold text-foreground">Plan Feature Summary</h2>
            <span className="text-xs text-muted-foreground">— quick glance to verify access is correct</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {planFeatureMap.map(plan => (
              <Card
                key={plan.id}
                className={`overflow-hidden border border-border/60 shadow-sm transition-shadow hover:shadow-md`}
              >
                {/* Plan header stripe */}
                <div className={`px-4 py-3 ${plan.bg}`}>
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-bold ${plan.color}`}>{plan.label}</span>
                    <Badge variant="outline" className={`border-current text-xs ${plan.color}`}>
                      {plan.features.length} features
                    </Badge>
                  </div>
                </div>

                <CardContent className="p-0">
                  {plan.features.length === 0 ? (
                    <div className="px-4 py-6 text-center text-xs text-muted-foreground">
                      No active features assigned
                    </div>
                  ) : (
                    <ul className="divide-y divide-border/30">
                      {plan.features.map(f => (
                        <li key={f.id} className="flex items-center gap-2.5 px-4 py-2.5">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted">
                            <FeatureIcon name={f.icon} className="h-3 w-3 text-muted-foreground" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-medium text-foreground">
                              {f.featureName}
                            </p>
                            {f.freeAccess && plan.id !== 'free' && (
                              <span className="text-[10px] text-emerald-500">also free</span>
                            )}
                          </div>
                          <Check className="h-3 w-3 shrink-0 text-emerald-500" />
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

      </div>

      {/* ── Edit Dialog ────────────────────────────────────────────────────── */}
      <EditDialog
        feature={editingFeature}
        open={!!editingFeature}
        onClose={() => setEditingFeature(null)}
        onSave={(id, updates) => updateFeatureAccess(id, updates)}
      />
    </div>
  );
}
