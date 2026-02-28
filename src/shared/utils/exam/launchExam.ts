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

    // Store returnUrl in sessionStorage so the exam popup can navigate parent on close
    if (returnUrl) {
        sessionStorage.setItem('examReturnUrl', returnUrl);
    }

    // Open in new window with a NAMED target (not '_blank') so window.opener remains accessible
    const windowFeatures = 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no';
    const examWindow = window.open(examUrl, 'examWindow', windowFeatures);

    if (examWindow) {
        examWindow.focus();
    } else {
        alert('Please allow popups for this website to start the exam');
    }
};

export default launchExamWindow;
