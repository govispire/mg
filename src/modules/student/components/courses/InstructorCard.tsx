
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Star, Users, BookOpen } from 'lucide-react';
import { type Instructor } from '@/data/courseData';

interface InstructorCardProps {
  instructor: Instructor;
}

export const InstructorCard: React.FC<InstructorCardProps> = ({ instructor }) => {
  return (
    <Card className="p-4 hover:shadow-lg transition-shadow">
      <div className="flex flex-col items-center text-center space-y-3">
        <div className="relative">
          <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center overflow-hidden">
            {instructor.avatar ? (
              <img 
                src={instructor.avatar} 
                alt={instructor.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-white font-bold text-lg">
                {instructor.name.split(' ').map(n => n[0]).join('')}
              </span>
            )}
          </div>
          <Badge className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1">
            {instructor.experience}
          </Badge>
        </div>
        
        <div>
          <h3 className="text-base font-bold text-gray-800">{instructor.name}</h3>
          <p className="text-xs text-gray-600">{instructor.specialization}</p>
        </div>
        
        <div className="grid grid-cols-3 gap-2 w-full">
          <div className="bg-yellow-50 p-2 rounded text-center">
            <div className="flex items-center justify-center text-yellow-600">
              <Star className="h-3 w-3 mr-1" />
              <span className="text-xs font-bold">{instructor.rating}</span>
            </div>
          </div>
          <div className="bg-blue-50 p-2 rounded text-center">
            <div className="flex items-center justify-center text-blue-600">
              <Users className="h-3 w-3 mr-1" />
              <span className="text-xs font-bold">{(instructor.studentsCount / 1000).toFixed(1)}k</span>
            </div>
          </div>
          <div className="bg-purple-50 p-2 rounded text-center">
            <div className="flex items-center justify-center text-purple-600">
              <BookOpen className="h-3 w-3 mr-1" />
              <span className="text-xs font-bold">{instructor.coursesCount}</span>
            </div>
          </div>
        </div>
        
        <Link to={`/student/courses/instructor/${instructor.id}`} className="w-full">
          <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-xs">
            View Courses
          </Button>
        </Link>
      </div>
    </Card>
  );
};
