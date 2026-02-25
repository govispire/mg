
import React from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Check } from 'lucide-react';
import { type Exam } from '@/data/examData';
import { useSelectedExams } from '@/hooks/useSelectedExams';
import { toast } from 'sonner';

interface ExamCardProps {
  exam: Exam;
  category: string;
  showPopularBadge?: boolean;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, category, showPopularBadge = true }) => {
  const { isExamSelected, toggleExamSelection } = useSelectedExams();
  const isSelected = isExamSelected(exam.id);

  const handleToggleSelection = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    const added = toggleExamSelection({
      id: exam.id,
      name: exam.name,
      logo: exam.logo,
      category: category,
      addedAt: Date.now()
    });

    if (added) {
      toast.success(`${exam.name} added to your selected exams!`);
    } else {
      toast.info(`${exam.name} removed from your selected exams`);
    }
  };

  return (
    <div className="block w-full relative group">
      <Link to={`/student/tests/${category}/${exam.id}`} className="block w-full">
        <Card className="flex flex-col items-center p-2 sm:p-3 md:p-4 hover:shadow-lg transition-all duration-200 h-full min-h-[90px] sm:min-h-[110px] md:min-h-[130px] hover:scale-105 relative">
          <div className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 mb-2 sm:mb-3 flex items-center justify-center flex-shrink-0">
            <img 
              src={exam.logo} 
              alt={exam.logoAlt || exam.name} 
              className="max-h-full max-w-full object-contain" 
            />
          </div>
          <h3 className="font-medium text-center text-[9px] sm:text-[10px] md:text-xs leading-tight px-1 line-clamp-2 flex-grow flex items-center">
            {exam.name}
          </h3>
          {showPopularBadge && exam.isPopular && (
            <span className="bg-blue-100 text-blue-800 text-[7px] sm:text-[8px] md:text-[10px] px-1 py-0.5 sm:px-1.5 sm:py-0.5 rounded-full mt-1 sm:mt-2 whitespace-nowrap absolute -top-1 -right-1">
              Popular
            </span>
          )}
        </Card>
      </Link>
      
      {/* Selection Button */}
      <Button
        size="icon"
        variant={isSelected ? "default" : "secondary"}
        className={`absolute -top-2 -left-2 h-7 w-7 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity z-10 ${
          isSelected ? 'opacity-100' : ''
        }`}
        onClick={handleToggleSelection}
      >
        {isSelected ? (
          <Check className="h-4 w-4" />
        ) : (
          <Plus className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
};
