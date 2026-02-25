import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Share2, Bookmark, Clock, CheckCircle2, ArrowUp } from 'lucide-react';
import { allArticles } from './articlesData';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { generateTopicPDF } from '@/utils/pdfGenerator';
import BackToTopButton from '@/components/global/BackToTopButton';


interface AllInOneViewProps {
  viewMode?: 'grid' | 'list';
}

const AllInOneView: React.FC<AllInOneViewProps> = ({ viewMode = 'grid' }) => {
  const navigate = useNavigate();
  const { getReadingProgress } = useReadingProgress();

  // Group articles by topic
  const articlesByTopic = allArticles.reduce((acc, article) => {
    if (!acc[article.topic]) {
      acc[article.topic] = [];
    }
    acc[article.topic].push(article);
    return acc;
  }, {} as Record<string, typeof allArticles>);

  const topics = Object.keys(articlesByTopic).sort();

  const handleReadAll = (topic: string) => {
    navigate(`/current-affairs/topic/${encodeURIComponent(topic)}`);
  };

  const handleDownloadPDF = (topic: string) => {
    const topicArticles = articlesByTopic[topic];
    generateTopicPDF(topicArticles, topic);
  };

  return (
    <div className="space-y-6">
      {/* Topic Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b mb-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          <span className="text-sm text-muted-foreground whitespace-nowrap pl-1">Jump to:</span>
          {topics.map(topic => (
            <Button
              key={topic}
              variant="outline"
              size="sm"
              className="whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => {
                const element = document.getElementById(topic.replace(/\s+/g, '-'));
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
              }}
            >
              {topic}
            </Button>
          ))}
        </div>
      </div>
      {topics.map(topic => {
        const articles = articlesByTopic[topic];
        const readCount = articles.filter(a => getReadingProgress(a.id) >= 100).length;

        return (
          <Card key={topic} id={topic.replace(/\s+/g, '-')} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-primary">#</span> {topic}
                  </CardTitle>
                  <Badge variant="secondary">{articles.length} articles</Badge>
                  {readCount > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {readCount}/{articles.length} read
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleReadAll(topic)}
                    className="gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Read All ({articles.length})
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={() => handleDownloadPDF(topic)}
                  >
                    <Download className="h-4 w-4" />
                    Download PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4" : "space-y-3"}>
                {articles.map((article, index) => {
                  const progress = getReadingProgress(article.id);
                  const isRead = progress >= 100;

                  return (
                    <div
                      key={article.id}
                      className={`
                        p-3 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors
                        ${isRead ? 'bg-green-50/50 border-green-200 dark:bg-green-950/20 dark:border-green-900' : 'bg-muted/30'}
                        ${viewMode === 'grid' ? 'flex flex-col h-full gap-3' : 'flex items-start gap-4'}
                      `}
                      onClick={() => navigate(`/current-affairs/topic/${encodeURIComponent(topic)}`)}
                    >
                      <div className={viewMode === 'list' ? "min-w-[24px]" : "flex justify-between items-center w-full"}>
                        <span className="text-2xl font-bold text-primary/60">
                          {index + 1}
                        </span>
                        {viewMode === 'grid' && isRead && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 h-5">
                            <CheckCircle2 className="h-3 w-3 mr-1" /> Read
                          </Badge>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant={article.importance === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {article.importance === 'high' ? 'High Priority' : article.importance === 'medium' ? 'Medium' : 'Read'}
                          </Badge>
                          {article.hasQuiz && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Quiz Available
                            </Badge>
                          )}
                          {viewMode === 'list' && isRead && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Read
                            </Badge>
                          )}
                        </div>
                        <h4 className="font-medium text-foreground hover:text-primary line-clamp-2 mb-1">
                          {article.title}
                        </h4>
                        <p className="text-sm text-muted-foreground line-clamp-2 mt-1 mb-2">
                          {article.excerpt}
                        </p>
                        <div className="flex items-center gap-3 mt-auto text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}
                          </span>
                          <div className="flex gap-1">
                            {article.tags.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-primary">{tag}</span>
                            ))}
                          </div>
                        </div>

                        {viewMode === 'list' && article.relatedIds.length > 0 && (
                          <div className="mt-2 text-xs">
                            <span className="text-muted-foreground">Related: </span>
                            <span className="text-primary hover:underline">{article.relatedIds.length} more</span>
                          </div>
                        )}
                      </div>

                      {viewMode === 'list' && (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Share2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <Bookmark className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-muted-foreground hover:text-primary gap-1"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                >
                  <ArrowUp className="h-3 w-3" />
                  Back to Top
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
      <BackToTopButton />
    </div>
  );
};

export default AllInOneView;
