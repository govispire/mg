
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';

interface ExamCategoryContextType {
  selectedCategories: string[];
  setSelectedCategories: (categories: string[]) => void;
  hasSelectedCategories: boolean;
  toggleCategory: (categoryId: string) => void;
  clearCategories: () => void;
  isContentRelevant: (contentCategories: string[]) => boolean;
}

const ExamCategoryContext = createContext<ExamCategoryContextType | undefined>(undefined);

export const ExamCategoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCategories, setStoredCategories] = useLocalStorage<string[]>('globalSelectedExamCategories', []);

  // Sync with exam category selection data on mount
  useEffect(() => {
    const examSelectionData = localStorage.getItem('examCategorySelection');
    if (examSelectionData && selectedCategories.length === 0) {
      try {
        const parsedData = JSON.parse(examSelectionData);
        if (parsedData?.selectedCategories?.length > 0) {
          console.log('Syncing global categories with exam selection data:', parsedData.selectedCategories);
          setStoredCategories(parsedData.selectedCategories);
        }
      } catch (error) {
        console.error('Failed to parse exam selection data:', error);
      }
    }
  }, [selectedCategories.length, setStoredCategories]);

  const setSelectedCategories = (categories: string[]) => {
    console.log('Setting global exam categories:', categories);
    setStoredCategories(categories);
  };

  const toggleCategory = (categoryId: string) => {
    setSelectedCategories(
      selectedCategories.includes(categoryId)
        ? selectedCategories.filter(id => id !== categoryId)
        : [...selectedCategories, categoryId]
    );
  };

  const clearCategories = () => {
    setSelectedCategories([]);
  };

  const isContentRelevant = (contentCategories: string[]): boolean => {
    if (selectedCategories.length === 0) return true;
    
    // Expand combo categories to check relevance
    const expandedCategories = new Set<string>();
    selectedCategories.forEach(categoryId => {
      expandedCategories.add(categoryId);
      
      switch (categoryId) {
        case 'banking-ssc-railway-combo':
          expandedCategories.add('banking');
          expandedCategories.add('ssc');
          expandedCategories.add('railways-rrb');
          break;
        case 'ssc-railway-combo':
          expandedCategories.add('ssc');
          expandedCategories.add('railways-rrb');
          break;
        case 'upsc-tnpsc-combo':
          expandedCategories.add('civil-services');
          expandedCategories.add('tamil-nadu-exams');
          break;
        case 'ssc-railway-defence-combo':
          expandedCategories.add('ssc');
          expandedCategories.add('railways-rrb');
          expandedCategories.add('defence');
          break;
      }
    });
    
    return contentCategories.some(category => expandedCategories.has(category));
  };

  const hasSelectedCategories = selectedCategories.length > 0;

  return (
    <ExamCategoryContext.Provider
      value={{
        selectedCategories,
        setSelectedCategories,
        hasSelectedCategories,
        toggleCategory,
        clearCategories,
        isContentRelevant
      }}
    >
      {children}
    </ExamCategoryContext.Provider>
  );
};

export const useExamCategoryContext = () => {
  const context = useContext(ExamCategoryContext);
  if (context === undefined) {
    throw new Error('useExamCategoryContext must be used within an ExamCategoryProvider');
  }
  return context;
};
