
import React from 'react';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

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
}

interface TimelineViewProps {
  tasks: Task[];
}

const TimelineView: React.FC<TimelineViewProps> = ({ tasks }) => {
  // Sort tasks by start time
  const sortedTasks = [...tasks].sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  return (
    <div className="relative">
      <div className="border-l-2 border-gray-200 ml-3 pl-6 space-y-6">
        {sortedTasks.map(task => (
          <div key={task.id} className="relative animate-fade-in">
            <div className="absolute -left-[29px] top-0 w-5 h-5 rounded-full bg-white border-2 border-gray-300" />
            <div className={`p-4 border rounded-md transition-all hover:shadow-md ${
              task.completed ? 'bg-green-50 border-green-200' : 
              task.missed ? 'bg-red-50 border-red-200' : 'bg-white'
            }`}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{task.title}</p>
                    <Badge variant={task.priority}>{task.priority}</Badge>
                  </div>
                  <div className="flex items-center text-sm text-gray-500">
                    <p>{task.startTime}{task.endTime && ` - ${task.endTime}`}</p>
                    {task.subject && <span className="ml-2">• {task.subject}</span>}
                  </div>
                  {task.description && (
                    <p className="text-sm text-gray-500 mt-1">{task.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {task.completed ? (
                    <Badge variant="success">Completed</Badge>
                  ) : task.missed ? (
                    <Badge variant="destructive">Missed</Badge>
                  ) : (
                    <Badge variant="outline">Pending</Badge>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TimelineView;
