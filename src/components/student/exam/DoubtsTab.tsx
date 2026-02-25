import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Search, MessageSquare, ThumbsUp, CheckCircle2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface DoubtsTabProps {
  examId: string;
  examName: string;
}

export const DoubtsTab: React.FC<DoubtsTabProps> = ({ examId, examName }) => {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      id: 1,
      category: 'Exam Pattern',
      question: 'What is the exam pattern for UPSC CSE?',
      answer: 'UPSC CSE has three stages: Prelims (objective), Mains (descriptive), and Interview (personality test). Prelims has 2 papers, Mains has 9 papers, and interview is of 275 marks.',
      likes: 45,
      solved: true
    },
    {
      id: 2,
      category: 'Study Plan',
      question: 'How many hours should I study daily?',
      answer: 'Quality matters more than quantity. Aim for 6-8 hours of focused study. Include revision, current affairs, and answer writing practice in your schedule.',
      likes: 38,
      solved: true
    },
    {
      id: 3,
      category: 'Preparation',
      question: 'Should I join coaching or prepare at home?',
      answer: 'Both approaches work. Coaching provides structure and peer learning. Self-study offers flexibility. Many toppers use a hybrid approach - coaching for guidance and self-study for depth.',
      likes: 52,
      solved: true
    },
    {
      id: 4,
      category: 'Current Affairs',
      question: 'How to cover current affairs effectively?',
      answer: 'Read The Hindu daily, maintain notes, connect current affairs with static syllabus, and practice MCQs regularly. Allocate 1-2 hours daily for current affairs.',
      likes: 41,
      solved: true
    }
  ];

  const recentDoubts = [
    {
      id: 1,
      student: 'Rahul K.',
      question: 'Best books for Indian Polity preparation?',
      time: '2 hours ago',
      responses: 5
    },
    {
      id: 2,
      student: 'Priya S.',
      question: 'How to improve answer writing speed?',
      time: '5 hours ago',
      responses: 8
    },
    {
      id: 3,
      student: 'Amit M.',
      question: 'Strategy for last 3 months before prelims?',
      time: '1 day ago',
      responses: 12
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <h2 className="text-2xl font-bold mb-2">Doubts & Discussion Forum</h2>
        <p className="text-muted-foreground">
          Get your questions answered by mentors and fellow aspirants
        </p>
      </Card>

      {/* Search Bar */}
      <Card className="p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for doubts or questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button>Search</Button>
        </div>
      </Card>

      <Tabs defaultValue="faqs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="faqs">FAQs</TabsTrigger>
          <TabsTrigger value="recent">Recent Doubts</TabsTrigger>
          <TabsTrigger value="ask">Ask a Question</TabsTrigger>
        </TabsList>

        {/* FAQs Tab */}
        <TabsContent value="faqs" className="space-y-4">
          {faqs.map((faq) => (
            <Card key={faq.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{faq.category}</Badge>
                    {faq.solved && (
                      <Badge variant="secondary" className="gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Solved
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-2">{faq.question}</h3>
                  <p className="text-muted-foreground text-sm">{faq.answer}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 pt-3 border-t">
                <Button variant="ghost" size="sm" className="gap-2">
                  <ThumbsUp className="h-4 w-4" />
                  {faq.likes} Helpful
                </Button>
                <Button variant="ghost" size="sm" className="gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Reply
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Recent Doubts Tab */}
        <TabsContent value="recent" className="space-y-4">
          {recentDoubts.map((doubt) => (
            <Card key={doubt.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-semibold text-sm">{doubt.student}</span>
                    <span className="text-xs text-muted-foreground">• {doubt.time}</span>
                  </div>
                  <h3 className="text-base font-medium mb-3">{doubt.question}</h3>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="gap-1">
                      <MessageSquare className="h-3 w-3" />
                      {doubt.responses} responses
                    </Badge>
                  </div>
                </div>
                <Button variant="outline" size="sm">View</Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        {/* Ask Question Tab */}
        <TabsContent value="ask">
          <Card className="p-6">
            <h3 className="text-xl font-bold mb-4">Ask Your Question</h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Question Title</label>
                <Input placeholder="Enter your question briefly..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Detailed Description</label>
                <Textarea 
                  placeholder="Provide more details about your doubt..."
                  rows={6}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Input placeholder="e.g., History, Polity, Current Affairs..." />
              </div>
              <Button className="w-full">Submit Question</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
