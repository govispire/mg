
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/dashboards/DashboardLayout';
import EmployeeDashboard from '@/pages/employee/EmployeeDashboard';
import EmployeeProfile from '@/pages/employee/EmployeeProfile';
import EmployeeCalendar from '@/pages/employee/EmployeeCalendar';
import TaskAssignment from '@/pages/employee/TaskAssignment';
import UploadQuestions from '@/pages/employee/UploadQuestions';
import UploadMaterials from '@/pages/employee/UploadMaterials';
import PreviewTests from '@/pages/employee/PreviewTests';
import Approvals from '@/pages/employee/Approvals';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

const EmployeeRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['employee']} />}>
        <Route element={<DashboardLayout role="employee" basePath="/employee" />}>
          <Route path="/dashboard" element={<EmployeeDashboard />} />
          <Route path="/profile" element={<EmployeeProfile />} />
          <Route path="/calendar" element={<EmployeeCalendar />} />
          <Route path="/task-assignment" element={<TaskAssignment />} />
          <Route path="/upload-questions" element={<UploadQuestions />} />
          <Route path="/upload-materials" element={<UploadMaterials />} />
          <Route path="/preview-tests" element={<PreviewTests />} />
          <Route path="/approvals" element={<Approvals />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default EmployeeRoutes;
