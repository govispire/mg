import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Calendar, BookOpen, Share2, Bookmark, CheckCircle2, Download, Search, Filter, X } from 'lucide-react';
import { allArticles, getRelatedArticles } from '@/components/current-affairs/articlesData';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { generateDailyNewsPDF } from '@/utils/pdfGenerator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import BackToTopButton from '@/components/global/BackToTopButton';
import { useSavedArticles } from '@/hooks/useSavedArticles';

const DailyNewsPage = () => {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const { getReadingProgress, markAsRead } = useReadingProgress();
  const { isSaved, toggleSave } = useSavedArticles();

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    importance: [] as string[],
    hasQuiz: null as boolean | null,
    readStatus: null as 'read' | 'unread' | null,
  });

  // Get all articles for this date
  const dateArticles = allArticles.filter(article => {
    const articleDateStr = article.date;
    return articleDateStr === date ||
      articleDateStr.includes(date || '') ||
      (date && articleDateStr.toLowerCase().includes(date.toLowerCase()));
  });

  // Apply search and filters
  const filteredArticles = useMemo(() => {
    return dateArticles.filter(article => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query)) ||
          article.topic.toLowerCase().includes(query);
        if (!matchesSearch) return false;
      }

      // Importance filter
      if (filters.importance.length > 0) {
        if (!filters.importance.includes(article.importance)) return false;
      }

      // Quiz filter
      if (filters.hasQuiz !== null) {
        if (article.hasQuiz !== filters.hasQuiz) return false;
      }

      // Read status filter
      if (filters.readStatus !== null) {
        const isRead = getReadingProgress(article.id) >= 100;
        if (filters.readStatus === 'read' && !isRead) return false;
        if (filters.readStatus === 'unread' && isRead) return false;
      }

      return true;
    });
  }, [dateArticles, searchQuery, filters, getReadingProgress]);

  // Group filtered articles by topic
  const articlesByTopic = filteredArticles.reduce((acc, article) => {
    if (!acc[article.topic]) {
      acc[article.topic] = [];
    }
    acc[article.topic].push(article);
    return acc;
  }, {} as Record<string, typeof filteredArticles>);

  const topics = Object.keys(articlesByTopic);

  const toggleImportanceFilter = (importance: string) => {
    setFilters(prev => ({
      ...prev,
      importance: prev.importance.includes(importance)
        ? prev.importance.filter(i => i !== importance)
        : [...prev.importance, importance]
    }));
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilters({
      importance: [],
      hasQuiz: null,
      readStatus: null,
    });
  };

  const hasActiveFilters = searchQuery || filters.importance.length > 0 || filters.hasQuiz !== null || filters.readStatus !== null;

  const handleDownloadPDF = () => {
    generateDailyNewsPDF(filteredArticles, date || 'Daily News');
  };

  if (dateArticles.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No News Found</h2>
            <p className="text-muted-foreground">No news articles found for: {date}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {filteredArticles.length} / {dateArticles.length} Articles • {topics.length} Topics
              </Badge>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Calendar className="h-6 w-6 text-primary" />
              Daily News - {date}
            </h1>
            <p className="text-muted-foreground mt-1">
              All news for this day organized by topics
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-muted/50 border-b sticky top-[104px] z-10">
        <div className="max-w-4xl mx-auto px-4 py-3">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="h-5 w-5 p-0 justify-center">
                        !
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>Importance</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.importance.includes('high')}
                    onCheckedChange={() => toggleImportanceFilter('high')}
                  >
                    High Priority
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.importance.includes('medium')}
                    onCheckedChange={() => toggleImportanceFilter('medium')}
                  >
                    Medium
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.importance.includes('low')}
                    onCheckedChange={() => toggleImportanceFilter('low')}
                  >
                    Normal
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Quiz</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.hasQuiz === true}
                    onCheckedChange={() => setFilters(prev => ({ ...prev, hasQuiz: prev.hasQuiz === true ? null : true }))}
                  >
                    Has Quiz
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.hasQuiz === false}
                    onCheckedChange={() => setFilters(prev => ({ ...prev, hasQuiz: prev.hasQuiz === false ? null : false }))}
                  >
                    No Quiz
                  </DropdownMenuCheckboxItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuLabel>Read Status</DropdownMenuLabel>
                  <DropdownMenuCheckboxItem
                    checked={filters.readStatus === 'read'}
                    onCheckedChange={() => setFilters(prev => ({ ...prev, readStatus: prev.readStatus === 'read' ? null : 'read' }))}
                  >
                    Read
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem
                    checked={filters.readStatus === 'unread'}
                    onCheckedChange={() => setFilters(prev => ({ ...prev, readStatus: prev.readStatus === 'unread' ? null : 'unread' }))}
                  >
                    Unread
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Topic Navigation */}
      {topics.length > 0 && (
        <div className="bg-background border-b sticky top-[160px] z-10">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1">
              <span className="text-sm text-muted-foreground whitespace-nowrap">Jump to:</span>
              {topics.map(topic => (
                <Button
                  key={topic}
                  variant="outline"
                  size="sm"
                  className="whitespace-nowrap"
                  onClick={() => {
                    document.getElementById(`topic-${topic}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                >
                  {topic} ({articlesByTopic[topic].length})
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Articles by Topic */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {filteredArticles.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <Search className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Matching Articles</h2>
              <p className="text-muted-foreground mb-4">Try adjusting your search or filters</p>
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-10">
            {topics.map((topic, topicIndex) => (
              <div key={topic} id={`topic-${topic}`} className="scroll-mt-48">
                {/* Topic Header */}
                <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-primary">
                  <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                    <span className="text-primary">#</span> {topic}
                  </h2>
                  <Badge variant="secondary">
                    {articlesByTopic[topic].length} articles
                  </Badge>
                </div>

                {/* Topic Articles */}
                <div className="space-y-6">
                  {articlesByTopic[topic].map((article, index) => {
                    const progress = getReadingProgress(article.id);
                    const isRead = progress >= 100;

                    return (
                      <Card
                        key={article.id}
                        className={`overflow-hidden ${isRead ? 'border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20' : ''}`}
                      >
                        <CardContent className="p-0">
                          {/* Article Number */}
                          <div className="bg-primary/10 px-4 py-2 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <span className="text-xl font-bold text-primary">{index + 1}</span>
                              <Badge
                                variant={article.importance === 'high' ? 'destructive' : article.importance === 'medium' ? 'default' : 'secondary'}
                              >
                                {article.importance === 'high' ? 'High Priority' : article.importance === 'medium' ? 'Medium' : 'Read'}
                              </Badge>
                              {article.hasQuiz && (
                                <Badge variant="outline" className="text-green-600 border-green-600">
                                  <CheckCircle2 className="h-3 w-3 mr-1" />
                                  Quiz Available
                                </Badge>
                              )}
                            </div>
                            {isRead && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Read
                              </Badge>
                            )}
                          </div>

                          {/* Article Content */}
                          <div className="p-6">
                            <h3 className="text-lg font-semibold text-foreground mb-2">
                              {article.title}
                            </h3>

                            <p className="text-muted-foreground mb-4">{article.excerpt}</p>

                            {/* Meta Info */}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                {article.readTime}
                              </div>
                            </div>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-4">
                              {article.tags.map((tag, i) => (
                                <Badge key={i} variant="outline" className="text-xs text-primary">
                                  {tag}
                                </Badge>
                              ))}
                            </div>

                            {/* Full Content */}
                            {article.content && (
                              <div className="prose prose-sm dark:prose-invert max-w-none mt-4 pt-4 border-t">
                                {article.content.split('\n\n').map((paragraph, i) => {
                                  if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                                    return (
                                      <h4 key={i} className="text-base font-semibold mt-3 mb-2">
                                        {paragraph.replace(/\*\*/g, '')}
                                      </h4>
                                    );
                                  }
                                  if (paragraph.startsWith('-') || paragraph.startsWith('1.')) {
                                    return (
                                      <ul key={i} className="list-disc pl-6 space-y-1">
                                        {paragraph.split('\n').map((item, j) => (
                                          <li key={j}>{item.replace(/^[-\d.]\s*/, '')}</li>
                                        ))}
                                      </ul>
                                    );
                                  }
                                  return (
                                    <p key={i} className="text-foreground/80 leading-relaxed mb-2 text-sm">
                                      {paragraph}
                                    </p>
                                  );
                                })}
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => markAsRead(article.id)}
                                disabled={isRead}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                {isRead ? 'Completed' : 'Mark as Read'}
                              </Button>
                              <Button variant="outline" size="sm">
                                <Share2 className="h-4 w-4 mr-1" />
                                Share
                              </Button>
                              <Button
                                variant={isSaved(article.id) ? "default" : "outline"}
                                size="sm"
                                onClick={() => toggleSave(article.id)}
                              >
                                <Bookmark className={`h-4 w-4 mr-1 ${isSaved(article.id) ? "fill-current" : ""}`} />
                                {isSaved(article.id) ? "Saved" : "Save"}
                              </Button>
                              {article.hasQuiz && (
                                <Button size="sm" className="ml-auto">
                                  Take Quiz
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {topicIndex < topics.length - 1 && (
                  <div className="my-8 border-b border-dashed" />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-8 pt-6 border-t text-center">
          <p className="text-muted-foreground mb-4">You've read all news for {date}</p>
          <Button onClick={() => navigate('/student/current-affairs')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current Affairs
          </Button>
        </div>
      </div>
      <BackToTopButton />
    </div>
  );
};

export default DailyNewsPage;
