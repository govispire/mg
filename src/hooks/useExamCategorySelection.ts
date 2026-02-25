
import { useState, useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage';

interface ExamCategorySelectionData {
  selectedCategories: string[];
  completedSelection: boolean;
  timestamp: number;
}

export const useExamCategorySelection = () => {
  const [selectionData, setSelectionData] = useLocalStorage<ExamCategorySelectionData | null>('examCategorySelection', null);
  
  const hasCompletedSelection = () => {
    return selectionData?.completedSelection && selectionData?.selectedCategories?.length > 0;
  };

  const saveSelection = (categories: string[]) => {
    console.log('Saving exam category selection:', categories);
    setSelectionData({
      selectedCategories: categories,
      completedSelection: true,
      timestamp: Date.now()
    });
  };

  const clearSelection = () => {
    console.log('Clearing exam category selection');
    setSelectionData(null);
  };

  const getSelectedCategories = () => {
    return selectionData?.selectedCategories || [];
  };

  return {
    hasCompletedSelection,
    saveSelection,
    clearSelection,
    getSelectedCategories,
    selectionData
  };
};
