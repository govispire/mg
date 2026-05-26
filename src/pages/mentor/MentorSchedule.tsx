import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  CalendarDays,
  CheckCircle2,
  Clock,
  Coffee,
  Settings2,
  Users,
  Video,
  X,
} from 'lucide-react';
import { availabilitySlots, getSessionStatusClasses, mentorSessions } from './mentorWorkspaceData';

const MentorSchedule = () => {
  const [activeDay, setActiveDay] = useState(availabilitySlots[0].day);
  const [blockedSlots, setBlockedSlots] = useState<string[]>(['Tue-5:00 PM', 'Fri-12:00 PM']);

  const selectedDay = availabilitySlots.find(day => day.day === activeDay) || availabilitySlots[0];
  const totalSlots = availabilitySlots.reduce((sum, day) => sum + day.slots.length, 0);
  const totalBooked = availabilitySlots.reduce((sum, day) => sum + day.booked, 0);
  const openSlots = totalSlots - totalBooked - blockedSlots.length;
  const workloadPct = Math.round((totalBooked / totalSlots) * 100);

  const todaySessions = useMemo(
    () => mentorSessions.filter(session => session.date === 'Today'),
    []
  );

  const toggleBlocked = (slot: string) => {
    const key = `${activeDay}-${slot}`;
    setBlockedSlots(prev =>
      prev.includes(key) ? prev.filter(item => item !== key) : [...prev, key]
    );
  };

  const isBlocked = (slot: string) => blockedSlots.includes(`${activeDay}-${slot}`);

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Schedule</h1>
          <p className="text-sm text-slate-600 mt-1">Availability, agenda, and mentoring load</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Settings2 className="h-4 w-4" />
            Availability Rules
          </Button>
          <Button className="gap-2">
            <CalendarDays className="h-4 w-4" />
            Sync Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[
          { label: 'Booked Sessions', value: totalBooked, icon: Video, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Open Slots', value: openSlots, icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Blocked Slots', value: blockedSlots.length, icon: X, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Students Today', value: todaySessions.length, icon: Users, color: 'text-violet-600', bg: 'bg-violet-50' },
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

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-5 xl:col-span-2">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Weekly Availability</h2>
              <p className="text-xs text-slate-500">Tap a slot to block or reopen it</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {availabilitySlots.map(day => (
                <Button
                  key={day.day}
                  size="sm"
                  variant={activeDay === day.day ? 'default' : 'outline'}
                  onClick={() => setActiveDay(day.day)}
                >
                  {day.day}
                </Button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-5">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-semibold text-slate-500 uppercase">Selected day</p>
              <p className="text-3xl font-bold text-slate-900 mt-2">{selectedDay.day}</p>
              <div className="mt-4 space-y-3">
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">Booked load</span>
                    <span className="font-semibold">{selectedDay.booked}/{selectedDay.slots.length}</span>
                  </div>
                  <Progress value={(selectedDay.booked / selectedDay.slots.length) * 100} className="h-2" />
                </div>
                <div className="rounded-lg bg-white p-3 border border-slate-200">
                  <p className="text-xs text-slate-500">Recommended buffer</p>
                  <p className="font-semibold text-slate-900 mt-1">15 min between calls</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {selectedDay.slots.map((slot, index) => {
                const blocked = isBlocked(slot);
                const booked = index < selectedDay.booked && !blocked;

                return (
                  <button
                    key={slot}
                    onClick={() => toggleBlocked(slot)}
                    className={`text-left rounded-xl border p-4 transition-colors ${
                      blocked
                        ? 'border-red-200 bg-red-50'
                        : booked
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-emerald-200 bg-emerald-50 hover:bg-emerald-100'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-slate-900">{slot}</p>
                      {blocked ? (
                        <X className="h-4 w-4 text-red-600" />
                      ) : booked ? (
                        <Video className="h-4 w-4 text-blue-600" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 mt-2">
                      {blocked ? 'Blocked' : booked ? 'Booked' : 'Available'}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Load Balance</h2>
          <div className="rounded-xl border border-slate-200 p-4 bg-white mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-600">Weekly load</span>
              <span className="font-semibold text-slate-900">{workloadPct}%</span>
            </div>
            <Progress value={workloadPct} className="h-2" />
          </div>
          <div className="space-y-3">
            {availabilitySlots.map(day => (
              <div key={day.day} className="flex items-center gap-3">
                <span className="w-8 text-xs font-semibold text-slate-500">{day.day}</span>
                <div className="flex-1 h-2 rounded-full bg-slate-100 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500"
                    style={{ width: `${(day.booked / day.slots.length) * 100}%` }}
                  />
                </div>
                <span className="text-xs text-slate-500">{day.booked}/{day.slots.length}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <Card className="p-5 xl:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">Today's Agenda</h2>
            <Badge variant="outline">{todaySessions.length} sessions</Badge>
          </div>
          <div className="space-y-3">
            {todaySessions.map(session => (
              <div key={session.id} className="flex flex-col gap-3 rounded-xl border border-slate-200 p-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-semibold text-slate-900">{session.student}</h3>
                    <Badge className={getSessionStatusClasses(session.status)}>{session.status}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{session.topic}</p>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span className="font-semibold text-slate-900">{session.time}</span>
                  <span className="text-slate-500">{session.duration}</span>
                  <Button size="sm" className="gap-1.5">
                    <Video className="h-3.5 w-3.5" />
                    Join
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-5">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Focus Blocks</h2>
          <div className="space-y-3">
            {[
              { label: 'Student feedback notes', time: '12:30 PM', icon: CheckCircle2 },
              { label: 'Lunch break', time: '1:15 PM', icon: Coffee },
              { label: 'Mock analysis prep', time: '5:15 PM', icon: Clock },
            ].map(({ label, time, icon: Icon }) => (
              <div key={label} className="flex items-center gap-3 rounded-xl border border-slate-200 p-3">
                <div className="h-9 w-9 rounded-lg bg-slate-100 flex items-center justify-center">
                  <Icon className="h-4 w-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{label}</p>
                  <p className="text-xs text-slate-500">{time}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MentorSchedule;
