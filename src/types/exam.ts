// Exam Types and Interfaces
export enum QuestionStatus {
    NOT_VISITED = 0,
    NOT_ANSWERED = 1,
    ANSWERED = 2,
    MARKED_FOR_REVIEW = 3,
    ANSWERED_AND_MARKED = 4
}

export interface ExamQuestion {
    id: string;
    sectionId: string;
    sectionName: string;
    questionNumber: number;
    type: 'mcq' | 'msq' | 'numerical';
    question: string;
    options?: { id: string; text: string }[];
    correctAnswer: string | string[];
    marks: number;
    negativeMarks: number;
    explanation?: string;
    imageUrl?: string;
}

export interface ExamSection {
    id: string;
    name: string;
    questionsCount: number;
    duration?: number;
    questions: ExamQuestion[];
}

export interface ExamConfig {
    id: string;
    title: string;
    totalDuration: number; // in minutes
    sections: ExamSection[];
    instructions: string[];
    languages: ('English' | 'Hindi')[];
}

export interface QuestionState {
    questionId: string;
    status: QuestionStatus;
    selectedAnswer: string | string[] | null;
    markedForReview: boolean;
    timeTaken: number; // seconds spent on this question
    visitedAt?: number; // timestamp
}

export interface ExamSessionState {
    examId: string;
    currentQuestionIndex: number;
    currentSectionIndex: number;
    questionStates: Record<string, QuestionState>;
    startTime: number;
    endTime: number;
    remainingTime: number; // seconds
    language: 'English' | 'Hindi';
    isSubmitted: boolean;
    isPaused: boolean;
}

export interface ExamResult {
    examId: string;
    totalQuestions: number;
    attempted: number;
    correct: number;
    incorrect: number;
    markedForReview: number;
    score: number;
    percentage: number;
    timeTaken: number;
    sectionWiseScore: Record<string, {
        attempted: number;
        correct: number;
        score: number;
    }>;
}
