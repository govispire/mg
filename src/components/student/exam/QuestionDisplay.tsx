import React from 'react';
import { ExamQuestion } from '@/types/exam';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';

interface QuestionDisplayProps {
    question: ExamQuestion;
    selectedAnswer: string | string[] | null;
    onAnswerChange: (answer: string | string[]) => void;
    questionNumber: number;
}

export const QuestionDisplay: React.FC<QuestionDisplayProps> = ({
    question,
    selectedAnswer,
    onAnswerChange,
    questionNumber
}) => {
    const handleOptionSelect = (optionId: string) => {
        if (question.type === 'mcq') {
            onAnswerChange(optionId);
        } else if (question.type === 'msq') {
            const currentAnswers = Array.isArray(selectedAnswer) ? selectedAnswer : [];
            if (currentAnswers.includes(optionId)) {
                onAnswerChange(currentAnswers.filter(id => id !== optionId));
            } else {
                onAnswerChange([...currentAnswers, optionId]);
            }
        }
    };

    return (
        <div className="p-6 bg-white min-h-[calc(100vh-280px)]">
            {/* Section Badge */}
            <div className="mb-4">
                <Badge className="bg-[#1976d2] text-white">
                    {question.sectionName} {question.sectionId && `(${question.sectionId})`}
                </Badge>
            </div>

            {/* Question Type */}
            <div className="text-sm text-gray-600 mb-2">
                Question Type: Multiple Choice Question
            </div>

            {/* Question Header Bar */}
            <div className="bg-[#5b9dd9] text-white px-4 py-2 rounded-t mb-4">
                <span className="font-medium">Question No. {questionNumber}</span>
            </div>

            {/* Question Text */}
            <div className="mb-6">
                <div className="text-lg text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.question }} />
                {question.imageUrl && (
                    <img src={question.imageUrl} alt="Question" className="mt-4 max-w-full h-auto" />
                )}
            </div>

            {/* Options */}
            {question.type === 'mcq' && question.options && (
                <RadioGroup
                    value={selectedAnswer as string || ''}
                    onValueChange={onAnswerChange}
                    className="space-y-3"
                >
                    {question.options.map((option) => (
                        <div
                            key={option.id}
                            className={`
                flex items-start gap-3 p-3 rounded border-2 transition-all cursor-pointer
                ${selectedAnswer === option.id
                                    ? 'border-[#1976d2] bg-blue-50'
                                    : 'border-gray-300 hover:border-gray-400 bg-white'
                                }
              `}
                            onClick={() => handleOptionSelect(option.id)}
                        >
                            <RadioGroupItem value={option.id} id={option.id} className="mt-1" />
                            <Label
                                htmlFor={option.id}
                                className="flex-1 cursor-pointer text-gray-900 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: option.text }}
                            />
                        </div>
                    ))}
                </RadioGroup>
            )}

            {question.type === 'msq' && question.options && (
                <div className="space-y-3">
                    {question.options.map((option) => {
                        const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(option.id);
                        return (
                            <div
                                key={option.id}
                                className={`
                  flex items-start gap-3 p-3 rounded border-2 transition-all cursor-pointer
                  ${isSelected
                                        ? 'border-[#1976d2] bg-blue-50'
                                        : 'border-gray-300 hover:border-gray-400 bg-white'
                                    }
                `}
                                onClick={() => handleOptionSelect(option.id)}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleOptionSelect(option.id)}
                                    className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label
                                    className="flex-1 cursor-pointer text-gray-900 leading-relaxed"
                                    dangerouslySetInnerHTML={{ __html: option.text }}
                                />
                            </div>
                        );
                    })}
                </div>
            )}

            {question.type === 'numerical' && (
                <div className="mt-4">
                    <input
                        type="number"
                        value={selectedAnswer as string || ''}
                        onChange={(e) => onAnswerChange(e.target.value)}
                        placeholder="Enter your answer"
                        className="w-full max-w-md px-4 py-2 border-2 border-gray-300 rounded focus:border-blue-500 focus:outline-none"
                    />
                </div>
            )}
        </div>
    );
};
