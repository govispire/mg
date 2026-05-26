import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Flame,
  MessageSquare,
  Target,
  TrendingUp,
} from 'lucide-react';
import {
  getRiskClasses,
  mentorAlerts,
  mentorStudents,
  subjectPerformance,
  weeklyAnalytics,
} from './mentorWorkspaceData';

type ProgressFilter = 'all' | 'excellent' | 'on-track' | 'needs-attention';

const statusLabels: Record<ProgressFilter, string> = {
  all: 'All students',
  excellent: 'Excellent',
  'on-track': 'On track',
  'needs-attention': 'Needs attention',
};

const ProgressTracking = () => {
  const [filter, setFilter] = useState<ProgressFilter>('all');

  const filteredStudents = useMemo(() => {
    if (filter === 'all') return mentorStudents;
    return mentorStudents.filter(student => student.status === filter);
  }, [filter]);

  const averageProgress = Math.round(
    mentorStudents.reduce((sum, student) => sum + student.progress, 0) / mentorStudents.length
  );
  const averageAttendance = Math.round(
    mentorStudents.reduce((sum, student) => sum + student.attendance, 0) / mentorStudents.length
  );
  const taskCompletion = Math.round(
    (mentorStudents.reduce((sum, student) => sum + student.tasksCompleted, 0) /
      mentorStudents.reduce((sum, student) => sum + student.totalTasks, 0)) * 100
  );
  const attentionCount = mentorStudents.filter(student => student.risk !== 'low').length;

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Progress Tracking</h1>
          <p className="text-sm text-slate-600 mt-1">Student outcomes, risks, and next mentor actions</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value) => setFilter(value as ProgressFilter)}>
            <SelectTrigger className="w-44 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(statusLabels).map(([value, label]) => (
                <SelectItem key={value} value={value}>{label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button className="gap-2">
            <Target className="h-4 w-4" />
            Assign Fix
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Average Progress', value: `${averageProgress}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Task Completion', value: `${taskCompletion}%`, icon: CheckCircle2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Attendance', value: `${averageAttendance}%`, icon: ArrowUpRight, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Need Attention', value: attentionCount, icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
              </div>
              <div className={`h-11 w-11 rounded-xl ${bg} flex items-center justify-center`}>
                <Icon className={`h-5 w-5 ${color}`} />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 2xl:grid-cols-3 gap-6">
        <Card className="p-5 2xl:col-span-2">
          <div className="flex items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Student Progress Board</h2>
              <p className="text-xs text-slate-500">{filteredStudents.length} records shown</p>
            </div>
            <Badge variant="outline" className="bg-white">{statusLabels[filter]}</Badge>
          </div>

          <div className="space-y-3">
            {filteredStudents.map(student => {
              const taskPct = Math.round((student.tasksCompleted / student.totalTasks) * 100);

              return (
                <div key={student.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-3 min-w-0 lg:w-64">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-emerald-50 text-emerald-700 font-semibold">
                          {student.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 truncate">{student.name}</h3>
                        <p className="text-xs text-slate-500">{student.exam} - {student.lastActive}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Progress</span>
                          <span className="font-semibold">{student.progress}%</span>
                        </div>
                        <Progress value={student.progress} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Tasks</span>
                          <span className="font-semibold">{student.tasksCompleted}/{student.totalTasks}</span>
                        </div>
                        <Progress value={taskPct} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Attendance</span>
                          <span className="font-semibold">{student.attendance}%</span>
                        </div>
                        <Progress value={student.attendance} className="h-2" />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                      <Badge className={`capitalize border ${getRiskClasses(student.risk)}`}>
                        {student.risk} risk
                      </Badge>
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Check in
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4 text-xs">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-slate-500">Weak area</p>
                      <p className="font-semibold text-slate-800 mt-1">{student.weakArea}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-slate-500">Strong area</p>
                      <p className="font-semibold text-slate-800 mt-1">{student.strongArea}</p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-slate-500">Next session</p>
                      <p className="font-semibold text-slate-800 mt-1">{student.nextSession}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Intervention Queue</h2>
            <div className="space-y-3">
              {mentorAlerts.map(alert => (
                <div key={`${alert.student}-${alert.issue}`} className="rounded-xl border border-slate-200 p-3 bg-white">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-sm text-slate-900">{alert.student}</p>
                      <p className="text-xs text-slate-600 mt-1">{alert.issue}</p>
                    </div>
                    <Badge className={`capitalize border ${getRiskClasses(alert.severity === 'high' ? 'high' : 'medium')}`}>
                      {alert.severity}
                    </Badge>
                  </div>
                  <Button variant="outline" size="sm" className="mt-3 w-full justify-start">
                    {alert.action}
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Subject Health</h2>
            <div className="space-y-3">
              {subjectPerformance.map(item => (
                <div key={item.subject}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{item.subject}</span>
                    <span className={item.trend.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}>
                      {item.score}% ({item.trend})
                    </span>
                  </div>
                  <Progress value={item.score} className="h-2" />
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-slate-900">Weekly Momentum</h2>
          <Badge variant="outline" className="gap-1.5">
            <Flame className="h-3.5 w-3.5 text-orange-500" />
            Best score: {Math.max(...weeklyAnalytics.map(day => day.score))}%
          </Badge>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {weeklyAnalytics.map(day => (
            <div key={day.label} className="rounded-xl border border-slate-200 p-3 bg-white">
              <p className="text-xs font-semibold text-slate-500">{day.label}</p>
              <div className="h-24 flex items-end gap-1 mt-3">
                <div className="flex-1 rounded-t bg-emerald-500" style={{ height: `${day.score}%` }} />
                <div className="flex-1 rounded-t bg-blue-400" style={{ height: `${Math.min(day.tasks * 3, 100)}%` }} />
                <div className="flex-1 rounded-t bg-violet-400" style={{ height: `${day.sessions * 14}%` }} />
              </div>
              <p className="text-xs text-slate-500 mt-2">{day.sessions} sessions, {day.tasks} tasks</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default ProgressTracking;
