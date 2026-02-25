
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
    <div className="space-y-3 p-2">
      <div className="px-1">
        <h1 className="text-xl font-bold">Exam Tracker</h1>
        <p className="text-sm text-muted-foreground">Track your real exam applications and progress</p>
      </div>

      {/* Compact Progress Cards - Single Line */}
      <div className="grid grid-cols-3 lg:grid-cols-6 gap-2">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 cursor-pointer hover:shadow-md transition-shadow" onClick={() => setActiveTab('exams')}>
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-blue-100 rounded-lg shrink-0">
                <FileText className="h-4 w-4 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-blue-600 truncate">Total Exams</p>
                <h3 className="text-lg font-bold text-blue-700 leading-none">{examMetrics.totalApplied}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-indigo-100 rounded-lg shrink-0">
                <CheckSquare className="h-4 w-4 text-indigo-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-indigo-600 truncate">Exams Cleared</p>
                <h3 className="text-lg font-bold text-indigo-700 leading-none">{examMetrics.totalExamsCleared}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-green-100 rounded-lg shrink-0">
                <CheckSquare className="h-4 w-4 text-green-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-green-600 truncate">Prelims</p>
                <h3 className="text-lg font-bold text-green-700 leading-none">{examMetrics.totalPrelimsCleared}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-purple-100 rounded-lg shrink-0">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-purple-600 truncate">Mains</p>
                <h3 className="text-lg font-bold text-purple-700 leading-none">{examMetrics.totalMainsCleared}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-orange-100 rounded-lg shrink-0">
                <User className="h-4 w-4 text-orange-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-orange-600 truncate">Interviews</p>
                <h3 className="text-lg font-bold text-orange-700 leading-none">{examMetrics.totalInterviewsAppeared}</h3>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-pink-100 border-pink-200 cursor-pointer hover:shadow-md transition-shadow">
          <CardContent className="p-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-pink-100 rounded-lg shrink-0">
                <IndianRupee className="h-4 w-4 text-pink-600" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-pink-600 truncate">Total Spent</p>
                <h3 className="text-lg font-bold text-pink-700 leading-none">₹{examMetrics.totalAmountSpent}</h3>
              </div>
            </div>
          </CardContent>
        </Card>
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
