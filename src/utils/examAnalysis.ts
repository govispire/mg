import { ExamConfig } from '@/types/exam';
import { TestAnalysisData, SectionData, TopicData, QuestionData } from '@/data/testAnalysisData';

interface ExamResponses {
    [questionId: string]: string | string[] | null;
}

interface QuestionState {
    questionId: string;
    selectedAnswer: string | string[] | null;
    isMarkedForReview: boolean;
    timeSpent?: number;
}

export function generateAnalysisFromExam(
    examConfig: ExamConfig,
    responses: ExamResponses,
    questionStates?: Record<string, QuestionState>
): TestAnalysisData {
    // Calculate overall statistics
    let totalQuestions = 0;
    let correctCount = 0;
    let incorrectCount = 0;
    let unattemptedCount = 0;
    let totalTimeSpent = 0;

    // Section-wise data
    const sectionWiseData: SectionData[] = [];

    examConfig.sections.forEach((section) => {
        let sectionCorrect = 0;
        let sectionWrong = 0;
        let sectionAttempted = 0;
        let sectionSkipped = 0;
        let sectionUnseen = 0;
        let sectionTimeSpent = 0;

        section.questions.forEach((question) => {
            totalQuestions++;
            const response = responses[question.id];
            const state = questionStates?.[question.id];
            const timeSpent = state?.timeSpent || 0;

            sectionTimeSpent += timeSpent;
            totalTimeSpent += timeSpent;

            if (!response || (Array.isArray(response) && response.length === 0)) {
                unattemptedCount++;
                sectionUnseen++;
            } else {
                sectionAttempted++;
                // Check if answer is correct
                const isCorrect = Array.isArray(response)
                    ? JSON.stringify(response.sort()) === JSON.stringify(question.correctAnswer)
                    : response === question.correctAnswer;

                if (isCorrect) {
                    correctCount++;
                    sectionCorrect++;
                } else {
                    incorrectCount++;
                    sectionWrong++;
                }
            }
        });

        const sectionMaxScore = section.questions.length;
        const sectionScore = sectionCorrect;
        const sectionAccuracy = sectionAttempted > 0
            ? Math.round((sectionCorrect / sectionAttempted) * 100)
            : 0;

        sectionWiseData.push({
            sectionName: section.name,
            attempted: sectionAttempted,
            correct: sectionCorrect,
            wrong: sectionWrong,
            skipped: sectionSkipped,
            unseen: sectionUnseen,
            score: sectionScore,
            maxScore: sectionMaxScore,
            rank: Math.floor(Math.random() * 50) + 1, // Mock rank
            percentile: Math.max(70, sectionAccuracy),
            accuracy: sectionAccuracy,
            timeSpent: Math.round(sectionTimeSpent / 60), // Convert to minutes
        });
    });

    // Calculate overall metrics
    const score = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
    const accuracy = correctCount + incorrectCount > 0
        ? Math.round((correctCount / (correctCount + incorrectCount)) * 100)
        : 0;
    const percentile = Math.max(70, Math.min(99, score + Math.floor(Math.random() * 10)));
    const rank = Math.floor((100 - percentile) * 18) + 1; // Mock calculation
    const passed = score >= 60;

    // Generate topic-wise data (simplified)
    const topicWiseData: TopicData[] = examConfig.sections.map((section) => ({
        topicName: section.name,
        subject: section.name,
        attempted: sectionWiseData.find(s => s.sectionName === section.name)?.attempted || 0,
        correct: sectionWiseData.find(s => s.sectionName === section.name)?.correct || 0,
        accuracy: sectionWiseData.find(s => s.sectionName === section.name)?.accuracy || 0,
        difficulty: 'Medium' as const,
        timeSpent: sectionWiseData.find(s => s.sectionName === section.name)?.timeSpent || 0,
        avgTime: 2,
    }));

    // Generate question-wise data
    const questionWiseData: QuestionData[] = [];
    examConfig.sections.forEach((section) => {
        section.questions.forEach((question, idx) => {
            const response = responses[question.id];
            const isCorrect = Array.isArray(response)
                ? JSON.stringify(response.sort()) === JSON.stringify(question.correctAnswer)
                : response === question.correctAnswer;

            const status = !response || (Array.isArray(response) && response.length === 0)
                ? 'unattempted'
                : isCorrect
                    ? 'correct'
                    : 'wrong';

            questionWiseData.push({
                questionId: idx + 1,
                section: section.name,
                topic: section.name,
                status: status as 'correct' | 'wrong' | 'unattempted' | 'marked',
                difficulty: ((question as any).difficulty as 'Easy' | 'Medium' | 'Hard') || 'Medium',
                timeSpent: questionStates?.[question.id]?.timeSpent || 0,
                avgTime: 120, // 2 minutes in seconds
            });
        });
    });

    // Generate performance history (mock)
    const performanceHistory = [
        {
            testName: examConfig.title,
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
            score,
            accuracy,
            rank,
            percentile,
        },
    ];

    // Identify strong and weak areas
    const strongAreas = sectionWiseData
        .filter(s => s.accuracy >= 80)
        .map(s => ({
            area: s.sectionName,
            score: s.accuracy,
            status: 'strong' as const,
            questions: [],
        }));

    const weakAreas = sectionWiseData
        .filter(s => s.accuracy < 60)
        .map(s => ({
            area: s.sectionName,
            score: s.accuracy,
            status: 'weak' as const,
            questions: [],
            improvement: `Practice more ${s.sectionName} questions`,
        }));

    return {
        testId: examConfig.id,
        testName: examConfig.title,
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        score,
        maxScore: 100,
        rank,
        totalStudents: 1800,
        percentile,
        accuracy,
        timeTaken: Math.round(totalTimeSpent / 60), // Convert to minutes
        maxTime: examConfig.totalDuration,
        passed,
        sectionWiseData,
        topicWiseData,
        questionWiseData,
        performanceHistory,
        strongAreas,
        weakAreas,
        speedAnalysis: topicWiseData.map(t => ({
            topic: t.topicName,
            difficulty: t.difficulty,
            avgTime: 2,
            yourTime: t.avgTime,
            questionsAttempted: t.attempted,
        })),
        comparisonData: {
            yourScore: score,
            averageScore: Math.max(40, score - 20),
            topperScore: Math.min(100, score + 15),
            peerRankRange: `${Math.max(1, rank - 10)}-${rank + 10}`,
            strategies: [
                {
                    title: 'Accuracy Focus',
                    description: `${accuracy}% accuracy maintained`,
                    impact: accuracy >= 85 ? 'Very High' : 'High',
                    color: 'green',
                },
                {
                    title: 'Section Performance',
                    description: 'Check section-wise analysis',
                    impact: 'High',
                    color: 'blue',
                },
            ],
        },
    };
}
