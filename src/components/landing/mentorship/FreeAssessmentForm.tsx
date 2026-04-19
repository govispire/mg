import React, { useState } from 'react';
import { ArrowRight, ChevronDown, CheckCircle2, BookOpen, Brain, Lightbulb, Globe2, Hash, Monitor } from 'lucide-react';
import { Button } from '@/components/ui/button';

const exams = ['SBI Clerk', 'SBI PO', 'IBPS PO', 'IBPS Clerk', 'RBI Grade B', 'SSC CGL', 'SSC CHSL', 'SSC MTS', 'UPSC CSE', 'RRB NTPC', 'CTET', 'NDA', 'CAT'];

const subjects = [
  { name: 'Quantitative Aptitude', icon: Hash, color: 'text-purple-600' },
  { name: 'Reasoning', icon: Brain, color: 'text-blue-600' },
  { name: 'English', icon: BookOpen, color: 'text-green-600' },
  { name: 'General Awareness', icon: Globe2, color: 'text-orange-600' },
  { name: 'Computer Awareness', icon: Monitor, color: 'text-pink-600' },
];

type LevelType = 'Weak' | 'Average' | 'Strong' | '';

const steps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Exam Profile' },
  { id: 3, label: 'Strength & Weakness' },
  { id: 4, label: 'Study Behavior' },
  { id: 5, label: 'Test Analysis' },
];

const FreeAssessmentForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [selectedExam, setSelectedExam] = useState('SBI Clerk');
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Hindi'>('English');
  const [attemptType, setAttemptType] = useState<'first' | 'repeat' | ''>('');
  const [strengths, setStrengths] = useState<Record<string, LevelType>>({
    'Quantitative Aptitude': '',
    'Reasoning': '',
    'English': '',
    'General Awareness': 'Strong',
    'Computer Awareness': 'Weak',
  });
  const [studyHours, setStudyHours] = useState(3);
  const [studyTime, setStudyTime] = useState<'Morning' | 'Afternoon' | 'Night'>('Morning');
  const [distractionLevel, setDistractionLevel] = useState<'Low' | 'Average' | 'High'>('Average');
  const [submitted, setSubmitted] = useState(false);

  const handleStrengthChange = (subject: string, level: LevelType) => {
    setStrengths(prev => ({ ...prev, [subject]: level }));
  };

  const handleSubmit = () => {
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <section id="free-assessment" className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-white rounded-3xl p-12 shadow-xl border border-indigo-100 flex flex-col items-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-4">🎉 Assessment Submitted!</h2>
            <p className="text-lg text-slate-600 mb-6 max-w-md">Your personalized study plan is being prepared. Our team will reach out within 24 hours to match you with the perfect mentor.</p>
            <Button 
              className="bg-[#5b51ff] hover:bg-[#4a42ff] px-10 py-4 rounded-2xl text-lg font-bold"
              onClick={() => setSubmitted(false)}
            >
              Take Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="free-assessment" className="py-20 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="max-w-6xl mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100 border border-indigo-200 mb-5">
            <span className="text-sm font-semibold text-indigo-900">✨ Free — No Credit Card Required</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4">
            Start Your <span className="text-[#5b51ff]">Free Assessment</span>
          </h2>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Answer a few questions and we'll personalize your entire study plan based on your strengths, goals, and daily habits.
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* LEFT: Form */}
          <div className="lg:col-span-3 bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
            {/* Step Tabs */}
            <div className="flex border-b border-slate-100 overflow-x-auto">
              {steps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  className={`flex-1 min-w-[100px] py-4 text-xs font-bold transition-colors whitespace-nowrap px-3 ${
                    currentStep === step.id
                      ? 'border-b-2 border-[#5b51ff] text-[#5b51ff] bg-indigo-50/50'
                      : currentStep > step.id
                      ? 'text-green-600 border-b-2 border-green-200'
                      : 'text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? '✓ ' : ''}{step.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {/* Step 1: Basic Info */}
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 1</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Tell Us About You</h3>
                    <p className="text-slate-500 mt-1">We'll personalize your study plan based on this.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your full name"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="px-3 py-3 border border-slate-200 rounded-xl text-sm text-slate-500 bg-slate-50">+91</div>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={(e) => setMobile(e.target.value)}
                          placeholder="OTP will be Sent"
                          className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 transition-all"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1 block">Target Exam</label>
                      <div className="relative">
                        <select
                          value={selectedExam}
                          onChange={(e) => setSelectedExam(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 text-sm appearance-none focus:outline-none focus:ring-2 focus:ring-indigo-300 bg-white"
                        >
                          {exams.map(e => <option key={e}>{e}</option>)}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-2 block">Preferred Language</label>
                      <div className="flex gap-3">
                        {(['English', 'Tamil', 'Hindi'] as const).map((lang) => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 text-sm font-semibold transition-all ${
                              language === lang
                                ? 'border-[#5b51ff] bg-indigo-50 text-[#5b51ff]'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${language === lang ? 'border-[#5b51ff]' : 'border-slate-300'}`}>
                              {language === lang && <div className="w-2 h-2 bg-[#5b51ff] rounded-full"></div>}
                            </div>
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button
                    className="w-full h-14 bg-[#5b51ff] hover:bg-[#4a42ff] rounded-2xl font-bold text-lg"
                    onClick={() => setCurrentStep(2)}
                  >
                    Next <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {/* Step 2: Exam Profile */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 2</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Exam & Attempt Profile</h3>
                    <p className="text-slate-500 mt-1">Is this your <strong>first attempt</strong> or a <strong>repeat attempt?</strong></p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { type: 'first' as const, label: 'First Attempt', sub: 'New Aspirant', desc: 'I want to take & clear exam', emoji: '📚' },
                      { type: 'repeat' as const, label: 'Repeat Attempt', sub: 'Retaking Exam', desc: 'I want to retake & clear the exam', emoji: '🎯' },
                    ].map((opt) => (
                      <button
                        key={opt.type}
                        onClick={() => setAttemptType(opt.type)}
                        className={`p-5 rounded-2xl border-2 text-left transition-all hover:shadow-md ${
                          attemptType === opt.type
                            ? 'border-[#5b51ff] bg-indigo-50 shadow-sm'
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-3xl mb-3 block">{opt.emoji}</span>
                        <h4 className="font-bold text-slate-900 text-base leading-tight">{opt.label}</h4>
                        <p className={`text-xs font-semibold mt-1 ${attemptType === opt.type ? 'text-[#5b51ff]' : 'text-slate-400'}`}>● {opt.sub}</p>
                        <p className="text-xs text-slate-500 mt-2">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200" onClick={() => setCurrentStep(1)}>Back</Button>
                    <Button className="flex-1 h-12 bg-[#5b51ff] hover:bg-[#4a42ff] rounded-xl font-bold" onClick={() => setCurrentStep(3)}>
                      Next <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 3: Strength & Weakness */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 3</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Strength & Weakness</h3>
                    <p className="text-slate-500 mt-1">Mark your <strong>strength</strong> level in each subject</p>
                  </div>

                  <div className="space-y-4">
                    {subjects.map((subj) => (
                      <div key={subj.name} className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-2 min-w-[160px]">
                          <subj.icon className={`w-4 h-4 ${subj.color}`} />
                          <span className="text-sm font-semibold text-slate-700">{subj.name}</span>
                        </div>
                        <div className="flex gap-2">
                          {(['Weak', 'Average', 'Strong'] as const).map((level) => (
                            <button
                              key={level}
                              onClick={() => handleStrengthChange(subj.name, level)}
                              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                                strengths[subj.name] === level
                                  ? level === 'Weak'
                                    ? 'bg-red-500 text-white'
                                    : level === 'Average'
                                    ? 'bg-yellow-400 text-white'
                                    : 'bg-green-500 text-white'
                                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                              }`}
                            >
                              {level}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200" onClick={() => setCurrentStep(2)}>Back</Button>
                    <Button className="flex-1 h-12 bg-[#5b51ff] hover:bg-[#4a42ff] rounded-xl font-bold" onClick={() => setCurrentStep(4)}>
                      Next <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {/* Step 4: Study Behavior */}
              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Step 4</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Study Behavior</h3>
                    <p className="text-slate-500 mt-1">Tell us about your <strong>daily habits & distractions</strong></p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-3 block">Daily Study Hours</label>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={studyHours}
                        onChange={(e) => setStudyHours(Number(e.target.value))}
                        className="w-full accent-[#5b51ff]"
                      />
                      <div className="flex justify-between mt-1">
                        <span className="text-xs text-slate-400">1 hr</span>
                        <span className="text-sm font-bold text-[#5b51ff]">{studyHours} hrs/day</span>
                        <span className="text-xs text-slate-400">12 hrs</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-3 block">Preferred Study Time</label>
                      <div className="flex gap-3">
                        {(['Morning', 'Afternoon', 'Night'] as const).map((time) => (
                          <button
                            key={time}
                            onClick={() => setStudyTime(time)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              studyTime === time
                                ? 'bg-[#5b51ff] text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {time === 'Morning' ? '🌅' : time === 'Afternoon' ? '☀️' : '🌙'} {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-semibold text-slate-700 mb-3 block">Distraction Level</label>
                      <div className="flex gap-3">
                        {([
                          { val: 'Low' as const, color: 'bg-green-500', emoji: '😊' },
                          { val: 'Average' as const, color: 'bg-yellow-400', emoji: '😐' },
                          { val: 'High' as const, color: 'bg-red-500', emoji: '😅' },
                        ]).map(({ val, color, emoji }) => (
                          <button
                            key={val}
                            onClick={() => setDistractionLevel(val)}
                            className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${
                              distractionLevel === val
                                ? `${color} text-white`
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {emoji} {val}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1 h-12 rounded-xl border-slate-200" onClick={() => setCurrentStep(3)}>Back</Button>
                    <Button className="flex-1 h-12 bg-[#5b51ff] hover:bg-[#4a42ff] rounded-xl font-bold" onClick={handleSubmit}>
                      Get My Plan 🎯
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: Info Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* What you'll get */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg mb-4">We will personalize your entire study plan based on</h3>
              <div className="space-y-3">
                {[
                  { icon: '🎯', text: 'Your target exam & syllabus' },
                  { icon: '📊', text: 'Your weak & strong subjects' },
                  { icon: '⏰', text: 'Your daily study capacity' },
                  { icon: '🏆', text: 'Your past performance trends' },
                  { icon: '🧠', text: 'Your learning style & behavior' },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xl">{item.icon}</span>
                    <span className="text-sm font-semibold text-slate-600">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Exam Info */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg mb-3">Target Exam</h3>
              <p className="text-xs text-slate-400 mb-3">Select an Exam</p>
              <div className="bg-slate-50 rounded-xl px-4 py-3 flex items-center justify-between mb-4 border border-slate-200">
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏦</span>
                  <span className="font-bold text-slate-800">{selectedExam}</span>
                </div>
                <ChevronDown className="h-4 w-4 text-slate-400" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                {['HiBochi', 'Tamil', 'SSC CGL', 'Hindi'].map((item) => (
                  <div key={item} className="flex items-center gap-2 text-sm text-slate-600">
                    <div className="w-5 h-5 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
                      <CheckCircle2 className="w-3 h-3 text-indigo-600" />
                    </div>
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-base mb-3">💡 Recommendations</h3>
              <div className="space-y-2">
                {[
                  { icon: '⭐', text: 'We recommend identifying your exam strengths' },
                  { icon: '📅', text: 'Personalize Daily: honor of taboos study later ristrily tares' },
                  { icon: '🎓', text: 'Improvement: usageellprlop retutia Achieve' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <span>{item.icon}</span>
                    <p className="text-xs text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeAssessmentForm;
