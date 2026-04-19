import React, { useState } from 'react';
import { Check, Zap, Crown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    price: '₹299',
    period: '/month',
    desc: 'Perfect for beginners who want to explore mentorship',
    icon: Zap,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    buttonColor: 'border-teal-500 text-teal-600 hover:bg-teal-50',
    features: [
      'Access to 1 Subject Mentor',
      'Personalized Study Plan',
      'Daily Task Tracking',
      'Weekly Progress Report',
      'Doubt Clearing (5 sessions/month)',
      'Subject Mock Tests',
    ],
    missing: ['Overall Mentorship', '1-on-1 Sessions', 'Priority Support'],
  },
  {
    name: 'Pro',
    price: '₹499',
    period: '/month',
    desc: 'Most popular — complete exam preparation support',
    icon: Crown,
    color: 'text-white',
    bgColor: 'bg-[#5b51ff]',
    borderColor: 'border-[#5b51ff]',
    buttonColor: 'bg-white text-[#5b51ff] hover:bg-slate-50',
    popular: true,
    features: [
      'Dedicated Overall Mentor',
      'Data-driven Personalized Plan',
      'Daily Task Tracking & Reminders',
      'Weekly 1-on-1 Review Sessions',
      'Unlimited Doubt Clearing',
      'All Subject Mock Tests',
      '24/7 Mentor Chat Access',
      'Performance Analytics Dashboard',
    ],
    missing: [],
  },
  {
    name: 'Elite',
    price: '₹799',
    period: '/month',
    desc: 'For serious aspirants targeting top selections',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    buttonColor: 'border-amber-500 text-amber-600 hover:bg-amber-50',
    features: [
      'Everything in Pro',
      '2 Expert Mentors (Overall + Subject)',
      'Interview Guidance',
      'GK & Current Affairs Live Classes',
      'Exam-day Strategy Session',
      'Emergency 24/7 Support',
      'Career Counseling',
      'Bank Job Alert & Notification',
    ],
    missing: [],
  },
];

const MentorshipPlans = () => {
  const [billing, setBilling] = useState<'monthly' | 'quarterly'>('monthly');

  return (
    <section className="py-24 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 mb-5">
            <span className="text-sm font-semibold text-indigo-900">💰 Affordable Mentorship Plans</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Choose Your <span className="text-[#5b51ff]">Mentorship Plan</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto mb-8">
            Start with a free assessment and then choose a plan that fits your exam timeline and budget.
          </p>
          {/* Billing Toggle */}
          <div className="inline-flex items-center bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-[#5b51ff] text-white' : 'text-slate-600'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('quarterly')}
              className={`px-5 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${billing === 'quarterly' ? 'bg-[#5b51ff] text-white' : 'text-slate-600'}`}
            >
              Quarterly <span className="text-[10px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">Save 20%</span>
            </button>
          </div>
        </div>

        {/* Plan Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const isPro = plan.popular;
            return (
              <div
                key={i}
                className={`relative rounded-3xl border-2 ${plan.borderColor} ${isPro ? plan.bgColor : 'bg-white'} p-8 transition-all hover:shadow-xl ${isPro ? 'shadow-2xl shadow-indigo-200 scale-105' : 'shadow-sm'}`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-400 to-yellow-400 text-white text-xs font-extrabold px-5 py-1.5 rounded-full shadow-md">
                    ⭐ Most Popular
                  </div>
                )}

                <div className={`w-12 h-12 rounded-2xl ${isPro ? 'bg-white/20' : plan.bgColor} flex items-center justify-center mb-6`}>
                  <Icon className={`w-6 h-6 ${plan.color}`} />
                </div>

                <h3 className={`text-2xl font-extrabold mb-1 ${isPro ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm mb-6 ${isPro ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.desc}</p>

                <div className="flex items-baseline gap-1 mb-6">
                  <span className={`text-4xl font-extrabold ${isPro ? 'text-white' : 'text-slate-900'}`}>
                    {billing === 'quarterly' 
                      ? `₹${Math.round(parseInt(plan.price.replace('₹','')) * 0.8)}`
                      : plan.price}
                  </span>
                  <span className={`text-sm ${isPro ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.period}</span>
                </div>

                <Button
                  className={`w-full h-12 rounded-2xl font-bold mb-8 border-2 ${plan.buttonColor}`}
                  variant={isPro ? 'default' : 'outline'}
                  onClick={() => document.getElementById('free-assessment')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="space-y-3">
                  {plan.features.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${isPro ? 'bg-white/20' : 'bg-green-100'}`}>
                        <Check className={`w-3 h-3 ${isPro ? 'text-white' : 'text-green-600'}`} strokeWidth={3} />
                      </div>
                      <span className={`text-sm font-semibold ${isPro ? 'text-white/90' : 'text-slate-700'}`}>{feature}</span>
                    </div>
                  ))}
                  {plan.missing.map((feature, j) => (
                    <div key={j} className="flex items-center gap-3 opacity-40">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 bg-slate-100">
                        <span className="text-slate-400 text-xs">✕</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-slate-500 text-sm mt-10">
          🔒 All plans include a <strong>7-day free trial</strong>. Cancel anytime. No hidden charges.
        </p>
      </div>
    </section>
  );
};

export default MentorshipPlans;
