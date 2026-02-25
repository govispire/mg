
import React from 'react';
import { Card } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { TrendingUp, Clock, Target, Award } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';

interface ProgressAnalysisTabProps {
  analysisData: TestAnalysisData;
}

export const ProgressAnalysisTab: React.FC<ProgressAnalysisTabProps> = ({ analysisData }) => {
  const performanceTrend = [
    { test: 'Mock 1', score: 58, accuracy: 72 },
    { test: 'Mock 2', score: 65, accuracy: 78 },
    { test: 'Mock 3', score: 72, accuracy: 85 },
    { test: 'Mock 4', score: 78, accuracy: 90 },
  ];

  const timeManagement = [
    { section: 'Reasoning', avgTime: 1.8, questionsAttempted: 30 },
    { section: 'English', avgTime: 2.1, questionsAttempted: 25 },
    { section: 'Quantitative', avgTime: 2.5, questionsAttempted: 25 },
  ];

  const improvementAreas = [
    {
      title: "Speed Improvement",
      description: "Reduced average time per question by 15%",
      trend: "positive",
      color: "blue"
    },
    {
      title: "Accuracy Enhancement",
      description: "Improved overall accuracy from 72% to 90%",
      trend: "positive",
      color: "green"
    },
    {
      title: "Sectional Balance",
      description: "More consistent performance across sections",
      trend: "positive",
      color: "purple"
    }
  ];

  const suggestions = [
    "Focus more on Data Interpretation practice",
    "Improve time management in Quantitative section",
    "Work on Reading Comprehension speed",
    "Practice more mock tests for consistency"
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-600",
      green: "from-green-50 to-green-100 border-green-200 text-green-600",
      purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Performance Trend */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Performance Trend Over Time</h3>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={performanceTrend}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="test" />
            <YAxis />
            <Tooltip />
            <Line 
              type="monotone" 
              dataKey="score" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Score"
            />
            <Line 
              type="monotone" 
              dataKey="accuracy" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Accuracy %"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Time Management Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Time Management Progress</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={timeManagement}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="section" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="avgTime" fill="#f59e0b" name="Avg Time (min)" />
            <Bar dataKey="questionsAttempted" fill="#8b5cf6" name="Questions Attempted" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Improvement Areas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {improvementAreas.map((area, index) => (
          <Card 
            key={index}
            className={`p-4 bg-gradient-to-br ${getColorClasses(area.color)} border`}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5" />
              <span className="font-medium">{area.title}</span>
            </div>
            <p className="text-sm">{area.description}</p>
          </Card>
        ))}
      </div>

      {/* Suggestions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Personalized Suggestions</h3>
        <div className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium">
                {index + 1}
              </div>
              <span className="text-sm">{suggestion}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};
