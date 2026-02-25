
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/dashboards/DashboardLayout';
import AdminDashboard from '@/pages/admin/AdminDashboard';
import AdminProfile from '@/pages/admin/AdminProfile';
import AdminCalendar from '@/pages/admin/AdminCalendar';
import ManageEmployees from '@/pages/admin/ManageEmployees';
import ManageStudents from '@/pages/admin/ManageStudents';
import EditTests from '@/pages/admin/EditTests';
import UploadCourses from '@/pages/admin/UploadCourses';
import AdminNotifications from '@/pages/admin/AdminNotifications';
import AdminSettings from '@/pages/admin/AdminSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';
import ExamInterface from '@/pages/student/ExamInterface';

const AdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<DashboardLayout role="admin" basePath="/admin" />}>
          <Route path="/dashboard" element={<AdminDashboard />} />
          <Route path="/profile" element={<AdminProfile />} />
          <Route path="/calendar" element={<AdminCalendar />} />
          <Route path="/manage-employees" element={<ManageEmployees />} />
          <Route path="/manage-students" element={<ManageStudents />} />
          <Route path="/edit-tests" element={<EditTests />} />
          <Route path="/upload-courses" element={<UploadCourses />} />
          <Route path="/notifications" element={<AdminNotifications />} />
          <Route path="/settings" element={<AdminSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
        {/* Special standalone routes for test preview */}
        <Route path="/test-preview/:testId" element={<ExamInterface isPreview={true} />} />
        <Route path="/test-preview" element={<ExamInterface isPreview={true} />} />
      </Route>
    </Routes>
  );
};

export default AdminRoutes;
