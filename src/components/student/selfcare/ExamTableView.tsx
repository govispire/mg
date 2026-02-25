
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, FileText, Trophy, Target, Calendar } from 'lucide-react';
import { ExamApplication } from '@/hooks/useSelfCareExams';

interface ExamTableViewProps {
  exams: ExamApplication[];
}

export const ExamTableView: React.FC<ExamTableViewProps> = ({ exams }) => {
  const [selectedYear, setSelectedYear] = useState('All Years');
  
  const years = ['All Years', '2025', '2024'];
  
  const filteredExams = selectedYear === 'All Years' 
    ? exams 
    : exams.filter(exam => new Date(exam.firstExamDate).getFullYear().toString() === selectedYear);

  const getStageIcon = (status: string) => {
    switch (status) {
      case 'cleared':
      case 'selected':
        return <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 text-green-600" />;
      case 'not-cleared':
      case 'not-selected':
        return <XCircle className="h-3 w-3 sm:h-4 sm:w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-blue-600" />;
      default:
        return <span className="text-gray-400 text-xs">N/A</span>;
    }
  };

  const getStageText = (stage: any) => {
    if (stage.status === 'n/a') return <span className="text-gray-400 text-xs">N/A</span>;
    if (stage.status === 'pending') return (
      <div className="flex items-center gap-1">
        <Clock className="h-3 w-3 text-blue-600" />
        <span className="text-blue-600 text-xs">Pending</span>
        {stage.date && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-2 w-2" />
            {new Date(stage.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    );
    return (
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-1">
          {getStageIcon(stage.status)}
          <span className={`text-xs font-medium ${
            stage.status === 'cleared' || stage.status === 'selected' ? 'text-green-600' : 'text-red-600'
          }`}>
            {stage.status === 'cleared' || stage.status === 'selected' ? 'Cleared' : 'Failed'}
          </span>
        </div>
        {stage.score && <div className="text-xs text-gray-600 font-mono">{stage.score}</div>}
        {stage.date && (
          <div className="text-xs text-gray-500 flex items-center gap-1">
            <Calendar className="h-2 w-2" />
            {new Date(stage.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
          </div>
        )}
      </div>
    );
  };

  const getFinalStatusBadge = (status: string) => {
    switch (status) {
      case 'selected':
        return (
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600">
            <Trophy className="h-3 w-3 mr-1" />
            SELECTED
          </Badge>
        );
      case 'not-selected':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-200">NOT SELECTED</Badge>;
      default:
        return <Badge variant="outline" className="text-blue-600 border-blue-200">IN PROGRESS</Badge>;
    }
  };

  const getExamIcon = (exam: ExamApplication) => {
    const categoryColors = {
      'banking': 'bg-gradient-to-r from-red-400 to-red-600',
      'ssc': 'bg-gradient-to-r from-green-400 to-green-600',
      'railway': 'bg-gradient-to-r from-blue-400 to-blue-600',
      'upsc': 'bg-gradient-to-r from-purple-400 to-purple-600',
      'state-psc': 'bg-gradient-to-r from-orange-400 to-orange-600',
      'judicial': 'bg-gradient-to-r from-indigo-400 to-indigo-600',
      'defence': 'bg-gradient-to-r from-yellow-400 to-yellow-600'
    };
    
    const colorClass = categoryColors[exam.category as keyof typeof categoryColors] || 'bg-gradient-to-r from-gray-400 to-gray-600';
    return <div className={`w-2 h-2 rounded-full ${colorClass}`}></div>;
  };

  const getStageByType = (stages: any[], type: string) => {
    const typeMap = {
      'prelims': ['prelim', 'tier i', 'cbt 1', 'written'],
      'mains': ['main', 'tier ii', 'cbt 2'],
      'interview': ['interview', 'medical', 'physical'],
      'final': ['final']
    };
    
    return stages.find(s => 
      typeMap[type as keyof typeof typeMap]?.some(keyword => 
        s.name.toLowerCase().includes(keyword)
      )
    );
  };

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
            <Target className="h-5 w-5 text-blue-600" />
            <span>Your Exams ({filteredExams.length})</span>
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            {years.map((year) => (
              <Button
                key={year}
                variant={selectedYear === year ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedYear(year)}
                className={selectedYear === year ? "bg-purple-600 hover:bg-purple-700" : ""}
              >
                {year}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="min-w-[200px] font-semibold">Exam</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Date</TableHead>
                <TableHead className="hidden md:table-cell font-semibold">Fee</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">Place</TableHead>
                <TableHead className="font-semibold">Stage 1</TableHead>
                <TableHead className="hidden sm:table-cell font-semibold">Stage 2</TableHead>
                <TableHead className="hidden md:table-cell font-semibold">Stage 3</TableHead>
                <TableHead className="hidden lg:table-cell font-semibold">Final</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredExams.map((exam) => {
                return (
                  <TableRow key={exam.id} className="hover:bg-blue-50/50 transition-colors">
                    <TableCell className="py-4">
                      <div className="flex items-center gap-2">
                        {getExamIcon(exam)}
                        <div>
                          <span className="font-medium text-sm sm:text-base">{exam.name}</span>
                          <div className="text-xs text-gray-500 sm:hidden">
                            {new Date(exam.firstExamDate).toLocaleDateString('en-GB', { 
                              day: '2-digit', 
                              month: 'short', 
                              year: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      <div className="text-sm">
                        {new Date(exam.firstExamDate).toLocaleDateString('en-GB', { 
                          day: '2-digit', 
                          month: 'short', 
                          year: '2-digit' 
                        })}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="text-sm font-mono">₹{exam.examFeeAmount}</div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <div className="text-sm">{exam.placeOfExam}</div>
                    </TableCell>
                    <TableCell>
                      {exam.stages[0] ? getStageText(exam.stages[0]) : <span className="text-gray-400 text-xs">N/A</span>}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {exam.stages[1] ? getStageText(exam.stages[1]) : <span className="text-gray-400 text-xs">N/A</span>}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {exam.stages[2] ? getStageText(exam.stages[2]) : <span className="text-gray-400 text-xs">N/A</span>}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      {exam.stages[exam.stages.length - 1] ? (
                        <div className="flex items-center gap-1">
                          {exam.stages[exam.stages.length - 1].status === 'selected' && <Trophy className="h-3 w-3 text-yellow-500" />}
                          {getStageText(exam.stages[exam.stages.length - 1])}
                        </div>
                      ) : <span className="text-gray-400 text-xs">N/A</span>}
                    </TableCell>
                    <TableCell>
                      {getFinalStatusBadge(exam.finalStatus)}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
        
        {filteredExams.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Exams Found</h3>
            <p className="text-gray-500">No exams found for the selected year.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
