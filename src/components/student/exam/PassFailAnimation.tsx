
import React, { useState, useEffect } from 'react';

interface PassFailAnimationProps {
  passed: boolean;
  score?: number;
  maxScore?: number;
  percentile?: number;
  rank?: number;
  totalStudents?: number;
  accuracy?: number;
}

export const PassFailAnimation: React.FC<PassFailAnimationProps> = ({
  passed, score, maxScore, percentile, rank, totalStudents, accuracy,
}) => {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  const tagBg   = passed ? '#16a34a' : '#d97706';
  const border  = passed ? '#bbf7d0' : '#fde68a';
  const bgFrom  = passed ? '#f0fdf4' : '#fffbeb';
  const bgTo    = passed ? '#ecfdf5' : '#fef3c7';
  const label   = passed ? '#15803d' : '#92400e';

  const stats = [
    score !== undefined && maxScore !== undefined && { key: 'SCORE',      val: `${score}/${maxScore}`,  hi: true  },
    rank !== undefined                            && { key: 'RANK',       val: `#${rank}${totalStudents ? `/${totalStudents.toLocaleString()}` : ''}`, hi: false },
    percentile !== undefined                      && { key: 'PERCENTILE', val: `${percentile}%`,         hi: false },
    accuracy !== undefined                        && { key: 'ACCURACY',   val: `${accuracy}%`,           hi: false },
  ].filter(Boolean) as { key: string; val: string; hi: boolean }[];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border px-5 py-3.5 transition-all duration-500 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}
      style={{ borderColor: border, background: `linear-gradient(to right, ${bgFrom}, ${bgTo})` }}
    >
      {/* Decorative blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-[0.12] pointer-events-none" style={{ background: tagBg }} />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-3">
        {/* Left: status badge + message */}
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-sm flex-shrink-0" style={{ background: tagBg }}>
            {passed
              ? <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              : <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
            }
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-base font-extrabold leading-none" style={{ color: label }}>
                {passed ? '🎉 Congratulations!' : '💪 Keep Going!'}
              </span>
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full text-white" style={{ background: tagBg }}>
                {passed ? 'CUT-OFF CLEARED' : 'NEEDS IMPROVEMENT'}
              </span>
            </div>
            <p className="text-xs mt-0.5 font-medium opacity-75" style={{ color: label }}>
              {passed ? 'You have successfully passed this test!' : "Practice more to clear the cut-off. You've got this!"}
            </p>
          </div>
        </div>

        {/* Right: stat pills — single source of truth for these 4 numbers */}
        {stats.length > 0 && (
          <div className="flex items-stretch rounded-xl overflow-hidden border flex-shrink-0" style={{ borderColor: border }}>
            {stats.map((s, i) => (
              <div
                key={s.key}
                className={`px-4 py-2 text-center ${i > 0 ? 'border-l' : ''}`}
                style={{
                  background: s.hi ? tagBg + '1a' : 'transparent',
                  borderColor: border,
                }}
              >
                <p className="text-[8px] font-bold uppercase tracking-widest mb-0.5" style={{ color: label + '99' }}>{s.key}</p>
                <p className="text-lg font-extrabold leading-none" style={{ color: s.hi ? tagBg : label }}>{s.val}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
