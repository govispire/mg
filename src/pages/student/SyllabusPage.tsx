import React, { useState, useMemo, useRef, useEffect } from 'react';
import { stopTimerAndLaunchTest } from '@/utils/stopTimerAndLaunchTest';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';
import {
  ChevronDown, ChevronUp, BookOpen, Video, FileText,
  Clock, Target, Play, Download, CheckCircle2, Star,
  ArrowUpDown, Zap, Calendar, Search, X, Pause, Volume2,
  VolumeX, Maximize, SkipBack, SkipForward, Settings,
  Bookmark, ListVideo, ChevronLeft, ChevronRight
} from 'lucide-react';
import {
  allSyllabusData,
  getIconByName,
  ExamSyllabusConfig,
  TopicConfig
} from '@/data/syllabusData';
import { useSyllabusData } from '@/hooks/useSyllabusData';
import { useExamCatalog } from '@/hooks/useExamCatalog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import ExamComparison from '@/components/student/syllabus/ExamComparison';
import StudyPlanGenerator from '@/components/student/syllabus/StudyPlanGenerator';
import {
  isTopicCompleted,
  toggleTopicCompletion,
  saveRecentlyViewed,
  loadRecentlyViewed,
  getCompletedTopicsCount,
  type RecentlyViewed
} from '@/utils/syllabusStorage';

