import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { allSyllabusData, ExamSyllabusConfig } from '@/data/syllabusData';

interface ExamComparisonProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExams: string[];
  onRemoveExam: (examId: string) => void;
}

const ExamComparison: React.FC<ExamComparisonProps> = ({
  isOpen,
  onClose,
  selectedExams,
  onRemoveExam
}) => {
  const examsData = selectedExams
    .map(id => allSyllabusData[id])
    .filter(Boolean) as ExamSyllabusConfig[];
  
  if (examsData.length === 0) return null;
  
  // Get all unique subjects across all exams
  const allSubjects = new Set<string>();
  examsData.forEach(exam => {
    exam.tiers[0].subjects.forEach(subject => {
      allSubjects.add(subject.name);
    });
  });
  
  const subjectsList = Array.from(allSubjects);
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Compare Exams</DialogTitle>
        </DialogHeader>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted/50">
                <th className="p-3 text-left font-semibold border-b text-sm">Feature</th>
                {examsData.map(exam => (
                  <th key={exam.examId} className="p-3 text-center border-b min-w-[180px]">
                    <div className="flex flex-col items-center gap-2">
                      <img src={exam.logo} alt={exam.examName} className="w-10 h-10 object-contain" />
                      <span className="font-semibold text-sm">{exam.examName}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onRemoveExam(exam.examId)}
                        className="h-6 px-2 text-xs text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3 w-3 mr-1" />
                        Remove
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {/* Full Name */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Full Name</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center text-sm text-muted-foreground">
                    {exam.fullName}
                  </td>
                ))}
              </tr>
              
              {/* Stages */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Stages</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center">
                    <Badge variant="secondary" className="text-xs">{exam.stages}</Badge>
                  </td>
                ))}
              </tr>
              
              {/* Total Marks */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Total Marks (Stage 1)</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center">
                    <span className="font-bold text-emerald-600">{exam.tiers[0].totalMarks}</span>
                  </td>
                ))}
              </tr>
              
              {/* Duration */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Duration</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center text-sm">
                    {exam.tiers[0].duration}
                  </td>
                ))}
              </tr>
              
              {/* Negative Marking */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Negative Marking</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center text-sm text-muted-foreground">
                    {exam.tiers[0].negativeMarking}
                  </td>
                ))}
              </tr>
              
              {/* Sectional Cutoff */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Sectional Cutoff</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center">
                    {exam.tiers[0].sectionalCutoff ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                    ) : (
                      <XCircle className="h-5 w-5 text-muted-foreground mx-auto" />
                    )}
                  </td>
                ))}
              </tr>
              
              {/* Subjects Header */}
              <tr className="bg-muted/50">
                <td colSpan={examsData.length + 1} className="p-3 font-semibold text-sm">
                  Subject-wise Marks Distribution
                </td>
              </tr>
              
              {/* Subjects */}
              {subjectsList.map(subject => (
                <tr key={subject} className="hover:bg-muted/30">
                  <td className="p-3 border-b text-sm">{subject}</td>
                  {examsData.map(exam => {
                    const subjectData = exam.tiers[0].subjects.find(s => s.name === subject);
                    return (
                      <td key={exam.examId} className="p-3 border-b text-center">
                        {subjectData ? (
                          <span className="font-semibold">{subjectData.marks}</span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
              
              {/* Total Topics */}
              <tr className="bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Total Topics</td>
                {examsData.map(exam => {
                  const totalTopics = exam.tiers.reduce((sum, tier) => 
                    sum + tier.subjects.reduce((s, sub) => s + sub.topics.length, 0), 0
                  );
                  return (
                    <td key={exam.examId} className="p-3 border-b text-center">
                      <span className="font-bold text-purple-600">{totalTopics}</span>
                    </td>
                  );
                })}
              </tr>
              
              {/* Number of Tiers/Stages */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Number of Stages</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center">
                    <Badge variant="outline">{exam.tiers.length}</Badge>
                  </td>
                ))}
              </tr>
              
              {/* Exam Date */}
              <tr className="hover:bg-muted/30">
                <td className="p-3 border-b font-medium text-sm">Expected Exam Date</td>
                {examsData.map(exam => (
                  <td key={exam.examId} className="p-3 border-b text-center text-sm">
                    <Badge variant="secondary">{exam.examDate}</Badge>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
        
        {examsData.length < 2 && (
          <Card className="mt-4 border-dashed">
            <CardContent className="p-4 text-center text-muted-foreground text-sm">
              Select at least 2 exams to compare their syllabus structure
            </CardContent>
          </Card>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ExamComparison;
