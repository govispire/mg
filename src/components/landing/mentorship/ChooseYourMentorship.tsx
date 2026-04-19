import React, { useState } from 'react';
import { User, Brain, Lightbulb, BookOpen, Globe2, Monitor, ArrowRight, Check } from 'lucide-react';

const mentorshipPlans = [
  {
    title: 'Overall Mentor',
    desc: 'Complete guidance for your entire exam journey',
    icon: User,
    color: 'text-purple-600',
    border: 'border-purple-200',
    hoverBorder: 'hover:border-purple-500',
    iconBg: 'bg-purple-50',
    textColor: 'text-purple-600',
    badgeBg: 'bg-purple-100',
    active: true,
    features: ['All subjects covered', 'Daily tasks & schedule', 'Weekly 1-on-1 review', 'Exam strategy & tips'],
    ideal: 'SBI PO, IBPS PO, RBI Grade B',
  },
  {
    title: 'Quant Expert',
    desc: 'Master Mathematics & Data Interpretation fast',
    icon: Brain,
    color: 'text-orange-500',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-orange-500',
    iconBg: 'bg-orange-50',
    textColor: 'text-orange-500',
    badgeBg: 'bg-orange-100',
    active: false,
    features: ['500+ shortcut techniques', 'DI pattern mastering', 'Daily QA drills', 'Speed & accuracy boost'],
    ideal: 'SBI PO, CAT, SSC CGL',
  },
  {
    title: 'Reasoning Expert',
    desc: 'Boost accuracy & logical thinking skills',
    icon: Lightbulb,
    color: 'text-teal-500',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-teal-500',
    iconBg: 'bg-teal-50',
    textColor: 'text-teal-500',
    badgeBg: 'bg-teal-100',
    active: false,
    features: ['Puzzle & seating arrangement', 'Coding-decoding mastery', 'Pattern recognition', 'Error-free approach'],
    ideal: 'IBPS Clerk, SBI Clerk, RRB',
  },
  {
    title: 'English Mentor',
    desc: 'Language, grammar & reading comprehension',
    icon: BookOpen,
    color: 'text-blue-500',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-blue-500',
    iconBg: 'bg-blue-50',
    textColor: 'text-blue-500',
    badgeBg: 'bg-blue-100',
    active: false,
    features: ['Grammar crash course', 'RC strategies', 'Vocabulary building', 'Error correction mastery'],
    ideal: 'SBI Clerk, IBPS Clerk, SSC',
  },
  {
    title: 'GK Expert',
    desc: 'Current Affairs, Banking & Static GK mastery',
    icon: Globe2,
    color: 'text-indigo-500',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-indigo-500',
    iconBg: 'bg-indigo-50',
    textColor: 'text-indigo-500',
    badgeBg: 'bg-indigo-100',
    active: false,
    features: ['Daily CA digest', 'Banking awareness', 'Static GK shortcuts', 'Monthly mock GK tests'],
    ideal: 'SSC CGL, SBI PO, UPSC',
  },
  {
    title: 'Computer Expert',
    desc: 'Computer Awareness for banking exams',
    icon: Monitor,
    color: 'text-pink-500',
    border: 'border-slate-200',
    hoverBorder: 'hover:border-pink-500',
    iconBg: 'bg-pink-50',
    textColor: 'text-pink-500',
    badgeBg: 'bg-pink-100',
    active: false,
    features: ['MS Office & basics', 'Networking concepts', 'Internet security', 'Previous year Q-bank'],
    ideal: 'SBI Clerk, IBPS Clerk, RRB',
  },
];

const ChooseYourMentorship = () => {
  const [selected, setSelected] = useState(0);

  return (
    <section className="py-20 bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">
            Choose Your <span className="text-indigo-600">Mentorship</span>
          </h2>
          <p className="text-lg text-slate-600 font-medium">
            Featuring top experts like <span className="font-bold text-indigo-600">Mr. Muniyarasan</span> & <span className="font-bold text-indigo-600">Mr. MG</span>
          </p>
        </div>

        {/* Grid of plan cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {mentorshipPlans.map((plan, i) => {
            const Icon = plan.icon;
            const isSelected = selected === i;
            return (
              <div 
                key={i} 
                onClick={() => setSelected(i)}
                className={`bg-white rounded-2xl p-6 flex flex-col cursor-pointer transition-all duration-300 border-2 shadow-sm hover:shadow-lg ${isSelected ? `${plan.border} shadow-md` : 'border-slate-200'} ${plan.hoverBorder}`}
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-14 h-14 rounded-2xl ${plan.iconBg} flex items-center justify-center flex-shrink-0`}>
                    <Icon className={`w-7 h-7 ${plan.color}`} strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900 leading-tight">{plan.title}</h3>
                    <p className="text-sm text-slate-500 mt-0.5">{plan.desc}</p>
                  </div>
                </div>

                <div className="space-y-2 mb-5">
                  {plan.features.map((f, j) => (
                    <div key={j} className="flex items-center gap-2.5">
                      <div className={`w-4 h-4 rounded-full ${plan.badgeBg} flex items-center justify-center flex-shrink-0`}>
                        <Check className={`w-2.5 h-2.5 ${plan.textColor}`} strokeWidth={3} />
                      </div>
                      <span className="text-xs font-semibold text-slate-600">{f}</span>
                    </div>
                  ))}
                </div>

                <div className={`text-[10px] font-bold ${plan.badgeBg} ${plan.textColor} px-3 py-1.5 rounded-full inline-flex items-center gap-1 self-start mb-4`}>
                  🎯 Ideal for: {plan.ideal}
                </div>

                <div className={`mt-auto flex items-center gap-2 font-bold text-sm ${isSelected ? plan.textColor : 'text-slate-400'} transition-colors`}>
                  Select This Plan <ArrowRight className="w-4 h-4" />
                </div>

                {isSelected && (
                  <div className={`mt-3 w-full h-1 rounded-full ${plan.iconBg.replace('50','400').replace('bg-', 'bg-')}`}></div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <button 
            className="inline-flex items-center gap-2 bg-[#5b51ff] hover:bg-[#4a42ff] text-white font-bold px-8 py-4 rounded-2xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg text-base"
            onClick={() => document.getElementById('free-assessment')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Start with Free Assessment <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default ChooseYourMentorship;
