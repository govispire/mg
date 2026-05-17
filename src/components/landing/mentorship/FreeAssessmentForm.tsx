import React, { useMemo, useState } from 'react';
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronDown,
  Globe2,
  Hash,
  Monitor,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const exams = [
  'SBI Clerk',
  'SBI PO',
  'IBPS PO',
  'IBPS Clerk',
  'RBI Grade B',
  'SSC CGL',
  'SSC CHSL',
  'SSC MTS',
  'UPSC CSE',
  'RRB NTPC',
  'CTET',
  'NDA',
  'CAT',
];

const subjects = [
  { name: 'Quantitative Aptitude', icon: Hash, color: 'text-purple-600' },
  { name: 'Reasoning', icon: Brain, color: 'text-blue-600' },
  { name: 'English', icon: BookOpen, color: 'text-green-600' },
  { name: 'General Awareness', icon: Globe2, color: 'text-orange-600' },
  { name: 'Computer Awareness', icon: Monitor, color: 'text-pink-600' },
];

type LevelType = 'Weak' | 'Average' | 'Strong' | '';
type StudyTime = 'Morning' | 'Afternoon' | 'Night';
type DistractionLevel = 'Low' | 'Average' | 'High';
type MockFrequency = 'Not started' | 'Monthly' | 'Weekly' | '2+ per week';

const steps = [
  { id: 1, label: 'Basic Info' },
  { id: 2, label: 'Exam Profile' },
  { id: 3, label: 'Strengths' },
  { id: 4, label: 'Study Behavior' },
  { id: 5, label: 'Test Analysis' },
];

const getInitialStrengths = () =>
  subjects.reduce<Record<string, LevelType>>((acc, subject) => {
    acc[subject.name] = '';
    return acc;
  }, {});

const FreeAssessmentForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [selectedExam, setSelectedExam] = useState('SBI Clerk');
  const [language, setLanguage] = useState<'English' | 'Tamil' | 'Hindi'>('English');
  const [attemptType, setAttemptType] = useState<'first' | 'repeat' | ''>('');
  const [strengths, setStrengths] = useState<Record<string, LevelType>>(getInitialStrengths);
  const [studyHours, setStudyHours] = useState(3);
  const [studyTime, setStudyTime] = useState<StudyTime>('Morning');
  const [distractionLevel, setDistractionLevel] = useState<DistractionLevel>('Average');
  const [lastMockScore, setLastMockScore] = useState(55);
  const [mockFrequency, setMockFrequency] = useState<MockFrequency>('Weekly');
  const [toughestSection, setToughestSection] = useState('Quantitative Aptitude');
  const [submitted, setSubmitted] = useState(false);

  const weakSubjects = useMemo(
    () => Object.entries(strengths).filter(([, level]) => level === 'Weak').map(([subject]) => subject),
    [strengths],
  );

  const strongSubjects = useMemo(
    () => Object.entries(strengths).filter(([, level]) => level === 'Strong').map(([subject]) => subject),
    [strengths],
  );

  const recommendations = useMemo(() => {
    const items = [
      `Start with a ${selectedExam} roadmap in ${language}.`,
      weakSubjects.length > 0
        ? `Spend the first week repairing ${weakSubjects.slice(0, 2).join(' and ')}.`
        : 'Take a diagnostic test so the mentor can identify your weak areas.',
      lastMockScore < 60
        ? 'Prioritize accuracy review before full-length mock frequency increases.'
        : 'Use weekly mock analysis to convert your current score into a repeatable strategy.',
    ];

    if (distractionLevel === 'High') {
      items.push('Use shorter 45-minute study blocks with mentor accountability.');
    }

    return items;
  }, [distractionLevel, language, lastMockScore, selectedExam, weakSubjects]);

  const handleStrengthChange = (subject: string, level: LevelType) => {
    setStrengths(prev => ({ ...prev, [subject]: level }));
  };

  const nextStep = () => setCurrentStep(step => Math.min(step + 1, steps.length));
  const prevStep = () => setCurrentStep(step => Math.max(step - 1, 1));

  if (submitted) {
    return (
      <section id="free-assessment" className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="flex flex-col items-center rounded-3xl border border-indigo-100 bg-white p-12 shadow-xl">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <h2 className="mb-4 text-3xl font-extrabold text-slate-900">Assessment submitted</h2>
            <p className="mb-6 max-w-md text-lg text-slate-600">
              Your study profile is ready. We will match your exam, weak areas, study capacity, and mock score with the right mentor.
            </p>
            <Button
              className="rounded-2xl bg-[#5b51ff] px-10 py-4 text-lg font-bold hover:bg-[#4a42ff]"
              onClick={() => {
                setSubmitted(false);
                setCurrentStep(1);
              }}
            >
              Review Assessment
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="free-assessment" className="bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-20">
      <div className="mx-auto max-w-6xl px-4 lg:px-8">
        <div className="mb-12 text-center">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-indigo-200 bg-indigo-100 px-4 py-2">
            <span className="text-sm font-semibold text-indigo-900">Free assessment - no credit card required</span>
          </div>
          <h2 className="mb-4 text-4xl font-extrabold text-slate-900 md:text-5xl">
            Start Your <span className="text-[#5b51ff]">Free Assessment</span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-slate-600">
            Answer a few questions and we will personalize your study plan around your goal, weak areas, daily schedule, and test data.
          </p>
        </div>

        <div className="grid items-start gap-8 lg:grid-cols-5">
          <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-xl lg:col-span-3">
            <div className="flex overflow-x-auto border-b border-slate-100">
              {steps.map(step => (
                <button
                  key={step.id}
                  onClick={() => currentStep > step.id && setCurrentStep(step.id)}
                  className={`min-w-[112px] flex-1 whitespace-nowrap px-3 py-4 text-xs font-bold transition-colors ${
                    currentStep === step.id
                      ? 'border-b-2 border-[#5b51ff] bg-indigo-50/50 text-[#5b51ff]'
                      : currentStep > step.id
                        ? 'border-b-2 border-green-200 text-green-600'
                        : 'text-slate-400'
                  }`}
                >
                  {currentStep > step.id ? 'Done - ' : ''}{step.label}
                </button>
              ))}
            </div>

            <div className="p-8">
              {currentStep === 1 && (
                <div className="space-y-5">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Step 1</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Tell us about you</h3>
                    <p className="mt-1 text-slate-500">This helps us personalize the mentor match.</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Full Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={event => setName(event.target.value)}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Mobile Number</label>
                      <div className="flex gap-2">
                        <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-500">+91</div>
                        <input
                          type="tel"
                          value={mobile}
                          onChange={event => setMobile(event.target.value)}
                          placeholder="Enter mobile number"
                          className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Email</label>
                      <input
                        type="email"
                        value={email}
                        onChange={event => setEmail(event.target.value)}
                        placeholder="your@email.com"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 transition-all focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Target Exam</label>
                      <div className="relative">
                        <select
                          value={selectedExam}
                          onChange={event => setSelectedExam(event.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                          {exams.map(exam => <option key={exam}>{exam}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-slate-700">Preferred Language</label>
                      <div className="flex flex-wrap gap-3">
                        {(['English', 'Tamil', 'Hindi'] as const).map(lang => (
                          <button
                            key={lang}
                            onClick={() => setLanguage(lang)}
                            className={`flex items-center gap-2 rounded-xl border-2 px-4 py-2.5 text-sm font-semibold transition-all ${
                              language === lang
                                ? 'border-[#5b51ff] bg-indigo-50 text-[#5b51ff]'
                                : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            <div className={`flex h-4 w-4 items-center justify-center rounded-full border-2 ${language === lang ? 'border-[#5b51ff]' : 'border-slate-300'}`}>
                              {language === lang && <div className="h-2 w-2 rounded-full bg-[#5b51ff]" />}
                            </div>
                            {lang}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Button className="h-14 w-full rounded-2xl bg-[#5b51ff] text-lg font-bold hover:bg-[#4a42ff]" onClick={nextStep}>
                    Next <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              )}

              {currentStep === 2 && (
                <div className="space-y-6">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Step 2</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Exam and attempt profile</h3>
                    <p className="mt-1 text-slate-500">Tell us whether you are beginning fresh or fixing a previous attempt.</p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    {[
                      { type: 'first' as const, label: 'First Attempt', sub: 'New aspirant', desc: 'I need a clear foundation and weekly discipline.' },
                      { type: 'repeat' as const, label: 'Repeat Attempt', sub: 'Retaking exam', desc: 'I need targeted repair for repeated mistakes.' },
                    ].map(opt => (
                      <button
                        key={opt.type}
                        onClick={() => setAttemptType(opt.type)}
                        className={`rounded-2xl border-2 p-5 text-left transition-all hover:shadow-md ${
                          attemptType === opt.type ? 'border-[#5b51ff] bg-indigo-50 shadow-sm' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <h4 className="text-base font-bold leading-tight text-slate-900">{opt.label}</h4>
                        <p className={`mt-1 text-xs font-semibold ${attemptType === opt.type ? 'text-[#5b51ff]' : 'text-slate-400'}`}>{opt.sub}</p>
                        <p className="mt-2 text-xs text-slate-500">{opt.desc}</p>
                      </button>
                    ))}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="h-12 flex-1 rounded-xl border-slate-200" onClick={prevStep}>Back</Button>
                    <Button className="h-12 flex-1 rounded-xl bg-[#5b51ff] font-bold hover:bg-[#4a42ff]" onClick={nextStep}>
                      Next <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Step 3</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Strength and weakness map</h3>
                    <p className="mt-1 text-slate-500">Mark each subject honestly so the mentor can sequence your plan.</p>
                  </div>

                  <div className="space-y-4">
                    {subjects.map(subject => {
                      const Icon = subject.icon;
                      return (
                        <div key={subject.name} className="flex flex-col gap-3 rounded-xl border border-slate-100 p-3 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex min-w-[180px] items-center gap-2">
                            <Icon className={`h-4 w-4 ${subject.color}`} />
                            <span className="text-sm font-semibold text-slate-700">{subject.name}</span>
                          </div>
                          <div className="flex gap-2">
                            {(['Weak', 'Average', 'Strong'] as const).map(level => (
                              <button
                                key={level}
                                onClick={() => handleStrengthChange(subject.name, level)}
                                className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
                                  strengths[subject.name] === level
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
                      );
                    })}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="h-12 flex-1 rounded-xl border-slate-200" onClick={prevStep}>Back</Button>
                    <Button className="h-12 flex-1 rounded-xl bg-[#5b51ff] font-bold hover:bg-[#4a42ff]" onClick={nextStep}>
                      Next <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div className="space-y-6">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Step 4</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Study behavior</h3>
                    <p className="mt-1 text-slate-500">Your mentor will use this to create a realistic daily schedule.</p>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="mb-3 block text-sm font-semibold text-slate-700">Daily Study Hours</label>
                      <input
                        type="range"
                        min={1}
                        max={12}
                        value={studyHours}
                        onChange={event => setStudyHours(Number(event.target.value))}
                        className="w-full accent-[#5b51ff]"
                      />
                      <div className="mt-1 flex justify-between">
                        <span className="text-xs text-slate-400">1 hr</span>
                        <span className="text-sm font-bold text-[#5b51ff]">{studyHours} hrs/day</span>
                        <span className="text-xs text-slate-400">12 hrs</span>
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-semibold text-slate-700">Preferred Study Time</label>
                      <div className="flex flex-wrap gap-3">
                        {(['Morning', 'Afternoon', 'Night'] as const).map(time => (
                          <button
                            key={time}
                            onClick={() => setStudyTime(time)}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                              studyTime === time ? 'bg-[#5b51ff] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-semibold text-slate-700">Distraction Level</label>
                      <div className="flex flex-wrap gap-3">
                        {(['Low', 'Average', 'High'] as const).map(level => (
                          <button
                            key={level}
                            onClick={() => setDistractionLevel(level)}
                            className={`flex-1 rounded-xl py-2.5 text-sm font-bold transition-all ${
                              distractionLevel === level
                                ? level === 'Low'
                                  ? 'bg-green-500 text-white'
                                  : level === 'Average'
                                    ? 'bg-yellow-400 text-white'
                                    : 'bg-red-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="h-12 flex-1 rounded-xl border-slate-200" onClick={prevStep}>Back</Button>
                    <Button className="h-12 flex-1 rounded-xl bg-[#5b51ff] font-bold hover:bg-[#4a42ff]" onClick={nextStep}>
                      Next <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div className="space-y-6">
                  <div>
                    <p className="mb-1 text-xs font-bold uppercase tracking-widest text-slate-400">Step 5</p>
                    <h3 className="text-2xl font-extrabold text-slate-900">Test analysis</h3>
                    <p className="mt-1 text-slate-500">A mentor match is stronger when we know your current score pattern.</p>
                  </div>

                  <div className="space-y-5">
                    <div className="rounded-2xl border border-slate-100 p-4">
                      <label className="mb-3 flex items-center justify-between text-sm font-semibold text-slate-700">
                        Last Mock Score
                        <span className="text-[#5b51ff]">{lastMockScore}/100</span>
                      </label>
                      <input
                        type="range"
                        min={0}
                        max={100}
                        value={lastMockScore}
                        onChange={event => setLastMockScore(Number(event.target.value))}
                        className="w-full accent-[#5b51ff]"
                      />
                    </div>

                    <div>
                      <label className="mb-3 block text-sm font-semibold text-slate-700">Mock Test Frequency</label>
                      <div className="grid gap-2 sm:grid-cols-2">
                        {(['Not started', 'Monthly', 'Weekly', '2+ per week'] as const).map(option => (
                          <button
                            key={option}
                            onClick={() => setMockFrequency(option)}
                            className={`rounded-xl border-2 px-4 py-2.5 text-sm font-bold transition-all ${
                              mockFrequency === option ? 'border-[#5b51ff] bg-indigo-50 text-[#5b51ff]' : 'border-slate-200 text-slate-600 hover:border-slate-300'
                            }`}
                          >
                            {option}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">Toughest Section</label>
                      <div className="relative">
                        <select
                          value={toughestSection}
                          onChange={event => setToughestSection(event.target.value)}
                          className="w-full appearance-none rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                          {subjects.map(subject => <option key={subject.name}>{subject.name}</option>)}
                        </select>
                        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" className="h-12 flex-1 rounded-xl border-slate-200" onClick={prevStep}>Back</Button>
                    <Button className="h-12 flex-1 rounded-xl bg-[#5b51ff] font-bold hover:bg-[#4a42ff]" onClick={() => setSubmitted(true)}>
                      Get My Plan <BarChart3 className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <h3 className="mb-4 text-lg font-extrabold text-slate-900">Your plan will be based on</h3>
              <div className="space-y-3">
                {[
                  'Target exam and syllabus stage',
                  'Weak and strong subject map',
                  'Daily study capacity',
                  'Mock score and frequency',
                  'Preferred language and schedule',
                ].map(item => (
                  <div key={item} className="flex items-center gap-3">
                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded bg-indigo-100">
                      <CheckCircle2 className="h-3 w-3 text-indigo-600" />
                    </div>
                    <span className="text-sm font-semibold text-slate-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <h3 className="mb-3 text-lg font-extrabold text-slate-900">Assessment Summary</h3>
              <div className="space-y-3">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Target Exam</p>
                  <p className="mt-1 font-bold text-slate-800">{selectedExam}</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-xl bg-indigo-50 p-3">
                    <p className="text-xs font-semibold text-indigo-500">Language</p>
                    <p className="text-sm font-bold text-slate-800">{language}</p>
                  </div>
                  <div className="rounded-xl bg-green-50 p-3">
                    <p className="text-xs font-semibold text-green-600">Study Time</p>
                    <p className="text-sm font-bold text-slate-800">{studyHours} hrs/day</p>
                  </div>
                  <div className="rounded-xl bg-orange-50 p-3">
                    <p className="text-xs font-semibold text-orange-600">Mock Score</p>
                    <p className="text-sm font-bold text-slate-800">{lastMockScore}/100</p>
                  </div>
                  <div className="rounded-xl bg-purple-50 p-3">
                    <p className="text-xs font-semibold text-purple-600">Weak Areas</p>
                    <p className="text-sm font-bold text-slate-800">{weakSubjects.length || 'Pending'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-lg">
              <h3 className="mb-3 text-base font-extrabold text-slate-900">Recommendations</h3>
              <div className="space-y-2">
                {recommendations.map(item => (
                  <div key={item} className="flex gap-2 rounded-xl bg-slate-50 p-3">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-600" />
                    <p className="text-xs leading-relaxed text-slate-600">{item}</p>
                  </div>
                ))}
              </div>
              {strongSubjects.length > 0 && (
                <p className="mt-4 rounded-xl bg-green-50 p-3 text-xs font-semibold text-green-700">
                  Strong subjects to protect: {strongSubjects.slice(0, 2).join(', ')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FreeAssessmentForm;
