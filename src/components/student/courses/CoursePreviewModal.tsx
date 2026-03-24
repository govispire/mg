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
  mathematics: [
    'Number Theory', 'Algebra', 'Geometry', 'Trigonometry', 'Statistics',
  ],
  history: ['Ancient India', 'Medieval India', 'Modern India', 'World History'],
  geography: ['Physical Geography', 'Indian Geography', 'World Geography'],
  polity: ['Constitutional Framework', 'Parliament', 'Judiciary', 'Elections'],
  economics: ['Micro Economics', 'Macro Economics', 'Indian Economy'],
  environment: ['Ecology', 'Biodiversity', 'Climate Change', 'Conservation'],
  'general-science': ['Physics', 'Chemistry', 'Biology', 'Science & Technology'],
  'general-studies': ['Polity', 'History', 'Geography', 'Economics', 'Science'],
};

const highlights = [
  { icon: <Video className="h-4 w-4 text-blue-500" />, label: 'HD Video Lectures' },
  { icon: <FileText className="h-4 w-4 text-green-500" />, label: 'Chapter-wise Practice Tests' },
  { icon: <Globe className="h-4 w-4 text-purple-500" />, label: 'Bilingual Content' },
  { icon: <Shield className="h-4 w-4 text-orange-500" />, label: 'Lifetime Access' },
  { icon: <Zap className="h-4 w-4 text-yellow-500" />, label: 'AI-powered Study Plan' },
  { icon: <Award className="h-4 w-4 text-red-500" />, label: 'Expert Faculty' },
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
      <DialogContent className="max-w-4xl w-full p-0 overflow-hidden rounded-2xl max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="relative flex-shrink-0">
          {/* Video / Thumbnail Banner */}
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            {!videoPlaying ? (
              <>
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover opacity-80"
                />
                {/* Play overlay */}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/40">
                  <button
                    onClick={() => setVideoPlaying(true)}
                    className="flex items-center justify-center w-16 h-16 rounded-full bg-white/90 hover:bg-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
                  >
                    <Play className="h-7 w-7 text-primary fill-primary ml-1" />
                  </button>
                  <span className="text-white text-sm font-medium tracking-wide drop-shadow">
                    ▶ Watch Course Intro (2:30 min)
                  </span>
                </div>
              </>
            ) : (
              /* Demo Video Embed - using a public sample */
              <iframe
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                title="Course Introduction"
                allow="autoplay; fullscreen"
                allowFullScreen
              />
            )}

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            {discount > 0 && (
              <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                {discount}% OFF
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 md:p-6 space-y-5">

            {/* Title + Meta */}
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge variant="outline" className="text-xs text-primary border-primary/30 bg-primary/5">
                  {course.type}
                </Badge>
                {course.isTrending && (
                  <Badge className="text-xs bg-orange-500">🔥 Trending</Badge>
                )}
                {course.isPopular && (
                  <Badge className="text-xs bg-primary">⚡ Popular</Badge>
                )}
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-gray-900 leading-snug">{course.title}</h2>
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <Award className="h-3.5 w-3.5 text-primary" />
                by <span className="font-medium text-gray-700 ml-1">{course.instructor}</span>
              </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: <Star className="h-4 w-4 text-amber-500 fill-amber-400" />, value: `${course.rating} Rating`, sub: 'Avg. student rating' },
                { icon: <Users className="h-4 w-4 text-blue-500" />, value: course.studentsCount.toLocaleString(), sub: 'Students enrolled' },
                { icon: <Video className="h-4 w-4 text-purple-500" />, value: `${course.videosCount} Videos`, sub: `${course.chaptersCount} chapters` },
                { icon: <Clock className="h-4 w-4 text-orange-500" />, value: course.duration, sub: `${course.testsCount} mock tests` },
              ].map(({ icon, value, sub }) => (
                <div key={value} className="bg-gray-50 border rounded-xl px-3 py-2.5 flex flex-col gap-0.5">
                  <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-800">
                    {icon} {value}
                  </div>
                  <p className="text-[11px] text-gray-500">{sub}</p>
                </div>
              ))}
            </div>

            {/* What you'll learn */}
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-primary" /> What You'll Learn
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {highlights.map(({ icon, label }) => (
                  <div key={label} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="shrink-0">{icon}</span>
                    <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Syllabus Accordion */}
            <div>
              <h3 className="font-semibold text-base mb-3 flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" /> Course Syllabus
              </h3>
              <div className="space-y-2">
                {course.subjects.map((subId) => {
                  const sub = allSubjects[subId];
                  const topics = subjectSyllabusMap[subId] || [];
                  const isOpen = expandedSubject === subId;
                  return (
                    <div key={subId} className="border rounded-xl overflow-hidden">
                      <button
                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                        onClick={() => setExpandedSubject(isOpen ? null : subId)}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{sub?.icon || '📚'}</span>
                          <span className="font-medium text-sm text-gray-800">
                            {sub?.name || subId.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                          </span>
                          {sub && (
                            <span className="text-[11px] text-gray-500 ml-1">
                              ({sub.videosCount} videos • {sub.testsCount} tests)
                            </span>
                          )}
                        </div>
                        {isOpen ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                      </button>
                      {isOpen && topics.length > 0 && (
                        <ul className="px-4 py-3 space-y-1.5 bg-white border-t">
                          {topics.map((topic) => (
                            <li key={topic} className="flex items-start gap-2 text-sm text-gray-700">
                              <CheckCircle className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
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

        {/* Sticky Footer CTA */}
        <div className="flex-shrink-0 border-t bg-white px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-gray-900">₹{course.price.toLocaleString()}</span>
            {course.originalPrice && (
              <>
                <span className="text-sm text-gray-400 line-through">₹{course.originalPrice.toLocaleString()}</span>
                <span className="text-sm font-semibold text-green-600">{discount}% off</span>
              </>
            )}
          </div>
          <div className="flex gap-3 w-full sm:w-auto">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={onClose}>
              Close Preview
            </Button>
            <Button className="flex-1 sm:flex-none gap-2" onClick={handleEnroll}>
              <ShoppingCart className="h-4 w-4" /> Enroll Now
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
