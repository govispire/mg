import React, { useState } from 'react';
import { ArrowRight, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';

const mentors = [
  {
    id: 1,
    name: 'Mr. Muniyarasan',
    title: 'Overall Mentor & Quant Expert',
    rating: 4.9,
    reviews: 1240,
    students: 4200,
    subjects: ['Quantitative Aptitude', 'Reasoning', 'English'],
    categories: ['Overall', 'Quant', 'Reasoning', 'English'],
    badge: 'Top Rated',
    badgeColor: 'bg-indigo-100 text-indigo-700',
    avatar: 'https://i.pravatar.cc/150?u=muniyarasan',
    specialty: 'Overall Mentorship',
    specialtyColor: 'text-purple-600',
    specialtyBg: 'bg-purple-50',
    borderColor: 'border-purple-200',
    price: 'Rs. 499/month',
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
    subjects: ['Quantitative Aptitude', 'Data Interpretation'],
    categories: ['Quant'],
    badge: 'Expert',
    badgeColor: 'bg-orange-100 text-orange-700',
    avatar: 'https://i.pravatar.cc/150?u=mg_mentor',
    specialty: 'Quant Expert',
    specialtyColor: 'text-orange-600',
    specialtyBg: 'bg-orange-50',
    borderColor: 'border-orange-200',
    price: 'Rs. 399/month',
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
    subjects: ['Reasoning', 'English Language'],
    categories: ['Reasoning', 'English'],
    badge: 'Rising Star',
    badgeColor: 'bg-teal-100 text-teal-700',
    avatar: 'https://i.pravatar.cc/150?u=priya_mentor',
    specialty: 'Reasoning Expert',
    specialtyColor: 'text-teal-600',
    specialtyBg: 'bg-teal-50',
    borderColor: 'border-teal-200',
    price: 'Rs. 349/month',
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
    subjects: ['General Awareness', 'Computer Awareness'],
    categories: ['GK'],
    badge: 'Verified',
    badgeColor: 'bg-blue-100 text-blue-700',
    avatar: 'https://i.pravatar.cc/150?u=sathish_mentor',
    specialty: 'GK Expert',
    specialtyColor: 'text-blue-600',
    specialtyBg: 'bg-blue-50',
    borderColor: 'border-blue-200',
    price: 'Rs. 299/month',
    successRate: '91%',
    bio: 'Ex-banker with 7 years of experience. Makes GA simple with daily news capsules.',
    highlights: ['Daily current affairs digest', 'Banking updates tracker', 'Monthly GA mock tests'],
  },
];

const filters = ['All', 'Overall', 'Quant', 'Reasoning', 'English', 'GK'];

const scrollToAssessment = () => {
  document.getElementById('free-assessment')?.scrollIntoView({ behavior: 'smooth' });
};

const MentorProfiles = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const filteredMentors = activeFilter === 'All'
    ? mentors
    : mentors.filter(mentor => mentor.categories.includes(activeFilter));

  return (
    <section id="mentor-profiles" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="mb-14 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-indigo-50 px-4 py-2">
            <span className="text-sm font-semibold text-indigo-900">Meet our experts</span>
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Your <span className="text-[#5b51ff]">Expert Mentors</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Hand-picked, verified mentors who have cracked top banking and government exams and are dedicated to your success.
          </p>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-3" role="tablist" aria-label="Mentor specialization filters">
          {filters.map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`rounded-full px-5 py-2.5 text-sm font-bold transition-all ${
                activeFilter === filter
                  ? 'bg-[#5b51ff] text-white shadow-md shadow-indigo-200'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
              aria-pressed={activeFilter === filter}
            >
              {filter}
            </button>
          ))}
        </div>

        {filteredMentors.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
            {filteredMentors.map(mentor => (
              <div
                key={mentor.id}
                className={`group relative overflow-hidden rounded-3xl border-2 bg-white p-6 transition-all duration-300 hover:shadow-xl ${mentor.borderColor}`}
              >
                <div className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-bold ${mentor.badgeColor}`}>
                  {mentor.badge}
                </div>

                <div className="mb-5 flex flex-col items-center text-center">
                  <div className="relative mb-3">
                    <img
                      src={mentor.avatar}
                      alt={mentor.name}
                      className="h-20 w-20 rounded-2xl border-4 border-white object-cover shadow-lg"
                    />
                    <div className={`absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full border border-white px-3 py-0.5 text-[10px] font-bold shadow-sm ${mentor.specialtyBg} ${mentor.specialtyColor}`}>
                      {mentor.specialty}
                    </div>
                  </div>
                  <h3 className="mt-3 text-lg font-extrabold text-slate-900">{mentor.name}</h3>
                  <p className="mt-0.5 text-xs font-medium text-slate-500">{mentor.title}</p>
                </div>

                <div className="mb-5 grid grid-cols-3 gap-2">
                  <div className="rounded-xl bg-slate-50 py-2 text-center">
                    <p className="text-base font-extrabold text-slate-900">{mentor.rating}</p>
                    <div className="mt-0.5 flex justify-center">
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    </div>
                    <p className="text-[9px] text-slate-400">Rating</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 py-2 text-center">
                    <p className="text-base font-extrabold text-slate-900">{(mentor.students / 1000).toFixed(1)}k</p>
                    <p className="mt-1 text-[9px] text-slate-400">Students</p>
                  </div>
                  <div className="rounded-xl bg-slate-50 py-2 text-center">
                    <p className="text-base font-extrabold text-green-600">{mentor.successRate}</p>
                    <p className="mt-1 text-[9px] text-slate-400">Success</p>
                  </div>
                </div>

                <p className="mb-4 text-xs leading-relaxed text-slate-600">{mentor.bio}</p>

                <div className="mb-5 space-y-1.5">
                  {mentor.highlights.map(highlight => (
                    <div key={highlight} className="flex items-center gap-2">
                      <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-green-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500" />
                      </div>
                      <span className="text-xs font-medium text-slate-600">{highlight}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between border-t border-slate-100 pt-4">
                  <span className="font-extrabold text-slate-900">{mentor.price}</span>
                  <button
                    onClick={scrollToAssessment}
                    className="flex items-center gap-1 text-sm font-bold text-[#5b51ff] transition-all group-hover:gap-2"
                  >
                    Book <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-3xl border border-slate-100 bg-slate-50 p-10 text-center">
            <h3 className="text-lg font-bold text-slate-900">No mentors found for {activeFilter}</h3>
            <p className="mt-2 text-sm text-slate-500">Try another specialization or start the free assessment for a guided match.</p>
          </div>
        )}

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="h-auto rounded-2xl border-2 border-[#5b51ff] px-10 py-4 text-base font-bold text-[#5b51ff] hover:bg-indigo-50"
            onClick={scrollToAssessment}
          >
            View All 200+ Mentors <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default MentorProfiles;
