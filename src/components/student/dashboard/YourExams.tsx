import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus,
    X,
    BookMarked,
    Search,
    ChevronDown,
    ChevronUp,
    ArrowRight,
} from 'lucide-react';
import {
    examCategories,
    getExamsByCategory,
    type Exam,
    type ExamCategory,
} from '@/data/examData';

const MAX_EXAMS = 5;
const STORAGE_KEY = 'yourSelectedExams';

interface SelectedExam {
    examId: string;
    examName: string;
    examLogo: string;
    categoryId: string;
    categoryName: string;
}

// ─── Exam picker sub-component ───────────────────────────────────────────────

const ExamPickerRow: React.FC<{
    exam: Exam;
    category: ExamCategory;
    isAdded: boolean;
    isFull: boolean;
    onAdd: (exam: Exam, category: ExamCategory) => void;
}> = ({ exam, category, isAdded, isFull, onAdd }) => (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-white border border-border/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                <img
                    src={exam.logo}
                    alt={exam.name}
                    className="w-6 h-6 object-contain"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
            </div>
            <span className="text-sm text-foreground truncate">{exam.name}</span>
            {exam.isPopular && (
                <Badge variant="secondary" className="text-[9px] px-1 py-0 flex-shrink-0">Popular</Badge>
            )}
        </div>
        <button
            disabled={isAdded || isFull}
            onClick={() => onAdd(exam, category)}
            className={`flex-shrink-0 ml-2 w-6 h-6 rounded-full flex items-center justify-center border transition-all
        ${isAdded
                    ? 'bg-primary border-primary text-primary-foreground cursor-default'
                    : isFull
                        ? 'border-border text-muted-foreground cursor-not-allowed opacity-40'
                        : 'border-primary text-primary hover:bg-primary hover:text-primary-foreground'
                }`}
        >
            {isAdded ? (
                <span className="text-[10px] font-bold">✓</span>
            ) : (
                <Plus className="h-3 w-3" />
            )}
        </button>
    </div>
);

