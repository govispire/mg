import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Trophy, 
  Target, 
  Users, 
  ChevronRight, 
  Quote, 
  Sparkles, 
  CheckCircle2, 
  Award, 
  UserCheck, 
  BookOpen, 
  ArrowRight,
  Star
} from 'lucide-react';

interface TopperFeatured {
  id: string;
  name: string;
  avatar: string;
  exam: string;
  rank: string;
  score: string;
  timeframe: string;
  headline: string;
  keyStrategy: string;
  mentorName: string;
  mentorRole: string;
  readTime: string;
  category: string;
}

interface SuccessStory {
  id: string;
  name: string;
  avatar: string;
  exam: string;
  examYear: string;
  rank: string;
  category: string;
  headline: string;
  keyTakeaway: string;
  mentorShoutout: string;
  mentorAvatar: string;
  attempts: string;
  background: string;
  readTime: string;
  fullStory: string;
}

const TOPPERS_OF_MONTH: TopperFeatured[] = [
  {
    id: 'top-1',
    name: 'Ananya Sharma',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face',
    exam: 'SBI PO 2025',
    rank: 'AIR 14',
    score: '78.5 / 100',
    timeframe: '100 Days Prep',
    headline: 'How Ananya cleared SBI PO in 100 Days',
    keyStrategy: 'Switched from reading theory all day to analyzing 2 mock tests daily with mentor feedback.',
    mentorName: 'Rajesh Verma',
    mentorRole: 'Ex-SBI PO (12+ Yrs Exp)',
    readTime: '4 min read',
    category: 'banking'
  },
  {
    id: 'top-2',
    name: 'Vikramaditya Roy',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    exam: 'UPSC CSE 2024',
    rank: 'AIR 28',
    score: 'Rank 28 (IAS)',
    timeframe: 'Working Professional',
    headline: 'Cracking UPSC CSE while working 9-to-5',
    keyStrategy: 'Dedicated 3 focused hours daily + weekend full-length answer writing reviews with Examerit mentor.',
    mentorName: 'Dr. S. K. Nambiar',
    mentorRole: 'Retd. IAS Officer',
    readTime: '6 min read',
    category: 'upsc'
  },
  {
    id: 'top-3',
    name: 'Pooja Deshmukh',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    exam: 'SSC CGL 2024',
    rank: 'AIR 05',
    score: '342 / 390',
    timeframe: 'First Attempt',
    headline: 'Secured AIR 5 in SSC CGL on First Attempt',
    keyStrategy: 'Mastered Quant short tricks and daily vocabulary drills on Examerit dashboard.',
    mentorName: 'Amit Trivedi',
    mentorRole: 'SSC Topper Mentor',
    readTime: '5 min read',
    category: 'ssc'
  }
];

