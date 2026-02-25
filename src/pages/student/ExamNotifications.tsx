
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategorySelector } from '@/components/global/CategorySelector';

import { useCategoryFilteredExamNotifications } from '@/hooks/useCategoryFilteredContent';
import { toast } from '@/hooks/use-toast';
import ExamApplicationDialog from '@/components/student/ExamApplicationDialog';
import ExamCalendarView from '@/components/exam-notifications/ExamCalendarView';
import {
  Calendar,
  Clock,
  Bell,
  FileText,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  Download,
  CheckCircle,
  Search,
  Building2,
  GraduationCap,
  Train,
  Landmark,
  Shield,
  Users,
  BookOpen
} from 'lucide-react';
import type { ExamNotification } from '@/data/examNotificationData';

// Logo mappings for exam categories
const examLogos: Record<string, string> = {
  'banking': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'banking-insurance': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'ibps': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
  'sbi': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
  'rrb': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'ssc': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
  'railway': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'railways-rrb': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
  'upsc': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  'civil-services': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
  'rbi': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  'regulatory': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125087/reservebank_of_india_jlgv5o.webp',
  'defence': 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
};

const getExamLogo = (exam: ExamNotification): string => {
  const examNameLower = exam.examName.toLowerCase();

  // Match specific exam names first
  if (examNameLower.includes('ibps')) return examLogos['ibps'];
  if (examNameLower.includes('sbi')) return examLogos['sbi'];
  if (examNameLower.includes('rrb') || examNameLower.includes('railway')) return examLogos['railway'];
  if (examNameLower.includes('ssc')) return examLogos['ssc'];
  if (examNameLower.includes('upsc')) return examLogos['upsc'];
  if (examNameLower.includes('rbi')) return examLogos['rbi'];

  // Fall back to category
  for (const categoryId of exam.categoryIds) {
    if (examLogos[categoryId]) return examLogos[categoryId];
  }

  return examLogos['banking']; // default
};

const getCategoryIcon = (categoryIds: string[]) => {
  const primary = categoryIds[0] || '';
  if (primary.includes('banking') || primary.includes('insurance')) return <Building2 className="h-4 w-4" />;
  if (primary.includes('ssc')) return <GraduationCap className="h-4 w-4" />;
  if (primary.includes('railway') || primary.includes('rrb')) return <Train className="h-4 w-4" />;
  if (primary.includes('upsc') || primary.includes('civil')) return <Landmark className="h-4 w-4" />;
  if (primary.includes('defence')) return <Shield className="h-4 w-4" />;
  if (primary.includes('regulatory')) return <TrendingUp className="h-4 w-4" />;
  if (primary.includes('mba')) return <Users className="h-4 w-4" />;
  return <BookOpen className="h-4 w-4" />;
};

const getCategoryName = (categoryIds: string[]): string => {
  const primary = categoryIds[0] || '';
  if (primary.includes('banking')) return 'Banking Exam';
  if (primary.includes('ssc')) return 'SSC Exam';
  if (primary.includes('railway') || primary.includes('rrb')) return 'Railway Exam';
  if (primary.includes('upsc') || primary.includes('civil')) return 'UPSC Exam';
  if (primary.includes('defence')) return 'Defence Exam';
  if (primary.includes('regulatory')) return 'Regulatory Exam';
  return 'Government Exam';
};

