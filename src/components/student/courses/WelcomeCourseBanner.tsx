import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Sparkles, ArrowRight, Target, Users, Trophy } from 'lucide-react';
import { CategorySelector } from '@/components/global/CategorySelector';

interface WelcomeCourseBannerProps {
  hasCategories: boolean;
  selectedCount: number;
  courseCount: number;
}

export const WelcomeCourseBanner: React.FC<WelcomeCourseBannerProps> = ({
  hasCategories,
  selectedCount,
  courseCount
}) => {
  if (hasCategories) {
    return (
      <div className="bg-gradient-to-r from-primary to-primary/80 rounded-2xl p-6 text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
        </div>
        
        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-white/20 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Personalized for You
              </Badge>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold">Your Learning Journey</h1>
            <p className="text-white/80 mt-1">
              {courseCount} courses matched for your {selectedCount} selected {selectedCount === 1 ? 'category' : 'categories'}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{courseCount}</div>
                <div className="text-xs text-white/70">Courses</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50+</div>
                <div className="text-xs text-white/70">Instructors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">2L+</div>
                <div className="text-xs text-white/70">Students</div>
              </div>
            </div>
            <CategorySelector />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-muted/50 to-muted rounded-2xl p-8 text-center relative overflow-hidden">
      {/* Decorative elements */}
      <div className="absolute top-4 right-4 opacity-20">
        <BookOpen className="h-24 w-24 text-primary" />
      </div>
      
      <div className="relative max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <Target className="h-8 w-8 text-primary" />
        </div>
        
        <h1 className="text-2xl md:text-3xl font-bold text-foreground">
          Welcome to Course Library
        </h1>
        
        <p className="text-muted-foreground mt-3 text-lg">
          Select your exam categories to discover courses tailored just for you
        </p>
        
        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mt-6 mb-6">
          <Card className="p-4 bg-background/50 border-0 shadow-sm">
            <BookOpen className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">100+ Courses</div>
            <div className="text-xs text-muted-foreground">Comprehensive content</div>
          </Card>
          <Card className="p-4 bg-background/50 border-0 shadow-sm">
            <Users className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">Expert Faculty</div>
            <div className="text-xs text-muted-foreground">Industry leaders</div>
          </Card>
          <Card className="p-4 bg-background/50 border-0 shadow-sm">
            <Trophy className="h-6 w-6 text-primary mx-auto mb-2" />
            <div className="text-sm font-medium">Proven Results</div>
            <div className="text-xs text-muted-foreground">Top selections</div>
          </Card>
        </div>
        
        <CategorySelector />
      </div>
    </div>
  );
};
