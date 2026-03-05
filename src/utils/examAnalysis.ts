import { ExamConfig } from '@/types/exam';
import {
    TestAnalysisData, SectionData, TopicData, QuestionData,
    TopicBreakdown, SectionTopicBreakdown
} from '@/data/testAnalysisData';

interface ExamResponses {
    [questionId: string]: string | string[] | null;
}

interface QuestionState {
    questionId: string;
    selectedAnswer: string | string[] | null;
    isMarkedForReview: boolean;
    timeSpent?: number;
}

// ── helpers ────────────────────────────────────────────────────────────────
function isCorrectResponse(
    response: string | string[] | null,
    correctAnswer: string | string[]
): boolean {
    if (!response || (Array.isArray(response) && response.length === 0)) return false;
    if (Array.isArray(response)) {
        return JSON.stringify([...response].sort()) === JSON.stringify(
            Array.isArray(correctAnswer) ? [...correctAnswer].sort() : [correctAnswer]
        );
    }
    return response === correctAnswer;
}

function classifyStrength(accuracy: number, attempted: number): TopicBreakdown['strength'] {
    if (attempted === 0) return 'Poor';
    if (accuracy >= 80) return 'Excellent';
    if (accuracy >= 60) return 'Good';
    if (accuracy >= 35) return 'Average';
    return 'Poor';
}

