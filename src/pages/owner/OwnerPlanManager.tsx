// src/pages/owner/OwnerPlanManager.tsx
// Route: /owner/plan-manager
// Full CRUD for subscription plans (Free, Smart, Pro, Pro Max)

import React, { useState, useCallback } from 'react';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { SubscriptionPlan, PlanFeature } from '@/types/pricing';
import { useToast } from '@/hooks/use-toast';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Plus,
  Pencil,
  Trash2,
  Users,
  TrendingUp,
  Layers,
  Check,
  Minus,
  X,
  ChevronDown,
  ChevronUp,
  Crown,
  Loader2,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const MOCK_SUBSCRIBER_MAP: Record<string, number> = {
  free: 5200,
  smart: 1840,
  pro: 2960,
  'pro-max': 890,
};

const BADGE_COLOR_OPTIONS = [
  { value: 'indigo', label: 'Indigo', class: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
  { value: 'amber', label: 'Amber', class: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'emerald', label: 'Emerald', class: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
  { value: 'rose', label: 'Rose', class: 'bg-rose-100 text-rose-700 border-rose-200' },
];

const FEATURE_MATRIX_ROWS = [
  { key: 'dashboard', label: 'Dashboard' },
  { key: 'tests', label: 'Mock Tests' },
  { key: 'ca', label: 'Current Affairs' },
  { key: 'pdfs', label: 'PDF Courses' },
  { key: 'vocab', label: 'Vocabulary' },
  { key: 'mentorship', label: 'Mentorship' },
  { key: 'analytics', label: 'AI Analytics' },
  { key: 'strict', label: 'Strict Mode' },
  { key: 'exams', label: 'Exam Tracker' },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatPrice(amount: number): string {
  if (amount === 0) return 'Free';
  return `₹${amount.toLocaleString('en-IN')}`;
}

function getBadgeClass(color?: string): string {
  const map: Record<string, string> = {
    indigo: 'bg-indigo-100 text-indigo-700 border border-indigo-200',
    amber: 'bg-amber-100 text-amber-700 border border-amber-200',
    emerald: 'bg-emerald-100 text-emerald-700 border border-emerald-200',
    rose: 'bg-rose-100 text-rose-700 border border-rose-200',
  };
  return map[color ?? ''] ?? 'bg-slate-100 text-slate-700 border border-slate-200';
}

function getPlanAccentClass(id: string): { border: string; bg: string; text: string; glow: string } {
  switch (id) {
    case 'free':
      return { border: 'border-slate-200', bg: 'bg-slate-50', text: 'text-slate-600', glow: '' };
    case 'smart':
      return { border: 'border-emerald-200', bg: 'bg-emerald-50', text: 'text-emerald-600', glow: 'shadow-emerald-100' };
    case 'pro':
      return { border: 'border-indigo-300', bg: 'bg-indigo-50', text: 'text-indigo-600', glow: 'shadow-indigo-100' };
    case 'pro-max':
      return { border: 'border-amber-200', bg: 'bg-amber-50', text: 'text-amber-600', glow: 'shadow-amber-100' };
    default:
      return { border: 'border-violet-200', bg: 'bg-violet-50', text: 'text-violet-600', glow: 'shadow-violet-100' };
  }
}

function slugify(name: string): string {
  return name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
}

function getSubscribers(planId: string): number {
  return MOCK_SUBSCRIBER_MAP[planId] ?? Math.floor(Math.random() * 500 + 100);
}

function getFeatureValue(plan: SubscriptionPlan, key: string): string | boolean | number | null {
  if (key === 'dashboard') return true; // everyone gets dashboard
  const feature = plan.features.find((f) => f.id === key);
  return feature ? feature.value : false;
}

// ─── Blank plan template ──────────────────────────────────────────────────────

function blankPlan(): Omit<SubscriptionPlan, 'createdAt' | 'updatedAt'> {
  return {
    id: '',
    name: '',
    badge: '',
    badgeColor: 'indigo',
    monthlyPrice: 0,
    yearlyPrice: 0,
    trialDays: 0,
    isActive: true,
    isDefault: false,
    sortOrder: 99,
    description: '',
    targetAudience: '',
    maxExams: null,
    features: [
      { id: 'tests', label: 'Mock Tests', value: '' },
      { id: 'ca', label: 'Current Affairs', value: '' },
      { id: 'vocab', label: 'Vocabulary', value: false },
      { id: 'mentorship', label: 'Mentorship', value: false },
      { id: 'analytics', label: 'Analytics', value: '' },
      { id: 'pdfs', label: 'PDF Courses', value: false },
      { id: 'strict', label: 'Strict Mode', value: false },
    ],
  };
}

// ─── Plan Form State ──────────────────────────────────────────────────────────

interface PlanFormState {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  monthlyPrice: string;
  yearlyPrice: string;
  trialDays: string;
  description: string;
  targetAudience: string;
  maxExams: string;
  sortOrder: string;
  isActive: boolean;
  isDefault: boolean;
  features: { id: string; label: string; value: string }[];
}

function planToForm(plan: SubscriptionPlan): PlanFormState {
  return {
    id: plan.id,
    name: plan.name,
    badge: plan.badge ?? '',
    badgeColor: plan.badgeColor ?? 'indigo',
    monthlyPrice: String(plan.monthlyPrice),
    yearlyPrice: String(plan.yearlyPrice),
    trialDays: String(plan.trialDays),
    description: plan.description,
    targetAudience: plan.targetAudience,
    maxExams: plan.maxExams === null ? '' : String(plan.maxExams),
    sortOrder: String(plan.sortOrder),
    isActive: plan.isActive,
    isDefault: plan.isDefault,
    features: plan.features.map((f) => ({
      id: f.id,
      label: f.label,
      value: typeof f.value === 'boolean' ? (f.value ? 'true' : 'false') : String(f.value),
    })),
  };
}

function formToPlan(form: PlanFormState, now: string): SubscriptionPlan {
  return {
    id: form.id || slugify(form.name),
    name: form.name,
    badge: form.badge || undefined,
    badgeColor: form.badgeColor || undefined,
    monthlyPrice: parseFloat(form.monthlyPrice) || 0,
    yearlyPrice: parseFloat(form.yearlyPrice) || 0,
    trialDays: parseInt(form.trialDays) || 0,
    description: form.description,
    targetAudience: form.targetAudience,
    maxExams: form.maxExams === '' || form.maxExams === '0' ? null : parseInt(form.maxExams),
    sortOrder: parseInt(form.sortOrder) || 99,
    isActive: form.isActive,
    isDefault: form.isDefault,
    features: form.features.map((f) => ({
      id: f.id,
      label: f.label,
      value:
        f.value === 'true'
          ? true
          : f.value === 'false'
          ? false
          : isNaN(Number(f.value)) || f.value === ''
          ? f.value
          : Number(f.value),
    })),
    createdAt: now,
    updatedAt: now,
  };
}

// ─── KPI Strip ────────────────────────────────────────────────────────────────

interface KpiStripProps {
  plans: SubscriptionPlan[];
}

function KpiStrip({ plans }: KpiStripProps) {
  const totalActive = plans.filter((p) => p.isActive).length;
  const totalSubscribers = plans.reduce((sum, p) => sum + getSubscribers(p.id), 0);
  const mrr = plans.reduce((sum, p) => {
    if (!p.isActive) return sum;
    return sum + p.monthlyPrice * getSubscribers(p.id);
  }, 0);

  const kpis = [
    {
      label: 'Total Active Plans',
      value: totalActive,
      icon: Layers,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      suffix: '',
    },
    {
      label: 'Total Subscribers',
      value: totalSubscribers.toLocaleString('en-IN'),
      icon: Users,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      suffix: '',
    },
    {
      label: 'Est. Monthly Revenue',
      value: `₹${(mrr / 100000).toFixed(1)}L`,
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      suffix: '/mo',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {kpis.map((kpi) => (
        <Card key={kpi.label} className="border border-slate-200 shadow-sm">
          <CardContent className="p-5 flex items-center gap-4">
            <div className={`w-11 h-11 rounded-xl ${kpi.bg} flex items-center justify-center shrink-0`}>
              <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <div>
              <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground leading-tight">
                {kpi.value}
                {kpi.suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{kpi.suffix}</span>}
              </p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

// ─── Plan Form Dialog ─────────────────────────────────────────────────────────

interface PlanFormDialogProps {
  open: boolean;
  onClose: () => void;
  initialForm: PlanFormState;
  mode: 'add' | 'edit';
  onSave: (form: PlanFormState) => Promise<void>;
  isSaving: boolean;
}

function PlanFormDialog({ open, onClose, initialForm, mode, onSave, isSaving }: PlanFormDialogProps) {
  const [form, setForm] = useState<PlanFormState>(initialForm);

  // sync when initialForm changes (e.g. opening different plans)
  React.useEffect(() => {
    setForm(initialForm);
  }, [initialForm]);

  const set = useCallback(<K extends keyof PlanFormState>(key: K, value: PlanFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const setFeature = useCallback((idx: number, key: 'label' | 'value' | 'id', val: string) => {
    setForm((prev) => {
      const features = [...prev.features];
      features[idx] = { ...features[idx], [key]: val };
      return { ...prev, features };
    });
  }, []);

  const addFeature = () => {
    setForm((prev) => ({
      ...prev,
      features: [...prev.features, { id: `feat-${Date.now()}`, label: '', value: '' }],
    }));
  };

  const removeFeature = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    await onSave(form);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-foreground">
            {mode === 'add' ? 'Add New Plan' : `Edit Plan — ${initialForm.name}`}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-2">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Plan Name <span className="text-red-500">*</span></Label>
              <Input
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="e.g. Pro Max"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Badge Text <span className="text-muted-foreground text-xs">(optional)</span></Label>
              <Input
                value={form.badge}
                onChange={(e) => set('badge', e.target.value)}
                placeholder="e.g. MOST POPULAR"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Badge Color</Label>
              <Select value={form.badgeColor} onValueChange={(v) => set('badgeColor', v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGE_COLOR_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${opt.class}`}>
                        {opt.label}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Sort Order</Label>
              <Input
                type="number"
                min={0}
                value={form.sortOrder}
                onChange={(e) => set('sortOrder', e.target.value)}
              />
            </div>
          </div>

          {/* Pricing */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Pricing</p>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label>Monthly Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.monthlyPrice}
                  onChange={(e) => set('monthlyPrice', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Yearly Price (₹)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.yearlyPrice}
                  onChange={(e) => set('yearlyPrice', e.target.value)}
                  placeholder="0"
                />
              </div>
              <div className="space-y-1.5">
                <Label>Trial Days (0–30)</Label>
                <Input
                  type="number"
                  min={0}
                  max={30}
                  value={form.trialDays}
                  onChange={(e) => set('trialDays', e.target.value)}
                  placeholder="0"
                />
              </div>
            </div>
          </div>

          {/* Details */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-3 border-b pb-1">Plan Details</p>
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label>Description</Label>
                <Textarea
                  value={form.description}
                  onChange={(e) => set('description', e.target.value)}
                  rows={2}
                  placeholder="Short plan description..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Target Audience</Label>
                  <Input
                    value={form.targetAudience}
                    onChange={(e) => set('targetAudience', e.target.value)}
                    placeholder="e.g. Serious aspirants"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Max Exams <span className="text-muted-foreground text-xs">(0 = unlimited)</span></Label>
                  <Input
                    type="number"
                    min={0}
                    value={form.maxExams}
                    onChange={(e) => set('maxExams', e.target.value)}
                    placeholder="0"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Toggles */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Active</p>
                <p className="text-xs text-muted-foreground">Visible to students</p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Default Plan</p>
                <p className="text-xs text-muted-foreground">Auto-assigned on signup</p>
              </div>
              <Switch checked={form.isDefault} onCheckedChange={(v) => set('isDefault', v)} />
            </div>
          </div>

          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-3 border-b pb-1">
              <p className="text-sm font-semibold text-foreground">Features</p>
              <Button type="button" size="sm" variant="outline" onClick={addFeature} className="h-7 text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add Feature
              </Button>
            </div>
            <div className="space-y-2">
              {form.features.map((feat, idx) => (
                <div key={feat.id} className="flex gap-2 items-center">
                  <Input
                    className="flex-1 h-8 text-sm"
                    value={feat.label}
                    onChange={(e) => setFeature(idx, 'label', e.target.value)}
                    placeholder="Feature label"
                  />
                  <Input
                    className="flex-1 h-8 text-sm"
                    value={feat.value}
                    onChange={(e) => setFeature(idx, 'value', e.target.value)}
                    placeholder="Value (true/false/text/number)"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-red-500 shrink-0"
                    onClick={() => removeFeature(idx)}
                  >
                    <X className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
              {form.features.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">No features added. Click "Add Feature" to start.</p>
              )}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving || !form.name.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving…
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                {mode === 'add' ? 'Create Plan' : 'Save Changes'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Plan Card ────────────────────────────────────────────────────────────────

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  onToggleActive: (plan: SubscriptionPlan) => void;
}

function PlanCard({ plan, onEdit, onDelete, onToggleActive }: PlanCardProps) {
  const [expanded, setExpanded] = useState(false);
  const accent = getPlanAccentClass(plan.id);
  const subscribers = getSubscribers(plan.id);
  const visibleFeatures = expanded ? plan.features : plan.features.slice(0, 4);
  const moreCount = plan.features.length - 4;

  return (
    <Card
      className={`relative flex flex-col border-2 ${accent.border} shadow-md ${accent.glow} transition-shadow hover:shadow-lg`}
    >
      {/* Inactive overlay badge */}
      {!plan.isActive && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-500">
            Inactive
          </span>
        </div>
      )}

      <CardHeader className={`rounded-t-lg pb-3 ${accent.bg}`}>
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
              {plan.isDefault && (
                <Crown className="w-4 h-4 text-amber-500" title="Default plan" />
              )}
            </div>
            {plan.badge && (
              <span className={`inline-block mt-1 text-[11px] font-bold tracking-wider px-2 py-0.5 rounded-full ${getBadgeClass(plan.badgeColor)}`}>
                {plan.badge}
              </span>
            )}
          </div>
          {/* Active toggle */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-xs text-muted-foreground">{plan.isActive ? 'On' : 'Off'}</span>
            <Switch
              checked={plan.isActive}
              onCheckedChange={() => onToggleActive(plan)}
              className="scale-90"
            />
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-3 flex items-end gap-4">
          <div>
            <p className="text-xs text-muted-foreground mb-0.5">Monthly</p>
            <p className={`text-2xl font-bold ${accent.text}`}>
              {formatPrice(plan.monthlyPrice)}
              {plan.monthlyPrice > 0 && <span className="text-sm font-normal text-muted-foreground">/mo</span>}
            </p>
          </div>
          {plan.yearlyPrice > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Yearly</p>
              <p className="text-lg font-semibold text-foreground">
                {formatPrice(plan.yearlyPrice)}
                <span className="text-sm font-normal text-muted-foreground">/yr</span>
              </p>
            </div>
          )}
        </div>

        {/* Trial */}
        {plan.trialDays > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            🎁 {plan.trialDays}-day free trial
          </p>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col pt-4 gap-4">
        {/* Subscribers */}
        <div className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-2 border border-slate-100">
          <Users className="w-4 h-4 text-indigo-400 shrink-0" />
          <span className="text-sm font-semibold text-foreground">{subscribers.toLocaleString('en-IN')}</span>
          <span className="text-xs text-muted-foreground">subscribers</span>
        </div>

        {/* Features */}
        <div className="space-y-1.5">
          {visibleFeatures.map((f) => (
            <FeatureRow key={f.id} feature={f} />
          ))}
          {moreCount > 0 && (
            <button
              className="flex items-center gap-1 text-xs text-indigo-600 font-medium mt-1 hover:underline"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="w-3 h-3" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="w-3 h-3" /> +{moreCount} more features
                </>
              )}
            </button>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-auto pt-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 h-8 text-xs border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            onClick={() => onEdit(plan)}
          >
            <Pencil className="w-3 h-3 mr-1" /> Edit
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs border-red-200 text-red-500 hover:bg-red-50 disabled:opacity-40"
                disabled={plan.isDefault}
                title={plan.isDefault ? 'Cannot delete the default plan' : 'Delete plan'}
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Delete "{plan.name}" plan?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. Any students on this plan will lose access. Make sure to migrate them first.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(plan)}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Delete Plan
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
}

function FeatureRow({ feature }: { feature: PlanFeature }) {
  const val = feature.value;
  const isTrue = val === true || val === 'true';
  const isFalse = val === false || val === 'false';

  return (
    <div className="flex items-center gap-2">
      {isTrue ? (
        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
      ) : isFalse ? (
        <X className="w-3.5 h-3.5 text-slate-300 shrink-0" />
      ) : (
        <div className="w-3.5 h-3.5 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
          <div className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
        </div>
      )}
      <span className="text-xs text-muted-foreground">{feature.label}</span>
      {!isTrue && !isFalse && val !== undefined && val !== '' && (
        <span className={`ml-auto text-xs font-medium ${feature.isHighlighted ? 'text-indigo-600' : 'text-foreground'}`}>
          {String(val)}
        </span>
      )}
    </div>
  );
}

// ─── Feature Access Matrix ────────────────────────────────────────────────────

interface FeatureMatrixProps {
  plans: SubscriptionPlan[];
}

function FeatureAccessMatrix({ plans }: FeatureMatrixProps) {
  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  return (
    <Card className="border border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="bg-gradient-to-r from-indigo-50 to-violet-50 border-b px-6 py-4">
        <div className="flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" />
          <h2 className="text-base font-semibold text-foreground">Feature Access Matrix</h2>
          <Badge variant="outline" className="ml-auto text-xs font-normal">Read-only comparison</Badge>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr className="border-b bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide w-48">
                  Feature
                </th>
                {sortedPlans.map((plan) => (
                  <th key={plan.id} className="px-4 py-3 text-center">
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-sm font-bold text-foreground">{plan.name}</span>
                      {plan.badge && (
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none ${getBadgeClass(plan.badgeColor)}`}>
                          {plan.badge}
                        </span>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURE_MATRIX_ROWS.map((row, idx) => (
                <tr
                  key={row.key}
                  className={`border-b last:border-b-0 transition-colors hover:bg-slate-50/60 ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}`}
                >
                  <td className="px-5 py-3 text-sm font-medium text-foreground">{row.label}</td>
                  {sortedPlans.map((plan) => {
                    const val = getFeatureValue(plan, row.key);
                    const isTrue = val === true;
                    const isFalse = val === false;
                    const isString = typeof val === 'string' && val !== '';
                    const isNumber = typeof val === 'number';

                    return (
                      <td key={plan.id} className="px-4 py-3 text-center">
                        {isTrue ? (
                          <div className="flex justify-center">
                            <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center">
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            </div>
                          </div>
                        ) : isFalse ? (
                          <div className="flex justify-center">
                            <Minus className="w-4 h-4 text-slate-300" />
                          </div>
                        ) : isString || isNumber ? (
                          <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                            {String(val)}
                          </span>
                        ) : (
                          <Minus className="w-4 h-4 text-slate-300 mx-auto" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerPlanManager() {
  const { plans, addPlan, updatePlan, deletePlan } = usePricingStore();
  const { toast } = useToast();

  const [editTarget, setEditTarget] = useState<SubscriptionPlan | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleToggleActive = useCallback(
    (plan: SubscriptionPlan) => {
      updatePlan(plan.id, { isActive: !plan.isActive });
      toast({
        title: plan.isActive ? `"${plan.name}" deactivated` : `"${plan.name}" activated`,
        description: plan.isActive
          ? 'Plan is now hidden from students.'
          : 'Plan is now visible to students.',
      });
    },
    [updatePlan, toast]
  );

  const handleEditSave = useCallback(
    async (form: PlanFormState) => {
      if (!editTarget) return;
      setIsSaving(true);
      await new Promise((r) => setTimeout(r, 400)); // simulate async
      const now = new Date().toISOString();
      const updated = formToPlan(form, now);
      updatePlan(editTarget.id, updated);
      toast({
        title: 'Plan updated',
        description: `"${updated.name}" has been saved successfully.`,
      });
      setIsSaving(false);
      setEditTarget(null);
    },
    [editTarget, updatePlan, toast]
  );

  const handleAddSave = useCallback(
    async (form: PlanFormState) => {
      setIsSaving(true);
      await new Promise((r) => setTimeout(r, 400));
      const now = new Date().toISOString();
      const newPlan = formToPlan(form, now);
      newPlan.createdAt = now;
      addPlan(newPlan);
      toast({
        title: 'Plan created',
        description: `"${newPlan.name}" has been added to your subscription tiers.`,
      });
      setIsSaving(false);
      setAddOpen(false);
    },
    [addPlan, toast]
  );

  const handleDelete = useCallback(
    (plan: SubscriptionPlan) => {
      deletePlan(plan.id);
      toast({
        title: 'Plan deleted',
        description: `"${plan.name}" has been removed.`,
        variant: 'destructive',
      });
    },
    [deletePlan, toast]
  );

  // ── Sorted plans ──────────────────────────────────────────────────────────
  const sortedPlans = [...plans].sort((a, b) => a.sortOrder - b.sortOrder);

  // ── Prepare form defaults ──────────────────────────────────────────────────
  const editFormInitial: PlanFormState = editTarget
    ? planToForm(editTarget)
    : planToForm({ ...blankPlan(), createdAt: '', updatedAt: '' } as SubscriptionPlan);

  const addFormInitial: PlanFormState = planToForm({
    ...(blankPlan() as SubscriptionPlan),
    createdAt: '',
    updatedAt: '',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto p-6 space-y-8">

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground tracking-tight">
              Subscription Plan Manager
            </h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Control pricing for all subscription tiers
            </p>
          </div>
          <Button
            onClick={() => setAddOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm self-start sm:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Plan
          </Button>
        </div>

        {/* ── KPI Strip ─────────────────────────────────────────────────────── */}
        <KpiStrip plans={sortedPlans} />

        {/* ── Plan Cards Grid ───────────────────────────────────────────────── */}
        {sortedPlans.length === 0 ? (
          <Card className="border-dashed border-2 border-slate-200">
            <CardContent className="flex flex-col items-center justify-center py-16 gap-4">
              <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
                <Layers className="w-7 h-7 text-indigo-400" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-foreground">No plans yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first subscription plan to get started.
                </p>
              </div>
              <Button
                onClick={() => setAddOpen(true)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Plus className="w-4 h-4 mr-2" /> Add First Plan
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {sortedPlans.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                onEdit={setEditTarget}
                onDelete={handleDelete}
                onToggleActive={handleToggleActive}
              />
            ))}
          </div>
        )}

        {/* ── Feature Access Matrix ─────────────────────────────────────────── */}
        {sortedPlans.length > 0 && <FeatureAccessMatrix plans={sortedPlans} />}

        {/* ── Edit Dialog ───────────────────────────────────────────────────── */}
        {editTarget && (
          <PlanFormDialog
            open={!!editTarget}
            onClose={() => setEditTarget(null)}
            initialForm={editFormInitial}
            mode="edit"
            onSave={handleEditSave}
            isSaving={isSaving}
          />
        )}

        {/* ── Add Dialog ────────────────────────────────────────────────────── */}
        <PlanFormDialog
          open={addOpen}
          onClose={() => setAddOpen(false)}
          initialForm={addFormInitial}
          mode="add"
          onSave={handleAddSave}
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
