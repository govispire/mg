
import React from 'react';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';

interface SettingsTabProps {
  formData: any;
  handleInputChange: (field: string, value: string | number | boolean) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Test Duration (minutes)</label>
          <Input 
            type="number" 
            value={formData.duration} 
            onChange={(e) => handleInputChange('duration', Number(e.target.value))} 
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Total Marks</label>
          <Input 
            type="number" 
            value={formData.totalMarks} 
            disabled
          />
          <p className="text-xs text-gray-500">Sum of all section marks</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Passing Marks</label>
          <Input 
            type="number" 
            value={formData.passingMarks} 
            onChange={(e) => handleInputChange('passingMarks', Number(e.target.value))} 
          />
        </div>
        <div className="space-y-2 flex items-center">
          <div className="flex-1">
            <label className="text-sm font-medium mr-2">Negative Marking</label>
            <p className="text-xs text-gray-500">Enable negative marking for wrong answers</p>
          </div>
          <Switch 
            checked={formData.negativeMarking} 
            onCheckedChange={(checked) => handleInputChange('negativeMarking', checked)} 
          />
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