const ExamNotifications = () => {
  const { examNotifications, stats, hasFilters, selectedCategories } = useCategoryFilteredExamNotifications();
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    examName: string;
    actionType: 'notification' | 'apply' | 'result';
    url: string;
  }>({
    isOpen: false,
    examName: '',
    actionType: 'notification',
    url: ''
  });

  const getFilteredNotifications = () => {
    let filtered = examNotifications;

    // Filter by tab
    if (activeTab === 'upcoming') {
      filtered = filtered.filter(exam => exam.isUpcoming);
    } else if (activeTab === 'new') {
      filtered = filtered.filter(exam => exam.notificationStatus === 'new');
    } else if (activeTab === 'admit-card') {
      filtered = filtered.filter(exam => exam.admitCardStatus === 'released');
    }

    // Filter by search
    if (searchQuery) {
      filtered = filtered.filter(exam =>
        exam.examName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredNotifications = getFilteredNotifications();

  const handleExternalLink = (exam: ExamNotification, actionType: 'notification' | 'apply' | 'result' | 'admitCard') => {
    let url = '';

    switch (actionType) {
      case 'notification':
        url = exam.urls.notificationPdf || '';
        break;
      case 'apply':
        url = exam.urls.applicationForm || '';
        break;
      case 'result':
        url = exam.urls.resultPage || '';
        break;
      case 'admitCard':
        url = exam.urls.admitCardDownload || '';
        break;
    }

    if (!url) {
      toast({
        title: "Link Not Available",
        description: `The ${actionType === 'admitCard' ? 'admit card' : actionType} link for ${exam.examName} is not available yet.`,
        variant: "destructive"
      });
      return;
    }

    setDialogState({
      isOpen: true,
      examName: exam.examName,
      actionType: actionType === 'admitCard' ? 'notification' : actionType as any,
      url
    });
  };

  const confirmExternalLink = () => {
    window.open(dialogState.url, '_blank', 'noopener,noreferrer');
    setDialogState(prev => ({ ...prev, isOpen: false }));

    if (dialogState.actionType === 'apply') {
      toast({
        title: "Application Started",
        description: `You've been redirected to apply for ${dialogState.examName}. Complete your application on the official website.`,
      });
    }
  };

  const closeDialog = () => {
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const getStatusBadge = (exam: ExamNotification) => {
    if (exam.resultStatus === 'declared') {
      return <Badge className="bg-amber-500/20 text-amber-600 border-amber-500/30 gap-1"><CheckCircle className="h-3 w-3" />Result Out</Badge>;
    }
    if (exam.applyStatus === 'new' || exam.applyStatus === 'apply') {
      return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30 gap-1 animate-pulse"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />Applications Open</Badge>;
    }
    if (exam.isUpcoming) {
      return <Badge className="bg-sky-500/20 text-sky-600 border-sky-500/30 gap-1"><Clock className="h-3 w-3" />Upcoming</Badge>;
    }
    return null;
  };

  return (
    <div className="p-4 md:p-6 space-y-2 max-w-7xl mx-auto">
      {/* Enhanced Header */}
      <div className="relative py-4 bg-gradient-to-br from-primary/5 via-background to-accent/5 rounded-2xl overflow-hidden -mx-4 px-4 md:-mx-6 md:px-6">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-5 w-48 h-48 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-5 right-5 w-64 h-64 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative">
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Exam <span className="text-primary">Notifications</span> & Alerts
              </h1>
              <p className="text-muted-foreground max-w-2xl">
                Stay updated with real-time exam dates, admit cards, results, and important deadlines for all major government and competitive exams.
              </p>
            </div>
            <CategorySelector />
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-2 border-y border-border/50">
        {/* Search */}
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search exams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background"
          />
        </div>

        {/* View Toggle */}
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <FileText className="h-4 w-4" />
            List View
          </Button>
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar View
          </Button>
        </div>
      </div>

      {/* Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 max-w-3xl mx-auto">
          <TabsTrigger value="all">All ({examNotifications.length})</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming ({stats.upcoming})</TabsTrigger>
          <TabsTrigger value="new">New ({stats.newNotifications})</TabsTrigger>
          <TabsTrigger value="admit-card">Admit Card ({examNotifications.filter(e => e.admitCardStatus === 'released').length})</TabsTrigger>
          <TabsTrigger value="results">Result ({examNotifications.filter(e => e.resultStatus === 'declared').length})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4 mt-6">
          {!hasFilters ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">Select Your Categories</h3>
                <p className="text-muted-foreground mb-4">
                  Please select your exam categories using the Category Selector above to see relevant exam notifications.
                </p>
                <div className="flex justify-center">
                  <CategorySelector />
                </div>
              </CardContent>
            </Card>
          ) : filteredNotifications.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-center">
                <Bell className="h-12 w-12 text-muted-foreground/50 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">No exam notifications found</h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? 'Try adjusting your search query.'
                    : `No ${activeTab === 'all' ? '' : activeTab} exam notifications match your selected categories.`
                  }
                </p>
              </CardContent>
            </Card>
          ) : viewMode === 'calendar' ? (
            <ExamCalendarView notifications={filteredNotifications.map(exam => ({
              id: exam.id,
              examName: exam.examName,
              category: exam.categoryIds[0] || 'other',
              categoryIcon: getCategoryIcon(exam.categoryIds),
              applicationStart: exam.applicationPeriod.startDate,
              applicationEnd: exam.applicationPeriod.endDate,
              examDate: exam.examDate,
              status: exam.resultStatus === 'declared' ? 'result-declared' as const :
                exam.applyStatus === 'apply' || exam.applyStatus === 'new' ? 'ongoing' as const :
                  'upcoming' as const,
              eligibility: 'As per notification',
              officialLink: exam.urls.applicationForm || '#',
              lastUpdated: 'Recently',
              isNew: exam.notificationStatus === 'new',
              isHot: exam.applyStatus === 'new'
            }))} />
          ) : (
            <div className="grid gap-4">
              {filteredNotifications.map((exam) => (
                <Card
                  key={exam.id}
                  className="bg-card hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30 overflow-hidden"
                >
                  <CardContent className="p-0">
                    <div className="flex flex-col lg:flex-row lg:items-center">
                      {/* Left Section - Logo & Exam Info */}
                      <div className="flex-1 p-4 md:p-6">
                        <div className="flex items-start gap-4">
                          <div className="flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg bg-muted/50 flex items-center justify-center overflow-hidden">
                            <img
                              src={getExamLogo(exam)}
                              alt={exam.examName}
                              className="w-10 h-10 md:w-12 md:h-12 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="text-lg md:text-xl font-semibold text-foreground">{exam.examName}</h3>
                              {exam.notificationStatus === 'new' && (
                                <Badge className="bg-red-500 text-white text-xs">NEW</Badge>
                              )}
                              {exam.applyStatus === 'new' && (
                                <Badge className="bg-orange-500 text-white text-xs">HOT</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                              {getCategoryIcon(exam.categoryIds)}
                              {getCategoryName(exam.categoryIds)}
                            </p>
                            <div className="flex items-center gap-2 mt-2 flex-wrap">
                              {getStatusBadge(exam)}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Middle Section - Dates */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 px-4 md:px-6 py-3 bg-muted/30 border-y border-border/30 lg:border-y-0 lg:border-x">
                        <div className="text-center p-2 md:p-3 rounded-lg bg-background/80">
                          <Calendar className="h-4 w-4 mx-auto mb-1 text-emerald-500" />
                          <div className="text-xs text-muted-foreground mb-1">Apply Start</div>
                          <div className="text-xs md:text-sm font-medium text-foreground">{exam.applicationPeriod.startDate}</div>
                        </div>
                        <div className="text-center p-2 md:p-3 rounded-lg bg-background/80">
                          <AlertCircle className="h-4 w-4 mx-auto mb-1 text-red-400" />
                          <div className="text-xs text-muted-foreground mb-1">Apply End</div>
                          <div className="text-xs md:text-sm font-medium text-foreground">{exam.applicationPeriod.endDate}</div>
                        </div>
                        <div className="text-center p-2 md:p-3 rounded-lg bg-background/80">
                          <FileText className="h-4 w-4 mx-auto mb-1 text-blue-400" />
                          <div className="text-xs text-muted-foreground mb-1">Exam Date</div>
                          <div className="text-xs md:text-sm font-medium text-foreground">{exam.examDate}</div>
                        </div>
                        <div className="text-center p-2 md:p-3 rounded-lg bg-background/80">
                          <CheckCircle className="h-4 w-4 mx-auto mb-1 text-amber-400" />
                          <div className="text-xs text-muted-foreground mb-1">Admit Card</div>
                          <div className="text-xs md:text-sm font-medium text-foreground">{exam.paymentLastDate}</div>
                        </div>
                      </div>

                      {/* Right Section - Actions */}
                      <div className="flex flex-col gap-2 p-4 md:p-6 md:min-w-[160px]">
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleExternalLink(exam, 'notification')}
                        >
                          <Bell className="h-4 w-4" />
                          Set Reminder
                        </Button>
                        <Button
                          size="sm"
                          className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-500/20 border-0"
                          onClick={() => handleExternalLink(exam, 'notification')}
                        >
                          <Download className="h-4 w-4" />
                          Notification
                        </Button>
                        {exam.admitCardStatus === 'released' && (
                          <Button
                            size="sm"
                            className="gap-2 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 border-0"
                            onClick={() => handleExternalLink(exam, 'admitCard')}
                          >
                            <FileText className="h-4 w-4" />
                            Download Admit Card
                          </Button>
                        )}
                        {exam.applyStatus !== 'applied' && (
                          <Button
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white shadow-lg shadow-emerald-500/25 border-0"
                            onClick={() => handleExternalLink(exam, 'apply')}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Apply Now
                          </Button>
                        )}
                        {exam.resultStatus === 'declared' && (
                          <Button
                            size="sm"
                            className="gap-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-amber-500/25 border-0"
                            onClick={() => handleExternalLink(exam, 'result')}
                          >
                            <CheckCircle className="h-4 w-4" />
                            View Result
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Important Deadlines Section */}
      {hasFilters && filteredNotifications.some(e => e.applyStatus === 'apply' || e.applyStatus === 'new') && (
        <div className="py-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-foreground mb-2">⚠️ Upcoming Deadlines</h2>
            <p className="text-muted-foreground">Don't miss these important application deadlines</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredNotifications
              .filter(e => e.applyStatus === 'apply' || e.applyStatus === 'new')
              .slice(0, 6)
              .map((exam) => (
                <Card key={exam.id} className="bg-card border-red-500/30 hover:border-red-500/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-red-500/10 flex items-center justify-center">
                        <img
                          src={getExamLogo(exam)}
                          alt={exam.examName}
                          className="w-8 h-8 object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{exam.examName}</h4>
                        <p className="text-sm text-muted-foreground">{getCategoryName(exam.categoryIds)}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-xs text-muted-foreground">Last Date to Apply</div>
                        <div className="text-lg font-bold text-red-500">{exam.applicationPeriod.endDate}</div>
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleExternalLink(exam, 'apply')}
                      >
                        Apply Now
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ExamApplicationDialog
        isOpen={dialogState.isOpen}
        onClose={closeDialog}
        examName={dialogState.examName}
        actionType={dialogState.actionType}
        url={dialogState.url}
        onConfirm={confirmExternalLink}
      />
    </div>
  );
};

export default ExamNotifications;
