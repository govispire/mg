import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ExamApplication, ExamStage } from '@/hooks/useSelfCareExams';
import { StageBuilder } from './StageBuilder';

interface ExamFormProps {
  onSubmit: (data: Omit<ExamApplication, 'id' | 'finalStatus' | 'isArchived' | 'createdAt'>) => void;
  onCancel: () => void;
  initialData?: Partial<ExamApplication>;
  isEdit?: boolean;
}

export const ExamForm: React.FC<ExamFormProps> = ({ onSubmit, onCancel, initialData, isEdit = false }) => {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    category: initialData?.category || '',
    examFeeAmount: initialData?.examFeeAmount || '',
    firstExamDate: initialData?.firstExamDate || '',
    paymentStatus: initialData?.paymentStatus || 'pending',
    placeOfExam: initialData?.placeOfExam || '',
    notes: initialData?.notes || ''
  });

  const [stages, setStages] = useState<ExamStage[]>(
    initialData?.stages || [
      { name: 'Stage 1', status: 'pending' },
      { name: 'Final Selection', status: 'pending' }
    ]
  );

  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-sync first exam date with first stage date
  useEffect(() => {
    if (stages.length > 0 && stages[0].date && stages[0].date !== formData.firstExamDate) {
      setFormData(prev => ({ ...prev, firstExamDate: stages[0].date || '' }));
    }
  }, [stages]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Exam name is required';
    if (!formData.category) newErrors.category = 'Category is required';
    if (!formData.examFeeAmount.trim()) newErrors.examFeeAmount = 'Exam fee amount is required';
    if (!formData.firstExamDate) newErrors.firstExamDate = 'First exam date is required';
    if (!formData.paymentStatus) newErrors.paymentStatus = 'Payment status is required';
    if (!formData.placeOfExam.trim()) newErrors.placeOfExam = 'Place of exam is required';
    
    // Validate fee amount is a number
    if (formData.examFeeAmount && isNaN(Number(formData.examFeeAmount))) {
      newErrors.examFeeAmount = 'Please enter a valid amount';
    }

    // Validate stages
    if (stages.length === 0) {
      newErrors.stages = 'At least one stage is required';
    } else if (stages.some(stage => !stage.name.trim())) {
      newErrors.stages = 'All stages must have names';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, stages } as any);
      if (!isEdit) {
        setFormData({
          name: '',
          category: '',
          examFeeAmount: '',
          firstExamDate: '',
          paymentStatus: 'pending',
          placeOfExam: '',
          notes: ''
        });
        setStages([
          { name: 'Stage 1', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ]);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }

    // Auto-sync first exam date to first stage
    if (field === 'firstExamDate' && stages.length > 0) {
      const updatedStages = [...stages];
      updatedStages[0] = { ...updatedStages[0], date: value };
      setStages(updatedStages);
    }
  };

  const handleCategoryChange = (category: string) => {
    handleInputChange('category', category);
    
    // Auto-update stages based on category if not editing
    if (!isEdit) {
      const categoryStages: Record<string, ExamStage[]> = {
        'banking': [
          { name: 'Prelims', status: 'pending' },
          { name: 'Mains', status: 'pending' },
          { name: 'Interview', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ],
        'ssc': [
          { name: 'Tier I', status: 'pending' },
          { name: 'Tier II', status: 'pending' },
          { name: 'Tier III', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ],
        'railway': [
          { name: 'CBT 1', status: 'pending' },
          { name: 'CBT 2', status: 'pending' },
          { name: 'Medical', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ],
        'upsc': [
          { name: 'Prelims', status: 'pending' },
          { name: 'Mains', status: 'pending' },
          { name: 'Interview', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ],
        'state-psc': [
          { name: 'Prelims', status: 'pending' },
          { name: 'Mains', status: 'pending' },
          { name: 'Interview', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ],
        'judicial': [
          { name: 'Prelims', status: 'pending' },
          { name: 'Mains', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ],
        'defence': [
          { name: 'Written Exam', status: 'pending' },
          { name: 'Physical Test', status: 'pending' },
          { name: 'Interview', status: 'pending' },
          { name: 'Final Selection', status: 'pending' }
        ]
      };

      if (categoryStages[category]) {
        setStages(categoryStages[category]);
      }
    }
  };

  const handleStagesChange = (newStages: ExamStage[]) => {
    setStages(newStages);
    
    // Auto-sync first exam date with first stage date
    if (newStages.length > 0 && newStages[0].date) {
      setFormData(prev => ({ ...prev, firstExamDate: newStages[0].date || '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-h-[80vh] overflow-y-auto">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Basic Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Name *</label>
            <Input 
              placeholder="E.g. IBPS PO 2025" 
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-xs">{errors.name}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Category *</label>
            <Select value={formData.category} onValueChange={handleCategoryChange}>
              <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="banking">Banking & Insurance</SelectItem>
                <SelectItem value="ssc">SSC</SelectItem>
                <SelectItem value="railway">Railway</SelectItem>
                <SelectItem value="upsc">UPSC</SelectItem>
                <SelectItem value="state-psc">State PSC</SelectItem>
                <SelectItem value="judicial">Judicial Services</SelectItem>
                <SelectItem value="defence">Defence</SelectItem>
                <SelectItem value="regulatory">Regulatory</SelectItem>
                <SelectItem value="others">Others</SelectItem>
              </SelectContent>
            </Select>
            {errors.category && <p className="text-red-500 text-xs">{errors.category}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Exam Fee Amount (₹) *</label>
            <Input 
              type="number"
              placeholder="E.g. 850" 
              value={formData.examFeeAmount}
              onChange={(e) => handleInputChange('examFeeAmount', e.target.value)}
              className={errors.examFeeAmount ? 'border-red-500' : ''}
            />
            {errors.examFeeAmount && <p className="text-red-500 text-xs">{errors.examFeeAmount}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">First Exam Date *</label>
            <Input 
              type="date" 
              value={formData.firstExamDate}
              onChange={(e) => handleInputChange('firstExamDate', e.target.value)}
              className={errors.firstExamDate ? 'border-red-500' : ''}
            />
            {errors.firstExamDate && <p className="text-red-500 text-xs">{errors.firstExamDate}</p>}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Payment Status *</label>
            <Select value={formData.paymentStatus} onValueChange={(value) => handleInputChange('paymentStatus', value)}>
              <SelectTrigger className={errors.paymentStatus ? 'border-red-500' : ''}>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Payment Complete</SelectItem>
                <SelectItem value="pending">Payment Pending</SelectItem>
                <SelectItem value="free">No Payment Required</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentStatus && <p className="text-red-500 text-xs">{errors.paymentStatus}</p>}
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Place of Exam *</label>
            <Input 
              placeholder="E.g. Mumbai, Delhi, Bangalore" 
              value={formData.placeOfExam}
              onChange={(e) => handleInputChange('placeOfExam', e.target.value)}
              className={errors.placeOfExam ? 'border-red-500' : ''}
            />
            {errors.placeOfExam && <p className="text-red-500 text-xs">{errors.placeOfExam}</p>}
          </div>
        </div>
        
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Input 
            placeholder="Any notes about this exam (optional)" 
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
          />
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Exam Stages Configuration</h3>
        <div className="text-xs text-blue-600 bg-blue-50 p-2 rounded">
          <strong>Note:</strong> First stage date will automatically sync with the first exam date above.
        </div>
        <StageBuilder 
          stages={stages} 
          onStagesChange={handleStagesChange}
          disabled={false}
        />
        {errors.stages && <p className="text-red-500 text-xs">{errors.stages}</p>}
      </div>
      
      <div className="pt-4 flex justify-end gap-2 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{isEdit ? 'Update' : 'Save'} Exam</Button>
      </div>
    </form>
  );
};
