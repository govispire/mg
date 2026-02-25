import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, BookOpen, ArrowRight, History } from 'lucide-react';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { allArticles, getArticleById } from './articlesData';
import { Article } from './types';

export const ContinueReadingSection: React.FC = () => {
  const navigate = useNavigate();
  const { getContinueReadingArticles, getReadingProgress } = useReadingProgress();
  
  const continueReadingProgress = getContinueReadingArticles(5);
  
  const articlesToResume = continueReadingProgress
    .map(progress => {
      const article = getArticleById(progress.articleId);
      return article ? { article, progress: progress.progress, lastRead: progress.lastRead } : null;
    })
    .filter((item): item is { article: Article; progress: number; lastRead: string } => item !== null);

  if (articlesToResume.length === 0) {
    return null;
  }

  const formatLastRead = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <Card className="mb-8 border-l-4 border-l-primary bg-gradient-to-r from-primary/5 to-transparent">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <History className="h-5 w-5 text-primary" />
          Continue Reading
          <Badge variant="secondary" className="ml-2">{articlesToResume.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {articlesToResume.map(({ article, progress, lastRead }) => (
            <div
              key={article.id}
              className="flex items-center gap-4 p-3 rounded-lg bg-background hover:bg-muted/50 transition-colors cursor-pointer group"
              onClick={() => navigate(`/current-affairs/${article.id}`)}
            >
              {article.image && (
                <img 
                  src={article.image} 
                  alt={article.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm line-clamp-1 group-hover:text-primary transition-colors">
                  {article.title}
                </h4>
                <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                  <Badge variant="outline" className="text-xs">{article.category}</Badge>
                  <span className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {formatLastRead(lastRead)}
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <Progress value={progress} className="h-1.5 flex-1" />
                  <span className="text-xs text-primary font-medium">{Math.round(progress)}%</span>
                </div>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
