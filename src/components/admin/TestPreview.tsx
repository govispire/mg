
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface TestQuestion {
  number: number;
  text: string;
  section: string;
  options?: { id: string; text: string; isCorrect: boolean }[];
  imageUrl?: string | null;
  type: string;
}

interface TestPreviewProps {
  open: boolean;
  onClose: () => void;
  testName: string;
  questions: TestQuestion[];
  sections: { name: string }[];
}

export const TestPreview: React.FC<TestPreviewProps> = ({
  open,
  onClose,
  testName,
  questions,
  sections,
}) => {
  const isMobile = useIsMobile();
  const [activeSection, setActiveSection] = useState(sections[0]?.name || '');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  
  // Group questions by section
  const questionsBySection = sections.reduce((acc, section) => {
    acc[section.name] = questions.filter(q => q.section === section.name);
    return acc;
  }, {} as Record<string, TestQuestion[]>);

  const currentSectionQuestions = questionsBySection[activeSection] || [];
  const currentQuestion = currentSectionQuestions[currentQuestionIndex];
  
  const handleNext = () => {
    if (currentQuestionIndex < currentSectionQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };
  
  const handlePrev = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Test Preview: {testName}</DialogTitle>
        </DialogHeader>
        
        <Tabs 
          defaultValue={activeSection} 
          value={activeSection}
          onValueChange={setActiveSection}
          className="w-full"
        >
          <TabsList className={`${isMobile ? 'flex-wrap' : ''}`}>
            {sections.map(section => (
              <TabsTrigger 
                key={section.name} 
                value={section.name}
                onClick={() => setCurrentQuestionIndex(0)}
              >
                {section.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {sections.map(section => (
            <TabsContent key={section.name} value={section.name} className="mt-4">
              {questionsBySection[section.name]?.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      Question {currentQuestionIndex + 1} of {currentSectionQuestions.length}
                    </span>
                    <div className="flex gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handlePrev}
                        disabled={currentQuestionIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Previous
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleNext}
                        disabled={currentQuestionIndex === currentSectionQuestions.length - 1}
                      >
                        Next
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="pt-6">
                      {currentQuestion && (
                        <div className="space-y-4">
                          <div className="font-medium">
                            Q{currentQuestion.number}. {currentQuestion.text}
                          </div>
                          
                          {currentQuestion.imageUrl && (
                            <div className="my-4 border rounded p-2">
                              <img 
                                src={currentQuestion.imageUrl} 
                                alt="Question Image" 
                                className="max-h-[200px] mx-auto"
                              />
                            </div>
                          )}
                          
                          {currentQuestion.options && (
                            <div className="space-y-3 mt-4">
                              {currentQuestion.options.map((option) => (
                                <div key={option.id} className="flex items-start gap-2">
                                  <div className="shrink-0 pt-1">
                                    <input
                                      type="radio"
                                      name={`question-${currentQuestion.number}`}
                                      disabled
                                      className="h-4 w-4"
                                    />
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium w-6">{option.id}.</span>
                                    <span>{option.text}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div className="text-center py-10 border border-dashed rounded-md">
                  <p className="text-gray-500">No questions in this section</p>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close Preview</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
