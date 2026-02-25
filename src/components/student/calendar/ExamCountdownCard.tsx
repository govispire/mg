
import React from 'react';
import { format } from 'date-fns';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, Book, FileText } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

interface ExamCountdown {
  id: number;
  name: string;
  date: Date;
  important: boolean;
  icon?: 'bell' | 'book' | 'file';
}

interface ExamCountdownCardProps {
  exams: ExamCountdown[];
  nearestExam: {
    name: string;
    days: number;
    date: Date;
  } | null;
}

const ExamCountdownCard: React.FC<ExamCountdownCardProps> = ({ 
  exams, 
  nearestExam 
}) => {
  const getIcon = (iconName: string | undefined) => {
    switch (iconName) {
      case 'bell':
        return <Bell className="h-4 w-4 text-blue-500" />;
      case 'book':
        return <Book className="h-4 w-4 text-green-500" />;
      case 'file':
      default:
        return <FileText className="h-4 w-4 text-orange-500" />;
    }
  };
  
  // Calculate days between now and exam date
  const getDaysLeft = (date: Date): number => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Calculate progress (days closer to exam)
  const getProgress = (date: Date): number => {
    const daysLeft = getDaysLeft(date);
    // Assuming most exams are planned within 90 days
    return Math.max(0, Math.min(100, 100 - (daysLeft / 90) * 100));
  };
  
  return (
    <Card className="p-4 mb-6 hover:shadow-md transition-shadow">
      <h3 className="font-medium text-lg mb-3">Exam Countdown</h3>
      {nearestExam ? (
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md hover:bg-blue-100 transition-colors mb-4">
          <h4 className="font-medium">{nearestExam.name}</h4>
          <Progress 
            value={getProgress(nearestExam.date)} 
            className="h-1.5 my-2" 
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-sm text-gray-500">
              {format(nearestExam.date, 'MMM d, yyyy')}
            </span>
            <span className="text-sm font-bold text-red-500">
              {nearestExam.days} days left
            </span>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4">No upcoming exams scheduled</p>
      )}
      
      <div className="space-y-3">
        {exams.map(exam => (
          <div 
            key={exam.id} 
            className="flex items-center justify-between p-2 border-b border-gray-100 last:border-0"
          >
            <div className="flex items-start gap-2">
              <div className="mt-0.5">
                {getIcon(exam.icon)}
              </div>
              <div>
                <p className="font-medium text-sm">{exam.name}</p>
                <p className="text-xs text-gray-500">
                  {format(exam.date, 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <Badge className={exam.important ? "bg-red-100 text-red-800 hover:bg-red-200" : "bg-gray-100 text-gray-800 hover:bg-gray-200"}>
              {getDaysLeft(exam.date)} days left
            </Badge>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ExamCountdownCard;
