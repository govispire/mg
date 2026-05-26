import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Brain, TrendingDown, MessageSquare, BookOpen, FileText,
  Target, AlertTriangle, CheckCircle2, ChevronRight, Send,
  BarChart3, Lightbulb, Clock, Star,
} from 'lucide-react';

// ── Mock student weak area data ───────────────────────────────
// In production, this comes from /api/student-weak-areas
const MOCK_STUDENTS = [
  {
    id: 1, name: 'Arjun Kumar', exam: 'Banking', mentor_id: 1,
    consistency_score: 74, streak: 8,
    weak_areas: [
      { topic: 'Data Interpretation', subject: 'Quant', accuracy: 42, trend: 'declining', attempts: 12 },
      { topic: 'Puzzles & Seating', subject: 'Reasoning', accuracy: 38, trend: 'stable', attempts: 9 },
      { topic: 'Reading Comprehension', subject: 'English', accuracy: 61, trend: 'improving', attempts: 15 },
    ],
    strong_areas: ['Number Series', 'Cloze Test', 'Syllogism'],
    recent_tests: [
      { name: 'SBI PO Mock 7', score: 68, total: 100, date: '2026-05-22' },
      { name: 'SBI PO Mock 6', score: 71, total: 100, date: '2026-05-18' },
    ],
  },
  {
    id: 2, name: 'Priya Nair', exam: 'SSC', mentor_id: 1,
    consistency_score: 91, streak: 22,
    weak_areas: [
      { topic: 'Trigonometry', subject: 'Quant', accuracy: 48, trend: 'improving', attempts: 8 },
      { topic: 'History', subject: 'GK', accuracy: 55, trend: 'stable', attempts: 14 },
    ],
    strong_areas: ['Algebra', 'Comprehension', 'Analogy'],
    recent_tests: [
      { name: 'SSC CGL Mock 4', score: 82, total: 100, date: '2026-05-23' },
    ],
  },
  {
    id: 3, name: 'Rahul Singh', exam: 'Banking', mentor_id: 1,
    consistency_score: 42, streak: 2,
    weak_areas: [
      { topic: 'Data Interpretation', subject: 'Quant', accuracy: 31, trend: 'declining', attempts: 5 },
      { topic: 'Coding-Decoding', subject: 'Reasoning', accuracy: 44, trend: 'declining', attempts: 7 },
      { topic: 'Sentence Correction', subject: 'English', accuracy: 39, trend: 'declining', attempts: 10 },
    ],
    strong_areas: [],
    recent_tests: [
      { name: 'IBPS PO Mock 2', score: 45, total: 100, date: '2026-05-20' },
    ],
  },
];

// ── Resource suggestion logic ─────────────────────────────────
function suggestResources(topic: string, exam: string) {
  const base = [
    { type: 'test', icon: BarChart3, label: `${topic} Sectional Test`, color: 'text-blue-600', bg: 'bg-blue-50' },
    { type: 'pdf', icon: FileText, label: `${topic} PDF Workbook`, color: 'text-purple-600', bg: 'bg-purple-50' },
    { type: 'mentorship', icon: Star, label: `1-on-1 Session — ${topic}`, color: 'text-amber-600', bg: 'bg-amber-50' },
  ];
  return base;
}

