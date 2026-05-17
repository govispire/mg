import React, { useState } from 'react';
import { ArrowRight, Check, Crown, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const plans = [
  {
    name: 'Starter',
    priceMonthly: 299,
    desc: 'Perfect for beginners who want to explore mentorship',
    icon: Zap,
    color: 'text-teal-600',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    buttonColor: 'border-teal-500 text-teal-600 hover:bg-teal-50',
    features: [
      'Access to 1 subject mentor',
      'Personalized study plan',
      'Daily task tracking',
      'Weekly progress report',
      'Doubt clearing: 5 sessions/month',
      'Subject mock tests',
    ],
    missing: ['Overall mentorship', '1-on-1 review sessions', 'Priority support'],
  },
  {
    name: 'Pro',
    priceMonthly: 499,
    desc: 'Most popular plan for complete exam preparation support',
    icon: Crown,
    color: 'text-white',
    bgColor: 'bg-[#5b51ff]',
    borderColor: 'border-[#5b51ff]',
    buttonColor: 'bg-white text-[#5b51ff] hover:bg-slate-50',
    popular: true,
    features: [
      'Dedicated overall mentor',
      'Data-driven personalized plan',
      'Daily task tracking and reminders',
      'Weekly 1-on-1 review sessions',
      'Unlimited doubt clearing',
      'All subject mock tests',
      '24/7 mentor chat access',
      'Performance analytics dashboard',
    ],
    missing: [],
  },
  {
    name: 'Elite',
    priceMonthly: 799,
    desc: 'For serious aspirants targeting top selections',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    buttonColor: 'border-amber-500 text-amber-600 hover:bg-amber-50',
    features: [
      'Everything in Pro',
      '2 expert mentors: overall + subject',
      'Interview guidance',
      'GK and current affairs live classes',
      'Exam-day strategy session',
      'Emergency 24/7 support',
      'Career counseling',
      'Bank job alerts and notifications',
    ],
    missing: [],
  },
];

const scrollToAssessment = () => {
  document.getElementById('free-assessment')?.scrollIntoView({ behavior: 'smooth' });
};

const formatPrice = (value: number) => `Rs. ${value.toLocaleString('en-IN')}`;

const MentorshipPlans = () => {
  const [billing, setBilling] = useState<'monthly' | 'quarterly'>('monthly');

  return (
    <section className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-24">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-4 py-2">
            <span className="text-sm font-semibold text-indigo-900">Affordable mentorship plans</span>
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Choose Your <span className="text-[#5b51ff]">Mentorship Plan</span>
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-lg text-slate-600">
            Start with a free assessment, then choose the support level that fits your exam timeline and budget.
          </p>

          <div className="inline-flex items-center rounded-full border border-slate-200 bg-white p-1 shadow-sm">
            <button
              onClick={() => setBilling('monthly')}
              className={`rounded-full px-5 py-2 text-sm font-bold transition-all ${billing === 'monthly' ? 'bg-[#5b51ff] text-white' : 'text-slate-600'}`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('quarterly')}
              className={`flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold transition-all ${billing === 'quarterly' ? 'bg-[#5b51ff] text-white' : 'text-slate-600'}`}
            >
              Quarterly <span className="rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-bold text-white">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {plans.map(plan => {
            const Icon = plan.icon;
            const isPro = Boolean(plan.popular);
            const monthlyEquivalent = billing === 'quarterly'
              ? Math.round(plan.priceMonthly * 0.8)
              : plan.priceMonthly;
            const quarterlyTotal = Math.round(plan.priceMonthly * 3 * 0.8);

            return (
              <div
                key={plan.name}
                className={`relative rounded-3xl border-2 p-8 transition-all hover:shadow-xl ${plan.borderColor} ${isPro ? `${plan.bgColor} scale-105 shadow-2xl shadow-indigo-200` : 'bg-white shadow-sm'}`}
              >
                {isPro && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 px-5 py-1.5 text-xs font-extrabold text-white shadow-md">
                    Most Popular
                  </div>
                )}

                <div className={`mb-6 flex h-12 w-12 items-center justify-center rounded-2xl ${isPro ? 'bg-white/20' : plan.bgColor}`}>
                  <Icon className={`h-6 w-6 ${plan.color}`} />
                </div>

                <h3 className={`mb-1 text-2xl font-extrabold ${isPro ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`mb-6 text-sm ${isPro ? 'text-indigo-200' : 'text-slate-500'}`}>{plan.desc}</p>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className={`text-4xl font-extrabold ${isPro ? 'text-white' : 'text-slate-900'}`}>
                      {formatPrice(monthlyEquivalent)}
                    </span>
                    <span className={`text-sm ${isPro ? 'text-indigo-200' : 'text-slate-500'}`}>/month</span>
                  </div>
                  {billing === 'quarterly' && (
                    <p className={`mt-1 text-xs ${isPro ? 'text-indigo-200' : 'text-slate-500'}`}>
                      Billed quarterly: {formatPrice(quarterlyTotal)}
                    </p>
                  )}
                </div>

                <Button
                  className={`mb-8 h-12 w-full rounded-2xl border-2 font-bold ${plan.buttonColor}`}
                  variant={isPro ? 'default' : 'outline'}
                  onClick={scrollToAssessment}
                >
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>

                <div className="space-y-3">
                  {plan.features.map(feature => (
                    <div key={feature} className="flex items-center gap-3">
                      <div className={`flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${isPro ? 'bg-white/20' : 'bg-green-100'}`}>
                        <Check className={`h-3 w-3 ${isPro ? 'text-white' : 'text-green-600'}`} strokeWidth={3} />
                      </div>
                      <span className={`text-sm font-semibold ${isPro ? 'text-white/90' : 'text-slate-700'}`}>{feature}</span>
                    </div>
                  ))}
                  {plan.missing.map(feature => (
                    <div key={feature} className="flex items-center gap-3 opacity-40">
                      <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-slate-100">
                        <span className="text-xs text-slate-400">x</span>
                      </div>
                      <span className="text-sm font-semibold text-slate-500 line-through">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-slate-500">
          All plans include a <strong>7-day free trial</strong>. Cancel anytime. No hidden charges.
        </p>
      </div>
    </section>
  );
};

export default MentorshipPlans;
