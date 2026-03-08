/**
 * TestSolutions — Solution review page after mock test submission.
 *
 * Mirrors ExamInterface exactly:
 *  • Same dark header, section navigator, right palette, bottom nav
 *  • DualPanel for set-based questions (RC / DI / Puzzle),
 *    SinglePanel for individual questions — identical to ExamInterface
 *  • Below every question: solution explanation + performance stats + student actions
 *    instead of Save/Mark/Submit action buttons
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ExamConfig, ExamQuestion } from '@/types/exam';
import { SectionNavigator } from './SectionNavigator';
import { DualPanel } from './DualPanel';
import { useQuestionSet } from '@/hooks/exam/useQuestionSet';
import { QuestionButton, getBgStyle, getNotVisitedStyle } from '../../question-palette/QuestionButton';
import type { PaletteStatus } from '../../question-palette/QuestionButton';
import '../../question-palette/palette.css';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    CheckCircle, XCircle, Circle, ChevronLeft, ChevronRight, X,
    Bookmark, BookmarkCheck, BookOpen, Flag, MessageSquare, Zap,
    AlertTriangle, Clock, Users, BarChart2, Target, TrendingUp,
    Award, Percent, RotateCcw, Brain, Calculator
} from 'lucide-react';

// ── Helpers ──────────────────────────────────────────────────────────────────

function sanitizeHtml(html: string): string {
    return html
        .replace(/<script[\s\S]*?<\/script>/gi, '')
        .replace(/\s+on\w+="[^"]*"/gi, '')
        .replace(/\s+on\w+='[^']*'/gi, '');
}

function getSimData(idx: number) {
    const seed = idx + 1;
    const avgTime = 20 + (seed * 7) % 40;
    const yourTime = 10 + (seed * 13) % 55;
    const pctCorrect = 30 + (seed * 17) % 55;
    const difficulty: 'Easy' | 'Medium' | 'Hard' = pctCorrect > 70 ? 'Easy' : pctCorrect > 45 ? 'Medium' : 'Hard';
    return { avgTime, yourTime, pctCorrect, difficulty };
}

const SAMPLE_EXPLANATIONS = [
    // Reasoning — Seating / Puzzle
    `<b>Step-by-step approach:</b><br/>
    In circular arrangement problems, fix one person as the reference point (usually the first named person) and build the arrangement relative to them.<br/><br/>
    <b>Key rule:</b> "To the left of A" in a circular arrangement means going clockwise from A's perspective when all members face the centre.<br/>
    Working through the given clues one by one and eliminating contradictions yields the final seat positions. The correct answer follows directly from placing all constraints.`,

    // Quantitative — Time & Work
    `<b>Formula Used:</b> Distance = Speed × Time &nbsp;⟹&nbsp; Time = Distance ÷ Speed<br/><br/>
    <b>Solution:</b><br/>
    Time = 300 km ÷ 60 km/h = <b>5 hours</b><br/><br/>
    <i>Tip:</i> Always check units — if speed is in km/h and distance in km, time comes out in hours directly. No conversion needed here.`,

    // English — Error Spotting
    `<b>Grammar Rule Applied:</b> Subject-Verb Agreement<br/><br/>
    When a collective noun (team, committee, jury) is used as a unified body, it takes a <b>singular verb</b>. The error in Option (B) arises from treating a collective noun as plural.<br/><br/>
    <i>Correct form:</i> "The committee <u>has</u> decided..." not "have decided."`,

    // Reasoning — Coding-Decoding
    `<b>Pattern Identified:</b> Each letter is shifted forward by +2 positions in the alphabet.<br/><br/>
    F→H, R→T, I→K, E→G, N→P, D→F &nbsp;→ HUMJTK ✓<br/>
    Applying the same +2 shift to CANDLE:<br/>
    C→E, A→C, N→P, D→F, L→N, E→G &nbsp;→ <b>ECPFNG</b><br/><br/>
    <i>Always verify the pattern on the example before applying it to the new word.</i>`,

    // Quantitative — Percentage
    `<b>Concept:</b> Percentage change<br/><br/>
    If the original value is X and it increases by R%, the new value = X × (1 + R/100).<br/>
    For successive percentage changes (say +a% then +b%), the combined effect = a + b + ab/100 %.<br/><br/>
    Apply these formulas systematically rather than computing step-by-step to save time.`,

    // General Awareness
    `<b>Context:</b> Canada has the longest coastline in the world at approximately <b>202,080 km</b>, followed by Russia (~37,650 km) and Norway (~25,148 km).<br/><br/>
    This fact is frequently tested in banking and SSC exams under Geography / Static GK. Remember the top-5 list: Canada, Russia, Norway, Indonesia, Greenland.`,

    // Reasoning — Blood Relations
    `<b>Approach:</b> Draw a family tree diagram before solving.<br/><br/>
    Label each relationship given in the problem on the diagram. Indirect relationships (e.g., "mother's brother's son") become straightforward once the tree is drawn.<br/><br/>
    <i>Common traps:</i> Words like "only" (only son/daughter) and gender-ambiguous names — always infer gender from the clue context.`,

    // Quantitative — Simple Interest
    `<b>Formula:</b> SI = (P × R × T) / 100<br/><br/>
    Where P = Principal, R = Rate % per annum, T = Time in years.<br/>
    For this question, substitute the given values and solve for the unknown variable.<br/><br/>
    <b>Shortcut:</b> If SI doubles the principal, then R × T = 100. Use this to quickly identify the missing value when two of the three (P, R, T) are given.`,

    // English — Reading Comprehension
    `<b>Strategy for RC Questions:</b><br/>
    1. Read the question <i>before</i> the passage to know what to look for.<br/>
    2. Eliminate options that are too extreme ("always", "never") or not supported by the text.<br/>
    3. The correct answer paraphrases the passage — it won't use the exact same words.<br/><br/>
    The answer is directly stated in paragraph 2 of the passage.`,

    // Reasoning — Syllogisms
    `<b>Rules of Syllogism:</b><br/>
    • "All A are B" + "All B are C" → "All A are C" ✓<br/>
    • "Some A are B" + "All B are C" → "Some A are C" ✓<br/>
    • Two particular premises (Some) → No definite conclusion<br/><br/>
    Draw Venn diagrams for complex syllogisms and test each conclusion against <b>all possible</b> diagram arrangements, not just the most obvious one.`,
];

function getSampleExplanation(idx: number): string {
    return SAMPLE_EXPLANATIONS[idx % SAMPLE_EXPLANATIONS.length];
}

function speedLabel(yourTime: number, avgTime: number) {
    const r = yourTime / avgTime;
    if (r < 0.7) return { text: '⚡ Superfast', cls: 'text-green-600 bg-green-50 border-green-200' };
    if (r <= 1.3) return { text: '✓ On Time', cls: 'text-blue-600 bg-blue-50 border-blue-200' };
    return { text: '🐢 Slow', cls: 'text-orange-600 bg-orange-50 border-orange-200' };
}

function diffStyle(d: string) {
    if (d === 'Easy') return 'bg-green-100 text-green-700 border-green-200';
    if (d === 'Medium') return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
}

function isAnswerCorrect(
    response: string | string[] | null | undefined,
    correctAnswer: string | string[]
): boolean {
    if (!response) return false;
    if (Array.isArray(response)) {
        const ca = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];
        return JSON.stringify([...response].sort()) === JSON.stringify([...ca].sort());
    }
    return response === correctAnswer;
}

function toSolutionStatus(hasResp: boolean, correct: boolean): PaletteStatus {
    if (!hasResp) return 'not-visited';
    return correct ? 'answered' : 'not-answered';
}

// ── Option display (read-only, colour-coded) ──────────────────────────────────

interface SolutionOptionListProps {
    question: ExamQuestion;
    studentResponse: string | string[] | null | undefined;
    isCorrect: boolean;
}
const SolutionOptionList: React.FC<SolutionOptionListProps> = ({ question, studentResponse, isCorrect }) => {
    if (!question.options) return null;
    return (
        <div className="space-y-2 mt-4">
            {question.options.map((opt) => {
                const isCorrectAns = Array.isArray(question.correctAnswer)
                    ? question.correctAnswer.includes(opt.id)
                    : question.correctAnswer === opt.id;
                const isStudentAns = Array.isArray(studentResponse)
                    ? studentResponse.includes(opt.id)
                    : studentResponse === opt.id;

                let cls = 'bg-gray-50';
                let borderAccent = 'border-l-2 border-l-transparent';
                let icon = <Circle className="h-4 w-4 text-gray-300 flex-shrink-0 mt-0.5" />;
                let tag = '';
                let tagCls = '';

                if (isCorrectAns) {
                    cls = 'bg-green-50';
                    borderAccent = 'border-l-4 border-l-green-400';
                    icon = <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />;
                    tag = '✓ Correct Answer';
                    tagCls = 'text-green-700 font-semibold';
                } else if (isStudentAns && !isCorrect) {
                    cls = 'bg-red-50';
                    borderAccent = 'border-l-4 border-l-red-400';
                    icon = <XCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />;
                    tag = '✗ Your Answer';
                    tagCls = 'text-red-600 font-semibold';
                }

                return (
                    <div key={opt.id} className={`flex items-start gap-3 px-3 py-2.5 rounded-lg transition-all ${cls} ${borderAccent}`}>
                        {icon}
                        <div className="flex-1 min-w-0">
                            <span
                                className="text-sm text-gray-900 leading-relaxed"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(opt.text) }}
                            />
                            {tag && <div className={`text-[11px] mt-0.5 ${tagCls}`}>{tag}</div>}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

// ── Analysis strip (shown below the question/options area) ───────────────────

interface AnalysisStripProps {
    question: ExamQuestion;
    questionIndex: number;
    studentResponse: string | string[] | null | undefined;
    isCorrect: boolean;
    hasResponse: boolean;
    bookmarked: boolean;
    inNotebook: boolean;
    reported: boolean;
    onBookmark: () => void;
    onNotebook: () => void;
    onReport: () => void;
}

const AnalysisStrip: React.FC<AnalysisStripProps> = ({
    question, questionIndex, studentResponse, isCorrect, hasResponse,
    bookmarked, inNotebook, reported, onBookmark, onNotebook, onReport
}) => {
    const sim = getSimData(questionIndex);
    const speed = speedLabel(sim.yourTime, sim.avgTime);
    const marksEarned = !hasResponse ? 0 : isCorrect ? question.marks : -question.negativeMarks;

    // Status
    const status = !hasResponse
        ? { text: 'Not Attempted', bg: 'bg-gray-100 border-gray-300', textCls: 'text-gray-600', icon: <Circle className="h-4 w-4" /> }
        : isCorrect
            ? { text: 'Correct', bg: 'bg-green-50 border-green-300', textCls: 'text-green-700', icon: <CheckCircle className="h-4 w-4" /> }
            : { text: 'Incorrect', bg: 'bg-red-50 border-red-300', textCls: 'text-red-700', icon: <XCircle className="h-4 w-4" /> };

    return (
        <div className="border-t border-gray-200 bg-[#f8faff]">

            {/* ── Solution explanation ── */}
            <div className="px-4 py-4 border-b border-gray-100 space-y-3">

                {/* Section header */}
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-700 uppercase tracking-wider bg-blue-50 border border-blue-200 rounded px-2.5 py-1">
                        <BookOpen className="h-3.5 w-3.5" /> Solution
                    </div>
                </div>

                {/* Correct answer pill */}
                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-green-50 border border-green-200">
                    <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-wide mb-0.5">Correct Answer</div>
                        <div className="text-sm font-semibold text-green-800 leading-snug"
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtml(
                                    question.options
                                        ? question.options.find(o =>
                                            Array.isArray(question.correctAnswer)
                                                ? question.correctAnswer.includes(o.id)
                                                : o.id === question.correctAnswer
                                        )?.text || String(question.correctAnswer)
                                        : String(question.correctAnswer)
                                )
                            }}
                        />
                    </div>
                </div>

                {/* Explanation block */}
                <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
                    <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border-b border-gray-200">
                        <Brain className="h-3.5 w-3.5 text-indigo-500" />
                        <span className="text-[11px] font-bold text-gray-700 uppercase tracking-wide">Explanation</span>
                    </div>
                    <div className="px-3 py-3">
                        <p className="text-sm text-gray-700 leading-relaxed"
                            dangerouslySetInnerHTML={{
                                __html: sanitizeHtml(question.explanation || getSampleExplanation(questionIndex))
                            }}
                        />
                    </div>
                </div>

                {/* Key points / shortcut row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div className="text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-xl p-3">
                        <div className="font-semibold text-blue-700 mb-1.5 flex items-center gap-1">📌 Key Points</div>
                        <ul className="space-y-1">
                            <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>Avg time: <strong>{sim.avgTime}s</strong> — aim to be faster</li>
                            <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span>Eliminate obviously wrong options first</li>
                            <li className="flex items-start gap-1.5"><span className="text-blue-400 mt-0.5">•</span><strong>{sim.pctCorrect}%</strong> of students got this right</li>
                        </ul>
                    </div>
                    <div className="text-xs text-gray-600 bg-amber-50 border border-amber-100 rounded-xl p-3">
                        <div className="font-semibold text-amber-700 mb-1.5 flex items-center gap-1"><Zap className="h-3 w-3" /> Shortcut Tip</div>
                        <p className="leading-relaxed">Focus on pattern recognition before full computation to answer within <strong>{sim.avgTime}s</strong>.</p>
                    </div>
                </div>
            </div>

            {/* ── Action tools row ── */}
            <div className="px-4 py-2.5 bg-white flex flex-wrap items-center gap-2">
                <button
                    onClick={onBookmark}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${bookmarked ? 'bg-yellow-100 text-yellow-700 border-yellow-300' : 'text-gray-600 border-gray-200 hover:border-yellow-300 hover:bg-yellow-50'}`}
                >
                    {bookmarked ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
                    {bookmarked ? 'Bookmarked' : '⭐ Bookmark'}
                </button>
                <button
                    onClick={onNotebook}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${inNotebook ? 'bg-blue-100 text-blue-700 border-blue-300' : 'text-gray-600 border-gray-200 hover:border-blue-300 hover:bg-blue-50'}`}
                >
                    <BookOpen className="h-3.5 w-3.5" />
                    {inNotebook ? '📘 In Notebook' : '📘 Mistake Notebook'}
                </button>
                <button
                    onClick={onReport}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all
                        ${reported ? 'bg-red-100 text-red-700 border-red-300' : 'text-gray-600 border-gray-200 hover:border-red-200 hover:bg-red-50'}`}
                >
                    <Flag className="h-3.5 w-3.5" />
                    {reported ? '⚠ Reported' : '⚠ Report Issue'}
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border text-gray-600 border-gray-200 hover:border-purple-200 hover:bg-purple-50 transition-all">
                    <MessageSquare className="h-3.5 w-3.5" /> 💬 Discuss
                </button>
            </div>
        </div>
    );
};

// ── Single-panel question view (mirrors QuestionDisplay's SinglePanel) ─────────

interface SingleSolutionPanelProps {
    question: ExamQuestion;
    questionNumber: number;
    studentResponse: string | string[] | null | undefined;
    isCorrect: boolean;
    hasResponse: boolean;
    questionIndex: number;
    bookmarked: boolean;
    inNotebook: boolean;
    reported: boolean;
    onBookmark: () => void;
    onNotebook: () => void;
    onReport: () => void;
}

const SingleSolutionPanel: React.FC<SingleSolutionPanelProps> = (props) => {
    const { question, questionNumber, studentResponse, isCorrect, hasResponse, questionIndex } = props;
    const sim = getSimData(questionIndex);
    const speed = speedLabel(sim.yourTime, sim.avgTime);
    const marksEarned = !hasResponse ? 0 : isCorrect ? question.marks : -question.negativeMarks;
    const status = !hasResponse
        ? { text: 'Not Attempted', textCls: 'text-gray-600' }
        : isCorrect
            ? { text: 'Correct', textCls: 'text-green-700' }
            : { text: 'Incorrect', textCls: 'text-red-700' };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Blue view-in bar — matches ExamInterface */}
            <div className="bg-[#5b9dd9] text-white px-4 py-1.5 flex items-center justify-end gap-2 text-sm flex-shrink-0">
                <span>View In :</span>
                <select className="bg-white text-gray-800 border border-gray-300 rounded px-2 py-0.5 text-sm cursor-pointer focus:outline-none">
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                </select>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                <div className="p-6">
                    {/* Question number header with chip stats */}
                    <div className="mb-4 -mx-6 -mt-6 px-4 py-2 bg-[#f8f9fa] border-b border-gray-200 flex flex-wrap items-center justify-between gap-y-1">
                        <span className="text-[0.8125rem] font-medium text-gray-700">Question No. {questionNumber}</span>
                        <div className="flex items-center gap-0 bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] text-gray-600 shadow-sm">
                            <span className={`font-semibold ${status.textCls}`}>{status.text}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className={`font-medium ${diffStyle(question.difficulty || sim.difficulty).includes('yellow') ? 'text-yellow-700' : diffStyle(question.difficulty || sim.difficulty).includes('green') ? 'text-green-700' : 'text-red-700'}`}>{question.difficulty || sim.difficulty}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>Your {sim.yourTime}s</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>Avg {sim.avgTime}s</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className={`font-semibold ${marksEarned > 0 ? 'text-green-600' : marksEarned < 0 ? 'text-red-600' : 'text-gray-500'}`}>{marksEarned > 0 ? '+' : ''}{marksEarned} marks</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>{sim.pctCorrect}% Correct</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className={`font-semibold ${speed.cls.includes('green') ? 'text-green-600' : speed.cls.includes('blue') ? 'text-blue-600' : 'text-orange-600'}`}>{speed.text.replace('⚡ ', '').replace('✓ ', '').replace('🐢 ', '')}</span>
                        </div>
                    </div>

                    {/* Question text */}
                    <div className="mb-4">
                        <div
                            className="text-base text-gray-900 leading-relaxed"
                            dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.question) }}
                        />
                        {question.imageUrl && (
                            <img src={question.imageUrl} alt="Question" className="mt-4 max-w-full h-auto rounded" />
                        )}
                    </div>

                    {/* Read-only colour-coded options */}
                    <SolutionOptionList
                        question={question}
                        studentResponse={studentResponse}
                        isCorrect={isCorrect}
                    />
                </div>

                {/* Solution analysis strip */}
                <AnalysisStrip
                    question={question}
                    questionIndex={questionIndex}
                    studentResponse={studentResponse}
                    isCorrect={isCorrect}
                    hasResponse={hasResponse}
                    bookmarked={props.bookmarked}
                    inNotebook={props.inNotebook}
                    reported={props.reported}
                    onBookmark={props.onBookmark}
                    onNotebook={props.onNotebook}
                    onReport={props.onReport}
                />
            </div>
        </div>
    );
};

// ── DualPanel solution view (for RC / DI / Puzzle set questions) ───────────────

interface DualSolutionPanelProps extends SingleSolutionPanelProps {
    /* set resolved via question.set inline or fetched */
}

const DualSolutionPanelInner: React.FC<DualSolutionPanelProps> = (props) => {
    const { question, questionNumber, studentResponse, isCorrect, hasResponse, questionIndex } = props;
    const { questionSet, status } = useQuestionSet(question.setId, question.set);

    const rightRef = useRef<HTMLDivElement>(null);
    useEffect(() => { rightRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }, [question.id]);

    if (status === 'loading') {
        return <div className="flex items-center justify-center h-48 text-gray-400 text-sm">Loading passage…</div>;
    }

    // Fallback to single panel if no set
    if (!questionSet) {
        return <SingleSolutionPanel {...props} />;
    }

    const setTypeLabel: Record<string, string> = {
        reading_comprehension: 'Reading Comprehension',
        di_set: 'Data Interpretation',
        puzzle_set: 'Puzzle / Seating',
        caselet: 'Caselet',
        input_output: 'Input-Output',
        generic: 'Passage',
    };

    return (
        <div className="flex-1 flex flex-col overflow-hidden bg-white">
            {/* Blue view-in bar */}
            <div className="bg-[#5b9dd9] text-white px-4 py-1.5 flex items-center justify-end gap-2 text-sm flex-shrink-0">
                <span>View In :</span>
                <select className="bg-white text-gray-800 border border-gray-300 rounded px-2 py-0.5 text-sm cursor-pointer focus:outline-none">
                    <option>English</option>
                    <option>Hindi</option>
                </select>
            </div>

            {/* Question No. header strip with chip stats */}
            {(() => {
                const sim2 = getSimData(questionIndex);
                const speed2 = speedLabel(sim2.yourTime, sim2.avgTime);
                const marksEarned2 = !hasResponse ? 0 : isCorrect ? question.marks : -question.negativeMarks;
                const statusText2 = !hasResponse ? 'Not Attempted' : isCorrect ? 'Correct' : 'Incorrect';
                const statusCls2 = !hasResponse ? 'text-gray-600' : isCorrect ? 'text-green-700' : 'text-red-700';
                return (
                    <div className="bg-[#f8f9fa] border-b border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between gap-y-1 flex-shrink-0">
                        <span className="text-[0.8125rem] font-medium text-gray-700">
                            Question No. {questionNumber}
                            <span className="ml-2 text-xs text-blue-600 font-normal">[{setTypeLabel[questionSet.setType] || questionSet.setType}]</span>
                        </span>
                        <div className="flex items-center bg-white border border-gray-200 rounded-full px-3 py-1 text-[11px] text-gray-600 shadow-sm">
                            <span className={`font-semibold ${statusCls2}`}>{statusText2}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className={`font-medium ${diffStyle(question.difficulty || sim2.difficulty).includes('yellow') ? 'text-yellow-700' : diffStyle(question.difficulty || sim2.difficulty).includes('green') ? 'text-green-700' : 'text-red-700'}`}>{question.difficulty || sim2.difficulty}</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>Your {sim2.yourTime}s</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>Avg {sim2.avgTime}s</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className={`font-semibold ${marksEarned2 > 0 ? 'text-green-600' : marksEarned2 < 0 ? 'text-red-600' : 'text-gray-500'}`}>{marksEarned2 > 0 ? '+' : ''}{marksEarned2} marks</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span>{sim2.pctCorrect}% Correct</span>
                            <span className="mx-2 text-gray-300">|</span>
                            <span className={`font-semibold ${speed2.cls.includes('green') ? 'text-green-600' : speed2.cls.includes('blue') ? 'text-blue-600' : 'text-orange-600'}`}>{speed2.text.replace('⚡ ', '').replace('✓ ', '').replace('🐢 ', '')}</span>
                        </div>
                    </div>
                );
            })()}

            {/* Dual-panel body — fills remaining height */}
            <div className="flex flex-1 overflow-hidden">
                {/* LEFT — shared passage / table */}
                <div className="w-1/2 border-r border-gray-200 overflow-y-auto p-4 bg-[#fafbff]">
                    {questionSet.title && (
                        <div className="mb-3 text-sm font-semibold text-gray-700 bg-blue-50 border border-blue-100 rounded p-2.5">
                            <strong>Directions:</strong>{' '}
                            <span dangerouslySetInnerHTML={{ __html: sanitizeHtml(questionSet.title) }} />
                        </div>
                    )}
                    <div
                        className="prose prose-sm max-w-none text-gray-800 leading-relaxed"
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(questionSet.sharedContent) }}
                    />
                </div>

                {/* RIGHT — question + options + solution */}
                <div className="w-1/2 flex flex-col overflow-hidden" ref={rightRef}>
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-4">
                            {/* Question text */}
                            <div
                                className="text-sm text-gray-900 leading-relaxed mb-3"
                                dangerouslySetInnerHTML={{ __html: sanitizeHtml(question.question) }}
                            />
                            {question.imageUrl && (
                                <img src={question.imageUrl} alt="Question" className="mb-3 max-w-full h-auto rounded" />
                            )}

                            {/* Read-only colour-coded options */}
                            <SolutionOptionList
                                question={question}
                                studentResponse={studentResponse}
                                isCorrect={isCorrect}
                            />
                        </div>

                        {/* Solution analysis strip */}
                        <AnalysisStrip
                            question={question}
                            questionIndex={questionIndex}
                            studentResponse={studentResponse}
                            isCorrect={isCorrect}
                            hasResponse={hasResponse}
                            bookmarked={props.bookmarked}
                            inNotebook={props.inNotebook}
                            reported={props.reported}
                            onBookmark={props.onBookmark}
                            onNotebook={props.onNotebook}
                            onReport={props.onReport}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// ── Main component ────────────────────────────────────────────────────────────

interface TestSolutionsProps {
    examConfig: ExamConfig;
    responses: Record<string, string | string[] | null>;
    isOpen: boolean;
    onClose: () => void;
}

export const TestSolutions: React.FC<TestSolutionsProps> = ({
    examConfig,
    responses,
    isOpen,
    onClose
}) => {
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
    const [isPaletteCollapsed, setIsPaletteCollapsed] = useState(false);
    const [showSummary, setShowSummary] = useState(false);
    const [paletteFilter, setPaletteFilter] = useState<'all' | 'correct' | 'incorrect' | 'not-attempted'>('all');
    const [bookmarked, setBookmarked] = useState<Set<string>>(new Set());
    const [mistakeNotebook, setMistakeNotebook] = useState<Set<string>>(new Set());
    const [reported, setReported] = useState<Set<string>>(new Set());

    if (!isOpen) return null;

    const allQuestions = examConfig.sections.flatMap(s => s.questions);
    const currentQuestion = allQuestions[currentQuestionIndex];
    const currentSection = examConfig.sections[currentSectionIndex];

    const studentResponse = responses[currentQuestion.id];
    const hasResponse = studentResponse !== null && studentResponse !== undefined;
    const isCorrect = isAnswerCorrect(studentResponse, currentQuestion.correctAnswer);

    // Section stats for the navigator
    const sectionStats: Record<string, { answered: number; total: number }> = {};
    examConfig.sections.forEach(s => {
        sectionStats[s.id] = {
            answered: s.questions.filter(q => responses[q.id]).length,
            total: s.questions.length
        };
    });

    // Palette data (all sections flattened with correct/wrong/skipped status)
    const paletteQuestions = useMemo(() =>
        allQuestions.map((q) => {
            const resp = responses[q.id];
            const hasResp = resp !== null && resp !== undefined;
            const correct = isAnswerCorrect(resp, q.correctAnswer);
            return { id: q.id, questionNumber: q.questionNumber, sectionId: q.sectionId, hasResp, correct };
        }), [allQuestions, responses]
    );

    // Analytics
    const analytics = useMemo(() => {
        let correct = 0, wrong = 0, notAttempted = 0, totalScore = 0;
        const sectionData: Record<string, { correct: number; total: number; totalTime: number }> = {};

        allQuestions.forEach((q, idx) => {
            if (!sectionData[q.sectionId]) sectionData[q.sectionId] = { correct: 0, total: 0, totalTime: 0 };
            const sd = sectionData[q.sectionId];
            sd.total++;
            sd.totalTime += getSimData(idx).yourTime;

            const resp = responses[q.id];
            if (!resp) { notAttempted++; return; }
            if (isAnswerCorrect(resp, q.correctAnswer)) { correct++; sd.correct++; totalScore += q.marks; }
            else { wrong++; totalScore -= q.negativeMarks; }
        });

        const maxScore = allQuestions.reduce((s, q) => s + q.marks, 0);
        const accuracy = (correct + wrong) > 0 ? Math.round(correct / (correct + wrong) * 100) : 0;
        const scorePercent = maxScore > 0 ? Math.round(totalScore / maxScore * 100) : 0;
        const percentile = Math.min(99, Math.max(1, 40 + scorePercent * 0.6));
        return {
            correct, wrong, notAttempted,
            totalScore: Math.max(0, totalScore), maxScore,
            accuracy, percentile: Math.round(percentile),
            rank: Math.max(1, Math.round(2400 * (1 - percentile / 100))),
            sectionData
        };
    }, [allQuestions, responses]);

    const sectionPerf = examConfig.sections.map(s => {
        const d = analytics.sectionData[s.id] || { correct: 0, total: 0, totalTime: 0 };
        return {
            name: s.name,
            acc: d.total > 0 ? Math.round(d.correct / d.total * 100) : 0,
            avgTime: d.total > 0 ? Math.round(d.totalTime / d.total) : 0,
        };
    });

    // Navigation
    const navigateToQuestion = (index: number) => {
        setCurrentQuestionIndex(index);
        const q = allQuestions[index];
        const si = examConfig.sections.findIndex(s => s.id === q.sectionId);
        if (si !== -1) setCurrentSectionIndex(si);
        setShowSummary(false);
    };

    const navigateToSection = (index: number) => {
        setCurrentSectionIndex(index);
        const firstQ = allQuestions.findIndex(q => q.sectionId === examConfig.sections[index].id);
        if (firstQ !== -1) setCurrentQuestionIndex(firstQ);
        setShowSummary(false);
    };

    const toggleSet = (set: Set<string>, id: string) => {
        const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); return n;
    };

    const goToFirstIncorrect = () => {
        const idx = allQuestions.findIndex(q => {
            const r = responses[q.id];
            return r && !isAnswerCorrect(r, q.correctAnswer);
        });
        if (idx !== -1) navigateToQuestion(idx);
    };

    const isSet = !!(currentQuestion.setId || currentQuestion.set);

    return (
        <div className="fixed inset-0 bg-white z-50 flex flex-col">

            {/* ── HEADER — exact match to ExamInterface ── */}
            <div className="bg-[#4a4a4a] text-white px-4 py-2.5 flex items-center border-b border-gray-600 flex-shrink-0">
                {/* Left — logo */}
                <div className="flex items-center gap-2 w-1/4">
                    <div className="w-8 h-8 rounded bg-[#1976d2] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">P</div>
                    <span className="text-xs text-gray-300 font-semibold hidden sm:block">PrepSmart</span>
                </div>
                {/* Centre — title */}
                <div className="flex-1 text-center">
                    <h1 className="text-base font-bold leading-tight">Solutions — {examConfig.title}</h1>
                    <div className="text-[10px] text-gray-400">{currentSection?.name}</div>
                </div>
                {/* Right — summary toggle + close */}
                <div className="w-1/4 flex justify-end items-center gap-2">
                    <Button
                        variant="ghost" size="sm"
                        onClick={() => setShowSummary(v => !v)}
                        className={`text-xs px-3 h-7 border rounded ${showSummary ? 'bg-blue-600 text-white border-blue-500 hover:bg-blue-700' : 'text-gray-200 border-gray-500 hover:bg-gray-700'}`}
                    >
                        <BarChart2 className="h-3.5 w-3.5 mr-1.5" />
                        {showSummary ? 'Back to Questions' : 'Summary'}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-gray-700 h-7 px-2" onClick={onClose}>
                        <X className="h-4 w-4 mr-1" /><span className="text-xs">Close</span>
                    </Button>
                </div>
            </div>

            {/* ── SECTION NAVIGATOR — identical to ExamInterface ── */}
            <SectionNavigator
                sections={examConfig.sections}
                currentSectionIndex={currentSectionIndex}
                onSectionChange={navigateToSection}
                sectionStats={sectionStats}
            />

            {/* ── SECTIONS info strip — mirrors ExamInterface "Sections / Time Left" row ── */}
            <div className="bg-gray-100 border-b border-gray-300 px-4 py-1.5 flex items-center justify-between text-sm flex-shrink-0">
                <span className="text-gray-600 font-medium">Sections</span>
                <span className="text-gray-700 font-semibold text-xs flex items-center gap-2">
                    📖 Review Mode &nbsp;·&nbsp; Q {currentQuestionIndex + 1} / {allQuestions.length}
                </span>
            </div>

            {/* ── MAIN AREA ── */}
            {showSummary ? (
                /* ── SUMMARY VIEW ── */
                <div className="flex-1 overflow-y-auto bg-gray-50 p-5">
                    <div className="max-w-4xl mx-auto space-y-5">
                        {/* Score cards */}
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { label: 'Score', value: `${analytics.totalScore.toFixed(1)} / ${analytics.maxScore}`, color: 'from-blue-500 to-blue-600', icon: TrendingUp },
                                { label: 'Accuracy', value: `${analytics.accuracy}%`, color: 'from-green-500 to-green-600', icon: Target },
                                { label: 'Rank', value: `${analytics.rank} / 2400`, color: 'from-purple-500 to-purple-600', icon: Award },
                                { label: 'Percentile', value: `${analytics.percentile}%`, color: 'from-orange-500 to-orange-600', icon: Percent },
                            ].map(stat => (
                                <div key={stat.label} className={`rounded-xl bg-gradient-to-br ${stat.color} p-4 text-white shadow-sm`}>
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-[10px] font-semibold opacity-80 uppercase tracking-wide">{stat.label}</span>
                                        <stat.icon className="h-4 w-4 opacity-70" />
                                    </div>
                                    <div className="text-2xl font-bold">{stat.value}</div>
                                </div>
                            ))}
                        </div>

                        {/* Q breakdown */}
                        <div className="bg-white rounded-xl border p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2"><BarChart2 className="h-4 w-4 text-blue-500" />Question Breakdown</h3>
                            <div className="grid grid-cols-3 gap-4">
                                {[
                                    { n: analytics.correct, label: 'Correct', cls: 'bg-green-50 border-green-100 text-green-600' },
                                    { n: analytics.wrong, label: 'Wrong', cls: 'bg-red-50 border-red-100 text-red-600' },
                                    { n: analytics.notAttempted, label: 'Skipped', cls: 'bg-gray-50 border-gray-200 text-gray-500' },
                                ].map(c => (
                                    <div key={c.label} className={`text-center p-4 rounded-xl border ${c.cls}`}>
                                        <div className="text-3xl font-bold">{c.n}</div>
                                        <div className="text-xs font-semibold mt-1">{c.label}</div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Section-wise */}
                        <div className="bg-white rounded-xl border p-5 shadow-sm">
                            <h3 className="font-bold text-gray-800 mb-4 text-sm flex items-center gap-2"><BarChart2 className="h-4 w-4 text-indigo-500" />Section-wise Analysis</h3>
                            <div className="space-y-3">
                                {sectionPerf.map(s => (
                                    <div key={s.name}>
                                        <div className="flex justify-between items-center mb-1">
                                            <span className="text-sm font-semibold text-gray-700">{s.name}</span>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1"><Clock className="h-3 w-3" />Avg {s.avgTime}s</span>
                                                <span className={`font-bold ${s.acc >= 60 ? 'text-green-600' : 'text-red-600'}`}>{s.acc}%</span>
                                            </div>
                                        </div>
                                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div className={`h-full rounded-full ${s.acc >= 70 ? 'bg-green-500' : s.acc >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${s.acc}%` }} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Strength / Weakness */}
                        <div className="grid sm:grid-cols-2 gap-4">
                            {[
                                { title: 'Strong Areas', data: sectionPerf.filter(s => s.acc >= 60), color: 'text-green-700', icon: <CheckCircle className="h-4 w-4" />, dot: 'bg-green-500' },
                                { title: 'Weak Areas', data: sectionPerf.filter(s => s.acc < 60), color: 'text-red-600', icon: <AlertTriangle className="h-4 w-4" />, dot: 'bg-red-500' },
                            ].map(g => (
                                <div key={g.title} className="bg-white rounded-xl border p-5 shadow-sm">
                                    <h3 className={`font-bold mb-3 text-sm flex items-center gap-2 ${g.color}`}>{g.icon}{g.title}</h3>
                                    {g.data.length > 0
                                        ? <ul className="space-y-2">{g.data.map(s => (
                                            <li key={s.name} className="flex items-center justify-between text-sm">
                                                <span className="flex items-center gap-2 text-gray-700"><span className={`w-2 h-2 rounded-full ${g.dot} inline-block`} />{s.name}</span>
                                                <span className={`font-bold text-xs ${g.color}`}>{s.acc}%</span>
                                            </li>
                                        ))}</ul>
                                        : <p className="text-xs text-gray-400 italic">None</p>
                                    }
                                </div>
                            ))}
                        </div>

                        {/* Quick actions */}
                        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4 flex flex-wrap gap-2">
                            <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700" onClick={() => navigateToQuestion(0)}>
                                <BookOpen className="h-3.5 w-3.5 mr-1.5" /> Review All Questions
                            </Button>
                            <Button size="sm" variant="outline" className="text-xs border-red-200 text-red-600 hover:bg-red-50" onClick={goToFirstIncorrect}>
                                <RotateCcw className="h-3.5 w-3.5 mr-1.5" /> Reattempt Incorrect
                            </Button>
                        </div>
                    </div>
                </div>
            ) : (
                /* ── QUESTION REVIEW — same split layout as ExamInterface ── */
                <div className="flex flex-1 overflow-hidden">

                    {/* Question area */}
                    <div className="flex-1 flex flex-col overflow-hidden">
                        {isSet
                            ? <DualSolutionPanelInner
                                question={currentQuestion}
                                questionNumber={currentQuestion.questionNumber}
                                questionIndex={currentQuestionIndex}
                                studentResponse={studentResponse}
                                isCorrect={isCorrect}
                                hasResponse={hasResponse}
                                bookmarked={bookmarked.has(currentQuestion.id)}
                                inNotebook={mistakeNotebook.has(currentQuestion.id)}
                                reported={reported.has(currentQuestion.id)}
                                onBookmark={() => setBookmarked(p => toggleSet(p, currentQuestion.id))}
                                onNotebook={() => setMistakeNotebook(p => toggleSet(p, currentQuestion.id))}
                                onReport={() => setReported(p => toggleSet(p, currentQuestion.id))}
                            />
                            : <SingleSolutionPanel
                                question={currentQuestion}
                                questionNumber={currentQuestion.questionNumber}
                                questionIndex={currentQuestionIndex}
                                studentResponse={studentResponse}
                                isCorrect={isCorrect}
                                hasResponse={hasResponse}
                                bookmarked={bookmarked.has(currentQuestion.id)}
                                inNotebook={mistakeNotebook.has(currentQuestion.id)}
                                reported={reported.has(currentQuestion.id)}
                                onBookmark={() => setBookmarked(p => toggleSet(p, currentQuestion.id))}
                                onNotebook={() => setMistakeNotebook(p => toggleSet(p, currentQuestion.id))}
                                onReport={() => setReported(p => toggleSet(p, currentQuestion.id))}
                            />
                        }
                    </div>

                    {/* ── Right palette — section-grouped ── */}
                    <div className="relative flex h-full">
                        <button
                            onClick={() => setIsPaletteCollapsed(v => !v)}
                            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 -translate-x-full bg-[#2d2d2d] hover:bg-[#444] text-white w-5 h-16 flex items-center justify-center rounded-l-md shadow-md transition-colors"
                        >
                            {isPaletteCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
                        </button>

                        {!isPaletteCollapsed && (
                            <div className="w-[260px] bg-[#e3f2fd] border-l border-gray-300 flex flex-col h-full overflow-hidden">
                                {/* Legend — uses real QuestionButton sprite elements */}
                                <div className="px-3 py-2.5 bg-white border-b border-gray-200 flex-shrink-0">
                                    <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wide mb-2">Legend</div>
                                    <div className="flex flex-col gap-2">
                                        {(() => {
                                            const correctCount = paletteQuestions.filter(pq => pq.hasResp && pq.correct).length;
                                            const incorrectCount = paletteQuestions.filter(pq => pq.hasResp && !pq.correct).length;
                                            const notAttemptedCount = paletteQuestions.filter(pq => !pq.hasResp).length;
                                            return [
                                                { status: 'answered' as const, label: 'Correct', count: correctCount },
                                                { status: 'not-answered' as const, label: 'Incorrect', count: incorrectCount },
                                                { status: 'not-visited' as const, label: 'Not Attempted', count: notAttemptedCount },
                                            ].map(({ status, label, count }) => (
                                                <div key={label} className="flex items-center gap-2">
                                                    <QuestionButton
                                                        questionNumber={count}
                                                        status={status}
                                                        size={30}
                                                        onClick={() => { }}
                                                    />
                                                    <span className="text-[11px] text-gray-700 font-medium">{label}</span>
                                                </div>
                                            ));
                                        })()}
                                    </div>

                                    {/* Filter buttons */}
                                    <div className="mt-3 flex flex-wrap gap-1">
                                        {([
                                            { key: 'all', label: 'All' },
                                            { key: 'correct', label: 'Correct' },
                                            { key: 'incorrect', label: 'Incorrect' },
                                            { key: 'not-attempted', label: 'Skipped' },
                                        ] as const).map(({ key, label }) => (
                                            <button
                                                key={key}
                                                onClick={() => setPaletteFilter(key)}
                                                className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border transition-all ${paletteFilter === key
                                                    ? key === 'all' ? 'bg-blue-600 text-white border-blue-600'
                                                        : key === 'correct' ? 'bg-green-600 text-white border-green-600'
                                                            : key === 'incorrect' ? 'bg-red-500 text-white border-red-500'
                                                                : 'bg-gray-500 text-white border-gray-500'
                                                    : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                                    }`}
                                            >
                                                {label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Section-grouped question grid (filtered) */}
                                <div className="flex-1 overflow-y-auto">
                                    {examConfig.sections.map((section) => {
                                        const sectionStartGlobal = examConfig.sections
                                            .slice(0, examConfig.sections.indexOf(section))
                                            .reduce((acc, s) => acc + s.questions.length, 0);

                                        const filteredQuestions = section.questions
                                            .map((q, localIdx) => ({ q, globalIdx: sectionStartGlobal + localIdx }))
                                            .filter(({ globalIdx }) => {
                                                const pq = paletteQuestions[globalIdx];
                                                if (paletteFilter === 'all') return true;
                                                if (paletteFilter === 'correct') return pq.hasResp && pq.correct;
                                                if (paletteFilter === 'incorrect') return pq.hasResp && !pq.correct;
                                                if (paletteFilter === 'not-attempted') return !pq.hasResp;
                                                return true;
                                            });

                                        if (filteredQuestions.length === 0) return null;

                                        return (
                                            <div key={section.id}>
                                                {/* Section name header */}
                                                <div className="bg-[#1976d2] text-white px-3 py-2 text-[11px] font-semibold text-center tracking-wide">
                                                    {section.name}
                                                </div>
                                                {/* Question grid */}
                                                <div className="p-3 bg-white grid grid-cols-4 gap-2">
                                                    {filteredQuestions.map(({ q, globalIdx }) => {
                                                        const pq = paletteQuestions[globalIdx];
                                                        return (
                                                            <div key={q.id} className="flex items-center justify-center">
                                                                <QuestionButton
                                                                    questionNumber={q.questionNumber}
                                                                    status={toSolutionStatus(pq.hasResp, pq.correct)}
                                                                    isCurrent={globalIdx === currentQuestionIndex}
                                                                    size={48}
                                                                    onClick={() => navigateToQuestion(globalIdx)}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* ── BOTTOM NAV BAR — mirrors ExamInterface action buttons row ── */}
            <div className="bg-white border-t border-gray-300 px-4 py-2.5 flex items-center justify-between flex-shrink-0">
                <Button
                    variant="outline" size="sm"
                    onClick={() => currentQuestionIndex > 0 && navigateToQuestion(currentQuestionIndex - 1)}
                    disabled={currentQuestionIndex === 0 || showSummary}
                    className="flex items-center gap-1.5 text-xs h-8"
                >
                    <ChevronLeft className="h-4 w-4" /> Previous
                </Button>

                <div className="flex items-center gap-3">
                    {!showSummary && (
                        <button onClick={goToFirstIncorrect} className="text-xs px-3 py-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 flex items-center gap-1.5 transition-all h-8">
                            <RotateCcw className="h-3 w-3" /> Reattempt Incorrect
                        </button>
                    )}
                    {showSummary && (
                        <span className="text-xs font-semibold text-blue-600 flex items-center gap-1.5">
                            <BarChart2 className="h-3.5 w-3.5" /> Test Summary
                        </span>
                    )}
                </div>

                <Button
                    size="sm"
                    onClick={() => currentQuestionIndex < allQuestions.length - 1 && navigateToQuestion(currentQuestionIndex + 1)}
                    disabled={currentQuestionIndex === allQuestions.length - 1 || showSummary}
                    className="flex items-center gap-1.5 text-xs h-8 bg-[#1976d2] hover:bg-[#1565c0] text-white"
                >
                    Next <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    );
};
