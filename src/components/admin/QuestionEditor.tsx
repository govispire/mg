
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Info } from 'lucide-react';
import { useQuestionEditor } from '@/hooks/useQuestionEditor';

// Import sub-components
import QuestionTypeSelector from './question-editor/QuestionTypeSelector';
import MCQForm from './question-editor/MCQForm';
import TrueFalseForm from './question-editor/TrueFalseForm';
import MatchingForm from './question-editor/MatchingForm';
import DIForm from './question-editor/DIForm';
import ExplanationTab from './question-editor/ExplanationTab';
import SettingsTab from './question-editor/SettingsTab';

interface QuestionEditorProps {
  sectionName: string;
  questionNumber: number;
  onClose: () => void;
  onSave: (questionData: any) => void;
}

export const QuestionEditor: React.FC<QuestionEditorProps> = ({ 
  sectionName, 
  questionNumber, 
  onClose, 
  onSave 
}) => {
  const {
    questionType,
    setQuestionType,
    questionText,
    setQuestionText,
    options,
    explanation,
    setExplanation,
    marks,
    setMarks,
    negativeMarks,
    setNegativeMarks,
    difficulty,
    setDifficulty,
    language,
    setLanguage,
    hasImage,
    imagePreview,
    isMultiCorrect,
    setIsMultiCorrect,
    shuffleOptions,
    setShuffleOptions,
    handleImageUpload,
    handleRemoveImage,
    handleOptionChange,
    handleCorrectAnswerChange,
    addOption,
    removeOption,
    handleSave
  } = useQuestionEditor(sectionName, questionNumber, onSave);

  const renderQuestionForm = () => {
    switch (questionType) {
      case 'di':
      case 'comprehensive':
        return (
          <DIForm
            questionText={questionText}
            setQuestionText={setQuestionText}
            options={options}
            handleOptionChange={handleOptionChange}
            handleCorrectAnswerChange={handleCorrectAnswerChange}
            removeOption={removeOption}
            addOption={addOption}
            hasImage={hasImage}
            imagePreview={imagePreview}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
            isMultiCorrect={isMultiCorrect}
          />
        );
      
      case 'truefalse':
        return (
          <TrueFalseForm
            questionText={questionText}
            setQuestionText={setQuestionText}
            options={options}
            handleCorrectAnswerChange={handleCorrectAnswerChange}
          />
        );
      
      case 'matching':
        return (
          <MatchingForm
            questionText={questionText}
            setQuestionText={setQuestionText}
          />
        );
      
      case 'mcq':
      default:
        return (
          <MCQForm
            questionText={questionText}
            setQuestionText={setQuestionText}
            options={options}
            handleOptionChange={handleOptionChange}
            handleCorrectAnswerChange={handleCorrectAnswerChange}
            removeOption={removeOption}
            addOption={addOption}
            hasImage={hasImage}
            imagePreview={imagePreview}
            handleImageUpload={handleImageUpload}
            handleRemoveImage={handleRemoveImage}
            isMultiCorrect={isMultiCorrect}
          />
        );
    }
  };

  return (
    <Card className="w-full mx-auto">
      <CardHeader className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0 pb-2">
        <div>
          <CardTitle className="text-lg">
            {sectionName} - Question {questionNumber}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClose}
          >
            <X className="h-4 w-4 mr-1" />
            Cancel
          </Button>
          <Button 
            size="sm"
            onClick={handleSave}
          >
            <Save className="h-4 w-4 mr-1" />
            Save Question
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <Tabs defaultValue="content" className="w-full">
          <TabsList className="mb-4 w-full grid grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="content">Question Content</TabsTrigger>
            <TabsTrigger value="explanation">Explanation</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="content" className="space-y-4">
            <div className="space-y-4">
              <QuestionTypeSelector
                questionType={questionType}
                setQuestionType={setQuestionType}
                language={language}
                setLanguage={setLanguage}
              />
              
              {renderQuestionForm()}
            </div>
          </TabsContent>
          
          <TabsContent value="explanation" className="space-y-4">
            <ExplanationTab
              explanation={explanation}
              setExplanation={setExplanation}
            />
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <SettingsTab
              marks={marks}
              setMarks={setMarks}
              negativeMarks={negativeMarks}
              setNegativeMarks={setNegativeMarks}
              difficulty={difficulty}
              setDifficulty={setDifficulty}
              isMultiCorrect={isMultiCorrect}
              setIsMultiCorrect={setIsMultiCorrect}
              shuffleOptions={shuffleOptions}
              setShuffleOptions={setShuffleOptions}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <div className="text-xs text-muted-foreground">
          <Info className="h-3 w-3 inline mr-1" />
          Questions saved here will be added to the selected section
        </div>
        <Button 
          onClick={handleSave}
        >
          <Save className="h-4 w-4 mr-2" />
          Save Question
        </Button>
      </CardFooter>
    </Card>
  );
};
