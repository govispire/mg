import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Building2,
  GraduationCap,
  Train,
  Shield,
  Landmark,
  TrendingUp,
  Users,
  ExternalLink,
  Award,
  Bell
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, parse } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

interface ExamEvent {
  id: string;
  examName: string;
  category: string;
  date: Date;
  eventType: 'application-start' | 'application-end' | 'exam' | 'admit-card' | 'result';
  status: string;
  officialLink: string;
}

interface ExamNotification {
  id: string;
  examName: string;
  category: string;
  applicationStart: string;
  applicationEnd: string;
  examDate: string;
  resultDate?: string;
  admitCardDate?: string;
  status: string;
  officialLink: string;
}

interface ExamCalendarViewProps {
  notifications: ExamNotification[];
}

const categoryIcons: Record<string, React.ReactNode> = {
  banking: <Building2 className="h-3 w-3" />,
  ssc: <GraduationCap className="h-3 w-3" />,
  railway: <Train className="h-3 w-3" />,
  upsc: <Landmark className="h-3 w-3" />,
  defence: <Shield className="h-3 w-3" />,
  tnpsc: <GraduationCap className="h-3 w-3" />,
  regulatory: <TrendingUp className="h-3 w-3" />,
  mba: <Users className="h-3 w-3" />,
};

const categoryColors: Record<string, string> = {
  banking: 'from-blue-500/20 to-blue-600/10',
  ssc: 'from-green-500/20 to-green-600/10',
  railway: 'from-orange-500/20 to-orange-600/10',
  upsc: 'from-purple-500/20 to-purple-600/10',
  defence: 'from-red-500/20 to-red-600/10',
  tnpsc: 'from-teal-500/20 to-teal-600/10',
  regulatory: 'from-indigo-500/20 to-indigo-600/10',
  mba: 'from-pink-500/20 to-pink-600/10',
};

const eventTypeConfig: Record<string, { bg: string; text: string; border: string; icon: React.ReactNode; label: string }> = {
  'application-start': {
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: <CheckCircle className="h-3 w-3" />,
    label: 'Application Opens'
  },
  'application-end': {
    bg: 'bg-rose-500/20',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: <AlertCircle className="h-3 w-3" />,
    label: 'Last Date to Apply'
  },
  'exam': {
    bg: 'bg-sky-500/20',
    text: 'text-sky-400',
    border: 'border-sky-500/30',
    icon: <FileText className="h-3 w-3" />,
    label: 'Exam Date'
  },
  'admit-card': {
    bg: 'bg-violet-500/20',
    text: 'text-violet-400',
    border: 'border-violet-500/30',
    icon: <FileText className="h-3 w-3" />,
    label: 'Admit Card'
  },
  'result': {
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: <Award className="h-3 w-3" />,
    label: 'Result'
  },
};

const parseDate = (dateStr: string): Date => {
  return parse(dateStr, 'dd MMM yyyy', new Date());
};

