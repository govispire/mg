
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategorySelector } from '@/components/global/CategorySelector';

import { examNotifications as allExamNotifications, getExamNotificationStats } from '@/data/examNotificationData';
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
  BookOpen,
  ChevronDown,
  ChevronUp
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
  const examNotifications = allExamNotifications; // always show ALL exams, no category filter
  const stats = getExamNotificationStats([]);     // stats across all exams
  const hasFilters = true;                         // always show the list
  const [activeTab, setActiveTab] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
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
            /* ── Compact accordion list ── */
            <div className="divide-y divide-border border border-border rounded-xl overflow-hidden bg-card">
              {filteredNotifications.map((exam) => {
                const isOpen = expandedId === exam.id;
                return (
                  <div key={exam.id}>
                    {/* ── Collapsed row ── */}
                    <div className="flex items-center gap-3 px-4 py-3 hover:bg-muted/40 transition-colors">
                      {/* Logo */}
                      <div className="w-8 h-8 rounded-md bg-muted/50 flex items-center justify-center shrink-0 overflow-hidden">
                        <img
                          src={getExamLogo(exam)}
                          alt={exam.examName}
                          className="w-7 h-7 object-contain"
                          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                        />
                      </div>

                      {/* Name + category + qualification + vacancies */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-sm font-semibold text-foreground truncate">{exam.examName}</span>
                          {exam.notificationStatus === 'new' && <Badge className="bg-red-500 text-white text-[10px] px-1.5 py-0 h-4">NEW</Badge>}
                          {exam.applyStatus === 'new' && <Badge className="bg-orange-500 text-white text-[10px] px-1.5 py-0 h-4">HOT</Badge>}
                        </div>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-2">
                          <span className="flex items-center gap-1">{getCategoryIcon(exam.categoryIds)}{getCategoryName(exam.categoryIds)}</span>
                          <span className="text-gray-300">•</span>
                          <span>{exam.qualification}</span>
                          <span className="text-gray-300">•</span>
                          <span className="font-medium text-gray-600">Posts: {exam.vacancies.toLocaleString()}</span>
                        </p>
                      </div>

                      {/* Status badge */}
                      <div className="hidden sm:block shrink-0">
                        {getStatusBadge(exam)}
                      </div>

                      {/* Quick Apply/Result button */}
                      {exam.resultStatus === 'declared' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-3 shrink-0 border-amber-400 text-amber-600 hover:bg-amber-50"
                          onClick={(e) => { e.stopPropagation(); handleExternalLink(exam, 'result'); }}
                        >Result</Button>
                      ) : exam.applyStatus !== 'applied' ? (
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs px-3 shrink-0"
                          onClick={(e) => { e.stopPropagation(); handleExternalLink(exam, 'apply'); }}
                        >Apply</Button>
                      ) : null}

                      {/* Expand chevron */}
                      <button
                        onClick={() => setExpandedId(isOpen ? null : exam.id)}
                        className="h-7 w-7 flex items-center justify-center rounded-md hover:bg-muted transition-colors shrink-0 text-muted-foreground"
                        aria-label={isOpen ? 'Collapse' : 'Expand'}
                      >
                        {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                    </div>

                    {/* ── Expanded details panel ── */}
                    {isOpen && (
                      <div className="bg-muted/20 border-t border-border/50 px-4 py-3">
                        {/* Dates row */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                          {[
                            { icon: <Calendar className="h-3.5 w-3.5 text-emerald-500" />, label: 'Apply Start', value: exam.applicationPeriod.startDate },
                            { icon: <AlertCircle className="h-3.5 w-3.5 text-red-400" />, label: 'Apply End', value: exam.applicationPeriod.endDate },
                            { icon: <FileText className="h-3.5 w-3.5 text-blue-400" />, label: 'Exam Date', value: exam.examDate },
                            { icon: <CheckCircle className="h-3.5 w-3.5 text-amber-400" />, label: 'Admit Card', value: exam.paymentLastDate },
                          ].map(({ icon, label, value }) => (
                            <div key={label} className="text-center bg-background rounded-lg py-2 px-1 border border-border/40">
                              <div className="flex justify-center mb-0.5">{icon}</div>
                              <div className="text-[10px] text-muted-foreground">{label}</div>
                              <div className="text-xs font-semibold text-foreground">{value}</div>
                            </div>
                          ))}
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" className="h-7 text-xs gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white"
                            onClick={() => handleExternalLink(exam, 'notification')}>
                            <Download className="h-3 w-3" /> Notification
                          </Button>
                          {exam.admitCardStatus === 'released' && (
                            <Button size="sm" className="h-7 text-xs gap-1.5 bg-violet-600 hover:bg-violet-700 text-white"
                              onClick={() => handleExternalLink(exam, 'admitCard')}>
                              <FileText className="h-3 w-3" /> Admit Card
                            </Button>
                          )}
                          {exam.applyStatus !== 'applied' && (
                            <Button size="sm" className="h-7 text-xs gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white"
                              onClick={() => handleExternalLink(exam, 'apply')}>
                              <ExternalLink className="h-3 w-3" /> Apply Now
                            </Button>
                          )}
                          {exam.resultStatus === 'declared' && (
                            <Button size="sm" className="h-7 text-xs gap-1.5 bg-amber-500 hover:bg-amber-600 text-white"
                              onClick={() => handleExternalLink(exam, 'result')}>
                              <CheckCircle className="h-3 w-3" /> View Result
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
