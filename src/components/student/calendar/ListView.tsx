
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent, eventCategories } from './types';
import { format, isToday, isAfter, isBefore, startOfDay } from 'date-fns';
import { Search, Filter, Edit, Trash2, Clock, AlertCircle } from 'lucide-react';

interface ListViewProps {
  events: CalendarEvent[];
  onToggleTask: (eventId: string) => void;
  onEditEvent: (event: CalendarEvent) => void;
  onDeleteEvent: (eventId: string) => void;
}

export const ListView: React.FC<ListViewProps> = ({ 
  events, 
  onToggleTask, 
  onEditEvent, 
  onDeleteEvent 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('date');

  const getCategoryColor = (category: string): string => {
    const categoryDef = eventCategories.find(cat => cat.value === category);
    return categoryDef?.color || 'bg-gray-500';
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const filteredAndSortedEvents = events
    .filter(event => {
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           (event.description && event.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = filterCategory === 'all' || event.category === filterCategory;
      const matchesStatus = filterStatus === 'all' || 
                           (filterStatus === 'completed' && event.completed) ||
                           (filterStatus === 'pending' && !event.completed && !event.missed) ||
                           (filterStatus === 'overdue' && event.missed);
      
      return matchesSearch && matchesCategory && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.date.getTime() - b.date.getTime();
        case 'priority':
          const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
          return (priorityOrder[b.priority as keyof typeof priorityOrder] || 0) - 
                 (priorityOrder[a.priority as keyof typeof priorityOrder] || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const getDateLabel = (date: Date) => {
    if (isToday(date)) return 'Today';
    if (isAfter(date, startOfDay(new Date()))) return 'Upcoming';
    return 'Past';
  };

  const groupedEvents = filteredAndSortedEvents.reduce((groups, event) => {
    const label = getDateLabel(event.date);
    if (!groups[label]) groups[label] = [];
    groups[label].push(event);
    return groups;
  }, {} as Record<string, CalendarEvent[]>);

  return (
    <div className="space-y-6 p-4">
      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Filter className="h-5 w-5" />
            Task List
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {eventCategories.map((cat) => (
                  <SelectItem key={cat.value} value={cat.value}>
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${cat.color}`} />
                      {cat.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="date">Date</SelectItem>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="title">Title</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Task Groups */}
      {Object.entries(groupedEvents).map(([groupLabel, groupEvents]) => (
        <Card key={groupLabel}>
          <CardHeader>
            <CardTitle className="text-base">{groupLabel} ({groupEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {groupEvents.map((event) => (
                <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-gray-50 transition-colors">
                  <Checkbox
                    checked={event.completed}
                    onCheckedChange={() => onToggleTask(event.id)}
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`font-medium ${event.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {event.title}
                      </div>
                      {getPriorityIcon(event.priority)}
                    </div>
                    
                    {event.description && (
                      <div className="text-sm text-gray-600 mb-2">{event.description}</div>
                    )}
                    
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(event.date, 'MMM d, yyyy')} at {event.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <div className={`w-2 h-2 rounded-full ${getCategoryColor(event.category)}`} />
                        {eventCategories.find(cat => cat.value === event.category)?.label || event.category}
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-xs border ${
                        event.priority === 'urgent' ? 'bg-red-50 text-red-700 border-red-200' :
                        event.priority === 'high' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                        event.priority === 'medium' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                        'bg-green-50 text-green-700 border-green-200'
                      }`}>
                        {event.priority}
                      </span>
                    </div>
                  </div>

                  <div className={`w-4 h-4 rounded-full ${getCategoryColor(event.category)} flex-shrink-0`} />
                  
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEditEvent(event)}
                      className="h-8 w-8 p-0"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteEvent(event.id)}
                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {filteredAndSortedEvents.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <div className="text-gray-500">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-300" />
              <p>No tasks found matching your criteria.</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
