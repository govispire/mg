
import React, { createContext, useState, useEffect } from 'react';
import { Task, generateSampleTasks } from '@/hooks/useTasks';

interface TaskContextType {
  tasks: Task[];
  addTask: (task: Omit<Task, 'id' | 'completed'>) => void;
  updateTask: (id: number, task: Partial<Omit<Task, 'id'>>) => void;
  deleteTask: (id: number) => void;
  toggleTaskStatus: (id: number) => void;
}

export const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  
  // Load tasks on initial render
  useEffect(() => {
    const savedTasks = localStorage.getItem('tasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    } else {
      // Use sample tasks for demo
      setTasks(generateSampleTasks());
    }
  }, []);
  
  // Save tasks to localStorage when they change
  useEffect(() => {
    if (tasks.length > 0) {
      localStorage.setItem('tasks', JSON.stringify(tasks));
    }
  }, [tasks]);
  
  const addTask = (task: Omit<Task, 'id' | 'completed'>) => {
    const newTask: Task = {
      ...task,
      id: Math.max(0, ...tasks.map(t => t.id)) + 1,
      completed: false
    };
    setTasks(prevTasks => [...prevTasks, newTask]);
  };
  
  const updateTask = (id: number, updateData: Partial<Omit<Task, 'id'>>) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, ...updateData } : task
      )
    );
  };
  
  const deleteTask = (id: number) => {
    setTasks(prevTasks => prevTasks.filter(task => task.id !== id));
  };
  
  const toggleTaskStatus = (id: number) => {
    setTasks(prevTasks => 
      prevTasks.map(task => 
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );
  };
  
  const value = {
    tasks,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus
  };
  
  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
