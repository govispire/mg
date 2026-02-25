import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ExamInstructions } from '@/components/student/exam/ExamInstructions';
import { ExamInterface as IBPSExamInterface } from '@/components/student/exam/ExamInterface';
import { TestAnalysisModal } from '@/components/student/exam/TestAnalysisModal';
import { TestSolutions } from '@/components/student/exam/TestSolutions';
import { ExamConfig, ExamQuestion } from '@/types/exam';
import { TestAnalysisData } from '@/data/testAnalysisData';
import { generateAnalysisFromExam } from '@/utils/examAnalysis';
import { toast } from 'sonner';

// This is the IBPS-style exam interface for full tests
// It replaces the old ExamInterface with the new professional IBPS design

interface ExamInterfaceProps {
  isPreview?: boolean;
}

// Generate sample exam data
const generateSampleExam = (examId: string, category: string): ExamConfig => {
  const sections = [
    { id: 'reasoning', name: 'Reasoning Ability', questionCount: 35 },
    { id: 'quantitative', name: 'Quantitative Aptitude', questionCount: 35 },
    { id: 'english', name: 'English Language', questionCount: 30 },
  ];

  const questions: ExamQuestion[] = [];
  let questionNumber = 1;

  sections.forEach(section => {
    for (let i = 0; i < section.questionCount; i++) {
      questions.push({
        id: `${section.id}-q${i + 1}`,
        sectionId: section.id,
        sectionName: section.name,
        questionNumber: questionNumber++,
        type: 'mcq',
        question: `Sample question ${questionNumber} for ${section.name}`,
        options: [
          { id: `opt-1`, text: 'Option A' },
          { id: `opt-2`, text: 'Option B' },
          { id: `opt-3`, text: 'Option C' },
          { id: `opt-4`, text: 'Option D' },
        ],
        correctAnswer: 'opt-1',
        marks: 1,
        negativeMarks: 0.25,
      });
    }
  });

  return {
    id: examId,
    title: `${category?.toUpperCase()} - Full Mock Test`,
    totalDuration: 60, // 60 minutes
    languages: ['English', 'Hindi'],
    instructions: [],
    sections: sections.map(section => ({
      id: section.id,
      name: section.name,
      questionsCount: section.questionCount,
      questions: questions.filter(q => q.sectionId === section.id),
    })),
  };
};

const ExamInterface: React.FC<ExamInterfaceProps> = ({ isPreview = false }) => {
  const { category, examId } = useParams();
  const navigate = useNavigate();
  const [showInstructions, setShowInstructions] = useState(true);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [analysisData, setAnalysisData] = useState<TestAnalysisData | null>(null);
  const [examResponses, setExamResponses] = useState<Record<string, string | string[] | null>>({});
  const [examConfig] = useState<ExamConfig>(() =>
    generateSampleExam(examId || 'test', category || 'general')
  );

  // Enter fullscreen on mount
  useEffect(() => {
    const enterFullscreen = async () => {
      try {
        await document.documentElement.requestFullscreen();
      } catch (err) {
        console.log('Fullscreen not supported or denied');
      }
    };
    if (!isPreview) {
      enterFullscreen();
    }
  }, [isPreview]);

  const handleSubmit = (responses: Record<string, string | string[] | null>) => {
    // Exit fullscreen first
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }

    // Store responses for solution viewer
    setExamResponses(responses);

    // Generate comprehensive analysis data
    const analysis = generateAnalysisFromExam(examConfig, responses);

    // Show success toast
    toast.success('Exam Submitted Successfully!', {
      description: `Score: ${analysis.score}% | Correct: ${analysis.sectionWiseData.reduce((sum, s) => sum + s.correct, 0)} | Wrong: ${analysis.sectionWiseData.reduce((sum, s) => sum + s.wrong, 0)}`
    });

    // Show analysis modal
    setAnalysisData(analysis);
    setShowAnalysis(true);
  };

  const handleCloseAnalysis = () => {
    setShowAnalysis(false);
    // Navigate back to dashboard or previous page
    navigate('/student/dashboard');
  };

  const handleViewSolutions = () => {
    setShowAnalysis(false);
    setShowSolutions(true);
  };

  const handleCloseSolutions = () => {
    setShowSolutions(false);
    setShowAnalysis(true);
  };

  if (showInstructions) {
    return (
      <ExamInstructions
        examConfig={examConfig}
        onComplete={() => setShowInstructions(false)}
      />
    );
  }

  return (
    <>
      <IBPSExamInterface
        examConfig={examConfig}
        onSubmit={handleSubmit}
        userName="Student"
      />

      {/* Test Analysis Modal */}
      {analysisData && (
        <TestAnalysisModal
          isOpen={showAnalysis}
          onClose={handleCloseAnalysis}
          analysisData={analysisData}
          onViewSolutions={handleViewSolutions}
        />
      )}

      {/* Test Solutions Viewer */}
      <TestSolutions
        examConfig={examConfig}
        responses={examResponses}
        isOpen={showSolutions}
        onClose={handleCloseSolutions}
      />
    </>
  );
};

export default ExamInterface;
