
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TestPreview } from '@/components/admin/TestPreview';
import { Eye, Edit, Trash2, Search, Filter, Clock, Users, BarChart3, FileText, Plus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Test {
  id: string;
  name: string;
  category: string;
  questions: number;
  duration: number;
  attempts: number;
  avgScore: string;
  status: 'draft' | 'published' | 'archived';
  createdDate: string;
  sections: string[];
}

const PreviewTests = () => {
  const { toast } = useToast();
  const [showPreview, setShowPreview] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [tests] = useState<Test[]>([
    {
      id: '1',
      name: 'Banking Awareness Mock Test 1',
      category: 'Banking',
      questions: 50,
      duration: 60,
      attempts: 245,
      avgScore: '72.5%',
      status: 'published',
      createdDate: '2025-05-15',
      sections: ['Banking Awareness', 'Current Affairs', 'Reasoning']
    },
    {
      id: '2',
      name: 'SSC CGL Mathematics Practice',
      category: 'SSC',
      questions: 25,
      duration: 30,
      attempts: 156,
      avgScore: '68.2%',
      status: 'published',
      createdDate: '2025-05-20',
      sections: ['Arithmetic', 'Algebra', 'Geometry']
    },
    {
      id: '3',
      name: 'UPSC Prelims Current Affairs',
      category: 'UPSC',
      questions: 100,
      duration: 120,
      attempts: 89,
      avgScore: '64.8%',
      status: 'draft',
      createdDate: '2025-05-25',
      sections: ['National Affairs', 'International Affairs', 'Economics']
    },
    {
      id: '4',
      name: 'English Grammar Assessment',
      category: 'English',
      questions: 40,
      duration: 45,
      attempts: 0,
      avgScore: 'N/A',
      status: 'draft',
      createdDate: '2025-06-01',
      sections: ['Grammar Rules', 'Vocabulary', 'Comprehension']
    }
  ]);

  const handlePreviewTest = (test: Test) => {
    setSelectedTest(test);
    setShowPreview(true);
  };

  const handleDeleteTest = (testId: string, testName: string) => {
    toast({
      title: "Test deleted",
      description: `${testName} has been deleted successfully.`,
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-yellow-100 text-yellow-800';
      case 'archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const filteredTests = tests.filter(test => {
    const matchesSearch = test.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         test.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || test.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const testStats = {
    total: tests.length,
    published: tests.filter(t => t.status === 'published').length,
    draft: tests.filter(t => t.status === 'draft').length,
    totalAttempts: tests.reduce((sum, t) => sum + t.attempts, 0)
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Preview Tests</h1>
          <p className="text-sm text-gray-500 mt-1">Preview, manage, and analyze your created tests</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Tests</p>
              <p className="text-2xl font-semibold">{testStats.total}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Eye className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Published</p>
              <p className="text-2xl font-semibold">{testStats.published}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Edit className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Drafts</p>
              <p className="text-2xl font-semibold">{testStats.draft}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Attempts</p>
              <p className="text-2xl font-semibold">{testStats.totalAttempts}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Tests</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  More Filters
                </Button>
              </div>
            </div>

            {/* Tests Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTests.map((test) => (
                <Card key={test.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-2">{test.name}</h3>
                        <Badge className={getStatusColor(test.status)}>{test.status}</Badge>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <FileText className="h-4 w-4 mr-2" />
                        {test.questions} questions • {test.category}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Clock className="h-4 w-4 mr-2" />
                        {test.duration} minutes
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="h-4 w-4 mr-2" />
                        {test.attempts} attempts
                      </div>
                      {test.avgScore !== 'N/A' && (
                        <div className="flex items-center text-sm text-gray-600">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Avg Score: {test.avgScore}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <p className="text-sm font-medium">Sections:</p>
                      <div className="flex flex-wrap gap-1">
                        {test.sections.map((section, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {section}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="flex-1"
                        onClick={() => handlePreviewTest(test)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Preview
                      </Button>
                      <Button variant="outline" size="sm" className="flex-1">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleDeleteTest(test.id, test.name)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>

                    <div className="text-xs text-gray-400 pt-2 border-t">
                      Created: {test.createdDate}
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredTests.length === 0 && (
              <Card className="p-8">
                <div className="text-center">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No tests found</h3>
                  <p className="text-gray-500 mb-4">
                    {searchTerm || statusFilter !== 'all' 
                      ? 'Try adjusting your search or filter criteria.' 
                      : 'Start by creating your first test.'}
                  </p>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Create Test
                  </Button>
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="published">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.filter(t => t.status === 'published').map((test) => (
              <Card key={test.id} className="p-6">
                <h3 className="font-semibold mb-2">{test.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{test.attempts} attempts • {test.avgScore} avg score</p>
                <Button variant="outline" size="sm" onClick={() => handlePreviewTest(test)}>
                  <Eye className="h-3 w-3 mr-1" />
                  View Analytics
                </Button>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="draft">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tests.filter(t => t.status === 'draft').map((test) => (
              <Card key={test.id} className="p-6">
                <h3 className="font-semibold mb-2">{test.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{test.questions} questions • {test.duration} min</p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={() => handlePreviewTest(test)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Preview
                  </Button>
                  <Button size="sm">
                    <Edit className="h-3 w-3 mr-1" />
                    Edit
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Test Performance Overview</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Completion Rate</span>
                  <span className="font-medium">78.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Average Score</span>
                  <span className="font-medium">68.5%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Most Popular Category</span>
                  <span className="font-medium">Banking</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Banking Test: 15 new attempts</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Math Test: Published successfully</span>
                </div>
                <div className="flex items-center space-x-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>English Test: Awaiting review</span>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Test Preview Dialog */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto p-0">
          {selectedTest && (
            <TestPreview 
              open={showPreview}
              onClose={() => setShowPreview(false)}
              testName={selectedTest.name}
              questions={[]}
              sections={selectedTest.sections.map(name => ({ name, questions: 10, marks: 10 }))}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PreviewTests;
