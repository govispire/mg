import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

export interface SelectedExam {
  id: string;
  name: string;
  logo: string;
  category: string;
  addedAt: number;
}

export const useSelectedExams = () => {
  const [selectedExams, setSelectedExams] = useLocalStorage<SelectedExam[]>('selectedExams', []);

  const isExamSelected = (examId: string) => {
    return selectedExams.some(exam => exam.id === examId);
  };

  const toggleExamSelection = (exam: SelectedExam) => {
    if (isExamSelected(exam.id)) {
      setSelectedExams(selectedExams.filter(e => e.id !== exam.id));
      return false;
    } else {
      setSelectedExams([...selectedExams, { ...exam, addedAt: Date.now() }]);
      return true;
    }
  };

  const removeExam = (examId: string) => {
    setSelectedExams(selectedExams.filter(e => e.id !== examId));
  };

  const clearAllExams = () => {
    setSelectedExams([]);
  };

  return {
    selectedExams,
    isExamSelected,
    toggleExamSelection,
    removeExam,
    clearAllExams
  };
};
