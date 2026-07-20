
import React from 'react';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '@/components/dashboards/DashboardLayout';
import OwnerDashboard from '@/pages/owner/OwnerDashboard';
import OwnerCalendar from '@/pages/owner/OwnerCalendar';
import OwnerManageUsers from '@/pages/owner/OwnerManageUsers';
import OwnerContentManagement from '@/pages/owner/OwnerContentManagement';
import OwnerBusinessAnalytics from '@/pages/owner/OwnerBusinessAnalytics';
import OwnerNotifications from '@/pages/owner/OwnerNotifications';
import OwnerSettings from '@/pages/owner/OwnerSettings';
import OwnerAnalytics from '@/pages/owner/OwnerAnalytics';
import OwnerTaskControl from '@/pages/owner/OwnerTaskControl';
import OwnerSecurityLogs from '@/pages/owner/OwnerSecurityLogs';

// ── Payment System Pages ────────────────────────────────────────────────────
import OwnerRevenueCenter from '@/pages/owner/OwnerRevenueCenter';
import OwnerPlanManager from '@/pages/owner/OwnerPlanManager';
import OwnerPackageManager from '@/pages/owner/OwnerPackageManager';
import OwnerAddonManager from '@/pages/owner/OwnerAddonManager';
import OwnerCategoryAccess from '@/pages/owner/OwnerCategoryAccess';
import OwnerFeatureAccess from '@/pages/owner/OwnerFeatureAccess';
import OwnerCouponManager from '@/pages/owner/OwnerCouponManager';
import OwnerPaymentSettings from '@/pages/owner/OwnerPaymentSettings';

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
          <Route path="/settings" element={<OwnerSettings />} />
          <Route path="/analytics" element={<OwnerAnalytics />} />

          {/* ── Governance Routes ── */}
          <Route path="/task-control" element={<OwnerTaskControl />} />
          <Route path="/security-logs" element={<OwnerSecurityLogs />} />

          {/* ── Payment System Routes (Owner only) ── */}
          <Route path="/payments-plans" element={<OwnerRevenueCenter />} />
          <Route path="/plan-manager" element={<OwnerPlanManager />} />
          <Route path="/package-manager" element={<OwnerPackageManager />} />
          <Route path="/addon-manager" element={<OwnerAddonManager />} />
          <Route path="/category-access" element={<OwnerCategoryAccess />} />
          <Route path="/feature-access" element={<OwnerFeatureAccess />} />
          <Route path="/coupon-manager" element={<OwnerCouponManager />} />
          <Route path="/payment-settings" element={<OwnerPaymentSettings />} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Route>
    </Routes>
  );
};

export default OwnerRoutes;
