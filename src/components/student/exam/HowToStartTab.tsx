import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Target, BookOpen, Calendar, TrendingUp } from 'lucide-react';

interface HowToStartTabProps {
  examId: string;
  examName: string;
}

export const HowToStartTab: React.FC<HowToStartTabProps> = ({ examId, examName }) => {
  const steps = [
    {
      id: 1,
      title: 'Understand the Exam Pattern',
      description: 'Familiarize yourself with the exam structure, marking scheme, and duration',
      icon: <Target className="h-6 w-6" />,
      tips: ['Review previous year papers', 'Study the exam blueprint', 'Understand negative marking']
    },
    {
      id: 2,
      title: 'Create a Study Plan',
      description: 'Design a realistic and comprehensive study schedule',
      icon: <Calendar className="h-6 w-6" />,
      tips: ['Allocate time for each subject', 'Include revision periods', 'Set weekly targets']
    },
    {
      id: 3,
      title: 'Gather Study Materials',
      description: 'Collect quality resources including books, notes, and online materials',
      icon: <BookOpen className="h-6 w-6" />,
      tips: ['NCERT textbooks', 'Standard reference books', 'Online courses and videos']
    },
    {
      id: 4,
      title: 'Start with Basics',
      description: 'Build a strong foundation before moving to advanced topics',
      icon: <TrendingUp className="h-6 w-6" />,
      tips: ['Master fundamentals first', 'Clear conceptual doubts', 'Practice regularly']
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <h2 className="text-2xl font-bold mb-2">Getting Started with {examName}</h2>
        <p className="text-muted-foreground">
          Follow this comprehensive roadmap to begin your preparation journey effectively
        </p>
      </Card>

      <div className="grid gap-6">
        {steps.map((step, index) => (
          <Card key={step.id} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {step.icon}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline">Step {step.id}</Badge>
                  <h3 className="text-xl font-bold">{step.title}</h3>
                </div>
                <p className="text-muted-foreground mb-4">{step.description}</p>
                <div className="space-y-2">
                  <p className="font-semibold text-sm">Key Points:</p>
                  {step.tips.map((tip, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                      <span>{tip}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
