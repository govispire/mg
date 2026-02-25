
import React from 'react';
import { Button } from '@/components/ui/button';

interface QuestionControlsProps {
  markForReviewAndNext: () => void;
  clearResponse: () => void;
  goToPreviousQuestion: () => void;
  saveAndNext: () => void;
  handleSubmit: () => void;
  isPreview: boolean;
}

const QuestionControls: React.FC<QuestionControlsProps> = ({
  markForReviewAndNext,
  clearResponse,
  goToPreviousQuestion,
  saveAndNext,
  handleSubmit,
  isPreview
}) => {
  return (
    <div className="bg-white p-3 border-t flex flex-wrap md:flex-nowrap gap-2 md:justify-between">
      <Button 
        variant="outline" 
        onClick={markForReviewAndNext}
        className="flex-1 md:w-auto text-sm"
      >
        Mark for Review & Next
      </Button>
      
      <Button 
        variant="outline" 
        onClick={clearResponse}
        className="flex-1 md:w-auto text-sm"
      >
        Clear Response
      </Button>
      
      <Button 
        variant="outline" 
        onClick={goToPreviousQuestion}
        className="flex-1 md:w-auto text-sm"
      >
        Previous
      </Button>
      
      <Button 
        onClick={saveAndNext}
        className="flex-1 md:w-auto bg-blue-600 hover:bg-blue-700 text-white text-sm"
      >
        Save & Next
      </Button>
      
      <Button 
        variant="outline" 
        className="flex-1 md:w-auto bg-cyan-500 hover:bg-cyan-600 text-white text-sm"
        onClick={handleSubmit}
      >
        {isPreview ? "Exit Preview" : "Submit"}
      </Button>
    </div>
  );
};

export default QuestionControls;
