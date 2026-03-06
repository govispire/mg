/**
 * ExamInstructions — IBPS-style two-page instruction screen.
 *
 * Layout (matching official IBPS interface):
 *  ┌──────────────────── header ───────────────────────────┐
 *  │                  Exam Title                           │
 *  ├──── Instructions bar ─────────────────────────────────┤
 *  │  [View In dropdown]                                   │
 *  ├──────────────────────────────┬────────────────────────┤
 *  │  LEFT — scrollable content   │  RIGHT — user card     │
 *  │  (instructions / p1 / p2)   │  (photo + name)        │
 *  ├──────────────────────────────┴────────────────────────┤
 *  │  [< Previous]                               [Next >]  │
 *  └───────────────────────────────────────────────────────┘
 */

import React, { useState } from 'react';
import { ExamConfig } from '@/types/exam';
import { Checkbox } from '@/components/ui/checkbox';
import { getBgStyle, getNotVisitedStyle } from '../../question-palette/QuestionButton';

interface ExamInstructionsProps {
    examConfig: ExamConfig;
    onComplete: () => void;
    userName?: string;
    userPhoto?: string;
}

// ── Palette legend symbols ──────────────────────────────────────────────────
const legendItems = [
    {
        render: (size: number) => (
            <div style={getNotVisitedStyle(size)}>{' '}</div>
        ),
        label: 'You have not visited the question yet.',
    },
    {
        render: (size: number) => (
            <div className="relative" style={{ width: size, height: size }}>
                <div aria-hidden style={{ ...getBgStyle('not-answered', size), position: 'absolute', top: 0, left: 0 }} />
            </div>
        ),
        label: 'You have not answered the question.',
    },
    {
        render: (size: number) => (
            <div className="relative" style={{ width: size, height: size }}>
                <div aria-hidden style={{ ...getBgStyle('answered', size), position: 'absolute', top: 0, left: 0 }} />
            </div>
        ),
        label: 'You have answered the question.',
    },
    {
        render: (size: number) => (
            <div className="relative" style={{ width: size, height: size }}>
                <div aria-hidden style={{ ...getBgStyle('marked', size), position: 'absolute', top: 0, left: 0 }} />
            </div>
        ),
        label: 'You have NOT answered the question, but have marked the question for review.',
    },
    {
        render: (size: number) => (
            <div className="relative" style={{ width: size, height: size }}>
                <div aria-hidden style={{ ...getBgStyle('answered-marked', size), position: 'absolute', top: 0, left: 0 }} />
            </div>
        ),
        label: 'The question(s) "Answered and Marked for Review" will be considered for evaluation.',
    },
];

// ── USER CARD (right panel) ──────────────────────────────────────────────────
const UserCard: React.FC<{ name: string; photo?: string }> = ({ name, photo }) => (
    <div className="flex flex-col items-center gap-3 pt-6 px-4">
        {photo ? (
            <img
                src={photo}
                alt={name}
                className="w-24 h-24 rounded-full object-cover border-4 border-gray-300 shadow"
            />
        ) : (
            /* Default grey avatar — matches IBPS screenshot */
            <div className="w-24 h-24 rounded-full bg-gradient-to-b from-gray-400 to-gray-600 border-4 border-gray-300 shadow flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 100" className="w-20 h-20 text-gray-200" fill="currentColor">
                    <circle cx="50" cy="35" r="22" />
                    <ellipse cx="50" cy="90" rx="32" ry="22" />
                </svg>
            </div>
        )}
        <span className="text-[#c04000] font-bold text-base text-center">{name}</span>
    </div>
);

