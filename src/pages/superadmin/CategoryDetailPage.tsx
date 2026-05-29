/**
 * CategoryDetailPage — Banking & Insurance (and any category) detail view.
 *
 * Architecture:
 * - SECTION 1 : Popular Exams — curated subset, drag-to-reorder, derived from isPopular flag
 * - SECTION 2 : All Exams     — master database, grid/list toggle, filters, sort, Mark as Popular
 *
 * Student stats (Registered, Primary, Secondary, Backup) are simulated deterministically
 * from exam ID until real backend data is available.
 */

import React, { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowLeft, Plus, Download, Upload, Star, StarOff,
  LayoutGrid, List, Search, Filter, SortAsc, ChevronRight,
  GripVertical, X, Pencil, Trash2, Eye, EyeOff,
  MoreVertical, BarChart3, Target, Users, TrendingUp,
  BookOpen, GraduationCap, Layers, AlertTriangle,
  ChevronUp, ChevronDown,
} from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useExamCatalog, type CatalogExam, type CatalogCategory } from '@/hooks/useExamCatalog';
import { cn } from '@/lib/utils';

// ─── Deterministic mock stats ─────────────────────────────────────────────────
// Generates realistic, stable numbers from exam ID string so they don't flicker.

const hashCode = (str: string): number => {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
};

const examStats = (examId: string) => {
  const h = hashCode(examId);
  const registered = 5000 + (h % 20000);
  const primary = Math.floor(registered * (0.35 + (h % 100) / 500));
  const secondary = Math.floor(registered * (0.15 + ((h >> 4) % 100) / 500));
  const backup = Math.floor(registered * (0.05 + ((h >> 8) % 100) / 1000));
  return { registered, primary, secondary, backup };
};

const fmtNum = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n);

// ─── Status helper ────────────────────────────────────────────────────────────

type ExamStatus = 'live' | 'upcoming' | 'hidden';

const examStatus = (exam: CatalogExam & { isVisible?: boolean }): ExamStatus => {
  if ((exam as any).isVisible === false) return 'hidden';
  const h = hashCode(exam.id + 'status');
  return h % 10 < 7 ? 'live' : 'upcoming';
};

const StatusBadge = ({ status }: { status: ExamStatus }) => {
  const map = {
    live: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    upcoming: 'bg-blue-50 text-blue-700 border-blue-200',
    hidden: 'bg-gray-100 text-gray-500 border-gray-200',
  } as const;
  const dot = {
    live: 'bg-emerald-500',
    upcoming: 'bg-blue-500',
    hidden: 'bg-gray-400',
  } as const;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full border font-semibold ${map[status]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot[status]}`} />
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
};

// ─── Collect all exams across all sections (deduplicated by ID) ───────────────

const collectAllExams = (cat: CatalogCategory): (CatalogExam & { sectionId: string; sectionName: string })[] => {
  const seen = new Set<string>();
  const result: (CatalogExam & { sectionId: string; sectionName: string })[] = [];
  for (const section of cat.sections) {
    // Skip the legacy "popular" section — we derive popular from isPopular flag
    for (const exam of section.exams) {
      if (!seen.has(exam.id)) {
        seen.add(exam.id);
        result.push({ ...exam, sectionId: section.id, sectionName: section.name });
      }
    }
  }
  return result;
};

// Find the "real" section for an exam (prefer non-popular sections)
const getPrimarySectionId = (cat: CatalogCategory, examId: string): string => {
  // prefer 'all' section or any non-'popular' section
  for (const s of cat.sections) {
    if (s.id !== 'popular' && s.exams.some(e => e.id === examId)) return s.id;
  }
  return cat.sections[0]?.id ?? 'all';
};

// ─── Exam Logo ────────────────────────────────────────────────────────────────

const ExamLogo = ({ logo, name, size = 'md' }: { logo: string; name: string; size?: 'sm' | 'md' | 'lg' }) => {
  const sz = size === 'lg' ? 'w-14 h-14' : size === 'sm' ? 'w-8 h-8' : 'w-10 h-10';
  const imgSz = size === 'lg' ? 'w-10 h-10' : size === 'sm' ? 'w-6 h-6' : 'w-7 h-7';
  return (
    <div className={`${sz} rounded-xl bg-gradient-to-br from-indigo-50 to-blue-50 border border-indigo-100 flex items-center justify-center flex-shrink-0 shadow-sm`}>
      {logo ? (
        <img src={logo} alt={name} className={`${imgSz} object-contain`}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
      ) : (
        <GraduationCap className={`${size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'} text-indigo-400`} />
      )}
    </div>
  );
};

