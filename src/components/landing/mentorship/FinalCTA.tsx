import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

const FinalCTA = () => {
  return (
    <section className="py-24 bg-gradient-to-br from-[#3b31ea] via-[#5b51ff] to-[#7b6fff] relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/5 rounded-full translate-x-1/2 translate-y-1/2"></div>
      <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>

      <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-8">
          <Sparkles className="h-4 w-4 text-yellow-300 fill-yellow-300" />
          <span className="text-sm font-semibold text-white">Free for your first assessment</span>
        </div>

        <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
          Your Dream <br />
          <span className="text-yellow-300">Exam is Waiting</span>
        </h2>
        <p className="text-lg text-indigo-100 max-w-2xl mx-auto mb-10 leading-relaxed">
          Join 25,000+ aspirants who stopped guessing and started winning with personalized mentorship. 
          Take your free 5-minute assessment today and get matched with the perfect mentor.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            className="h-16 px-10 bg-white text-[#5b51ff] hover:bg-slate-50 rounded-2xl font-extrabold text-lg shadow-xl transition-all hover:scale-105"
            onClick={() => document.getElementById('free-assessment')?.scrollIntoView({ behavior: 'smooth' })}
          >
            🎯 Start Free Assessment
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            className="h-16 px-10 border-2 border-white/40 text-white hover:bg-white/10 rounded-2xl font-bold text-lg transition-all"
            onClick={() => document.getElementById('mentor-profiles')?.scrollIntoView({ behavior: 'smooth' })}
          >
            👨‍🏫 Browse Mentors
          </Button>
        </div>

        {/* Trust Row */}
        <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 mt-12">
          {[
            '✅ No Credit Card Needed',
            '✅ 7-Day Money Back Guarantee',
            '✅ Cancel Anytime',
            '✅ 200+ Verified Mentors',
          ].map((item, i) => (
            <span key={i} className="text-indigo-100 font-bold text-sm">{item}</span>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FinalCTA;
