import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  ArrowUpRight,
  BarChart2,
  CalendarCheck,
  Download,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';
import {
  mentorAlerts,
  mentorSessions,
  mentorStudents,
  subjectPerformance,
  weeklyAnalytics,
} from './mentorWorkspaceData';

const MentorAnalytics = () => {
  const avgScore = Math.round(
    mentorStudents.reduce((sum, student) => sum + student.avgScore, 0) / mentorStudents.length
  );
  const avgProgress = Math.round(
    mentorStudents.reduce((sum, student) => sum + student.progress, 0) / mentorStudents.length
  );
  const sessionCompletion = Math.round(
    (mentorSessions.filter(session => session.status !== 'pending').length / mentorSessions.length) * 100
  );
  const taskCompletion = Math.round(
    (mentorStudents.reduce((sum, student) => sum + student.tasksCompleted, 0) /
      mentorStudents.reduce((sum, student) => sum + student.totalTasks, 0)) * 100
  );

  const riskDistribution = [
    { label: 'Low risk', count: mentorStudents.filter(student => student.risk === 'low').length, color: 'bg-emerald-500' },
    { label: 'Medium risk', count: mentorStudents.filter(student => student.risk === 'medium').length, color: 'bg-amber-500' },
    { label: 'High risk', count: mentorStudents.filter(student => student.risk === 'high').length, color: 'bg-red-500' },
  ];

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-sm text-slate-600 mt-1">Mentoring effectiveness across students, sessions, and tasks</p>
        </div>
        <Button variant="outline" className="gap-2">
          <Download className="h-4 w-4" />
          Export Report
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Student Progress', value: `${avgProgress}%`, delta: '+7%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Average Score', value: `${avgScore}%`, delta: '+5%', icon: BarChart2, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Session Completion', value: `${sessionCompletion}%`, delta: '+3%', icon: CalendarCheck, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Task Completion', value: `${taskCompletion}%`, delta: '+9%', icon: Target, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(({ label, value, delta, icon: Icon, color, bg }) => (
          <Card key={label} className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500">{label}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{value}</p>
                <p className="text-xs text-emerald-600 font-semibold mt-2 flex items-center gap-1">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  {delta} this week
                </p>
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
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Weekly Performance Trend</h2>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" /> Score</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-blue-400" /> Tasks</span>
              <span className="inline-flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-violet-400" /> Sessions</span>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
            {weeklyAnalytics.map(day => (
              <div key={day.label} className="rounded-xl border border-slate-200 p-3 bg-white">
                <p className="text-xs font-semibold text-slate-500">{day.label}</p>
                <div className="h-36 flex items-end gap-1 mt-3">
                  <div className="flex-1 rounded-t bg-emerald-500" style={{ height: `${day.score}%` }} />
                  <div className="flex-1 rounded-t bg-blue-400" style={{ height: `${Math.min(day.tasks * 3, 100)}%` }} />
                  <div className="flex-1 rounded-t bg-violet-400" style={{ height: `${day.sessions * 14}%` }} />
                </div>
                <p className="text-xs text-slate-500 mt-2">{day.score}% avg score</p>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Cohort Risk</h2>
          <div className="space-y-4">
            {riskDistribution.map(item => {
              const pct = Math.round((item.count / mentorStudents.length) * 100);

              return (
                <div key={item.label}>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-medium text-slate-700">{item.label}</span>
                    <span className="text-slate-500">{item.count} students</span>
                  </div>
                  <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                    <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 mt-5">
            <div className="flex items-center gap-2 text-amber-700 font-semibold text-sm">
              <AlertTriangle className="h-4 w-4" />
              {mentorAlerts.length} active interventions
            </div>
            <p className="text-xs text-amber-700 mt-2">Highest priority: {mentorAlerts[0]?.student} - {mentorAlerts[0]?.action}</p>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Subject Impact</h2>
          <div className="space-y-4">
            {subjectPerformance.map(subject => (
              <div key={subject.subject}>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-sm text-slate-900">{subject.subject}</p>
                    <p className={`text-xs ${subject.trend.startsWith('-') ? 'text-red-600' : 'text-emerald-600'}`}>
                      {subject.trend} trend
                    </p>
                  </div>
                  <span className="text-sm font-bold text-slate-900">{subject.score}%</span>
                </div>
                <Progress value={subject.score} className="h-2" />
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Student Outcomes</h2>
            <Badge variant="outline" className="gap-1.5">
              <Users className="h-3.5 w-3.5" />
              {mentorStudents.length} students
            </Badge>
          </div>
          <div className="space-y-3">
            {mentorStudents.map(student => (
              <div key={student.id} className="grid grid-cols-1 md:grid-cols-[1fr_90px_90px_90px] gap-3 rounded-xl border border-slate-200 p-3">
                <div>
                  <p className="font-semibold text-sm text-slate-900">{student.name}</p>
                  <p className="text-xs text-slate-500">{student.exam} - weak area: {student.weakArea}</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Progress</p>
                  <p className="font-bold text-slate-900">{student.progress}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Score</p>
                  <p className="font-bold text-slate-900">{student.avgScore}%</p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Streak</p>
                  <p className="font-bold text-slate-900">{student.streak}d</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MentorAnalytics;