// ── PAGE 1: General Instructions ─────────────────────────────────────────────
const Page1: React.FC<{ examConfig: ExamConfig }> = ({ examConfig }) => (
    <div className="text-sm text-gray-800 leading-relaxed">
        {/* View In bar */}
        <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center justify-end gap-2">
            <span className="text-sm text-gray-700">View In :</span>
            <select className="border border-gray-400 rounded px-2 py-0.5 text-sm bg-white focus:outline-none">
                <option>English</option>
                <option>Hindi</option>
            </select>
        </div>

        <div className="p-5 space-y-4">
            {/* ── General Instructions ── */}
            <p className="font-bold underline text-gray-900">General Instructions:</p>

            <ol className="list-decimal list-outside ml-5 space-y-3">
                <li>
                    Total duration of examination is <strong>{examConfig.totalDuration} minutes</strong>.{' '}
                    (<strong>20 minutes</strong> extra for every 60 minutes (1 hour) of the examination time for
                    candidates with disability eligible for compensatory time).
                </li>
                <li>
                    The clock will be set at the server. The countdown timer in the top right corner of screen will
                    display the remaining time available for you to complete the examination. When the timer reaches
                    zero, the examination will end by itself. You will <strong>not</strong> be required to end or
                    submit your examination.
                </li>
                <li>
                    <span>
                        The Question Palette displayed on the right side of screen will show the status of each
                        question using one of the following symbols:
                    </span>
                    {/* Palette legend */}
                    <div className="mt-3 space-y-2 ml-1">
                        {legendItems.map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className="flex-shrink-0">{item.render(34)}</div>
                                <span>{item.label}</span>
                            </div>
                        ))}
                    </div>
                    <p className="mt-3 italic text-gray-700">
                        The Marked for Review status for a question simply indicates that you would like to look at
                        that question again. <em className="text-[#c04000] not-italic">If a question is answered
                            and Marked for Review, your answer for that question will be considered in the evaluation.</em>
                    </p>
                </li>
                <li>
                    You can click on the <strong>"&gt;"</strong> arrow which appears to the left of question palette
                    to collapse the question palette thereby maximizing the question window. To view the question
                    palette again, you can click on <strong>"&lt;"</strong> which appears on the right side of
                    question window.
                </li>
                <li>
                    You can click on your <strong>"Profile"</strong> image on top right corner of your screen to
                    change the language during the exam for entire question paper. On clicking of Profile image you
                    will get a drop-down to change the question content to the desired language.
                </li>
                <li>
                    You can click on <span className="inline-block text-blue-600 font-bold">↓ Scroll Down</span>{' '}
                    to navigate to the bottom and{' '}
                    <span className="inline-block text-blue-600 font-bold">↑ Scroll Up</span>{' '}
                    to navigate to the top of the question area, without scrolling.
                </li>
            </ol>

            {/* ── Navigating to a Question ── */}
            <p className="font-bold underline text-gray-900 pt-2">Navigating to a Question:</p>

            <ol className="list-decimal list-outside ml-5 space-y-3" start={7}>
                <li>
                    To answer a question, do the following:
                    <ol className="list-[lower-alpha] list-outside ml-5 space-y-1.5 mt-2">
                        <li>
                            Click on the question number in the Question Palette at the right of your screen to go to
                            that numbered question directly. Note that using this option does{' '}
                            <strong>NOT</strong> save your answer to the current question.
                        </li>
                        <li>
                            Click on <strong>Save &amp; Next</strong> to save your answer for the current question
                            and then go to the next question.
                        </li>
                        <li>
                            Click on <strong>Mark for Review &amp; Next</strong> to save your answer for the current
                            question, mark it for review, and then go to the next question.
                        </li>
                    </ol>
                </li>
            </ol>

            {/* ── Answering a Question ── */}
            <p className="font-bold underline text-gray-900 pt-2">Answering a Question :</p>

            <ol className="list-decimal list-outside ml-5 space-y-3" start={8}>
                <li>
                    Procedure for answering a multiple choice type question:
                    <ol className="list-[lower-alpha] list-outside ml-5 space-y-1.5 mt-2">
                        <li>To select your answer, click on the button of one of the options.</li>
                        <li>
                            To deselect your chosen answer, click on the button of the chosen option again or click
                            on the <strong>Clear Response</strong> button.
                        </li>
                        <li>To change your chosen answer, click on the button of another option.</li>
                        <li>To save your answer, you <strong>MUST</strong> click on the <strong>Save &amp; Next</strong> button.</li>
                        <li>
                            To mark the question for review, click on the{' '}
                            <strong>Mark for Review &amp; Next</strong> button.{' '}
                            <em className="text-[#c04000]">If an answer is selected for a question that is Marked for
                                Review, that answer will be considered in the evaluation.</em>
                        </li>
                    </ol>
                </li>
            </ol>

            <ol className="list-decimal list-outside ml-5 space-y-3" start={9}>
                <li>
                    To change your answer to a question that has already been answered,{' '}
                    <span className="text-blue-700">first select that question for answering</span> and then follow
                    the procedure for answering that type of question.
                </li>
                <li>
                    Note that <strong>ONLY</strong> Questions for which answers are saved or marked for review after
                    answering will be considered for evaluation.
                </li>
            </ol>

            {/* ── Navigating through sections ── */}
            <p className="font-bold underline text-gray-900 pt-2">Navigating through sections:</p>

            <ol className="list-decimal list-outside ml-5 space-y-3" start={11}>
                <li>
                    Sections in this question paper are displayed on the top bar of the screen. Questions in a
                    section can be viewed by clicking on the section name. The section you are currently viewing is{' '}
                    <span className="text-blue-700">highlighted</span>.
                </li>
                <li>
                    After clicking the <strong>Save &amp; Next</strong> button on the last question for a section,
                    you will automatically be taken to the first question of the next section.
                </li>
                <li>
                    You can shuffle between tests and questions anytime during the examination as per your convenience
                    only during the time stipulated.
                </li>
                <li>
                    Candidate can view the corresponding section summary as part of the legend that appears in every
                    section above the question palette.
                </li>
            </ol>
        </div>
    </div>
);

