
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/dashboards/DashboardLayout';
import MentorDashboard from '@/pages/mentor/MentorDashboard';
import MentorProfile from '@/pages/mentor/MentorProfile';
import StudentsManagement from '@/pages/mentor/StudentsManagement';
import TaskAssignment from '@/pages/mentor/TaskAssignment';
import ProgressTracking from '@/pages/mentor/ProgressTracking';
import SessionScheduling from '@/pages/mentor/SessionScheduling';
import MentorMessages from '@/pages/mentor/MentorMessages';
import MentorAnalytics from '@/pages/mentor/MentorAnalytics';
import MentorSchedule from '@/pages/mentor/MentorSchedule';
import MentorCalendar from '@/pages/mentor/MentorCalendar';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

const MentorRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['mentor']} />}>
        <Route element={<DashboardLayout role="mentor" basePath="/mentor" />}>
          <Route path="/dashboard" element={<MentorDashboard />} />
          <Route path="/profile" element={<MentorProfile />} />
          <Route path="/calendar" element={<MentorCalendar />} />
          <Route path="/students" element={<StudentsManagement />} />
          <Route path="/assign-tasks" element={<TaskAssignment />} />
          <Route path="/progress" element={<ProgressTracking />} />
          <Route path="/sessions" element={<SessionScheduling />} />
          <Route path="/messages" element={<MentorMessages />} />
          <Route path="/analytics" element={<MentorAnalytics />} />
          <Route path="/schedule" element={<MentorSchedule />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default MentorRoutes;
