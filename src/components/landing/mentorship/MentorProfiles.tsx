import React, { useState } from 'react';
import { Star, ArrowRight, Badge, BookOpen, Brain, Lightbulb, Globe2, Hash } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mentors = [
  {
    id: 1,
    name: 'Mr. Muniyarasan',
    title: 'Overall Mentor & Quant Expert',
    rating: 4.9,
    reviews: 1240,
    students: 4200,
    experience: '8 yrs',
    exams: ['SBI PO', 'IBPS PO', 'SBI Clerk'],
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English'],
    badge: 'Top Rated',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    avatar: 'https://i.pravatar.cc/150?u=muniyarasan',
    specialty: 'Overall Mentorship',
    specialtyColor: 'text-purple-600',
    specialtyBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    price: '₹499/month',
    successRate: '96%',
    bio: '8+ years of guiding banking aspirants. Cleared SBI PO himself in first attempt.',
    highlights: ['Personalized daily tasks', 'Weekly mock review sessions', '24/7 doubt clearing'],
  },
  {
    id: 2,
    name: 'Mr. MG',
    title: 'Quant & DI Specialist',
    rating: 4.8,
    reviews: 980,
    students: 3100,
    experience: '6 yrs',
    exams: ['SBI PO', 'CAT', 'SSC CGL'],
    subjects: ['Quantitative Aptitude', 'Data Interpretation'],
    badge: 'Expert',
    badgeColor: 'bg-orange-100 text-orange-700',
    avatar: 'https://i.pravatar.cc/150?u=mg_mentor',
    specialty: 'Quant Expert',
    specialtyColor: 'text-orange-600',
    specialtyBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    price: '₹399/month',
    successRate: '94%',
    bio: 'Ranked AIR 12 in SBI PO. Known for making Quant simple and scoring.',
    highlights: ['500+ shortcuts mastered', 'Speed improvement focus', 'Topic-wise mock analysis'],
  },
  {
    id: 3,
    name: 'Ms. Priya Rajan',
    title: 'Reasoning & English Expert',
    rating: 4.9,
    reviews: 760,
    students: 2800,
    experience: '5 yrs',
    exams: ['IBPS Clerk', 'SBI Clerk', 'RRB NTPC'],
    subjects: ['Reasoning', 'English Language'],
    badge: 'Rising Star',
    badgeColor: 'bg-teal-100 text-teal-700',
    avatar: 'https://i.pravatar.cc/150?u=priya_mentor',
    specialty: 'Reasoning Expert',
    specialtyColor: 'text-teal-600',
    specialtyBg: 'bg-teal-50',
    borderColor: 'border-teal-200',
    price: '₹349/month',
    successRate: '92%',
    bio: 'Former IBPS Clerk topper. Specializes in building strong logical reasoning foundations.',
    highlights: ['Pattern recognition mastery', 'Daily reasoning puzzles', 'Grammar crash courses'],
  },
  {
    id: 4,
    name: 'Mr. Sathish Kumar',
    title: 'GK & Current Affairs Mentor',
    rating: 4.7,
    reviews: 620,
    students: 2200,
    experience: '7 yrs',
    exams: ['SSC CGL', 'UPSC', 'SBI PO'],
    subjects: ['General Awareness', 'Computer Awareness'],
    badge: 'Verified',
    badgeColor: 'bg-blue-100 text-blue-700',
    avatar: 'https://i.pravatar.cc/150?u=sathish_mentor',
    specialty: 'GK Expert',
    specialtyColor: 'text-blue-600',
    specialtyBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    price: '₹299/month',
    successRate: '91%',
    bio: 'Ex-Banker with 7 years of experience. Makes GA simple with daily news capsules.',
    highlights: ['Daily current affairs digest', 'Banking updates tracker', 'Monthly GA mock tests'],
  },
];

const MentorProfiles = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filters = ['All', 'Overall', 'Quant', 'Reasoning', 'English', 'GK'];

  return (
    <section id="mentor-profiles" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 mb-5">
            <span className="text-sm font-semibold text-indigo-900">👨‍🏫 Meet Our Experts</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Your <span className="text-[#5b51ff]">Expert Mentors</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Hand-picked, verified mentors who have themselves cracked top banking & government exams and are dedicated to your success.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mb-10">
          {filters.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all ${
                activeFilter === f
                  ? 'bg-[#5b51ff] text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Mentor Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {mentors.map((mentor) => (
            <div
              key={mentor.id}
              className={`bg-white rounded-3xl border-2 ${mentor.borderColor} p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer relative overflow-hidden`}
            >
              {/* Badge */}
              <div className={`absolute top-4 right-4 px-3 py-1 rounded-full text-xs font-bold ${mentor.badgeColor}`}>
                {mentor.badge}
              </div>

              {/* Avatar */}
              <div className="flex flex-col items-center text-center mb-5">
                <div className="relative mb-3">
                  <img
                    src={mentor.avatar}
                    alt={mentor.name}
                    className="w-20 h-20 rounded-2xl object-cover border-4 border-white shadow-lg"
                  />
                  <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-bold ${mentor.specialtyBg} ${mentor.specialtyColor} border border-white shadow-sm`}>
                    {mentor.specialty}
                  </div>
                </div>
                <h3 className="text-lg font-extrabold text-slate-900 mt-3">{mentor.name}</h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">{mentor.title}</p>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-2 mb-5">
                <div className="text-center bg-slate-50 rounded-xl py-2">
                  <p className="text-base font-extrabold text-slate-900">{mentor.rating}</p>
                  <div className="flex justify-center mt-0.5">
                    <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  </div>
                  <p className="text-[9px] text-slate-400">Rating</p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl py-2">
                  <p className="text-base font-extrabold text-slate-900">{(mentor.students / 1000).toFixed(1)}k</p>
                  <p className="text-[9px] text-slate-400 mt-1">Students</p>
                </div>
                <div className="text-center bg-slate-50 rounded-xl py-2">
                  <p className="text-base font-extrabold text-green-600">{mentor.successRate}</p>
                  <p className="text-[9px] text-slate-400 mt-1">Success</p>
                </div>
              </div>

              {/* Bio */}
              <p className="text-xs text-slate-600 leading-relaxed mb-4">{mentor.bio}</p>

              {/* Highlights */}
              <div className="space-y-1.5 mb-5">
                {mentor.highlights.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                    </div>
                    <span className="text-xs text-slate-600 font-medium">{h}</span>
                  </div>
                ))}
              </div>

              {/* Price & CTA */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <span className="font-extrabold text-slate-900">{mentor.price}</span>
                <button className="flex items-center gap-1 text-sm font-bold text-[#5b51ff] group-hover:gap-2 transition-all">
                  Book <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" className="border-2 border-[#5b51ff] text-[#5b51ff] hover:bg-indigo-50 px-10 py-4 rounded-2xl text-base font-bold h-auto">
            View All 200+ Mentors <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MentorProfiles;
