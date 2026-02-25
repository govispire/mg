
import React from 'react';
import { 
  Calendar as CalendarIcon, 
  Clock,
  Table,
  Plus 
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface CalendarSideNavProps {
  activeView: 'daily' | 'weekly' | 'monthly';
  onChangeView: (view: 'daily' | 'weekly' | 'monthly') => void;
  onAddTask: () => void;
}

const CalendarSideNav: React.FC<CalendarSideNavProps> = ({ 
  activeView, 
  onChangeView,
  onAddTask
}) => {
  return (
    <div className="flex flex-col p-2 gap-2 bg-white rounded-lg shadow-sm">
      <Button 
        variant={activeView === 'daily' ? 'default' : 'outline'} 
        size="icon" 
        className="h-9 w-9 rounded-full"
        onClick={() => onChangeView('daily')}
        title="Daily View"
      >
        <Clock size={18} />
      </Button>
      <Button 
        variant={activeView === 'weekly' ? 'default' : 'outline'} 
        size="icon" 
        className="h-9 w-9 rounded-full"
        onClick={() => onChangeView('weekly')}
        title="Weekly View"
      >
        <Table size={18} />
      </Button>
      <Button 
        variant={activeView === 'monthly' ? 'default' : 'outline'} 
        size="icon" 
        className="h-9 w-9 rounded-full"
        onClick={() => onChangeView('monthly')}
        title="Monthly View"
      >
        <CalendarIcon size={18} />
      </Button>
      <div className="h-px bg-gray-200 my-1"></div>
      <Button 
        size="icon" 
        className="h-9 w-9 rounded-full bg-purple-600 hover:bg-purple-700 text-white" 
        onClick={onAddTask}
        title="Add Task"
      >
        <Plus size={18} />
      </Button>
    </div>
  );
};

export default CalendarSideNav;
