import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar, Clock, CheckCheck, Edit, Trash2, MapPin, IndianRupee, Archive, CheckCircle2 } from 'lucide-react';
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
      case 'paid': return 'text-emerald-700 font-bold';
      case 'pending': return 'text-amber-700 font-bold';
      case 'free': return 'text-blue-700 font-bold';
      default: return 'text-slate-600 font-medium';
    }
  };

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Payment Complete';
      case 'pending': return 'Payment Pending';
      case 'free': return 'No Fee Required';
      default: return status;
    }
  };

  const getFinalStatusColor = (status: string) => {
    switch (status) {
      case 'selected': return 'text-emerald-700 bg-emerald-50 border-emerald-200/90';
      case 'not-selected': return 'text-rose-700 bg-rose-50 border-rose-200/90';
      case 'pending': return 'text-blue-700 bg-blue-50 border-blue-200/90';
      default: return 'text-slate-700 bg-slate-50 border-slate-200/90';
    }
  };

  const getFinalStatusDot = (status: string) => {
    switch (status) {
      case 'selected': return 'bg-emerald-500';
      case 'not-selected': return 'bg-rose-500';
      case 'pending': return 'bg-blue-500';
      default: return 'bg-slate-400';
    }
  };

  const getFinalStatusText = (status: string) => {
    switch (status) {
      case 'selected': return 'Selected / Cleared';
      case 'not-selected': return 'Not Selected';
      case 'pending': return 'In Progress';
      default: return status;
    }
  };

  return (
    <>
      <Card className="hover:shadow-xs transition-all duration-200 border border-slate-200/90 border-l-4 border-l-blue-600 rounded-2xl overflow-hidden bg-white">
        <CardContent className="p-4 sm:p-5 space-y-4">
          {/* Card Top Row Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
            <div className="flex-1 w-full space-y-1.5">
              <div className="flex items-center justify-between md:justify-start gap-2 flex-wrap">
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight">{exam.name}</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${getFinalStatusColor(exam.finalStatus)}`}>
                  <span className={`w-2 h-2 rounded-full ${getFinalStatusDot(exam.finalStatus)}`} />
                  <span>{getFinalStatusText(exam.finalStatus)}</span>
                </span>
              </div>

              {/* Sub-Metadata row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <div className="flex items-center bg-slate-50 border border-slate-200/80 px-2 py-0.5 rounded-lg text-slate-800 font-bold">
                  <IndianRupee className="mr-0.5 h-3 w-3 text-slate-500" />
                  <span>{exam.examFeeAmount}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>Exam Date: {new Date(exam.firstExamDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <MapPin className="h-3.5 w-3.5 text-slate-400" />
                  <span className="truncate max-w-[180px]">{exam.placeOfExam}</span>
                </div>
                <div className={`flex items-center gap-1 ${getPaymentStatusColor(exam.paymentStatus)}`}>
                  <CheckCheck className="h-3.5 w-3.5" />
                  <span>{getPaymentStatusText(exam.paymentStatus)}</span>
                </div>
              </div>

              {exam.notes && (
                <div className="text-xs text-amber-900 bg-amber-50/70 border border-amber-200/80 px-3 py-1.5 rounded-xl flex items-start gap-1.5 font-medium mt-1">
                  <span className="font-bold text-amber-700 shrink-0">Note:</span>
                  <span className="line-clamp-1">{exam.notes}</span>
                </div>
              )}
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center gap-1.5 w-full md:w-auto shrink-0 self-end md:self-center pt-2 md:pt-0 border-t md:border-t-0 border-slate-100">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowArchiveDialog(true)}
                className="h-8 text-xs font-bold hover:bg-slate-100 text-slate-700 border-slate-200/90 rounded-xl"
                title="Archive to Exam History"
              >
                <Archive className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                Archive
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowEditDialog(true)}
                className="h-8 text-xs font-bold hover:bg-blue-50 text-blue-700 border-blue-200 rounded-xl"
              >
                <Edit className="mr-1.5 h-3.5 w-3.5 text-blue-600" />
                Edit
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowDeleteDialog(true)}
                className="h-8 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 rounded-xl"
              >
                <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                Delete
              </Button>
            </div>
          </div>

          {/* Stepper Divider Container */}
          <div className="pt-3 border-t border-slate-100">
            <StageProgressBar
              stages={exam.stages}
              onStageUpdate={(stageIndex, updates) => onUpdateStage(exam.id, stageIndex, updates)}
              examName={exam.name}
            />
          </div>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">Edit Exam Details</DialogTitle>
          </DialogHeader>
          <ExamForm
            onSubmit={handleEdit}
            onCancel={() => setShowEditDialog(false)}
            initialData={exam}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">Delete Exam Tracker</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 font-medium">Are you sure you want to delete "{exam.name}"? This record will be permanently removed.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="rounded-xl text-xs font-bold">Cancel</Button>
              <Button variant="destructive" onClick={handleDelete} className="rounded-xl text-xs font-bold">Delete</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Archive Dialog */}
      <Dialog open={showArchiveDialog} onOpenChange={setShowArchiveDialog}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-black text-slate-900">Archive to Exam History</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-slate-600 font-medium">Move "{exam.name}" to Exam History archive? You can view completed applications in the History tab anytime.</p>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowArchiveDialog(false)} className="rounded-xl text-xs font-bold">Cancel</Button>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold gap-1.5" onClick={handleArchive}>
                <Archive className="h-4 w-4" />
                <span>Move to History</span>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
