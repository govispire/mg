import React from 'react';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Kaviya S.',
    exam: 'SBI Clerk 2024',
    result: 'Cleared ✅',
    avatar: 'https://i.pravatar.cc/150?u=kaviya',
    mentor: 'Mentored by Mr. Muniyarasan',
    rating: 5,
    text: 'PrepSmart mentorship changed everything for me. I had failed SBI Clerk twice before. Mr. Muniyarasan gave me a personalized plan that focused on my weakest areas — Quant and Reasoning. Within 3 months, I was consistently scoring 80+. Cleared it in my third attempt!',
    score: '82 / 100',
    category: 'SBI Clerk',
  },
  {
    name: 'Arjun K.',
    exam: 'IBPS PO 2024',
    result: 'Selected ✅',
    avatar: 'https://i.pravatar.cc/150?u=arjun_k',
    mentor: 'Mentored by Mr. MG',
    rating: 5,
    text: 'I was stuck at 65 marks for two attempts. Mr. MG identified my DI weakness and gave me targeted practice. The daily tasks were super structured. Got selected in IBPS PO 2024 — genuinely grateful for this platform.',
    score: '79 / 100',
    category: 'IBPS PO',
  },
  {
    name: 'Divya M.',
    exam: 'SBI PO 2024',
    result: 'Cleared ✅',
    avatar: 'https://i.pravatar.cc/150?u=divya_m',
    mentor: 'Mentored by Ms. Priya Rajan',
    rating: 5,
    text: 'Priya ma\'am\'s approach to English and Reasoning is top-notch. She identified patterns I was missing and gave me daily practice sets. Weekly mock reviews were truly eye-opening for me.',
    score: '76 / 100',
    category: 'SBI PO',
  },
  {
    name: 'Rahul T.',
    exam: 'SSC CGL 2024',
    result: 'Qualified ✅',
    avatar: 'https://i.pravatar.cc/150?u=rahul_t',
    mentor: 'Mentored by Mr. Sathish Kumar',
    rating: 5,
    text: 'The GK capsules and current affairs digests from Mr. Sathish were exceptional. I used to lose marks in GA but now it\'s my scoring section. PrepSmart\'s mentorship is truly value for money.',
    score: '88 / 100',
    category: 'SSC CGL',
  },
];

const Testimonials = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-100 mb-5">
            <span className="text-sm font-semibold text-green-800">💬 Real Success Stories</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Students Who <span className="text-[#5b51ff]">Made It</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-xl mx-auto">
            Join 25,000+ aspirants who cleared their dream exams with PrepSmart mentorship.
          </p>
          {/* Rating Row */}
          <div className="flex items-center justify-center gap-2 mt-4">
            {[1,2,3,4,5].map(i => <Star key={i} className="w-6 h-6 fill-yellow-400 text-yellow-400" />)}
            <span className="font-extrabold text-slate-900 text-xl ml-2">4.9</span>
            <span className="text-slate-500 font-medium">(3,400+ reviews)</span>
          </div>
        </div>

        {/* Testimonial Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {testimonials.map((t, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-lg transition-all flex flex-col">
              {/* Quote Icon */}
              <Quote className="w-8 h-8 text-indigo-100 fill-indigo-100 mb-3" />

              {/* Stars */}
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map(s => (
                  <Star key={s} className={`w-4 h-4 ${s <= t.rating ? 'fill-yellow-400 text-yellow-400' : 'text-slate-200'}`} />
                ))}
              </div>

              {/* Text */}
              <p className="text-sm text-slate-600 leading-relaxed flex-1">"{t.text}"</p>

              {/* Score Badge */}
              <div className="mt-4 mb-4 bg-green-50 border border-green-100 rounded-2xl px-4 py-2 flex items-center justify-between">
                <span className="text-xs font-bold text-green-700">{t.exam}</span>
                <span className="text-sm font-extrabold text-green-700">{t.score}</span>
              </div>

              {/* User */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <img src={t.avatar} alt={t.name} className="w-10 h-10 rounded-full border-2 border-slate-100" />
                <div>
                  <h4 className="font-bold text-slate-900 text-sm leading-tight">{t.name}</h4>
                  <p className="text-xs text-slate-400">{t.mentor}</p>
                </div>
                <div className="ml-auto">
                  <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">{t.result}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
