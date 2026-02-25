import React from 'react';
import { useExamTimer } from '@/hooks/exam/useExamTimer';
import { Clock } from 'lucide-react';

interface ExamTimerProps {
    totalDurationInSeconds: number;
    onTimeUp: () => void;
    onWarning?: (remainingSeconds: number) => void;
    isPaused?: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
    totalDurationInSeconds,
    onTimeUp,
    onWarning,
    isPaused = false
}) => {
    const { formattedTime, timerColor, remainingSeconds } = useExamTimer({
        totalDurationInSeconds,
        onTimeUp,
        onWarning,
        isPaused
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
