
import { useState } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { toast } from '@/hooks/use-toast';

export interface ExamStage {
  name: string;
  status: 'pending' | 'cleared' | 'not-cleared' | 'n/a' | 'selected' | 'not-selected';
  score?: string;
  notes?: string;
  date?: string;
}

export interface ExamApplication {
  id: string;
  name: string;
  category: string;
  examFeeAmount: string;
  firstExamDate: string;
  paymentStatus: 'paid' | 'pending' | 'free';
  placeOfExam: string;
  notes: string;
  stages: ExamStage[];
  finalStatus: 'selected' | 'not-selected' | 'pending';
  isArchived: boolean;
  createdAt: string;
}

export const useSelfCareExams = () => {
  const [exams, setExams] = useLocalStorage<ExamApplication[]>('selfcare-exams', [
    {
      id: '1',
      name: 'IBPS PO 2025',
      category: 'banking',
      examFeeAmount: '850',
      firstExamDate: '2025-05-25',
      paymentStatus: 'paid',
      placeOfExam: 'Mumbai',
      notes: '',
      stages: [
        { name: 'Prelims', status: 'pending', date: '2025-05-25' },
        { name: 'Mains', status: 'pending' },
        { name: 'Interview', status: 'pending' },
        { name: 'Final Selection', status: 'pending' }
      ],
      finalStatus: 'pending',
      isArchived: false,
      createdAt: '2025-04-15'
    },
    {
      id: '2',
      name: 'SSC CGL 2025',
      category: 'ssc',
      examFeeAmount: '200',
      firstExamDate: '2025-06-10',
      paymentStatus: 'paid',
      placeOfExam: 'Delhi',
      notes: '',
      stages: [
        { name: 'Tier I', status: 'pending', date: '2025-06-10' },
        { name: 'Tier II', status: 'pending' },
        { name: 'Final Selection', status: 'pending' }
      ],
      finalStatus: 'pending',
      isArchived: false,
      createdAt: '2025-03-10'
    }
  ]);

  const [archivedExams] = useLocalStorage<ExamApplication[]>('selfcare-archived-exams', [
    {
      id: '3',
      name: 'IBPS Clerk 2024',
      category: 'banking',
      examFeeAmount: '750',
      firstExamDate: '2024-11-20',
      paymentStatus: 'paid',
      placeOfExam: 'Bangalore',
      notes: 'Successfully cleared',
      stages: [
        { name: 'Prelims', status: 'cleared', score: '78/100', date: '2024-11-20', notes: 'Good performance' },
        { name: 'Mains', status: 'cleared', score: '142/200', date: '2024-12-15', notes: 'Excellent score' },
        { name: 'Interview', status: 'cleared', score: '85/100', date: '2025-01-10', notes: 'Confident performance' },
        { name: 'Final Selection', status: 'cleared', date: '2025-01-20', notes: 'Selected for the position' }
      ],
      finalStatus: 'selected',
      isArchived: true,
      createdAt: '2024-09-15'
    },
    {
      id: '4',
      name: 'RRB NTPC 2024',
      category: 'railway',
      examFeeAmount: '500',
      firstExamDate: '2024-08-15',
      paymentStatus: 'paid',
      placeOfExam: 'Chennai',
      notes: 'Failed in CBT 2',
      stages: [
        { name: 'CBT 1', status: 'cleared', score: '82/100', date: '2024-08-15', notes: 'Good start' },
        { name: 'CBT 2', status: 'not-cleared', score: '114/160', date: '2024-09-20', notes: 'Need improvement in technical section' },
        { name: 'Medical', status: 'n/a' },
        { name: 'Final Selection', status: 'not-cleared' }
      ],
      finalStatus: 'not-selected',
      isArchived: true,
      createdAt: '2024-06-05'
    }
  ]);

  const addExam = (examData: Omit<ExamApplication, 'id' | 'finalStatus' | 'isArchived' | 'createdAt'>) => {
    const newExam: ExamApplication = {
      ...examData,
      id: Date.now().toString(),
      finalStatus: 'pending',
      isArchived: false,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setExams(prev => [...prev, newExam]);
    toast({
      title: "Exam Added",
      description: `${examData.name} has been added to your applications.`,
    });
  };

  const updateExam = (id: string, updates: Partial<ExamApplication>) => {
    setExams(prev => prev.map(exam =>
      exam.id === id ? { ...exam, ...updates } : exam
    ));
    toast({
      title: "Exam Updated",
      description: "Exam details have been updated successfully.",
    });
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(exam => exam.id !== id));
    toast({
      title: "Exam Deleted",
      description: "Exam has been removed from your applications.",
    });
  };

  const archiveExam = (id: string) => {
    setExams(prev => prev.map(exam =>
      exam.id === id ? { ...exam, isArchived: true } : exam
    ));
    toast({
      title: "Exam Archived",
      description: "Exam has been moved to history.",
    });
  };

  const isFinalStage = (stages: ExamStage[], stageIndex: number) => {
    return stageIndex === stages.length - 1 || stages[stageIndex].name.toLowerCase().includes('final');
  };

  const updateStage = (examId: string, stageIndex: number, updates: Partial<ExamStage>) => {
    setExams(prev => prev.map(exam => {
      if (exam.id === examId) {
        const newStages = [...exam.stages];
        newStages[stageIndex] = { ...newStages[stageIndex], ...updates };

        // Enhanced Auto-progression logic with proper N/A handling
        if (updates.status === 'cleared' && !isFinalStage(newStages, stageIndex)) {
          // Auto-enable next stage if current is cleared (but not for final stage)
          if (stageIndex < newStages.length - 1) {
            newStages[stageIndex + 1] = { ...newStages[stageIndex + 1], status: 'pending' };
          }
        }

        // If a stage is failed or marked as N/A, set all subsequent stages to N/A and final to not-selected
        if (updates.status === 'not-cleared' || updates.status === 'n/a') {
          for (let i = stageIndex + 1; i < newStages.length; i++) {
            if (!isFinalStage(newStages, i)) {
              // Set subsequent non-final stages to N/A
              newStages[i] = {
                ...newStages[i],
                status: 'n/a',
                score: undefined,
                notes: undefined
              };
            } else {
              // For final stage, mark as not-selected if any previous stage failed
              newStages[i] = {
                ...newStages[i],
                status: 'not-selected',
                score: undefined,
                notes: undefined
              };
            }
          }
        }

        // Auto-update final status based on stages
        let finalStatus: 'selected' | 'not-selected' | 'pending' = 'pending';

        // Check if any non-final stage failed
        const hasFailedStage = newStages.some((stage, idx) =>
          !isFinalStage(newStages, idx) && (stage.status === 'not-cleared' || stage.status === 'n/a')
        );

        // Check final stage status
        const finalStageIndex = newStages.length - 1;
        const finalStage = newStages[finalStageIndex];

        if (hasFailedStage) {
          finalStatus = 'not-selected';
          // Auto-update final stage to not-selected if any previous stage failed
          if (isFinalStage(newStages, finalStageIndex) && finalStage.status !== 'not-selected') {
            newStages[finalStageIndex] = { ...finalStage, status: 'not-selected' };
          }
        } else if (finalStage.status === 'selected') {
          finalStatus = 'selected';
        } else if (finalStage.status === 'not-selected') {
          finalStatus = 'not-selected';
        }

        return { ...exam, stages: newStages, finalStatus };
      }
      return exam;
    }));

    toast({
      title: "Stage Updated",
      description: "Exam stage has been updated successfully.",
    });
  };

  const getMetrics = () => {
    const allExams = [...exams, ...archivedExams];

    return {
      totalApplied: allExams.length,
      totalExamsCleared: allExams.filter(exam => exam.finalStatus === 'selected').length,
      totalPrelimsCleared: allExams.filter(exam =>
        exam.stages.some(stage => stage.name.toLowerCase().includes('prelim') && stage.status === 'cleared')
      ).length,
      totalMainsCleared: allExams.filter(exam =>
        exam.stages.some(stage => stage.name.toLowerCase().includes('main') && stage.status === 'cleared')
      ).length,
      totalInterviewsAppeared: allExams.filter(exam =>
        exam.stages.some(stage => stage.name.toLowerCase().includes('interview') && (stage.status === 'cleared' || stage.status === 'not-cleared'))
      ).length,
      totalAmountSpent: allExams
        .reduce((sum, exam) => sum + parseFloat(exam.examFeeAmount || '0'), 0),
    };
  };

  return {
    exams: exams.filter(exam => !exam.isArchived),
    archivedExams,
    addExam,
    updateExam,
    deleteExam,
    archiveExam,
    updateStage,
    getMetrics
  };
};
