
import React from 'react';
import { Button } from '@/components/ui/button';
import { Moon, Sun, Plus, ChevronDown } from 'lucide-react';
import { format } from 'date-fns';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useIsMobile } from '@/hooks/use-mobile';

interface EnhancedCalendarHeaderProps {
  title?: string;
  subtitle?: string;
  date: Date;
  onAddTask: () => void;
  isDarkMode?: boolean;
  onToggleTheme?: () => void;
}

const EnhancedCalendarHeader: React.FC<EnhancedCalendarHeaderProps> = ({
  title = "My Calendar",
  subtitle = "Manage your study schedule efficiently",
  date,
  onAddTask,
  isDarkMode = false,
  onToggleTheme
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 transition-all">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">{title}</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
      </div>
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mt-4 sm:mt-0">
        {!isMobile && (
          <div className="flex bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
            <Button 
              variant={isDarkMode ? "ghost" : "default"} 
              size="sm" 
              className={`rounded-full px-3 ${
                !isDarkMode 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={onToggleTheme}
            >
              <Sun size={16} className="mr-1" />
              <span className="text-xs">Light</span>
            </Button>
            <Button 
              variant={!isDarkMode ? "ghost" : "default"} 
              size="sm" 
              className={`rounded-full px-3 ${
                isDarkMode 
                  ? 'bg-purple-500 text-white hover:bg-purple-600' 
                  : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
              onClick={onToggleTheme}
            >
              <Moon size={16} className="mr-1" />
              <span className="text-xs">Dark</span>
            </Button>
          </div>
        )}
        
        {isMobile ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="bg-purple-500 hover:bg-purple-600 shadow-md">
                <Plus className="h-4 w-4 mr-1" />
                <span>Add</span>
                <ChevronDown className="h-4 w-4 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onAddTask}>Add New Task</DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleTheme}>
                {isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button onClick={onAddTask} className="bg-purple-500 hover:bg-purple-600 shadow-md transition-transform hover:scale-105">
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        )}
      </div>
    </div>
  );
};

export default EnhancedCalendarHeader;
