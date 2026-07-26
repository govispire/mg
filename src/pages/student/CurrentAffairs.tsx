import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavedArticlesButton } from '@/components/current-affairs/SavedArticlesButton';

import { useCategoryFilteredCurrentAffairs } from '@/hooks/useCategoryFilteredContent';
import {
  Calendar, Clock, BookOpen, TrendingUp, CheckCircle, Layers,
  CalendarDays, Grid3X3, List, Trophy, Zap, FileText, Download, Play,
  ArrowRight, ArrowUpRight, Filter, Bookmark, Sparkles, Lock, Users
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import AllInOneView from '@/components/current-affairs/AllInOneView';
import DailyNewsView from '@/components/current-affairs/DailyNewsView';
import { ContinueReadingSection } from '@/components/current-affairs/ContinueReadingSection';
import { useCurrentAffairsStore } from '@/hooks/useCurrentAffairsStore';
import { useQuizzes } from '@/hooks/useQuizCatalog';
import { Article } from '@/components/current-affairs/types';
import { generateArticlesPDF } from '@/utils/pdfGenerator';
import { motion } from 'framer-motion';

// Category filter pills definition
const TOPIC_FILTERS = [
  { id: 'all',           label: 'All Topics' },
  { id: 'economy',       label: '🏦 Economy & Banking' },
  { id: 'science',       label: '🔬 Science & Tech' },
  { id: 'national',      label: '🇮🇳 National' },
  { id: 'international', label: '🌐 International' },
  { id: 'government',    label: '🏛️ Government Schemes' },
  { id: 'sports',        label: '🏆 Sports & Awards' },
];

const CurrentAffairs = () => {
  const { data: dailyQuizzes = [] } = useQuizzes();
  const { currentAffairs, stats, hasFilters, selectedCategories } = useCategoryFilteredCurrentAffairs();
  const { getNewsArticles, getDailyNewsArticles, getAllInOneArticles } = useCurrentAffairsStore();
  
  const location = useLocation();
  const initialTab = location.state?.tab || 'news';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [selectedTopic, setSelectedTopic] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  // Sync activeTab when location.state changes
  useEffect(() => {
    if (location.state?.tab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  // Use the store — picks up both static seed articles + admin-created ones
  const allNewsArticles = getNewsArticles();

  // Category filtering for the News tab
  const categoryMapping: Record<string, string[]> = {
    'banking-insurance': ['Banking', 'Economy'],
    'banking': ['Banking', 'Economy'],
    'upsc': ['National', 'International', 'Economy', 'Science', 'Government'],
    'ssc': ['National', 'Government', 'Science', 'Sports'],
    'railways-rrb': ['National', 'Science'],
    'cat': ['Economy', 'International'],
    'defence': ['National', 'International'],
    'civil-services': ['National', 'International', 'Economy', 'Science', 'Government'],
  };

  const getRichFilteredArticles = () => {
    let list = allNewsArticles;

    if (hasFilters) {
      const allowedCategories = new Set<string>();
      selectedCategories.forEach(id => {
        const mapped = categoryMapping[id] || categoryMapping['upsc'];
        mapped.forEach(c => allowedCategories.add(c));
      });
      list = list.filter(article => allowedCategories.has(article.category));
    }

    // Filter by Topic Pill
    if (selectedTopic !== 'all') {
      list = list.filter(article => {
        const cat = article.category.toLowerCase();
        if (selectedTopic === 'economy') return cat.includes('economy') || cat.includes('banking');
        if (selectedTopic === 'science') return cat.includes('science') || cat.includes('tech');
        if (selectedTopic === 'national') return cat.includes('national');
        if (selectedTopic === 'international') return cat.includes('international');
        if (selectedTopic === 'government') return cat.includes('government') || cat.includes('scheme');
        if (selectedTopic === 'sports') return cat.includes('sports') || cat.includes('award');
        return true;
      });
    }

    return list;
  };

  const richArticles = useMemo(() => getRichFilteredArticles(), [allNewsArticles, hasFilters, selectedCategories, selectedTopic]);

  // Softer pastel priority badges to prevent overpowering article headlines
  const getImportanceBadge = (importance: string) => {
    switch (importance) {
      case 'high':
        return (
          <span className="bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
            🔴 High Priority
          </span>
        );
      case 'medium':
        return (
          <span className="bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
            🟡 Medium
          </span>
        );
      default:
        return (
          <span className="bg-slate-100 border border-slate-200 text-slate-600 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full whitespace-nowrap shrink-0">
            Normal
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── 1. HEADER & SAVED ARTICLES CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Current Affairs & Daily Updates</h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            {hasFilters
              ? 'Stay updated with curated news, topic compilations, and daily quizzes for your target exams.'
              : 'Curated daily news, monthly digests, and exam-oriented current affairs quizzes.'
            }
          </p>
        </div>
        <SavedArticlesButton />
      </div>

      {/* ── 2. CONTINUE READING RESUME SECTION ── */}
      <ContinueReadingSection />

      {/* ── 3. PRIMARY CONTENT TABS (READING vs QUIZZES SEPARATED) ── */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200/90 pb-3">
          {/* Primary Reading Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide shrink-0 bg-slate-100/90 p-1.5 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                activeTab === 'news'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BookOpen className="h-4 w-4" />
              <span className="whitespace-nowrap">Articles & News</span>
            </button>

            <button
              onClick={() => setActiveTab('daily-news')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                activeTab === 'daily-news'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarDays className="h-4 w-4" />
              <span className="whitespace-nowrap">Daily News</span>
            </button>

            <button
              onClick={() => setActiveTab('all-in-one')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shrink-0 ${
                activeTab === 'all-in-one'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Layers className="h-4 w-4" />
              <span className="whitespace-nowrap">Compilations</span>
            </button>
          </div>

          {/* Secondary Quiz Activities Bar */}
          <div className="flex items-center gap-2 overflow-x-auto shrink-0">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 hidden lg:inline-block">Quiz Hub:</span>
            <button
              onClick={() => setActiveTab('daily-quizzes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'daily-quizzes'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Zap className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">Daily Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('weekly-quizzes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'weekly-quizzes'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">Weekly Quiz</span>
            </button>

            <button
              onClick={() => setActiveTab('monthly-quizzes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'monthly-quizzes'
                  ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <Trophy className="h-3.5 w-3.5" />
              <span className="whitespace-nowrap">Monthly Quiz</span>
            </button>
          </div>
        </div>

        {/* ── 4. ARTICLES & NEWS TAB CONTENT ── */}
        <TabsContent value="news" className="mt-0 space-y-5">
          {/* STICKY CATEGORY FILTER PILL STRIP */}
          <div className="sticky top-2 z-20 bg-white/95 backdrop-blur-md rounded-2xl border border-slate-200/90 p-3.5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
            {/* Scrollable Category Tag Strip */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide w-full md:w-auto">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 shrink-0 hidden sm:inline-block">Filter:</span>
              {TOPIC_FILTERS.map(topic => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border whitespace-nowrap ${
                    selectedTopic === topic.id
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200/80 hover:bg-slate-200/60'
                  }`}
                >
                  {topic.label}
                </button>
              ))}
            </div>

            {/* View Mode Switcher */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 self-end md:self-auto border border-slate-200/70">
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 rounded-lg ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'}`}
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-7 w-7 p-0 rounded-lg ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'}`}
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Article Cards Grid / List */}
          {richArticles.length === 0 ? (
            <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-white">
              <BookOpen className="h-12 w-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-extrabold text-slate-800">No articles found in this category</h3>
              <p className="text-xs text-slate-400 mt-1">Try selecting "All Topics" to browse all current affairs.</p>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {richArticles.map((article, idx) => (
                viewMode === 'grid' ? (
                  /* Grid View Card */
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <Card
                      className="h-full border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-pointer rounded-2xl bg-white overflow-hidden flex flex-col"
                      onClick={() => navigate(`/current-affairs/${article.id}`, { state: { from: '/student/current-affairs', tab: activeTab } })}
                    >
                      {/* Fixed 16:9 Aspect Ratio Thumbnail */}
                      <div className="relative aspect-video w-full overflow-hidden bg-slate-100">
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Card Body */}
                      <CardContent className="p-5 flex flex-col flex-1 space-y-3">
                        {/* Category & Soft Pastel Priority Badge + Interactive Take Quiz Micro-CTA */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 whitespace-nowrap shrink-0">
                              {article.category}
                            </span>
                            {getImportanceBadge(article.importance)}
                          </div>

                          {article.hasQuiz && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/student/daily-quizzes');
                              }}
                              className="text-[11px] font-black px-2.5 py-1 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap shrink-0"
                              title="Take Practice Quiz"
                            >
                              <Zap className="h-3 w-3 fill-amber-500 text-amber-500 shrink-0" />
                              <span>Take Quiz ⚡</span>
                            </button>
                          )}
                        </div>

                        {/* Article Headline */}
                        <h3 className="text-base font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                          {article.title}
                        </h3>

                        {/* Excerpt with High Contrast WCAG AAA Text */}
                        <p className="text-xs text-slate-600 font-medium leading-relaxed line-clamp-2 flex-1">
                          {article.excerpt}
                        </p>

                        {/* Footer: Date & Read Time (Strictly whitespace-nowrap) */}
                        <div className="flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-100 mt-auto gap-2">
                          <div className="flex items-center gap-3 font-semibold whitespace-nowrap shrink-0">
                            <span className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
                              <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="whitespace-nowrap">{article.date}</span>
                            </span>
                            <span className="flex items-center gap-1 text-slate-500 whitespace-nowrap">
                              <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                              <span className="whitespace-nowrap">{article.readTime}</span>
                            </span>
                          </div>

                          {/* Explicit Action CTA Button */}
                          <div className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform whitespace-nowrap shrink-0">
                            <span className="whitespace-nowrap">Read Article</span>
                            <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  /* List View Row */
                  <motion.div
                    key={article.id}
                    initial={{ opacity: 0, x: -15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Card
                      className="border border-slate-200/90 hover:border-blue-300 hover:shadow-sm transition-all duration-300 group cursor-pointer rounded-2xl bg-white overflow-hidden"
                      onClick={() => navigate(`/current-affairs/${article.id}`, { state: { from: '/student/current-affairs', tab: activeTab } })}
                    >
                      <CardContent className="p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                        <div className="w-full sm:w-36 aspect-video rounded-xl overflow-hidden shrink-0 bg-slate-100">
                          <img
                            src={article.image}
                            alt={article.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                        <div className="flex-1 min-w-0 space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700 whitespace-nowrap">
                              {article.category}
                            </span>
                            {getImportanceBadge(article.importance)}
                          </div>
                          <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                            {article.title}
                          </h3>
                          <p className="text-slate-600 text-xs line-clamp-1 font-medium">{article.excerpt}</p>
                          <div className="flex items-center gap-4 text-xs font-semibold text-slate-500 pt-1 whitespace-nowrap">
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Calendar className="h-3.5 w-3.5 text-slate-400" />
                              {article.date}
                            </span>
                            <span className="flex items-center gap-1 whitespace-nowrap">
                              <Clock className="h-3.5 w-3.5 text-slate-400" />
                              {article.readTime}
                            </span>
                          </div>
                        </div>

                        <div className="shrink-0 self-end sm:self-center flex items-center gap-2">
                          {article.hasQuiz && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('/student/daily-quizzes');
                              }}
                              className="text-xs font-black px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
                            >
                              <Zap className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                              <span>Quiz ⚡</span>
                            </button>
                          )}
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-xl px-4 py-2 gap-1.5 shadow-2xs whitespace-nowrap">
                            <span>Read</span>
                            <ArrowRight className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="daily-news" className="mt-0">
          <DailyNewsView />
        </TabsContent>

        <TabsContent value="all-in-one" className="mt-0">
          <AllInOneView />
        </TabsContent>

        {/* ── 5. QUIZ HUB TAB CONTENT (REDESIGNED BASED ON REFERENCE IMAGES) ── */}
        {['daily-quizzes', 'weekly-quizzes', 'monthly-quizzes'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-6 mt-0">
            {/* Header: Period Selector & View Mode Switcher */}
            <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl">
                  <Zap className="h-5 w-5 text-amber-600 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">
                    {tab === 'daily-quizzes' && 'Daily Current Affairs Quizzes'}
                    {tab === 'weekly-quizzes' && 'Weekly Roundup Practice Tests'}
                    {tab === 'monthly-quizzes' && 'Monthly Revision Mock Tests'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Test your retention with timed practice questions and downloadable study PDFs.
                  </p>
                </div>
              </div>

              {/* View Switcher Bar */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl shrink-0 border border-slate-200/70">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 rounded-lg ${viewMode === 'grid' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`h-7 w-7 p-0 rounded-lg ${viewMode === 'list' ? 'bg-white text-blue-600 shadow-2xs' : 'text-slate-500'}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* TAB-SPECIFIC QUIZ LIST RENDERING */}
            {viewMode === 'list' ? (
              /* List View Mode (Matching Image 1 reference) */
              <div className="space-y-3">
                {(tab === 'daily-quizzes'
                  ? (dailyQuizzes.filter(q => q.subject === 'Current Affairs').length > 0
                      ? dailyQuizzes.filter(q => q.subject === 'Current Affairs')
                      : [
                          { id: 'dq1', title: 'Daily Current Affairs Quiz - July 26, 2026', totalQuestions: 10, maxScore: 10, durationMinutes: 5, difficulty: 'easy' },
                          { id: 'dq2', title: 'Daily Current Affairs Quiz - July 25, 2026', totalQuestions: 10, maxScore: 10, durationMinutes: 5, difficulty: 'easy' },
                          { id: 'dq3', title: 'Daily Current Affairs Quiz - July 24, 2026', totalQuestions: 10, maxScore: 10, durationMinutes: 5, difficulty: 'medium' },
                          { id: 'dq4', title: 'Daily Current Affairs Quiz - July 23, 2026', totalQuestions: 10, maxScore: 10, durationMinutes: 5, difficulty: 'hard' },
                        ]
                    )
                  : tab === 'weekly-quizzes'
                  ? [
                      { id: 'w1', title: 'Week 1 Current Affairs Digest (July 1 - July 7)', totalQuestions: 50, maxScore: 50, durationMinutes: 25, difficulty: 'easy' },
                      { id: 'w2', title: 'Week 2 Current Affairs Digest (July 8 - July 14)', totalQuestions: 50, maxScore: 50, durationMinutes: 25, difficulty: 'medium' },
                      { id: 'w3', title: 'Week 3 Current Affairs Digest (July 15 - July 21)', totalQuestions: 50, maxScore: 50, durationMinutes: 25, difficulty: 'medium' },
                      { id: 'w4', title: 'Week 4 Current Affairs Digest (July 22 - July 28)', totalQuestions: 50, maxScore: 50, durationMinutes: 25, difficulty: 'hard' },
                    ]
                  : [
                      { id: 'm1', title: 'July 2026 Full Month Revision Mock', totalQuestions: 100, maxScore: 100, durationMinutes: 60, difficulty: 'hard' },
                      { id: 'm2', title: 'June 2026 Full Month Revision Mock', totalQuestions: 100, maxScore: 100, durationMinutes: 60, difficulty: 'medium' },
                      { id: 'm3', title: 'May 2026 Full Month Revision Mock', totalQuestions: 100, maxScore: 100, durationMinutes: 60, difficulty: 'medium' },
                    ]
                ).map((quiz: any, idx: number) => {
                  const difficulty = quiz.difficulty || (idx % 3 === 0 ? 'easy' : idx % 3 === 1 ? 'medium' : 'hard');
                  return (
                    <div
                      key={quiz.id}
                      className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs hover:border-blue-300 hover:shadow-xs transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      {/* Left: Numbered Index Badge & Title */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <span className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-black text-xs flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-extrabold text-sm text-slate-900 leading-snug break-words">{quiz.title}</h4>
                            {difficulty === 'easy' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[10px] font-bold shrink-0">
                                🟢 Easy
                              </span>
                            )}
                            {difficulty === 'medium' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold shrink-0">
                                🟠 Moderate
                              </span>
                            )}
                            {difficulty === 'hard' && (
                              <span className="px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700 text-[10px] font-bold shrink-0">
                                🔴 Difficult
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Center Metrics (Vertical Dividers matching Image 1) */}
                      <div className="flex items-center gap-4 text-center shrink-0 w-full sm:w-auto justify-around sm:justify-center border-y sm:border-y-0 sm:border-x border-slate-100 py-2 sm:py-0 sm:px-6">
                        <div>
                          <p className="text-xs font-black text-slate-900">{quiz.totalQuestions || 10}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Questions</p>
                        </div>
                        <div className="w-px h-6 bg-slate-200" />
                        <div>
                          <p className="text-xs font-black text-slate-900">{quiz.maxScore || quiz.totalQuestions || 10}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Marks</p>
                        </div>
                        <div className="w-px h-6 bg-slate-200" />
                        <div>
                          <p className="text-xs font-black text-slate-900">{quiz.durationMinutes || 10}</p>
                          <p className="text-[10px] text-slate-400 font-bold">Mins</p>
                        </div>
                      </div>

                      {/* Right Action Button */}
                      <div className="shrink-0 self-end sm:self-center">
                        <Button
                          onClick={() => navigate('/student/daily-quizzes')}
                          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-9 px-5 rounded-xl shadow-2xs gap-1.5"
                        >
                          <Play className="h-3.5 w-3.5 fill-white text-white" />
                          <span>Start Quiz</span>
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Grid Card Mode (Matching Images 2 & 3 reference) */
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {(tab === 'daily-quizzes'
                  ? (dailyQuizzes.filter(q => q.subject === 'Current Affairs').length > 0
                      ? dailyQuizzes.filter(q => q.subject === 'Current Affairs')
                      : [
                          { id: 'dq1', title: 'July 26 Daily Quiz', totalQuestions: 10, maxScore: 10, durationMinutes: 5 },
                          { id: 'dq2', title: 'July 25 Daily Quiz', totalQuestions: 10, maxScore: 10, durationMinutes: 5 },
                          { id: 'dq3', title: 'July 24 Daily Quiz', totalQuestions: 10, maxScore: 10, durationMinutes: 5 },
                          { id: 'dq4', title: 'July 23 Daily Quiz', totalQuestions: 10, maxScore: 10, durationMinutes: 5 },
                        ]
                    )
                  : tab === 'weekly-quizzes'
                  ? [
                      { id: 'w1', title: 'Week 1 Roundup (July 1 - 7)', totalQuestions: 50, maxScore: 50, durationMinutes: 25 },
                      { id: 'w2', title: 'Week 2 Roundup (July 8 - 14)', totalQuestions: 50, maxScore: 50, durationMinutes: 25 },
                      { id: 'w3', title: 'Week 3 Roundup (July 15 - 21)', totalQuestions: 50, maxScore: 50, durationMinutes: 25 },
                      { id: 'w4', title: 'Week 4 Roundup (July 22 - 28)', totalQuestions: 50, maxScore: 50, durationMinutes: 25 },
                    ]
                  : [
                      { id: 'm1', title: 'July 2026 Full Month Revision', totalQuestions: 100, maxScore: 100, durationMinutes: 60 },
                      { id: 'm2', title: 'June 2026 Full Month Revision', totalQuestions: 100, maxScore: 100, durationMinutes: 60 },
                      { id: 'm3', title: 'May 2026 Full Month Revision', totalQuestions: 100, maxScore: 100, durationMinutes: 60 },
                      { id: 'm4', title: 'April 2026 Full Month Revision', totalQuestions: 100, maxScore: 100, durationMinutes: 60 },
                    ]
                ).map((quiz: any, idx: number) => {
                  const difficulty = quiz.difficulty || (idx % 3 === 0 ? 'medium' : idx % 3 === 1 ? 'easy' : 'hard');
                  const studentsCount = (14500 + (idx * 3740) % 22000).toLocaleString();
                  const isLocked = quiz.isLocked || false;

                  return (
                    <Card
                      key={quiz.id}
                      className="border border-slate-200/90 rounded-2xl shadow-2xs hover:shadow-md transition-all duration-200 bg-white overflow-hidden flex flex-col"
                    >
                      <div className="p-5 flex flex-col flex-1">
                        {/* 1. Header: Numbered Circle + Title & Subtitle */}
                        <div className="flex items-center gap-3.5 mb-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-slate-500 font-extrabold text-base bg-slate-50 border-2 border-slate-200 shrink-0">
                            {idx + 1}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 leading-snug break-words min-h-[40px] flex items-center">
                              {quiz.title}
                            </h3>
                            <p className="text-xs font-medium text-slate-400 mt-0.5">
                              {tab === 'daily-quizzes' && 'Daily Current Affairs Quiz'}
                              {tab === 'weekly-quizzes' && 'Weekly Digest Test'}
                              {tab === 'monthly-quizzes' && 'Full Month Mock Test'}
                            </p>
                          </div>
                        </div>

                        {/* 2. Students Count */}
                        <div className="flex items-center justify-center gap-1.5 text-xs text-slate-400 font-medium mb-3">
                          <Users className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{studentsCount} Students</span>
                        </div>

                        {/* 3. Centered Difficulty Pill */}
                        <div className="flex justify-center mb-4">
                          {difficulty === 'easy' && (
                            <span className="inline-flex items-center justify-center px-6 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 min-w-[100px]">
                              <span className="text-xs font-semibold text-emerald-600">Easy</span>
                            </span>
                          )}
                          {difficulty === 'medium' && (
                            <span className="inline-flex items-center justify-center px-6 py-1 rounded-full bg-amber-50 border border-amber-200/80 min-w-[100px]">
                              <span className="text-xs font-semibold text-amber-600">Medium</span>
                            </span>
                          )}
                          {difficulty === 'hard' && (
                            <span className="inline-flex items-center justify-center px-6 py-1 rounded-full bg-rose-50 border border-rose-200/80 min-w-[100px]">
                              <span className="text-xs font-semibold text-rose-500">Hard</span>
                            </span>
                          )}
                        </div>

                        {/* 4. Horizontal Divider */}
                        <hr className="border-slate-100 mb-4" />

                        {/* 5. 3-Column Metrics Grid */}
                        <div className="grid grid-cols-3 text-center mb-5">
                          <div className="flex flex-col items-center">
                            <span className="text-base font-extrabold text-slate-900">{quiz.totalQuestions || 10}</span>
                            <span className="text-[11px] font-medium text-slate-400 mt-0.5">Questions</span>
                          </div>
                          <div className="flex flex-col items-center border-x border-slate-100 px-2">
                            <span className="text-base font-extrabold text-slate-900">{quiz.maxScore || quiz.totalQuestions || 10}</span>
                            <span className="text-[11px] font-medium text-slate-400 mt-0.5">Marks</span>
                          </div>
                          <div className="flex flex-col items-center">
                            <span className="text-base font-extrabold text-slate-900">{quiz.durationMinutes || 10}</span>
                            <span className="text-[11px] font-medium text-slate-400 mt-0.5">Min</span>
                          </div>
                        </div>

                        {/* 6. Full-Width Royal Blue Action Button */}
                        <div className="mt-auto">
                          {isLocked ? (
                            <Button
                              disabled
                              className="w-full bg-slate-100 text-slate-400 border border-slate-200 font-extrabold text-xs h-10 rounded-xl cursor-not-allowed gap-1.5 shadow-none"
                            >
                              <Lock className="h-3.5 w-3.5" />
                              <span>Locked</span>
                            </Button>
                          ) : (
                            <Button
                              onClick={() => navigate('/student/daily-quizzes')}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs h-10 rounded-xl shadow-2xs gap-1.5"
                            >
                              <Play className="h-3.5 w-3.5 fill-white text-white" />
                              <span>Start Test</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CurrentAffairs;
