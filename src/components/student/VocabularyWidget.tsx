import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useVocabulary, VocabWord } from '@/hooks/useVocabulary';
import { useAuth } from '@/app/providers';
import {
    BookOpen, ChevronRight, ChevronLeft, ExternalLink,
    Volume2, CheckCircle2, RotateCcw
} from 'lucide-react';

// Part of speech detection
const guessPos = (word: string): string => {
    const w = word.toLowerCase();
    if (w.endsWith('ous') || w.endsWith('ive') || w.endsWith('al') || w.endsWith('ent') ||
        w.endsWith('ant') || w.endsWith('ful') || w.endsWith('less') || w.endsWith('ic')) return 'Adjective';
    if (w.endsWith('ly')) return 'Adverb';
    if (w.endsWith('ize') || w.endsWith('ise') || w.endsWith('ate') || w.endsWith('ify')) return 'Verb';
    return 'Noun';
};

// Gradient schemes cycling per word index
const WORD_GRADIENTS = [
    'from-blue-600 to-indigo-700',
    'from-violet-600 to-purple-700',
    'from-teal-500 to-cyan-600',
    'from-rose-500 to-pink-600',
    'from-amber-500 to-orange-600',
];

export default function WordOfTheDayCard() {
    const { user } = useAuth();
    const { todayWords, markWord, getWordProgress } = useVocabulary(user?.id || 'student_1');
    const [wordIndex, setWordIndex] = useState(0);

    const today = new Date();
    const dateStr = today.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

    const word: VocabWord | undefined = todayWords[wordIndex];
    const pos = word ? guessPos(word.word) : 'Adjective';
    const gradientClass = WORD_GRADIENTS[wordIndex % WORD_GRADIENTS.length];

    const progress = word ? getWordProgress(word.id) : undefined;
    const isLearned = progress?.status === 'learned';

    const handleSave = () => {
        if (word) markWord(word.id, 'learned', word.difficulty);
    };
    const handlePending = () => {
        if (word) markWord(word.id, 'pending');
    };

    if (!word) {
        return (
            <div className="rounded-2xl overflow-hidden border border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-teal-950/40 shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2.5 bg-white/60 dark:bg-white/5 border-b border-emerald-100 dark:border-emerald-900">
                    <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                            <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                        </div>
                        <span className="text-xs font-semibold text-foreground ml-1">Word of the Day</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                        {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                </div>

                {/* Body */}
                <div className="px-5 py-5 text-center space-y-3">
                    <div className="text-4xl animate-bounce">🎉</div>

                    <div>
                        <h3 className="font-black text-base text-emerald-800 dark:text-emerald-300">
                            All 5 Words Done!
                        </h3>
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-medium">
                            Come back tomorrow for new words
                        </p>
                    </div>

                    {/* 5-dot progress */}
                    <div className="flex items-center justify-center gap-2 py-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-300" />
                        ))}
                    </div>

                    {/* CTAs */}
                    <div className="space-y-2 pt-1">
                        <Link
                            to="/student/vocabulary"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-md shadow-emerald-200"
                        >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            See My Learned Words
                        </Link>
                        <Link
                            to="/student/vocabulary"
                            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-emerald-200 bg-white/80 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold transition-all"
                        >
                            <BookOpen className="h-3.5 w-3.5" />
                            Explore Full Vocabulary Page
                        </Link>
                    </div>

                    <p className="text-[10px] text-muted-foreground">
                        💡 Quiz on past words to sharpen accuracy
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="rounded-2xl overflow-hidden border border-border shadow-md bg-card">
            {/* ── Header bar ── */}
            <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b border-border">
                <div className="flex items-center gap-1.5">
                    <div className="flex gap-0.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                        <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    </div>
                    <span className="text-xs font-semibold text-foreground ml-1">Word of the Day</span>
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] text-muted-foreground bg-muted px-2 py-0.5 rounded-full">{dateStr}</span>
                    <Link to="/student/vocabulary" className="text-muted-foreground hover:text-primary transition-colors">
                        <ExternalLink className="h-3 w-3" />
                    </Link>
                </div>
            </div>

            {/* ── Gradient word hero ── */}
            <div className={`relative bg-gradient-to-br ${gradientClass} px-5 pt-6 pb-5`}>
                {/* Navigation arrows */}
                {todayWords.length > 1 && (
                    <div className="absolute top-3 right-3 flex items-center gap-1">
                        <button
                            onClick={() => setWordIndex(i => Math.max(0, i - 1))}
                            disabled={wordIndex === 0}
                            className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white disabled:opacity-30 transition"
                        >
                            <ChevronLeft className="h-3 w-3" />
                        </button>
                        <span className="text-white/80 text-[10px] font-medium">{wordIndex + 1}/{todayWords.length}</span>
                        <button
                            onClick={() => setWordIndex(i => Math.min(todayWords.length - 1, i + 1))}
                            disabled={wordIndex === todayWords.length - 1}
                            className="h-6 w-6 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-white disabled:opacity-30 transition"
                        >
                            <ChevronRight className="h-3 w-3" />
                        </button>
                    </div>
                )}

                {/* Word + POS */}
                <div className="flex items-end gap-2 mb-1">
                    <h2 className="text-[28px] font-black text-white leading-none tracking-tight drop-shadow">
                        {word.word}
                    </h2>
                    <span className="mb-0.5 text-white/60 text-xs font-medium">{word.pronunciation || ''}</span>
                </div>
                <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white px-2.5 py-0.5 rounded-full">
                    {pos}
                </span>

                {/* Wave-like bottom cut */}
                <div className="absolute bottom-0 left-0 right-0 h-3 bg-card" style={{ borderRadius: '50% 50% 0 0 / 100% 100% 0 0', transform: 'scaleX(1.02)' }} />
            </div>

            {/* ── Content area ── */}
            <div className="px-4 pt-4 pb-3 space-y-3 bg-card">
                {/* Meaning */}
                <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Meaning</p>
                    <p className="text-sm text-foreground font-medium leading-snug">{word.meaning}</p>
                </div>

                {/* Example */}
                <div className="space-y-0.5">
                    <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Example</p>
                    <p className="text-xs text-muted-foreground italic leading-relaxed border-l-2 border-primary/30 pl-2.5">
                        "{word.example}"
                    </p>
                </div>

                {/* Synonyms */}
                {(word.synonyms?.length ?? 0) > 0 && (
                    <div className="space-y-1.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">Synonyms</p>
                        <div className="flex flex-wrap gap-1.5">
                            {word.synonyms!.map(syn => (
                                <span
                                    key={syn}
                                    className="text-[11px] font-semibold px-3 py-1 rounded-full bg-muted border border-border text-foreground hover:bg-primary/10 hover:border-primary/30 hover:text-primary transition-all cursor-default"
                                >
                                    {syn}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Antonyms */}
                {(word.antonyms?.length ?? 0) > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                        {word.antonyms!.slice(0, 2).map(ant => (
                            <span
                                key={ant}
                                className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-red-50 border border-red-200 text-red-600"
                            >
                                ↕ {ant}
                            </span>
                        ))}
                    </div>
                )}

                {/* Actions */}
                <div className="pt-1 border-t border-border">
                    {isLearned ? (
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5 text-xs font-semibold text-green-600">
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Saved to Vocabulary List ✓
                            </div>
                            <Link to="/student/vocabulary" className="text-[10px] text-primary hover:underline font-medium">
                                See All →
                            </Link>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleSave}
                                className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold py-2 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-200"
                            >
                                <CheckCircle2 className="h-3.5 w-3.5" />
                                Save to Vocabulary List
                            </button>
                            <button
                                onClick={handlePending}
                                title="Revise Later"
                                className="h-8 w-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 transition-all"
                            >
                                <RotateCcw className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
