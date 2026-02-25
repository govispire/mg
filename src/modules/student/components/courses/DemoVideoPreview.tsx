import React, { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  X,
  Clock,
  Star,
  Users,
  BookOpen,
  Lock,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface DemoVideoPreviewProps {
  isOpen: boolean;
  onClose: () => void;
  course: {
    id: string;
    title: string;
    instructor: string;
    thumbnail: string;
    rating: number;
    studentsCount: number;
    price: number;
    originalPrice?: number;
    duration: string;
    chaptersCount: number;
    videosCount: number;
  };
  onEnroll?: () => void;
}

export const DemoVideoPreview: React.FC<DemoVideoPreviewProps> = ({
  isOpen,
  onClose,
  course,
  onEnroll
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const demoVideoDuration = 180; // 3 minutes demo
  const formattedCurrentTime = `${Math.floor(currentTime / 60)}:${String(Math.floor(currentTime % 60)).padStart(2, '0')}`;
  const formattedDuration = `${Math.floor(demoVideoDuration / 60)}:${String(demoVideoDuration % 60).padStart(2, '0')}`;

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    // Simulate video progress
    if (!isPlaying) {
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= demoVideoDuration) {
            clearInterval(interval);
            setIsPlaying(false);
            return 0;
          }
          setProgress((prev / demoVideoDuration) * 100);
          return prev + 1;
        });
      }, 1000);
    }
  };

  const discount = course.originalPrice
    ? Math.round(((course.originalPrice - course.price) / course.originalPrice) * 100)
    : 0;

  // Demo chapters available for preview
  const demoContent = [
    { id: 1, title: 'Course Introduction', duration: '3:00', isLocked: false },
    { id: 2, title: 'Chapter 1: Getting Started', duration: '15:00', isLocked: false },
    { id: 3, title: 'Chapter 2: Core Concepts', duration: '22:00', isLocked: true },
    { id: 4, title: 'Chapter 3: Practice Questions', duration: '18:00', isLocked: true },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 gap-0 overflow-hidden">
        <DialogTitle className="sr-only">Course Demo Preview - {course.title}</DialogTitle>

        {/* Video Player Section */}
        <div className="relative aspect-video bg-black">
          {/* Thumbnail/Video placeholder */}
          <img
            src={course.thumbnail}
            alt={course.title}
            className="w-full h-full object-cover"
          />

          {/* Play overlay */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center bg-black/40 transition-opacity cursor-pointer",
              isPlaying ? "opacity-0 hover:opacity-100" : "opacity-100"
            )}
            onClick={togglePlay}
          >
            <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center shadow-2xl hover:scale-105 transition-transform">
              {isPlaying ? (
                <Pause className="h-8 w-8 text-primary" />
              ) : (
                <Play className="h-8 w-8 text-primary ml-1" />
              )}
            </div>
          </div>

          {/* Demo badge */}
          <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
            Free Demo
          </Badge>

          {/* Close button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/50 text-white hover:bg-black/70"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>

          {/* Video controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
            <Progress value={progress} className="h-1 mb-3" />
            <div className="flex items-center justify-between text-white text-sm">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={togglePlay}
                >
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 h-8 w-8"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </Button>
                <span className="text-xs">{formattedCurrentTime} / {formattedDuration}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 h-8 w-8"
              >
                <Maximize2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Course Info Section */}
        <div className="p-6 space-y-5 bg-background max-h-[60vh] overflow-y-auto">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-foreground">{course.title}</h2>
              <p className="text-sm text-muted-foreground mt-1">By {course.instructor}</p>

              {/* Stats */}
              <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-medium text-foreground">{course.rating}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{(course.studentsCount / 1000).toFixed(1)}k students</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{course.duration}</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{course.chaptersCount} chapters</span>
                </div>
              </div>
            </div>

            {/* Price & CTA */}
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-primary">₹{course.price.toLocaleString()}</span>
                {course.originalPrice && (
                  <span className="text-sm text-muted-foreground line-through">
                    ₹{course.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              {discount > 0 && (
                <Badge variant="destructive" className="text-xs">{discount}% OFF</Badge>
              )}
              <Button className="mt-2 px-6" onClick={onEnroll}>
                Enroll Now
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>

          {/* Demo Content List */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Preview Content</h3>
            <div className="space-y-2">
              {demoContent.map((chapter) => (
                <div
                  key={chapter.id}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-lg transition-colors",
                    chapter.isLocked
                      ? "bg-muted/50 text-muted-foreground"
                      : "bg-primary/5 hover:bg-primary/10 cursor-pointer"
                  )}
                >
                  <div className="flex items-center gap-3">
                    {chapter.isLocked ? (
                      <Lock className="h-4 w-4" />
                    ) : (
                      <Play className="h-4 w-4 text-primary" />
                    )}
                    <span className={cn("text-sm", !chapter.isLocked && "text-foreground")}>
                      {chapter.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs">{chapter.duration}</span>
                    {chapter.isLocked && (
                      <Badge variant="outline" className="text-[10px]">Premium</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Why Enroll */}
          <div className="border-t pt-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">Why Join This Course?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: '📚', text: `${course.videosCount}+ Videos` },
                { icon: '📝', text: 'Practice Tests' },
                { icon: '🎯', text: 'Expert Guidance' },
                { icon: '📱', text: 'Mobile Access' },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg">
                  <span>{item.icon}</span>
                  <span className="text-xs text-foreground">{item.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
