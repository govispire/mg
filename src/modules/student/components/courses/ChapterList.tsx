
import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Play, FileText, Clock, CheckCircle } from 'lucide-react';
import { getChaptersBySubject } from '@/data/courseData';

interface ChapterListProps {
  courseId: string;
  subject: string;
  isGridView: boolean;
}

export const ChapterList: React.FC<ChapterListProps> = ({ courseId, subject, isGridView }) => {
  const [openChapters, setOpenChapters] = useState<string[]>([]);
  const chapters = getChaptersBySubject(subject);
  
  const toggleChapter = (chapterId: string) => {
    setOpenChapters(prev => 
      prev.includes(chapterId) 
        ? prev.filter(id => id !== chapterId)
        : [...prev, chapterId]
    );
  };
  
  const gridClass = isGridView 
    ? "grid md:grid-cols-2 lg:grid-cols-3 gap-3"
    : "space-y-3";
  
  return (
    <div className={gridClass}>
      {chapters.map((chapter) => (
        <Card key={chapter.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <Collapsible 
            open={openChapters.includes(chapter.id)}
            onOpenChange={() => toggleChapter(chapter.id)}
          >
            <CollapsibleTrigger asChild>
              <div className="p-3 hover:bg-gray-50 transition-colors cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {openChapters.includes(chapter.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                    <h3 className="text-sm font-medium">{chapter.title}</h3>
                  </div>
                  <div className="text-xs text-gray-500">
                    {chapter.videosCount}v • {chapter.testsCount}t
                  </div>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span>Progress</span>
                    <span>{chapter.progress}%</span>
                  </div>
                  <Progress value={chapter.progress} className="h-1" />
                </div>
              </div>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <div className="px-3 pb-3 space-y-3">
                {/* Videos Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <Play className="h-3 w-3" />
                    <span className="text-sm font-medium text-gray-700">Videos ({chapter.videos.length})</span>
                  </div>
                  <div className="space-y-2">
                    {chapter.videos.map((video) => (
                      <div key={video.id} className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              video.isWatched ? 'bg-green-100' : 'bg-blue-100'
                            }`}>
                              {video.isWatched ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <Play className="h-3 w-3 text-blue-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium truncate">{video.title}</div>
                              <div className="flex items-center space-x-1 text-xs text-gray-500">
                                <Clock className="h-2 w-2" />
                                <span>{video.duration}</span>
                              </div>
                            </div>
                          </div>
                          <Button 
                            variant={video.isWatched ? "outline" : "default"} 
                            size="sm" 
                            className="h-6 px-2 text-xs"
                          >
                            {video.isWatched ? 'Rewatch' : 'Watch'}
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Tests Section */}
                <div>
                  <div className="flex items-center space-x-2 mb-2">
                    <FileText className="h-3 w-3" />
                    <span className="text-sm font-medium text-gray-700">Tests ({chapter.tests.length})</span>
                  </div>
                  <div className="space-y-2">
                    {chapter.tests.map((test) => (
                      <div key={test.id} className="p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                              test.isCompleted ? 'bg-green-100' : 'bg-orange-100'
                            }`}>
                              {test.isCompleted ? (
                                <CheckCircle className="h-3 w-3 text-green-600" />
                              ) : (
                                <FileText className="h-3 w-3 text-orange-600" />
                              )}
                            </div>
                            <div>
                              <div className="text-sm font-medium">{test.title}</div>
                              {test.score && (
                                <div className="text-xs text-gray-500">Score: {test.score}%</div>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            {test.isCompleted && (
                              <Badge variant="success" className="text-xs bg-green-100 text-green-600">
                                Done
                              </Badge>
                            )}
                            <Button 
                              variant={test.isCompleted ? "outline" : "default"} 
                              size="sm" 
                              className="h-6 px-2 text-xs"
                            >
                              {test.isCompleted ? 'Retake' : 'Start'}
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      ))}
    </div>
  );
};
