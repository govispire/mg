import React, { useState, useId } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
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
import { useToast } from '@/hooks/use-toast';
import {
    Plus, Pencil, Trash2, Eye, EyeOff, BookOpen,
    ChevronRight, Layers, GraduationCap, RefreshCw,
    Search, Star, Image as ImageIcon,
} from 'lucide-react';
import { useExamCatalog, type CatalogCategory, type CatalogSection, type CatalogExam } from '@/hooks/useExamCatalog';
import { cn } from '@/lib/utils';

// ─── Small reusable helpers ───────────────────────────────────────────────────

const StatBadge = ({ count, label, color }: { count: number; label: string; color: string }) => (
    <div className={`text-center px-3 py-2 rounded-lg ${color}`}>
        <div className="text-lg font-bold">{count}</div>
        <div className="text-xs text-gray-600 uppercase tracking-wide">{label}</div>
    </div>
);

// ─── Category Form ────────────────────────────────────────────────────────────

interface CategoryFormData {
    id: string;
    name: string;
    description: string;
    logo: string;
    studentsEnrolled: number;
    examsAvailable: number;
    colorClass: string;
    isPopular: boolean;
    isVisible: boolean;
}

const defaultCatForm = (): CategoryFormData => ({
    id: '',
    name: '',
    description: '',
    logo: '',
    studentsEnrolled: 0,
    examsAvailable: 0,
    colorClass: 'bg-blue-50 border-blue-200',
    isPopular: false,
    isVisible: true,
});

// ─── Section Form ─────────────────────────────────────────────────────────────

interface SectionFormData {
    id: string;
    name: string;
    description: string;
}

const defaultSectionForm = (): SectionFormData => ({ id: '', name: '', description: '' });

// ─── Exam Form ────────────────────────────────────────────────────────────────

interface ExamFormData {
    id: string;
    name: string;
    logo: string;
    isPopular: boolean;
}

const defaultExamForm = (): ExamFormData => ({ id: '', name: '', logo: '', isPopular: false });

// ─── LogoPicker ─────────────────────────────────────────────────────────────

interface LogoPickerProps {
    value: string;
    onChange: (v: string) => void;
    id: string;
}

