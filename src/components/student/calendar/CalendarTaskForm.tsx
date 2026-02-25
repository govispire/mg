
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

interface TaskFormProps {
  onClose: () => void;
  onAddTask: () => void;
  taskTitle: string;
  setTaskTitle: (value: string) => void;
  taskDescription: string;
  setTaskDescription: (value: string) => void;
  taskType: string;
  setTaskType: (value: string) => void;
  taskPriority: string;
  setTaskPriority: (value: string) => void;
  taskSubject: string;
  setTaskSubject: (value: string) => void;
  taskStartTime: string;
  setTaskStartTime: (value: string) => void;
  taskEndTime: string;
  setTaskEndTime: (value: string) => void;
  taskRecurring: string;
  setTaskRecurring: (value: string) => void;
  date?: Date;
}

const CalendarTaskForm: React.FC<TaskFormProps> = ({
  onClose,
  onAddTask,
  taskTitle,
  setTaskTitle,
  taskDescription,
  setTaskDescription,
  taskType,
  setTaskType,
  taskPriority,
  setTaskPriority,
  taskSubject,
  setTaskSubject,
  taskStartTime,
  setTaskStartTime,
  taskEndTime,
  setTaskEndTime,
  taskRecurring,
  setTaskRecurring,
  date
}) => {
  const isMobile = useIsMobile();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 animate-fade-in backdrop-blur-sm">
      <Card className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto border-purple-100 dark:border-gray-700">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Task</h2>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose} 
            className="hover:bg-red-100 hover:text-red-600 transition-colors rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <div className="space-y-5">
          {/* Selected Date */}
          <div className="bg-purple-50 dark:bg-gray-700 rounded-lg p-3 text-center mb-5">
            <div className="text-sm text-purple-600 dark:text-purple-300 font-medium mb-1">Selected Date</div>
            <div className="text-lg font-semibold text-gray-800 dark:text-white">
              {date ? format(date, 'PPPP') : 'No date selected'}
            </div>
          </div>
          
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Task Title*</label>
            <Input 
              type="text" 
              id="task-title" 
              placeholder="E.g., Quantitative Aptitude Practice" 
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Description (Optional)</label>
            <Textarea
              id="task-description" 
              placeholder="E.g., Focus on percentages and ratios" 
              value={taskDescription}
              onChange={(e) => setTaskDescription(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500 min-h-[80px]"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-type" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Task Type*</label>
              <Select value={taskType} onValueChange={setTaskType}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="study">📚 Study Session</SelectItem>
                  <SelectItem value="test">📝 Mock Test</SelectItem>
                  <SelectItem value="revision">🔍 Revision</SelectItem>
                  <SelectItem value="break">☕ Break</SelectItem>
                  <SelectItem value="custom">✨ Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Priority</label>
              <Select value={taskPriority} onValueChange={setTaskPriority}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">🟢 Low</SelectItem>
                  <SelectItem value="medium">🟡 Medium</SelectItem>
                  <SelectItem value="high">🔴 High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div>
            <label htmlFor="task-subject" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Subject (Optional)</label>
            <Input
              type="text" 
              id="task-subject" 
              placeholder="E.g., Mathematics, English, GK" 
              value={taskSubject}
              onChange={(e) => setTaskSubject(e.target.value)}
              className="w-full border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="task-start-time" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Start Time*</label>
              <Input
                type="time" 
                id="task-start-time" 
                value={taskStartTime}
                onChange={(e) => setTaskStartTime(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
            
            <div>
              <label htmlFor="task-end-time" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">End Time (Optional)</label>
              <Input
                type="time" 
                id="task-end-time" 
                value={taskEndTime}
                onChange={(e) => setTaskEndTime(e.target.value)}
                className="w-full border-gray-300 dark:border-gray-600 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="task-recurring" className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Recurring</label>
            <Select value={taskRecurring} onValueChange={setTaskRecurring}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Is this a recurring task?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Not recurring</SelectItem>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex justify-end gap-3 mt-8">
            <Button 
              variant="outline" 
              onClick={onClose} 
              className="border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Cancel
            </Button>
            <Button 
              onClick={onAddTask} 
              className="bg-purple-600 hover:bg-purple-700 transition-all"
            >
              Add Task
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default CalendarTaskForm;
