
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Info, Menu } from 'lucide-react';
import { IBPS_LOGO, SBI_LOGO } from '@/data/examData';
import { examCategories } from '@/data/examData';

interface ExamHeaderProps {
  currentSection: string;
  isPreview: boolean;
  formatTime: (seconds: number) => string;
  timeLeft: number;
  toggleSidebar: () => void;
  setShowInstructions: (show: boolean) => void;
  isMobile: boolean;
}

const ExamHeader: React.FC<ExamHeaderProps> = ({
  currentSection,
  isPreview,
  formatTime,
  timeLeft,
  toggleSidebar,
  setShowInstructions,
  isMobile
}) => {
  const [selectedCategoryName, setSelectedCategoryName] = useState('Select Category');

  useEffect(() => {
    // Check for temporarily selected category
    const tempCategory = localStorage.getItem('tempSelectedExamCategory');
    if (tempCategory) {
      const category = examCategories.find(cat => cat.id === tempCategory);
      if (category) {
        setSelectedCategoryName(category.name);
      }
    }

    // Listen for localStorage changes
    const handleStorageChange = () => {
      const tempCategory = localStorage.getItem('tempSelectedExamCategory');
      if (tempCategory) {
        const category = examCategories.find(cat => cat.id === tempCategory);
        if (category) {
          setSelectedCategoryName(category.name);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  return (
    <div className="bg-gray-800 text-white px-4 py-2">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="flex items-center mb-2 md:mb-0">
          {isMobile && (
            <Button 
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="text-white mr-2 -ml-2 hover:bg-gray-700"
            >
              <Menu className="h-5 w-5" />
            </Button>
          )}
          <div className="bg-blue-600 h-8 w-8 rounded-full flex items-center justify-center mr-2 font-bold">
            <img 
              src={currentSection.includes('General') ? IBPS_LOGO : SBI_LOGO} 
              alt="Exam Logo" 
              className="h-6 w-6 object-contain"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-medium">
              {isPreview ? "Test Preview Mode" : "New IBPS Test"}
            </span>
            <span className="text-sm text-gray-300">
              Category: {selectedCategoryName}
            </span>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowInstructions(true)}
            className="text-white hover:bg-gray-700"
          >
            <Info className="h-4 w-4 mr-1" />
            <span className="hidden sm:inline">View Instructions</span>
          </Button>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm">Time Left:</span>
            <span className="font-medium">
              {formatTime(timeLeft)}
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-2">
            <div className="bg-gray-700 h-8 w-8 rounded-full flex items-center justify-center">
              <span className="text-xs">JS</span>
            </div>
            <span>John Smith</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamHeader;
