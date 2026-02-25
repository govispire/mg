
import React from 'react';
import { Card } from '@/components/ui/card';
import { Task } from '@/hooks/useCalendarTasks';
import { Check, Circle, Plus, Clock, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface ChecklistPanelProps {
  tasks: Task[];
  onCompleteTask: (taskId: number) => void;
  onAddTask: () => void;
  title?: string;
}

const ChecklistPanel: React.FC<ChecklistPanelProps> = ({ 
  tasks, 
  onCompleteTask, 
  onAddTask,
  title = "Today's Tasks" 
}) => {
  const todaysTasks = tasks.filter(task => {
    const today = new Date();
    return task.date.getDate() === today.getDate() && 
           task.date.getMonth() === today.getMonth() && 
           task.date.getFullYear() === today.getFullYear();
  });
  
  const completedTasks = todaysTasks.filter(task => task.completed);
  const completionPercentage = todaysTasks.length > 0 
    ? Math.round((completedTasks.length / todaysTasks.length) * 100)
    : 0;

  return (
    <Card className="p-4 bg-white dark:bg-gray-800 shadow-md rounded-xl border-purple-100 dark:border-gray-700 transition-all hover:shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100 flex items-center">
          <CalendarIcon className="h-5 w-5 mr-2 text-purple-500" />
          {title}
        </h3>
        <div className="flex items-center">
          <Badge variant="outline" className="bg-purple-50 text-purple-600 dark:bg-gray-700 dark:text-purple-300 font-medium">
            {completedTasks.length}/{todaysTasks.length}
          </Badge>
        </div>
      </div>
      
      <div className="mb-4">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-gray-600 dark:text-gray-300">Progress</span>
          <span className="font-medium">{completionPercentage}%</span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>
      
      <div className="space-y-3">
        {todaysTasks.length > 0 ? (
          todaysTasks.map(task => (
            <div 
              key={task.id}
              className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all ${
                task.completed 
                  ? 'bg-purple-50/50 dark:bg-gray-700/30' 
                  : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
              }`}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                className={`h-6 w-6 rounded-full ${
                  task.completed 
                    ? 'bg-purple-500 text-white hover:bg-purple-600' 
                    : 'border-2 border-gray-300 hover:border-purple-500'
                }`}
                onClick={() => onCompleteTask(task.id)}
              >
                {task.completed ? <Check size={14} /> : null}
              </Button>
              
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${task.completed ? 'line-through text-gray-400 dark:text-gray-500' : 'text-gray-800 dark:text-gray-200'}`}>
                  {task.title}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  <Clock className="h-3 w-3 mr-1" />
                  {task.startTime}{task.endTime ? ` - ${task.endTime}` : ''}
                </div>
              </div>
              
              <Badge 
                className={`text-xs ${
                  task.type === 'study' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                  task.type === 'test' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300' :
                  task.type === 'revision' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                  'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                }`}
              >
                {task.type}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-3">
              <div className="w-16 h-16 bg-purple-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                <CalendarIcon className="h-8 w-8 text-purple-500 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-3">No tasks scheduled for today</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="hover:bg-purple-50 hover:text-purple-600 dark:hover:bg-gray-700 dark:hover:text-purple-300 transition-all"
              onClick={onAddTask}
            >
              <Plus className="h-4 w-4 mr-1" />
              Add New Task
            </Button>
          </div>
        )}
      </div>
      
      {todaysTasks.length > 0 && (
        <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700">
          <Button 
            variant="ghost" 
            size="sm" 
            className="w-full text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:text-purple-400 dark:hover:bg-gray-700"
            onClick={onAddTask}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add New Task
          </Button>
        </div>
      )}
    </Card>
  );
};

export default ChecklistPanel;
