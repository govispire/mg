
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface TrueFalseFormProps {
  questionText: string;
  setQuestionText: (text: string) => void;
  options: Array<{ id: string; isCorrect: boolean }>;
  handleCorrectAnswerChange: (id: string) => void;
}

const TrueFalseForm: React.FC<TrueFalseFormProps> = ({
  questionText,
  setQuestionText,
  options,
  handleCorrectAnswerChange
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Question</label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter the true/false statement here..."
        />
      </div>
      <div className="flex gap-4">
        <div className="flex items-center gap-2">
          <input
            type="radio"
            checked={options[0].isCorrect}
            onChange={() => handleCorrectAnswerChange('A')}
            className="h-4 w-4"
          />
          <label>True</label>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="radio"
            checked={options[1].isCorrect}
            onChange={() => handleCorrectAnswerChange('B')}
            className="h-4 w-4"
          />
          <label>False</label>
        </div>
      </div>
    </div>
  );
};

export default TrueFalseForm;
