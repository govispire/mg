/**
 * Utility to monitor test window completion and update parent page
 */

export interface TestResult {
    testId: string;
    completed: boolean;
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    wrongAnswers: number;
    unanswered: number;
    timeTaken: number;
    timestamp: number;
}

/**
 * Monitor a test window for completion
 * @param testId - Unique identifier for the test
 * @param onComplete - Callback when test is completed
 * @returns Cleanup function to stop monitoring
 */
export const monitorTestWindow = (
    testId: string,
    onComplete: (result: TestResult) => void
): (() => void) => {
    const storageKey = `test_result_${testId}`;

    const checkForResult = () => {
        const resultStr = localStorage.getItem(storageKey);
        if (resultStr) {
            try {
                const result = JSON.parse(resultStr) as TestResult;
                // Clear the result from storage
                localStorage.removeItem(storageKey);
                // Notify parent
                onComplete(result);
                // Stop checking
                clearInterval(intervalId);
            } catch (error) {
                console.error('Error parsing test result:', error);
            }
        }
    };

    // Check every second
    const intervalId = setInterval(checkForResult, 1000);

    // Cleanup after 3 hours (in case window is never closed)
    const timeoutId = setTimeout(() => {
        clearInterval(intervalId);
    }, 3 * 60 * 60 * 1000);

    // Return cleanup function
    return () => {
        clearInterval(intervalId);
        clearTimeout(timeoutId);
    };
};

/**
 * Store test result for parent window to retrieve
 * @param result - Test result data
 */
export const storeTestResult = (result: TestResult): void => {
    const storageKey = `test_result_${result.testId}`;
    localStorage.setItem(storageKey, JSON.stringify(result));
};
