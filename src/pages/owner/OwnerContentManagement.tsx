
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { FileText, Upload, CheckCircle, AlertTriangle, Eye, Search } from 'lucide-react';

const OwnerContentManagement: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const contentStats = [
    { title: 'Total Content', value: '2,547', change: '+12.3%', icon: FileText, color: 'text-blue-600' },
    { title: 'Pending Review', value: '89', change: '+5', icon: AlertTriangle, color: 'text-orange-600' },
    { title: 'Approved', value: '2,234', change: '+45', icon: CheckCircle, color: 'text-green-600' },
    { title: 'Published', value: '2,100', change: '+38', icon: Upload, color: 'text-purple-600' },
  ];

  const pendingContent = [
    { id: 1, title: 'Advanced Mathematics Chapter 5', type: 'Course', author: 'Dr. Smith', date: '2025-06-01', priority: 'High' },
    { id: 2, title: 'Physics Mock Test - Mechanics', type: 'Test', author: 'Prof. Johnson', date: '2025-05-30', priority: 'Medium' },
    { id: 3, title: 'English Grammar PDF', type: 'PDF', author: 'Ms. Davis', date: '2025-05-29', priority: 'Low' },
    { id: 4, title: 'Chemistry Lab Experiments', type: 'Course', author: 'Dr. Wilson', date: '2025-05-28', priority: 'High' },
  ];

  const qualityMetrics = [
    { metric: 'Content Quality Score', value: '94.2%', change: '+2.1%', status: 'excellent' },
    { metric: 'User Engagement Rate', value: '87.5%', change: '+4.3%', status: 'good' },
    { metric: 'Completion Rate', value: '76.8%', change: '+1.7%', status: 'good' },
    { metric: 'Error Rate', value: '2.1%', change: '-0.8%', status: 'excellent' },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Content Management</h1>
          <p className="text-gray-600">Oversee and manage all platform content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Eye className="h-4 w-4 mr-2" />
            Review Queue
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Upload className="h-4 w-4 mr-2" />
            Upload Content
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contentStats.map((stat, index) => (
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

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Review</TabsTrigger>
          <TabsTrigger value="approved">Approved Content</TabsTrigger>
          <TabsTrigger value="quality">Quality Metrics</TabsTrigger>
          <TabsTrigger value="analytics">Content Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Content Awaiting Review</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Content</th>
                      <th className="text-left py-3 px-4">Type</th>
                      <th className="text-left py-3 px-4">Author</th>
                      <th className="text-left py-3 px-4">Priority</th>
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingContent.map((item) => (
                      <tr key={item.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 font-medium">{item.title}</td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{item.type}</Badge>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{item.author}</td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={item.priority === 'High' ? 'destructive' : 
                                   item.priority === 'Medium' ? 'secondary' : 'default'}
                          >
                            {item.priority}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{item.date}</td>
                        <td className="py-3 px-4 space-x-2">
                          <Button variant="outline" size="sm">Review</Button>
                          <Button size="sm">Approve</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="approved">
          <Card>
            <CardHeader>
              <CardTitle>Recently Approved Content</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">Content that has been reviewed and approved for publication.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <Card key={item} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline">Course</Badge>
                      <Badge className="bg-green-100 text-green-800">Approved</Badge>
                    </div>
                    <h4 className="font-medium mb-1">Sample Course Title {item}</h4>
                    <p className="text-sm text-gray-600 mb-3">By Dr. Sample Author</p>
                    <Button variant="outline" size="sm" className="w-full">View Details</Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="quality">
          <Card>
            <CardHeader>
              <CardTitle>Content Quality Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {qualityMetrics.map((metric, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <div className="font-medium">{metric.metric}</div>
                      <div className="text-sm text-gray-600">{metric.change} from last month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">{metric.value}</div>
                      <div className={`text-sm ${metric.status === 'excellent' ? 'text-green-600' : 'text-blue-600'}`}>
                        {metric.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Content Performance Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">1,234,567</div>
                  <div className="text-sm text-gray-600">Total Content Views</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">89.2%</div>
                  <div className="text-sm text-gray-600">Content Satisfaction</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">456</div>
                  <div className="text-sm text-gray-600">Content Contributors</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerContentManagement;
