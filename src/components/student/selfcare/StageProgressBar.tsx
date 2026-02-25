import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CheckCircle, Clock, X, Minus, Trophy, Target, Star, Lock } from 'lucide-react';
import { ExamStage } from '@/hooks/useSelfCareExams';
import { useStageEditability } from '@/hooks/useStageEditability';
import { toast } from '@/hooks/use-toast';
import { StageResultDialog } from './StageResultDialog';
import { useAuth } from '@/app/providers';
import { useLocalStorage } from '@/hooks/useLocalStorage';



interface StageProgressBarProps {
  stages: ExamStage[];
  onStageUpdate: (stageIndex: number, updates: Partial<ExamStage>) => void;
  examName?: string;
}

export const StageProgressBar: React.FC<StageProgressBarProps> = ({ stages, onStageUpdate, examName = "Exam" }) => {
  const [editingStage, setEditingStage] = useState<number | null>(null);
  const [stageData, setStageData] = useState<Partial<ExamStage>>({});
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [resultDialogData, setResultDialogData] = useState<{
    stageName: string;
    stageStatus: 'cleared' | 'not-cleared' | 'selected' | 'not-selected';
    isFinalStage: boolean;
    score?: string;
  } | null>(null);
  const { isStageEditable, getDisabledReason } = useStageEditability();

  // Get student profile data
  const { user } = useAuth();
  const [userProfile] = useLocalStorage<any>('userProfile', null);
  const studentName = user?.name || "Aspirant";
  const studentPhoto = userProfile?.avatar || user?.avatar;

  const handleStageClick = (index: number) => {
    if (!isStageEditable(stages, index)) {
      const reason = getDisabledReason(stages, index);
      toast({
        title: "Stage Not Editable",
        description: reason,
        variant: "destructive",
      });
      return;
    }

    setEditingStage(index);
    setStageData(stages[index]);
  };

  const handleStageUpdate = () => {
    if (editingStage !== null) {
      const updatedStatus = stageData.status;
      const stageName = stages[editingStage].name;
      const finalStage = isFinalStage(editingStage);

      // Save the stage update
      onStageUpdate(editingStage, stageData);

      // Show result dialog for cleared/not-cleared or selected/not-selected statuses
      if (
        updatedStatus === 'cleared' ||
        updatedStatus === 'not-cleared' ||
        updatedStatus === 'selected' ||
        updatedStatus === 'not-selected'
      ) {
        setResultDialogData({
          stageName,
          stageStatus: updatedStatus as 'cleared' | 'not-cleared' | 'selected' | 'not-selected',
          isFinalStage: finalStage,
          score: stageData.score
        });
        setShowResultDialog(true);
      }

      setEditingStage(null);
      setStageData({});
    }
  };

  const isFinalStage = (index: number) => {
    return index === stages.length - 1 || stages[index].name.toLowerCase().includes('final');
  };

  const getStageIcon = (status: string, stageName: string, index: number) => {
    const finalStage = isFinalStage(index);

    if (finalStage) {
      switch (status) {
        case 'selected':
          return <Trophy className="text-yellow-400 h-4 w-4 sm:h-5 sm:w-5" />;
        case 'not-selected':
          return <X className="text-white h-4 w-4 sm:h-5 sm:w-5" />;
        default:
          return <Target className="text-white h-4 w-4 sm:h-5 sm:w-5" />;
      }
    }

    switch (status) {
      case 'cleared':
        return <CheckCircle className="text-white h-4 w-4 sm:h-5 sm:w-5" />;
      case 'not-cleared':
        return <X className="text-white h-4 w-4 sm:h-5 sm:w-5" />;
      case 'n/a':
        return <Minus className="text-white h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Clock className="text-white h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getStageColor = (status: string, stageName: string, index: number) => {
    const finalStage = isFinalStage(index);
    const editable = isStageEditable(stages, index);

    const baseColor = (() => {
      if (finalStage) {
        switch (status) {
          case 'selected':
            return 'bg-gradient-to-r from-yellow-400 to-orange-500 shadow-lg ring-2 ring-yellow-300';
          case 'not-selected':
            return 'bg-red-500 shadow-md';
          default:
            return 'bg-gradient-to-r from-purple-500 to-indigo-500 shadow-md';
        }
      }

      switch (status) {
        case 'cleared':
          return 'bg-green-500 shadow-md ring-2 ring-green-300';
        case 'not-cleared':
          return 'bg-red-500 shadow-md';
        case 'n/a':
          return 'bg-gray-400 shadow-sm';
        default:
          return 'bg-blue-500 shadow-sm';
      }
    })();

    return editable ? baseColor : `${baseColor} opacity-50`;
  };

  const getStageStatusText = (status: string, index: number) => {
    const finalStage = isFinalStage(index);

    if (finalStage) {
      switch (status) {
        case 'selected': return 'Selected';
        case 'not-selected': return 'Not Selected';
        default: return 'Pending';
      }
    }

    switch (status) {
      case 'cleared': return 'Cleared';
      case 'not-cleared': return 'Not Cleared';
      case 'n/a': return 'N/A';
      default: return 'Pending';
    }
  };

  const getAvailableStatuses = (index: number) => {
    const finalStage = isFinalStage(index);

    if (finalStage) {
      return [
        { value: 'pending', label: 'Pending' },
        { value: 'selected', label: 'Selected' },
        { value: 'not-selected', label: 'Not Selected' }
      ];
    }

    return [
      { value: 'pending', label: 'Pending' },
      { value: 'cleared', label: 'Cleared' },
      { value: 'not-cleared', label: 'Not Cleared' },
      { value: 'n/a', label: 'N/A' }
    ];
  };

  const completedStages = stages.filter(stage =>
    stage.status === 'cleared' || stage.status === 'selected'
  ).length;
  const progressPercentage = stages.length > 0 ? (completedStages / stages.length) * 100 : 0;

  const stageWidth = stages.length > 0 ? 100 / stages.length : 100;

  // Identify the first pending stage as current
  const currentStageIndex = stages.findIndex(s => s.status === 'pending' || s.status === 'not-cleared' || s.status === 'not-selected');
  const activeStageIndex = currentStageIndex === -1 ? stages.length - 1 : currentStageIndex;

  const StageItem = ({ stage, index }: { stage: ExamStage; index: number }) => {
    const editable = isStageEditable(stages, index);
    const reason = !editable ? getDisabledReason(stages, index) : '';
    const isActive = index === activeStageIndex && stage.status !== 'cleared' && stage.status !== 'selected';

    const stageElement = (
      <div
        className={`flex flex-col items-center relative z-10 transition-all duration-200 ${editable
          ? 'cursor-pointer hover:opacity-80 hover:scale-105'
          : 'cursor-not-allowed'
          }`}
        style={{ width: `${stageWidth}%` }}
        onClick={() => handleStageClick(index)}
      >
        <div className={`rounded-full h-8 w-8 sm:h-10 sm:w-10 md:h-12 md:w-12 ${getStageColor(stage.status, stage.name, index)} flex items-center justify-center transition-all duration-200 border-2 border-white shadow-md relative ${isActive ? 'ring-4 ring-blue-500/20 shadow-lg scale-110' : ''}`}>
          {getStageIcon(stage.status, stage.name, index)}
          {isActive && (
            <span className="absolute flex h-full w-full rounded-full opacity-75 animate-ping bg-blue-400/30"></span>
          )}
          {!editable && (
            <div className="absolute -top-1 -right-1 bg-gray-600 rounded-full p-0.5">
              <Lock className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
            </div>
          )}
        </div>
        <p className={`text-xs sm:text-sm mt-1 text-center font-medium leading-tight px-1 ${isActive ? 'text-blue-700 font-bold' : ''}`} title={stage.name}>
          {stage.name.length > 12 ? `${stage.name.substring(0, 12)}...` : stage.name}
        </p>
        <p className={`text-[10px] sm:text-xs text-center font-medium ${stage.status === 'cleared' || stage.status === 'selected' ? 'text-green-600' :
          stage.status === 'not-cleared' || stage.status === 'not-selected' ? 'text-red-600' :
            isActive ? 'text-blue-600 font-semibold' : 'text-gray-500'
          } ${!editable ? 'opacity-60' : ''}`}>
          {isActive && stage.status === 'pending' ? 'Current Stage' : getStageStatusText(stage.status, index)}
        </p>
        {stage.score && (
          <p className={`text-[10px] sm:text-xs text-blue-600 text-center font-medium ${!editable ? 'opacity-60' : ''}`}>
            {stage.score}
          </p>
        )}
        {isFinalStage(index) && (
          <div className="flex items-center gap-1 mt-1">
            <Star className={`h-2 w-2 sm:h-3 sm:w-3 text-yellow-500 ${!editable ? 'opacity-60' : ''}`} />
            <span className={`text-[8px] sm:text-[10px] text-yellow-600 font-medium ${!editable ? 'opacity-60' : ''}`}>Final</span>
          </div>
        )}
      </div>
    );

    if (!editable && reason) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              {stageElement}
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">{reason}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return stageElement;
  };

  return (
    <>
      <div>
        <div className="flex justify-between items-center mb-1">
          <h4 className="font-medium text-sm sm:text-base">Exam Stages</h4>
          <div className="text-xs sm:text-sm text-gray-500">
            {completedStages}/{stages.length} completed ({Math.round(progressPercentage)}%)
          </div>
        </div>

        <div className="relative pt-2 pb-2">
          <div className="w-full flex justify-between">
            {stages.map((stage, index) => (
              <StageItem key={index} stage={stage} index={index} />
            ))}
          </div>

          {/* Progress line */}
          <div className="absolute left-0 top-6 sm:top-7 md:top-8 h-1 bg-gray-200 w-full z-0 rounded-full"></div>
          <div
            className="absolute left-0 top-6 sm:top-7 md:top-8 h-1 bg-gradient-to-r from-green-400 to-blue-500 z-0 transition-all duration-500 rounded-full"
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>

        {/* Auto-progression indicator */}
        <div className="mt-1 text-[10px] sm:text-xs text-gray-500 bg-muted/50 p-1.5 rounded flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-1">
            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
            <span>Current Stage</span>
          </div>
          <div className="flex items-center gap-1">
            <Trophy className="h-3 w-3 text-yellow-500" />
            <span>Final Selection</span>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <Lock className="h-3 w-3 text-gray-400" />
            <span>Subsequent stages locked</span>
          </div>
        </div>
      </div>

      <Dialog open={editingStage !== null} onOpenChange={() => setEditingStage(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Update Stage: {editingStage !== null ? stages[editingStage]?.name : ''}
              {editingStage !== null && isFinalStage(editingStage) && (
                <Trophy className="h-5 w-5 text-yellow-500" />
              )}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {stages[editingStage || 0]?.name} Status
                {editingStage !== null && isFinalStage(editingStage) && (
                  <span className="text-xs text-yellow-600 ml-2">(Final Stage)</span>
                )}
              </label>
              <Select
                value={stageData.status || 'pending'}
                onValueChange={(value) => setStageData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {getAvailableStatuses(editingStage || 0).map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {((stageData.status === 'cleared' || stageData.status === 'not-cleared') ||
              (stageData.status === 'selected' || stageData.status === 'not-selected')) && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">Score</label>
                  <Input
                    placeholder="e.g. 78/100 or 142/200"
                    value={stageData.score || ''}
                    onChange={(e) => setStageData(prev => ({ ...prev, score: e.target.value }))}
                  />
                </div>
              )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={stageData.date || ''}
                onChange={(e) => setStageData(prev => ({ ...prev, date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <Textarea
                placeholder="Add any notes about this stage..."
                value={stageData.notes || ''}
                onChange={(e) => setStageData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setEditingStage(null)}>Cancel</Button>
              <Button onClick={handleStageUpdate}>Update Stage</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Result Dialog - Congratulations or Motivation */}
      {resultDialogData && (
        <StageResultDialog
          open={showResultDialog}
          onClose={() => {
            setShowResultDialog(false);
            setResultDialogData(null);
          }}
          examName={examName}
          stageName={resultDialogData.stageName}
          stageStatus={resultDialogData.stageStatus}
          isFinalStage={resultDialogData.isFinalStage}
          score={resultDialogData.score}
          studentName={studentName}
          studentPhoto={studentPhoto}
        />
      )}
    </>
  );
};
