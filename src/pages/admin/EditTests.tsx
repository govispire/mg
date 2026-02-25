
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, FileUp, FileCog, Edit, Trash, Clock, FileText, CalendarCheck, Search, Eye } from 'lucide-react';
import { TestCreationForm } from '@/components/admin/TestCreationForm';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigate } from 'react-router-dom';

const EditTests = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [searchQuery, setSearchQuery] = useState('');
  const [showTestCreationForm, setShowTestCreationForm] = useState(false);
  
  // Mock test data
  const tests = [
    { id: 1, name: 'IBPS PO Prelims Mock Test 1', category: 'Banking & Insurance', status: 'Published', questions: 100, duration: '60 mins', lastUpdated: '2 days ago' },
    { id: 2, name: 'SSC CGL Tier 1 Full Test', category: 'SSC', status: 'Draft', questions: 100, duration: '60 mins', lastUpdated: '5 days ago' },
    { id: 3, name: 'RRB NTPC General Awareness', category: 'Railway', status: 'Published', questions: 50, duration: '45 mins', lastUpdated: '1 week ago' },
  ];
  
  const filteredTests = tests.filter(test => 
    test.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    test.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const createTest = () => {
    setShowTestCreationForm(true);
  };
  
  const bulkUpload = () => {
    toast({
      title: "Bulk Upload",
      description: "This would open the bulk upload interface in the full implementation.",
    });
  };
  
  const editTest = (id: number) => {
    toast({
      title: "Edit Test",
      description: `This would open the test editor for test ID ${id}.`,
    });
  };
  
  const deleteTest = (id: number) => {
    toast({
      title: "Delete Test",
      description: `This would confirm deletion of test ID ${id}.`,
      variant: "destructive",
    });
  };
  
  const previewTest = (id: number) => {
    navigate(`/admin/test-preview/${id}`);
  };
  
  return (
    <div className="container mx-auto px-4 py-6">
      {showTestCreationForm ? (
        <TestCreationForm onClose={() => setShowTestCreationForm(false)} />
      ) : (
        <>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <h1 className="text-2xl font-bold">Create & Edit Tests</h1>
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              <Button variant="outline" onClick={bulkUpload} className="flex-1 md:flex-none">
                <FileUp className="h-4 w-4 mr-2" />
                Bulk Upload
              </Button>
              <Button onClick={createTest} className="flex-1 md:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                Create Test
              </Button>
            </div>
          </div>
          
          <Card className="p-4 md:p-6">
            <Tabs defaultValue="all" className="w-full">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <TabsList className={`${isMobile ? 'w-full grid grid-cols-3' : ''}`}>
                  <TabsTrigger value="all">All Tests</TabsTrigger>
                  <TabsTrigger value="published">Published</TabsTrigger>
                  <TabsTrigger value="drafts">Drafts</TabsTrigger>
                </TabsList>
                
                <div className="relative w-full md:w-auto">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="search"
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-full md:w-auto"
                  />
                </div>
              </div>
              
              <TabsContent value="all" className="m-0">
                <div className="space-y-4">
                  {filteredTests.length > 0 ? (
                    filteredTests.map((test) => (
                      <Card key={test.id} className="p-4">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                          <div className="flex items-start gap-3 w-full md:w-auto">
                            <div className={`p-2 rounded-lg shrink-0 ${
                              test.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              <FileCog className="h-5 w-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <h3 className="font-semibold truncate">{test.name}</h3>
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                <span>{test.category}</span>
                                <div className="flex items-center">
                                  <FileText className="h-3.5 w-3.5 mr-1" />
                                  <span>{test.questions} Questions</span>
                                </div>
                                <div className="flex items-center">
                                  <Clock className="h-3.5 w-3.5 mr-1" />
                                  <span>{test.duration}</span>
                                </div>
                                <div className="flex items-center">
                                  <CalendarCheck className="h-3.5 w-3.5 mr-1" />
                                  <span>Updated {test.lastUpdated}</span>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2 w-full md:w-auto">
                            <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full flex items-center ${
                              test.status === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {test.status}
                            </span>
                            <Button variant="outline" size="sm" onClick={() => previewTest(test.id)} className="flex-1 md:flex-none">
                              <Eye className="h-4 w-4 mr-2" />
                              Preview
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => editTest(test.id)} className="flex-1 md:flex-none">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button variant="outline" size="sm" className="text-red-500 flex-1 md:flex-none" onClick={() => deleteTest(test.id)}>
                              <Trash className="h-4 w-4 mr-2" />
                              Delete
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-md">
                      <p className="text-gray-500">No tests found matching your search criteria</p>
                      <Button variant="outline" className="mt-4" onClick={createTest}>Create a Test</Button>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="published" className="m-0">
                <div className="space-y-4">
                  {filteredTests.filter(t => t.status === 'Published').length > 0 ? (
                    filteredTests
                      .filter(t => t.status === 'Published')
                      .map((test) => (
                        <Card key={test.id} className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-3 w-full md:w-auto">
                              <div className="bg-green-100 text-green-800 p-2 rounded-lg shrink-0">
                                <FileCog className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold truncate">{test.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                  <span>{test.category}</span>
                                  <div className="flex items-center">
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    <span>{test.questions} Questions</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    <span>{test.duration}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CalendarCheck className="h-3.5 w-3.5 mr-1" />
                                    <span>Updated {test.lastUpdated}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 flex items-center">
                                Published
                              </span>
                              <Button variant="outline" size="sm" onClick={() => previewTest(test.id)} className="flex-1 md:flex-none">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => editTest(test.id)} className="flex-1 md:flex-none">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500 flex-1 md:flex-none" onClick={() => deleteTest(test.id)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-md">
                      <p className="text-gray-500">No published tests found matching your search criteria</p>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="drafts" className="m-0">
                <div className="space-y-4">
                  {filteredTests.filter(t => t.status === 'Draft').length > 0 ? (
                    filteredTests
                      .filter(t => t.status === 'Draft')
                      .map((test) => (
                        <Card key={test.id} className="p-4">
                          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                            <div className="flex items-start gap-3 w-full md:w-auto">
                              <div className="bg-yellow-100 text-yellow-800 p-2 rounded-lg shrink-0">
                                <FileCog className="h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <h3 className="font-semibold truncate">{test.name}</h3>
                                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                                  <span>{test.category}</span>
                                  <div className="flex items-center">
                                    <FileText className="h-3.5 w-3.5 mr-1" />
                                    <span>{test.questions} Questions</span>
                                  </div>
                                  <div className="flex items-center">
                                    <Clock className="h-3.5 w-3.5 mr-1" />
                                    <span>{test.duration}</span>
                                  </div>
                                  <div className="flex items-center">
                                    <CalendarCheck className="h-3.5 w-3.5 mr-1" />
                                    <span>Updated {test.lastUpdated}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                              <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800 flex items-center">
                                Draft
                              </span>
                              <Button variant="outline" size="sm" onClick={() => previewTest(test.id)} className="flex-1 md:flex-none">
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => editTest(test.id)} className="flex-1 md:flex-none">
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </Button>
                              <Button variant="outline" size="sm" className="text-red-500 flex-1 md:flex-none" onClick={() => deleteTest(test.id)}>
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                  ) : (
                    <div className="text-center py-10 border border-dashed rounded-md">
                      <p className="text-gray-500">No draft tests found matching your search criteria</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </Card>
        </>
      )}
    </div>
  );
};

export default EditTests;
