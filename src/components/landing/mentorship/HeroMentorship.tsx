import React from 'react';
import { ArrowRight, Play, Sparkles, BarChart, Users, Star, Trophy, TrendingUp, Check, MessageSquare } from 'lucide-react';

const HeroMentorship = () => {
  return (
    <section
      style={{ background: 'linear-gradient(135deg, #eef0ff 0%, #f5f0ff 40%, #ede8ff 100%)' }}
      className="relative pt-20 pb-0 overflow-hidden"
    >
      {/* Decorative dots */}
      <div className="absolute top-28 right-[38%] w-3 h-3 bg-indigo-400 rounded-full opacity-70"></div>
      <div className="absolute top-52 right-[28%] w-4 h-4 bg-orange-400 rounded-full opacity-60"></div>
      <div className="absolute bottom-32 left-16 w-3 h-3 bg-purple-500 rounded-full opacity-50"></div>
      <div className="absolute top-40 left-[40%] w-2 h-2 bg-indigo-300 rounded-full opacity-60"></div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-6 items-center min-h-[520px]">

          {/* ── LEFT COLUMN ── */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-7 pb-12 space-y-5">

            {/* Badge pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/70 border border-indigo-100 backdrop-blur-sm shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-orange-400 fill-orange-400" />
              <span className="text-[13px] font-semibold text-indigo-800">Personalized Mentorship for Every Aspirant</span>
            </div>

            {/* Headline */}
            <h1 className="text-[44px] sm:text-[56px] lg:text-[62px] font-extrabold text-[#0d0d26] leading-[1.07] tracking-tight">
              Get a Mentor Who<br />
              Knows{' '}
              <span className="relative inline-block text-[#5b51ff]">
                Your
                <span className="absolute bottom-1 left-0 w-full h-[5px] bg-[#5b51ff] rounded-full block"></span>
              </span>
              {' '}
              <span className="text-[#5b51ff]">Exam Path</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[15px] text-slate-600 leading-relaxed max-w-lg">
              Stop guessing what to study. Get a data-driven, personalized plan,<br className="hidden sm:block" />
              daily tasks, and 1-on-1 guidance from expert mentors.
            </p>

            {/* Feature chips — single row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2">
              {[
                'Personalized Study Plan',
                'Daily Task Tracking',
                'Weekly Progress Review',
                'Subject Experts',
              ].map((item) => (
                <div key={item} className="flex items-center gap-2">
                  <div className="w-[18px] h-[18px] rounded-full bg-[#5b51ff] flex items-center justify-center flex-shrink-0">
                    <Check className="h-3 w-3 text-white" strokeWidth={3} />
                  </div>
                  <span className="text-[13px] font-semibold text-slate-700">{item}</span>
                </div>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-1">
              {/* Primary CTA */}
              <button
                onClick={() => document.getElementById('free-assessment')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 bg-[#5b51ff] hover:bg-[#4a42ff] text-white px-6 py-4 rounded-2xl shadow-lg shadow-indigo-200 transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <BarChart className="h-5 w-5 text-white" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] leading-tight flex items-center gap-1.5">
                    Start Free Assessment <ArrowRight className="h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                  </span>
                  <span className="text-[12px] text-indigo-200 font-normal">Know your level in 5 minutes →</span>
                </div>
              </button>

              {/* Secondary CTA */}
              <button
                onClick={() => document.getElementById('mentor-profiles')?.scrollIntoView({ behavior: 'smooth' })}
                className="flex items-center gap-3 bg-white hover:bg-slate-50 border border-slate-200 text-slate-900 px-6 py-4 rounded-2xl shadow-sm transition-all"
              >
                <div className="w-9 h-9 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Play className="h-4 w-4 text-purple-600 fill-purple-600 ml-0.5" />
                </div>
                <div className="flex flex-col items-start">
                  <span className="font-bold text-[15px] leading-tight text-slate-900">View Mentor Profiles</span>
                  <span className="text-[12px] text-slate-500 font-normal">See experts & ratings</span>
                </div>
              </button>
            </div>

            {/* Trust Stats — single row of 4 */}
            <div className="flex flex-wrap gap-x-6 gap-y-3 pt-2">
              {[
                { icon: Users, bg: 'bg-[#fff8e6]', color: 'text-[#f5a623]', val: '25,000+', label: 'Students Mentored' },
                { icon: TrendingUp, bg: 'bg-[#e6fff5]', color: 'text-[#00c875]', val: '94%', label: 'Improvement Rate' },
                { icon: Star, bg: 'bg-[#f3f0ff]', color: 'text-[#825fff]', val: '4.9/5', label: 'Mentor Rating', filled: true },
                { icon: Trophy, bg: 'bg-[#fff0f7]', color: 'text-[#ff5b8e]', val: '200+', label: 'Expert Mentors' },
              ].map(({ icon: Icon, bg, color, val, label, filled }) => (
                <div key={label} className="flex items-center gap-2.5">
                  <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center ${color} flex-shrink-0`}>
                    <Icon className="h-5 w-5" fill={filled ? 'currentColor' : 'none'} />
                  </div>
                  <div>
                    <p className="text-base font-extrabold text-slate-900 leading-tight">{val}</p>
                    <p className="text-[11px] text-slate-500 font-medium leading-none">{label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN ── */}
          <div className="col-span-12 lg:col-span-6 xl:col-span-5 relative flex justify-end items-end self-end h-[460px] lg:h-[520px]">

            {/* Dashed curved arc behind the image */}
            <svg
              className="absolute right-0 top-0 w-full h-full z-0 text-indigo-300/50 pointer-events-none"
              viewBox="0 0 520 520"
              fill="none"
            >
              <path
                d="M 60 490 C 80 120 440 60 470 490"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeDasharray="9 8"
              />
            </svg>

            {/* Main photo — sits at bottom, clipped top */}
            <div className="relative z-10 w-[94%] h-full rounded-t-[28px] overflow-hidden shadow-2xl border-[6px] border-b-0 border-white bg-white">
              <img
                src="https://images.unsplash.com/photo-1543269664-7eef42226a21?auto=format&fit=crop&q=80&w=900&h=700"
                alt="Student with mentor"
                className="w-full h-full object-cover object-top"
              />
            </div>

            {/* Floating Progress Card — top-left of image */}
            <div className="absolute left-0 top-8 z-20 bg-white rounded-2xl px-4 py-3.5 shadow-xl border border-slate-100 flex gap-4 items-center min-w-[220px]">
              {/* Ring */}
              <div className="relative w-14 h-14 flex-shrink-0">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#e8e8f5" strokeWidth="4"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none" stroke="#5b51ff" strokeWidth="4" strokeLinecap="round"
                    strokeDasharray="72, 100"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-[15px] font-extrabold text-slate-800 leading-none">72%</span>
                  <span className="text-[8px] text-slate-400 font-medium mt-0.5">This Week</span>
                </div>
              </div>
              {/* Stats list */}
              <div className="border-l border-slate-100 pl-3 space-y-1.5">
                <p className="text-[12px] font-bold text-slate-800">Your Progress</p>
                {[
                  { color: 'bg-red-400', label: 'Quant - 8/10' },
                  { color: 'bg-emerald-400', label: 'Reasoning - 6/8' },
                  { color: 'bg-yellow-400', label: 'English - 7/10' },
                ].map(({ color, label }) => (
                  <div key={label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full ${color} flex-shrink-0`}></div>
                    <span className="text-[11px] text-slate-600 font-medium">{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Floating Mentor Chat Card — bottom-right of image */}
            <div className="absolute right-4 bottom-16 z-20 bg-white rounded-2xl p-4 shadow-xl border border-slate-100 w-[230px]">
              <div className="flex items-center gap-2.5 mb-2.5 pb-2.5 border-b border-slate-100">
                <div className="relative flex-shrink-0">
                  <img
                    src="https://i.pravatar.cc/150?u=dr_rajesh"
                    alt="Dr. Rajesh Kumar"
                    className="w-9 h-9 rounded-full border-2 border-slate-100"
                  />
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></span>
                </div>
                <div>
                  <p className="text-[13px] font-bold text-slate-900 leading-tight">Dr. Rajesh Kumar</p>
                  <p className="text-[11px] text-green-500 font-semibold">● Online</p>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-300 ml-auto" />
              </div>
              <p className="text-[12px] text-slate-600 leading-relaxed">
                Great job on today's Quant test! Let's focus on{' '}
                <strong className="text-slate-900">Time & Work</strong> tomorrow.
              </p>
            </div>

            {/* Chat bubble button */}
            <div className="absolute right-2 bottom-4 z-30 w-11 h-11 rounded-full bg-[#5b51ff] shadow-lg shadow-indigo-300 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-white fill-white" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroMentorship;