// ─── POPULAR EXAMS STRIP (drag-to-reorder) ────────────────────────────────────

interface PopularExam extends CatalogExam {
  sectionId: string;
}

interface PopularStripProps {
  categoryId: string;
  popularExams: PopularExam[];
  onRemove: (examId: string) => void;
  onReorder: (orderedIds: string[]) => void;
  onAddClick: () => void;
}

const PopularStrip: React.FC<PopularStripProps> = ({
  categoryId, popularExams, onRemove, onReorder, onAddClick,
}) => {
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [items, setItems] = useState(popularExams);

  // Sync when parent changes
  React.useEffect(() => { setItems(popularExams); }, [popularExams]);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== draggingId) setDragOverId(id);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return; }
    const fromIndex = items.findIndex(i => i.id === draggingId);
    const toIndex = items.findIndex(i => i.id === targetId);
    const next = [...items];
    const [moved] = next.splice(fromIndex, 1);
    next.splice(toIndex, 0, moved);
    setItems(next);
    onReorder(next.map(i => i.id));
    setDraggingId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => { setDraggingId(null); setDragOverId(null); };

  if (popularExams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 border-2 border-dashed border-amber-200 rounded-xl bg-amber-50/30">
        <Star className="h-8 w-8 text-amber-300 mb-2" />
        <p className="text-sm font-semibold text-amber-700 mb-1">No popular exams selected</p>
        <p className="text-xs text-amber-600 mb-3">Mark exams as popular from the All Exams section below</p>
        <Button size="sm" variant="outline"
          className="gap-1.5 border-amber-300 text-amber-700 hover:bg-amber-50"
          onClick={onAddClick}>
          <Star className="h-3.5 w-3.5" /> Select Popular Exams
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {items.map((exam, idx) => {
          const isDragging = draggingId === exam.id;
          const isOver = dragOverId === exam.id;
          return (
            <div
              key={exam.id}
              draggable
              onDragStart={(e) => handleDragStart(e, exam.id)}
              onDragOver={(e) => handleDragOver(e, exam.id)}
              onDrop={(e) => handleDrop(e, exam.id)}
              onDragEnd={handleDragEnd}
              className={cn(
                'group flex items-center gap-2 px-3 py-2 rounded-xl border bg-white shadow-sm transition-all cursor-grab active:cursor-grabbing select-none',
                isDragging && 'opacity-40 scale-95',
                isOver && 'border-amber-400 bg-amber-50 shadow-md scale-105',
                !isDragging && !isOver && 'border-amber-200 hover:border-amber-400 hover:shadow-md',
              )}
            >
              {/* Rank badge */}
              <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold flex items-center justify-center flex-shrink-0">
                {idx + 1}
              </span>
              {/* Drag handle */}
              <GripVertical className="h-4 w-4 text-amber-300 flex-shrink-0" />
              {/* Logo */}
              <ExamLogo logo={exam.logo} name={exam.name} size="sm" />
              {/* Name */}
              <span className="text-xs font-semibold text-gray-800 max-w-[100px] truncate">{exam.name}</span>
              {/* Remove */}
              <button
                onClick={() => onRemove(exam.id)}
                className="ml-1 h-4 w-4 rounded-full bg-gray-100 text-gray-400 hover:bg-red-100 hover:text-red-500 flex items-center justify-center transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0"
                title="Remove from Popular"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          );
        })}

        {/* Add slot */}
        <button
          onClick={onAddClick}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border-2 border-dashed border-amber-200 text-amber-600 text-xs font-medium hover:border-amber-400 hover:bg-amber-50 transition-all"
        >
          <Plus className="h-3.5 w-3.5" /> Add
        </button>
      </div>

      <p className="text-[11px] text-amber-700/70 flex items-center gap-1">
        <GripVertical className="h-3.5 w-3.5" />
        Drag to reorder · Students see exams in this exact order on the homepage
      </p>
    </div>
  );
};

