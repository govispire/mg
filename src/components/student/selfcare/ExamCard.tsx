
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCheck, Edit, Trash2, MapPin, IndianRupee, Trophy } from 'lucide-react';
import { ExamApplication, ExamStage } from '@/hooks/useSelfCareExams';
import { ExamForm } from './ExamForm';
import { StageProgressBar } from './StageProgressBar';

interface ExamCardProps {
  exam: ExamApplication;
  onUpdate: (id: string, updates: Partial<ExamApplication>) => void;
  onDelete: (id: string) => void;
  onArchive: (id: string) => void;
  onUpdateStage: (examId: string, stageIndex: number, updates: Partial<ExamStage>) => void;
}

export const ExamCard: React.FC<ExamCardProps> = ({ exam, onUpdate, onDelete, onArchive, onUpdateStage }) => {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showArchiveDialog, setShowArchiveDialog] = useState(false);

  const handleEdit = (data: any) => {
    onUpdate(exam.id, data);
    setShowEditDialog(false);
  };

  const handleDelete = () => {
    onDelete(exam.id);
    setShowDeleteDialog(false);
  };

  const handleArchive = () => {
    onArchive(exam.id);
    setShowArchiveDialog(false);
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600';
      case 'pending': return 'text-orange-600';
      case 'free': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payment Complete';
      case 'pending': return 'Payment Pending';
      case 'free': return 'No Payment Required';
      default: return status;
    }
  };

  const getFinalStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'text-green-600 bg-green-50 border-green-200';
      case 'not-selected': return 'text-red-600 bg-red-50 border-red-200';
      case 'pending': return 'text-orange-600 bg-orange-50 border-orange-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getFinalStatusText = (status: string) => {
    switch (status) {
      case 'selected': return 'Selected';
      case 'not-selected': return 'Not Selected';
      case 'pending': return 'In Progress';
      default: return status;
    }
  };

  return (
    <>
      <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-blue-500 overflow-hidden">
        <CardContent className="p-3">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex-1 w-full">
              <div className="flex items-center justify-between md:justify-start gap-2 mb-1.5">
                <h3 className="font-bold text-base">{exam.name}</h3>
                <span className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider border ${getFinalStatusColor(exam.finalStatus)}`}>
                  {getFinalStatusText(exam.finalStatus)}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500 mb-2">
                <div className="flex items-center font-medium bg-gray-50 px-1.5 py-0.5 rounded text-gray-700">
                  <IndianRupee className="mr-1 h-3 w-3" />
                  <span>{exam.examFeeAmount}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-1 h-3 w-3" />
                  <span>{new Date(exam.firstExamDate).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-1 h-3 w-3" />
                  <span className="truncate max-w-[150px]">{exam.placeOfExam}</span>
                </div>
                <div className={`flex items-center ${getPaymentStatusColor(exam.paymentStatus)} font-medium`}>
                  <CheckCheck className="mr-1 h-3 w-3" />
                  <span>{getPaymentStatusText(exam.paymentStatus)}</span>
                </div>
              </div>

              {exam.notes && (
                <div className="text-xs text-gray-600 bg-yellow-50/50 border border-yellow-100 p-1.5 rounded mb-2 flex items-start gap-1">
                  <span className="font-semibold text-yellow-600 shrink-0">Note:</span>
                  <span className="line-clamp-1">{exam.notes}</span>
                </div>
              )}
            </div>

            <div className="flex gap-1.5 w-full md:w-auto shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchiveDialog(true)}
                className="flex-1 md:flex-none h-7 text-xs hover:bg-green-50 text-green-700 border-green-200"
              >
                <Trophy className="mr-1 h-3 w-3" />
                Achieve
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="flex-1 md:flex-none h-7 text-xs hover:bg-blue-50"
              >
                <Edit className="mr-1 h-3 w-3" />
                Edit
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="flex-1 md:flex-none h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border-red-100"
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
            </div>
          </div>

          <div className="mt-2 pt-2 border-t border-dashed">
            <StageProgressBar
              stages={exam.stages}
              onStageUpdate={(stageIndex, updates) => onUpdateStage(exam.id, stageIndex, updates)}
              examName={exam.name}
            />
          </div>
        </CardContent>
      </Card>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Exam</DialogTitle>
          </DialogHeader>
          <ExamForm
            onSubmit={handleEdit}
            onCancel={() => setShowEditDialog(false)}
            initialData={exam}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Exam</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Are you sure you want to delete "{exam.name}"? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move to Exam History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Move "{exam.name}" to Exam History? You've achieved this milestone!</p>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)}>Cancel</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleArchive}>
                <Trophy className="mr-2 h-4 w-4" />
                Move to History
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
