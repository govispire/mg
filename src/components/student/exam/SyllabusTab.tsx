import React from 'react';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, FileText, CheckSquare } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface SyllabusTabProps {
  examId: string;
  examName: string;
}

export const SyllabusTab: React.FC<SyllabusTabProps> = ({ examId, examName }) => {
  const prelimsSyllabus = [
    {
      subject: 'General Studies Paper I',
      topics: [
        'Current events of national and international importance',
        'History of India and Indian National Movement',
        'Indian and World Geography',
        'Indian Polity and Governance',
        'Economic and Social Development',
        'Environmental Ecology and Biodiversity',
        'General Science'
      ]
    },
    {
      subject: 'General Studies Paper II (CSAT)',
      topics: [
        'Comprehension',
        'Interpersonal skills',
        'Logical reasoning and analytical ability',
        'Decision making and problem solving',
        'General mental ability',
        'Basic numeracy',
        'Data interpretation'
      ]
    }
  ];

  const mainsSyllabus = [
    {
      paper: 'Essay Paper',
      topics: ['Candidates may be required to write essays on multiple topics']
    },
    {
      paper: 'General Studies Paper I',
      topics: [
        'Indian Heritage and Culture',
        'History and Geography of the World and Society',
        'Modern Indian history',
        'The Freedom Struggle',
        'Post-independence consolidation'
      ]
    },
    {
      paper: 'General Studies Paper II',
      topics: [
        'Governance, Constitution, Polity',
        'Social Justice and International relations',
        'Indian Constitution',
        'Functions and responsibilities of the Union and States',
        'Welfare schemes for vulnerable sections'
      ]
    },
    {
      paper: 'General Studies Paper III',
      topics: [
        'Technology, Economic Development',
        'Bio-diversity, Environment, Security',
        'Indian Economy',
        'Science and Technology',
        'Disaster Management'
      ]
    },
    {
      paper: 'General Studies Paper IV',
      topics: [
        'Ethics, Integrity and Aptitude',
        'Ethics and Human Interface',
        'Attitude: content, structure, function',
        'Emotional intelligence',
        'Public/Civil service values'
      ]
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-primary/10">
        <div className="flex items-center gap-3 mb-2">
          <BookOpen className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold">{examName} Syllabus</h2>
        </div>
        <p className="text-muted-foreground">
          Complete syllabus coverage for all stages of the examination
        </p>
      </Card>

      <Tabs defaultValue="prelims" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="prelims">Prelims Syllabus</TabsTrigger>
          <TabsTrigger value="mains">Mains Syllabus</TabsTrigger>
        </TabsList>

        <TabsContent value="prelims" className="space-y-4">
          {prelimsSyllabus.map((section, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-bold">{section.subject}</h3>
              </div>
              <div className="space-y-2">
                {section.topics.map((topic, topicIdx) => (
                  <div key={topicIdx} className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="mains" className="space-y-4">
          {mainsSyllabus.map((paper, idx) => (
            <Card key={idx} className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="default" className="text-sm">{paper.paper}</Badge>
              </div>
              <div className="space-y-2">
                {paper.topics.map((topic, topicIdx) => (
                  <div key={topicIdx} className="flex items-start gap-2">
                    <CheckSquare className="h-4 w-4 text-green-500 mt-1 flex-shrink-0" />
                    <span className="text-sm">{topic}</span>
                  </div>
                ))}
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};
