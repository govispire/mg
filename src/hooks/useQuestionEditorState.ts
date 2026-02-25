
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useQuestionEditorState = (onClose: () => void) => {
  const { toast } = useToast();
  const [showQuestionEditor, setShowQuestionEditor] = useState(false);
  const [showBatchEditor, setShowBatchEditor] = useState(false);
  const [showQuantityDialog, setShowQuantityDialog] = useState(false);
  const [showTestPreview, setShowTestPreview] = useState(false);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionNumber, setCurrentQuestionNumber] = useState(1);
  const [questionQuantity, setQuestionQuantity] = useState(1);

  const handleAddQuestion = (sectionIndex: number, sections: any[], questions: any[]) => {
    setCurrentSectionIndex(sectionIndex);
    setShowQuantityDialog(true);
    
    // Check if there's already a question for this section
    const sectionQuestions = questions.filter(
      q => q.section === sections[sectionIndex].name
    );
    
    setCurrentQuestionNumber(sectionQuestions.length + 1);
    
    // Calculate remaining questions for this section
    const remainingQuestions = sections[sectionIndex].questions - sectionQuestions.length;
    setQuestionQuantity(Math.min(5, Math.max(1, remainingQuestions)));
  };

  const handleQuantityConfirm = (quantity: number) => {
    setQuestionQuantity(quantity);
    
    if (quantity === 1) {
      // Show single question editor for just 1 question
      setShowQuestionEditor(true);
    } else {
      // Show batch editor for multiple questions
      setShowBatchEditor(true);
    }
    
    setShowQuantityDialog(false);
  };

  const handleSaveQuestion = (questionData: any, questions: any[], setQuestions: (questions: any[]) => void) => {
    setQuestions([...questions, questionData]);
    setShowQuestionEditor(false);
    
    toast({
      title: "Question Added",
      description: `Question ${questionData.number} added to ${questionData.section}.`,
    });
  };

  const handleSaveBatchQuestions = (batchQuestions: any[], questions: any[], setQuestions: (questions: any[]) => void) => {
    setQuestions([...questions, ...batchQuestions]);
    setShowBatchEditor(false);
  };

  const handleViewQuestion = (question: any) => {
    // In a real implementation, this would open a dialog to view/edit the question
    toast({
      title: "View Question",
      description: `Viewing question ${question.number} from ${question.section}.`,
    });
  };

  const handleDeleteQuestion = (questionIndex: number, questions: any[], setQuestions: (questions: any[]) => void) => {
    const updatedQuestions = [...questions];
    updatedQuestions.splice(questionIndex, 1);
    setQuestions(updatedQuestions);
    
    toast({
      title: "Question Deleted",
      description: "The question has been removed from the test.",
    });
  };

  return {
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
  };
};
