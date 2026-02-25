
import { useMemo } from 'react';
import { useExamCategoryContext } from '@/app/providers';

export interface FilterableContent {
  id: string | number;
  categories: string[];
  [key: string]: any;
}

export const useGlobalContentFilter = () => {
  const { selectedCategories } = useExamCategoryContext();

  // Expand combo categories to their constituent categories
  const expandCategories = useMemo(() => {
    const expanded = new Set<string>();
    
    selectedCategories.forEach(categoryId => {
      expanded.add(categoryId);
      
      // Expand combo categories
      switch (categoryId) {
        case 'banking-ssc-railway-combo':
          expanded.add('banking');
          expanded.add('ssc');
          expanded.add('railways-rrb');
          break;
        case 'ssc-railway-combo':
          expanded.add('ssc');
          expanded.add('railways-rrb');
          break;
        case 'upsc-tnpsc-combo':
          expanded.add('civil-services');
          expanded.add('tamil-nadu-exams');
          break;
        case 'ssc-railway-defence-combo':
          expanded.add('ssc');
          expanded.add('railways-rrb');
          expanded.add('defence');
          break;
      }
    });
    
    return Array.from(expanded);
  }, [selectedCategories]);

  const filterContent = <T extends FilterableContent>(content: T[]): T[] => {
    if (selectedCategories.length === 0) {
      return content;
    }

    return content.filter(item => 
      item.categories.some(category => expandCategories.includes(category))
    );
  };

  const getFilterStats = <T extends FilterableContent>(originalContent: T[], filteredContent: T[]) => ({
    total: originalContent.length,
    filtered: filteredContent.length,
    hidden: originalContent.length - filteredContent.length,
    categories: selectedCategories
  });

  return {
    selectedCategories,
    expandedCategories: expandCategories,
    filterContent,
    getFilterStats,
    hasActiveFilters: selectedCategories.length > 0
  };
};
