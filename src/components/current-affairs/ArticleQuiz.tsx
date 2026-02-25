import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, CheckCircle, XCircle, Trophy, ArrowRight, 
  RefreshCcw, Clock, Target, Brain
} from 'lucide-react';
import { Article } from './types';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ArticleQuizProps {
  article: Article;
  onClose: () => void;
}

// Generate quiz questions based on article content
const generateQuizQuestions = (article: Article): QuizQuestion[] => {
  // In a real app, these would come from an API or database
  // For now, we'll generate mock questions based on the article
  const baseQuestions: QuizQuestion[] = [
    {
      id: '1',
      question: `What is the main topic of "${article.title}"?`,
      options: [
        article.topic,
        'International Trade',
        'Sports Update',
        'Technology Innovation'
      ],
      correctAnswer: 0,
      explanation: `The article "${article.title}" primarily discusses ${article.topic}.`
    },
    {
      id: '2',
      question: `Which category does this article belong to?`,
      options: [
        'Sports',
        article.category,
        'Entertainment',
        'Lifestyle'
      ],
      correctAnswer: 1,
      explanation: `This article is categorized under ${article.category}.`
    },
    {
      id: '3',
      question: `What is the importance level of this news?`,
      options: [
        'Low Priority',
        'Medium Priority',
        'High Priority',
        'Critical Priority'
      ],
      correctAnswer: article.importance === 'high' ? 2 : article.importance === 'medium' ? 1 : 0,
      explanation: `This article is marked as ${article.importance} priority for exam preparation.`
    },
    {
      id: '4',
      question: `Which exam category would most benefit from this article?`,
      options: [
        'Banking Exams (IBPS, SBI)',
        'UPSC Civil Services',
        'SSC CGL/CHSL',
        'All of the above'
      ],
      correctAnswer: 3,
      explanation: 'Current affairs are important for all competitive exams including Banking, UPSC, and SSC.'
    },
    {
      id: '5',
      question: `When was this article published?`,
      options: [
        article.date,
        'January 1, 2025',
        'December 15, 2024',
        'February 20, 2025'
      ],
      correctAnswer: 0,
      explanation: `This article was published on ${article.date}.`
    }
  ];

  // Return the number of questions based on article.quizQuestions or default to 5
  const numQuestions = article.quizQuestions || 5;
  return baseQuestions.slice(0, numQuestions);
};

const ArticleQuiz: React.FC<ArticleQuizProps> = ({ article, onClose }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ questionId: string; selected: number; correct: boolean }[]>([]);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [startTime] = useState(Date.now());
  
  const questions = generateQuizQuestions(article);
  const currentQuestion = questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  
  const handleSelectAnswer = (optionIndex: number) => {
    if (selectedAnswer !== null) return;
    
    setSelectedAnswer(optionIndex);
    setShowExplanation(true);
    
    const isCorrect = optionIndex === currentQuestion.correctAnswer;
    setAnswers(prev => [...prev, {
      questionId: currentQuestion.id,
      selected: optionIndex,
      correct: isCorrect
    }]);
    
    if (isCorrect) {
      toast.success('Correct! 🎉');
    } else {
      toast.error('Incorrect. Check the explanation.');
    }
  };
  
  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowExplanation(false);
    } else {
      setQuizCompleted(true);
    }
  };
  
  const handleRestartQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowExplanation(false);
    setAnswers([]);
    setQuizCompleted(false);
  };
  
  const getScore = () => answers.filter(a => a.correct).length;
  const getTimeTaken = () => Math.round((Date.now() - startTime) / 1000);
  const getPercentage = () => Math.round((getScore() / questions.length) * 100);
  
  if (quizCompleted) {
    const score = getScore();
    const percentage = getPercentage();
    const timeTaken = getTimeTaken();
    
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center pb-2">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="mx-auto mb-4"
          >
            {percentage >= 80 ? (
              <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
                <Trophy className="h-10 w-10 text-green-500" />
              </div>
            ) : percentage >= 50 ? (
              <div className="w-20 h-20 rounded-full bg-yellow-500/20 flex items-center justify-center">
                <Target className="h-10 w-10 text-yellow-500" />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center">
                <Brain className="h-10 w-10 text-red-500" />
              </div>
            )}
          </motion.div>
          <CardTitle className="text-2xl">Quiz Completed!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl font-bold text-primary"
            >
              {score}/{questions.length}
            </motion.p>
            <p className="text-muted-foreground">Correct Answers</p>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold text-green-600">{percentage}%</p>
              <p className="text-xs text-muted-foreground">Accuracy</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{timeTaken}s</p>
              <p className="text-xs text-muted-foreground">Time Taken</p>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <p className="text-2xl font-bold">{questions.length}</p>
              <p className="text-xs text-muted-foreground">Questions</p>
            </div>
          </div>
          
          {percentage >= 80 && (
            <div className="text-center p-4 rounded-lg bg-green-500/10 border border-green-500/20">
              <p className="text-green-600 font-medium">🎉 Excellent! You've mastered this topic!</p>
            </div>
          )}
          
          {percentage >= 50 && percentage < 80 && (
            <div className="text-center p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
              <p className="text-yellow-600 font-medium">👍 Good effort! Review the article to improve.</p>
            </div>
          )}
          
          {percentage < 50 && (
            <div className="text-center p-4 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-red-600 font-medium">📚 Keep learning! Re-read the article and try again.</p>
            </div>
          )}
          
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={handleRestartQuiz}>
              <RefreshCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button className="flex-1" onClick={onClose}>
              Done
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="gap-1">
            <Zap className="h-3 w-3" />
            Quiz
          </Badge>
          <span className="text-sm text-muted-foreground">
            Question {currentQuestionIndex + 1} of {questions.length}
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-1">{currentQuestion.question}</h3>
          <p className="text-sm text-muted-foreground">
            Based on: {article.title}
          </p>
        </div>
        
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            {currentQuestion.options.map((option, index) => {
              const isSelected = selectedAnswer === index;
              const isCorrect = index === currentQuestion.correctAnswer;
              const showResult = selectedAnswer !== null;
              
              let bgClass = 'bg-muted/50 hover:bg-muted border-transparent';
              if (showResult) {
                if (isCorrect) {
                  bgClass = 'bg-green-500/10 border-green-500 text-green-700';
                } else if (isSelected && !isCorrect) {
                  bgClass = 'bg-red-500/10 border-red-500 text-red-700';
                } else {
                  bgClass = 'bg-muted/30 border-transparent opacity-50';
                }
              }
              
              return (
                <motion.button
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  onClick={() => handleSelectAnswer(index)}
                  disabled={selectedAnswer !== null}
                  className={`w-full p-4 rounded-lg border-2 text-left transition-all flex items-center gap-3 ${bgClass} ${
                    selectedAnswer === null ? 'cursor-pointer' : 'cursor-default'
                  }`}
                >
                  <span className="w-8 h-8 rounded-full bg-background flex items-center justify-center font-medium text-sm border">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span className="flex-1">{option}</span>
                  {showResult && isCorrect && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {showResult && isSelected && !isCorrect && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </motion.button>
              );
            })}
          </AnimatePresence>
        </div>
        
        {showExplanation && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-lg bg-primary/5 border border-primary/20"
          >
            <p className="text-sm font-medium text-primary mb-1">Explanation:</p>
            <p className="text-sm text-muted-foreground">{currentQuestion.explanation}</p>
          </motion.div>
        )}
        
        {selectedAnswer !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-end"
          >
            <Button onClick={handleNextQuestion} className="gap-2">
              {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'See Results'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticleQuiz;
