
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  BookOpen, Users, Zap, Star, ChevronRight, ChevronDown,
  ArrowUpDown, LayoutGrid, List
} from 'lucide-react';
import {
  getExamsByCategoryGrouped, examCategories, type GroupedExams,
  SBI_LOGO, SSC_LOGO, RAILWAY_LOGO, UPSC_LOGO, IBPS_LOGO, NIACL_LOGO
} from '@/data/examData';
import { useExamCategoryContext } from '@/app/providers';
import { useExamCatalog } from '@/hooks/useExamCatalog';

// ─── Helpers ──────────────────────────────────────────────────────────────────

const formatStudents = (n: number) => {
  if (n >= 100000) return `${(n / 1000).toFixed(0)}k`;
  if (n >= 1000) return `${(n / 1000).toFixed(0)}k`;
  return n.toString();
};

// Mocked per-exam stats (tests count + student count)
const EXAM_STATS: Record<string, { tests: number; students: number; subtitle: string }> = {
  'sbi-po':           { tests: 120, students: 85000,  subtitle: 'Prelims + Mains' },
  'sbi-clerk':        { tests: 100, students: 72000,  subtitle: 'Prelims + Mains' },
  'ibps-po':          { tests: 110, students: 68000,  subtitle: 'Prelims + Mains' },
  'ibps-clerk':       { tests: 90,  students: 55000,  subtitle: 'Prelims + Mains' },
  'ibps-rrb-po':      { tests: 80,  students: 47000,  subtitle: 'Prelims + Mains' },
  'ibps-rrb-clerk':   { tests: 80,  students: 44000,  subtitle: 'Prelims + Mains' },
  'rbi-grade-b':      { tests: 80,  students: 45000,  subtitle: 'Prelims + Mains' },
  'rbi-assistant':    { tests: 60,  students: 38000,  subtitle: 'Prelims + Mains' },
  'lic-aao':          { tests: 70,  students: 32000,  subtitle: 'Prelims + Mains' },
  'lic-ado':          { tests: 60,  students: 28000,  subtitle: 'Prelims + Mains' },
  'uiic-ao':          { tests: 50,  students: 18000,  subtitle: 'Prelims + Mains' },
  'niacl-ao':         { tests: 50,  students: 16000,  subtitle: 'Prelims + Mains' },
  'ssc-cgl':          { tests: 130, students: 92000,  subtitle: 'Tier I + II + III' },
  'ssc-chsl':         { tests: 100, students: 78000,  subtitle: 'Tier I + II' },
  'ssc-mts':          { tests: 70,  students: 54000,  subtitle: 'Paper I + II' },
  'ssc-gd':           { tests: 80,  students: 61000,  subtitle: 'CBT + PET/PST' },
  'rrb-ntpc':         { tests: 120, students: 88000,  subtitle: 'Stage I + II' },
  'rrb-group-d':      { tests: 90,  students: 75000,  subtitle: 'CBT + PET' },
  'rrb-alp':          { tests: 80,  students: 46000,  subtitle: 'Stage I + II' },
  'rrb-je':           { tests: 70,  students: 38000,  subtitle: 'Stage I + II' },
  'upsc-cse':         { tests: 150, students: 62000,  subtitle: 'Prelims + Mains' },
  'upsc-cds':         { tests: 80,  students: 32000,  subtitle: 'Written + Interview' },
  'upsc-nda':         { tests: 90,  students: 41000,  subtitle: 'Written + SSB' },
  'upsc-capf':        { tests: 60,  students: 24000,  subtitle: 'Paper I + II' },
  'default':          { tests: 60,  students: 15000,  subtitle: 'Full Syllabus' },
};

const getExamStats = (id: string) => EXAM_STATS[id] ?? EXAM_STATS['default'];

// ─── Component ────────────────────────────────────────────────────────────────

