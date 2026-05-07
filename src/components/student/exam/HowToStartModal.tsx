import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import {
  X, Target, Map, Calendar, ListChecks, Video,
  ChevronRight, PlayCircle, CheckCircle2, Clock,
  Star, Zap, Trophy, ArrowRight, Rocket, Edit3,
  BarChart2, FileText
} from 'lucide-react';

interface Props { isOpen: boolean; onClose: () => void; examName: string; examId?: string; }

const P = '#16a34a';

const phases = [
  { num: 1, title: 'Foundation Building',    days: 30, color: '#10b981', bg: '#ecfdf5', icon: '🌱',
    desc: 'Build your basics. Focus on concepts, accuracy and consistency.',
    topics: ['Quant Basics', 'Reasoning Fundamentals', 'English Grammar', 'Number System'],
    goals: ['70+ Topics', '20+ Sectional Tests', '100+ hrs Study', '75%+ Accuracy'] },
  { num: 2, title: 'Concept Strengthening',  days: 45, color: '#3b82f6', bg: '#eff6ff', icon: '📚',
    desc: 'Deep dive into all sections. Solve mixed-level questions.',
    topics: ['Advanced Quant', 'Complex Reasoning', 'RC & Cloze Test', 'Current Affairs'],
    goals: ['150+ Topics', '40+ Sectional Tests', '200+ hrs Study', '80%+ Accuracy'] },
  { num: 3, title: 'Mock Test Practice',     days: 30, color: '#8b5cf6', bg: '#f5f3ff', icon: '🎯',
    desc: 'Full mocks, analysis and speed building. Time management focus.',
    topics: ['Full Mock Tests', 'Speed Building', 'Error Analysis', 'Weak Area Fixing'],
    goals: ['30+ Full Mocks', '60+ Sectional Tests', 'Time < 60 min', '85%+ Accuracy'] },
  { num: 4, title: 'Revision + Accuracy',    days: 15, color: '#f59e0b', bg: '#fffbeb', icon: '⭐',
    desc: 'Final sprint. Revise everything, stay confident.',
    topics: ['Quick Revision', 'High-Value Topics', 'PYQ Analysis', 'Mental Prep'],
    goals: ['15+ Full Mocks', 'PYQ Solved', 'Cutoff Practice', '90%+ Accuracy'] },
];

const navItems = [
  { id: 'overview',  icon: Target,     label: 'Overview',         sub: 'Your Preparation Journey' },
  { id: 'roadmap',   icon: Map,        label: 'Roadmap',          sub: 'Step-by-Step Plan' },
  { id: 'daily',     icon: Calendar,   label: 'Daily Study Plan', sub: 'What to study daily' },
  { id: 'first',     icon: ListChecks, label: 'What to Do First', sub: 'Beginner Steps' },
  { id: 'videos',    icon: Video,      label: 'Video Guidance',   sub: 'Expert Guidance' },
  { id: 'resources', icon: FileText,   label: 'Resources',        sub: 'Handpicked for You' },
  { id: 'track',     icon: BarChart2,  label: 'Track & Improve',  sub: 'Measure Your Progress' },
];

const videos = [
  { title: 'How to Clear Prelims in First Attempt', author: 'Examerit Expert', dur: '12:45', thumb: '🎓' },
  { title: 'Time Management Strategy',              author: 'Topper',          dur: '08:23', thumb: '⏰' },
  { title: 'Best Mock Test Approach',               author: 'Examerit Expert', dur: '08:34', thumb: '📋' },
  { title: 'Common Mistakes to Avoid',              author: 'Topper',          dur: '07:10', thumb: '⚠️' },
];

const steps = [
  'Understand the exam pattern & syllabus',
  'Complete basic concepts of all sections',
  'Start solving easy level questions',
  'Take sectional tests and analyze',
  'Build speed and accuracy gradually',
];

