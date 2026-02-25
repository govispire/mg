
import { useState, useEffect } from 'react';
import { addDays, isBefore } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

// Task type definition
export interface Task {
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

// Exam countdown definition
export interface ExamCountdown {
  id: number;
  name: string;
  date: Date;
  important: boolean;
}

export const useCalendarTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([
    {
      id: 1,
      title: 'IBPS PO Mock Test',
      description: 'Complete full-length test simulation',
      date: addDays(new Date(), 1),
      startTime: '10:00',
      endTime: '12:00',
      type: 'test',
      priority: 'high',
      subject: 'Banking',
      completed: false,
      missed: false,
      recurring: 'none'
    },
    {
      id: 2,
      title: 'Quantitative Aptitude Practice',
      description: 'Focus on percentages and averages',
      date: new Date(),
      startTime: '14:00',
      endTime: '16:00',
      type: 'study',
      priority: 'medium',
      subject: 'Math',
      completed: true,
      missed: false,
      recurring: 'daily'
    },
    {
      id: 3,
      title: 'Reasoning Ability Revision',
      description: 'Focus on logical puzzles',
      date: addDays(new Date(), 1),
      startTime: '11:00',
      endTime: '13:00',
      type: 'revision',
      priority: 'medium',
      subject: 'Reasoning',
      completed: false,
      missed: false,
      recurring: 'none'
    },
    {
      id: 4,
      title: 'Current Affairs Update',
      description: 'Review last 30 days of current affairs',
      date: addDays(new Date(), -1),
      startTime: '09:00',
      endTime: '10:00',
      type: 'study',
      priority: 'low',
      subject: 'GK',
      completed: false,
      missed: true,
      recurring: 'weekly'
    },
    {
      id: 5,
      title: 'English Comprehension',
      description: 'Practice reading comprehension passages',
      date: new Date(),
      startTime: '18:00',
      endTime: '19:30',
      type: 'study',
      priority: 'medium',
      subject: 'English',
      completed: false,
      missed: false,
      recurring: 'none'
    },
    {
      id: 6,
      title: 'Break Time',
      description: 'Take a short break to recharge',
      date: new Date(),
      startTime: '16:00',
      endTime: '16:30',
      type: 'break',
      priority: 'low',
      subject: 'None',
      completed: true,
      missed: false,
      recurring: 'daily'
    }
  ]);
  
  const [upcomingExams, setUpcomingExams] = useState<ExamCountdown[]>([
    {
      id: 1,
      name: 'IBPS PO Prelims',
      date: addDays(new Date(), 30),
      important: true
    },
    {
      id: 2,
      name: 'SBI Clerk Prelims',
      date: addDays(new Date(), 45),
      important: true
    },
    {
      id: 3,
      name: 'SSC CGL Tier 1',
      date: addDays(new Date(), 60),
      important: false
    }
  ]);
  
  const { toast } = useToast();

  // Add new task
  const addTask = (newTask: Omit<Task, 'id' | 'completed' | 'missed'>) => {
    const taskToAdd: Task = {
      id: tasks.length + 1,
      ...newTask,
      completed: false,
      missed: false
    };
    
    setTasks([...tasks, taskToAdd]);
    toast({
      title: "Task added!",
      description: `"${newTask.title}" scheduled successfully`,
    });
    
    return taskToAdd;
  };
  
  // Mark task as complete
  const completeTask = (taskId: number) => {
    const updatedTasks = tasks.map(task => {
      if (task.id === taskId) {
        return { ...task, completed: true, missed: false };
      }
      return task;
    });
    
    setTasks(updatedTasks);
    toast({
      title: "Task completed!",
      description: "Great job on completing your task.",
    });
  };
  
  // Delete task
  const deleteTask = (taskId: number) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    setTasks(updatedTasks);
    toast({
      title: "Task removed",
      description: "The task has been removed from your calendar.",
    });
  };
  
  // Check for overdue tasks
  useEffect(() => {
    const checkOverdueTasks = () => {
      const today = new Date();
      const updatedTasks = tasks.map(task => {
        // If task date is before today and it's not completed or already marked as missed
        if (isBefore(task.date, today) && !task.completed && !task.missed) {
          return { ...task, missed: true };
        }
        return task;
      });
      
      setTasks(updatedTasks);
    };
    
    checkOverdueTasks();
    
    // Set up interval to check for overdue tasks every minute
    const interval = setInterval(checkOverdueTasks, 60000);
    return () => clearInterval(interval);
  }, [tasks]);
  
  // Get dates with tasks for highlighting in calendar
  const taskDates = tasks.map(task => task.date);
  
  // Get unique subjects for filtering
  const getUniqueSubjects = () => {
    return [...new Set(tasks.map(task => task.subject).filter(Boolean))];
  };
  
  // Calculate time until nearest exam
  const getNearestExam = () => {
    if (upcomingExams.length === 0) return null;
    
    const now = new Date();
    const sortedExams = [...upcomingExams].sort((a, b) => a.date.getTime() - b.date.getTime());
    const nearestExam = sortedExams[0];
    
    const diffTime = Math.abs(nearestExam.date.getTime() - now.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return {
      name: nearestExam.name,
      days: diffDays,
      date: nearestExam.date
    };
  };
  
  // Filter tasks for selected date
  const getFilteredTasks = (
    selectedDate: Date | undefined, 
    searchQuery: string, 
    filterType: string, 
    filterSubject: string, 
    filterStatus: string
  ) => {
    return tasks.filter(task => {
      const dateMatches = selectedDate && 
        task.date.getDate() === selectedDate.getDate() &&
        task.date.getMonth() === selectedDate.getMonth() &&
        task.date.getFullYear() === selectedDate.getFullYear();
      
      const searchMatches = searchQuery === '' || 
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
      
      const typeMatches = filterType === 'all' || task.type === filterType;
      const subjectMatches = filterSubject === 'all' || task.subject === filterSubject;
      
      let statusMatches = true;
      if (filterStatus === 'completed') statusMatches = task.completed;
      else if (filterStatus === 'pending') statusMatches = !task.completed && !task.missed;
      else if (filterStatus === 'missed') statusMatches = task.missed;
      
      return dateMatches && searchMatches && typeMatches && subjectMatches && statusMatches;
    });
  };
  
  // Calculate weekly task stats
  const getWeeklyStats = () => {
    const total = tasks.filter(task => 
      task.date.getTime() >= (new Date().getTime() - 7 * 24 * 60 * 60 * 1000)
    ).length;
    
    const completed = tasks.filter(task => 
      task.date.getTime() >= (new Date().getTime() - 7 * 24 * 60 * 60 * 1000) && 
      task.completed
    ).length;
    
    return {
      total,
      completed,
      percentage: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return {
    tasks,
    upcomingExams,
    addTask,
    completeTask,
    deleteTask,
    taskDates,
    getUniqueSubjects,
    getNearestExam,
    getFilteredTasks,
    getWeeklyStats
  };
};
