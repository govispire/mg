
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Grid, List, Clock, Users, Target, CheckCircle, RotateCcw, BarChart3, Play, Pause, BookOpen, Bookmark } from 'lucide-react';
import { Link } from 'react-router-dom';
import { TestAnalysisModal } from './TestAnalysisModal';
import { generateMockAnalysisData } from '@/data/testAnalysisData';
import { useBookmarkedTests } from '@/hooks/useBookmarkedTests';
import { toast } from '@/hooks/use-toast';

interface TestItem {
  id: string;
  title: string;
  duration: string;
  questions: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  attempts: number;
  completed: boolean;
  bestScore?: number;
  category: string;
  subject?: string;
}

interface EnhancedTestTypeGridProps {
  tests: TestItem[];
  testType: 'sectional' | 'prelims' | 'mains' | 'speed' | 'pyq' | 'live';
}

const subjects = [
  { id: 'all', name: 'All Subjects' },
  { id: 'reasoning', name: 'Reasoning' },
  { id: 'english', name: 'English' },
  { id: 'quantitative', name: 'Quantitative Aptitude' }
];

const EnhancedTestTypeGrid: React.FC<EnhancedTestTypeGridProps> = ({ tests, testType }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [showAnalysisModal, setShowAnalysisModal] = useState(false);
  const [selectedTestForAnalysis, setSelectedTestForAnalysis] = useState<TestItem | null>(null);
  const { isTestBookmarked, toggleBookmark } = useBookmarkedTests();

  const filteredTests = tests.filter(test =>
    selectedSubject === 'all' || test.subject === selectedSubject
  );

  const handleTestAction = (action: 'solution' | 'reattempt' | 'analysis', test: TestItem) => {
    console.log(`${action} clicked for test ${test.id}`);

    if (action === 'analysis') {
      setSelectedTestForAnalysis(test);
      setShowAnalysisModal(true);
    } else if (action === 'solution') {
      console.log('Navigate to solution page for test:', test.id);
      // Would navigate to solution page
    }
    // Other actions would typically navigate to respective pages
  };

  const getTestStatus = (test: TestItem) => {
    // Mock logic to determine test status
    if (test.completed) return 'completed';
    if (Math.random() > 0.7) return 'paused'; // Mock paused status
    return 'not-started';
  };

  const handleBookmarkToggle = (test: TestItem) => {
    const bookmarkData = {
      testId: test.id,
      testName: test.title,
      examId: test.category,
      examName: test.category,
      testType: testType,
      category: test.category,
      addedAt: Date.now()
    };

    const isBookmarked = toggleBookmark(bookmarkData);
    toast({
      title: isBookmarked ? "Test Bookmarked" : "Bookmark Removed",
      description: isBookmarked ? `${test.title} added to bookmarks` : `${test.title} removed from bookmarks`,
    });
  };

  const TestCard = ({ test, isListView = false }: { test: TestItem; isListView?: boolean }) => (
    <Card className={`overflow-hidden ${isListView ? 'mb-2' : ''} hover:shadow-md transition-shadow`}>
      <CardContent className={`p-4 ${isListView ? 'flex items-center justify-between' : ''}`}>
        <div className={isListView ? 'flex items-center gap-4 flex-1' : ''}>
          <div className={isListView ? 'flex-1' : 'mb-3'}>
            <div className="flex items-center justify-between mb-2">
              <h3 className={`font-semibold ${isListView ? 'text-base' : 'text-lg'} flex-1`}>{test.title}</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBookmarkToggle(test)}
                  className={`h-8 w-8 p-0 ${isTestBookmarked(test.id) ? 'text-yellow-500' : 'text-gray-400'}`}
                >
                  <Bookmark className={`h-4 w-4 ${isTestBookmarked(test.id) ? 'fill-yellow-500' : ''}`} />
                </Button>
                {!isListView && (
                  <Badge variant={test.difficulty === 'Easy' ? 'default' : test.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
                    {test.difficulty}
                  </Badge>
                )}
              </div>
            </div>
            <div className={`text-sm text-gray-600 ${isListView ? 'flex gap-4' : 'space-y-1'}`}>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {test.duration}
              </div>
              <div className="flex items-center gap-1">
                <Target className="h-4 w-4" />
                {test.questions} Questions
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {test.attempts} Attempts
              </div>
            </div>
            {test.completed && test.bestScore && (
              <div className="mt-2">
                <Badge variant="outline" className="text-green-600">
                  Best Score: {test.bestScore}%
                </Badge>
              </div>
            )}
          </div>
          {isListView && (
            <Badge variant={test.difficulty === 'Easy' ? 'default' : test.difficulty === 'Medium' ? 'secondary' : 'destructive'}>
              {test.difficulty}
            </Badge>
          )}
        </div>

        <div className={`${isListView ? 'flex gap-2' : 'flex flex-col gap-2'}`}>
          {getTestStatus(test) === 'not-started' ? (
            <Button
              className="w-full"
              onClick={() => {
                const url = `/student/test-window?category=${test.category}&examId=${test.id}&testId=${test.id}`;
                window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Start Test
            </Button>
          ) : getTestStatus(test) === 'paused' ? (
            <Button
              className="w-full"
              onClick={() => {
                const url = `/student/test-window?category=${test.category}&examId=${test.id}&testId=${test.id}`;
                window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
              }}
            >
              <Play className="h-4 w-4 mr-2" />
              Continue
            </Button>
          ) : (
            <div className={`${isListView ? 'flex gap-2' : 'space-y-2'}`}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestAction('solution', test)}
                className="flex items-center gap-1"
              >
                <BookOpen className="h-4 w-4" />
                Solution
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTestAction('analysis', test)}
                className="flex items-center gap-1"
              >
                <BarChart3 className="h-4 w-4" />
                Analysis
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const url = `/student/test-window?category=${test.category}&examId=${test.id}&testId=${test.id}`;
                  window.open(url, '_blank', 'width=1920,height=1080,menubar=no,toolbar=no,location=no,status=no');
                }}
                className="flex items-center gap-1"
              >
                <RotateCcw className="h-4 w-4" />
                Reattempt
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  // Show subject tabs only for sectional, prelims, and mains tests
  const showSubjectTabs = ['sectional', 'prelims', 'mains'].includes(testType);

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            {filteredTests.length} test{filteredTests.length !== 1 ? 's' : ''} available
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {showSubjectTabs ? (
        <Tabs defaultValue="all" value={selectedSubject} onValueChange={setSelectedSubject}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {subjects.map(subject => (
              <TabsTrigger key={subject.id} value={subject.id}>
                {subject.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {subjects.map(subject => (
            <TabsContent key={subject.id} value={subject.id} className="mt-4">
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredTests.map(test => (
                    <TestCard key={test.id} test={test} />
                  ))}
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredTests.map(test => (
                    <TestCard key={test.id} test={test} isListView />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <div>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTests.map(test => (
                <TestCard key={test.id} test={test} />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredTests.map(test => (
                <TestCard key={test.id} test={test} isListView />
              ))}
            </div>
          )}
        </div>
      )}

      {filteredTests.length === 0 && (
        <div className="text-center py-12">
          <Target className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No Tests Available</h3>
          <p className="text-gray-600">No tests found for the selected subject.</p>
        </div>
      )}

      {/* Test Analysis Modal */}
      {selectedTestForAnalysis && (
        <TestAnalysisModal
          isOpen={showAnalysisModal}
          onClose={() => {
            setShowAnalysisModal(false);
            setSelectedTestForAnalysis(null);
          }}
          analysisData={generateMockAnalysisData(selectedTestForAnalysis.id, selectedTestForAnalysis.title)}
        />
      )}
    </div>
  );
};

export default EnhancedTestTypeGrid;
