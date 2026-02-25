
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, Filter } from 'lucide-react';
import { useExamCategoryContext } from '@/app/providers';
import { examCategories } from '@/data/examData';

interface ActiveCategoryFiltersProps {
  className?: string;
  showStats?: boolean;
  totalItems?: number;
  filteredItems?: number;
}

export const ActiveCategoryFilters: React.FC<ActiveCategoryFiltersProps> = ({
  className = '',
  showStats = false,
  totalItems = 0,
  filteredItems = 0
}) => {
  const { selectedCategories, toggleCategory, clearCategories } = useExamCategoryContext();

  if (selectedCategories.length === 0) return null;

  const getCategoryName = (categoryId: string) => {
    const category = examCategories.find(cat => cat.id === categoryId);
    if (category) return category.name;
    
    // Handle combo categories
    const comboNames: { [key: string]: string } = {
      'banking-ssc-railway-combo': 'Banking + SSC + Railway',
      'ssc-railway-combo': 'SSC + Railway',
      'upsc-tnpsc-combo': 'UPSC + TNPSC',
      'ssc-railway-defence-combo': 'SSC + Railway + Defence'
    };
    
    return comboNames[categoryId] || categoryId;
  };

  return (
    <div className={`bg-blue-50 border border-blue-200 rounded-lg p-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2 mb-2">
        <div className="flex items-center gap-1 text-sm text-blue-700 font-medium">
          <Filter className="h-4 w-4" />
          Active Filters:
        </div>
        {selectedCategories.map((categoryId) => (
          <Badge
            key={categoryId}
            variant="default"
            className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-1"
          >
            {getCategoryName(categoryId)}
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 hover:bg-transparent"
              onClick={() => toggleCategory(categoryId)}
            >
              <X className="h-3 w-3" />
            </Button>
          </Badge>
        ))}
        <Button
          variant="outline"
          size="sm"
          onClick={clearCategories}
          className="text-xs"
        >
          Clear All
        </Button>
      </div>
      
      {showStats && (
        <div className="text-xs text-blue-600">
          Showing {filteredItems} of {totalItems} items
          {totalItems - filteredItems > 0 && (
            <span className="ml-1">({totalItems - filteredItems} hidden)</span>
          )}
        </div>
      )}
    </div>
  );
};
