import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarPlus, CheckCircle2, Clock, MessageSquare, Plus, Users, Video } from 'lucide-react';
import {
  getSessionStatusClasses,
  mentorSessions,
  mentorStudents,
  MentorSession,
} from './mentorWorkspaceData';

type SessionFilter = 'all' | MentorSession['status'];

const defaultForm = {
  student: '',
  topic: '',
  date: '',
  time: '',
  duration: '45 min',
  type: 'one-on-one' as MentorSession['type'],
  notes: '',
};

const SessionScheduling = () => {
  const [sessions, setSessions] = useState<MentorSession[]>(mentorSessions);
  const [filter, setFilter] = useState<SessionFilter>('all');
  const [form, setForm] = useState(defaultForm);
  const [showForm, setShowForm] = useState(false);

  const filteredSessions = useMemo(() => {
    if (filter === 'all') return sessions;
    return sessions.filter(session => session.status === filter);
  }, [filter, sessions]);

  const selectedStudent = mentorStudents.find(student => student.name === form.student);

  const updateForm = (field: keyof typeof form, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleCreateSession = () => {
    if (!form.student || !form.topic || !form.date || !form.time) return;

    const nextSession: MentorSession = {
      id: Date.now(),
      student: form.student,
      exam: selectedStudent?.exam || 'General',
      topic: form.topic,
      date: form.date,
      time: form.time,
      duration: form.duration,
      type: form.type,
      status: 'confirmed',
      notes: form.notes || 'No notes added.',
    };

    setSessions(prev => [nextSession, ...prev]);
    setForm(defaultForm);
    setShowForm(false);
  };

  const stats = [
    { label: 'Confirmed', value: sessions.filter(s => s.status === 'confirmed').length, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending', value: sessions.filter(s => s.status === 'pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Group Sessions', value: sessions.filter(s => s.type === 'group').length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Hours', value: Math.round(sessions.length * 0.8), icon: Video, color: 'text-violet-600', bg: 'bg-violet-50' },
  ];

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Session Scheduling</h1>
          <p className="text-sm text-slate-600 mt-1">Plan mentor calls, review sessions, and batch discussions</p>
        </div>
        <div className="flex gap-2">
          <Select value={filter} onValueChange={(value) => setFilter(value as SessionFilter)}>
            <SelectTrigger className="w-40 bg-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All sessions</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => setShowForm(prev => !prev)} className="gap-2">
            <Plus className="h-4 w-4" />
            New Session
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map(({ label, value, icon: Icon, color, bg }) => (
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

      {showForm && (
        <Card className="p-5 border-emerald-200">
          <div className="flex items-center gap-2 mb-4">
            <CalendarPlus className="h-5 w-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-slate-900">Create Session</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Student</label>
              <Select value={form.student} onValueChange={(value) => updateForm('student', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select student" />
                </SelectTrigger>
                <SelectContent>
                  {mentorStudents.map(student => (
                    <SelectItem key={student.id} value={student.name}>
                      {student.name} - {student.exam}
                    </SelectItem>
                  ))}
                  <SelectItem value="Group Batch A">Group Batch A - Banking Exams</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Session Type</label>
              <Select value={form.type} onValueChange={(value) => updateForm('type', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="one-on-one">One-on-one</SelectItem>
                  <SelectItem value="doubt-clearing">Doubt clearing</SelectItem>
                  <SelectItem value="review">Review</SelectItem>
                  <SelectItem value="group">Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Date</label>
              <Input type="date" value={form.date} onChange={(event) => updateForm('date', event.target.value)} />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Time</label>
              <Input type="time" value={form.time} onChange={(event) => updateForm('time', event.target.value)} />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Topic</label>
              <Input value={form.topic} onChange={(event) => updateForm('topic', event.target.value)} placeholder="Mock review, study plan, doubt clearing" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 mb-2 block">Duration</label>
              <Select value={form.duration} onValueChange={(value) => updateForm('duration', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30 min">30 min</SelectItem>
                  <SelectItem value="45 min">45 min</SelectItem>
                  <SelectItem value="60 min">60 min</SelectItem>
                  <SelectItem value="75 min">75 min</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2 xl:col-span-4">
              <label className="text-sm font-medium text-slate-700 mb-2 block">Notes</label>
              <Textarea rows={3} value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} placeholder="Agenda, prep notes, or follow-up points" />
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-5">
            <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button onClick={handleCreateSession} disabled={!form.student || !form.topic || !form.date || !form.time}>
              Schedule Session
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Upcoming Sessions</h2>
            <Badge variant="outline">{filteredSessions.length} shown</Badge>
          </div>
          <div className="space-y-3">
            {filteredSessions.map(session => {
              const student = mentorStudents.find(item => item.name === session.student);

              return (
                <div key={session.id} className="rounded-xl border border-slate-200 bg-white p-4">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <Avatar className="h-11 w-11">
                        <AvatarFallback className="bg-blue-50 text-blue-700 font-semibold">
                          {student?.initials || session.student.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-semibold text-slate-900">{session.student}</h3>
                          <Badge className={getSessionStatusClasses(session.status)}>{session.status}</Badge>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{session.topic}</p>
                        <p className="text-xs text-slate-500 mt-1">{session.exam} - {session.type}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Date</p>
                        <p className="font-semibold text-slate-800">{session.date}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Time</p>
                        <p className="font-semibold text-slate-800">{session.time}</p>
                      </div>
                      <div className="rounded-lg bg-slate-50 px-3 py-2">
                        <p className="text-xs text-slate-500">Duration</p>
                        <p className="font-semibold text-slate-800">{session.duration}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-600">{session.notes}</p>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="gap-1.5">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Message
                      </Button>
                      <Button size="sm" className="gap-1.5">
                        <Video className="h-3.5 w-3.5" />
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Preparation Checklist</h2>
          <div className="space-y-3">
            {[
              'Review latest mock scores',
              'Attach practice set links',
              'Prepare weak topic notes',
              'Send reminder 30 minutes before session',
            ].map((item, index) => (
              <div key={item} className="flex items-start gap-3 rounded-xl border border-slate-200 p-3">
                <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center text-xs font-bold ${index < 2 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  {index + 1}
                </div>
                <p className="text-sm text-slate-700">{item}</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default SessionScheduling;
