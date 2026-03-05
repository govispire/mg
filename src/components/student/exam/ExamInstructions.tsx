import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { ExamConfig } from '@/types/exam';
import { ArrowLeft, ArrowRight } from 'lucide-react';

interface ExamInstructionsProps {
    examConfig: ExamConfig;
    onComplete: () => void;
}

export const ExamInstructions: React.FC<ExamInstructionsProps> = ({
    examConfig,
    onComplete
}) => {
    const [currentPage, setCurrentPage] = useState(0);
    const [hasAgreed, setHasAgreed] = useState(false);

    // ── PAGE 1: General Instructions + Navigation (merged) ───────────────
    const renderPage1 = () => (
        <div className="space-y-5">
            <h2 className="text-xl font-bold text-gray-900">General Instructions:</h2>

            <ol className="list-decimal list-outside ml-6 space-y-3 text-gray-700 text-sm">
                <li>
                    Total duration of examination is <strong>{examConfig.totalDuration} minutes</strong>.
                    (20 minutes extra for every 60 minutes of examination time for candidates with
                    disability eligible for compensatory time.)
                </li>
                <li>
                    The clock will be set at the server. The countdown timer in the top right corner
                    will display remaining time. When the timer reaches zero, the examination will end
                    automatically.
                </li>
                <li>
                    <div className="mb-2">
                        The Question Palette on the right shows the status of each question:
                    </div>
                    <div className="space-y-1.5 ml-2">
                        {[
                            { bg: 'bg-gray-300', color: '', label: 'Not visited yet.' },
                            { bg: 'bg-red-500', color: 'text-white', label: 'Not answered.' },
                            { bg: 'bg-green-500', color: 'text-white', label: 'Answered.' },
                            { bg: 'bg-purple-600', color: 'text-white', label: 'Not answered but Marked for Review.' },
                            { bg: 'bg-purple-600', color: 'text-white border-2 border-green-400', label: '"Answered & Marked for Review" — will be evaluated.' },
                        ].map((item, i) => (
                            <div key={i} className="flex items-center gap-3">
                                <div className={`w-7 h-7 shrink-0 ${item.bg} ${item.color} flex items-center justify-center rounded text-xs font-bold`}>
                                    {i + 1}
                                </div>
                                <span className="text-sm">{item.label}</span>
                            </div>
                        ))}
                    </div>
                </li>
                <li>
                    <strong>Marked for Review</strong> only means you want to revisit. If answered and
                    Marked for Review, your answer <strong className="text-red-600">will still be evaluated</strong>.
                </li>
            </ol>

            <h2 className="text-xl font-bold text-gray-900 pt-2">Navigating & Answering:</h2>

            <ul className="list-disc list-outside ml-6 space-y-2 text-gray-700 text-sm">
                <li>Click a question number in the palette to jump to it (does <em>not</em> save current answer).</li>
                <li>Click <strong>Save &amp; Next</strong> to save your answer and move to the next question.</li>
                <li>Click <strong>Mark for Review &amp; Next</strong> to save, mark for review, and move on.</li>
                <li>To deselect an answer, click the chosen option again or use <strong>Clear Response</strong>.</li>
                <li>Only saved or Marked-for-Review answers will be considered for evaluation.</li>
                <li>Sections are shown on the top bar. After the last question of a section, you move automatically to the next section.</li>
            </ul>
        </div>
    );

    // ── PAGE 2: Other Important Instructions + Agreement ─────────────────
    const renderPage2 = () => {
        const sections = examConfig.sections;
        const totalQ = sections.reduce((s, sec) => s + sec.questionsCount, 0);

        return (
            <div className="space-y-5">
                <h2 className="text-xl font-bold text-gray-900">Other Important Instructions</h2>

                <ol className="list-decimal list-outside ml-6 space-y-3 text-gray-700 text-sm">
                    <li>
                        The test code displayed on the screen must be written by you in the space provided
                        in the call letter. You will be given <strong>5 minutes</strong> for this activity.
                    </li>
                    <li>
                        <div className="mb-2">The Question Paper consists of objective type questions as follows:</div>

                        {/* ── Fixed table — full width, no broken rowSpan ── */}
                        <div className="w-full overflow-x-auto">
                            <table className="w-full border-collapse border border-gray-300 text-sm text-center">
                                <thead className="bg-gray-100">
                                    <tr>
                                        <th className="border border-gray-300 px-3 py-2 whitespace-nowrap">Sr.No</th>
                                        <th className="border border-gray-300 px-3 py-2 text-left">Name of the Test</th>
                                        <th className="border border-gray-300 px-3 py-2 whitespace-nowrap">No. of Questions</th>
                                        <th className="border border-gray-300 px-3 py-2 whitespace-nowrap">Max. Marks</th>
                                        <th className="border border-gray-300 px-3 py-2 whitespace-nowrap">Duration</th>
                                        <th className="border border-gray-300 px-3 py-2">Duration for PWBD candidates</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sections.map((section, index) => (
                                        <tr key={section.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="border border-gray-300 px-3 py-2">{index + 1}</td>
                                            <td className="border border-gray-300 px-3 py-2 text-left">{section.name}</td>
                                            <td className="border border-gray-300 px-3 py-2">{section.questionsCount}</td>
                                            <td className="border border-gray-300 px-3 py-2">{section.questionsCount}</td>
                                            {index === 0 ? (
                                                <>
                                                    <td
                                                        className="border border-gray-300 px-3 py-2"
                                                        rowSpan={sections.length}
                                                    >
                                                        {examConfig.totalDuration} Minutes
                                                    </td>
                                                    <td
                                                        className="border border-gray-300 px-3 py-2"
                                                        rowSpan={sections.length}
                                                    >
                                                        20 minutes additional time for every 1 hour of examination
                                                    </td>
                                                </>
                                            ) : null}
                                        </tr>
                                    ))}
                                    <tr className="font-semibold bg-gray-100">
                                        <td colSpan={2} className="border border-gray-300 px-3 py-2">TOTAL</td>
                                        <td className="border border-gray-300 px-3 py-2">{totalQ}</td>
                                        <td className="border border-gray-300 px-3 py-2">{totalQ}</td>
                                        <td className="border border-gray-300 px-3 py-2"></td>
                                        <td className="border border-gray-300 px-3 py-2"></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </li>
                    <li>Test is compositely timed. Candidates can attempt any question during the {examConfig.totalDuration} minutes.</li>
                    <li>There is a <strong>'1/4'</strong> penalty for wrong answers. Avoid answering by guessing.</li>
                    <li>To view a question in another language, use the language drop-down in the top bar.</li>
                    <li>Questions are displayed one at a time. Do not spend too much time on any single question.</li>
                </ol>

                {/* Agreement checkbox */}
                <div className="mt-4 p-4 bg-gray-50 rounded border">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <Checkbox
                            checked={hasAgreed}
                            onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                            className="mt-1 shrink-0"
                        />
                        <span className="text-sm text-gray-700">
                            I have read and understood the instructions. All computer hardware allotted to me are in
                            proper working condition. I declare that I am not in possession of / not wearing / not
                            carrying any prohibited gadget like mobile phone, bluetooth devices etc. I agree that in
                            case of not adhering to the instructions, I shall be liable to be debarred from this Test
                            and/or to disciplinary action, which may include ban from future Tests / Examinations.
                        </span>
                    </label>
                </div>
            </div>
        );
    };

    const pages = [renderPage1, renderPage2];
    const totalPages = pages.length;

    return (
        <div className="min-h-screen bg-[#e3f2fd] flex items-center justify-center p-2">
            <Card className="w-full shadow-2xl">
                {/* Title */}
                <div className="bg-white px-6 py-4 border-b border-gray-300">
                    <h1 className="text-2xl font-bold text-center text-gray-900">{examConfig.title}</h1>
                </div>

                {/* Page label */}
                <div className="bg-[#b3d9ff] px-6 py-3 border-b border-gray-300">
                    <h2 className="text-base font-semibold text-gray-900">
                        {currentPage === 0 ? 'Instructions' : 'Other Important Instructions'}
                    </h2>
                </div>

                {/* Content */}
                <CardContent className="p-8 max-h-[70vh] overflow-y-auto">
                    {pages[currentPage]()}
                </CardContent>

                {/* Footer nav */}
                <div className="bg-gray-100 px-6 py-4 border-t border-gray-300 flex items-center justify-between">
                    <div>
                        {currentPage > 0 && (
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(currentPage - 1)}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Previous
                            </Button>
                        )}
                    </div>

                    {/* Page dots */}
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }).map((_, page) => (
                            <div
                                key={page}
                                className={`w-3 h-3 rounded-full ${page === currentPage ? 'bg-blue-600' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>

                    <div>
                        {currentPage < totalPages - 1 ? (
                            <Button
                                onClick={() => setCurrentPage(currentPage + 1)}
                                className="bg-[#5b9dd9] hover:bg-[#4a8cc8] flex items-center gap-2"
                            >
                                Next
                                <ArrowRight className="h-4 w-4" />
                            </Button>
                        ) : (
                            <Button
                                onClick={onComplete}
                                disabled={!hasAgreed}
                                className="bg-[#5b9dd9] hover:bg-[#4a8cc8]"
                            >
                                I am ready to begin
                            </Button>
                        )}
                    </div>
                </div>
            </Card>
        </div>
    );
};
