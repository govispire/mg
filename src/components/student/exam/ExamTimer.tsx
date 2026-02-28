import React from 'react';
import { useExamTimer } from '@/hooks/exam/useExamTimer';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
    totalDurationInSeconds: number;
    /** Seconds to start from when resuming (undefined = start from total) */
    initialRemainingSeconds?: number;
    onTimeUp: () => void;
    onWarning?: (remainingSeconds: number) => void;
    isPaused?: boolean;
    onTick?: (remaining: number) => void;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
    totalDurationInSeconds,
    initialRemainingSeconds,
    onTimeUp,
    onWarning,
    isPaused = false,
    onTick,
}) => {
    const { formattedTime, timerColor } = useExamTimer({
        totalDurationInSeconds,
        initialRemainingSeconds,
        onTimeUp,
        onWarning,
        isPaused,
        onTick,
    });

    return (
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg border border-gray-300">
            <Clock className={`h-5 w-5 ${timerColor}`} />
            <div>
                <div className="text-xs text-gray-600 font-medium">Time Left :</div>
                <div className={`text-lg font-bold ${timerColor} leading-none`}>
                    {formattedTime}
                </div>
            </div>
        </div>
    );
};
