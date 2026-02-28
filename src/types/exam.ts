// Exam Types and Interfaces
export enum QuestionStatus {
    NOT_VISITED = 0,
    NOT_ANSWERED = 1,
    ANSWERED = 2,
    MARKED_FOR_REVIEW = 3,
    ANSWERED_AND_MARKED = 4
}

export interface QuestionSet {
    setId: string;
    setType: 'reading_comprehension' | 'di_set' | 'puzzle_set' | 'caselet' | 'input_output' | 'generic';
    title?: string;
    /** HTML content rendered in the left panel (passage / table / chart description) */
    sharedContent: string;
    /** IDs of questions belonging to this set, in order */
    questionIds: string[];
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
    /** Optional — present only for set-based questions (DI / RC / Puzzle) */
    setId?: string;
    /** Inline set data (avoids extra fetch if bundled with question) */
    set?: QuestionSet;
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
    status: QuestionStatus;       // computed by getStatus() — kept for backwards compat
    isVisited: boolean;           // true once the candidate opens the question
    isSaved: boolean;             // true once Save & Next was clicked with an answer
    selectedAnswer: string | string[] | null;
    markedForReview: boolean;
    timeTaken: number;            // seconds spent on this question
    visitedAt?: number;           // timestamp
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