// ── PAGE 2: Other Important Instructions + Agreement ──────────────────────────
const Page2: React.FC<{ examConfig: ExamConfig; hasAgreed: boolean; onAgree: (v: boolean) => void }> = ({
    examConfig, hasAgreed, onAgree
}) => {
    const sections = examConfig.sections;
    const totalQ = sections.reduce((s, sec) => s + sec.questionsCount, 0);

    return (
        <div className="text-sm text-gray-800 leading-relaxed">
            {/* View In bar */}
            <div className="bg-white border-b border-gray-300 px-4 py-1.5 flex items-center justify-end gap-2">
                <span className="text-sm text-gray-700">View In :</span>
                <select className="border border-gray-400 rounded px-2 py-0.5 text-sm bg-white focus:outline-none">
                    <option>English</option>
                    <option>Hindi</option>
                </select>
            </div>

            <div className="p-5 space-y-4">
                <p className="font-bold underline text-gray-900">Other Important Instructions</p>

                <ol className="list-decimal list-outside ml-5 space-y-3">
                    <li>
                        The text displayed on the screen must be written by you in the space provided in the call
                        letter. You will be given <strong>5 minutes</strong> for this activity.
                    </li>
                    <li>
                        The Question Paper consists of objective type questions as follows:

                        {/* Section table */}
                        <div className="mt-3 overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-400 text-sm text-center">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-400 px-3 py-2 whitespace-nowrap underline">Sr.No.</th>
                                        <th className="border border-gray-400 px-3 py-2 text-left underline">Name of the Test</th>
                                        <th className="border border-gray-400 px-3 py-2 whitespace-nowrap">No. of<br />Questions</th>
                                        <th className="border border-gray-400 px-3 py-2 whitespace-nowrap">Max.<br />Marks</th>
                                        <th className="border border-gray-400 px-3 py-2 whitespace-nowrap">Version</th>
                                        <th className="border border-gray-400 px-3 py-2 whitespace-nowrap">Duration</th>
                                        <th className="border border-gray-400 px-3 py-2">Duration for PWBD candidates eligible for compensatory time</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.map((section, index) => (
                                        <tr key={section.id}>
                                            <td className="border border-gray-400 px-3 py-2">{index + 1}</td>
                                            <td className="border border-gray-400 px-3 py-2 text-left">{section.name}</td>
                                            <td className="border border-gray-400 px-3 py-2">{section.questionsCount}</td>
                                            <td className="border border-gray-400 px-3 py-2">{section.questionsCount}</td>
                                            {index === 0 && (
                                                <>
                                                    <td className="border border-gray-400 px-3 py-2" rowSpan={sections.length}>
                                                        Bilingual<br />i.e.<br />English<br />and Hindi
                                                    </td>
                                                    <td className="border border-gray-400 px-3 py-2" rowSpan={sections.length}>
                                                        {examConfig.totalDuration} Minutes
                                                    </td>
                                                    <td className="border border-gray-400 px-3 py-2" rowSpan={sections.length}>
                                                        20 minutes additional time for every hour of examination
                                                    </td>
                                                </>
                                            )}
                                        </tr>
                                    ))}
                                    <tr className="font-semibold bg-gray-100">
                                        <td colSpan={2} className="border border-gray-400 px-3 py-2">TOTAL</td>
                                        <td className="border border-gray-400 px-3 py-2">{totalQ}</td>
                                        <td className="border border-gray-400 px-3 py-2">{totalQ}</td>
                                        <td colSpan={3} className="border border-gray-400 px-3 py-2" />
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </li>

                    <li>As mentioned above, test is compositely timed. Candidates can attempt any question during the time of {examConfig.totalDuration} minutes.</li>
                    <li>There will be <strong>no penalty</strong> for wrong answers. Candidates are advised to avoid answering by guessing.</li>
                    <li>To see a given question in another language, a candidate can click on the <strong>View in</strong> drop-down and select the desired language.</li>
                    <li>The questions will be displayed on the screen one at a time. Do not spend too much time on any question.</li>
                    <li>Each question will have 5 alternatives, out of which only one will be the correct answer.</li>
                    <li>
                        The candidates are requested to follow the instructions of the "Test Administrator" carefully. If any candidate does not follow the instructions / rules, it would be treated as a case of misconduct / adoption of unfair means and the candidature of the candidate will be cancelled.
                    </li>
                    <li>
                        The candidates may ask the Test Administrator about their doubts or questions only before the commencement of the test. No query shall be entertained after the commencement of the examination.
                    </li>
                    <li>Candidates will not be permitted to submit their examination unless the entire test duration is exhausted.</li>
                    <li>
                        After the expiry of test duration, the candidates will not be able to attempt any question or check their answers. The answers of the candidate would be saved automatically by the computer system even if he/she has not clicked the "Submit" button.
                    </li>
                </ol>

                <p className="font-bold mt-2">
                    Please note that under no circumstances should a candidate click on any of the 'keyboard keys' once the exam starts as this will lock the exam.
                </p>

                {/* Agreement checkbox */}
                <div className="mt-4 border border-gray-300 rounded p-3 bg-gray-50">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            checked={hasAgreed}
                            onCheckedChange={(checked) => onAgree(checked as boolean)}
                            className="mt-1 shrink-0"
                            id="agree-checkbox"
                        />
                        <span className="text-sm text-gray-800">
                            I have read and understood the instructions. All computer hardware allotted to me are in
                            proper working condition. I declare that I am not in possession of / not wearing / not
                            carrying any prohibited gadget like mobile phone, bluetooth devices etc. /
                            am not wearing shoes. I agree that in case of not adhering to the instructions, I shall
                            be liable to be debarred from this Test and/or to disciplinary action, which may include
                            ban from future Tests / Examinations.
                        </span>
                    </label>
                </div>
            </div>
        </div>
    );
};

