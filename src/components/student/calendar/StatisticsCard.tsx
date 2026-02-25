
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Flame } from 'lucide-react';

interface StatisticsCardProps {
  streak: number;
  monthlyProgress: number;
  weeklyStats: {
    total: number;
    completed: number;
    percentage: number;
  };
}

const StatisticsCard: React.FC<StatisticsCardProps> = ({ 
  streak, 
  monthlyProgress, 
  weeklyStats 
}) => {
  return (
    <Card className="p-4 mb-6 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-medium text-lg">Study Streak</h3>
        <div className="flex items-center">
          <Flame className="h-5 w-5 text-orange-500 mr-1" />
          <span className="font-bold text-xl">{streak} days</span>
        </div>
      </div>
      <p className="text-sm text-gray-500 mb-3">Keep your daily streak going!</p>
      
      <h4 className="font-medium mb-1">Monthly Progress</h4>
      <div className="flex items-center gap-2">
        <Progress value={monthlyProgress} className="flex-1 animate-pulse" />
        <span className="text-sm font-medium">{monthlyProgress}%</span>
      </div>
      
      <div className="mt-4">
        <h4 className="font-medium mb-2">Weekly Stats</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
            <p className="text-gray-500">Completed</p>
            <p className="font-bold">{weeklyStats.completed}/{weeklyStats.total} tasks</p>
          </div>
          <div className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
            <p className="text-gray-500">Success Rate</p>
            <p className="font-bold">{weeklyStats.percentage}%</p>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default StatisticsCard;
