
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { format, isAfter, addDays } from 'date-fns';
import { Calendar } from 'lucide-react';

interface UpcomingEventsProps {
  searchQuery: string;
}

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ searchQuery }) => {
  const { tasks } = useTasks();
  const now = new Date();
  
  // Get upcoming events (tasks that have due dates in the future)
  const upcomingEvents = tasks
    .filter(task => 
      // Has a due date in the future and matches search
      task.dueDate && 
      isAfter(new Date(task.dueDate), now) &&
      task.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 10); // Get only next 10 events
  
  // Group events by date
  const groupedEvents: Record<string, typeof upcomingEvents> = {};
  
  upcomingEvents.forEach(event => {
    const date = format(new Date(event.dueDate!), 'yyyy-MM-dd');
    if (!groupedEvents[date]) {
      groupedEvents[date] = [];
    }
    groupedEvents[date].push(event);
  });
  
  // Get friendly date labels
  const getDateLabel = (dateString: string): string => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = addDays(today, 1);
    
    if (format(date, 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd')) {
      return 'Today';
    } else if (format(date, 'yyyy-MM-dd') === format(tomorrow, 'yyyy-MM-dd')) {
      return 'Tomorrow';
    } else {
      return format(date, 'EEEE, MMM d');
    }
  };
  
  if (upcomingEvents.length === 0) {
    return (
      <div className="p-8 text-center">
        <Calendar className="h-8 w-8 mx-auto text-gray-300 mb-2" />
        <p className="text-gray-500">No upcoming events</p>
        <p className="text-sm text-gray-400 mt-1">Create a task with a future date to see it here</p>
      </div>
    );
  }
  
  const getCategoryColor = (category: string): string => {
    switch (category) {
      case 'study': return 'bg-blue-500';
      case 'practice': return 'bg-green-500';
      case 'revision': return 'bg-yellow-500';
      case 'exams': return 'bg-red-500';
      case 'important': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };
  
  return (
    <div className="space-y-6 px-2">
      {Object.keys(groupedEvents).map(date => (
        <div key={date} className="space-y-2">
          <h3 className="font-medium text-gray-700">{getDateLabel(date)}</h3>
          
          {groupedEvents[date].map(event => (
            <div key={event.id} className="flex items-center gap-3 p-3 rounded-md border">
              <div className={`w-1 self-stretch rounded-full ${getCategoryColor(event.category)}`}></div>
              <div className="flex-1">
                <p className="font-medium">{event.title}</p>
                <p className="text-xs text-gray-500">
                  {format(new Date(event.dueDate!), 'h:mm a')}
                </p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};
