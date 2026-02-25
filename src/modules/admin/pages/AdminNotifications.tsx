
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { BellPlus, Calendar, Send, Clock, Users, BookOpen, MapPin } from 'lucide-react';

const AdminNotifications = () => {
  const { toast } = useToast();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all-students');
  const [scheduledDate, setScheduledDate] = useState('');
  
  // Mock notification data
  const sentNotifications = [
    { id: 1, title: 'New IBPS PO Course Available', audience: 'Banking Students', sentAt: '2 days ago', status: 'Sent', stats: { delivered: 1245, opened: 876, clicked: 432 } },
    { id: 2, title: 'SSC Exam Date Announcement', audience: 'SSC Students', sentAt: '1 week ago', status: 'Sent', stats: { delivered: 982, opened: 750, clicked: 320 } },
    { id: 3, title: 'System Maintenance Notice', audience: 'All Users', sentAt: '3 weeks ago', status: 'Sent', stats: { delivered: 5842, opened: 3560, clicked: 984 } },
  ];
  
  const scheduledNotifications = [
    { id: 4, title: 'Monthly Performance Report', audience: 'All Students', scheduledFor: 'May 01, 2025', status: 'Scheduled' },
  ];
  
  const sendNotification = () => {
    if (!title || !message) {
      toast({
        title: "Incomplete Form",
        description: "Please provide both a title and message.",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: scheduledDate ? "Notification Scheduled" : "Notification Sent",
      description: scheduledDate ? 
        `Your notification has been scheduled for ${scheduledDate}.` : 
        "Your notification has been sent to the selected audience.",
    });
    
    // Reset form in a real implementation
    setTitle('');
    setMessage('');
    setTargetAudience('all-students');
    setScheduledDate('');
  };
  
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Push Notifications</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Compose Notification</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Title</label>
              <Input 
                placeholder="Notification title" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Message</label>
              <Textarea 
                placeholder="Write your message here..." 
                className="min-h-[120px]"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Target Audience</label>
              <select 
                className="w-full p-2 border rounded-md"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
              >
                <option value="all-students">All Students</option>
                <option value="banking">Banking & Insurance Students</option>
                <option value="ssc">SSC Students</option>
                <option value="railway">Railway Students</option>
                <option value="employees">Employees</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Schedule (Optional)</label>
              <Input 
                type="datetime-local" 
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
              />
              <p className="text-xs text-gray-500 mt-1">Leave empty to send immediately</p>
            </div>
            
            <Button className="w-full" onClick={sendNotification}>
              {scheduledDate ? (
                <>
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule Notification
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Send Notification
                </>
              )}
            </Button>
          </div>
        </Card>
        
        <Card className="p-6">
          <Tabs defaultValue="sent">
            <TabsList className="mb-4">
              <TabsTrigger value="sent">Sent</TabsTrigger>
              <TabsTrigger value="scheduled">Scheduled</TabsTrigger>
            </TabsList>
            
            <TabsContent value="sent" className="m-0 space-y-4">
              {sentNotifications.length > 0 ? (
                sentNotifications.map((notification) => (
                  <Card key={notification.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>{notification.audience}</span>
                          </div>
                          <div className="flex items-center">
                            <Clock className="h-3.5 w-3.5 mr-1" />
                            <span>Sent {notification.sentAt}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                        {notification.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 pt-3 border-t grid grid-cols-3 gap-2 text-center">
                      <div>
                        <p className="text-xs text-gray-500">Delivered</p>
                        <p className="font-semibold">{notification.stats.delivered}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Opened</p>
                        <p className="font-semibold">{notification.stats.opened}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Clicked</p>
                        <p className="font-semibold">{notification.stats.clicked}</p>
                      </div>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <p className="text-gray-500">No sent notifications</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="scheduled" className="m-0 space-y-4">
              {scheduledNotifications.length > 0 ? (
                scheduledNotifications.map((notification) => (
                  <Card key={notification.id} className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold">{notification.title}</h3>
                        <div className="flex items-center flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
                          <div className="flex items-center">
                            <Users className="h-3.5 w-3.5 mr-1" />
                            <span>{notification.audience}</span>
                          </div>
                          <div className="flex items-center">
                            <Calendar className="h-3.5 w-3.5 mr-1" />
                            <span>Scheduled for {notification.scheduledFor}</span>
                          </div>
                        </div>
                      </div>
                      <span className="px-2.5 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {notification.status}
                      </span>
                    </div>
                    
                    <div className="mt-3 flex justify-end">
                      <Button variant="outline" size="sm">Cancel</Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="text-center py-8 border border-dashed rounded-md">
                  <p className="text-gray-500">No scheduled notifications</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </Card>
      </div>
      
      <Card className="p-6 mt-6">
        <h2 className="text-xl font-semibold mb-4">Notification Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-purple-100 p-2 rounded-lg">
                <BookOpen className="h-5 w-5 text-purple-800" />
              </div>
              <h3 className="font-medium">New Course Available</h3>
            </div>
            <p className="text-sm text-gray-500">Notify students about a new course that's been published</p>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-yellow-100 p-2 rounded-lg">
                <BellPlus className="h-5 w-5 text-yellow-800" />
              </div>
              <h3 className="font-medium">Exam Reminder</h3>
            </div>
            <p className="text-sm text-gray-500">Send a reminder about upcoming exams or application deadlines</p>
          </Card>
          
          <Card className="p-4 cursor-pointer hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3 mb-2">
              <div className="bg-green-100 p-2 rounded-lg">
                <MapPin className="h-5 w-5 text-green-800" />
              </div>
              <h3 className="font-medium">Regional Update</h3>
            </div>
            <p className="text-sm text-gray-500">Send region-specific information to students in certain states</p>
          </Card>
        </div>
      </Card>
    </div>
  );
};

export default AdminNotifications;
