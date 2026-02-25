
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Search, Filter, BarChart2, Ban, CheckCircle } from 'lucide-react';

const ManageStudents = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock student data
  const students = [
    { id: 1, name: 'Priya Singh', email: 'priya@example.com', status: 'Active', state: 'Maharashtra', exam: 'IBPS PO', testsTaken: 18, avgScore: 72, joined: '2 months ago' },
    { id: 2, name: 'Rahul Kumar', email: 'rahul@example.com', status: 'Active', state: 'Delhi', exam: 'SSC CGL', testsTaken: 12, avgScore: 68, joined: '3 months ago' },
    { id: 3, name: 'Ananya Sharma', email: 'ananya@example.com', status: 'Blocked', state: 'Uttar Pradesh', exam: 'RRB NTPC', testsTaken: 5, avgScore: 45, joined: '1 month ago' },
  ];
  
  const filteredStudents = students.filter(student => 
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.exam.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.state.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const viewStudentProgress = (id: number) => {
    toast({
      title: "View Progress",
      description: `This would open detailed progress view for student ID ${id}.`,
    });
  };
  
  const toggleStudentStatus = (id: number, currentStatus: string) => {
    toast({
      title: currentStatus === 'Active' ? "Block Student" : "Unblock Student",
      description: `This would ${currentStatus === 'Active' ? 'block' : 'unblock'} student ID ${id}.`,
      variant: currentStatus === 'Active' ? "destructive" : "default",
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manage Students</h1>
        <Button variant="outline">Bulk Actions</Button>
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All Students</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="blocked">Blocked</TabsTrigger>
            </TabsList>
            
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search students..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <TabsContent value="all" className="m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Tests Taken</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell className="font-medium">{student.name}</TableCell>
                      <TableCell>{student.email}</TableCell>
                      <TableCell>{student.state}</TableCell>
                      <TableCell>{student.exam}</TableCell>
                      <TableCell>{student.testsTaken}</TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          student.avgScore >= 70 ? 'text-green-600' : 
                          student.avgScore >= 50 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {student.avgScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          student.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {student.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => viewStudentProgress(student.id)}>
                          <BarChart2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => toggleStudentStatus(student.id, student.status)}
                        >
                          {student.status === 'Active' ? (
                            <Ban className="h-4 w-4 text-red-500" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-10 text-gray-500">
                      No students found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="active" className="m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Tests Taken</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.filter(s => s.status === 'Active').length > 0 ? (
                  filteredStudents
                    .filter(s => s.status === 'Active')
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.state}</TableCell>
                        <TableCell>{student.exam}</TableCell>
                        <TableCell>{student.testsTaken}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            student.avgScore >= 70 ? 'text-green-600' : 
                            student.avgScore >= 50 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {student.avgScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => viewStudentProgress(student.id)}>
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleStudentStatus(student.id, student.status)}
                          >
                            <Ban className="h-4 w-4 text-red-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      No active students found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
          
          <TabsContent value="blocked" className="m-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>State</TableHead>
                  <TableHead>Exam</TableHead>
                  <TableHead>Tests Taken</TableHead>
                  <TableHead>Avg. Score</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStudents.filter(s => s.status === 'Blocked').length > 0 ? (
                  filteredStudents
                    .filter(s => s.status === 'Blocked')
                    .map((student) => (
                      <TableRow key={student.id}>
                        <TableCell className="font-medium">{student.name}</TableCell>
                        <TableCell>{student.email}</TableCell>
                        <TableCell>{student.state}</TableCell>
                        <TableCell>{student.exam}</TableCell>
                        <TableCell>{student.testsTaken}</TableCell>
                        <TableCell>
                          <span className={`font-medium ${
                            student.avgScore >= 70 ? 'text-green-600' : 
                            student.avgScore >= 50 ? 'text-yellow-600' : 
                            'text-red-600'
                          }`}>
                            {student.avgScore}%
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="icon" onClick={() => viewStudentProgress(student.id)}>
                            <BarChart2 className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => toggleStudentStatus(student.id, student.status)}
                          >
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-gray-500">
                      No blocked students found matching your search criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default ManageStudents;
