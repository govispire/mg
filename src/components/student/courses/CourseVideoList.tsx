
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Play, CheckCircle, BookOpen } from 'lucide-react';
import { getCourseById, subjects, getAllVideosBySubject } from '@/data/courseData';

interface CourseVideoListProps {
  courseId: string;
  subject: string;
}

export const CourseVideoList: React.FC<CourseVideoListProps> = ({ courseId, subject }) => {
  const course = getCourseById(courseId);
  const subjectData = subjects[subject];
  const videos = getAllVideosBySubject(subject);
  
  if (!course || !subjectData) return null;
  
  const watchedCount = videos.filter(v => v.isWatched).length;
  const progressPercentage = Math.round((watchedCount / videos.length) * 100);
  
  return (
    <div className="space-y-6">
      {/* Course Overview Header */}
      <Card className="border-l-4 border-l-blue-500 p-4">
        <div className="space-y-2">
          <h2 className="text-xl font-semibold">{course.title}</h2>
          <p className="text-gray-600">By {course.instructor}</p>
          <div className="text-sm text-gray-500">
            {videos.length} videos • {watchedCount} watched • {progressPercentage}% complete
          </div>
          <Button variant="outline" size="sm" className="mt-2">
            <BookOpen className="h-4 w-4 mr-2" />
            View by Subjects
          </Button>
        </div>
      </Card>
      
      {/* Video Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => (
          <Card key={video.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
            <div className="relative h-48">
              <img 
                src={video.thumbnail} 
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <div className="bg-white rounded-full p-3">
                  <Play className="h-12 w-12 text-blue-600" />
                </div>
              </div>
              
              {/* Watch Status */}
              {video.isWatched && (
                <div className="absolute top-2 right-2">
                  <CheckCircle className="h-6 w-6 text-green-600 bg-white rounded-full" />
                </div>
              )}
              
              {/* Duration Badge */}
              <div className="absolute bottom-2 right-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                {video.duration}
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-medium line-clamp-2 group-hover:text-blue-600 transition-colors">
                {video.title}
              </h3>
              
              <div className="mt-2 flex items-center justify-between">
                <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                  {subjectData.name}
                </Badge>
                <Button 
                  variant={video.isWatched ? "outline" : "default"} 
                  size="sm"
                >
                  {video.isWatched ? 'Rewatch' : 'Watch'}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
