/**
 * SolutionViewer — Standalone full-page solution review.
 * Opens in a new browser window/tab via window.open().
 * No sidebar, no header, no layout wrapper.
 */

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TestSolutions } from '@/components/student/exam/TestSolutions';
import { ExamConfig } from '@/types/exam';
import { getQuestionsForQuiz } from '@/data/quizQuestionsData';
import { generateTestExam } from '@/utils/generateTestExam';

const SolutionViewer = () => {
    const [searchParams] = useSearchParams();
    const [examConfig, setExamConfig] = useState<ExamConfig | null>(null);
    const [responses, setResponses] = useState<Record<string, string | string[] | null>>({});
    const [ready, setReady] = useState(false);

    const quizId    = searchParams.get('quizId') || searchParams.get('testId') || '';
    const quizTitle = searchParams.get('title') || 'Exam';
    const subject   = searchParams.get('subject') || 'General';
    const duration  = parseInt(searchParams.get('duration') || '30');
    const questionCount = parseInt(searchParams.get('questions') || '10');

    useEffect(() => {
        // Load previously saved responses
        const stored = localStorage.getItem(`quiz_responses_${quizId}`);
        const parsed: Record<string, string | string[] | null> = stored
            ? JSON.parse(stored)
            : {};
        setResponses(parsed);

        let config: ExamConfig;
        
        const category = searchParams.get('category');
        const examId = searchParams.get('examId');
        
        if (category && examId) {
            config = generateTestExam(category, examId, quizId);
            // Override with URL params if provided
            if (searchParams.has('title')) config.title = quizTitle;
            if (searchParams.has('duration')) config.totalDuration = duration;
        } else {
            // Build default ExamConfig from URL params + question data
            const questions = getQuestionsForQuiz(subject, questionCount);
            config = {
                id: quizId,
                title: quizTitle,
                totalDuration: duration,
                languages: ['English'],
                instructions: [],
                sections: [{
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
                            text: opt,
                        })),
                        correctAnswer: `opt-${index}-${q.correctAnswer}`,
                        marks: 1,
                        negativeMarks: 0.25,
                        explanation: q.explanation,
                    })),
                }],
            };
        }

        setExamConfig(config);
        setReady(true);
    }, [quizId, quizTitle, subject, duration, questionCount]);

    const handleClose = () => {
        // Close this new window/tab and return focus to the opener
        window.close();
        // Fallback: if window.close() didn't work (opened as tab, not popup)
        // navigate back in history
        if (!window.closed) {
            window.history.back();
        }
    };

    if (!ready || !examConfig) {
        return (
            <div className="flex items-center justify-center h-screen bg-white text-gray-500 text-sm">
                Loading solutions…
            </div>
        );
    }

    return (
        <TestSolutions
            examConfig={examConfig}
            responses={responses}
            isOpen={true}
            onClose={handleClose}
        />
    );
};

export default SolutionViewer;
