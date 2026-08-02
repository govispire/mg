import React, { useState, useEffect, useCallback } from 'react';
import { X, ChevronRight, ChevronLeft, CheckCircle, XCircle, Lightbulb, BookOpen, Eye, PenTool, Brain, Zap, Clock, Star } from 'lucide-react';
import type { GrammarTopic } from '@/data/grammarData';
import QuizEngine from './QuizEngine';

interface Props {
  topic: GrammarTopic;
  initialStep?: number;
  onComplete: (quizScore: number) => void;
  onSaveStep: (step: number) => void;
  onExit: () => void;
}

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  { id: 1, icon: '🎬', label: 'Introduction', shortLabel: 'Intro' },
  { id: 2, icon: '📖', label: 'Learn', shortLabel: 'Learn' },
  { id: 3, icon: '🖼️', label: 'Visual Examples', shortLabel: 'Visual' },
  { id: 4, icon: '💡', label: 'Memory Trick', shortLabel: 'Trick' },
  { id: 5, icon: '🚫', label: 'Common Mistakes', shortLabel: 'Mistakes' },
  { id: 6, icon: '✍️', label: 'Practice', shortLabel: 'Practice' },
  { id: 7, icon: '⚡', label: 'Quiz', shortLabel: 'Quiz' },
  { id: 8, icon: '🔄', label: 'Revision', shortLabel: 'Revision' },
];

