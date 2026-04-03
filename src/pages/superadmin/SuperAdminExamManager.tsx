import React, { useState, useId } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
    AlertDialog, AlertDialogAction, AlertDialogCancel,
    AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import {
    ArrowLeft, Plus, Pencil, Trash2, Eye, EyeOff,
    Clock, Target, BarChart2, Star, BookOpen, Zap, Radio, Trophy,
    Grid3X3, List, CheckCircle, Play, Upload, Tag, Check, X, Users, Quote, Save,
} from 'lucide-react';
import { useSuccessStoriesStore, type SuccessStory } from '@/hooks/useSuccessStoriesStore';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { StepBreadcrumb } from '@/components/ui/step-breadcrumb';
import {
    useExamCatalog,
    type CatalogTestItem,
    type TestDifficulty,
    type TestSubject,
} from '@/hooks/useExamCatalog';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';

// ─── Difficulty badge ─────────────────────────────────────────────────────────

const DiffBadge = ({ d }: { d: TestDifficulty }) => {
    const map: Record<TestDifficulty, string> = {
        easy: 'bg-green-100 text-green-700 border-green-200',
        medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
        hard: 'bg-red-100 text-red-700 border-red-200',
    };
    return (
        <Badge variant="outline" className={`text-[10px] px-1.5 capitalize ${map[d]}`}>{d}</Badge>
    );
};

// ─── Test Card (student-style) ────────────────────────────────────────────────

interface TestCardProps {
    test: CatalogTestItem;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onToggle: () => void;
    onUploadQuestions: () => void;
    viewMode: 'grid' | 'list';
}

