
import React from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { examCategories, testTypes } from '@/data/examData';

interface BasicInfoTabProps {
  formData: any;
  handleInputChange: (field: string, value: string | number | boolean) => void;
}

const BasicInfoTab: React.FC<BasicInfoTabProps> = ({ formData, handleInputChange }) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="test-name" className="text-sm font-medium">Test Name*</label>
          <Input 
            id="test-name" 
            value={formData.name} 
            onChange={(e) => handleInputChange('name', e.target.value)} 
            placeholder="e.g., IBPS PO Prelims Mock Test 1" 
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="test-category" className="text-sm font-medium">Category*</label>
          <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {examCategories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="test-type" className="text-sm font-medium">Test Type*</label>
          <Select value={formData.testType} onValueChange={(value) => handleInputChange('testType', value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select test type" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              {testTypes.map((type) => (
                <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          {/* Placeholder for additional field */}
        </div>
      </div>
      <div className="space-y-2">
        <label htmlFor="test-description" className="text-sm font-medium">Description</label>
        <Textarea 
          id="test-description" 
          value={formData.description} 
          onChange={(e) => handleInputChange('description', e.target.value)} 
          placeholder="Brief description about the test" 
        />
      </div>
      <div className="space-y-2">
        <label htmlFor="test-instructions" className="text-sm font-medium">Instructions</label>
        <Textarea 
          id="test-instructions" 
          value={formData.instructions} 
          onChange={(e) => handleInputChange('instructions', e.target.value)} 
          placeholder="Instructions for test takers" 
          className="h-32" 
        />
      </div>
    </div>
  );
};

export default BasicInfoTab;