const LogoPicker: React.FC<LogoPickerProps> = ({ value, onChange, id }) => {
    const [mode, setMode] = React.useState<'url' | 'file'>(value.startsWith('data:') ? 'file' : 'url');
    const fileRef = React.useRef<HTMLInputElement>(null);

    const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (ev) => onChange(ev.target?.result as string);
        reader.readAsDataURL(file);
    };

    return (
        <div className="space-y-2">
            <div className="flex gap-2">
                <button
                    type="button"
                    onClick={() => setMode('url')}
                    className={`text-xs px-3 py-1 rounded-md border transition-all ${mode === 'url' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                >🔗 URL</button>
                <button
                    type="button"
                    onClick={() => { setMode('file'); setTimeout(() => fileRef.current?.click(), 50); }}
                    className={`text-xs px-3 py-1 rounded-md border transition-all ${mode === 'file' ? 'bg-primary text-white border-primary' : 'bg-white border-gray-200 text-gray-600'
                        }`}
                >📁 Upload</button>
                {value && (
                    <button
                        type="button"
                        onClick={() => { onChange(''); if (fileRef.current) fileRef.current.value = ''; }}
                        className="text-xs px-2 py-1 rounded-md border border-red-200 text-red-500 hover:bg-red-50 transition-all ml-auto"
                    >✕ Clear</button>
                )}
            </div>

            {mode === 'url' ? (
                <Input
                    id={id}
                    value={value.startsWith('data:') ? '' : value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="https://example.com/logo.png"
                />
            ) : (
                <div
                    className="flex items-center justify-center border-2 border-dashed rounded-lg p-3 cursor-pointer hover:border-primary transition-colors bg-gray-50"
                    onClick={() => fileRef.current?.click()}
                >
                    <input
                        ref={fileRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFile}
                    />
                    {value.startsWith('data:') ? (
                        <span className="text-xs text-green-600 font-medium">✓ Image uploaded — click to change</span>
                    ) : (
                        <span className="text-xs text-muted-foreground">Click to select an image from your device</span>
                    )}
                </div>
            )}

            {value && (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border">
                    <img
                        src={value}
                        alt="preview"
                        className="h-12 w-12 object-contain rounded border bg-white flex-shrink-0"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                    />
                    <span className="text-xs text-muted-foreground truncate">
                        {value.startsWith('data:') ? 'Local image (stored as base64)' : value}
                    </span>
                </div>
            )}
        </div>
    );
};

// ─── COLOR_OPTIONS ────────────────────────────────────────────────────────────

const COLOR_OPTIONS = [
    { label: 'Blue', value: 'bg-blue-50 border-blue-200' },
    { label: 'Green', value: 'bg-green-50 border-green-200' },
    { label: 'Yellow', value: 'bg-yellow-50 border-yellow-200' },
    { label: 'Red', value: 'bg-red-50 border-red-200' },
    { label: 'Purple', value: 'bg-purple-50 border-purple-200' },
    { label: 'Orange', value: 'bg-orange-50 border-orange-200' },
    { label: 'Teal', value: 'bg-teal-50 border-teal-200' },
    { label: 'Indigo', value: 'bg-indigo-50 border-indigo-200' },
];

// ─── Main Component ───────────────────────────────────────────────────────────

const TestCatalogManager: React.FC = () => {
    const navigate = useNavigate();
    const uid = useId();
    const { toast } = useToast();
    const {
        catalog, loading,
        addCategory, updateCategory, deleteCategory, toggleCategoryVisibility,
        addSection, updateSection, deleteSection,
        addExam, updateExam, removeExam,
        resetToDefaults,
    } = useExamCatalog();

    const [search, setSearch] = useState('');

    // ── Category dialog state ─────────────────────────────────────────────────
    const [catDialogOpen, setCatDialogOpen] = useState(false);
    const [catForm, setCatForm] = useState<CategoryFormData>(defaultCatForm());
    const [editingCatId, setEditingCatId] = useState<string | null>(null);

    // ── Section dialog state ──────────────────────────────────────────────────
    const [sectionDialogOpen, setSectionDialogOpen] = useState(false);
    const [sectionForm, setSectionForm] = useState<SectionFormData>(defaultSectionForm());
    const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
    const [activeCatForSection, setActiveCatForSection] = useState<string | null>(null);

    // ── Exam dialog state ─────────────────────────────────────────────────────
    const [examDialogOpen, setExamDialogOpen] = useState(false);
    const [examForm, setExamForm] = useState<ExamFormData>(defaultExamForm());
    const [activeCatForExam, setActiveCatForExam] = useState<string | null>(null);
    const [activeSectionForExam, setActiveSectionForExam] = useState<string | null>(null);
    const [editingExamId, setEditingExamId] = useState<string | null>(null);

    // ── Delete confirmation ───────────────────────────────────────────────────
    const [deleteTarget, setDeleteTarget] = useState<{
        type: 'category' | 'section' | 'exam';
        label: string;
        onConfirm: () => void;
    } | null>(null);

    // ── Hide confirmation ─────────────────────────────────────────────────────
    const [hideTarget, setHideTarget] = useState<{
        label: string;
        isCurrentlyVisible: boolean;
        onConfirm: () => void;
    } | null>(null);

    // ── Edit confirmation ─────────────────────────────────────────────────────
    const [editConfirmTarget, setEditConfirmTarget] = useState<{
        label: string;
        type: 'category' | 'section' | 'exam';
        onConfirm: () => void;
    } | null>(null);

    // ── Reset confirmation ────────────────────────────────────────────────────
    const [resetDialogOpen, setResetDialogOpen] = useState(false);

    // ─── Filtered catalog ─────────────────────────────────────────────────────
    const filteredCatalog = catalog.filter((c) =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase()),
    );

    // ─── Category dialog helpers ──────────────────────────────────────────────

    const openAddCategory = () => {
        setEditingCatId(null);
        setCatForm(defaultCatForm());
        setCatDialogOpen(true);
    };

    const openEditCategory = (cat: CatalogCategory) => {
        setEditingCatId(cat.id);
        setCatForm({
            id: cat.id,
            name: cat.name,
            description: cat.description,
            logo: cat.logo,
            studentsEnrolled: cat.studentsEnrolled,
            examsAvailable: cat.examsAvailable,
            colorClass: cat.colorClass,
            isPopular: cat.isPopular,
            isVisible: cat.isVisible,
        });
        setCatDialogOpen(true);
    };

    const handleSaveCategory = () => {
        if (!catForm.name.trim()) {
            toast({ title: 'Name required', variant: 'destructive' });
            return;
        }
        const id = editingCatId
            ? editingCatId
            : catForm.id.trim() || catForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

        if (editingCatId) {
            updateCategory(editingCatId, { ...catForm });
            toast({ title: '✅ Category updated', description: catForm.name });
        } else {
            addCategory({ ...catForm, id });
            toast({ title: '✅ Category created!', description: `"${catForm.name}" has been added to the catalog.` });
        }
        setCatDialogOpen(false);
    };

    // ─── Section dialog helpers ───────────────────────────────────────────────

    const openAddSection = (catId: string) => {
        setActiveCatForSection(catId);
        setEditingSectionId(null);
        setSectionForm(defaultSectionForm());
        setSectionDialogOpen(true);
    };

    const openEditSection = (catId: string, section: CatalogSection) => {
        setActiveCatForSection(catId);
        setEditingSectionId(section.id);
        setSectionForm({ id: section.id, name: section.name, description: section.description || '' });
        setSectionDialogOpen(true);
    };

    const handleSaveSection = () => {
        if (!sectionForm.name.trim() || !activeCatForSection) return;
        const id = editingSectionId
            ? editingSectionId
            : sectionForm.id.trim() || sectionForm.name.toLowerCase().replace(/\s+/g, '-');

        if (editingSectionId) {
            updateSection(activeCatForSection, editingSectionId, { name: sectionForm.name, description: sectionForm.description });
            toast({ title: 'Section updated' });
        } else {
            addSection(activeCatForSection, { id, name: sectionForm.name, description: sectionForm.description });
            toast({ title: 'Section added', description: sectionForm.name });
        }
        setSectionDialogOpen(false);
    };

    // ─── Exam dialog helpers ──────────────────────────────────────────────────

    const openAddExam = (catId: string, sectionId: string) => {
        setActiveCatForExam(catId);
        setActiveSectionForExam(sectionId);
        setEditingExamId(null);
        setExamForm(defaultExamForm());
        setExamDialogOpen(true);
    };

    const openEditExam = (catId: string, sectionId: string, exam: CatalogExam) => {
        setActiveCatForExam(catId);
        setActiveSectionForExam(sectionId);
        setEditingExamId(exam.id);
        setExamForm({ id: exam.id, name: exam.name, logo: exam.logo, isPopular: exam.isPopular });
        setExamDialogOpen(true);
    };

    const handleSaveExam = () => {
        if (!examForm.name.trim() || !activeCatForExam || !activeSectionForExam) return;
        if (editingExamId) {
            updateExam(activeCatForExam, activeSectionForExam, editingExamId, {
                name: examForm.name,
                logo: examForm.logo,
                isPopular: examForm.isPopular,
            });
            toast({ title: 'Exam updated', description: examForm.name });
            setExamDialogOpen(false);
        } else {
            const id = examForm.id.trim() || examForm.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            addExam(activeCatForExam, activeSectionForExam, { ...examForm, id });
            toast({ title: '✅ Exam created!', description: `"${examForm.name}" — loading exam manager…` });
            setExamDialogOpen(false);
            // Navigate immediately — localStorage was written synchronously
            navigate(`/super-admin/test-catalog/${activeCatForExam}/${activeSectionForExam}/${id}`);
        }
    };

    // ─── Derived stats ────────────────────────────────────────────────────────
    const visibleCount = catalog.filter((c) => c.isVisible).length;
    const totalSections = catalog.reduce((a, c) => a + c.sections.length, 0);
    const totalExams = catalog.reduce((a, c) => a + c.sections.reduce((b, s) => b + s.exams.length, 0), 0);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* ── Page Header ──────────────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <GraduationCap className="h-6 w-6 text-primary" />
                        Test Catalog Manager
                    </h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Create and manage exam categories and their sections. Changes reflect instantly in the student portal.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setResetDialogOpen(true)}
                        className="gap-2 text-muted-foreground"
                    >
                        <RefreshCw className="h-4 w-4" />
                        Reset
                    </Button>
                    <Button onClick={openAddCategory} className="gap-2" size="sm">
                        <Plus className="h-4 w-4" />
                        New Category
                    </Button>
                </div>
            </div>

            {/* ── Stats Bar ────────────────────────────────────────────────────────── */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatBadge count={catalog.length} label="Categories" color="bg-blue-50" />
                <StatBadge count={visibleCount} label="Visible" color="bg-green-50" />
                <StatBadge count={totalSections} label="Sections" color="bg-purple-50" />
                <StatBadge count={totalExams} label="Exams" color="bg-orange-50" />
            </div>

            {/* ── Preview note ─────────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 bg-primary/5 border border-primary/20 rounded-lg px-4 py-2 text-sm text-primary font-medium">
                <Eye className="h-4 w-4 shrink-0" />
                Student view at <span className="font-bold">/student/tests</span> updates live from this catalog.
                Hidden categories won't appear for students.
            </div>

            {/* ── Search ───────────────────────────────────────────────────────────── */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search categories…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9"
                />
            </div>

            {/* ── Category List ─────────────────────────────────────────────────────── */}
            {filteredCatalog.length === 0 ? (
                <div className="text-center py-16">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-muted-foreground">No categories found. Create one to get started.</p>
                </div>
            ) : (
                <Accordion type="multiple" className="space-y-3">
                    {filteredCatalog.map((cat) => {
                        const sectionCount = cat.sections.length;
                        const examCount = cat.sections.reduce((a, s) => a + s.exams.length, 0);

                        return (
                            <AccordionItem
                                key={cat.id}
                                value={cat.id}
                                className={cn(
                                    'border rounded-xl overflow-hidden shadow-sm transition-all',
                                    !cat.isVisible && 'opacity-60',
                                )}
                            >
                                {/* ── Category Header ───────────────────────── */}
                                <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-gray-50 [&>svg]:hidden">
                                    <div className="flex items-center gap-4 w-full min-w-0">
                                        {/* Logo */}
                                        <div className={`w-10 h-10 rounded-lg border-2 flex items-center justify-center flex-shrink-0 ${cat.colorClass}`}>
                                            {cat.logo ? (
                                                <img src={cat.logo} alt={cat.name} className="w-8 h-8 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                            ) : (
                                                <BookOpen className="h-5 w-5 text-gray-400" />
                                            )}
                                        </div>

                                        {/* Name & meta */}
                                        <div className="flex-1 min-w-0 text-left">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="font-semibold text-sm">{cat.name}</span>
                                                {cat.isPopular && (
                                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 bg-amber-100 text-amber-700">
                                                        <Star className="h-2.5 w-2.5 mr-0.5" />Popular
                                                    </Badge>
                                                )}
                                                {!cat.isVisible && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 text-gray-400">Hidden</Badge>
                                                )}
                                            </div>
                                            <p className="text-xs text-muted-foreground truncate mt-0.5">{cat.description}</p>
                                            <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                                                <span><Layers className="inline h-3 w-3 mr-0.5" />{sectionCount} section{sectionCount !== 1 ? 's' : ''}</span>
                                                <span><BookOpen className="inline h-3 w-3 mr-0.5" />{examCount} exam{examCount !== 1 ? 's' : ''}</span>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="flex items-center gap-1 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-amber-600"
                                                onClick={() => setHideTarget({
                                                    label: cat.name,
                                                    isCurrentlyVisible: cat.isVisible,
                                                    onConfirm: () => {
                                                        toggleCategoryVisibility(cat.id);
                                                        toast({ title: cat.isVisible ? `"${cat.name}" hidden from students` : `"${cat.name}" shown to students` });
                                                    },
                                                })}
                                                title={cat.isVisible ? 'Hide from students' : 'Show to students'}
                                            >
                                                {cat.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-primary"
                                                onClick={() => setEditConfirmTarget({
                                                    label: cat.name,
                                                    type: 'category',
                                                    onConfirm: () => openEditCategory(cat),
                                                })}
                                                title="Edit category"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                                                onClick={() =>
                                                    setDeleteTarget({
                                                        type: 'category',
                                                        label: cat.name,
                                                        onConfirm: () => deleteCategory(cat.id),
                                                    })
                                                }
                                                title="Delete category"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground ml-1 transition-transform accordion-open:rotate-90" />
                                        </div>
                                    </div>
                                </AccordionTrigger>

                                {/* ── Category Content: Sections ─────────────── */}
                                <AccordionContent className="px-5 pb-5">
                                    <div className="pt-3 border-t space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                                Sections
                                            </h3>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                className="h-7 text-xs gap-1"
                                                onClick={() => openAddSection(cat.id)}
                                            >
                                                <Plus className="h-3.5 w-3.5" /> Add Section
                                            </Button>
                                        </div>

                                        {cat.sections.length === 0 ? (
                                            <div className="text-center py-6 border-2 border-dashed rounded-lg">
                                                <Layers className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                                                <p className="text-xs text-muted-foreground">No sections yet. Add one above.</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-3">
                                                {cat.sections.map((section) => (
                                                    <div key={section.id} className="border rounded-lg overflow-hidden">
                                                        {/* Section header */}
                                                        <div className="px-4 py-3 bg-gray-50 flex items-center justify-between gap-3">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="text-sm font-semibold">{section.name}</p>
                                                                {section.description && (
                                                                    <p className="text-xs text-muted-foreground">{section.description}</p>
                                                                )}
                                                                <p className="text-xs text-muted-foreground mt-0.5">
                                                                    {section.exams.length} exam{section.exams.length !== 1 ? 's' : ''}
                                                                </p>
                                                            </div>
                                                            <div className="flex gap-1 shrink-0">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0"
                                                                    onClick={() => openEditSection(cat.id, section)}
                                                                >
                                                                    <Pencil className="h-3.5 w-3.5" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                                                                    onClick={() =>
                                                                        setDeleteTarget({
                                                                            type: 'section',
                                                                            label: section.name,
                                                                            onConfirm: () => deleteSection(cat.id, section.id),
                                                                        })
                                                                    }
                                                                >
                                                                    <Trash2 className="h-3.5 w-3.5" />
                                                                </Button>
                                                            </div>
                                                        </div>

                                                        {/* Exams list */}
                                                        <div className="p-3">
                                                            {section.exams.length === 0 ? (
                                                                <p className="text-xs text-muted-foreground py-2 text-center">
                                                                    No exams yet.
                                                                </p>
                                                            ) : (
                                                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 mb-2">
                                                                    {section.exams.map((exam) => (
                                                                        <div
                                                                            key={exam.id}
                                                                            className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 hover:border-primary hover:shadow-sm transition-all group"
                                                                        >
                                                                            {/* Clickable area → exam manager */}
                                                                            <button
                                                                                className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                                                                onClick={() =>
                                                                                    navigate(`/super-admin/test-catalog/${cat.id}/${section.id}/${exam.id}`)
                                                                                }
                                                                                title="Manage tests for this exam"
                                                                            >
                                                                                {exam.logo ? (
                                                                                    <img
                                                                                        src={exam.logo}
                                                                                        alt={exam.name}
                                                                                        className="w-7 h-7 object-contain flex-shrink-0"
                                                                                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                                                                    />
                                                                                ) : (
                                                                                    <div className="w-7 h-7 rounded bg-gray-100 flex items-center justify-center text-xs flex-shrink-0">📚</div>
                                                                                )}
                                                                                <div className="min-w-0">
                                                                                    <p className="text-xs font-semibold truncate group-hover:text-primary transition-colors">{exam.name}</p>
                                                                                    {exam.isPopular && <p className="text-[10px] text-amber-600 flex items-center gap-0.5"><Star className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />Popular</p>}
                                                                                    <p className="text-[10px] text-primary opacity-0 group-hover:opacity-100 transition-opacity">Manage Tests →</p>
                                                                                </div>
                                                                            </button>
                                                                            {/* Edit button */}
                                                                            <button
                                                                                className="shrink-0 text-gray-400 hover:text-primary transition-colors p-0.5"
                                                                                onClick={() => openEditExam(cat.id, section.id, exam)}
                                                                                title="Edit exam"
                                                                            >
                                                                                <Pencil className="h-3.5 w-3.5" />
                                                                            </button>
                                                                            {/* Delete button */}
                                                                            <button
                                                                                className="shrink-0 text-gray-300 hover:text-destructive transition-colors p-0.5"
                                                                                onClick={() =>
                                                                                    setDeleteTarget({
                                                                                        type: 'exam',
                                                                                        label: exam.name,
                                                                                        onConfirm: () => removeExam(cat.id, section.id, exam.id),
                                                                                    })
                                                                                }
                                                                                title="Delete exam"
                                                                            >
                                                                                <Trash2 className="h-3.5 w-3.5" />
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            )}
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                className="h-7 text-xs gap-1 text-primary hover:text-primary"
                                                                onClick={() => openAddExam(cat.id, section.id)}
                                                            >
                                                                <Plus className="h-3 w-3" /> Add Exam
                                                            </Button>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        );
                    })}
                </Accordion>
            )}

            {/* ═══════════════════════════════════════════════════════════════════════
          DIALOGS
      ═══════════════════════════════════════════════════════════════════════ */}

            {/* ── Category Dialog ───────────────────────────────────────────────────── */}
            <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingCatId ? 'Edit Category' : 'Create Exam Category'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor={`${uid}-cat-name`}>Category Name *</Label>
                                <Input
                                    id={`${uid}-cat-name`}
                                    value={catForm.name}
                                    onChange={(e) => setCatForm((f) => ({ ...f, name: e.target.value }))}
                                    placeholder="e.g. Banking & Insurance"
                                />
                            </div>

                            {!editingCatId && (
                                <div className="col-span-2 space-y-1.5">
                                    <Label htmlFor={`${uid}-cat-id`}>Category ID (auto-generated if blank)</Label>
                                    <Input
                                        id={`${uid}-cat-id`}
                                        value={catForm.id}
                                        onChange={(e) => setCatForm((f) => ({ ...f, id: e.target.value }))}
                                        placeholder="e.g. banking-insurance"
                                    />
                                </div>
                            )}

                            <div className="col-span-2 space-y-1.5">
                                <Label htmlFor={`${uid}-cat-desc`}>Description</Label>
                                <Textarea
                                    id={`${uid}-cat-desc`}
                                    value={catForm.description}
                                    onChange={(e) => setCatForm((f) => ({ ...f, description: e.target.value }))}
                                    rows={2}
                                    placeholder="Brief description of this exam category"
                                />
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label>Logo (URL or local image)</Label>
                                <LogoPicker
                                    id={`${uid}-cat-logo`}
                                    value={catForm.logo}
                                    onChange={(v) => setCatForm((f) => ({ ...f, logo: v }))}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-enrolled`}>Students Enrolled</Label>
                                <Input
                                    id={`${uid}-enrolled`}
                                    type="number"
                                    min={0}
                                    value={catForm.studentsEnrolled}
                                    onChange={(e) => setCatForm((f) => ({ ...f, studentsEnrolled: Number(e.target.value) }))}
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-exams`}>Exams Available</Label>
                                <Input
                                    id={`${uid}-exams`}
                                    type="number"
                                    min={0}
                                    value={catForm.examsAvailable}
                                    onChange={(e) => setCatForm((f) => ({ ...f, examsAvailable: Number(e.target.value) }))}
                                />
                            </div>

                            <div className="col-span-2 space-y-1.5">
                                <Label>Card Color Theme</Label>
                                <div className="flex flex-wrap gap-2">
                                    {COLOR_OPTIONS.map((opt) => (
                                        <button
                                            key={opt.value}
                                            type="button"
                                            className={cn(
                                                'px-3 py-1.5 rounded-md border-2 text-xs font-medium transition-all',
                                                opt.value,
                                                catForm.colorClass === opt.value ? 'border-primary ring-1 ring-primary' : 'border-transparent',
                                            )}
                                            onClick={() => setCatForm((f) => ({ ...f, colorClass: opt.value }))}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    id={`${uid}-popular`}
                                    checked={catForm.isPopular}
                                    onCheckedChange={(v) => setCatForm((f) => ({ ...f, isPopular: v }))}
                                />
                                <Label htmlFor={`${uid}-popular`} className="cursor-pointer">Popular</Label>
                            </div>

                            <div className="flex items-center gap-3">
                                <Switch
                                    id={`${uid}-visible`}
                                    checked={catForm.isVisible}
                                    onCheckedChange={(v) => setCatForm((f) => ({ ...f, isVisible: v }))}
                                />
                                <Label htmlFor={`${uid}-visible`} className="cursor-pointer">Visible to students</Label>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setCatDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveCategory}>{editingCatId ? 'Save Changes' : 'Create Category'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Section Dialog ────────────────────────────────────────────────────── */}
            <Dialog open={sectionDialogOpen} onOpenChange={setSectionDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>{editingSectionId ? 'Edit Section' : 'Add Section'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor={`${uid}-sec-name`}>Section Name *</Label>
                            <Input
                                id={`${uid}-sec-name`}
                                value={sectionForm.name}
                                onChange={(e) => setSectionForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Prelims"
                                autoFocus
                            />
                        </div>
                        {!editingSectionId && (
                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-sec-id`}>Section ID (auto if blank)</Label>
                                <Input
                                    id={`${uid}-sec-id`}
                                    value={sectionForm.id}
                                    onChange={(e) => setSectionForm((f) => ({ ...f, id: e.target.value }))}
                                    placeholder="e.g. prelims"
                                />
                            </div>
                        )}
                        <div className="space-y-1.5">
                            <Label htmlFor={`${uid}-sec-desc`}>Description (optional)</Label>
                            <Input
                                id={`${uid}-sec-desc`}
                                value={sectionForm.description}
                                onChange={(e) => setSectionForm((f) => ({ ...f, description: e.target.value }))}
                                placeholder="Brief description"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setSectionDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveSection}>{editingSectionId ? 'Save' : 'Add Section'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Exam Dialog ───────────────────────────────────────────────────────── */}
            <Dialog open={examDialogOpen} onOpenChange={setExamDialogOpen}>
                <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingExamId ? 'Edit Exam' : 'Add Exam'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor={`${uid}-exam-name`}>Exam Name *</Label>
                            <Input
                                id={`${uid}-exam-name`}
                                value={examForm.name}
                                onChange={(e) => setExamForm((f) => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. SBI PO"
                                autoFocus
                            />
                        </div>

                        {!editingExamId && (
                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-exam-id`}>Exam ID (auto if blank)</Label>
                                <Input
                                    id={`${uid}-exam-id`}
                                    value={examForm.id}
                                    onChange={(e) => setExamForm((f) => ({ ...f, id: e.target.value }))}
                                    placeholder="e.g. sbi-po"
                                />
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <Label>Logo (URL or local image)</Label>
                            <LogoPicker
                                id={`${uid}-exam-logo`}
                                value={examForm.logo}
                                onChange={(v) => setExamForm((f) => ({ ...f, logo: v }))}
                            />
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id={`${uid}-exam-popular`}
                                checked={examForm.isPopular}
                                onCheckedChange={(v) => setExamForm((f) => ({ ...f, isPopular: v }))}
                            />
                            <Label htmlFor={`${uid}-exam-popular`} className="cursor-pointer">Mark as Popular</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setExamDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveExam}>{editingExamId ? 'Save Changes' : 'Add Exam'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ───────────────────────────────────────────────── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>🗑️ Delete {deleteTarget?.type}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteTarget?.label}</strong>
                            {deleteTarget?.type === 'category' ? ' and all its sections and exams' : ''}.
                            Students will no longer see it. This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                deleteTarget?.onConfirm();
                                setDeleteTarget(null);
                                toast({ title: `${deleteTarget?.type} deleted`, variant: 'destructive' });
                            }}
                        >
                            Yes, Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Hide/Show Confirmation ─────────────────────────────────────────────── */}
            <AlertDialog open={!!hideTarget} onOpenChange={(o) => !o && setHideTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {hideTarget?.isCurrentlyVisible ? '🙈 Hide from students?' : '👁️ Show to students?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {hideTarget?.isCurrentlyVisible
                                ? <>Are you sure you want to <strong>hide</strong> <strong>"{hideTarget?.label}"</strong> from students? They will no longer see this category until you show it again.</>
                                : <>Are you sure you want to <strong>show</strong> <strong>"{hideTarget?.label}"</strong> to students? It will become visible in the student portal.</>
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className={hideTarget?.isCurrentlyVisible ? 'bg-amber-600 hover:bg-amber-700 text-white' : ''}
                            onClick={() => {
                                hideTarget?.onConfirm();
                                setHideTarget(null);
                            }}
                        >
                            {hideTarget?.isCurrentlyVisible ? 'Yes, Hide' : 'Yes, Show'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Edit Confirmation ──────────────────────────────────────────────────── */}
            <AlertDialog open={!!editConfirmTarget} onOpenChange={(o) => !o && setEditConfirmTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>✏️ Edit {editConfirmTarget?.type}?</AlertDialogTitle>
                        <AlertDialogDescription>
                            You are about to edit <strong>"{editConfirmTarget?.label}"</strong>.
                            Any changes you make will be saved and reflected immediately in the student portal.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                editConfirmTarget?.onConfirm();
                                setEditConfirmTarget(null);
                            }}
                        >
                            Yes, Edit
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Reset Confirmation ────────────────────────────────────────────────── */}
            <AlertDialog open={resetDialogOpen} onOpenChange={setResetDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Reset to defaults?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will restore all categories, sections, and exams to the original built-in data.
                            Any custom entries you added will be lost.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                resetToDefaults();
                                setResetDialogOpen(false);
                                toast({ title: 'Catalog reset to defaults' });
                            }}
                        >
                            Reset
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default TestCatalogManager;
