import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface Advertisement {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  bgColor: string;
}

interface ExamAdvertisementCarouselProps {
  examId: string;
  examName: string;
}

export const ExamAdvertisementCarousel: React.FC<ExamAdvertisementCarouselProps> = ({ examId, examName }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Mock advertisement data - would be fetched from API based on examId
  const advertisements: Advertisement[] = [
    {
      id: '1',
      title: `${examName} - Complete Study Package`,
      description: 'Get access to 500+ practice tests, video lectures, and study materials. Limited time offer!',
      image: '📚',
      bgColor: 'from-blue-500 to-blue-600'
    },
    {
      id: '2',
      title: 'Live Classes Starting Soon',
      description: 'Join our expert faculty for comprehensive ${examName} preparation. Batch starts next week!',
      image: '🎓',
      bgColor: 'from-purple-500 to-purple-600'
    },
    {
      id: '3',
      title: 'Previous Year Papers Available',
      description: 'Practice with authentic ${examName} previous year questions with detailed solutions.',
      image: '📝',
      bgColor: 'from-green-500 to-green-600'
    },
    {
      id: '4',
      title: 'One-on-One Mentorship',
      description: 'Get personalized guidance from ${examName} toppers. Book your free session today!',
      image: '👨‍🏫',
      bgColor: 'from-orange-500 to-orange-600'
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % advertisements.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [advertisements.length]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + advertisements.length) % advertisements.length);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % advertisements.length);
  };

  const currentAd = advertisements[currentIndex];

  return (
    <Card className="overflow-hidden">
      <div className={`bg-gradient-to-r ${currentAd.bgColor} text-white p-6 relative`}>
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={handlePrevious}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>

          <div className="flex-1 mx-4 text-center">
            <div className="text-4xl mb-2">{currentAd.image}</div>
            <h3 className="text-xl font-bold mb-2">{currentAd.title}</h3>
            <p className="text-sm opacity-90 mb-3">{currentAd.description}</p>
            {currentAd.link && (
              <Button variant="secondary" size="sm" className="mt-2">
                Learn More <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}
          </div>

          <Button
            variant="ghost"
            size="icon"
            onClick={handleNext}
            className="text-white hover:bg-white/20 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        </div>

        {/* Indicator Dots */}
        <div className="flex justify-center gap-2 mt-4">
          {advertisements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentIndex ? 'bg-white w-6' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
      </div>
    </Card>
  );
};
