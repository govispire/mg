/**
 * DualPanel — Oliveboard-style two-column question renderer.
 *
 * LEFT  → shared passage / DI table / puzzle conditions (independent scroll)
 * RIGHT → current question text + option components (independent scroll)
 *
 * The bottom ActionBar and right sidebar palette are rendered by ExamInterface
 * and are NOT touched here — this component only replaces the question content area.
 *
 * Activation: QuestionDisplay renders this when question.setId is present;
 *              for plain MCQs the existing single-panel layout is used unchanged.
 */
import React, { useRef, useEffect, useCallback, KeyboardEvent } from 'react';
import { ExamQuestion, QuestionSet } from '@/types/exam';
import { Badge } from '@/components/ui/badge';
import './dual-panel.css';

interface DualPanelProps {
    question: ExamQuestion;
    questionSet: QuestionSet;
    questionNumber: number;
    selectedAnswer: string | string[] | null;
    onAnswerChange: (answer: string | string[]) => void;
}

// ── Sanitise HTML ──────────────────────────────────────────────────────────
function sanitizeHtml(html: string): string {
    // Basic XSS guard: strip <script> and event handlers.
    // In production replace with DOMPurify but avoid adding a dep for now.
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/\s+on\w+="[^"]*"/gi, '')
        .replace(/\s+on\w+='[^']*'/gi, '');
}

// ── Option list (reused from existing QuestionDisplay logic) ───────────────
interface OptionListProps {
    question: ExamQuestion;
    selectedAnswer: string | string[] | null;
    onSelect: (optionId: string) => void;
}

const OptionList: React.FC<OptionListProps> = ({ question, selectedAnswer, onSelect }) => {
    if (!question.options) return null;
    const labels = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div className="dp-options space-y-2 mt-4">
            {question.options.map((opt, idx) => {
                const isSelected =
                    question.type === 'msq'
                        ? Array.isArray(selectedAnswer) && selectedAnswer.includes(opt.id)
                        : selectedAnswer === opt.id;

                return (
                    <div
                        key={opt.id}
                        data-option-idx={idx}
                        onClick={() => onSelect(opt.id)}
                        className={`dp-option flex items-start gap-3 px-3 py-2 rounded cursor-pointer transition-colors select-none
                            ${isSelected ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}
                        role="radio"
                        aria-checked={isSelected}
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(opt.id); } }}
                    >
                        <input
                            type={question.type === 'msq' ? 'checkbox' : 'radio'}
                            name={`dp-q-${question.id}`}
                            id={`dp-${opt.id}`}
                            checked={isSelected}
                            onChange={() => onSelect(opt.id)}
                            className="h-4 w-4 mt-0.5 accent-[#1976d2] cursor-pointer flex-shrink-0"
                        />
                        <label
                            htmlFor={`dp-${opt.id}`}
                            className="cursor-pointer text-gray-900 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }}
                        />
                    </div>
                );
            })}
        </div>
    );
};

// ── Main component ─────────────────────────────────────────────────────────
export const DualPanel: React.FC<DualPanelProps> = ({
    question,
    questionSet,
    questionNumber,
    selectedAnswer,
    onAnswerChange,
}) => {
    const rightPanelRef = useRef<HTMLDivElement>(null);

    // Scroll right panel to top whenever the question changes
    useEffect(() => {
        rightPanelRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    }, [question.id]);

    const handleOptionSelect = useCallback((optionId: string) => {
        if (question.type === 'mcq') {
            onAnswerChange(optionId);
        } else if (question.type === 'msq') {
            const cur = Array.isArray(selectedAnswer) ? selectedAnswer : [];
            onAnswerChange(
                cur.includes(optionId) ? cur.filter(id => id !== optionId) : [...cur, optionId]
            );
        }
    }, [question.type, selectedAnswer, onAnswerChange]);

    // Keyboard navigation: Arrow keys cycle options
    const handleKeyDown = useCallback((e: KeyboardEvent<HTMLDivElement>) => {
        if (!question.options) return;
        const opts = question.options;
        const curIdx = opts.findIndex(o => o.id === selectedAnswer);

        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
            e.preventDefault();
            const next = opts[(curIdx + 1) % opts.length];
            if (question.type === 'mcq') handleOptionSelect(next.id);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
            e.preventDefault();
            const prev = opts[(curIdx - 1 + opts.length) % opts.length];
            if (question.type === 'mcq') handleOptionSelect(prev.id);
        }
    }, [question.options, question.type, selectedAnswer, handleOptionSelect]);

    const setTypeLabel: Record<QuestionSet['setType'], string> = {
        reading_comprehension: 'Reading Comprehension',
        di_set: 'Data Interpretation',
        puzzle_set: 'Puzzle / Seating',
        caselet: 'Caselet',
        input_output: 'Input-Output',
        generic: 'Passage',
    };

    return (
        <div className="dp-wrapper" onKeyDown={handleKeyDown} tabIndex={-1}>
            {/* ── Top header strip (mirrors existing QuestionDisplay header) ── */}
            <div className="dp-header">
                <div className="flex items-center gap-3">
                    <Badge className="bg-[#1976d2] text-white text-xs">
                        {question.sectionName}
                    </Badge>
                    <span className="text-xs text-gray-500">
                        {setTypeLabel[questionSet.setType] ?? 'Set'}
                    </span>
                </div>
                <span className="text-xs text-gray-400 hidden sm:block">
                    Question No. {questionNumber}
                </span>
            </div>

            {/* ── Two-panel body ─────────────────────────────────────────── */}
            <div className="dp-body">
                {/* LEFT — shared passage / DI content */}
                <div className="dp-left" role="complementary" aria-label="Shared passage or data">
                    {questionSet.title && (
                        <div className="dp-directions">
                            <strong>Directions:</strong>{' '}
                            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(questionSet.title) }} />
                        </div>
                    )}
                    <div
                        className="dp-passage prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(questionSet.sharedContent) }}
                    />
                </div>

                {/* Divider */}
                <div className="dp-divider" aria-hidden="true" />

                {/* RIGHT — current question */}
                <div
                    className="dp-right"
                    ref={rightPanelRef}
                    role="main"
                    aria-label="Question and options"
                >
                    {/* Question header bar (same blue bar as existing UI) */}
                    <div className="bg-[#5b9dd9] text-white px-4 py-2 rounded mb-4 text-sm font-medium">
                        Question No. {questionNumber}
                    </div>

                    {/* Question text */}
                    <div
                        className="text-gray-900 leading-relaxed mb-2"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.question) }}
                    />

                    {/* Optional image */}
                    {question.imageUrl && (
                        <img
                            src={question.imageUrl}
                            alt="Question illustration"
                            className="mt-3 max-w-full h-auto rounded"
                        />
                    )}

                    {/* Options */}
                    {(question.type === 'mcq' || question.type === 'msq') && (
                        <OptionList
                            question={question}
                            selectedAnswer={selectedAnswer}
                            onSelect={handleOptionSelect}
                        />
                    )}

                    {question.type === 'numerical' && (
                        <div className="mt-4">
                            <input
                                type="number"
                                value={(selectedAnswer as string) || ''}
                                onChange={e => onAnswerChange(e.target.value)}
                                placeholder="Enter your answer"
                                className="w-full max-w-xs px-4 py-2 border-2 border-gray-300 rounded
                                           focus:border-blue-500 focus:outline-none text-sm"
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DualPanel;
