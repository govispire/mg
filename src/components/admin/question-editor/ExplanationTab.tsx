
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Image } from 'lucide-react';

interface ExplanationTabProps {
  explanation: string;
  setExplanation: (text: string) => void;
}

const ExplanationTab: React.FC<ExplanationTabProps> = ({
  explanation,
  setExplanation
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Explanation for Correct Answer</label>
        <Textarea
          value={explanation}
          onChange={(e) => setExplanation(e.target.value)}
          placeholder="Enter explanation for the correct answer..."
          className="min-h-[200px]"
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium flex items-center">
          <Image className="h-4 w-4 mr-2" />
          Upload Explanation Image (Optional)
        </label>
        <Input
          type="file"
          accept="image/*"
          className="max-w-md"
        />
      </div>
    </div>
  );
};

export default ExplanationTab;
