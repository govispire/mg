
import React from 'react';
import { useTasks } from '@/hooks/useTasks';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTaskModal } from '@/hooks/useTaskModal';
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskListProps {
  searchQuery: string;
  filterStatus: string[];
}

export const TaskList: React.FC<TaskListProps> = ({ searchQuery, filterStatus }) => {
  const { tasks, toggleTaskStatus, deleteTask } = useTasks();
  const { openModal } = useTaskModal();
  
  // Filter tasks based on search query and filter status
  const filteredTasks = tasks.filter(task => {
    // Text search
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus =
      filterStatus.includes('all') ||
      (filterStatus.includes('completed') && task.completed) ||
      (filterStatus.includes('pending') && !task.completed);
    
    return matchesSearch && matchesStatus;
  });
  
  // Sort tasks by due date (earliest first)
  const sortedTasks = [...filteredTasks].sort((a, b) => {
    if (!a.dueDate) return 1;
    if (!b.dueDate) return -1;
    return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
  });
  
  if (sortedTasks.length === 0) {
    return (
      <div className="p-8 text-center">
        <p className="text-gray-500">No tasks match your filters</p>
        <p className="text-sm text-gray-400 mt-1">Try adjusting your search or filters</p>
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
    <div className="space-y-2">
      {sortedTasks.map(task => (
        <div 
          key={task.id} 
          className={cn(
            "p-3 rounded-md border transition-colors",
            task.completed 
              ? "bg-gray-50 border-gray-200" 
              : "bg-white border-gray-200 hover:border-gray-300"
          )}
        >
          <div className="flex items-start gap-3">
            <div className="pt-0.5">
              <Checkbox 
                checked={task.completed}
                onCheckedChange={() => toggleTaskStatus(task.id)}
                className={cn(
                  task.completed ? "text-gray-400" : "text-purple-600",
                  "rounded-full"
                )}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <p className={cn(
                    "font-medium",
                    task.completed ? "text-gray-500 line-through" : "text-gray-900"
                  )}>
                    {task.title}
                  </p>
                  <div className={`w-2 h-2 rounded-full ${getCategoryColor(task.category)}`}></div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger className="focus:outline-none">
                    <MoreHorizontal className="h-4 w-4 text-gray-500 hover:text-gray-700" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => openModal(task)}>
                      <Pencil className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => deleteTask(task.id)}
                      className="text-red-500 focus:text-red-500"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              {task.description && (
                <p className={cn(
                  "text-sm mt-1",
                  task.completed ? "text-gray-400" : "text-gray-600"
                )}>
                  {task.description}
                </p>
              )}
              {task.dueDate && (
                <p className={cn(
                  "text-xs mt-1", 
                  task.completed 
                    ? "text-gray-400" 
                    : new Date(task.dueDate) < new Date() 
                      ? "text-red-500" 
                      : "text-gray-500"
                )}>
                  Due {format(new Date(task.dueDate), 'MMM d, yyyy, h:mm a')}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
