
import { useState } from 'react';

export const useCalendarState = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [showAddTask, setShowAddTask] = useState(false);
  const [calendarView, setCalendarView] = useState<'month' | 'week'>('month');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [taskType, setTaskType] = useState('study');
  const [taskPriority, setTaskPriority] = useState('medium');
  const [taskSubject, setTaskSubject] = useState('');
  const [taskStartTime, setTaskStartTime] = useState('');
  const [taskEndTime, setTaskEndTime] = useState('');
  const [taskRecurring, setTaskRecurring] = useState('none');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterSubject, setFilterSubject] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [strict, setStrict] = useState(false);
  const [streak, setStreak] = useState(12); // Days in a row with completed tasks
  const [monthlyProgress, setMonthlyProgress] = useState(68); // Percentage of tasks completed this month
  
  // Reset task form fields
  const resetTaskForm = () => {
    setTaskTitle('');
    setTaskDescription('');
    setTaskType('study');
    setTaskPriority('medium');
    setTaskSubject('');
    setTaskStartTime('');
    setTaskEndTime('');
    setTaskRecurring('none');
  };
  
  // Reset all filters
  const resetFilters = () => {
    setFilterType('all');
    setFilterSubject('all');
    setFilterStatus('all');
    setSearchQuery('');
  };
  
  // Toggle strict mode
  const toggleStrictMode = () => {
    setStrict(!strict);
  };
  
  // Check if any filters are active
  const hasActiveFilters = filterType !== 'all' || filterSubject !== 'all' || filterStatus !== 'all' || searchQuery !== '';

  return {
    date,
    setDate,
    showAddTask,
    setShowAddTask,
    calendarView,
    setCalendarView,
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
    searchQuery,
    setSearchQuery,
    filterType,
    setFilterType,
    filterSubject,
    setFilterSubject,
    filterStatus,
    setFilterStatus,
    strict,
    streak,
    monthlyProgress,
    resetTaskForm,
    resetFilters,
    toggleStrictMode,
    hasActiveFilters
  };
};
