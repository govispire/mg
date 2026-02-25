
import React from 'react';
import CategoryDashboard from '@/components/employee/CategoryDashboard';
import { EmployeeCategory } from '@/types/employee';
import { useAuth } from '@/app/providers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

const EmployeeDashboard = () => {
  const { user } = useAuth();
  
  // Get the employee category from the authenticated user
  const userCategory: EmployeeCategory = user?.employeeCategory || 'content-creator';
  
  // If user doesn't have an employee category, show a message
  if (!user?.employeeCategory) {
    return (
      <div className="w-full px-4 lg:px-6 py-6">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Category Not Set
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Your employee category is not configured. Please contact your administrator or try logging in with a category-specific account.
            </p>
            <div className="mt-4 text-sm text-gray-500">
              <p>Available demo accounts:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>expert@example.com - Subject Matter Expert</li>
                <li>creator@example.com - Content Creator</li>
                <li>developer@example.com - Test Developer</li>
                <li>reviewer@example.com - Quality Reviewer</li>
                <li>moderator@example.com - Content Moderator</li>
                <li>support@example.com - Technical Support</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <CategoryDashboard employeeCategory={userCategory} />
    </div>
  );
};

export default EmployeeDashboard;
