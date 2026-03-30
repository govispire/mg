import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Download, Clock, CheckCircle2, ArrowUp, LayoutGrid, List } from 'lucide-react';
import { useCurrentAffairsStore } from '@/hooks/useCurrentAffairsStore';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { generateTopicPDF } from '@/utils/pdfGenerator';
import BackToTopButton from '@/components/global/BackToTopButton';

/**
 * All in One View
 * ─────────────────────────────────────────────────────────────────────────────
 * Displays ALL articles (news + daily-news) auto-grouped by CATEGORY.
 * This is NOT a separate publish type — it's an intelligent aggregated view.
 */

interface AllInOneViewProps {
  viewMode?: 'grid' | 'list';
}

const AllInOneView: React.FC<AllInOneViewProps> = ({ viewMode: externalViewMode }) => {
  const navigate = useNavigate();
  const { getAllInOneByCategory } = useCurrentAffairsStore();
  const { getReadingProgress } = useReadingProgress();
  const [localViewMode, setLocalViewMode] = useState<'grid' | 'list'>('grid');

  const viewMode = externalViewMode ?? localViewMode;

  // All articles auto-grouped by category from the store
  const byCategory = getAllInOneByCategory();
  const categories = Object.keys(byCategory).sort();

  const handleReadAll = (category: string) => {
    navigate(`/current-affairs/topic/${encodeURIComponent(category)}`);
  };

  const handleDownloadPDF = (category: string) => {
    generateTopicPDF(byCategory[category], category);
  };

  if (categories.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <LayoutGrid className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No Articles Yet</h3>
          <p className="text-muted-foreground">All published articles will appear here, organized by category.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Category Navigation + View Toggle */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b mb-4 flex items-start gap-3 flex-wrap">
        <span className="text-sm text-muted-foreground whitespace-nowrap pl-1 pt-1">Jump to:</span>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar flex-1">
          {categories.map(cat => (
            <Button
              key={cat}
              variant="outline"
              size="sm"
              className="whitespace-nowrap hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => {
                const element = document.getElementById(`cat-${cat.replace(/\s+/g, '-')}`);
                element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
            >
              {cat}
              <Badge variant="secondary" className="ml-1.5 text-[10px] py-0">{byCategory[cat].length}</Badge>
            </Button>
          ))}
        </div>
        {/* View mode toggle (only if no external viewMode) */}
        {!externalViewMode && (
          <div className="flex bg-muted/50 p-1 rounded-lg shrink-0">
            <Button
              variant={localViewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0 rounded-md"
              onClick={() => setLocalViewMode('grid')}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={localViewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0 rounded-md"
              onClick={() => setLocalViewMode('list')}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
        )}
      </div>

      {categories.map(category => {
        const articles = byCategory[category];
        const readCount = articles.filter(a => getReadingProgress(a.id) >= 100).length;

        return (
          <Card key={category} id={`cat-${category.replace(/\s+/g, '-')}`} className="border-l-4 border-l-primary">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <span className="text-primary">#</span>{category}
                  </CardTitle>
                  <Badge variant="secondary">{articles.length} articles</Badge>
                  {readCount > 0 && (
                    <Badge variant="outline" className="text-green-600 border-green-600">
                      {readCount}/{articles.length} read
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleReadAll(category)} className="gap-2">
                    <Eye className="h-4 w-4" />
                    Read All ({articles.length})
                  </Button>
                  <Button variant="outline" size="sm" className="gap-2" onClick={() => handleDownloadPDF(category)}>
                    <Download className="h-4 w-4" />
                    PDF
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4' : 'space-y-3'}>
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
                      onClick={() => navigate(`/current-affairs/${article.id}`)}
                    >
                      <div className={viewMode === 'list' ? 'min-w-[24px]' : 'flex justify-between items-center w-full'}>
                        <span className="text-2xl font-bold text-primary/60">{index + 1}</span>
                        {viewMode === 'grid' && isRead && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-700 h-5">
                            <CheckCircle2 className="h-3 w-3 mr-1" />Read
                          </Badge>
                        )}
                      </div>

                      {/* Article thumbnail for grid */}
                      {viewMode === 'grid' && article.image && (
                        <img
                          src={article.image}
                          alt={article.title}
                          className="w-full h-28 object-cover rounded-md"
                          onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      )}

                      <div className="flex-1 min-w-0 w-full">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge
                            variant={article.importance === 'high' ? 'destructive' : 'secondary'}
                            className="text-xs"
                          >
                            {article.importance === 'high' ? 'High Priority' : article.importance === 'medium' ? 'Medium' : 'Normal'}
                          </Badge>
                          {article.hasQuiz && (
                            <Badge variant="outline" className="text-xs text-green-600 border-green-600">
                              <CheckCircle2 className="h-3 w-3 mr-1" />Quiz
                            </Badge>
                          )}
                          {/* Source type badge */}
                          {article.publishType === 'daily-news' && (
                            <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">Daily News</Badge>
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
                            <Clock className="h-3 w-3" />{article.readTime}
                          </span>
                          <div className="flex gap-1">
                            {article.tags?.slice(0, 2).map((tag, i) => (
                              <span key={i} className="text-primary">{tag}</span>
                            ))}
                          </div>
                        </div>
                      </div>
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
                  <ArrowUp className="h-3 w-3" />Back to Top
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
