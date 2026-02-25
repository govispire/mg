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
import { allArticles } from './articlesData';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { generateDailyNewsPDF } from '@/utils/pdfGenerator';

const DailyNewsView = () => {
  const navigate = useNavigate();
  const { getReadingProgress } = useReadingProgress();

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('All');

  // Group articles by date
  const articlesByDate = allArticles.reduce((acc, article) => {
    const articleDate = article.date; // Assuming format "DD MMM YYYY" e.g "24 Jan 2025" or ISO

    // Simple filter logic
    if (date) {
      // Convert article date string to Date object for comparison if needed
      // For now, let's assume strict string matching or basic filtering
      // If date is selected, we might want to show only that date
      // But the layout maps over 'dates'.
    }

    if (!acc[articleDate]) {
      acc[articleDate] = [];
    }
    acc[articleDate].push(article);
    return acc;
  }, {} as Record<string, typeof allArticles>);

  // Helper to parse date string "24 Jan 2025"
  const parseDate = (dateStr: string) => {
    const parts = dateStr.split(' ');
    if (parts.length === 3) {
      return new Date(`${parts[1]} ${parts[0]} ${parts[2]}`);
    }
    return new Date(dateStr);
  };

  // Sort dates in descending order (newest first)
  let dates = Object.keys(articlesByDate).sort((a, b) => {
    return parseDate(b).getTime() - parseDate(a).getTime();
  });

  // Filter dates based on selection
  if (date) {
    // Format selected date to match article date string format "DD MMM YYYY"
    // This might be tricky without date-fns, standardizing on locale string
    const options: Intl.DateTimeFormatOptions = { day: 'numeric', month: 'short', year: 'numeric' };
    // "24 Jan 2025"
    // Let's rely on basic filtering or just scroll to date?
    // User asked for "calendar and month wise sub tabs".
    // Let's filter the list.
    const selectedDateStr = date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    // en-GB gives "24 Jan 2025" usually? No, "24 Jan 2025" is specific.
    // Let's match roughly.
    dates = dates.filter(d => {
      const dDate = parseDate(d);
      return dDate.toDateString() === date.toDateString();
    });
  } else if (selectedMonth !== 'All') {
    dates = dates.filter(d => {
      const dDate = parseDate(d);
      const monthYear = dDate.toLocaleString('default', { month: 'long', year: 'numeric' }); // "January 2025"
      return monthYear === selectedMonth;
    });
  }

  const handleViewDay = (date: string) => {
    navigate(`/current-affairs/date/${encodeURIComponent(date)}`);
  };

  const handleDownloadPDF = (date: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const dateArticles = articlesByDate[date];
    generateDailyNewsPDF(dateArticles, date);
  };

  // Get unique topics for a date
  const getTopicsForDate = (date: string) => {
    const topics = new Set(articlesByDate[date].map(a => a.topic));
    return Array.from(topics);
  };

  // Generate list of available months from data
  const availableMonths = Array.from(new Set(Object.keys(articlesByDate).map(d => {
    const dDate = parseDate(d);
    return dDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  }))).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());



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
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
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
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => { setDate(undefined); setSelectedMonth('All'); }}
                    title="Clear filters"
                  >
                    <span className="text-xl">×</span>
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {dates.map(date => {
          const articles = articlesByDate[date];
          const topics = getTopicsForDate(date);
          const readCount = articles.filter(a => getReadingProgress(a.id) >= 100).length;
          const highPriorityCount = articles.filter(a => a.importance === 'high').length;

          // Get a preview image from the first article with an image
          const previewImage = articles.find(a => a.image)?.image;

          return (
            <Card
              key={date}
              className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group"
              onClick={() => handleViewDay(date)}
            >
              {/* Thumbnail Header */}
              <div className="relative h-32 bg-gradient-to-br from-primary/20 to-primary/5">
                {previewImage ? (
                  <img
                    src={previewImage}
                    alt={date}
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Calendar className="h-12 w-12 text-primary/40" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-3 left-3 right-3">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span className="font-semibold text-foreground">{date}</span>
                  </div>
                </div>
                {readCount === articles.length && (
                  <Badge className="absolute top-2 right-2 bg-green-500">
                    All Read
                  </Badge>
                )}
                <Button
                  variant="secondary"
                  size="icon"
                  className="absolute top-2 left-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => handleDownloadPDF(date, e)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>

              <CardContent className="p-4">
                {/* Stats */}
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

                {/* Topics Preview */}
                <div className="flex flex-wrap gap-1 mb-3">
                  {topics.slice(0, 3).map(topic => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                  {topics.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{topics.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Priority Indicator */}
                {highPriorityCount > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <Badge variant="destructive" className="text-xs">
                      {highPriorityCount} High Priority
                    </Badge>
                  </div>
                )}

                {/* Articles Preview */}
                <div className="space-y-1 mb-3">
                  {articles.slice(0, 2).map(article => (
                    <p key={article.id} className="text-xs text-muted-foreground truncate">
                      • {article.title}
                    </p>
                  ))}
                  {articles.length > 2 && (
                    <p className="text-xs text-primary">
                      +{articles.length - 2} more articles
                    </p>
                  )}
                </div>

                {/* View Button */}
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

      {dates.length === 0 && (
        <Card>
          <CardContent className="pt-6 text-center">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Daily News</h3>
            <p className="text-muted-foreground">
              No daily news articles available at the moment.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DailyNewsView;
