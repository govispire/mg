
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/dashboards/DashboardLayout';
import OwnerDashboard from '@/pages/owner/OwnerDashboard';
import OwnerCalendar from '@/pages/owner/OwnerCalendar';
import OwnerManageUsers from '@/pages/owner/OwnerManageUsers';
import OwnerContentManagement from '@/pages/owner/OwnerContentManagement';
import OwnerBusinessAnalytics from '@/pages/owner/OwnerBusinessAnalytics';
import OwnerNotifications from '@/pages/owner/OwnerNotifications';
import OwnerPaymentsPlans from '@/pages/owner/OwnerPaymentsPlans';
import OwnerSettings from '@/pages/owner/OwnerSettings';
import ProtectedRoute from '@/components/ProtectedRoute';
import NotFound from '@/pages/NotFound';

const OwnerRoutes = () => {
  return (
    <Routes>
      <Route element={<ProtectedRoute allowedRoles={['owner']} />}>
        <Route element={<DashboardLayout role="owner" basePath="/owner" />}>
          <Route path="/dashboard" element={<OwnerDashboard />} />
          <Route path="/calendar" element={<OwnerCalendar />} />
          <Route path="/manage-users" element={<OwnerManageUsers />} />
          <Route path="/content-management" element={<OwnerContentManagement />} />
          <Route path="/business-analytics" element={<OwnerBusinessAnalytics />} />
          <Route path="/notifications" element={<OwnerNotifications />} />
          <Route path="/payments-plans" element={<OwnerPaymentsPlans />} />
          <Route path="/settings" element={<OwnerSettings />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default OwnerRoutes;
