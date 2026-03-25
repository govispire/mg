import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CourseNavigation } from '@/components/student/courses/CourseNavigation';
import { CoursePreviewModal } from '@/components/student/courses/CoursePreviewModal';
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
  Eye,
  GraduationCap,
  BookmarkCheck,
  ArrowRight,
  Layers,
} from 'lucide-react';

// ── Course type chip colors ──────────────────────────────────────────────────
const typeColor: Record<string, string> = {
  Complete: 'bg-emerald-100 text-emerald-700 border-emerald-200',
  Prelims: 'bg-blue-100 text-blue-700 border-blue-200',
  Mains: 'bg-purple-100 text-purple-700 border-purple-200',
  Interview: 'bg-orange-100 text-orange-700 border-orange-200',
};

// ── Subcategory color accents (cycles through palette) ─────────────────────
const subcategoryColors: string[] = [
  'border-l-blue-500',
  'border-l-purple-500',
  'border-l-emerald-500',
  'border-l-orange-500',
  'border-l-rose-500',
  'border-l-teal-500',
  'border-l-amber-500',
  'border-l-indigo-500',
];

// ── Category display labels ───────────────────────────────────────────────
const catLabels: Record<string, string> = {
  banking: '🏦 Banking & Insurance Exams',
  ssc: '📋 SSC Exams',
  railway: '🚂 Railway Exams',
  upsc: '🏛️ UPSC Exams',
  tnpsc: '📜 TNPSC Exams',
  defence: '🛡️ Defence Exams',
};

