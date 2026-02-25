import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import { Calendar, Award, FileCheck, Clock, BarChart, Grid3X3, TrendingUp, TrendingDown, Minus, Flame, Target, Zap, BookOpen } from 'lucide-react';
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
  type: 'journey' | 'hours' | 'active' | 'tests';
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

  // Streak badges data
  const streakBadges = [
    { name: 'Novice', days: 7, color: 'bg-gray-400', achieved: true },
    { name: 'Learner', days: 14, color: 'bg-blue-400', achieved: true },
    { name: 'Dedicated', days: 30, color: 'bg-green-400', achieved: true },
    { name: 'Champion', days: 50, color: 'bg-purple-400', achieved: true },
    { name: 'Maverick', days: 67, color: 'bg-orange-400', achieved: true },
    { name: 'Legend', days: 100, color: 'bg-red-400', achieved: false },
    { name: 'Master', days: 150, color: 'bg-yellow-400', achieved: false },
  ];

  // Mock test history data
  const mockTestHistory = [
    { id: 1, name: 'IBPS PO Prelims Mock Test 1', date: '2025-04-28', score: 85, total: 100 },
    { id: 2, name: 'SSC CGL General Awareness', date: '2025-04-26', score: 72, total: 100 },
    { id: 3, name: 'Banking Awareness Quiz', date: '2025-04-25', score: 90, total: 100 },
    { id: 4, name: 'Quantitative Aptitude Test', date: '2025-04-23', score: 78, total: 100 },
    { id: 5, name: 'English Comprehension', date: '2025-04-20', score: 88, total: 100 },
    { id: 6, name: 'Reasoning Section Test', date: '2025-04-18', score: 82, total: 100 },
    { id: 7, name: 'Current Affairs Weekly', date: '2025-04-15', score: 95, total: 100 },
    { id: 8, name: 'IBPS PO Mains Mock', date: '2025-04-12', score: 80, total: 100 },
  ];

  // Study hours breakdown
  const studyHoursData = [
    { month: 'Jan 2025', hours: 45, days: 20 },
    { month: 'Feb 2025', hours: 52, days: 22 },
    { month: 'Mar 2025', hours: 48, days: 19 },
    { month: 'Apr 2025', hours: 38, days: 15 },
    { month: 'May 2025', hours: 12, days: 5 },
  ];

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
                <p className="text-sm text-gray-600">Keep your streak going! Current streak: 67 days</p>
              </div>

              <Card className="p-4 bg-gradient-to-r from-orange-400 to-red-400 text-white">
                <div className="text-center">
                  <div className="text-5xl font-bold mb-2">67</div>
                  <div className="text-sm">Current Streak</div>
                  <div className="mt-3 text-xs opacity-90">🔥 You're on fire! Keep it up!</div>
                </div>
              </Card>

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

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Next Milestone</h4>
                <p className="text-sm text-gray-600">Legend Badge - 33 days to go!</p>
                <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div className="h-full bg-orange-400" style={{ width: '67%' }} />
                </div>
              </div>
            </div>
          </ScrollArea>
        );

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
                  <div className="text-2xl font-bold text-gray-900">40</div>
                  <div className="text-xs text-gray-600">Total Tests</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">83%</div>
                  <div className="text-xs text-gray-600">Avg Score</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">32</div>
                  <div className="text-xs text-gray-600">This Month</div>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Recent Tests</h4>
                {mockTestHistory.map((test) => (
                  <Card key={test.id} className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{test.name}</div>
                        <div className="text-xs text-gray-600 mt-1">{test.date}</div>
                      </div>
                      <div className="text-right">
                        <div className={`text-lg font-bold ${test.score >= 85 ? 'text-green-600' :
                          test.score >= 70 ? 'text-blue-600' :
                            'text-orange-600'
                          }`}>
                          {test.score}/{test.total}
                        </div>
                        <div className="text-xs text-gray-600">{test.score}%</div>
                      </div>
                    </div>
                  </Card>
                ))}
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
                  <div className="text-5xl font-bold mb-2">195</div>
                  <div className="text-sm">Total Study Hours</div>
                  <div className="mt-3 text-xs opacity-90">Since January 2025</div>
                </div>
              </Card>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-gray-900">6.2</div>
                  <div className="text-xs text-gray-600">Hours Today</div>
                </Card>
                <Card className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">38</div>
                  <div className="text-xs text-gray-600">Hours This Week</div>
                </Card>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold">Monthly Breakdown</h4>
                {studyHoursData.map((data, idx) => (
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
                        className="h-full bg-blue-400"
                        style={{ width: `${(data.hours / 52) * 100}%` }}
                      />
                    </div>
                  </Card>
                ))}
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-semibold mb-2">Average Study Time</h4>
                <div className="text-2xl font-bold text-gray-900">3.2 hours/day</div>
                <p className="text-xs text-gray-600 mt-1">Based on active days</p>
              </div>
            </div>
          </ScrollArea>
        );
    }
  };

  const titles = {
    journey: 'Total Journey Days',
    hours: 'Total Study Hours',
    active: 'Total Active Days',
    tests: 'Total Mock Tests'
  };

  const icons = {
    journey: Calendar,
    hours: Clock,
    active: Award,
    tests: FileCheck
  };

  const Icon = icons[type];

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
