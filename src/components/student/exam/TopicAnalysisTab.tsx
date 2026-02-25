
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, Target, AlertCircle, CheckCircle } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { useIsMobile } from '@/hooks/use-mobile';

interface TopicAnalysisTabProps {
  analysisData: TestAnalysisData;
}

export const TopicAnalysisTab: React.FC<TopicAnalysisTabProps> = ({ analysisData }) => {
  const isMobile = useIsMobile();

  const topicAccuracyData = [
    { topic: 'Logical Reasoning', accuracy: 93 },
    { topic: 'Data Interpretation', accuracy: 70 },
    { topic: 'Verbal Ability', accuracy: 85 },
    { topic: 'Quantitative Aptitude', accuracy: 78 },
    { topic: 'General Knowledge', accuracy: 82 }
  ];

  const speedAnalysisData = [
    { topic: 'Reading Comprehension', difficulty: 'Easy', avgTime: 2.5, yourTime: 2.1 },
    { topic: 'Logical Reasoning', difficulty: 'Medium', avgTime: 1.8, yourTime: 1.6 },
    { topic: 'Data Interpretation', difficulty: 'Hard', avgTime: 3.2, yourTime: 4.1 },
  ];

  const struggledQuestions = [
    { id: 15, topic: 'Data Interpretation', status: 'wrong', difficulty: 'Hard' },
    { id: 23, topic: 'Logical Reasoning', status: 'unattempted', difficulty: 'Medium' },
    { id: 31, topic: 'Quantitative Aptitude', status: 'wrong', difficulty: 'Hard' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'Hard': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'wrong': return 'bg-red-100 text-red-800';
      case 'unattempted': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-1">
      {/* Topic Accuracy Chart - Enhanced Mobile Optimization */}
      <Card className="p-3 sm:p-4 lg:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Topic-wise Accuracy</h3>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
            <BarChart 
              data={topicAccuracyData}
              margin={{
                top: 15,
                right: isMobile ? 15 : 30,
                left: isMobile ? 5 : 20,
                bottom: isMobile ? 60 : 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="topic" 
                fontSize={isMobile ? 9 : 12}
                interval={0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 70 : 50}
                tick={{ fontSize: isMobile ? 9 : 12 }}
              />
              <YAxis 
                fontSize={isMobile ? 10 : 12}
                width={isMobile ? 35 : 50}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <Tooltip 
                contentStyle={{ 
                  fontSize: isMobile ? '11px' : '13px',
                  padding: isMobile ? '8px 10px' : '12px 16px',
                  borderRadius: '8px',
                  border: '1px solid #e5e7eb',
                  backgroundColor: 'white',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                labelStyle={{ fontSize: isMobile ? '11px' : '13px', fontWeight: 'bold' }}
              />
              <Bar dataKey="accuracy" fill="#3b82f6" radius={isMobile ? [2, 2, 0, 0] : [4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Sectional Scores - Mobile Responsive */}
      <Card className="p-3 sm:p-4 lg:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Sectional Performance</h3>
        <div className="space-y-3 sm:space-y-4">
          {analysisData.sectionWiseData.map((section, index) => (
            <div key={index} className="p-3 sm:p-4 border rounded-lg">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-sm sm:text-base">{section.sectionName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {section.score}/{section.maxScore}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {section.accuracy}%
                    </Badge>
                  </div>
                </div>
                <Progress value={section.accuracy} className="h-2" />
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-green-50 rounded p-2">
                    <p className="text-[10px] sm:text-xs text-green-600 font-medium">Correct</p>
                    <p className="text-sm sm:text-base font-bold text-green-700">{section.correct}</p>
                  </div>
                  <div className="bg-red-50 rounded p-2">
                    <p className="text-[10px] sm:text-xs text-red-600 font-medium">Wrong</p>
                    <p className="text-sm sm:text-base font-bold text-red-700">{section.wrong}</p>
                  </div>
                  <div className="bg-gray-50 rounded p-2">
                    <p className="text-[10px] sm:text-xs text-gray-600 font-medium">Skipped</p>
                    <p className="text-sm sm:text-base font-bold text-gray-700">{section.skipped}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Speed Analysis - Mobile Responsive Grid */}
      <Card className="p-3 sm:p-4 lg:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Speed Analysis</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {speedAnalysisData.map((item, index) => (
            <Card key={index} className="p-3 sm:p-4">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-xs sm:text-sm leading-tight">{item.topic}</span>
                  <Badge className={`${getDifficultyColor(item.difficulty)} text-xs self-start sm:self-center`}>
                    {item.difficulty}
                  </Badge>
                </div>
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex justify-between text-xs sm:text-sm">
                    <span>Your Time:</span>
                    <span className={item.yourTime > item.avgTime ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                      {item.yourTime}m
                    </span>
                  </div>
                  <div className="flex justify-between text-xs sm:text-sm text-gray-600">
                    <span>Avg Time:</span>
                    <span>{item.avgTime}m</span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Struggled Questions - Mobile Responsive Grid */}
      <Card className="p-3 sm:p-4 lg:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Questions You Struggled With</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {struggledQuestions.map((question, index) => (
            <Card key={index} className="p-3 sm:p-4 border-l-4 border-l-red-500">
              <div className="space-y-2 sm:space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <span className="font-medium text-sm sm:text-base">Question {question.id}</span>
                  <Badge className={`${getStatusColor(question.status)} text-xs self-start sm:self-center`}>
                    {question.status}
                  </Badge>
                </div>
                <div className="text-xs sm:text-sm text-gray-600 mb-2">{question.topic}</div>
                <Badge className={`${getDifficultyColor(question.difficulty)} text-xs self-start`}>
                  {question.difficulty}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
