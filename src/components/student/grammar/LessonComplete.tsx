import React, { useEffect, useState } from 'react';
import { Trophy, Star, Flame, Zap, ArrowRight, Home, CheckCircle, RotateCcw } from 'lucide-react';
import type { GrammarTopic } from '@/data/grammarData';

interface Props {
  topic: GrammarTopic;
  xpEarned: number;
  quizScore: number;
  totalXP: number;
  streak: number;
  onNext: () => void;
  onHome: () => void;
}

const LessonComplete: React.FC<Props> = ({
  topic, xpEarned, quizScore, totalXP, streak, onNext, onHome,
}) => {
  const [showCoins, setShowCoins] = useState(false);
  const accuracy = Math.round((quizScore / topic.quiz.length) * 100);
  const isPerfect = quizScore === topic.quiz.length;
  const isGood = accuracy >= 80;

  useEffect(() => {
    const t = setTimeout(() => setShowCoins(true), 300);
    return () => clearTimeout(t);
  }, []);

  const grade = isPerfect ? { label: 'Perfect!', icon: '🌟', color: 'from-yellow-400 to-amber-500', msg: 'Flawless! You nailed every question!' }
    : isGood ? { label: 'Excellent!', icon: '🎉', color: 'from-emerald-400 to-teal-500', msg: 'Great understanding of the topic!' }
    : accuracy >= 60 ? { label: 'Good Job!', icon: '👍', color: 'from-blue-400 to-indigo-500', msg: 'Solid effort! Review the revision points.' }
    : { label: 'Keep Going!', icon: '💪', color: 'from-violet-400 to-purple-500', msg: 'Practice makes perfect. Try again if you want!' };

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 via-violet-950 to-slate-900 text-white flex flex-col">
      {/* Stars / confetti layer */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {showCoins && Array.from({ length: 16 }).map((_, i) => (
          <div key={i} className="absolute animate-bounce"
            style={{
              left: `${5 + (i * 6.2) % 90}%`,
              top: `${5 + (i * 7.3) % 40}%`,
              animationDelay: `${i * 0.1}s`,
              animationDuration: `${1 + (i % 3) * 0.3}s`,
              fontSize: `${12 + (i % 3) * 8}px`,
              opacity: 0.7,
            }}>
            {['⭐', '✨', '🌟', '💫'][i % 4]}
          </div>
        ))}
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-6 py-10 text-center gap-6">
        {/* Grade badge */}
        <div className={`w-28 h-28 rounded-3xl bg-gradient-to-br ${grade.color} flex flex-col items-center justify-center shadow-2xl shadow-indigo-900/60 animate-in zoom-in-50 duration-500`}>
          <span className="text-5xl">{grade.icon}</span>
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
          <p className="text-white/60 text-sm font-medium uppercase tracking-wider mb-1">Lesson Complete!</p>
          <h1 className="text-4xl font-black mb-2">{grade.label}</h1>
          <p className="text-white/70 text-base">{grade.msg}</p>
        </div>

        {/* Topic name */}
        <div className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3 border border-white/20 backdrop-blur-sm animate-in fade-in delay-300 duration-500">
          <span className="text-3xl">{topic.emoji}</span>
          <div className="text-left">
            <p className="text-white/50 text-xs">You completed</p>
            <p className="font-black text-lg">{topic.title}</p>
          </div>
          <CheckCircle className="h-6 w-6 text-emerald-400 ml-2" />
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-3 gap-3 w-full max-w-xs animate-in fade-in delay-400 duration-500">
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-1">
            <Zap className="h-5 w-5 text-yellow-400" />
            <span className="text-xl font-black text-yellow-300">+{xpEarned}</span>
            <span className="text-white/50 text-xs">XP Earned</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-1">
            <Star className="h-5 w-5 text-amber-400" />
            <span className="text-xl font-black">{quizScore}/{topic.quiz.length}</span>
            <span className="text-white/50 text-xs">Quiz Score</span>
          </div>
          <div className="bg-white/10 rounded-2xl p-4 border border-white/10 flex flex-col items-center gap-1">
            <Flame className="h-5 w-5 text-orange-400" />
            <span className="text-xl font-black text-orange-300">{streak}</span>
            <span className="text-white/50 text-xs">Day Streak</span>
          </div>
        </div>

        {/* Total XP */}
        <div className="w-full max-w-xs bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-500/30 rounded-2xl p-4 text-center animate-in fade-in delay-500 duration-500">
          <p className="text-yellow-300/70 text-xs font-medium uppercase tracking-wider">Total XP</p>
          <p className="text-3xl font-black text-yellow-300">{totalXP}</p>
        </div>

        {/* Badge unlock (perfect score) */}
        {isPerfect && (
          <div className="flex items-center gap-3 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 border border-yellow-400/40 rounded-2xl px-5 py-3 animate-in fade-in delay-700 duration-500">
            <span className="text-3xl">🏅</span>
            <div className="text-left">
              <p className="text-yellow-300 font-black text-sm">Badge Unlocked!</p>
              <p className="text-yellow-300/70 text-xs">Perfect Quiz — {topic.title}</p>
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="px-6 pb-8 space-y-3 animate-in slide-in-from-bottom-4 duration-500 delay-600">
        <button onClick={onNext}
          className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-indigo-900/50 hover:shadow-2xl hover:scale-[1.02] transition-all text-base">
          Next Lesson <ArrowRight className="h-5 w-5" />
        </button>
        <button onClick={onHome}
          className="w-full flex items-center justify-center gap-2 bg-white/10 border border-white/20 text-white font-bold py-3.5 rounded-2xl hover:bg-white/15 transition-all">
          <Home className="h-5 w-5" /> Back to Grammar Hub
        </button>
      </div>
    </div>
  );
};

export default LessonComplete;
