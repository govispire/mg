import React, { useState } from 'react';
import { ExamInstructions } from '@/components/student/exam/ExamInstructions';
import { ExamInterface } from '@/components/student/exam/ExamInterface';
import { ExamConfig } from '@/types/exam';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

// Demo exam configuration
const demoExamConfig: ExamConfig = {
    id: 'demo-ibps-exam',
    title: 'New IBPS Test',
    totalDuration: 90, // 90 minutes
    languages: ['English', 'Hindi'],
    instructions: [],
    sections: [
        {
            id: 'general-awareness',
            name: 'General Awareness',
            questionsCount: 50,
            duration: undefined,
            questions: Array.from({ length: 50 }, (_, i) => ({
                id: `ga-${i + 1}`,
                sectionId: 'general-awareness',
                sectionName: 'General Awareness',
                questionNumber: i + 1,
                type: 'mcq' as const,
                question: i === 0
                    ? 'Mr. Donald Rumsfeld was the ______'
                    : i === 18
                        ? 'The Government of India has set up a new Insurance Corporation to provide insurance cover solely to ______'
                        : `Sample question ${i + 1} for General Awareness. This is a demo question to showcase the IBPS exam interface.`,
                options: i === 0
                    ? [
                        { id: 'opt-1', text: 'Foreign Minister of Britain' },
                        { id: 'opt-2', text: 'Foreign Secretary of U.S.A.' },
                        { id: 'opt-3', text: 'Foreign Minister of France' },
                        { id: 'opt-4', text: 'Deputy Prime Minister of France' },
                        { id: 'opt-5', text: 'None of these' },
                    ]
                    : i === 18
                        ? [
                            { id: 'opt-1', text: 'Truck operators' },
                            { id: 'opt-2', text: 'Govt. employees' },
                            { id: 'opt-3', text: 'Small and Marginal farmers' },
                            { id: 'opt-4', text: 'Air passengers and employees of the air lines' },
                            { id: 'opt-5', text: 'Politicians' },
                        ]
                        : [
                            { id: `opt-${i}-1`, text: `Option A for question ${i + 1}` },
                            { id: `opt-${i}-2`, text: `Option B for question ${i + 1}` },
                            { id: `opt-${i}-3`, text: `Option C for question ${i + 1}` },
                            { id: `opt-${i}-4`, text: `Option D for question ${i + 1}` },
                            { id: `opt-${i}-5`, text: `None of these` },
                        ],
                correctAnswer: i === 0 ? 'opt-2' : i === 18 ? 'opt-3' : `opt-${i}-1`,
                marks: 1,
                negativeMarks: 0.25,
            })),
        },
        {
            id: 'reasoning',
            name: 'Reasoning',
            questionsCount: 10,
            duration: undefined,
            questions: Array.from({ length: 10 }, (_, i) => ({
                id: `reasoning-${i + 51}`,
                sectionId: 'reasoning',
                sectionName: 'Reasoning',
                questionNumber: i + 51,
                type: 'mcq' as const,
                question: `Reasoning question ${i + 1}. Select the correct logical answer from the options below.`,
                options: [
                    { id: `opt-r-${i}-1`, text: `Reasoning option A` },
                    { id: `opt-r-${i}-2`, text: `Reasoning option B` },
                    { id: `opt-r-${i}-3`, text: `Reasoning option C` },
                    { id: `opt-r-${i}-4`, text: `Reasoning option D` },
                ],
                correctAnswer: `opt-r-${i}-1`,
                marks: 1,
                negativeMarks: 0.25,
            })),
        },
        {
            id: 'subject-knowledge',
            name: 'Subject Knowledge',
            questionsCount: 40,
            duration: undefined,
            questions: Array.from({ length: 40 }, (_, i) => ({
                id: `sk-${i + 61}`,
                sectionId: 'subject-knowledge',
                sectionName: 'Subject Knowledge',
                questionNumber: i + 61,
                type: 'mcq' as const,
                question: `Subject knowledge question ${i + 1}. Choose the most appropriate answer.`,
                options: [
                    { id: `opt-sk-${i}-1`, text: `Subject option A` },
                    { id: `opt-sk-${i}-2`, text: `Subject option B` },
                    { id: `opt-sk-${i}-3`, text: `Subject option C` },
                    { id: `opt-sk-${i}-4`, text: `Subject option D` },
                ],
                correctAnswer: `opt-sk-${i}-1`,
                marks: 1,
                negativeMarks: 0.25,
            })),
        },
    ],
};

const ExamDemo = () => {
    const [showInstructions, setShowInstructions] = useState(true);
    const navigate = useNavigate();
    const { toast } = useToast();

    const handleSubmit = (responses: Record<string, string | string[] | null>) => {
        console.log('Exam submitted with responses:', responses);

        // Calculate score
        let correct = 0;
        let incorrect = 0;
        let notAttempted = 0;

        demoExamConfig.sections.forEach(section => {
            section.questions.forEach(question => {
                const response = responses[question.id];
                if (response === null || response === undefined) {
                    notAttempted++;
                } else if (response === question.correctAnswer) {
                    correct++;
                } else {
                    incorrect++;
                }
            });
        });

        const score = (correct * 1) - (incorrect * 0.25);

        toast({
            title: 'Exam Submitted Successfully!',
            description: `Score: ${score.toFixed(2)} | Correct: ${correct} | Incorrect: ${incorrect} | Not Attempted: ${notAttempted}`,
            duration: 10000,
        });

        // Navigate back after a delay
        setTimeout(() => {
            navigate('/student/daily-quizzes');
        }, 3000);
    };

    if (showInstructions) {
        return (
            <ExamInstructions
                examConfig={demoExamConfig}
                onComplete={() => setShowInstructions(false)}
            />
        );
    }

    return (
        <ExamInterface
            examConfig={demoExamConfig}
            onSubmit={handleSubmit}
            userName="John Smith"
        />
    );
};

export default ExamDemo;