const SUCCESS_STORIES: SuccessStory[] = [
  {
    id: 's1',
    name: 'Rohan Mehta',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=120&h=120&fit=crop&crop=face',
    exam: 'IBPS PO 2025',
    examYear: '2025',
    rank: 'AIR 42',
    category: 'banking',
    headline: 'Overcoming Quant Anxiety to Rank in Top 50',
    keyTakeaway: 'Focused 80% on mock test analysis over new topic reading. Spent 2 hours reviewing every wrong answer.',
    mentorShoutout: 'Guided by Mentor Priya Nair (Ex-IBPS PO)',
    mentorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    attempts: '2nd Attempt',
    background: 'B.Com Graduate',
    readTime: '5 min read',
    fullStory: 'In my first attempt, I scored poorly in Quant. With Examerit mentor Priya, we identified my exact weak areas in Data Interpretation and rebuilt my strategy from scratch.'
  },
  {
    id: 's2',
    name: 'Sneha Kulkarni',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=120&h=120&fit=crop&crop=face',
    exam: 'RBI Grade B 2024',
    examYear: '2024',
    rank: 'AIR 18',
    category: 'banking',
    headline: 'From IT Software Engineer to RBI Officer',
    keyTakeaway: 'Structured daily 2-hour morning prep before office hours and weekly 1-on-1 mentor strategy calls.',
    mentorShoutout: 'Guided by Mentor Alok Pandey (RBI Retd.)',
    mentorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    attempts: '1st Attempt',
    background: 'Software Engineer',
    readTime: '4 min read',
    fullStory: 'Balancing a software job with RBI Grade B was tough. My mentor created a customized evening revision timeline that maximized retention.'
  },
  {
    id: 's3',
    name: 'Karan Malhotra',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=120&h=120&fit=crop&crop=face',
    exam: 'SSC CGL 2024',
    examYear: '2024',
    rank: 'AIR 12',
    category: 'ssc',
    headline: 'How I Improved My Speed by 40% in Reasoning & Quant',
    keyTakeaway: 'Utilized timed sectional quizzes and eliminated silly calculation errors through daily error log maintenance.',
    mentorShoutout: 'Guided by Mentor Vikas Gupta (Assistant Audit Officer)',
    mentorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=face',
    attempts: '1st Attempt',
    background: 'B.Sc Physics',
    readTime: '6 min read',
    fullStory: 'Reasoning speed was my biggest bottleneck. Vikas Sir gave me specific elimination techniques for puzzle solving that shaved off 15 minutes.'
  },
  {
    id: 's4',
    name: 'Divya Ranganathan',
    avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=120&h=120&fit=crop&crop=face',
    exam: 'UPSC CSE 2024',
    examYear: '2024',
    rank: 'AIR 64',
    category: 'upsc',
    headline: 'Mastering Answer Writing for GS Mains Papers',
    keyTakeaway: 'Submitted 3 mains answers daily for mentor evaluation. Focused on diagrammatic representation and crisp intro-body-conclusions.',
    mentorShoutout: 'Guided by Mentor S. K. Nambiar (Retd. IAS)',
    mentorAvatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=100&h=100&fit=crop&crop=face',
    attempts: '2nd Attempt',
    background: 'MA Public Admin',
    readTime: '7 min read',
    fullStory: 'Mains answer writing requires structured presentation. Nambiar Sir reviewed over 150 of my test copies with precise margin notes.'
  },
  {
    id: 's5',
    name: 'Aditya Chawla',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=120&h=120&fit=crop&crop=face',
    exam: 'RRB NTPC 2024',
    examYear: '2024',
    rank: 'AIR 09',
    category: 'railway',
    headline: 'Securing Rank 9 in Railway Recruitment Board Exam',
    keyTakeaway: 'Mastered General Awareness and Current Affairs through Examerit daily vocabulary & quiz challenges.',
    mentorShoutout: 'Guided by Mentor Ramesh Chandra (Railway Admin)',
    mentorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    attempts: '1st Attempt',
    background: 'Diploma Engineer',
    readTime: '4 min read',
    fullStory: 'Consistent daily mock tests combined with Examerit performance analytics helped me identify my weak topics early on.'
  },
  {
    id: 's6',
    name: 'Meera Pillai',
    avatar: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=120&h=120&fit=crop&crop=face',
    exam: 'SBI Clerk 2024',
    examYear: '2024',
    rank: 'AIR 03',
    category: 'banking',
    headline: 'From Home Tutor to Top Ranker in Banking',
    keyTakeaway: 'Followed a strict daily checklist of 4 hours theory + 2 hours full mock test practice without missing a single day.',
    mentorShoutout: 'Guided by Mentor Sunita Rao (Senior Banking Mentor)',
    mentorAvatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&h=100&fit=crop&crop=face',
    attempts: '1st Attempt',
    background: 'B.Sc Mathematics',
    readTime: '5 min read',
    fullStory: 'Balancing home tutoring with competitive prep required extreme discipline. Examerit mentor Sunita Rao provided the perfect roadmap.'
  }
];

const CATEGORY_TAGS = [
  { id: 'all', label: 'All Stories' },
  { id: 'banking', label: 'Banking & Insurance' },
  { id: 'quant-strategy', label: 'Quantitative Aptitude Strategies' },
  { id: 'working-prof', label: 'Working Professionals' },
  { id: 'upsc', label: 'UPSC & Civil Services' },
  { id: 'ssc', label: 'SSC & Railways' },
];

