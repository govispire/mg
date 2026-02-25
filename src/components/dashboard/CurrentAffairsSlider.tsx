import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Newspaper } from 'lucide-react';

interface AffairItem {
  id: number;
  title: string;
  date: string;
  category: string;
}

const CurrentAffairsSlider = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const affairsItems: AffairItem[] = [
    { id: 1, title: 'New Banking Regulations Announced by RBI', date: 'Today', category: 'Banking' },
    { id: 2, title: 'India Signs Historic Trade Agreement', date: 'Yesterday', category: 'Economics' },
    { id: 3, title: 'Supreme Court Landmark Judgment on Digital Privacy', date: '2 days ago', category: 'Legal' },
    { id: 4, title: 'ISRO Successfully Launches New Satellite', date: '3 days ago', category: 'Science' },
    { id: 5, title: 'G20 Summit: Key Outcomes and Decisions', date: '4 days ago', category: 'International' },
  ];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % affairsItems.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + affairsItems.length) % affairsItems.length);
  };

  const currentItem = affairsItems[currentIndex];

  return (
    <Card className="p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-blue-600" />
          Current Affairs
        </h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={prevSlide}
            className="h-8 w-8 bg-white"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={nextSlide}
            className="h-8 w-8 bg-white"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg p-4 min-h-[120px] flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-semibold text-blue-600 bg-blue-100 px-2 py-1 rounded">
              {currentItem.category}
            </span>
            <span className="text-xs text-gray-500">{currentItem.date}</span>
          </div>
          <h4 className="text-base font-semibold text-gray-900 mb-2">
            {currentItem.title}
          </h4>
        </div>
        
        <div className="flex items-center justify-between mt-3 pt-3 border-t">
          <div className="flex gap-1">
            {affairsItems.map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex ? 'w-6 bg-blue-600' : 'w-1.5 bg-gray-300'
                }`}
              />
            ))}
          </div>
          <Button variant="link" className="text-sm p-0 h-auto">
            Read More →
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CurrentAffairsSlider;
