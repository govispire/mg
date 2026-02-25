
import React from 'react';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronRight, Plus, Trash, Eye, Save } from 'lucide-react';
import BasicInfoTab from './BasicInfoTab';
import SettingsTab from './SettingsTab';

interface MobileTestCreationProps {
  formData: any;
  questions: any[];
  handleInputChange: (field: string, value: string | number | boolean) => void;
  handleSectionChange: (index: number, field: string, value: string | number) => void;
  handleAddSection: () => void;
  handleRemoveSection: (index: number) => void;
  handleAddQuestion: (index: number) => void;
  handleViewQuestion: (question: any) => void;
  handleDeleteQuestion: (questionIndex: number) => void;
  countSectionQuestions: (sectionName: string) => number;
  setShowTestPreview: (show: boolean) => void;
  onClose: () => void;
  handleSaveTest: () => void;
}

const MobileTestCreation: React.FC<MobileTestCreationProps> = ({
  formData,
  questions,
  handleInputChange,
  handleSectionChange,
  handleAddSection,
  handleRemoveSection,
  handleAddQuestion,
  handleViewQuestion,
  handleDeleteQuestion,
  countSectionQuestions,
  setShowTestPreview,
  onClose,
  handleSaveTest
}) => {
  return (
    <div className="w-full">
      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="basic-info">
          <AccordionTrigger className="text-lg font-medium">
            Basic Test Information
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-4">
            <BasicInfoTab 
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="sections">
          <AccordionTrigger className="text-lg font-medium">
            Test Sections
          </AccordionTrigger>
          <AccordionContent className="pb-6 space-y-6">
            {formData.sections.map((section: any, index: number) => (
              <Collapsible key={index} className="border rounded-md">
                <CollapsibleTrigger className="flex justify-between items-center w-full p-4">
                  <div>
                    <h3 className="font-medium">{section.name}</h3>
                    <div className="text-sm text-gray-500">
                      {section.questions} questions, {section.marks} marks
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 transition-transform ui-expanded:rotate-90" />
                </CollapsibleTrigger>
                <CollapsibleContent className="px-4 pb-4 space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Section Name</label>
                    <input 
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      value={section.name} 
                      onChange={(e) => handleSectionChange(index, 'name', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">No. of Questions</label>
                    <input 
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      type="number" 
                      value={section.questions} 
                      onChange={(e) => handleSectionChange(index, 'questions', e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Total Marks</label>
                    <input 
                      className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                      type="number" 
                      value={section.marks} 
                      onChange={(e) => handleSectionChange(index, 'marks', e.target.value)} 
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleAddQuestion(index)}
                      className="flex-1"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Questions ({countSectionQuestions(section.name)}/{section.questions})
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleRemoveSection(index)}
                      disabled={formData.sections.length === 1}
                      className="text-red-500"
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            ))}
            
            <Button onClick={handleAddSection} className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              Add Section
            </Button>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="questions">
          <AccordionTrigger className="text-lg font-medium">
            Questions ({questions.length})
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            {questions.length > 0 ? (
              <div className="space-y-4">
                {formData.sections.map((section: any, sIndex: number) => {
                  const sectionQuestions = questions.filter(q => q.section === section.name);
                  if (sectionQuestions.length === 0) return null;
                  
                  return (
                    <div key={sIndex} className="border rounded-md p-4">
                      <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium">{section.name}</h3>
                        <span className="text-sm text-gray-500">
                          {sectionQuestions.length}/{section.questions} questions
                        </span>
                      </div>
                      <div className="space-y-2">
                        {sectionQuestions.map((q: any, qIndex: number) => (
                          <div key={qIndex} className="bg-gray-50 p-2 rounded flex justify-between items-center">
                            <div className="truncate flex-1">
                              <span className="font-medium">Q{q.number}.</span> {q.text.substring(0, 50)}
                              {q.text.length > 50 ? '...' : ''}
                            </div>
                            <div className="flex gap-1">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleViewQuestion(q)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleDeleteQuestion(questions.indexOf(q))}
                              >
                                <Trash className="h-3.5 w-3.5 text-red-500" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleAddQuestion(sIndex)}
                          className="w-full mt-2"
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Add Question
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <Button 
                  onClick={() => setShowTestPreview(true)} 
                  className="w-full mt-4"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview Test
                </Button>
              </div>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-md">
                <Plus className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                <h3 className="text-lg font-medium mb-2">No Questions Added Yet</h3>
                <p className="text-sm text-gray-500 mb-4">
                  Add questions to each section from the Test Sections tab
                </p>
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="settings">
          <AccordionTrigger className="text-lg font-medium">
            Test Settings
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <SettingsTab
              formData={formData}
              handleInputChange={handleInputChange}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
      
      <div className="mt-6 flex justify-between">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveTest}>
          <Save className="h-4 w-4 mr-2" />
          Save Test
        </Button>
      </div>
    </div>
  );
};

export default MobileTestCreation;
