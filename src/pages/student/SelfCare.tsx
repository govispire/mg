import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import {
  FilePlus2, FileText, CheckCircle2, TrendingUp, IndianRupee,
  Layers, HelpCircle, Trophy, Sparkles
} from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useSelfCareExams } from '@/hooks/useSelfCareExams';
import { ExamForm } from '@/components/student/selfcare/ExamForm';
import { ExamCard } from '@/components/student/selfcare/ExamCard';
import { ExamTableView } from '@/components/student/selfcare/ExamTableView';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const SelfCare = () => {
  const [activeTab, setActiveTab] = useState('exams');
  const [showAddExamDialog, setShowAddExamDialog] = useState(false);
  const { exams, archivedExams, addExam, updateExam, deleteExam, archiveExam, updateStage, getMetrics } = useSelfCareExams();

  const examMetrics = getMetrics();
  const allExams = [...exams, ...archivedExams];

  const handleAddExam = (data: any) => {
    addExam(data);
    setShowAddExamDialog(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* ── HEADER TITLE & PRIMARY CTA ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span>Exam Tracker</span>
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-blue-50 border border-blue-200 text-blue-700">
              Lifecycle Tracker
            </span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 font-medium">
            Manage competitive exam applications, track stage progress (Prelims → Mains → Interview), and monitor fee investments.
          </p>
        </div>

        {/* Primary Action Button (+ Add Exam in Header) */}
        <Button
          onClick={() => setShowAddExamDialog(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-xs shrink-0 self-start sm:self-auto gap-2"
        >
          <FilePlus2 className="h-4 w-4" />
          <span>Add New Exam</span>
        </Button>
      </div>

      {/* ── KPI METRICS BANNER (GROUPED CLUSTERS FOR VISUAL CLARITY) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cluster 1: Overview Metrics */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Application Overview</span>
            </span>
            <span className="text-[11px] text-slate-400 font-medium">Aggregate totals</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[11px] font-bold text-slate-500">Total Applied</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{examMetrics.totalApplied}</h3>
              <p className="text-[10px] text-blue-600 font-bold mt-1">Exams tracked</p>
            </div>

            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl">
              <p className="text-[11px] font-bold text-emerald-800">Final Cleared</p>
              <h3 className="text-2xl font-black text-emerald-700 mt-1">{examMetrics.totalExamsCleared}</h3>
              <p className="text-[10px] text-emerald-600 font-bold mt-1">Selected / Winner</p>
            </div>

            <div className="p-3 bg-amber-50/70 border border-amber-100 rounded-xl">
              <p className="text-[11px] font-bold text-amber-800">Total Spent</p>
              <h3 className="text-2xl font-black text-amber-700 mt-1">₹{examMetrics.totalAmountSpent}</h3>
              <p className="text-[10px] text-amber-600 font-bold mt-1">Application fees</p>
            </div>
          </div>
        </div>

        {/* Cluster 2: Stage Progress Breakdown */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-extrabold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-indigo-600" />
                <span>Stage Milestones Cleared</span>
              </span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="text-slate-400 hover:text-slate-600">
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs text-xs">
                    Shows stage-by-stage progression. A cleared stage indicates you advanced to the next level for that exam.
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <span className="text-[11px] text-slate-400 font-medium">Cumulative stages</span>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[11px] font-bold text-slate-500">Prelims Cleared</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{examMetrics.totalPrelimsCleared}</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Stage 1 passed</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[11px] font-bold text-slate-500">Mains Cleared</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{examMetrics.totalMainsCleared}</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Stage 2 passed</p>
            </div>

            <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl">
              <p className="text-[11px] font-bold text-slate-500">Interviews</p>
              <h3 className="text-2xl font-black text-slate-900 mt-1">{examMetrics.totalInterviewsAppeared}</h3>
              <p className="text-[10px] text-slate-500 font-medium mt-1">Final round done</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── EXAM APPLICATIONS TABS & CONTENT ── */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-2xs overflow-hidden">
        <Tabs defaultValue="exams" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-slate-100 px-4 pt-3 flex items-center justify-between flex-wrap gap-2">
            <TabsList className="bg-slate-100/80 p-1 rounded-xl gap-1">
              <TabsTrigger
                value="exams"
                className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs"
              >
                Current Applications ({exams.length})
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="text-xs font-bold px-4 py-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-2xs"
              >
                Exam History / Archive ({allExams.length})
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="exams" className="p-4 m-0">
            <div className="space-y-3">
              {exams.length > 0 ? (
                exams.map((exam) => (
                  <ExamCard
                    key={exam.id}
                    exam={exam}
                    onUpdate={updateExam}
                    onDelete={deleteExam}
                    onArchive={archiveExam}
                    onUpdateStage={updateStage}
                  />
                ))
              ) : (
                <div className="py-16 text-center border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50/50">
                  <FileText className="mx-auto h-12 w-12 text-slate-300 mb-3" />
                  <h3 className="text-base font-extrabold text-slate-800 mb-1">No Active Applications</h3>
                  <p className="text-xs text-slate-500 mb-4 max-w-sm mx-auto">
                    You haven't added any competitive exam applications yet. Start tracking your Prelims and Mains journey today.
                  </p>
                  <Button
                    size="sm"
                    onClick={() => setShowAddExamDialog(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs px-4 py-2 rounded-xl shadow-xs"
                  >
                    <FilePlus2 className="mr-2 h-3.5 w-3.5" />
                    Add Your First Exam
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="history" className="p-4 m-0">
            <ExamTableView exams={allExams} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Exam Dialog */}
      <Dialog open={showAddExamDialog} onOpenChange={setShowAddExamDialog}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">Add New Exam Application</DialogTitle>
          </DialogHeader>
          <ExamForm
            onSubmit={handleAddExam}
            onCancel={() => setShowAddExamDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SelfCare;
