
import { ExamStage } from '@/hooks/useSelfCareExams';

export const useStageEditability = () => {
  const isStageEditable = (stages: ExamStage[], stageIndex: number): boolean => {
    // Check if this is the final stage
    const isFinalStage = stageIndex === stages.length - 1 || 
                        stages[stageIndex].name.toLowerCase().includes('final');
    
    // For final stage, all previous stages must be cleared
    if (isFinalStage) {
      for (let i = 0; i < stageIndex; i++) {
        if (stages[i].status !== 'cleared') {
          return false;
        }
      }
      return true;
    }
    
    // For non-final stages, check if all previous stages are pending or cleared
    for (let i = 0; i < stageIndex; i++) {
      const prevStage = stages[i];
      if (prevStage.status === 'not-cleared' || prevStage.status === 'n/a') {
        return false;
      }
    }
    
    // Current stage must not be failed or n/a to be editable
    const currentStage = stages[stageIndex];
    return currentStage.status !== 'not-cleared' && currentStage.status !== 'n/a';
  };

  const getDisabledReason = (stages: ExamStage[], stageIndex: number): string => {
    const isFinalStage = stageIndex === stages.length - 1 || 
                        stages[stageIndex].name.toLowerCase().includes('final');
    
    if (isFinalStage) {
      const failedPrevious = stages.slice(0, stageIndex).find(s => s.status !== 'cleared');
      if (failedPrevious) {
        return `Complete all previous stages to edit final stage`;
      }
    }
    
    const failedPrevious = stages.slice(0, stageIndex).find(s => 
      s.status === 'not-cleared' || s.status === 'n/a'
    );
    
    if (failedPrevious) {
      return `Previous stage "${failedPrevious.name}" failed - subsequent stages are disabled`;
    }
    
    const currentStage = stages[stageIndex];
    if (currentStage.status === 'not-cleared') {
      return 'This stage has failed and cannot be edited';
    }
    if (currentStage.status === 'n/a') {
      return 'This stage is marked as N/A due to previous stage failure';
    }
    
    return 'Stage cannot be edited';
  };

  return { isStageEditable, getDisabledReason };
};
