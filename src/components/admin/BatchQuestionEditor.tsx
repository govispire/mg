
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Save, X } from 'lucide-react';

interface BatchQuestionEditorProps {
  sectionName: string;
  questionCount: number;
  startNumber: number;
  questionType: string;
  onClose: () => void;
  onSave: (questions: any[]) => void;
}

export const BatchQuestionEditor: React.FC<BatchQuestionEditorProps> = ({
  sectionName,
  questionCount,
  startNumber,
  questionType,
  onClose,
  onSave,
}) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('0');
  const [questions, setQuestions] = useState(
    Array(questionCount).fill(null).map((_, index) => ({
      number: startNumber + index,
      type: questionType,
      text: '',
      options: [
        { id: 'A', text: '', isCorrect: false },
        { id: 'B', text: '', isCorrect: false },
        { id: 'C', text: '', isCorrect: false },
        { id: 'D', text: '', isCorrect: false }
      ],
      explanation: '',
      marks: 1,
      negativeMarks: 0.25,
      difficulty: 'moderate',
      language: 'english',
      section: sectionName,
      hasImage: false,
      imageUrl: null,
      isMultiCorrect: false,
      shuffleOptions: false,
    }))
  );

  const handleQuestionChange = (index: number, field: string, value: any) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = {
      ...updatedQuestions[index],
      [field]: value
    };
    setQuestions(updatedQuestions);
  };

  const handleOptionChange = (questionIndex: number, optionId: string, text: string) => {
    const updatedQuestions = [...questions];
    const options = [...updatedQuestions[questionIndex].options];
    const optionIndex = options.findIndex(opt => opt.id === optionId);
    
    if (optionIndex !== -1) {
      options[optionIndex] = { ...options[optionIndex], text };
      updatedQuestions[questionIndex] = {
        ...updatedQuestions[questionIndex],
        options
      };
      setQuestions(updatedQuestions);
    }
  };

  const handleCorrectAnswerChange = (questionIndex: number, optionId: string) => {
    const updatedQuestions = [...questions];
    const question = updatedQuestions[questionIndex];
    const options = [...question.options];
    const isMultiCorrect = question.isMultiCorrect;
    
    const updatedOptions = options.map(opt => 
      isMultiCorrect 
        ? opt.id === optionId ? { ...opt, isCorrect: !opt.isCorrect } : opt
        : { ...opt, isCorrect: opt.id === optionId }
    );
    
    updatedQuestions[questionIndex] = {
      ...updatedQuestions[questionIndex],
      options: updatedOptions
    };
    setQuestions(updatedQuestions);
  };

  const handleSave = () => {
    // Validate questions
    const invalidQuestions = questions.filter(q => !q.text.trim());
    if (invalidQuestions.length > 0) {
      toast({
        title: "Missing question text",
        description: `Please fill in the text for all questions before saving.`,
        variant: "destructive"
      });
      return;
    }

    // Check for correct answers
    const missingAnswers = questions.filter(q => !q.options.some(opt => opt.isCorrect));
    if (missingAnswers.length > 0) {
      toast({
        title: "Missing correct answers",
        description: `Please select at least one correct answer for all questions.`,
        variant: "destructive"
      });
      return;
    }

    onSave(questions);
    toast({
      title: "Questions saved",
      description: `${questions.length} questions have been added successfully.`,
    });
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div>
            Batch Create Questions: {sectionName}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="flex-wrap">
            {questions.map((_, index) => (
              <TabsTrigger key={index} value={index.toString()}>
                Question {startNumber + index}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {questions.map((question, index) => (
            <TabsContent key={index} value={index.toString()} className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Question Text</label>
                  <Textarea
                    value={question.text}
                    onChange={(e) => handleQuestionChange(index, 'text', e.target.value)}
                    placeholder={`Enter question ${startNumber + index} text...`}
                    className="min-h-[100px]"
                  />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Options</label>
                  <div className="space-y-3">
                    {question.options.map((option) => (
                      <div key={option.id} className="flex items-start gap-2">
                        <div className="shrink-0 pt-1">
                          <input
                            type={question.isMultiCorrect ? "checkbox" : "radio"}
                            checked={option.isCorrect}
                            onChange={() => handleCorrectAnswerChange(index, option.id)}
                            className="h-4 w-4"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium w-6">{option.id}.</span>
                            <Input
                              value={option.text}
                              onChange={(e) => handleOptionChange(index, option.id, e.target.value)}
                              placeholder={`Option ${option.id}`}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Marks</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.5"
                      value={question.marks}
                      onChange={(e) => handleQuestionChange(index, 'marks', Number(e.target.value))}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Difficulty Level</label>
                    <Select 
                      value={question.difficulty} 
                      onValueChange={(value) => handleQuestionChange(index, 'difficulty', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="moderate">Moderate</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Negative Marks</label>
                    <Input
                      type="number"
                      min="0"
                      step="0.25"
                      value={question.negativeMarks}
                      onChange={(e) => handleQuestionChange(index, 'negativeMarks', Number(e.target.value))}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Explanation (Optional)</label>
                  <Textarea
                    value={question.explanation}
                    onChange={(e) => handleQuestionChange(index, 'explanation', e.target.value)}
                    placeholder="Enter explanation for the correct answer..."
                    className="min-h-[100px]"
                  />
                </div>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
      
      <CardFooter className="flex justify-between pt-4">
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save All Questions
        </Button>
      </CardFooter>
    </Card>
  );
};
