
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  TrendingUp, Users, DollarSign, Activity, 
  Download, Calendar, Eye, AlertTriangle 
} from 'lucide-react';
import UserActivityChart from '@/components/dashboard/UserActivityChart';
import SystemHealthChart from '@/components/dashboard/SystemHealthChart';
import PlatformAnalyticsChart from '@/components/dashboard/PlatformAnalyticsChart';

const SuperAdminAnalytics = () => {
  const keyMetrics = [
    { title: 'Total Users', value: '12,845', change: '+12.3%', trend: 'up', icon: Users },
    { title: 'Monthly Revenue', value: '₹78,450', change: '+8.7%', trend: 'up', icon: DollarSign },
    { title: 'System Uptime', value: '99.9%', change: '+0.1%', trend: 'up', icon: Activity },
    { title: 'Active Sessions', value: '3,245', change: '+15.2%', trend: 'up', icon: TrendingUp },
  ];

  const systemAlerts = [
    { id: 1, type: 'warning', message: 'High CPU usage detected on server cluster 2', time: '5 minutes ago' },
    { id: 2, type: 'info', message: 'Database backup completed successfully', time: '1 hour ago' },
    { id: 3, type: 'error', message: 'Payment gateway timeout for 3 transactions', time: '2 hours ago' },
    { id: 4, type: 'success', message: 'New features deployed successfully', time: '4 hours ago' },
  ];

  const getAlertColor = (type: string) => {
    const colors = {
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      info: 'bg-blue-100 text-blue-800',
      success: 'bg-green-100 text-green-800',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Platform Analytics</h1>
          <p className="text-gray-600 mt-2">Comprehensive platform performance and user analytics</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {keyMetrics.map((metric, index) => {
          const IconComponent = metric.icon;
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{metric.title}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <Badge className={metric.trend === 'up' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {metric.change}
                      </Badge>
                    </div>
                  </div>
                  <IconComponent className="h-8 w-8 text-gray-400" />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>User Activity Trends</CardTitle>
            <CardDescription>
              Daily user activity across different roles
            </CardDescription>
          </CardHeader>
          <CardContent>
            <UserActivityChart />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Health Monitoring</CardTitle>
            <CardDescription>
              Real-time system performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SystemHealthChart />
          </CardContent>
        </Card>
      </div>

      {/* Platform Analytics */}
      <Card>
        <CardHeader>
          <CardTitle>Platform Performance Analytics</CardTitle>
          <CardDescription>
            Detailed analytics on exam categories, user growth, and platform usage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PlatformAnalyticsChart />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              System Alerts
            </CardTitle>
            <CardDescription>
              Recent system notifications and alerts
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {systemAlerts.map((alert) => (
                <div key={alert.id} className="flex items-start gap-3 p-3 border rounded-lg">
                  <Badge className={getAlertColor(alert.type)}>
                    {alert.type}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm">{alert.message}</p>
                    <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Statistics</CardTitle>
            <CardDescription>
              At-a-glance platform statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-xl font-bold text-blue-600">89%</div>
                  <div className="text-sm text-gray-600">User Satisfaction</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-xl font-bold text-green-600">76%</div>
                  <div className="text-sm text-gray-600">Test Completion Rate</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-xl font-bold text-purple-600">4.8</div>
                  <div className="text-sm text-gray-600">Average Rating</div>
                </div>
                <div className="text-center p-4 bg-orange-50 rounded-lg">
                  <div className="text-xl font-bold text-orange-600">2.3M</div>
                  <div className="text-sm text-gray-600">Total Questions</div>
                </div>
              </div>
              
              <div className="space-y-3 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Database Size</span>
                  <span className="font-semibold">2.4 TB</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">API Calls Today</span>
                  <span className="font-semibold">1,24,567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Error Rate</span>
                  <span className="font-semibold text-green-600">0.02%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Peak Users Today</span>
                  <span className="font-semibold">8,923</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SuperAdminAnalytics;
