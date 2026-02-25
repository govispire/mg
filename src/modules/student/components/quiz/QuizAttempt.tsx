import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { 
  Clock, ChevronLeft, ChevronRight, Flag, CheckCircle, 
  XCircle, AlertTriangle, Trophy, Target, RotateCcw,
  BookmarkPlus, Bookmark, Flame
} from 'lucide-react';
import { toast } from 'sonner';
import ConfettiCelebration from './ConfettiCelebration';
import { useSoundEffects } from '@/hooks/useSoundEffects';

interface Question {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

interface QuizAttemptProps {
  quizId: string;
  quizTitle: string;
  subject: string;
  duration: number;
  questions: Question[];
  onComplete: (result: QuizResult) => void;
  onExit: () => void;
}

export interface QuizResult {
  quizId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  wrongAnswers: number;
  unanswered: number;
  timeTaken: number;
  answers: { questionId: string; selected: number | null; correct: boolean }[];
}

const QuizAttempt: React.FC<QuizAttemptProps> = ({
  quizId,
  quizTitle,
  subject,
  duration,
  questions,
  onComplete,
  onExit
}) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<(number | null)[]>(new Array(questions.length).fill(null));
  const [markedForReview, setMarkedForReview] = useState<boolean[]>(new Array(questions.length).fill(false));
  const [timeRemaining, setTimeRemaining] = useState(duration * 60);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [confettiType, setConfettiType] = useState<'quiz' | 'streak' | 'milestone'>('quiz');
  const { playSound } = useSoundEffects();

  // Timer logic
  useEffect(() => {
    if (isSubmitted) return;
    
    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isSubmitted]);

