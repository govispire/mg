/**
 * Utility function to launch exam in a new fullscreen window
 * Use this for all test/quiz start buttons across the website
 */

interface ExamLaunchParams {
    quizId: string;
    title: string;
    subject: string;
    duration: number;
    questions: number;
    returnUrl?: string; // URL to return to after completing quiz
}

export const launchExamWindow = (params: ExamLaunchParams) => {
    const { quizId, title, subject, duration, questions, returnUrl } = params;

    // Build URL with query parameters
    const urlParams = new URLSearchParams({
        quizId,
        title,
        subject,
        duration: duration.toString(),
        questions: questions.toString(),
    });

    // Add return URL if provided
    if (returnUrl) {
        urlParams.set('returnUrl', returnUrl);
    }

    const examUrl = `/student/exam-window?${urlParams.toString()}`;

    // Open in new window with specific dimensions
    const windowFeatures = 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no';
    const examWindow = window.open(examUrl, '_blank', windowFeatures);

    if (examWindow) {
        examWindow.focus();

        // Note: The child window (ExamWindow/TestWindow) now handles its own navigation
        // after completion, so we don't need to monitor or navigate the parent window.
        // The parent window stays on the current page and will refresh when user returns.
    } else {
        alert('Please allow popups for this website to start the exam');
    }
};

export default launchExamWindow;