const TestCard: React.FC<TestCardProps> = ({ test, index, onEdit, onDelete, onToggle, onUploadQuestions, viewMode }) => {
    if (viewMode === 'list') {
        return (
            <div className={cn(
                'flex items-center gap-4 border rounded-lg px-4 py-3 transition-colors',
                !test.isVisible && 'opacity-50',
                'bg-white hover:shadow-sm',
            )}>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">{test.name}</span>
                        <DiffBadge d={test.difficulty} />
                        {!test.isVisible && <Badge variant="outline" className="text-[10px] text-gray-400">Hidden</Badge>}
                    </div>
                    <div className="flex gap-4 mt-1 text-xs text-muted-foreground">
                        <span><Target className="inline h-3 w-3 mr-0.5" />Max: {test.maxScore}</span>
                        <span><BookOpen className="inline h-3 w-3 mr-0.5" />{test.totalQuestions} Qs</span>
                        <span><Clock className="inline h-3 w-3 mr-0.5" />{test.durationMinutes} min</span>
                    </div>
                </div>
                <div className="flex gap-1 shrink-0">
                    <Button variant="outline" size="sm" className="h-7 text-xs gap-1 text-primary border-primary/40" onClick={onUploadQuestions}>
                        <Upload className="h-3 w-3" /> Questions
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onToggle}>
                        {test.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0" onClick={onEdit}>
                        <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-destructive" onClick={onDelete}>
                        <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                </div>
            </div>
        );
    }

    // Grid card — matches student test card aesthetic
    const diffColor: Record<TestDifficulty, string> = {
        easy: 'border-l-green-400 bg-green-50/30',
        medium: 'border-l-yellow-400 bg-yellow-50/30',
        hard: 'border-l-red-400 bg-red-50/30',
    };

    return (
        <div className={cn(
            'border rounded-xl p-4 border-l-4 space-y-3 transition-all hover:shadow-md relative',
            diffColor[test.difficulty],
            !test.isVisible && 'opacity-50',
        )}>
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
                <div>
                    <p className="font-semibold text-sm">{test.name}</p>
                    <div className="flex items-center gap-1 mt-1">
                        <DiffBadge d={test.difficulty} />
                        {!test.isVisible && <Badge variant="outline" className="text-[10px] text-gray-400">Hidden</Badge>}
                    </div>
                </div>
                <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={onToggle}>
                        {test.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={onEdit}>
                        <Pencil className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={onDelete}>
                        <Trash2 className="h-3 w-3" />
                    </Button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="space-y-0.5">
                    <p className="text-muted-foreground">Max Score</p>
                    <p className="font-bold text-blue-600">{test.maxScore}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-muted-foreground">Questions</p>
                    <p className="font-bold text-purple-600">{test.totalQuestions}</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-muted-foreground">Duration</p>
                    <p className="font-bold">{test.durationMinutes} min</p>
                </div>
                <div className="space-y-0.5">
                    <p className="text-muted-foreground">Test #{index + 1}</p>
                    <p className="font-bold text-gray-500">—</p>
                </div>
            </div>

            {/* Progress placeholder (shows what student sees) */}
            <div className="space-y-1">
                <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Avg. Completion</span>
                    <span className="font-medium">0%</span>
                </div>
                <Progress value={0} className="h-1.5" />
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
                <Button
                    variant="default"
                    size="sm"
                    className="flex-1 h-8 text-xs gap-1"
                    onClick={onUploadQuestions}
                >
                    <Upload className="h-3 w-3" /> Upload Questions
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    className="h-8 text-xs gap-1 text-primary border-primary/40 hover:bg-primary/5"
                >
                    <Play className="h-3 w-3" /> Preview
                </Button>
            </div>
        </div>
    );
};

// ─── Defaults ─────────────────────────────────────────────────────────────────

const defaultTestForm = (): Omit<CatalogTestItem, 'createdAt'> => ({
    id: '',
    name: '',
    maxScore: 100,
    totalQuestions: 100,
    durationMinutes: 60,
    difficulty: 'medium',
    isVisible: true,
});

// ─── Main Component ───────────────────────────────────────────────────────────

// ─── Main Component ───────────────────────────────────────────────────────────

const SuperAdminExamManager: React.FC = () => {
    const { categoryId, sectionId, examId } = useParams<{
        categoryId: string;
        sectionId: string;
        examId: string;
    }>();
    const navigate = useNavigate();
    const uid = useId();
    const { toast } = useToast();
    const {
        catalog, loading,
        addTest, updateTest, deleteTest, updateTest: toggleTest,
        addSubject, updateSubject, deleteSubject,
        updateSlotLabel, addSlot, deleteSlot,
    } = useExamCatalog();

    // Derived: unique main tabs from this exam's testSlots + always show Success Stories
    const exam = (() => {
        const cat = catalog.find(c => c.id === categoryId);
        const sec = cat?.sections.find(s => s.id === sectionId);
        return sec?.exams.find(e => e.id === examId);
    })();
    const category = catalog.find(c => c.id === categoryId);
    const section = category?.sections.find(s => s.id === sectionId);

    // Dynamic main tab list from slots (unique tab values) + 'success-stories'
    const mainTabValues: string[] = React.useMemo(() => {
        if (!exam) return ['success-stories'];
        const seen = new Set<string>();
        const tabs: string[] = [];
        for (const slot of exam.testSlots) {
            if (!seen.has(slot.tab)) { seen.add(slot.tab); tabs.push(slot.tab); }
        }
        tabs.push('success-stories');
        return tabs;
    }, [exam]);

    const [activeTab, setActiveTab] = useState<string>(() => mainTabValues[0] ?? 'success-stories');

    // Reset activeTab when exam changes or tab list changes (e.g. after delete)
    React.useEffect(() => {
        if (!mainTabValues.includes(activeTab)) {
            setActiveTab(mainTabValues[0] ?? 'success-stories');
        }
    }, [mainTabValues, activeTab]);

    // Dynamic sub-tabs for a given main tab
    const getSubTabs = (tab: string) => {
        if (!exam) return [];
        return exam.testSlots.filter(s => s.tab === tab && s.subTab !== null);
    };

    const hasSubTabs = (tab: string) => getSubTabs(tab).length > 0;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    void hasSubTabs;

    // Active sub-tab: derived from slots
    const [activeSubTabKey, setActiveSubTabKey] = useState<string>('');

    // When switching main tab, set first sub-tab
    React.useEffect(() => {
        if (!exam) return;
        const subs = getSubTabs(activeTab);
        if (subs.length > 0) {
            if (!subs.find(s => s.key === activeSubTabKey)) {
                setActiveSubTabKey(subs[0].key);
            }
        } else {
            setActiveSubTabKey('');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [activeTab, exam]);

    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // ── Tab rename state ──────────────────────────────────────────────────────
    const [renamingSlotKey, setRenamingSlotKey] = useState<string | null>(null);
    const [renameValue, setRenameValue] = useState('');

    const startRename = (slotKey: string, currentLabel: string) => {
        setRenamingSlotKey(slotKey);
        setRenameValue(currentLabel);
    };
    const commitRename = () => {
        if (!renamingSlotKey || !renameValue.trim()) { setRenamingSlotKey(null); return; }
        const label = renameValue.trim();
        if (renamingSlotKey.startsWith('__tab__')) {
            // Rename the display label encoded in every slot belonging to this tab.
            // The tab's display label is derived from slot labels, so update all.
            const tabVal = renamingSlotKey.replace('__tab__', '');
            const tabSlots = exam?.testSlots.filter(s => s.tab === tabVal) ?? [];
            for (const sl of tabSlots) {
                // Rebuild label: for sub-tab slots keep their own sub-part, just update the prefix.
                const newLabel = sl.subTab
                    ? `${label} – ${sl.label.split('–').slice(1).join('–').trim() || sl.subTab}`
                    : label;
                updateSlotLabel(categoryId!, sectionId!, examId!, sl.key, newLabel);
            }
        } else {
            updateSlotLabel(categoryId!, sectionId!, examId!, renamingSlotKey, label);
        }
        toast({ title: 'Label updated' });
        setRenamingSlotKey(null);
    };

    // ── Add main tab dialog ───────────────────────────────────────────────────
    const [addTabOpen, setAddTabOpen] = useState(false);
    const [newTabLabel, setNewTabLabel] = useState('');
    const [newTabHasSubs, setNewTabHasSubs] = useState(true);

    const handleAddMainTab = () => {
        if (!newTabLabel.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
        const tabKey = newTabLabel.trim().toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
        if (newTabHasSubs) {
            // Add with a default 'Full Test' sub-tab
            addSlot(categoryId!, sectionId!, examId!, {
                key: `${tabKey}_full`,
                tab: tabKey,
                subTab: 'full',
                label: `${newTabLabel.trim()} – Full Test`,
            });
        } else {
            addSlot(categoryId!, sectionId!, examId!, {
                key: tabKey,
                tab: tabKey,
                subTab: null,
                label: newTabLabel.trim(),
            });
        }
        toast({ title: `Tab "${newTabLabel.trim()}" added` });
        setActiveTab(tabKey);
        setAddTabOpen(false);
        setNewTabLabel('');
        setNewTabHasSubs(true);
    };

    // ── Add sub-tab dialog ────────────────────────────────────────────────────
    const [addSubTabOpen, setAddSubTabOpen] = useState(false);
    const [newSubTabLabel, setNewSubTabLabel] = useState('');

    const handleAddSubTab = () => {
        if (!newSubTabLabel.trim()) { toast({ title: 'Name required', variant: 'destructive' }); return; }
        // also check if parent tab has a no-subTab slot (remove it first, since adding subTabs changes semantics)
        const subKey = newSubTabLabel.trim().toLowerCase().replace(/\s+/g, '_');
        const slotKey = `${activeTab}_${subKey}_${Date.now()}`;
        addSlot(categoryId!, sectionId!, examId!, {
            key: slotKey,
            tab: activeTab,
            subTab: subKey,
            label: newSubTabLabel.trim(),
        });
        toast({ title: `Sub-tab "${newSubTabLabel.trim()}" added` });
        setActiveSubTabKey(slotKey);
        setAddSubTabOpen(false);
        setNewSubTabLabel('');
    };

    // ── Delete slot confirmation ───────────────────────────────────────────────
    const [deleteSlotTarget, setDeleteSlotTarget] = useState<{ slotKey: string; label: string; isMainTab: boolean } | null>(null);

    const handleDeleteSlot = (slotKey: string, label: string, isMainTab: boolean) => {
        setDeleteSlotTarget({ slotKey, label, isMainTab });
    };

    const confirmDeleteSlot = () => {
        if (!deleteSlotTarget) return;
        if (deleteSlotTarget.isMainTab) {
            // Delete ALL slots under this main tab
            const tabSlots = exam?.testSlots.filter(s => s.tab === activeTab) ?? [];
            for (const sl of tabSlots) {
                deleteSlot(categoryId!, sectionId!, examId!, sl.key);
            }
            toast({ title: `Tab "${deleteSlotTarget.label}" deleted`, variant: 'destructive' });
        } else {
            deleteSlot(categoryId!, sectionId!, examId!, deleteSlotTarget.slotKey);
            toast({ title: `Sub-tab "${deleteSlotTarget.label}" deleted`, variant: 'destructive' });
        }
        setDeleteSlotTarget(null);
    };

    // ── Success Stories store ─────────────────────────────────────────────────
    const { examStories, addStory, updateStory, deleteStory } = useSuccessStoriesStore(examId);

    // ── Success Story dialog state ────────────────────────────────────────────
    const defaultStoryForm = () => ({
        name: '', air: 1, year: new Date().getFullYear().toString(),
        avatar: '', score: 0, maxScore: 500,
        testimonial: '', tips: ['', '', '', ''], isVisible: true,
    });
    const [storyDialogOpen, setStoryDialogOpen] = useState(false);
    const [editingStoryId, setEditingStoryId] = useState<string | null>(null);
    const [storyForm, setStoryForm] = useState<Omit<SuccessStory, 'id' | 'createdAt'>>(defaultStoryForm());
    const [deleteStoryTarget, setDeleteStoryTarget] = useState<{ id: string; name: string } | null>(null);

    // ── Subject management state ──────────────────────────────────────────────
    const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
    const [editingSubjectName, setEditingSubjectName] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [showAddSubject, setShowAddSubject] = useState(false);

    // ── Test dialog ───────────────────────────────────────────────────────────

    const [testDialogOpen, setTestDialogOpen] = useState(false);
    const [editingTestId, setEditingTestId] = useState<string | null>(null);
    const [activeSlotKey, setActiveSlotKey] = useState<string>('');
    const [testForm, setTestForm] = useState<Omit<CatalogTestItem, 'createdAt'>>(defaultTestForm());
    const [deleteTarget, setDeleteTarget] = useState<{ slotKey: string; testId: string; name: string } | null>(null);

    // ── Loading guard (catalog is empty on first render) ─────────────────────
    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!exam || !category || !section) {
        return (
            <div className="p-8 text-center">
                <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-muted-foreground">Exam not found.</p>
                <Button variant="outline" className="mt-4" onClick={() => navigate(-1)}>Go Back</Button>
            </div>
        );
    }


    // ── Open test dialog ──────────────────────────────────────────────────────

    const openAddTest = (slotK: string) => {
        const slot = exam!.testSlots.find(s => s.key === slotK);
        const nextNum = (slot?.tests.length || 0) + 1;
        const defaultName = `${slot?.label ?? slotK} ${nextNum}`;
        setActiveSlotKey(slotK);
        setEditingTestId(null);
        setTestForm({ ...defaultTestForm(), name: defaultName });
        setTestDialogOpen(true);
    };

    const openEditTest = (slotKey: string, test: CatalogTestItem) => {
        setActiveSlotKey(slotKey);
        setEditingTestId(test.id);
        setTestForm({
            id: test.id, name: test.name, maxScore: test.maxScore,
            totalQuestions: test.totalQuestions, durationMinutes: test.durationMinutes,
            difficulty: test.difficulty, isVisible: test.isVisible,
        });
        setTestDialogOpen(true);
    };

    const handleSaveTest = () => {
        if (!testForm.name.trim()) {
            toast({ title: 'Test name is required', variant: 'destructive' });
            return;
        }
        const id = editingTestId || testForm.id.trim() || `${activeSlotKey}-${Date.now()}`;
        if (editingTestId) {
            updateTest(categoryId!, sectionId!, examId!, activeSlotKey, editingTestId, { ...testForm });
            toast({ title: 'Test updated' });
        } else {
            addTest(categoryId!, sectionId!, examId!, activeSlotKey, { ...testForm, id });
            toast({ title: 'Test added', description: testForm.name });
        }
        setTestDialogOpen(false);
    };

    const handleDeleteTest = (slotKey: string, testId: string, name: string) => {
        setDeleteTarget({ slotKey, testId, name });
    };

    const handleToggleTest = (slotKey: string, test: CatalogTestItem) => {
        toggleTest(categoryId!, sectionId!, examId!, slotKey, test.id, { isVisible: !test.isVisible });
        toast({ title: test.isVisible ? 'Test hidden from students' : 'Test visible to students' });
    };

    // ── Subject panel helper ───────────────────────────────────────────────
    const renderSubjectPanel = (slotK: string) => {
        const slot = exam?.testSlots.find(s => s.key === slotK);
        const subjects: TestSubject[] = slot?.subjects ?? [];
        // Only show for sectional/speed-type slots
        if (!slotK.includes('sectional') && !slotK.includes('speed')) return null;

        const handleAddSubject = () => {
            const name = newSubjectName.trim();
            if (!name) return;
            const id = name.toLowerCase().replace(/\s+/g, '_') + '_' + Date.now();
            addSubject(categoryId!, sectionId!, examId!, slotK, { id, name });
            toast({ title: 'Subject added', description: name });
            setNewSubjectName('');
            setShowAddSubject(false);
        };

        const handleRenameSubject = (subId: string) => {
            const name = editingSubjectName.trim();
            if (!name) return;
            updateSubject(categoryId!, sectionId!, examId!, slotK, subId, name);
            toast({ title: 'Subject renamed' });
            setEditingSubjectId(null);
            setEditingSubjectName('');
        };

        return (
            <div className="border rounded-xl p-4 bg-blue-50/40 space-y-3 mb-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4 text-primary" />
                        Subject Sections
                        <span className="text-xs font-normal text-muted-foreground">— students see these as filter chips</span>
                    </h3>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs gap-1"
                        onClick={() => { setShowAddSubject(true); setNewSubjectName(''); }}
                    >
                        <Plus className="h-3 w-3" /> Add Subject
                    </Button>
                </div>

                {/* Existing subjects */}
                <div className="flex flex-wrap gap-2">
                    {subjects.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic">No subjects yet. Add one above.</p>
                    ) : subjects.map(sub => (
                        <div key={sub.id} className="flex items-center gap-1 bg-white border rounded-full px-3 py-1 group">
                            {editingSubjectId === sub.id ? (
                                <>
                                    <Input
                                        value={editingSubjectName}
                                        onChange={e => setEditingSubjectName(e.target.value)}
                                        onKeyDown={e => { if (e.key === 'Enter') handleRenameSubject(sub.id); if (e.key === 'Escape') setEditingSubjectId(null); }}
                                        className="h-6 text-xs w-36 border-0 p-0 focus-visible:ring-0 bg-transparent"
                                        autoFocus
                                    />
                                    <button onClick={() => handleRenameSubject(sub.id)} className="text-green-600 hover:text-green-700 ml-1"><Check className="h-3 w-3" /></button>
                                    <button onClick={() => setEditingSubjectId(null)} className="text-gray-400 hover:text-gray-600"><X className="h-3 w-3" /></button>
                                </>
                            ) : (
                                <>
                                    <span className="text-xs font-medium">{sub.name}</span>
                                    <button
                                        onClick={() => { setEditingSubjectId(sub.id); setEditingSubjectName(sub.name); }}
                                        className="text-gray-300 hover:text-primary ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Rename"
                                    ><Pencil className="h-3 w-3" /></button>
                                    <button
                                        onClick={() => { deleteSubject(categoryId!, sectionId!, examId!, slotK, sub.id); toast({ title: 'Subject removed' }); }}
                                        className="text-gray-300 hover:text-destructive ml-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Delete"
                                    ><Trash2 className="h-3 w-3" /></button>
                                </>
                            )}
                        </div>
                    ))}
                </div>

                {/* Add new subject inline */}
                {showAddSubject && (
                    <div className="flex items-center gap-2">
                        <Input
                            value={newSubjectName}
                            onChange={e => setNewSubjectName(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') handleAddSubject(); if (e.key === 'Escape') setShowAddSubject(false); }}
                            placeholder="e.g. General Awareness"
                            className="h-8 text-xs flex-1 max-w-xs"
                            autoFocus
                        />
                        <Button size="sm" className="h-8 text-xs" onClick={handleAddSubject} disabled={!newSubjectName.trim()}>Add</Button>
                        <Button size="sm" variant="ghost" className="h-8 text-xs" onClick={() => setShowAddSubject(false)}>Cancel</Button>
                    </div>
                )}
            </div>
        );
    };

    // ── renderSlotContent: single unified renderer ─────────────────────────
    const renderSlotContent = (slotK: string) => (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div className="flex gap-1 border rounded-lg p-1">
                    <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="p-2 h-7 w-7" onClick={() => setViewMode('grid')}>
                        <Grid3X3 className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="p-2 h-7 w-7" onClick={() => setViewMode('list')}>
                        <List className="h-3.5 w-3.5" />
                    </Button>
                </div>
                <Button size="sm" className="gap-1 h-8" onClick={() => openAddTest(slotK)}>
                    <Plus className="h-3.5 w-3.5" /> Add Test
                </Button>
            </div>
            {renderSubjectPanel(slotK)}
            {renderSlotTests(slotK)}
        </div>
    );

    const renderSlotTests = (slotK: string) => {
        const slot = exam.testSlots.find(s => s.key === slotK);
        const tests = slot?.tests || [];

        if (tests.length === 0) {
            return (
                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                    <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                    <p className="font-medium text-gray-500 mb-1">No tests yet</p>
                    <p className="text-sm text-muted-foreground mb-4">
                        Click <strong>Add Test</strong> to create the first test in this slot.
                    </p>
                    <Button size="sm" className="gap-1" onClick={() => openAddTest(slotK)}>
                        <Plus className="h-3.5 w-3.5" /> Add First Test
                    </Button>
                </div>
            );
        }

        // Stats row
        const completed = tests.filter(t => t.isVisible).length;

        return (
            <div className="space-y-3">
                {/* Slot stats */}
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-4 text-sm">
                        <span className="text-muted-foreground"><span className="font-bold text-gray-800">{tests.length}</span> tests</span>
                        <span className="text-muted-foreground"><span className="font-bold text-green-600">{completed}</span> visible</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Trophy className="h-3.5 w-3.5" />
                        <span>Avg score: — </span>
                    </div>
                </div>

                {/* Cards */}
                {viewMode === 'grid' ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
                        {tests.map((test, idx) => (
                            <TestCard
                                key={test.id}
                                test={test}
                                index={idx}
                                viewMode="grid"
                                onEdit={() => openEditTest(slotK, test)}
                                onDelete={() => handleDeleteTest(slotK, test.id, test.name)}
                                onToggle={() => handleToggleTest(slotK, test)}
                                onUploadQuestions={() => navigate(`/super-admin/test-catalog/${categoryId}/${sectionId}/${examId}/${slotK}/${test.id}/questions`)}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {tests.map((test, idx) => (
                            <TestCard
                                key={test.id}
                                test={test}
                                index={idx}
                                viewMode="list"
                                onEdit={() => openEditTest(slotK, test)}
                                onDelete={() => handleDeleteTest(slotK, test.id, test.name)}
                                onToggle={() => handleToggleTest(slotK, test)}
                                onUploadQuestions={() => navigate(`/super-admin/test-catalog/${categoryId}/${sectionId}/${examId}/${slotK}/${test.id}/questions`)}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
            {/* ── Breadcrumb ──────────────────────────────────────────────── */}
            <StepBreadcrumb
                items={[
                    { label: 'Test Catalog', href: '/super-admin/test-catalog' },
                    { label: category!.name },
                    { label: exam!.name, isActive: true },
                ]}
            />

            {/* ── Exam Header ─────────────────────────────────────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {exam!.logo ? (
                        <img src={exam!.logo} alt={exam!.name} className="w-14 h-14 object-contain flex-shrink-0" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">📚</div>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold">{exam!.name}</h1>
                            {exam!.isPopular && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                    <Star className="h-3 w-3 mr-1" />Popular
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">Comprehensive test preparation and progress tracking</p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Category: <span className="font-medium text-foreground">{category!.name}</span>
                            {' · '}
                            Section: <span className="font-medium text-foreground">{section!.name}</span>
                        </p>
                    </div>
                </div>
                <div className="flex gap-3 flex-wrap shrink-0">
                    <div className="text-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 min-w-[80px]">
                        <div className="text-xl font-bold text-blue-600">{exam!.testSlots.reduce((a, s) => a + s.tests.length, 0)}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Tests</div>
                    </div>
                    <div className="text-center bg-green-50 px-4 py-2 rounded-lg border border-green-100 min-w-[80px]">
                        <div className="text-xl font-bold text-green-600">{exam!.testSlots.reduce((a, s) => a + s.tests.filter(t => t.isVisible).length, 0)}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Visible</div>
                    </div>
                    <div className="text-center bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 min-w-[80px]">
                        <div className="text-xl font-bold text-purple-600">{exam!.testSlots.filter(s => s.tests.length > 0).length}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Slots</div>
                    </div>
                </div>
            </div>

            {/* ── Dynamic Tab Panel ───────────────────────────────────────────── */}
            <Card className="overflow-hidden">
                {/* ── Main tab bar ───────────────────────────────────────── */}
                <div className="bg-gray-50 border-b px-4 pt-4 pb-0">
                    <div className="flex items-center gap-1 overflow-x-auto pb-0">
                        {mainTabValues.map((tabVal) => {
                            const isSuccessStories = tabVal === 'success-stories';
                            // First slot of this tab gives us the label
                            const firstSlot = isSuccessStories ? null : exam!.testSlots.find(s => s.tab === tabVal);
                            // Label to show: for tab with sub-tabs, show the tab value nicely; for simple slot, show its label
                            const displayLabel = isSuccessStories ? 'Success Stories'
                                : (exam!.testSlots.filter(s => s.tab === tabVal).some(s => s.subTab)
                                    ? tabVal.replace(/_\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
                                    : firstSlot?.label ?? tabVal);
                            const tabTestCount = isSuccessStories ? 0
                                : exam!.testSlots.filter(s => s.tab === tabVal).reduce((a, s) => a + s.tests.length, 0);
                            const isActive = activeTab === tabVal;

                            // The slot key to use for rename (for simple=direct slots, use firstSlot.key; for sub-tab tabs, no single key—show generic rename)
                            const simpleSlot = isSuccessStories ? null
                                : exam!.testSlots.find(s => s.tab === tabVal && s.subTab === null);

                            return (
                                <div key={tabVal} className="relative flex items-center group shrink-0">
                                    <button
                                        onClick={() => setActiveTab(tabVal)}
                                        className={`flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                                            isActive
                                                ? 'border-primary text-primary bg-white rounded-t-lg'
                                                : 'border-transparent text-muted-foreground hover:text-foreground hover:border-gray-300'
                                        }`}
                                    >
                                        {isSuccessStories ? <Users className="h-3.5 w-3.5" /> : <BookOpen className="h-3.5 w-3.5" />}
                                        {renamingSlotKey === `__tab__${tabVal}` ? (
                                            <input
                                                autoFocus
                                                value={renameValue}
                                                onChange={e => setRenameValue(e.target.value)}
                                                onBlur={commitRename}
                                                onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingSlotKey(null); }}
                                                className="w-28 text-sm border-b border-primary bg-transparent outline-none"
                                                onClick={e => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span onDoubleClick={() => !isSuccessStories && (
                                                setRenamingSlotKey(`__tab__${tabVal}`),
                                                setRenameValue(displayLabel)
                                            )} title="Double-click to rename">{displayLabel}</span>
                                        )}
                                        {tabTestCount > 0 && (
                                            <span className="bg-primary/15 text-primary text-[10px] font-bold px-1.5 py-0.5 rounded-full">{tabTestCount}</span>
                                        )}
                                        {tabVal === 'success-stories' && examStories.length > 0 && (
                                            <span className="bg-amber-100 text-amber-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{examStories.length}</span>
                                        )}
                                    </button>
                                    {/* Rename + Delete buttons (only on hover, not for success-stories) */}
                                    {!isSuccessStories && isActive && (
                                        <div className="flex items-center gap-0.5 ml-0.5 pb-0.5">
                                            <button
                                                className="h-5 w-5 rounded text-gray-400 hover:text-primary hover:bg-primary/10 flex items-center justify-center transition-colors"
                                                title="Rename this tab"
                                                onClick={() => { setRenamingSlotKey(`__tab__${tabVal}`); setRenameValue(displayLabel); }}
                                            ><Pencil className="h-2.5 w-2.5" /></button>
                                            <button
                                                className="h-5 w-5 rounded text-gray-400 hover:text-destructive hover:bg-destructive/10 flex items-center justify-center transition-colors"
                                                title="Delete this tab and all its tests"
                                                onClick={() => handleDeleteSlot('', displayLabel, true)}
                                            ><Trash2 className="h-2.5 w-2.5" /></button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {/* + Add Tab button */}
                        <button
                            onClick={() => setAddTabOpen(true)}
                            className="flex items-center gap-1 px-3 py-2.5 text-xs text-primary border-b-2 border-transparent hover:border-primary/40 hover:bg-primary/5 rounded-t transition-all whitespace-nowrap ml-1"
                            title="Add a new main tab"
                        >
                            <Plus className="h-3 w-3" /> Add Tab
                        </button>
                        <div className="flex-1 border-b-2 border-transparent" />
                    </div>
                </div>

                {/* ── Tab content ──────────────────────────────────────────── */}
                <div className="p-4 sm:p-6">
                    {activeTab === 'success-stories' ? (
                        // ── Success Stories Panel ─────────────────────────────────────────
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="font-semibold text-base flex items-center gap-2">
                                        <Trophy className="h-4 w-4 text-amber-500" />
                                        Success Stories — {exam!.name}
                                    </h2>
                                    <p className="text-xs text-muted-foreground mt-0.5">
                                        These appear in the student's <strong>Success Stories</strong> tab for this exam.
                                    </p>
                                </div>
                                <Button size="sm" className="gap-1 h-8" onClick={() => {
                                    setEditingStoryId(null);
                                    setStoryForm(defaultStoryForm());
                                    setStoryDialogOpen(true);
                                }}>
                                    <Plus className="h-3.5 w-3.5" /> Add Story
                                </Button>
                            </div>
                            {examStories.length === 0 ? (
                                <div className="text-center py-16 border-2 border-dashed rounded-xl">
                                    <Trophy className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                                    <p className="font-medium text-gray-500 mb-1">No success stories yet</p>
                                    <p className="text-sm text-muted-foreground mb-4">Add toppers to inspire students. They'll appear in the student portal instantly.</p>
                                    <Button size="sm" className="gap-1" onClick={() => { setEditingStoryId(null); setStoryForm(defaultStoryForm()); setStoryDialogOpen(true); }}>
                                        <Plus className="h-3.5 w-3.5" /> Add First Story
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {[...examStories].sort((a, b) => a.air - b.air).map(story => (
                                        <div key={story.id} className={`border rounded-xl p-4 bg-white hover:shadow-md transition-all space-y-3 ${!story.isVisible ? 'opacity-50' : ''}`}>
                                            <div className="flex items-start gap-3">
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-14 w-14 border-2 border-amber-200">
                                                        <AvatarImage src={story.avatar} />
                                                        <AvatarFallback className="bg-amber-100 text-amber-700 font-bold">
                                                            {story.name.split(' ').map(n => n[0]).join('')}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {story.air <= 3 && (<div className="absolute -top-1 -right-1 bg-amber-500 rounded-full p-1"><Trophy className="h-3 w-3 text-white" /></div>)}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-semibold text-sm truncate">{story.name}</p>
                                                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                                        <Badge variant="default" className="text-xs px-2 py-0">AIR {story.air}</Badge>
                                                        <Badge variant="outline" className="text-xs px-2 py-0">{story.year}</Badge>
                                                        {!story.isVisible && <Badge variant="outline" className="text-[10px] text-gray-400">Hidden</Badge>}
                                                    </div>
                                                    <p className="text-xs text-muted-foreground mt-0.5">{story.score}/{story.maxScore} marks</p>
                                                </div>
                                                <div className="flex gap-0.5 shrink-0">
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => updateStory(examId!, story.id, { isVisible: !story.isVisible })}>
                                                        {story.isVisible ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                                                    </Button>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-muted-foreground" onClick={() => {
                                                        setEditingStoryId(story.id);
                                                        setStoryForm({ name: story.name, air: story.air, year: story.year, avatar: story.avatar, score: story.score, maxScore: story.maxScore, testimonial: story.testimonial, tips: story.tips.length >= 4 ? story.tips : [...story.tips, ...Array(4 - story.tips.length).fill('')], isVisible: story.isVisible });
                                                        setStoryDialogOpen(true);
                                                    }}><Pencil className="h-3 w-3" /></Button>
                                                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-destructive" onClick={() => setDeleteStoryTarget({ id: story.id, name: story.name })}>
                                                        <Trash2 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                            </div>
                                            {story.testimonial && (<p className="text-xs text-muted-foreground italic line-clamp-2 pl-1 border-l-2 border-amber-200">"{story.testimonial}"</p>)}
                                            {story.tips.filter(Boolean).length > 0 && (
                                                <div className="flex flex-wrap gap-1">
                                                    {story.tips.filter(Boolean).slice(0, 3).map((tip, i) => (<span key={i} className="text-[10px] bg-green-50 text-green-700 border border-green-200 rounded-full px-2 py-0.5">{tip}</span>))}
                                                    {story.tips.filter(Boolean).length > 3 && (<span className="text-[10px] text-muted-foreground">+{story.tips.filter(Boolean).length - 3} more</span>)}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (() => {
                        // ── Test tab content (with or without sub-tabs) ──────────────────────
                        const subTabs = getSubTabs(activeTab);
                        // Simple tab (no sub-tabs): just one slot with subTab===null
                        const simpleSlot = exam!.testSlots.find(s => s.tab === activeTab && s.subTab === null);

                        if (subTabs.length === 0 && simpleSlot) {
                            // Simple: no sub-tabs
                            return (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        {/* Slot label editable for simple tabs */}
                                        {renamingSlotKey === simpleSlot.key ? (
                                            <div className="flex items-center gap-2">
                                                <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                                    onBlur={commitRename} onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingSlotKey(null); }}
                                                    className="text-sm border rounded px-2 h-7 outline-none focus:ring-1 ring-primary" />
                                                <button onClick={commitRename} className="text-green-600"><Check className="h-4 w-4" /></button>
                                                <button onClick={() => setRenamingSlotKey(null)} className="text-gray-400"><X className="h-4 w-4" /></button>
                                            </div>
                                        ) : null}
                                    </div>
                                    {renderSlotContent(simpleSlot.key)}
                                </div>
                            );
                        }

                        // Has sub-tabs
                        const currentSubSlot = exam!.testSlots.find(s => s.key === activeSubTabKey) ?? subTabs[0];

                        return (
                            <div className="space-y-4">
                                {/* Sub-tab bar */}
                                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                                    <div className="flex gap-2 flex-wrap items-center">
                                        {subTabs.map(st => (
                                            <div key={st.key} className="relative group/sub flex items-center">
                                                {renamingSlotKey === st.key ? (
                                                    <div className="flex items-center gap-1">
                                                        <input autoFocus value={renameValue} onChange={e => setRenameValue(e.target.value)}
                                                            onBlur={commitRename} onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') setRenamingSlotKey(null); }}
                                                            className="text-xs border rounded px-2 h-7 w-28 outline-none focus:ring-1 ring-primary" />
                                                        <button onClick={commitRename} className="text-green-600"><Check className="h-3.5 w-3.5" /></button>
                                                        <button onClick={() => setRenamingSlotKey(null)} className="text-gray-400"><X className="h-3.5 w-3.5" /></button>
                                                    </div>
                                                ) : (
                                                    <Button
                                                        size="sm"
                                                        variant={activeSubTabKey === st.key ? 'default' : 'outline'}
                                                        onClick={() => setActiveSubTabKey(st.key)}
                                                        className="text-xs h-8 pr-1 gap-1"
                                                    >
                                                        {st.label}
                                                        {/* Edit & delete buttons inline */}
                                                        <span className="flex items-center gap-0.5 ml-0.5 opacity-0 group-hover/sub:opacity-100 transition-opacity">
                                                            <span className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-black/10"
                                                                title="Rename" onClick={e => { e.stopPropagation(); startRename(st.key, st.label); }}>
                                                                <Pencil className="h-2.5 w-2.5" />
                                                            </span>
                                                            <span className="w-4 h-4 inline-flex items-center justify-center rounded hover:bg-destructive/20 text-destructive"
                                                                title="Delete sub-tab" onClick={e => { e.stopPropagation(); handleDeleteSlot(st.key, st.label, false); }}>
                                                                <X className="h-2.5 w-2.5" />
                                                            </span>
                                                        </span>
                                                    </Button>
                                                )}
                                            </div>
                                        ))}
                                        {/* + Add Sub-tab */}
                                        <button
                                            onClick={() => setAddSubTabOpen(true)}
                                            className="flex items-center gap-1 h-8 px-2 text-xs text-primary border border-dashed border-primary/40 rounded hover:bg-primary/5 transition-colors"
                                        >
                                            <Plus className="h-3 w-3" /> Sub-tab
                                        </button>
                                    </div>
                                    <div className="flex gap-1 border rounded-lg p-1 shrink-0">
                                        <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="p-2 h-7 w-7" onClick={() => setViewMode('grid')}><Grid3X3 className="h-3.5 w-3.5" /></Button>
                                        <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="p-2 h-7 w-7" onClick={() => setViewMode('list')}><List className="h-3.5 w-3.5" /></Button>
                                    </div>
                                </div>
                                {currentSubSlot && renderSlotContent(currentSubSlot.key)}
                            </div>
                        );
                    })()}
                </div>
            </Card>

            {/* ── Add Tab Dialog ─────────────────────────────────────── */}
            <Dialog open={addTabOpen} onOpenChange={setAddTabOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" /> Add New Tab
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label>Tab Name *</Label>
                            <Input
                                autoFocus
                                value={newTabLabel}
                                onChange={e => setNewTabLabel(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddMainTab(); }}
                                placeholder="e.g. Interview, Phase 2, Mains 2025"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="tab-has-subs"
                                checked={newTabHasSubs}
                                onChange={e => setNewTabHasSubs(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300"
                            />
                            <Label htmlFor="tab-has-subs" className="cursor-pointer text-sm">
                                Has sub-tabs (Full Test, Sectional, etc.)
                            </Label>
                        </div>
                        <p className="text-xs text-muted-foreground">
                            {newTabHasSubs
                                ? 'A default "Full Test" sub-tab will be created. You can add more later.'
                                : 'Tests go directly into this tab without sub-tabs.'}
                        </p>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddTabOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddMainTab} disabled={!newTabLabel.trim()}>Add Tab</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Add Sub-Tab Dialog ───────────────────────────────── */}
            <Dialog open={addSubTabOpen} onOpenChange={setAddSubTabOpen}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Plus className="h-4 w-4 text-primary" /> Add Sub-Tab
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3 py-2">
                        <p className="text-sm text-muted-foreground">
                            Adding to: <strong className="text-foreground">
                                {activeTab.replace(/_\d+$/, '').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </strong>
                        </p>
                        <div className="space-y-1.5">
                            <Label>Sub-Tab Name *</Label>
                            <Input
                                autoFocus
                                value={newSubTabLabel}
                                onChange={e => setNewSubTabLabel(e.target.value)}
                                onKeyDown={e => { if (e.key === 'Enter') handleAddSubTab(); }}
                                placeholder="e.g. PYQ 2025, Essay, Descriptive"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setAddSubTabOpen(false)}>Cancel</Button>
                        <Button onClick={handleAddSubTab} disabled={!newSubTabLabel.trim()}>Add Sub-Tab</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Tab/Sub-Tab Confirmation ──────────────────────── */}
            <AlertDialog open={!!deleteSlotTarget} onOpenChange={o => !o && setDeleteSlotTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Delete {deleteSlotTarget?.isMainTab ? 'Tab' : 'Sub-Tab'}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>"{deleteSlotTarget?.label}"</strong>
                            {deleteSlotTarget?.isMainTab
                                ? ' and ALL tests inside all its sub-tabs.'
                                : ' and all its tests.'}{' '}
                            This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={confirmDeleteSlot}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ═══════════════════════════════════ DIALOGS ══════════════════════════ */}

            {/* ── Add/Edit Test Dialog ─────────────────────────────────────────────── */}
            <Dialog open={testDialogOpen} onOpenChange={setTestDialogOpen}>
                <DialogContent className="sm:max-w-lg">
                    <DialogHeader>
                        <DialogTitle>{editingTestId ? 'Edit Test' : 'Add New Test'}</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-1.5">
                            <Label htmlFor={`${uid}-tname`}>Test Name *</Label>
                            <Input
                                id={`${uid}-tname`}
                                value={testForm.name}
                                onChange={e => setTestForm(f => ({ ...f, name: e.target.value }))}
                                placeholder="e.g. Prelims Full Test 1"
                                autoFocus
                            />
                        </div>

                        {!editingTestId && (
                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-tid`}>Test ID (auto if blank)</Label>
                                <Input
                                    id={`${uid}-tid`}
                                    value={testForm.id}
                                    onChange={e => setTestForm(f => ({ ...f, id: e.target.value }))}
                                    placeholder="e.g. prelims-full-1"
                                />
                            </div>
                        )}

                        <div className="grid grid-cols-3 gap-3">
                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-score`}>Max Score</Label>
                                <Input
                                    id={`${uid}-score`}
                                    type="number"
                                    min={1}
                                    value={testForm.maxScore}
                                    onChange={e => setTestForm(f => ({ ...f, maxScore: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-qs`}>Questions</Label>
                                <Input
                                    id={`${uid}-qs`}
                                    type="number"
                                    min={1}
                                    value={testForm.totalQuestions}
                                    onChange={e => setTestForm(f => ({ ...f, totalQuestions: Number(e.target.value) }))}
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor={`${uid}-dur`}>Duration (min)</Label>
                                <Input
                                    id={`${uid}-dur`}
                                    type="number"
                                    min={1}
                                    value={testForm.durationMinutes}
                                    onChange={e => setTestForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Difficulty</Label>
                            <Select
                                value={testForm.difficulty}
                                onValueChange={v => setTestForm(f => ({ ...f, difficulty: v as TestDifficulty }))}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="easy">Easy</SelectItem>
                                    <SelectItem value="medium">Medium</SelectItem>
                                    <SelectItem value="hard">Hard</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id={`${uid}-tvis`}
                                checked={testForm.isVisible}
                                onCheckedChange={v => setTestForm(f => ({ ...f, isVisible: v }))}
                            />
                            <Label htmlFor={`${uid}-tvis`} className="cursor-pointer">Visible to students</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setTestDialogOpen(false)}>Cancel</Button>
                        <Button onClick={handleSaveTest}>{editingTestId ? 'Save Changes' : 'Add Test'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Confirmation ───────────────────────────────────────────────── */}
            <AlertDialog open={!!deleteTarget} onOpenChange={o => !o && setDeleteTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete test?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently delete <strong>{deleteTarget?.name}</strong>.
                            Students will no longer see this test. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteTarget) {
                                    deleteTest(categoryId!, sectionId!, examId!, deleteTarget.slotKey, deleteTarget.testId);
                                    toast({ title: 'Test deleted', variant: 'destructive' });
                                    setDeleteTarget(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* ── Add/Edit Success Story Dialog ─────────────────────────────────── */}
            <Dialog open={storyDialogOpen} onOpenChange={setStoryDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <Trophy className="h-5 w-5 text-amber-500" />
                            {editingStoryId ? 'Edit Success Story' : 'Add Success Story'}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1.5 col-span-2">
                                <Label>Student Name *</Label>
                                <Input value={storyForm.name} onChange={e => setStoryForm(f => ({ ...f, name: e.target.value }))} placeholder="e.g. Rahul Sharma" autoFocus />
                            </div>
                            <div className="space-y-1.5">
                                <Label>AIR (All India Rank) *</Label>
                                <Input type="number" min={1} value={storyForm.air} onChange={e => setStoryForm(f => ({ ...f, air: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Year *</Label>
                                <Input value={storyForm.year} onChange={e => setStoryForm(f => ({ ...f, year: e.target.value }))} placeholder="2024" />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Score Obtained</Label>
                                <Input type="number" min={0} value={storyForm.score} onChange={e => setStoryForm(f => ({ ...f, score: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-1.5">
                                <Label>Max Score</Label>
                                <Input type="number" min={1} value={storyForm.maxScore} onChange={e => setStoryForm(f => ({ ...f, maxScore: Number(e.target.value) }))} />
                            </div>
                            <div className="space-y-1.5 col-span-2">
                                <Label>Photo URL (or leave blank for avatar initials)</Label>
                                <Input value={storyForm.avatar} onChange={e => setStoryForm(f => ({ ...f, avatar: e.target.value }))} placeholder="https://example.com/photo.jpg" />
                                {storyForm.avatar && (
                                    <img src={storyForm.avatar} alt="preview" className="h-12 w-12 rounded-full object-cover border mt-1"
                                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                                )}
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <Label>Testimonial *</Label>
                            <Textarea
                                value={storyForm.testimonial}
                                onChange={e => setStoryForm(f => ({ ...f, testimonial: e.target.value }))}
                                placeholder="Write the student's success story and journey..."
                                rows={3}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Success Tips (up to 4)</Label>
                            {[0, 1, 2, 3].map(i => (
                                <Input
                                    key={i}
                                    value={storyForm.tips[i] || ''}
                                    onChange={e => {
                                        const tips = [...(storyForm.tips || ['', '', '', ''])];
                                        tips[i] = e.target.value;
                                        setStoryForm(f => ({ ...f, tips }));
                                    }}
                                    placeholder={`Tip ${i + 1} — e.g. Daily mock tests`}
                                />
                            ))}
                        </div>

                        <div className="flex items-center gap-3">
                            <Switch
                                id="story-visible"
                                checked={storyForm.isVisible}
                                onCheckedChange={v => setStoryForm(f => ({ ...f, isVisible: v }))}
                            />
                            <Label htmlFor="story-visible" className="cursor-pointer">Visible to students</Label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setStoryDialogOpen(false)}>Cancel</Button>
                        <Button onClick={() => {
                            if (!storyForm.name.trim()) { toast({ title: 'Name is required', variant: 'destructive' }); return; }
                            if (!storyForm.testimonial.trim()) { toast({ title: 'Testimonial is required', variant: 'destructive' }); return; }
                            const tips = storyForm.tips.filter(Boolean);
                            if (editingStoryId) {
                                updateStory(examId!, editingStoryId, { ...storyForm, tips });
                                toast({ title: 'Story updated' });
                            } else {
                                addStory(examId!, { ...storyForm, tips });
                                toast({ title: '✅ Story published!', description: `${storyForm.name}'s story now appears in the student portal.` });
                            }
                            setStoryDialogOpen(false);
                        }} className="gap-2">
                            <Save className="h-4 w-4" />
                            {editingStoryId ? 'Save Changes' : 'Publish Story'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* ── Delete Story Confirmation ──────────────────────────────────────── */}
            <AlertDialog open={!!deleteStoryTarget} onOpenChange={o => !o && setDeleteStoryTarget(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete success story?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will permanently remove <strong>{deleteStoryTarget?.name}</strong>'s success story.
                            Students will no longer see it. This cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            onClick={() => {
                                if (deleteStoryTarget) {
                                    deleteStory(examId!, deleteStoryTarget.id);
                                    toast({ title: 'Story deleted', variant: 'destructive' });
                                    setDeleteStoryTarget(null);
                                }
                            }}
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SuperAdminExamManager;
