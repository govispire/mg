
import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CourseNavigation } from '@/components/student/courses/CourseNavigation';
import { ChapterList } from '@/components/student/courses/ChapterList';
import { CourseVideoList } from '@/components/student/courses/CourseVideoList';
import { LayoutGrid, List } from 'lucide-react';
import { getCourseById, subjects } from '@/data/courseData';

const SubjectDetail = () => {
  const { courseId, subject } = useParams();
  const [viewMode, setViewMode] = useState<'chapters' | 'videos'>('chapters');
  const [isGridView, setIsGridView] = useState(true);
  
  const course = getCourseById(courseId!);
  const subjectData = subjects[subject!];
  
  if (!course || !subjectData) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Subject not found</p>
        <Link to="/student/courses">
          <Button className="mt-4">Back to Courses</Button>
        </Link>
      </div>
    );
  }
  
  return (
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-4">
      <CourseNavigation 
        items={[
          { label: 'Courses', href: '/student/courses' },
          { label: course.title, href: `/student/courses/${courseId}` },
          { label: subjectData.name, isActive: true }
        ]}
        showBackButton
        backHref={`/student/courses/${courseId}`}
      />
      
      {/* Header Card with Stats */}
      <Card className="border-l-4 border-l-blue-500 p-4 sm:p-6 md:p-8">
        <div className="space-y-4">
          <div>
            <h1 className="text-lg sm:text-xl font-semibold">{course.title} - {subjectData.name}</h1>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-gray-800">{subjectData.chaptersCount}</div>
              <div className="text-xs sm:text-sm text-gray-600">Chapters</div>
            </div>
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-gray-800">2/7</div>
              <div className="text-xs sm:text-sm text-gray-600">Videos</div>
            </div>
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-gray-800">3/25</div>
              <div className="text-xs sm:text-sm text-gray-600">Tests</div>
            </div>
            <div className="text-center">
              <div className="text-base sm:text-lg font-semibold text-gray-800">16%</div>
              <div className="text-xs sm:text-sm text-gray-600">Progress</div>
            </div>
          </div>
        </div>
      </Card>
      
      {/* View Mode Toggle - Mobile Responsive */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-0">
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Button
            variant={viewMode === 'chapters' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('chapters')}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            View by Chapters
          </Button>
          <Button
            variant={viewMode === 'videos' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('videos')}
            className="flex-1 sm:flex-none text-xs sm:text-sm"
          >
            View by Videos
          </Button>
        </div>
        
        {viewMode === 'chapters' && (
          <div className="bg-gray-100 rounded p-1 flex w-full sm:w-auto">
            <Button
              variant={isGridView ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 sm:px-3 flex-1 sm:flex-none text-xs sm:text-sm"
              onClick={() => setIsGridView(true)}
            >
              <LayoutGrid className="h-3 w-3 mr-1" />
              Grid
            </Button>
            <Button
              variant={!isGridView ? 'default' : 'ghost'}
              size="sm"
              className="h-7 px-2 sm:px-3 flex-1 sm:flex-none text-xs sm:text-sm"
              onClick={() => setIsGridView(false)}
            >
              <List className="h-3 w-3 mr-1" />
              List
            </Button>
          </div>
        )}
      </div>
      
      {/* Content */}
      {viewMode === 'chapters' ? (
        <ChapterList 
          courseId={courseId!}
          subject={subject!}
          isGridView={isGridView}
        />
      ) : (
        <CourseVideoList 
          courseId={courseId!}
          subject={subject!}
        />
      )}
    </div>
  );
};

export default SubjectDetail;
