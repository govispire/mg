
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { CalendarDay, CalendarEvent, eventCategories } from './types';
import { DayContextMenu } from './DayContextMenu';
import { Image as ImageIcon } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface CalendarGridProps {
  days: CalendarDay[];
  selectedDate: Date | null;
  onDateSelect: (date: Date) => void;
  onAddEvent: (date: Date) => void;
  onAddImage: (date: Date) => void;
  onViewDay: (date: Date) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  days,
  selectedDate,
  onDateSelect,
  onAddEvent,
  onAddImage,
  onViewDay
}) => {
  const isMobile = useIsMobile();

  const getCategoryColor = (category: string): string => {
    // Find color from eventCategories first
    const categoryDef = eventCategories.find(cat => cat.value === category);
    if (categoryDef) {
      return categoryDef.color;
    }
    
    // Enhanced fallback colors for better visual distinction
    const fallbackColors: Record<string, string> = {
      study: 'bg-blue-500',
      test: 'bg-emerald-500',
      discussion: 'bg-purple-500',
      homework: 'bg-orange-500',
      preparation: 'bg-pink-500',
      assignment: 'bg-yellow-500',
      'test-prep': 'bg-red-500',
      practice: 'bg-green-500',
      meeting: 'bg-violet-500',
      deadline: 'bg-rose-500',
      announcement: 'bg-amber-500',
      reminder: 'bg-lime-500'
    };
    
    return fallbackColors[category] || 'bg-gray-500';
  };

  const getDayClasses = (day: CalendarDay): string => {
    const baseClasses = `
      ${isMobile ? 'min-h-[70px]' : 'min-h-[90px]'}
      border border-gray-200 p-1 sm:p-2 cursor-pointer hover:bg-blue-50 transition-all duration-200
      ${!day.isCurrentMonth ? 'opacity-50' : ''}
      ${day.isToday ? 'bg-blue-50 border-blue-300 shadow-sm' : ''}
      ${selectedDate && isSameDay(day.date, selectedDate) ? 'ring-2 ring-blue-500 bg-blue-100' : ''}
      hover:shadow-sm hover:border-blue-300
    `;
    return baseClasses.trim();
  };

  const getVisibleEvents = (events: CalendarEvent[]): CalendarEvent[] => {
    const maxEvents = isMobile ? 1 : 2;
    return events.slice(0, maxEvents);
  };

  const getOverflowCount = (events: CalendarEvent[]): number => {
    const maxEvents = isMobile ? 1 : 2;
    return Math.max(0, events.length - maxEvents);
  };

  const hasImages = (events: CalendarEvent[]): boolean => {
    return events.some(event => event.images && event.images.length > 0);
  };

  // Handle direct day click to add task
  const handleDayClick = (day: CalendarDay, e: React.MouseEvent) => {
    e.preventDefault();
    onDateSelect(day.date); // This now directly opens the task creation dialog
  };

  // Handle right click for context menu
  const handleRightClick = (day: CalendarDay, e: React.MouseEvent) => {
    e.preventDefault();
    // Context menu will be handled by DayContextMenu component
  };

  return (
    <div className="grid grid-cols-7 border-l border-t border-gray-200">
      {/* Day Headers */}
      {(isMobile ? ['S', 'M', 'T', 'W', 'T', 'F', 'S'] : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((day, index) => (
        <div key={index} className="bg-gray-50 p-2 text-center font-medium text-sm border-r border-b border-gray-200">
          {day}
        </div>
      ))}

      {/* Calendar Days */}
      {days.map((day, index) => (
        <DayContextMenu
          key={index}
          onAddTask={() => onAddEvent(day.date)}
          onAddImage={() => onAddImage(day.date)}
          onViewDay={() => onViewDay(day.date)}
        >
          <div
            className={getDayClasses(day)}
            onClick={(e) => handleDayClick(day, e)}
            onContextMenu={(e) => handleRightClick(day, e)}
            title={`Click to add task for ${format(day.date, 'MMMM d, yyyy')}`}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${
                day.isToday ? 'font-bold text-blue-600' : 
                day.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
              }`}>
                {format(day.date, 'd')}
              </span>
              <div className="flex items-center gap-1">
                {day.events.length > 0 && (
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse" />
                )}
                {hasImages(day.events) && (
                  <ImageIcon className="w-3 h-3 text-gray-400" />
                )}
              </div>
            </div>

            <div className="space-y-1">
              {getVisibleEvents(day.events).map((event) => (
                <div
                  key={event.id}
                  className={`text-xs p-1 rounded text-white truncate ${getCategoryColor(event.category)} ${
                    event.completed ? 'opacity-60 line-through' : ''
                  } hover:opacity-80 transition-opacity`}
                  title={`${event.title} - ${event.category} (${event.priority} priority)`}
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent day click when clicking on event
                    onViewDay(day.date); // Open day detail dialog when clicking on event
                  }}
                >
                  {event.title}
                </div>
              ))}
              
              {getOverflowCount(day.events) > 0 && (
                <div 
                  className="text-xs text-blue-600 font-medium cursor-pointer hover:underline hover:text-blue-700"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDay(day.date);
                  }}
                >
                  +{getOverflowCount(day.events)} more
                </div>
              )}
            </div>
          </div>
        </DayContextMenu>
      ))}
    </div>
  );
};
