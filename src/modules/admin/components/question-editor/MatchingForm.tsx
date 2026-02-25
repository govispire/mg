
import React from 'react';
import { Textarea } from '@/components/ui/textarea';

interface MatchingFormProps {
  questionText: string;
  setQuestionText: (text: string) => void;
}

const MatchingForm: React.FC<MatchingFormProps> = ({
  questionText,
  setQuestionText
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Question</label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter the matching question instruction here..."
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        {/* Left column for items */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Items (Column A)</label>
          <Textarea
            placeholder="Enter items separated by new lines"
            className="h-32"
          />
        </div>
        {/* Right column for matches */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Matches (Column B)</label>
          <Textarea
            placeholder="Enter matching items separated by new lines"
            className="h-32"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Correct Matches</label>
        <Textarea
          placeholder="Enter as: '1-B, 2-A, 3-D...' (item number to match letter)"
          className="h-20"
        />
      </div>
    </div>
  );
};

export default MatchingForm;
