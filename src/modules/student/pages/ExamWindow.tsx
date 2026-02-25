import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { ExamInstructions } from '@/components/student/exam/ExamInstructions';
import { ExamInterface } from '@/components/student/exam/ExamInterface';
import { TestAnalysisModal } from '@/components/student/exam/TestAnalysisModal';
import { TestSolutions } from '@/components/student/exam/TestSolutions';
import { ExamConfig } from '@/types/exam';
import { getQuestionsForQuiz } from '@/data/quizQuestionsData';
import { generateAnalysisFromExam } from '@/utils/examAnalysis';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

// This is a standalone fullscreen exam page that opens in a new window
const ExamWindow = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [phase, setPhase] = useState<'instructions' | 'exam' | 'analysis' | 'solutions'>('instructions');
    const [startTime] = useState(Date.now());
    const [examResponses, setExamResponses] = useState<Record<string, string | string[] | null>>({});
    const [analysisData, setAnalysisData] = useState<any>(null);

    // Get quiz data from URL parameters
    const quizId = searchParams.get('quizId') || '';
    const quizTitle = searchParams.get('title') || 'Exam';
    const subject = searchParams.get('subject') || 'General';
    const duration = parseInt(searchParams.get('duration') || '30');
    const questionCount = parseInt(searchParams.get('questions') || '10');
    const mode = searchParams.get('mode'); // 'solution' mode to directly show solutions
    const returnUrl = searchParams.get('returnUrl') || '/student/daily-quizzes'; // Default to daily quizzes

    // Enter fullscreen on mount
    useEffect(() => {
        const enterFullscreen = async () => {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.log('Fullscreen not supported or denied');
            }
        };

        // Only enter fullscreen if not in solution mode
        if (mode !== 'solution') {
            enterFullscreen();
        }

        // Prevent accidental navigation
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (phase === 'exam') {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave the exam?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [phase, mode]);

    // If in solution mode, load previous responses and go directly to solutions
    useEffect(() => {
        if (mode === 'solution') {
            const storedResponses = localStorage.getItem(`quiz_responses_${quizId}`);
            if (storedResponses) {
                setExamResponses(JSON.parse(storedResponses));
                setPhase('solutions');
            }
        }
    }, [mode, quizId]);

    // Get questions
    const questions = getQuestionsForQuiz(subject, questionCount);

    // Convert to exam format
    const examConfig: ExamConfig = {
        id: quizId,
        title: quizTitle,
        totalDuration: duration,
        languages: ['English'],
        instructions: [],
        sections: [
            {
                id: 'main-section',
                name: subject,
                questionsCount: questions.length,
                questions: questions.map((q, index) => ({
                    id: q.id,
                    sectionId: 'main-section',
                    sectionName: subject,
                    questionNumber: index + 1,
                    type: 'mcq' as const,
                    question: q.text,
                    options: q.options.map((opt, i) => ({
                        id: `opt-${index}-${i}`,
                        text: opt
                    })),
                    correctAnswer: `opt-${index}-${q.correctAnswer}`,
                    marks: 1,
                    negativeMarks: 0.25,
                    explanation: q.explanation,
                })),
            }
        ]
    };

    const handleSubmit = (responses: Record<string, string | string[] | null>) => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        // Store responses for solution viewer
        setExamResponses(responses);
        localStorage.setItem(`quiz_responses_${quizId}`, JSON.stringify(responses));

        // Generate comprehensive analysis data
        const analysis = generateAnalysisFromExam(examConfig, responses);

        let correctCount = 0;
        let incorrectCount = 0;
        let notAttempted = 0;

        questions.forEach((q, index) => {
            const examQuestion = examConfig.sections[0].questions[index];
            const selected = responses[examQuestion.id];

            let selectedIndex: number | null = null;
            if (selected && typeof selected === 'string') {
                const parts = selected.split('-');
                selectedIndex = parseInt(parts[2]);
            }

            if (selectedIndex === null) {
                notAttempted++;
            } else if (selectedIndex === q.correctAnswer) {
                correctCount++;
            } else {
                incorrectCount++;
            }
        });

        const score = Math.round((correctCount / questions.length) * 100);

        // Store result in localStorage for parent window to retrieve
        const result = {
            quizId,
            score,
            totalQuestions: questions.length,
            correctAnswers: correctCount,
            wrongAnswers: incorrectCount,
            unanswered: notAttempted,
            timeTaken,
        };

        localStorage.setItem('exam_result_' + quizId, JSON.stringify(result));

        // Store in quiz completions immediately
        const completions = JSON.parse(localStorage.getItem('quizCompletions') || '{}');
        completions[quizId] = {
            completed: true,
            score,
            date: new Date().toISOString()
        };
        localStorage.setItem('quizCompletions', JSON.stringify(completions));

        toast.success('Quiz Completed Successfully!', {
            description: `Score: ${score}% | Correct: ${correctCount} | Wrong: ${incorrectCount}`,
            duration: 3000
        });

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        // Move to analysis phase instead of redirecting
        setAnalysisData(analysis);
        setPhase('analysis');
    };

    const handleCloseAnalysis = () => {
        // Navigate back to the page where quiz was started
        window.location.href = returnUrl;
    };

    const handleViewSolutions = () => {
        setPhase('solutions');
    };

    const handleCloseSolutions = () => {
        // Return to analysis
        setPhase('analysis');
    };

    // Render based on phase
    if (phase === 'instructions') {
        return (
            <ExamInstructions
                examConfig={examConfig}
                onComplete={() => setPhase('exam')}
            />
        );
    }

    if (phase === 'exam') {
        return (
            <ExamInterface
                examConfig={examConfig}
                onSubmit={handleSubmit}
                userName="Student"
            />
        );
    }

    if (phase === 'analysis' && analysisData) {
        return (
            <div className="fixed inset-0 overflow-hidden bg-black/50 z-50">
                <TestAnalysisModal
                    isOpen={true}
                    onClose={handleCloseAnalysis}
                    analysisData={analysisData}
                    onViewSolutions={handleViewSolutions}
                />
            </div>
        );
    }

    if (phase === 'solutions') {
        return (
            <div className="min-h-screen bg-background">
                {/* Back button */}
                <div className="sticky top-0 z-10 bg-background border-b p-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCloseSolutions}
                        className="gap-2"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Analysis
                    </Button>
                </div>
                <TestSolutions
                    examConfig={examConfig}
                    responses={examResponses}
                    isOpen={true}
                    onClose={handleCloseSolutions}
                />
            </div>
        );
    }

    return null;
};

export default ExamWindow;
