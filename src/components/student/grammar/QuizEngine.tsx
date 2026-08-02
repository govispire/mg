import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle, XCircle, ChevronRight, Timer, Zap, AlertCircle } from 'lucide-react';
import type { QuizQuestion } from '@/data/grammarData';

interface Props {
  questions: QuizQuestion[];
  topicTitle: string;
  onComplete: (score: number) => void;
}

type AnswerState = 'unanswered' | 'correct' | 'incorrect';

const TIMER_SECONDS = 20;

const QuizEngine: React.FC<Props> = ({ questions, topicTitle, onComplete }) => {
  const [currentQ, setCurrentQ] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answerState, setAnswerState] = useState<AnswerState>('unanswered');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(TIMER_SECONDS);
  const [showExplanation, setShowExplanation] = useState(false);
  const [answers, setAnswers] = useState<{ correct: boolean; selected: number | null }[]>([]);
  const [timedOut, setTimedOut] = useState(false);

  const question = questions[currentQ];
  const isLast = currentQ === questions.length - 1;

  // ── Timer ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (answerState !== 'unanswered') return;
    if (timeLeft <= 0) {
      handleTimeout();
      return;
    }
    const t = setTimeout(() => setTimeLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [timeLeft, answerState]);

  const handleTimeout = useCallback(() => {
    setTimedOut(true);
    setAnswerState('incorrect');
    setShowExplanation(true);
    setAnswers(prev => [...prev, { correct: false, selected: null }]);
  }, []);

  // ── Answer selection ────────────────────────────────────────────────────────
  const handleSelect = useCallback((idx: number) => {
    if (answerState !== 'unanswered') return;
    setSelected(idx);
    const isCorrect = idx === question.correctIndex;
    setAnswerState(isCorrect ? 'correct' : 'incorrect');
    if (isCorrect) setScore(s => s + 1);
    setShowExplanation(true);
    setAnswers(prev => [...prev, { correct: isCorrect, selected: idx }]);
  }, [answerState, question]);

  // ── Next question ───────────────────────────────────────────────────────────
  const handleNext = useCallback(() => {
    if (isLast) {
      onComplete(score);
      return;
    }
    setCurrentQ(q => q + 1);
    setSelected(null);
    setAnswerState('unanswered');
    setShowExplanation(false);
    setTimeLeft(TIMER_SECONDS);
    setTimedOut(false);
  }, [isLast, score, onComplete]);

  const timerPct = (timeLeft / TIMER_SECONDS) * 100;
  const timerColor = timerPct > 60 ? '#10b981' : timerPct > 30 ? '#f59e0b' : '#ef4444';

  return (
    <div className="py-2 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-500" />
          <span className="text-sm font-bold text-slate-600">Quiz: {topicTitle}</span>
        </div>
        <div className="flex gap-1">
          {questions.map((_, i) => (
            <div key={i} className={`h-1.5 w-6 rounded-full transition-colors ${
              i < currentQ ? (answers[i]?.correct ? 'bg-emerald-400' : 'bg-red-400') :
              i === currentQ ? 'bg-indigo-400' : 'bg-slate-200'
            }`} />
          ))}
        </div>
      </div>

      {/* Question counter + timer */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-slate-400 font-medium">Question {currentQ + 1} of {questions.length}</span>
        <div className="flex items-center gap-2">
          <Timer className="h-3.5 w-3.5" style={{ color: timerColor }} />
          <span className="text-sm font-black" style={{ color: timerColor }}>{timeLeft}s</span>
          <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full transition-all duration-1000"
              style={{ width: `${timerPct}%`, backgroundColor: timerColor }} />
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
        <p className="text-slate-800 font-bold text-base leading-relaxed">{question.question}</p>
      </div>

      {/* Options */}
      <div className="space-y-2.5">
        {question.options.map((opt, idx) => {
          const isSelected = selected === idx;
          const isCorrect = idx === question.correctIndex;
          const revealed = answerState !== 'unanswered';
          let bg = 'bg-white border-slate-200 hover:border-indigo-300 hover:bg-indigo-50';
          let textColor = 'text-slate-700';
          if (revealed) {
            if (isCorrect) { bg = 'bg-emerald-50 border-emerald-400'; textColor = 'text-emerald-800'; }
            else if (isSelected && !isCorrect) { bg = 'bg-red-50 border-red-400'; textColor = 'text-red-800'; }
            else { bg = 'bg-slate-50 border-slate-200 opacity-60'; }
          }
          return (
            <button key={idx}
              onClick={() => handleSelect(idx)}
              disabled={revealed}
              className={`w-full flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-left transition-all duration-200 ${bg} ${!revealed ? 'hover:scale-[1.01] cursor-pointer' : 'cursor-default'}`}>
              <div className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center font-black text-sm border-2 transition-colors ${
                revealed && isCorrect ? 'bg-emerald-500 border-emerald-500 text-white' :
                revealed && isSelected && !isCorrect ? 'bg-red-500 border-red-500 text-white' :
                'bg-slate-100 border-slate-200 text-slate-500'
              }`}>
                {revealed && isCorrect ? <CheckCircle className="h-4 w-4" /> :
                 revealed && isSelected && !isCorrect ? <XCircle className="h-4 w-4" /> :
                 ['A', 'B', 'C', 'D'][idx]}
              </div>
              <span className={`font-semibold text-sm ${textColor}`}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Timed out message */}
      {timedOut && (
        <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
          <AlertCircle className="h-4 w-4 text-amber-500 flex-shrink-0" />
          <p className="text-amber-800 text-sm font-medium">Time's up! The correct answer is highlighted above.</p>
        </div>
      )}

      {/* Explanation */}
      {showExplanation && (
        <div className={`rounded-xl p-4 border ${answerState === 'correct' ? 'bg-emerald-50 border-emerald-200' : 'bg-blue-50 border-blue-200'}`}>
          <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${answerState === 'correct' ? 'text-emerald-600' : 'text-blue-600'}`}>
            {answerState === 'correct' ? '✅ Correct! ' : '💡 Explanation'}
          </p>
          <p className={`text-sm font-medium leading-relaxed ${answerState === 'correct' ? 'text-emerald-800' : 'text-blue-800'}`}>
            {question.explanation}
          </p>
        </div>
      )}

      {/* Next / Finish */}
      {showExplanation && (
        <button onClick={handleNext}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-black py-3.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
          {isLast ? '🏁 See Results' : <>Next Question <ChevronRight className="h-5 w-5" /></>}
        </button>
      )}

      {/* Score progress */}
      <div className="flex items-center justify-between pt-1">
        <span className="text-xs text-slate-400">Score: {score}/{currentQ + (answerState !== 'unanswered' ? 1 : 0)}</span>
        <span className="text-xs text-indigo-500 font-semibold">{Math.round((score / questions.length) * 100)}% accuracy</span>
      </div>
    </div>
  );
};

export default QuizEngine;
