
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Users, UserPlus, Activity, Shield, Search, Filter } from 'lucide-react';

const OwnerManageUsers: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const userStats = [
    { title: 'Total Users', value: '12,547', change: '+8.2%', icon: Users, color: 'text-blue-600' },
    { title: 'Active Users', value: '9,234', change: '+12.5%', icon: Activity, color: 'text-green-600' },
    { title: 'New This Month', value: '432', change: '+23.1%', icon: UserPlus, color: 'text-purple-600' },
    { title: 'Admin Users', value: '34', change: '+2', icon: Shield, color: 'text-orange-600' },
  ];

  const recentUsers = [
    { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'Student', status: 'Active', joinDate: '2025-06-01' },
    { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'Mentor', status: 'Active', joinDate: '2025-05-28' },
    { id: 3, name: 'Carol Davis', email: 'carol@example.com', role: 'Employee', status: 'Pending', joinDate: '2025-05-25' },
    { id: 4, name: 'David Wilson', email: 'david@example.com', role: 'Student', status: 'Inactive', joinDate: '2025-05-20' },
  ];

  const roleDistribution = [
    { role: 'Students', count: 11250, percentage: 89.7 },
    { role: 'Mentors', count: 845, percentage: 6.7 },
    { role: 'Employees', count: 398, percentage: 3.2 },
    { role: 'Admins', count: 54, percentage: 0.4 },
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600">Manage and monitor all platform users</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filter
          </Button>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {userStats.map((stat, index) => (
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

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">All Users</TabsTrigger>
          <TabsTrigger value="roles">Role Distribution</TabsTrigger>
          <TabsTrigger value="activity">User Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4">
          {/* Search and Filters */}
          <Card>
            <CardHeader>
              <CardTitle>User Directory</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search users..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Users Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">User</th>
                      <th className="text-left py-3 px-4">Role</th>
                      <th className="text-left py-3 px-4">Status</th>
                      <th className="text-left py-3 px-4">Join Date</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentUsers.map((user) => (
                      <tr key={user.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <div>
                            <div className="font-medium">{user.name}</div>
                            <div className="text-sm text-gray-500">{user.email}</div>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline">{user.role}</Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            variant={user.status === 'Active' ? 'default' : 
                                   user.status === 'Pending' ? 'secondary' : 'destructive'}
                          >
                            {user.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">{user.joinDate}</td>
                        <td className="py-3 px-4">
                          <Button variant="ghost" size="sm">Edit</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <Card>
            <CardHeader>
              <CardTitle>Role Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {roleDistribution.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="font-medium">{item.role}</div>
                      <Badge variant="secondary">{item.count.toLocaleString()}</Badge>
                    </div>
                    <div className="text-sm text-gray-600">{item.percentage}%</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activity">
          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">7,234</div>
                  <div className="text-sm text-gray-600">Daily Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">45,678</div>
                  <div className="text-sm text-gray-600">Weekly Active Users</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">156,789</div>
                  <div className="text-sm text-gray-600">Monthly Active Users</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default OwnerManageUsers;
