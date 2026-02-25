
import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Target, CheckCircle, XCircle, Clock, Users, Trophy } from 'lucide-react';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { useIsMobile } from '@/hooks/use-mobile';

interface OverallAnalysisTabProps {
  analysisData: TestAnalysisData;
}

export const OverallAnalysisTab: React.FC<OverallAnalysisTabProps> = ({ analysisData }) => {
  const isMobile = useIsMobile();
  
  const quickInfoCards = [
    {
      title: "Total Attempted",
      value: analysisData.sectionWiseData.reduce((sum, section) => sum + section.attempted, 0),
      icon: Target,
      color: "blue"
    },
    {
      title: "Correct",
      value: analysisData.sectionWiseData.reduce((sum, section) => sum + section.correct, 0),
      icon: CheckCircle,
      color: "green"
    },
    {
      title: "Wrong",
      value: analysisData.sectionWiseData.reduce((sum, section) => sum + section.wrong, 0),
      icon: XCircle,
      color: "red"
    },
    {
      title: "Skipped",
      value: analysisData.sectionWiseData.reduce((sum, section) => sum + section.skipped, 0),
      icon: Clock,
      color: "yellow"
    },
    {
      title: "Average Score",
      value: 45,
      icon: Users,
      color: "purple"
    },
    {
      title: "Topper Score",
      value: 90,
      icon: Trophy,
      color: "orange"
    }
  ];

  const performanceData = [
    { section: 'Reasoning', yourScore: 28, topperScore: 33 },
    { section: 'English', yourScore: 22, topperScore: 28 },
    { section: 'Quantitative', yourScore: 20, topperScore: 32 }
  ];

  const getColorClasses = (color: string) => {
    const colors = {
      blue: "from-blue-50 to-blue-100 border-blue-200 text-blue-600",
      green: "from-green-50 to-green-100 border-green-200 text-green-600",
      red: "from-red-50 to-red-100 border-red-200 text-red-600",
      yellow: "from-yellow-50 to-yellow-100 border-yellow-200 text-yellow-600",
      purple: "from-purple-50 to-purple-100 border-purple-200 text-purple-600",
      orange: "from-orange-50 to-orange-100 border-orange-200 text-orange-600"
    };
    return colors[color as keyof typeof colors] || colors.blue;
  };

  // Enhanced Mobile Section Cards
  const MobileSectionCards = () => (
    <div className="space-y-3">
      {analysisData.sectionWiseData.map((section, index) => (
        <Card key={section.sectionName} className="p-3 border shadow-sm">
          <div className="space-y-3">
            {/* Header */}
            <div className="flex justify-between items-start">
              <h4 className="font-semibold text-sm leading-tight flex-1 pr-2">{section.sectionName}</h4>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">#{section.rank}</span>
                <span className="text-xs font-medium text-blue-600">{section.percentile}%</span>
              </div>
            </div>
            
            {/* Score and Accuracy Row */}
            <div className="flex justify-between items-center py-2 bg-gray-50 rounded px-3">
              <div className="text-center">
                <p className="text-xs text-gray-500">Score</p>
                <p className="font-bold text-sm">{section.score}/{section.maxScore}</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Accuracy</p>
                <p className="font-bold text-sm text-green-600">{section.accuracy}%</p>
              </div>
              <div className="text-center">
                <p className="text-xs text-gray-500">Time</p>
                <p className="font-bold text-sm">{section.timeSpent}m</p>
              </div>
            </div>
            
            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-green-50 rounded p-2">
                <p className="text-xs text-green-600 font-medium">Correct</p>
                <p className="font-bold text-green-700">{section.correct}</p>
              </div>
              <div className="bg-red-50 rounded p-2">
                <p className="text-xs text-red-600 font-medium">Wrong</p>
                <p className="font-bold text-red-700">{section.wrong}</p>
              </div>
              <div className="bg-gray-50 rounded p-2">
                <p className="text-xs text-gray-600 font-medium">Skipped</p>
                <p className="font-bold text-gray-700">{section.skipped}</p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Performance</span>
                <span className="text-xs font-semibold">{section.accuracy}%</span>
              </div>
              <Progress value={section.accuracy} className="h-2" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );

  // Responsive Table Component
  const ResponsiveTable = () => (
    <div className="w-full">
      {isMobile ? (
        <MobileSectionCards />
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-[#003366]">
              <TableRow>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[120px]">Section</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[80px]">Attempted</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[100px]">Correct/Wrong</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[80px]">Skipped</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[80px]">Score</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[60px]">Rank</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[80px]">Percentile</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[100px]">Accuracy</TableHead>
                <TableHead className="text-white text-sm px-3 py-2 min-w-[60px]">Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {analysisData.sectionWiseData.map((section, index) => (
                <TableRow key={section.sectionName} className={index % 2 === 0 ? "bg-white" : "bg-[#DCEBFA]"}>
                  <TableCell className="font-medium text-sm px-3 py-2">
                    {section.sectionName}
                  </TableCell>
                  <TableCell className="text-sm px-3 py-2">{section.attempted}</TableCell>
                  <TableCell className="text-sm px-3 py-2">
                    <span className="text-green-600">{section.correct}</span>
                    /
                    <span className="text-red-600">{section.wrong}</span>
                  </TableCell>
                  <TableCell className="text-sm px-3 py-2">{section.skipped}</TableCell>
                  <TableCell className="text-sm px-3 py-2">{section.score}/{section.maxScore}</TableCell>
                  <TableCell className="text-sm px-3 py-2">{section.rank}</TableCell>
                  <TableCell className="text-sm px-3 py-2">{section.percentile}%</TableCell>
                  <TableCell className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Progress value={section.accuracy} className="w-16 h-2" />
                      <span className="text-xs">{section.accuracy}%</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm px-3 py-2">{section.timeSpent}m</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-4 sm:space-y-6 p-1">
      {/* Quick Info Cards - Enhanced Mobile Layout */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3 lg:gap-4">
        {quickInfoCards.map((card, index) => (
          <Card 
            key={card.title}
            className={`p-2 sm:p-3 lg:p-4 bg-gradient-to-br ${getColorClasses(card.color)} border shadow-sm`}
          >
            <div className="flex items-center justify-between gap-1">
              <div className="min-w-0 flex-1">
                <div className="text-[10px] sm:text-xs font-medium text-gray-600 mb-0.5 sm:mb-1 leading-tight">
                  {isMobile && card.title.length > 10 ? 
                    card.title.split(' ').slice(0, 2).join(' ') : card.title}
                </div>
                <div className={`text-xs sm:text-sm lg:text-lg font-bold truncate`}>
                  {card.value}
                </div>
              </div>
              <card.icon className={`h-3 w-3 sm:h-4 sm:w-4 lg:h-5 lg:w-5 shrink-0 opacity-70`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Section-wise Analysis */}
      <Card className="p-3 sm:p-4 lg:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Section-wise Analysis</h3>
        <ResponsiveTable />
      </Card>

      {/* Performance Graph - Enhanced Mobile Optimization */}
      <Card className="p-3 sm:p-4 lg:p-6 shadow-sm">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold mb-3 sm:mb-4 lg:mb-6">Performance Comparison</h3>
        <div className="w-full">
          <ResponsiveContainer width="100%" height={isMobile ? 220 : 300}>
            <LineChart 
              data={performanceData}
              margin={{
                top: 15,
                right: isMobile ? 15 : 30,
                left: isMobile ? 5 : 20,
                bottom: isMobile ? 60 : 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e7ff" />
              <XAxis 
                dataKey="section" 
                fontSize={isMobile ? 10 : 12}
                interval={0}
                angle={isMobile ? -45 : 0}
                textAnchor={isMobile ? "end" : "middle"}
                height={isMobile ? 70 : 50}
                tick={{ fontSize: isMobile ? 10 : 12 }}
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
              <Line 
                type="monotone" 
                dataKey="yourScore" 
                stroke="#3b82f6" 
                strokeWidth={isMobile ? 2 : 3}
                name="Your Score"
                dot={{ r: isMobile ? 3 : 4, fill: '#3b82f6' }}
                activeDot={{ r: isMobile ? 5 : 6, fill: '#1d4ed8' }}
              />
              <Line 
                type="monotone" 
                dataKey="topperScore" 
                stroke="#10b981" 
                strokeWidth={isMobile ? 2 : 3}
                name="Topper Score"
                dot={{ r: isMobile ? 3 : 4, fill: '#10b981' }}
                activeDot={{ r: isMobile ? 5 : 6, fill: '#047857' }}
              />
            </LineChart>
          </ResponsiveContainer>
          
          {/* Mobile Legend */}
          {isMobile && (
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-blue-500 rounded"></div>
                <span>Your Score</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-3 h-0.5 bg-green-500 rounded"></div>
                <span>Topper Score</span>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
