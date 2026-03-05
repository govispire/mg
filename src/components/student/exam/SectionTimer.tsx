/**
 * SectionTimer.tsx
 * Wraps useExamTimer for a single section.
 * Mount with a new `key` (e.g. the sectionId) to reset the countdown.
 */
import React from 'react';
import { Clock } from 'lucide-react';
import { useExamTimer } from '@/hooks/exam/useExamTimer';

interface SectionTimerProps {
    totalSeconds: number;
    initialRemainingSeconds: number;
    isPaused: boolean;
    onTimeUp: () => void;
    onTick: (remaining: number) => void;
    isLocked?: boolean;
}

export const SectionTimer: React.FC<SectionTimerProps> = ({
    totalSeconds,
    initialRemainingSeconds,
    isPaused,
    onTimeUp,
    onTick,
    isLocked = false,
}) => {
    const { formattedTime, timerColor } = useExamTimer({
        totalDurationInSeconds: totalSeconds,
        initialRemainingSeconds,
        onTimeUp,
        isPaused: isPaused || isLocked,
        onTick,
    });

    return (
        <div className={`flex items-center gap-2 px-4 py-2 bg-white rounded-lg border-2 ${isLocked ? 'border-gray-300 opacity-60' : 'border-blue-300'
            }`}>
            <Clock className={`h-5 w-5 ${isLocked ? 'text-gray-400' : timerColor}`} />
            <div>
                <div className="text-[10px] text-gray-600 font-medium leading-none">Section Time</div>
                <div className={`text-lg font-bold leading-none ${isLocked ? 'text-gray-400' : timerColor}`}>
                    {isLocked ? '—' : formattedTime}
                </div>
            </div>
        </div>
    );
};

export default SectionTimer;
