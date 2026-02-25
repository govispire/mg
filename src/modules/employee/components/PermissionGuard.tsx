
import React from 'react';
import { useAuth } from '@/app/providers';
import { EmployeePermission } from '@/types/employee';
import { EMPLOYEE_CATEGORIES, MOCK_CATEGORIZED_EMPLOYEES } from '@/data/employeeCategoryData';

interface PermissionGuardProps {
  requiredPermission: EmployeePermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({ 
  requiredPermission, 
  children, 
  fallback = null 
}) => {
  const { user } = useAuth();

  // If user is not an employee, deny access
  if (user?.role !== 'employee' || !user?.employeeCategory) {
    return <>{fallback}</>;
  }

  // Get employee's category configuration
  const categoryConfig = EMPLOYEE_CATEGORIES.find(
    cat => cat.id === user.employeeCategory
  );

  // Check if the user has the required permission
  const hasPermission = categoryConfig?.permissions.includes(requiredPermission);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
