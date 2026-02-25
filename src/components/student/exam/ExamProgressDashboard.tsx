
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, TrendingUp, Clock, Award, Target, Zap } from 'lucide-react';
import { ExamProgressData } from '@/hooks/useExamProgress';

interface ExamProgressDashboardProps {
  progressData: ExamProgressData;
  getTypeProgress: (testType: keyof ExamProgressData['testTypes']) => {
    completed: number;
    total: number;
    percentage: number;
    averageScore: number;
    bestScore: number;
    totalAttempts: number;
  };
}

export const ExamProgressDashboard: React.FC<ExamProgressDashboardProps> = ({
  progressData,
  getTypeProgress
}) => {
  const overallStats = [
    {
      title: 'Total Users',
      value: progressData.totalUsers.toLocaleString(),
      icon: <Users className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    {
      title: 'Your Rank',
      value: progressData.userRank ? `#${progressData.userRank}` : 'N/A',
      icon: <Award className="h-5 w-5" />,
      color: 'text-green-600'
    },
    {
      title: 'Overall Progress',
      value: `${progressData.overallProgress}%`,
      icon: <TrendingUp className="h-5 w-5" />,
      color: 'text-purple-600'
    },
    {
      title: 'Tests Completed',
      value: `${Object.keys(progressData.testTypes).reduce((sum, type) => 
        sum + getTypeProgress(type as keyof ExamProgressData['testTypes']).completed, 0)}/120`,
      icon: <Target className="h-5 w-5" />,
      color: 'text-orange-600'
    }
  ];

  const testTypeStats = [
    { key: 'prelims', name: 'Prelims', icon: <Target className="h-4 w-4" />, color: 'bg-blue-500' },
    { key: 'mains', name: 'Mains', icon: <Award className="h-4 w-4" />, color: 'bg-purple-500' },
    { key: 'sectional', name: 'Sectional', icon: <Clock className="h-4 w-4" />, color: 'bg-green-500' },
    { key: 'speed', name: 'Speed', icon: <Zap className="h-4 w-4" />, color: 'bg-yellow-500' },
    { key: 'pyq', name: 'PYQ', icon: <TrendingUp className="h-4 w-4" />, color: 'bg-red-500' },
    { key: 'live', name: 'Live', icon: <Users className="h-4 w-4" />, color: 'bg-indigo-500' }
  ];

  return (
    <div className="space-y-6">
      {/* Overall Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {overallStats.map((stat, index) => (
          <Card key={index} className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">{stat.title}</p>
                <p className="text-xl font-bold">{stat.value}</p>
              </div>
              <div className={`${stat.color}`}>
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Test Type Progress */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Test Type Progress</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {testTypeStats.map((testType) => {
            const progress = getTypeProgress(testType.key as keyof ExamProgressData['testTypes']);
            return (
              <div key={testType.key} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`${testType.color} text-white p-1 rounded`}>
                      {testType.icon}
                    </div>
                    <span className="font-medium">{testType.name}</span>
                  </div>
                  <Badge variant="outline">
                    {progress.completed}/{progress.total}
                  </Badge>
                </div>
                <Progress value={progress.percentage} className="h-2" />
                <div className="text-xs text-gray-500">
                  <span>{Math.round(progress.percentage)}% Complete</span>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Performance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4 border-l-4 border-l-green-500">
          <h4 className="font-semibold text-green-700">Best Performance</h4>
          <p className="text-2xl font-bold text-green-600">
            {Math.max(...Object.keys(progressData.testTypes).map(type => 
              getTypeProgress(type as keyof ExamProgressData['testTypes']).bestScore
            ))}%
          </p>
          <p className="text-sm text-gray-600">Highest score achieved</p>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-blue-500">
          <h4 className="font-semibold text-blue-700">Total Attempts</h4>
          <p className="text-2xl font-bold text-blue-600">
            {Object.keys(progressData.testTypes).reduce((sum, type) => 
              sum + getTypeProgress(type as keyof ExamProgressData['testTypes']).totalAttempts, 0
            )}
          </p>
          <p className="text-sm text-gray-600">Tests attempted</p>
        </Card>
        
        <Card className="p-4 border-l-4 border-l-purple-500">
          <h4 className="font-semibold text-purple-700">Study Streak</h4>
          <p className="text-2xl font-bold text-purple-600">7</p>
          <p className="text-sm text-gray-600">Days consecutive</p>
        </Card>
      </div>
    </div>
  );
};