const ModalContent: React.FC<Props> = ({ onClose, examName }) => {
  const [activeNav, setActiveNav] = useState('overview');
  const [expandedPhase, setExpandedPhase] = useState<number | null>(null);
  const [started, setStarted] = useState(false);
  const sn = examName.split(' ').slice(0, 3).join(' ');

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 99999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)', padding: '16px'
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', width: '100%', maxWidth: '1100px',
        height: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden',
        boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
      }}>
        {/* TOP BAR */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: '#111' }}>How to Start – {sn} Journey</h2>
            <p style={{ margin: 0, fontSize: 12, color: '#9ca3af', marginTop: 2 }}>Your Zero to Hero roadmap for {sn} 2026</p>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: 'none', background: '#f3f4f6', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} color="#4b5563" />
          </button>
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* SIDEBAR */}
          <div style={{ width: 200, flexShrink: 0, borderRight: '1px solid #f0f0f0', background: '#fafafa', display: 'flex', flexDirection: 'column', overflowY: 'auto' }}>
            <nav style={{ flex: 1, padding: '12px 10px' }}>
              {navItems.map(item => {
                const active = activeNav === item.id;
                return (
                  <button key={item.id} onClick={() => setActiveNav(item.id)} style={{
                    width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 12,
                    border: 'none', cursor: 'pointer', marginBottom: 4,
                    background: active ? P : 'transparent', display: 'flex', alignItems: 'center', gap: 10,
                    transition: 'all 0.15s'
                  }}>
                    <item.icon size={15} color={active ? '#fff' : '#6b7280'} style={{ flexShrink: 0 }} />
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: active ? '#fff' : '#374151', lineHeight: 1.2 }}>{item.label}</div>
                      <div style={{ fontSize: 10, color: active ? 'rgba(255,255,255,0.7)' : '#9ca3af', marginTop: 1 }}>{item.sub}</div>
                    </div>
                  </button>
                );
              })}
            </nav>
            {/* Target box */}
            <div style={{ margin: '0 10px 10px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: 12, padding: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: P, fontSize: 11, fontWeight: 800 }}>
                  <Target size={13} /> Your Target
                </div>
                <Edit3 size={11} color="#9ca3af" style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ fontSize: 12, fontWeight: 900, color: '#111' }}>{sn} 2026</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 6 }}>Exam Date</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: '#374151' }}>5 Oct 2026</div>
              <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 4 }}>Time Left</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: P }}>170 Days</div>
            </div>
          </div>

          {/* MAIN */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

              {/* Exam Understanding Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                {[
                  { icon: '📋', label: 'Exam Pattern',       value: 'Prelims • Mains',  sub: 'View Details →',          c: '#3b82f6' },
                  { icon: '📊', label: 'Difficulty Level',   value: 'High',             sub: '●●●●○',                   c: '#8b5cf6' },
                  { icon: '⏱️', label: 'Recommended Time',   value: '4–6 Months',       sub: 'Consistent Preparation',  c: '#f59e0b' },
                  { icon: '👥', label: 'Competition Level',  value: 'Very High',        sub: 'Be Strategic, Consistent', c: '#ef4444' },
                ].map(c => (
                  <div key={c.label} style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 14, padding: 14, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{c.icon}</div>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{c.label}</div>
                    <div style={{ fontSize: 14, fontWeight: 900, color: '#111', marginTop: 2 }}>{c.value}</div>
                    <div style={{ fontSize: 10, color: c.c, marginTop: 4 }}>{c.sub}</div>
                  </div>
                ))}
              </div>

              {/* Roadmap */}
              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 18, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#111' }}>Preparation Roadmap</h3>
                  <span style={{ fontSize: 11, fontWeight: 700, background: '#dcfce7', color: P, padding: '4px 12px', borderRadius: 20 }}>4 Phases</span>
                </div>
                {/* Phase timeline */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
                  {phases.map((ph, idx) => (
                    <React.Fragment key={ph.num}>
                      <div onClick={() => setExpandedPhase(expandedPhase === ph.num ? null : ph.num)}
                        style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', minWidth: 110 }}>
                        <div style={{ width: 52, height: 52, borderRadius: '50%', border: `2px solid ${ph.color}`, background: ph.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, marginBottom: 6 }}>{ph.icon}</div>
                        <div style={{ fontSize: 10, fontWeight: 800, color: ph.color }}>Phase {ph.num}</div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#374151', textAlign: 'center', lineHeight: 1.3 }}>{ph.title}</div>
                        <div style={{ fontSize: 10, fontWeight: 700, color: ph.color, marginTop: 2 }}>{ph.days} Days</div>
                      </div>
                      {idx < phases.length - 1 && (
                        <div style={{ display: 'flex', alignItems: 'center', paddingTop: 22, flexShrink: 0 }}>
                          <div style={{ width: 28, borderTop: '2px dashed #e5e7eb' }} />
                          <ChevronRight size={12} color="#d1d5db" />
                        </div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
                {/* Expanded */}
                {expandedPhase && (() => {
                  const ph = phases.find(p => p.num === expandedPhase)!;
                  return (
                    <div style={{ border: `1px solid ${ph.color}40`, background: ph.bg, borderRadius: 12, padding: 16, marginTop: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                        <span style={{ fontSize: 22 }}>{ph.icon}</span>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 900, color: ph.color }}>Phase {ph.num} – {ph.title}</div>
                          <div style={{ fontSize: 11, color: '#6b7280' }}>{ph.desc}</div>
                        </div>
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Key Topics</div>
                          {ph.topics.map(t => (
                            <div key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: '#374151', marginBottom: 4 }}>
                              <CheckCircle2 size={12} color={ph.color} /> {t}
                            </div>
                          ))}
                        </div>
                        <div>
                          <div style={{ fontSize: 10, fontWeight: 800, color: '#6b7280', textTransform: 'uppercase', marginBottom: 8 }}>Phase Goals</div>
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                            {ph.goals.map(g => (
                              <div key={g} style={{ background: 'rgba(255,255,255,0.7)', borderRadius: 8, padding: '6px 8px', textAlign: 'center' }}>
                                <div style={{ fontSize: 11, fontWeight: 900, color: ph.color }}>{g.split(' ')[0]}</div>
                                <div style={{ fontSize: 9, color: '#9ca3af' }}>{g.split(' ').slice(1).join(' ')}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', borderRadius: 10, padding: '10px 14px', marginTop: 14, fontSize: 11, color: '#6b7280' }}>
                  <Star size={14} color="#f59e0b" />
                  <span style={{ flex: 1 }}><strong>Key to Success:</strong> Consistency + Smart Work + Regular Mock Practice + Analysis</span>
                  <Trophy size={14} color="#f59e0b" />
                </div>
              </div>

              {/* 3 columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                {/* What to Do First */}
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 18, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 900, color: '#111', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <ListChecks size={15} color={P} /> What to Do First?
                  </h4>
                  {steps.map((step, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 10 }}>
                      <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#dcfce7', color: P, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 900, flexShrink: 0, marginTop: 1 }}>{i + 1}</div>
                      <span style={{ fontSize: 11, color: '#374151', lineHeight: 1.4 }}>{step}</span>
                    </div>
                  ))}
                  <button style={{ marginTop: 8, fontSize: 11, color: P, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
                    <Zap size={12} /> Follow this sequence
                  </button>
                </div>

                {/* Video Guidance */}
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 18, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                    <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, color: '#111', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Video size={15} color={P} /> Video Guidance
                    </h4>
                    <button style={{ fontSize: 10, color: P, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>View All</button>
                  </div>
                  {videos.map((v, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#f9fafb', borderRadius: 10, padding: '8px 10px', marginBottom: 6, cursor: 'pointer' }}>
                      <div style={{ width: 40, height: 30, background: '#1f2937', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, position: 'relative' }}>
                        {v.thumb}
                        <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.3)', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: 0 }} className="video-hover">
                          <PlayCircle size={14} color="#fff" />
                        </div>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: '#1f2937', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                        <div style={{ fontSize: 9, color: '#9ca3af' }}>{v.author}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 9, color: '#9ca3af', flexShrink: 0 }}>
                        <Clock size={10} />{v.dur}
                      </div>
                    </div>
                  ))}
                </div>

                {/* How Examerit Helps */}
                <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 18, padding: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 900, color: '#111', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <Rocket size={15} color={P} /> How Examerit Helps You
                  </h4>
                  <div style={{ flex: 1 }}>
                    {[
                      { icon: '🤖', title: 'AI Performance Analysis',   desc: 'Know your strengths & weaknesses' },
                      { icon: '📅', title: 'Personalized Study Plan',    desc: 'Tailored plan based on performance' },
                      { icon: '📝', title: 'High Quality Mock Tests',    desc: 'Exam-like experience with analysis' },
                      { icon: '📈', title: 'Progress Tracking',          desc: 'Track improvement every day' },
                    ].map(h => (
                      <div key={h.title} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 12 }}>
                        <span style={{ fontSize: 18, flexShrink: 0 }}>{h.icon}</span>
                        <div>
                          <div style={{ fontSize: 11, fontWeight: 700, color: '#1f2937', lineHeight: 1.3 }}>{h.title}</div>
                          <div style={{ fontSize: 10, color: '#9ca3af' }}>{h.desc}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => { setStarted(true); }}
                    style={{ width: '100%', background: P, color: '#fff', fontWeight: 900, fontSize: 13, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 8 }}>
                    {started ? <><CheckCircle2 size={16} /> Journey Started!</> : <><Rocket size={16} /> Start My Journey Now 🚀</>}
                  </button>
                </div>
              </div>

              {/* Daily Study Plan */}
              <div style={{ background: '#fff', border: '1px solid #f0f0f0', borderRadius: 18, padding: 20, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 900, color: '#111' }}>Daily Study Plan</h3>
                  <button style={{ fontSize: 11, color: P, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                    Customize <ArrowRight size={12} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
                  {[
                    { time: '☀️ Morning',    subject: 'Quantitative Aptitude', topic: 'Number System',          hrs: '2–2.5 hrs', c: '#f59e0b' },
                    { time: '🌤️ Afternoon',  subject: 'Reasoning Ability',     topic: 'Syllogism',              hrs: '1.5–2 hrs', c: '#3b82f6' },
                    { time: '🌅 Evening',    subject: 'English Language',       topic: 'Reading Comprehension',  hrs: '1.5–2 hrs', c: '#8b5cf6' },
                    { time: '🌙 Night',      subject: 'Mock Practice',          topic: 'Take Sectional Test',    hrs: '1–1.5 hrs', c: '#10b981' },
                  ].map(slot => (
                    <div key={slot.time} style={{ background: '#f9fafb', borderRadius: 14, padding: 14, border: '1px solid #f0f0f0' }}>
                      <div style={{ fontSize: 11, color: '#6b7280', fontWeight: 600, marginBottom: 6 }}>{slot.time}</div>
                      <div style={{ fontSize: 12, fontWeight: 900, color: '#1f2937' }}>{slot.subject}</div>
                      <div style={{ fontSize: 10, color: '#9ca3af', marginTop: 2 }}>{slot.topic}</div>
                      <div style={{ fontSize: 11, fontWeight: 800, color: slot.c, marginTop: 8 }}>{slot.hrs}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Footer */}
              <div style={{ background: 'linear-gradient(to right,#dcfce7,#d1fae5)', border: '1px solid #bbf7d0', borderRadius: 16, padding: '14px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
                <Target size={18} color={P} style={{ flexShrink: 0 }} />
                <p style={{ margin: 0, fontSize: 12, color: '#374151', fontWeight: 500 }}>
                  <strong>Remember:</strong> There is no shortcut to success. Follow the plan, stay consistent and trust the process. We are with you in this journey! ❤️
                </p>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const HowToStartModal: React.FC<Props> = (props) => {
  if (!props.isOpen) return null;
  return ReactDOM.createPortal(
    <ModalContent {...props} />,
    document.body
  );
};
