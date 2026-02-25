
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface Question {
  id: number;
  section: string;
  type: string;
  question: string;
  options: string[];
  answer: number | null;
}

export const useExamState = (mockQuestions: Question[], isPreview: boolean = false) => {
  const navigate = useNavigate();
  const [currentSection, setCurrentSection] = useState('General Awareness');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<{[key: number]: number | null}>({});
  const [markedForReview, setMarkedForReview] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 minutes in seconds
  const [showInstructions, setShowInstructions] = useState(false);
  const [language, setLanguage] = useState('English');
  const [visitedQuestions, setVisitedQuestions] = useState<number[]>([]);
  
  // Current question data
  const currentQuestion = mockQuestions[currentQuestionIndex] || mockQuestions[0];
  
  // Initialize answers
  useEffect(() => {
    if (mockQuestions.length > 0) {
      const initialAnswers = mockQuestions.reduce((acc, q) => {
        acc[q.id] = null;
        return acc;
      }, {} as {[key: number]: number | null});
      setAnswers(initialAnswers);
      
      // Mark first question as visited
      setVisitedQuestions([mockQuestions[0].id]);
    }
  }, [mockQuestions]);
  
  // Timer countdown
  useEffect(() => {
    if (timeLeft <= 0) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    return () => clearInterval(timer);
  }, [timeLeft]);
  
  // Format time remaining
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  }, []);
  
  // Get filtered questions by section
  const filteredQuestionsBySection = useCallback((section: string) => {
    return mockQuestions.filter(q => q.section === section);
  }, [mockQuestions]);
  
  // Get question position within its section
  const getQuestionPositionInSection = useCallback((questionId: number) => {
    if (!currentQuestion) return 1;
    
    const sectionQuestions = filteredQuestionsBySection(currentQuestion.section);
    const questionObj = mockQuestions.find(q => q.id === questionId);
    if (!questionObj) return 1;
    
    const position = sectionQuestions.findIndex(q => q.id === questionId) + 1;
    return position > 0 ? position : 1;
  }, [currentQuestion, filteredQuestionsBySection, mockQuestions]);
  
  // Handle answer selection
  const handleAnswerSelect = useCallback((questionId: number, optionIndex: number) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: optionIndex
    }));

    // Add to visited questions if not already there
    setVisitedQuestions(prev => 
      prev.includes(questionId) ? prev : [...prev, questionId]
    );
  }, []);
  
  // Handle marking for review
  const toggleMarkForReview = useCallback((questionId: number) => {
    setMarkedForReview(prev => 
      prev.includes(questionId)
        ? prev.filter(id => id !== questionId)
        : [...prev, questionId]
    );
    
    // Add to visited questions if not already there
    setVisitedQuestions(prev => 
      prev.includes(questionId) ? prev : [...prev, questionId]
    );
  }, []);
  
  // Navigate to next question
  const goToNextQuestion = useCallback(() => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      const nextIndex = currentQuestionIndex + 1;
      setCurrentQuestionIndex(nextIndex);
      
      // Mark as visited
      const nextQuestion = mockQuestions[nextIndex];
      if (nextQuestion) {
        setVisitedQuestions(prev => 
          prev.includes(nextQuestion.id) ? prev : [...prev, nextQuestion.id]
        );
      }
    }
  }, [currentQuestionIndex, mockQuestions.length, mockQuestions]);
  
  // Navigate to previous question
  const goToPreviousQuestion = useCallback(() => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  }, [currentQuestionIndex]);
  
  // Clear response for current question
  const clearResponse = useCallback(() => {
    if (currentQuestion) {
      setAnswers(prev => ({
        ...prev,
        [currentQuestion.id]: null
      }));
    }
  }, [currentQuestion]);
  
  // Save and go to next question
  const saveAndNext = useCallback(() => {
    goToNextQuestion();
  }, [goToNextQuestion]);
  
  // Mark for review and go to next question
  const markForReviewAndNext = useCallback(() => {
    if (currentQuestion) {
      toggleMarkForReview(currentQuestion.id);
      goToNextQuestion();
    }
  }, [currentQuestion, toggleMarkForReview, goToNextQuestion]);
  
  // Handle question palette click
  const goToQuestion = useCallback((questionId: number) => {
    const questionIndex = mockQuestions.findIndex(q => q.id === questionId);
    if (questionIndex !== -1) {
      setCurrentQuestionIndex(questionIndex);
      
      // Mark as visited
      setVisitedQuestions(prev => 
        prev.includes(questionId) ? prev : [...prev, questionId]
      );
    }
  }, [mockQuestions]);
  
  // Get status for question in palette
  const getQuestionStatus = useCallback((questionId: number) => {
    const isMarked = markedForReview.includes(questionId);
    const isAnswered = answers[questionId] !== null;
    const isVisited = visitedQuestions.includes(questionId);
    
    if (isMarked && isAnswered) return { 
      status: 'answered-marked',
      label: 'Answered & Marked for Review',
      bgColor: 'bg-orange-500',
      textColor: 'text-white'
    };
    if (isMarked) return { 
      status: 'marked', 
      label: 'Marked for Review',
      bgColor: 'bg-purple-600',
      textColor: 'text-white'
    };
    if (isAnswered) return { 
      status: 'answered', 
      label: 'Answered',
      bgColor: 'bg-green-500',
      textColor: 'text-white'
    };
    if (!isVisited) return { 
      status: 'not-visited', 
      label: 'Not Visited',
      bgColor: 'bg-gray-200',
      textColor: 'text-gray-800'
    };
    return { 
      status: 'not-answered', 
      label: 'Not Answered',
      bgColor: 'bg-red-500',
      textColor: 'text-white'
    };
  }, [markedForReview, answers, visitedQuestions]);
  
  // Get statistics for the question palette
  const getPaletteStats = useCallback(() => {
    const stats = {
      answered: 0,
      notAnswered: 0,
      marked: 0,
      answeredMarked: 0,
      notVisited: 0,
      total: mockQuestions.length
    };
    
    mockQuestions.forEach(q => {
      const isMarked = markedForReview.includes(q.id);
      const isAnswered = answers[q.id] !== null;
      const isVisited = visitedQuestions.includes(q.id);
      
      if (isMarked && isAnswered) stats.answeredMarked++;
      else if (isMarked) stats.marked++;
      else if (isAnswered) stats.answered++;
      else if (isVisited) stats.notAnswered++;
      else stats.notVisited++;
    });
    
    return stats;
  }, [mockQuestions, markedForReview, answers, visitedQuestions]);
  
  // Submit exam
  const handleSubmit = useCallback(() => {
    if (isPreview) {
      navigate(-1);
    } else {
      navigate('/student/tests');
    }
  }, [isPreview, navigate]);

  // Go to first question in a section
  const goToQuestionInSection = useCallback((section: string) => {
    const firstQuestionInSection = mockQuestions.findIndex(q => q.section === section);
    if (firstQuestionInSection !== -1) {
      setCurrentQuestionIndex(firstQuestionInSection);
      const questionId = mockQuestions[firstQuestionInSection].id;
      setVisitedQuestions(prev => 
        prev.includes(questionId) ? prev : [...prev, questionId]
      );
    }
  }, [mockQuestions]);

  return {
    currentSection,
    setCurrentSection,
    currentQuestion,
    currentQuestionIndex,
    answers,
    markedForReview,
    timeLeft,
    showInstructions,
    setShowInstructions,
    language,
    setLanguage,
    visitedQuestions,
    formatTime,
    getQuestionPositionInSection,
    handleAnswerSelect,
    goToQuestion,
    goToPreviousQuestion,
    goToNextQuestion,
    clearResponse,
    saveAndNext,
    markForReviewAndNext,
    getQuestionStatus,
    getPaletteStats,
    handleSubmit,
    goToQuestionInSection
  };
};
