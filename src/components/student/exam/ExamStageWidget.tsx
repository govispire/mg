/**
 * ExamStageWidget — Student-facing live stage panel
 * ─────────────────────────────────────────────────────────────────────────────
 * Answers the four questions students care about:
 *   1. What is next?
 *   2. How many days left?
 *   3. What should I prepare now?
 *   4. How am I performing?
 *
 * Reads live stages set by SuperAdmin — updates instantly via BroadcastChannel.
 * Gracefully falls back to a helpful message if no stages are configured.
 */

import React, { useState } from 'react';
import { useExamStages, getNextStage, getVisibleStages, getDaysLeft, type ExamStageItem } from '@/hooks/useExamStages';
import { Calendar, ChevronRight, Clock, Zap, BookOpen, TrendingUp, CheckCircle2, Radio, AlertTriangle, Info, Link, FileText } from 'lucide-react';

// ─── Prep tips per stage name ─────────────────────────────────────────────────

const PREP_TIPS: Record<string, string[]> = {
  prelims: [
    'Focus on speed — aim for 80+ questions in 60 minutes',
    'Practice Quantitative Aptitude daily with timer',
    'Attempt at least 2 full mock tests per week',
    'Revise English grammar rules and reading comprehension',
  ],
  mains: [
    'Focus on accuracy over speed — sectional cutoffs matter',
    'Practice descriptive writing (Letter & Essay)',
    'Cover General Awareness — banking, economy, current affairs',
    'Attempt 1 full mains mock per week and analyze deeply',
  ],
  interview: [
    'Read newspapers daily — The Hindu, Financial Express',
    'Revise banking awareness and RBI policies',
    'Practice mock interviews with peers or mentors',
    'Review your DAF (Detailed Application Form) thoroughly',
  ],
  document: [
    'Prepare all original documents and self-attested copies',
    'Carry passport photos (at least 10) for verification',
    'Verify educational certificates are attested',
    'Check admit card and call letter requirements',
  ],
};

function getPrepTips(stageName: string): string[] {
  const lower = stageName.toLowerCase();
  if (lower.includes('prelim')) return PREP_TIPS.prelims;
  if (lower.includes('main')) return PREP_TIPS.mains;
  if (lower.includes('interview')) return PREP_TIPS.interview;
  if (lower.includes('document') || lower.includes('verification')) return PREP_TIPS.document;
  return [
    `Complete all mock tests for ${stageName}`,
    'Revise weak topics identified in previous tests',
    'Practice time management with full-length tests',
    'Stay consistent — study 4-6 hours daily',
  ];
}

// ─── Status badge ─────────────────────────────────────────────────────────────

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const lower = status.toLowerCase();
  if (lower === 'live') return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
      <Radio className="h-2.5 w-2.5 animate-pulse" /> LIVE NOW
    </span>
  );
  if (lower === 'upcoming') return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
      <Clock className="h-2.5 w-2.5" /> UPCOMING
    </span>
  );
  if (lower === 'completed') return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-gray-600 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-full">
      <CheckCircle2 className="h-2.5 w-2.5" /> DONE
    </span>
  );
  if (lower === 'postponed') return (
    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
      <AlertTriangle className="h-2.5 w-2.5" /> POSTPONED
    </span>
  );
  return (
    <span className="text-[10px] font-bold text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full">
      {status}
    </span>
  );
};

// ─── Countdown ring ───────────────────────────────────────────────────────────

const DaysRing: React.FC<{ days: number; label: string; gradient?: string }> = ({ days, label, gradient }) => {
  const pct = Math.max(0, Math.min(100, 100 - (days / 180) * 100));
  const r = 42;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative w-[100px] h-[100px]">
        <svg width="100" height="100" className="-rotate-90">
          <circle cx="50" cy="50" r={r} fill="none" stroke="#e2e8f0" strokeWidth="8" />
          <circle cx="50" cy="50" r={r} fill="none"
            stroke={gradient ? 'url(#ring-grad)' : '#6366f1'}
            strokeWidth="8" strokeLinecap="round"
            strokeDasharray={`${dash} ${circ - dash}`}
            style={{ transition: 'stroke-dasharray 1.5s ease-out' }}
          />
          {gradient && (
            <defs>
              <linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#6366f1" />
                <stop offset="100%" stopColor="#a855f7" />
              </linearGradient>
            </defs>
          )}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-foreground leading-none">{Math.max(0, days)}</span>
          <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide">days</span>
        </div>
      </div>
      <p className="text-xs font-semibold text-center text-muted-foreground">{label}</p>
    </div>
  );
};

// ─── Stage Timeline ───────────────────────────────────────────────────────────

