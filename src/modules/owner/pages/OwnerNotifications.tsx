
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Bell, Send, Users, AlertTriangle, CheckCircle, Settings } from 'lucide-react';

const OwnerNotifications: React.FC = () => {
  const [newNotification, setNewNotification] = useState({ title: '', message: '', target: 'all' });

  const notificationStats = [
    { title: 'Total Sent', value: '45,678', change: '+12.3%', icon: Send, color: 'text-blue-600' },
    { title: 'Delivered', value: '44,234', change: '+11.8%', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Open Rate', value: '89.2%', change: '+2.1%', icon: Users, color: 'text-purple-600' },
    { title: 'Click Rate', value: '23.4%', change: '+4.5%', icon: AlertTriangle, color: 'text-orange-600' },
  ];

  const recentNotifications = [
    { 
      id: 1, 
      title: 'System Maintenance Scheduled', 
      message: 'Platform will be under maintenance on June 5th from 2-4 AM EST',
      target: 'All Users',
      status: 'Sent',
      date: '2025-06-02',
      opens: 8934,
      clicks: 1247
    },
    { 
      id: 2, 
      title: 'New Feature: AI Study Assistant', 
      message: 'Introducing our new AI-powered study assistant to help students learn better',
      target: 'Students',
      status: 'Sent',
      date: '2025-06-01',
      opens: 12456,
      clicks: 3421
    },
    { 
      id: 3, 
      title: 'Mentor Training Session', 
      message: 'Join us for the monthly mentor training session this Friday',
      target: 'Mentors',
      status: 'Scheduled',
      date: '2025-06-03',
      opens: 0,
      clicks: 0
    },
  ];

  const handleSendNotification = () => {
    console.log('Sending notification:', newNotification);
    setNewNotification({ title: '', message: '', target: 'all' });
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
          <p className="text-gray-600">Send and manage platform-wide notifications</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Bell className="h-4 w-4 mr-2" />
            Create Alert
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {notificationStats.map((stat, index) => (
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

      <Tabs defaultValue="send" className="space-y-4">
        <TabsList>
          <TabsTrigger value="send">Send Notification</TabsTrigger>
          <TabsTrigger value="history">Notification History</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        <TabsContent value="send" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Notification</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Notification Title</label>
                <Input
                  placeholder="Enter notification title"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification({...newNotification, title: e.target.value})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Message</label>
                <Textarea
                  placeholder="Enter your message here..."
                  value={newNotification.message}
                  onChange={(e) => setNewNotification({...newNotification, message: e.target.value})}
                  rows={4}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Target Audience</label>
                <select 
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={newNotification.target}
                  onChange={(e) => setNewNotification({...newNotification, target: e.target.value})}
                >
                  <option value="all">All Users</option>
                  <option value="students">Students Only</option>
                  <option value="mentors">Mentors Only</option>
                  <option value="employees">Employees Only</option>
                  <option value="admins">Admins Only</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSendNotification} className="bg-blue-600 hover:bg-blue-700">
                  <Send className="h-4 w-4 mr-2" />
                  Send Now
                </Button>
                <Button variant="outline">
                  Schedule for Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Notification History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Title</th>
                      <th className="text-left py-3 px-4">Target</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Performance</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentNotifications.map((notification) => (
                      <tr key={notification.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div className="font-medium">{notification.title}</div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">{notification.message}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{notification.target}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={notification.status === 'Sent' ? 'default' : 'secondary'}
                          >
                            {notification.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{notification.date}</td>
                        <td className="py-3 px-4 text-sm">
                          <div>Opens: {notification.opens.toLocaleString()}</div>
                          <div>Clicks: {notification.clicks.toLocaleString()}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">View</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Engagement Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Average Open Rate</span>
                    <span className="font-bold text-green-600">89.2%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Average Click Rate</span>
                    <span className="font-bold text-blue-600">23.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Unsubscribe Rate</span>
                    <span className="font-bold text-red-600">0.8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Best Sending Time</span>
                    <span className="font-bold">2:00 PM</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Performing Notifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">New Feature: AI Study Assistant</div>
                    <div className="text-xs text-gray-600">Click rate: 27.5%</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Monthly Progress Report</div>
                    <div className="text-xs text-gray-600">Click rate: 24.8%</div>
                  </div>
                  <div className="p-3 border rounded-lg">
                    <div className="font-medium text-sm">Exam Reminder</div>
                    <div className="text-xs text-gray-600">Click rate: 22.3%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <CardTitle>Notification Templates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  'System Maintenance',
                  'New Feature Announcement',
                  'Exam Reminder',
                  'Payment Due',
                  'Course Update',
                  'Emergency Alert'
                ].map((template, index) => (
                  <Card key={index} className="p-4">
                    <h4 className="font-medium mb-2">{template}</h4>
                    <p className="text-sm text-gray-600 mb-3">Pre-built template for {template.toLowerCase()}</p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">Use Template</Button>
                      <Button variant="ghost" size="sm">Edit</Button>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerNotifications;
