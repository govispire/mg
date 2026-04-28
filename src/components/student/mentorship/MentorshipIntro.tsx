import React, { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Target, Users, Trophy, Sparkles, CheckCircle, ArrowRight, TrendingUp,
  BrainCircuit, Clock, Award, Star, Zap, Shield, BarChart3, MessageCircle,
  Video, BookOpen, Calendar, Rocket, Heart, ChevronRight, BadgeCheck,
  Lightbulb, FlameKindling, GraduationCap, Lock
} from 'lucide-react';

interface MentorshipIntroProps {
  onNavigate: (tab: string) => void;
  onStartWizard?: () => void;
}

/* ─── Hook: count-up on scroll-into-view ─── */
const useCountUp = (end: number, duration = 1800) => {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          let startTime: number;
          const step = (ts: number) => {
            if (!startTime) startTime = ts;
            const progress = Math.min((ts - startTime) / duration, 1);
            const ease = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(ease * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.5 },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
};

/* ─── Sub-component: animated stat ─── */
const AnimatedStat = ({
  end, suffix, label, color,
}: {
  end: number; suffix: string; label: string; color: string;
}) => {
  const { count, ref } = useCountUp(end);
  return (
    <div ref={ref} className="text-center">
      <div className={`text-3xl sm:text-4xl font-black mb-1 ${color}`}>
        {count.toLocaleString()}{suffix}
      </div>
      <div className="text-xs sm:text-sm text-white/70 font-medium">{label}</div>
    </div>
  );
};

/* ─── Feature card ─── */
const FeatureCard = ({
  icon, title, description, badge, accent,
}: {
  icon: React.ReactNode; title: string; description: string;
  badge?: string; accent: string;
}) => (
  <div className={`relative bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 group overflow-hidden`}>
    {/* Accent strip */}
    <div className={`absolute top-0 left-0 right-0 h-0.5 ${accent} opacity-0 group-hover:opacity-100 transition-opacity`} />
    {badge && (
      <span className="absolute top-4 right-4 text-[10px] font-bold px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white">
        {badge}
      </span>
    )}
    <div className={`w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4 group-hover:bg-primary group-hover:text-white transition-colors`}>
      {icon}
    </div>
    <h3 className="font-bold text-gray-900 mb-1.5 text-[15px]">{title}</h3>
    <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
  </div>
);

/* ─── Testimonial ─── */
const testimonials = [
  {
    initials: 'PS', name: 'Priya Sharma', exam: 'IBPS PO 2024',
    rank: 'AIR 127', score: '92/100',
    quote: 'My mentor helped me identify exactly where I was losing marks. Went from 45% to 92% in 3 months — would not have cleared without this.',
    palette: 'from-violet-500 to-purple-600',
  },
  {
    initials: 'RK', name: 'Rahul Kumar', exam: 'SSC CGL 2024',
    rank: 'AIR 342', score: '156/200',
    quote: 'I failed twice and was about to give up. My mentor built a week-by-week plan around my weaknesses. Cleared on attempt 3.',
    palette: 'from-blue-500 to-cyan-500',
  },
  {
    initials: 'AV', name: 'Anjali Verma', exam: 'RRB NTPC 2024',
    rank: 'AIR 89', score: '98/120',
    quote: 'Daily study plan + weekly review calls kept me disciplined for 4 straight months. Best investment of my preparation.',
    palette: 'from-emerald-500 to-teal-500',
  },
];

/* ─── Comparison rows ─── */
const comparison = [
  { aspect: 'Study Plan', self: 'Generic YouTube playlist', with: 'Daily plan built around your weak areas' },
  { aspect: 'Doubt Clearing', self: 'Wait for forum replies', with: 'Answer within 2 hours from your mentor' },
  { aspect: 'Mock Analysis', self: 'Know the score, not the why', with: 'Topic-wise error breakdown every week' },
  { aspect: 'Motivation', self: 'Burn out alone', with: 'Weekly check-ins + batch accountability' },
  { aspect: 'Success Rate*', self: '~30–40%', with: '87% of active mentees clear their exam' },
];

const MentorshipIntro: React.FC<MentorshipIntroProps> = ({ onNavigate, onStartWizard }) => {
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setActiveTestimonial(prev => (prev + 1) % testimonials.length),
      5000,
    );
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-14 pb-14 animate-in fade-in duration-500">

      {/* ══════════ HERO ══════════ */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white">
        {/* Blobs */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-violet-500/20 blur-3xl" />

        <div className="relative z-10 px-6 py-12 md:px-16 md:py-20 max-w-4xl mx-auto text-center">
          {/* Beta badge */}
          <div className="inline-flex items-center gap-2 bg-indigo-500/20 border border-indigo-400/40 rounded-full px-4 py-1.5 text-sm font-semibold text-indigo-300 mb-6">
            <FlameKindling className="h-4 w-4" />
            Beta Programme — First 200 students get 40% off
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black leading-tight mb-6">
            Stop Guessing.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-violet-400 to-pink-400">
              Start Winning with a Mentor
            </span>
          </h1>

          <p className="text-lg text-slate-300 mb-8 max-w-2xl mx-auto leading-relaxed">
            Get a study plan built around <strong className="text-white">your</strong> weak areas,
            not a generic syllabus. Join students who cleared IBPS, SSC & Railway with 1-on-1 guidance.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-indigo-950 hover:bg-gray-50 font-bold px-8 py-6 text-lg rounded-2xl shadow-xl hover:scale-105 transition-transform"
              onClick={onStartWizard}
            >
              <Rocket className="mr-2 h-5 w-5" />
              Get Matched FREE
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-2 border-white/20 text-white hover:bg-white/10 px-8 py-6 text-lg rounded-2xl"
              onClick={() => onNavigate('success-stories')}
            >
              <Trophy className="mr-2 h-5 w-5" />
              See Success Stories
            </Button>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-400" /> 7-day money-back guarantee</span>
            <span className="h-4 w-px bg-slate-700" />
            <span className="flex items-center gap-1.5"><Lock className="h-4 w-4 text-emerald-400" /> No credit card to start</span>
            <span className="h-4 w-px bg-slate-700" />
            <span className="flex items-center gap-1.5"><Zap className="h-4 w-4 text-emerald-400" /> Matched in 2 minutes</span>
          </div>
        </div>
      </div>

      {/* ══════════ PROBLEM / SOLUTION ══════════ */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Problem */}
        <div className="bg-red-50/60 border border-red-100 rounded-2xl p-7">
          <h3 className="text-xl font-bold text-red-900 mb-5 flex items-center gap-2.5">
            <span className="text-2xl">😰</span> Sound familiar?
          </h3>
          <ul className="space-y-3">
            {[
              'Confused about where to even start',
              'Syllabus feels endless and overwhelming',
              'Low mock scores but no idea why',
              'Lost motivation after one failure',
              'Repeating the same mistakes in mocks',
            ].map((p, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-gray-700 font-medium">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-red-200 text-red-600 flex items-center justify-center text-xs font-bold flex-shrink-0">{i + 1}</span>
                {p}
              </li>
            ))}
          </ul>
        </div>

        {/* Solution */}
        <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-7">
          <h3 className="text-xl font-bold text-emerald-900 mb-5 flex items-center gap-2.5">
            <Zap className="h-6 w-6 text-emerald-600" /> Your mentor solves all of this
          </h3>
          <div className="space-y-3">
            {[
              { icon: Target, title: 'Personalised Day-1 Roadmap', desc: 'A plan built around your test data, not a template' },
              { icon: BrainCircuit, title: 'Root-cause Doubt Clearing', desc: 'Not just answers — they fix the concept gap' },
              { icon: BarChart3, title: 'Weekly Mock Review', desc: 'Understand exactly where marks are leaking' },
              { icon: Heart, title: 'Accountability Check-ins', desc: 'Regular calls keep you on track through rough weeks' },
            ].map(({ icon: Icon, title, desc }, i) => (
              <div key={i} className="flex items-start gap-3 bg-white rounded-xl p-3.5 shadow-sm">
                <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600 flex-shrink-0">
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ STATS BAND ══════════ */}
      <div className="bg-gradient-to-r from-indigo-600 via-violet-600 to-purple-600 rounded-2xl px-8 py-10">
        <p className="text-center text-white/60 text-xs font-bold uppercase tracking-widest mb-6">
          Beta programme results so far
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <AnimatedStat end={847}  suffix="+"  label="Students Enrolled"     color="text-white" />
          <AnimatedStat end={87}   suffix="%"  label="Pass Rate (Active 6m)" color="text-emerald-300" />
          <AnimatedStat end={34}   suffix="+"  label="Verified Mentors"      color="text-sky-300" />
          <AnimatedStat end={4.8}  suffix="/5" label="Average Rating"        color="text-amber-300" />
        </div>
        <p className="text-center text-white/30 text-[10px] mt-6">
          * Pass rate calculated for students who completed ≥4 months of active mentorship
        </p>
      </div>

      {/* ══════════ FEATURES GRID ══════════ */}
      <div>
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black text-gray-900 mb-3">What You Actually Get</h2>
          <p className="text-gray-500 max-w-xl mx-auto text-sm">
            No fluff. Every feature exists because a student asked for it.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: <Video className="h-5 w-5" />, title: '1-on-1 Live Sessions', description: 'Video calls with your assigned mentor — scheduled at your convenience', badge: 'Most loved', accent: 'bg-violet-500' },
            { icon: <MessageCircle className="h-5 w-5" />, title: 'Async Doubt Clearing', description: 'Send doubts anytime. Mentor responds within 2 hours on working days', badge: 'Fast', accent: 'bg-blue-500' },
            { icon: <BarChart3 className="h-5 w-5" />, title: 'Mock Test Deep Dive', description: 'Weekly analysis of your mocks — topic by topic, no vague feedback', accent: 'bg-emerald-500' },
            { icon: <Target className="h-5 w-5" />, title: 'Custom Study Schedule', description: 'Day-wise task list updated each week based on your progress data', accent: 'bg-amber-500' },
            { icon: <GraduationCap className="h-5 w-5" />, title: 'Exam Strategy Sessions', description: 'Cutoff planning, attempt strategy, and last-month revision blueprint', accent: 'bg-rose-500' },
            { icon: <Shield className="h-5 w-5" />, title: 'Progress Guarantee', description: 'If you follow the plan for 90 days and see no improvement, full refund', badge: 'Guarantee', accent: 'bg-indigo-500' },
          ].map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </div>

      {/* ══════════ COMPARISON TABLE ══════════ */}
      <div className="bg-gradient-to-br from-slate-50 to-indigo-50/50 rounded-2xl p-8 border border-slate-100">
        <h2 className="text-2xl font-black text-center text-gray-900 mb-8">Self-Study vs. With a Mentor</h2>
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white">
              <tr>
                <th className="py-3.5 px-5 text-left font-bold text-sm">Aspect</th>
                <th className="py-3.5 px-5 text-center font-bold text-sm">Self-Study</th>
                <th className="py-3.5 px-5 text-center font-bold text-sm bg-white/10">With Mentor</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map((row, i) => (
                <tr key={i} className={`border-b border-gray-50 ${i % 2 === 0 ? 'bg-gray-50/50' : 'bg-white'}`}>
                  <td className="py-3.5 px-5 font-semibold text-gray-800">{row.aspect}</td>
                  <td className="py-3.5 px-5 text-center text-gray-500 text-xs leading-snug">{row.self}</td>
                  <td className="py-3.5 px-5 text-center text-emerald-700 font-semibold text-xs leading-snug bg-emerald-50">
                    <CheckCircle className="h-3.5 w-3.5 inline mr-1 text-emerald-500" />
                    {row.with}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-center text-gray-400 text-[11px] mt-4">
          *Based on beta cohort data. Individual results vary based on effort and consistency.
        </p>
      </div>

      {/* ══════════ TESTIMONIALS ══════════ */}
      <div>
        <h2 className="text-3xl font-black text-center text-gray-900 mb-8">Real Students, Real Results</h2>
        <div className="max-w-3xl mx-auto">
          {/* Active card */}
          {testimonials.map((t, i) => (
            <div key={i} className={`transition-all duration-500 ${i === activeTestimonial ? 'block' : 'hidden'}`}>
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-8 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 rounded-full bg-indigo-500/20 blur-2xl" />
                {/* Stars */}
                <div className="flex gap-0.5 mb-5">
                  {[...Array(5)].map((_, j) => <Star key={j} className="h-4 w-4 fill-amber-400 text-amber-400" />)}
                </div>
                <p className="text-lg leading-relaxed text-slate-200 mb-6 italic">"{t.quote}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.palette} flex items-center justify-center font-bold text-sm flex-shrink-0`}>
                    {t.initials}
                  </div>
                  <div>
                    <p className="font-bold text-white">{t.name}</p>
                    <p className="text-indigo-300 text-sm">{t.exam}</p>
                    <div className="flex gap-2 mt-1">
                      <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">{t.rank}</span>
                      <span className="text-[10px] font-bold bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded-full border border-blue-500/30">{t.score}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {/* Dot nav */}
          <div className="flex justify-center gap-2 mt-5">
            {testimonials.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveTestimonial(i)}
                className={`h-2 rounded-full transition-all duration-300 ${i === activeTestimonial ? 'w-8 bg-indigo-600' : 'w-2 bg-gray-300 hover:bg-gray-400'}`}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ══════════ FINAL CTA ══════════ */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-600 via-violet-600 to-purple-700 rounded-3xl p-12 text-center text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-32 h-32 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm font-semibold mb-6">
            <BadgeCheck className="h-4 w-4" /> Beta Spots Filling Fast
          </div>
          <h2 className="text-3xl sm:text-4xl font-black mb-4 leading-tight">
            Ready to Stop Struggling Alone?
          </h2>
          <p className="text-white/80 mb-8 text-lg">
            Get matched with a mentor who cleared your exact exam. Takes 2 minutes.
          </p>
          <Button
            size="lg"
            className="bg-white text-indigo-950 hover:bg-gray-50 font-black px-12 py-7 text-xl rounded-2xl shadow-2xl hover:scale-105 transition-transform"
            onClick={onStartWizard}
          >
            <Rocket className="mr-3 h-6 w-6" />
            Find My Mentor — It's FREE
          </Button>
          <div className="flex flex-wrap justify-center gap-5 mt-6 text-sm text-white/60">
            <span>💳 No payment to start</span>
            <span>⚡ Matched in 2 min</span>
            <span>🎯 Cancel anytime</span>
            <span>💰 7-day refund guarantee</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default MentorshipIntro;