const SyllabusPage = () => {
  const { catalog } = useExamCatalog();
  // ── Live syllabus data (SuperAdmin saves override static data) ─────────────
  const { getExamConfig } = useSyllabusData();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Completed topics tracking
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);

  useEffect(() => {
    if (!selectedCategoryId && catalog.length > 0) {
      setSelectedCategoryId(catalog.filter(c => c.isVisible)[0]?.id || catalog[0].id);
    }
  }, [catalog, selectedCategoryId]);

  const availableExams = useMemo(() => {
    const category = catalog.find(c => c.id === selectedCategoryId);
    if (!category) return [];
    
    const uniqueExams = new Map();
    category.sections.flatMap(s => s.exams).forEach(exam => {
      if (!uniqueExams.has(exam.id)) {
        uniqueExams.set(exam.id, exam);
      }
    });
    
    return Array.from(uniqueExams.values());
  }, [catalog, selectedCategoryId]);

  const [selectedExam, setSelectedExam] = useState<string>('');
  const [selectedTier, setSelectedTier] = useState<string>('');
  const [expandedSubjects, setExpandedSubjects] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Comparison state
  const [compareExams, setCompareExams] = useState<string[]>([]);
  const [showComparison, setShowComparison] = useState(false);

  // Study Plan state
  const [showStudyPlan, setShowStudyPlan] = useState(false);

  // Resource Dialog state
  const [resourceDialog, setResourceDialog] = useState<{
    isOpen: boolean;
    topic: TopicConfig | null;
    subjectName: string;
    initialTab: 'videos' | 'pdfs' | 'tests';
  }>({ isOpen: false, topic: null, subjectName: '', initialTab: 'videos' });

  // Video Player state
  const [videoPlayer, setVideoPlayer] = useState<{
    isOpen: boolean;
    video: TopicConfig['videos'][0] | null;
    topicName: string;
    playlist: TopicConfig['videos'];
  }>({ isOpen: false, video: null, topicName: '', playlist: [] });

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(true);

  const videoRef = useRef<HTMLVideoElement>(null);

  // Sample video URLs for demonstration
  const sampleVideoUrls = [
    'https://sample-videos.com/video321/mp4/720/big_buck_bunny_720p_1mb.mp4',
    'https://www.w3schools.com/html/mov_bbb.mp4',
  ];

  const getVideoUrl = (videoId: string) => {
    const index = Math.abs(videoId.charCodeAt(0)) % sampleVideoUrls.length;
    return sampleVideoUrls[index];
  };

  // Get current exam config — SuperAdmin data wins over static
  const examConfig = getExamConfig(selectedExam);

  // Set initial tier when exam changes
  useEffect(() => {
    if (examConfig && examConfig.tiers.length > 0) {
      setSelectedTier(examConfig.tiers[0].id);
    }
  }, [selectedExam, examConfig]);

  // Update selected exam when available exams change
  useEffect(() => {
    if (availableExams.length > 0 && !availableExams.find(e => e.id === selectedExam)) {
      setSelectedExam(availableExams[0].id);
    }
  }, [availableExams, selectedExam]);

  // Load completed topics and recently viewed on mount and exam change
  useEffect(() => {
    if (selectedExam) {
      // Load completed topics
      const completed = new Set<string>();
      // Check all topics in current exam for completion
      examConfig?.tiers.forEach(tier => {
        tier.subjects.forEach(subject => {
          subject.topics.forEach(topic => {
            if (isTopicCompleted(selectedExam, topic.id)) {
              completed.add(topic.id);
            }
          });
        });
      });
      setCompletedTopics(completed);

      // Load recently viewed
      const recent = loadRecentlyViewed(selectedExam, 5);
      setRecentlyViewed(recent);

      // Set loading to false after data loads
      setIsLoading(false);
    }
  }, [selectedExam, examConfig]);

  const currentTier = examConfig?.tiers.find(t => t.id === selectedTier) || examConfig?.tiers[0];

  // Calculate overall stats
  const overallStats = useMemo(() => {
    if (!examConfig) return { completed: 0, totalTopics: 0, avgScore: 0, totalVideos: 0, totalQuestions: 0 };

    let totalProgress = 0;
    let totalTopics = 0;
    let totalVideos = 0;
    let totalQuestions = 0;

    examConfig.tiers.forEach(tier => {
      tier.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          totalProgress += topic.progress;
          totalTopics++;
          totalVideos += topic.videos.length;
          totalQuestions += topic.tests.reduce((sum, t) => sum + t.questions, 0);
        });
      });
    });

    return {
      completed: totalTopics > 0 ? Math.round(totalProgress / totalTopics) : 0,
      totalTopics,
      avgScore: 72,
      totalVideos,
      totalQuestions
    };
  }, [examConfig]);

  // Filter subjects based on search
  const filteredSubjects = useMemo(() => {
    if (!currentTier || !searchQuery) return currentTier?.subjects || [];

    const query = searchQuery.toLowerCase();
    return currentTier.subjects.map(subject => ({
      ...subject,
      topics: subject.topics.filter(topic =>
        topic.name.toLowerCase().includes(query) ||
        subject.name.toLowerCase().includes(query)
      )
    })).filter(subject => subject.topics.length > 0);
  }, [currentTier, searchQuery]);

  // Toggle subject expansion
  const toggleSubject = (subjectId: string) => {
    setExpandedSubjects(prev =>
      prev.includes(subjectId)
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };

  // Video player functions
  const openVideoPlayer = (video: TopicConfig['videos'][0], topic: TopicConfig | null) => {
    setVideoPlayer({
      isOpen: true,
      video,
      topicName: topic?.name || '',
      playlist: topic?.videos || []
    });
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const closeVideoPlayer = () => {
    setVideoPlayer({ isOpen: false, video: null, topicName: '', playlist: [] });
    setIsPlaying(false);
  };

  // Handlers for resources
  const openResources = (topic: TopicConfig, subjectName: string, tab: 'videos' | 'pdfs' | 'tests') => {
    setResourceDialog({
      isOpen: true,
      topic,
      subjectName,
      initialTab: tab
    });

    // Track recently viewed
    saveRecentlyViewed({
      topicId: topic.id,
      topicName: topic.name,
      subjectName,
      examId: selectedExam
    });

    // Reload recently viewed
    const recent = loadRecentlyViewed(selectedExam, 5);
    setRecentlyViewed(recent);
  };

  // Handle topic completion toggle
  const handleTopicCompletion = (topicId: string) => {
    const isCompleted = completedTopics.has(topicId);
    toggleTopicCompletion(selectedExam, topicId, !isCompleted);

    // Update state
    setCompletedTopics(prev => {
      const newSet = new Set(prev);
      if (isCompleted) {
        newSet.delete(topicId);
      } else {
        newSet.add(topicId);
      }
      return newSet;
    });
  };

  const playNextVideo = () => {
    const currentIndex = videoPlayer.playlist.findIndex(v => v.id === videoPlayer.video?.id);
    if (currentIndex < videoPlayer.playlist.length - 1) {
      setVideoPlayer(prev => ({
        ...prev,
        video: prev.playlist[currentIndex + 1]
      }));
      setCurrentTime(0);
    }
  };

  const playPrevVideo = () => {
    const currentIndex = videoPlayer.playlist.findIndex(v => v.id === videoPlayer.video?.id);
    if (currentIndex > 0) {
      setVideoPlayer(prev => ({
        ...prev,
        video: prev.playlist[currentIndex - 1]
      }));
      setCurrentTime(0);
    }
  };

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const handleSeek = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    if (videoRef.current) {
      videoRef.current.volume = value[0];
      setVolume(value[0]);
      setIsMuted(value[0] === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const changePlaybackSpeed = (speed: number) => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
      setPlaybackSpeed(speed);
      setShowSpeedMenu(false);
    }
  };

  const toggleFullscreen = () => {
    if (videoRef.current) {
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        videoRef.current.requestFullscreen();
      }
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime += seconds;
    }
  };

  // Toggle compare
  const toggleCompare = (examId: string) => {
    setCompareExams(prev =>
      prev.includes(examId)
        ? prev.filter(id => id !== examId)
        : prev.length < 3 ? [...prev, examId] : prev
    );
  };

  if (!examConfig) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <Card className="p-8">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
              <BookOpen className="h-8 w-8 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">No Syllabus Available</h3>
              <p className="text-muted-foreground mt-2">
                No syllabus data found for your selected exam categories.
              </p>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-900 font-medium">💡 How to fix this:</p>
              <ol className="text-sm text-blue-800 mt-2 space-y-1 list-decimal list-inside">
                <li>Go to your Profile settings</li>
                <li>Select your desired exam categories</li>
                <li>Return to this page to view syllabus</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── 1. HEADER TITLE & GLOBAL ACTION BUTTONS ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Know Your Syllabus</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Explore official exam patterns, stage-wise syllabus breakdown, and topic learning resources.
          </p>
        </div>

        {/* Global Action Buttons (Compare & Study Plan) */}
        <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
          {/* Compare Button */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant={compareExams.length >= 2 ? "default" : "outline"}
                size="sm"
                className={`h-9 px-4 rounded-xl text-xs font-bold gap-1.5 transition-all ${
                  compareExams.length >= 2
                    ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <ArrowUpDown className="h-3.5 w-3.5" />
                <span>{compareExams.length > 0 ? `Compare (${compareExams.length})` : 'Compare Exams'}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 rounded-2xl shadow-lg border-slate-200" align="end">
              <div className="space-y-3">
                <div>
                  <h4 className="font-extrabold text-sm text-slate-900">Select Exams to Compare</h4>
                  <p className="text-xs text-slate-500 font-medium">Select up to 3 target exams</p>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {availableExams.map(exam => (
                    <div key={exam.id} className="flex items-start space-x-2 py-1">
                      <Checkbox 
                        id={`compare-${exam.id}`}
                        checked={compareExams.includes(exam.id)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            if (compareExams.length < 3) setCompareExams([...compareExams, exam.id]);
                          } else {
                            setCompareExams(compareExams.filter(id => id !== exam.id));
                          }
                        }}
                        className="mt-0.5"
                      />
                      <label 
                        htmlFor={`compare-${exam.id}`}
                        className="text-xs font-bold text-slate-700 leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer select-none"
                      >
                        {exam.name}
                      </label>
                    </div>
                  ))}
                </div>
                <Button 
                  className="w-full text-xs font-bold h-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white" 
                  onClick={() => setShowComparison(true)}
                  disabled={compareExams.length < 2}
                >
                  View Comparison ({compareExams.length})
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          {/* Study Plan Button */}
          <Button
            size="sm"
            onClick={() => setShowStudyPlan(true)}
            className="h-9 px-4 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-xs gap-1.5"
          >
            <Zap className="h-3.5 w-3.5 fill-white" />
            <span>⚡ Study Plan</span>
          </Button>
        </div>
      </div>

      {/* ── 2. UNIFIED FILTER & TOOLBAR BAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Category Dropdown */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Category</label>
            <Select value={selectedCategoryId} onValueChange={setSelectedCategoryId}>
              <SelectTrigger className="h-10 bg-slate-50 border-slate-200 rounded-xl text-xs font-bold text-slate-800">
                <SelectValue placeholder="Select Category" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {catalog.filter(c => c.isVisible).map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs font-semibold">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Exam Dropdown (Stronger Visual Emphasis) */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-black text-blue-600 uppercase tracking-wider block">Target Exam</label>
            <Select 
              value={selectedExam} 
              onValueChange={(val) => {
                setSelectedExam(val);
                setSelectedTier(getExamConfig(val)?.tiers[0]?.id || '');
              }}
            >
              <SelectTrigger className="h-10 bg-blue-50/60 border-blue-200 rounded-xl text-xs font-black text-slate-900 ring-2 ring-blue-500/10">
                <SelectValue placeholder="Select Exam" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {availableExams.map(exam => (
                  <SelectItem key={exam.id} value={exam.id} className="text-xs font-bold">
                    <div className="flex items-center gap-2">
                      <img src={exam.logo} alt="" className="w-4 h-4 object-contain rounded-sm" />
                      <span>{exam.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Search Bar */}
          <div className="md:col-span-4 space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider block">Search Syllabus</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search topics or subjects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 h-10 text-xs font-medium border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. EXAM METADATA CARD (COMPACT STYLED GRID) ── */}
      <Card className="border border-slate-200/90 rounded-2xl shadow-2xs bg-white overflow-hidden">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
            {/* Left: Exam Logo & Title (Redundant Stage Badge Removed!) */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-200/80 p-2 flex items-center justify-center shrink-0 shadow-2xs">
                <img
                  src={examConfig.logo}
                  alt={examConfig.examName}
                  className="w-9 h-9 object-contain"
                />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight leading-snug">
                  {examConfig.fullName}
                </h2>
                <div className="flex items-center gap-2 mt-0.5 text-xs font-semibold text-slate-500">
                  <Calendar className="h-3.5 w-3.5 text-blue-600" />
                  <span>Target Date: {examConfig.examDate}</span>
                </div>
              </div>
            </div>

            {/* Right: Key Exam Metrics Styled Grid */}
            {currentTier && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 shrink-0 bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl">
                {/* Duration */}
                <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Clock className="h-3.5 w-3.5 text-blue-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Duration</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{currentTier.duration}</p>
                </div>

                {/* Total Marks */}
                <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Target className="h-3.5 w-3.5 text-indigo-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Marks</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{currentTier.totalMarks}</p>
                </div>

                {/* Negative Marking */}
                <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <X className="h-3.5 w-3.5 text-rose-500" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Neg. Mark</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-0.5">{currentTier.negativeMarking}</p>
                </div>

                {/* Sectional Cutoff */}
                <div className="px-3 py-1.5 rounded-lg bg-white border border-slate-200/60 shadow-2xs">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">Cutoff</span>
                  </div>
                  <p className="text-xs font-black text-slate-900 mt-0.5">
                    {currentTier.sectionalCutoff ? 'Yes ✓' : 'No'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── 4. STAGE TABS (SEGMENTED CONTROL TRACK) ── */}
      {examConfig.tiers.length > 0 && (
        <div className="bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80 flex items-center gap-1 overflow-x-auto shrink-0 w-fit shadow-2xs">
          {examConfig.tiers.map((tier) => {
            const isActive = tier.id === selectedTier;
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier.id)}
                className={`flex items-center gap-2 px-5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <span>{tier.name}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── 5. RECENTLY VIEWED / CONTINUE LEARNING ── */}
      {recentlyViewed.length > 0 && (
        <Card className="bg-blue-50/70 border border-blue-200/70 rounded-2xl shadow-2xs">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-slate-800 flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span>Continue Learning (Recently Viewed)</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {recentlyViewed.map((item) => (
                <button
                  key={item.topicId}
                  className="p-3 bg-white rounded-xl text-left hover:shadow-xs transition-all border border-slate-200/80 shadow-2xs flex flex-col justify-center"
                  onClick={() => {
                    currentTier?.subjects.forEach(subject => {
                      const topic = subject.topics.find(t => t.id === item.topicId);
                      if (topic) {
                        openResources(topic, subject.name, 'videos');
                      }
                    });
                  }}
                >
                  <p className="text-xs font-black text-slate-900 truncate w-full">{item.topicName}</p>
                  <p className="text-[11px] text-slate-500 font-semibold truncate w-full mt-0.5">{item.subjectName}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 6. SUBJECTS ACCORDION LIST (16PX GAP & HIGH CONTRAST TOPIC COUNTS) ── */}
      <div className="space-y-4">
        {filteredSubjects.map((subject) => {
          const completedCount = subject.topics.filter(t => completedTopics.has(t.id)).length;
          const subjectProgress = Math.round(
            (completedCount / subject.topics.length) * 100
          );
          const isExpanded = expandedSubjects.includes(subject.id);

          return (
            <Card key={subject.id} className="overflow-hidden border border-slate-200/90 rounded-2xl shadow-2xs bg-white">
              <button
                onClick={() => toggleSubject(subject.id)}
                className="w-full p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/60 transition-colors text-left"
              >
                {/* Standardized Subject Icon */}
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200/80 text-blue-600 flex items-center justify-center font-bold shrink-0 shadow-2xs">
                  {getIconByName(subject.iconName)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-base text-slate-900 tracking-tight">{subject.name}</h3>
                    <Badge className="bg-slate-100 border border-slate-200 text-slate-700 text-[11px] font-bold px-2.5 py-0.5 rounded-full">
                      {subject.marks} marks
                    </Badge>
                  </div>

                  {/* Topic Progress Bar & Informative Callout (Replaces 0% contrast issue) */}
                  <div className="flex items-center gap-3 mt-1.5">
                    <Progress value={subjectProgress} className="h-2 flex-1 max-w-48 bg-slate-100" />
                    <span className="text-xs font-bold text-slate-600">
                      {completedCount} / {subject.topics.length} topics completed ({subjectProgress}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-500 hidden sm:inline-block bg-slate-100 px-3 py-1 rounded-full border border-slate-200/60">
                    {subject.topics.length} topics
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-slate-500" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-slate-500" />
                  )}
                </div>
              </button>

              {/* Accordion Topics List */}
              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                  <div className="grid gap-2.5">
                    {subject.topics.map((topic) => {
                      const isCompleted = completedTopics.has(topic.id);
                      return (
                        <div
                          key={topic.id}
                          className={`flex flex-col md:flex-row md:items-center gap-3 p-3.5 bg-white rounded-xl border transition-all ${
                            isCompleted
                              ? 'border-emerald-200 bg-emerald-50/40 shadow-2xs'
                              : 'border-slate-200/80 hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          {/* Completion Checkbox */}
                          <button
                            onClick={() => handleTopicCompletion(topic.id)}
                            className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isCompleted
                                ? 'bg-emerald-600 border-emerald-600 text-white'
                                : 'border-slate-300 hover:border-emerald-600'
                            }`}
                          >
                            {isCompleted && (
                              <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                            )}
                          </button>

                          {/* Topic Name */}
                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-xs sm:text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {topic.name}
                            </p>
                          </div>

                          {/* Interactive Resource Buttons */}
                          <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-0">
                            <button
                              onClick={() => openResources(topic, subject.name, 'videos')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100/80 transition-colors border border-blue-200/80 font-bold text-xs shadow-2xs"
                            >
                              <Video className="h-3.5 w-3.5 text-blue-600" />
                              <span>Videos</span>
                              <span className="bg-blue-200/80 px-1.5 py-0.5 rounded-md text-[10px] text-blue-900 font-extrabold">{topic.videos.length}</span>
                            </button>

                            <button
                              onClick={() => openResources(topic, subject.name, 'pdfs')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100/80 transition-colors border border-amber-200/80 font-bold text-xs shadow-2xs"
                            >
                              <FileText className="h-3.5 w-3.5 text-amber-600" />
                              <span>PDFs</span>
                              <span className="bg-amber-200/80 px-1.5 py-0.5 rounded-md text-[10px] text-amber-900 font-extrabold">{topic.pdfs.length}</span>
                            </button>

                            <button
                              onClick={() => openResources(topic, subject.name, 'tests')}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100/80 transition-colors border border-emerald-200/80 font-bold text-xs shadow-2xs"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Tests</span>
                              <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded-md text-[10px] text-emerald-900 font-extrabold">{topic.tests.length}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}

        {/* Search No Results */}
        {searchQuery && filteredSubjects.length === 0 && (
          <Card className="p-8">
            <div className="text-center space-y-3">
              <Search className="h-12 w-12 text-muted-foreground mx-auto" />
              <div>
                <h3 className="font-semibold">No topics found</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  No topics match your search "{searchQuery}"
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery('')}
                className="gap-2"
              >
                <X className="h-3 w-3" />
                Clear search
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Topic Resources Dialog */}
      <Dialog open={resourceDialog.isOpen} onOpenChange={(open) => setResourceDialog({ ...resourceDialog, isOpen: open })}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-emerald-500" />
              {resourceDialog.topic?.name}
            </DialogTitle>
          </DialogHeader>

          {resourceDialog.topic && (
            <Tabs defaultValue={resourceDialog.initialTab} className="mt-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="videos" className="gap-1">
                  <Video className="h-4 w-4" />
                  Videos ({resourceDialog.topic.videos.length})
                </TabsTrigger>
                <TabsTrigger value="pdfs" className="gap-1">
                  <FileText className="h-4 w-4" />
                  PDFs ({resourceDialog.topic.pdfs.length})
                </TabsTrigger>
                <TabsTrigger value="tests" className="gap-1">
                  <BookOpen className="h-4 w-4" />
                  Tests ({resourceDialog.topic.tests.length})
                </TabsTrigger>
              </TabsList>

              <div className="mt-4 space-y-3">
                {/* Videos Tab Content */}
                <TabsContent value="videos" className="space-y-3 mt-0">
                  {resourceDialog.topic.videos.map((video) => (
                    <Card
                      key={video.id}
                      className="p-3 hover:bg-muted/30 cursor-pointer transition-colors"
                      onClick={() => openVideoPlayer(video, resourceDialog.topic)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-14 bg-muted rounded-lg flex items-center justify-center">
                          <Play className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-sm">{video.title}</p>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{video.instructor}</span>
                            <span>•</span>
                            <span>{video.duration}</span>
                            <span>•</span>
                            <span className="flex items-center gap-1">
                              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                              {video.rating}
                            </span>
                          </div>
                        </div>
                        {video.completed && (
                          <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        )}
                      </div>
                    </Card>
                  ))}
                </TabsContent>

                {/* PDFs Tab Content */}
                <TabsContent value="pdfs" className="space-y-3 mt-0">
                  {resourceDialog.topic.pdfs.map((pdf) => (
                    <Card key={pdf.id} className="p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                          <FileText className="h-6 w-6 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{pdf.title}</p>
                            <Badge variant="outline" className="text-[10px] h-5 px-1.5">{pdf.type.toUpperCase()}</Badge>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{pdf.pages} pages</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 gap-1.5 text-xs"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            View
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))}
                  {resourceDialog.topic.pdfs.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No PDFs available for this topic yet.</p>
                    </div>
                  )}
                </TabsContent>

                {/* Tests Tab Content */}
                <TabsContent value="tests" className="space-y-3 mt-0">
                  {resourceDialog.topic.tests.map((test) => (
                    <Card key={test.id} className="p-3 hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <Target className="h-6 w-6 text-emerald-600" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{test.title}</p>
                            <Badge
                              className={`text-[10px] h-5 px-1.5 ${test.difficulty === 'easy' ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100' :
                                test.difficulty === 'medium' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100' :
                                  'bg-red-100 text-red-700 hover:bg-red-100'
                                }`}
                              variant="secondary"
                            >
                              {test.difficulty.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                            <span>{test.questions} Questions</span>
                            <span>•</span>
                            <span>{test.duration}</span>
                          </div>
                        </div>
                        <Button
                          className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700"
                          onClick={() => {
                            // Open test in new window with proper parameters
                            const url = `/student/test-window?category=syllabus&examId=${selectedExam}&testId=${test.id}`;
                            stopTimerAndLaunchTest({ url, testName: test.title });
                          }}
                        >
                          Take Test
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {resourceDialog.topic.tests.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <p>No tests available for this topic yet.</p>
                    </div>
                  )}
                </TabsContent>
              </div>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Video Player Dialog */}
      <Dialog open={videoPlayer.isOpen} onOpenChange={closeVideoPlayer}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden">
          <div className="flex flex-col md:flex-row">
            {/* Video Section */}
            <div className="flex-1 bg-black">
              <div className="relative aspect-video">
                <video
                  ref={videoRef}
                  src={videoPlayer.video ? getVideoUrl(videoPlayer.video.id) : ''}
                  className="w-full h-full"
                  onTimeUpdate={handleTimeUpdate}
                  onLoadedMetadata={handleLoadedMetadata}
                  onEnded={playNextVideo}
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  {/* Progress Bar */}
                  <Slider
                    value={[currentTime]}
                    max={duration || 100}
                    step={1}
                    onValueChange={handleSeek}
                    className="mb-3"
                  />

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => skip(-10)} className="text-white hover:bg-white/20">
                        <SkipBack className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={togglePlay} className="text-white hover:bg-white/20">
                        {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => skip(10)} className="text-white hover:bg-white/20">
                        <SkipForward className="h-4 w-4" />
                      </Button>

                      <Button variant="ghost" size="sm" onClick={toggleMute} className="text-white hover:bg-white/20">
                        {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                      </Button>

                      <span className="text-white text-xs">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="relative">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                          className="text-white hover:bg-white/20 text-xs"
                        >
                          {playbackSpeed}x
                        </Button>
                        {showSpeedMenu && (
                          <div className="absolute bottom-full right-0 mb-2 bg-black/90 rounded-lg p-2 space-y-1">
                            {[0.5, 0.75, 1, 1.25, 1.5, 2].map(speed => (
                              <button
                                key={speed}
                                onClick={() => changePlaybackSpeed(speed)}
                                className={`block w-full text-left px-3 py-1 text-sm rounded ${playbackSpeed === speed ? 'bg-white/20 text-white' : 'text-white/70 hover:bg-white/10'
                                  }`}
                              >
                                {speed}x
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <Button variant="ghost" size="sm" onClick={toggleFullscreen} className="text-white hover:bg-white/20">
                        <Maximize className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Video Info */}
              <div className="p-4 bg-background">
                <h3 className="font-semibold">{videoPlayer.video?.title}</h3>
                <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <span>{videoPlayer.video?.instructor}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    {videoPlayer.video?.rating}
                  </span>
                </div>
              </div>
            </div>

            {/* Playlist Sidebar */}
            {showPlaylist && (
              <div className="w-full md:w-72 border-l bg-muted/30 max-h-[500px] overflow-y-auto">
                <div className="p-3 border-b flex items-center justify-between">
                  <span className="font-medium text-sm">Playlist</span>
                  <Button variant="ghost" size="sm" onClick={() => setShowPlaylist(false)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2 space-y-1">
                  {videoPlayer.playlist.map((video, index) => (
                    <button
                      key={video.id}
                      onClick={() => setVideoPlayer(prev => ({ ...prev, video }))}
                      className={`w-full p-2 rounded-lg text-left transition-colors ${video.id === videoPlayer.video?.id ? 'bg-emerald-100 text-emerald-900' : 'hover:bg-muted'
                        }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground w-4">{index + 1}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{video.title}</p>
                          <p className="text-xs text-muted-foreground">{video.duration}</p>
                        </div>
                        {video.completed && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Comparison Dialog */}
      <ExamComparison
        isOpen={showComparison}
        onClose={() => setShowComparison(false)}
        selectedExams={compareExams}
        onRemoveExam={(examId) => setCompareExams(prev => prev.filter(id => id !== examId))}
      />

      {/* Study Plan Generator */}
      <StudyPlanGenerator
        isOpen={showStudyPlan}
        onClose={() => setShowStudyPlan(false)}
        examConfig={examConfig}
      />
    </div >
  );
};

export default SyllabusPage;
