
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { FilePlus2, FileText, CheckSquare, User, IndianRupee } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
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
    <div className="space-y-4 max-w-7xl mx-auto">
      <div className="px-1">
        <h1 className="text-xl font-bold">Exam Tracker</h1>
        <p className="text-sm text-muted-foreground">Track your real exam applications and progress</p>
      </div>

      {/* Stat Strip - single card with dividers matching reference design */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="grid grid-cols-3 lg:grid-cols-6 divide-x divide-gray-100">

          {/* Total Exams */}
          <button
            className="p-4 text-left hover:bg-gray-50 transition-colors focus:outline-none"
            onClick={() => setActiveTab('exams')}
          >
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Total Exams</p>
            <h3 className="text-3xl font-bold text-gray-800 leading-none mb-1">{examMetrics.totalApplied}</h3>
            <p className="text-[11px] text-gray-400">exams applied</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5">↑ tracking progress</p>
          </button>

          {/* Exams Cleared */}
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Cleared</p>
            <h3 className="text-3xl font-bold text-gray-800 leading-none mb-1">{examMetrics.totalExamsCleared}</h3>
            <p className="text-[11px] text-gray-400">exams cleared</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5">↑ overall success</p>
          </div>

          {/* Prelims */}
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Prelims</p>
            <h3 className="text-3xl font-bold text-gray-800 leading-none mb-1">{examMetrics.totalPrelimsCleared}</h3>
            <p className="text-[11px] text-gray-400">prelims cleared</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5">↑ stage 1 done</p>
          </div>

          {/* Mains */}
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Mains</p>
            <h3 className="text-3xl font-bold text-gray-800 leading-none mb-1">{examMetrics.totalMainsCleared}</h3>
            <p className="text-[11px] text-gray-400">mains cleared</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5">↑ stage 2 done</p>
          </div>

          {/* Interviews */}
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Interviews</p>
            <h3 className="text-3xl font-bold text-gray-800 leading-none mb-1">{examMetrics.totalInterviewsAppeared}</h3>
            <p className="text-[11px] text-gray-400">interviews done</p>
            <p className="text-[11px] text-emerald-600 font-medium mt-1.5">↑ final stage</p>
          </div>

          {/* Total Spent */}
          <div className="p-4 hover:bg-gray-50 transition-colors">
            <p className="text-[10px] font-semibold tracking-widest text-gray-400 uppercase mb-2">Total Spent</p>
            <h3 className="text-3xl font-bold text-amber-600 leading-none mb-1">₹{examMetrics.totalAmountSpent}</h3>
            <p className="text-[11px] text-gray-400">exam fees paid</p>
            <p className="text-[11px] text-gray-400 mt-1.5">investment in future</p>
          </div>

        </div>
      </div>

      <Card>
        <CardHeader className="p-3 pb-2">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2">
            <CardTitle className="text-base font-semibold">Exam Applications</CardTitle>
            <Button
              size="sm"
              className="w-full md:w-auto text-xs h-8"
              onClick={() => setShowAddExamDialog(true)}
            >
              <FilePlus2 className="mr-2 h-3.5 w-3.5" />
              Add Exam
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-3 pt-0">
          <Tabs defaultValue="exams" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 h-8">
              <TabsTrigger value="exams" className="text-xs h-7">Current Applications</TabsTrigger>
              <TabsTrigger value="history" className="text-xs h-7">Exam History</TabsTrigger>
            </TabsList>

            <TabsContent value="exams" className="mt-2 text-sm">
              <div className="space-y-2">
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
                  <Card>
                    <CardContent className="p-6 text-center">
                      <FileText className="mx-auto h-10 w-10 text-gray-400 mb-3" />
                      <h3 className="text-base font-medium text-gray-900 mb-1">No Current Applications</h3>
                      <p className="text-xs text-gray-500 mb-3">You haven't added any exam applications yet.</p>
                      <Button size="sm" onClick={() => setShowAddExamDialog(true)}>
                        <FilePlus2 className="mr-2 h-3.5 w-3.5" />
                        Add Your First Exam
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history" className="mt-2">
              <ExamTableView exams={allExams} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Dialog open={showAddExamDialog} onOpenChange={setShowAddExamDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add New Exam</DialogTitle>
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
