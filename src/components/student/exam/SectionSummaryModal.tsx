import React from 'react';
import { Clock, Flag, CheckCircle2, XCircle, Eye, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface SectionSummaryStats {
    total: number;
    answered: number;
    notAnswered: number;
    marked: number;
    notVisited: number;
}

interface SectionSummaryModalProps {
    open: boolean;
    sectionName: string;
    /** e.g. "18:30" — omit if no per-section timer */
    sectionTimeLeft?: string;
    stats: SectionSummaryStats;
    onConfirm: () => void;
    onCancel: () => void;
    /** If true, cancel button is hidden (timer-triggered auto-confirm flow) */
    autoSubmitting?: boolean;
}

export const SectionSummaryModal: React.FC<SectionSummaryModalProps> = ({
    open,
    sectionName,
    sectionTimeLeft,
    stats,
    onConfirm,
    onCancel,
    autoSubmitting = false,
}) => {
    if (!open) return null;

    return (
        /* ── Full-viewport overlay ── */
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl mx-4 rounded-2xl shadow-2xl overflow-hidden flex flex-col">

                {/* ── Header bar ── */}
                <div className="bg-[#1976d2] px-8 py-5 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white tracking-wide">Section Summary</h2>
                    {sectionTimeLeft && (
                        <span className="flex items-center gap-2 bg-white/20 text-white text-sm font-semibold px-3 py-1.5 rounded-full">
                            <Clock className="w-4 h-4" />
                            Time Left: {sectionTimeLeft}
                        </span>
                    )}
                </div>

                {/* ── Body ── */}
                <div className="px-8 py-6 space-y-6">
                    <p className="text-base text-gray-700 text-center font-medium">
                        Do you want to submit this section?
                    </p>

                    {/* ── Section label ── */}
                    <div className="bg-gray-100 rounded-lg px-5 py-3">
                        <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Section</span>
                        <p className="text-lg font-bold text-gray-900 mt-0.5">{sectionName}</p>
                    </div>

                    {/* ── Stats grid ── */}
                    <div className="grid grid-cols-4 gap-3">
                        <div className="flex flex-col items-center bg-green-50 border border-green-200 rounded-xl py-4 gap-1">
                            <CheckCircle2 className="w-6 h-6 text-green-600" />
                            <span className="text-2xl font-bold text-green-700">{stats.answered}</span>
                            <span className="text-xs text-green-600 font-medium text-center">Answered</span>
                        </div>
                        <div className="flex flex-col items-center bg-red-50 border border-red-200 rounded-xl py-4 gap-1">
                            <XCircle className="w-6 h-6 text-red-500" />
                            <span className="text-2xl font-bold text-red-600">{stats.notAnswered}</span>
                            <span className="text-xs text-red-500 font-medium text-center">Not Answered</span>
                        </div>
                        <div className="flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl py-4 gap-1">
                            <Eye className="w-6 h-6 text-gray-400" />
                            <span className="text-2xl font-bold text-gray-600">{stats.notVisited}</span>
                            <span className="text-xs text-gray-500 font-medium text-center">Not Visited</span>
                        </div>
                        <div className="flex flex-col items-center bg-purple-50 border border-purple-200 rounded-xl py-4 gap-1">
                            <Flag className="w-6 h-6 text-purple-600 fill-purple-200" />
                            <span className="text-2xl font-bold text-purple-700">{stats.marked}</span>
                            <span className="text-xs text-purple-600 font-medium text-center">Marked</span>
                        </div>
                    </div>

                    {/* ── Total row ── */}
                    <div className="flex items-center justify-between px-5 py-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-semibold text-blue-800">Total Questions</span>
                        <span className="text-xl font-bold text-blue-900">{stats.total}</span>
                    </div>

                    {/* ── Warning ── */}
                    {(stats.notAnswered > 0 || stats.notVisited > 0) && (
                        <div className="flex items-start gap-2 bg-amber-50 border border-amber-300 rounded-lg px-4 py-3">
                            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                            <p className="text-sm text-amber-800">
                                You have <strong>{stats.notAnswered}</strong> unanswered and <strong>{stats.notVisited}</strong> unvisited questions.
                                Once submitted, this section <strong>cannot be re-opened</strong>.
                            </p>
                        </div>
                    )}

                    <p className="text-sm text-gray-700 text-center font-medium">
                        Are you sure you want to submit this section?
                    </p>
                </div>

                {/* ── Footer ── */}
                <div className="px-8 pb-7 flex items-center justify-center gap-4">
                    <Button
                        onClick={onConfirm}
                        size="lg"
                        className="bg-[#1976d2] hover:bg-[#1565c0] text-white px-10 text-base font-semibold"
                    >
                        Submit Section
                    </Button>
                    {!autoSubmitting && (
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={onCancel}
                            className="border-gray-300 text-gray-700 px-10 text-base"
                        >
                            Cancel
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SectionSummaryModal;
