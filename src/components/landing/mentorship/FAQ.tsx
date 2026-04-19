import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'How does PrepSmart Mentorship work?',
    a: 'After your free assessment, you\'ll be matched with a mentor based on your target exam, strengths, weaknesses, and study schedule. Your mentor creates a personalized daily plan, reviews your progress weekly, and provides 1-on-1 guidance through our platform.',
  },
  {
    q: 'What exams do your mentors cover?',
    a: 'We cover all major competitive exams including SBI PO/Clerk, IBPS PO/Clerk, RBI Grade B, SSC CGL/CHSL/MTS, RRB NTPC/Group D, UPSC, CTET, NDA, CAT, and more. Our 200+ mentors specialize across all these areas.',
  },
  {
    q: 'How is PrepSmart Mentorship different from YouTube or coaching?',
    a: 'Unlike generic YouTube videos or one-size-fits-all coaching, PrepSmart mentors give you a custom study plan based on YOUR specific weaknesses. You get daily tasks, weekly 1-on-1 reviews, and a dedicated mentor who tracks only your progress.',
  },
  {
    q: 'Can I change my mentor if it\'s not working?',
    a: 'Absolutely. You can request a mentor switch at any time within the first 30 days for free. We want you to have the best possible experience and will match you with a better-suited mentor based on your feedback.',
  },
  {
    q: 'Is the Free Assessment really free?',
    a: 'Yes, 100% free — no credit card required. The assessment takes about 5 minutes and gives you a detailed report on your strengths, weaknesses, and a recommended mentor match. No strings attached.',
  },
  {
    q: 'How do I communicate with my mentor?',
    a: 'You can chat with your mentor 24/7 through our platform\'s messaging system. Pro and Elite plan members also get scheduled weekly video call sessions for deeper progress reviews.',
  },
  {
    q: 'What happens if I miss my daily tasks?',
    a: 'Your mentor will be notified automatically and will reach out to help you get back on track. We don\'t penalize — instead, your plan is adjusted to make up for missed topics without disrupting your overall schedule.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'Yes. All paid plans include a 7-day money-back guarantee. If you\'re not satisfied within the first week, we\'ll issue a full refund — no questions asked.',
  },
];

const FAQ = () => {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Frequently Asked <span className="text-[#5b51ff]">Questions</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Everything you need to know about PrepSmart Mentorship. Can't find an answer? Chat with us.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className={`rounded-2xl border-2 overflow-hidden transition-all ${open === i ? 'border-indigo-200 shadow-md' : 'border-slate-100'}`}
            >
              <button
                className="w-full flex items-center justify-between px-6 py-5 text-left"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className={`text-base font-bold ${open === i ? 'text-[#5b51ff]' : 'text-slate-900'}`}>
                  {faq.q}
                </span>
                <ChevronDown
                  className={`h-5 w-5 flex-shrink-0 transition-transform ${open === i ? 'rotate-180 text-[#5b51ff]' : 'text-slate-400'}`}
                />
              </button>
              {open === i && (
                <div className="px-6 pb-5">
                  <p className="text-slate-600 leading-relaxed text-sm">{faq.a}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 bg-indigo-50 rounded-3xl p-8 text-center border border-indigo-100">
          <p className="text-slate-700 font-semibold mb-3">Still have questions?</p>
          <p className="text-slate-500 text-sm mb-5">Our team is available 24/7 to help you find the right mentor.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <a href="tel:+918012345678" className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 font-bold px-6 py-3 rounded-2xl text-sm hover:shadow-md transition-all">
              📞 +91 80123 45678
            </a>
            <a href="mailto:mentorship@prepsmart.in" className="inline-flex items-center gap-2 bg-[#5b51ff] text-white font-bold px-6 py-3 rounded-2xl text-sm hover:bg-[#4a42ff] transition-all">
              ✉️ mentorship@prepsmart.in
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
