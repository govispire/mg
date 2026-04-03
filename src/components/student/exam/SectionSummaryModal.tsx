import React from 'react';
import { X } from 'lucide-react';

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
    /** 1-based section number */
    sectionNumber?: number;
    sectionTimeLeft?: string;
    stats: SectionSummaryStats;
    onConfirm: () => void;
    onCancel: () => void;
    autoSubmitting?: boolean;
}

export const SectionSummaryModal: React.FC<SectionSummaryModalProps> = ({
    open,
    sectionName,
    sectionNumber = 1,
    stats,
    onConfirm,
    onCancel,
    autoSubmitting = false,
}) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            {/* Card — wide enough to show all 6 columns */}
            <div className="bg-white w-full max-w-2xl rounded-xl shadow-2xl flex flex-col">

                {/* ── Header ── */}
                <div className="relative flex flex-col items-center pt-7 pb-4 px-8">
                    {!autoSubmitting && (
                        <button
                            onClick={onCancel}
                            className="absolute right-5 top-5 w-7 h-7 rounded-full border border-gray-300 flex items-center justify-center text-gray-500 hover:bg-gray-100 transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    )}
                    <h2 className="text-xl font-bold text-gray-900">Test Summary</h2>
                    <p className="text-sm text-gray-500 mt-1">Do you want to Submit this Section?</p>
                </div>

                {/* ── Table — use real <table> so browser handles column sizing ── */}
                <div className="px-6 pb-5">
                    <table className="w-full border-collapse border border-gray-300 text-sm rounded-lg overflow-hidden">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-300 px-3 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap w-12">
                                    S.<br />No.
                                </th>
                                <th className="border border-gray-300 px-4 py-3 text-center text-xs font-semibold text-gray-600">
                                    Section Name
                                </th>
                                <th className="border border-gray-300 px-3 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                                    No. of<br />Questions
                                </th>
                                <th className="border border-gray-300 px-3 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                                    Answered
                                </th>
                                <th className="border border-gray-300 px-3 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                                    Not<br />Answered
                                </th>
                                <th className="border border-gray-300 px-3 py-3 text-center text-xs font-semibold text-gray-600 whitespace-nowrap">
                                    Not<br />Visited
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="bg-white">
                                <td className="border border-gray-200 px-3 py-4 text-center text-sm text-gray-700">
                                    {sectionNumber}
                                </td>
                                <td className="border border-gray-200 px-4 py-4 text-center text-sm font-medium text-gray-700 leading-snug">
                                    {sectionName}
                                </td>
                                <td className="border border-gray-200 px-3 py-4 text-center text-sm text-gray-700">
                                    {stats.total}
                                </td>
                                <td className="border border-gray-200 px-3 py-4 text-center text-sm font-semibold text-gray-800">
                                    {stats.answered}
                                </td>
                                <td className="border border-gray-200 px-3 py-4 text-center text-sm font-semibold text-blue-600">
                                    {stats.notAnswered}
                                </td>
                                <td className="border border-gray-200 px-3 py-4 text-center text-sm font-semibold text-gray-800">
                                    {stats.notVisited}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* ── Footer ── */}
                <div className="px-6 pb-7 flex justify-center">
                    <button
                        onClick={onConfirm}
                        className="bg-[#1565c0] hover:bg-[#0d47a1] active:bg-[#0a2d6e] text-white text-sm font-semibold px-12 py-2.5 rounded transition-colors"
                    >
                        Submit Section
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SectionSummaryModal;
