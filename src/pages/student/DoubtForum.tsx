
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { MessageSquare, Search, ThumbsUp, User, Calendar, Filter, PlusCircle } from 'lucide-react';

// Mock data for doubts/questions
const questions = [
  {
    id: 1,
    title: "How to solve logarithmic equations efficiently?",
    category: "Quantitative Aptitude",
    author: "Ravi Kumar",
    date: "Apr 24, 2025",
    replies: 3,
    likes: 5,
    solved: true
  },
  {
    id: 2,
    title: "Tips for solving puzzle-based seating arrangement questions?",
    category: "Reasoning",
    author: "Priya Singh",
    date: "Apr 22, 2025",
    replies: 7,
    likes: 12,
    solved: true
  },
  {
    id: 3,
    title: "Difference between Active and Passive Voice?",
    category: "English Language",
    author: "Amit Patel",
    date: "Apr 20, 2025",
    replies: 2,
    likes: 3,
    solved: false
  },
  {
    id: 4,
    title: "Important banking terminologies for IBPS PO",
    category: "Banking Awareness",
    author: "Neha Sharma",
    date: "Apr 18, 2025",
    replies: 5,
    likes: 8,
    solved: true
  },
  {
    id: 5,
    title: "How to approach Data Interpretation questions?",
    category: "Quantitative Aptitude",
    author: "Rahul Gupta",
    date: "Apr 15, 2025",
    replies: 4,
    likes: 7,
    solved: false
  }
];

const DoubtForum = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [activeTab, setActiveTab] = useState('all');
  
  const filteredQuestions = questions.filter(question => {
    // Filter by search query
    const matchesSearch = question.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          question.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Filter by category
    const matchesCategory = category === 'all' || question.category.toLowerCase().includes(category.toLowerCase());
    
    // Filter by tab
    const matchesTab = activeTab === 'all' || 
                      (activeTab === 'solved' && question.solved) || 
                      (activeTab === 'unsolved' && !question.solved);
    
    return matchesSearch && matchesCategory && matchesTab;
  });
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Doubt Forum</h1>
          <p className="text-gray-500">Ask questions and get answers from experts and peers</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <PlusCircle className="mr-2 h-4 w-4" />
              Ask a Question
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Ask a New Question</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Title</label>
                <Input placeholder="Type your question title here..." />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quant">Quantitative Aptitude</SelectItem>
                    <SelectItem value="reasoning">Reasoning</SelectItem>
                    <SelectItem value="english">English Language</SelectItem>
                    <SelectItem value="gk">General Knowledge</SelectItem>
                    <SelectItem value="banking">Banking Awareness</SelectItem>
                    <SelectItem value="computer">Computer Knowledge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Question Details</label>
                <Textarea placeholder="Provide details about your question..." className="min-h-[100px]" />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Attach Image (Optional)</label>
                <Input type="file" accept="image/*" />
                <p className="text-xs text-gray-500">Max file size: 2MB</p>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button>Submit Question</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-3/4 space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-grow">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input 
                    className="pl-10" 
                    placeholder="Search questions..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="relative w-full md:w-[200px]">
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger>
                      <div className="flex items-center">
                        <Filter className="mr-2 h-4 w-4" />
                        <SelectValue placeholder="All Categories" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="quant">Quantitative Aptitude</SelectItem>
                      <SelectItem value="reasoning">Reasoning</SelectItem>
                      <SelectItem value="english">English Language</SelectItem>
                      <SelectItem value="banking">Banking Awareness</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="all">All Questions</TabsTrigger>
                  <TabsTrigger value="solved">Solved</TabsTrigger>
                  <TabsTrigger value="unsolved">Unsolved</TabsTrigger>
                </TabsList>
              </Tabs>
            </CardHeader>
            <CardContent>
              {filteredQuestions.length > 0 ? (
                <div className="divide-y">
                  {filteredQuestions.map((question) => (
                    <div key={question.id} className="py-4 first:pt-0 last:pb-0">
                      <div className="flex flex-col md:flex-row md:items-center justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-semibold">
                              {question.title}
                            </h3>
                            {question.solved && (
                              <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">
                                Solved
                              </span>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                            <div className="flex items-center">
                              <User className="mr-1 h-3.5 w-3.5" />
                              <span>{question.author}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="mr-1 h-3.5 w-3.5" />
                              <span>{question.date}</span>
                            </div>
                            <div className="flex items-center">
                              <MessageSquare className="mr-1 h-3.5 w-3.5" />
                              <span>{question.replies} replies</span>
                            </div>
                            <div className="flex items-center">
                              <ThumbsUp className="mr-1 h-3.5 w-3.5" />
                              <span>{question.likes}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center mt-2 md:mt-0">
                          <span className="mr-4 text-sm">{question.category}</span>
                          <Button size="sm" variant="outline">View</Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No questions found matching your filters</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Try adjusting your search or ask a new question
                  </p>
                  <div className="mt-4">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button>Ask a Question</Button>
                      </DialogTrigger>
                      <DialogContent>
                        {/* Same dialog content as above */}
                      </DialogContent>
                    </Dialog>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        
        <div className="w-full md:w-1/4 space-y-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Popular Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span>Quantitative Aptitude</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">352</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Reasoning</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">289</span>
              </div>
              <div className="flex items-center justify-between">
                <span>English Language</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">215</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Banking Awareness</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">178</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Computer Knowledge</span>
                <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full">132</span>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Top Contributors</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 text-blue-800 h-9 w-9 rounded-full flex items-center justify-center font-medium">
                  RS
                </div>
                <div>
                  <p className="font-medium">Rajesh Singh</p>
                  <p className="text-xs text-gray-500">124 answers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-green-100 text-green-800 h-9 w-9 rounded-full flex items-center justify-center font-medium">
                  AK
                </div>
                <div>
                  <p className="font-medium">Anita Kumari</p>
                  <p className="text-xs text-gray-500">98 answers</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 text-purple-800 h-9 w-9 rounded-full flex items-center justify-center font-medium">
                  VP
                </div>
                <div>
                  <p className="font-medium">Vikram Patel</p>
                  <p className="text-xs text-gray-500">87 answers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Guidelines</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>• Be specific in your questions</p>
              <p>• Include relevant details</p>
              <p>• Use proper formatting</p>
              <p>• Be respectful to others</p>
              <p>• Mark questions as solved when resolved</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DoubtForum;
