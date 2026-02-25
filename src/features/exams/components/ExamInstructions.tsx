
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

interface ExamInstructionsProps {
  showInstructions: boolean;
  setShowInstructions: (show: boolean) => void;
}

const ExamInstructions: React.FC<ExamInstructionsProps> = ({
  showInstructions,
  setShowInstructions
}) => {
  if (!showInstructions) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-lg w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Exam Instructions</h2>
          <Button variant="ghost" size="sm" onClick={() => setShowInstructions(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="space-y-3 text-sm">
          <p>1. The test consists of multiple sections including General Awareness, Quantitative Aptitude, and more.</p>
          <p>2. Total time allotted for the test is 30 minutes.</p>
          <p>3. Each question carries 1 mark.</p>
          <p>4. There is no negative marking for wrong answers.</p>
          <p>5. You can navigate between questions using the Previous and Next buttons.</p>
          <p>6. You can mark questions for review and come back to them later.</p>
          <p>7. The question palette shows the status of each question:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li className="flex items-center"><span className="h-3 w-3 bg-green-500 rounded-full mr-2"></span> Answered</li>
            <li className="flex items-center"><span className="h-3 w-3 bg-red-500 rounded-full mr-2"></span> Not Answered</li>
            <li className="flex items-center"><span className="h-3 w-3 bg-gray-200 rounded-full mr-2"></span> Not Visited</li>
            <li className="flex items-center"><span className="h-3 w-3 bg-purple-600 rounded-full mr-2"></span> Marked for Review</li>
            <li className="flex items-center"><span className="h-3 w-3 bg-orange-500 rounded-full mr-2"></span> Answered & Marked for Review</li>
          </ul>
          <p>8. Click Submit when you've completed the test.</p>
        </div>
        <div className="mt-6 text-center">
          <Button onClick={() => setShowInstructions(false)}>Close</Button>
        </div>
      </div>
    </div>
  );
};

export default ExamInstructions;