// ── main function ──────────────────────────────────────────────────────────
export function generateAnalysisFromExam(
    examConfig: ExamConfig,
    responses: ExamResponses,
    questionStates?: Record<string, QuestionState>
): TestAnalysisData {

    let totalQuestions = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalTimeSpent = 0;

    // ── Section-wise data ──────────────────────────────────────────────────
    const sectionWiseData: SectionData[] = [];
    // ── Per-section topic breakdown ──────────────────────────────────────
    const sectionTopicBreakdown: SectionTopicBreakdown[] = [];

    let globalQNumber = 0; // rolling question counter across sections

    examConfig.sections.forEach((section) => {
        let sectionCorrect = 0;
        let sectionWrong = 0;
        let sectionAttempted = 0;
        let sectionUnseen = 0;
        let sectionTimeSpent = 0;

        // topic → accumulator for this section
        const topicMap: Record<string, {
            questionNumbers: number[];
            questionStatuses: ('correct' | 'wrong' | 'unattempted')[];
            correct: number;
            wrong: number;
            unattempted: number;
            totalMark: number;
            totalNeg: number;
            timeTotal: number;
            timeCount: number;
            levels: Set<string>;
        }> = {};

        section.questions.forEach((question) => {
            totalQuestions++;
            globalQNumber++;
            const response = responses[question.id];
            const state = questionStates?.[question.id];
            const timeSpent = state?.timeSpent ?? 0;

            sectionTimeSpent += timeSpent;
            totalTimeSpent += timeSpent;

            const topicKey = question.topic || section.name;
            const difficulty = question.difficulty || 'Medium';

            if (!topicMap[topicKey]) {
                topicMap[topicKey] = {
                    questionNumbers: [], questionStatuses: [],
                    correct: 0, wrong: 0, unattempted: 0,
                    totalMark: 0, totalNeg: 0,
                    timeTotal: 0, timeCount: 0,
                    levels: new Set(),
                };
            }
            const t = topicMap[topicKey];
            t.questionNumbers.push(globalQNumber);
            t.levels.add(difficulty);

            if (!response || (Array.isArray(response) && response.length === 0)) {
                unattemptedCount++;
                sectionUnseen++;
                t.unattempted++;
                t.questionStatuses.push('unattempted');
            } else {
                sectionAttempted++;
                const correct = isCorrectResponse(response, question.correctAnswer);
                if (correct) {
                    correctCount++;
                    sectionCorrect++;
                    t.correct++;
                    t.totalMark += question.marks;
                    t.questionStatuses.push('correct');
                } else {
                    incorrectCount++;
                    sectionWrong++;
                    t.wrong++;
                    t.totalNeg += question.negativeMarks;
                    t.questionStatuses.push('wrong');
                }
                t.timeTotal += timeSpent;
                t.timeCount++;
            }
        });

        const sectionMaxScore = section.questions.reduce((s, q) => s + q.marks, 0);
        // Net score = marks earned − negative marks
        const sectionScore = sectionCorrect > 0
            ? section.questions.reduce((s, q) => {
                const r = responses[q.id];
                if (!r || (Array.isArray(r) && r.length === 0)) return s;
                return isCorrectResponse(r, q.correctAnswer)
                    ? s + q.marks
                    : s - q.negativeMarks;
            }, 0)
            : 0;
        const sectionAccuracy = sectionAttempted > 0
            ? Math.round((sectionCorrect / sectionAttempted) * 100)
            : 0;

        sectionWiseData.push({
            sectionName: section.name,
            attempted: sectionAttempted,
            correct: sectionCorrect,
            wrong: sectionWrong,
            skipped: 0,
            unseen: sectionUnseen,
            score: Math.round(sectionScore * 100) / 100,
            maxScore: sectionMaxScore,
            rank: Math.floor(Math.random() * 500) + 1,
            percentile: Math.max(10, sectionAccuracy - Math.floor(Math.random() * 10)),
            accuracy: sectionAccuracy,
            timeSpent: Math.round(sectionTimeSpent / 60),
        });

        // Build per-topic list for this section
        const topics: TopicBreakdown[] = Object.entries(topicMap).map(([topic, acc]) => {
            const totalAttempted = acc.correct + acc.wrong;
            const accuracy = totalAttempted > 0
                ? Math.round((acc.correct / totalAttempted) * 100)
                : 0;
            const netScore = acc.totalMark - acc.totalNeg;
            const maxScore = acc.questionNumbers.length * (section.questions[0]?.marks ?? 1);
            return {
                topic,
                questionNumbers: acc.questionNumbers,
                questionStatuses: acc.questionStatuses,
                correct: acc.correct,
                wrong: acc.wrong,
                unattempted: acc.unattempted,
                totalAttempted,
                accuracy,
                score: Math.round(netScore * 100) / 100,
                maxScore,
                strength: classifyStrength(accuracy, totalAttempted),
                levels: [...acc.levels].join(', ') || 'Moderate',
                avgTimeSeconds: acc.timeCount > 0
                    ? Math.round(acc.timeTotal / acc.timeCount)
                    : 0,
            };
        });

        sectionTopicBreakdown.push({
            sectionId: section.id,
            sectionName: section.name,
            topics,
        });
    });

    // ── Overall metrics ────────────────────────────────────────────────────
    const totalMarksMax = examConfig.sections.reduce((s, sec) =>
        s + sec.questions.reduce((q, question) => q + question.marks, 0), 0);

    // Net total score with negatives
    let netScore = 0;
    examConfig.sections.forEach(section => {
        section.questions.forEach(q => {
            const r = responses[q.id];
            if (!r || (Array.isArray(r) && r.length === 0)) return;
            if (isCorrectResponse(r, q.correctAnswer)) {
                netScore += q.marks;
            } else {
                netScore -= q.negativeMarks;
            }
        });
    });
    netScore = Math.round(netScore * 100) / 100;

    const scorePct = totalMarksMax > 0 ? Math.round((netScore / totalMarksMax) * 100) : 0;
    const accuracy = correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;
    const percentile = Math.max(1, Math.min(99, scorePct + Math.floor(Math.random() * 8)));
    const rank = Math.max(1, Math.floor((100 - percentile) * 18) + 1);
    const passed = scorePct >= 45; // typical cutoff

    // ── Topic-wise summary (for TopicAnalysisTab) ─────────────────────────
    const topicWiseData: TopicData[] = sectionTopicBreakdown.flatMap(s =>
        s.topics.map(t => ({
            topicName: t.topic,
            subject: s.sectionName,
            attempted: t.totalAttempted,
            correct: t.correct,
            accuracy: t.accuracy,
            difficulty: (t.levels.includes('Hard') ? 'Hard'
                : t.levels.includes('Medium') ? 'Medium' : 'Easy') as 'Easy' | 'Medium' | 'Hard',
            timeSpent: Math.round(t.avgTimeSeconds * t.totalAttempted / 60),
            avgTime: t.avgTimeSeconds / 60,
        }))
    );

    // ── Question-wise data ────────────────────────────────────────────────
    const questionWiseData: QuestionData[] = [];
    let qNum = 0;
    examConfig.sections.forEach(section => {
        section.questions.forEach(question => {
            qNum++;
            const response = responses[question.id];
            const correct = isCorrectResponse(response ?? null, question.correctAnswer);
            const status = (!response || (Array.isArray(response) && response.length === 0))
                ? 'unattempted'
                : correct ? 'correct' : 'wrong';
            questionWiseData.push({
                questionId: qNum,
                section: section.name,
                topic: question.topic || section.name,
                status: status as 'correct' | 'wrong' | 'unattempted' | 'marked',
                difficulty: question.difficulty || 'Medium',
                timeSpent: questionStates?.[question.id]?.timeSpent ?? 0,
                avgTime: 120,
            });
        });
    });

    // ── Strong / Weak areas ───────────────────────────────────────────────
    const allTopics = sectionTopicBreakdown.flatMap(s => s.topics);
    const strongAreas = allTopics
        .filter(t => t.strength === 'Excellent' || t.strength === 'Good')
        .map(t => ({ area: t.topic, score: t.accuracy, status: 'strong' as const, questions: t.questionNumbers }));
    const weakAreas = allTopics
        .filter(t => t.strength === 'Poor' || t.strength === 'Average')
        .map(t => ({
            area: t.topic, score: t.accuracy, status: 'weak' as const,
            questions: t.questionNumbers,
            improvement: `Practise more ${t.topic} questions`,
        }));

    return {
        testId: examConfig.id,
        testName: examConfig.title,
        date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
        score: netScore,
        maxScore: totalMarksMax,
        rank,
        totalStudents: 1800,
        percentile,
        accuracy,
        timeTaken: Math.max(1, Math.round(totalTimeSpent / 60)),
        maxTime: examConfig.totalDuration,
        passed,
        sectionWiseData,
        topicWiseData,
        questionWiseData,
        performanceHistory: [{
            testName: examConfig.title,
            date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
            score: scorePct,
            accuracy,
            rank,
            percentile,
        }],
        strongAreas,
        weakAreas,
        sectionTopicBreakdown,
        speedAnalysis: topicWiseData.map(t => ({
            topic: t.topicName,
            difficulty: t.difficulty,
            avgTime: 2,
            yourTime: t.avgTime,
            questionsAttempted: t.attempted,
        })),
        comparisonData: {
            yourScore: scorePct,
            averageScore: Math.max(20, scorePct - 20),
            topperScore: Math.min(100, scorePct + 20),
            peerRankRange: `${Math.max(1, rank - 20)}-${rank + 20}`,
            strategies: [
                {
                    title: 'Accuracy',
                    description: `${accuracy}% accuracy on attempted questions`,
                    impact: accuracy >= 80 ? 'Very High' : 'High',
                    color: 'green',
                },
                {
                    title: 'Section Performance',
                    description: 'Review section-wise breakdown above',
                    impact: 'High',
                    color: 'blue',
                },
            ],
        },
    };
}
