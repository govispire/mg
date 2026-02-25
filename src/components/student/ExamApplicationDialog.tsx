
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ExternalLink, AlertTriangle } from 'lucide-react';

interface ExamApplicationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  examName: string;
  actionType: 'notification' | 'apply' | 'result';
  url: string;
  onConfirm: () => void;
}

const ExamApplicationDialog: React.FC<ExamApplicationDialogProps> = ({
  isOpen,
  onClose,
  examName,
  actionType,
  url,
  onConfirm
}) => {
  const getDialogContent = () => {
    switch (actionType) {
      case 'notification':
        return {
          title: 'Open Official Notification',
          description: `You are about to open the official notification PDF for ${examName}. This will redirect you to the official website.`,
          actionText: 'Open Notification'
        };
      case 'apply':
        return {
          title: 'Apply for Exam',
          description: `You are about to be redirected to the official application form for ${examName}. Make sure you have all required documents ready.`,
          actionText: 'Proceed to Apply'
        };
      case 'result':
        return {
          title: 'Check Result',
          description: `You are about to be redirected to the official result page for ${examName}.`,
          actionText: 'Check Result'
        };
      default:
        return {
          title: 'External Link',
          description: 'You are about to be redirected to an external website.',
          actionText: 'Continue'
        };
    }
  };

  const { title, description, actionText } = getDialogContent();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription className="space-y-2">
            <p>{description}</p>
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <AlertTriangle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-yellow-800">
                This will open an external website. Please ensure you're on the official site before entering any personal information.
              </span>
            </div>
            <p className="text-xs text-gray-500 break-all">
              URL: {url}
            </p>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onConfirm} className="flex items-center gap-2">
            <ExternalLink className="h-4 w-4" />
            {actionText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ExamApplicationDialog;
