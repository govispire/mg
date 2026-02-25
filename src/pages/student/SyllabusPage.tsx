import React, { useState, useMemo, useRef, useEffect } from 'react';
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
import { useExamCategoryContext } from '@/app/providers';
import {
  allSyllabusData,
  getExamsByCategoryForSyllabus,
  getIconByName,
  ExamSyllabusConfig,
  TopicConfig
} from '@/data/syllabusData';
import { examCategories } from '@/data/examData';
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
  const { selectedCategories } = useExamCategoryContext();

  // Loading state
  const [isLoading, setIsLoading] = useState(true);

  // Completed topics tracking
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(new Set());

  // Recently viewed
  const [recentlyViewed, setRecentlyViewed] = useState<RecentlyViewed[]>([]);

  // Get available exams based on selected categories
  const availableExams = useMemo(() => {
    if (selectedCategories.length === 0) {
      // Show default exams if no category selected
      return [
        { id: 'ibps-po', name: 'IBPS PO', category: 'banking', logo: allSyllabusData['ibps-po']?.logo || '' },
        { id: 'ssc-cgl', name: 'SSC CGL', category: 'ssc', logo: allSyllabusData['ssc-cgl']?.logo || '' },
        { id: 'rrb-ntpc', name: 'RRB NTPC', category: 'railway', logo: allSyllabusData['rrb-ntpc']?.logo || '' },
      ];
    }
    return getExamsByCategoryForSyllabus(selectedCategories);
  }, [selectedCategories]);

  const [selectedExam, setSelectedExam] = useState<string>(availableExams[0]?.id || 'ibps-po');
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

  // Get current exam config
  const examConfig = allSyllabusData[selectedExam];

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

  // Get category names for display
  const categoryNames = selectedCategories.map(catId => {
    const cat = examCategories.find(c => c.id === catId);
    return cat?.name || catId;
  });

  return (
    <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto">
      {/* Header with Category Info */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Know Your Syllabus</h1>
          {categoryNames.length > 0 && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing exams for: {categoryNames.join(', ')}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm border rounded-lg bg-background w-48 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Compare Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowComparison(true)}
            disabled={compareExams.length < 2}
            className="gap-1"
          >
            <ArrowUpDown className="h-4 w-4" />
            Compare ({compareExams.length})
          </Button>

          {/* Study Plan Button */}
          <Button
            size="sm"
            onClick={() => setShowStudyPlan(true)}
            className="gap-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
          >
            <Zap className="h-4 w-4" />
            Study Plan
          </Button>
        </div>
      </div>

      {/* Exam Selector */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {availableExams.map((exam) => (
          <button
            key={exam.id}
            onClick={() => {
              setSelectedExam(exam.id);
              setSelectedTier(allSyllabusData[exam.id]?.tiers[0]?.id || '');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedExam === exam.id
              ? 'bg-emerald-500 text-white'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted'
              }`}
          >
            <img src={exam.logo} alt={exam.name} className="w-5 h-5 object-contain" />
            {exam.name}

            {/* Compare checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                toggleCompare(exam.id);
              }}
              className={`ml-1 w-4 h-4 rounded border flex items-center justify-center cursor-pointer ${compareExams.includes(exam.id)
                ? 'bg-purple-500 border-purple-500'
                : 'border-current'
                }`}
            >
              {compareExams.includes(exam.id) && (
                <CheckCircle2 className="h-3 w-3 text-white" />
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Exam Info Card */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
            <div className="flex items-start gap-4">
              <img
                src={examConfig.logo}
                alt={examConfig.examName}
                className="w-12 h-12 object-contain"
              />
              <div>
                <h2 className="text-lg font-bold text-foreground">{examConfig.fullName}</h2>
                <div className="flex flex-wrap items-center gap-2 mt-1 text-sm text-muted-foreground">
                  <Badge variant="secondary" className="text-xs">{examConfig.stages}</Badge>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {examConfig.examDate}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-5 gap-3">
              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-emerald-600">{overallStats.completed}%</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-purple-600">{overallStats.totalTopics}</p>
                <p className="text-xs text-muted-foreground">Topics</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-blue-600">{overallStats.avgScore}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-amber-600">{overallStats.totalVideos}</p>
                <p className="text-xs text-muted-foreground">Videos</p>
              </div>
              <div className="text-center p-2 bg-muted/30 rounded-lg">
                <p className="text-lg font-bold text-teal-600">{overallStats.totalQuestions}</p>
                <p className="text-xs text-muted-foreground">Questions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tier/Stage Selector */}
      {examConfig.tiers.length > 1 && (
        <Tabs value={selectedTier} onValueChange={setSelectedTier}>
          <TabsList className="bg-muted/30 p-1">
            {examConfig.tiers.map((tier) => (
              <TabsTrigger
                key={tier.id}
                value={tier.id}
                className="data-[state=active]:bg-emerald-500 data-[state=active]:text-white"
              >
                {tier.name}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      )}

      {/* Tier Info */}
      {currentTier && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Duration</p>
                <p className="font-medium text-sm">{currentTier.duration}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Total Marks</p>
                <p className="font-medium text-sm">{currentTier.totalMarks}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <X className="h-4 w-4 text-red-500" />
              <div>
                <p className="text-xs text-muted-foreground">Negative Marking</p>
                <p className="font-medium text-sm truncate">{currentTier.negativeMarking}</p>
              </div>
            </div>
          </Card>
          <Card className="p-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className={`h-4 w-4 ${currentTier.sectionalCutoff ? 'text-emerald-500' : 'text-muted-foreground'}`} />
              <div>
                <p className="text-xs text-muted-foreground">Sectional Cutoff</p>
                <p className="font-medium text-sm">{currentTier.sectionalCutoff ? 'Yes' : 'No'}</p>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Recently Viewed */}
      {recentlyViewed.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-none">
          <CardContent className="p-4">
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              Continue Learning
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-2">
              {recentlyViewed.map((item) => (
                <button
                  key={item.topicId}
                  className="p-2 bg-white rounded-lg text-left hover:shadow-sm transition-all border border-purple-100"
                  onClick={() => {
                    // Find the topic and open resources
                    currentTier?.subjects.forEach(subject => {
                      const topic = subject.topics.find(t => t.id === item.topicId);
                      if (topic) {
                        openResources(topic, subject.name, 'videos');
                      }
                    });
                  }}
                >
                  <p className="text-xs font-medium truncate">{item.topicName}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{item.subjectName}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subjects List */}
      <div className="space-y-3">
        {filteredSubjects.map((subject) => {
          const subjectProgress = Math.round(
            subject.topics.reduce((sum, t) => sum + t.progress, 0) / subject.topics.length
          );
          const isExpanded = expandedSubjects.includes(subject.id);

          return (
            <Card key={subject.id} className="overflow-hidden">
              <button
                onClick={() => toggleSubject(subject.id)}
                className="w-full p-4 flex items-center gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className={`p-2 rounded-lg ${subject.iconBg}`}>
                  {getIconByName(subject.iconName)}
                </div>

                <div className="flex-1 text-left">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{subject.name}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {subject.marks} marks
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={subjectProgress} className="h-1.5 flex-1 max-w-32" />
                    <span className="text-xs text-muted-foreground">{subjectProgress}%</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {subject.topics.length} topics
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t bg-muted/20 p-4">
                  <div className="grid gap-2">
                    {subject.topics.map((topic) => (
                      <div
                        key={topic.id}
                        className={`flex flex-col md:flex-row md:items-center gap-3 p-3 bg-background rounded-lg hover:shadow-sm transition-all ${completedTopics.has(topic.id) ? 'border-l-4 border-emerald-500' : ''
                          }`}
                      >
                        {/* Completion Checkbox */}
                        <button
                          onClick={() => handleTopicCompletion(topic.id)}
                          className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${completedTopics.has(topic.id)
                            ? 'bg-emerald-500 border-emerald-500'
                            : 'border-muted-foreground/30 hover:border-emerald-500'
                            }`}
                        >
                          {completedTopics.has(topic.id) && (
                            <CheckCircle2 className="h-3.5 w-3.5 text-white" />
                          )}
                        </button>

                        {/* Topic Info */}
                        <div className="flex-1">
                          <p className={`font-medium text-sm ${completedTopics.has(topic.id) ? 'line-through text-muted-foreground' : ''}`}>
                            {topic.name}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Progress value={topic.progress} className="h-1 flex-1 max-w-32" />
                            <span className="text-xs text-muted-foreground">{topic.progress}%</span>
                          </div>
                        </div>

                        {/* Interactive Resource Buttons */}
                        <div className="flex items-center gap-2 mt-2 md:mt-0">
                          <button
                            onClick={() => openResources(topic, subject.name, 'videos')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 transition-colors border border-blue-100"
                          >
                            <Video className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Videos</span>
                            <span className="text-xs bg-blue-200 px-1 rounded-sm text-blue-800 ml-0.5">{topic.videos.length}</span>
                          </button>

                          <button
                            onClick={() => openResources(topic, subject.name, 'pdfs')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors border border-amber-100"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">PDFs</span>
                            <span className="text-xs bg-amber-200 px-1 rounded-sm text-amber-900 ml-0.5">{topic.pdfs.length}</span>
                          </button>

                          <button
                            onClick={() => openResources(topic, subject.name, 'tests')}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors border border-emerald-100"
                          >
                            <BookOpen className="h-3.5 w-3.5" />
                            <span className="text-xs font-medium">Tests</span>
                            <span className="text-xs bg-emerald-200 px-1 rounded-sm text-emerald-800 ml-0.5">{topic.tests.length}</span>
                          </button>
                        </div>
                      </div>
                    ))}
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
                            window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
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
