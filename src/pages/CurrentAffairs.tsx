import * as React from 'react';
const { useState, useEffect } = React;
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, ChevronRight, Home, Bell, TrendingUp, Filter, Search, BookOpen,
  Globe, Landmark, Briefcase, AlertCircle, Grid3X3, List, Image, Layers,
  Tag, ArrowRight, Play, CheckCircle, Trophy, Zap, FileText, Hash,
  Bookmark, BookmarkCheck, X, Mail, Eye, CalendarDays, Download,
  ChevronDown, ChevronUp, Share2, Volume2, VolumeX, Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import LandingHeader from '@/components/LandingHeader';
import Footer from '@/components/Footer';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { ShareDialog } from '@/components/current-affairs/ShareDialog';
import { TopicViewDialog } from '@/components/current-affairs/TopicViewDialog';
import { ContinueReadingSection } from '@/components/current-affairs/ContinueReadingSection';
import DailyNewsView from '@/components/current-affairs/DailyNewsView';
import AllInOneView from '@/components/current-affairs/AllInOneView';
import ArticleQuiz from '@/components/current-affairs/ArticleQuiz';
import { allArticles, getArticleById } from '@/components/current-affairs/articlesData';
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import { Article, ReadingSettings, DigestPreferences, ReadingProgress } from '@/components/current-affairs/types';
import { useReadingProgress } from '@/hooks/useReadingProgress';

