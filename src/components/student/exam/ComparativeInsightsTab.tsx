
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Users, Trophy, Target, TrendingUp, Clock, Award } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';

interface ComparativeInsightsTabProps {
  analysisData: TestAnalysisData;
}

export const ComparativeInsightsTab: React.FC<ComparativeInsightsTabProps> = ({ analysisData }) => {
  const rankComparison = {
    current: { rank: 18, percentile: 94, totalStudents: 1800 },
    top: { rank: 1, percentile: 100, totalStudents: 1800 }
  };

  const scoreComparison = {
    yourScore: 78,
    averageScore: 45,
    topperScore: 90
  };

  const peerGroup = [
    { metric: "Similar Rank Range", value: "15-25", icon: Trophy },
    { metric: "Your Percentile", value: "94th", icon: TrendingUp },
    { metric: "Peer Average", value: "82%", icon: Users }
  ];

  const topperStrategies = [
    {
      strategy: "Time Management",
      description: "Completed test 15 minutes early",
      impact: "Very High",
      color: "green"
    },
    {
      strategy: "Accuracy Focus",
      description: "95% accuracy with selective attempts",
      impact: "High",
      color: "blue"
    },
    {
      strategy: "Sectional Strategy",
      description: "Balanced performance across all sections",
      impact: "High",
      color: "purple"
    },
    {
      strategy: "Question Selection",
      description: "Skipped difficult questions strategically",
      impact: "Medium",
      color: "orange"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'Very High': return 'bg-green-100 text-green-800';
      case 'High': return 'bg-blue-100 text-blue-800';
      case 'Medium': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStrategyColor = (color: string) => {
    const colors = {
      green: "from-green-50 to-green-100 border-green-200",
      blue: "from-blue-50 to-blue-100 border-blue-200",
      purple: "from-purple-50 to-purple-100 border-purple-200",
      orange: "from-orange-50 to-orange-100 border-orange-200"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  return (
    <div className="space-y-6">
      {/* Rank Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-blue-600" />
            <h3 className="font-semibold text-blue-900">Your Rank</h3>
          </div>
          <div className="text-3xl font-bold text-blue-600 mb-2">
            #{rankComparison.current.rank}
          </div>
          <div className="text-sm text-blue-700">
            Out of {rankComparison.current.totalStudents} students
          </div>
          <div className="mt-3">
            <div className="text-sm text-blue-700 mb-1">
              {rankComparison.current.percentile}th percentile
            </div>
            <Progress value={rankComparison.current.percentile} className="h-2" />
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <div className="flex items-center gap-2 mb-4">
            <Award className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold text-green-900">Top Rank</h3>
          </div>
          <div className="text-3xl font-bold text-green-600 mb-2">
            #{rankComparison.top.rank}
          </div>
          <div className="text-sm text-green-700">
            Topper position
          </div>
          <div className="mt-3">
            <div className="text-sm text-green-700 mb-1">
              100th percentile
            </div>
            <Progress value={100} className="h-2" />
          </div>
        </Card>
      </div>

      {/* Score Comparison */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Score Comparison</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="font-medium">Your Score</span>
            <div className="flex items-center gap-2">
              <Progress value={(scoreComparison.yourScore / 100) * 100} className="w-32" />
              <span className="font-bold text-blue-600">{scoreComparison.yourScore}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Average Score</span>
            <div className="flex items-center gap-2">
              <Progress value={(scoreComparison.averageScore / 100) * 100} className="w-32" />
              <span className="font-bold text-gray-600">{scoreComparison.averageScore}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-medium">Topper Score</span>
            <div className="flex items-center gap-2">
              <Progress value={(scoreComparison.topperScore / 100) * 100} className="w-32" />
              <span className="font-bold text-green-600">{scoreComparison.topperScore}</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Peer Group Analysis */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Peer Group Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {peerGroup.map((item, index) => (
            <Card key={index} className="p-4 bg-gray-50">
              <div className="flex items-center gap-2 mb-2">
                <item.icon className="h-5 w-5 text-gray-600" />
                <span className="font-medium text-sm">{item.metric}</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{item.value}</div>
            </Card>
          ))}
        </div>
      </Card>

      {/* Topper Strategies */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">What Toppers Did Differently</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {topperStrategies.map((strategy, index) => (
            <Card 
              key={index} 
              className={`p-4 bg-gradient-to-br ${getStrategyColor(strategy.color)} border`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{strategy.strategy}</span>
                <Badge className={getImpactColor(strategy.impact)}>
                  {strategy.impact}
                </Badge>
              </div>
              <p className="text-sm text-gray-700">{strategy.description}</p>
            </Card>
          ))}
        </div>
      </Card>
    </div>
  );
};
