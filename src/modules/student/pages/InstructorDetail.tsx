
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CourseNavigation } from '@/components/student/courses/CourseNavigation';
import { CourseCard } from '@/components/student/courses/CourseCard';
import { Star, Users, BookOpen, Award } from 'lucide-react';
import { getInstructorById, getCoursesByInstructor } from '@/data/courseData';

const InstructorDetail = () => {
  const { instructorId } = useParams();
  const instructor = getInstructorById(instructorId!);
  const courses = getCoursesByInstructor(instructorId!);
  
  if (!instructor) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Instructor not found</p>
        <Link to="/student/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <CourseNavigation 
        items={[
          { label: 'Courses', href: '/student/courses' },
          { label: instructor.name, isActive: true }
        ]}
        showBackButton
        backHref="/student/courses"
      />
      
      {/* Instructor Profile Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 rounded-lg text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {instructor.avatar ? (
                <img 
                  src={instructor.avatar} 
                  alt={instructor.name}
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {instructor.name.split(' ').map(n => n[0]).join('')}
                </span>
              )}
            </div>
            <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
              <Award className="h-3 w-3 mr-1" />
              {instructor.experience}
            </Badge>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">{instructor.name}</h1>
            <p className="text-blue-100 mb-4">{instructor.specialization}</p>
            
            <div className="grid grid-cols-3 gap-4 md:gap-6">
              <div className="text-center">
                <div className="flex items-center justify-center text-yellow-300 mb-1">
                  <Star className="h-5 w-5 mr-1" />
                  <span className="font-bold text-lg">{instructor.rating}</span>
                </div>
                <p className="text-blue-200 text-sm">Rating</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-blue-200 mb-1">
                  <Users className="h-5 w-5 mr-1" />
                  <span className="font-bold text-lg">{(instructor.studentsCount / 1000).toFixed(1)}k</span>
                </div>
                <p className="text-blue-200 text-sm">Students</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center text-purple-200 mb-1">
                  <BookOpen className="h-5 w-5 mr-1" />
                  <span className="font-bold text-lg">{instructor.coursesCount}</span>
                </div>
                <p className="text-blue-200 text-sm">Courses</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Course Offerings */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Course Offerings</h2>
        
        {courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <p className="text-gray-500">No courses available from this instructor</p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default InstructorDetail;
