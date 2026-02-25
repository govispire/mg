
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CheckCircle, AlertTriangle, BookOpen, Bell, Clock } from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description?: string;
  date: Date;
  startTime: string;
  endTime?: string;
  type: 'study' | 'test' | 'revision' | 'break' | 'custom';
  priority: 'low' | 'medium' | 'high';
  subject?: string;
  completed: boolean;
  missed: boolean;
  recurring?: 'daily' | 'weekly' | 'none';
}

interface TaskListProps {
  tasks: Task[];
  onCompleteTask: (taskId: number) => void;
  onDeleteTask: (taskId: number) => void;
}

const TaskList: React.FC<TaskListProps> = ({ tasks, onCompleteTask, onDeleteTask }) => {
  // Get task icon based on type
  const getTaskIcon = (type: string) => {
    switch (type) {
      case 'test':
        return <BookOpen className="h-4 w-4 text-blue-600" />;
      case 'revision':
        return <Clock className="h-4 w-4 text-purple-600" />;
      case 'break':
        return <Bell className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-3">
      {tasks.map(task => (
        <div 
          key={task.id} 
          className={`p-4 border rounded-md transition-all hover:shadow-md ${
            task.completed ? 'bg-green-50 border-green-200' : 
            task.missed ? 'bg-red-50 border-red-200' : 'bg-white'
          }`}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-full flex-shrink-0 ${
                task.type === 'test' ? 'bg-blue-100' : 
                task.type === 'revision' ? 'bg-purple-100' : 
                task.type === 'break' ? 'bg-green-100' : 
                'bg-gray-100'
              }`}>
                {getTaskIcon(task.type)}
              </div>
              <div className="flex-grow">
                <div className="flex items-center flex-wrap gap-2">
                  <p className="font-medium">{task.title}</p>
                  {task.recurring !== 'none' && (
                    <Badge variant="outline" className="text-xs">
                      {task.recurring}
                    </Badge>
                  )}
                  {task.priority && (
                    <Badge variant={task.priority} className="text-xs">
                      {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </Badge>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                )}
                <div className="flex flex-wrap gap-x-4 text-sm text-gray-500 mt-1">
                  <span>{task.startTime}{task.endTime && ` - ${task.endTime}`}</span>
                  {task.subject && <span>• {task.subject}</span>}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              {task.completed ? (
                <span className="flex items-center text-green-600 text-sm whitespace-nowrap">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  <span>Completed</span>
                </span>
              ) : task.missed ? (
                <span className="flex items-center text-red-600 text-sm whitespace-nowrap">
                  <AlertTriangle className="h-4 w-4 mr-1" />
                  <span>Missed</span>
                </span>
              ) : (
                <Button 
                  size="sm" 
                  variant="outline"
                  className="hover:bg-green-50 hover:text-green-600 transition-colors"
                  onClick={() => onCompleteTask(task.id)}
                >
                  Mark Complete
                </Button>
              )}
              <Button 
                size="sm" 
                variant="ghost"
                className="hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={() => onDeleteTask(task.id)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default TaskList;
