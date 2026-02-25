import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSelfCareExams, ExamApplication } from '@/hooks/useSelfCareExams';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight, Plus, Trophy, ChevronRight, Info, RefreshCcw } from 'lucide-react';
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";

export const ExamStatusSummary = () => {
    const { exams } = useSelfCareExams();
    const navigate = useNavigate();

    // Get active exams (already filtered by hook, but ensure we take top 3)
    const activeExams = exams.slice(0, 3);

    const getStageIndex = (exam: ExamApplication) => {
        const idx = exam.stages.findIndex(s => s.status === 'pending' || s.status === 'not-cleared' || s.status === 'n/a');
        return idx === -1 ? exam.stages.length : idx; // If all cleared, return length (all done)
    };

    if (activeExams.length === 0) {
        return (
            <Card className="p-6 bg-gradient-to-br from-indigo-50 to-purple-50 border-dashed border-2 border-indigo-200">
                <div className="flex flex-col items-center justify-center text-center">
                    <div className="h-12 w-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3">
                        <Plus className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-primary mb-1">Track Your Exam Goals</h3>
                    <p className="text-sm text-muted-foreground mb-4 max-w-xs">
                        Add exams to tracking to see your application status, dates, and progress here.
                    </p>
                    <Button onClick={() => navigate('/student/self-care')} className="bg-primary hover:bg-primary/90">
                        Start Tracking
                    </Button>
                </div>
            </Card>
        );
    }

    return (
        <TooltipProvider delayDuration={0}>
            <Card className="p-4 sm:p-5 bg-gradient-to-br from-card via-card to-primary/5 border-2 shadow-lg relative overflow-visible">
                {/* Decorative Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-0" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl -z-0" />

                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-gradient-to-br from-primary to-primary/80 text-white rounded-xl shadow-lg shadow-primary/20">
                                <Trophy className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Your Current Exams Status</h3>
                                <p className="text-xs text-muted-foreground font-medium">Tracking <span className="text-primary font-bold">{activeExams.length}</span> active applications</p>
                            </div>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs gap-1 h-8 shadow-md hover:shadow-lg hover:bg-primary hover:text-primary-foreground transition-all" asChild>
                            <Link to="/student/self-care">
                                <span>View All</span> <ArrowRight className="h-3 w-3" />
                            </Link>
                        </Button>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                        {activeExams.map((exam) => {
                            const currentIndex = getStageIndex(exam);
                            const isSelected = exam.finalStatus === 'selected';
                            const isNotSelected = exam.finalStatus === 'not-selected';

                            return (
                                <div
                                    key={exam.id}
                                    onClick={() => navigate('/student/self-care')}
                                    className="bg-gradient-to-br from-card to-card/50 hover:from-primary/5 hover:to-primary/10 border-2 rounded-2xl p-5 transition-all duration-300 cursor-pointer shadow-md hover:shadow-xl group relative backdrop-blur-sm"
                                >
                                    {/* Exam Header */}
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="flex-1">
                                            <h4 className="font-bold text-base text-foreground group-hover:text-primary transition-colors mb-1.5 line-clamp-1">{exam.name}</h4>
                                            <p className="text-[10px] text-muted-foreground/80 font-bold uppercase tracking-wider bg-muted/50 px-2 py-0.5 rounded-md inline-block">{exam.category}</p>
                                        </div>
                                        <span className={`text-[10px] px-2.5 py-1.5 rounded-lg font-bold border-2 shadow-sm ml-2 ${isSelected ? 'bg-gradient-to-br from-green-50 to-green-100 text-green-700 border-green-300' :
                                            isNotSelected ? 'bg-gradient-to-br from-amber-50 to-amber-100 text-amber-700 border-amber-300' : 'bg-gradient-to-br from-primary/10 to-primary/20 text-primary border-primary/30'
                                            }`}>
                                            {exam.finalStatus === 'pending' ? '🔥 Active' : exam.finalStatus}
                                        </span>
                                    </div>

                                    {/* Stepper Visualization */}
                                    <div className="relative px-1">
                                        <div className="flex items-start justify-between relative z-10 w-full">
                                            {exam.stages.map((stage, idx) => {
                                                const isCompleted = idx < currentIndex;
                                                const isCurrent = idx === currentIndex;
                                                const isLast = idx === exam.stages.length - 1;
                                                const isFailed = isNotSelected && isCurrent;

                                                return (
                                                    <div key={idx} className="flex flex-col items-center flex-1 relative min-w-0 z-10">
                                                        {/* Connecting Line */}
                                                        {!isLast && (
                                                            <div className="absolute top-4 left-[50%] w-full h-[3px] -z-10 bg-muted/30 overflow-hidden rounded-full">
                                                                <div
                                                                    className={`h-full w-full transition-all duration-700 ease-out origin-left ${isCompleted ? 'bg-gradient-to-r from-green-400 to-green-500 scale-x-100' : 'scale-x-0'
                                                                        }`}
                                                                />
                                                            </div>
                                                        )}

                                                        <Tooltip>
                                                            <TooltipTrigger asChild>
                                                                {/* Node Circle Wrapper */}
                                                                <div className="relative flex-shrink-0 cursor-help group/node" onClick={(e) => e.stopPropagation()}>
                                                                    {/* Active Pulse Animation */}
                                                                    {isCurrent && !isFailed && !isSelected && (
                                                                        <>
                                                                            <div className="absolute -inset-2 border-2 border-dashed border-primary/50 rounded-full animate-spin-slow"></div>
                                                                            <div className="absolute -inset-2 bg-primary/10 rounded-full animate-ping"></div>
                                                                        </>
                                                                    )}

                                                                    <div
                                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-3 transition-all duration-300 shadow-lg relative z-20 ${isCompleted ? 'bg-gradient-to-br from-green-400 to-green-600 border-green-300 text-white scale-95' :
                                                                            isFailed ? 'bg-gradient-to-br from-amber-400 to-amber-600 border-amber-300 text-white' : // Softened to Amber
                                                                                isCurrent ? 'bg-gradient-to-br from-primary to-primary/90 border-primary-foreground text-white scale-110 shadow-primary/30' :
                                                                                    'bg-muted/70 border-muted-foreground/30 text-muted-foreground group-hover/node:border-primary/40 group-hover/node:bg-primary/10 group-hover/node:text-primary'
                                                                            }`}
                                                                    >
                                                                        {isCompleted ? (
                                                                            <Check className="h-4 w-4" strokeWidth={3} />
                                                                        ) : isFailed ? (
                                                                            <RefreshCcw className="h-4 w-4" strokeWidth={2.5} /> // Changed X to Refresh
                                                                        ) : (
                                                                            <span>{idx + 1}</span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TooltipTrigger>
                                                            <TooltipContent
                                                                side="bottom"
                                                                align="center"
                                                                sideOffset={10}
                                                                collisionPadding={20}
                                                                className="p-0 border-0 bg-transparent shadow-none z-[9999]"
                                                            >
                                                                <div className={`w-64 bg-white dark:bg-slate-900 rounded-xl border-2 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 ${stage.status === 'cleared' ? 'border-green-500 ring-2 ring-green-500/20' :
                                                                    stage.status === 'not-cleared' ? 'border-red-500 ring-2 ring-red-500/20' :
                                                                        isCurrent ? 'border-primary ring-2 ring-primary/20' :
                                                                            'border-slate-300 dark:border-slate-600'
                                                                    }`}>
                                                                    {/* Card Header with Stage Name */}
                                                                    <div className={`px-3 py-2.5 border-b ${isCompleted ? 'bg-gradient-to-r from-green-500 to-green-600' :
                                                                        isCurrent ? 'bg-gradient-to-r from-primary to-primary/90' :
                                                                            stage.status === 'not-cleared' ? 'bg-gradient-to-r from-red-500 to-red-600' :
                                                                                'bg-gradient-to-r from-slate-600 to-slate-700 dark:from-slate-700 dark:to-slate-800'
                                                                        }`}>
                                                                        <div className="flex justify-between items-center gap-2">
                                                                            <span className="font-bold text-sm text-white uppercase tracking-wide">{stage.name}</span>
                                                                            <span className={`text-[9px] px-2 py-1 rounded-md font-bold uppercase tracking-wide ${stage.status === 'cleared' ? 'bg-white text-green-600' :
                                                                                stage.status === 'not-cleared' ? 'bg-white text-red-600' :
                                                                                    isCurrent ? 'bg-white text-primary' :
                                                                                        'bg-white text-slate-700'
                                                                                }`}>
                                                                                {stage.status === 'pending' && isCurrent ? '⚡ ACTIVE' : stage.status === 'pending' ? '📅 UPCOMING' : stage.status.toUpperCase()}
                                                                            </span>
                                                                        </div>
                                                                    </div>

                                                                    {/* Card Body */}
                                                                    <div className="p-3 space-y-3 bg-white dark:bg-slate-900">
                                                                        {/* Date Section */}
                                                                        <div className="bg-slate-50 dark:bg-slate-800 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
                                                                            <div className="flex items-center gap-2 mb-1">
                                                                                <div className="p-1.5 bg-primary/10 rounded-md">
                                                                                    <Info className="h-3.5 w-3.5 text-primary" />
                                                                                </div>
                                                                                <p className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Exam Date</p>
                                                                            </div>
                                                                            <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 ml-8">
                                                                                {stage.date
                                                                                    ? new Date(stage.date).toLocaleDateString('en-GB', {
                                                                                        day: 'numeric',
                                                                                        month: 'short',
                                                                                        year: 'numeric'
                                                                                    })
                                                                                    : '📌 Not set'}
                                                                            </p>
                                                                        </div>

                                                                        {/* Performance Section */}
                                                                        {(stage.score || stage.notes) && (
                                                                            <div className="space-y-2">
                                                                                {stage.score && (
                                                                                    <div className="bg-primary/5 p-2.5 rounded-lg border border-primary/20">
                                                                                        <div className="flex justify-between items-center">
                                                                                            <span className="text-[9px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Score</span>
                                                                                            <span className="text-sm font-black text-primary bg-white dark:bg-slate-800 px-3 py-1 rounded-md shadow-sm">{stage.score}</span>
                                                                                        </div>
                                                                                    </div>
                                                                                )}
                                                                                {stage.notes && (
                                                                                    <div className="bg-amber-50 dark:bg-amber-950/20 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                                                                                        <p className="text-[9px] font-bold text-amber-700 dark:text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1">
                                                                                            <span>📝</span> Notes
                                                                                        </p>
                                                                                        <p className="text-xs text-slate-700 dark:text-slate-300 leading-snug">"{stage.notes}"</p>
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                        )}

                                                                        {/* Empty State */}
                                                                        {!stage.score && !stage.notes && !stage.date && (
                                                                            <div className="text-center py-4 bg-slate-50 dark:bg-slate-800 rounded-lg border border-dashed border-slate-300 dark:border-slate-600">
                                                                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">💡 No details yet</p>
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </TooltipContent>
                                                        </Tooltip>

                                                        {/* Label */}
                                                        <div className="text-center w-full px-0.5 mt-3">
                                                            <p className={`text-[9px] font-bold uppercase tracking-tight leading-tight transition-colors duration-300 break-words ${isCurrent ? 'text-primary' : 'text-muted-foreground'
                                                                }`}>
                                                                {stage.name}
                                                            </p>
                                                            {isCurrent && stage.date && (
                                                                <div className="bg-gradient-to-r from-primary/10 to-primary/5 px-2 py-1 rounded-lg mt-1.5 inline-block border border-primary/20 shadow-sm">
                                                                    <span className="text-[9px] text-primary font-bold block whitespace-nowrap">
                                                                        📅 {new Date(stage.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    {/* Hover Indicator */}
                                    <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-1 group-hover:translate-x-0">
                                        <div className="bg-primary/10 p-1.5 rounded-full">
                                            <ChevronRight className="h-4 w-4 text-primary" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Card>
        </TooltipProvider>
    );
};
