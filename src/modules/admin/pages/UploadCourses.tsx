
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Upload, FileText, Edit, Trash, Eye, Calendar, Book } from 'lucide-react';

const UploadCourses = () => {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  
  // Mock course data
  const courses = [
    { id: 1, title: 'IBPS PO Complete Course', type: 'Course', category: 'Banking & Insurance', status: 'Published', items: 24, availability: 'Permanent', updatedAt: '1 week ago' },
    { id: 2, title: 'Current Affairs Monthly Digest', type: 'PDF', category: 'General', status: 'Published', pages: 45, availability: 'Apr 12, 2025 - May 12, 2025', updatedAt: '3 days ago' },
    { id: 3, title: 'Quantitative Aptitude Formulas', type: 'PDF', category: 'Mathematics', status: 'Draft', pages: 20, availability: 'Not published', updatedAt: '2 days ago' },
  ];
  
  const filteredCourses = courses.filter(course => 
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    course.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const createCourse = () => {
    toast({
      title: "Create Course",
      description: "This would open the course creation form in the full implementation.",
    });
  };
  
  const uploadPDF = () => {
    toast({
      title: "Upload PDF",
      description: "This would open the PDF upload interface in the full implementation.",
    });
  };
  
  const editItem = (id: number, type: string) => {
    toast({
      title: `Edit ${type}`,
      description: `This would open the editor for ${type} ID ${id}.`,
    });
  };
  
  const previewItem = (id: number, type: string) => {
    toast({
      title: `Preview ${type}`,
      description: `This would open a preview for ${type} ID ${id}.`,
    });
  };
  
  const deleteItem = (id: number, type: string) => {
    toast({
      title: `Delete ${type}`,
      description: `This would confirm deletion of ${type} ID ${id}.`,
      variant: "destructive",
    });
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Upload Courses & PDFs</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={uploadPDF}>
            <Upload className="h-4 w-4 mr-2" />
            Upload PDF
          </Button>
          <Button onClick={createCourse}>
            <Plus className="h-4 w-4 mr-2" />
            Create Course
          </Button>
        </div>
      </div>
      
      <Card className="p-6">
        <Tabs defaultValue="all">
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="courses">Courses</TabsTrigger>
              <TabsTrigger value="pdfs">PDFs</TabsTrigger>
            </TabsList>
            
            <div className="relative">
              <Input
                type="search"
                placeholder="Search courses and PDFs..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <TabsContent value="all" className="m-0">
            <div className="space-y-4">
              {filteredCourses.length > 0 ? (
                filteredCourses.map((course) => (
                  <Card key={course.id} className="p-4">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg ${
                          course.type === 'Course' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
                        }`}>
                          {course.type === 'Course' ? (
                            <Book className="h-5 w-5" />
                          ) : (
                            <FileText className="h-5 w-5" />
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold">{course.title}</h3>
                          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                            <span>{course.category}</span>
                            {course.type === 'Course' ? (
                              <span>{course.items} items</span>
                            ) : (
                              <span>{course.pages} pages</span>
                            )}
                            <div className="flex items-center">
                              <Calendar className="h-3.5 w-3.5 mr-1" />
                              <span>{course.availability}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 w-full md:w-auto">
                        <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center ${
                          course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {course.status}
                        </span>
                        <Button variant="outline" size="sm" onClick={() => previewItem(course.id, course.type)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => editItem(course.id, course.type)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteItem(course.id, course.type)}>
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-10 border border-dashed rounded-md">
                  <p className="text-gray-500">No courses or PDFs found matching your search criteria</p>
                  <div className="flex justify-center gap-2 mt-4">
                    <Button variant="outline" onClick={uploadPDF}>Upload PDF</Button>
                    <Button onClick={createCourse}>Create Course</Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="courses" className="m-0">
            <div className="space-y-4">
              {filteredCourses.filter(c => c.type === 'Course').length > 0 ? (
                filteredCourses
                  .filter(c => c.type === 'Course')
                  .map((course) => (
                    <Card key={course.id} className="p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-100 text-blue-800 p-2 rounded-lg">
                            <Book className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{course.title}</h3>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                              <span>{course.category}</span>
                              <span>{course.items} items</span>
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                <span>{course.availability}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center ${
                            course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.status}
                          </span>
                          <Button variant="outline" size="sm" onClick={() => previewItem(course.id, course.type)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => editItem(course.id, course.type)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteItem(course.id, course.type)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-10 border border-dashed rounded-md">
                  <p className="text-gray-500">No courses found matching your search criteria</p>
                  <Button className="mt-4" onClick={createCourse}>Create Course</Button>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="pdfs" className="m-0">
            <div className="space-y-4">
              {filteredCourses.filter(c => c.type === 'PDF').length > 0 ? (
                filteredCourses
                  .filter(c => c.type === 'PDF')
                  .map((course) => (
                    <Card key={course.id} className="p-4">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex items-start gap-3">
                          <div className="bg-purple-100 text-purple-800 p-2 rounded-lg">
                            <FileText className="h-5 w-5" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{course.title}</h3>
                            <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                              <span>{course.category}</span>
                              <span>{course.pages} pages</span>
                              <div className="flex items-center">
                                <Calendar className="h-3.5 w-3.5 mr-1" />
                                <span>{course.availability}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex gap-2 w-full md:w-auto">
                          <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center ${
                            course.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {course.status}
                          </span>
                          <Button variant="outline" size="sm" onClick={() => previewItem(course.id, course.type)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => editItem(course.id, course.type)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-500" onClick={() => deleteItem(course.id, course.type)}>
                            <Trash className="h-4 w-4 mr-2" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </Card>
                  ))
              ) : (
                <div className="text-center py-10 border border-dashed rounded-md">
                  <p className="text-gray-500">No PDFs found matching your search criteria</p>
                  <Button variant="outline" className="mt-4" onClick={uploadPDF}>Upload PDF</Button>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  );
};

export default UploadCourses;
