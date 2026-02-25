
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
  Grid,
  List,
  MessageSquare,
  Video,
  Heart,
  Clock,
  Star,
  Calendar,
  TrendingUp,
  BookOpen,
  Send
} from 'lucide-react';
import { enhancedMentors, EnhancedMentor } from '@/data/enhancedMentorshipData';

type ViewMode = 'grid' | 'list';
type TabType = 'active' | 'completed' | 'all';

const YourMentorsPage = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [activeTab, setActiveTab] = useState<TabType>('active');
  const [chatOpen, setChatOpen] = useState(false);
  const [selectedMentor, setSelectedMentor] = useState<EnhancedMentor | null>(null);
  const [chatMessage, setChatMessage] = useState('');

  const activeMentors = enhancedMentors.filter(mentor => mentor.status === 'active');
  const completedMentors = enhancedMentors.filter(mentor => mentor.status === 'completed');
  const allMentors = enhancedMentors;

  const getCurrentMentors = () => {
    switch (activeTab) {
      case 'active':
        return activeMentors;
      case 'completed':
        return completedMentors;
      case 'all':
        return allMentors;
      default:
        return allMentors;
    }
  };

  const handleWishlistToggle = (mentorId: number) => {
    console.log('Toggle wishlist for mentor:', mentorId);
  };

  const handleJoinSession = (mentor: EnhancedMentor) => {
    console.log('Join session with mentor:', mentor.name);
  };

  const handleChatOpen = (mentor: EnhancedMentor) => {
    setSelectedMentor(mentor);
    setChatOpen(true);
  };

  const handleSendMessage = () => {
    if (chatMessage.trim() && selectedMentor) {
      console.log('Send message to', selectedMentor.name, ':', chatMessage);
      setChatMessage('');
    }
  };

  const MentorGridCard = ({ mentor }: { mentor: EnhancedMentor }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 border-white ${mentor.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm sm:text-lg">{mentor.name}</h3>
              <p className="text-xs sm:text-sm text-gray-600 truncate">{mentor.qualification}</p>
              <div className="flex items-center mt-1">
                <Star className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-500 fill-current" />
                <span className="text-xs sm:text-sm font-medium ml-1">{mentor.rating}</span>
                <Badge className="ml-2 text-xs" variant={mentor.status === 'active' ? 'default' : 'secondary'}>
                  {mentor.status}
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleWishlistToggle(mentor.id)}
            className="p-1"
          >
            <Heart className={`h-4 w-4 ${mentor.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Section */}
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Progress</span>
            <span className="text-sm text-blue-600">{mentor.progress.progressPercentage}%</span>
          </div>
          <Progress value={mentor.progress.progressPercentage} className="mb-2" />
          <div className="flex justify-between text-xs text-gray-600">
            <span>{mentor.progress.completedSessions}/{mentor.progress.totalSessions} sessions</span>
          </div>
        </div>

        {/* Next Session */}
        {mentor.status === 'active' && mentor.nextSession && (
          <div className="bg-green-50 p-3 rounded-lg border border-green-200">
            <div className="flex items-center mb-2">
              <Calendar className="h-4 w-4 text-green-600 mr-2" />
              <span className="text-sm font-medium text-green-800">Next Session</span>
            </div>
            <p className="text-sm text-green-700">{mentor.nextSession.topic}</p>
            <p className="text-xs text-green-600">{mentor.nextSession.date} at {mentor.nextSession.time}</p>
          </div>
        )}

        {/* Recent Updates */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium flex items-center">
            <TrendingUp className="h-4 w-4 mr-2" />
            Recent Updates
          </h4>
          <div className="space-y-1">
            {mentor.recentUpdates.slice(0, 2).map((update) => (
              <div key={update.id} className="flex items-start space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full mt-1 ${update.isUnread ? 'bg-blue-500' : 'bg-gray-300'}`} />
                <div className="flex-1">
                  <p className="text-gray-700 line-clamp-2">{update.content}</p>
                  <p className="text-gray-500">{update.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Messages */}
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium">Messages</span>
            {mentor.unreadMessages > 0 && (
              <Badge variant="destructive" className="text-xs">
                {mentor.unreadMessages} new
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600">{mentor.lastMessageTime}</p>
        </div>

        {/* Actions */}
        <div className="border-t pt-4">
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="flex-1" onClick={() => handleChatOpen(mentor)}>
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Chat</span>
            </Button>
            {mentor.status === 'active' && (
              <Button size="sm" className="flex-1" onClick={() => handleJoinSession(mentor)}>
                <Video className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Join</span>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const MentorListCard = ({ mentor }: { mentor: EnhancedMentor }) => (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Avatar and Basic Info */}
          <div className="flex items-center space-x-3 min-w-[200px]">
            <div className="relative flex-shrink-0">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold">
                {mentor.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white ${mentor.status === 'active' ? 'bg-green-500' : 'bg-gray-400'
                }`} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold truncate">{mentor.name}</h3>
              <p className="text-sm text-gray-600 truncate">{mentor.qualification}</p>
              <div className="flex items-center mt-1">
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
                <span className="text-sm ml-1">{mentor.rating}</span>
                <Badge className="ml-2 text-xs" variant={mentor.status === 'active' ? 'default' : 'secondary'}>
                  {mentor.status}
                </Badge>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="flex-1">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <div className="text-center p-2 bg-blue-50 rounded">
                <div className="font-bold text-blue-600 text-sm">{mentor.rating}</div>
                <div className="text-xs text-gray-600">Rating</div>
              </div>
              <div className="text-center p-2 bg-green-50 rounded">
                <div className="font-bold text-green-600 text-sm">{mentor.progress.progressPercentage}%</div>
                <div className="text-xs text-gray-600">Progress</div>
              </div>
              <div className="text-center p-2 bg-purple-50 rounded">
                <div className="font-bold text-purple-600 text-sm">{mentor.progress.completedSessions}</div>
                <div className="text-xs text-gray-600">Sessions</div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex sm:flex-col gap-2 justify-end min-w-[120px]">
            <Button variant="outline" size="sm" onClick={() => handleChatOpen(mentor)} className="flex-1 sm:flex-initial">
              <MessageSquare className="h-4 w-4 mr-1" />
              <span className="sm:hidden">Chat</span>
            </Button>
            {mentor.status === 'active' && (
              <Button size="sm" onClick={() => handleJoinSession(mentor)} className="flex-1 sm:flex-initial">
                <Video className="h-4 w-4 mr-1" />
                <span className="sm:hidden">Join</span>
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleWishlistToggle(mentor.id)}
              className="flex-1 sm:flex-initial"
            >
              <Heart className={`h-4 w-4 ${mentor.isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Your Mentors</h2>
          <p className="text-gray-600 mt-1">Manage your mentorship sessions and track progress</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Grid</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">List</span>
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as TabType)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="active" className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">Active</span>
            <Badge variant="secondary" className="text-xs">
              {activeMentors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">Completed</span>
            <Badge variant="secondary" className="text-xs">
              {completedMentors.length}
            </Badge>
          </TabsTrigger>
          <TabsTrigger value="all" className="flex items-center gap-2">
            <span className="text-xs sm:text-sm">All</span>
            <Badge variant="secondary" className="text-xs">
              {allMentors.length}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {getCurrentMentors().length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No {activeTab} mentors
                </h3>
                <p className="text-gray-600">
                  {activeTab === 'active'
                    ? "You don't have any active mentors yet."
                    : activeTab === 'completed'
                      ? "You haven't completed any mentorship programs yet."
                      : "You haven't connected with any mentors yet."
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className={
              viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6'
                : 'space-y-4'
            }>
              {getCurrentMentors().map((mentor) =>
                viewMode === 'grid' ? (
                  <MentorGridCard key={mentor.id} mentor={mentor} />
                ) : (
                  <MentorListCard key={mentor.id} mentor={mentor} />
                )
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Chat Dialog */}
      <Dialog open={chatOpen} onOpenChange={setChatOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              Chat with {selectedMentor?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-64 bg-gray-50 rounded-lg p-4 overflow-y-auto">
              <div className="space-y-3">
                <div className="bg-blue-100 p-3 rounded-lg max-w-xs">
                  <p className="text-sm">Hi! How can I help you today?</p>
                  <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                </div>
                <div className="bg-white p-3 rounded-lg max-w-xs ml-auto">
                  <p className="text-sm">I have a question about the next topic</p>
                  <p className="text-xs text-gray-500 mt-1">1 hour ago</p>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default YourMentorsPage;