const CurrentAffairs = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [expandedTopic, setExpandedTopic] = useState<string | null>(null);
  const [activeMainTab, setActiveMainTab] = useState('daily-quizzes');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Bookmark State
  const [bookmarkedArticles, setBookmarkedArticles] = useState<string[]>(() => {
    const saved = localStorage.getItem('bookmarkedArticles');
    return saved ? JSON.parse(saved) : [];
  });
  const [showBookmarks, setShowBookmarks] = useState(false);

  // Daily Digest State
  const [digestPreferences, setDigestPreferences] = useState<DigestPreferences>(() => {
    const saved = localStorage.getItem('digestPreferences');
    return saved ? JSON.parse(saved) : {
      enabled: false,
      frequency: 'daily',
      categories: [],
      email: ''
    };
  });
  const [showDigestSettings, setShowDigestSettings] = useState(false);

  // Use the reading progress hook
  const { getReadingProgress, markAsRead } = useReadingProgress();

  // Share Dialog State
  const [shareArticle, setShareArticle] = useState<Article | null>(null);

  // Topic View Dialog State
  const [topicViewArticles, setTopicViewArticles] = useState<Article[] | null>(null);
  const [topicViewName, setTopicViewName] = useState<string>('');

  // Quiz State
  const [quizArticle, setQuizArticle] = useState<Article | null>(null);

  // Audio Narration State
  const [isNarrating, setIsNarrating] = useState(false);
  const [narrationArticleId, setNarrationArticleId] = useState<string | null>(null);
  const speechSynthesisRef = React.useRef<SpeechSynthesisUtterance | null>(null);

  // Scroll to Top State
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Persist bookmarks
  useEffect(() => {
    localStorage.setItem('bookmarkedArticles', JSON.stringify(bookmarkedArticles));
  }, [bookmarkedArticles]);

  // Persist digest preferences
  useEffect(() => {
    localStorage.setItem('digestPreferences', JSON.stringify(digestPreferences));
  }, [digestPreferences]);

  // Audio Narration functions
  const startNarration = (article: Article) => {
    if (!('speechSynthesis' in window)) {
      toast.error('Audio narration is not supported in your browser');
      return;
    }

    stopNarration();

    const textToRead = `${article.title}. ${article.excerpt}. ${article.content || ''}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    utterance.onend = () => {
      setIsNarrating(false);
      setNarrationArticleId(null);
    };

    utterance.onerror = () => {
      setIsNarrating(false);
      setNarrationArticleId(null);
      toast.error('Narration stopped due to an error');
    };

    speechSynthesisRef.current = utterance;
    window.speechSynthesis.speak(utterance);
    setIsNarrating(true);
    setNarrationArticleId(article.id);
    toast.success('Starting audio narration');
  };

  const stopNarration = () => {
    window.speechSynthesis.cancel();
    setIsNarrating(false);
    setNarrationArticleId(null);
  };

  const toggleNarration = (article: Article) => {
    if (isNarrating && narrationArticleId === article.id) {
      stopNarration();
    } else {
      startNarration(article);
    }
  };

  // Open Topic View with all articles
  const openTopicView = (topic: string, articles: Article[]) => {
    setTopicViewName(topic);
    setTopicViewArticles(articles);
  };

  const categories = [
    { id: 'All', name: 'All Topics', icon: BookOpen },
    { id: 'Banking', name: 'Banking & Finance', icon: Landmark },
    { id: 'Economy', name: 'Economy', icon: TrendingUp },
    { id: 'National', name: 'National', icon: Globe },
    { id: 'International', name: 'International', icon: Globe },
    { id: 'Government', name: 'Government Schemes', icon: Briefcase },
    { id: 'Science', name: 'Science & Tech', icon: BookOpen },
    { id: 'Sports', name: 'Sports', icon: Trophy },
  ];

  const topics = [
    'RBI Policy', 'Budget 2025', 'Defence', 'Space & ISRO', 'International Relations',
    'Environment', 'Education', 'Health', 'Infrastructure', 'Digital India'
  ];

  const popularTags = [
    '#RBI', '#Budget2025', '#UPSC', '#Banking', '#SSC', '#Railways', '#Defence',
    '#Economy', '#CurrentAffairs', '#GK', '#India', '#International'
  ];

  const quickQuizzes = [
    { id: 1, title: 'Daily Current Affairs Quiz', questions: 10, time: '5 min', difficulty: 'Easy', attempted: false },
    { id: 2, title: 'Banking & Finance Special', questions: 15, time: '10 min', difficulty: 'Medium', attempted: true, score: 12 },
    { id: 3, title: 'Weekly Mega Quiz', questions: 50, time: '30 min', difficulty: 'Hard', attempted: false },
    { id: 4, title: 'Budget 2025 Special', questions: 20, time: '15 min', difficulty: 'Medium', attempted: false },
  ];

  // Bookmark functions
  const toggleBookmark = (articleId: string) => {
    setBookmarkedArticles(prev => {
      const isBookmarked = prev.includes(articleId);
      if (isBookmarked) {
        toast.success('Article removed from bookmarks');
        return prev.filter(id => id !== articleId);
      } else {
        toast.success('Article saved to bookmarks');
        return [...prev, articleId];
      }
    });
  };

  const isBookmarked = (articleId: string) => bookmarkedArticles.includes(articleId);

  const getBookmarkedArticles = () => allArticles.filter(a => bookmarkedArticles.includes(a.id));

  // Digest functions
  const toggleDigestCategory = (categoryId: string) => {
    setDigestPreferences(prev => ({
      ...prev,
      categories: prev.categories.includes(categoryId)
        ? prev.categories.filter(c => c !== categoryId)
        : [...prev.categories, categoryId]
    }));
  };

  const saveDigestPreferences = () => {
    if (digestPreferences.enabled && !digestPreferences.email) {
      toast.error('Please enter your email address');
      return;
    }
    if (digestPreferences.enabled && digestPreferences.categories.length === 0) {
      toast.error('Please select at least one category');
      return;
    }
    localStorage.setItem('digestPreferences', JSON.stringify(digestPreferences));
    toast.success('Daily digest preferences saved!');
    setShowDigestSettings(false);
  };

  const getFilteredArticles = () => {
    let filtered = allArticles;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(a => a.category === selectedCategory);
    }

    if (selectedTag) {
      filtered = filtered.filter(a => a.tags.includes(selectedTag));
    }

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(a =>
        a.title.toLowerCase().includes(query) ||
        a.excerpt.toLowerCase().includes(query) ||
        a.tags.some(t => t.toLowerCase().includes(query))
      );
    }

    return filtered;
  };

  const filteredArticles = getFilteredArticles();

  const getArticlesByTopic = () => {
    const grouped: Record<string, Article[]> = {};
    filteredArticles.forEach(article => {
      if (!grouped[article.topic]) {
        grouped[article.topic] = [];
      }
      grouped[article.topic].push(article);
    });
    return grouped;
  };

  const getRelatedArticles = (article: Article) => {
    return allArticles.filter(a => article.relatedIds.includes(a.id));
  };

  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return <Badge className="bg-red-500/10 text-red-600 border-red-500/20">High Priority</Badge>;
      case 'medium':
        return <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Medium</Badge>;
      default:
        return <Badge variant="secondary">Normal</Badge>;
    }
  };

  // Navigate to article reader
  const openArticle = (article: Article) => {
    navigate(`/current-affairs/${article.id}`);
  };

  // Handle mark as read with toast
  const handleMarkAsRead = (articleId: string) => {
    markAsRead(articleId);
    toast.success('Article marked as read');
  };

  // Bookmarks Sheet Component
  const BookmarksSheet = () => (
    <Sheet open={showBookmarks} onOpenChange={setShowBookmarks}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bookmark className="h-5 w-5" />
            Saved Articles ({bookmarkedArticles.length})
          </SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-100px)] mt-6">
          {getBookmarkedArticles().length === 0 ? (
            <div className="text-center py-12">
              <Bookmark className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No saved articles yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Click the bookmark icon on any article to save it for later
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {getBookmarkedArticles().map(article => (
                <Card key={article.id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      {article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-20 h-20 object-cover rounded-lg flex-shrink-0"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            className="font-semibold line-clamp-2 cursor-pointer hover:text-primary"
                            onClick={() => {
                              openArticle(article);
                              setShowBookmarks(false);
                            }}
                          >
                            {article.title}
                          </h4>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleBookmark(article.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="text-xs">{article.category}</Badge>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  // Daily Digest Settings Dialog
  const DigestSettingsDialog = () => (
    <Dialog open={showDigestSettings} onOpenChange={setShowDigestSettings}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Daily Digest Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="font-medium">Enable Daily Digest</Label>
              <p className="text-sm text-muted-foreground">Get curated news delivered to your inbox</p>
            </div>
            <Switch
              checked={digestPreferences.enabled}
              onCheckedChange={(checked) => setDigestPreferences(prev => ({ ...prev, enabled: checked }))}
            />
          </div>

          {digestPreferences.enabled && (
            <>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={digestPreferences.email}
                  onChange={(e) => setDigestPreferences(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>

              <div className="space-y-2">
                <Label>Frequency</Label>
                <div className="flex gap-2">
                  <Button
                    variant={digestPreferences.frequency === 'daily' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDigestPreferences(prev => ({ ...prev, frequency: 'daily' }))}
                  >
                    Daily
                  </Button>
                  <Button
                    variant={digestPreferences.frequency === 'weekly' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setDigestPreferences(prev => ({ ...prev, frequency: 'weekly' }))}
                  >
                    Weekly
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Select Categories</Label>
                <div className="grid grid-cols-2 gap-2">
                  {categories.filter(c => c.id !== 'All').map(category => (
                    <div
                      key={category.id}
                      className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${digestPreferences.categories.includes(category.id)
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                        }`}
                      onClick={() => toggleDigestCategory(category.id)}
                    >
                      <Checkbox
                        checked={digestPreferences.categories.includes(category.id)}
                        onCheckedChange={() => toggleDigestCategory(category.id)}
                      />
                      <span className="text-sm">{category.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button className="w-full" onClick={saveDigestPreferences}>
            Save Preferences
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredArticles.map((article, idx) => {
        const progress = getReadingProgress(article.id);
        return (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <Card className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden relative">
              {progress > 0 && (
                <div className="absolute top-0 left-0 right-0 h-1 bg-muted">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline">{article.category}</Badge>
                  {getImportanceBadge(article.importance)}
                  {progress >= 100 && (
                    <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Read
                    </Badge>
                  )}
                  {article.hasQuiz && (
                    <Badge className="bg-primary/10 text-primary border-primary/20 ml-auto">
                      <Zap className="h-3 w-3 mr-1" />
                      Quiz
                    </Badge>
                  )}
                </div>
                <h3
                  className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2"
                  onClick={() => openArticle(article)}
                >
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{article.excerpt}</p>
                <div className="flex flex-wrap gap-1 mb-3">
                  {article.tags.slice(0, 3).map(tag => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t">
                  <div className="flex items-center gap-2">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {article.readTime}
                    </span>
                    {progress > 0 && progress < 100 && (
                      <span className="text-xs text-primary">{Math.round(progress)}% read</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); toggleNarration(article); }}
                      title="Listen"
                    >
                      {isNarrating && narrationArticleId === article.id ? (
                        <VolumeX className="h-4 w-4 text-primary" />
                      ) : (
                        <Volume2 className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); handleMarkAsRead(article.id); }}
                      title="Mark as Read"
                    >
                      <Check className={`h-4 w-4 ${progress >= 100 ? 'text-green-500' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); setShareArticle(article); }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                    >
                      {isBookmarked(article.id) ? (
                        <BookmarkCheck className="h-4 w-4 text-primary" />
                      ) : (
                        <Bookmark className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => openArticle(article)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );

  const renderThumbnailView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {filteredArticles.map((article, idx) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: idx * 0.05 }}
        >
          <Card className="overflow-hidden hover:shadow-xl transition-all duration-300 group cursor-pointer">
            <div className="relative h-48 overflow-hidden" onClick={() => openArticle(article)}>
              <img
                src={article.image}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge className="bg-white/90 text-foreground">{article.category}</Badge>
                  {article.hasQuiz && (
                    <Badge className="bg-primary text-primary-foreground">
                      <Play className="h-3 w-3 mr-1" />
                      {article.quizQuestions}Q
                    </Badge>
                  )}
                </div>
              </div>
              {article.importance === 'high' && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-red-500 text-white">Hot</Badge>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-3 left-3 h-8 w-8 p-0 bg-white/80 hover:bg-white"
                onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
              >
                {isBookmarked(article.id) ? (
                  <BookmarkCheck className="h-4 w-4 text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
            </div>
            <CardContent className="p-4">
              <h3
                className="font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2"
                onClick={() => openArticle(article)}
              >
                {article.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-3 line-clamp-2">{article.excerpt}</p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {article.readTime}
                </span>
                <Button
                  variant="link"
                  size="sm"
                  className="p-0 h-auto text-primary"
                  onClick={() => openArticle(article)}
                >
                  Read More <ArrowRight className="h-3 w-3 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderListView = () => (
    <div className="space-y-4">
      {filteredArticles.map((article, idx) => (
        <motion.div
          key={article.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: idx * 0.03 }}
        >
          <Card className="hover:shadow-lg transition-all duration-300 group cursor-pointer">
            <CardContent className="p-4 flex gap-4">
              <div
                className="hidden sm:block w-32 h-24 rounded-lg overflow-hidden flex-shrink-0"
                onClick={() => openArticle(article)}
              >
                <img
                  src={article.image}
                  alt={article.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline">{article.category}</Badge>
                  {getImportanceBadge(article.importance)}
                  {article.hasQuiz && (
                    <Badge className="bg-primary/10 text-primary border-primary/20">
                      <Zap className="h-3 w-3 mr-1" />
                      {article.quizQuestions} Questions
                    </Badge>
                  )}
                </div>
                <h3
                  className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1"
                  onClick={() => openArticle(article)}
                >
                  {article.title}
                </h3>
                <p className="text-muted-foreground text-sm mb-2 line-clamp-1">{article.excerpt}</p>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {article.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.readTime}
                  </span>
                  <div className="flex gap-1 ml-auto">
                    {article.tags.slice(0, 2).map(tag => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="text-xs cursor-pointer"
                        onClick={(e) => { e.stopPropagation(); setSelectedTag(tag); }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                >
                  {isBookmarked(article.id) ? (
                    <BookmarkCheck className="h-5 w-5 text-primary" />
                  ) : (
                    <Bookmark className="h-5 w-5 text-muted-foreground" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-muted-foreground"
                  onClick={() => openArticle(article)}
                >
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );

  const renderAllInOneView = () => {
    const groupedArticles = getArticlesByTopic();

    return (
      <div className="space-y-6">
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Layers className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">All News - Topic Wise View</h2>
                <p className="text-muted-foreground text-sm">Click on a topic to view all articles in one page</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {topics.map(topic => (
                <Button
                  key={topic}
                  variant={expandedTopic === topic ? "default" : "outline"}
                  size="sm"
                  onClick={() => {
                    if (groupedArticles[topic] && groupedArticles[topic].length > 0) {
                      openTopicView(topic, groupedArticles[topic]);
                    } else {
                      toast.info(`No articles found for ${topic}`);
                    }
                  }}
                >
                  {topic}
                  {groupedArticles[topic] && (
                    <Badge variant="secondary" className="ml-2">
                      {groupedArticles[topic].length}
                    </Badge>
                  )}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {Object.entries(groupedArticles).map(([topic, articles]) => (
          <Card key={topic} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="flex items-center gap-2">
                  <Hash className="h-5 w-5 text-primary" />
                  {topic}
                  <Badge variant="secondary">{articles.length} articles</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={() => openTopicView(topic, articles)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Read All ({articles.length})
                  </Button>
                  <Button variant="outline" size="sm">
                    <FileText className="h-4 w-4 mr-2" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              {articles.map((article, idx) => {
                const progress = getReadingProgress(article.id);
                return (
                  <div
                    key={article.id}
                    className="p-4 bg-muted/50 rounded-lg hover:bg-muted transition-colors cursor-pointer group relative overflow-hidden"
                    onClick={() => openArticle(article)}
                  >
                    {progress > 0 && (
                      <div
                        className="absolute left-0 top-0 h-full bg-primary/10 transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    )}
                    <div className="flex items-start gap-4 relative z-10">
                      <div className="flex flex-col items-center">
                        <span className="text-2xl font-bold text-primary/30">{idx + 1}</span>
                        {progress > 0 && (
                          <span className="text-xs text-primary mt-1">{Math.round(progress)}%</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          {getImportanceBadge(article.importance)}
                          {article.hasQuiz && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Quiz Available
                            </Badge>
                          )}
                          {progress >= 100 && (
                            <Badge className="bg-primary/10 text-primary border-primary/20">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Read
                            </Badge>
                          )}
                          {progress > 0 && progress < 100 && (
                            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
                              <Clock className="h-3 w-3 mr-1" />
                              Continue Reading
                            </Badge>
                          )}
                          <div className="ml-auto flex items-center gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); setShareArticle(article); }}
                            >
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0"
                              onClick={(e) => { e.stopPropagation(); toggleBookmark(article.id); }}
                            >
                              {isBookmarked(article.id) ? (
                                <BookmarkCheck className="h-4 w-4 text-primary" />
                              ) : (
                                <Bookmark className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                        <h4 className="font-semibold group-hover:text-primary transition-colors">
                          {article.title}
                        </h4>
                        <p className="text-muted-foreground text-sm mt-1">{article.excerpt}</p>
                        <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </span>
                          <div className="flex gap-1">
                            {article.tags.map(tag => (
                              <span key={tag} className="text-primary">{tag}</span>
                            ))}
                          </div>
                        </div>

                        {article.relatedIds.length > 0 && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-xs text-muted-foreground mb-2">Related News:</p>
                            <div className="flex flex-wrap gap-2">
                              {getRelatedArticles(article).map(related => (
                                <Badge
                                  key={related.id}
                                  variant="outline"
                                  className="text-xs cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                  onClick={(e) => { e.stopPropagation(); openArticle(related); }}
                                >
                                  {related.title.substring(0, 40)}...
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const weeklyDigests = [
    { id: 1, title: 'Week 1 - January 2025 Digest', articles: 45, exams: ['UPSC', 'SSC', 'Banking'] },
    { id: 2, title: 'December 2024 Monthly Digest', articles: 180, exams: ['All Exams'] },
    { id: 3, title: 'Year End 2024 Special', articles: 500, exams: ['UPSC', 'State PSC'] },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-muted/30 to-background relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[150px] animate-bounce-slow" />
        <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] bg-purple-500/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03]" />
      </div>

      <LandingHeader />

      <main className="max-w-[1600px] w-full mx-auto px-4 md:px-8 pt-2 pb-8 relative z-10">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Link to="/" className="flex items-center gap-1 hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            PrepSmart Home
          </Link>
          <ChevronRight className="h-4 w-4" />
          <span className="text-foreground">Current Affairs</span>
        </nav>

        {/* Header Section with Glassmorphism */}
        <header className="relative mb-4 p-8 rounded-[2rem] border border-white/20 bg-white/5 backdrop-blur-xl overflow-hidden group">
          {/* Internal Glow Effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px] -mr-32 -mt-32 transition-transform duration-1000 group-hover:scale-110" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-[60px] -ml-24 -mb-24 transition-transform duration-1000 group-hover:scale-110" />

          <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-gradient-to-br from-primary to-primary/80 rounded-2xl shadow-xl shadow-primary/20">
                  <Bell className="h-7 w-7 text-white" />
                </div>
                <div className="space-y-1">
                  <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 px-3 py-0.5 rounded-full text-[10px] tracking-widest uppercase font-bold">
                    Daily Updates • Live
                  </Badge>
                  <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
                    Current <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">Affairs</span>
                  </h1>
                </div>
              </div>
              <p className="text-lg text-muted-foreground/80 max-w-2xl leading-relaxed">
                Stay ahead in your exam preparation with expertly curated daily, weekly, and monthly news updates tailored for competitive excellence.
              </p>
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              <div className="relative group/search max-w-sm w-full lg:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-muted-foreground transition-colors group-focus-within/search:text-primary" />
                <Input
                  placeholder="Search topics..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 h-12 bg-white/10 dark:bg-black/20 border-white/20 backdrop-blur-md rounded-xl focus:ring-primary/30 focus:border-primary/50 transition-all text-sm"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowBookmarks(true)}
                  className="h-12 px-5 gap-2.5 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all group"
                >
                  <Bookmark className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Saved Articles</span>
                  {bookmarkedArticles.length > 0 && (
                    <Badge className="ml-1 bg-primary text-white border-0">{bookmarkedArticles.length}</Badge>
                  )}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowDigestSettings(true)}
                  className="h-12 px-5 gap-2.5 rounded-xl border-white/20 bg-white/5 hover:bg-white/10 backdrop-blur-md transition-all group"
                >
                  <Mail className="h-4.5 w-4.5 group-hover:scale-110 transition-transform" />
                  <span className="hidden sm:inline">Digest</span>
                  {digestPreferences.enabled && (
                    <div className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Continue Reading Section */}
        <ContinueReadingSection />

        {/* Improved Tabs List Styling */}
        <Tabs value={activeMainTab} onValueChange={setActiveMainTab} className="space-y-4">
          <div className="flex justify-center flex-col items-center gap-1.5">
            <TabsList className="h-14 bg-white/5 backdrop-blur-xl border border-white/20 p-1.5 rounded-2xl shadow-xl">
              {[
                { value: 'news', label: 'News', icon: BookOpen },
                { value: 'daily-news', label: 'Daily News', icon: CalendarDays },
                { value: 'all-in-one', label: 'All in One', icon: Layers },
                { value: 'daily-quizzes', label: 'Daily Quizzes', icon: Zap },
                { value: 'weekly-quizzes', label: 'Weekly Quizzes', icon: FileText },
                { value: 'monthly-quizzes', label: 'Monthly Quiz', icon: Trophy },
              ].map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  value={tab.value}
                  className="data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-lg h-full px-6 gap-2.5 rounded-xl transition-all font-medium text-sm"
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            <p className="text-xs text-muted-foreground/60 italic font-medium">Explore over 2,000+ curated articles and interactive quizzes</p>
          </div>

          <TabsContent value="news" className="space-y-4">
            {/* Category Filters - Moved Inside Tab */}
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <ScrollArea className="w-full">
                  <div className="flex gap-2">
                    {categories.map((cat) => (
                      <Button
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(cat.id)}
                        className="gap-1.5 whitespace-nowrap text-xs"
                      >
                        <cat.icon className="h-3.5 w-3.5" />
                        {cat.name}
                      </Button>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>

                {selectedTag && (
                  <Badge variant="secondary" className="gap-1 text-xs">
                    {selectedTag}
                    <button onClick={() => setSelectedTag(null)} className="ml-1 hover:text-destructive">✕</button>
                  </Badge>
                )}
              </div>
            </div>

            <AnimatePresence mode="wait">
              {renderThumbnailView()}
            </AnimatePresence>
          </TabsContent>

          {/* Daily News Tab */}
          <TabsContent value="daily-news" className="space-y-6">

            <DailyNewsView />
          </TabsContent>

          {/* All in One Tab */}
          <TabsContent value="all-in-one" className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Layers className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">All News - Topic Wise View</h2>
                      <p className="text-muted-foreground text-sm">Click on a topic to view all articles in one page</p>
                    </div>
                  </div>

                  <div className="flex bg-muted/50 p-1 rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3 mt-4">
                  {topics.map(topic => {
                    const groupedArticles = getArticlesByTopic();
                    const count = groupedArticles[topic]?.length || 0;
                    if (count === 0) return null;

                    return (
                      <Button
                        key={topic}
                        variant="secondary"
                        className="bg-background hover:bg-background/80 shadow-sm border-0 h-9 font-medium"
                        onClick={() => {
                          const element = document.getElementById(topic.replace(/\s+/g, '-'));
                          if (element) {
                            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        {topic}
                        <Badge variant="secondary" className="ml-2 bg-muted text-muted-foreground hover:bg-muted">
                          {count}
                        </Badge>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            <AllInOneView viewMode={viewMode} />
          </TabsContent>

          <TabsContent value="daily-quizzes" className="space-y-6">
            <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Trophy className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Daily Current Affairs Quizzes</h2>
                      <p className="text-muted-foreground text-sm">Practice with fresh questions updated every day: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex bg-muted/50 p-1 rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="space-y-8">
              {Object.entries(
                dailyQuizzes
                  .filter(quiz => quiz.subject === 'Current Affairs')
                  .sort((a, b) => new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime())
                  .reduce((groups, quiz) => {
                    const date = new Date(quiz.scheduledDate);
                    const key = date.toLocaleString('default', { month: 'long', year: 'numeric' });
                    if (!groups[key]) groups[key] = [];
                    groups[key].push(quiz);
                    return groups;
                  }, {} as Record<string, typeof dailyQuizzes>)
              ).map(([month, quizzes]) => (
                <div key={month} className="space-y-4">
                  <div className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5 text-primary" />
                    <h3 className="text-lg font-semibold text-foreground">{month}</h3>
                    <Badge variant="secondary" className="ml-2">{quizzes.length}</Badge>
                  </div>
                  <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" : "space-y-3"}>
                    {quizzes.map((quiz, i) => (
                      viewMode === 'grid' ? (
                        <Card key={quiz.id} className="hover:shadow-lg transition-all cursor-pointer group border-primary/10 flex flex-col h-full">
                          <CardContent className="p-4 flex flex-col h-full">
                            <div className="flex items-center justify-between mb-3">
                              <Badge className="bg-primary/10 text-primary border-primary/20 text-[10px] whitespace-nowrap">{new Date(quiz.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Badge>
                              {quiz.isNew && <Badge className="bg-red-500 text-white animate-pulse text-[10px]">NEW</Badge>}
                            </div>
                            <h3 className="font-semibold mb-auto text-sm group-hover:text-primary transition-colors line-clamp-2">
                              {quiz.title}
                            </h3>
                            <div className="mt-4 space-y-3">
                              <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <BookOpen className="h-3 w-3" />
                                  {quiz.questions} Qs
                                </span>
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {quiz.duration}m
                                </span>
                              </div>

                              <div className="flex gap-2">
                                <Button size="sm" className="w-full h-8 text-xs bg-primary hover:bg-primary/90 gap-1">
                                  <Play className="h-3 w-3" /> Start
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card key={quiz.id} className="hover:bg-muted/30 transition-colors cursor-pointer border-primary/5">
                          <CardContent className="p-3 flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs text-center border border-primary/5 p-1 leading-none whitespace-pre-line">
                                {new Date(quiz.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).split(' ').join('\n')}
                              </div>
                              <div>
                                <h4 className="font-semibold text-sm">{quiz.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                  <span>{new Date(quiz.scheduledDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                  <span>•</span>
                                  <span>{quiz.questions} Questions</span>
                                  <span>•</span>
                                  <span>{quiz.duration}m</span>
                                  <span>•</span>
                                  <span>{quiz.totalUsers || '1.2k'} Users</span>
                                </div>
                              </div>
                            </div>
                            <Button size="sm" variant="ghost" className="text-primary gap-1">
                              Start <Play className="h-3 w-3" />
                            </Button>
                          </CardContent>
                        </Card>
                      )
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Topic Specific Quizzes Section */}
            <div className="mt-8">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                Topic-wise Practice
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {allArticles.filter(a => a.hasQuiz).slice(0, 6).map(article => (
                  <Card key={article.id} className="hover:shadow-md transition-all cursor-pointer" onClick={() => setQuizArticle(article)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center flex-shrink-0">
                        <Zap className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-1">{article.title}</h4>
                        <p className="text-xs text-muted-foreground">{article.category} • {article.quizQuestions || 5} Qs</p>
                      </div>
                      <Button size="sm" variant="outline">Start</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="weekly-quizzes" className="space-y-6">
            <Card className="bg-gradient-to-r from-blue-500/5 to-indigo-500/5 border-blue-500/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-500/10 rounded-lg">
                      <Calendar className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Weekly Quiz Compilations</h2>
                      <p className="text-muted-foreground text-sm">Comprehensive weekly practice for focused revision</p>
                    </div>
                  </div>

                  <div className="flex bg-muted/50 p-1 rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-3"}>
              {[
                { title: 'Current Affairs: Jan 15-21, 2026', info: '7 Days Coverage', questions: 50, duration: '25 min' },
                { title: 'Current Affairs: Jan 08-14, 2026', info: '7 Days Coverage', questions: 50, duration: '25 min' },
                { title: 'Current Affairs: Jan 01-07, 2026', info: 'Full Week 1', questions: 50, duration: '25 min' },
                { title: 'Current Affairs: Dec 24-31, 2025', info: 'Year End Week', questions: 60, duration: '30 min' },
                { title: 'Current Affairs: Dec 17-23, 2025', info: 'Pre-Holiday Review', questions: 45, duration: '20 min' },
                { title: 'Current Affairs: Dec 10-16, 2025', info: 'December Week 2', questions: 50, duration: '25 min' },
                { title: 'Current Affairs: Nov 24-30, 2025', info: 'November Closing', questions: 50, duration: '25 min' },
                { title: 'Current Affairs: Nov 15-21, 2025', info: 'Mid-November Review', questions: 50, duration: '25 min' },
              ].map((week, i) => (
                viewMode === 'grid' ? (
                  <Card key={i} className="hover:shadow-md transition-all border-blue-100">
                    <CardContent className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center font-bold text-blue-600 border border-blue-100/50">
                          W{8 - i}
                        </div>
                        <div>
                          <h3 className="font-semibold">{week.title}</h3>
                          <Badge variant="outline" className="text-blue-600 bg-blue-50/50 text-[10px] uppercase tracking-wider">{week.info}</Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                        <span className="flex items-center gap-1"><BookOpen className="h-3.5 w-3.5" /> {week.questions} Qs</span>
                        <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {week.duration}</span>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="flex-1">PDF</Button>
                        <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">Start Quiz</Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={i} className="hover:bg-blue-50/20 transition-colors cursor-pointer border-blue-100/30">
                    <CardContent className="p-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center font-bold text-blue-600 text-xs">
                          {8 - i}
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm">{week.title}</h4>
                          <p className="text-xs text-muted-foreground">{week.info} • {week.questions} Questions • {week.duration}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600"><Download className="h-4 w-4" /></Button>
                        <Button size="sm" variant="ghost" className="text-blue-600 font-bold">START</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </TabsContent>

          <TabsContent value="monthly-quizzes" className="space-y-6">
            <Card className="bg-gradient-to-r from-purple-500/5 to-pink-500/5 border-purple-500/20">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-purple-500/10 rounded-lg">
                      <TrendingUp className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">Monthly Mega Quizzes</h2>
                      <p className="text-muted-foreground text-sm">Test your retention with over 200+ questions from entire months</p>
                    </div>
                  </div>

                  <div className="flex bg-muted/50 p-1 rounded-lg">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="h-8 w-8 p-0 rounded-md"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 gap-6" : "space-y-4"}>
              {[
                { month: 'Current Affairs: January 2026', count: 180, time: '90 min', status: 'In Progress' },
                { month: 'Current Affairs: December 2025', count: 250, time: '120 min', status: 'Complete' },
                { month: 'November 2025', count: 220, time: '100 min', status: 'Complete' },
                { month: 'October 2025', count: 200, time: '90 min', status: 'Archive' },
              ].map((m, i) => (
                viewMode === 'grid' ? (
                  <Card key={i} className="hover:shadow-lg transition-all overflow-hidden border-purple-100">
                    <div className="h-1.5 bg-gradient-to-r from-purple-500 to-pink-500" />
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h3 className="text-xl font-bold">{m.month}</h3>
                          <p className="text-sm text-muted-foreground mt-1">Full Month Compilation</p>
                        </div>
                        <Badge className="bg-purple-100 text-purple-700 border-0">{m.status}</Badge>
                      </div>
                      <div className="flex items-center gap-6 mb-6">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600 font-mono">{m.count}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Questions</div>
                        </div>
                        <div className="w-px h-8 bg-muted" />
                        <div className="text-center">
                          <div className="text-2xl font-bold text-foreground font-mono">{m.time}</div>
                          <div className="text-[10px] text-muted-foreground uppercase font-bold">Duration</div>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <Button className="flex-1 bg-purple-600 hover:bg-purple-700">Start Mega Quiz</Button>
                        <Button variant="outline" size="icon" title="Download Digest"><Download className="h-4 w-4" /></Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card key={i} className="hover:bg-purple-50/20 transition-colors cursor-pointer border-purple-100/30">
                    <CardContent className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-5">
                        <div className="h-12 w-1 bg-purple-500 rounded-full" />
                        <div>
                          <h4 className="text-lg font-bold">{m.month} Revision</h4>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mt-0.5">
                            <span>{m.count} Questions</span>
                            <span>•</span>
                            <span>{m.time}</span>
                            <span>•</span>
                            <span className="text-purple-600 font-medium">{m.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" className="text-muted-foreground"><Download className="h-4 w-4" /></Button>
                        <Button className="bg-purple-600 hover:bg-purple-700 px-6">START</Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <section className="mt-16 p-8 bg-gradient-to-r from-primary/10 to-primary/5 rounded-2xl text-center">
          <h2 className="text-2xl font-bold mb-4">Never Miss an Important Update</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Subscribe to get daily current affairs digests, weekly summaries, and monthly quizzes
            delivered directly to your inbox.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Input placeholder="Enter your email" className="max-w-xs bg-background" />
            <Button>Subscribe Now</Button>
          </div>
        </section>
      </main>

      {/* Share Dialog */}
      <ShareDialog
        article={shareArticle}
        onClose={() => setShareArticle(null)}
      />

      {/* Topic View Dialog */}
      <TopicViewDialog
        articles={topicViewArticles}
        topicName={topicViewName}
        onClose={() => setTopicViewArticles(null)}
        onArticleClick={openArticle}
      />

      {/* Bookmarks Sheet */}
      <BookmarksSheet />

      {/* Digest Settings Dialog */}
      <DigestSettingsDialog />

      {/* Quiz Dialog */}
      <Dialog open={!!quizArticle} onOpenChange={(open) => !open && setQuizArticle(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Article Quiz
            </DialogTitle>
          </DialogHeader>
          {quizArticle && (
            <ArticleQuiz
              article={quizArticle}
              onClose={() => setQuizArticle(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-8 right-8 rounded-full shadow-lg z-50 animate-in fade-in zoom-in duration-300"
          size="icon"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <ChevronUp className="h-6 w-6" />
        </Button>
      )}

      <Footer />
    </div >
  );
};

export default CurrentAffairs;
