import React, { useState } from 'react';
import {
  Users, UserCheck, AlertTriangle, Shuffle, ChevronDown, ChevronUp,
  Search, CheckCircle2, Clock, Flame, Star, ArrowRight,
} from 'lucide-react';
import { mentorPool, type MentorProfile } from '@/data/mentorshipExamData';
import { languageOptions } from '@/data/mentorshipExamData';

// ─── Mock waiting students ────────────────────────────────────────────────────

interface WaitingStudent {
  id: string;
  name: string;
  avatar: string;
  exam: string;
  stage: string;
  language: string;
  category: string;
  waitingSince: string;
}

const waitingStudents: WaitingStudent[] = [
  { id: 'ws1', name: 'Murugan S.', avatar: 'https://i.pravatar.cc/40?u=muru', exam: 'TNPSC Group 2', stage: 'prelims', language: 'tamil', category: 'tnpsc', waitingSince: '2h ago' },
  { id: 'ws2', name: 'Lakshmi T.', avatar: 'https://i.pravatar.cc/40?u=laks', exam: 'SBI Clerk', stage: 'prelims', language: 'telugu', category: 'banking', waitingSince: '4h ago' },
  { id: 'ws3', name: 'Ravi K.', avatar: 'https://i.pravatar.cc/40?u=ravi2', exam: 'SSC CGL', stage: 'mains', language: 'hindi', category: 'ssc', waitingSince: '5h ago' },
  { id: 'ws4', name: 'Sunita P.', avatar: 'https://i.pravatar.cc/40?u=sunita', exam: 'IBPS PO', stage: 'prelims', language: 'hindi', category: 'banking', waitingSince: '6h ago' },
  { id: 'ws5', name: 'Arun B.', avatar: 'https://i.pravatar.cc/40?u=arun2', exam: 'UPSC CSE', stage: 'mains', language: 'english', category: 'upsc', waitingSince: '8h ago' },
];

// ─── Capacity indicator bar ───────────────────────────────────────────────────

const CapacityBar = ({ current, max }: { current: number; max: number }) => {
  const pct = Math.round((current / max) * 100);
  return (
    <div className="flex items-center gap-2 flex-1">
      <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${pct >= 90 ? 'bg-red-500' : pct >= 70 ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`text-xs font-semibold flex-shrink-0 ${pct >= 90 ? 'text-red-600' : pct >= 70 ? 'text-yellow-600' : 'text-green-600'}`}>
        {current}/{max}
      </span>
    </div>
  );
};

// ─── Find best mentor for student ─────────────────────────────────────────────

