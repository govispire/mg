import { useState, useEffect, useCallback, useRef } from 'react';

interface UseExamTimerProps {
    totalDurationInSeconds: number;
    onTimeUp: () => void;
    onWarning?: (remainingSeconds: number) => void;
    isPaused?: boolean;
}

export function useExamTimer({
    totalDurationInSeconds,
    onTimeUp,
    onWarning,
    isPaused = false
}: UseExamTimerProps) {
    const [remainingSeconds, setRemainingSeconds] = useState(totalDurationInSeconds);
    const [hasWarned5Min, setHasWarned5Min] = useState(false);
    const [hasWarned2Min, setHasWarned2Min] = useState(false);
    const [hasWarned1Min, setHasWarned1Min] = useState(false);
    const intervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isPaused || remainingSeconds <= 0) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            return;
        }

        intervalRef.current = setInterval(() => {
            setRemainingSeconds(prev => {
                const newValue = prev - 1;

                // Trigger warnings
                if (onWarning) {
                    if (newValue === 300 && !hasWarned5Min) {
                        setHasWarned5Min(true);
                        onWarning(300);
                    } else if (newValue === 120 && !hasWarned2Min) {
                        setHasWarned2Min(true);
                        onWarning(120);
                    } else if (newValue === 60 && !hasWarned1Min) {
                        setHasWarned1Min(true);
                        onWarning(60);
                    }
                }

                // Time's up
                if (newValue <= 0) {
                    onTimeUp();
                    return 0;
                }

                return newValue;
            });
        }, 1000);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isPaused, remainingSeconds, onTimeUp, onWarning, hasWarned5Min, hasWarned2Min, hasWarned1Min]);

    const formatTime = useCallback((seconds: number) => {
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;

        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${secs.toString().padStart(2, '0')}`;
    }, []);

    const getTimerColor = useCallback(() => {
        if (remainingSeconds <= 120) return 'text-red-600'; // Red for <= 2 min
        if (remainingSeconds <= 300) return 'text-yellow-600'; // Yellow for <= 5 min
        return 'text-green-600'; // Green otherwise
    }, [remainingSeconds]);

    const resetTimer = useCallback(() => {
        setRemainingSeconds(totalDurationInSeconds);
        setHasWarned5Min(false);
        setHasWarned2Min(false);
        setHasWarned1Min(false);
    }, [totalDurationInSeconds]);

    return {
        remainingSeconds,
        formattedTime: formatTime(remainingSeconds),
        timerColor: getTimerColor(),
        resetTimer,
        progress: ((totalDurationInSeconds - remainingSeconds) / totalDurationInSeconds) * 100,
    };
}
