
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { questionTypes } from '@/data/examData';

interface QuestionTypeSelectorProps {
  questionType: string;
  setQuestionType: (type: string) => void;
  language: string;
  setLanguage: (language: string) => void;
}

const QuestionTypeSelector: React.FC<QuestionTypeSelectorProps> = ({
  questionType,
  setQuestionType,
  language,
  setLanguage
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Question Type</label>
        <Select 
          value={questionType} 
          onValueChange={setQuestionType}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select question type" />
          </SelectTrigger>
          <SelectContent>
            {questionTypes.map((type) => (
              <SelectItem key={type.id} value={type.id}>
                {type.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium">Language</label>
        <Select 
          value={language} 
          onValueChange={setLanguage}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="english">English</SelectItem>
            <SelectItem value="hindi">Hindi</SelectItem>
            <SelectItem value="bilingual">Bilingual</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
};

export default QuestionTypeSelector;
