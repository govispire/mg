
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, DollarSign, Users, Target, Download, Calendar } from 'lucide-react';

const OwnerBusinessAnalytics: React.FC = () => {
  const revenueStats = [
    { title: 'Monthly Revenue', value: '$87,450', change: '+12.3%', icon: DollarSign, color: 'text-green-600' },
    { title: 'Annual Revenue', value: '$945,678', change: '+18.7%', icon: TrendingUp, color: 'text-blue-600' },
    { title: 'User Acquisition Cost', value: '$23.50', change: '-8.2%', icon: Users, color: 'text-purple-600' },
    { title: 'Conversion Rate', value: '12.8%', change: '+2.1%', icon: Target, color: 'text-orange-600' },
  ];

  const revenueTrend = [
    { month: 'Jan', revenue: 45000, users: 8500 },
    { month: 'Feb', revenue: 52000, users: 9200 },
    { month: 'Mar', revenue: 61000, users: 10100 },
    { month: 'Apr', revenue: 58000, users: 9800 },
    { month: 'May', revenue: 73000, users: 11200 },
    { month: 'Jun', revenue: 87450, users: 12547 },
  ];

  const topMetrics = [
    { label: 'Customer Lifetime Value', value: '$1,250', trend: '+15%' },
    { label: 'Churn Rate', value: '4.2%', trend: '-1.3%' },
    { label: 'Average Order Value', value: '$145', trend: '+8%' },
    { label: 'Market Share', value: '23.5%', trend: '+2.8%' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Business Analytics</h1>
          <p className="text-gray-600">Comprehensive business performance insights</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Date Range
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {revenueStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600">{stat.change}</p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="users">User Analytics</TabsTrigger>
          <TabsTrigger value="conversion">Conversion Funnel</TabsTrigger>
          <TabsTrigger value="performance">Performance KPIs</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend (Last 6 Months)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueTrend.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="font-medium">{item.month}</span>
                      <div className="text-right">
                        <div className="font-bold">${item.revenue.toLocaleString()}</div>
                        <div className="text-sm text-gray-600">{item.users.toLocaleString()} users</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revenue Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Subscription Revenue</span>
                    <span className="font-bold">$65,340 (74.7%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Course Sales</span>
                    <span className="font-bold">$15,620 (17.9%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Premium Features</span>
                    <span className="font-bold">$4,890 (5.6%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Other Revenue</span>
                    <span className="font-bold">$1,600 (1.8%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="users">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Growth</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600">12,547</div>
                  <div className="text-sm text-gray-600 mb-4">Total Users</div>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">+8.2%</span> from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">89.3%</div>
                  <div className="text-sm text-gray-600 mb-4">Active Users</div>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">+4.7%</span> from last month
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Retention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600">94.2%</div>
                  <div className="text-sm text-gray-600 mb-4">30-Day Retention</div>
                  <div className="text-sm">
                    <span className="text-green-600 font-medium">+2.1%</span> from last month
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="conversion">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Funnel Analysis</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <span className="font-medium">Website Visitors</span>
                  <div className="text-right">
                    <div className="font-bold">45,678</div>
                    <div className="text-sm text-gray-600">100%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="font-medium">Sign-ups</span>
                  <div className="text-right">
                    <div className="font-bold">8,234</div>
                    <div className="text-sm text-gray-600">18.0%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <span className="font-medium">Trial Users</span>
                  <div className="text-right">
                    <div className="font-bold">5,890</div>
                    <div className="text-sm text-gray-600">71.5%</div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <span className="font-medium">Paid Conversions</span>
                  <div className="text-right">
                    <div className="font-bold">2,456</div>
                    <div className="text-sm text-gray-600">41.7%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>Key Performance Indicators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {topMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="font-medium">{metric.label}</div>
                    <div className="text-right">
                      <div className="text-xl font-bold">{metric.value}</div>
                      <div className={`text-sm ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerBusinessAnalytics;
