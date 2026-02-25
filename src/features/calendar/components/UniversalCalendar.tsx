
import React, { useState, useMemo } from 'react';
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, subMonths, isSameDay, isToday, isSameMonth } from 'date-fns';
import { ChevronLeft, ChevronRight, Plus, Menu, Edit, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { CalendarGrid } from '@/components/student/calendar/CalendarGrid';
import { CalendarSidebar } from '@/components/student/calendar/CalendarSidebar';
import { EventDialog } from '@/components/student/calendar/EventDialog';
import { DayDetailDialog } from '@/components/student/calendar/DayDetailDialog';
import { ProgressView } from '@/components/student/calendar/ProgressView';
import { ListView } from '@/components/student/calendar/ListView';
import { CalendarEvent, CalendarDay, ViewType, eventCategories, UserRole } from '@/components/student/calendar/types';
import { useCalendarTaskManager } from '@/hooks/useCalendarTaskManager';

interface UniversalCalendarProps {
  userRole: UserRole;
  initialEvents?: CalendarEvent[];
}

const UniversalCalendar: React.FC<UniversalCalendarProps> = ({ userRole, initialEvents = [] }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [eventFilters, setEventFilters] = useState<string[]>(['all']);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [dayDetailOpen, setDayDetailOpen] = useState(false);
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | null>(null);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isMobile = useIsMobile();

  // Use the new task manager hook
  const { 
    events, 
    addEvent, 
    updateEvent, 
    deleteEvent, 
    toggleTask, 
    getProgressStats 
  } = useCalendarTaskManager(initialEvents);

  const progressStats = getProgressStats();

  // Filter categories based on user role
  const availableCategories = eventCategories.filter(cat => 
    Array.isArray(cat.roles) && (cat.roles.includes(userRole))
  );

  // Get role-specific description
  const getRoleDescription = () => {
    switch (userRole) {
      case 'admin':
        return 'Manage system tasks and assign work to team members';
      case 'mentor':
        return 'Guide students and track their progress';
      case 'student':
        return 'Click any day to add tasks. Track your progress in real-time.';
      case 'employee':
        return 'Manage content uploads, approvals, and quality reviews';
      case 'super-admin':
        return 'Oversee system administration and platform management';
      case 'owner':
        return 'Manage business operations and strategic planning';
      case 'instructor':
        return 'Create curriculum and manage teaching activities';
      default:
        return 'Manage your schedule and track your tasks';
    }
  };

  // Generate calendar days
  const calendarDays: CalendarDay[] = useMemo(() => {
    const start = startOfWeek(startOfMonth(currentDate));
    const end = endOfWeek(endOfMonth(currentDate));
    const days = eachDayOfInterval({ start, end });

    return days.map(date => {
      const dayEvents = events.filter(event => 
        isSameDay(event.date, date) && 
        (eventFilters.includes('all') || eventFilters.includes(event.category))
      );

      return {
        date,
        isCurrentMonth: isSameMonth(date, currentDate),
        isToday: isToday(date),
        isSelected: selectedDate ? isSameDay(date, selectedDate) : false,
        events: dayEvents
      };
    });
  }, [currentDate, events, eventFilters, selectedDate]);

  // Get events for selected date
  const selectedDateEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => isSameDay(event.date, selectedDate));
  }, [events, selectedDate]);

  // Get today's events for sidebar
  const todayEvents = useMemo(() => {
    if (!selectedDate) return [];
    return events.filter(event => 
      isSameDay(event.date, selectedDate) && 
      (eventFilters.includes('all') || eventFilters.includes(event.category))
    );
  }, [events, selectedDate, eventFilters]);

  // Navigation handlers
  const handlePrevMonth = () => setCurrentDate(prev => subMonths(prev, 1));
  const handleNextMonth = () => setCurrentDate(prev => addMonths(prev, 1));
  const handleToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  // Event handlers - Direct day click opens task creation
  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    setSelectedDateForEvent(date);
    setEditingEvent(null);
    setEventDialogOpen(true);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const handleAddEvent = (date: Date) => {
    setEditingEvent(null);
    setSelectedDateForEvent(date);
    setEventDialogOpen(true);
  };

  const handleEditEvent = (event: CalendarEvent) => {
    setEditingEvent(event);
    setSelectedDateForEvent(event.date);
    setEventDialogOpen(true);
  };

  const handleDeleteEvent = (eventId: string) => {
    deleteEvent(eventId);
  };

  const handleAddImage = (date: Date) => {
    setSelectedDateForEvent(date);
    setEventDialogOpen(true);
  };

  const handleViewDay = (date: Date) => {
    setSelectedDate(date);
    setDayDetailOpen(true);
  };

  const handleSaveEvent = (eventData: Omit<CalendarEvent, 'id'>) => {
    if (editingEvent) {
      updateEvent(editingEvent.id, eventData);
    } else {
      addEvent({
        ...eventData,
        assignedBy: userRole
      });
    }
  };

  const handleToggleTask = (eventId: string) => {
    toggleTask(eventId);
  };

  const handleFilterChange = (filters: string[]) => {
    setEventFilters(filters);
  };

  const handleSidebarDateSelect = (date: Date | null) => {
    setSelectedDate(date);
  };

  // Filter events based on role, status, priority, date range, and search query
  const roleFilter: UserRole | 'all' = 'all'; // Example role filter
  const statusFilter = 'all'; // Example status filter
  const priorityFilter = 'all'; // Example priority filter
  const dateRange = { start: new Date(), end: new Date() }; // Example date range
  const searchQuery = ''; // Example search query
  const filteredEvents = useMemo(() => {
    let filtered = events;
    
    if (roleFilter !== 'all') {
      filtered = filtered.filter(event => 
        event.assignedTo === roleFilter || event.assignedBy === roleFilter
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(event => event.status === statusFilter);
    }

    if (priorityFilter !== 'all') {
      filtered = filtered.filter(event => event.priority === priorityFilter);
    }

    if (dateRange.start && dateRange.end) {
      filtered = filtered.filter(event => 
        isSameDay(event.date, dateRange.start) || 
        isSameDay(event.date, dateRange.end) || 
        (event.date >= dateRange.start && event.date <= dateRange.end)
      );
    }

    if (searchQuery.trim()) {
      filtered = filtered.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return filtered;
  }, [events, roleFilter, statusFilter, priorityFilter, dateRange, searchQuery]);

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-6">
      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Calendar/Views - Left Side */}
        <div className="lg:col-span-8">
          <Card>
            {viewType === 'month' && (
              <>
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">
                      {format(currentDate, 'MMMM yyyy')}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm" onClick={handleToday}>
                        Today
                      </Button>
                      <Button variant="outline" size="icon" onClick={handlePrevMonth}>
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="icon" onClick={handleNextMonth}>
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <CalendarGrid
                    days={calendarDays}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    onAddEvent={handleAddEvent}
                    onAddImage={handleAddImage}
                    onViewDay={handleViewDay}
                  />
                </CardContent>
              </>
            )}
            
            {viewType === 'progress' && (
              <CardContent className="p-0">
                <ProgressView 
                  events={events} 
                  progressStats={progressStats}
                />
              </CardContent>
            )}
            
            {viewType === 'list' && (
              <CardContent className="p-0">
                <ListView 
                  events={events}
                  onToggleTask={handleToggleTask}
                  onEditEvent={handleEditEvent}
                  onDeleteEvent={handleDeleteEvent}
                />
              </CardContent>
            )}
          </Card>
        </div>

        {/* Event Filter Sidebar & Upcoming Events - Right Side */}
        <div className="lg:col-span-4 space-y-6">
          {/* Mobile Filter Sheet */}
          {isMobile && (
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="w-full">
                  <Menu className="h-4 w-4 mr-2" />
                  Event Filters & Upcoming Tasks
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[380px] overflow-y-auto">
                <div className="py-4">
                  <CalendarSidebar
                    selectedDate={selectedDate}
                    onDateSelect={handleSidebarDateSelect}
                    eventFilters={eventFilters}
                    onFilterChange={handleFilterChange}
                    todayEvents={todayEvents}
                    onToggleTask={handleToggleTask}
                    userRole={userRole}
                  />
                </div>
              </SheetContent>
            </Sheet>
          )}

          {/* Desktop Sidebar */}
          {!isMobile && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Event Filters & Upcoming</CardTitle>
              </CardHeader>
              <CardContent className="p-4">
                <CalendarSidebar
                  selectedDate={selectedDate}
                  onDateSelect={handleSidebarDateSelect}
                  eventFilters={eventFilters}
                  onFilterChange={handleFilterChange}
                  todayEvents={todayEvents}
                  onToggleTask={handleToggleTask}
                  userRole={userRole}
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Floating Add Button for Mobile */}
      {isMobile && (
        <Button
          onClick={() => handleAddEvent(selectedDate || new Date())}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-primary hover:bg-brand-darkteal shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      )}

      {/* Dialogs */}
      <EventDialog
        open={eventDialogOpen}
        onOpenChange={setEventDialogOpen}
        selectedDate={selectedDateForEvent}
        event={editingEvent}
        onSave={handleSaveEvent}
        userRole={userRole}
        availableCategories={availableCategories}
      />

      <DayDetailDialog
        open={dayDetailOpen}
        onOpenChange={setDayDetailOpen}
        date={selectedDate}
        events={selectedDateEvents}
        onAddTask={() => {
          setDayDetailOpen(false);
          handleAddEvent(selectedDate || new Date());
        }}
        onAddImage={() => {
          setDayDetailOpen(false);
          handleAddImage(selectedDate || new Date());
        }}
        onToggleTask={handleToggleTask}
        onEditTask={handleEditEvent}
        onDeleteTask={handleDeleteEvent}
      />
    </div>
  );
};

export default UniversalCalendar;
