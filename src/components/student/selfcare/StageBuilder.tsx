
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Trash2, GripVertical, Lock } from 'lucide-react';
import { ExamStage } from '@/hooks/useSelfCareExams';

interface StageBuilderProps {
  stages: ExamStage[];
  onStagesChange: (stages: ExamStage[]) => void;
  disabled?: boolean;
}

const stageTemplates = {
  banking: [
    { name: 'Prelims', status: 'pending' as const },
    { name: 'Mains', status: 'pending' as const },
    { name: 'Interview', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ],
  ssc: [
    { name: 'Tier I', status: 'pending' as const },
    { name: 'Tier II', status: 'pending' as const },
    { name: 'Tier III', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ],
  railway: [
    { name: 'CBT 1', status: 'pending' as const },
    { name: 'CBT 2', status: 'pending' as const },
    { name: 'Medical', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ],
  upsc: [
    { name: 'Prelims', status: 'pending' as const },
    { name: 'Mains', status: 'pending' as const },
    { name: 'Interview', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ],
  'state-psc': [
    { name: 'Prelims', status: 'pending' as const },
    { name: 'Mains', status: 'pending' as const },
    { name: 'Interview', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ],
  judicial: [
    { name: 'Prelims', status: 'pending' as const },
    { name: 'Mains', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ],
  defence: [
    { name: 'Written Exam', status: 'pending' as const },
    { name: 'Physical Test', status: 'pending' as const },
    { name: 'Interview', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ],
  custom: [
    { name: 'Stage 1', status: 'pending' as const },
    { name: 'Final Selection', status: 'pending' as const }
  ]
};

export const StageBuilder: React.FC<StageBuilderProps> = ({ stages, onStagesChange, disabled = false }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');

  const addStage = () => {
    if (stages.length >= 5) return;
    
    const newStages = [...stages];
    // Insert before final stage if it exists, otherwise add at end
    const finalIndex = newStages.findIndex(stage => stage.name.toLowerCase().includes('final'));
    const insertIndex = finalIndex > -1 ? finalIndex : newStages.length;
    
    newStages.splice(insertIndex, 0, {
      name: `Stage ${insertIndex + 1}`,
      status: 'pending'
    });
    
    onStagesChange(newStages);
  };

  const removeStage = (index: number) => {
    // Prevent deletion if only one stage or if it's the final stage
    if (stages.length <= 1 || isFinalStage(index)) return;
    const newStages = stages.filter((_, i) => i !== index);
    onStagesChange(newStages);
  };

  const updateStageName = (index: number, name: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], name };
    onStagesChange(newStages);
  };

  const updateStageDate = (index: number, date: string) => {
    const newStages = [...stages];
    newStages[index] = { ...newStages[index], date };
    onStagesChange(newStages);
  };

  const applyTemplate = (templateKey: string) => {
    if (templateKey && stageTemplates[templateKey as keyof typeof stageTemplates]) {
      onStagesChange([...stageTemplates[templateKey as keyof typeof stageTemplates]]);
      setSelectedTemplate('');
    }
  };

  const isFinalStage = (index: number) => {
    return index === stages.length - 1 || stages[index].name.toLowerCase().includes('final');
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <Select value={selectedTemplate} onValueChange={setSelectedTemplate} disabled={disabled}>
          <SelectTrigger className="w-full sm:w-auto">
            <SelectValue placeholder="Quick templates" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="banking">Banking (4 stages)</SelectItem>
            <SelectItem value="ssc">SSC (4 stages)</SelectItem>
            <SelectItem value="railway">Railway (4 stages)</SelectItem>
            <SelectItem value="upsc">UPSC (4 stages)</SelectItem>
            <SelectItem value="state-psc">State PSC (4 stages)</SelectItem>
            <SelectItem value="judicial">Judicial (3 stages)</SelectItem>
            <SelectItem value="defence">Defence (4 stages)</SelectItem>
            <SelectItem value="custom">Custom (2 stages)</SelectItem>
          </SelectContent>
        </Select>
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => applyTemplate(selectedTemplate)}
          disabled={!selectedTemplate || disabled}
          className="w-full sm:w-auto"
        >
          Apply Template
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Exam Stages ({stages.length}/5)</label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addStage}
            disabled={stages.length >= 5 || disabled}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Stage
          </Button>
        </div>

        {stages.map((stage, index) => (
          <Card key={index} className={isFinalStage(index) ? 'border-yellow-200 bg-yellow-50' : ''}>
            <CardContent className="p-3">
              <div className="flex items-center gap-2">
                <GripVertical className="h-4 w-4 text-gray-400" />
                <div className="flex-1 space-y-2">
                  <Input
                    value={stage.name}
                    onChange={(e) => updateStageName(index, e.target.value)}
                    placeholder={`Stage ${index + 1} name`}
                    disabled={disabled}
                    className="text-sm"
                  />
                  <Input
                    type="date"
                    value={stage.date || ''}
                    onChange={(e) => updateStageDate(index, e.target.value)}
                    disabled={disabled}
                    className="text-sm"
                    placeholder="Select date"
                  />
                </div>
                {isFinalStage(index) && (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-yellow-600 font-medium bg-yellow-100 px-2 py-1 rounded">
                      Final Stage
                    </span>
                    <Lock className="h-4 w-4 text-yellow-600" />
                  </div>
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => removeStage(index)}
                  disabled={stages.length <= 1 || isFinalStage(index) || disabled}
                  className="text-red-600 hover:text-red-700"
                  title={isFinalStage(index) ? 'Cannot delete final stage' : 'Delete stage'}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
        <strong>Tips:</strong> Final stage cannot be deleted and only allows "Selected/Not Selected" status. When you clear a stage, the next stage automatically becomes "Pending".
      </div>
    </div>
  );
};