const SuccessStoriesPage: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [activeTopperIndex, setActiveTopperIndex] = useState(0);
  const [selectedStoryModal, setSelectedStoryModal] = useState<SuccessStory | null>(null);

  const activeTopper = TOPPERS_OF_MONTH[activeTopperIndex];

  const filteredStories = SUCCESS_STORIES.filter(s => {
    if (selectedCategory === 'all') return true;
    if (selectedCategory === 'banking') return s.category === 'banking';
    if (selectedCategory === 'upsc') return s.category === 'upsc';
    if (selectedCategory === 'ssc') return s.category === 'ssc' || s.category === 'railway';
    if (selectedCategory === 'working-prof') return s.background.includes('Engineer') || s.background.includes('Professional');
    if (selectedCategory === 'quant-strategy') return s.keyTakeaway.toLowerCase().includes('quant') || s.keyTakeaway.toLowerCase().includes('mock');
    return true;
  });

  return (
    <div className="space-y-8 pb-12">
      {/* ── 1. HERO HEADER: Featured Toppers of the Month ── */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 text-white p-6 sm:p-8 lg:p-10 shadow-xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Header Label */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 bg-amber-500/20 border border-amber-400/40 text-amber-300 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider">
              <Trophy className="w-3.5 h-3.5 fill-amber-300 text-amber-300" />
              Toppers of the Month
            </span>
            <span className="text-xs text-slate-400 font-medium hidden sm:inline">• Real Aspirant Journeys</span>
          </div>

          {/* Carousel dots */}
          <div className="flex items-center gap-1.5">
            {TOPPERS_OF_MONTH.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setActiveTopperIndex(idx)}
                className={`h-2 rounded-full transition-all ${
                  idx === activeTopperIndex ? 'w-6 bg-amber-400' : 'w-2 bg-white/30 hover:bg-white/60'
                }`}
                title={`View Topper ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Featured Topper Hero Card Content */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Avatar & Rank Badge */}
          <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col items-center gap-5 text-center sm:text-left lg:text-center">
            <div className="relative">
              <img
                src={activeTopper.avatar}
                alt={activeTopper.name}
                className="w-28 h-28 sm:w-32 sm:h-32 rounded-2xl object-cover border-4 border-amber-400/80 shadow-2xl"
              />
              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-amber-400 text-slate-950 font-black text-xs px-3 py-1 rounded-full shadow-lg whitespace-nowrap uppercase tracking-wide">
                {activeTopper.rank}
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white">{activeTopper.name}</h2>
              <p className="text-sm font-semibold text-blue-300 mt-0.5">{activeTopper.exam}</p>
              <div className="mt-2 flex flex-wrap justify-center sm:justify-start lg:justify-center gap-1.5">
                <span className="text-[11px] font-bold bg-white/10 border border-white/20 px-2.5 py-0.5 rounded-full text-slate-200">
                  {activeTopper.timeframe}
                </span>
                <span className="text-[11px] font-bold bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 px-2.5 py-0.5 rounded-full">
                  Score: {activeTopper.score}
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Story & Strategy */}
          <div className="lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-1.5 text-xs text-amber-300 font-bold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Featured Success Strategy
            </div>

            <h3 className="text-2xl sm:text-3xl font-black leading-tight text-white">
              "{activeTopper.headline}"
            </h3>

            {/* Key Strategy Highlight Box */}
            <div className="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl p-4 sm:p-5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0 mt-0.5">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider text-amber-300 mb-1">
                    Topper's Winning Mantra
                  </h4>
                  <p className="text-sm sm:text-base text-slate-100 font-medium leading-relaxed">
                    "{activeTopper.keyStrategy}"
                  </p>
                </div>
              </div>
            </div>

            {/* Mentor Attribution & CTA Button */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-blue-400 shrink-0" />
                <span className="text-xs text-slate-300">
                  Mentored by <strong className="text-white font-bold">{activeTopper.mentorName}</strong> ({activeTopper.mentorRole})
                </span>
              </div>

              <Button
                onClick={() => {
                  const match = SUCCESS_STORIES.find(s => s.name.includes(activeTopper.name.split(' ')[0]));
                  if (match) setSelectedStoryModal(match);
                  else setSelectedStoryModal(SUCCESS_STORIES[0]);
                }}
                className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl shadow-lg transition-all"
              >
                <span>Read Strategy</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. CATEGORY & STRATEGY FILTERS ── */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Topper Strategy Library
            </h2>
            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-0.5">
              Filter by exam stream, strategy focus, or preparation profile
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {filteredStories.length} Stories Available
          </span>
        </div>

        {/* Pill tags */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
          {CATEGORY_TAGS.map(tag => {
            const isActive = selectedCategory === tag.id;
            return (
              <button
                key={tag.id}
                onClick={() => setSelectedCategory(tag.id)}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                  isActive
                    ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                {tag.label}
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 3. STORY CARDS GRID ── */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredStories.map(story => (
          <Card
            key={story.id}
            className="bg-white border border-slate-200/90 shadow-sm hover:shadow-md hover:border-blue-200 transition-all rounded-2xl overflow-hidden flex flex-col group"
          >
            <CardContent className="p-5 flex-1 flex flex-col space-y-4">
              {/* Header: Student Avatar + Name + Exam Cleared Tag */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img
                    src={story.avatar}
                    alt={story.name}
                    className="w-11 h-11 rounded-full object-cover border-2 border-slate-100 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-slate-900 text-base leading-tight group-hover:text-blue-600 transition-colors">
                      {story.name}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] font-semibold text-slate-500">{story.exam}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-[11px] font-medium text-slate-400">{story.readTime}</span>
                    </div>
                  </div>
                </div>

                {/* Soft Gold/Amber Rank Badge (#FEF3C7 background with #D97706 text) */}
                <span className="shrink-0 bg-amber-50 border border-amber-200 text-amber-800 font-extrabold text-[11px] px-2.5 py-1 rounded-full flex items-center gap-1 shadow-2xs">
                  <Trophy className="w-3 h-3 text-amber-600 fill-amber-500" />
                  {story.rank}
                </span>
              </div>

              {/* Story Headline */}
              <h4 className="font-extrabold text-slate-800 text-sm leading-snug">
                "{story.headline}"
              </h4>

              {/* Key Takeaways / Highlights Bullet Box */}
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5 space-y-1.5">
                <div className="text-[10px] font-black uppercase tracking-wider text-slate-500 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  Key Strategy Highlight
                </div>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">
                  "{story.keyTakeaway}"
                </p>
              </div>

              {/* Mentor Shoutout Tag */}
              <div className="flex items-center justify-between pt-1 text-xs">
                <div className="flex items-center gap-2">
                  <img
                    src={story.mentorAvatar}
                    alt="Mentor"
                    className="w-5 h-5 rounded-full object-cover border border-slate-200"
                  />
                  <span className="text-[11px] font-semibold text-slate-600 truncate max-w-[200px]">
                    {story.mentorShoutout}
                  </span>
                </div>
              </div>

              {/* Action CTA Button */}
              <div className="pt-2 mt-auto">
                <Button
                  onClick={() => setSelectedStoryModal(story)}
                  variant="outline"
                  className="w-full justify-between border-slate-200 hover:border-blue-600 hover:bg-blue-50 text-blue-600 font-bold text-xs rounded-xl h-9"
                >
                  <span>Read Full Strategy</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>

      {/* ── 4. STORY DETAILS MODAL ── */}
      {selectedStoryModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={selectedStoryModal.avatar}
                  alt={selectedStoryModal.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-amber-400"
                />
                <div>
                  <h3 className="text-xl font-black text-slate-900">{selectedStoryModal.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {selectedStoryModal.exam} • {selectedStoryModal.background}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStoryModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Rank Highlight */}
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-2xl p-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-400 text-slate-950 font-black">
                  <Trophy className="w-5 h-5 fill-slate-950" />
                </div>
                <div>
                  <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Exam Rank Cleared</span>
                  <p className="text-lg font-black text-amber-950">{selectedStoryModal.rank} ({selectedStoryModal.exam})</p>
                </div>
              </div>
              <span className="text-xs font-bold bg-white text-slate-700 px-3 py-1 rounded-full border border-amber-200">
                {selectedStoryModal.attempts}
              </span>
            </div>

            {/* Full Story Content */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold text-slate-900 leading-snug">
                "{selectedStoryModal.headline}"
              </h4>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-2">
                <span className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-600" />
                  Key Strategy & Daily Routine
                </span>
                <p className="text-sm text-slate-700 font-medium leading-relaxed">
                  {selectedStoryModal.keyTakeaway}
                </p>
              </div>

              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Detailed Journey</span>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {selectedStoryModal.fullStory}
                </p>
              </div>

              {/* Mentor Attribution */}
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
                <img
                  src={selectedStoryModal.mentorAvatar}
                  alt="Mentor"
                  className="w-10 h-10 rounded-full object-cover border border-indigo-200 shrink-0"
                />
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">Examerit Mentorship Program</span>
                  <p className="text-xs font-bold text-slate-800">{selectedStoryModal.mentorShoutout}</p>
                </div>
              </div>
            </div>

            {/* Close CTA */}
            <div className="pt-2">
              <Button
                onClick={() => setSelectedStoryModal(null)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold h-11 rounded-xl"
              >
                Close Story
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuccessStoriesPage;
