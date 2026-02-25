import React, { useState } from 'react';
import { ExamInstructions } from '@/components/student/exam/ExamInstructions';
import { ExamInterface } from '@/components/student/exam/ExamInterface';
import { ExamConfig, ExamQuestion } from '@/types/exam';
import { toast } from 'sonner';

// Old quiz interface props
interface Question {
    id: string;
    text: string;
    options: string[];
    correctAnswer: number;
    explanation: string;
    topic: string;
}

interface QuizAttemptIBPSProps {
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

// Convert old quiz format to IBPS exam format
const convertToExamConfig = (
    quizId: string,
    quizTitle: string,
    subject: string,
    duration: number,
    questions: Question[]
): ExamConfig => {
    const examQuestions: ExamQuestion[] = questions.map((q, index) => ({
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
    }));

    return {
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
                questions: examQuestions,
            }
        ]
    };
};

const QuizAttemptIBPS: React.FC<QuizAttemptIBPSProps> = ({
    quizId,
    quizTitle,
    subject,
    duration,
    questions,
    onComplete,
    onExit
}) => {
    const [showInstructions, setShowInstructions] = useState(true);
    const [startTime] = useState(Date.now());

    const examConfig = convertToExamConfig(quizId, quizTitle, subject, duration, questions);

    const handleSubmit = (responses: Record<string, string | string[] | null>) => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;

        const answerResults = questions.map((q, index) => {
            const examQuestion = examConfig.sections[0].questions[index];
            const selected = responses[examQuestion.id];

            let selectedIndex: number | null = null;
            if (selected && typeof selected === 'string') {
                // Extract index from option id (opt-index-optionIndex)
                const parts = selected.split('-');
                selectedIndex = parseInt(parts[2]);
            }

            const correct = selectedIndex === q.correctAnswer;

            if (selectedIndex === null) {
                unansweredCount++;
            } else if (correct) {
                correctCount++;
            } else {
                wrongCount++;
            }

            return { questionId: q.id, selected: selectedIndex, correct };
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

        toast.success('Quiz Submitted Successfully!', {
            description: `Score: ${score}% | Correct: ${correctCount} | Wrong: ${wrongCount}`
        });

        onComplete(quizResult);
    };

    if (showInstructions) {
        return (
            <ExamInstructions
                examConfig={examConfig}
                onComplete={() => setShowInstructions(false)}
            />
        );
    }

    return (
        <ExamInterface
            examConfig={examConfig}
            onSubmit={handleSubmit}
            userName="Student"
        />
    );
};

export default QuizAttemptIBPS;
