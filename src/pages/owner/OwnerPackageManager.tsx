// src/pages/owner/OwnerPackageManager.tsx
// Route: /owner/package-manager
// Full CRUD for ExamPackage — Table + Card view, KPI strip, filters, dialogs.

import React, { useState, useMemo, useRef } from 'react';
import { usePricingStore } from '@/hooks/usePricingStore';
import type { ExamPackage } from '@/types/pricing';
import { useToast } from '@/hooks/use-toast';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  Package,
  Plus,
  Search,
  LayoutGrid,
  List,
  Pencil,
  Trash2,
  Star,
  IndianRupee,
  BookOpen,
  FileText,
  CalendarDays,
  TrendingUp,
  CheckCircle2,
  XCircle,
  X,
  Sparkles,
  Filter,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = ['Banking', 'SSC', 'Railway', 'TNPSC', 'UPSC', 'Defence', 'Insurance'];

// Simulated sales multiplier per package (seed-stable via id hash)
function simulatedSales(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) hash = (hash * 31 + id.charCodeAt(i)) & 0xffff;
  return 50 + (hash % 450); // 50–499 sales
}

function formatINR(amount: number) {
  return `₹${amount.toLocaleString('en-IN')}`;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ViewMode = 'table' | 'card';
type StatusFilter = 'all' | 'active' | 'inactive';

interface FormState {
  name: string;
  category: string;
  price: string;
  discountedPrice: string;
  validityDays: string;
  includedExams: string[];
  includedTests: string;
  includedPDFs: string;
  description: string;
  isFeatured: boolean;
  sortOrder: string;
  isActive: boolean;
}

const BLANK_FORM: FormState = {
  name: '',
  category: '',
  price: '',
  discountedPrice: '',
  validityDays: '365',
  includedExams: [],
  includedTests: '',
  includedPDFs: '',
  description: '',
  isFeatured: false,
  sortOrder: '0',
  isActive: true,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  sub?: string;
  accent: string;
}) {
  return (
    <Card className="relative overflow-hidden border border-border/60 bg-card shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{label}</p>
            <p className="text-2xl font-bold text-foreground">{value}</p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
          <div className={`p-2.5 rounded-xl ${accent}`}>
            <Icon className="h-5 w-5 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function CategoryBadge({ category }: { category: string }) {
  const colors: Record<string, string> = {
    Banking: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
    SSC: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    Railway: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
    TNPSC: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
    UPSC: 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300',
    Defence: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
    Insurance: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
  };
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
        colors[category] ?? 'bg-muted text-muted-foreground'
      }`}
    >
      {category}
    </span>
  );
}

// ─── Package Form Dialog ──────────────────────────────────────────────────────

function PackageFormDialog({
  open,
  onClose,
  editing,
  onSave,
}: {
  open: boolean;
  onClose: () => void;
  editing: ExamPackage | null;
  onSave: (data: FormState) => void;
}) {
  const [form, setForm] = useState<FormState>(BLANK_FORM);
  const [examInput, setExamInput] = useState('');
  const [saving, setSaving] = useState(false);
  const examInputRef = useRef<HTMLInputElement>(null);

  // Sync form when dialog opens
  React.useEffect(() => {
    if (open) {
      if (editing) {
        setForm({
          name: editing.name,
          category: editing.category,
          price: String(editing.price),
          discountedPrice: editing.discountedPrice != null ? String(editing.discountedPrice) : '',
          validityDays: String(editing.validityDays),
          includedExams: [...editing.includedExams],
          includedTests: String(editing.includedTests),
          includedPDFs: String(editing.includedPDFs),
          description: editing.description,
          isFeatured: editing.isFeatured,
          sortOrder: String(editing.sortOrder),
          isActive: editing.isActive,
        });
      } else {
        setForm(BLANK_FORM);
      }
      setExamInput('');
    }
  }, [open, editing]);

  function addExam() {
    const trimmed = examInput.trim();
    if (!trimmed || form.includedExams.includes(trimmed)) return;
    setForm(f => ({ ...f, includedExams: [...f.includedExams, trimmed] }));
    setExamInput('');
    examInputRef.current?.focus();
  }

  function removeExam(exam: string) {
    setForm(f => ({ ...f, includedExams: f.includedExams.filter(e => e !== exam) }));
  }

  function handleExamKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addExam();
    }
  }

  async function handleSave() {
    setSaving(true);
    await new Promise(r => setTimeout(r, 300));
    onSave(form);
    setSaving(false);
  }

  const isValid =
    form.name.trim() &&
    form.category &&
    form.price &&
    Number(form.price) > 0 &&
    form.validityDays &&
    Number(form.validityDays) > 0;

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg">
            <Package className="h-5 w-5 text-indigo-500" />
            {editing ? 'Edit Package' : 'Add New Package'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 gap-5 py-2">
          {/* Row 1: Name + Category */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Package Name <span className="text-rose-500">*</span>
              </Label>
              <Input
                placeholder="e.g. Banking Pack"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Category <span className="text-rose-500">*</span>
              </Label>
              <Select
                value={form.category}
                onValueChange={v => setForm(f => ({ ...f, category: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map(c => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Row 2: Price + Discounted Price + Validity */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Price ₹ <span className="text-rose-500">*</span>
              </Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  placeholder="999"
                  className="pl-8"
                  value={form.price}
                  onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Discounted Price ₹</Label>
              <div className="relative">
                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min="0"
                  placeholder="Optional"
                  className="pl-8"
                  value={form.discountedPrice}
                  onChange={e => setForm(f => ({ ...f, discountedPrice: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">
                Validity (Days) <span className="text-rose-500">*</span>
              </Label>
              <Input
                type="number"
                min="1"
                placeholder="365"
                value={form.validityDays}
                onChange={e => setForm(f => ({ ...f, validityDays: e.target.value }))}
              />
            </div>
          </div>

          {/* Row 3: Tests + PDFs + Sort Order */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">No. of Tests</Label>
              <Input
                type="number"
                min="0"
                placeholder="200"
                value={form.includedTests}
                onChange={e => setForm(f => ({ ...f, includedTests: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">No. of PDFs</Label>
              <Input
                type="number"
                min="0"
                placeholder="50"
                value={form.includedPDFs}
                onChange={e => setForm(f => ({ ...f, includedPDFs: e.target.value }))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-sm font-medium">Sort Order</Label>
              <Input
                type="number"
                min="0"
                placeholder="0"
                value={form.sortOrder}
                onChange={e => setForm(f => ({ ...f, sortOrder: e.target.value }))}
              />
            </div>
          </div>

          {/* Included Exams */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Included Exams</Label>
            <div className="flex gap-2">
              <Input
                ref={examInputRef}
                placeholder="Type exam name and press Enter"
                value={examInput}
                onChange={e => setExamInput(e.target.value)}
                onKeyDown={handleExamKeyDown}
                className="flex-1"
              />
              <Button type="button" variant="outline" size="sm" onClick={addExam}>
                Add
              </Button>
            </div>
            {form.includedExams.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1">
                {form.includedExams.map(exam => (
                  <span
                    key={exam}
                    className="inline-flex items-center gap-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-xs px-2 py-1 rounded-full"
                  >
                    {exam}
                    <button
                      type="button"
                      onClick={() => removeExam(exam)}
                      className="hover:text-red-500 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label className="text-sm font-medium">Description</Label>
            <Textarea
              placeholder="Brief description of the package..."
              rows={3}
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
            />
          </div>

          {/* Toggles */}
          <div className="flex flex-wrap gap-6 pt-1">
            <div className="flex items-center gap-3">
              <Switch
                id="form-featured"
                checked={form.isFeatured}
                onCheckedChange={v => setForm(f => ({ ...f, isFeatured: v }))}
              />
              <Label htmlFor="form-featured" className="text-sm cursor-pointer flex items-center gap-1.5">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                Featured Package
              </Label>
            </div>
            <div className="flex items-center gap-3">
              <Switch
                id="form-active"
                checked={form.isActive}
                onCheckedChange={v => setForm(f => ({ ...f, isActive: v }))}
              />
              <Label htmlFor="form-active" className="text-sm cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 gap-2">
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isValid || saving}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            {saving ? (
              <span className="flex items-center gap-2">
                <span className="h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : editing ? (
              'Save Changes'
            ) : (
              'Add Package'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function OwnerPackageManager() {
  const { packages, addPackage, updatePackage, deletePackage } = usePricingStore();
  const { toast } = useToast();

  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPkg, setEditingPkg] = useState<ExamPackage | null>(null);
  const [deletingPkg, setDeletingPkg] = useState<ExamPackage | null>(null);

  // ── KPI Computations ────────────────────────────────────────────────────────
  const kpis = useMemo(() => {
    const total = packages.length;
    const active = packages.filter(p => p.isActive).length;
    const bestSeller = packages.length
      ? packages.reduce((best, p) =>
          p.includedTests > best.includedTests ? p : best
        )
      : null;
    const totalRevenue = packages.reduce((sum, p) => {
      const price = p.discountedPrice ?? p.price;
      return sum + price * simulatedSales(p.id);
    }, 0);
    return { total, active, bestSeller, totalRevenue };
  }, [packages]);

  // ── Filtered Packages ────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = [...packages];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(p => p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q));
    }
    if (categoryFilter !== 'all') {
      result = result.filter(p => p.category === categoryFilter);
    }
    if (statusFilter === 'active') result = result.filter(p => p.isActive);
    if (statusFilter === 'inactive') result = result.filter(p => !p.isActive);
    return result.sort((a, b) => a.sortOrder - b.sortOrder);
  }, [packages, search, categoryFilter, statusFilter]);

  // ── CRUD Handlers ────────────────────────────────────────────────────────────
  function openAdd() {
    setEditingPkg(null);
    setDialogOpen(true);
  }

  function openEdit(pkg: ExamPackage) {
    setEditingPkg(pkg);
    setDialogOpen(true);
  }

  function handleSave(form: FormState) {
    const now = new Date().toISOString();
    if (editingPkg) {
      updatePackage(editingPkg.id, {
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
        validityDays: Number(form.validityDays) || 365,
        includedExams: form.includedExams,
        includedTests: Number(form.includedTests) || 0,
        includedPDFs: Number(form.includedPDFs) || 0,
        description: form.description.trim(),
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        updatedAt: now,
      });
      toast({ title: 'Package updated', description: `${form.name} has been updated.` });
    } else {
      const id = `pkg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      addPackage({
        id,
        name: form.name.trim(),
        category: form.category,
        price: Number(form.price),
        discountedPrice: form.discountedPrice ? Number(form.discountedPrice) : undefined,
        validityDays: Number(form.validityDays) || 365,
        includedExams: form.includedExams,
        includedTests: Number(form.includedTests) || 0,
        includedPDFs: Number(form.includedPDFs) || 0,
        description: form.description.trim(),
        isFeatured: form.isFeatured,
        sortOrder: Number(form.sortOrder) || 0,
        isActive: form.isActive,
        createdAt: now,
        updatedAt: now,
      });
      toast({ title: 'Package added', description: `${form.name} has been created.` });
    }
    setDialogOpen(false);
  }

  function handleDelete() {
    if (!deletingPkg) return;
    deletePackage(deletingPkg.id);
    toast({
      title: 'Package deleted',
      description: `${deletingPkg.name} has been removed.`,
      variant: 'destructive',
    });
    setDeletingPkg(null);
  }

  function toggleStatus(pkg: ExamPackage) {
    updatePackage(pkg.id, { isActive: !pkg.isActive });
    toast({
      title: pkg.isActive ? 'Package deactivated' : 'Package activated',
      description: `${pkg.name} is now ${pkg.isActive ? 'inactive' : 'active'}.`,
    });
  }

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background">
      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-screen-xl mx-auto">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground flex items-center gap-2.5">
              <span className="p-2 bg-indigo-100 dark:bg-indigo-900/40 rounded-xl">
                <Package className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
              </span>
              Exam Package Manager
            </h1>
            <p className="text-muted-foreground mt-1 ml-1">
              Control pricing for all category packages
            </p>
          </div>
          <Button
            onClick={openAdd}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 shrink-0"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Package
          </Button>
        </div>

        {/* ── KPI Strip ──────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            icon={Package}
            label="Total Packages"
            value={String(kpis.total)}
            sub={`${kpis.active} active`}
            accent="bg-indigo-500"
          />
          <KpiCard
            icon={CheckCircle2}
            label="Active Packages"
            value={String(kpis.active)}
            sub={`${kpis.total - kpis.active} inactive`}
            accent="bg-emerald-500"
          />
          <KpiCard
            icon={Sparkles}
            label="Best Seller"
            value={kpis.bestSeller?.name ?? '—'}
            sub={kpis.bestSeller ? `${kpis.bestSeller.includedTests} tests` : undefined}
            accent="bg-amber-500"
          />
          <KpiCard
            icon={TrendingUp}
            label="Total Revenue"
            value={formatINR(kpis.totalRevenue)}
            sub="simulated"
            accent="bg-violet-500"
          />
        </div>

        {/* ── Filter Bar ──────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search packages…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex gap-2 flex-wrap">
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-36">
                <Filter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map(c => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value={statusFilter}
              onValueChange={v => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>

            {/* View toggle */}
            <div className="flex rounded-lg border border-border overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                  viewMode === 'table'
                    ? 'bg-indigo-600 text-white'
                    : 'text-muted-foreground hover:text-foreground bg-background'
                }`}
              >
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">Table</span>
              </button>
              <button
                onClick={() => setViewMode('card')}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm transition-colors ${
                  viewMode === 'card'
                    ? 'bg-indigo-600 text-white'
                    : 'text-muted-foreground hover:text-foreground bg-background'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Cards</span>
              </button>
            </div>
          </div>
        </div>

        {/* Result count */}
        <div className="flex items-center gap-2 text-sm text-muted-foreground -mt-2">
          <span>
            Showing <strong className="text-foreground">{filtered.length}</strong> of{' '}
            <strong className="text-foreground">{packages.length}</strong> packages
          </span>
          {(search || categoryFilter !== 'all' || statusFilter !== 'all') && (
            <button
              onClick={() => { setSearch(''); setCategoryFilter('all'); setStatusFilter('all'); }}
              className="text-indigo-600 hover:text-indigo-800 dark:text-indigo-400 dark:hover:text-indigo-200 underline-offset-2 hover:underline text-xs"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* ── Empty State ─────────────────────────────────────────────────────── */}
        {filtered.length === 0 && (
          <Card className="border-dashed border-2 border-border/60">
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <div className="p-4 bg-indigo-50 dark:bg-indigo-900/20 rounded-full mb-4">
                <Package className="h-10 w-10 text-indigo-400" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-1">No packages found</h3>
              <p className="text-muted-foreground text-sm mb-5 max-w-xs">
                {packages.length === 0
                  ? 'Get started by creating your first exam category package.'
                  : 'No packages match your current filters. Try adjusting your search.'}
              </p>
              {packages.length === 0 && (
                <Button onClick={openAdd} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Package
                </Button>
              )}
            </CardContent>
          </Card>
        )}

        {/* ── TABLE VIEW ─────────────────────────────────────────────────────── */}
        {viewMode === 'table' && filtered.length > 0 && (
          <Card className="border border-border/60 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/40 hover:bg-muted/40">
                    <TableHead className="w-[220px]">Package Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Validity</TableHead>
                    <TableHead className="text-center">Tests</TableHead>
                    <TableHead className="text-center">PDFs</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-center">Featured</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.map(pkg => (
                    <TableRow
                      key={pkg.id}
                      className="hover:bg-muted/30 transition-colors group"
                    >
                      {/* Package Name */}
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-semibold text-foreground text-sm">
                            {pkg.name}
                          </span>
                          {pkg.description && (
                            <span className="text-xs text-muted-foreground line-clamp-1 max-w-[200px]">
                              {pkg.description}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Category */}
                      <TableCell>
                        <CategoryBadge category={pkg.category} />
                      </TableCell>

                      {/* Price */}
                      <TableCell>
                        <div className="flex flex-col">
                          {pkg.discountedPrice != null ? (
                            <>
                              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
                                {formatINR(pkg.discountedPrice)}
                              </span>
                              <span className="text-xs text-muted-foreground line-through">
                                {formatINR(pkg.price)}
                              </span>
                            </>
                          ) : (
                            <span className="text-sm font-bold text-foreground">
                              {formatINR(pkg.price)}
                            </span>
                          )}
                        </div>
                      </TableCell>

                      {/* Validity */}
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {pkg.validityDays >= 365
                            ? `${Math.round(pkg.validityDays / 365)}yr`
                            : `${pkg.validityDays}d`}
                        </span>
                      </TableCell>

                      {/* Tests */}
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{pkg.includedTests}</span>
                      </TableCell>

                      {/* PDFs */}
                      <TableCell className="text-center">
                        <span className="text-sm font-medium">{pkg.includedPDFs}</span>
                      </TableCell>

                      {/* Status */}
                      <TableCell className="text-center">
                        <button
                          onClick={() => toggleStatus(pkg)}
                          title="Click to toggle status"
                        >
                          {pkg.isActive ? (
                            <Badge className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 border-0 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/60 transition-colors">
                              Active
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="cursor-pointer hover:bg-muted transition-colors">
                              Inactive
                            </Badge>
                          )}
                        </button>
                      </TableCell>

                      {/* Featured */}
                      <TableCell className="text-center">
                        <Star
                          className={`h-4 w-4 mx-auto ${
                            pkg.isFeatured
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-muted-foreground/40'
                          }`}
                        />
                      </TableCell>

                      {/* Actions */}
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                            onClick={() => openEdit(pkg)}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                            onClick={() => setDeletingPkg(pkg)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        )}

        {/* ── CARD VIEW ──────────────────────────────────────────────────────── */}
        {viewMode === 'card' && filtered.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map(pkg => {
              const displayPrice = pkg.discountedPrice ?? pkg.price;
              const hasDiscount = pkg.discountedPrice != null;
              const visibleExams = pkg.includedExams.slice(0, 3);
              const remaining = pkg.includedExams.length - 3;

              return (
                <Card
                  key={pkg.id}
                  className={`relative border overflow-hidden hover:shadow-lg transition-shadow ${
                    pkg.isActive
                      ? 'border-border/60'
                      : 'border-border/40 opacity-75'
                  }`}
                >
                  {/* Featured ribbon */}
                  {pkg.isFeatured && (
                    <div className="absolute top-3 right-3 z-10">
                      <span className="flex items-center gap-1 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        <Star className="h-2.5 w-2.5 fill-current" />
                        Featured
                      </span>
                    </div>
                  )}

                  <CardContent className="p-4 space-y-3">
                    {/* Header */}
                    <div className="pr-14">
                      <p className="font-bold text-foreground text-base leading-tight">
                        {pkg.name}
                      </p>
                      <div className="mt-1">
                        <CategoryBadge category={pkg.category} />
                      </div>
                    </div>

                    {/* Price */}
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">
                        {formatINR(displayPrice)}
                      </span>
                      {hasDiscount && (
                        <span className="text-sm text-muted-foreground line-through">
                          {formatINR(pkg.price)}
                        </span>
                      )}
                    </div>

                    {/* Validity */}
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <CalendarDays className="h-3.5 w-3.5" />
                      <span>
                        Valid for{' '}
                        {pkg.validityDays >= 365
                          ? `${Math.round(pkg.validityDays / 365)} year`
                          : `${pkg.validityDays} days`}
                      </span>
                    </div>

                    {/* Included exams tags */}
                    {pkg.includedExams.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {visibleExams.map(exam => (
                          <span
                            key={exam}
                            className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded"
                          >
                            {exam}
                          </span>
                        ))}
                        {remaining > 0 && (
                          <span className="text-[10px] bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded font-medium">
                            +{remaining} more
                          </span>
                        )}
                      </div>
                    )}

                    {/* Tests + PDFs */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground border-t border-border/50 pt-2">
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {pkg.includedTests} Tests
                      </span>
                      <span className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {pkg.includedPDFs} PDFs
                      </span>
                    </div>

                    {/* Footer: Status toggle + Edit */}
                    <div className="flex items-center justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={pkg.isActive}
                          onCheckedChange={() => toggleStatus(pkg)}
                          className="scale-75"
                        />
                        <span className="text-xs text-muted-foreground">
                          {pkg.isActive ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                              <CheckCircle2 className="h-3 w-3" /> Active
                            </span>
                          ) : (
                            <span className="flex items-center gap-1">
                              <XCircle className="h-3 w-3" /> Inactive
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-900/30"
                          onClick={() => openEdit(pkg)}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/30"
                          onClick={() => setDeletingPkg(pkg)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add / Edit Dialog ─────────────────────────────────────────────────── */}
      <PackageFormDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        editing={editingPkg}
        onSave={handleSave}
      />

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deletingPkg} onOpenChange={v => !v && setDeletingPkg(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-rose-500" />
              Delete Package
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete{' '}
              <span className="font-semibold text-foreground">
                {deletingPkg?.name}
              </span>
              ? This action cannot be undone and students will lose access if they have an
              active subscription.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-rose-600 hover:bg-rose-700 text-white"
            >
              Delete Package
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
