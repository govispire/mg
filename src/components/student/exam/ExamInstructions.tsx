import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
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

    const renderPage1 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">General Instructions:</h2>

            <ol className="list-decimal list-outside ml-6 space-y-4 text-gray-700">
                <li>
                    <div>
                        Total duration of examination is <strong>{examConfig.totalDuration} minutes</strong>.
                        (20 minutes extra for every 60 minutes (1 hour) of the examination time for candidates
                        with disability eligible for compensatory time).
                    </div>
                </li>
                <li>
                    <div>
                        The clock will be set at the server. The countdown timer in the top right corner of screen
                        will display the remaining time available for you to complete the examination. When the timer
                        reaches zero, the examination will end by itself. You will not be required to end or submit
                        your examination.
                    </div>
                </li>
                <li>
                    <div className="mb-2">
                        The Question Palette displayed on the right side of screen will show the status of each
                        question using one of the following symbols:
                    </div>
                    <div className="space-y-2 ml-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-300 flex items-center justify-center rounded">1</div>
                            <span>You have not visited the question yet.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-red-500 text-white flex items-center justify-center rounded">2</div>
                            <span>You have not answered the question.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-green-500 text-white flex items-center justify-center rounded">3</div>
                            <span>You have answered the question.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 text-white flex items-center justify-center rounded">4</div>
                            <span>You have NOT answered the question, but have marked the question for review.</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-purple-600 text-white border-2 border-green-500 flex items-center justify-center rounded">5</div>
                            <span>The question(s) "Answered and Marked for Review" will be considered for evaluation.</span>
                        </div>
                    </div>
                </li>
                <li>
                    The Marked for Review status for a question simply indicates that you would like to look at that
                    question again. <strong className="text-red-600">If a question is answered and Marked for Review,
                        your answer for that question will be considered in the evaluation.</strong>
                </li>
                <li>
                    You can click on the "&gt;" arrow which appears to the left of question palette to collapse the
                    question palette thereby maximizing the question window. To view the question palette again, you
                    can click on "&lt;" which appears on the right side of question window.
                </li>
                <li>
                    You can click on your "Profile" image on top right corner of your screen to change the language
                    during the exam for entire question paper. On clicking of Profile image you will get a drop-down
                    to change the question content to the desired language.
                </li>
            </ol>
        </div>
    );

    const renderPage2 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Navigating to a Question:</h2>

            <p className="text-gray-700 mb-4">To answer a question, do the following:</p>

            <ul className="list-disc list-outside ml-6 space-y-3 text-gray-700">
                <li>
                    Click on the question number in the Question Palette at the right of your screen to go to that
                    numbered question directly. Note that using this option does NOT save your answer to the current question.
                </li>
                <li>
                    Click on <strong>Save & Next</strong> to save your answer for the current question and then go to the next question.
                </li>
                <li>
                    Click on <strong>Mark for Review & Next</strong> to save your answer for the current question,
                    mark it for review, and then go to the next question.
                </li>
            </ul>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Answering a Question:</h3>

            <p className="text-gray-700 mb-3">Procedure for answering a multiple choice type question:</p>

            <ul className="list-disc list-outside ml-6 space-y-3 text-gray-700">
                <li>To select your answer, click on the button of one of the options</li>
                <li>To deselect your chosen answer, click on the button of the chosen option again or click on the <strong>Clear Response</strong> button</li>
                <li>To change your chosen answer, click on the button of another option</li>
                <li>To save your answer, you MUST click on the <strong>Save & Next</strong> button</li>
                <li>
                    To mark the question for review, click on the <strong>Mark for Review & Next</strong> button.
                    If an answer is selected for a question that is Marked for Review, that answer will be considered in the evaluation.
                </li>
            </ul>

            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-4">
                <p className="text-gray-700">
                    Note that ONLY Questions for which answers are saved or marked for review after answering will be considered for evaluation.
                </p>
            </div>

            <h3 className="text-xl font-bold text-gray-900 mt-6 mb-3">Navigating through sections:</h3>

            <ul className="list-disc list-outside ml-6 space-y-3 text-gray-700">
                <li>Sections in this question paper are displayed on the top bar of the screen. Questions in a section can be viewed by clicking on the section name. The section you are currently viewing is highlighted.</li>
                <li>After clicking the Save & Next button on the last question for a section, you will automatically be taken to the first question of the next section.</li>
                <li>You can shuffle between tests and questions anytime during the examination as per your convenience only during the time stipulated.</li>
                <li>Candidate can view the corresponding section summary as part of the legend that appears in every section above the question palette.</li>
            </ul>
        </div>
    );

    const renderPage3 = () => (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Other Important Instructions</h2>

            <ol className="list-decimal list-outside ml-6 space-y-4 text-gray-700">
                <li>The test displayed on the screen must be written by you in the space provided in the call letter. You will be given <strong>5 minutes</strong> for this activity.</li>
                <li>
                    <div className="mb-3">The Question Paper consists of objective type questions as follows:</div>
                    <table className="w-full border border-gray-300 text-sm">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 px-3 py-2">Sr.No</th>
                                <th className="border border-gray-300 px-3 py-2">Name of the Test</th>
                                <th className="border border-gray-300 px-3 py-2">No. of Questions</th>
                                <th className="border border-gray-300 px-3 py-2">Max. Marks</th>
                                <th className="border border-gray-300 px-3 py-2">Duration</th>
                                <th className="border border-gray-300 px-3 py-2">Duration for PWBD candidates</th>
                            </tr>
                        </thead>
                        <tbody>
                            {examConfig.sections.map((section, index) => (
                                <tr key={section.id}>
                                    <td className="border border-gray-300 px-3 py-2 text-center">{index + 1}</td>
                                    <td className="border border-gray-300 px-3 py-2">{section.name}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">{section.questionsCount}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center">{section.questionsCount}</td>
                                    <td className="border border-gray-300 px-3 py-2 text-center" rowSpan={examConfig.sections.length}>
                                        {examConfig.totalDuration} Minutes
                                    </td>
                                    <td className="border border-gray-300 px-3 py-2 text-center" rowSpan={examConfig.sections.length}>
                                        20 minutes additional time for every 1 hour of examination
                                    </td>
                                </tr>
                            ))}
                            <tr className="font-semibold bg-gray-50">
                                <td colSpan={2} className="border border-gray-300 px-3 py-2 text-center">TOTAL</td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    {examConfig.sections.reduce((sum, s) => sum + s.questionsCount, 0)}
                                </td>
                                <td className="border border-gray-300 px-3 py-2 text-center">
                                    {examConfig.sections.reduce((sum, s) => sum + s.questionsCount, 0)}
                                </td>
                                <td className="border border-gray-300 px-3 py-2"></td>
                                <td className="border border-gray-300 px-3 py-2"></td>
                            </tr>
                        </tbody>
                    </table>
                </li>
                <li>As mentioned above, test is compositely timed. Candidates can attempt any question during the time of {examConfig.totalDuration} minutes.</li>
                <li>There is '1/4' penalty for wrong answers. Candidates are advised to avoid answering by guessing.</li>
                <li>To see a given question in another language, a candidate can click on the View in drop-down and select the desired language.</li>
                <li>The questions will be displayed on the screen one at a time. Do not spend too much time on any question.</li>
            </ol>

            <div className="mt-6 p-4 bg-gray-50 rounded">
                <label className="flex items-start gap-3 cursor-pointer">
                    <Checkbox
                        checked={hasAgreed}
                        onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                        className="mt-1"
                    />
                    <span className="text-sm text-gray-700">
                        I have read and understood the instructions. All computer hardware allotted to me are in proper working condition.
                        I declare that I am not in possession of / not wearing / not carrying any prohibited gadget like mobile phone, bluetooth
                        devices etc. / any prohibited material with me into the Examination Hall. I agree that in case of not adhering to the
                        instructions, I shall be liable to be debarred from this Test and/or to disciplinary action, which may include ban from
                        future Tests / Examinations.
                    </span>
                </label>
            </div>
        </div>
    );

    const pages = [renderPage1, renderPage2, renderPage3];

    return (
        <div className="min-h-screen bg-[#e3f2fd] flex items-center justify-center p-4">
            <Card className="w-full max-w-5xl shadow-2xl">
                <div className="bg-white px-6 py-4 border-b border-gray-300">
                    <h1 className="text-2xl font-bold text-center text-gray-900">{examConfig.title}</h1>
                </div>

                <div className="bg-[#b3d9ff] px-6 py-3 border-b border-gray-300">
                    <h2 className="text-lg font-semibold text-gray-900">
                        {currentPage === 0 && 'Instructions'}
                        {currentPage === 1 && 'Instructions'}
                        {currentPage === 2 && 'Other Important Instructions'}
                    </h2>
                </div>

                <CardContent className="p-8 max-h-[70vh] overflow-y-auto">
                    {pages[currentPage]()}
                </CardContent>

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

                    <div className="flex items-center gap-2">
                        {[0, 1, 2].map((page) => (
                            <div
                                key={page}
                                className={`w-3 h-3 rounded-full ${page === currentPage ? 'bg-blue-600' : 'bg-gray-300'}`}
                            />
                        ))}
                    </div>

                    <div>
                        {currentPage < 2 ? (
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
