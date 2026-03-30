import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  X, Play, Star, Users, Video, FileText, Clock,
  Award, ChevronDown, ChevronUp, CheckCircle,
  ShoppingCart, BookOpen, Shield, Zap, Globe
} from 'lucide-react';
import { Course, subjects as allSubjects } from '@/data/courseData';
import { useNavigate } from 'react-router-dom';

interface CoursePreviewModalProps {
  course: Course | null;
  open: boolean;
  onClose: () => void;
}

const subjectSyllabusMap: Record<string, string[]> = {
  english: [
    'Reading Comprehension', 'Cloze Test', 'Para Jumbles',
    'Error Spotting', 'Fill in the Blanks', 'Sentence Improvement',
    'Vocabulary (Synonyms & Antonyms)', 'Idioms & Phrases',
  ],
  quantitative: [
    'Number System', 'Simplification & Approximation',
    'Percentage & Profit/Loss', 'Ratio & Proportion', 'Average & Ages',
    'Time & Work', 'Time & Distance', 'Simple & Compound Interest',
    'Mensuration', 'Data Interpretation',
  ],
  reasoning: [
    'Coded Inequalities', 'Syllogism', 'Puzzles & Seating Arrangement',
    'Blood Relations', 'Direction & Distance',
    'Alphanumeric Series', 'Coding-Decoding', 'Input-Output',
  ],
  'general-awareness': [
    'Current Affairs (Monthly)', 'Banking Awareness', 'Financial Awareness',
    'Government Schemes', 'Indian Economy', 'Awards & Honours',
    'Sports & Events', 'Static GK',
  ],
  computer: [
    'Computer Fundamentals', 'MS Office', 'Internet & Networking',
    'Database Concepts', 'Shortcuts & Shortcuts Keys',
  ],
  mathematics: ['Number Theory', 'Algebra', 'Geometry', 'Trigonometry', 'Statistics'],
  history: ['Ancient India', 'Medieval India', 'Modern India', 'World History'],
  geography: ['Physical Geography', 'Indian Geography', 'World Geography'],
  polity: ['Constitutional Framework', 'Parliament', 'Judiciary', 'Elections'],
  economics: ['Micro Economics', 'Macro Economics', 'Indian Economy'],
  environment: ['Ecology', 'Biodiversity', 'Climate Change', 'Conservation'],
  'general-science': ['Physics', 'Chemistry', 'Biology', 'Science & Technology'],
  'general-studies': ['Polity', 'History', 'Geography', 'Economics', 'Science'],
};

const learningHighlights = [
  { icon: <Video className="h-3.5 w-3.5 text-primary" />, label: 'HD Video Lectures' },
  { icon: <FileText className="h-3.5 w-3.5 text-primary" />, label: 'Chapter-wise Practice Tests' },
  { icon: <Globe className="h-3.5 w-3.5 text-primary" />, label: 'Bilingual Content' },
  { icon: <Shield className="h-3.5 w-3.5 text-primary" />, label: 'Lifetime Access' },
  { icon: <Zap className="h-3.5 w-3.5 text-primary" />, label: 'AI-powered Study Plan' },
  { icon: <Award className="h-3.5 w-3.5 text-primary" />, label: 'Expert Faculty' },
];