const ExamCalendarView: React.FC<ExamCalendarViewProps> = ({ notifications }) => {
  // Initialize to June 2025 where exam events are scheduled
  const [currentMonth, setCurrentMonth] = useState(new Date(2025, 5, 1)); // June 2025
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date(2025, 5, 1));

  // Convert notifications to calendar events
  const events: ExamEvent[] = notifications.flatMap(notification => {
    const eventsArray: ExamEvent[] = [];

    eventsArray.push({
      id: `${notification.id}-app-start`,
      examName: notification.examName,
      category: notification.category,
      date: parseDate(notification.applicationStart),
      eventType: 'application-start',
      status: notification.status,
      officialLink: notification.officialLink,
    });

    eventsArray.push({
      id: `${notification.id}-app-end`,
      examName: notification.examName,
      category: notification.category,
      date: parseDate(notification.applicationEnd),
      eventType: 'application-end',
      status: notification.status,
      officialLink: notification.officialLink,
    });

    eventsArray.push({
      id: `${notification.id}-exam`,
      examName: notification.examName,
      category: notification.category,
      date: parseDate(notification.examDate),
      eventType: 'exam',
      status: notification.status,
      officialLink: notification.officialLink,
    });

    if (notification.admitCardDate) {
      eventsArray.push({
        id: `${notification.id}-admit`,
        examName: notification.examName,
        category: notification.category,
        date: parseDate(notification.admitCardDate),
        eventType: 'admit-card',
        status: notification.status,
        officialLink: notification.officialLink,
      });
    }

    if (notification.resultDate) {
      eventsArray.push({
        id: `${notification.id}-result`,
        examName: notification.examName,
        category: notification.category,
        date: parseDate(notification.resultDate),
        eventType: 'result',
        status: notification.status,
        officialLink: notification.officialLink,
      });
    }

    return eventsArray;
  });

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const startPadding = monthStart.getDay();
  const paddingDays = Array.from({ length: startPadding }, (_, i) => null);

  const getEventsForDay = (day: Date) => {
    return events.filter(event => isSameDay(event.date, day));
  };

  const getSelectedDateEvents = () => {
    if (!selectedDate) return [];
    return getEventsForDay(selectedDate);
  };

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const monthEvents = events
    .filter(event => isSameMonth(event.date, currentMonth))
    .sort((a, b) => a.date.getTime() - b.date.getTime());

  // Count events by type for stats
  const eventStats = {
    applications: monthEvents.filter(e => e.eventType === 'application-start' || e.eventType === 'application-end').length,
    exams: monthEvents.filter(e => e.eventType === 'exam').length,
    results: monthEvents.filter(e => e.eventType === 'result').length,
    admitCards: monthEvents.filter(e => e.eventType === 'admit-card').length,
  };

  return (
    <div className="space-y-6">
      {/* Month Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/5 border-emerald-500/20">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-emerald-400">{eventStats.applications}</div>
              <div className="text-[10px] text-muted-foreground">Application Dates</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-sky-500/10 to-sky-600/5 border-sky-500/20">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-500/20">
              <FileText className="h-4 w-4 text-sky-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-sky-400">{eventStats.exams}</div>
              <div className="text-[10px] text-muted-foreground">Exam Dates</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-violet-500/10 to-violet-600/5 border-violet-500/20">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-violet-500/20">
              <FileText className="h-4 w-4 text-violet-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-violet-400">{eventStats.admitCards}</div>
              <div className="text-[10px] text-muted-foreground">Admit Cards</div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-amber-500/20">
          <CardContent className="p-3 flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/20">
              <Award className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <div className="text-xl font-bold text-amber-400">{eventStats.results}</div>
              <div className="text-[10px] text-muted-foreground">Results</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[1fr,400px] gap-6">
        {/* Calendar Grid */}
        <Card className="bg-card/80 backdrop-blur border-border/50 overflow-hidden">
          <CardHeader className="pb-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <span>Exam Calendar</span>
              </CardTitle>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                  className="h-8 w-8"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="min-w-[160px] text-center">
                  <span className="font-semibold text-lg">{format(currentMonth, 'MMMM yyyy')}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                  className="h-8 w-8"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            {/* Week day headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weekDays.map(day => (
                <div
                  key={day}
                  className="text-center text-xs font-semibold text-muted-foreground py-3 uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar days */}
            <div className="grid grid-cols-7 gap-1">
              {paddingDays.map((_, i) => (
                <div key={`padding-${i}`} className="aspect-square" />
              ))}
              {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const today = isToday(day);

                return (
                  <motion.button
                    key={day.toISOString()}
                    onClick={() => setSelectedDate(day)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className={`
                      aspect-square p-1.5 rounded-xl transition-all relative flex flex-col items-center justify-start overflow-hidden
                      ${today ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30' : 'hover:bg-muted/70'}
                      ${isSelected && !today ? 'ring-2 ring-primary bg-primary/10' : ''}
                      ${hasEvents && !today && !isSelected ? 'bg-muted/40' : ''}
                    `}
                  >
                    <span className={`
                      text-sm font-medium
                      ${today ? 'text-primary-foreground' : isSelected ? 'text-primary' : 'text-foreground'}
                    `}>
                      {format(day, 'd')}
                    </span>

                    {hasEvents && (
                      <div className="mt-0.5 w-full space-y-0.5">
                        {dayEvents.slice(0, 2).map((event, i) => (
                          <div
                            key={i}
                            className={`text-[10px] font-semibold leading-tight truncate px-1 py-0.5 rounded ${eventTypeConfig[event.eventType].bg} ${eventTypeConfig[event.eventType].text}`}
                            title={`${event.examName} - ${eventTypeConfig[event.eventType].label}`}
                          >
                            {event.examName}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className={`text-[9px] font-medium text-center ${today ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-border/50">
              <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">Event Types</div>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {Object.entries(eventTypeConfig).map(([key, config]) => (
                  <div key={key} className={`flex items-center gap-2 p-2 rounded-lg ${config.bg}`}>
                    <div className={config.text}>{config.icon}</div>
                    <span className="text-xs text-foreground font-medium">{config.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sidebar - Events List */}
        <div className="space-y-4">
          {/* Selected Date Events */}
          <AnimatePresence mode="wait">
            {selectedDate && (
              <motion.div
                key={selectedDate.toISOString()}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="bg-card/80 backdrop-blur border-border/50 overflow-hidden">
                  <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
                    <CardTitle className="text-base flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-primary" />
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-4">
                    {getSelectedDateEvents().length === 0 ? (
                      <div className="text-center py-8">
                        <Bell className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                        <p className="text-muted-foreground text-sm">No events on this date</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {getSelectedDateEvents().map(event => (
                          <motion.div
                            key={event.id}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            className={`p-4 rounded-xl bg-gradient-to-br ${categoryColors[event.category]} border ${eventTypeConfig[event.eventType].border}`}
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <div className={`p-1.5 rounded-lg ${eventTypeConfig[event.eventType].bg}`}>
                                {categoryIcons[event.category]}
                              </div>
                              <span className="text-xs text-muted-foreground capitalize font-medium">{event.category}</span>
                            </div>
                            <div className="font-semibold text-foreground mb-2">{event.examName}</div>
                            <div className="flex items-center justify-between">
                              <Badge className={`${eventTypeConfig[event.eventType].bg} ${eventTypeConfig[event.eventType].text} ${eventTypeConfig[event.eventType].border}`}>
                                {eventTypeConfig[event.eventType].label}
                              </Badge>
                              {(event.eventType === 'result' && event.status === 'result-declared') && (
                                <Button size="sm" variant="default" className="gap-1 h-7" asChild>
                                  <a href={event.officialLink} target="_blank" rel="noopener noreferrer">
                                    <Award className="h-3 w-3" />
                                    View Result
                                  </a>
                                </Button>
                              )}
                              {event.eventType === 'application-end' && event.status === 'ongoing' && (
                                <Button size="sm" variant="destructive" className="gap-1 h-7" asChild>
                                  <a href={event.officialLink} target="_blank" rel="noopener noreferrer">
                                    <ExternalLink className="h-3 w-3" />
                                    Apply
                                  </a>
                                </Button>
                              )}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* This Month's Events */}
          <Card className="bg-card/80 backdrop-blur border-border/50 overflow-hidden">
            <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                {format(currentMonth, 'MMMM')} Events
                <Badge variant="secondary" className="ml-auto">{monthEvents.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {monthEvents.length === 0 ? (
                <div className="text-center py-8">
                  <Calendar className="h-10 w-10 mx-auto text-muted-foreground/30 mb-2" />
                  <p className="text-muted-foreground text-sm">No events this month</p>
                </div>
              ) : (
                <ScrollArea className="h-[350px]">
                  <div className="p-3 space-y-1">
                    {monthEvents.map(event => (
                      <motion.div
                        key={event.id}
                        whileHover={{ x: 4 }}
                        className={`
                          flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group
                          ${selectedDate && isSameDay(event.date, selectedDate) ? 'bg-primary/10 border-l-2 border-primary' : ''}
                        `}
                        onClick={() => window.open(event.officialLink, '_blank')}
                      >
                        <div className={`p-2 rounded-lg ${eventTypeConfig[event.eventType].bg}`}>
                          <div className={eventTypeConfig[event.eventType].text}>
                            {eventTypeConfig[event.eventType].icon}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-foreground truncate">{event.examName}</div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{format(event.date, 'MMM d')}</span>
                            <span>•</span>
                            <span className={eventTypeConfig[event.eventType].text}>
                              {eventTypeConfig[event.eventType].label}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className={`p-1 rounded ${categoryColors[event.category].replace('from-', 'bg-').split(' ')[0]}`}>
                            {categoryIcons[event.category]}
                          </div>
                          <ExternalLink className="h-3 w-3 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ExamCalendarView;