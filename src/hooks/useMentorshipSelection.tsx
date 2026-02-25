import { useState, useEffect } from 'react';

interface MentorshipSelectionData {
  selectedCategories: string[];
  completedAt: string;
}

export const useMentorshipSelection = () => {
  // Simplified hook - no longer needed for category selection
  // Keeping for backward compatibility but always returns empty state
  const [selectionData, setSelectionData] = useState<MentorshipSelectionData | null>(null);

  useEffect(() => {
    console.log('useMentorshipSelection: Loading data from localStorage');
    const data = localStorage.getItem('mentorshipCategorySelection');
    if (data) {
      try {
        const parsedData = JSON.parse(data);
        console.log('useMentorshipSelection: Loaded data:', parsedData);
        setSelectionData(parsedData);
      } catch (error) {
        console.error('useMentorshipSelection: Failed to parse mentorship selection data:', error);
        // Clear corrupted data
        localStorage.removeItem('mentorshipCategorySelection');
      }
    } else {
      console.log('useMentorshipSelection: No data found in localStorage');
    }
  }, []);

  const saveSelection = (categories: string[]) => {
    console.log('useMentorshipSelection: Category selection no longer required');
  };

  const getSelectedCategories = (): string[] => {
    return []; // Return empty array since we show all categories
  };

  const hasCompletedSelection = (): boolean => {
    return true; // Always return true since selection is not required
  };

  const clearSelection = () => {
    console.log('useMentorshipSelection: Category selection no longer required');
  };

  return {
    saveSelection,
    getSelectedCategories,
    hasCompletedSelection,
    clearSelection,
    selectionData
  };
};
