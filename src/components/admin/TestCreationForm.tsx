
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { FilePlus, Save, X } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useTestCreationForm } from '@/hooks/useTestCreationForm';
import { useQuestionEditorState } from '@/hooks/useQuestionEditorState';
import { QuestionEditor } from './QuestionEditor';
import { QuestionQuantityDialog } from './QuestionQuantityDialog';
import { BatchQuestionEditor } from './BatchQuestionEditor';
import { TestPreview } from './TestPreview';

// Import the tab components
import BasicInfoTab from './test-creation/BasicInfoTab';
import SectionsTab from './test-creation/SectionsTab';
import QuestionsTab from './test-creation/QuestionsTab';
import SettingsTab from './test-creation/SettingsTab';
import MobileTestCreation from './test-creation/MobileTestCreation';

interface TestCreationFormProps {
  onClose: () => void;
}

export const TestCreationForm: React.FC<TestCreationFormProps> = ({ onClose }) => {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('basic');
  
  const {
    formData,
    selectedCategory,
    availableSections,
    questions,
    setQuestions,
    handleInputChange,
    handleSectionChange,
    handleAddSection,
    handleRemoveSection,
    handleSaveTest,
    countSectionQuestions
  } = useTestCreationForm(onClose);

  const {
    showQuestionEditor,
    setShowQuestionEditor,
    showBatchEditor,
    setShowBatchEditor,
    showQuantityDialog,
    setShowQuantityDialog,
    showTestPreview,
    setShowTestPreview,
    currentSectionIndex,
    currentQuestionNumber,
    questionQuantity,
    handleAddQuestion,
    handleQuantityConfirm,
    handleSaveQuestion,
    handleSaveBatchQuestions,
    handleViewQuestion,
    handleDeleteQuestion
  } = useQuestionEditorState(onClose);

  const handleAddQuestionWrapper = (index: number) => {
    handleAddQuestion(index, formData.sections, questions);
  };

  const handleSaveQuestionWrapper = (questionData: any) => {
    handleSaveQuestion(questionData, questions, setQuestions);
  };

  const handleSaveBatchQuestionsWrapper = (batchQuestions: any[]) => {
    handleSaveBatchQuestions(batchQuestions, questions, setQuestions);
  };

  const handleDeleteQuestionWrapper = (questionIndex: number) => {
    handleDeleteQuestion(questionIndex, questions, setQuestions);
  };

  return (
    <>
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <div className="flex items-center">
              <FilePlus className="h-5 w-5 mr-2" />
              Create New Test
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </CardTitle>
        </CardHeader>
        
        <CardContent>
          {isMobile ? (
            <MobileTestCreation
              formData={formData}
              questions={questions}
              handleInputChange={handleInputChange}
              handleSectionChange={handleSectionChange}
              handleAddSection={handleAddSection}
              handleRemoveSection={handleRemoveSection}
              handleAddQuestion={handleAddQuestionWrapper}
              handleViewQuestion={handleViewQuestion}
              handleDeleteQuestion={handleDeleteQuestionWrapper}
              countSectionQuestions={countSectionQuestions}
              setShowTestPreview={setShowTestPreview}
              onClose={onClose}
              handleSaveTest={handleSaveTest}
            />
          ) : (
            <>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="mb-6">
                  <TabsTrigger value="basic">Basic Info</TabsTrigger>
                  <TabsTrigger value="sections">Test Sections</TabsTrigger>
                  <TabsTrigger value="questions">Questions ({questions.length})</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>
                
                <TabsContent value="basic">
                  <BasicInfoTab
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                </TabsContent>
                
                <TabsContent value="sections">
                  <SectionsTab 
                    formData={formData}
                    handleSectionChange={handleSectionChange}
                    handleRemoveSection={handleRemoveSection}
                    handleAddSection={handleAddSection}
                    handleAddQuestion={handleAddQuestionWrapper}
                    countSectionQuestions={countSectionQuestions}
                  />
                </TabsContent>
                
                <TabsContent value="questions">
                  <QuestionsTab 
                    formData={formData}
                    questions={questions}
                    handleAddQuestion={handleAddQuestionWrapper}
                    handleViewQuestion={handleViewQuestion}
                    handleDeleteQuestion={handleDeleteQuestionWrapper}
                    setShowTestPreview={setShowTestPreview}
                  />
                </TabsContent>
                
                <TabsContent value="settings">
                  <SettingsTab
                    formData={formData}
                    handleInputChange={handleInputChange}
                  />
                </TabsContent>
              </Tabs>
              
              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={onClose}>Cancel</Button>
                <Button onClick={handleSaveTest}>
                  <Save className="h-4 w-4 mr-2" />
                  Save Test
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <Dialog open={showQuestionEditor} onOpenChange={setShowQuestionEditor}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          <QuestionEditor 
            sectionName={formData.sections[currentSectionIndex]?.name || ''} 
            questionNumber={currentQuestionNumber}
            onClose={() => setShowQuestionEditor(false)}
            onSave={handleSaveQuestionWrapper}
          />
        </DialogContent>
      </Dialog>
      
      <QuestionQuantityDialog
        open={showQuantityDialog}
        onClose={() => setShowQuantityDialog(false)}
        onConfirm={handleQuantityConfirm}
        sectionName={formData.sections[currentSectionIndex]?.name || ''}
        maxQuestions={Math.min(
          10,
          formData.sections[currentSectionIndex]?.questions - countSectionQuestions(formData.sections[currentSectionIndex]?.name) || 1
        )}
      />
      
      {showBatchEditor && (
        <Dialog open={showBatchEditor} onOpenChange={setShowBatchEditor}>
          <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto p-0">
            <BatchQuestionEditor 
              sectionName={formData.sections[currentSectionIndex]?.name || ''}
              questionCount={questionQuantity}
              startNumber={currentQuestionNumber}
              questionType="mcq"
              onClose={() => setShowBatchEditor(false)}
              onSave={handleSaveBatchQuestionsWrapper}
            />
          </DialogContent>
        </Dialog>
      )}
      
      <TestPreview 
        open={showTestPreview}
        onClose={() => setShowTestPreview(false)}
        testName={formData.name || 'Untitled Test'}
        questions={questions}
        sections={formData.sections}
      />
    </>
  );
};