// ── Single Course Card ───────────────────────────────────────────────────────
const CourseCard: React.FC<{
  course: (typeof allCourses)[0];
  onPreview: (course: (typeof allCourses)[0]) => void;
  onEnroll: (courseId: string) => void;
  isEnrolled?: boolean;
}> = ({ course, onPreview, onEnroll, isEnrolled }) => {
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
          className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300"
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
      <div className="p-4 flex flex-col flex-1 gap-2.5">
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
        <div className="mt-auto pt-3 border-t space-y-2.5">
          {/* Price */}
          <div className="flex items-baseline gap-1.5">
            <span className="text-lg font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
            {course.originalPrice && (
              <span className="text-xs text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
            )}
          </div>
          {/* Buttons */}
          {course.progress || isEnrolled ? (
            <Button size="sm" className="w-full gap-1.5 text-xs h-8" onClick={goToCourse}>
              <Play className="h-3 w-3" /> Continue
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                variant="outline"
                className="w-full gap-1 text-xs h-8 border-primary text-primary hover:bg-primary/10"
                onClick={(e) => { e.stopPropagation(); onPreview(course); }}
              >
                <Eye className="h-3 w-3" /> Preview
              </Button>
              <Button size="sm" className="w-full gap-1 text-xs h-8" onClick={(e) => { e.stopPropagation(); onEnroll(course.id); navigate(`/student/courses/${course.id}`); }}>
                <ShoppingCart className="h-3 w-3" /> Enroll
              </Button>
            </div>
          )}
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
  const navigate = useNavigate();
  const { selectedCategories } = useCategoryFilteredCourses();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExam, setSelectedExam] = useState<string>('all');
  const [previewCourse, setPreviewCourse] = useState<(typeof allCourses)[0] | null>(null);

  // Enrollment tracking (localStorage)
  const [enrolledIds, setEnrolledIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('enrolledCourseIds') || '[]');
    } catch { return []; }
  });
  useEffect(() => {
    localStorage.setItem('enrolledCourseIds', JSON.stringify(enrolledIds));
  }, [enrolledIds]);

  const handleEnroll = (courseId: string) => {
    setEnrolledIds(prev => prev.includes(courseId) ? prev : [...prev, courseId]);
  };

  // Enrolled courses (from data progress OR manually enrolled)
  const enrolledCourses = useMemo(() =>
    allCourses.filter(c => c.progress || enrolledIds.includes(c.id)),
  [enrolledIds]);

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

  const enrolledSet = useMemo(() => new Set(enrolledCourses.map(c => c.id)), [enrolledCourses]);

  // Build grouped structure: category → subcategory → courses[]
  const groupedData = useMemo(() => {
    let filtered = allCourses.filter(c => !enrolledSet.has(c.id));

    // Global category context filter
    if (selectedCategories && selectedCategories.length > 0) {
      filtered = filtered.filter(c =>
        selectedCategories.some(cat => c.category === cat || c.category.includes(cat))
      );
    }

    // Exam dropdown filter
    if (selectedExam !== 'all') {
      filtered = filtered.filter(c => c.category === selectedExam);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(c =>
        c.title.toLowerCase().includes(q) ||
        c.instructor.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q) ||
        c.subcategory.toLowerCase().includes(q)
      );
    }

    // Group: category → subcategory → courses
    const catMap: Record<string, Record<string, typeof allCourses>> = {};
    for (const course of filtered) {
      if (!catMap[course.category]) catMap[course.category] = {};
      if (!catMap[course.category][course.subcategory]) catMap[course.category][course.subcategory] = [];
      catMap[course.category][course.subcategory].push(course);
    }
    return catMap;
  }, [selectedExam, searchQuery, selectedCategories, enrolledSet]);

  const totalResults = Object.values(groupedData)
    .flatMap(subMap => Object.values(subMap))
    .flat().length;

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
            placeholder="Search courses, instructors, subcategories..."
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

      {/* ── YOUR ENROLLED COURSES ── */}
      {enrolledCourses.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <GraduationCap className="h-5 w-5 text-primary" />
            <h2 className="text-base font-bold text-gray-900">Your Enrolled Courses</h2>
            <Badge className="text-xs bg-primary/10 text-primary border-primary/20">{enrolledCourses.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {enrolledCourses.map(course => (
              <div
                key={course.id}
                className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all group cursor-pointer"
                onClick={() => navigate(`/student/courses/${course.id}`)}
              >
                <div className="relative overflow-hidden">
                  <img src={course.thumbnail} alt={course.title} className="w-full h-36 object-cover group-hover:scale-105 transition-transform duration-300" />
                  <div className="absolute top-2 left-2">
                    <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                      <BookmarkCheck className="h-2.5 w-2.5" /> Enrolled
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-3 py-1.5">
                    <div className="flex items-center justify-between text-white text-[10px] mb-1">
                      <span>Your Progress</span>
                      <span className="font-medium">{course.progress ?? 0}%</span>
                    </div>
                    <div className="h-1.5 bg-white/30 rounded-full">
                      <div className="h-full bg-green-400 rounded-full" style={{ width: `${course.progress ?? 0}%` }} />
                    </div>
                  </div>
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="font-semibold text-sm leading-snug text-gray-800 line-clamp-2 group-hover:text-primary transition-colors">{course.title}</h3>
                  <p className="text-[11px] text-gray-500 flex items-center gap-1"><Award className="h-3 w-3 text-primary" />{course.instructor}</p>
                  <div className="flex items-center gap-2 text-[10px] text-gray-500">
                    <span className="flex items-center gap-0.5"><Video className="h-3 w-3" />{course.videosCount} vids</span>
                    <span className="flex items-center gap-0.5"><FileText className="h-3 w-3" />{course.testsCount} tests</span>
                    <span className="flex items-center gap-0.5"><Clock className="h-3 w-3" />{course.duration}</span>
                  </div>
                  <Button size="sm" className="w-full gap-1.5 text-xs h-8">
                    <Play className="h-3 w-3" /> Continue Learning <ArrowRight className="h-3 w-3 ml-auto" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

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

      {/* ── COURSES BY CATEGORY → SUBCATEGORY ── */}
      {Object.entries(groupedData).map(([cat, subMap]) => (
        <section key={cat} className="space-y-5">
          {/* Category Header */}
          <div className="flex items-center justify-between border-b pb-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-xl">
                <Layers className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-gray-900">{catLabels[cat] || cat.toUpperCase()}</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  {Object.values(subMap).flat().length} courses · {Object.keys(subMap).length} categories
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1 text-primary"
              onClick={() => setSelectedExam(cat)}
            >
              Filter to this exam <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Subcategory Sections */}
          {Object.entries(subMap).map(([subcat, subcatCourses], subIdx) => (
            <div
              key={subcat}
              className={`border-l-4 ${subcategoryColors[subIdx % subcategoryColors.length]} pl-4 space-y-3`}
            >
              {/* Subcategory Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-gray-800">{subcat}</h3>
                  <Badge variant="secondary" className="text-xs">{subcatCourses.length} courses</Badge>
                </div>
              </div>

              {/* Course Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {subcatCourses.map(course => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onPreview={setPreviewCourse}
                    onEnroll={handleEnroll}
                    isEnrolled={enrolledIds.includes(course.id)}
                  />
                ))}
              </div>
            </div>
          ))}
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

      {/* Course Preview Modal */}
      <CoursePreviewModal
        course={previewCourse}
        open={!!previewCourse}
        onClose={() => setPreviewCourse(null)}
      />
    </div>
  );
};

export default StudentCourses;
