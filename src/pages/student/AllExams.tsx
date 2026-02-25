import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Search,
    ChevronDown,
    ChevronUp,
    BookOpen,
    TrendingUp,
    Users,
} from 'lucide-react';
import {
    examCategories,
    getExamsByCategory,
    type ExamCategory,
    type Exam,
} from '@/data/examData';

// ─── helpers ────────────────────────────────────────────────────────────────

// Map category id → navigation base (matches the ids that StudentTests knows)
const getCategoryNavId = (catId: string) => catId;

// ─── Sub-component: single exam row ─────────────────────────────────────────

const ExamRow: React.FC<{
    exam: Exam;
    categoryId: string;
    onNavigate: (categoryId: string, examId: string) => void;
}> = ({ exam, categoryId, onNavigate }) => (
    <div
        onClick={() => onNavigate(categoryId, exam.id)}
        className="flex items-center justify-between px-4 py-3 rounded-xl border border-border/60 bg-white dark:bg-card hover:bg-primary/5 hover:border-primary/30 hover:shadow-sm transition-all duration-150 cursor-pointer group"
    >
        <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 flex-shrink-0 rounded-lg bg-muted/60 border border-border/50 flex items-center justify-center overflow-hidden">
                <img
                    src={exam.logo}
                    alt={exam.name}
                    className="w-7 h-7 object-contain"
                    onError={(e) => {
                        (e.target as HTMLImageElement).style.display = 'none';
                    }}
                />
            </div>
            <span className="text-sm font-medium text-foreground group-hover:text-primary transition-colors truncate">
                {exam.name}
            </span>
            {exam.isPopular && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0 flex-shrink-0">
                    Popular
                </Badge>
            )}
        </div>
        <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs flex-shrink-0 ml-3 group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary transition-colors"
        >
            View Tests
        </Button>
    </div>
);

// ─── Sub-component: category accordion card ──────────────────────────────────

const CategoryCard: React.FC<{
    category: ExamCategory;
    exams: Exam[];
    defaultOpen?: boolean;
    onNavigate: (categoryId: string, examId: string) => void;
}> = ({ category, exams, defaultOpen = false, onNavigate }) => {
    const [open, setOpen] = useState(defaultOpen);

    if (exams.length === 0) return null;

    return (
        <Card className="overflow-hidden shadow-sm border border-border/60">
            {/* Category Header */}
            <button
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center gap-4 px-5 py-4 bg-card hover:bg-muted/40 transition-colors"
            >
                {/* Logo */}
                <div className="w-11 h-11 rounded-xl border border-border/60 bg-white flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm">
                    <img
                        src={category.logo}
                        alt={category.name}
                        className="w-8 h-8 object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                        }}
                    />
                </div>

                {/* Text */}
                <div className="flex-1 text-left min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-sm text-foreground">{category.name}</h3>
                        {category.isPopular && (
                            <Badge className="text-[10px] px-1.5 py-0 bg-primary/10 text-primary border-primary/20">
                                Popular
                            </Badge>
                        )}
                    </div>
                    <div className="flex items-center gap-3 mt-0.5 text-[11px] text-muted-foreground">
                        <span className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3" />
                            {exams.length} exams
                        </span>
                        <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {category.studentsEnrolled.toLocaleString()} students
                        </span>
                    </div>
                </div>

                {/* Chevron */}
                <div className="flex-shrink-0 text-muted-foreground">
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </div>
            </button>

            {/* Exam list */}
            {open && (
                <div className="px-5 pb-4 pt-1 space-y-2 bg-muted/20 border-t border-border/40">
                    {exams.map((exam) => (
                        <ExamRow
                            key={exam.id}
                            exam={exam}
                            categoryId={getCategoryNavId(category.id)}
                            onNavigate={onNavigate}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
};

// ─── Main page ───────────────────────────────────────────────────────────────

const AllExams: React.FC = () => {
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    // Pre-compute exams per category (skip empty ones)
    const categoriesWithExams = useMemo(
        () =>
            examCategories
                .map((cat) => ({ cat, exams: getExamsByCategory(cat.id) }))
                .filter(({ exams }) => exams.length > 0),
        []
    );

    // Filter by search query
    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return categoriesWithExams;
        return categoriesWithExams
            .map(({ cat, exams }) => ({
                cat,
                exams: exams.filter(
                    (e) =>
                        e.name.toLowerCase().includes(q) ||
                        cat.name.toLowerCase().includes(q)
                ),
            }))
            .filter(({ exams }) => exams.length > 0);
    }, [search, categoriesWithExams]);

    const totalExams = categoriesWithExams.reduce((s, { exams }) => s + exams.length, 0);

    const handleNavigate = (categoryId: string, examId: string) => {
        navigate(`/student/tests/${categoryId}/${examId}`);
    };

    return (
        <div className="p-4 sm:p-6 max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="space-y-1">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-primary/10 rounded-xl">
                        <TrendingUp className="h-5 w-5 text-primary" />
                    </div>
                    <h1 className="text-xl font-bold text-foreground">All Exams</h1>
                </div>
                <p className="text-sm text-muted-foreground pl-1">
                    Browse {categoriesWithExams.length} categories · {totalExams} exams
                </p>
            </div>

            {/* Search */}
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search exams or categories…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-9 h-10 bg-card"
                />
            </div>

            {/* Results */}
            {filtered.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                    <BookOpen className="h-12 w-12 mx-auto mb-3 opacity-30" />
                    <p className="font-medium">No exams found for "{search}"</p>
                    <p className="text-sm mt-1">Try a different search term</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filtered.map(({ cat, exams }, idx) => (
                        <CategoryCard
                            key={cat.id}
                            category={cat}
                            exams={exams}
                            defaultOpen={idx === 0 && !search}
                            onNavigate={handleNavigate}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default AllExams;
