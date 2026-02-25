import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowLeft, Target, Trophy, Zap, Clock, TrendingUp, Users, Grid3X3, List } from 'lucide-react';
import { ExamProgressDashboard } from '@/components/student/exam/ExamProgressDashboard';
import { TestTypeGrid } from '@/components/student/exam/TestTypeGrid';
import { ExamPerformanceTab } from '@/components/student/exam/ExamPerformanceTab';
import { SuccessStoriesTab } from '@/components/student/exam/SuccessStoriesTab';
import { HowToStartTab } from '@/components/student/exam/HowToStartTab';
import { SyllabusTab } from '@/components/student/exam/SyllabusTab';
import { PreviousCutoffTab } from '@/components/student/exam/PreviousCutoffTab';
import { DoubtsTab } from '@/components/student/exam/DoubtsTab';
import { useExamProgress } from '@/hooks/useExamProgress';
import { getExamsByCategory } from '@/data/examData';

const ExamDetail = () => {
  const { category, examId } = useParams();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [activeSubTab, setActiveSubTab] = useState("full");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { progressData, getTypeProgress, setProgressData, updateTestProgress } = useExamProgress(examId!);

  // Get exam name from examData
  const examName = React.useMemo(() => {
    const exams = getExamsByCategory(category!);
    const exam = exams.find(e => e.id === examId);
    return exam?.name || examId?.replace('-', ' ').toUpperCase() || 'Exam';
  }, [category, examId]);

  // Check for test completions on mount and update progress
  useEffect(() => {
    const checkTestCompletions = () => {
      // Check all test types for completions
      Object.keys(progressData.testTypes).forEach((testType) => {
        const tests = progressData.testTypes[testType as keyof typeof progressData.testTypes];
        tests.forEach((test) => {
          const resultKey = `test_result_${test.testId}`;
          const resultStr = localStorage.getItem(resultKey);
          if (resultStr) {
            try {
              const result = JSON.parse(resultStr);
              // Update test progress if it's newly completed
              if (test.status !== 'completed' || test.score !== result.score) {
                updateTestProgress(testType as keyof typeof progressData.testTypes, test.testId, {
                  status: 'completed',
                  score: result.score,
                  timeSpent: result.timeTaken,
                  attempts: (test.attempts || 0) + 1,
                  lastAttempted: new Date().toISOString().split('T')[0]
                });
              }
              // Clean up the result
              localStorage.removeItem(resultKey);
            } catch (error) {
              console.error('Error parsing test result:', error);
            }
          }
        });
      });
    };

    checkTestCompletions();
  }, [progressData.testTypes, updateTestProgress]);

  // Refresh test data when window regains focus (user returns from test window)
  useEffect(() => {
    const handleFocus = () => {
      // Recheck for test completions when user comes back
      Object.keys(progressData.testTypes).forEach((testType) => {
        const tests = progressData.testTypes[testType as keyof typeof progressData.testTypes];
        tests.forEach((test) => {
          const resultKey = `test_result_${test.testId}`;
          const resultStr = localStorage.getItem(resultKey);
          if (resultStr) {
            try {
              const result = JSON.parse(resultStr);
              if (test.status !== 'completed' || test.score !== result.score) {
                updateTestProgress(testType as keyof typeof progressData.testTypes, test.testId, {
                  status: 'completed',
                  score: result.score,
                  timeSpent: result.timeTaken,
                  attempts: (test.attempts || 0) + 1,
                  lastAttempted: new Date().toISOString().split('T')[0]
                });
              }
              localStorage.removeItem(resultKey);
            } catch (error) {
              console.error('Error parsing test result:', error);
            }
          }
        });
      });
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [progressData.testTypes, updateTestProgress]);

  // Update progress data with exam name
  useEffect(() => {
    if (progressData.examName !== examName) {
      setProgressData(prev => ({
        ...prev,
        examName
      }));
    }
  }, [examName, progressData.examName, setProgressData]);

  // Get exam logo
  const examLogo = React.useMemo(() => {
    const exams = getExamsByCategory(category!);
    const exam = exams.find(e => e.id === examId);
    return exam?.logo || '📚';
  }, [category, examId]);

  // Check if logo is a URL (contains http/https or starts with /)
  const isLogoUrl = React.useMemo(() => {
    if (typeof examLogo === 'string') {
      return examLogo.includes('http') || examLogo.startsWith('/') || examLogo.includes('cloudinary');
    }
    return false;
  }, [examLogo]);

  const mainTabs = [
    { value: "dashboard", label: "Dashboard" },
    { value: "prelims", label: "Prelims" },
    { value: "mains", label: "Mains" },
    { value: "live", label: "Live" },
    { value: "performance", label: "Performance" },
    { value: "success-stories", label: "Success Stories" }
  ];

  const subTabs = [
    { value: "full", label: "Full Test", type: "prelims" },
    { value: "sectional", label: "Sectional Test", type: "sectional" },
    { value: "speed", label: "Speed Test", type: "speed" },
    { value: "pyq", label: "PYQ Test", type: "pyq" }
  ];

  const getCurrentTestType = () => {
    if (activeTab === "dashboard") return null;
    if (activeTab === "live") return "live";
    if (activeTab === "prelims") {
      switch (activeSubTab) {
        case "full": return "prelims";
        case "sectional": return "sectional";
        case "speed": return "speed";
        case "pyq": return "pyq";
        default: return "prelims";
      }
    }
    if (activeTab === "mains") {
      switch (activeSubTab) {
        case "full": return "mains";
        case "sectional": return "sectional";
        case "speed": return "speed";
        case "pyq": return "pyq";
        default: return "mains";
      }
    }
    return null;
  };

  return (
    <div className="space-y-6">
      <div>
        <Link to={`/student/tests/${category}`} className="text-gray-500 flex items-center hover:text-gray-700">
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to {category?.replace('-', ' & ')}</span>
        </Link>
      </div>

      <div className="flex items-center gap-3 mb-6 rounded-lg">
        {isLogoUrl ? (
          <img
            src={examLogo as string}
            alt={examName}
            className="w-12 h-12 object-contain rounded"
            onError={(e) => {
              // Fallback to emoji if image fails to load
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              const fallback = document.createElement('span');
              fallback.className = 'text-3xl';
              fallback.textContent = '📚';
              target.parentNode?.insertBefore(fallback, target);
            }}
          />
        ) : (
          <span className="text-3xl">{examLogo}</span>
        )}
        <div>
          <h1 className="text-2xl font-bold">{examName}</h1>
          <p className="text-muted-foreground">Comprehensive test preparation and progress tracking</p>
        </div>
      </div>

      {/* Removed Roadmap and Advertisement */}

      <Card className="overflow-hidden">
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab}>
          <div className="bg-gray-50 p-4 border-b">
            {/* Main Tabs - Single row */}
            <div className="overflow-x-auto">
              <TabsList className="grid w-full grid-cols-6 min-w-max lg:min-w-0">
                {mainTabs.map((tab) => (
                  <TabsTrigger
                    key={tab.value}
                    value={tab.value}
                    className="whitespace-nowrap text-xs sm:text-sm"
                  >
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </div>

            {/* Sub Tabs for Prelims and Mains */}
            {(activeTab === "prelims" || activeTab === "mains") && (
              <div className="mt-4">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="overflow-x-auto w-full sm:w-auto">
                    <div className="flex gap-2 min-w-max">
                      {subTabs.map((subTab) => (
                        <Button
                          key={subTab.value}
                          variant={activeSubTab === subTab.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setActiveSubTab(subTab.value)}
                          className="whitespace-nowrap text-xs"
                        >
                          {subTab.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex gap-1 border rounded-lg p-1">
                    <Button
                      variant={viewMode === 'grid' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                      className="p-2"
                    >
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? "default" : "ghost"}
                      size="sm"
                      onClick={() => setViewMode('list')}
                      className="p-2"
                    >
                      <List className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 sm:p-6">
            <TabsContent value="dashboard" className="mt-0">
              <div className="space-y-6">
                <ExamProgressDashboard
                  progressData={progressData}
                  getTypeProgress={getTypeProgress}
                />

                {/* Info Tabs within Dashboard */}
                <Card className="border-t-4 border-t-primary">
                  <Tabs defaultValue="how-to-start" className="w-full">
                    <div className="border-b bg-muted/30">
                      <TabsList className="w-full grid grid-cols-4 h-auto p-2 bg-transparent">
                        <TabsTrigger value="how-to-start" className="text-xs sm:text-sm">
                          How to Start
                        </TabsTrigger>
                        <TabsTrigger value="syllabus" className="text-xs sm:text-sm">
                          Syllabus
                        </TabsTrigger>
                        <TabsTrigger value="cutoff" className="text-xs sm:text-sm">
                          Previous Cutoff
                        </TabsTrigger>
                        <TabsTrigger value="doubts" className="text-xs sm:text-sm">
                          Doubts
                        </TabsTrigger>
                      </TabsList>
                    </div>

                    <div className="p-4">
                      <TabsContent value="how-to-start" className="mt-0">
                        <HowToStartTab examId={examId!} examName={examName} />
                      </TabsContent>

                      <TabsContent value="syllabus" className="mt-0">
                        <SyllabusTab examId={examId!} examName={examName} />
                      </TabsContent>

                      <TabsContent value="cutoff" className="mt-0">
                        <PreviousCutoffTab examId={examId!} examName={examName} />
                      </TabsContent>

                      <TabsContent value="doubts" className="mt-0">
                        <DoubtsTab examId={examId!} examName={examName} />
                      </TabsContent>
                    </div>
                  </Tabs>
                </Card>
              </div>
            </TabsContent>

            {mainTabs.slice(1, 4).map((tab) => (
              <TabsContent key={tab.value} value={tab.value} className="mt-0">
                {getCurrentTestType() && (
                  <TestTypeGrid
                    testType={getCurrentTestType()!}
                    tests={progressData.testTypes[getCurrentTestType()! as keyof typeof progressData.testTypes]}
                    progress={getTypeProgress(getCurrentTestType()! as keyof typeof progressData.testTypes)}
                    viewMode={viewMode}
                  />
                )}
              </TabsContent>
            ))}

            <TabsContent value="performance" className="mt-0">
              <ExamPerformanceTab examId={examId!} examName={examName} />
            </TabsContent>

            <TabsContent value="success-stories" className="mt-0">
              <SuccessStoriesTab examId={examId!} examName={examName} />
            </TabsContent>
          </div>
        </Tabs>
      </Card>
    </div>
  );
};

export default ExamDetail;
