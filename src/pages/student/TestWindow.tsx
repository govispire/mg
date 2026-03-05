import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExamInstructions } from '@/components/student/exam/ExamInstructions';
import { ExamInterface } from '@/components/student/exam/ExamInterface';
import { TestAnalysisModal } from '@/components/student/exam/TestAnalysisModal';
import { TestSolutions } from '@/components/student/exam/TestSolutions';
import { ExamConfig, ExamQuestion } from '@/types/exam';
import { generateAnalysisFromExam } from '@/utils/examAnalysis';
import { generateTestExam } from '@/utils/generateTestExam';
import { storeTestResult } from '@/utils/testWindowMonitor';
import { toast } from 'sonner';



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

        // Save responses to localStorage so dashboard 'Analysis' can show real data
        try {
            localStorage.setItem(`exam-responses-${testId}`, JSON.stringify(responses));
        } catch { /* storage full — ignore */ }

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
        // Primary: just close this popup — parent tab stays on the test page with auth intact.
        window.close();

        // Fallback: if window.close() had no effect (e.g. opened as a tab, not a popup)
        setTimeout(() => {
            if (!window.closed) {
                const destination = returnUrl || sessionStorage.getItem('examReturnUrl') || '/student/dashboard';
                sessionStorage.removeItem('examReturnUrl');
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.location.href = destination;
                        window.close();
                        return;
                    }
                } catch (_) { }
                window.location.href = destination;
            }
        }, 300);
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
