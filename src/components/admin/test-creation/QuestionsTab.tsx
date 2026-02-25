
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Eye, Plus, Trash, ListPlus } from 'lucide-react';

interface QuestionsTabProps {
  formData: any;
  questions: any[];
  handleAddQuestion: (index: number) => void;
  handleViewQuestion: (question: any) => void;
  handleDeleteQuestion: (index: number) => void;
  setShowTestPreview: (show: boolean) => void;
}

const QuestionsTab: React.FC<QuestionsTabProps> = ({
  formData,
  questions,
  handleAddQuestion,
  handleViewQuestion,
  handleDeleteQuestion,
  setShowTestPreview
}) => {
  return (
    <div className="space-y-4">
      {questions.length > 0 ? (
        <div className="space-y-4">
          {formData.sections.map((section: any, sIndex: number) => {
            const sectionQuestions = questions.filter(q => q.section === section.name);
            if (sectionQuestions.length === 0) return null;
            
            return (
              <Card key={sIndex} className="overflow-hidden">
                <CardHeader className="py-3">
                  <CardTitle className="text-base flex justify-between items-center">
                    <span>{section.name} ({sectionQuestions.length}/{section.questions})</span>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleAddQuestion(sIndex)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Question
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="space-y-2">
                    {sectionQuestions.map((q: any, qIndex: number) => (
                      <div key={qIndex} className="border p-3 rounded-md hover:bg-gray-50">
                        <div className="flex justify-between items-center">
                          <div className="flex-1">
                            <div className="font-medium">Question {q.number}</div>
                            <div className="text-sm truncate max-w-md">
                              {q.text.substring(0, 100)}
                              {q.text.length > 100 ? '...' : ''}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleViewQuestion(q)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleDeleteQuestion(questions.indexOf(q))}
                            >
                              <Trash className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          <Button 
            onClick={() => setShowTestPreview(true)} 
            className="ml-auto flex"
          >
            <Eye className="h-4 w-4 mr-2" />
            Preview Test
          </Button>
        </div>
      ) : (
        <div className="text-center p-8 border border-dashed rounded-md">
          <ListPlus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <h3 className="text-lg font-medium mb-2">No Questions Added Yet</h3>
          <p className="text-sm text-gray-500 mb-4">
            Add questions to each section from the Test Sections tab
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionsTab;
