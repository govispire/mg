import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExamInstructions } from '@/components/student/exam/ExamInstructions';
import { ExamInterface } from '@/components/student/exam/ExamInterface';
import { TestAnalysisModal } from '@/components/student/exam/TestAnalysisModal';
import { TestSolutions } from '@/components/student/exam/TestSolutions';
import { ExamConfig, ExamQuestion } from '@/types/exam';
import { generateAnalysisFromExam } from '@/utils/examAnalysis';
import { storeTestResult } from '@/utils/testWindowMonitor';
import { toast } from 'sonner';

/**
 * Standalone test window for full tests
 * Opens in new window with fullscreen exam interface
 * Shows analysis and solutions after submission
 */

// Generate sample test data based on test parameters
const generateTestExam = (category: string, examId: string, testId: string): ExamConfig => {
    const sections = [
        { id: 'reasoning', name: 'Reasoning Ability', questionCount: 35 },
        { id: 'quantitative', name: 'Quantitative Aptitude', questionCount: 35 },
        { id: 'english', name: 'English Language', questionCount: 30 },
    ];

    const questions: ExamQuestion[] = [];
    let questionNumber = 1;

    sections.forEach(section => {
        for (let i = 0; i < section.questionCount; i++) {
            questions.push({
                id: `${section.id}-q${i + 1}`,
                sectionId: section.id,
                sectionName: section.name,
                questionNumber: questionNumber++,
                type: 'mcq',
                question: `Sample question ${questionNumber} for ${section.name}. This is a demo question to showcase the test interface.`,
                options: [
                    { id: `opt-1`, text: 'Option A' },
                    { id: `opt-2`, text: 'Option B' },
                    { id: `opt-3`, text: 'Option C' },
                    { id: `opt-4`, text: 'Option D' },
                ],
                correctAnswer: 'opt-1',
                marks: 1,
                negativeMarks: 0.25,
                explanation: `This is the explanation for question ${i + 1}. The correct answer is Option A because it best answers the question.`,
            });
        }
    });

    return {
        id: testId,
        title: `${category?.toUpperCase()} - ${examId?.toUpperCase()} Mock Test`,
        totalDuration: 60, // 60 minutes
        languages: ['English', 'Hindi'],
        instructions: [],
        sections: sections.map(section => ({
            id: section.id,
            name: section.name,
            questionsCount: section.questionCount,
            questions: questions.filter(q => q.sectionId === section.id),
        })),
    };
};

const TestWindow = () => {
    const [searchParams] = useSearchParams();
    const [phase, setPhase] = useState<'instructions' | 'exam' | 'analysis' | 'solutions'>('instructions');
    const [startTime] = useState(Date.now());
    const [examResponses, setExamResponses] = useState<Record<string, string | string[] | null>>({});
    const [analysisData, setAnalysisData] = useState<any>(null);

    // Get test data from URL parameters
    const category = searchParams.get('category') || 'general';
    const examId = searchParams.get('examId') || 'test';
    const testId = searchParams.get('testId') || `test-${Date.now()}`;
    const returnUrl = searchParams.get('returnUrl') || '/student/dashboard'; // Default to dashboard

    // Generate exam configuration
    const examConfig = generateTestExam(category, examId, testId);

    // Enter fullscreen on mount
    useEffect(() => {
        const enterFullscreen = async () => {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.log('Fullscreen not supported or denied');
            }
        };
        enterFullscreen();

        // Prevent accidental navigation during exam
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (phase === 'exam') {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave the exam?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [phase]);

    const handleSubmit = (responses: Record<string, string | string[] | null>) => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        // Store responses for solution viewer
        setExamResponses(responses);

        // Generate comprehensive analysis data
        const analysis = generateAnalysisFromExam(examConfig, responses);

        // Calculate detailed statistics
        let correctCount = 0;
        let incorrectCount = 0;
        let notAttempted = 0;

        examConfig.sections.forEach(section => {
            section.questions.forEach(question => {
                const response = responses[question.id];
                if (response === null || response === undefined) {
                    notAttempted++;
                } else if (response === question.correctAnswer) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            });
        });

        const totalQuestions = examConfig.sections.reduce((sum, s) => sum + s.questions.length, 0);
        const score = Math.round((correctCount / totalQuestions) * 100);

        // Store result for parent window to retrieve
        storeTestResult({
            testId,
            completed: true,
            score,
            totalQuestions,
            correctAnswers: correctCount,
            wrongAnswers: incorrectCount,
            unanswered: notAttempted,
            timeTaken,
            timestamp: Date.now(),
        });

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        // Show success toast
        toast.success('Test Submitted Successfully!', {
            description: `Score: ${score}% | Correct: ${correctCount} | Wrong: ${incorrectCount}`,
        });

        // Move to analysis phase
        setAnalysisData(analysis);
        setPhase('analysis');
    };

    const handleCloseAnalysis = () => {
        // Navigate back to the page where test was started (prelims/mains/live)
        window.location.href = returnUrl;
    };

    const handleViewSolutions = () => {
        setPhase('solutions');
    };

    const handleCloseSolutions = () => {
        // Return to analysis or close window
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
            <TestSolutions
                examConfig={examConfig}
                responses={examResponses}
                isOpen={true}
                onClose={handleCloseSolutions}
            />
        );
    }

    return null;
};

export default TestWindow;