const CategorySection: React.FC<{
    category: ExamCategory;
    selectedIds: Set<string>;
    isFull: boolean;
    onAdd: (exam: Exam, category: ExamCategory) => void;
    searchQuery: string;
}> = ({ category, selectedIds, isFull, onAdd, searchQuery }) => {
    const [open, setOpen] = useState(false);
    const allExams = getExamsByCategory(category.id);

    const exams = useMemo(() => {
        if (!searchQuery) return allExams;
        return allExams.filter((e) => e.name.toLowerCase().includes(searchQuery));
    }, [allExams, searchQuery]);

    if (exams.length === 0) return null;

    // Auto-open when searching
    const isOpen = open || !!searchQuery;

    return (
        <div className="border border-border/50 rounded-xl overflow-hidden">
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-card hover:bg-muted/30 transition-colors text-left"
            >
                <div className="w-8 h-8 rounded-lg bg-white border border-border/50 flex items-center justify-center overflow-hidden flex-shrink-0">
                    <img src={category.logo} alt={category.name} className="w-6 h-6 object-contain"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                </div>
                <span className="flex-1 text-sm font-medium text-foreground">{category.name}</span>
                <span className="text-xs text-muted-foreground">{exams.length} exams</span>
                {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />}
            </button>

            {isOpen && (
                <div className="divide-y divide-border/30 bg-muted/10 px-2 py-1">
                    {exams.map((exam) => (
                        <ExamPickerRow
                            key={exam.id}
                            exam={exam}
                            category={category}
                            isAdded={selectedIds.has(exam.id)}
                            isFull={isFull && !selectedIds.has(exam.id)}
                            onAdd={onAdd}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ─── Main component ───────────────────────────────────────────────────────────

export const YourExams: React.FC = () => {
    const navigate = useNavigate();

    const [selectedExams, setSelectedExams] = useState<SelectedExam[]>(() => {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
        } catch {
            return [];
        }
    });

    const [pickerOpen, setPickerOpen] = useState(false);
    const [search, setSearch] = useState('');

    const selectedIds = useMemo(() => new Set(selectedExams.map((e) => e.examId)), [selectedExams]);
    const isFull = selectedExams.length >= MAX_EXAMS;

    const save = (updated: SelectedExam[]) => {
        setSelectedExams(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    };

    const handleAdd = (exam: Exam, category: ExamCategory) => {
        if (isFull || selectedIds.has(exam.id)) return;
        save([
            ...selectedExams,
            {
                examId: exam.id,
                examName: exam.name,
                examLogo: exam.logo,
                categoryId: category.id,
                categoryName: category.name,
            },
        ]);
    };

    const handleRemove = (examId: string) => {
        save(selectedExams.filter((e) => e.examId !== examId));
    };

    const handleExamClick = (exam: SelectedExam) => {
        navigate(`/student/tests/${exam.categoryId}/${exam.examId}`);
    };

    const filteredCategories = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return examCategories;
        return examCategories.filter((cat) => {
            const catMatch = cat.name.toLowerCase().includes(q);
            const examMatch = getExamsByCategory(cat.id).some((e) =>
                e.name.toLowerCase().includes(q)
            );
            return catMatch || examMatch;
        });
    }, [search]);

    return (
        <Card className="p-4 bg-card">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-primary/10 rounded-lg">
                        <BookMarked className="h-4 w-4 text-primary" />
                    </div>
                    <h3 className="font-semibold text-base">Your Exams</h3>
                    {selectedExams.length > 0 && (
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            {selectedExams.length}/{MAX_EXAMS}
                        </span>
                    )}
                </div>
                {!isFull && (
                    <button
                        onClick={() => setPickerOpen((v) => !v)}
                        className="flex items-center gap-1 text-xs text-primary font-medium hover:underline"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Add Exam
                    </button>
                )}
            </div>

            {/* Zero state */}
            {selectedExams.length === 0 && !pickerOpen && (
                <button
                    onClick={() => setPickerOpen(true)}
                    className="w-full flex flex-col items-center justify-center gap-2 py-8 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all group"
                >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Plus className="h-5 w-5 text-primary" />
                    </div>
                    <div className="text-center">
                        <p className="text-sm font-medium text-foreground">Add Your Exams</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Track up to {MAX_EXAMS} target exams</p>
                    </div>
                </button>
            )}

            {/* Selected exams — square card grid */}
            {selectedExams.length > 0 && (
                <div className="grid grid-cols-5 gap-2 mb-3">
                    {selectedExams.map((exam) => (
                        <div
                            key={exam.examId}
                            className="relative group flex flex-col items-center gap-1.5 p-2 pt-3 rounded-xl border border-border bg-white dark:bg-card hover:border-primary/40 hover:shadow-md transition-all cursor-pointer text-center"
                            onClick={() => handleExamClick(exam)}
                        >
                            {/* Remove button */}
                            <button
                                onClick={(e) => { e.stopPropagation(); handleRemove(exam.examId); }}
                                className="absolute top-1 right-1 w-4 h-4 rounded-full bg-muted flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive hover:text-destructive-foreground transition-all text-muted-foreground z-10"
                            >
                                <X className="h-2.5 w-2.5" />
                            </button>

                            {/* Logo */}
                            <div className="w-10 h-10 rounded-xl bg-muted/50 border border-border/50 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                                <img
                                    src={exam.examLogo}
                                    alt={exam.examName}
                                    className="w-7 h-7 object-contain"
                                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                />
                            </div>

                            {/* Name */}
                            <p className="text-[10px] font-medium text-foreground group-hover:text-primary transition-colors leading-tight line-clamp-2 w-full">
                                {exam.examName}
                            </p>

                            {/* Arrow on hover */}
                            <ArrowRight className="h-3 w-3 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                    ))}

                    {/* Empty slot placeholder(s) to fill up to MAX_EXAMS */}
                    {Array.from({ length: MAX_EXAMS - selectedExams.length }).map((_, i) => (
                        <button
                            key={`empty-${i}`}
                            onClick={() => setPickerOpen(true)}
                            className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl border-2 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-muted-foreground aspect-square"
                        >
                            <Plus className="h-4 w-4" />
                            <span className="text-[9px]">Add</span>
                        </button>
                    ))}
                </div>
            )}

            {/* Inline exam picker */}
            {pickerOpen && (
                <div className="mt-2 border border-border/60 rounded-xl overflow-hidden bg-card">
                    {/* Picker header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
                        <p className="text-sm font-medium">
                            {isFull ? (
                                <span className="text-amber-600">Max {MAX_EXAMS} exams reached</span>
                            ) : (
                                <span>Select exams <span className="text-muted-foreground font-normal">({selectedExams.length}/{MAX_EXAMS} added)</span></span>
                            )}
                        </p>
                        <button onClick={() => { setPickerOpen(false); setSearch(''); }} className="text-muted-foreground hover:text-foreground">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Search */}
                    <div className="px-3 py-2 border-b border-border/40 bg-muted/10">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                            <Input
                                placeholder="Search exams…"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-8 h-8 text-xs bg-card"
                                autoFocus
                            />
                        </div>
                    </div>

                    {/* Category list */}
                    <div className="max-h-72 overflow-y-auto p-3 space-y-2 scrollbar-hide">
                        {filteredCategories.map((cat) => (
                            <CategorySection
                                key={cat.id}
                                category={cat}
                                selectedIds={selectedIds}
                                isFull={isFull}
                                onAdd={handleAdd}
                                searchQuery={search.trim().toLowerCase()}
                            />
                        ))}
                        {filteredCategories.length === 0 && (
                            <p className="text-center text-sm text-muted-foreground py-6">No exams found for "{search}"</p>
                        )}
                    </div>
                </div>
            )}
        </Card>
    );
};
