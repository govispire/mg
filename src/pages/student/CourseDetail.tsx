
import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CourseNavigation } from '@/components/student/courses/CourseNavigation';
import {
  BookOpen, Play, FileText, Clock, Video, BarChart2,
  ArrowRight, AlertTriangle, CheckCircle, RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { getCourseById, subjects } from '@/data/courseData';

// ── Subject priority helpers ────────────────────────────────────────────────
const getSubjectTag = (progress: number) => {
  if (progress < 40) return { label: 'Needs Attention', icon: <AlertTriangle className="h-3 w-3" />, cls: 'text-amber-700 bg-amber-50 border-amber-200' };
  if (progress < 80) return { label: 'In Progress',    icon: <RotateCcw className="h-3 w-3" />,     cls: 'text-primary bg-primary/5 border-primary/20' };
  return             { label: 'Strong',               icon: <CheckCircle className="h-3 w-3" />,    cls: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
};

const getSubjectCTA = (progress: number) => {
  if (progress < 40) return { label: 'Improve Now', cls: 'bg-amber-500 hover:bg-amber-600 text-white' };
  if (progress < 80) return { label: 'Continue',     cls: 'bg-primary hover:bg-primary/90 text-white' };
  return             { label: 'Revise',            cls: 'bg-slate-100 hover:bg-slate-200 text-slate-700' };
};

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const course = getCourseById(courseId!);

  if (!course) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Course not found</p>
        <Link to="/student/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }

  // Sort subjects: weakest first
  const courseSubjects = course.subjects
    .map(id => subjects[id])
    .filter(Boolean)
    .sort((a, b) => (a.progress ?? 0) - (b.progress ?? 0));

  const overallProgress = course.progress ?? 0;

  // Determine "next" subject: first incomplete one
  const nextSubject = courseSubjects.find(s => (s.progress ?? 0) < 100) ?? courseSubjects[0];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <CourseNavigation
        items={[
          { label: 'Courses', href: '/student/courses' },
          { label: course.title, isActive: true }
        ]}
        showBackButton
        backHref="/student/courses"
      />

      {/* ── Study Control Panel (replaces decorative banner) ── */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="flex flex-col md:flex-row gap-0">

          {/* Left: context + CTA */}
          <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4">
            <div>
              <p className="text-[11px] font-bold text-primary uppercase tracking-widest mb-1">Your Study Plan</p>
              <h1 className="text-xl font-bold text-slate-900 leading-snug mb-1">{course.title}</h1>
              <p className="text-sm text-slate-500">By {course.instructor}</p>
            </div>

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[12px] font-semibold text-slate-600">Overall Progress</span>
                <span className={`text-[12px] font-bold ${overallProgress >= 70 ? 'text-emerald-600' : overallProgress >= 40 ? 'text-primary' : 'text-amber-600'}`}>
                  {overallProgress}%
                </span>
              </div>
              <Progress value={overallProgress} className="h-2.5" />
              {nextSubject && (
                <p className="text-[11px] text-slate-500 mt-2">
                  Next up: <span className="font-semibold text-slate-700">{nextSubject.name}</span>
                  {' '}<span className="text-slate-400">— {nextSubject.chaptersCount} chapters remaining</span>
                </p>
              )}
            </div>

            {/* Primary CTA */}
            <div className="flex gap-3">
              <Button
                className="gap-2 flex-1 sm:flex-none sm:px-8 bg-primary hover:bg-primary/90 shadow-md shadow-primary/20"
                onClick={() => nextSubject && navigate(`/student/courses/${courseId}/${nextSubject.id}`)}
              >
                <Play className="h-4 w-4" strokeWidth={3} />
                Resume Learning
              </Button>
              <Button
                variant="outline"
                className="gap-1.5 text-slate-600 border-slate-200 hover:bg-slate-50"
                onClick={() => {}}
              >
                <BarChart2 className="h-4 w-4" />
                Progress
              </Button>
            </div>
          </div>

          {/* Right: quick stats */}
          <div className="md:w-56 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-5 grid grid-cols-2 md:grid-cols-1 gap-3 content-start">
            {[
              { icon: <Video className="h-4 w-4 text-primary" />,    label: 'Videos',   value: `${course.videosCount}` },
              { icon: <FileText className="h-4 w-4 text-primary" />, label: 'Tests',    value: `${course.testsCount}` },
              { icon: <BookOpen className="h-4 w-4 text-primary" />, label: 'Chapters', value: `${course.chaptersCount}` },
              { icon: <Clock className="h-4 w-4 text-primary" />,    label: 'Duration', value: course.duration },
            ].map(({ icon, label, value }) => (
              <div key={label} className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0">
                  {icon}
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 leading-none mb-0.5">{label}</p>
                  <p className="text-[13px] font-bold text-slate-800">{value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Subject List (priority sorted: weakest first) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Subjects</h2>
          <p className="text-[11px] text-slate-400 font-medium">Sorted by priority — weakest first</p>
        </div>

        <div className="space-y-2.5">
          {courseSubjects.map((subject) => {
            const progress = subject.progress ?? 0;
            const tag = getSubjectTag(progress);
            const cta = getSubjectCTA(progress);

            return (
              <Link key={subject.id} to={`/student/courses/${courseId}/${subject.id}`}>
                <div className="flex items-center gap-4 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 hover:border-primary/30 hover:shadow-sm transition-all group cursor-pointer">

                  {/* Icon */}
                  <div className={`shrink-0 w-10 h-10 ${subject.color} rounded-xl flex items-center justify-center text-white text-lg`}>
                    {subject.icon}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <h3 className="font-semibold text-[14px] text-slate-800 group-hover:text-primary transition-colors truncate">{subject.name}</h3>
                      <span className={`shrink-0 flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${tag.cls}`}>
                        {tag.icon}{tag.label}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${progress < 40 ? 'bg-amber-400' : progress < 80 ? 'bg-primary' : 'bg-emerald-500'}`}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 shrink-0">{progress}%</span>
                    </div>

                    <p className="text-[10px] text-slate-400 mt-1">
                      {subject.chaptersCount} chapters · {subject.videosCount} videos · {subject.testsCount} tests
                    </p>
                  </div>

                  {/* CTA */}
                  <div className="shrink-0 flex items-center gap-2">
                    <span className={`hidden sm:inline-flex text-[11px] font-bold px-3 py-1.5 rounded-xl transition-colors ${cta.cls}`}>
                      {cta.label}
                    </span>
                    <ChevronRight className="h-4 w-4 text-slate-300 group-hover:text-primary transition-colors" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
