import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Calendar, Award, FileCheck, Clock, BarChart, Grid3X3, TrendingUp, TrendingDown, Minus, Flame, Target, Zap, BookOpen, ListChecks, CheckCircle2, Circle, AlertCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { addDays, format, startOfWeek } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface StatCardDialogProps {
  type: 'journey' | 'hours' | 'active' | 'tests' | 'tasks';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  preparationStartDate?: Date | string | null;
}

interface YearInsights {
  year: number;
  longestStreak: number;
  mostProductiveMonth: string;
  mostProductiveMonthHours: number;
  avgDailyHours: number;
  totalStudyDays: number;
  totalHours: number;
  monthlyData: { month: string; hours: number; days: number }[];
}

const StatCardDialog = ({ type, open, onOpenChange, preparationStartDate }: StatCardDialogProps) => {
  const [viewType, setViewType] = useState<'heatmap' | 'calendar'>('heatmap');
  const [showComparison, setShowComparison] = useState(false);

  // Get real study data from localStorage for a specific year
  const getRealStudyDataForYear = (year: number): Record<string, number> => {
    const data: Record<string, number> = {};
    const startDate = new Date(year, 0, 1);
    const endDate = year === new Date().getFullYear() ? new Date() : new Date(year, 11, 31);
    const totalDays = Math.floor((endDate.getTime() - startDate.getTime()) / (24 * 60 * 60 * 1000)) + 1;

    // Read real data from localStorage
    const presenceData = JSON.parse(localStorage.getItem('studentPresence') || '{}');
    const quizData = JSON.parse(localStorage.getItem('quizCompletions') || '{}');

    // Build a set of dates with quiz completions
    const quizDateCounts: Record<string, number> = {};
    Object.values(quizData).forEach((q: any) => {
      if (q.completed && q.date) {
        const dateKey = q.date.substring(0, 10); // 'yyyy-MM-dd'
        quizDateCounts[dateKey] = (quizDateCounts[dateKey] || 0) + 1;
      }
    });

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate.getTime() + (i * 24 * 60 * 60 * 1000));
      const formattedDate = format(date, 'yyyy-MM-dd');

      let minutes = 0;

      // If presence is marked, count as 120min base study
      if (presenceData[formattedDate]) {
        minutes += 120;
      }

      // Add 30 minutes per quiz completed on this day
      if (quizDateCounts[formattedDate]) {
        minutes += quizDateCounts[formattedDate] * 30;
      }

      data[formattedDate] = minutes;
    }

    return data;
  };

  // Check if a year has any real data
  const yearHasData = (studyData: Record<string, number>): boolean => {
    return Object.values(studyData).some(m => m > 0);
  };

  // Calculate insights for a year
  const calculateYearInsights = (year: number, studyData: Record<string, number>): YearInsights => {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: { month: string; hours: number; days: number }[] = [];

    const endMonth = year === new Date().getFullYear() ? new Date().getMonth() : 11;

    for (let month = 0; month <= endMonth; month++) {
      let monthHours = 0;
      let monthDays = 0;
      const daysInMonth = new Date(year, month + 1, 0).getDate();

      for (let day = 1; day <= daysInMonth; day++) {
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const minutes = studyData[dateKey] || 0;
        if (minutes > 0) {
          monthHours += minutes / 60;
          monthDays++;
        }
      }

      monthlyData.push({
        month: monthNames[month],
        hours: Math.round(monthHours * 10) / 10,
        days: monthDays
      });
    }

    // Find most productive month
    const mostProductiveIdx = monthlyData.reduce((maxIdx, item, idx, arr) =>
      item.hours > arr[maxIdx].hours ? idx : maxIdx, 0);

    // Calculate longest streak
    let longestStreak = 0;
    let currentStreak = 0;
    const sortedDates = Object.keys(studyData).sort();

    for (const dateKey of sortedDates) {
      if (studyData[dateKey] > 0) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 0;
      }
    }

    const totalStudyDays = Object.values(studyData).filter(m => m > 0).length;
    const totalMinutes = Object.values(studyData).reduce((sum, m) => sum + m, 0);
    const totalHours = totalMinutes / 60;
    const totalDays = Object.keys(studyData).length;

    return {
      year,
      longestStreak,
      mostProductiveMonth: monthlyData[mostProductiveIdx]?.month || 'N/A',
      mostProductiveMonthHours: monthlyData[mostProductiveIdx]?.hours || 0,
      avgDailyHours: Math.round((totalMinutes / totalDays / 60) * 10) / 10,
      totalStudyDays,
      totalHours: Math.round(totalHours * 10) / 10,
      monthlyData
    };
  };

  // Get color based on study minutes
  const getColor = (minutes: number): string => {
    if (minutes === 0) return 'bg-gray-100 border border-gray-200';
    if (minutes < 120) return 'bg-green-100 border border-green-200';
    if (minutes < 240) return 'bg-green-200 border border-green-300';
    if (minutes < 300) return 'bg-green-400 border border-green-500';
    if (minutes < 600) return 'bg-green-600 border border-green-700';
    return 'bg-pink-500 border border-pink-600';
  };

  // Format time
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  // Generate calendar for a specific year
  const generateCalendarForYear = (year: number, studyData: Record<string, number>) => {
    const months = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    const endMonth = year === currentYear ? today.getMonth() : 11;

    for (let month = 0; month <= endMonth; month++) {
      const monthStart = new Date(year, month, 1);
      const monthEnd = new Date(year, month + 1, 0);

      const weeks = [];
      let currentDate = startOfWeek(monthStart, { weekStartsOn: 1 });

      while (currentDate <= monthEnd || currentDate.getMonth() === monthStart.getMonth()) {
        const days = [];

        for (let i = 0; i < 7; i++) {
          const day = addDays(currentDate, i);
          const dateKey = format(day, 'yyyy-MM-dd');
          const minutes = studyData[dateKey] || 0;

          days.push({
            date: day,
            dateKey,
            minutes,
            dayOfWeek: format(day, 'EEE'),
            dayOfMonth: format(day, 'd'),
            isCurrentMonth: day.getMonth() === monthStart.getMonth(),
            isToday: format(day, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')
          });
        }

        weeks.push(days);
        currentDate = addDays(currentDate, 7);

        if (currentDate > monthEnd && weeks.length > 0) break;
      }

      months.push({
        monthName: format(monthStart, 'MMM'),
        fullMonthName: format(monthStart, 'MMMM yyyy'),
        weeks
      });
    }

    return months;
  };

  // Render heatmap cell
  const renderHeatmapCell = (day: any, key: string) => (
    <TooltipProvider key={key}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`w-3 h-3 rounded-sm cursor-pointer transition-all
              ${day.isCurrentMonth
                ? `${getColor(day.minutes)} hover:ring-1 hover:ring-blue-400`
                : 'bg-transparent'
              }
              ${day.isToday ? 'ring-1 ring-blue-500' : ''}
            `}
          />
        </TooltipTrigger>
        {day.isCurrentMonth && (
          <TooltipContent>
            <div className="text-xs">
              <p className="font-semibold">{format(day.date, 'EEEE, MMMM d, yyyy')}</p>
              {day.minutes > 0
                ? <p>{formatTime(day.minutes)} of study</p>
                : <p>No study activity</p>
              }
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  // Render calendar cell
  const renderCalendarCell = (day: any, key: string) => (
    <TooltipProvider key={key}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`w-3 h-3 rounded-sm cursor-pointer transition-all flex items-center justify-center border text-[8px] leading-none
              ${day.isCurrentMonth
                ? `${getColor(day.minutes)} hover:ring-1 hover:ring-blue-400`
                : 'bg-transparent text-gray-300'
              }
              ${day.isToday ? 'ring-1 ring-blue-500' : ''}
              ${day.minutes > 0 ? 'text-white font-bold' : 'text-gray-700'}
            `}
          >
            {day.isCurrentMonth ? day.dayOfMonth : ''}
          </div>
        </TooltipTrigger>
        {day.isCurrentMonth && (
          <TooltipContent>
            <div className="text-xs">
              <p className="font-semibold">{format(day.date, 'EEEE, MMMM d, yyyy')}</p>
              {day.minutes > 0
                ? <p>{formatTime(day.minutes)} of study</p>
                : <p>No study activity</p>
              }
            </div>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );

  // Render insights panel
  const renderInsightsPanel = (insights: YearInsights) => {
    const maxHours = Math.max(...insights.monthlyData.map(m => m.hours));

    return (
      <div className="mt-4 space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-2 sm:p-3 rounded-lg border border-orange-200">
            <div className="flex items-center gap-2 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs text-orange-700 font-medium">Longest Streak</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-orange-600">{insights.longestStreak}</div>
            <div className="text-xs text-orange-600/70">consecutive days</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-2 sm:p-3 rounded-lg border border-purple-200">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-4 w-4 text-purple-500" />
              <span className="text-xs text-purple-700 font-medium">Best Month</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-purple-600">{insights.mostProductiveMonth}</div>
            <div className="text-xs text-purple-600/70">{insights.mostProductiveMonthHours}h studied</div>
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-2 sm:p-3 rounded-lg border border-blue-200">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-500" />
              <span className="text-xs text-blue-700 font-medium">Daily Average</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-blue-600">{insights.avgDailyHours}h</div>
            <div className="text-xs text-blue-600/70">per day</div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-green-100 p-2 sm:p-3 rounded-lg border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="h-4 w-4 text-green-500" />
              <span className="text-xs text-green-700 font-medium">Study Days</span>
            </div>
            <div className="text-xl sm:text-2xl font-bold text-green-600">{insights.totalStudyDays}</div>
            <div className="text-xs text-green-600/70">{insights.totalHours}h total</div>
          </div>
        </div>

        {/* Monthly Chart */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <h4 className="text-xs font-medium text-gray-700 mb-3">Monthly Progress</h4>
          <div className="flex items-end gap-0.5 sm:gap-1 h-16 sm:h-20">
            {insights.monthlyData.map((month, idx) => (
              <TooltipProvider key={idx}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t transition-all hover:from-green-600 hover:to-green-500"
                        style={{ height: `${maxHours > 0 ? (month.hours / maxHours) * 100 : 0}%`, minHeight: month.hours > 0 ? '4px' : '0' }}
                      />
                      <span className="text-[9px] text-gray-500">{month.month}</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="text-xs">
                      <p className="font-semibold">{month.month} {insights.year}</p>
                      <p>{month.hours}h studied</p>
                      <p>{month.days} active days</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Render comparison view
  const renderComparisonView = (yearInsightsData: YearInsights[]) => {
    if (yearInsightsData.length < 2) return null;

    const getPercentageChange = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    const getTrendIcon = (change: number) => {
      if (change > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
      if (change < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
      return <Minus className="h-4 w-4 text-gray-400" />;
    };

    const getTrendColor = (change: number) => {
      if (change > 0) return 'text-green-600';
      if (change < 0) return 'text-red-600';
      return 'text-gray-500';
    };

    return (
      <Card className="p-4 bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200">
        <div className="flex items-center gap-2 mb-4">
          <BarChart className="h-5 w-5 text-indigo-600" />
          <h3 className="font-semibold text-indigo-900">Year-over-Year Comparison</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-indigo-200">
                <th className="text-left py-2 px-2 text-indigo-700 font-medium">Metric</th>
                {yearInsightsData.map((yi) => (
                  <th key={yi.year} className="text-center py-2 px-2 text-indigo-700 font-medium">{yi.year}</th>
                ))}
                <th className="text-center py-2 px-2 text-indigo-700 font-medium">Change</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-indigo-100">
                <td className="py-3 px-2 text-gray-700">Total Hours</td>
                {yearInsightsData.map((yi) => (
                  <td key={yi.year} className="text-center py-3 px-2 font-semibold">{yi.totalHours}h</td>
                ))}
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(getPercentageChange(yearInsightsData[0].totalHours, yearInsightsData[1].totalHours))}
                    <span className={getTrendColor(getPercentageChange(yearInsightsData[0].totalHours, yearInsightsData[1].totalHours))}>
                      {getPercentageChange(yearInsightsData[0].totalHours, yearInsightsData[1].totalHours) > 0 ? '+' : ''}
                      {getPercentageChange(yearInsightsData[0].totalHours, yearInsightsData[1].totalHours)}%
                    </span>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-indigo-100">
                <td className="py-3 px-2 text-gray-700">Study Days</td>
                {yearInsightsData.map((yi) => (
                  <td key={yi.year} className="text-center py-3 px-2 font-semibold">{yi.totalStudyDays}</td>
                ))}
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(getPercentageChange(yearInsightsData[0].totalStudyDays, yearInsightsData[1].totalStudyDays))}
                    <span className={getTrendColor(getPercentageChange(yearInsightsData[0].totalStudyDays, yearInsightsData[1].totalStudyDays))}>
                      {getPercentageChange(yearInsightsData[0].totalStudyDays, yearInsightsData[1].totalStudyDays) > 0 ? '+' : ''}
                      {getPercentageChange(yearInsightsData[0].totalStudyDays, yearInsightsData[1].totalStudyDays)}%
                    </span>
                  </div>
                </td>
              </tr>
              <tr className="border-b border-indigo-100">
                <td className="py-3 px-2 text-gray-700">Longest Streak</td>
                {yearInsightsData.map((yi) => (
                  <td key={yi.year} className="text-center py-3 px-2 font-semibold">{yi.longestStreak} days</td>
                ))}
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(getPercentageChange(yearInsightsData[0].longestStreak, yearInsightsData[1].longestStreak))}
                    <span className={getTrendColor(getPercentageChange(yearInsightsData[0].longestStreak, yearInsightsData[1].longestStreak))}>
                      {getPercentageChange(yearInsightsData[0].longestStreak, yearInsightsData[1].longestStreak) > 0 ? '+' : ''}
                      {getPercentageChange(yearInsightsData[0].longestStreak, yearInsightsData[1].longestStreak)}%
                    </span>
                  </div>
                </td>
              </tr>
              <tr>
                <td className="py-3 px-2 text-gray-700">Daily Average</td>
                {yearInsightsData.map((yi) => (
                  <td key={yi.year} className="text-center py-3 px-2 font-semibold">{yi.avgDailyHours}h</td>
                ))}
                <td className="text-center py-3 px-2">
                  <div className="flex items-center justify-center gap-1">
                    {getTrendIcon(getPercentageChange(yearInsightsData[0].avgDailyHours, yearInsightsData[1].avgDailyHours))}
                    <span className={getTrendColor(getPercentageChange(yearInsightsData[0].avgDailyHours, yearInsightsData[1].avgDailyHours))}>
                      {getPercentageChange(yearInsightsData[0].avgDailyHours, yearInsightsData[1].avgDailyHours) > 0 ? '+' : ''}
                      {getPercentageChange(yearInsightsData[0].avgDailyHours, yearInsightsData[1].avgDailyHours)}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    );
  };

  // Render year heatmap with insights
  const renderYearHeatmap = (year: number, insights: YearInsights, studyData: Record<string, number>, hasData: boolean) => {
    const monthsData = generateCalendarForYear(year, studyData);
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    return (
      <Card key={year} className={`p-2 sm:p-4 w-full ${!hasData ? 'opacity-80' : ''}`}>
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-green-600" />
            <h3 className="font-medium text-base">Study Activity - {year}</h3>
            {year === new Date().getFullYear() && (
              <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
                Current
              </span>
            )}
            {!hasData && (
              <span className="bg-gray-100 text-gray-500 text-[10px] px-2 py-0.5 rounded-full font-medium">
                No Data
              </span>
            )}
          </div>
        </div>

        {/* Pre-platform message for years with no data */}
        {!hasData && (
          <div className="mb-3 p-3 sm:p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-lg">
            <div className="flex items-start gap-2 sm:gap-3">
              <BookOpen className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-amber-800">You weren't on GoViSpire yet this year</p>
                <p className="text-xs text-amber-600 mt-0.5">Your offline preparation journey matters! Start tracking on GoViSpire to see your activity here. 💪</p>
              </div>
            </div>
          </div>
        )}

        {/* Calendar Container */}
        <div className="mb-3 overflow-x-auto">
          <div className="flex gap-1">
            {/* Weekday labels column */}
            <div className="flex flex-col flex-shrink-0">
              <div className="h-6 mb-1"></div>
              <div className="space-y-1">
                {dayLabels.map((day, idx) => (
                  <div key={idx} className={`w-3 h-3 flex items-center justify-center text-[10px] font-medium ${!hasData ? 'text-gray-300' : 'text-gray-500'}`}>
                    {day.charAt(0)}
                  </div>
                ))}
              </div>
            </div>

            {/* Calendar grid */}
            <div className="flex-1 min-w-0 overflow-x-auto -mx-1 px-1">
              <div className="flex gap-2 sm:gap-4 min-w-max pb-2">
                {monthsData.map((monthData, monthIndex) => (
                  <div key={monthIndex} className="flex flex-col flex-shrink-0">
                    <div className="h-6 mb-1 flex items-center justify-center">
                      <span className={`text-[10px] font-medium text-center whitespace-nowrap ${!hasData ? 'text-gray-400' : 'text-gray-700'}`}>
                        {monthData.monthName}
                      </span>
                    </div>

                    <div className="space-y-1">
                      {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                        <div key={dayIndex} className="flex gap-1">
                          {monthData.weeks.map((week, weekIndex) => {
                            const day = week[dayIndex];
                            if (!day) return <div key={weekIndex} className="w-3 h-3"></div>;

                            return viewType === 'heatmap'
                              ? renderHeatmapCell(day, `${year}-${monthIndex}-${weekIndex}-${dayIndex}`)
                              : renderCalendarCell(day, `${year}-${monthIndex}-${weekIndex}-${dayIndex}`);
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="text-xs font-medium text-gray-600">Less</div>
            <div className="w-3 h-3 rounded-sm bg-gray-100 border border-gray-200"></div>
            <div className="w-3 h-3 rounded-sm bg-green-100 border border-green-200"></div>
            <div className="w-3 h-3 rounded-sm bg-green-200 border border-green-300"></div>
            <div className="w-3 h-3 rounded-sm bg-green-400 border border-green-500"></div>
            <div className="w-3 h-3 rounded-sm bg-green-600 border border-green-700"></div>
            <div className="w-3 h-3 rounded-sm bg-pink-500 border border-pink-600"></div>
            <div className="text-xs font-medium text-gray-600">More</div>
          </div>
        </div>

        {/* Insights Panel - only show if there's data */}
        {hasData ? renderInsightsPanel(insights) : (
          <div className="mt-3 p-3 bg-gray-50 rounded-lg text-center">
            <p className="text-xs text-gray-400">Insights will appear once you have activity data for this year</p>
          </div>
        )}
      </Card>
    );
  };

  // ── Compute real dynamic stats from localStorage ────────────────────────
  const dynamicStats = useMemo(() => {
    let quizCompletions: Record<string, { completed: boolean; score: number; date: string; duration?: number; title?: string }> = {};
    let studentPresence: Record<string, boolean> = {};
    try {
      quizCompletions = JSON.parse(localStorage.getItem('quizCompletions') || '{}');
      studentPresence = JSON.parse(localStorage.getItem('studentPresence') || '{}');
    } catch { /* ignore */ }

    // ── Streak (consecutive days ending today or yesterday) ──
    const formatDate = (d: Date) => {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const today = new Date();
    const todayStr = formatDate(today);
    let streak = 0;
    let checkDate = new Date(today);
    if (!studentPresence[todayStr]) checkDate.setDate(checkDate.getDate() - 1);
    for (let i = 0; i < 365; i++) {
      if (studentPresence[formatDate(checkDate)]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else break;
    }

    // ── Total active days (all time) ──
    const totalActiveDays = Object.values(studentPresence).filter(Boolean).length;

    // ── Test history from quizCompletions ──
    const completedEntries = Object.entries(quizCompletions)
      .filter(([, v]) => v.completed)
      .sort((a, b) => new Date(b[1].date).getTime() - new Date(a[1].date).getTime());

    const totalTests = completedEntries.length;
    const scores = completedEntries.map(([, v]) => v.score).filter(s => s > 0);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    const currentMonthStr = formatDate(today).substring(0, 7); // 'yyyy-mm'
    const thisMonth = completedEntries.filter(([, v]) => v.date.substring(0, 7) === currentMonthStr).length;

    const recentTests = completedEntries.slice(0, 10).map(([id, v]) => ({
      id,
      name: v.title || id.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      date: v.date.substring(0, 10),
      score: v.score,
      total: 100,
    }));

    // ── Study hours from presence + quiz activity ──
    const studyDataToday = getRealStudyDataForYear(today.getFullYear());
    const totalMinutesAll = Object.values(studyDataToday).reduce((s, m) => s + m, 0);
    const totalHoursNum = Math.round(totalMinutesAll / 60 * 10) / 10;
    const hoursToday = Math.round((studyDataToday[todayStr] || 0) / 60 * 10) / 10;

    // This week (Mon-Sun)
    const weekStart = new Date(today);
    const dow = today.getDay();
    weekStart.setDate(today.getDate() - (dow === 0 ? 6 : dow - 1));
    let weekMinutes = 0;
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      weekMinutes += studyDataToday[formatDate(d)] || 0;
    }
    const hoursThisWeek = Math.round(weekMinutes / 60 * 10) / 10;

    // Monthly breakdown (current year)
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentYear = today.getFullYear();
    const monthlyBreakdown: { month: string; hours: number; days: number }[] = [];
    let maxMonthHours = 1;
    for (let month = 0; month <= today.getMonth(); month++) {
      let monthMinutes = 0; let activeDays = 0;
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate();
      for (let day = 1; day <= daysInMonth; day++) {
        const key = `${currentYear}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        const mins = studyDataToday[key] || 0;
        if (mins > 0) { monthMinutes += mins; activeDays++; }
      }
      const monthHours = Math.round(monthMinutes / 60 * 10) / 10;
      if (monthHours > maxMonthHours) maxMonthHours = monthHours;
      monthlyBreakdown.push({ month: `${monthNames[month]} ${currentYear}`, hours: monthHours, days: activeDays });
    }

    return { streak, totalActiveDays, totalTests, avgScore, thisMonth, recentTests, totalHoursNum, hoursToday, hoursThisWeek, monthlyBreakdown, maxMonthHours };
  }, [open]);

  // Streak badges — dynamically marked "achieved" based on real streak
  const streakBadges = [
    { name: 'Novice', days: 7, color: 'bg-gray-400', achieved: dynamicStats.streak >= 7 },
    { name: 'Learner', days: 14, color: 'bg-blue-400', achieved: dynamicStats.streak >= 14 },
    { name: 'Dedicated', days: 30, color: 'bg-green-400', achieved: dynamicStats.streak >= 30 },
    { name: 'Champion', days: 50, color: 'bg-purple-400', achieved: dynamicStats.streak >= 50 },
    { name: 'Maverick', days: 67, color: 'bg-orange-400', achieved: dynamicStats.streak >= 67 },
    { name: 'Legend', days: 100, color: 'bg-red-400', achieved: dynamicStats.streak >= 100 },
    { name: 'Master', days: 150, color: 'bg-yellow-400', achieved: dynamicStats.streak >= 150 },
  ];

  const nextBadge = streakBadges.find(b => !b.achieved);


  const renderContent = () => {
    switch (type) {
      case 'journey':
        const currentYear = new Date().getFullYear();
        // Dynamic year range: from prep start date to current year
        const startYear = preparationStartDate
          ? new Date(preparationStartDate).getFullYear()
          : currentYear;
        const years: number[] = [];
        for (let y = currentYear; y >= startYear; y--) years.push(y);
        // Ensure at least current year is shown
        if (years.length === 0) years.push(currentYear);

        // Calculate insights for all years using real data
        const yearStudyDataMap = years.map(year => {
          const studyData = getRealStudyDataForYear(year);
          const hasData = yearHasData(studyData);
          const insights = calculateYearInsights(year, studyData);
          return { year, studyData, hasData, insights };
        });

        const yearInsightsData = yearStudyDataMap.map(d => d.insights);

        return (
          <div className="space-y-4">
            {/* View Type Toggle */}
            <div className="flex flex-wrap justify-between items-center gap-2">
              {years.length > 1 && (
                <Button
                  variant={showComparison ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setShowComparison(!showComparison)}
                  className="px-3 py-1 h-7 text-xs"
                >
                  <BarChart className="h-3 w-3 mr-1" />
                  {showComparison ? 'Hide Comparison' : 'Compare Years'}
                </Button>
              )}

              <div className="flex rounded-md bg-gray-100 p-0.5">
                <Button
                  variant={viewType === 'heatmap' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('heatmap')}
                  className="px-2 py-1 h-7 text-xs"
                >
                  <Grid3X3 className="h-3 w-3 mr-1" />
                  Heatmap
                </Button>
                <Button
                  variant={viewType === 'calendar' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewType('calendar')}
                  className="px-2 py-1 h-7 text-xs"
                >
                  <Calendar className="h-3 w-3 mr-1" />
                  Calendar
                </Button>
              </div>
            </div>

            <ScrollArea className="h-[calc(78vh-100px)] sm:h-[calc(85vh-120px)]">
              <div className="space-y-4 sm:space-y-6 pr-2 sm:pr-4">
                {/* Comparison View - only for years with data */}
                {showComparison && renderComparisonView(yearInsightsData.filter((_, i) => yearStudyDataMap[i].hasData))}

                {/* Year Heatmaps with Insights */}
                {yearStudyDataMap.map((d) => renderYearHeatmap(d.year, d.insights, d.studyData, d.hasData))}
              </div>
            </ScrollArea>
          </div>
        );

      case 'active':
        return (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Your Active Days Streak</h3>
                <p className="text-sm text-gray-600">
                  Keep your streak going! Current streak: {dynamicStats.streak} {dynamicStats.streak === 1 ? 'day' : 'days'}
                </p>
              </div>

              <Card className="p-4 bg-gradient-to-r from-orange-400 to-red-400 text-white">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{dynamicStats.streak}</div>
                  <div className="text-sm">Current Streak</div>
                  <div className="mt-3 text-xs opacity-90">
                    {dynamicStats.streak >= 100 ? '🏆 Legendary! You are unstoppable!' :
                     dynamicStats.streak >= 50 ? '🔥 You\'re on fire! Keep it up!' :
                     dynamicStats.streak >= 14 ? '💪 Great momentum! Keep going!' :
                     dynamicStats.streak >= 7 ? '⭐ Nice streak! Don\'t break it!' :
                     dynamicStats.streak >= 1 ? '🌱 Great start! Build your habit!' :
                     '💡 Complete 2 quizzes today to start your streak!'}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-purple-600">{dynamicStats.streak}</div>
                  <div className="text-xs text-gray-600">Current Streak</div>
                </Card>
                <Card className="p-3 text-center">
                  <div className="text-2xl font-bold text-blue-600">{dynamicStats.totalActiveDays}</div>
                  <div className="text-xs text-gray-600">Total Active Days</div>
                </Card>
              </div>

              <div>
                <h4 className="font-semibold mb-4">Streak Badges</h4>
                <div className="grid grid-cols-2 gap-3">
                  {streakBadges.map((badge) => (
                    <Card
                      key={badge.name}
                      className={`p-4 ${badge.achieved ? 'opacity-100' : 'opacity-40'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${badge.color} rounded-full flex items-center justify-center`}>
                          <Award className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <div className="font-semibold">{badge.name}</div>
                          <div className="text-xs text-gray-600">{badge.days} days</div>
                          {badge.achieved && (
                            <div className="text-xs text-green-600 font-medium">✓ Achieved</div>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {nextBadge ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">Next Milestone</h4>
                  <p className="text-sm text-gray-600">
                    {nextBadge.name} Badge — {nextBadge.days - dynamicStats.streak} more {nextBadge.days - dynamicStats.streak === 1 ? 'day' : 'days'} to go!
                  </p>
                  <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-400 transition-all"
                      style={{ width: `${Math.min(100, Math.round((dynamicStats.streak / nextBadge.days) * 100))}%` }}
                    />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {dynamicStats.streak} / {nextBadge.days} days
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-2">🏆 All Badges Achieved!</h4>
                  <p className="text-sm text-gray-600">You are a true legend. Keep the streak alive!</p>
                </div>
              )}
            </div>
          </ScrollArea>
        );

      case 'tasks': {
        // Read today's goals from localStorage
        const getISTDateStr = () => {
          const now = new Date();
          const ist = new Date(now.getTime() + 5.5 * 60 * 60 * 1000);
          return `${ist.getUTCFullYear()}-${String(ist.getUTCMonth() + 1).padStart(2, '0')}-${String(ist.getUTCDate()).padStart(2, '0')}`;
        };
        let allGoals: any[] = [];
        try { allGoals = JSON.parse(localStorage.getItem('dailyGoals_v2') || '[]'); } catch { /* */ }
        const today = getISTDateStr();
        const todayGoals = allGoals.filter((g: any) => g.createdAt === today);
        const MAX = 5;
        const added = todayGoals.length;
        const completedGoals = todayGoals.filter((g: any) => g.status === 'completed');
        const pendingGoals = todayGoals.filter((g: any) => g.status !== 'completed');
        const completedCount = completedGoals.length;
        const pct = added === 0 ? 0 : Math.round((completedCount / added) * 100);
        const slotsLeft = MAX - added;

        // Last 7 days history
        const last7: { date: string; label: string; added: number; completed: number }[] = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(new Date().getTime() + 5.5 * 60 * 60 * 1000);
          d.setUTCDate(d.getUTCDate() - i);
          const key = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
          const dayGoals = allGoals.filter((g: any) => g.createdAt === key);
          last7.push({
            date: key,
            label: i === 0 ? 'Today' : ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][new Date(key).getDay()],
            added: dayGoals.length,
            completed: dayGoals.filter((g: any) => g.status === 'completed').length,
          });
        }

        return (
          <ScrollArea className="h-[580px] pr-2">
            <div className="space-y-5">

              {/* Hero summary card */}
              <div
                className="rounded-2xl p-5 text-white"
                style={{ background: pct === 100 ? 'linear-gradient(135deg,#059669,#10b981)' : 'linear-gradient(135deg,#d97706,#f59e0b)' }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-widest opacity-80 mb-1">Today's Tasks</div>
                    <div className="text-5xl font-extrabold" style={{ fontFamily: "'Outfit',sans-serif" }}>
                      {completedCount}<span className="text-3xl opacity-70">/{added}</span>
                    </div>
                    <div className="text-sm opacity-90 mt-1">
                      {added === 0 ? 'No tasks set yet today' : pct === 100 ? '🎉 All tasks done!' : `${pct}% complete · ${pendingGoals.length} remaining`}
                    </div>
                  </div>
                  {/* Ring */}
                  <div className="relative" style={{ width: 72, height: 72 }}>
                    <svg width={72} height={72} className="-rotate-90 absolute inset-0">
                      <circle cx={36} cy={36} r={30} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={6} />
                      <circle
                        cx={36} cy={36} r={30} fill="none" stroke="white"
                        strokeWidth={6} strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 30}
                        strokeDashoffset={2 * Math.PI * 30 * (1 - pct / 100)}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center text-white font-bold text-sm">{pct}%</div>
                  </div>
                </div>

                {/* 5 slot bar */}
                <div className="flex gap-1.5 mt-4">
                  {Array.from({ length: MAX }).map((_, i) => {
                    const isDone = i < completedCount;
                    const isUsed = i < added;
                    return (
                      <div key={i} className="flex-1 h-2 rounded-full"
                        style={{ background: isDone ? 'rgba(255,255,255,0.9)' : isUsed ? 'rgba(255,255,255,0.4)' : 'rgba(255,255,255,0.15)' }}
                      />
                    );
                  })}
                </div>
                <div className="text-[11px] opacity-70 mt-1.5">{MAX - added} slot{MAX - added !== 1 ? 's' : ''} remaining (max {MAX} per day)</div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-3">
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-2xl font-bold text-amber-600" style={{ fontFamily: "'Outfit',sans-serif" }}>{added}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Tasks Added</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-2xl font-bold text-emerald-600" style={{ fontFamily: "'Outfit',sans-serif" }}>{completedCount}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Completed</div>
                </Card>
                <Card className="p-3 text-center border-slate-200">
                  <div className="text-2xl font-bold text-slate-500" style={{ fontFamily: "'Outfit',sans-serif" }}>{slotsLeft}</div>
                  <div className="text-[11px] text-muted-foreground mt-0.5">Slots Left</div>
                </Card>
              </div>

              {/* Today's task list */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-2 flex items-center gap-2">
                  <ListChecks className="h-4 w-4 text-amber-500" />
                  Today's Task List
                </h4>
                {added === 0 ? (
                  <div className="flex flex-col items-center py-8 text-center text-muted-foreground">
                    <AlertCircle className="h-10 w-10 opacity-20 mb-3" />
                    <p className="text-sm font-medium">No tasks set for today</p>
                    <p className="text-xs mt-1">Go to Daily Goals to add your tasks</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {/* Completed */}
                    {completedGoals.map((g: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                        <span className="text-sm text-slate-600 line-through">{g.text || g.title || `Task ${i + 1}`}</span>
                        <span className="ml-auto text-[10px] font-semibold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full">Done</span>
                      </div>
                    ))}
                    {/* Pending */}
                    {pendingGoals.map((g: any, i: number) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-amber-50 border border-amber-100 rounded-xl">
                        <Circle className="h-4 w-4 text-amber-400 shrink-0" />
                        <span className="text-sm text-slate-700">{g.text || g.title || `Task ${completedCount + i + 1}`}</span>
                        <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">Pending</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 7-day history */}
              <div>
                <h4 className="font-semibold text-sm text-slate-700 mb-3 flex items-center gap-2">
                  <BarChart className="h-4 w-4 text-amber-500" />
                  Last 7 Days
                </h4>
                <div className="grid grid-cols-7 gap-1">
                  {last7.map((day, i) => {
                    const dayPct = day.added === 0 ? 0 : Math.round((day.completed / day.added) * 100);
                    const isToday = i === 6;
                    return (
                      <div key={i} className="flex flex-col items-center gap-1.5">
                        {/* Bar */}
                        <div className="relative w-full flex flex-col justify-end" style={{ height: 48 }}>
                          {day.added > 0 && (
                            <div
                              className="w-full rounded-t-sm"
                              style={{
                                height: `${Math.max(20, dayPct)}%`,
                                background: dayPct === 100 ? '#10b981' : dayPct > 0 ? '#f59e0b' : '#e2e8f0',
                              }}
                            />
                          )}
                          {day.added === 0 && (
                            <div className="w-full rounded-t-sm bg-slate-100" style={{ height: '20%' }} />
                          )}
                        </div>
                        {/* Label */}
                        <span className={`text-[9px] font-medium ${isToday ? 'text-amber-600 font-bold' : 'text-slate-400'}`}>
                          {day.label}
                        </span>
                        {/* Score */}
                        {day.added > 0 && (
                          <span className="text-[9px] text-slate-500">{day.completed}/{day.added}</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Tip */}
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <Target className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Pro tip</p>
                    <p className="text-xs text-amber-700 mt-0.5">You can add up to <strong>5 tasks</strong> per day in the Daily Goals section. Set them before 9 AM for best results!</p>
                  </div>
                </div>
              </div>

            </div>
          </ScrollArea>
        );
      }

      case 'tests':
        return (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <div className="bg-yellow-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Mock Test History</h3>
                <p className="text-sm text-gray-600">All your completed mock tests and their scores</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{dynamicStats.totalTests}</div>
                  <div className="text-xs text-gray-600">Total Tests</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {dynamicStats.totalTests > 0 ? `${dynamicStats.avgScore}%` : '—'}
                  </div>
                  <div className="text-xs text-gray-600">Avg Score</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{dynamicStats.thisMonth}</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Recent Tests</h4>
                {dynamicStats.recentTests.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileCheck className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No tests completed yet.</p>
                    <p className="text-xs mt-1">Complete daily quizzes to see your history here.</p>
                  </div>
                ) : (
                  dynamicStats.recentTests.map((test) => (
                    <Card key={test.id} className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{test.name}</div>
                          <div className="text-xs text-gray-600 mt-1">{test.date}</div>
                        </div>
                        <div className="text-right">
                          <div className={`text-lg font-bold ${
                            test.score >= 85 ? 'text-green-600' :
                            test.score >= 70 ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                            {test.score}/{test.total}
                          </div>
                          <div className="text-xs text-gray-600">{test.score}%</div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        );

      case 'hours':
        return (
          <ScrollArea className="h-[600px] pr-4">
            <div className="space-y-6">
              <div className="bg-cyan-50 p-4 rounded-lg">
                <h3 className="font-semibold text-lg mb-2">Study Hours Breakdown</h3>
                <p className="text-sm text-gray-600">Your accumulated study hours over time</p>
              </div>

              <Card className="p-4 bg-gradient-to-r from-cyan-400 to-blue-400 text-white">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">{dynamicStats.totalHoursNum}</div>
                  <div className="text-sm">Total Study Hours</div>
                  <div className="mt-3 text-xs opacity-90">
                    {dynamicStats.totalHoursNum > 0 ? `Since ${dynamicStats.monthlyBreakdown[0]?.month || 'start'}` : 'Start studying to track hours'}
                  </div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">{dynamicStats.hoursToday}</div>
                  <div className="text-xs text-gray-600">Hours Today</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{dynamicStats.hoursThisWeek}</div>
                  <div className="text-xs text-gray-600">Hours This Week</div>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Monthly Breakdown</h4>
                {dynamicStats.monthlyBreakdown.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-10 w-10 mx-auto mb-3 opacity-30" />
                    <p className="text-sm">No activity recorded yet.</p>
                  </div>
                ) : (
                  dynamicStats.monthlyBreakdown.map((data, idx) => (
                    <Card key={idx} className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{data.month}</div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-blue-600">{data.hours}h</div>
                          <div className="text-xs text-gray-600">{data.days} days active</div>
                        </div>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-400 transition-all"
                          style={{ width: `${dynamicStats.maxMonthHours > 0 ? Math.round((data.hours / dynamicStats.maxMonthHours) * 100) : 0}%` }}
                        />
                      </div>
                    </Card>
                  ))
                )}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Study Time Formula</h4>
                <ul className="text-xs text-gray-600 space-y-1">
                  <li>✅ Presence marked (2+ quizzes/day) = 2 hours base</li>
                  <li>📝 Each quiz completed = +30 minutes</li>
                </ul>
              </div>
            </div>
          </ScrollArea>
        );
    }
  };

  const titles: Record<string, string> = {
    journey: 'Total Journey Days',
    hours: 'Total Study Hours',
    active: 'Total Active Days',
    tests: 'Total Mock Tests',
    tasks: "Today's Tasks",
  };

  const icons: Record<string, React.ElementType> = {
    journey: Calendar,
    hours: Clock,
    active: Award,
    tests: FileCheck,
    tasks: ListChecks,
  };

  const Icon = icons[type] ?? ListChecks;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[calc(100%-1rem)] sm:w-[calc(100%-2rem)] md:max-w-3xl lg:max-w-4xl max-h-[calc(100vh-1rem)] sm:max-h-[calc(100vh-2rem)] p-3 sm:p-6 overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {titles[type]}
          </DialogTitle>
        </DialogHeader>
        {renderContent()}
      </DialogContent>
    </Dialog>
  );
};

export default StatCardDialog;
