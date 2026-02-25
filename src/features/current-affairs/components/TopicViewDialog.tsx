import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Hash, Calendar, Clock, CheckCircle, ArrowRight, ChevronUp } from 'lucide-react';
import { Article } from './types';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { cn } from '@/lib/utils';

export interface TopicViewDialogProps {
  articles: Article[] | null;
  topicName: string;
  onClose: () => void;
  onArticleClick?: (article: Article) => void;
}

export const TopicViewDialog: React.FC<TopicViewDialogProps> = ({
  articles,
  topicName,
  onClose,
  onArticleClick
}) => {
  const navigate = useNavigate();
  const { getReadingProgress } = useReadingProgress();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [showBackToTop, setShowBackToTop] = React.useState(false);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => {
      setShowBackToTop(container.scrollTop > 300);
    };

    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [articles]);

  if (!articles || articles.length === 0) return null;

  const handleArticleClick = (article: Article) => {
    if (onArticleClick) {
      onArticleClick(article);
    } else {
      navigate(`/current-affairs/${article.id}`);
    }
    onClose();
  };

  const scrollToTop = () => {
    scrollContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
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

  return (
    <Dialog open={!!articles} onOpenChange={onClose}>
      <DialogContent className="max-w-[98vw] w-full h-[95vh] flex flex-col p-0 overflow-hidden outline-none">
        <DialogHeader className="p-6 border-b bg-gradient-to-r from-primary/5 to-primary/10 flex-shrink-0 relative">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Hash className="h-6 w-6 text-primary" />
            {topicName}
            <Badge variant="secondary" className="ml-2">{articles.length} articles</Badge>
          </DialogTitle>
        </DialogHeader>

        <div
          ref={scrollContainerRef}
          className="flex-1 overflow-y-auto scroll-smooth relative"
        >
          <div className="p-6 space-y-6 w-full px-4 md:px-8">
            {articles.map((article, idx) => {
              const progress = getReadingProgress(article.id);
              return (
                <div
                  key={article.id}
                  className="p-5 border rounded-xl hover:bg-muted/50 transition-all cursor-pointer group hover:shadow-md border-border/50"
                  onClick={() => handleArticleClick(article)}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl font-bold text-primary/20 flex-shrink-0 w-8">{idx + 1}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {getImportanceBadge(article.importance)}
                        <Badge variant="outline" className="bg-background">{article.category}</Badge>
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
                      </div>
                      <h3 className="text-2xl font-bold mb-4 group-hover:text-primary transition-colors leading-tight">
                        {article.title}
                      </h3>
                      <p className="text-muted-foreground text-lg mb-6 leading-relaxed max-w-full">{article.excerpt}</p>

                      <div className="flex items-center gap-6 text-sm text-muted-foreground pt-5 border-t border-border/40">
                        <span className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {article.date}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="h-4 w-4" />
                          {article.readTime}
                        </span>
                        <div className="flex gap-2 ml-auto">
                          {article.tags?.map(tag => (
                            <Badge key={tag} variant="secondary" className="bg-muted hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <Button variant="outline" size="icon" className="group-hover:translate-x-1 transition-transform h-12 w-12 rounded-full border-primary/20 bg-muted/30">
                      <ArrowRight className="h-6 w-6" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Floating Back to Top Button */}
          {showBackToTop && (
            <Button
              className="fixed bottom-10 right-10 rounded-full shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-4 duration-300 bg-primary hover:bg-primary/90 h-14 w-14 text-primary-foreground"
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                scrollToTop();
              }}
            >
              <ChevronUp className="h-8 w-8" />
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
