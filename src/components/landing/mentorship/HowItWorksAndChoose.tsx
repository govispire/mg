import React from 'react';
import { ClipboardList, UserCheck, CalendarCheck, TrendingUp, User, Brain, Lightbulb, BookOpen, ArrowRight } from 'lucide-react';

const steps = [
  {
    num: '01',
    title: 'Take Free\nAssessment',
    desc: '5-min diagnostic test',
    icon: ClipboardList,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-100',
    badgeBg: 'bg-purple-500',
  },
  {
    num: '02',
    title: 'Get Matched with\nYour Mentor',
    desc: 'Based on your goals',
    icon: UserCheck,
    iconColor: 'text-teal-600',
    iconBg: 'bg-teal-100',
    badgeBg: 'bg-teal-500',
  },
  {
    num: '03',
    title: 'Receive Your\nPersonal Plan',
    desc: 'Daily tasks & schedule',
    icon: CalendarCheck,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-100',
    badgeBg: 'bg-orange-400',
  },
  {
    num: '04',
    title: 'Track &\nImprove Daily',
    desc: 'With weekly reviews',
    icon: TrendingUp,
    iconColor: 'text-pink-500',
    iconBg: 'bg-pink-100',
    badgeBg: 'bg-pink-400',
  },
];

const mentorTypes = [
  {
    title: 'Overall\nMentor',
    desc: 'Complete guidance',
    icon: User,
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50',
    active: true,
  },
  {
    title: 'Quant\nExpert',
    desc: 'Master Mathematics',
    icon: Brain,
    iconColor: 'text-orange-500',
    iconBg: 'bg-orange-50',
    active: false,
  },
  {
    title: 'Reasoning\nExpert',
    desc: 'Boost accuracy',
    icon: Lightbulb,
    iconColor: 'text-teal-500',
    iconBg: 'bg-teal-50',
    active: false,
  },
  {
    title: 'English\nMentor',
    desc: 'Language & Grammar',
    icon: BookOpen,
    iconColor: 'text-blue-500',
    iconBg: 'bg-blue-50',
    active: false,
  },
];

/** This single section renders "How It Works" (left) + "Choose Your Mentorship" (right) side-by-side,
 *  against the same lavender background as the hero — exactly matching the reference image. */
const HowItWorksAndChoose = () => {
  return (
    <section
      style={{ background: 'linear-gradient(135deg, #eef0ff 0%, #f5f0ff 40%, #ede8ff 100%)' }}
      className="py-16"
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-10">
        <div className="grid grid-cols-12 gap-10 items-start">

          {/* ══ LEFT: How It Works ══ */}
          <div className="col-span-12 lg:col-span-7">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-10 text-center">
              How <span className="text-[#5b51ff]">PrepSmart</span> Mentorship Works
            </h2>

            {/* Steps row */}
            <div className="relative">
              {/* Dashed connector line */}
              <div className="absolute top-[42px] left-[calc(12.5%+20px)] right-[calc(12.5%+20px)] h-px border-t-2 border-dashed border-slate-300/60 z-0 hidden md:block"></div>

              <div className="grid grid-cols-4 gap-3 relative z-10">
                {steps.map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="flex flex-col items-center text-center">
                      {/* Circle icon */}
                      <div
                        className={`w-[84px] h-[84px] rounded-full ${step.iconBg} flex items-center justify-center relative shadow-sm`}
                      >
                        <Icon className={`w-8 h-8 ${step.iconColor}`} strokeWidth={1.5} />
                        {/* Number badge */}
                        <div
                          className={`absolute -bottom-2.5 ${step.badgeBg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full border-2 border-white`}
                        >
                          {step.num}
                        </div>
                      </div>

                      {/* Text */}
                      <h3 className="text-[13px] font-bold text-slate-900 mt-5 leading-snug whitespace-pre-line">
                        {step.title}
                      </h3>
                      <p className="text-[12px] text-slate-500 mt-1 font-medium">{step.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ══ RIGHT: Choose Your Mentorship ══ */}
          <div className="col-span-12 lg:col-span-5">
            <h2 className="text-2xl font-extrabold text-slate-900 mb-10 text-center lg:text-left">
              Choose Your Mentorship
            </h2>

            {/* 4 cards in a row */}
            <div className="grid grid-cols-4 gap-3">
              {mentorTypes.map((type, i) => {
                const Icon = type.icon;
                return (
                  <div
                    key={i}
                    className={`
                      flex flex-col items-center text-center p-3 rounded-2xl cursor-pointer transition-all
                      ${type.active
                        ? 'bg-white border-2 border-[#5b51ff] shadow-md shadow-indigo-100'
                        : 'bg-white/60 border-2 border-slate-200/60 hover:border-slate-300 hover:bg-white/90'
                      }
                    `}
                  >
                    {/* Icon */}
                    <div className={`w-12 h-12 rounded-xl ${type.iconBg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-6 h-6 ${type.iconColor}`} strokeWidth={1.5} />
                    </div>

                    {/* Title */}
                    <h3 className="text-[12px] font-extrabold text-slate-900 leading-snug whitespace-pre-line">
                      {type.title}
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-1 font-medium leading-tight">{type.desc}</p>

                    {/* Arrow */}
                    <div className={`mt-3 w-6 h-6 rounded-full flex items-center justify-center ${type.active ? 'bg-indigo-50' : 'bg-slate-100'}`}>
                      <ArrowRight className={`w-3.5 h-3.5 ${type.active ? 'text-[#5b51ff]' : 'text-slate-400'}`} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default HowItWorksAndChoose;
