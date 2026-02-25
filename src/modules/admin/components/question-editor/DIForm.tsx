
import React from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Image, X, Plus, Trash } from 'lucide-react';

interface DIFormProps {
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

const DIForm: React.FC<DIFormProps> = ({
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
    <div className="grid md:grid-cols-2 gap-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Content</label>
          <Textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            className="min-h-[200px]"
            placeholder="Enter your data interpretation text or instruction here..."
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center">
            <Image className="h-4 w-4 mr-2" />
            Upload Image/Chart
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="max-w-sm"
            />
            {hasImage && (
              <Button 
                variant="outline" 
                size="icon"
                onClick={handleRemoveImage}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
          {imagePreview && (
            <div className="mt-2 border rounded p-2">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="max-h-[300px] mx-auto"
              />
            </div>
          )}
        </div>
      </div>
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Question Text</label>
          <Textarea
            placeholder="Enter sub-question here..."
            className="min-h-[100px]"
          />
        </div>
        <div className="space-y-4">
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
    </div>
  );
};

export default DIForm;