// ── Main exported component ───────────────────────────────────────────────────
export const ExamInstructions: React.FC<ExamInstructionsProps> = ({
    examConfig,
    onComplete,
    userName = 'Student',
    userPhoto,
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [hasAgreed, setHasAgreed] = useState(false);

    const totalPages = 2;

    return (
        <div className="fixed inset-0 bg-[#e0e0e0] flex flex-col" style={{ fontFamily: 'Arial, sans-serif' }}>

            {/* ── TOP HEADER — dark blue with exam title ── */}
            <div className="bg-[#5b9dd9] text-white px-6 py-3 text-center flex-shrink-0">
                <h1 className="text-xl font-bold">{examConfig.title}</h1>
            </div>

            {/* ── INSTRUCTIONS LABEL BAR ── */}
            <div className="bg-[#b3cde0] px-4 py-2 border-b border-gray-400 flex-shrink-0">
                <span className="font-bold text-gray-900">
                    {currentPage === 0 ? 'Instructions' : 'Important Instructions'}
                </span>
            </div>

            {/* ── BODY: left content + right user card ── */}
            <div className="flex flex-1 overflow-hidden border-t border-gray-400">

                {/* LEFT — scrollable instruction content */}
                <div className="flex-1 overflow-y-auto bg-white border-r border-gray-400">
                    {currentPage === 0
                        ? <Page1 examConfig={examConfig} />
                        : <Page2 examConfig={examConfig} hasAgreed={hasAgreed} onAgree={setHasAgreed} />
                    }
                </div>

                {/* RIGHT — user photo + name (matches IBPS right panel exactly) */}
                <div className="w-44 flex-shrink-0 bg-[#f0f0f0] border-l border-gray-300 overflow-y-auto">
                    <UserCard name={userName} photo={userPhoto} />
                </div>
            </div>

            {/* ── FOOTER NAV BAR ── */}
            <div className="bg-[#d0d0d0] border-t border-gray-400 px-6 py-3 flex items-center justify-between flex-shrink-0">
                {/* Left — Previous */}
                <div>
                    {currentPage > 0 && (
                        <button
                            onClick={() => setCurrentPage(p => p - 1)}
                            className="px-5 py-1.5 bg-[#5b9dd9] hover:bg-[#4a8cc8] text-white text-sm font-semibold rounded shadow flex items-center gap-1"
                        >
                            &lt; Previous
                        </button>
                    )}
                </div>

                {/* Right — Next / I am ready */}
                <div>
                    {currentPage < totalPages - 1 ? (
                        <button
                            onClick={() => setCurrentPage(p => p + 1)}
                            className="px-5 py-1.5 bg-[#5b9dd9] hover:bg-[#4a8cc8] text-white text-sm font-semibold rounded shadow flex items-center gap-1"
                        >
                            Next &gt;
                        </button>
                    ) : (
                        <button
                            onClick={onComplete}
                            disabled={!hasAgreed}
                            className={`px-5 py-1.5 text-white text-sm font-semibold rounded shadow transition-colors
                                ${hasAgreed ? 'bg-[#4caf50] hover:bg-[#388e3c]' : 'bg-gray-400 cursor-not-allowed'}`}
                        >
                            I am ready to begin the Examination
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};
