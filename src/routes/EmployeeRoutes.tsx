
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
import CreateBlog from '@/pages/employee/CreateBlog';
import CreateCurrentAffairs from '@/pages/employee/CreateCurrentAffairs';
import EmployeeVocabulary from '@/pages/employee/EmployeeVocabulary';
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
          {/* ── New Phase 3 Routes ── */}
          <Route path="/create-blog" element={<CreateBlog />} />
          <Route path="/create-current-affairs" element={<CreateCurrentAffairs />} />
          <Route path="/vocabulary" element={<EmployeeVocabulary />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default EmployeeRoutes;
