
import React from 'react';
import { 
  Video, 
  MessageSquare, 
  FileText, 
  CheckCircle,
  PenTool
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const MentorshipContent: React.FC = () => {
  return (
    <div className="h-full flex flex-col p-4">
      {/* Live Interaction & Notes Pane */}
      <div className="mb-4">
        <Tabs defaultValue="video" className="w-full">
          <div className="flex justify-between items-center mb-2">
            <TabsList>
              <TabsTrigger value="video" className="flex items-center">
                <Video className="h-4 w-4 mr-2" />
                Video
              </TabsTrigger>
              <TabsTrigger value="chat" className="flex items-center">
                <MessageSquare className="h-4 w-4 mr-2" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="whiteboard" className="flex items-center">
                <PenTool className="h-4 w-4 mr-2" />
                Whiteboard
              </TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm">
              Take Notes
            </Button>
          </div>

          <TabsContent value="video" className="mt-2">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Video className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Your next session video will appear here</p>
                <Button className="mt-4 bg-purple-600 hover:bg-purple-700">Join Session</Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="chat" className="mt-2">
            <div className="h-[400px] bg-gray-100 rounded-lg p-4">
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto mb-4">
                  <div className="flex flex-col space-y-2">
                    <div className="bg-blue-100 rounded-lg p-2 max-w-[80%] self-start">
                      <p className="text-sm">Hello Priya, how's your progress with the Indian Economy revision?</p>
                      <span className="text-xs text-gray-500 mt-1">Ankit K. • 10:30 AM</span>
                    </div>
                    
                    <div className="bg-purple-100 rounded-lg p-2 max-w-[80%] self-end">
                      <p className="text-sm">Hi Ankit, I've completed most of it but having trouble with monetary policy concepts.</p>
                      <span className="text-xs text-gray-500 mt-1">You • 10:35 AM</span>
                    </div>
                  </div>
                </div>
                
                <div className="relative">
                  <input 
                    type="text" 
                    placeholder="Type your message..." 
                    className="w-full border border-gray-300 rounded-full py-2 pl-4 pr-12 focus:outline-none focus:border-purple-500"
                  />
                  <Button className="absolute right-1 top-1 rounded-full h-8 w-8 p-0 flex items-center justify-center bg-purple-600">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m22 2-7 20-4-9-9-4Z"/></svg>
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="whiteboard" className="mt-2">
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <PenTool className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-500">Interactive whiteboard will be available during your session</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Homework & Assignments */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Current Assignments</h2>
          <Button variant="outline" size="sm">Submit Work</Button>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-purple-100 flex items-center justify-center mr-3">
                <CheckCircle className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-sm">Complete 50 MCQs on Indian Polity</p>
                <p className="text-xs text-gray-500">Due May 15, 2025</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-yellow-100 text-yellow-800 rounded">In Progress</span>
          </div>
          
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center">
              <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <FileText className="h-4 w-4 text-gray-400" />
              </div>
              <div>
                <p className="font-medium text-sm">Read Economic Survey Highlights</p>
                <p className="text-xs text-gray-500">Due May 20, 2025</p>
              </div>
            </div>
            <span className="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-800 rounded">Not Started</span>
          </div>
        </div>
      </div>
      
      {/* Performance Analytics Preview */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-lg font-medium">Performance Analytics</h2>
          <span className="text-sm text-purple-600">View Detailed Report</span>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium mb-2">Topic Performance</h3>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Indian Polity</span>
                  <span>92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-green-500 h-1.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>Indian Economy</span>
                  <span>76%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: '76%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span>General Knowledge</span>
                  <span>85%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border rounded-lg p-4 bg-white">
            <h3 className="text-sm font-medium mb-2">Study Hours</h3>
            <div className="h-[100px] flex items-end justify-around mt-2">
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-6 rounded-t" style={{ height: '60px' }}></div>
                <span className="text-xs mt-1">Mon</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-6 rounded-t" style={{ height: '40px' }}></div>
                <span className="text-xs mt-1">Tue</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-6 rounded-t" style={{ height: '75px' }}></div>
                <span className="text-xs mt-1">Wed</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-6 rounded-t" style={{ height: '50px' }}></div>
                <span className="text-xs mt-1">Thu</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-6 rounded-t" style={{ height: '25px' }}></div>
                <span className="text-xs mt-1">Fri</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-6 rounded-t" style={{ height: '35px' }}></div>
                <span className="text-xs mt-1">Sat</span>
              </div>
              <div className="flex flex-col items-center">
                <div className="bg-purple-500 w-6 rounded-t" style={{ height: '15px' }}></div>
                <span className="text-xs mt-1">Sun</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MentorshipContent;
