
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { 
  startOfToday, 
  endOfToday, 
  startOfWeek, 
  endOfWeek, 
  startOfMonth, 
  endOfMonth, 
  isWithinInterval 
} from 'date-fns';

export const ProgressDashboard: React.FC = () => {
  const { tasks } = useTasks();
  
  // Calculate progress percentages
  const calculateProgress = (tasks: any[], startDate: Date, endDate: Date) => {
    const filteredTasks = tasks.filter(task => 
      task.dueDate && isWithinInterval(new Date(task.dueDate), { start: startDate, end: endDate })
    );
    
    const total = filteredTasks.length;
    if (total === 0) return 0;
    
    const completed = filteredTasks.filter(task => task.completed).length;
    return Math.round((completed / total) * 100);
  };
  
  const today = startOfToday();
  const todayEnd = endOfToday();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  
  const todayProgress = calculateProgress(tasks, today, todayEnd);
  const weekProgress = calculateProgress(tasks, weekStart, weekEnd);
  const monthProgress = calculateProgress(tasks, monthStart, monthEnd);
  const overallProgress = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;
  
  // Color for progress bar
  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-red-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };
  
  return (
    <div className="space-y-4">
      <h3 className="font-medium text-lg">Progress Dashboard</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Today</span>
            <span className="text-sm text-gray-500">{todayProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className={`${getProgressColor(todayProgress)} h-2.5 rounded-full transition-all duration-500`} 
              style={{ width: `${todayProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">This Week</span>
            <span className="text-sm text-gray-500">{weekProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className={`${getProgressColor(weekProgress)} h-2.5 rounded-full transition-all duration-500`} 
              style={{ width: `${weekProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">This Month</span>
            <span className="text-sm text-gray-500">{monthProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className={`${getProgressColor(monthProgress)} h-2.5 rounded-full transition-all duration-500`} 
              style={{ width: `${monthProgress}%` }}
            ></div>
          </div>
        </div>
        
        <div>
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Overall</span>
            <span className="text-sm text-gray-500">{overallProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div 
              className={`${getProgressColor(overallProgress)} h-2.5 rounded-full transition-all duration-500`} 
              style={{ width: `${overallProgress}%` }}
            ></div>
          </div>
        </div>
      </div>
      
      <div className="text-xs text-gray-500 text-center pt-2">
        {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
      </div>
    </div>
  );
};
