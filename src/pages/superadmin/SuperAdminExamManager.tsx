import React, { useState, useId } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
    Grid3X3, List, CheckCircle, Play, Upload,
} from 'lucide-react';
import {
    useExamCatalog,
    DEFAULT_SLOT_TEMPLATES,
    type CatalogTestItem,
    type TestDifficulty,
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

// ─── TAB definitions ──────────────────────────────────────────────────────────

const MAIN_TABS = [
    { value: 'prelims', label: 'Prelims', icon: <BookOpen className="h-3.5 w-3.5" /> },
    { value: 'mains', label: 'Mains', icon: <Target className="h-3.5 w-3.5" /> },
    { value: 'speed', label: 'Speed', icon: <Zap className="h-3.5 w-3.5" /> },
    { value: 'live', label: 'Live', icon: <Radio className="h-3.5 w-3.5" /> },
];

const SUB_TABS = [
    { value: 'full', label: 'Full Test' },
    { value: 'sectional', label: 'Sectional Test' },
    { value: 'speed', label: 'Speed Test' },
    { value: 'pyq', label: 'PYQ Test' },
];

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
    const { catalog, loading, addTest, updateTest, deleteTest, updateTest: toggleTest } = useExamCatalog();

    const [activeTab, setActiveTab] = useState('prelims');
    const [activeSubTab, setActiveSubTab] = useState('full');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // ── Find category / section / exam ────────────────────────────────────────

    const category = catalog.find(c => c.id === categoryId);
    const section = category?.sections.find(s => s.id === sectionId);
    const exam = section?.exams.find(e => e.id === examId);

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

    // ── Slot helpers ──────────────────────────────────────────────────────────

    const slotKey = (tab: string, sub: string | null) =>
        sub ? `${tab}_${sub}` : tab;

    const currentSlotKey = () => {
        if (activeTab === 'speed' || activeTab === 'live') return activeTab;
        return slotKey(activeTab, activeSubTab);
    };

    const currentSlot = exam.testSlots.find(s => s.key === currentSlotKey());

    // ── Aggregate stats ───────────────────────────────────────────────────────

    const totalTests = exam.testSlots.reduce((a, s) => a + s.tests.length, 0);
    const visibleTests = exam.testSlots.reduce((a, s) => a + s.tests.filter(t => t.isVisible).length, 0);

    // ── Open test dialog ──────────────────────────────────────────────────────

    const openAddTest = () => {
        const sk = currentSlotKey();
        const slot = exam.testSlots.find(s => s.key === sk);
        const nextNum = (slot?.tests.length || 0) + 1;
        const tabLabel = MAIN_TABS.find(t => t.value === activeTab)?.label || activeTab;
        const subLabel = SUB_TABS.find(t => t.value === activeSubTab)?.label || '';
        const defaultName = activeTab === 'speed' || activeTab === 'live'
            ? `${tabLabel} Test ${nextNum}`
            : `${tabLabel} ${subLabel} ${nextNum}`;

        setActiveSlotKey(sk);
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

    // ── Render sub-tabs for Prelims / Mains ───────────────────────────────────

    const renderSubTabContent = (tabValue: string) => {
        return (
            <div className="space-y-4">
                {/* Sub-tab row */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 justify-between">
                    <div className="flex gap-2 flex-wrap">
                        {SUB_TABS.map(st => (
                            <Button
                                key={st.value}
                                size="sm"
                                variant={activeSubTab === st.value ? 'default' : 'outline'}
                                onClick={() => setActiveSubTab(st.value)}
                                className="text-xs h-8"
                            >
                                {st.label}
                            </Button>
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="flex gap-1 border rounded-lg p-1">
                            <Button variant={viewMode === 'grid' ? 'default' : 'ghost'} size="sm" className="p-2 h-7 w-7" onClick={() => setViewMode('grid')}>
                                <Grid3X3 className="h-3.5 w-3.5" />
                            </Button>
                            <Button variant={viewMode === 'list' ? 'default' : 'ghost'} size="sm" className="p-2 h-7 w-7" onClick={() => setViewMode('list')}>
                                <List className="h-3.5 w-3.5" />
                            </Button>
                        </div>
                        <Button size="sm" className="gap-1 h-8" onClick={openAddTest}>
                            <Plus className="h-3.5 w-3.5" /> Add Test
                        </Button>
                    </div>
                </div>
                {renderSlotTests(slotKey(tabValue, activeSubTab))}
            </div>
        );
    };

    const renderSimpleTabContent = (slotK: string, emptyLabel: string) => (
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
                <Button size="sm" className="gap-1 h-8" onClick={openAddTest}>
                    <Plus className="h-3.5 w-3.5" /> Add {emptyLabel}
                </Button>
            </div>
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
                    <Button size="sm" className="gap-1" onClick={openAddTest}>
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
            {/* ── Breadcrumb ──────────────────────────────────────────────────── */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Link
                    to="/super-admin/test-catalog"
                    className="hover:text-primary flex items-center gap-1 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Test Catalog
                </Link>
                <span>/</span>
                <span>{category.name}</span>
                <span>/</span>
                <span className="text-foreground font-medium">{exam.name}</span>
            </div>

            {/* ── Exam Header (matches ExamDetail student page) ─────────────── */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 bg-white border rounded-xl p-5 shadow-sm">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                    {exam.logo ? (
                        <img src={exam.logo} alt={exam.name} className="w-14 h-14 object-contain flex-shrink-0" />
                    ) : (
                        <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center text-2xl">📚</div>
                    )}
                    <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-2xl font-bold">{exam.name}</h1>
                            {exam.isPopular && (
                                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                                    <Star className="h-3 w-3 mr-1" />Popular
                                </Badge>
                            )}
                        </div>
                        <p className="text-muted-foreground text-sm mt-0.5">
                            Comprehensive test preparation and progress tracking
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Category: <span className="font-medium text-foreground">{category.name}</span>
                            {' · '}
                            Section: <span className="font-medium text-foreground">{section.name}</span>
                        </p>
                    </div>
                </div>

                {/* Stat tiles */}
                <div className="flex gap-3 flex-wrap shrink-0">
                    <div className="text-center bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 min-w-[80px]">
                        <div className="text-xl font-bold text-blue-600">{totalTests}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Tests</div>
                    </div>
                    <div className="text-center bg-green-50 px-4 py-2 rounded-lg border border-green-100 min-w-[80px]">
                        <div className="text-xl font-bold text-green-600">{visibleTests}</div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Visible</div>
                    </div>
                    <div className="text-center bg-purple-50 px-4 py-2 rounded-lg border border-purple-100 min-w-[80px]">
                        <div className="text-xl font-bold text-purple-600">
                            {exam.testSlots.filter(s => s.tests.length > 0).length}
                        </div>
                        <div className="text-xs text-gray-600 uppercase tracking-wide">Slot Types</div>
                    </div>
                </div>
            </div>

            {/* ── Main Tabs (Prelims / Mains / Speed / Live) ───────────────────── */}
            <Card className="overflow-hidden">
                <Tabs value={activeTab} onValueChange={v => { setActiveTab(v); setActiveSubTab('full'); }}>
                    {/* Tab header */}
                    <div className="bg-gray-50 p-4 border-b">
                        <div className="overflow-x-auto">
                            <TabsList className="grid grid-cols-4 min-w-max lg:min-w-0 w-full">
                                {MAIN_TABS.map(tab => {
                                    const slotKeys = DEFAULT_SLOT_TEMPLATES
                                        .filter(t => t.tab === tab.value)
                                        .map(t => t.key);
                                    const count = exam.testSlots
                                        .filter(s => slotKeys.includes(s.key))
                                        .reduce((a, s) => a + s.tests.length, 0);
                                    return (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className="gap-1.5 text-xs sm:text-sm whitespace-nowrap"
                                        >
                                            {tab.icon}
                                            {tab.label}
                                            {count > 0 && (
                                                <Badge variant="secondary" className="ml-1 text-[10px] px-1.5 py-0">
                                                    {count}
                                                </Badge>
                                            )}
                                        </TabsTrigger>
                                    );
                                })}
                            </TabsList>
                        </div>
                    </div>

                    <div className="p-4 sm:p-6">
                        <TabsContent value="prelims" className="mt-0">
                            {renderSubTabContent('prelims')}
                        </TabsContent>
                        <TabsContent value="mains" className="mt-0">
                            {renderSubTabContent('mains')}
                        </TabsContent>
                        <TabsContent value="speed" className="mt-0">
                            {renderSimpleTabContent('speed', 'Speed Test')}
                        </TabsContent>
                        <TabsContent value="live" className="mt-0">
                            {renderSimpleTabContent('live', 'Live Test')}
                        </TabsContent>
                    </div>
                </Tabs>
            </Card>

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
        </div>
    );
};

export default SuperAdminExamManager;
