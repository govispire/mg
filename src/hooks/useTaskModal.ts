
import { useState } from 'react';
import { Task } from './useTasks';

export function useTaskModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentTask, setCurrentTask] = useState<Task | null>(null);
  
  const openModal = (task?: Task) => {
    if (task) {
      setCurrentTask(task);
    } else {
      setCurrentTask(null);
    }
    setIsOpen(true);
  };
  
  const closeModal = () => {
    setIsOpen(false);
    setCurrentTask(null);
  };
  
  return {
    isOpen,
    currentTask,
    openModal,
    closeModal
  };
}
