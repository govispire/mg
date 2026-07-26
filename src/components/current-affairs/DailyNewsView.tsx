import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, CalendarDays, Clock, BookOpen, ChevronRight, Download, ArrowRight } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { useCurrentAffairsStore } from '@/hooks/useCurrentAffairsStore';
import { useReadingProgress } from '@/hooks/useReadingProgress';
import { generateDailyNewsPDF } from '@/utils/pdfGenerator';
import { motion } from 'framer-motion';

const DailyNewsView = () => {
  const navigate = useNavigate();
  const { getDailyNewsArticles } = useCurrentAffairsStore();
  const { getReadingProgress } = useReadingProgress();

  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [selectedMonth, setSelectedMonth] = React.useState<string>('All');

  // Use store — auto-allocates all news articles grouped by date
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

  const getCategoriesForDate = (d: string) => {
    const categories = new Set(articlesByDate[d].map(a => a.category));
    return Array.from(categories);
  };

  const handleViewDay = (d: string) => navigate(`/current-affairs/date/${encodeURIComponent(d)}`, { state: { from: '/student/current-affairs', tab: 'daily-news' } });

  const handleDownloadPDF = (d: string, e: React.MouseEvent) => {
    e.stopPropagation();
    generateDailyNewsPDF(articlesByDate[d], d);
  };

  return (
    <div className="space-y-6">
      {/* Date & Month Selection Toolbar */}
      <Card className="border border-slate-200/90 rounded-2xl bg-white shadow-2xs">
        <CardContent className="p-4 sm:p-5">
          <div className="flex flex-col lg:flex-row gap-4 justify-between items-start lg:items-center">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-50 border border-blue-200/80 rounded-xl shrink-0">
                <CalendarDays className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-base font-black text-slate-900">Daily News Archive</h2>
                <p className="text-xs text-slate-500 font-medium">
                  Select a date or month to view comprehensive single-card daily news digests covering all categories.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto items-start sm:items-center">
              {/* Month Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                <button
                  onClick={() => { setSelectedMonth('All'); setDate(undefined); }}
                  className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                    selectedMonth === 'All' && !date
                      ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                      : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60'
                  }`}
                >
                  All Dates
                </button>
                {availableMonths.map(month => (
                  <button
                    key={month}
                    onClick={() => { setSelectedMonth(month); setDate(undefined); }}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shrink-0 border ${
                      selectedMonth === month && !date
                        ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                        : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200/60'
                    }`}
                  >
                    {month}
                  </button>
                ))}
              </div>

              {/* Date Picker */}
              <div className="flex items-center gap-2 shrink-0">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        'h-9 w-[190px] justify-start text-left font-bold text-xs rounded-xl bg-slate-50 border-slate-200',
                        !date && 'text-slate-500'
                      )}
                    >
                      <Calendar className="mr-2 h-3.5 w-3.5 text-blue-600" />
                      {date ? format(date, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-2xl border-slate-200" align="end">
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
                    size="sm"
                    className="h-9 w-9 p-0 text-slate-400 hover:text-slate-700"
                    onClick={() => { setDate(undefined); setSelectedMonth('All'); }}
                    title="Clear filters"
                  >
                    ✕
                  </Button>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily News Cards Grid (Using identical design as Articles & News tab) */}
      {dates.length === 0 ? (
        <Card className="border border-slate-200/90 rounded-2xl bg-white p-8 text-center">
          <CalendarDays className="h-12 w-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-800">No Daily News Available</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            SuperAdmin hasn't published daily news for this date selection. All uploaded news automatically populates here day by day.
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dates.map((d, idx) => {
            const articles = articlesByDate[d];
            const categories = getCategoriesForDate(d);
            const highPriorityCount = articles.filter(a => a.importance === 'high').length;
            const previewImage = articles.find(a => a.image)?.image;

            return (
              <motion.div
                key={d}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
              >
                <Card
                  className="h-full border border-slate-200/90 hover:border-blue-300 hover:shadow-md transition-all duration-300 group cursor-pointer rounded-2xl bg-white overflow-hidden flex flex-col"
                  onClick={() => handleViewDay(d)}
                >
                  {/* CLEAN THUMBNAIL FRAME WITH PDF BUTTON */}
                  <div className="relative h-44 sm:h-48 overflow-hidden bg-slate-100">
                    {previewImage ? (
                      <img
                        src={previewImage}
                        alt={d}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white">
                        <CalendarDays className="h-12 w-12 opacity-80" />
                      </div>
                    )}

                    {/* PDF Download Button */}
                    <Button
                      variant="secondary"
                      size="sm"
                      className="absolute top-3 right-3 h-8 px-2.5 rounded-xl bg-white/90 hover:bg-white text-slate-800 font-extrabold text-[11px] shadow-2xs gap-1 opacity-90 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => handleDownloadPDF(d, e)}
                      title="Download Daily PDF"
                    >
                      <Download className="h-3.5 w-3.5 text-blue-600" />
                      <span>PDF</span>
                    </Button>
                  </div>

                  {/* CARD CONTENT BODY (Identical card layout as Articles & News tab) */}
                  <CardContent className="p-5 flex flex-col flex-1 space-y-3">
                    {/* Category & Metadata Pills inside Card Body */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-black px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
                        Daily News
                      </span>
                      {categories.slice(0, 2).map(cat => (
                        <span key={cat} className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                          {cat}
                        </span>
                      ))}
                      {categories.length > 2 && (
                        <span className="text-[10px] font-bold text-slate-400">+{categories.length - 2} categories</span>
                      )}
                      {highPriorityCount > 0 && (
                        <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-rose-50 border border-rose-200 text-rose-700">
                          🔴 {highPriorityCount} Hot
                        </span>
                      )}
                    </div>

                    {/* Single Daily News Card Title */}
                    <h3 className="text-base sm:text-lg font-black text-slate-900 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                      Daily News Digest – {d}
                    </h3>

                    {/* Excerpt summarizing day-wise news across all categories */}
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 flex-1 font-medium">
                      Covers all key updates for {d}: {articles.map(a => a.title).slice(0, 2).join(', ')} {articles.length > 2 ? `and ${articles.length - 2} more stories.` : ''}
                    </p>

                    {/* Footer: Date, Article count & Explicit Read Button */}
                    <div className="flex items-center justify-between text-xs text-slate-400 pt-3 border-t border-slate-100 mt-auto">
                      <div className="flex items-center gap-3 font-semibold">
                        <span className="flex items-center gap-1 text-slate-500">
                          <Calendar className="h-3.5 w-3.5 text-slate-400" />
                          {d}
                        </span>
                        <span className="flex items-center gap-1 text-slate-500">
                          <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                          {articles.length} Stories
                        </span>
                      </div>

                      {/* Explicit Action Button */}
                      <div className="inline-flex items-center gap-1 text-xs font-extrabold text-blue-600 group-hover:translate-x-1 transition-transform">
                        <span>Read Daily News</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DailyNewsView;
