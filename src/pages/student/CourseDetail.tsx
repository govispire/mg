
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CourseNavigation } from '@/components/student/courses/CourseNavigation';
import { BookOpen, Play, FileText, Clock } from 'lucide-react';
import { getCourseById, subjects } from '@/data/courseData';

const CourseDetail = () => {
  const { courseId } = useParams();
  const course = getCourseById(courseId!);
  
  if (!course) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Course not found</p>
        <Link to="/student/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }
  
  const courseSubjects = course.subjects.map(subjectId => subjects[subjectId]).filter(Boolean);
  
  return (
    <div className="space-y-6 p-6">
      <CourseNavigation 
        items={[
          { label: 'Courses', href: '/student/courses' },
          { label: course.title, isActive: true }
        ]}
        showBackButton
        backHref="/student/courses"
      />
      
      {/* Course Banner with Progress Stats */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-700 p-6 rounded-lg text-white">
        <h1 className="text-2xl md:text-3xl font-bold mb-1">{course.title}</h1>
        <p className="text-blue-100 mb-5">By {course.instructor}</p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 items-center">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <div className="relative w-14 h-14 shrink-0">
              <svg className="w-14 h-14 transform -rotate-90">
                <circle cx="28" cy="28" r="24" stroke="rgba(255,255,255,0.3)" strokeWidth="4" fill="transparent" />
                <circle
                  cx="28" cy="28" r="24"
                  stroke="white" strokeWidth="4" fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 24}`}
                  strokeDashoffset={`${2 * Math.PI * 24 * (1 - (course.progress || 0) / 100)}`}
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-xs font-bold text-white">{course.progress || 0}%</span>
              </div>
            </div>
            <p className="text-sm text-blue-100">Progress</p>
          </div>

          {/* Chapters */}
          <div className="text-center">
            <div className="text-2xl font-bold">{course.chaptersCount}</div>
            <p className="text-sm text-blue-100">Chapters</p>
          </div>

          {/* Avg Score */}
          <div className="text-center">
            <div className="text-2xl font-bold">85%</div>
            <p className="text-sm text-blue-100">Avg Score</p>
          </div>

          {/* Resume */}
          <div className="flex justify-center md:justify-end">
            <Button className="bg-white text-blue-700 hover:bg-blue-50 font-semibold px-8">
              Resume
            </Button>
          </div>
        </div>
      </div>
      
      {/* Subject Selection */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-800">Select Subject</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {courseSubjects.map((subject) => (
            <Link key={subject.id} to={`/student/courses/${courseId}/${subject.id}`}>
              <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-12 h-12 ${subject.color} rounded-lg flex items-center justify-center text-white text-xl`}>
                        {subject.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800">{subject.name}</h3>
                        <p className="text-sm text-gray-600">{subject.chaptersCount} chapters</p>
                      </div>
                    </div>
                    <Play className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{subject.progress}%</span>
                    </div>
                    <Progress value={subject.progress} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <BookOpen className="h-3 w-3 mr-1" />
                      <span>{subject.chaptersCount}</span>
                    </div>
                    <div className="flex items-center">
                      <Play className="h-3 w-3 mr-1" />
                      <span>{subject.videosCount}</span>
                    </div>
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-1" />
                      <span>{subject.testsCount}</span>
                    </div>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetail;
