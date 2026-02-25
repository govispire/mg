import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { CourseNavigation } from '@/components/student/courses/CourseNavigation';
import { MinimalistCourseCard } from '@/components/student/courses/MinimalistCourseCard';
import { WelcomeCourseBanner } from '@/components/student/courses/WelcomeCourseBanner';
import { CategoryExamGrid, CategoryHeader } from '@/components/student/courses/CategoryExamGrid';
import { InstructorCard } from '@/components/student/courses/InstructorCard';
import { CategorySelector } from '@/components/global/CategorySelector';
import { useCategoryFilteredCourses } from '@/hooks/useCategoryFilteredContent';
import { useExamCategoryContext } from '@/app/providers';
import { instructors } from '@/data/courseData';
import { examCategories as allExamCategories, getExamsByCategory } from '@/data/examData';
import {
  Search,
  Filter,
  SlidersHorizontal,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  Users,
  Play,
  ChevronRight,
  Sparkles,
  GraduationCap,
  LayoutGrid,
  List
} from 'lucide-react';

const StudentCourses = () => {
  const { courses: globalFilteredCourses, hasFilters, selectedCategories } = useCategoryFilteredCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeTab, setActiveTab] = useState('all');

  // Get all available exams from selected categories
  const availableExams = useMemo(() => {
    if (!selectedCategories || selectedCategories.length === 0) return [];

    let exams: any[] = [];
    selectedCategories.forEach(catId => {
      const categoryExams = getExamsByCategory(catId);
      const categoryInfo = allExamCategories.find(c => c.id === catId);

      if (categoryExams) {
        const enhancedExams = categoryExams.map(exam => ({
          ...exam,
          shortName: exam.name,
          courseCount: Math.floor(Math.random() * 10) + 5,
          studentCount: Math.floor(Math.random() * 5000) + 1000,
          color: categoryInfo?.colorClass || 'bg-blue-500',
          icon: categoryInfo?.logo || '📝' // Simplified icon fallback
        }));
        exams = [...exams, ...enhancedExams];
      }
    });
    return exams;
  }, [selectedCategories]);

  // Generate courses filter
  const filteredCourses = useMemo(() => {
    // Start with existing real courses
    let courses = [...globalFilteredCourses];

    // If query matches real courses, good.
    // But we also want to generate "courses" for exams that don't have real courses yet.

    const generatedCourses = availableExams
      .filter(exam => !globalFilteredCourses.some(c => c.id === exam.id))
      .map(exam => {
        // Check if we already have a course for this exam to avoid duplicates is a bit complex 
        // without standardized IDs, but let's assume globalFilteredCourses handles "real" content.
        // We'll add these as "Exam Prep" courses.
        return {
          id: exam.id, // Use strict exam ID instead of generated prefix to match routing logic if created later
          title: `${exam.name} Comprehensive Preparation 2025`,
          instructor: 'Top Rank Faculty',
          instructorId: 'faculty-1',
          category: selectedCategories[0] || 'general',
          categoryId: selectedCategories[0] || 'general',
          thumbnail: exam.logo || 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop',
          price: 1999,
          originalPrice: 3999,
          rating: 4.8,
          studentsCount: 1500 + Math.floor(Math.random() * 2000),
          duration: '6 Months',
          isPopular: exam.isPopular,
          isTrending: Math.random() > 0.7,
          type: 'Recorded' as const,
          subjects: ['General Awareness', 'Aptitude', 'English'],
          chaptersCount: 20,
          videosCount: 120,
          testsCount: 40,
          progress: 0
        };
      });

    // Combine real and generated
    // Filter duplicates if needed, but for now just concat
    // Prioritize real courses? Or mix them.
    courses = [...courses, ...generatedCourses];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      courses = courses.filter(course =>
        course.title.toLowerCase().includes(query) ||
        course.instructor.toLowerCase().includes(query)
      );
    }

    // Tab filter
    if (activeTab === 'trending') {
      courses = courses.filter(course => course.isTrending);
    } else if (activeTab === 'live') {
      courses = courses.filter(course => course.type === 'Live' as any); // Type cast workaround if needed
    } else if (activeTab === 'recorded') {
      courses = courses.filter(course => course.type === 'Recorded');
    }

    return courses;
  }, [globalFilteredCourses, searchQuery, activeTab, availableExams, selectedCategories]);

  // Get trending courses
  const trendingCourses = useMemo(() => {
    return filteredCourses.filter(course => course.isTrending).slice(0, 4);
  }, [filteredCourses]);

  // Get continue learning courses (real ones only preferably, or mocked with progress)
  const continueLearning = useMemo(() => {
    return globalFilteredCourses.filter(course => course.progress && course.progress > 0).slice(0, 3);
  }, [globalFilteredCourses]);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-8 max-w-7xl mx-auto">
      {/* Navigation */}
      <CourseNavigation
        items={[
          { label: 'Dashboard', href: '/student/dashboard' },
          { label: 'Courses', isActive: true }
        ]}
      />

      {/* Welcome Banner */}
      <WelcomeCourseBanner
        hasCategories={hasFilters}
        selectedCount={selectedCategories.length}
        courseCount={filteredCourses.length}
      />

      {/* Main Content */}
      {hasFilters || selectedCategories.length > 0 ? (
        <>
          {/* Continue Learning Section */}
          {continueLearning.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Play className="h-5 w-5 text-primary" />
                  Continue Learning
                </h2>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {continueLearning.map((course) => (
                  <MinimalistCourseCard key={course.id} course={course} variant="compact" />
                ))}
              </div>
            </section>
          )}

          {/* Exam Selection */}
          {availableExams.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Select Your Exam
                </h2>
                <Badge variant="outline" className="text-xs">
                  {availableExams.length} exams available
                </Badge>
              </div>
              <CategoryExamGrid
                exams={availableExams as any}
                selectedExam={selectedExam}
                onExamSelect={(id) => setSelectedExam(selectedExam === id ? null : id)}
              />
            </section>
          )}

          {/* Trending Courses */}
          {trendingCourses.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  Trending Now
                </h2>
                <Button variant="ghost" size="sm" className="text-xs">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <ScrollArea className="w-full">
                <div className="flex gap-4 pb-4">
                  {trendingCourses.map((course) => (
                    <div key={course.id} className="w-[280px] flex-shrink-0">
                      <MinimalistCourseCard course={course} />
                    </div>
                  ))}
                </div>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </section>
          )}

          {/* Search and Filters */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search courses by name, instructor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* View toggle */}
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('grid')}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="icon"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-muted/50 p-1 h-auto flex-wrap">
                <TabsTrigger value="all" className="text-xs px-3 py-1.5">
                  All Courses
                </TabsTrigger>
                <TabsTrigger value="trending" className="text-xs px-3 py-1.5">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Trending
                </TabsTrigger>
                <TabsTrigger value="live" className="text-xs px-3 py-1.5">
                  <span className="w-1.5 h-1.5 bg-red-500 rounded-full mr-1 animate-pulse" />
                  Live
                </TabsTrigger>
                <TabsTrigger value="recorded" className="text-xs px-3 py-1.5">
                  <Play className="h-3 w-3 mr-1" />
                  Recorded
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </section>

          {/* Course Grid */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm text-muted-foreground">
                Showing {filteredCourses.length} courses
              </p>
            </div>

            {filteredCourses.length === 0 ? (
              <Card className="p-12 text-center">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No courses found</h3>
                <p className="text-muted-foreground text-sm">
                  Try adjusting your search or filters
                </p>
              </Card>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {filteredCourses.map((course) => (
                  <MinimalistCourseCard key={course.id} course={course} />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map((course) => (
                  <MinimalistCourseCard key={course.id} course={course} variant="compact" />
                ))}
              </div>
            )}
          </section>

          {/* Expert Instructors */}
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Expert Instructors
              </h2>
              <Button variant="ghost" size="sm" className="text-xs">
                View All <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {instructors.slice(0, 3).map((instructor) => (
                <InstructorCard key={instructor.id} instructor={instructor} />
              ))}
            </div>
          </section>
        </>
      ) : (
        /* No categories selected - Show category exploration */
        <section className="space-y-6">
          <div className="text-center py-4">
            <h2 className="text-xl font-semibold text-foreground">Explore by Category</h2>
            <p className="text-muted-foreground mt-1">
              Browse courses across different exam categories
            </p>
          </div>

          {allExamCategories.slice(0, 8).map((category) => (
            /* Simplified view for when no category is selected. 
               Using imported categories. */
            <Card key={category.id} className="overflow-hidden">
              <div className={`${category.colorClass || 'bg-blue-600'} p-4 text-white`}>
                <div className="flex items-center gap-3">
                  <span className="text-3xl">📝</span>
                  <div>
                    <h3 className="text-lg font-bold">{category.name}</h3>
                    <p className="text-white/80 text-sm">{category.examsAvailable} exams available</p>
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <Button
                  className="w-full"
                  variant="outline"
                  onClick={() => window.location.href = '/student/category-selection'}
                >
                  Select this Category
                </Button>
              </CardContent>
            </Card>
          ))}

          {/* CTA to select categories */}
          <Card className="p-6 text-center bg-primary/5 border-primary/20">
            <Sparkles className="h-8 w-8 text-primary mx-auto mb-3" />
            <h3 className="text-lg font-semibold mb-2">Get Personalized Recommendations</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Select your target exams to see courses tailored for your preparation
            </p>
            <CategorySelector />
          </Card>
        </section>
      )}
    </div>
  );
};

export default StudentCourses;
