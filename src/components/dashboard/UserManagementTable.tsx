
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Eye } from 'lucide-react';

const userData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'student', status: 'active', joinDate: '2024-01-15', targetExam: 'IBPS PO' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'mentor', status: 'active', joinDate: '2024-02-20', targetExam: 'SSC CGL' },
  { id: 3, name: 'Mike Johnson', email: 'mike@example.com', role: 'admin', status: 'active', joinDate: '2024-01-10', targetExam: 'UPSC' },
  { id: 4, name: 'Sarah Wilson', email: 'sarah@example.com', role: 'student', status: 'inactive', joinDate: '2024-03-05', targetExam: 'CAT' },
  { id: 5, name: 'David Brown', email: 'david@example.com', role: 'employee', status: 'active', joinDate: '2024-02-28', targetExam: 'GATE' },
];

const UserManagementTable = () => {
  const getRoleColor = (role: string) => {
    const colors = {
      student: 'bg-blue-100 text-blue-800',
      mentor: 'bg-green-100 text-green-800',
      admin: 'bg-purple-100 text-purple-800',
      employee: 'bg-orange-100 text-orange-800',
    };
    return colors[role as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusColor = (status: string) => {
    return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">User Management</h3>
        <Button size="sm">Add New User</Button>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Target Exam</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {userData.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">{user.name}</TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Badge className={getRoleColor(user.role)}>{user.role}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(user.status)}>{user.status}</Badge>
              </TableCell>
              <TableCell>{user.targetExam}</TableCell>
              <TableCell>{user.joinDate}</TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UserManagementTable;
