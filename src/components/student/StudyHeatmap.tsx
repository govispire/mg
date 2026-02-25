import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { addDays, format, startOfWeek, subWeeks, subYears, startOfMonth, startOfYear } from 'date-fns';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { BarChart, Info, Calendar, Grid3X3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { useIsMobile } from '@/hooks/use-mobile';

interface StudyHeatmapProps {
  className?: string;
  title?: string;
}

type ViewType = 'heatmap' | 'calendar';
type TimeRange = '6months' | '1year';

// Generate sample study data for the past year
const generateStudyData = () => {
  const data: Record<string, number> = {};
  const today = new Date();

  for (let i = 0; i < 365; i++) {
    const date = subYears(today, 1).getTime() + (i * 24 * 60 * 60 * 1000);
    const formattedDate = format(date, 'yyyy-MM-dd');

    // Random minutes between 0 and 600 (10 hours)
    const random = Math.random();
    let minutes = 0;

    if (random > 0.9) {
      minutes = Math.floor(Math.random() * 120) + 600; // 10+ hours (Outstanding)
    } else if (random > 0.75) {
      minutes = Math.floor(Math.random() * 300) + 300; // 5-10 hours (Excellent)
    } else if (random > 0.5) {
      minutes = Math.floor(Math.random() * 120) + 240; // 4-5 hours (Good)
    } else if (random > 0.3) {
      minutes = Math.floor(Math.random() * 120) + 120; // 2-4 hours (Moderate)
    } else if (random > 0.1) {
      minutes = Math.floor(Math.random() * 120); // <2 hours (Light)
    }

    data[formattedDate] = minutes;
  }

  return data;
};

const StudyHeatmap: React.FC<StudyHeatmapProps> = ({ className, title }) => {
  const [studyData] = useState(generateStudyData());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<TimeRange>('6months');
  const [viewType, setViewType] = useState<ViewType>('heatmap');
  const isMobile = useIsMobile();

  // Get the intensity color based on study minutes
  const getColor = (minutes: number): string => {
    if (minutes === 0) return 'bg-gray-100 dark:bg-gray-800 border border-gray-200';
    if (minutes < 120) return 'bg-green-100 dark:bg-green-900/30 border border-green-200'; // Light
    if (minutes < 240) return 'bg-green-200 dark:bg-green-800/50 border border-green-300'; // Moderate
    if (minutes < 300) return 'bg-green-400 dark:bg-green-700/70 border border-green-500'; // Good
    if (minutes < 600) return 'bg-green-600 dark:bg-green-600 border border-green-700'; // Excellent
    return 'bg-pink-500 dark:bg-pink-600 border border-pink-600'; // Outstanding
  };

  // Format minutes to hours and minutes
  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (hours === 0) return `${mins} minutes`;
    if (mins === 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
    return `${hours}h ${mins}m`;
  };

  // Generate the calendar grid for different views
  const generateCalendar = (view: '6months' | '1year') => {
    const months = [];
    const today = new Date();

    if (view === '1year') {
      // For year view: Show January to December of current year
      const currentYear = today.getFullYear();

      for (let month = 0; month < 12; month++) {
        const monthStart = new Date(currentYear, month, 1);
        const monthEnd = new Date(currentYear, month + 1, 0);

        const weeks = [];
        let currentDate = startOfWeek(monthStart, { weekStartsOn: 1 });

        // Generate weeks for this month
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

          // Break if we've gone past the month and have at least one week
          if (currentDate > monthEnd && weeks.length > 0) break;
        }

        months.push({
          monthName: format(monthStart, 'MMM'),
          fullMonthName: format(monthStart, 'MMMM yyyy'),
          weeks
        });
      }
    } else {
      // For 6 months view: Show last 6 months
      for (let monthOffset = 5; monthOffset >= 0; monthOffset--) {
        const monthStart = new Date(today.getFullYear(), today.getMonth() - monthOffset, 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() - monthOffset + 1, 0);

        const weeks = [];
        let currentDate = startOfWeek(monthStart, { weekStartsOn: 1 });

        // Generate weeks for this month
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

          // Break if we've gone past the month and have at least one week
          if (currentDate > monthEnd && weeks.length > 0) break;
        }

        months.push({
          monthName: format(monthStart, 'MMM'),
          fullMonthName: format(monthStart, 'MMMM yyyy'),
          weeks
        });
      }
    }

    return months;
  };

  const monthsData = generateCalendar(currentView);

  // Get day labels (responsive)
  const getDayLabels = () => {
    const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return isMobile ? labels.map(label => label.charAt(0)) : labels;
  };

  const dayLabels = getDayLabels();

  // Calculate statistics
  const allDays = monthsData.flatMap(month => month.weeks.flatMap(week => week));
  const studyDays = allDays.filter(day => day.minutes > 0 && day.isCurrentMonth).length;
  const totalHours = allDays.filter(day => day.isCurrentMonth).reduce((sum, day) => sum + day.minutes, 0) / 60;
  const averagePerDay = totalHours / allDays.filter(day => day.isCurrentMonth).length;

  // Updated cell size function - use same compact sizing for both views
  const getCellSize = () => {
    if (isMobile) {
      return "w-3 h-3"; // Consistent compact size for mobile
    } else {
      return currentView === '1year' ? "w-3 h-3" : "w-4 h-4"; // Consistent compact size for desktop
    }
  };

  // Get gap size based on view and screen size
  const getGapSize = () => {
    return "gap-1"; // Consistent gap
  };

  // Get month gap size
  const getMonthGapSize = () => {
    return "gap-4"; // Consistent spacing
  };

  // Render heatmap cell (original GitHub-style)
  const renderHeatmapCell = (day: any, monthIndex: number, weekIndex: number, dayIndex: number) => (
    <TooltipProvider key={`${monthIndex}-${weekIndex}-${dayIndex}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${getCellSize()} rounded-sm cursor-pointer transition-all
              ${day.isCurrentMonth
                ? `${getColor(day.minutes)} hover:ring-1 hover:ring-blue-400`
                : 'bg-transparent'
              }
              ${day.isToday ? 'ring-1 ring-blue-500' : ''}
            `}
            onClick={() => day.isCurrentMonth && setSelectedDate(day.dateKey)}
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

  // Render calendar cell with compact sizing and proper text scaling
  const renderCalendarCell = (day: any, monthIndex: number, weekIndex: number, dayIndex: number) => (
    <TooltipProvider key={`${monthIndex}-${weekIndex}-${dayIndex}`}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className={`${getCellSize()} rounded-sm cursor-pointer transition-all flex items-center justify-center border
              ${day.isCurrentMonth
                ? `${getColor(day.minutes)} hover:ring-1 hover:ring-blue-400`
                : 'bg-transparent text-gray-300'
              }
              ${day.isToday ? 'ring-1 ring-blue-500' : ''}
              ${day.minutes > 0 ? 'text-white font-bold' : 'text-gray-700'}
              text-[10px] leading-none
            `}
            style={{ fontSize: isMobile ? '8px' : '10px' }}
            onClick={() => day.isCurrentMonth && setSelectedDate(day.dateKey)}
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

  return (
    <Card className={`p-3 sm:p-4 hover:shadow-md transition-shadow w-full ${className}`}>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
        <div className="flex items-center gap-2">
          <BarChart className="h-4 w-4 text-green-600" />
          <h3 className="font-medium text-sm sm:text-base">{title || "Study Activity - 2025"}</h3>
          <span className="bg-blue-100 text-blue-800 text-[10px] px-2 py-0.5 rounded-full font-medium">
            Current
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* View Type Toggle */}
          <div className="flex rounded-md bg-gray-100 p-0.5">
            <Button
              variant={viewType === 'heatmap' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('heatmap')}
              className="px-2 py-1 h-6 text-[10px]"
            >
              <Grid3X3 className="h-3 w-3 mr-1" />
              Heatmap
            </Button>
            <Button
              variant={viewType === 'calendar' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewType('calendar')}
              className="px-2 py-1 h-6 text-[10px]"
            >
              <Calendar className="h-3 w-3 mr-1" />
              Calendar
            </Button>
          </div>

          {/* Time Range Toggle */}
          <Tabs value={currentView} onValueChange={(value) => setCurrentView(value as TimeRange)}>
            <TabsList className="grid w-fit grid-cols-2 h-6">
              <TabsTrigger value="6months" className="text-[10px] px-2 py-0.5">6M</TabsTrigger>
              <TabsTrigger value="1year" className="text-[10px] px-2 py-0.5">1Y</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Statistics */}
      <div className="flex gap-3 sm:gap-4 mb-3 text-[10px] sm:text-xs">
        <div>
          <span className="text-gray-600 font-medium">{studyDays}</span>
          <span className="ml-1 text-gray-500">study days</span>
        </div>
        <div>
          <span className="text-gray-600 font-medium">{totalHours.toFixed(1)}h</span>
          <span className="ml-1 text-gray-500">total</span>
        </div>
        <div>
          <span className="text-gray-600 font-medium">{averagePerDay.toFixed(1)}h</span>
          <span className="ml-1 text-gray-500">avg/day</span>
        </div>
      </div>

      {/* Calendar Container - Properly Contained */}
      <div className="mb-3 overflow-hidden">
        <div className="flex gap-1">
          {/* Weekday labels column */}
          <div className="flex flex-col flex-shrink-0">
            {/* Spacer for month row */}
            <div className="h-6 mb-1"></div>
            {/* Weekday labels */}
            <div className="space-y-1">
              {dayLabels.map((day, idx) => (
                <div key={idx} className={`${getCellSize()} flex items-center justify-center text-[10px] text-gray-500 font-medium`}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          {/* Calendar grid with proper sizing */}
          <div className="flex-1 min-w-0 overflow-x-auto">
            <div className={`flex ${getMonthGapSize()} min-w-max pb-2`}>
              {monthsData.map((monthData, monthIndex) => (
                <div key={monthIndex} className="flex flex-col flex-shrink-0">
                  {/* Month label */}
                  <div className="h-6 mb-1 flex items-center justify-center">
                    <span className="text-[10px] font-medium text-gray-700 text-center whitespace-nowrap">
                      {monthData.monthName}
                    </span>
                  </div>

                  {/* Month calendar grid */}
                  <div className="space-y-1">
                    {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                      <div key={dayIndex} className={`flex ${getGapSize()}`}>
                        {monthData.weeks.map((week, weekIndex) => {
                          const day = week[dayIndex];
                          if (!day) return <div key={weekIndex} className={getCellSize()}></div>;

                          return viewType === 'heatmap'
                            ? renderHeatmapCell(day, monthIndex, weekIndex, dayIndex)
                            : renderCalendarCell(day, monthIndex, weekIndex, dayIndex);
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

      {/* Time range labels */}
      <div className="flex justify-between items-center text-xs text-gray-500 mb-3 sm:mb-4">
        <span>
          {currentView === '6months' && '6 months ago'}
          {currentView === '1year' && 'Jan'}
        </span>
        <span>
          {currentView === '6months' && 'Today'}
          {currentView === '1year' && 'Dec'}
        </span>
      </div>

      {/* Legend with info dialog */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 sm:gap-2">
          <div className="text-xs font-medium text-gray-600">Less</div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-gray-100 dark:bg-gray-800 border border-gray-200"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-100 dark:bg-green-900/30 border border-green-200"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-200 dark:bg-green-800/50 border border-green-300"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-400 dark:bg-green-700/70 border border-green-500"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-green-600 dark:bg-green-600 border border-green-700"></div>
          <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-sm bg-pink-500 dark:bg-pink-600 border border-pink-600"></div>
          <div className="text-xs font-medium text-gray-600">More</div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="ghost" size="sm" className="p-1 h-6 w-6 sm:h-7 sm:w-7">
              <Info className="h-3 w-3 sm:h-4 sm:w-4 text-gray-500" />
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Study Intensity Color Guide</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-gray-100 border border-gray-200"></div>
                <div>
                  <div className="font-medium">0h</div>
                  <div className="text-sm text-gray-600">No study activity</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-green-100 border border-green-200"></div>
                <div>
                  <div className="font-medium">&lt; 2h</div>
                  <div className="text-sm text-gray-600">Light study session</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-green-200 border border-green-300"></div>
                <div>
                  <div className="font-medium">2-4h</div>
                  <div className="text-sm text-gray-600">Moderate study session</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-green-400 border border-green-500"></div>
                <div>
                  <div className="font-medium">4-5h</div>
                  <div className="text-sm text-gray-600">Good study session</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-green-600 border border-green-700"></div>
                <div>
                  <div className="font-medium">5-10h</div>
                  <div className="text-sm text-gray-600">Excellent study session</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 rounded-sm bg-pink-500 border border-pink-600"></div>
                <div>
                  <div className="font-medium">10h+</div>
                  <div className="text-sm text-gray-600">Outstanding study session</div>
                </div>
              </div>
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <div className="flex items-start gap-2">
                  <Info className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <strong>Tip:</strong> Consistent moderate study (2-4h) often leads to better retention than sporadic intense sessions.
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Selected day details */}
      {selectedDate && (
        <div className="mt-3 sm:mt-6 p-3 sm:p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="flex justify-between items-center mb-3">
            <div className="text-sm sm:text-base font-medium">
              {format(new Date(selectedDate), 'EEEE, MMMM d, yyyy')}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedDate(null)}
              className="text-xs"
            >
              Close
            </Button>
          </div>

          <div className="p-3 bg-white dark:bg-gray-900 rounded-md shadow-sm">
            <div className="text-base sm:text-lg font-semibold mb-2">
              Study Time
            </div>
            {studyData[selectedDate] > 0 ? (
              <div>
                <div className="text-xl sm:text-3xl font-bold text-green-600 dark:text-green-500">
                  {formatTime(studyData[selectedDate])}
                </div>
                <div className="mt-1 text-sm text-gray-500">
                  {(studyData[selectedDate] / 60).toFixed(1)} hours
                </div>
              </div>
            ) : (
              <div className="text-base sm:text-lg text-gray-500">No study time recorded</div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default StudyHeatmap;