const StageTimeline: React.FC<{ stages: ExamStageItem[]; nextStageId?: string }> = ({ stages, nextStageId }) => (
  <div className="space-y-2">
    {stages.map((stage, idx) => {
      const daysLeft = getDaysLeft(stage.date);
      const isNext = stage.id === nextStageId;
      const isPast = daysLeft !== null && daysLeft < 0;
      return (
        <div key={stage.id} className={`flex items-center gap-3 py-2 px-3 rounded-xl transition-all
          ${isNext ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted/40'}`}>
          {/* Order circle */}
          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0
            ${isPast ? 'bg-gray-200 text-gray-500'
            : isNext ? 'bg-primary text-white shadow-md shadow-primary/30'
            : 'bg-muted text-muted-foreground'}`}>
            {isPast ? <CheckCircle2 className="h-3.5 w-3.5" /> : stage.order}
          </div>
          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <p className={`text-sm font-bold ${isNext ? 'text-primary' : isPast ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                {stage.name}
              </p>
              {isNext && <span className="text-[9px] font-black bg-primary text-white px-1.5 py-0.5 rounded">NEXT</span>}
            </div>
            {stage.date && (
              <p className={`text-[11px] mt-0.5 flex items-center gap-1
                ${isPast ? 'text-gray-400' : isNext ? 'text-primary/70 font-semibold' : 'text-muted-foreground'}`}>
                <Calendar className="h-3 w-3" />
                {new Date(stage.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {daysLeft !== null && !isPast && (
                  <span className="ml-1 font-bold text-primary">({daysLeft}d left)</span>
                )}
              </p>
            )}
          </div>
          <StatusBadge status={stage.status} />
          {stage.link && (
            <a href={stage.link} target="_blank" rel="noopener noreferrer"
              className="text-primary hover:text-primary/80 p-1 rounded hover:bg-primary/10 transition-colors" title="Official notice">
              <Link className="h-3.5 w-3.5" />
            </a>
          )}
        </div>
      );
    })}
  </div>
);

// ─── Main Widget ──────────────────────────────────────────────────────────────

interface ExamStageWidgetProps {
  examId: string;
  examName: string;
  overallPct?: number;   // 0-100 for "How am I performing?"
  compact?: boolean;     // slim version for test page header
}

export const ExamStageWidget: React.FC<ExamStageWidgetProps> = ({
  examId,
  examName,
  overallPct = 0,
  compact = false,
}) => {
  const { stages } = useExamStages(examId);
  const visibleStages = getVisibleStages(stages);
  const nextStage = getNextStage(stages);
  const [activeTab, setActiveTab] = useState<'next' | 'timeline' | 'prepare'>('next');

  // ── No stages configured ──────────────────────────────────────────────────
  if (visibleStages.length === 0) {
    if (compact) return null;
    return (
      <div className="bg-muted/30 border border-dashed border-muted-foreground/20 rounded-xl p-4 flex items-center gap-3">
        <Info className="h-5 w-5 text-muted-foreground shrink-0" />
        <div>
          <p className="text-sm font-semibold text-muted-foreground">Exam schedule coming soon</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">
            Prelims, Mains & other stages will appear here once announced
          </p>
        </div>
      </div>
    );
  }

  const daysToNext = nextStage ? getDaysLeft(nextStage.date) : null;
  const prepTips = nextStage ? getPrepTips(nextStage.name) : [];

  // ── Compact mode (for test page tab header) ───────────────────────────────
  if (compact) {
    return (
      <div className="flex items-center gap-4 bg-gradient-to-r from-primary/5 to-purple-500/5 border border-primary/10 rounded-xl px-4 py-3">
        {nextStage && daysToNext !== null && (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary text-white flex flex-col items-center justify-center shrink-0">
              <span className="text-base font-black leading-none">{Math.max(0, daysToNext)}</span>
              <span className="text-[7px] font-bold uppercase">days</span>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Next: <strong className="text-foreground">{nextStage.name}</strong></p>
              {nextStage.date && (
                <p className="text-[11px] text-muted-foreground">
                  {new Date(nextStage.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-wrap gap-2">
          {visibleStages.slice(0, 4).map(stage => {
            const d = getDaysLeft(stage.date);
            const isPast = d !== null && d < 0;
            const isNext = stage.id === nextStage?.id;
            return (
              <div key={stage.id} className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all
                ${isNext ? 'bg-primary text-white border-primary'
                : isPast ? 'bg-gray-100 text-gray-500 border-gray-200 line-through opacity-60'
                : 'bg-white text-muted-foreground border-muted-foreground/20'}`}>
                {stage.name}
                {d !== null && !isPast && <span className="ml-1 opacity-70">{d}d</span>}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── Full mode ─────────────────────────────────────────────────────────────
  return (
    <div className="bg-white border border-border rounded-2xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e1b4b] to-[#312e81] px-5 py-4 text-white">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-70">Exam Journey</p>
            <h3 className="font-black text-lg leading-tight mt-0.5">{examName}</h3>
          </div>
          {nextStage && daysToNext !== null && (
            <div className="text-center">
              <div className="text-4xl font-black leading-none">{Math.max(0, daysToNext)}</div>
              <div className="text-[9px] font-bold uppercase tracking-widest opacity-80">days to {nextStage.name}</div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b">
        {([
          { id: 'next', label: '📍 What\'s Next?', icon: Zap },
          { id: 'timeline', label: '📅 Timeline', icon: Calendar },
          { id: 'prepare', label: '📚 Prepare Now', icon: BookOpen },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 text-xs font-bold transition-all border-b-2 
              ${activeTab === tab.id
                ? 'border-primary text-primary bg-primary/3'
                : 'border-transparent text-muted-foreground hover:text-foreground'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">

        {/* What's Next */}
        {activeTab === 'next' && (
          <div className="space-y-4">
            {nextStage ? (
              <>
                {/* Big countdown */}
                <div className="flex items-center gap-6">
                  {daysToNext !== null && (
                    <DaysRing days={daysToNext} label={`To ${nextStage.name}`} gradient />
                  )}
                  <div className="flex-1">
                    <StatusBadge status={nextStage.status} />
                    <h4 className="font-black text-xl mt-1">{nextStage.name}</h4>
                    {nextStage.date && (
                      <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(nextStage.date).toLocaleDateString('en-IN', {
                          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                        })}
                      </p>
                    )}
                    {nextStage.link && (
                      <a href={nextStage.link} target="_blank" rel="noopener noreferrer"
                        className="mt-2 inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium">
                        <FileText className="h-3.5 w-3.5" /> View Official Notice <ChevronRight className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>

                {/* What to do now */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-xs font-bold text-blue-800 uppercase tracking-wide mb-2">
                    🎯 What to do right now
                  </p>
                  <ul className="space-y-1.5">
                    {prepTips.slice(0, 3).map((tip, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-blue-700">
                        <span className="w-4 h-4 rounded-full bg-blue-200 text-blue-800 font-bold flex items-center justify-center shrink-0 mt-0.5 text-[9px]">{i+1}</span>
                        {tip}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Performance */}
                <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
                      <TrendingUp className="h-3.5 w-3.5" /> How am I performing?
                    </p>
                    <span className="text-lg font-black text-emerald-700">{overallPct}%</span>
                  </div>
                  <div className="h-2 bg-emerald-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-1000"
                      style={{ width: `${overallPct}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-emerald-600 mt-1.5">
                    {overallPct === 0 ? 'Take your first mock test to see your score here' :
                     overallPct < 40 ? 'Keep going — you\'re building momentum!' :
                     overallPct < 70 ? 'Good progress — focus on weak topics now' :
                     'Excellent! You\'re on track for selection 🎉'}
                  </p>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <CheckCircle2 className="h-12 w-12 mx-auto mb-3 text-green-500" />
                <p className="font-bold text-foreground">All upcoming stages done!</p>
                <p className="text-sm text-muted-foreground mt-1">You've completed all visible exam stages</p>
              </div>
            )}
          </div>
        )}

        {/* Timeline */}
        {activeTab === 'timeline' && (
          <div>
            <p className="text-xs text-muted-foreground mb-3">Full exam stage breakdown for {examName}</p>
            <StageTimeline stages={visibleStages} nextStageId={nextStage?.id} />
          </div>
        )}

        {/* Prepare Now */}
        {activeTab === 'prepare' && (
          <div className="space-y-4">
            {nextStage && (
              <>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Preparing for</p>
                    <p className="font-bold text-sm">{nextStage.name}</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {getPrepTips(nextStage.name).map((tip, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors">
                      <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-black flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
                      <p className="text-sm text-foreground">{tip}</p>
                    </div>
                  ))}
                </div>
                {/* Stage-specific note */}
                {daysToNext !== null && daysToNext <= 30 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                    <p className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Final {daysToNext} days strategy
                    </p>
                    <p className="text-xs text-amber-700 mt-1">
                      Only {daysToNext} days remaining! Stop learning new topics. Focus entirely on revision, speed, and accuracy through mock tests.
                    </p>
                  </div>
                )}
              </>
            )}
          </div>
        )}

      </div>
    </div>
  );
};

export default ExamStageWidget;
