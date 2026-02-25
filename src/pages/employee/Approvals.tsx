import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Clock, MessageSquare, Eye, Filter, Search, AlertTriangle, FileText, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

interface ApprovalItem {
  id: string;
  title: string;
  type: 'question' | 'material' | 'test' | 'content';
  submittedBy: string;
  submittedDate: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'pending' | 'approved' | 'rejected' | 'needs-revision';
  category: string;
  description: string;
  comments: Array<{
    id: string;
    author: string;
    message: string;
    timestamp: string;
  }>;
}

const Approvals = () => {
  const { toast } = useToast();
  const [selectedItem, setSelectedItem] = useState<ApprovalItem | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [comment, setComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([
    {
      id: '1',
      title: 'Banking Awareness Question Set - Chapter 5',
      type: 'question',
      submittedBy: 'Priya Sharma',
      submittedDate: '2025-06-01',
      priority: 'high',
      status: 'pending',
      category: 'Banking',
      description: '50 multiple choice questions covering recent banking policies and RBI guidelines',
      comments: [
        {
          id: '1',
          author: 'Admin Team',
          message: 'Please review questions 15-20 for accuracy',
          timestamp: '2025-06-01 14:30'
        }
      ]
    },
    {
      id: '2',
      title: 'English Grammar Study Material PDF',
      type: 'material',
      submittedBy: 'Rahul Kumar',
      submittedDate: '2025-06-02',
      priority: 'medium',
      status: 'needs-revision',
      category: 'English',
      description: 'Comprehensive grammar guide with examples and exercises',
      comments: [
        {
          id: '2',
          author: 'Subject Expert',
          message: 'Good content but needs formatting improvements',
          timestamp: '2025-06-02 10:15'
        }
      ]
    },
    {
      id: '3',
      title: 'Current Affairs Mock Test - May 2025',
      type: 'test',
      submittedBy: 'Anjali Patel',
      submittedDate: '2025-06-03',
      priority: 'urgent',
      status: 'pending',
      category: 'Current Affairs',
      description: 'Monthly current affairs test with 100 questions',
      comments: []
    },
    {
      id: '4',
      title: 'Mathematics Video Tutorial Series',
      type: 'content',
      submittedBy: 'Suresh Mehta',
      submittedDate: '2025-05-30',
      priority: 'low',
      status: 'approved',
      category: 'Mathematics',
      description: 'Video series covering algebra and geometry basics',
      comments: [
        {
          id: '3',
          author: 'Content Team',
          message: 'Excellent quality content, approved for publication',
          timestamp: '2025-05-31 16:45'
        }
      ]
    }
  ]);

  const handleApprove = (itemId: string) => {
    setApprovalItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { ...item, status: 'approved' as const }
          : item
      )
    );
    
    toast({
      title: "Item approved",
      description: "The submission has been approved successfully.",
    });
  };

  const handleReject = (itemId: string) => {
    if (!comment.trim()) {
      toast({
        title: "Comment required",
        description: "Please provide a reason for rejection.",
        variant: "destructive"
      });
      return;
    }

    setApprovalItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: 'rejected' as const,
              comments: [
                ...item.comments,
                {
                  id: Date.now().toString(),
                  author: 'Review Team',
                  message: comment,
                  timestamp: new Date().toISOString()
                }
              ]
            }
          : item
      )
    );

    setComment('');
    toast({
      title: "Item rejected",
      description: "The submission has been rejected with feedback.",
    });
  };

  const handleRequestRevision = (itemId: string) => {
    if (!comment.trim()) {
      toast({
        title: "Comment required", 
        description: "Please provide specific revision instructions.",
        variant: "destructive"
      });
      return;
    }

    setApprovalItems(prev => 
      prev.map(item => 
        item.id === itemId 
          ? { 
              ...item, 
              status: 'needs-revision' as const,
              comments: [
                ...item.comments,
                {
                  id: Date.now().toString(),
                  author: 'Review Team',
                  message: comment,
                  timestamp: new Date().toISOString()
                }
              ]
            }
          : item
      )
    );

    setComment('');
    toast({
      title: "Revision requested",
      description: "Feedback has been sent to the submitter.",
    });
  };

  const viewDetails = (item: ApprovalItem) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'needs-revision': return 'bg-yellow-100 text-yellow-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'question': return <FileText className="h-4 w-4" />;
      case 'material': return <FileText className="h-4 w-4" />;
      case 'test': return <FileText className="h-4 w-4" />;
      case 'content': return <FileText className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredItems = approvalItems.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.submittedBy.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || item.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const stats = {
    pending: approvalItems.filter(item => item.status === 'pending').length,
    approved: approvalItems.filter(item => item.status === 'approved').length,
    needsRevision: approvalItems.filter(item => item.status === 'needs-revision').length,
    urgent: approvalItems.filter(item => item.priority === 'urgent').length
  };

  return (
    <div className="w-full px-4 lg:px-6 py-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Content Approvals</h1>
          <p className="text-sm text-gray-500 mt-1">Review and approve submitted content</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Advanced Filter
          </Button>
          <Button variant="outline">
            <MessageSquare className="h-4 w-4 mr-2" />
            Bulk Actions
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Clock className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-2xl font-semibold">{stats.pending}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Approved</p>
              <p className="text-2xl font-semibold">{stats.approved}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Needs Revision</p>
              <p className="text-2xl font-semibold">{stats.needsRevision}</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Urgent</p>
              <p className="text-2xl font-semibold">{stats.urgent}</p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="all">All Items</TabsTrigger>
          <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
          <TabsTrigger value="urgent">Urgent ({stats.urgent})</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <div className="space-y-4">
            {/* Search and Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search by title, author, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                />
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="approved">Approved</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                    <SelectItem value="needs-revision">Needs Revision</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Approval Items List */}
            <div className="space-y-4">
              {filteredItems.map((item) => (
                <Card key={item.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                            {getTypeIcon(item.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{item.title}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <div className="flex items-center space-x-1">
                                <User className="h-3 w-3" />
                                <span>{item.submittedBy}</span>
                              </div>
                              <span>•</span>
                              <span>{item.submittedDate}</span>
                              <span>•</span>
                              <span>{item.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Badge className={getPriorityColor(item.priority)}>
                            {item.priority}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                      </div>

                      <p className="text-gray-600">{item.description}</p>

                      {item.comments.length > 0 && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <p className="text-sm font-medium mb-1">Latest Comment:</p>
                          <p className="text-sm text-gray-600">"{item.comments[item.comments.length - 1].message}"</p>
                          <p className="text-xs text-gray-400 mt-1">
                            by {item.comments[item.comments.length - 1].author}
                          </p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col lg:flex-row gap-2 lg:w-auto w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => viewDetails(item)}
                        className="flex-1 lg:flex-none"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      
                      {item.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(item.id)}
                            className="flex-1 lg:flex-none bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Approve
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRequestRevision(item.id)}
                            className="flex-1 lg:flex-none"
                          >
                            <MessageSquare className="h-3 w-3 mr-1" />
                            Request Revision
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {filteredItems.length === 0 && (
                <Card className="p-8">
                  <div className="text-center">
                    <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No items found</h3>
                    <p className="text-gray-500">
                      {searchTerm || statusFilter !== 'all' || priorityFilter !== 'all'
                        ? 'Try adjusting your search or filter criteria.'
                        : 'No submissions are pending review at the moment.'}
                    </p>
                  </div>
                </Card>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pending">
          <div className="space-y-4">
            {approvalItems.filter(item => item.status === 'pending').map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{item.title}</h3>
                    <p className="text-sm text-gray-500">by {item.submittedBy} • {item.category}</p>
                  </div>
                  <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                </div>
                
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(item.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => viewDetails(item)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="urgent">
          <div className="space-y-4">
            {approvalItems.filter(item => item.priority === 'urgent').map((item) => (
              <Card key={item.id} className="p-6 border-l-4 border-l-red-500">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-lg text-red-700">{item.title}</h3>
                    <p className="text-sm text-gray-500">by {item.submittedBy} • {item.category}</p>
                  </div>
                  <Badge className="bg-red-100 text-red-800">URGENT</Badge>
                </div>
                
                <p className="text-gray-600 mb-4">{item.description}</p>
                
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleApprove(item.id)}>
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Approve Now
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => viewDetails(item)}>
                    <Eye className="h-3 w-3 mr-1" />
                    Priority Review
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="history">
          <div className="space-y-4">
            {approvalItems.filter(item => item.status !== 'pending').map((item) => (
              <Card key={item.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-sm text-gray-500">by {item.submittedBy} • {item.submittedDate}</p>
                  </div>
                  <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Detailed Review Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl w-[90vw] max-h-[90vh] overflow-y-auto">
          {selectedItem && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>{selectedItem.title}</span>
                  <div className="flex gap-2">
                    <Badge className={getPriorityColor(selectedItem.priority)}>
                      {selectedItem.priority}
                    </Badge>
                    <Badge className={getStatusColor(selectedItem.status)}>
                      {selectedItem.status}
                    </Badge>
                  </div>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Submitted by:</span> {selectedItem.submittedBy}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span> {selectedItem.submittedDate}
                  </div>
                  <div>
                    <span className="font-medium">Category:</span> {selectedItem.category}
                  </div>
                  <div>
                    <span className="font-medium">Type:</span> {selectedItem.type}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Description</h4>
                  <p className="text-gray-600">{selectedItem.description}</p>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Comments & Feedback</h4>
                  <div className="space-y-3">
                    {selectedItem.comments.map((comment) => (
                      <div key={comment.id} className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center space-x-2 mb-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs">
                              {comment.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium text-sm">{comment.author}</span>
                          <span className="text-xs text-gray-500">{comment.timestamp}</span>
                        </div>
                        <p className="text-sm">{comment.message}</p>
                      </div>
                    ))}

                    {selectedItem.comments.length === 0 && (
                      <p className="text-gray-500 text-sm">No comments yet.</p>
                    )}
                  </div>
                </div>

                {selectedItem.status === 'pending' && (
                  <div className="space-y-4 border-t pt-4">
                    <div>
                      <Label className="text-sm font-medium">Add Comment (optional for approval, required for rejection/revision)</Label>
                      <Textarea
                        placeholder="Add your feedback or review comments..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        className="mt-1"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={() => {
                          handleApprove(selectedItem.id);
                          setShowDetails(false);
                        }}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          handleRequestRevision(selectedItem.id);
                          setShowDetails(false);
                        }}
                      >
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Request Revision
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          handleReject(selectedItem.id);
                          setShowDetails(false);
                        }}
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Approvals;