const DifficultyStars: React.FC<{ level: 1 | 2 | 3 }> = ({ level }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3].map(n => (
      <Star key={n} className={`h-3.5 w-3.5 ${n <= level ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
    ))}
  </div>
);

const TopicLesson: React.FC<Props> = ({ topic, initialStep = 0, onComplete, onSaveStep, onExit }) => {
  const [step, setStep] = useState(Math.max(0, Math.min(initialStep, STEPS.length - 1)));
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [practiced, setPracticed] = useState<number[]>([]);

  const currentStep = STEPS[step];
  const progress = ((step + 1) / STEPS.length) * 100;

  useEffect(() => { onSaveStep(step); }, [step]);

  const goNext = useCallback(() => {
    if (step < STEPS.length - 1) setStep(s => s + 1);
  }, [step]);

  const goPrev = useCallback(() => {
    if (step > 0) setStep(s => s - 1);
  }, [step]);

  const handleQuizComplete = useCallback((score: number) => {
    setQuizScore(score);
    setStep(7); // go to revision
    onSaveStep(7);
  }, []);

  const handleFinish = useCallback(() => {
    onComplete(quizScore ?? 0);
  }, [quizScore, onComplete]);

  // ── Render step content ──────────────────────────────────────────────────
  const renderContent = () => {
    switch (step) {
      // Step 0: Introduction / Animation
      case 0: return (
        <div className="flex flex-col items-center text-center py-6 gap-6">
          <div className="relative">
            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-indigo-400 to-violet-600 flex items-center justify-center text-7xl shadow-2xl shadow-indigo-200 animate-bounce">
              {topic.emoji}
            </div>
            <div className="absolute -top-2 -right-2 bg-amber-400 text-white text-xs font-black px-2 py-1 rounded-full">
              +{topic.xpReward} XP
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-800 mb-2">{topic.title}</h2>
            <p className="text-slate-500 text-base font-medium">{topic.subtitle}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl px-4 py-2">
              <Clock className="h-4 w-4 text-slate-400" />
              <span className="text-xs font-bold text-slate-600">{topic.timeMinutes} min</span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl px-4 py-2">
              <DifficultyStars level={topic.difficulty} />
              <span className="text-xs font-bold text-slate-600">
                {topic.difficulty === 1 ? 'Beginner' : topic.difficulty === 2 ? 'Intermediate' : 'Advanced'}
              </span>
            </div>
            <div className="flex flex-col items-center gap-1 bg-slate-50 rounded-xl px-4 py-2">
              <Zap className="h-4 w-4 text-amber-400" />
              <span className="text-xs font-bold text-slate-600">{topic.quiz.length} questions</span>
            </div>
          </div>
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-6 py-4 max-w-sm">
            <p className="text-indigo-700 text-sm font-medium leading-relaxed">{topic.definition}</p>
          </div>
          <button onClick={goNext}
            className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 transition-all">
            Start Learning <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      );

      // Step 1: Learn / Simple Explanation
      case 1: return (
        <div className="py-4 space-y-5">
          <div className="flex items-center gap-3 p-4 bg-indigo-50 rounded-2xl border border-indigo-100">
            <BookOpen className="h-6 w-6 text-indigo-600 flex-shrink-0" />
            <div>
              <p className="text-xs text-indigo-500 font-semibold uppercase tracking-wider mb-0.5">Simple Explanation</p>
              <p className="text-indigo-900 font-semibold text-sm leading-relaxed">{topic.simpleExplanation}</p>
            </div>
          </div>
          <div className="p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">Definition</p>
            <p className="text-slate-700 text-sm leading-relaxed">{topic.definition}</p>
          </div>
        </div>
      );

      // Step 2: Visual Examples
      case 2: return (
        <div className="py-4 space-y-4">
          <p className="text-sm text-slate-500 font-medium text-center">See {topic.title} in action:</p>
          <div className="grid grid-cols-1 gap-3">
            {topic.visualExamples.map((ex, i) => (
              <div key={i} className="flex items-start gap-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl p-4 border border-slate-100">
                <div className="w-12 h-12 flex-shrink-0 bg-white rounded-xl flex items-center justify-center text-2xl shadow-sm border border-slate-100">
                  {ex.emoji}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-0.5">{ex.label}</p>
                  <p className="text-slate-700 font-medium text-sm leading-relaxed italic">{ex.sentence}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      );

      // Step 3: Memory Trick
      case 3: return (
        <div className="py-4 space-y-5">
          <div className="flex flex-col items-center gap-4 text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center text-4xl shadow-lg">
              💡
            </div>
            <h3 className="text-xl font-black text-slate-800">Memory Trick</h3>
          </div>
          <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <Lightbulb className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-amber-900 font-semibold text-sm leading-relaxed">{topic.memoryTrick}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-slate-100 p-4">
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mb-2">🎓 Pro Tip</p>
            <p className="text-slate-600 text-sm">Read this memory trick 3 times. Then close your eyes and repeat it. The more you engage with it, the better it sticks!</p>
          </div>
        </div>
      );

      // Step 4: Common Mistakes
      case 4: return (
        <div className="py-4 space-y-4">
          <p className="text-center text-sm text-slate-500 font-medium">Watch out for these common errors:</p>
          {topic.commonMistakes.map((mistake, i) => (
            <div key={i} className="rounded-2xl overflow-hidden border border-slate-100 shadow-sm">
              <div className="flex items-start gap-3 p-4 bg-red-50">
                <XCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-red-400 font-bold uppercase tracking-wide mb-1">Wrong ✗</p>
                  <p className="text-red-800 font-medium text-sm line-through opacity-70">{mistake.wrong}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-emerald-50 border-t border-slate-100">
                <CheckCircle className="h-5 w-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-600 font-bold uppercase tracking-wide mb-1">Correct ✓</p>
                  <p className="text-emerald-800 font-medium text-sm">{mistake.correct}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-blue-50 border-t border-slate-100">
                <Lightbulb className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-blue-700 text-sm font-medium">{mistake.tip}</p>
              </div>
            </div>
          ))}
        </div>
      );

      // Step 5: Practice
      case 5: return (
        <div className="py-4 space-y-4">
          <p className="text-center text-sm text-slate-500 font-medium">Try these exercises:</p>
          {topic.practiceItems.map((item, i) => {
            const revealed = practiced.includes(i);
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-4 bg-slate-50 border-b border-slate-100">
                  <span className="text-xs bg-indigo-100 text-indigo-700 font-bold px-2 py-0.5 rounded-full">Exercise {i + 1}</span>
                  <p className="text-slate-700 text-sm font-medium mt-2">{item.instruction}</p>
                </div>
                <div className="p-4">
                  <p className="text-slate-800 font-bold text-sm italic mb-3">"{item.sentence}"</p>
                  {revealed ? (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3">
                      <p className="text-xs text-emerald-600 font-bold mb-1">Answer:</p>
                      <p className="text-emerald-800 font-semibold text-sm">{item.answer}</p>
                    </div>
                  ) : (
                    <button
                      onClick={() => setPracticed(p => [...p, i])}
                      className="flex items-center gap-2 text-indigo-600 font-semibold text-sm border border-indigo-200 rounded-xl px-4 py-2 hover:bg-indigo-50 transition-colors">
                      <Eye className="h-4 w-4" /> Reveal Answer
                    </button>
                  )}
                </div>
              </div>
            );
          })}
          {practiced.length === topic.practiceItems.length && (
            <div className="text-center">
              <p className="text-emerald-600 font-bold text-sm mb-2">✅ All exercises done! Ready for the quiz?</p>
              <button onClick={goNext} className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold px-6 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-105 transition-all text-sm">
                Take Quiz →
              </button>
            </div>
          )}
        </div>
      );

      // Step 6: Quiz
      case 6: return (
        <QuizEngine
          questions={topic.quiz}
          topicTitle={topic.title}
          onComplete={handleQuizComplete}
        />
      );

      // Step 7: Revision
      case 7: return (
        <div className="py-4 space-y-4">
          {quizScore !== null && (
            <div className={`rounded-2xl p-4 text-center ${quizScore >= topic.quiz.length * 0.8 ? 'bg-emerald-50 border border-emerald-200' : 'bg-amber-50 border border-amber-200'}`}>
              <p className="text-2xl font-black mb-1">
                {quizScore >= topic.quiz.length * 0.8 ? '🎉' : '📚'} {quizScore}/{topic.quiz.length} correct
              </p>
              <p className={`text-sm font-medium ${quizScore >= topic.quiz.length * 0.8 ? 'text-emerald-700' : 'text-amber-700'}`}>
                {quizScore === topic.quiz.length ? 'Perfect score! You\'re a master!' :
                 quizScore >= topic.quiz.length * 0.8 ? 'Excellent! Great understanding!' :
                 quizScore >= topic.quiz.length * 0.6 ? 'Good effort! Review the points below.' :
                 'Keep practising — revision will help!'}
              </p>
            </div>
          )}
          <div>
            <h3 className="font-black text-slate-800 mb-3 flex items-center gap-2">
              <Brain className="h-5 w-5 text-violet-600" /> Key Revision Points
            </h3>
            <div className="space-y-2">
              {topic.revisionPoints.map((point, i) => (
                <div key={i} className="flex items-start gap-3 bg-violet-50 rounded-xl p-3 border border-violet-100">
                  <div className="w-5 h-5 bg-violet-200 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-black text-violet-700 mt-0.5">{i + 1}</div>
                  <p className="text-violet-900 text-sm font-medium leading-relaxed">{point}</p>
                </div>
              ))}
            </div>
          </div>
          <button onClick={handleFinish}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-black py-4 rounded-2xl shadow-lg shadow-emerald-200 hover:shadow-xl hover:scale-[1.02] transition-all text-base">
            🏆 Complete Lesson & Earn XP
          </button>
        </div>
      );

      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* ── Top bar ────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-20 bg-white border-b border-slate-100">
        <div className="flex items-center gap-3 px-4 py-3">
          <button onClick={onExit} className="p-2 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="h-5 w-5 text-slate-600" />
          </button>
          <div className="flex-1">
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-base">{currentStep.icon}</span>
                <span className="text-sm font-bold text-slate-700">{currentStep.label}</span>
              </div>
              <span className="text-xs text-slate-400 font-medium">{step + 1} / {STEPS.length}</span>
            </div>
            {/* Progress bar */}
            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        {/* Step pills */}
        <div className="px-4 pb-3 flex gap-1.5 overflow-x-auto scrollbar-hide">
          {STEPS.map((s, i) => (
            <button key={s.id}
              onClick={() => i <= Math.max(step, 0) && setStep(i)}
              className={`flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all ${
                i === step ? 'bg-indigo-600 text-white shadow-sm' :
                i < step ? 'bg-indigo-100 text-indigo-600' :
                'bg-slate-100 text-slate-400'
              }`}>
              <span>{s.icon}</span>
              <span className="hidden sm:inline">{s.shortLabel}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Topic header ───────────────────────────────────────────────── */}
      {step > 0 && (
        <div className="px-4 pt-4 pb-2 flex items-center gap-3 border-b border-slate-50">
          <span className="text-3xl">{topic.emoji}</span>
          <div>
            <h1 className="font-black text-slate-800">{topic.title}</h1>
            <div className="flex items-center gap-2">
              <DifficultyStars level={topic.difficulty} />
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-slate-400 text-xs">{topic.timeMinutes} min</span>
              <span className="text-slate-400 text-xs">·</span>
              <span className="text-amber-500 text-xs font-bold">+{topic.xpReward} XP</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Content ─────────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4">
        {renderContent()}
      </div>

      {/* ── Bottom navigation ───────────────────────────────────────────── */}
      {step !== 6 && step !== 0 && step !== 7 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3 flex gap-3">
          <button onClick={goPrev}
            disabled={step === 0}
            className="flex items-center gap-1 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors disabled:opacity-40">
            <ChevronLeft className="h-4 w-4" /> Back
          </button>
          <button onClick={goNext}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all text-sm">
            Next <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* First step nav */}
      {step === 0 && (
        <div className="sticky bottom-0 bg-white border-t border-slate-100 px-4 py-3">
          <button onClick={onExit} className="text-slate-400 text-sm font-medium w-full text-center hover:text-slate-600 transition-colors">
            ← Back to Grammar Hub
          </button>
        </div>
      )}
    </div>
  );
};

export default TopicLesson;
