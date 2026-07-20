// src/pages/owner/OwnerAddonManager.tsx
// Route: /owner/addon-manager
// Full CRUD for Feature Add-ons with Plan Inclusion Matrix

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Brain,
  BookA,
  Newspaper,
  FileText,
  ShieldCheck,
  Video,
  Plus,
  Pencil,
  Trash2,
  Puzzle,
  TrendingUp,
  ToggleRight,
  IndianRupee,
  RefreshCcw,
  Package,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { usePricingStore } from '@/hooks/usePricingStore';
import { useToast } from '@/hooks/use-toast';
import type { FeatureAddon } from '@/types/pricing';

// ─── Constants ────────────────────────────────────────────────────────────────

const PLAN_LIST = [
  { id: 'free', name: 'Free', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'smart', name: 'Smart', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300' },
  { id: 'pro', name: 'Pro', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  { id: 'pro-max', name: 'Pro Max', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
];

const ICON_OPTIONS = [
  { value: 'Brain', label: 'Brain (Mentorship)', Icon: Brain },
  { value: 'BookA', label: 'BookA (Vocabulary)', Icon: BookA },
  { value: 'Newspaper', label: 'Newspaper (Current Affairs)', Icon: Newspaper },
  { value: 'FileText', label: 'FileText (PDF Bundle)', Icon: FileText },
  { value: 'ShieldCheck', label: 'ShieldCheck (Strict Mode)', Icon: ShieldCheck },
  { value: 'Video', label: 'Video (Live Classes)', Icon: Video },
] as const;

type IconName = typeof ICON_OPTIONS[number]['value'];

function AddonIcon({ name, className }: { name: string; className?: string }) {
  switch (name) {
    case 'Brain': return <Brain className={className} />;
    case 'BookA': return <BookA className={className} />;
    case 'Newspaper': return <Newspaper className={className} />;
    case 'FileText': return <FileText className={className} />;
    case 'ShieldCheck': return <ShieldCheck className={className} />;
    case 'Video': return <Video className={className} />;
    default: return <Puzzle className={className} />;
  }
}

function formatRupee(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Default Form State ───────────────────────────────────────────────────────

type AddonForm = {
  name: string;
  featureKey: string;
  icon: IconName;
  price: number;
  validityDays: number;
  isRecurring: boolean;
  shortDescription: string;
  description: string;
  canBuyStandalone: boolean;
  sortOrder: number;
  isActive: boolean;
  includedInPlanIds: string[];
};

const EMPTY_FORM: AddonForm = {
  name: '',
  featureKey: '',
  icon: 'Brain',
  price: 0,
  validityDays: 30,
  isRecurring: true,
  shortDescription: '',
  description: '',
  canBuyStandalone: true,
  sortOrder: 0,
  isActive: true,
  includedInPlanIds: [],
};

function addonToForm(addon: FeatureAddon): AddonForm {
  return {
    name: addon.name,
    featureKey: addon.featureKey,
    icon: (addon.icon as IconName) ?? 'Brain',
    price: addon.price,
    validityDays: addon.validityDays,
    isRecurring: addon.isRecurring,
    shortDescription: addon.shortDescription,
    description: addon.description,
    canBuyStandalone: addon.canBuyStandalone,
    sortOrder: addon.sortOrder,
    isActive: addon.isActive,
    includedInPlanIds: [...addon.includedInPlanIds],
  };
}

// ─── Main Component ───────────────────────────────────────────────────────────

const OwnerAddonManager: React.FC = () => {
  const { addons, addAddon, updateAddon, deleteAddon } = usePricingStore();
  const { toast } = useToast();

  // Dialog/Sheet state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<FeatureAddon | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FeatureAddon | null>(null);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState<AddonForm>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof AddonForm, string>>>({});

  // ── Computed Summary ────────────────────────────────────────────────────────

  const summary = useMemo(() => {
    const total = addons.length;
    const active = addons.filter((a) => a.isActive).length;
    // Simulate revenue: price * 37 purchases per addon (mock multiplier)
    const totalRevenue = addons.reduce((sum, a) => sum + a.price * 37, 0);
    return { total, active, totalRevenue };
  }, [addons]);

  // ── Dialog Helpers ──────────────────────────────────────────────────────────

  function openAdd() {
    setEditTarget(null);
    setForm({ ...EMPTY_FORM, sortOrder: addons.length });
    setFormErrors({});
    setDialogOpen(true);
  }

  function openEdit(addon: FeatureAddon) {
    setEditTarget(addon);
    setForm(addonToForm(addon));
    setFormErrors({});
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditTarget(null);
    setForm(EMPTY_FORM);
    setFormErrors({});
  }

  // ── Form Field Helpers ──────────────────────────────────────────────────────

  function setField<K extends keyof AddonForm>(key: K, value: AddonForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
    setFormErrors((prev) => ({ ...prev, [key]: undefined }));
  }

  function togglePlanInclusion(planId: string) {
    setForm((prev) => {
      const ids = prev.includedInPlanIds.includes(planId)
        ? prev.includedInPlanIds.filter((id) => id !== planId)
        : [...prev.includedInPlanIds, planId];
      return { ...prev, includedInPlanIds: ids };
    });
  }

  function autoSlug(name: string) {
    return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  }

  // ── Validation ──────────────────────────────────────────────────────────────

  function validate(): boolean {
    const errors: Partial<Record<keyof AddonForm, string>> = {};
    if (!form.name.trim()) errors.name = 'Name is required';
    if (!form.featureKey.trim()) errors.featureKey = 'Feature key is required';
    if (form.price < 0) errors.price = 'Price cannot be negative';
    if (form.validityDays < 1) errors.validityDays = 'Validity must be at least 1 day';
    if (!form.shortDescription.trim()) errors.shortDescription = 'Short description is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  }

  // ── Save ────────────────────────────────────────────────────────────────────

  async function handleSave() {
    if (!validate()) return;
    setSaving(true);

    // Simulate async
    await new Promise((r) => setTimeout(r, 400));

    const now = new Date().toISOString();

    if (editTarget) {
      updateAddon(editTarget.id, {
        ...form,
        updatedAt: now,
      });
      toast({
        title: 'Add-on Updated',
        description: `"${form.name}" has been updated successfully.`,
      });
    } else {
      const newAddon: FeatureAddon = {
        id: `addon-${Date.now()}`,
        ...form,
        createdAt: now,
        updatedAt: now,
      };
      addAddon(newAddon);
      toast({
        title: 'Add-on Created',
        description: `"${form.name}" has been added successfully.`,
      });
    }

    setSaving(false);
    closeDialog();
  }

  // ── Delete ──────────────────────────────────────────────────────────────────

  function handleDelete() {
    if (!deleteTarget) return;
    deleteAddon(deleteTarget.id);
    toast({
      title: 'Add-on Deleted',
      description: `"${deleteTarget.name}" has been removed.`,
      variant: 'destructive',
    });
    setDeleteTarget(null);
  }

  // ── Toggle Active ───────────────────────────────────────────────────────────

  function handleToggleActive(addon: FeatureAddon) {
    updateAddon(addon.id, { isActive: !addon.isActive });
    toast({
      title: addon.isActive ? 'Add-on Deactivated' : 'Add-on Activated',
      description: `"${addon.name}" is now ${addon.isActive ? 'inactive' : 'active'}.`,
    });
  }

  // ── Matrix Toggle ───────────────────────────────────────────────────────────

  function handleMatrixToggle(addon: FeatureAddon, planId: string) {
    const current = addon.includedInPlanIds;
    const next = current.includes(planId)
      ? current.filter((id) => id !== planId)
      : [...current, planId];
    updateAddon(addon.id, { includedInPlanIds: next });

    const planName = PLAN_LIST.find((p) => p.id === planId)?.name ?? planId;
    toast({
      title: 'Plan Inclusion Updated',
      description: current.includes(planId)
        ? `"${addon.name}" removed from ${planName} plan.`
        : `"${addon.name}" added to ${planName} plan.`,
    });
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  const sortedAddons = [...addons].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
                <Puzzle className="h-5 w-5 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-foreground tracking-tight">
                Feature Add-on Manager
              </h1>
            </div>
            <p className="text-muted-foreground text-sm ml-[52px]">
              Create, configure and control purchasable feature add-ons. Assign them to plans or let students buy standalone.
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-md shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Add-on
          </Button>
        </div>

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-indigo-50 to-indigo-100/50 dark:from-indigo-950/40 dark:to-indigo-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-indigo-500/15 flex items-center justify-center">
                <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Add-ons</p>
                <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{summary.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-950/40 dark:to-emerald-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
                <ToggleRight className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Active Add-ons</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-300">{summary.active}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-violet-50 to-violet-100/50 dark:from-violet-950/40 dark:to-violet-900/20">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="h-12 w-12 rounded-xl bg-violet-500/15 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Total Add-on Revenue</p>
                <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">
                  {formatRupee(summary.totalRevenue)}
                </p>
                <p className="text-[10px] text-muted-foreground">Simulated estimate</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Add-on Cards Grid ── */}
        {sortedAddons.length === 0 ? (
          <Card className="border-dashed border-2">
            <CardContent className="py-16 flex flex-col items-center gap-4 text-center">
              <div className="h-16 w-16 rounded-2xl bg-muted flex items-center justify-center">
                <Puzzle className="h-8 w-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">No Add-ons yet</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Create your first feature add-on to offer premium capabilities to your students.
                </p>
              </div>
              <Button onClick={openAdd} className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Create First Add-on
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {sortedAddons.map((addon) => {
              const validityLabel = addon.isRecurring
                ? addon.validityDays === 30 ? '/month' : addon.validityDays === 365 ? '/year' : `/${addon.validityDays}d`
                : 'one-time';

              return (
                <Card
                  key={addon.id}
                  className={`border shadow-sm transition-all duration-200 hover:shadow-md ${
                    addon.isActive
                      ? 'border-border'
                      : 'border-dashed border-muted-foreground/30 opacity-75'
                  }`}
                >
                  <CardContent className="p-5 space-y-4">
                    {/* Top row: icon + name + active toggle */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-100 to-violet-100 dark:from-indigo-900/40 dark:to-violet-900/40 flex items-center justify-center shrink-0">
                          <AddonIcon name={addon.icon} className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{addon.name}</p>
                          <p className="text-xs text-muted-foreground font-mono mt-0.5">{addon.featureKey}</p>
                        </div>
                      </div>
                      <Switch
                        checked={addon.isActive}
                        onCheckedChange={() => handleToggleActive(addon)}
                        title={addon.isActive ? 'Deactivate' : 'Activate'}
                      />
                    </div>

                    {/* Short description */}
                    <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                      {addon.shortDescription}
                    </p>

                    {/* Price + validity */}
                    <div className="flex items-center gap-2">
                      <span className="text-xl font-bold text-foreground">
                        {formatRupee(addon.price)}
                      </span>
                      <span className="text-sm text-muted-foreground">{validityLabel}</span>
                      {addon.isRecurring ? (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400">
                          <RefreshCcw className="h-2.5 w-2.5 mr-1" />
                          Recurring
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 ml-auto border-amber-300 text-amber-600 dark:border-amber-600 dark:text-amber-400">
                          One-time
                        </Badge>
                      )}
                    </div>

                    {/* Included in plans */}
                    <div>
                      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wide mb-2">
                        Included in:
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {addon.includedInPlanIds.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">None (standalone only)</span>
                        ) : (
                          PLAN_LIST.filter((p) => addon.includedInPlanIds.includes(p.id)).map((plan) => (
                            <span
                              key={plan.id}
                              className={`text-[11px] px-2 py-0.5 rounded-full font-medium ${plan.color}`}
                            >
                              {plan.name}
                            </span>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Standalone purchase badge */}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Standalone Purchase:</span>
                      {addon.canBuyStandalone ? (
                        <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
                          <XCircle className="h-3.5 w-3.5" />
                          No
                        </span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-2 pt-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 h-8 text-xs"
                        onClick={() => openEdit(addon)}
                      >
                        <Pencil className="h-3.5 w-3.5 mr-1.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
                        onClick={() => setDeleteTarget(addon)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* ── Plan Inclusion Matrix ── */}
        {sortedAddons.length > 0 && (
          <Card className="border shadow-sm">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-violet-100 to-indigo-100 dark:from-violet-900/40 dark:to-indigo-900/40 flex items-center justify-center">
                  <IndianRupee className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">Plan Inclusion Matrix</CardTitle>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Control which plans get which add-ons for free — flip a toggle to update instantly
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-0 pb-0 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y bg-muted/40">
                    <th className="text-left px-6 py-3 font-semibold text-muted-foreground w-56 min-w-[200px]">
                      Add-on
                    </th>
                    {PLAN_LIST.map((plan) => (
                      <th key={plan.id} className="text-center px-4 py-3 font-semibold text-muted-foreground min-w-[90px]">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${plan.color}`}>
                          {plan.name}
                        </span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedAddons.map((addon, idx) => (
                    <tr
                      key={addon.id}
                      className={`border-b last:border-b-0 transition-colors hover:bg-muted/30 ${
                        idx % 2 === 0 ? '' : 'bg-muted/10'
                      }`}
                    >
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <AddonIcon name={addon.icon} className="h-4 w-4 text-indigo-500 shrink-0" />
                          <div>
                            <p className="font-medium text-foreground leading-tight">{addon.name}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{formatRupee(addon.price)}</p>
                          </div>
                        </div>
                      </td>
                      {PLAN_LIST.map((plan) => {
                        const included = addon.includedInPlanIds.includes(plan.id);
                        return (
                          <td key={plan.id} className="px-4 py-3 text-center">
                            <div className="flex justify-center">
                              <Switch
                                checked={included}
                                onCheckedChange={() => handleMatrixToggle(addon, plan.id)}
                                disabled={!addon.isActive}
                                title={
                                  included
                                    ? `Remove ${addon.name} from ${plan.name}`
                                    : `Add ${addon.name} to ${plan.name}`
                                }
                              />
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══════════════════════════════════════════════════════════════
          ADD / EDIT DIALOG
      ═══════════════════════════════════════════════════════════════ */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog(); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {editTarget ? `Edit Add-on: ${editTarget.name}` : 'Create New Add-on'}
            </DialogTitle>
            <DialogDescription>
              {editTarget
                ? 'Update the details for this feature add-on.'
                : 'Fill in the details to create a new feature add-on.'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">

            {/* Row: Name + Feature Key */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addon-name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addon-name"
                  placeholder="e.g. Mentorship"
                  value={form.name}
                  onChange={(e) => {
                    setField('name', e.target.value);
                    if (!editTarget) {
                      setField('featureKey', autoSlug(e.target.value));
                    }
                  }}
                  className={formErrors.name ? 'border-destructive' : ''}
                />
                {formErrors.name && (
                  <p className="text-xs text-destructive">{formErrors.name}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addon-key">
                  Feature Key <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addon-key"
                  placeholder="e.g. mentorship"
                  value={form.featureKey}
                  onChange={(e) => setField('featureKey', autoSlug(e.target.value))}
                  className={`font-mono text-sm ${formErrors.featureKey ? 'border-destructive' : ''}`}
                />
                {formErrors.featureKey && (
                  <p className="text-xs text-destructive">{formErrors.featureKey}</p>
                )}
              </div>
            </div>

            {/* Icon select */}
            <div className="space-y-1.5">
              <Label>Icon</Label>
              <Select
                value={form.icon}
                onValueChange={(v) => setField('icon', v as IconName)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select icon" />
                </SelectTrigger>
                <SelectContent>
                  {ICON_OPTIONS.map(({ value, label, Icon }) => (
                    <SelectItem key={value} value={value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4 text-indigo-500" />
                        <span>{label}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Row: Price + Validity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="addon-price">
                  Price (₹) <span className="text-destructive">*</span>
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">₹</span>
                  <Input
                    id="addon-price"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={form.price}
                    onChange={(e) => setField('price', Number(e.target.value))}
                    className={`pl-7 ${formErrors.price ? 'border-destructive' : ''}`}
                  />
                </div>
                {formErrors.price && (
                  <p className="text-xs text-destructive">{formErrors.price}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addon-validity">
                  Validity Days <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="addon-validity"
                  type="number"
                  min={1}
                  placeholder="30"
                  value={form.validityDays}
                  onChange={(e) => setField('validityDays', Number(e.target.value))}
                  className={formErrors.validityDays ? 'border-destructive' : ''}
                />
                {formErrors.validityDays && (
                  <p className="text-xs text-destructive">{formErrors.validityDays}</p>
                )}
              </div>
            </div>

            {/* Row: Is Recurring + Sort Order */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Billing Type</p>
                  <p className="text-xs text-muted-foreground">
                    {form.isRecurring ? 'Monthly recurring' : 'One-time purchase'}
                  </p>
                </div>
                <Switch
                  checked={form.isRecurring}
                  onCheckedChange={(v) => setField('isRecurring', v)}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="addon-sort">Sort Order</Label>
                <Input
                  id="addon-sort"
                  type="number"
                  min={0}
                  value={form.sortOrder}
                  onChange={(e) => setField('sortOrder', Number(e.target.value))}
                />
              </div>
            </div>

            {/* Short Description */}
            <div className="space-y-1.5">
              <Label htmlFor="addon-short-desc">
                Short Description <span className="text-destructive">*</span>
              </Label>
              <Input
                id="addon-short-desc"
                placeholder="One-line summary shown on pricing cards"
                value={form.shortDescription}
                onChange={(e) => setField('shortDescription', e.target.value)}
                className={formErrors.shortDescription ? 'border-destructive' : ''}
              />
              {formErrors.shortDescription && (
                <p className="text-xs text-destructive">{formErrors.shortDescription}</p>
              )}
            </div>

            {/* Full Description */}
            <div className="space-y-1.5">
              <Label htmlFor="addon-desc">Full Description</Label>
              <Textarea
                id="addon-desc"
                placeholder="Detailed description of what this add-on provides…"
                value={form.description}
                onChange={(e) => setField('description', e.target.value)}
                rows={3}
              />
            </div>

            {/* Row: Can Buy Standalone + Active */}
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Can Buy Standalone</p>
                  <p className="text-xs text-muted-foreground">Students can purchase without a plan</p>
                </div>
                <Switch
                  checked={form.canBuyStandalone}
                  onCheckedChange={(v) => setField('canBuyStandalone', v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border px-4 py-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Visible to students</p>
                </div>
                <Switch
                  checked={form.isActive}
                  onCheckedChange={(v) => setField('isActive', v)}
                />
              </div>
            </div>

            {/* Included In Plans */}
            <div className="space-y-2">
              <Label>Included In Plans</Label>
              <div className="grid grid-cols-2 gap-2">
                {PLAN_LIST.map((plan) => {
                  const checked = form.includedInPlanIds.includes(plan.id);
                  return (
                    <label
                      key={plan.id}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                        checked
                          ? 'border-indigo-400 bg-indigo-50 dark:border-indigo-600 dark:bg-indigo-950/30'
                          : 'border-border hover:bg-muted/40'
                      }`}
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => togglePlanInclusion(plan.id)}
                        className="data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                      />
                      <span className={`text-sm font-medium px-1.5 py-0.5 rounded-full ${plan.color}`}>
                        {plan.name}
                      </span>
                    </label>
                  );
                })}
              </div>
              <p className="text-xs text-muted-foreground">
                Plans checked here get this add-on included at no extra cost.
              </p>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={closeDialog} disabled={saving}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white min-w-[100px]"
            >
              {saving ? (
                <span className="flex items-center gap-2">
                  <span className="h-3.5 w-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Saving…
                </span>
              ) : editTarget ? (
                'Save Changes'
              ) : (
                'Create Add-on'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ═══════════════════════════════════════════════════════════════
          DELETE CONFIRMATION
      ═══════════════════════════════════════════════════════════════ */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Add-on</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">"{deleteTarget?.name}"</span>?
              This will remove it from all plans and cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Add-on
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OwnerAddonManager;
