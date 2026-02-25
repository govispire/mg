
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Trash, Image, Plus } from 'lucide-react';

interface MCQFormProps {
  questionText: string;
  setQuestionText: (text: string) => void;
  options: Array<{ id: string; text: string; isCorrect: boolean }>;
  handleOptionChange: (id: string, text: string) => void;
  handleCorrectAnswerChange: (id: string) => void;
  removeOption: (id: string) => void;
  addOption: () => void;
  hasImage: boolean;
  imagePreview: string | null;
  handleImageUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemoveImage: () => void;
  isMultiCorrect: boolean;
}

const MCQForm: React.FC<MCQFormProps> = ({
  questionText,
  setQuestionText,
  options,
  handleOptionChange,
  handleCorrectAnswerChange,
  removeOption,
  addOption,
  hasImage,
  imagePreview,
  handleImageUpload,
  handleRemoveImage,
  isMultiCorrect
}) => {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Question</label>
        <Textarea
          value={questionText}
          onChange={(e) => setQuestionText(e.target.value)}
          placeholder="Enter your question here..."
        />
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium flex items-center">
            <Image className="h-4 w-4 mr-2" />
            Upload Image (Optional)
          </label>
          {hasImage && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleRemoveImage}
              className="text-red-500"
            >
              <Trash className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
        {!hasImage && (
          <Input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="max-w-md"
          />
        )}
        {imagePreview && (
          <div className="mt-2 border rounded p-2">
            <img 
              src={imagePreview} 
              alt="Preview" 
              className="max-h-[200px] mx-auto"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Options</label>
        <div className="space-y-3">
          {options.map((option) => (
            <div key={option.id} className="flex items-start gap-2">
              <div className="shrink-0 pt-1">
                <input
                  type={isMultiCorrect ? "checkbox" : "radio"}
                  checked={option.isCorrect}
                  onChange={() => handleCorrectAnswerChange(option.id)}
                  className="h-4 w-4"
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium w-6">{option.id}.</span>
                  <Input
                    value={option.text}
                    onChange={(e) => handleOptionChange(option.id, e.target.value)}
                    placeholder={`Option ${option.id}`}
                  />
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeOption(option.id)}
                className="shrink-0"
              >
                <Trash className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
        </div>
        {options.length < 6 && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={addOption} 
            className="mt-2"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Option
          </Button>
        )}
      </div>
    </div>
  );
};

export default MCQForm;
