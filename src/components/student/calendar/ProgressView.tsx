
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CalendarEvent } from './types';
import { format, isToday, isThisWeek, isThisMonth } from 'date-fns';

interface ProgressViewProps {
  events: CalendarEvent[];
  progressStats: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
}

export const ProgressView: React.FC<ProgressViewProps> = ({ events, progressStats }) => {
  const todayTasks = events.filter(event => isToday(event.date));
  const weekTasks = events.filter(event => isThisWeek(event.date));
  const monthTasks = events.filter(event => isThisMonth(event.date));

  const todayProgress = todayTasks.length > 0 
    ? Math.round((todayTasks.filter(t => t.completed).length / todayTasks.length) * 100) 
    : 0;

  const weekProgress = weekTasks.length > 0 
    ? Math.round((weekTasks.filter(t => t.completed).length / weekTasks.length) * 100) 
    : 0;

  const monthProgress = monthTasks.length > 0 
    ? Math.round((monthTasks.filter(t => t.completed).length / monthTasks.length) * 100) 
    : 0;

  return (
    <div className="space-y-6 p-4">
      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Overall Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Completion Rate</span>
                <span>{progressStats.completionRate}%</span>
              </div>
              <Progress value={progressStats.completionRate} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{progressStats.total}</div>
                <div className="text-sm text-gray-600">Total Tasks</div>
              </div>
              <div className="bg-green-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{progressStats.completed}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </div>
              <div className="bg-orange-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{progressStats.pending}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </div>
              <div className="bg-red-50 p-3 rounded-lg">
                <div className="text-2xl font-bold text-red-600">{progressStats.overdue}</div>
                <div className="text-sm text-gray-600">Overdue</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time-based Progress */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{todayTasks.filter(t => t.completed).length}/{todayTasks.length} tasks</span>
                <span>{todayProgress}%</span>
              </div>
              <Progress value={todayProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Week</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{weekTasks.filter(t => t.completed).length}/{weekTasks.length} tasks</span>
                <span>{weekProgress}%</span>
              </div>
              <Progress value={weekProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">This Month</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{monthTasks.filter(t => t.completed).length}/{monthTasks.length} tasks</span>
                <span>{monthProgress}%</span>
              </div>
              <Progress value={monthProgress} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {events
              .filter(event => isThisWeek(event.date))
              .sort((a, b) => b.date.getTime() - a.date.getTime())
              .slice(0, 5)
              .map((event) => (
                <div key={event.id} className="flex items-center justify-between p-2 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      event.completed ? 'bg-green-500' : 'bg-orange-500'
                    }`} />
                    <div>
                      <div className={`font-medium ${event.completed ? 'line-through text-gray-500' : ''}`}>
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-600">
                        {format(event.date, 'MMM d')} at {event.time}
                      </div>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    event.completed ? 'bg-green-100 text-green-800' : 'bg-orange-100 text-orange-800'
                  }`}>
                    {event.completed ? 'Completed' : 'Pending'}
                  </span>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
