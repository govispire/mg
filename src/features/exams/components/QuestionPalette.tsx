
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuestionPaletteProps {
  showQuestionPalette: boolean;
  toggleQuestionPalette: () => void;
  isMobile: boolean;
  currentQuestion: {
    id: number;
    section: string;
  };
  mockQuestions: Array<{
    id: number;
    section: string;
    question: string;
    options: string[];
    answer: number | null;
    type: string;
  }>;
  getQuestionStatus: (questionId: number) => {
    status: string;
    label: string;
    bgColor: string;
    textColor: string;
  };
  getPaletteStats: () => {
    answered: number;
    notAnswered: number;
    marked: number;
    answeredMarked: number;
    notVisited: number;
    total: number;
  };
  goToQuestion: (questionId: number) => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  showQuestionPalette,
  toggleQuestionPalette,
  isMobile,
  currentQuestion,
  mockQuestions,
  getQuestionStatus,
  getPaletteStats,
  goToQuestion
}) => {
  if (!showQuestionPalette) return null;
  
  return (
    <div className="border-t">
      {/* Mobile toggle for question palette */}
      {isMobile && (
        <div className="p-2 bg-white border-b flex justify-center">
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleQuestionPalette}
            className="w-full sm:w-auto"
          >
            {showQuestionPalette ? 'Hide Question Palette' : 'Show Question Palette'}
          </Button>
        </div>
      )}
      
      <div className="bg-white p-3">
        <div className="mb-1">
          <h3 className="font-medium text-sm">{currentQuestion.section}</h3>
          <div className="text-sm mb-1">Choose a Question</div>
        </div>
        
        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-3">
          {mockQuestions.map((question) => {
            const status = getQuestionStatus(question.id);
            return (
              <button
                key={question.id}
                onClick={() => goToQuestion(question.id)}
                className={`h-10 w-full flex items-center justify-center rounded-md 
                  ${status.bgColor} ${status.textColor} text-sm
                  ${currentQuestion.id === question.id 
                    ? 'ring-2 ring-blue-500 ring-offset-1' 
                    : ''}`}
              >
                {question.id}
              </button>
            );
          })}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-1 text-xs">
          <div className="flex items-center">
            <span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span>
            <span>Answered ({getPaletteStats().answered})</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 bg-red-500 rounded-full mr-2"></span>
            <span>Not Answered ({getPaletteStats().notAnswered})</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 bg-purple-600 rounded-full mr-2"></span>
            <span>Marked ({getPaletteStats().marked})</span>
          </div>
          <div className="flex items-center">
            <span className="h-3 w-3 bg-orange-500 rounded-full mr-2"></span>
            <span>Answered & Marked ({getPaletteStats().answeredMarked})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
