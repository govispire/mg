import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, BookOpen, Users, Clock, Star, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryExam {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  color: string;
  courseCount: number;
  studentCount: number;
  isPopular?: boolean;
}

interface CategoryExamGridProps {
  exams: CategoryExam[];
  selectedExam: string | null;
  onExamSelect: (examId: string) => void;
}

export const CategoryExamGrid: React.FC<CategoryExamGridProps> = ({
  exams,
  selectedExam,
  onExamSelect
}) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {exams.map((exam) => (
        <Card
          key={exam.id}
          onClick={() => onExamSelect(exam.id)}
          className={cn(
            "relative p-4 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border",
            selectedExam === exam.id
              ? "border-primary border-2 bg-primary/5 shadow-md"
              : "border-border bg-card shadow-sm hover:border-primary/50"
          )}
        >
          {exam.isPopular && (
            <Badge className="absolute -top-2 -right-2 bg-orange-500 text-white text-[10px] px-1.5 py-0.5">
              <TrendingUp className="h-2.5 w-2.5 mr-0.5" />
              Hot
            </Badge>
          )}

          <div className="flex flex-col items-center text-center space-y-2">
            {exam.icon && exam.icon.startsWith('http') ? (
              <div className="w-12 h-12 rounded-xl overflow-hidden bg-white shadow-sm border border-border flex items-center justify-center">
                <img
                  src={exam.icon}
                  alt={exam.shortName}
                  className="w-10 h-10 object-contain"
                />
              </div>
            ) : (
              <div
                className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-sm",
                  exam.color
                )}
              >
                {exam.icon}
              </div>
            )}

            <div>
              <h3 className="font-semibold text-sm text-foreground leading-tight">
                {exam.shortName}
              </h3>
              <p className="text-[10px] text-muted-foreground mt-0.5">
                {exam.courseCount} courses
              </p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

// Category header with icon and stats
interface CategoryHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  stats: { label: string; value: string | number }[];
  color: string;
}

export const CategoryHeader: React.FC<CategoryHeaderProps> = ({
  icon,
  title,
  subtitle,
  stats,
  color
}) => {
  return (
    <div className={cn(
      "rounded-2xl p-6 text-white",
      color
    )}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center text-2xl">
            {icon}
          </div>
          <div>
            <h1 className="text-2xl font-bold">{title}</h1>
            <p className="text-white/80 text-sm mt-0.5">{subtitle}</p>
          </div>
        </div>

        <div className="flex gap-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-xl font-bold">{stat.value}</div>
              <div className="text-white/70 text-xs">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
