
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Star, Users, Clock, Play, Bookmark } from 'lucide-react';
import { type Course } from '@/data/courseData';
import { type CategoryCourse } from '@/data/expandedCourseData';

interface CourseCardProps {
  course: Course | CategoryCourse;
}

export const CourseCard: React.FC<CourseCardProps> = ({ course }) => {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow group">
      {/* Thumbnail Section */}
      <div className="relative h-32 overflow-hidden">
        <img 
          src={course.thumbnail} 
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Overlay Badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        
        {course.originalPrice && (
          <Badge className="absolute top-2 right-2 bg-red-500 text-white text-xs">
            ₹{course.price}
          </Badge>
        )}
        
        <Badge className="absolute top-2 left-2 bg-blue-500 text-white text-xs">
          {course.type}
        </Badge>
        
        {course.isTrending && (
          <Badge className="absolute bottom-2 left-2 bg-orange-500 text-white text-xs">
            Trending
          </Badge>
        )}
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/90 rounded-full p-3">
            <Play className="h-6 w-6 text-blue-600" />
          </div>
        </div>
      </div>
      
      {/* Header Section */}
      <div className="p-3 pb-2 border-b">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-sm line-clamp-2 flex-1">{course.title}</h3>
          <Button variant="ghost" size="sm" className="p-1 h-auto">
            <Bookmark className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-3 space-y-3">
        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center text-yellow-600">
            <Star className="h-3 w-3 mr-1" />
            <span>{course.rating}</span>
          </div>
          <div className="flex items-center text-blue-600">
            <Users className="h-3 w-3 mr-1" />
            <span>{(course.studentsCount / 1000).toFixed(1)}k</span>
          </div>
          <div className="flex items-center text-gray-600">
            <Clock className="h-3 w-3 mr-1" />
            <span>{course.duration}</span>
          </div>
        </div>
        
        {/* Content Preview */}
        <div className="space-y-1">
          <p className="text-xs text-gray-600">Subjects: {course.subjects.length}</p>
          <p className="text-xs text-gray-600">{course.chaptersCount} Chapters • {course.videosCount} Videos</p>
        </div>
        
        {/* Pricing */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="font-bold text-green-600">₹{course.price}</span>
              {course.originalPrice && (
                <span className="text-xs text-gray-500 line-through">₹{course.originalPrice}</span>
              )}
            </div>
            <p className="text-xs text-gray-600">By {course.instructor}</p>
          </div>
        </div>
        
        {/* Action Button */}
        <Link to={`/student/courses/${course.id}`} className="block">
          <Button className="w-full bg-blue-600 hover:bg-blue-700 text-xs">
            {course.progress ? 'Continue Learning' : 'Start Learning'}
          </Button>
        </Link>
      </div>
    </Card>
  );
};
