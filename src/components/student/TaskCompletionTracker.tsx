
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

// Sample task data structure
interface Task {
  id: string;
  title: string;
  completed: boolean;
  category: 'daily' | 'weekly' | 'monthly';
}

interface TaskCompletionTrackerProps {
  className?: string;
}

const TaskCompletionTracker: React.FC<TaskCompletionTrackerProps> = ({ className }) => {
  // Sample initial tasks
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Complete aptitude practice', completed: true, category: 'daily' },
    { id: '2', title: 'Review notes', completed: true, category: 'daily' },
    { id: '3', title: 'English vocab quiz', completed: false, category: 'daily' },
    { id: '4', title: 'Banking awareness test', completed: false, category: 'daily' },
    { id: '5', title: 'Complete mock test', completed: true, category: 'weekly' },
    { id: '6', title: 'Revise current affairs', completed: false, category: 'weekly' },
    { id: '7', title: 'Complete sectional tests', completed: true, category: 'weekly' },
    { id: '8', title: 'Target monthly topics', completed: false, category: 'monthly' },
    { id: '9', title: 'Complete syllabus review', completed: true, category: 'monthly' },
    { id: '10', title: 'Revise weak areas', completed: false, category: 'monthly' },
  ]);

  // Toggle task completion
  const toggleTask = (taskId: string) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  // Calculate completion percentage per category
  const getCompletionPercentage = (category: 'daily' | 'weekly' | 'monthly'): number => {
    const categoryTasks = tasks.filter(task => task.category === category);
    if (categoryTasks.length === 0) return 0;
    
    const completedCount = categoryTasks.filter(task => task.completed).length;
    return Math.round((completedCount / categoryTasks.length) * 100);
  };

  // Get encouraging message based on completion percentage
  const getEncouragingMessage = (percentage: number): string => {
    if (percentage === 100) return "Great job! All tasks completed! 🎉";
    if (percentage >= 75) return "Almost there! Keep going! 💪";
    if (percentage >= 50) return "Halfway there! You're making progress! 👍";
    if (percentage >= 25) return "Good start! Keep pushing! 🚀";
    return "Let's get started with these tasks! 🌟";
  };

  return (
    <Card className={`p-4 hover:shadow-md transition-shadow ${className}`}>
      <h3 className="font-medium text-lg mb-3">Task Completion</h3>
      
      <Tabs defaultValue="daily">
        <TabsList className="grid w-full grid-cols-3 mb-4">
          <TabsTrigger value="daily">Daily</TabsTrigger>
          <TabsTrigger value="weekly">Weekly</TabsTrigger>
          <TabsTrigger value="monthly">Monthly</TabsTrigger>
        </TabsList>
        
        {['daily', 'weekly', 'monthly'].map((category) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="mb-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">
                  {getCompletionPercentage(category as 'daily' | 'weekly' | 'monthly')}% Complete
                </span>
              </div>
              <Progress 
                value={getCompletionPercentage(category as 'daily' | 'weekly' | 'monthly')} 
                className="h-2"
              />
              <p className="text-xs text-purple-600 mt-1">
                {getEncouragingMessage(getCompletionPercentage(category as 'daily' | 'weekly' | 'monthly'))}
              </p>
            </div>
            
            <div className="space-y-2">
              {tasks
                .filter(task => task.category === category)
                .map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md transition-colors"
                    onClick={() => toggleTask(task.id)}
                  >
                    <Checkbox 
                      checked={task.completed} 
                      onCheckedChange={() => toggleTask(task.id)} 
                    />
                    <span className={`${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                      {task.title}
                    </span>
                  </div>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </Card>
  );
};

export default TaskCompletionTracker;
