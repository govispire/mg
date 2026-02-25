
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CategorySelector } from '@/components/global/CategorySelector';

import { useCategoryFilteredPerformance } from '@/hooks/useCategoryFilteredContent';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Calendar, Filter, TrendingUp, Target, Award, AlertTriangle } from 'lucide-react';

const PerformanceAnalytics = () => {
  const { performanceData, aggregatedStats, hasFilters, selectedCategories } = useCategoryFilteredPerformance();
  const [dateRange, setDateRange] = useState('last-30');
  const [selectedCategoryData, setSelectedCategoryData] = useState(performanceData[0]?.categoryId || '');

  const currentCategoryData = performanceData.find(data => data.categoryId === selectedCategoryData) || performanceData[0];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Performance Analytics</h1>
          <p className="text-gray-500">
            {hasFilters
              ? `Track your progress for selected categories`
              : 'Select your exam categories to see personalized analytics'
            }
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <CategorySelector />
          <div className="relative">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <div className="flex items-center">
                  <Calendar className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Date Range" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last-7">Last 7 days</SelectItem>
                <SelectItem value="last-30">Last 30 days</SelectItem>
                <SelectItem value="last-90">Last 90 days</SelectItem>
                <SelectItem value="all-time">All time</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>



      {/* Aggregated Stats */}
      {hasFilters && aggregatedStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Score</p>
                  <p className="text-2xl font-bold">{aggregatedStats.averageScore}%</p>
                </div>
                <Target className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Avg Percentile</p>
                  <p className="text-2xl font-bold">{aggregatedStats.averagePercentile}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Strong Areas</p>
                  <p className="text-2xl font-bold">{aggregatedStats.strongAreas}</p>
                </div>
                <Award className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Weak Areas</p>
                  <p className="text-2xl font-bold">{aggregatedStats.weakAreas}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {!hasFilters ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Select Your Categories
            </h3>
            <p className="text-gray-600 mb-4">
              Please select your exam categories using the Category Selector above to see your personalized performance analytics.
            </p>
            <div className="flex justify-center">
              <CategorySelector />
            </div>
          </CardContent>
        </Card>
      ) : performanceData.length === 0 ? (
        <Card>
          <CardContent className="pt-6 text-center">
            <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No Performance Data Available
            </h3>
            <p className="text-gray-600 mb-4">
              No performance data found for your selected categories. Start taking tests to see your analytics here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Category Selector for Multi-Category View */}
          {performanceData.length > 1 && (
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Select Category for Detailed Analysis</h3>
                  <Select value={selectedCategoryData} onValueChange={setSelectedCategoryData}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {performanceData.map((data) => (
                        <SelectItem key={data.categoryId} value={data.categoryId}>
                          {data.categoryName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Trend Chart */}
          {currentCategoryData && (
            <Card>
              <CardHeader>
                <CardTitle>
                  Performance Trend - {currentCategoryData.categoryName}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={currentCategoryData.progressTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="score" stroke="#5bbbfc" strokeWidth={2} activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="subject-performance" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="subject-performance">Subject Performance</TabsTrigger>
              <TabsTrigger value="weak-areas">Areas to Improve</TabsTrigger>
              <TabsTrigger value="test-history">Test History</TabsTrigger>
            </TabsList>

            {/* Subject Performance Tab */}
            <TabsContent value="subject-performance" className="space-y-4">
              {currentCategoryData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Subject Performance vs. Average - {currentCategoryData.categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={currentCategoryData.subjectPerformance} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="subject" />
                          <YAxis domain={[0, 100]} />
                          <Tooltip />
                          <Legend />
                          <Bar dataKey="score" name="Your Score" fill="#5bbbfc" />
                          <Bar dataKey="average" name="Average Score" fill="#98deff" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Weak Areas Tab */}
            <TabsContent value="weak-areas" className="space-y-4">
              {currentCategoryData && (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Strong Areas */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Award className="h-5 w-5 mr-2 text-green-600" />
                          Strong Areas
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentCategoryData.strongAreas.map((area, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                            <span className="font-medium">{area.area}</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {area.score}%
                            </Badge>
                          </div>
                        ))}
                      </CardContent>
                    </Card>

                    {/* Weak Areas */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <AlertTriangle className="h-5 w-5 mr-2 text-orange-600" />
                          Areas to Improve
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {currentCategoryData.weakAreas.map((area, index) => (
                          <div key={index} className="p-3 bg-orange-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{area.area}</span>
                              <Badge variant="outline" className="bg-orange-100 text-orange-800">
                                {area.score}%
                              </Badge>
                            </div>
                            {area.improvement && (
                              <p className="text-sm text-gray-600">{area.improvement}</p>
                            )}
                            <Button size="sm" variant="outline" className="mt-2 text-xs">
                              Practice Now
                            </Button>
                          </div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
                </>
              )}
            </TabsContent>

            {/* Test History Tab */}
            <TabsContent value="test-history" className="space-y-4">
              {currentCategoryData && (
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Test Performance - {currentCategoryData.categoryName}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Test Name
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Score
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Duration
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Action
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {currentCategoryData.recentTests.map((test, index) => (
                            <tr key={index}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {test.testName}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.date}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {test.score}/{test.maxScore}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {test.duration}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Button size="sm" variant="outline">View Details</Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default PerformanceAnalytics;
