
import React from 'react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';

interface TaskFormControlsProps {
  onClose: () => void;
  onAddTask: () => void;
  date?: Date;
}

const TaskFormControls: React.FC<TaskFormControlsProps> = ({ 
  onClose, 
  onAddTask, 
  date 
}) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Date*</label>
        <div className="bg-gray-50 border rounded-md p-2">
          <div className="text-center">
            {date ? format(date, 'PPPP') : 'Select a date'}
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 mt-6">
        <Button variant="outline" onClick={onClose} className="w-24">Cancel</Button>
        <Button onClick={onAddTask} className="w-24 bg-purple-600 hover:bg-purple-700">Add Task</Button>
      </div>
    </div>
  );
};

export default TaskFormControls;
