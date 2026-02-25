
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus } from 'lucide-react';

interface SectionsTabProps {
  formData: any;
  handleSectionChange: (index: number, field: string, value: string | number) => void;
  handleRemoveSection: (index: number) => void;
  handleAddSection: () => void;
  handleAddQuestion: (index: number) => void;
  countSectionQuestions: (sectionName: string) => number;
}

const SectionsTab: React.FC<SectionsTabProps> = ({
  formData,
  handleSectionChange,
  handleRemoveSection,
  handleAddSection,
  handleAddQuestion,
  countSectionQuestions
}) => {
  return (
    <div className="space-y-6">
      {formData.sections.map((section: any, index: number) => (
        <div key={index} className="border rounded-md p-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Section {index + 1}</h3>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => handleRemoveSection(index)}
              disabled={formData.sections.length === 1}
            >
              Remove
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Section Name</label>
              <Input 
                value={section.name} 
                onChange={(e) => handleSectionChange(index, 'name', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">No. of Questions</label>
              <Input 
                type="number" 
                value={section.questions} 
                onChange={(e) => handleSectionChange(index, 'questions', e.target.value)} 
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Total Marks</label>
              <Input 
                type="number" 
                value={section.marks} 
                onChange={(e) => handleSectionChange(index, 'marks', e.target.value)} 
              />
            </div>
          </div>
          <div className="mt-4">
            <Button 
              variant="outline"
              onClick={() => handleAddQuestion(index)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Questions ({countSectionQuestions(section.name)}/{section.questions})
            </Button>
          </div>
        </div>
      ))}
      <Button onClick={handleAddSection}>
        <Plus className="h-4 w-4 mr-2" />
        Add Section
      </Button>
    </div>
  );
};

export default SectionsTab;