// ── Weak Area Bar ─────────────────────────────────────────────
const WeakAreaBar: React.FC<{ topic: string; subject: string; accuracy: number; trend: string; attempts: number }> = ({
  topic, subject, accuracy, trend, attempts,
}) => {
  const barColor = accuracy < 40 ? 'bg-red-500' : accuracy < 60 ? 'bg-amber-500' : 'bg-green-500';
  const trendColor = trend === 'improving' ? 'text-green-600' : trend === 'declining' ? 'text-red-600' : 'text-muted-foreground';
  const trendLabel = trend === 'improving' ? '↑ Improving' : trend === 'declining' ? '↓ Declining' : '→ Stable';

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div>
          <span className="font-semibold text-foreground">{topic}</span>
          <span className="text-muted-foreground ml-2">({subject})</span>
        </div>
        <div className="flex items-center gap-3">
          <span className={`font-medium ${trendColor} text-[10px]`}>{trendLabel}</span>
          <span className="font-bold text-foreground">{accuracy}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={`h-full ${barColor} rounded-full transition-all`} style={{ width: `${accuracy}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground">{attempts} attempts</p>
    </div>
  );
};

// ── Auto Message Generator ────────────────────────────────────
function generateMessage(studentName: string, weakAreas: any[], exam: string) {
  const topWeak = weakAreas.slice(0, 2).map(w => w.topic).join(' and ');
  return `Hi ${studentName},

Based on your last ${exam} tests, your accuracy in ${topWeak} needs improvement.

${weakAreas.map(w => `• ${w.topic}: ${w.accuracy}% (${w.attempts} attempts)`).join('\n')}

This may impact your ${exam} score. We recommend focusing on these areas this week.

You can access targeted practice tests and PDFs for these topics on your dashboard. Feel free to reach out if you need any guidance!

Best,
Your Mentor`;
}

// ── Student Card ──────────────────────────────────────────────
const StudentRecommendationCard: React.FC<{ student: typeof MOCK_STUDENTS[0] }> = ({ student }) => {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const [messageOpen, setMessageOpen] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);

  const criticalAreas = student.weak_areas.filter(w => w.accuracy < 50);
  const consistencyColor = student.consistency_score >= 80 ? 'text-green-600' : student.consistency_score >= 60 ? 'text-amber-600' : 'text-red-600';

  const handleOpenMessage = () => {
    setMessageText(generateMessage(student.name, student.weak_areas, student.exam));
    setMessageOpen(true);
  };

  const handleSend = async () => {
    setSending(true);
    // Simulate API call
    await new Promise(r => setTimeout(r, 1000));
    toast({ title: '✅ Recommendation Sent', description: `Message sent to ${student.name} with weak-area resources.` });
    setSending(false);
    setMessageOpen(false);
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card overflow-hidden transition-all hover:shadow-sm">
      {/* Student Header */}
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/60 flex items-center justify-center text-sm font-bold text-primary shrink-0">
            {student.name.charAt(0)}
          </div>
          <div>
            <p className="font-semibold text-sm text-foreground">{student.name}</p>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{student.exam}</Badge>
              <span className="text-[10px] text-muted-foreground">🔥 {student.streak}d streak</span>
            </div>
          </div>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${consistencyColor}`}>{student.consistency_score}%</p>
          <p className="text-[10px] text-muted-foreground">consistency</p>
        </div>
      </div>

      {/* Critical alert */}
      {criticalAreas.length > 0 && (
        <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-lg p-2.5 flex items-center gap-2">
          <AlertTriangle className="h-3.5 w-3.5 text-red-500 shrink-0" />
          <p className="text-xs text-red-700">
            <span className="font-semibold">{criticalAreas.length} critical weak area{criticalAreas.length > 1 ? 's' : ''}</span>
            : {criticalAreas.map(a => a.topic).join(', ')}
          </p>
        </div>
      )}

      {/* Weak Areas */}
      {expanded && (
        <div className="px-4 pb-3 space-y-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Weak Areas</p>
          {student.weak_areas.map(w => (
            <WeakAreaBar key={w.topic} {...w} />
          ))}

          {student.strong_areas.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Strong Areas</p>
              <div className="flex flex-wrap gap-1">
                {student.strong_areas.map(s => (
                  <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-green-50 text-green-700 border border-green-200">
                    ✓ {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Suggested Resources */}
          <div>
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recommended Resources</p>
            <div className="space-y-1.5">
              {student.weak_areas.slice(0, 2).flatMap(w =>
                suggestResources(w.topic, student.exam).slice(0, 2).map(r => (
                  <div key={`${w.topic}-${r.type}`} className={`flex items-center gap-2 p-2 rounded-lg ${r.bg}`}>
                    <r.icon className={`h-3.5 w-3.5 shrink-0 ${r.color}`} />
                    <span className={`text-xs font-medium ${r.color}`}>{r.label}</span>
                  </div>
                ))
              ).slice(0, 4)}
            </div>
          </div>

          {/* Recent Tests */}
          {student.recent_tests.length > 0 && (
            <div>
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2">Recent Tests</p>
              {student.recent_tests.map(t => (
                <div key={t.name} className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground truncate">{t.name}</span>
                  <span className={`font-bold ml-2 shrink-0 ${t.score / t.total >= 0.7 ? 'text-green-600' : t.score / t.total >= 0.5 ? 'text-amber-600' : 'text-red-600'}`}>
                    {t.score}/{t.total}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className={`px-4 pb-4 flex items-center gap-2 ${expanded ? '' : 'pt-0'}`}>
        <Button variant="outline" size="sm" onClick={() => setExpanded(!expanded)} className="flex-1 gap-1 text-xs">
          {expanded ? 'Collapse' : 'View Analysis'}
          <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </Button>
        <Button size="sm" onClick={handleOpenMessage} className="flex-1 gap-1 text-xs">
          <Send className="h-3 w-3" /> Send Guidance
        </Button>
      </div>

      {/* Message Dialog */}
      {messageOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-lg">
            <div className="p-5 border-b border-border/50">
              <h3 className="font-bold text-base flex items-center gap-2">
                <Brain className="h-5 w-5 text-primary" /> Send Weak-Area Guidance
              </h3>
              <p className="text-xs text-muted-foreground mt-1">
                Auto-generated based on {student.name}'s test performance. Review and edit before sending.
              </p>
            </div>
            <div className="p-5">
              <textarea
                className="w-full h-52 border border-border rounded-xl p-3 text-sm bg-muted/20 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none font-mono"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
              />
            </div>
            <div className="p-5 border-t border-border/50 flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setMessageOpen(false)}>Cancel</Button>
              <Button onClick={handleSend} disabled={sending} className="gap-2">
                <Send className="h-3.5 w-3.5" />
                {sending ? 'Sending...' : 'Send to Student'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────
const MentorRecommendations: React.FC = () => {
  const [examFilter, setExamFilter] = useState('');
  const [consistencyFilter, setConsistencyFilter] = useState('');

  const filteredStudents = MOCK_STUDENTS.filter(s => {
    if (examFilter && s.exam !== examFilter) return false;
    if (consistencyFilter === 'low' && s.consistency_score >= 60) return false;
    if (consistencyFilter === 'medium' && (s.consistency_score < 60 || s.consistency_score >= 80)) return false;
    if (consistencyFilter === 'high' && s.consistency_score < 80) return false;
    return true;
  });

  const criticalStudents = MOCK_STUDENTS.filter(s => s.weak_areas.some(w => w.accuracy < 40));
  const lowConsistency = MOCK_STUDENTS.filter(s => s.consistency_score < 60);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Brain className="h-6 w-6 text-primary" /> Weak-Area Intelligence
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Auto-detect student weak areas → Send personalized guidance → Recommend resources
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'My Students', value: MOCK_STUDENTS.length, icon: Target, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Need Attention', value: criticalStudents.length, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
          { label: 'Low Consistency', value: lowConsistency.length, icon: TrendingDown, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'High Performers', value: MOCK_STUDENTS.filter(s => s.consistency_score >= 80).length, icon: Star, color: 'text-green-600', bg: 'bg-green-50' },
        ].map(k => (
          <Card key={k.label} className="border-border/50">
            <CardContent className="p-4 flex items-center gap-3">
              <div className={`p-2.5 rounded-xl ${k.bg}`}>
                <k.icon className={`h-5 w-5 ${k.color}`} />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{k.value}</p>
                <p className="text-xs text-muted-foreground">{k.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* How it works */}
      <div className="bg-gradient-to-r from-primary/5 to-blue-500/5 border border-primary/20 rounded-xl p-4">
        <p className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" /> How this works
        </p>
        <div className="grid grid-cols-3 gap-4 mt-3">
          {[
            { step: '1', title: 'Detect', desc: 'System analyzes test attempts and calculates topic accuracy automatically' },
            { step: '2', title: 'Message', desc: 'Auto-generates personalized guidance message based on weak areas' },
            { step: '3', title: 'Recommend', desc: 'Suggests exact tests, PDFs and mentorship for each weak area' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold flex items-center justify-center mx-auto mb-2">
                {s.step}
              </div>
              <p className="text-xs font-semibold text-foreground">{s.title}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <Select value={examFilter} onValueChange={setExamFilter}>
          <SelectTrigger className="w-40 h-9"><SelectValue placeholder="All Exams" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Exams</SelectItem>
            <SelectItem value="Banking">Banking</SelectItem>
            <SelectItem value="SSC">SSC</SelectItem>
            <SelectItem value="Railway">Railway</SelectItem>
          </SelectContent>
        </Select>
        <Select value={consistencyFilter} onValueChange={setConsistencyFilter}>
          <SelectTrigger className="w-44 h-9"><SelectValue placeholder="All Consistency" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Consistency</SelectItem>
            <SelectItem value="low">Low (&lt;60%)</SelectItem>
            <SelectItem value="medium">Medium (60-80%)</SelectItem>
            <SelectItem value="high">High (&gt;80%)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="md:col-span-2 text-center py-12 text-muted-foreground">
            <Brain className="h-10 w-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm">No students match the filter</p>
          </div>
        ) : (
          filteredStudents
            .sort((a, b) => a.consistency_score - b.consistency_score) // Most at-risk first
            .map(student => (
              <StudentRecommendationCard key={student.id} student={student} />
            ))
        )}
      </div>
    </div>
  );
};

export default MentorRecommendations;
