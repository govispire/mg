
import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SettingsTabProps {
  marks: number;
  setMarks: (value: number) => void;
  negativeMarks: number;
  setNegativeMarks: (value: number) => void;
  difficulty: string;
  setDifficulty: (value: string) => void;
  isMultiCorrect: boolean;
  setIsMultiCorrect: (value: boolean) => void;
  shuffleOptions: boolean;
  setShuffleOptions: (value: boolean) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  marks,
  setMarks,
  negativeMarks,
  setNegativeMarks,
  difficulty,
  setDifficulty,
  isMultiCorrect,
  setIsMultiCorrect,
  shuffleOptions,
  setShuffleOptions
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Marks</label>
          <Input
            type="number"
            min="0"
            step="0.5"
            value={marks}
            onChange={(e) => setMarks(Number(e.target.value))}
          />
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Negative Marking</label>
          <Input
            type="number"
            min="0"
            step="0.25"
            value={negativeMarks}
            onChange={(e) => setNegativeMarks(Number(e.target.value))}
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Difficulty Level</label>
          <Select 
            value={difficulty} 
            onValueChange={setDifficulty}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Tags (Optional)</label>
          <Input
            placeholder="Enter comma separated tags"
          />
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Multi-Correct Question</label>
          <Switch
            checked={isMultiCorrect}
            onCheckedChange={setIsMultiCorrect}
          />
        </div>
        
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Shuffle Options</label>
          <Switch
            checked={shuffleOptions}
            onCheckedChange={setShuffleOptions}
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