const StudentTests = () => {
  const { category } = useParams();
  const navigate = useNavigate();
  const { selectedCategories, hasSelectedCategories } = useExamCategoryContext();
  const { catalog } = useExamCatalog();
  const [activeCategory, setActiveCategory] = useState('');
  const [sortOrder, setSortOrder] = useState<'az' | 'za' | 'popular'>('popular');
  const [showAll, setShowAll] = useState(false);
  const INITIAL_SHOW = 10;

  useEffect(() => {
    if (selectedCategories.length > 0) {
      if (category && selectedCategories.includes(category)) {
        setActiveCategory(category);
      } else {
        const first = selectedCategories[0];
        setActiveCategory(first);
        if (!category || !selectedCategories.includes(category)) {
          navigate(`/student/tests/${first}`, { replace: true });
        }
      }
    } else {
      setActiveCategory('');
    }
  }, [category, selectedCategories, navigate]);

  // Reset show-all when tab changes
  useEffect(() => { setShowAll(false); }, [activeCategory]);

  const availableCategories = selectedCategories.map(selectedId => {
    const catalogCat = catalog.find(c => c.id === selectedId);
    if (catalogCat) {
      if (!catalogCat.isVisible) return null;
      return {
        id: catalogCat.id, name: catalogCat.name, description: catalogCat.description,
        logo: catalogCat.logo, studentsEnrolled: catalogCat.studentsEnrolled,
        examsAvailable: catalogCat.examsAvailable, colorClass: catalogCat.colorClass,
        isPopular: catalogCat.isPopular,
      };
    }
    const found = examCategories.find(cat => cat.id === selectedId);
    if (found) return found;
    return {
      id: selectedId, name: getCategoryDisplayName(selectedId),
      description: getCategoryDescription(selectedId), logo: getCategoryLogo(selectedId),
      studentsEnrolled: 0, examsAvailable: 0, colorClass: 'bg-gray-50 border-gray-200', isPopular: false,
    };
  }).filter(Boolean);

  if (!hasSelectedCategories) {
    return (
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center py-16">
          <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <BookOpen className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No Exam Categories Selected</h2>
          <p className="text-gray-500 mb-6">Select exam categories to explore tests and practice materials.</p>
        </div>
      </div>
    );
  }

  const handleTabChange = (value: string) => {
    setActiveCategory(value);
    navigate(`/student/tests/${value}`);
  };

  // ── Category Content ────────────────────────────────────────────────────────
  const CategoryContent = ({ categoryId }: { categoryId: string }) => {
    const categoryData = availableCategories.find(cat => cat.id === categoryId);
    const catalogCat = catalog.find(c => c.id === categoryId);
    if (!categoryData) return null;

    const headerLogo = catalogCat?.logo || categoryData.logo;

    const catalogExamCount = catalogCat
      ? catalogCat.sections.reduce((a, s) => a + s.exams.length, 0) : 0;
    const groupedExams: GroupedExams = getExamsByCategoryGrouped(categoryId);
    const staticExamCount = groupedExams.sections.reduce((t, s) => t + s.exams.length, 0);
    const totalExamCount = catalogCat ? catalogExamCount : staticExamCount;

    // Flatten all exams across sections
    const rawSections = catalogCat && catalogCat.sections.length > 0
      ? catalogCat.sections.map(s => ({ categoryId: s.id, categoryName: s.name, logo: '', exams: s.exams }))
      : groupedExams.sections;

    const allExams = rawSections.flatMap(s => s.exams);

    // Popular = first 5 that have isPopular true, or just first 5
    const popularExams = allExams.filter(e => e.isPopular).slice(0, 5).length >= 2
      ? allExams.filter(e => e.isPopular).slice(0, 5)
      : allExams.slice(0, 5);

    // Sorted list
    const sortedExams = [...allExams].sort((a, b) => {
      if (sortOrder === 'az') return a.name.localeCompare(b.name);
      if (sortOrder === 'za') return b.name.localeCompare(a.name);
      // popular first
      if (a.isPopular && !b.isPopular) return -1;
      if (!a.isPopular && b.isPopular) return 1;
      return 0;
    });

    const displayedExams = showAll ? sortedExams : sortedExams.slice(0, INITIAL_SHOW);

    return (
      <div className="space-y-6">
        {/* ── Category Header Banner ─────────────────────────────────────── */}
        <div className="rounded-xl border border-emerald-200 shadow-sm p-5 sm:p-7 overflow-hidden relative"
          style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 40%, #e0f2fe 100%)' }}
        >
          {/* Decorative blobs */}
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full bg-emerald-100 opacity-40 pointer-events-none" />
          <div className="absolute -bottom-8 right-24 w-24 h-24 rounded-full bg-teal-100 opacity-30 pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center gap-4 relative z-10">
            {/* Logo */}
            <div className="w-16 h-16 rounded-2xl bg-white/80 border border-emerald-200 shadow-sm flex items-center justify-center flex-shrink-0 backdrop-blur-sm">
              <img
                src={headerLogo}
                alt={categoryData.name}
                className="w-10 h-10 object-contain"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            </div>
            {/* Title + description */}
            <div className="flex-1 min-w-0">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{categoryData.name}</h1>
              <p className="text-sm text-gray-500 mt-0.5 line-clamp-1">{categoryData.description}</p>
              {/* Chips row */}
              <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-700">
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <strong className="text-gray-900">{totalExamCount}</strong> Exams
                </span>
                <span className="flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-emerald-600" />
                  <strong className="text-gray-900">{totalExamCount * 10}</strong> Mock Tests
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <strong className="text-gray-900">{formatStudents(categoryData.studentsEnrolled)}</strong> Students
                </span>
                <span className="flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-emerald-600" />
                  Updated Daily
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Popular Exams ──────────────────────────────────────────────── */}
        {popularExams.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900 flex items-center gap-2">
                <Star className="w-4 h-4 text-emerald-600 fill-emerald-600" />
                Popular Exams
              </h2>
              <button
                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-0.5"
                onClick={() => setShowAll(true)}
              >
                View all <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {popularExams.map(exam => {
                const stats = getExamStats(exam.id);
                return (
                  <div
                    key={exam.id}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex flex-col gap-3 hover:bg-white hover:shadow-md hover:border-gray-300 transition-all"
                  >
                    {/* Exam identity */}
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                        <img
                          src={exam.logo}
                          alt={exam.name}
                          className="w-7 h-7 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm leading-snug">{exam.name}</div>
                        <div className="text-xs text-gray-400 mt-0.5">{stats.subtitle}</div>
                      </div>
                    </div>

                    {/* Stats */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                        <strong className="text-gray-800">{stats.tests}</strong> Tests
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-gray-600">
                        <Users className="w-3.5 h-3.5 text-emerald-600" />
                        <strong className="text-gray-800">{formatStudents(stats.students)}</strong> Students
                      </div>
                    </div>

                    {/* CTA */}
                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium mt-auto"
                      onClick={() => navigate(`/student/tests/${categoryId}/${exam.id}`)}
                    >
                      Start Practice
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── All Exams List ─────────────────────────────────────────────── */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">
              All {categoryData.name.split('+')[0].trim()} Exams
            </h2>
            {/* Sort dropdown */}
            <div className="relative">
              <select
                value={sortOrder}
                onChange={e => setSortOrder(e.target.value as 'az' | 'za' | 'popular')}
                className="appearance-none border border-gray-200 rounded-lg text-sm py-1.5 pl-3 pr-8 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                <option value="popular">Sort: Popular</option>
                <option value="az">Sort: A to Z</option>
                <option value="za">Sort: Z to A</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 text-gray-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {allExams.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
              <BookOpen className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">No tests found for this category.</p>
            </div>
          ) : (
            <>
              {/* Multi-section label (for combos) */}
              {groupedExams.isGrouped && groupedExams.sections.length > 1 ? (
                <div className="space-y-4">
                  {rawSections.map(section => {
                    const sectionSorted = [...section.exams].sort((a, b) => {
                      if (sortOrder === 'az') return a.name.localeCompare(b.name);
                      if (sortOrder === 'za') return b.name.localeCompare(a.name);
                      if (a.isPopular && !b.isPopular) return -1;
                      if (!a.isPopular && b.isPopular) return 1;
                      return 0;
                    });
                    return (
                      <div key={section.categoryId}>
                        <div className="flex items-center gap-2 mb-2 border-b pb-2">
                          {section.logo && (
                            <img src={section.logo} alt={section.categoryName}
                              className="w-5 h-5 object-contain" />
                          )}
                          <span className="text-sm font-semibold text-gray-700">{section.categoryName}</span>
                          <Badge variant="secondary" className="text-xs ml-auto">{section.exams.length} exams</Badge>
                        </div>
                        <AllExamsList
                          exams={sectionSorted}
                          categoryId={categoryId}
                          onNavigate={navigate}
                        />
                      </div>
                    );
                  })}
                </div>
              ) : (
                <>
                  <AllExamsList
                    exams={displayedExams}
                    categoryId={categoryId}
                    onNavigate={navigate}
                  />
                  {!showAll && sortedExams.length > INITIAL_SHOW && (
                    <button
                      onClick={() => setShowAll(true)}
                      className="w-full mt-4 py-3 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 flex items-center justify-center gap-2 transition-colors"
                    >
                      View more exams <ChevronDown className="w-4 h-4" />
                    </button>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 space-y-0">
      {availableCategories.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <Tabs value={activeCategory} onValueChange={handleTabChange}>
            {/* Tab list */}
            <div className="border-b px-4 sm:px-6 pt-4">
              <TabsList
                className="flex w-full gap-1 bg-transparent p-0 overflow-x-auto"
                style={{ scrollbarWidth: 'none' }}
              >
                {availableCategories.map(cat => (
                  <TabsTrigger
                    key={cat.id}
                    value={cat.id}
                    className={`
                      text-xs sm:text-sm px-3 sm:px-5 py-2 whitespace-nowrap font-medium rounded-none border-b-2
                      data-[state=active]:border-emerald-600 data-[state=active]:text-emerald-700
                      data-[state=inactive]:border-transparent data-[state=inactive]:text-gray-500
                      data-[state=inactive]:hover:text-gray-700 bg-transparent
                      ${availableCategories.length <= 4 ? 'flex-1' : 'flex-shrink-0'}
                    `}
                  >
                    {cat.name}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {availableCategories.map(cat => (
              <TabsContent key={cat.id} value={cat.id} className="p-4 sm:p-6">
                <CategoryContent categoryId={cat.id} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      )}
    </div>
  );
};

// ─── Compact Exam Row List ─────────────────────────────────────────────────────

interface AllExamsListProps {
  exams: { id: string; name: string; logo: string; isPopular: boolean }[];
  categoryId: string;
  onNavigate: (path: string) => void;
}

const AllExamsList = ({ exams, categoryId, onNavigate }: AllExamsListProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
      {exams.map((exam) => {
        const stats = getExamStats(exam.id);
        return (
          <div
            key={exam.id}
            className="bg-gray-50 rounded-xl border border-gray-200 p-4 flex flex-col gap-3 hover:bg-white hover:shadow-md hover:border-gray-300 transition-all"
          >
            {/* Exam identity */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white border border-gray-200 flex items-center justify-center flex-shrink-0 shadow-sm">
                <img
                  src={exam.logo}
                  alt={exam.name}
                  className="w-6 h-6 object-contain"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 text-sm truncate leading-snug">{exam.name}</div>
                <div className="text-xs text-gray-400 mt-0.5">{stats.subtitle}</div>
              </div>
            </div>

            {/* Stats */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <BookOpen className="w-3.5 h-3.5 text-emerald-600" />
                <strong className="text-gray-800">{stats.tests}</strong> Tests
              </div>
              <div className="flex items-center gap-1.5 text-xs text-gray-600">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <strong className="text-gray-800">{formatStudents(stats.students)}</strong> Students
              </div>
            </div>

            {/* CTA */}
            <button
              onClick={() => onNavigate(`/student/tests/${categoryId}/${exam.id}`)}
              className="w-full mt-auto py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
            >
              View Tests
            </button>
          </div>
        );
      })}
    </div>
  );
};



// ─── Category display helpers ──────────────────────────────────────────────────

const getCategoryDisplayName = (id: string) => ({
  'banking-ssc-railway-combo': 'Banking + SSC + Railway',
  'ssc-railway-combo': 'SSC + Railway',
  'upsc-tnpsc-combo': 'UPSC + TNPSC',
  'ssc-railway-defence-combo': 'SSC + Railway + Defence',
}[id] ?? id);

const getCategoryDescription = (id: string) => ({
  'banking-ssc-railway-combo': 'Combined prep for all major govt exams',
  'ssc-railway-combo': 'Optimized prep for both exam types',
  'upsc-tnpsc-combo': 'National and TN state civil services',
  'ssc-railway-defence-combo': 'Govt & defense services combined',
}[id] ?? 'Comprehensive exam preparation');

const getCategoryLogo = (id: string) => ({
  'banking-ssc-railway-combo': IBPS_LOGO,
  'ssc-railway-combo': SSC_LOGO,
  'upsc-tnpsc-combo': UPSC_LOGO,
  'ssc-railway-defence-combo': SSC_LOGO,
}[id] ?? NIACL_LOGO);

export default StudentTests;
