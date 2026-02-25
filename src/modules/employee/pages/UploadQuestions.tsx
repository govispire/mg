
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { TestCreationForm } from '@/components/admin/TestCreationForm';
import { FileText, Upload, Plus, Search, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';

const UploadQuestions = () => {
  const { toast } = useToast();
  const [showTestCreation, setShowTestCreation] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleBulkUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      toast({
        title: "File uploaded",
        description: `${file.name} uploaded successfully for processing.`,
      });
    }
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Upload Questions & Tests</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage questions and test papers</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => document.getElementById('bulk-upload')?.click()}>
            <Upload className="h-4 w-4 mr-2" />
            Bulk Upload
          </Button>
          <Button onClick={() => setShowTestCreation(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Test
          </Button>
        </div>
      </div>

      <input
        id="bulk-upload"
        type="file"
        accept=".xlsx,.csv,.json"
        onChange={handleBulkUpload}
        className="hidden"
      />

      <Tabs defaultValue="create" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="create">Create Questions</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="manage">Manage Questions</TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => setShowTestCreation(true)}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Create New Test</h3>
                  <p className="text-sm text-gray-500">Build a complete test with multiple sections</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                  <Plus className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Quick Question</h3>
                  <p className="text-sm text-gray-500">Add individual questions to question bank</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => document.getElementById('bulk-upload')?.click()}>
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Upload className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-semibold">Bulk Import</h3>
                  <p className="text-sm text-gray-500">Upload questions from Excel or CSV files</p>
                </div>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bulk">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Bulk Upload Instructions</h3>
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Supported Formats</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Excel files (.xlsx) - Download our template</li>
                  <li>• CSV files (.csv) - Comma-separated values</li>
                  <li>• JSON files (.json) - Structured question data</li>
                </ul>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline">
                  <Upload className="h-4 w-4 mr-2" />
                  Download Template
                </Button>
                <Button variant="outline" onClick={() => document.getElementById('bulk-upload')?.click()}>
                  <FileText className="h-4 w-4 mr-2" />
                  Upload File
                </Button>
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline">
                  <Search className="h-4 w-4 mr-2" />
                  Advanced Search
                </Button>
              </div>
            </div>

            <Card className="p-4">
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-500 mb-4">Start by creating your first question or uploading a question bank.</p>
                <Button onClick={() => setShowTestCreation(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Question
                </Button>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={showTestCreation} onOpenChange={setShowTestCreation}>
        <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-y-auto p-0">
          <TestCreationForm onClose={() => setShowTestCreation(false)} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UploadQuestions;