// ─── EXAM GRID CARD ───────────────────────────────────────────────────────────

interface ExamCardProps {
  exam: CatalogExam & { sectionId: string; sectionName: string };
  categoryId: string;
  onMarkPopular: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: () => void;
}

const ExamGridCard: React.FC<ExamCardProps> = ({
  exam, categoryId, onMarkPopular, onEdit, onDelete, onNavigate,
}) => {
  const stats = examStats(exam.id);
  const status = examStatus(exam);

  return (
    <div className={cn(
      'group relative bg-white border rounded-2xl p-4 hover:shadow-lg transition-all duration-200 cursor-pointer',
      exam.isPopular ? 'border-amber-200 shadow-amber-50 shadow-md' : 'border-gray-100 hover:border-indigo-200',
    )}
      onClick={onNavigate}
    >
      {/* Popular badge */}
      {exam.isPopular && (
        <div className="absolute top-3 right-3">
          <span className="inline-flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-bold">
            <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" /> Popular
          </span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <ExamLogo logo={exam.logo} name={exam.name} size="md" />
        <div className="min-w-0 flex-1">
          <p className="font-bold text-sm text-gray-800 truncate pr-12 group-hover:text-indigo-700 transition-colors">
            {exam.name}
          </p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{exam.sectionName}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-1.5 mb-3">
        <div className="bg-indigo-50 rounded-lg px-2 py-1.5">
          <div className="text-xs font-bold text-indigo-700">{fmtNum(stats.registered)}</div>
          <div className="text-[9px] text-indigo-500 uppercase font-medium">Registered</div>
        </div>
        <div className="bg-emerald-50 rounded-lg px-2 py-1.5">
          <div className="text-xs font-bold text-emerald-700">{fmtNum(stats.primary)}</div>
          <div className="text-[9px] text-emerald-500 uppercase font-medium">Primary</div>
        </div>
        <div className="bg-blue-50 rounded-lg px-2 py-1.5">
          <div className="text-xs font-bold text-blue-700">{fmtNum(stats.secondary)}</div>
          <div className="text-[9px] text-blue-500 uppercase font-medium">Secondary</div>
        </div>
        <div className="bg-orange-50 rounded-lg px-2 py-1.5">
          <div className="text-xs font-bold text-orange-700">{fmtNum(stats.backup)}</div>
          <div className="text-[9px] text-orange-500 uppercase font-medium">Backup</div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2" onClick={(e) => e.stopPropagation()}>
        <StatusBadge status={status} />
        <div className="flex items-center gap-1">
          <button
            className={cn(
              'h-7 w-7 flex items-center justify-center rounded-lg transition-all',
              exam.isPopular
                ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
                : 'text-gray-400 hover:text-amber-500 hover:bg-amber-50',
            )}
            title={exam.isPopular ? 'Remove from Popular' : 'Mark as Popular'}
            onClick={onMarkPopular}
          >
            <Star className={cn('h-3.5 w-3.5', exam.isPopular && 'fill-amber-500')} />
          </button>
          <button
            className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"
            title="Edit"
            onClick={onEdit}
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-all">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onNavigate}>
                <BarChart3 className="h-3.5 w-3.5 mr-2" /> View Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
};

// ─── EXAM LIST ROW ────────────────────────────────────────────────────────────

interface ExamListRowProps {
  exam: CatalogExam & { sectionId: string; sectionName: string };
  rank: number;
  categoryId: string;
  onMarkPopular: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onNavigate: () => void;
  selected: boolean;
  onSelect: (v: boolean) => void;
}

const ExamListRow: React.FC<ExamListRowProps> = ({
  exam, rank, onMarkPopular, onEdit, onDelete, onNavigate, selected, onSelect,
}) => {
  const stats = examStats(exam.id);
  const status = examStatus(exam);

  return (
    <tr
      className={cn(
        'group border-b border-gray-50 hover:bg-indigo-50/30 transition-colors cursor-pointer',
        selected && 'bg-indigo-50',
      )}
    >
      <td className="px-4 py-3 w-10" onClick={(e) => e.stopPropagation()}>
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(e.target.checked)}
          className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
        />
      </td>
      <td className="px-4 py-3" onClick={onNavigate}>
        <div className="flex items-center gap-3">
          <ExamLogo logo={exam.logo} name={exam.name} size="sm" />
          <div>
            <p className="text-sm font-semibold text-gray-800 group-hover:text-indigo-700 transition-colors">
              {exam.name}
            </p>
            <p className="text-[11px] text-muted-foreground">{exam.sectionName}</p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-center" onClick={onNavigate}>
        <span className="font-bold text-indigo-700">{stats.registered.toLocaleString()}</span>
        <div className="text-[10px] text-green-600">+{Math.floor(stats.registered * 0.05).toLocaleString()} this week</div>
      </td>
      <td className="px-4 py-3 text-sm text-center" onClick={onNavigate}>
        <span className="font-semibold text-emerald-700">{stats.primary.toLocaleString()}</span>
        <div className="text-[10px] text-muted-foreground">{Math.round(stats.primary / stats.registered * 100)}%</div>
      </td>
      <td className="px-4 py-3 text-sm text-center" onClick={onNavigate}>
        <span className="font-semibold text-blue-700">{stats.secondary.toLocaleString()}</span>
        <div className="text-[10px] text-muted-foreground">{Math.round(stats.secondary / stats.registered * 100)}%</div>
      </td>
      <td className="px-4 py-3 text-sm text-center" onClick={onNavigate}>
        <span className="font-semibold text-orange-700">{stats.backup.toLocaleString()}</span>
        <div className="text-[10px] text-muted-foreground">{Math.round(stats.backup / stats.registered * 100)}%</div>
      </td>
      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
        <button
          className={cn(
            'p-1.5 rounded-lg transition-all',
            exam.isPopular
              ? 'text-amber-500 bg-amber-50 hover:bg-amber-100'
              : 'text-gray-300 hover:text-amber-500 hover:bg-amber-50',
          )}
          onClick={onMarkPopular}
          title={exam.isPopular ? 'Remove from Popular' : 'Mark as Popular'}
        >
          <Star className={cn('h-4 w-4', exam.isPopular && 'fill-amber-500')} />
        </button>
      </td>
      <td className="px-4 py-3" onClick={onNavigate}>
        <StatusBadge status={status} />
      </td>
      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-1">
          <button
            className="h-7 px-2.5 flex items-center gap-1 rounded-lg text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-all"
            onClick={onEdit}
          >
            <Pencil className="h-3 w-3" /> Edit
          </button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="h-7 w-7 flex items-center justify-center rounded-lg text-gray-400 hover:bg-gray-100 transition-all">
                <MoreVertical className="h-3.5 w-3.5" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={onNavigate}>
                <BarChart3 className="h-3.5 w-3.5 mr-2" /> View Analytics
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-red-600 focus:text-red-600">
                <Trash2 className="h-3.5 w-3.5 mr-2" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </td>
    </tr>
  );
};

// ─── Sort helper ──────────────────────────────────────────────────────────────

type SortKey = 'most-registered' | 'least-registered' | 'alphabetical' | 'popular-first';

const sortExams = (
  exams: (CatalogExam & { sectionId: string; sectionName: string })[],
  key: SortKey,
) => {
  const copy = [...exams];
  switch (key) {
    case 'most-registered':
      return copy.sort((a, b) => examStats(b.id).registered - examStats(a.id).registered);
    case 'least-registered':
      return copy.sort((a, b) => examStats(a.id).registered - examStats(b.id).registered);
    case 'alphabetical':
      return copy.sort((a, b) => a.name.localeCompare(b.name));
    case 'popular-first':
      return copy.sort((a, b) => Number(b.isPopular) - Number(a.isPopular));
    default:
      return copy;
  }
};

// ─── MAIN PAGE ────────────────────────────────────────────────────────────────

const CategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    catalog, loading,
    toggleExamPopular, reorderPopularExams, removeExam,
  } = useExamCatalog();

  // ── View / Filter state ────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'live' | 'upcoming' | 'hidden'>('all');
  const [filterPopularity, setFilterPopularity] = useState<'all' | 'popular' | 'not-popular'>('all');
  const [sortKey, setSortKey] = useState<SortKey>('most-registered');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [popularExpanded, setPopularExpanded] = useState(true);
  const [allExpanded, setAllExpanded] = useState(true);

  // ── Delete confirmation ────────────────────────────────────────────────────
  const [deleteTarget, setDeleteTarget] = useState<{
    examId: string; sectionId: string; name: string;
  } | null>(null);

  // ─────────────────────────────────────────────────────────────────────────
  const category = useMemo(() => catalog.find(c => c.id === categoryId), [catalog, categoryId]);

  const allExams = useMemo(() => {
    if (!category) return [];
    return collectAllExams(category);
  }, [category]);

  // Popular exams — ordered by popularOrder, filtered to only isPopular ones
  const popularExams = useMemo(() => {
    if (!category) return [];
    const order = category.popularOrder ?? [];
    const popularSet = allExams.filter(e => e.isPopular);

    // Sort by popularOrder, unordered ones go to end
    return [...popularSet].sort((a, b) => {
      const ai = order.indexOf(a.id);
      const bi = order.indexOf(b.id);
      if (ai === -1 && bi === -1) return 0;
      if (ai === -1) return 1;
      if (bi === -1) return -1;
      return ai - bi;
    });
  }, [category, allExams]);

  // Filtered + sorted exam list for "All Exams" section
  const filteredExams = useMemo(() => {
    let result = allExams;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(e => e.name.toLowerCase().includes(q));
    }

    // Status filter
    if (filterStatus !== 'all') {
      result = result.filter(e => examStatus(e) === filterStatus);
    }

    // Popularity filter
    if (filterPopularity === 'popular') result = result.filter(e => e.isPopular);
    if (filterPopularity === 'not-popular') result = result.filter(e => !e.isPopular);

    return sortExams(result, sortKey);
  }, [allExams, search, filterStatus, filterPopularity, sortKey]);

  // ── Aggregate stats ────────────────────────────────────────────────────────
  const aggStats = useMemo(() => {
    const totals = { registered: 0, primary: 0, secondary: 0, backup: 0 };
    for (const e of allExams) {
      const s = examStats(e.id);
      totals.registered += s.registered;
      totals.primary += s.primary;
      totals.secondary += s.secondary;
      totals.backup += s.backup;
    }
    return totals;
  }, [allExams]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleMarkPopular = useCallback((examId: string, name: string, currentlyPopular: boolean) => {
    if (!categoryId) return;
    toggleExamPopular(categoryId, examId);
    toast({
      title: currentlyPopular ? `Removed from Popular` : `⭐ Marked as Popular`,
      description: name,
    });
  }, [categoryId, toggleExamPopular, toast]);

  const handleReorder = useCallback((orderedIds: string[]) => {
    if (!categoryId) return;
    reorderPopularExams(categoryId, orderedIds);
  }, [categoryId, reorderPopularExams]);

  const handleDeleteConfirm = () => {
    if (!deleteTarget || !categoryId) return;
    removeExam(categoryId, deleteTarget.sectionId, deleteTarget.examId);
    toast({ title: 'Exam deleted', description: deleteTarget.name, variant: 'destructive' });
    setDeleteTarget(null);
  };

  const navigateToExam = (exam: CatalogExam & { sectionId: string }) => {
    navigate(`/super-admin/test-catalog/${categoryId}/${exam.sectionId}/${exam.id}`);
  };

  // ── Loading & not found ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin h-10 w-10 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="p-8 text-center">
        <BookOpen className="h-12 w-12 text-gray-200 mx-auto mb-3" />
        <p className="text-muted-foreground">Category not found.</p>
        <Button variant="outline" className="mt-4 gap-2" onClick={() => navigate('/super-admin/test-catalog')}>
          <ArrowLeft className="h-4 w-4" /> Back to Catalog
        </Button>
      </div>
    );
  }

  const liveCount = allExams.filter(e => examStatus(e) === 'live').length;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">

      {/* ── Breadcrumb ──────────────────────────────────────────────────────── */}
      <nav className="flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/super-admin/test-catalog" className="hover:text-foreground transition-colors">
          Test Catalog
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-semibold">{category.name}</span>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 shadow-xl">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

        {/* Top bar */}
        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-6 pt-5 pb-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/super-admin/test-catalog')}
              className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black text-white">{category.name}</h1>
                <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Live
                </span>
              </div>
              <p className="text-sm text-white/70 mt-0.5">
                Manage exams, select popular, and control student-facing display
              </p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
            <Button size="sm" variant="outline"
              className="gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20 h-8 text-xs">
              <Download className="h-3.5 w-3.5" /> Export CSV
            </Button>
            <Button size="sm" variant="outline"
              className="gap-1.5 bg-white/10 border-white/30 text-white hover:bg-white/20 h-8 text-xs">
              <Upload className="h-3.5 w-3.5" /> Import
            </Button>
            <Button size="sm"
              className="gap-1.5 bg-white text-indigo-700 hover:bg-white/90 font-semibold h-8 text-xs shadow"
              onClick={() => navigate(`/super-admin/test-catalog`)}>
              <Plus className="h-3.5 w-3.5" /> Add Exam
            </Button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="relative grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-px bg-white/10 border-t border-white/10 mt-2">
          {[
            { label: 'Total Exams', value: allExams.length, icon: BookOpen },
            { label: 'Popular', value: popularExams.length, icon: Star },
            { label: 'Total Students', value: fmtNum(aggStats.registered), icon: Users },
            { label: 'Primary Goal', value: fmtNum(aggStats.primary), icon: Target },
            { label: 'Secondary Goal', value: fmtNum(aggStats.secondary), icon: TrendingUp },
            { label: 'Backup Goal', value: fmtNum(aggStats.backup), icon: GraduationCap },
          ].map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-center gap-2.5 px-4 py-3 bg-white/5 hover:bg-white/10 transition-colors">
              <Icon className="h-4 w-4 text-white/60 flex-shrink-0" />
              <div>
                <div className="text-base font-black text-white">{value}</div>
                <div className="text-[10px] text-white/60 uppercase tracking-wide">{label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 1 — POPULAR EXAMS
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="bg-white rounded-2xl border border-amber-100 shadow-sm overflow-hidden">
        {/* Section header */}
        <button
          className="w-full flex items-center justify-between px-5 py-4 hover:bg-amber-50/50 transition-colors"
          onClick={() => setPopularExpanded(v => !v)}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shadow-sm">
              <Star className="h-4.5 w-4.5 text-white" fill="white" />
            </div>
            <div className="text-left">
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-gray-900">Popular Exams</h2>
                <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-bold border border-amber-200">
                  {popularExams.length} selected
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Manually curated · Shown first on student homepage · Drag to reorder
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-amber-600 hidden sm:block">
              {popularExpanded ? 'Collapse' : 'Expand'}
            </span>
            {popularExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </button>

        {popularExpanded && (
          <div className="px-5 pb-5 border-t border-amber-50">
            <div className="mt-4">
              <PopularStrip
                categoryId={categoryId ?? ''}
                popularExams={popularExams}
                onRemove={(id) => {
                  const exam = allExams.find(e => e.id === id);
                  if (exam) handleMarkPopular(id, exam.name, true);
                }}
                onReorder={handleReorder}
                onAddClick={() => {
                  // Scroll to All Exams section
                  document.getElementById('all-exams-section')?.scrollIntoView({ behavior: 'smooth' });
                  setFilterPopularity('not-popular');
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          SECTION 2 — ALL EXAMS (master database)
      ══════════════════════════════════════════════════════════════════════ */}
      <div id="all-exams-section" className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">

        {/* Section header */}
        <div className="px-5 py-4 border-b border-gray-100">
          <button
            className="w-full flex items-center justify-between hover:opacity-80 transition-opacity mb-0"
            onClick={() => setAllExpanded(v => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-sm">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900">All {category.name} Exams</h2>
                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-bold border border-indigo-200">
                    {allExams.length} exams
                  </span>
                  <span className="inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-bold border border-emerald-200">
                    {liveCount} live
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Master database · Mark exams as ⭐ Popular to feature them above
                </p>
              </div>
            </div>
            {allExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            )}
          </button>
        </div>

        {allExpanded && (
          <>
            {/* Filter / Sort / View toolbar */}
            <div className="px-5 py-3 bg-gray-50/50 border-b border-gray-100 flex flex-wrap items-center gap-2">
              {/* Search */}
              <div className="relative flex-1 min-w-[160px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search exams by name…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-9 h-8 text-sm border-gray-200 bg-white"
                />
              </div>

              {/* Status filter */}
              <Select value={filterStatus} onValueChange={(v) => setFilterStatus(v as any)}>
                <SelectTrigger className="h-8 w-36 text-xs border-gray-200 bg-white">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="live">🟢 Live</SelectItem>
                  <SelectItem value="upcoming">🔵 Upcoming</SelectItem>
                  <SelectItem value="hidden">⚪ Hidden</SelectItem>
                </SelectContent>
              </Select>

              {/* Popularity filter */}
              <Select value={filterPopularity} onValueChange={(v) => setFilterPopularity(v as any)}>
                <SelectTrigger className="h-8 w-36 text-xs border-gray-200 bg-white">
                  <SelectValue placeholder="All Exams" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Exams</SelectItem>
                  <SelectItem value="popular">⭐ Popular</SelectItem>
                  <SelectItem value="not-popular">Not Popular</SelectItem>
                </SelectContent>
              </Select>

              {/* Sort */}
              <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
                <SelectTrigger className="h-8 w-44 text-xs border-gray-200 bg-white">
                  <SortAsc className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="most-registered">Most Registered</SelectItem>
                  <SelectItem value="least-registered">Least Registered</SelectItem>
                  <SelectItem value="alphabetical">Alphabetical</SelectItem>
                  <SelectItem value="popular-first">Popular First</SelectItem>
                </SelectContent>
              </Select>

              {/* Clear filters */}
              {(search || filterStatus !== 'all' || filterPopularity !== 'all') && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 text-xs gap-1 text-muted-foreground hover:text-foreground"
                  onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPopularity('all'); }}
                >
                  <X className="h-3 w-3" /> Clear
                </Button>
              )}

              {/* Spacer */}
              <div className="flex-1" />

              {/* View toggle */}
              <div className="flex items-center rounded-lg border border-gray-200 bg-white p-0.5">
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    viewMode === 'grid'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <LayoutGrid className="h-3.5 w-3.5" /> Grid
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all',
                    viewMode === 'list'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <List className="h-3.5 w-3.5" /> List
                </button>
              </div>
            </div>

            {/* Results info */}
            {filteredExams.length < allExams.length && (
              <div className="px-5 py-2 bg-indigo-50/50 border-b border-indigo-100">
                <p className="text-xs text-indigo-700">
                  Showing <strong>{filteredExams.length}</strong> of <strong>{allExams.length}</strong> exams
                </p>
              </div>
            )}

            {/* ─── Grid View ──────────────────────────────────────────────────── */}
            {viewMode === 'grid' && (
              <div className="p-5">
                {filteredExams.length === 0 ? (
                  <div className="text-center py-14 border-2 border-dashed border-gray-100 rounded-xl">
                    <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500">No exams match your filters</p>
                    <Button variant="outline" size="sm" className="mt-3"
                      onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPopularity('all'); }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {filteredExams.map((exam) => (
                      <ExamGridCard
                        key={exam.id}
                        exam={exam}
                        categoryId={categoryId ?? ''}
                        onMarkPopular={() => handleMarkPopular(exam.id, exam.name, exam.isPopular)}
                        onEdit={() => navigate(`/super-admin/test-catalog/${categoryId}/${exam.sectionId}/${exam.id}`)}
                        onDelete={() => setDeleteTarget({ examId: exam.id, sectionId: exam.sectionId, name: exam.name })}
                        onNavigate={() => navigateToExam(exam)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ─── List View ──────────────────────────────────────────────────── */}
            {viewMode === 'list' && (
              <div className="overflow-x-auto">
                {filteredExams.length === 0 ? (
                  <div className="text-center py-14 border-2 border-dashed border-gray-100 rounded-xl m-5">
                    <BookOpen className="h-10 w-10 text-gray-200 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-gray-500">No exams match your filters</p>
                    <Button variant="outline" size="sm" className="mt-3"
                      onClick={() => { setSearch(''); setFilterStatus('all'); setFilterPopularity('all'); }}>
                      Clear Filters
                    </Button>
                  </div>
                ) : (
                  <table className="w-full min-w-[900px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-100">
                        <th className="px-4 py-3 w-10">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) setSelectedIds(new Set(filteredExams.map(ex => ex.id)));
                              else setSelectedIds(new Set());
                            }}
                            checked={selectedIds.size === filteredExams.length && filteredExams.length > 0}
                            className="rounded border-gray-300 text-indigo-600"
                          />
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Exam Name
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center gap-1">
                            <Users className="h-3.5 w-3.5" /> Registered
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-emerald-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center gap-1">
                            <Target className="h-3.5 w-3.5" /> Primary
                          </div>
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">
                          Secondary
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-orange-600 uppercase tracking-wider">
                          Backup
                        </th>
                        <th className="px-4 py-3 text-center text-xs font-bold text-amber-600 uppercase tracking-wider">
                          <div className="flex items-center justify-center gap-1">
                            <Star className="h-3.5 w-3.5" /> Popular
                          </div>
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {filteredExams.map((exam, idx) => (
                        <ExamListRow
                          key={exam.id}
                          exam={exam}
                          rank={idx + 1}
                          categoryId={categoryId ?? ''}
                          onMarkPopular={() => handleMarkPopular(exam.id, exam.name, exam.isPopular)}
                          onEdit={() => navigate(`/super-admin/test-catalog/${categoryId}/${exam.sectionId}/${exam.id}`)}
                          onDelete={() => setDeleteTarget({ examId: exam.id, sectionId: exam.sectionId, name: exam.name })}
                          onNavigate={() => navigateToExam(exam)}
                          selected={selectedIds.has(exam.id)}
                          onSelect={(v) => {
                            const next = new Set(selectedIds);
                            if (v) next.add(exam.id); else next.delete(exam.id);
                            setSelectedIds(next);
                          }}
                        />
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            )}

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div className="px-5 py-3 bg-indigo-50 border-t border-indigo-100 flex items-center gap-3">
                <span className="text-xs font-semibold text-indigo-700">
                  {selectedIds.size} exam{selectedIds.size !== 1 ? 's' : ''} selected
                </span>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-amber-300 text-amber-700 hover:bg-amber-50"
                  onClick={() => {
                    selectedIds.forEach(id => {
                      const exam = allExams.find(e => e.id === id);
                      if (exam && !exam.isPopular) toggleExamPopular(categoryId!, id);
                    });
                    toast({ title: `⭐ ${selectedIds.size} exams marked as Popular` });
                    setSelectedIds(new Set());
                  }}>
                  <Star className="h-3 w-3" /> Mark Popular
                </Button>
                <Button size="sm" variant="outline" className="h-7 text-xs gap-1 border-red-200 text-red-600 hover:bg-red-50"
                  onClick={() => setSelectedIds(new Set())}>
                  Deselect
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ── Delete Confirmation ──────────────────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>🗑️ Delete Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete <strong>{deleteTarget?.name}</strong>.
              Students will no longer see it. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDeleteConfirm}
            >
              Yes, Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
};

export default CategoryDetailPage;
