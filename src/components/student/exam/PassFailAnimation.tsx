
import React, { useState, useEffect } from 'react';

interface PassFailAnimationProps {
  passed: boolean;
  score?: number;
  maxScore?: number;
  percentile?: number;
  rank?: number;
}

export const PassFailAnimation: React.FC<PassFailAnimationProps> = ({
  passed,
  score,
  maxScore,
  percentile,
  rank,
}) => {
  const [visible, setVisible] = useState(false);
  const [showStats, setShowStats] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setVisible(true), 80);
    const t2 = setTimeout(() => setShowStats(true), 500);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  if (passed) {
    return (
      <div
        className={`relative overflow-hidden rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 px-5 py-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-green-200/30 pointer-events-none" />
        <div className="absolute -bottom-4 -left-4 w-20 h-20 rounded-full bg-emerald-200/20 pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
          {/* Left: icon + message */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-2xl bg-green-600 flex items-center justify-center shadow-lg flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg font-extrabold text-green-700 leading-none">🎉 Congratulations!</span>
                <span className="text-[10px] font-bold bg-green-600 text-white px-2.5 py-0.5 rounded-full">CUT-OFF CLEARED</span>
              </div>
              <p className="text-xs text-green-700/80 mt-0.5 font-medium">You have successfully passed this test!</p>
            </div>
          </div>

          {/* Right: quick stats */}
          {showStats && (score !== undefined || percentile !== undefined || rank !== undefined) && (
            <div
              className={`flex gap-3 sm:gap-4 transition-all duration-500 ${showStats ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
            >
              {score !== undefined && maxScore !== undefined && (
                <div className="text-center">
                  <p className="text-[9px] text-green-600/70 font-bold uppercase tracking-widest">Score</p>
                  <p className="text-xl font-extrabold text-green-700 leading-tight">{score}<span className="text-xs font-normal text-green-600/60">/{maxScore}</span></p>
                </div>
              )}
              {percentile !== undefined && (
                <div className="text-center border-l border-green-200 pl-3 sm:pl-4">
                  <p className="text-[9px] text-green-600/70 font-bold uppercase tracking-widest">Percentile</p>
                  <p className="text-xl font-extrabold text-green-700 leading-tight">{percentile}<span className="text-xs font-normal text-green-600/60">%</span></p>
                </div>
              )}
              {rank !== undefined && (
                <div className="text-center border-l border-green-200 pl-3 sm:pl-4">
                  <p className="text-[9px] text-green-600/70 font-bold uppercase tracking-widest">Rank</p>
                  <p className="text-xl font-extrabold text-green-700 leading-tight">#{rank}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── NOT PASSED ────────────────────────────────────────────────
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 px-5 py-4 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-3'}`}
    >
      <div className="absolute -top-6 -right-6 w-28 h-28 rounded-full bg-amber-200/25 pointer-events-none" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center shadow-lg flex-shrink-0">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-lg font-extrabold text-amber-700 leading-none">Keep Going! 💪</span>
              <span className="text-[10px] font-bold bg-amber-500 text-white px-2.5 py-0.5 rounded-full">NEEDS IMPROVEMENT</span>
            </div>
            <p className="text-xs text-amber-700/80 mt-0.5 font-medium">Practice more to clear the cut-off. You've got this!</p>
          </div>
        </div>

        {showStats && (score !== undefined || percentile !== undefined || rank !== undefined) && (
          <div className={`flex gap-3 sm:gap-4 transition-all duration-500 ${showStats ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}>
            {score !== undefined && maxScore !== undefined && (
              <div className="text-center">
                <p className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest">Score</p>
                <p className="text-xl font-extrabold text-amber-700 leading-tight">{score}<span className="text-xs font-normal text-amber-600/60">/{maxScore}</span></p>
              </div>
            )}
            {percentile !== undefined && (
              <div className="text-center border-l border-amber-200 pl-3 sm:pl-4">
                <p className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest">Percentile</p>
                <p className="text-xl font-extrabold text-amber-700 leading-tight">{percentile}<span className="text-xs font-normal text-amber-600/60">%</span></p>
              </div>
            )}
            {rank !== undefined && (
              <div className="text-center border-l border-amber-200 pl-3 sm:pl-4">
                <p className="text-[9px] text-amber-600/70 font-bold uppercase tracking-widest">Rank</p>
                <p className="text-xl font-extrabold text-amber-700 leading-tight">#{rank}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