function getBestMentor(student: WaitingStudent, mentors: MentorProfile[]): MentorProfile | null {
  const available = mentors.filter(m => m.studentCount < m.maxStudents);
  const exact = available.filter(m =>
    m.languages.includes(student.language) &&
    m.stages.includes(student.stage) &&
    m.categories.includes(student.category)
  );
  if (exact.length) return exact.sort((a, b) => a.studentCount - b.studentCount)[0];
  const langStage = available.filter(m => m.languages.includes(student.language) && m.stages.includes(student.stage));
  if (langStage.length) return langStage.sort((a, b) => a.studentCount - b.studentCount)[0];
  const langOnly = available.filter(m => m.languages.includes(student.language));
  if (langOnly.length) return langOnly.sort((a, b) => a.studentCount - b.studentCount)[0];
  return available[0] ?? null;
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const MentorAllocation: React.FC = () => {
  const [mentors, setMentors] = useState<MentorProfile[]>(mentorPool);
  const [waiting, setWaiting] = useState<WaitingStudent[]>(waitingStudents);
  const [assigned, setAssigned] = useState<{ student: WaitingStudent; mentor: MentorProfile }[]>([]);
  const [searchMentor, setSearchMentor] = useState('');
  const [expandedMentor, setExpandedMentor] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'waiting' | 'mentors'>('overview');

  const handleAutoAssign = (student: WaitingStudent) => {
    const mentor = getBestMentor(student, mentors);
    if (!mentor) return alert('No available mentor found!');
    setMentors(prev => prev.map(m => m.id === mentor.id ? { ...m, studentCount: m.studentCount + 1 } : m));
    setWaiting(prev => prev.filter(s => s.id !== student.id));
    setAssigned(prev => [...prev, { student, mentor }]);
  };

  const handleAutoAssignAll = () => {
    waiting.forEach(s => handleAutoAssign(s));
  };

  const filteredMentors = mentors.filter(m =>
    searchMentor === '' ||
    m.name.toLowerCase().includes(searchMentor.toLowerCase()) ||
    m.expertise.some(e => e.toLowerCase().includes(searchMentor.toLowerCase()))
  );

  // Summary stats
  const totalCapacity = mentors.reduce((s, m) => s + m.maxStudents, 0);
  const usedCapacity = mentors.reduce((s, m) => s + m.studentCount, 0);
  const fullMentors = mentors.filter(m => m.studentCount >= m.maxStudents).length;
  const availableMentors = mentors.filter(m => m.studentCount < m.maxStudents).length;

  return (
    <div className="w-full px-4 lg:px-6 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mentor Allocation</h1>
          <p className="text-sm text-gray-500 mt-1">Auto-assign waiting students to mentors based on language, stage, and capacity</p>
        </div>
        {waiting.length > 0 && (
          <button
            onClick={handleAutoAssignAll}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-xl font-semibold text-sm transition-all shadow-md"
          >
            <Shuffle className="w-4 h-4" />
            Auto-Assign All ({waiting.length})
          </button>
        )}
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total Mentors', value: mentors.length, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Available', value: availableMentors, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Waiting Students', value: waiting.length, icon: Clock, color: 'text-orange-500', bg: 'bg-orange-50' },
          { label: 'Full Mentors', value: fullMentors, icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50' },
        ].map(s => {
          const Icon = s.icon;
          return (
            <div key={s.label} className={`${s.bg} rounded-xl p-4`}>
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`w-4 h-4 ${s.color}`} />
                <span className="text-xs text-gray-500 font-medium">{s.label}</span>
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          );
        })}
      </div>

      {/* Overall capacity */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900">Overall Mentor Capacity</h3>
          <span className="text-sm font-bold text-gray-700">{usedCapacity} / {totalCapacity} students assigned</span>
        </div>
        <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${(usedCapacity / totalCapacity) * 100}%` }}
          />
        </div>
        <p className="text-xs text-gray-400 mt-2">{Math.round((usedCapacity / totalCapacity) * 100)}% capacity used</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {(['overview', 'waiting', 'mentors'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all capitalize
              ${activeTab === tab ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
          >
            {tab} {tab === 'waiting' && waiting.length > 0 && (
              <span className="ml-1 bg-orange-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">{waiting.length}</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Waiting Students ── */}
      {activeTab === 'waiting' && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-gray-700">
            {waiting.length === 0 ? '✅ All students assigned!' : `${waiting.length} students waiting for assignment`}
          </h3>

          {assigned.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-4">
              <h4 className="text-sm font-bold text-green-800 mb-3">✅ Recently Assigned ({assigned.length})</h4>
              <div className="space-y-2">
                {assigned.map(({ student, mentor }) => (
                  <div key={student.id} className="flex items-center gap-3 text-sm">
                    <img src={student.avatar} alt={student.name} className="w-7 h-7 rounded-full" />
                    <span className="font-medium text-gray-800">{student.name}</span>
                    <ArrowRight className="w-4 h-4 text-gray-400" />
                    <img src={mentor.avatar} alt={mentor.name} className="w-7 h-7 rounded-full" />
                    <span className="font-medium text-blue-700">{mentor.name}</span>
                    <span className="text-xs text-gray-500">{student.language} · {student.stage}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {waiting.map(student => {
            const bestMentor = getBestMentor(student, mentors);
            return (
              <div key={student.id} className="bg-white rounded-xl border-2 border-orange-100 p-4">
                <div className="flex items-center gap-4">
                  <img src={student.avatar} alt={student.name} className="w-11 h-11 rounded-full border-2 border-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-gray-900">{student.name}</h4>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap text-xs text-gray-500">
                      <span>{student.exam}</span>
                      <span className="capitalize">{student.stage}</span>
                      <span>{languageOptions.find(l => l.id === student.language)?.nativeScript ?? student.language}</span>
                      <span className="text-orange-500">Waiting {student.waitingSince}</span>
                    </div>
                    {bestMentor && (
                      <div className="flex items-center gap-2 mt-2 text-xs text-green-700 bg-green-50 rounded-lg px-2 py-1 w-fit">
                        <CheckCircle2 className="w-3 h-3" />
                        Best match: <span className="font-bold">{bestMentor.name}</span>
                        ({bestMentor.studentCount}/{bestMentor.maxStudents} students)
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleAutoAssign(student)}
                      disabled={!bestMentor}
                      className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Auto Assign
                    </button>
                    <button className="px-3 py-2 border border-gray-300 text-gray-600 text-xs font-semibold rounded-lg hover:bg-gray-50 transition-all">
                      Override
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Mentors ── */}
      {activeTab === 'mentors' && (
        <div className="space-y-3">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              value={searchMentor}
              onChange={e => setSearchMentor(e.target.value)}
              placeholder="Search mentor…"
              className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 bg-white"
            />
          </div>

          {filteredMentors.map(mentor => {
            const isOpen = expandedMentor === mentor.id;
            const capacityPct = Math.round((mentor.studentCount / mentor.maxStudents) * 100);
            return (
              <div key={mentor.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <div
                  className="flex items-center gap-4 p-4 cursor-pointer hover:bg-gray-50"
                  onClick={() => setExpandedMentor(isOpen ? null : mentor.id)}
                >
                  <img src={mentor.avatar} alt={mentor.name} className="w-11 h-11 rounded-full border-2 border-gray-100 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-bold text-gray-900">{mentor.name}</h4>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                        <span className="text-xs text-gray-500">{mentor.rating}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <CapacityBar current={mentor.studentCount} max={mentor.maxStudents} />
                    </div>
                    <div className="flex gap-1 mt-1.5 flex-wrap">
                      {mentor.languages.map(l => (
                        <span key={l} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 rounded font-medium">
                          {languageOptions.find(lang => lang.id === l)?.nativeScript ?? l}
                        </span>
                      ))}
                      {mentor.stages.map(s => (
                        <span key={s} className="text-[10px] px-1.5 py-0.5 bg-purple-50 text-purple-600 rounded font-medium capitalize">{s}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${capacityPct >= 90 ? 'bg-red-100 text-red-600' : capacityPct >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                      {capacityPct >= 90 ? 'Full' : capacityPct >= 70 ? 'Limited' : 'Available'}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {isOpen && (
                  <div className="px-4 pb-4 bg-gray-50 border-t border-gray-100 pt-3">
                    <p className="text-xs text-gray-500 mb-2">{mentor.bio}</p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {mentor.expertise.map(e => (
                        <span key={e} className="text-xs bg-white border border-gray-200 text-gray-700 px-2 py-1 rounded-md">{e}</span>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button className="text-xs text-blue-600 font-semibold bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100">
                        Assign Student
                      </button>
                      <button className="text-xs text-gray-600 font-semibold bg-gray-100 px-3 py-1.5 rounded-lg hover:bg-gray-200">
                        View Profile
                      </button>
                      {mentor.studentCount >= mentor.maxStudents && (
                        <button className="text-xs text-orange-600 font-semibold bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100">
                          Override Capacity
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Overview ── */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Capacity heatmap */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Mentor Capacity Overview</h3>
            <div className="space-y-3">
              {mentors.map(m => {
                const pct = Math.round((m.studentCount / m.maxStudents) * 100);
                return (
                  <div key={m.id} className="flex items-center gap-3">
                    <img src={m.avatar} alt={m.name} className="w-8 h-8 rounded-full flex-shrink-0" />
                    <span className="text-xs font-medium text-gray-700 w-28 flex-shrink-0 truncate">{m.name}</span>
                    <CapacityBar current={m.studentCount} max={m.maxStudents} />
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded w-16 text-center flex-shrink-0
                      ${pct >= 90 ? 'bg-red-100 text-red-600' : pct >= 70 ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'}`}>
                      {pct}%
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Assignment log */}
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-bold text-gray-900 mb-4">Language Distribution</h3>
            <div className="space-y-3">
              {languageOptions.map(lang => {
                const count = mentors.filter(m => m.languages.includes(lang.id)).length;
                return (
                  <div key={lang.id} className="flex items-center gap-3">
                    <span className="text-lg">{lang.flag}</span>
                    <span className="text-xs font-medium text-gray-700 w-24 flex-shrink-0">{lang.name}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-blue-400 rounded-full"
                        style={{ width: `${(count / mentors.length) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-gray-700 flex-shrink-0">{count} mentor{count !== 1 ? 's' : ''}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MentorAllocation;