export const CoursePreviewModal: React.FC<CoursePreviewModalProps> = ({ course, open, onClose }) => {
  const navigate = useNavigate();
  const [expandedSubject, setExpandedSubject] = useState<string | null>(null);
  const [videoPlaying, setVideoPlaying] = useState(false);

  if (!course) return null;

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  const handleEnroll = () => {
    onClose();
    navigate(`/student/courses/${course.id}`);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col">

        {/* ── 2-column body (md+) ── */}
        <div className="flex flex-col md:flex-row flex-1 min-h-0">

          {/* ── LEFT: Video + Title + Instructor ── */}
          <div className="md:w-[55%] flex flex-col overflow-y-auto">

            {/* Video / Thumbnail */}
            <div className="relative w-full bg-black shrink-0" style={{ aspectRatio: '16/9' }}>
              {!videoPlaying ? (
                <>
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-75"
                  />
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
                    <button
                      onClick={() => setVideoPlaying(true)}
                      className="flex items-center justify-center w-14 h-14 rounded-full bg-white/90 hover:bg-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
                    >
                      <Play className="h-6 w-6 text-primary fill-primary ml-1" />
                    </button>
                    <span className="text-white text-xs font-medium drop-shadow">
                      ▶ Watch Course Intro (2:30 min)
                    </span>
                  </div>
                </>
              ) : (
                <iframe
                  className="w-full h-full"
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                  title="Course Introduction"
                  allow="autoplay; fullscreen"
                  allowFullScreen
                />
              )}
              <button
                onClick={onClose}
                className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
              {discount > 0 && (
                <div className="absolute top-3 left-3 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {discount}% OFF
                </div>
              )}
            </div>

            {/* Title + meta */}
            <div className="p-5 space-y-3 flex-1">
              {/* Single badge only */}
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/5">
                  {course.type}
                </Badge>
                {course.isTrending && (
                  <Badge className="text-[10px] bg-amber-500">🔥 Trending</Badge>
                )}
              </div>

              <h2 className="text-lg font-bold text-gray-900 leading-snug">{course.title}</h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-primary" />
                by <span className="font-medium text-gray-700 ml-1">{course.instructor}</span>
              </p>

              {/* Rating + students */}
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="h-4 w-4 fill-amber-400" />
                  <span className="font-bold text-gray-800">{course.rating}</span>
                </div>
                <div className="flex items-center gap-1 text-gray-500 text-xs">
                  <Users className="h-3.5 w-3.5" />
                  {course.studentsCount.toLocaleString()} students
                </div>
              </div>

              {/* Desktop: price + CTA below title on left (replaces footer on md+) */}
              <div className="hidden md:block pt-3 border-t space-y-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
                  {course.originalPrice && (
                    <>
                      <span className="text-sm text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
                      <span className="text-sm font-semibold text-emerald-600">{discount}% off</span>
                    </>
                  )}
                </div>
                <Button className="w-full gap-2 bg-primary hover:bg-primary/90 h-10 text-[13px] font-bold shadow-md shadow-primary/20" onClick={handleEnroll}>
                  <ShoppingCart className="h-4 w-4" /> Enroll Now — Start Learning
                </Button>
                <button onClick={onClose} className="w-full text-[12px] text-gray-400 hover:text-gray-600 font-medium transition-colors">
                  Close preview
                </button>
              </div>
            </div>
          </div>

          {/* ── RIGHT: What you'll learn + stats + syllabus ── */}
          <div className="md:w-[45%] border-t md:border-t-0 md:border-l border-gray-100 overflow-y-auto flex flex-col">
            <div className="p-5 space-y-5 flex-1">

              {/* Quick stats grid */}
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { icon: <Video className="h-3.5 w-3.5 text-primary" />, value: `${course.videosCount} Videos`, sub: `${course.chaptersCount} chapters` },
                  { icon: <FileText className="h-3.5 w-3.5 text-primary" />, value: `${course.testsCount} Tests`, sub: 'Mock & chapter tests' },
                  { icon: <Clock className="h-3.5 w-3.5 text-primary" />, value: course.duration, sub: 'Total content' },
                  { icon: <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-400" />, value: `${course.rating} Rating`, sub: 'Avg. rating' },
                ].map(({ icon, value, sub }) => (
                  <div key={value} className="bg-slate-50 border border-slate-100 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-gray-800 mb-0.5">
                      {icon} {value}
                    </div>
                    <p className="text-[10px] text-gray-500">{sub}</p>
                  </div>
                ))}
              </div>

              {/* What you'll learn */}
              <div>
                <h3 className="font-bold text-[13px] text-gray-800 mb-2.5 flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-primary" /> What You'll Learn
                </h3>
                <div className="space-y-1.5">
                  {learningHighlights.map(({ icon, label }) => (
                    <div key={label} className="flex items-center gap-2 text-[12px] text-gray-700">
                      <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Syllabus — compact accordion */}
              <div>
                <h3 className="font-bold text-[13px] text-gray-800 mb-2.5 flex items-center gap-1.5">
                  <FileText className="h-4 w-4 text-primary" /> Course Syllabus
                </h3>
                <div className="space-y-1.5">
                  {course.subjects.map((subId) => {
                    const sub = allSubjects[subId];
                    const topics = subjectSyllabusMap[subId] || [];
                    const isOpen = expandedSubject === subId;
                    return (
                      <div key={subId} className="border border-slate-100 rounded-xl overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between px-3 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors text-left"
                          onClick={() => setExpandedSubject(isOpen ? null : subId)}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-base">{sub?.icon || '📚'}</span>
                            <span className="font-medium text-[12px] text-gray-800">
                              {sub?.name || subId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                            </span>
                            {sub && (
                              <span className="text-[10px] text-gray-400">
                                {sub.videosCount}v · {sub.testsCount}t
                              </span>
                            )}
                          </div>
                          {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-gray-400 shrink-0" /> : <ChevronDown className="h-3.5 w-3.5 text-gray-400 shrink-0" />}
                        </button>
                        {isOpen && topics.length > 0 && (
                          <ul className="px-3 py-2.5 space-y-1 bg-white border-t border-slate-100">
                            {topics.map((topic) => (
                              <li key={topic} className="flex items-start gap-1.5 text-[11px] text-gray-600">
                                <CheckCircle className="h-3 w-3 text-emerald-500 shrink-0 mt-0.5" />
                                {topic}
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── Mobile-only sticky CTA footer ── */}
        <div className="md:hidden flex-shrink-0 border-t bg-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
            {course.originalPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
                <span className="text-sm font-semibold text-emerald-600">{discount}% off</span>
              </>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none text-sm" onClick={onClose}>
              Close
            </Button>
            <Button className="flex-1 sm:flex-none gap-2 text-sm font-bold" onClick={handleEnroll}>
              <ShoppingCart className="h-4 w-4" /> Enroll Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
