
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface CalendarHeaderProps {
  onAddTask: () => void;
  strict: boolean;
  toggleStrictMode: () => void;
}

const CalendarHeader: React.FC<CalendarHeaderProps> = ({ 
  onAddTask, 
  strict, 
  toggleStrictMode 
}) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
      <div>
        <h1 className="text-2xl font-bold">Study Calendar</h1>
        <p className="text-gray-500">Manage your study sessions and test schedules</p>
      </div>
      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
        <Button 
          onClick={onAddTask} 
          className="w-full sm:w-auto transition-transform hover:scale-105"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
        <Button 
          variant={strict ? "destructive" : "outline"} 
          onClick={toggleStrictMode}
          className="w-full sm:w-auto transition-colors"
        >
          {strict ? "Disable Strict Mode" : "Enable Strict Mode"}
        </Button>
      </div>
    </div>
  );
};

export default CalendarHeader;
