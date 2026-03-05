/**
 * QuestionDisplay — Condition-based rendering dispatcher.
 *
 * ┌─────────────────────────────────────────────────┐
 * │  question.setId present?                        │
 * │    YES → DualPanel (passage + question)         │
 * │    NO  → SinglePanel (existing layout, no change)│
 * └─────────────────────────────────────────────────┘
 *
 * All props, styling, ActionBar, and palette are untouched.
 */
import React from 'react';
import { ExamQuestion } from '@/types/exam';
import { Badge } from '@/components/ui/badge';
import { DualPanel } from './DualPanel';
import { useQuestionSet } from '@/hooks/exam/useQuestionSet';

interface QuestionDisplayProps {
    question: ExamQuestion;
    selectedAnswer: string | string[] | null;
    onAnswerChange: (answer: string | string[]) => void;
    questionNumber: number;
    language?: string;
    onLanguageChange?: (lang: string) => void;
}

// ── Existing single-question panel (UNCHANGED) ─────────────────────────────
const SinglePanel: React.FC<QuestionDisplayProps> = ({
    question,
    selectedAnswer,
    onAnswerChange,
    questionNumber,
    language = 'English',
    onLanguageChange,
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
        <div className="flex-1 overflow-y-auto bg-white">
            {/* Blue View In bar */}
            <div className="bg-[#5b9dd9] text-white px-4 py-1.5 flex items-center justify-end gap-2 text-sm">
                <span>View In :</span>
                <select
                    value={language}
                    onChange={(e) => onLanguageChange?.(e.target.value)}
                    className="bg-white text-gray-800 border border-gray-300 rounded px-2 py-0.5 text-sm cursor-pointer focus:outline-none"
                >
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                </select>
            </div>

            <div className="p-6">
                {/* Question number header — same style as dual-panel dp-header */}
                <div className="mb-4 -mx-6 -mt-6 px-4 py-2 bg-[#f8f9fa] border-b border-gray-200 text-[0.8125rem] font-medium text-gray-700">
                    Question No. {questionNumber}
                </div>

                {/* Question Text */}
                <div className="mb-6">
                    <div className="text-lg text-gray-900 leading-relaxed" dangerouslySetInnerHTML={{ __html: question.question }} />
                    {question.imageUrl && (
                        <img src={question.imageUrl} alt="Question" className="mt-4 max-w-full h-auto" />
                    )}
                </div>

                {/* Options – MCQ */}
                {question.type === 'mcq' && question.options && (
                    <div className="space-y-2">
                        {question.options.map((option, idx) => {
                            const isSelected = selectedAnswer === option.id;
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition-colors hover:bg-gray-50`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${questionNumber}`}
                                        checked={isSelected}
                                        onChange={() => handleOptionSelect(option.id)}
                                        className="h-4 w-4 accent-[#1976d2] cursor-pointer flex-shrink-0"
                                        id={option.id}
                                    />
                                    <label
                                        htmlFor={option.id}
                                        className="cursor-pointer text-gray-900 leading-relaxed select-none"
                                        dangerouslySetInnerHTML={{ __html: option.text }}
                                    />
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Options – MSQ */}
                {question.type === 'msq' && question.options && (
                    <div className="space-y-2">
                        {question.options.map((option) => {
                            const isSelected = Array.isArray(selectedAnswer) && selectedAnswer.includes(option.id);
                            return (
                                <div
                                    key={option.id}
                                    onClick={() => handleOptionSelect(option.id)}
                                    className={`flex items-center gap-3 px-2 py-2 rounded cursor-pointer transition-colors hover:bg-gray-50`}
                                >
                                    <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={() => handleOptionSelect(option.id)}
                                        className="h-4 w-4 accent-[#1976d2] cursor-pointer flex-shrink-0"
                                    />
                                    <label
                                        className="cursor-pointer text-gray-900 leading-relaxed select-none"
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
        </div>
    );
};

// ── DualPanel loader — fetches set if not bundled ──────────────────────────
const DualPanelLoader: React.FC<QuestionDisplayProps> = (props) => {
    const { question, selectedAnswer, onAnswerChange, questionNumber, language, onLanguageChange } = props;
    const { questionSet, status, error } = useQuestionSet(question.setId, question.set);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center h-48 text-gray-400 text-sm">
                Loading passage…
            </div>
        );
    }

    if (status === 'error' || !questionSet) {
        // Graceful fallback: render as single panel so student isn't blocked
        console.warn('[DualPanelLoader] Set load failed, falling back to single panel.', error);
        return <SinglePanel {...props} />;
    }

    return (
        <DualPanel
            question={question}
            questionSet={questionSet}
            questionNumber={questionNumber}
            selectedAnswer={selectedAnswer}
            onAnswerChange={onAnswerChange}
            language={language}
            onLanguageChange={onLanguageChange}
        />
    );
};

// ── Public export — this is the integration point ─────────────────────────
export const QuestionDisplay: React.FC<QuestionDisplayProps> = (props) => {
    // If question belongs to a set → DualPanel; else → SinglePanel (existing layout)
    if (props.question.setId || props.question.set) {
        return <DualPanelLoader {...props} />;
    }
    return <SinglePanel {...props} />;
};