  // Warning at 1 minute
  useEffect(() => {
    if (timeRemaining === 60) {
      toast.warning('⏰ Only 1 minute remaining!', {
        description: 'Please review your answers'
      });
    }
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };

  const toggleMarkForReview = () => {
    const newMarked = [...markedForReview];
    newMarked[currentQuestion] = !newMarked[currentQuestion];
    setMarkedForReview(newMarked);
    toast.info(newMarked[currentQuestion] ? 'Marked for review' : 'Unmarked from review');
  };

  const goToQuestion = (index: number) => {
    setCurrentQuestion(index);
  };

  const handleSubmit = useCallback(() => {
    const timeTaken = duration * 60 - timeRemaining;
    
    let correctCount = 0;
    let wrongCount = 0;
    let unansweredCount = 0;
    
    const answerResults = questions.map((q, i) => {
      const selected = answers[i];
      const correct = selected === q.correctAnswer;
      
      if (selected === null) {
        unansweredCount++;
      } else if (correct) {
        correctCount++;
      } else {
        wrongCount++;
      }
      
      return { questionId: q.id, selected, correct };
    });

    const score = Math.round((correctCount / questions.length) * 100);

    const quizResult: QuizResult = {
      quizId,
      score,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      wrongAnswers: wrongCount,
      unanswered: unansweredCount,
      timeTaken,
      answers: answerResults
    };

    setResult(quizResult);
    setIsSubmitted(true);
    setShowResults(true);
    
    // Trigger confetti and sounds for good scores (>= 50%)
    if (score >= 50) {
      // Check for streak milestone from localStorage
      try {
        const storedStreak = localStorage.getItem('streak_data');
        if (storedStreak) {
          const parsed = JSON.parse(storedStreak);
          const currentStreak = parsed.currentStreak || 0;
          // Check if this quiz completion would hit a milestone
          const milestones = [7, 14, 30, 50, 100];
          if (milestones.includes(currentStreak + 1)) {
            setConfettiType('milestone');
            playSound('milestone');
          } else if (currentStreak > 0) {
            setConfettiType('streak');
            playSound('streak');
          } else {
            setConfettiType('quiz');
            playSound('celebration');
          }
        } else {
          playSound('complete');
        }
      } catch (error) {
        setConfettiType('quiz');
        playSound('complete');
      }
      setShowConfetti(true);
      // Reset confetti after animation
      setTimeout(() => setShowConfetti(false), 100);
    } else {
      playSound('complete');
    }
    
    onComplete(quizResult);
  }, [answers, duration, onComplete, questions, quizId, timeRemaining]);

  const getQuestionStatus = (index: number) => {
    if (markedForReview[index]) return 'review';
    if (answers[index] !== null) return 'answered';
    return 'unanswered';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered': return 'bg-green-500 text-white';
      case 'review': return 'bg-yellow-500 text-white';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  if (showResults && result) {
    return (
      <div className="space-y-6 p-6">
        <ConfettiCelebration trigger={showConfetti} type={confettiType} />
        <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="p-8 text-center">
            <div className="mb-6">
              {result.score >= 70 ? (
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
              ) : result.score >= 50 ? (
                <Target className="h-16 w-16 text-primary mx-auto mb-4" />
              ) : (
                <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              )}
              <h2 className="text-3xl font-bold mb-2">Quiz Completed!</h2>
              <p className="text-muted-foreground">{quizTitle}</p>
            </div>
            
            <div className="text-6xl font-bold text-primary mb-4">{result.score}%</div>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-green-500/10 rounded-xl p-4">
                <CheckCircle className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-500">{result.correctAnswers}</p>
                <p className="text-xs text-muted-foreground">Correct</p>
              </div>
              <div className="bg-red-500/10 rounded-xl p-4">
                <XCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                <p className="text-2xl font-bold text-red-500">{result.wrongAnswers}</p>
                <p className="text-xs text-muted-foreground">Wrong</p>
              </div>
              <div className="bg-muted rounded-xl p-4">
                <Flag className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                <p className="text-2xl font-bold">{result.unanswered}</p>
                <p className="text-xs text-muted-foreground">Skipped</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-muted-foreground mb-8">
              <Clock className="h-4 w-4" />
              <span>Time taken: {formatTime(result.timeTaken)}</span>
            </div>

            <div className="flex gap-4 justify-center">
              <Button variant="outline" onClick={onExit}>
                Back to Quizzes
              </Button>
              <Button onClick={() => setShowResults(false)}>
                Review Answers
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = questions[currentQuestion];
  const answeredCount = answers.filter(a => a !== null).length;

  return (
    <div className="space-y-4 p-4 md:p-6">
      {/* Header */}
      <Card className="sticky top-0 z-10 bg-background/95 backdrop-blur">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="font-semibold text-lg">{quizTitle}</h2>
              <p className="text-sm text-muted-foreground">{subject}</p>
            </div>
            <div className="flex items-center gap-4">
              <Card className={`px-4 py-2 ${timeRemaining <= 60 ? 'bg-red-500/10 border-red-500/30 animate-pulse' : 'bg-muted'}`}>
                <div className="flex items-center gap-2">
                  <Clock className={`h-4 w-4 ${timeRemaining <= 60 ? 'text-red-500' : ''}`} />
                  <span className={`font-mono font-bold ${timeRemaining <= 60 ? 'text-red-500' : ''}`}>
                    {formatTime(timeRemaining)}
                  </span>
                </div>
              </Card>
              <Button variant="destructive" size="sm" onClick={handleSubmit}>
                Submit Quiz
              </Button>
            </div>
          </div>
          <Progress value={(answeredCount / questions.length) * 100} className="mt-3 h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {answeredCount} of {questions.length} answered
          </p>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Question Content */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Badge variant="outline" className="text-sm">
                    Question {currentQuestion + 1} of {questions.length}
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    {question.topic}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={toggleMarkForReview}
                  className={markedForReview[currentQuestion] ? 'text-yellow-500' : ''}
                >
                  {markedForReview[currentQuestion] ? (
                    <Bookmark className="h-4 w-4 fill-current" />
                  ) : (
                    <BookmarkPlus className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-lg font-medium leading-relaxed">{question.text}</p>

              <RadioGroup
                value={answers[currentQuestion]?.toString()}
                onValueChange={(value) => handleAnswerSelect(parseInt(value))}
                className="space-y-3"
              >
                {question.options.map((option, index) => {
                  const isSelected = answers[currentQuestion] === index;
                  const isCorrect = isSubmitted && index === question.correctAnswer;
                  const isWrong = isSubmitted && isSelected && index !== question.correctAnswer;

                  return (
                    <Label
                      key={index}
                      htmlFor={`option-${index}`}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        isCorrect
                          ? 'border-green-500 bg-green-500/10'
                          : isWrong
                          ? 'border-red-500 bg-red-500/10'
                          : isSelected
                          ? 'border-primary bg-primary/5'
                          : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                      }`}
                    >
                      <RadioGroupItem value={index.toString()} id={`option-${index}`} disabled={isSubmitted} />
                      <span className="flex-1">{option}</span>
                      {isSubmitted && isCorrect && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {isSubmitted && isWrong && <XCircle className="h-5 w-5 text-red-500" />}
                    </Label>
                  );
                })}
              </RadioGroup>

              {isSubmitted && (
                <Card className="bg-blue-500/5 border-blue-500/20 p-4">
                  <h4 className="font-semibold text-blue-500 mb-2">Explanation</h4>
                  <p className="text-sm text-muted-foreground">{question.explanation}</p>
                </Card>
              )}

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => goToQuestion(currentQuestion - 1)}
                  disabled={currentQuestion === 0}
                >
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Previous
                </Button>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      const newAnswers = [...answers];
                      newAnswers[currentQuestion] = null;
                      setAnswers(newAnswers);
                    }}
                    disabled={answers[currentQuestion] === null || isSubmitted}
                  >
                    <RotateCcw className="h-4 w-4 mr-1" />
                    Clear
                  </Button>
                </div>

                <Button
                  onClick={() => goToQuestion(currentQuestion + 1)}
                  disabled={currentQuestion === questions.length - 1}
                >
                  Next
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Question Palette */}
        <div className="lg:col-span-1">
          <Card className="sticky top-28">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Question Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2 mb-4">
                {questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToQuestion(index)}
                    className={`h-10 w-10 rounded-lg font-medium text-sm transition-all ${
                      index === currentQuestion
                        ? 'ring-2 ring-primary ring-offset-2'
                        : ''
                    } ${getStatusColor(getQuestionStatus(index))}`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-green-500" />
                  <span>Answered ({answers.filter(a => a !== null).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-yellow-500" />
                  <span>Marked for Review ({markedForReview.filter(Boolean).length})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 rounded bg-muted" />
                  <span>Not Answered ({answers.filter(a => a === null).length})</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QuizAttempt;
