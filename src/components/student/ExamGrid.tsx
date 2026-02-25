
import React from 'react';
import { ExamCard } from './ExamCard';
import { type Exam } from '@/data/examData';

interface ExamGridProps {
  exams: Exam[];
  category: string;
  showPopularOnly?: boolean;
  title?: string;
}

export const ExamGrid: React.FC<ExamGridProps> = ({ 
  exams, 
  category, 
  showPopularOnly = false,
  title 
}) => {
  const filteredExams = showPopularOnly ? exams.filter(exam => exam.isPopular) : exams;

  return (
    <div className="container mx-auto px-4 max-w-7xl">
      {title && <h2 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4">{title}</h2>}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3 md:gap-4">
        {filteredExams.length > 0 ? (
          filteredExams.map((exam) => (
            <ExamCard 
              key={exam.id} 
              exam={exam} 
              category={category} 
              showPopularBadge={showPopularOnly}
            />
          ))
        ) : (
          <div className="col-span-full text-center py-8 sm:py-12">
            <p className="text-gray-500 text-sm sm:text-base">No exams found for this category or search query</p>
          </div>
        )}
      </div>
    </div>
  );
};
