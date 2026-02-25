import React, { useState } from 'react';
import { Target, BookOpen, FileText, Trophy, Lightbulb, Briefcase, ThumbsUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

interface RoadmapStep {
  icon: React.ReactNode;
  title: string;
  description: string;
  strategy: string[];
}

interface ExamRoadmapProps {
  examId: string;
  examName: string;
}

export const ExamRoadmap = ({ examId, examName }: ExamRoadmapProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);

  // Default roadmap steps with detailed strategies
  const roadmapSteps: RoadmapStep[] = [
    {
      icon: <Target className="w-4 h-4" />,
      title: "Set Goal",
      description: "Define target",
      strategy: [
        "Research exam pattern and syllabus thoroughly",
        "Set realistic target score based on previous cutoffs",
        "Understand marking scheme and negative marking",
        "Identify must-cover topics with high weightage"
      ]
    },
    {
      icon: <Lightbulb className="w-4 h-4" />,
      title: "Learn Basics",
      description: "Build foundation",
      strategy: [
        "Start with NCERT books for fundamental concepts",
        "Watch online lectures for difficult topics",
        "Make concise notes for quick revision",
        "Focus on understanding rather than memorizing"
      ]
    },
    {
      icon: <BookOpen className="w-4 h-4" />,
      title: "Study Smart",
      description: "Follow plan",
      strategy: [
        "Create a daily/weekly study schedule",
        "Cover high-weightage topics first",
        "Use standard reference books recommended by toppers",
        "Join online study groups for doubt clearing"
      ]
    },
    {
      icon: <FileText className="w-4 h-4" />,
      title: "Practice Tests",
      description: "Take mocks",
      strategy: [
        "Attempt full-length mock tests weekly",
        "Analyze mistakes and weak areas after each test",
        "Practice previous year papers extensively",
        "Maintain error log to avoid repeated mistakes"
      ]
    },
    {
      icon: <Briefcase className="w-4 h-4" />,
      title: "Revision",
      description: "Strengthen areas",
      strategy: [
        "Revise important formulas and concepts daily",
        "Focus more time on weak subjects",
        "Use flashcards for quick revision",
        "Take topic-wise tests to track improvement"
      ]
    },
    {
      icon: <ThumbsUp className="w-4 h-4" />,
      title: "Final Prep",
      description: "Confidence boost",
      strategy: [
        "Revise short notes and important formulas only",
        "Attempt final mock tests in exam conditions",
        "Stay calm and maintain positive mindset",
        "Take adequate rest before exam day"
      ]
    }
  ];

  const totalSlides = 3; // Roadmap + 2 advertisement slots

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  return (
    <>
      <Card className="p-4 bg-gradient-to-br from-primary/5 to-background relative overflow-hidden">
        {/* Carousel Container */}
        <div className="relative">
          {/* Slide Navigation */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-lg font-semibold text-foreground">
              {currentSlide === 0 ? 'Success Roadmap' : `Featured Content ${currentSlide}`}
            </h3>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={prevSlide} className="h-7 w-7 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex gap-1">
                {Array.from({ length: totalSlides }).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all ${
                      idx === currentSlide ? 'w-6 bg-primary' : 'w-1.5 bg-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <Button variant="ghost" size="sm" onClick={nextSlide} className="h-7 w-7 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Slides */}
          <div className="relative min-h-[200px]">
            {/* Roadmap Slide */}
            {currentSlide === 0 && (
              <div className="animate-fade-in">
                {/* Compact Roadmap */}
                <div className="flex items-center justify-between gap-2 px-4 py-6">
                  {/* START */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <span className="text-[10px] font-bold text-primary-foreground">START</span>
                    </div>
                  </div>

                  {/* Arrow */}
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/50 to-primary/20 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-primary/20"></div>
                  </div>

                  {/* Steps */}
                  {roadmapSteps.map((step, index) => (
                    <React.Fragment key={index}>
                      <button
                        onClick={() => setSelectedStep(step)}
                        className="flex flex-col items-center gap-1 group cursor-pointer hover:scale-110 transition-transform"
                      >
                        <div className="w-10 h-10 rounded-full bg-card border-2 border-primary flex items-center justify-center shadow-md text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                          {step.icon}
                        </div>
                        <span className="text-[10px] font-medium text-center max-w-[50px] leading-tight">{step.title}</span>
                      </button>
                      
                      {index < roadmapSteps.length - 1 && (
                        <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/20 to-primary/20 relative">
                          <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-primary/20"></div>
                        </div>
                      )}
                    </React.Fragment>
                  ))}

                  {/* Final Arrow */}
                  <div className="flex-1 h-0.5 bg-gradient-to-r from-primary/20 to-primary/50 relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-t-4 border-t-transparent border-b-4 border-b-transparent border-l-4 border-l-primary/50"></div>
                  </div>

                  {/* FINISH */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <Trophy className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-[10px] font-bold text-primary">FINISH</span>
                  </div>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-2">Click on any stage to view detailed strategy</p>
              </div>
            )}

            {/* Advertisement Slides */}
            {currentSlide === 1 && (
              <div className="animate-fade-in p-8 border-2 border-dashed border-muted rounded-lg bg-muted/10 text-center min-h-[180px] flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground italic">Advertisement Space 1</p>
                <p className="text-xs text-muted-foreground mt-2">Admins can customize this area</p>
              </div>
            )}

            {currentSlide === 2 && (
              <div className="animate-fade-in p-8 border-2 border-dashed border-muted rounded-lg bg-muted/10 text-center min-h-[180px] flex flex-col items-center justify-center">
                <p className="text-sm text-muted-foreground italic">Advertisement Space 2</p>
                <p className="text-xs text-muted-foreground mt-2">Admins can customize this area</p>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Strategy Detail Dialog */}
      <Dialog open={!!selectedStep} onOpenChange={() => setSelectedStep(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedStep?.icon}
              <span>{selectedStep?.title}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">{selectedStep?.description}</p>
            <div>
              <h4 className="font-semibold mb-3 text-sm">Clear Strategy:</h4>
              <ul className="space-y-2">
                {selectedStep?.strategy.map((item, index) => (
                  <li key={index} className="flex gap-2 text-sm">
                    <span className="text-primary font-semibold shrink-0">{index + 1}.</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
