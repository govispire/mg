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
import { getQuestionsForQuiz } from '@/data/quizQuestionsData';

const TestWindow = () => {
    const [searchParams] = useSearchParams();
    const initialPhaseParam = searchParams.get('phase') || searchParams.get('view') || 'instructions';
    const [phase, setPhase] = useState<'instructions' | 'exam' | 'analysis' | 'solutions'>(
        (initialPhaseParam as any) || 'instructions'
    );
    const [startTime] = useState(Date.now());
    const [examResponses, setExamResponses] = useState<Record<string, string | string[] | null>>({});
    const [analysisData, setAnalysisData] = useState<any>(null);

    // Get test data from URL parameters
    const category = searchParams.get('category');
    const examId = searchParams.get('examId');
    const testId = searchParams.get('testId') || searchParams.get('quizId') || `test-${Date.now()}`;
    const returnUrl = searchParams.get('returnUrl') || '/student/dashboard'; // Default to dashboard

    const title = searchParams.get('title') || 'Mock Test';
    const subject = searchParams.get('subject') || 'General';
    const duration = parseInt(searchParams.get('duration') || '60', 10);
    const questionCount = parseInt(searchParams.get('questions') || '30', 10);

    // Generate exam configuration
    let examConfig: ExamConfig;
    if (category && examId) {
        examConfig = generateTestExam(category, examId, testId);
    } else {
        // Fallback for daily free quizzes or generic single-subject tests
        const questions = getQuestionsForQuiz(subject, questionCount, testId);
        
        examConfig = {
            id: testId,
            title: title,
            totalDuration: duration,
            languages: ['English', 'Hindi'],
            instructions: [],
            sections: [{
                id: 'main-section',
                name: subject,
                questionsCount: questions.length,
                duration: duration,
                questions: questions.map((q, idx) => ({
                    id: q.id,
                    sectionId: 'main-section',
                    sectionName: subject,
                    questionNumber: idx + 1,
                    type: 'mcq' as const,
                    topic: q.topic || 'General Topic',
                    difficulty: 'Medium' as const,
                    question: q.text,
                    options: q.options.map((opt, oIdx) => ({ id: `opt-${oIdx}`, text: opt })),
                    correctAnswer: `opt-${q.correctAnswer}`,
                    marks: 1,
                    negativeMarks: 0.25,
                }))
            }]
        };
    }

    // Auto-generate analysis data if phase is analysis but analysisData is null
    useEffect(() => {
        if (phase === 'analysis' && !analysisData) {
            let stored: Record<string, string | string[] | null> = {};
            try {
                const raw = localStorage.getItem(`exam-responses-${testId}`);
                if (raw) stored = JSON.parse(raw);
            } catch { /* ignore */ }
            const computed = generateAnalysisFromExam(examConfig, stored);
            setAnalysisData(computed);
        }
    }, [phase, testId, examConfig, analysisData]);

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

        // Store result for parent window to retrieve (handshake key)
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

        // Also write directly to quizCompletions & exam-progress so the dashboard stats,
        // preparation progress bars (Prelims/Mains/Live), and analytics update immediately.
        try {
            const completions = JSON.parse(localStorage.getItem('quizCompletions') || '{}');
            completions[testId] = {
                completed: true,
                score,
                date: new Date().toISOString(),
                duration: Math.round(timeTaken / 60),
                examId: examId || undefined,
            };
            localStorage.setItem('quizCompletions', JSON.stringify(completions));
        } catch { /* storage full — ignore */ }

        if (examId) {
            try {
                const storageKey = `exam-progress-${examId}`;
                const raw = localStorage.getItem(storageKey);
                if (raw) {
                    const data = JSON.parse(raw);
                    const testType = testId.toLowerCase().includes('main') ? 'mains' :
                                     testId.toLowerCase().includes('live') ? 'live' :
                                     testId.toLowerCase().includes('sectional') ? 'sectional' :
                                     testId.toLowerCase().includes('speed') ? 'speed' :
                                     testId.toLowerCase().includes('pyq') ? 'pyq' : 'prelims';
                    if (data.testTypes && data.testTypes[testType]) {
                        data.testTypes[testType] = data.testTypes[testType].map((t: any) =>
                            t.testId === testId ? { ...t, status: 'completed', score, lastAttempted: new Date().toISOString(), attempts: (t.attempts || 0) + 1 } : t
                        );
                        localStorage.setItem(storageKey, JSON.stringify(data));
                    }
                }
            } catch { /* ignore */ }
        }

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
                returnUrl={returnUrl}
            />
        );
    }

    if (phase === 'analysis') {
        const computed = analysisData || generateAnalysisFromExam(examConfig, examResponses);
        return (
            <TestAnalysisModal
                isOpen={true}
                onClose={handleCloseAnalysis}
                analysisData={computed}
                onViewSolutions={handleViewSolutions}
            />
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

    // Default fallback to Instructions phase to prevent blank screen
    return (
        <ExamInstructions
            examConfig={examConfig}
            onComplete={() => setPhase('exam')}
        />
    );
};

export default TestWindow;
