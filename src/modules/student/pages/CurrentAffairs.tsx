import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { SavedArticlesButton } from '@/components/current-affairs/SavedArticlesButton';

import { useCategoryFilteredCurrentAffairs } from '@/hooks/useCategoryFilteredContent';
import {
  Calendar, Clock, BookOpen, TrendingUp, CheckCircle, Layers,
  CalendarDays, Grid3X3, List, Trophy, Zap, FileText, Download, Play
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import AllInOneView from '@/components/current-affairs/AllInOneView';
import DailyNewsView from '@/components/current-affairs/DailyNewsView';
import { ContinueReadingSection } from '@/components/current-affairs/ContinueReadingSection';
import { allArticles } from '@/components/current-affairs/articlesData';
import { dailyQuizzes } from '@/data/dailyQuizzesData';
import { Article } from '@/components/current-affairs/types';
import { motion } from 'framer-motion';

const CurrentAffairs = () => {
  const { currentAffairs, stats, hasFilters, selectedCategories } = useCategoryFilteredCurrentAffairs();
  const [activeTab, setActiveTab] = useState('news');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const navigate = useNavigate();

  const getFilteredAffairs = () => {
    // For quizzes tabs
    if (activeTab === 'daily-quizzes' || activeTab === 'weekly-quizzes' || activeTab === 'monthly-quizzes') {
      const typeMap: Record<string, string> = {
        'daily-quizzes': 'daily',
        'weekly-quizzes': 'weekly',
        'monthly-quizzes': 'monthly'
      };
      return currentAffairs.filter(affair => affair.type === (typeMap[activeTab] || activeTab));
    }
    return [];
  };

  const filteredAffairs = getFilteredAffairs();

  // Rich Articles Filtering for News Tab
  const categoryMapping: Record<string, string[]> = {
    'banking-insurance': ['Banking', 'Economy'],
    'banking': ['Banking', 'Economy'],
    'upsc': ['National', 'International', 'Economy', 'Science', 'Government'],
    'ssc': ['National', 'Government', 'Science', 'Sports'],
    'railways-rrb': ['National', 'Science'],
    'cat': ['Economy', 'International'],
    'defence': ['National', 'International'], // Added mapping
    'civil-services': ['National', 'International', 'Economy', 'Science', 'Government'], // Added mapping
  };

  const getRichFilteredArticles = () => {
    if (!hasFilters) return allArticles;

    // Get all allowed category names based on selected IDs
    const allowedCategories = new Set<string>();
    selectedCategories.forEach(id => {
      const mapped = categoryMapping[id] || categoryMapping['upsc']; // Default to broad categories if unknown
      mapped.forEach(c => allowedCategories.add(c));
    });

    return allArticles.filter(article => allowedCategories.has(article.category));
  };

  const richArticles = getRichFilteredArticles();

  // Helper for importance badge
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

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-foreground">Current Affairs</h1>
          <p className="text-muted-foreground mt-1">
            {hasFilters
              ? `Stay updated with affairs relevant to your selected categories`
              : 'Select your exam categories to see relevant current affairs'
            }
          </p>
        </div>
        <SavedArticlesButton />
      </div>

      {/* Continue Reading Section */}
      <ContinueReadingSection />

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <TabsList className="bg-muted/50 p-1 h-12 flex-wrap md:flex-nowrap">
            <TabsTrigger value="news" className="gap-2 px-4 h-10">
              <BookOpen className="h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="daily-news" className="gap-2 px-4 h-10">
              <CalendarDays className="h-4 w-4" />
              Daily News
            </TabsTrigger>
            <TabsTrigger value="all-in-one" className="gap-2 px-4 h-10">
              <Layers className="h-4 w-4" />
              All in One
            </TabsTrigger>
            <TabsTrigger value="daily-quizzes" className="gap-2 px-4 h-10">
              <Zap className="h-4 w-4" />
              Daily Quiz
            </TabsTrigger>
            <TabsTrigger value="weekly-quizzes" className="gap-2 px-4 h-10">
              <FileText className="h-4 w-4" />
              Weekly Quiz
            </TabsTrigger>
            <TabsTrigger value="monthly-quizzes" className="gap-2 px-4 h-10">
              <Trophy className="h-4 w-4" />
              Month Quiz
            </TabsTrigger>
          </TabsList>

          {(activeTab === 'news' || ['daily-quizzes', 'weekly-quizzes', 'monthly-quizzes'].includes(activeTab)) && (
            <div className="flex bg-muted/50 p-1 rounded-lg shrink-0">
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
          )}
        </div>

        {/* News Tab (formerly 'all') */}
        <TabsContent value="news" className="mt-0 space-y-6">


          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" : "space-y-4"}>
            {richArticles.map((article, idx) => (
              viewMode === 'grid' ? (
                /* Grid View - Rich Card */
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <Card
                    className="h-full hover:shadow-xl transition-all duration-300 group cursor-pointer overflow-hidden relative"
                    onClick={() => navigate(`/current-affairs/${article.id}`)}
                  >
                    <div className="relative h-48 overflow-hidden">
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
                              <Zap className="h-3 w-3 mr-1" />
                              Quiz
                            </Badge>
                          )}
                        </div>
                      </div>
                      {article.importance === 'high' && (
                        <div className="absolute top-3 right-3">
                          <Badge className="bg-red-500 text-white animate-pulse">Hot</Badge>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5 flex flex-col h-full">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {getImportanceBadge(article.importance)}
                      </div>
                      <h3 className="text-lg font-semibold mb-2 group-hover:text-primary transition-colors line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2 flex-1">{article.excerpt}</p>

                      <div className="flex items-center justify-between text-sm text-muted-foreground pt-3 border-t mt-auto">
                        <div className="flex items-center gap-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {article.readTime}
                          </span>
                        </div>
                        <Button variant="ghost" size="sm" className="h-8 px-2 text-primary hover:text-primary/80">
                          Read <Play className="h-3 w-3 ml-1" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : (
                /* List View - Rich Row */
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                >
                  <Card
                    className="hover:shadow-lg transition-all duration-300 group cursor-pointer"
                    onClick={() => navigate(`/current-affairs/${article.id}`)}
                  >
                    <CardContent className="p-4 flex gap-4">
                      <div className="hidden sm:block w-32 h-24 rounded-lg overflow-hidden flex-shrink-0">
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
                              Quiz
                            </Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors line-clamp-1">
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
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )
            ))}
          </div>
        </TabsContent>

        <TabsContent value="daily-news" className="mt-0">
          <DailyNewsView />
        </TabsContent>

        <TabsContent value="all-in-one" className="mt-0">
          <AllInOneView />
        </TabsContent>

        {['daily-quizzes', 'weekly-quizzes', 'monthly-quizzes'].map(tab => (
          <TabsContent key={tab} value={tab} className="space-y-4 mt-0">
            {tab === 'daily-quizzes' ? (
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
                    <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4" : "space-y-2"}>
                      {quizzes.map((quiz) => (
                        viewMode === 'grid' ? (
                          <Card
                            key={quiz.id}
                            className="hover:shadow-lg transition-all cursor-pointer border-primary/10 group flex flex-col h-full"
                            onClick={() => navigate(`/student/tests/${quiz.id}`)}
                          >
                            <CardContent className="p-4 flex flex-col h-full">
                              <div className="flex items-center justify-between mb-3">
                                <Badge variant="outline" className="bg-primary/5 text-[10px] whitespace-nowrap">{new Date(quiz.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}</Badge>
                                <Badge variant="outline" className="text-[10px] bg-muted/30 border-muted-foreground/10 flex items-center gap-1">
                                  <Clock className="h-3 w-3" /> {quiz.duration}m
                                </Badge>
                              </div>
                              <h3 className="font-bold mb-auto text-sm line-clamp-2 group-hover:text-primary transition-colors">{quiz.title}</h3>

                              <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between text-xs text-muted-foreground">
                                  <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {quiz.questions} Qs</span>
                                  <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> {quiz.totalUsers ? (quiz.totalUsers / 1000).toFixed(1) + 'k' : '1.2k'} Users</span>
                                </div>

                                <div className="flex gap-2">
                                  <Button size="sm" className="w-full h-8 text-xs bg-primary hover:bg-primary/90">
                                    Start
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card
                            key={quiz.id}
                            className="hover:bg-muted/30 transition-colors cursor-pointer border-primary/5"
                            onClick={() => navigate(`/student/tests/${quiz.id}`)}
                          >
                            <CardContent className="p-3 flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center font-bold text-primary text-xs leading-none text-center p-1">
                                  {new Date(quiz.scheduledDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }).split(' ').join('\n')}
                                </div>
                                <div>
                                  <h4 className="font-bold text-sm tracking-tight">{quiz.title}</h4>
                                  <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-0.5">
                                    <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {quiz.duration}m</span>
                                    <span className="flex items-center gap-1"><CheckCircle className="h-3 w-3" /> {quiz.questions} Questions</span>
                                    <span className="flex items-center gap-1"><Trophy className="h-3 w-3" /> {quiz.totalUsers} Users</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" className="text-primary font-bold h-8 text-xs">Retake</Button>
                                <Button size="sm" className="h-8 text-xs">Start Quiz</Button>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" : "space-y-2"}>
                {filteredAffairs.filter(a => a.type === (tab === 'weekly-quizzes' ? 'weekly' : 'monthly')).map((affair) => (
                  viewMode === 'grid' ? (
                    <Card
                      key={affair.id}
                      className="hover:shadow-lg transition-all cursor-pointer border-primary/10 group"
                      onClick={() => navigate(`/current-affairs/${affair.id}`)}
                    >
                      <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-4">
                          <Badge variant="outline" className="bg-primary/5 text-[10px]">{affair.date}</Badge>
                          <Badge variant="outline" className="text-[10px] bg-muted/30 border-muted-foreground/10">{affair.questions} Qs</Badge>
                        </div>
                        <h3 className="font-bold mb-6 line-clamp-2 group-hover:text-primary transition-colors">{affair.title}</h3>
                        <Button className="w-full gap-2 h-10">
                          <Play className="h-4 w-4" /> Start Quiz
                        </Button>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card
                      key={affair.id}
                      className="hover:bg-muted/30 transition-colors cursor-pointer border-primary/5"
                      onClick={() => navigate(`/current-affairs/${affair.id}`)}
                    >
                      <CardContent className="p-3 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Zap className="h-4 w-4 text-primary" />
                          </div>
                          <div>
                            <h4 className="font-bold text-sm tracking-tight">{affair.title}</h4>
                            <p className="text-[10px] text-muted-foreground">{affair.date} • {affair.questions} Questions</p>
                          </div>
                        </div>
                        <Button size="sm" variant="ghost" className="text-primary font-bold h-8">START</Button>
                      </CardContent>
                    </Card>
                  )
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default CurrentAffairs;
