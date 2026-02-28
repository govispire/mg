
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/dashboards/DashboardLayout';
import StudentDashboard from '@/pages/student/StudentDashboard';
import StudentCalendar from '@/pages/student/StudentCalendar';
import StudentCourses from '@/pages/student/StudentCourses';
import StudentTests from '@/pages/student/StudentTests';
import ExamDetail from '@/pages/student/ExamDetail';
import ExamInterface from '@/pages/student/ExamInterface';
import CurrentAffairs from '@/pages/student/CurrentAffairs';
import TopicArticlesPage from '@/pages/student/TopicArticlesPage';
import DailyNewsPage from '@/pages/student/DailyNewsPage';

import PerformanceAnalytics from '@/pages/student/PerformanceAnalytics';
import ExamNotifications from '@/pages/student/ExamNotifications';
import SelfCare from '@/pages/student/SelfCare';
import PDFCourses from '@/pages/student/PDFCourses';
import DoubtForum from '@/pages/student/DoubtForum';
import FAQ from '@/pages/student/FAQ';
import MentorshipDashboard from '@/pages/student/MentorshipDashboard';
import MentorshipSelection from '@/pages/student/MentorshipSelection';
import MentorshipWizard from '@/pages/student/MentorshipWizard';
import StudentProfile from '@/pages/student/StudentProfile';
import SecuritySettings from '@/pages/student/SecuritySettings';
import ExamCategorySelection from '@/pages/student/ExamCategorySelection';
import CourseDetail from '@/pages/student/CourseDetail';
import SubjectDetail from '@/pages/student/SubjectDetail';
import InstructorDetail from '@/pages/student/InstructorDetail';
import DailyQuizzes from '@/pages/student/DailyQuizzes';
import SyllabusPage from '@/pages/student/SyllabusPage';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import ExamWindow from '@/pages/student/ExamWindow';
import AllExams from '@/pages/student/AllExams';
import StudentVocabulary from '@/pages/student/StudentVocabulary';

import TestWindow from '@/pages/student/TestWindow';

const StudentRoutes = () => {
  return (
    <Routes>
      {/* Exam windows - outside ProtectedRoute for new window compatibility */}
      <Route path="/exam-window" element={<ExamWindow />} />
      <Route path="/test-window" element={<TestWindow />} />

      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        {/* Standalone pages */}
        <Route path="/exam-categories" element={<ExamCategorySelection />} />
        <Route path="/mentorship/selection" element={<MentorshipSelection />} />
        <Route path="/mentorship/wizard" element={<MentorshipWizard />} />

        {/* Regular dashboard routes */}
        <Route element={<DashboardLayout role="student" basePath="/student" />}>
          <Route path="/dashboard" element={<StudentDashboard />} />
          <Route path="/syllabus" element={<SyllabusPage />} />
          <Route path="/profile" element={<StudentProfile />} />
          <Route path="/security" element={<SecuritySettings />} />
          <Route path="/calendar" element={<StudentCalendar />} />
          <Route path="/courses" element={<StudentCourses />} />
          <Route path="/courses/category/:category" element={<StudentCourses />} />
          <Route path="/courses/instructor/:instructorId" element={<InstructorDetail />} />
          <Route path="/courses/:courseId" element={<CourseDetail />} />
          <Route path="/courses/:courseId/:subject" element={<SubjectDetail />} />
          <Route path="/tests" element={<StudentTests />} />
          <Route path="/tests/:category" element={<StudentTests />} />
          <Route path="/tests/:category/:examId" element={<ExamDetail />} />
          <Route path="/all-exams" element={<AllExams />} />
          <Route path="/mentorship" element={<MentorshipDashboard />} />
          <Route path="/mentorship/dashboard" element={<MentorshipDashboard />} />
          <Route path="/current-affairs" element={<CurrentAffairs />} />
          <Route path="/current-affairs/topic/:topic" element={<TopicArticlesPage />} />
          <Route path="/current-affairs/date/:date" element={<DailyNewsPage />} />
          <Route path="/daily-quizzes" element={<DailyQuizzes />} />
          <Route path="/exam-notifications" element={<ExamNotifications />} />
          <Route path="/self-care" element={<SelfCare />} />
          <Route path="/pdf-courses" element={<PDFCourses />} />
          <Route path="/doubt-forum" element={<DoubtForum />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/vocabulary" element={<StudentVocabulary />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* Special standalone routes for exam interface */}
        <Route path="/tests/:category/:examId/exam" element={<ExamInterface />} />
      </Route>
    </Routes>
  );
};

export default StudentRoutes;
