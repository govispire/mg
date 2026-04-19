import React from 'react';
import { ClipboardList, UserCheck, CalendarCheck, TrendingUp } from 'lucide-react';

const steps = [
  {
    num: "01",
    title: "Take Free Assessment",
    desc: "5-min diagnostic test",
    icon: ClipboardList,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
    badgeColor: "bg-purple-500",
  },
  {
    num: "02",
    title: "Get Matched with Your Mentor",
    desc: "Based on your goals",
    icon: UserCheck,
    color: "text-teal-600",
    bgColor: "bg-teal-100",
    badgeColor: "bg-teal-500",
  },
  {
    num: "03",
    title: "Receive Your Personal Plan",
    desc: "Daily tasks & schedule",
    icon: CalendarCheck,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
    badgeColor: "bg-orange-400",
  },
  {
    num: "04",
    title: "Track & Improve Daily",
    desc: "With weekly reviews",
    icon: TrendingUp,
    color: "text-pink-600",
    bgColor: "bg-pink-100",
    badgeColor: "bg-pink-400",
  }
];

const HowItWorks = () => {
  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-extrabold text-center text-slate-900 mb-16">
          How <span className="text-indigo-600">PrepSmart</span> Mentorship Works
        </h2>

        <div className="relative">
          {/* Connecting Dashed Line for Desktop */}
          <div className="hidden md:block absolute top-12 left-[10%] right-[10%] h-0.5 border-t-2 border-dashed border-slate-200 z-0"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-6 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={index} className="flex flex-col items-center text-center">
                  {/* Icon Circle */}
                  <div className={`w-24 h-24 rounded-full ${step.bgColor} flex items-center justify-center relative mb-6 shadow-sm border border-white mx-auto`}>
                    <Icon className={`w-10 h-10 ${step.color}`} strokeWidth={1.5} />
                    
                    {/* Number Badge */}
                    <div className={`absolute -bottom-3 ${step.badgeColor} text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full border-2 border-white shadow-sm`}>
                      {step.num}
                    </div>
                  </div>

                  {/* Text */}
                  <h3 className="text-lg font-bold text-slate-900 leading-tight mb-2">
                    {index === 1 ? (
                      <>Get Matched with <br/> Your Mentor</>
                    ) : index === 2 ? (
                      <>Receive Your <br/> Personal Plan</>
                    ) : (
                      step.title
                    )}
                  </h3>
                  <p className="text-sm text-slate-500 font-medium">
                    {step.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
