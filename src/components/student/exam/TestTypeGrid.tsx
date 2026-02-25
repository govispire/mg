
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, CheckCircle, Play, RotateCcw, Trophy, Star, Calendar, BarChart3, BookOpen } from 'lucide-react';
import { TestProgress } from '@/hooks/useExamProgress';
import { Link, useParams } from 'react-router-dom';
import { TestAnalysisModal } from './TestAnalysisModal';
import { generateMockAnalysisData } from '@/data/testAnalysisData';

interface TestTypeGridProps {
  testType: string;
  tests: TestProgress[];
  progress: {
    completed: number;
    total: number;
    percentage: number;
    averageScore: number;
    bestScore: number;
    totalAttempts: number;
  };
  viewMode?: 'grid' | 'list';
}

export const TestTypeGrid: React.FC<TestTypeGridProps> = ({
  testType,
  tests,
  progress,
  viewMode = 'grid'
}) => {
  const { category, examId } = useParams();
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedTestForAnalysis, setSelectedTestForAnalysis] = useState<TestProgress | null>(null);

  const handleAnalysisClick = (test: TestProgress) => {
    setSelectedTestForAnalysis(test);
    setShowAnalysisModal(true);
  };

  const handleSolutionClick = (test: TestProgress) => {
    console.log('Solution clicked for test:', test.testId);
    // Navigate to solution page - would be implemented based on routing structure
  };

  const getStatusIcon = (status: TestProgress['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'in-progress':
        return <RotateCcw className="h-4 w-4 text-orange-600" />;
      default:
        return <Play className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusBackgroundColor = (status: TestProgress['status'], score?: number, maxScore?: number) => {
    switch (status) {
      case 'completed':
        // Check if test is cleared (assuming 50% is passing score)
        if (score !== undefined && maxScore !== undefined) {
          const percentage = (score / maxScore) * 100;
          return percentage >= 50 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200';
        }
        return 'bg-green-50 border-green-200';
      case 'in-progress':
        return 'bg-orange-50 border-orange-200';
      default:
        return 'bg-white border-gray-200 hover:bg-gray-50';
    }
  };

  const getDifficultyColor = (difficulty: TestProgress['difficulty']) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not attempted';
    return new Date(dateString).toLocaleDateString();
  };

  if (viewMode === 'list') {
    return (
      <div className="space-y-6">
        {/* Test Type Header with Progress */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold capitalize">{testType} Tests</h2>
            <p className="text-gray-600">{progress.completed} of {progress.total} tests completed</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Average Score</p>
              <p className="font-bold text-lg">{progress.averageScore}%</p>
            </div>
            <div className="w-32">
              <Progress value={progress.percentage} className="h-3" />
              <p className="text-xs text-gray-500 mt-1">{Math.round(progress.percentage)}% Complete</p>
            </div>
          </div>
        </div>

        {/* Tests List View */}
        <div className="space-y-3">
          {tests.map((test) => (
            <Card key={test.testId} className={`p-4 transition-all duration-200 hover:shadow-md ${getStatusBackgroundColor(test.status, test.score, test.maxScore)}`}>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3 flex-1">
                  {getStatusIcon(test.status)}
                  <div>
                    <h3 className="font-medium">{test.testName}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className={`text-xs ${getDifficultyColor(test.difficulty)}`}>
                        {test.difficulty}
                      </Badge>
                      {test.lastAttempted && (
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(test.lastAttempted)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Score</p>
                    <p className="font-medium">
                      {test.score !== undefined ? `${test.score}/${test.maxScore}` : `0/${test.maxScore}`}
                    </p>
                  </div>

                  {test.timeSpent && (
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Time</p>
                      <p className="font-medium">{Math.floor(test.timeSpent / 60)}m</p>
                    </div>
                  )}

                  {test.rank && (
                    <div className="text-center">
                      <p className="text-gray-500 text-xs">Rank</p>
                      <p className="font-medium text-yellow-600">#{test.rank}</p>
                    </div>
                  )}

                  <div className="text-center">
                    <p className="text-gray-500 text-xs">Attempts</p>
                    <p className="font-medium">{test.attempts}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {test.status === 'completed' ? (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSolutionClick(test)}
                        className="flex items-center gap-1"
                      >
                        <BookOpen className="h-3 w-3" />
                        Solution
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalysisClick(test)}
                        className="flex items-center gap-1"
                      >
                        <BarChart3 className="h-3 w-3" />
                        Analysis
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          const currentPath = window.location.pathname;
                          const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                          window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
                        }}
                      >
                        Reattempt
                      </Button>
                    </>
                  ) : (
                    <Button
                      size="sm"
                      onClick={() => {
                        const currentPath = window.location.pathname;
                        const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                        window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
                      }}
                    >
                      {test.status === 'in-progress' ? 'Continue' : 'Start Test'}
                    </Button>
                  )}
                </div>
              </div>

              {test.score !== undefined && (
                <div className="mt-3 pt-3 border-t">
                  <Progress value={(test.score / test.maxScore) * 100} className="h-2" />
                  <div className="flex justify-between text-xs mt-1">
                    <span className="text-gray-500">Performance</span>
                    <span className="font-medium">{Math.round((test.score / test.maxScore) * 100)}%</span>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>

        {/* Analysis Modal */}
        {selectedTestForAnalysis && (
          <TestAnalysisModal
            isOpen={showAnalysisModal}
            onClose={() => {
              setShowAnalysisModal(false);
              setSelectedTestForAnalysis(null);
            }}
            analysisData={generateMockAnalysisData(selectedTestForAnalysis.testId, selectedTestForAnalysis.testName)}
          />
        )}
      </div>
    );
  }

  // Grid View
  return (
    <div className="space-y-6">
      {/* Test Type Header with Progress */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold capitalize">{testType} Tests</h2>
          <p className="text-gray-600">{progress.completed} of {progress.total} tests completed</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-gray-600">Average Score</p>
            <p className="font-bold text-lg">{progress.averageScore}%</p>
          </div>
          <div className="w-32">
            <Progress value={progress.percentage} className="h-3" />
            <p className="text-xs text-gray-500 mt-1">{Math.round(progress.percentage)}% Complete</p>
          </div>
        </div>
      </div>

      {/* Tests Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
        {tests.map((test) => (
          <Card key={test.testId} className={`p-3 transition-all duration-200 hover:shadow-md ${getStatusBackgroundColor(test.status, test.score, test.maxScore)}`}>
            <div className="space-y-3">
              {/* Test Header */}
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-medium text-sm leading-tight">{test.testName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {getStatusIcon(test.status)}
                    <Badge variant="outline" className={`text-xs ${getDifficultyColor(test.difficulty)}`}>
                      {test.difficulty}
                    </Badge>
                  </div>
                </div>
              </div>

              {/* Test Stats */}
              <div className="space-y-2 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Max Score:</span>
                  <span className="font-medium">{test.maxScore}</span>
                </div>
                {test.score !== undefined && (
                  <div className="flex justify-between">
                    <span>Your Score:</span>
                    <span className="font-medium text-green-600">{test.score}</span>
                  </div>
                )}
                {test.timeSpent && (
                  <div className="flex justify-between">
                    <span>Time Spent:</span>
                    <span className="font-medium">{Math.floor(test.timeSpent / 60)} min</span>
                  </div>
                )}
                {test.rank && (
                  <div className="flex justify-between items-center">
                    <span>Rank:</span>
                    <div className="flex items-center gap-1">
                      <Trophy className="h-3 w-3 text-yellow-500" />
                      <span className="font-medium">#{test.rank}</span>
                    </div>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Attempts:</span>
                  <span className="font-medium">{test.attempts}</span>
                </div>
              </div>

              {/* Score Percentage Bar */}
              {test.score !== undefined && (
                <div className="space-y-1">
                  <Progress value={(test.score / test.maxScore) * 100} className="h-2" />
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Score</span>
                    <span className="font-medium">{Math.round((test.score / test.maxScore) * 100)}%</span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 border-t">
                {test.status === 'completed' ? (
                  <div className="space-y-2">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSolutionClick(test)}
                        className="flex-1 text-xs"
                      >
                        <BookOpen className="h-3 w-3 mr-1" />
                        Solution
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAnalysisClick(test)}
                        className="flex-1 text-xs"
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analysis
                      </Button>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full text-xs"
                      onClick={() => {
                        const currentPath = window.location.pathname;
                        const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                        window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
                      }}
                    >
                      Reattempt
                    </Button>
                  </div>
                ) : (
                  <Button
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      const currentPath = window.location.pathname;
                      const url = `/student/test-window?category=${category}&examId=${examId}&testId=${test.testId}&returnUrl=${encodeURIComponent(currentPath)}`;
                      window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
                    }}
                  >
                    {test.status === 'in-progress' ? 'Continue' : 'Start Test'}
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Analysis Modal */}
      {selectedTestForAnalysis && (
        <TestAnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedTestForAnalysis(null);
          }}
          analysisData={generateMockAnalysisData(selectedTestForAnalysis.testId, selectedTestForAnalysis.testName)}
        />
      )}
    </div>
  );
};
