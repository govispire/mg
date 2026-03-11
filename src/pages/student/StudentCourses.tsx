import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CourseNavigation } from '@/components/student/courses/CourseNavigation';
import { useCategoryFilteredCourses } from '@/hooks/useCategoryFilteredContent';
import { courses as allCourses, courseCategories } from '@/data/courseData';
import {
  Search,
  BookOpen,
  TrendingUp,
  Clock,
  Star,
  Users,
  Play,
  ChevronRight,
  ShoppingCart,
  Award,
  Video,
  FileText,
  Flame,
  CheckCircle,
  Tag,
  Zap,
} from 'lucide-react';

// ── Course type chip colors ──────────────────────────────────────────────────
const typeColor: Record<string, string> = {
  Complete: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Prelims: 'bg-blue-100 text-blue-700 border-blue-200',
  Mains: 'bg-purple-100 text-purple-700 border-purple-200',
  Interview: 'bg-orange-100 text-orange-700 border-orange-200',
};

// ── Single Course Card ───────────────────────────────────────────────────────
const CourseCard: React.FC<{ course: (typeof allCourses)[0] }> = ({ course }) => {
  const navigate = useNavigate();
  const goToCourse = () => navigate(`/student/courses/${course.id}`);
  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  return (
    <div className="bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-200 group flex flex-col">
      {/* Thumbnail */}
      <div className="relative overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-40 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        {/* Overlay badges */}
        <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
          {course.isTrending && (
            <span className="bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Flame className="h-2.5 w-2.5" /> Trending
            </span>
          )}
          {course.isPopular && (
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <Zap className="h-2.5 w-2.5" /> Popular
            </span>
          )}
        </div>
        {discount > 0 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            {discount}% OFF
          </div>
        )}
        {course.progress ? (
          <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-1.5">
            <div className="flex items-center justify-between text-white text-xs mb-1">
              <span>Your Progress</span>
              <span className="font-medium">{course.progress}%</span>
            </div>
            <div className="h-1.5 bg-white/30 rounded-full">
              <div className="h-full bg-green-400 rounded-full" style={{ width: `${course.progress}%` }} />
            </div>
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        {/* Type + Rating */}
        <div className="flex items-center justify-between">
          <Badge variant="outline" className={`text-[10px] px-2 ${typeColor[course.type] || ''}`}>
            {course.type}
          </Badge>
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <Star className="h-3 w-3 fill-amber-400" />
            <span className="font-semibold text-gray-700">{course.rating}</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-sm leading-snug text-gray-800 group-hover:text-primary transition-colors line-clamp-2">{course.title}</h3>

        {/* Instructor */}
        <p className="text-xs text-gray-500 flex items-center gap-1">
          <Award className="h-3 w-3 text-primary" />
          {course.instructor}
        </p>

        {/* Stats row */}
        <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
          <span className="flex items-center gap-1"><Video className="h-3 w-3" />{course.videosCount} Videos</span>
          <span className="flex items-center gap-1"><FileText className="h-3 w-3" />{course.testsCount} Tests</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
          <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.studentsCount.toLocaleString()}</span>
        </div>

        {/* Price + CTA */}
        <div className="mt-auto pt-3 border-t flex items-center justify-between gap-2">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-lg font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
              {course.originalPrice && (
                <span className="text-xs text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
              )}
            </div>
          </div>
          <Button size="sm" className="gap-1.5 text-xs h-8 px-3 shrink-0" onClick={goToCourse}>
            {course.progress ? (
              <><Play className="h-3 w-3" /> Continue</>
            ) : (
              <><ShoppingCart className="h-3 w-3" /> Enroll Now</>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

// ── What's included strip ────────────────────────────────────────────────────
const IncludesStrip = () => (
  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
    {[
      { icon: <Video className="h-5 w-5 text-blue-600" />, label: 'HD Video Lectures', color: 'bg-blue-50 border-blue-100' },
      { icon: <FileText className="h-5 w-5 text-green-600" />, label: 'Practice Tests', color: 'bg-green-50 border-green-100' },
      { icon: <Users className="h-5 w-5 text-purple-600" />, label: 'Live Doubt Sessions', color: 'bg-purple-50 border-purple-100' },
      { icon: <Award className="h-5 w-5 text-orange-600" />, label: 'Expert Faculty', color: 'bg-orange-50 border-orange-100' },
    ].map(({ icon, label, color }) => (
      <div key={label} className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 ${color}`}>
        {icon}
        <span className="text-xs font-medium text-gray-700">{label}</span>
      </div>
    ))}
  </div>
);

// ── Main Component ───────────────────────────────────────────────────────────
const StudentCourses = () => {
  const { selectedCategories } = useCategoryFilteredCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('all');

  // Build unique exam options from data
  const examOptions = useMemo(() => {
    const catMap: Record<string, string> = {
      banking: 'Banking',
      ssc: 'SSC',
      railway: 'Railway',
      upsc: 'UPSC',
      tnpsc: 'TNPSC',
      defence: 'Defence',
    };
    const cats = [...new Set(allCourses.map(c => c.category))];
    return cats.map(id => ({ id, label: catMap[id] || id.toUpperCase() }));
  }, []);

  // Category-grouped + filtered courses
  const groupedCourses = useMemo(() => {
    let filtered = allCourses;

    // Category filter from global context
    if (selectedCategories && selectedCategories.length > 0) {
      filtered = filtered.filter(c =>
        selectedCategories.some(cat => c.category === cat || c.category.includes(cat))
      );
    }

    // Exam (category) dropdown filter
    if (selectedExam !== 'all') {
      filtered = filtered.filter(c => c.category === selectedExam);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    // Group by category
    const groups: Record<string, typeof allCourses> = {};
    for (const course of filtered) {
      if (!groups[course.category]) groups[course.category] = [];
      groups[course.category].push(course);
    }
    return groups;
  }, [allCourses, selectedExam, searchQuery, selectedCategories]);

  const totalResults = Object.values(groupedCourses).flat().length;
  const catLabels: Record<string, string> = {
    banking: '🏦 Banking Exams',
    ssc: '📋 SSC Exams',
    railway: '🚂 Railway Exams',
    upsc: '🏛️ UPSC Exams',
    tnpsc: '📜 TNPSC Exams',
    defence: '🛡️ Defence Exams',
  };

  return (
    <div className="p-4 md:p-6 space-y-6 pb-10 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <CourseNavigation items={[{ label: 'Dashboard', href: '/student/dashboard' }, { label: 'Courses', isActive: true }]} />

      {/* Hero Banner */}
      <div className="bg-gradient-to-br from-primary via-primary/90 to-blue-700 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 1px, transparent 0)', backgroundSize: '30px 30px' }} />
        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <p className="text-primary-foreground/70 text-sm font-medium mb-1 flex items-center gap-1.5">
              <Zap className="h-4 w-4" /> Personalised for You
            </p>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight">Find Your Perfect Course</h1>
            <p className="text-white/75 text-sm mt-1">
              {totalResults > 0 ? `${totalResults} courses available` : 'Select an exam to explore courses'}
            </p>
          </div>
          <div className="flex gap-6 shrink-0">
            {[
              { value: '50+', label: 'Instructors' },
              { value: '2L+', label: 'Students' },
              { value: '100%', label: 'Results' },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-extrabold">{value}</p>
                <p className="text-xs text-white/70">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* What's Included */}
      <IncludesStrip />

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        {/* Exam Dropdown */}
        <div className="sm:w-64 shrink-0">
          <Select value={selectedExam} onValueChange={setSelectedExam}>
            <SelectTrigger className="h-10 text-sm font-medium bg-white border-gray-200">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary shrink-0" />
                <SelectValue placeholder="Select Exam Category" />
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">
                <span className="font-medium">All Exams</span>
              </SelectItem>
              {examOptions.map(e => (
                <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search courses, instructors..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10 h-10 bg-white"
          />
        </div>

        {/* Results count */}
        {totalResults > 0 && (
          <span className="text-sm text-muted-foreground whitespace-nowrap self-center">
            {totalResults} courses
          </span>
        )}
      </div>

      {/* Empty State */}
      {totalResults === 0 && (
        <Card className="p-12 text-center border-dashed">
          <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-1">No courses found</h3>
          <p className="text-sm text-muted-foreground">Try selecting a different exam or clearing your search</p>
          <Button variant="outline" size="sm" className="mt-4" onClick={() => { setSelectedExam('all'); setSearchQuery(''); }}>
            Clear Filters
          </Button>
        </Card>
      )}

      {/* Courses by Category */}
      {Object.entries(groupedCourses).map(([cat, catCourses]) => (
        <section key={cat} className="space-y-4">
          {/* Section header */}
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <span>{catLabels[cat] || cat.toUpperCase()}</span>
              <Badge variant="secondary" className="text-xs">{catCourses.length} courses</Badge>
            </h2>
            <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary">
              View All <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Course grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {catCourses.map(course => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </section>
      ))}

      {/* Trust strip at bottom */}
      {totalResults > 0 && (
        <div className="border rounded-xl p-4 bg-gray-50 flex flex-wrap items-center justify-center gap-6 text-xs text-gray-600">
          {[
            { icon: <CheckCircle className="h-4 w-4 text-green-500" />, text: 'Secure Payment' },
            { icon: <Tag className="h-4 w-4 text-blue-500" />, text: 'Best Price Guaranteed' },
            { icon: <Clock className="h-4 w-4 text-orange-500" />, text: 'Lifetime Access' },
            { icon: <TrendingUp className="h-4 w-4 text-purple-500" />, text: '95% Selection Rate' },
          ].map(({ icon, text }) => (
            <div key={text} className="flex items-center gap-1.5 font-medium">
              {icon} {text}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentCourses;
