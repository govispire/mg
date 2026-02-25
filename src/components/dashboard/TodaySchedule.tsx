import React from 'react';
import { Card } from '@/components/ui/card';
import { Clock, BookOpen, Video, FileText } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ScheduleItem {
  id: number;
  time: string;
  title: string;
  type: 'study' | 'test' | 'video' | 'revision';
  status: 'pending' | 'completed' | 'in-progress';
}

const TodaySchedule = () => {
  const scheduleItems: ScheduleItem[] = [
    { id: 1, time: '09:00 AM', title: 'Quantitative Aptitude - Chapter 3', type: 'study', status: 'completed' },
    { id: 2, time: '11:00 AM', title: 'English Mock Test', type: 'test', status: 'in-progress' },
    { id: 3, time: '02:00 PM', title: 'Video Lecture: Reasoning', type: 'video', status: 'pending' },
    { id: 4, time: '04:00 PM', title: 'Revision: Previous Week Topics', type: 'revision', status: 'pending' },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'study': return BookOpen;
      case 'test': return FileText;
      case 'video': return Video;
      default: return BookOpen;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in-progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Card className="p-4 sm:p-6 bg-white border border-gray-100">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Clock className="h-5 w-5 text-blue-600" />
          Today's Schedule
        </h3>
        <Badge variant="outline" className="text-xs">
          {scheduleItems.filter(i => i.status === 'completed').length}/{scheduleItems.length} Done
        </Badge>
      </div>
      
      <div className="space-y-3">
        {scheduleItems.map((item) => {
          const IconComponent = getIcon(item.type);
          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                item.status === 'completed' 
                  ? 'bg-gray-50 border-gray-200 opacity-60' 
                  : item.status === 'in-progress'
                  ? 'bg-blue-50 border-blue-200'
                  : 'bg-white border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className={`p-2 rounded-lg ${
                item.status === 'completed' 
                  ? 'bg-green-100' 
                  : item.status === 'in-progress'
                  ? 'bg-blue-200'
                  : 'bg-gray-100'
              }`}>
                <IconComponent className="h-4 w-4 text-gray-700" />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${item.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                  {item.title}
                </p>
                <p className="text-xs text-gray-500">{item.time}</p>
              </div>
              <Badge className={`${getStatusColor(item.status)} text-xs`}>
                {item.status === 'in-progress' ? 'Now' : item.status}
              </Badge>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default TodaySchedule;
