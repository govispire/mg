import React, { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarIcon, Clock, BookOpen, Video, FileText, Target, CheckCircle2, AlertCircle, Zap } from 'lucide-react';
import { format, differenceInDays, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { ExamSyllabusConfig, TopicConfig } from '@/data/syllabusData';

interface StudyPlanGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
  examConfig: ExamSyllabusConfig;
}

interface DailyPlan {
  date: Date;
  topics: {
    topicName: string;
    subjectName: string;
    type: 'video' | 'pdf' | 'test' | 'revision';
    duration: string;
    priority: 'high' | 'medium' | 'low';
  }[];
}

const StudyPlanGenerator: React.FC<StudyPlanGeneratorProps> = ({
  isOpen,
  onClose,
  examConfig
}) => {
  const [examDate, setExamDate] = useState<Date | undefined>(undefined);
  const [hoursPerDay, setHoursPerDay] = useState<string>('4');
  const [focusArea, setFocusArea] = useState<string>('weak');
  const [showPlan, setShowPlan] = useState(false);
  
  // Calculate all topics with their progress
  const allTopics = useMemo(() => {
    const topics: { topic: TopicConfig; subjectName: string; tierName: string }[] = [];
    examConfig.tiers.forEach(tier => {
      tier.subjects.forEach(subject => {
        subject.topics.forEach(topic => {
          topics.push({
            topic,
            subjectName: subject.name,
            tierName: tier.name
          });
        });
      });
    });
    return topics;
  }, [examConfig]);
  
  // Calculate weak and strong topics
  const weakTopics = allTopics.filter(t => t.topic.progress < 40);
  const mediumTopics = allTopics.filter(t => t.topic.progress >= 40 && t.topic.progress < 70);
  const strongTopics = allTopics.filter(t => t.topic.progress >= 70);
  
  // Generate study plan
  const studyPlan = useMemo((): DailyPlan[] => {
    if (!examDate) return [];
    
    const today = new Date();
    const daysRemaining = differenceInDays(examDate, today);
    if (daysRemaining <= 0) return [];
    
    const plan: DailyPlan[] = [];
    const hoursNum = parseInt(hoursPerDay);
    
    // Sort topics by priority based on focus area
    let sortedTopics = [...allTopics];
    if (focusArea === 'weak') {
      sortedTopics.sort((a, b) => a.topic.progress - b.topic.progress);
    } else if (focusArea === 'strong') {
      sortedTopics.sort((a, b) => b.topic.progress - a.topic.progress);
    }
    
    // Distribute topics across days
    const topicsPerDay = Math.ceil(sortedTopics.length / Math.min(daysRemaining, 30));
    
    for (let day = 0; day < Math.min(daysRemaining, 30); day++) {
      const date = addDays(today, day + 1);
      const dayTopics: DailyPlan['topics'] = [];
      
      const startIndex = day * topicsPerDay;
      const endIndex = Math.min(startIndex + topicsPerDay, sortedTopics.length);
      
      for (let i = startIndex; i < endIndex; i++) {
        const topicData = sortedTopics[i];
        if (!topicData) continue;
        
        const priority = topicData.topic.progress < 40 ? 'high' : 
                        topicData.topic.progress < 70 ? 'medium' : 'low';
        
        // Add video session
        dayTopics.push({
          topicName: topicData.topic.name,
          subjectName: topicData.subjectName,
          type: 'video',
          duration: '45 min',
          priority
        });
        
        // Add practice test for weak topics
        if (topicData.topic.progress < 50) {
          dayTopics.push({
            topicName: topicData.topic.name,
            subjectName: topicData.subjectName,
            type: 'test',
            duration: '30 min',
            priority
          });
        }
      }
      
      // Add revision slot for days after first week
      if (day > 7 && day % 3 === 0) {
        dayTopics.push({
          topicName: 'Previous Topics Revision',
          subjectName: 'Mixed',
          type: 'revision',
          duration: '60 min',
          priority: 'medium'
        });
      }
      
      if (dayTopics.length > 0) {
        plan.push({ date, topics: dayTopics });
      }
    }
    
    return plan;
  }, [examDate, hoursPerDay, focusArea, allTopics]);
  
  const daysRemaining = examDate ? differenceInDays(examDate, new Date()) : 0;
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-500" />
            AI Study Plan Generator
          </DialogTitle>
        </DialogHeader>
        
        {!showPlan ? (
          <div className="space-y-6 py-4">
            {/* Exam Info */}
            <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <img src={examConfig.logo} alt={examConfig.examName} className="w-12 h-12 object-contain" />
                  <div>
                    <h3 className="font-bold text-lg">{examConfig.examName}</h3>
                    <p className="text-sm text-muted-foreground">{examConfig.fullName}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Progress Summary */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-red-200 bg-red-50/50">
                <CardContent className="p-4 text-center">
                  <AlertCircle className="h-6 w-6 text-red-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-red-600">{weakTopics.length}</p>
                  <p className="text-xs text-muted-foreground">Weak Topics (&lt;40%)</p>
                </CardContent>
              </Card>
              <Card className="border-amber-200 bg-amber-50/50">
                <CardContent className="p-4 text-center">
                  <Target className="h-6 w-6 text-amber-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-amber-600">{mediumTopics.length}</p>
                  <p className="text-xs text-muted-foreground">Medium Topics (40-70%)</p>
                </CardContent>
              </Card>
              <Card className="border-emerald-200 bg-emerald-50/50">
                <CardContent className="p-4 text-center">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500 mx-auto mb-2" />
                  <p className="text-2xl font-bold text-emerald-600">{strongTopics.length}</p>
                  <p className="text-xs text-muted-foreground">Strong Topics (&gt;70%)</p>
                </CardContent>
              </Card>
            </div>
            
            {/* Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Exam Date Picker */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Target Exam Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !examDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {examDate ? format(examDate, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={examDate}
                      onSelect={setExamDate}
                      disabled={(date) => date < new Date()}
                      initialFocus
                      className="pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              {/* Hours Per Day */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Study Hours per Day</label>
                <Select value={hoursPerDay} onValueChange={setHoursPerDay}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 hours</SelectItem>
                    <SelectItem value="4">4 hours</SelectItem>
                    <SelectItem value="6">6 hours</SelectItem>
                    <SelectItem value="8">8 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {/* Focus Area */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Focus Area</label>
                <Select value={focusArea} onValueChange={setFocusArea}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weak">Weak Topics First</SelectItem>
                    <SelectItem value="strong">Strong Topics First</SelectItem>
                    <SelectItem value="balanced">Balanced Approach</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Generate Button */}
            <Button 
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 text-white"
              disabled={!examDate}
              onClick={() => setShowPlan(true)}
            >
              Generate Study Plan
            </Button>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* Plan Summary */}
            <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold">Your Personalized Study Plan</h3>
                    <p className="text-sm text-muted-foreground">
                      {daysRemaining} days until exam • {hoursPerDay} hours/day
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setShowPlan(false)}>
                    Modify
                  </Button>
                </div>
              </CardContent>
            </Card>
            
            {/* Daily Plans */}
            <div className="space-y-3 max-h-[400px] overflow-y-auto">
              {studyPlan.slice(0, 14).map((day, index) => (
                <Card key={index} className="border-l-4 border-l-emerald-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium text-sm">
                          Day {index + 1} - {format(day.date, 'EEE, MMM d')}
                        </span>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {day.topics.length} activities
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {day.topics.map((topic, tIndex) => (
                        <div 
                          key={tIndex}
                          className={cn(
                            "flex items-center gap-3 p-2 rounded-lg",
                            topic.priority === 'high' ? 'bg-red-50' :
                            topic.priority === 'medium' ? 'bg-amber-50' : 'bg-emerald-50'
                          )}
                        >
                          {topic.type === 'video' && <Video className="h-4 w-4 text-purple-500" />}
                          {topic.type === 'pdf' && <FileText className="h-4 w-4 text-blue-500" />}
                          {topic.type === 'test' && <BookOpen className="h-4 w-4 text-emerald-500" />}
                          {topic.type === 'revision' && <Target className="h-4 w-4 text-amber-500" />}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{topic.topicName}</p>
                            <p className="text-xs text-muted-foreground">{topic.subjectName}</p>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {topic.duration}
                            </span>
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs",
                                topic.priority === 'high' ? 'bg-red-100 text-red-700' :
                                topic.priority === 'medium' ? 'bg-amber-100 text-amber-700' : 
                                'bg-emerald-100 text-emerald-700'
                              )}
                            >
                              {topic.priority}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {studyPlan.length > 14 && (
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center text-muted-foreground text-sm">
                    + {studyPlan.length - 14} more days in your study plan
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        )}
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
          {showPlan && (
            <Button className="bg-emerald-500 text-white">
              Save Plan to Calendar
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default StudyPlanGenerator;
