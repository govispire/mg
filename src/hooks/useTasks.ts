
import { useState, useEffect, useContext } from 'react';
import { TaskContext } from '@/context/TaskContext';

// Sample initial tasks data
const initialTasks = [
  {
    id: 1,
    title: 'Study Quantitative Aptitude',
    description: 'Complete chapter 5 on percentages',
    completed: false,
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days from now
    category: 'study',
    priority: 'high',
  },
  {
    id: 2,
    title: 'Solve practice problems',
    description: '30 reasoning questions',
    completed: true,
    dueDate: new Date().toISOString(), // Today
    category: 'practice',
    priority: 'medium',
  },
  {
    id: 3,
    title: 'Mock Test: IBPS PO',
    description: 'Complete full test simulation',
    completed: false,
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    category: 'exams',
    priority: 'high',
  },
  {
    id: 4,
    title: 'Revise English Vocabulary',
    description: 'Review word list for bank exams',
    completed: false,
    dueDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago (overdue)
    category: 'revision',
    priority: 'medium',
  },
  {
    id: 5,
    title: 'Complete Current Affairs Notes',
    description: 'Review last month\'s news',
    completed: false,
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    category: 'study',
    priority: 'low',
  }
];

export interface Task {
  id: number;
  title: string;
  description?: string;
  completed: boolean;
  dueDate?: string;
  endDate?: string;
  category: string;
  priority: string;
  repeat?: 'none' | 'daily' | 'weekly' | 'monthly';
  tags?: string[];
}

export function useTasks() {
  const context = useContext(TaskContext);
  
  if (!context) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  
  return context;
}

// Standalone function to generate sample tasks (for demo)
export function generateSampleTasks(): Task[] {
  return initialTasks;
}
