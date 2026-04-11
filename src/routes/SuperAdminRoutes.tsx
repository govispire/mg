
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/dashboards/DashboardLayout';
import SuperAdminDashboard from '@/pages/superadmin/SuperAdminDashboard';
import SuperAdminCalendar from '@/pages/superadmin/SuperAdminCalendar';
import CreateAdmins from '@/pages/superadmin/CreateAdmins';
import ManageUsers from '@/pages/superadmin/ManageUsers';
import PaymentPlans from '@/pages/superadmin/PaymentPlans';
import SuperAdminAnalytics from '@/pages/superadmin/SuperAdminAnalytics';
import AIBlogCreator from '@/pages/superadmin/AIBlogCreator';
import BlogManager from '@/pages/superadmin/BlogManager';
import TestCatalogManager from '@/pages/superadmin/TestCatalogManager';
import SuperAdminExamManager from '@/pages/superadmin/SuperAdminExamManager';
import QuestionManager from '@/pages/superadmin/QuestionManager';
import TestBuilderPage from '@/pages/superadmin/TestBuilderPage';
import EmployeeApprovalQueue from '@/pages/superadmin/EmployeeApprovalQueue';
import EmployeeManager from '@/pages/superadmin/EmployeeManager';
import SuperAdminVocabulary from '@/pages/superadmin/SuperAdminVocabulary';
import SyllabusManager from '@/pages/superadmin/SyllabusManager';
import UpcomingExamsManager from '@/pages/superadmin/UpcomingExamsManager';
import CurrentAffairsManager from '@/pages/superadmin/CurrentAffairsManager';
import ExamAlertsManager from '@/pages/superadmin/ExamAlertsManager';
import AdsManager from '@/pages/superadmin/AdsManager';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

const SuperAdminRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['super-admin']} />}>
        <Route element={<DashboardLayout role="super-admin" basePath="/super-admin" />}>
          <Route path="/dashboard" element={<SuperAdminDashboard />} />
          <Route path="/calendar" element={<SuperAdminCalendar />} />
          <Route path="/create-admins" element={<CreateAdmins />} />
          <Route path="/manage-users" element={<ManageUsers />} />
          <Route path="/payment-plans" element={<PaymentPlans />} />
          <Route path="/analytics" element={<SuperAdminAnalytics />} />
          <Route path="/create-blog" element={<AIBlogCreator />} />
          <Route path="/manage-blogs" element={<BlogManager />} />
          <Route path="/test-catalog" element={<TestCatalogManager />} />
          <Route path="/test-catalog/:categoryId/:sectionId/:examId" element={<SuperAdminExamManager />} />
          <Route path="/test-catalog/:categoryId/:sectionId/:examId/:slotKey/:testId/questions" element={<TestBuilderPage />} />
          {/* ── New Phase 2 & 3 Routes ── */}
          <Route path="/approval-queue" element={<EmployeeApprovalQueue />} />
          <Route path="/employee-manager" element={<EmployeeManager />} />
          <Route path="/vocabulary" element={<SuperAdminVocabulary />} />
          <Route path="/syllabus-manager" element={<SyllabusManager />} />
          <Route path="/upcoming-exams" element={<UpcomingExamsManager />} />
          <Route path="/current-affairs" element={<CurrentAffairsManager />} />
          <Route path="/exam-alerts" element={<ExamAlertsManager />} />
          <Route path="/ads-manager" element={<AdsManager />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default SuperAdminRoutes;
