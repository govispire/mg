import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, TrendingUp, Quote, Award } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface SuccessStoriesTabProps {
  examId: string;
  examName: string;
}

export const SuccessStoriesTab: React.FC<SuccessStoriesTabProps> = ({ examId, examName }) => {
  const hallOfFame = [
    {
      id: 1,
      name: 'Rahul Sharma',
      air: 1,
      year: '2024',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul',
      score: 485,
      maxScore: 500,
      testimonial: 'Consistent practice and strategic preparation helped me achieve my dream rank. The mock tests were incredibly helpful in building my confidence.',
      tips: ['Daily practice sessions', 'Focus on weak areas', 'Regular revision', 'Mock test analysis']
    },
    {
      id: 2,
      name: 'Priya Patel',
      air: 5,
      year: '2024',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
      score: 472,
      maxScore: 500,
      testimonial: 'Time management and sectional tests played a crucial role in my success. Understanding the exam pattern thoroughly gave me an edge.',
      tips: ['Time-bound practice', 'Previous year papers', 'Subject-wise preparation', 'Mental fitness']
    },
    {
      id: 3,
      name: 'Amit Kumar',
      air: 12,
      year: '2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amit',
      score: 468,
      maxScore: 500,
      testimonial: 'The detailed analytics helped me identify my strengths and weaknesses. I focused on improving my weak areas while maintaining my strong subjects.',
      tips: ['Analytics-driven study', 'Consistent schedule', 'Speed & accuracy', 'Group discussions']
    },
    {
      id: 4,
      name: 'Sneha Reddy',
      air: 18,
      year: '2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sneha',
      score: 462,
      maxScore: 500,
      testimonial: 'Believing in myself and staying focused throughout the journey led me to success. Mock tests helped me understand the exam pattern better.',
      tips: ['Stay positive', 'Mock tests are crucial', 'Learn from mistakes', 'Maintain consistency']
    },
    {
      id: 5,
      name: 'Vikram Singh',
      air: 23,
      year: '2024',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Vikram',
      score: 458,
      maxScore: 500,
      testimonial: 'Strategic planning and disciplined study routine worked wonders. I made sure to analyze each test thoroughly.',
      tips: ['Plan your study schedule', 'Focus on accuracy', 'Regular practice', 'Time management']
    },
    {
      id: 6,
      name: 'Anjali Gupta',
      air: 35,
      year: '2023',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Anjali',
      score: 452,
      maxScore: 500,
      testimonial: 'Dedication and perseverance are the keys to cracking this exam. Never lose hope and keep working hard.',
      tips: ['Never give up', 'Analyze performance regularly', 'Stay healthy', 'Seek guidance']
    }
  ];

  return (
    <div className="space-y-8">
      {/* Hall of Fame Header */}
      <div className="bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-orange-500/20 p-8 rounded-lg border-2 border-amber-500/30">
        <div className="flex items-center justify-center gap-3 mb-3">
          <Award className="h-10 w-10 text-amber-500" />
          <h2 className="text-3xl font-bold text-center">
            {examName} Hall of Fame
          </h2>
          <Trophy className="h-10 w-10 text-amber-500" />
        </div>
        <p className="text-center text-muted-foreground">
          Celebrating our toppers who successfully cleared {examName}
        </p>
      </div>

      {/* Hall of Fame Photo Frames Grid */}
      <Card className="p-6">
        <h3 className="text-2xl font-bold mb-6 text-center">Top Rankers Photo Gallery</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-4">
          {hallOfFame.map((story) => (
            <div key={story.id} className="group relative">
              <div className="aspect-square rounded-lg overflow-hidden border-4 border-primary/20 group-hover:border-primary/60 transition-all shadow-lg">
                <Avatar className="w-full h-full">
                  <AvatarImage src={story.avatar} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {story.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                {story.air <= 3 && (
                  <div className="absolute top-2 right-2 bg-amber-500 rounded-full p-2 shadow-lg">
                    <Trophy className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              <div className="mt-2 text-center">
                <p className="font-semibold text-sm">{story.name}</p>
                <Badge variant="secondary" className="text-xs mt-1">
                  AIR {story.air}
                </Badge>
              </div>
            </div>
          ))}
          
          {/* Waiting Frame */}
          <div className="group relative">
            <div className="aspect-square rounded-lg border-4 border-dashed border-primary/40 flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10 hover:from-primary/10 hover:to-primary/20 transition-all">
              <div className="text-center p-4">
                <div className="text-4xl mb-2">🎯</div>
                <p className="font-bold text-sm">Frame is</p>
                <p className="font-bold text-sm">waiting</p>
                <p className="font-bold text-sm">for you!</p>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Hall of Fame Detailed Cards */}
      <div className="grid gap-6">
        {hallOfFame.map((story) => (
          <Card key={story.id} className="p-6 hover:shadow-lg transition-shadow">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Avatar className="h-20 w-20 border-4 border-primary/20">
                    <AvatarImage src={story.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                      {story.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {story.air <= 3 && (
                    <div className="absolute -top-2 -right-2 bg-amber-500 rounded-full p-2">
                      <Trophy className="h-5 w-5 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{story.name}</h3>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge 
                      variant={story.air <= 10 ? "default" : "secondary"} 
                      className="text-lg px-4 py-1 font-bold flex items-center gap-1"
                    >
                      <Trophy className="h-4 w-4" />
                      AIR {story.air}
                    </Badge>
                    <Badge variant="outline" className="text-sm">{story.year}</Badge>
                  </div>
                </div>
              </div>
              <div className="text-center bg-green-50 dark:bg-green-950 rounded-lg p-4 border-2 border-green-500/30">
                <p className="text-sm text-muted-foreground">Score</p>
                <p className="text-3xl font-bold text-green-600 dark:text-green-400">{story.score}/{story.maxScore}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {Math.round((story.score / story.maxScore) * 100)}%
                </p>
              </div>
            </div>

            {/* Testimonial */}
            <div className="mb-6 relative">
              <Quote className="h-8 w-8 text-primary/20 absolute -top-2 -left-2" />
              <p className="text-muted-foreground italic pl-6 relative z-10">
                "{story.testimonial}"
              </p>
            </div>

            {/* Success Tips */}
            <div>
              <h4 className="font-semibold mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-amber-500" />
                Success Tips
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {story.tips.map((tip, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                    <span>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Success Videos Section */}
      <div className="space-y-4">
        <h3 className="text-2xl font-bold text-center">Success Stories & Interviews</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((num) => (
            <Card key={num} className="p-6 hover:shadow-lg transition-shadow">
              <div className="aspect-video bg-muted rounded-lg mb-4 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-2">🎥</div>
                  <p className="text-sm text-muted-foreground">Success Video {num}</p>
                </div>
              </div>
              <h4 className="font-semibold mb-2">Journey to Success - Part {num}</h4>
              <p className="text-sm text-muted-foreground">
                Learn from the experiences of toppers who cracked {examName}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom CTA */}
      <Card className="p-8 text-center bg-gradient-to-br from-primary/5 to-primary/10">
        <TrendingUp className="h-12 w-12 text-primary mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">You Can Be Next!</h3>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Start your preparation journey today with our comprehensive test series and join the ranks of successful candidates.
        </p>
      </Card>
    </div>
  );
};
