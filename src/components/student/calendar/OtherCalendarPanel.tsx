
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Plus, Calendar as CalendarIcon, Users } from 'lucide-react';

interface OtherCalendarEvent {
  id: number;
  title: string;
  isChecked: boolean;
}

interface OtherCalendarPanelProps {
  events: OtherCalendarEvent[];
  onToggleEvent: (id: number) => void;
  onAddTask: () => void;
}

const OtherCalendarPanel: React.FC<OtherCalendarPanelProps> = ({
  events,
  onToggleEvent,
  onAddTask
}) => {
  return (
    <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl border-purple-100 dark:border-gray-700 transition-all hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <Users className="h-5 w-5 mr-2 text-purple-500" />
          Other Calendars
        </h3>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-7 w-7 rounded-full bg-purple-100 hover:bg-purple-200 dark:bg-gray-700 dark:hover:bg-gray-600"
          onClick={onAddTask}
        >
          <Plus size={16} className="text-purple-600 dark:text-purple-300" />
        </Button>
      </div>
      
      <div className="space-y-2">
        {events.map(event => (
          <div 
            key={event.id}
            className="group flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-all cursor-pointer"
            onClick={() => onToggleEvent(event.id)}
          >
            <div 
              className={`flex-shrink-0 h-5 w-5 rounded-full transition-colors ${
                event.isChecked 
                  ? 'bg-purple-500 hover:bg-purple-600' 
                  : 'border-2 border-gray-300 dark:border-gray-600 group-hover:border-purple-500'
              } flex items-center justify-center`}
            >
              {event.isChecked && <Check size={12} className="text-white" />}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-purple-600 dark:group-hover:text-purple-300 transition-colors">
              {event.title}
            </span>
          </div>
        ))}
      </div>
      
      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">Shared calendars</span>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs border-dashed border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-gray-700"
        >
          <Plus className="h-3 w-3 mr-1" />
          Add Calendar
        </Button>
      </div>
    </Card>
  );
};

export default OtherCalendarPanel;
