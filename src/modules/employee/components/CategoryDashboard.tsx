
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  CheckCircle, Clock, AlertTriangle, TrendingUp, 
  FileText, Upload, Eye, Users, Target, Award, MapPin 
} from 'lucide-react';
import { useAuth } from '@/app/providers';
import { EMPLOYEE_CATEGORIES, MOCK_CATEGORIZED_EMPLOYEES } from '@/data/employeeCategoryData';
import { EmployeeCategory } from '@/types/employee';

interface CategoryDashboardProps {
  employeeCategory?: EmployeeCategory;
}

const CategoryDashboard: React.FC<CategoryDashboardProps> = ({ 
  employeeCategory = 'content-creator' 
}) => {
  const { user } = useAuth();
  
  // Get employee data (in real app, this would come from API)
  const employee = MOCK_CATEGORIZED_EMPLOYEES.find(emp => emp.category === employeeCategory) || MOCK_CATEGORIZED_EMPLOYEES[0];
  const categoryConfig = EMPLOYEE_CATEGORIES.find(cat => cat.id === employeeCategory);

  const getDashboardSections = () => {
    switch (employeeCategory) {
      case 'subject-matter-expert':
        return [
          {
            title: 'Question Creation',
            description: 'Create and edit subject-specific questions',
            icon: FileText,
            action: 'Create Questions',
            stats: { total: 45, pending: 8, approved: 37 }
          },
          {
            title: 'Content Review',
            description: 'Review and approve content from other creators',
            icon: Eye,
            action: 'Review Content',
            stats: { total: 23, pending: 5, completed: 18 }
          },
          {
            title: 'Performance Metrics',
            description: 'Track your expertise contributions',
            icon: TrendingUp,
            action: 'View Analytics',
            stats: { accuracy: 96, rating: 4.8, contributions: 245 }
          }
        ];
      
      case 'content-creator':
        return [
          {
            title: 'Content Creation',
            description: 'Create educational materials and resources',
            icon: FileText,
            action: 'Create Content',
            stats: { total: 32, drafts: 4, published: 28 }
          },
          {
            title: 'Upload Materials',
            description: 'Upload study materials and resources',
            icon: Upload,
            action: 'Upload Files',
            stats: { total: 18, pending: 3, approved: 15 }
          },
          {
            title: 'Pending Reviews',
            description: 'Content awaiting approval',
            icon: Clock,
            action: 'Check Status',
            stats: { total: 7, urgent: 2, normal: 5 }
          }
        ];

      case 'test-developer':
        return [
          {
            title: 'Test Creation',
            description: 'Design comprehensive tests and assessments',
            icon: FileText,
            action: 'Create Test',
            stats: { total: 12, active: 8, draft: 4 }
          },
          {
            title: 'Question Bank',
            description: 'Manage question repository',
            icon: Target,
            action: 'Manage Questions',
            stats: { total: 1250, new: 45, reviewed: 1205 }
          },
          {
            title: 'Test Analytics',
            description: 'Analyze test performance and metrics',
            icon: TrendingUp,
            action: 'View Analytics',
            stats: { avgScore: 72, completionRate: 89, feedback: 4.6 }
          }
        ];

      case 'quality-reviewer':
        return [
          {
            title: 'Review Queue',
            description: 'Content pending your review',
            icon: Clock,
            action: 'Start Review',
            stats: { total: 15, urgent: 3, normal: 12 }
          },
          {
            title: 'Approval History',
            description: 'Track your review decisions',
            icon: CheckCircle,
            action: 'View History',
            stats: { approved: 156, rejected: 12, revised: 8 }
          },
          {
            title: 'Quality Metrics',
            description: 'Your review performance statistics',
            icon: Award,
            action: 'View Metrics',
            stats: { accuracy: 98, avgTime: 12, rating: 4.9 }
          }
        ];

      case 'regional-coordinator':
        return [
          {
            title: 'Regional Overview',
            description: 'Monitor regional operations and performance',
            icon: MapPin,
            action: 'View Region',
            stats: { totalEmployees: 24, activeProjects: 8, efficiency: 94 }
          },
          {
            title: 'Team Management',
            description: 'Manage and coordinate your team',
            icon: Users,
            action: 'Manage Team',
            stats: { teamSize: 12, availability: 78, productivity: 92 }
          },
          {
            title: 'Task Assignment',
            description: 'Assign and track regional tasks',
            icon: Target,
            action: 'Assign Tasks',
            stats: { pending: 6, inProgress: 14, completed: 45 }
          },
          {
            title: 'Performance Tracking',
            description: 'Track team and regional performance',
            icon: TrendingUp,
            action: 'View Analytics',
            stats: { avgRating: 4.6, onTimeDelivery: 96, satisfaction: 4.8 }
          }
        ];

      case 'technical-support':
        return [
          {
            title: 'Support Tickets',
            description: 'Handle technical support requests',
            icon: AlertTriangle,
            action: 'View Tickets',
            stats: { open: 8, resolved: 156, avgTime: 24 }
          },
          {
            title: 'System Health',
            description: 'Monitor system performance',
            icon: TrendingUp,
            action: 'Check Status',
            stats: { uptime: 99.8, performance: 94, alerts: 2 }
          },
          {
            title: 'User Management',
            description: 'Manage user accounts and access',
            icon: Users,
            action: 'Manage Users',
            stats: { activeUsers: 1250, newRegistrations: 45, issues: 3 }
          }
        ];

      default:
        return [
          {
            title: 'Dashboard',
            description: 'Overview of your activities',
            icon: Target,
            action: 'View Dashboard',
            stats: { total: 0, pending: 0, completed: 0 }
          }
        ];
    }
  };

  const dashboardSections = getDashboardSections();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Welcome back, {user?.name || 'Employee'}!</h1>
              <p className="text-blue-100 mt-1">
                {categoryConfig?.description || 'Manage your employee tasks and responsibilities'}
              </p>
              <div className="flex items-center mt-3 space-x-4">
                <Badge variant="secondary" className="bg-white/20 text-white">
                  {categoryConfig?.name || 'Employee'}
                </Badge>
                <div className="flex items-center space-x-1">
                  <Award className="h-4 w-4" />
                  <span className="text-sm">Rating: {employee.performance.rating}</span>
                </div>
                {employee.categorySpecific?.region && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-4 w-4" />
                    <span className="text-sm">{employee.categorySpecific.region}</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Current Workload</div>
              <div className="text-3xl font-bold">{employee.workload}%</div>
              <Progress value={employee.workload} className="w-32 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Completed Tasks</p>
                <p className="text-2xl font-semibold">{employee.performance.completedTasks}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Accuracy Rate</p>
                <p className="text-2xl font-semibold">{employee.performance.accuracy}%</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
                <Award className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Performance</p>
                <p className="text-2xl font-semibold">{employee.performance.rating}/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Specializations</p>
                <p className="text-2xl font-semibold">{employee.specializations.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category-Specific Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {dashboardSections.map((section, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <section.icon className="h-5 w-5 text-blue-600" />
                {section.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 text-sm mb-4">{section.description}</p>
              
              <div className="space-y-2 mb-4">
                {Object.entries(section.stats).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-sm">
                    <span className="text-gray-500 capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
                    <span className="font-medium">{String(value)}</span>
                  </div>
                ))}
              </div>

              <Button className="w-full" size="sm">
                {section.action}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Permissions Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Your Permissions & Capabilities</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {employee.permissions.map((permission) => (
              <Badge key={permission} variant="outline" className="justify-center py-2">
                {permission.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CategoryDashboard;
