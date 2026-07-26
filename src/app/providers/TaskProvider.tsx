
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { Task, generateSampleTasks } from '@/hooks/useTasks';
import { api } from '@/lib/api';

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

  // Load tasks from API (or fall back to sample tasks if no session)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setTasks(generateSampleTasks());
      return;
    }
    api.getTasks()
      .then(apiTasks => {
        if (apiTasks.length === 0) {
          setTasks(generateSampleTasks());
        } else {
          setTasks(apiTasks.map(t => ({
            id: t.id,
            title: t.title,
            description: t.description,
            completed: t.completed,
            dueDate: t.dueDate,
            category: t.category,
            priority: t.priority,
            repeat: (t.repeat as Task['repeat']) || 'none',
            tags: t.tags || [],
          })));
        }
      })
      .catch(() => setTasks(generateSampleTasks()));
  }, []);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'completed'>) => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const created = await api.createTask({
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          category: task.category,
          priority: task.priority,
          repeat: task.repeat || 'none',
          tags: task.tags || [],
        });
        setTasks(prev => [...prev, {
          id: created.id,
          title: created.title,
          description: created.description,
          completed: created.completed,
          dueDate: created.dueDate,
          category: created.category,
          priority: created.priority,
          repeat: (created.repeat as Task['repeat']) || 'none',
          tags: created.tags || [],
        }]);
        return;
      } catch {}
    }
    // Fallback: local only
    const newTask: Task = {
      ...task, id: Math.max(0, ...tasks.map(t => t.id)) + 1, completed: false
    };
    setTasks(prev => [...prev, newTask]);
  }, [tasks]);

  const updateTask = useCallback(async (id: number, updateData: Partial<Omit<Task, 'id'>>) => {
    // Optimistic UI update
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updateData } : t));
    const token = localStorage.getItem('token');
    if (token) {
      api.updateTask(id, {
        title: updateData.title,
        description: updateData.description,
        completed: updateData.completed,
        dueDate: updateData.dueDate,
        category: updateData.category,
        priority: updateData.priority,
        repeat: updateData.repeat,
        tags: updateData.tags,
      }).catch(() => {});
    }
  }, []);

  const deleteTask = useCallback(async (id: number) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    const token = localStorage.getItem('token');
    if (token) {
      api.deleteTask(id).catch(() => {});
    }
  }, []);

  const toggleTaskStatus = useCallback((id: number) => {
    const task = tasks.find(t => t.id === id);
    if (task) updateTask(id, { completed: !task.completed });
  }, [tasks, updateTask]);

  const value = { tasks, addTask, updateTask, deleteTask, toggleTaskStatus };

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};
