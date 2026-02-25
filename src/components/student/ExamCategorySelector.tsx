
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Check } from 'lucide-react';
import { examCategories } from '@/data/examData';

interface ExamCategorySelectorProps {
  selectedCategory: string | string[];
  onChange: (category: string | string[]) => void;
}

export const ExamCategorySelector: React.FC<ExamCategorySelectorProps> = ({ selectedCategory, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Normalize selectedCategory to always be an array for easier handling
  const selectedCategories = Array.isArray(selectedCategory) ? selectedCategory : selectedCategory ? [selectedCategory] : [];

  const handleCategorySelect = (categoryId: string) => {
    let newSelection: string[];
    
    if (selectedCategories.includes(categoryId)) {
      // Remove if already selected
      newSelection = selectedCategories.filter(id => id !== categoryId);
    } else {
      // Add to selection
      newSelection = [...selectedCategories, categoryId];
    }

    // Store temporarily in localStorage
    localStorage.setItem('tempSelectedExamCategory', JSON.stringify(newSelection));
    
    // Call the onChange handler
    onChange(newSelection.length === 1 ? newSelection[0] : newSelection);
    
    console.log('Temporarily selected exam categories:', newSelection);
  };

  const getSelectedCategoryDisplayText = () => {
    if (selectedCategories.length === 0) {
      return 'Select Category';
    } else if (selectedCategories.length === 1) {
      const category = examCategories.find(cat => cat.id === selectedCategories[0]);
      return category ? category.name : 'Select Category';
    } else {
      const firstCategory = examCategories.find(cat => cat.id === selectedCategories[0]);
      const firstName = firstCategory ? firstCategory.name : 'Category';
      const additionalCount = selectedCategories.length - 1;
      
      // Truncate long names on mobile
      const truncatedName = firstName.length > 15 ? firstName.substring(0, 15) + '...' : firstName;
      
      return `${truncatedName} & ${additionalCount} more`;
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-3 sm:p-4 w-full">
      <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">
        Choose Your Exam Category
      </h2>
      
      {/* Dropdown Style Selector */}
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-between text-left h-12 px-4 text-base font-medium"
          >
            <span className={selectedCategories.length > 0 ? "text-gray-900" : "text-gray-500"}>
              {getSelectedCategoryDisplayText()}
            </span>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-full min-w-[300px] max-h-60 overflow-y-auto bg-white border shadow-lg">
          {examCategories.map((cat) => (
            <DropdownMenuItem 
              key={cat.id}
              onClick={() => handleCategorySelect(cat.id)}
              className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-50 focus:bg-gray-50"
            >
              <span className="text-sm font-medium">{cat.name}</span>
              {selectedCategories.includes(cat.id) && (
                <Check className="h-4 w-4 text-blue-600" />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Category Grid - Show only when categories are selected */}
      {selectedCategories.length > 0 && (
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-600 mb-3">Selected categories:</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:flex lg:flex-wrap gap-2">
            {examCategories.map((cat) => (
              <Button 
                key={cat.id} 
                variant={selectedCategories.includes(cat.id) ? "default" : "outline"}
                onClick={() => handleCategorySelect(cat.id)}
                className="text-xs sm:text-sm py-1.5 sm:py-2 px-2 sm:px-3 h-auto whitespace-nowrap"
                size="sm"
              >
                {cat.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
