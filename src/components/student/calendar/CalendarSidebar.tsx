
import React from 'react';
import { format, isSameDay, isToday } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { CalendarEvent, eventCategories, UserRole } from './types';

interface CalendarSidebarProps {
  selectedDate: Date | null;
  onDateSelect: (date: Date | null) => void;
  eventFilters: string[];
  onFilterChange: (filters: string[]) => void;
  todayEvents: CalendarEvent[];
  onToggleTask: (eventId: string) => void;
  userRole?: UserRole;
}

export const CalendarSidebar: React.FC<CalendarSidebarProps> = ({
  selectedDate,
  onDateSelect,
  eventFilters,
  onFilterChange,
  todayEvents,
  onToggleTask,
  userRole = 'student'
}) => {
  // Filter categories based on user role
  const availableCategories = eventCategories.filter(cat => 
    cat.roles.includes(userRole)
  );

  const handleFilterChange = (category: string, checked: boolean) => {
    if (checked) {
      if (category === 'all') {
        onFilterChange(['all']);
      } else {
        const newFilters = eventFilters.filter(f => f !== 'all');
        onFilterChange([...newFilters, category]);
      }
    } else {
      if (category === 'all') {
        onFilterChange([]);
      } else {
        onFilterChange(eventFilters.filter(f => f !== category));
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Event Filters */}
      <div>
        <h3 className="font-semibold mb-3 text-gray-900">Filter Events</h3>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="filter-all"
              checked={eventFilters.includes('all')}
              onCheckedChange={(checked) => handleFilterChange('all', checked as boolean)}
            />
            <label htmlFor="filter-all" className="text-sm font-medium">
              All Events
            </label>
          </div>
          
          {availableCategories.map((category) => (
            <div key={category.value} className="flex items-center space-x-2">
              <Checkbox
                id={`filter-${category.value}`}
                checked={eventFilters.includes(category.value)}
                onCheckedChange={(checked) => handleFilterChange(category.value, checked as boolean)}
              />
              <label htmlFor={`filter-${category.value}`} className="text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${category.color}`} />
                  {category.label}
                </div>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Today's Events */}
      {selectedDate && (
        <div>
          <h3 className="font-semibold mb-3 text-gray-900">
            {isToday(selectedDate) ? "Today's Events" : `Events for ${format(selectedDate, 'MMM d')}`}
          </h3>
          <div className="space-y-2">
            {todayEvents.length === 0 ? (
              <p className="text-sm text-gray-500">No events for this date</p>
            ) : (
              todayEvents.map((event) => (
                <div
                  key={event.id}
                  className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <div className={`w-2 h-2 rounded-full ${
                          eventCategories.find(cat => cat.value === event.category)?.color || 'bg-gray-400'
                        }`} />
                        <span className={`text-sm font-medium truncate ${
                          event.completed ? 'line-through text-gray-500' : ''
                        }`}>
                          {event.title}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 mb-1">{event.time}</p>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${
                          event.priority === 'urgent' ? 'border-red-300 text-red-700' :
                          event.priority === 'high' ? 'border-orange-300 text-orange-700' :
                          event.priority === 'medium' ? 'border-yellow-300 text-yellow-700' :
                          'border-green-300 text-green-700'
                        }`}
                      >
                        {event.priority}
                      </Badge>
                    </div>
                    <Checkbox
                      checked={event.completed}
                      onCheckedChange={() => onToggleTask(event.id)}
                      className="mt-0.5"
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
