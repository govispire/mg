import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, Clock, BookOpen, ChevronRight, Download } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCurrentAffairsStore } from '@/hooks/useCurrentAffairsStore';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { generateDailyNewsPDF } from '@/utils/pdfGenerator';

const DailyNewsView = () => {
  const navigate = useNavigate();
  const { getDailyNewsArticles } = useCurrentAffairsStore();
  const { getReadingProgress } = useReadingProgress();

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('All');

  // Use store — picks up admin-created daily-news articles immediately
  const dailyArticles = getDailyNewsArticles();

  // Group by date
  const articlesByDate = dailyArticles.reduce((acc, article) => {
    const key = article.date;
    if (!acc[key]) acc[key] = [];
    acc[key].push(article);
    return acc;
  }, {} as Record<string, typeof dailyArticles>);

  const parseDate = (dateStr: string) => {
    const parts = dateStr.split(' ');
    if (parts.length === 3) return new Date(`${parts[1]} ${parts[0]} ${parts[2]}`);
    return new Date(dateStr);
  };

  let dates = Object.keys(articlesByDate).sort((a, b) =>
    parseDate(b).getTime() - parseDate(a).getTime()
  );

  if (date) {
    dates = dates.filter(d => parseDate(d).toDateString() === date.toDateString());
  } else if (selectedMonth !== 'All') {
    dates = dates.filter(d => {
      const dDate = parseDate(d);
      return dDate.toLocaleString('default', { month: 'long', year: 'numeric' }) === selectedMonth;
    });
  }

  const availableMonths = Array.from(new Set(
    Object.keys(articlesByDate).map(d =>
      parseDate(d).toLocaleString('default', { month: 'long', year: 'numeric' })
    )
  )).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const getTopicsForDate = (d: string) => {
    const topics = new Set(articlesByDate[d].map(a => a.topic));
    return Array.from(topics);
  };

  const handleViewDay = (d: string) => navigate(`/current-affairs/date/${encodeURIComponent(d)}`);

  const handleDownloadPDF = (d: string, e: React.MouseEvent) => {
    e.stopPropagation();
    generateDailyNewsPDF(articlesByDate[d], d);
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col xl:flex-row gap-6 justify-between items-start xl:items-center">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CalendarDays className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Daily News Archive</h2>
                <p className="text-muted-foreground text-sm">Browse news by date - click any day to read all articles</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto items-start sm:items-center">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 w-full sm:w-auto no-scrollbar">
                <Button
                  variant={selectedMonth === 'All' && !date ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => { setSelectedMonth('All'); setDate(undefined); }}
                  className="whitespace-nowrap"
                >
                  All Dates
                </Button>
                {availableMonths.map(month => (
                  <Button
                    key={month}
                    variant={selectedMonth === month && !date ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => { setSelectedMonth(month); setDate(undefined); }}
                    className="whitespace-nowrap"
                  >
                    {month}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-2 ml-auto sm:ml-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn('w-[240px] justify-start text-left font-normal', !date && 'text-muted-foreground')}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <CalendarComponent
                      mode="single"
                      selected={date}
                      onSelect={(d) => { setDate(d); if (d) setSelectedMonth('All'); }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {(date || selectedMonth !== 'All') && (
                  <Button variant="ghost" size="icon" onClick={() => { setDate(undefined); setSelectedMonth('All'); }} title="Clear filters">
                    <span className="text-xl">×</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {dates.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <CalendarDays className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Daily News Yet</h3>
            <p className="text-muted-foreground">
              SuperAdmin hasn't published any Daily News articles yet. Articles tagged
              <span className="font-semibold mx-1">Daily News</span>in the Current Affairs manager appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {dates.map(d => {
            const articles = articlesByDate[d];
            const topics = getTopicsForDate(d);
            const readCount = articles.filter(a => getReadingProgress(a.id) >= 100).length;
            const highPriorityCount = articles.filter(a => a.importance === 'high').length;
            const previewImage = articles.find(a => a.image)?.image;

            return (
              <Card
                key={d}
                className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
                onClick={() => handleViewDay(d)}
              >
                <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                  {previewImage ? (
                    <img src={previewImage} alt={d} className="w-full h-full object-cover opacity-60" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Calendar className="h-12 w-12 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      <span className="font-semibold text-foreground">{d}</span>
                    </div>
                  </div>
                  {readCount === articles.length && (
                    <Badge className="absolute top-2 right-2 bg-green-500">All Read</Badge>
                  )}
                  <Button
                    variant="secondary"
                    size="icon"
                    className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => handleDownloadPDF(d, e)}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </div>

                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{articles.length} articles</span>
                    </div>
                    {readCount > 0 && (
                      <Badge variant="outline" className="text-green-600 border-green-600">
                        {readCount}/{articles.length} read
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {topics.slice(0, 3).map(topic => (
                      <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                    ))}
                    {topics.length > 3 && (
                      <Badge variant="outline" className="text-xs">+{topics.length - 3} more</Badge>
                    )}
                  </div>

                  {highPriorityCount > 0 && (
                    <div className="flex items-center gap-1 mb-3">
                      <Badge variant="destructive" className="text-xs">{highPriorityCount} High Priority</Badge>
                    </div>
                  )}

                  <div className="space-y-1 mb-3">
                    {articles.slice(0, 2).map(article => (
                      <p key={article.id} className="text-xs text-muted-foreground truncate">• {article.title}</p>
                    ))}
                    {articles.length > 2 && (
                      <p className="text-xs text-primary">+{articles.length - 2} more articles</p>
                    )}
                  </div>

                  <Button
                    className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                    variant="outline"
                    size="sm"
                  >
                    View All News
                    <ChevronRight className="h-4 w-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyNewsView;
