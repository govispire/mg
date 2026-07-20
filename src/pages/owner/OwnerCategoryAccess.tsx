// src/pages/owner/OwnerCategoryAccess.tsx
// Owner control panel — manages which subscription plans include each exam category,
// standalone purchase prices, and free-access flags.

import React, { useState, useRef, useEffect } from 'react';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { CategoryAccess } from '@/types/pricing';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

import {
  LayoutGrid,
  Tags,
  IndianRupee,
  ShieldCheck,
  Info,
  Pencil,
  CheckCircle2,
  XCircle,
  Layers,
  TrendingUp,
  BookOpen,
  AlertTriangle,
} from 'lucide-react';

// ── Category color palette ─────────────────────────────────────────────────────

const CATEGORY_COLORS: Record<string, { dot: string; badge: string }> = {
  Banking:     { dot: 'bg-blue-500',    badge: 'bg-blue-50 text-blue-700 dark:bg-blue-950 dark:text-blue-300' },
  SSC:         { dot: 'bg-orange-500',  badge: 'bg-orange-50 text-orange-700 dark:bg-orange-950 dark:text-orange-300' },
  Railway:     { dot: 'bg-green-500',   badge: 'bg-green-50 text-green-700 dark:bg-green-950 dark:text-green-300' },
  UPSC:        { dot: 'bg-purple-500',  badge: 'bg-purple-50 text-purple-700 dark:bg-purple-950 dark:text-purple-300' },
  TNPSC:       { dot: 'bg-rose-500',    badge: 'bg-rose-50 text-rose-700 dark:bg-rose-950 dark:text-rose-300' },
  Defence:     { dot: 'bg-sky-500',     badge: 'bg-sky-50 text-sky-700 dark:bg-sky-950 dark:text-sky-300' },
  'State PSC': { dot: 'bg-teal-500',    badge: 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300' },
  Insurance:   { dot: 'bg-amber-500',   badge: 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300' },
};

function getCategoryColor(name: string) {
  return CATEGORY_COLORS[name] ?? { dot: 'bg-slate-400', badge: 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300' };
}

// ── Plan definitions ───────────────────────────────────────────────────────────

const PLANS = [
  { id: 'smart',   label: 'Smart',   color: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'pro',     label: 'Pro',     color: 'text-indigo-600 dark:text-indigo-400'   },
  { id: 'pro-max', label: 'Pro Max', color: 'text-amber-600 dark:text-amber-400'     },
];

// ── Inline Price Cell ──────────────────────────────────────────────────────────

interface InlinePriceCellProps {
  value: number;
  onSave: (val: number) => void;
}

function InlinePriceCell({ value, onSave }: InlinePriceCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(String(value));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const commit = () => {
    const parsed = parseInt(draft, 10);
    if (!isNaN(parsed) && parsed >= 0) {
      onSave(parsed);
    } else {
      setDraft(String(value));
    }
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="flex items-center gap-1 w-28">
        <span className="text-muted-foreground text-sm">₹</span>
        <Input
          ref={inputRef}
          type="number"
          min={0}
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onBlur={commit}
          onKeyDown={e => {
            if (e.key === 'Enter') commit();
            if (e.key === 'Escape') { setDraft(String(value)); setEditing(false); }
          }}
          className="h-7 w-20 text-sm px-2"
        />
      </div>
    );
  }

  return (
    <button
      onClick={() => { setDraft(String(value)); setEditing(true); }}
      className="group flex items-center gap-1 text-sm font-medium text-foreground hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
      title="Click to edit price"
    >
      <IndianRupee className="h-3.5 w-3.5 text-muted-foreground group-hover:text-indigo-500" />
      <span>{value.toLocaleString('en-IN')}</span>
      <Pencil className="h-3 w-3 opacity-0 group-hover:opacity-70 transition-opacity ml-0.5" />
    </button>
  );
}

// ── Edit Dialog ────────────────────────────────────────────────────────────────

interface EditDialogProps {
  category: CategoryAccess | null;
  open: boolean;
  onClose: () => void;
  onSave: (id: string, updates: Partial<CategoryAccess>) => void;
}

function EditDialog({ category, open, onClose, onSave }: EditDialogProps) {
  const [draft, setDraft] = useState<Partial<CategoryAccess>>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (category) {
      setDraft({
        isFreeAccess:      category.isFreeAccess,
        standalonePrice:   category.standalonePrice,
        includedInPlanIds: [...category.includedInPlanIds],
        isActive:          category.isActive,
      });
    }
  }, [category]);

  if (!category) return null;

  const colors = getCategoryColor(category.categoryName);

  const togglePlan = (planId: string) => {
    setDraft(prev => {
      const current = prev.includedInPlanIds ?? [];
      return {
        ...prev,
        includedInPlanIds: current.includes(planId)
          ? current.filter(p => p !== planId)
          : [...current, planId],
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSave(category.id, draft);
    setSaving(false);
    onClose();
  };

  const priceValue = draft.standalonePrice ?? category.standalonePrice;

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className={`w-3 h-3 rounded-full ${colors.dot}`} />
            Edit — {category.categoryName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Category Name (read-only) */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Category Name</Label>
            <Input value={category.categoryName} disabled className="bg-muted/40 text-muted-foreground" />
          </div>

          {/* Free Access */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
            <div>
              <p className="text-sm font-medium">Free Access</p>
              <p className="text-xs text-muted-foreground mt-0.5">Free plan users can see this category</p>
            </div>
            <Switch
              checked={draft.isFreeAccess ?? false}
              onCheckedChange={v => setDraft(prev => ({ ...prev, isFreeAccess: v }))}
            />
          </div>

          {/* Standalone Price */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">
              Standalone Purchase Price (₹)
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium">₹</span>
              <Input
                type="number"
                min={0}
                value={priceValue}
                onChange={e => setDraft(prev => ({ ...prev, standalonePrice: parseInt(e.target.value, 10) || 0 }))}
                className="pl-7"
              />
            </div>
            <p className="text-xs text-muted-foreground">Price a student pays to access just this category without a plan.</p>
          </div>

          {/* Included In Plans */}
          <div className="space-y-2.5">
            <Label className="text-xs text-muted-foreground uppercase tracking-wide">Included In Plans (Free for plan subscribers)</Label>
            <div className="space-y-2">
              {PLANS.map(plan => (
                <label
                  key={plan.id}
                  className="flex items-center gap-3 cursor-pointer rounded-md px-3 py-2.5 border border-border hover:bg-muted/30 transition-colors"
                >
                  <Checkbox
                    checked={(draft.includedInPlanIds ?? []).includes(plan.id)}
                    onCheckedChange={() => togglePlan(plan.id)}
                  />
                  <span className={`text-sm font-medium ${plan.color}`}>{plan.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/20">
            <div>
              <p className="text-sm font-medium">Active</p>
              <p className="text-xs text-muted-foreground mt-0.5">Inactive categories are hidden from students</p>
            </div>
            <Switch
              checked={draft.isActive ?? true}
              onCheckedChange={v => setDraft(prev => ({ ...prev, isActive: v }))}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
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

// ── Main Page ──────────────────────────────────────────────────────────────────

export default function OwnerCategoryAccess() {
  const { categoryAccess, updateCategoryAccess } = usePricingStore();
  const { toast } = useToast();

  const [editTarget, setEditTarget] = useState<CategoryAccess | null>(null);
  const [editOpen, setEditOpen] = useState(false);

  // ── Computed summary stats ───────────────────────────────────────────────

  const totalCategories  = categoryAccess.length;
  const freeAccessCount  = categoryAccess.filter(c => c.isFreeAccess).length;
  const activeCategories = categoryAccess.filter(c => c.isActive);
  const avgPrice = activeCategories.length
    ? Math.round(activeCategories.reduce((s, c) => s + c.standalonePrice, 0) / activeCategories.length)
    : 0;
  const proMaxCount = categoryAccess.filter(c => c.includedInPlanIds.includes('pro-max')).length;

  // ── Handlers ────────────────────────────────────────────────────────────

  const handleToggleFree = (cat: CategoryAccess) => {
    updateCategoryAccess(cat.id, { isFreeAccess: !cat.isFreeAccess });
    toast({
      title: `Free access ${!cat.isFreeAccess ? 'enabled' : 'disabled'}`,
      description: `${cat.categoryName} is ${!cat.isFreeAccess ? 'now accessible' : 'no longer accessible'} to Free plan users.`,
    });
  };

  const handleToggleActive = (cat: CategoryAccess) => {
    updateCategoryAccess(cat.id, { isActive: !cat.isActive });
    toast({
      title: `${cat.categoryName} ${!cat.isActive ? 'activated' : 'deactivated'}`,
      description: !cat.isActive
        ? 'Category is now visible to students.'
        : 'Category is hidden from the student-facing pages.',
    });
  };

  const handleTogglePlan = (cat: CategoryAccess, planId: string) => {
    const current = cat.includedInPlanIds;
    const next = current.includes(planId)
      ? current.filter(p => p !== planId)
      : [...current, planId];
    updateCategoryAccess(cat.id, { includedInPlanIds: next });
    const planLabel = PLANS.find(p => p.id === planId)?.label ?? planId;
    toast({
      title: `${cat.categoryName} — ${planLabel} plan updated`,
      description: next.includes(planId)
        ? `${cat.categoryName} is now included in ${planLabel}.`
        : `${cat.categoryName} removed from ${planLabel}.`,
    });
  };

  const handlePriceSave = (cat: CategoryAccess, price: number) => {
    updateCategoryAccess(cat.id, { standalonePrice: price });
    toast({
      title: 'Standalone price updated',
      description: `${cat.categoryName} standalone price set to ₹${price.toLocaleString('en-IN')}.`,
    });
  };

  const handleEditSave = (id: string, updates: Partial<CategoryAccess>) => {
    updateCategoryAccess(id, updates);
    toast({
      title: 'Category access updated',
      description: 'All changes have been saved successfully.',
    });
  };

  const openEdit = (cat: CategoryAccess) => {
    setEditTarget(cat);
    setEditOpen(true);
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-6 max-w-7xl mx-auto">

        {/* ── Header ── */}
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
              <Layers className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Category Access Manager
            </h1>
          </div>
          <p className="text-muted-foreground text-sm pl-11">
            Control which categories are included in each subscription plan and set standalone prices.
          </p>
        </div>

        {/* ── Info Banner ── */}
        <div className="flex items-start gap-3 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/30 px-4 py-3">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">Live control:</span>{' '}
            Changes here instantly affect what students can purchase on the pricing page.
          </p>
        </div>

        {/* ── Summary Strip ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Total Categories</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{totalCategories}</p>
                  <p className="text-xs text-muted-foreground mt-1">{activeCategories.length} active</p>
                </div>
                <div className="p-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50">
                  <LayoutGrid className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Free Access</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{freeAccessCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">visible to Free plan</p>
                </div>
                <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Avg Standalone Price</p>
                  <p className="text-3xl font-bold text-foreground mt-1">
                    <span className="text-lg font-semibold text-muted-foreground">₹</span>
                    {avgPrice.toLocaleString('en-IN')}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">across active categories</p>
                </div>
                <div className="p-2.5 rounded-lg bg-violet-50 dark:bg-violet-950/50">
                  <IndianRupee className="h-5 w-5 text-violet-600 dark:text-violet-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">In Pro Max</p>
                  <p className="text-3xl font-bold text-foreground mt-1">{proMaxCount}</p>
                  <p className="text-xs text-muted-foreground mt-1">categories included</p>
                </div>
                <div className="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/50">
                  <ShieldCheck className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ── Categories Table ── */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Tags className="h-4 w-4 text-muted-foreground" />
              Exam Categories
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-y border-border bg-muted/30">
                    <th className="text-left px-5 py-3 font-medium text-muted-foreground whitespace-nowrap">Category</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Free Access</th>
                    <th className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                      Standalone Price
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      Smart
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-indigo-600 dark:text-indigo-400 whitespace-nowrap">
                      Pro
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-amber-600 dark:text-amber-400 whitespace-nowrap">
                      Pro Max
                    </th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Status</th>
                    <th className="text-center px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryAccess.map((cat, idx) => {
                    const colors = getCategoryColor(cat.categoryName);
                    return (
                      <tr
                        key={cat.id}
                        className={`border-b border-border transition-colors hover:bg-muted/20 ${
                          !cat.isActive ? 'opacity-60' : ''
                        }`}
                      >
                        {/* Category Name */}
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <div className="flex items-center gap-2.5">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${colors.dot}`} />
                            <span className="font-medium text-foreground">{cat.categoryName}</span>
                            {!cat.isActive && (
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-muted-foreground">
                                Inactive
                              </Badge>
                            )}
                          </div>
                        </td>

                        {/* Free Access Switch */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={cat.isFreeAccess}
                              onCheckedChange={() => handleToggleFree(cat)}
                              aria-label={`Toggle free access for ${cat.categoryName}`}
                            />
                          </div>
                        </td>

                        {/* Standalone Price (inline editable) */}
                        <td className="px-4 py-3.5">
                          <InlinePriceCell
                            value={cat.standalonePrice}
                            onSave={price => handlePriceSave(cat, price)}
                          />
                        </td>

                        {/* Smart Plan */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={cat.includedInPlanIds.includes('smart')}
                              onCheckedChange={() => handleTogglePlan(cat, 'smart')}
                              aria-label={`Include ${cat.categoryName} in Smart plan`}
                              className="border-emerald-400 data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                            />
                          </div>
                        </td>

                        {/* Pro Plan */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={cat.includedInPlanIds.includes('pro')}
                              onCheckedChange={() => handleTogglePlan(cat, 'pro')}
                              aria-label={`Include ${cat.categoryName} in Pro plan`}
                              className="border-indigo-400 data-[state=checked]:bg-indigo-600 data-[state=checked]:border-indigo-600"
                            />
                          </div>
                        </td>

                        {/* Pro Max Plan */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex justify-center">
                            <Checkbox
                              checked={cat.includedInPlanIds.includes('pro-max')}
                              onCheckedChange={() => handleTogglePlan(cat, 'pro-max')}
                              aria-label={`Include ${cat.categoryName} in Pro Max plan`}
                              className="border-amber-400 data-[state=checked]:bg-amber-600 data-[state=checked]:border-amber-600"
                            />
                          </div>
                        </td>

                        {/* Active Status */}
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex justify-center">
                            <Switch
                              checked={cat.isActive}
                              onCheckedChange={() => handleToggleActive(cat)}
                              aria-label={`Toggle active status for ${cat.categoryName}`}
                            />
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-center">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openEdit(cat)}
                            className="h-8 gap-1.5 text-muted-foreground hover:text-foreground"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {categoryAccess.length === 0 && (
                <div className="flex flex-col items-center justify-center py-16 text-center text-muted-foreground gap-3">
                  <LayoutGrid className="h-10 w-10 opacity-30" />
                  <p className="font-medium">No categories found</p>
                  <p className="text-sm">Category access entries will appear here once added.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* ── Column Legend ── */}
        <div className="flex flex-wrap gap-4 px-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border-2 border-emerald-400 bg-emerald-600" />
            <span>Smart — ₹299/mo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border-2 border-indigo-400 bg-indigo-600" />
            <span>Pro — ₹499/mo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3.5 h-3.5 rounded border-2 border-amber-400 bg-amber-600" />
            <span>Pro Max — ₹999/mo</span>
          </div>
          <div className="flex items-center gap-1.5 ml-auto">
            <Pencil className="h-3 w-3" />
            <span>Click any price to edit inline</span>
          </div>
        </div>

        {/* ── How It Works Card ── */}
        <Card className="border-border bg-gradient-to-br from-indigo-50/60 to-violet-50/40 dark:from-indigo-950/30 dark:to-violet-950/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold flex items-center gap-2 text-foreground">
              <Info className="h-4 w-4 text-indigo-500" />
              How Category Access Works
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="flex gap-3 rounded-lg bg-white/60 dark:bg-black/20 border border-border p-3.5">
                <div className="pt-0.5 shrink-0">
                  <ShieldCheck className="h-4 w-4 text-indigo-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Plan Subscribers</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Students with Smart, Pro, or Pro Max get checked categories{' '}
                    <span className="font-medium text-foreground">free</span> — no extra purchase needed.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg bg-white/60 dark:bg-black/20 border border-border p-3.5">
                <div className="pt-0.5 shrink-0">
                  <IndianRupee className="h-4 w-4 text-violet-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Standalone Purchase</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Students <span className="font-medium text-foreground">without a plan</span> can buy individual
                    categories at the standalone price you set.
                  </p>
                </div>
              </div>

              <div className="flex gap-3 rounded-lg bg-white/60 dark:bg-black/20 border border-border p-3.5">
                <div className="pt-0.5 shrink-0">
                  <BookOpen className="h-4 w-4 text-emerald-500" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground mb-1">Free Access Toggle</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    Categories marked <span className="font-medium text-foreground">Free Access</span> are visible
                    to all users including the Free plan — use for promotional categories.
                  </p>
                </div>
              </div>
            </div>

            <Separator className="opacity-30" />

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <TrendingUp className="h-3.5 w-3.5 text-indigo-400" />
              <span>
                Tip: Keeping a few categories on Free Access increases student engagement and upgrades.
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ── Edit Dialog ── */}
      <EditDialog
        category={editTarget}
        open={editOpen}
        onClose={() => { setEditOpen(false); setEditTarget(null); }}
        onSave={handleEditSave}
      />
    </div>
  );
}
