
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MinusCircle, PlusCircle } from 'lucide-react';

interface QuestionQuantityDialogProps {
  sectionName: string;
  open: boolean;
  onClose: () => void;
  onConfirm: (quantity: number) => void;
  maxQuestions: number;
}

export const QuestionQuantityDialog: React.FC<QuestionQuantityDialogProps> = ({
  sectionName,
  open,
  onClose,
  onConfirm,
  maxQuestions,
}) => {
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value: number) => {
    if (value >= 1 && value <= maxQuestions) {
      setQuantity(value);
    }
  };

  const handleConfirm = () => {
    onConfirm(quantity);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>How many questions do you want to add?</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">
            You're adding questions to the <strong>{sectionName}</strong> section.
            Choose how many questions you'd like to add at once (max: {maxQuestions}).
          </p>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={quantity <= 1}
            >
              <MinusCircle className="h-4 w-4" />
            </Button>
            
            <div className="flex-1">
              <Label htmlFor="quantity" className="sr-only">
                Question Quantity
              </Label>
              <Input
                id="quantity"
                type="number"
                min={1}
                max={maxQuestions}
                value={quantity}
                onChange={(e) => handleQuantityChange(parseInt(e.target.value) || 1)}
                className="text-center"
              />
            </div>
            
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={quantity >= maxQuestions}
            >
              <PlusCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleConfirm}>Continue</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
