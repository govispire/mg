import React, { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Clock, Calendar, BookOpen, Share2, Bookmark, CheckCircle2, Download, Search, Filter, X, ChevronsUp } from 'lucide-react';
import { allArticles, getRelatedArticles } from '@/components/current-affairs/articlesData';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { generateTopicPDF } from '@/utils/pdfGenerator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const TopicArticlesPage = () => {
  const { topic } = useParams<{ topic: string }>();
  const navigate = useNavigate();
  const { getReadingProgress, markAsRead } = useReadingProgress();
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    importance: [] as string[],
    hasQuiz: null as boolean | null,
    readStatus: null as 'read' | 'unread' | null,
  });

  const decodedTopic = decodeURIComponent(topic || '');

  // Get all articles for this topic
  const topicArticles = allArticles.filter(
    article => article.topic.toLowerCase() === decodedTopic.toLowerCase()
  );

  // Handle scroll for back to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Apply search and filters
  const filteredArticles = useMemo(() => {
    return topicArticles.filter(article => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          article.title.toLowerCase().includes(query) ||
          article.excerpt.toLowerCase().includes(query) ||
          article.tags.some(tag => tag.toLowerCase().includes(query));
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
  }, [topicArticles, searchQuery, filters, getReadingProgress]);

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
    generateTopicPDF(filteredArticles, decodedTopic);
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

  if (topicArticles.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <Card>
          <CardContent className="pt-6 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Articles Found</h2>
            <p className="text-muted-foreground">No articles found for topic: {decodedTopic}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background border-b shadow-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-4">
          <div className="flex items-center justify-between">
            <Button variant="ghost" onClick={() => navigate(-1)} size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm">
                {filteredArticles.length} / {topicArticles.length} Articles
              </Badge>
              <Button variant="outline" size="sm" onClick={handleDownloadPDF}>
                <Download className="h-4 w-4 mr-1" />
                PDF
              </Button>
            </div>
          </div>
          <div className="mt-3">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <span className="text-primary">#</span> {decodedTopic}
            </h1>
            <p className="text-muted-foreground mt-2 text-lg">
              All articles related to {decodedTopic}
            </p>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-muted/30 border-b sticky top-[116px] z-10 backdrop-blur-sm">
        <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-3">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 bg-background"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="gap-2 bg-background">
                    <Filter className="h-4 w-4" />
                    Filters
                    {hasActiveFilters && (
                      <Badge variant="secondary" className="h-5 w-5 p-0 justify-center ml-1">
                        !
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  {/* ... Keep existing menu items ... */}
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
                <Button variant="ghost" onClick={clearFilters}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Articles List */}
      <div className="max-w-[1600px] w-full mx-auto px-4 md:px-8 py-8">
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
          <div className="space-y-6">
            {filteredArticles.map((article, index) => {
              const progress = getReadingProgress(article.id);
              const isRead = progress >= 100;

              return (
                <Card
                  key={article.id}
                  className={`overflow-hidden transition-all hover:shadow-lg ${isRead ? 'border-green-200 bg-green-50/30 dark:border-green-900 dark:bg-green-950/20' : 'hover:border-primary/30'}`}
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {/* Number & Meta Sidebar */}
                      <div className="md:w-24 bg-muted/20 p-4 flex md:flex-col items-center justify-center md:justify-start gap-4 border-b md:border-b-0 md:border-r">
                        <span className="text-3xl font-bold text-primary/30">#{index + 1}</span>
                        {isRead && (
                          <div className="flex flex-col items-center text-green-600">
                            <CheckCircle2 className="h-6 w-6" />
                            <span className="text-[10px] uppercase font-bold mt-1">Read</span>
                          </div>
                        )}
                      </div>

                      {/* Main Content */}
                      <div className="flex-1 p-6">
                        <div className="flex items-center gap-3 mb-4 flex-wrap">
                          {getImportanceBadge(article.importance)}

                          {article.hasQuiz && (
                            <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Quiz Available
                            </Badge>
                          )}

                          <div className="flex items-center gap-4 text-sm text-muted-foreground ml-auto">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-4 w-4" />
                              {article.readTime}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-4 w-4" />
                              {article.date}
                            </div>
                          </div>
                        </div>

                        <h2 className="text-2xl font-bold text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">
                          {article.title}
                        </h2>

                        <p className="text-lg text-muted-foreground mb-6 leading-relaxed max-w-5xl">
                          {article.excerpt}
                        </p>

                        <div className="flex flex-wrap gap-2 mb-6">
                          {article.tags.map((tag, i) => (
                            <Badge key={i} variant="secondary" className="hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer">
                              #{tag}
                            </Badge>
                          ))}
                        </div>

                        {/* Full Content Preview if expanded */}
                        {article.content && (
                          <div className="prose prose-lg dark:prose-invert max-w-none mt-6 pt-6 border-t">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold m-0">Quick Preview</h3>
                            </div>
                            <div className="pl-4 border-l-4 border-primary/20 bg-muted/10 p-4 rounded-r-lg italic text-muted-foreground">
                              {article.content.slice(0, 300)}...
                            </div>
                          </div>
                        )}

                        <div className="flex items-center gap-3 mt-6 pt-4 border-t">
                          <Button
                            variant={isRead ? "secondary" : "default"}
                            onClick={() => markAsRead(article.id)}
                            className="gap-2"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            {isRead ? 'Read Again' : 'Mark as Read'}
                          </Button>

                          {article.hasQuiz && (
                            <Button variant="outline" className="gap-2">
                              Take Quiz ({article.quizQuestions} Q)
                            </Button>
                          )}

                          <div className="flex items-center gap-2 ml-auto">
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Share2 className="h-4 w-4" />
                              Share
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-2">
                              <Bookmark className="h-4 w-4" />
                              Save
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Bottom Navigation */}
        <div className="mt-12 pt-8 border-t text-center">
          <p className="text-muted-foreground mb-4">You've reached the end of {decodedTopic} articles</p>
          <Button onClick={() => navigate('/current-affairs')} variant="outline" size="lg">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Current Affairs
          </Button>
        </div>
      </div>

      {/* Floating Back to Top Button */}
      {showBackToTop && (
        <Button
          className="fixed bottom-10 right-10 rounded-full shadow-2xl z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 bg-primary hover:bg-primary/90 h-14 w-14 text-primary-foreground"
          size="icon"
          onClick={scrollToTop}
        >
          <ChevronsUp className="h-8 w-8" />
        </Button>
      )}
    </div>
  );
};

export default TopicArticlesPage;
