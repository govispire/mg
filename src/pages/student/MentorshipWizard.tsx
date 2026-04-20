import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  mentorshipCategories,
  examStages,
  type MentorshipCategory,
  type ExamStage,
} from '@/data/mentorshipData';
import {
  targetExams,
  subjectOptions,
  languageOptions,
  diagnosticTests,
  recommendedSubjects,
  assignMentor,
  type TargetExam,
  type SubjectOption,
  type LanguageOption,
  type MentorProfile,
} from '@/data/mentorshipExamData';
import {
  Check, ArrowRight, ArrowLeft, Sparkles, Search, Users,
  Clock, Star, MessageSquare, CheckCircle2, BookOpen,
} from 'lucide-react';

// ─── Wizard State ────────────────────────────────────────────────────────────

interface WizardState {
  category?: MentorshipCategory;
  stage?: ExamStage;
  targetExam?: TargetExam;
  subjects: string[];
  language?: LanguageOption;
  assignedMentor?: MentorProfile;
  diagnosticStarted: boolean;
}

// ─── Step labels ─────────────────────────────────────────────────────────────

const STEPS = [
  'Category',
  'Stage',
  'Target Exam',
  'Subjects',
  'Language',
  'Confirm',
  'Matching',
  'Mentor',
  'Tests',
];

// ─── Progress Bar Component ───────────────────────────────────────────────────

const ProgressBar = ({ step, total }: { step: number; total: number }) => (
  <div className="mb-10">
    <div className="flex items-center justify-between max-w-4xl mx-auto mb-3">
      {STEPS.slice(0, total).map((label, i) => {
        const s = i + 1;
        const done = s < step;
        const active = s === step;
        return (
          <div key={s} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold transition-all
                  ${done ? 'bg-green-500 text-white' : active ? 'bg-blue-600 text-white ring-4 ring-blue-100' : 'bg-gray-100 text-gray-400'}`}
              >
                {done ? <Check className="w-4 h-4" /> : s}
              </div>
              <span className={`text-[10px] mt-1 font-medium whitespace-nowrap ${active ? 'text-blue-600' : done ? 'text-green-600' : 'text-gray-400'}`}>
                {label}
              </span>
            </div>
            {s < total && (
              <div className={`w-8 sm:w-12 lg:w-16 h-0.5 mx-1 mb-4 ${done ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        );
      })}
    </div>
  </div>
);

// ─── Back Button ──────────────────────────────────────────────────────────────

const BackBtn = ({ onClick, label = 'Back' }: { onClick: () => void; label?: string }) => (
  <div className="text-center mt-6">
    <button onClick={onClick} className="text-blue-600 hover:underline flex items-center gap-2 mx-auto text-sm">
      <ArrowLeft className="w-4 h-4" /> {label}
    </button>
  </div>
);

// ─── Continue Sticky Button ───────────────────────────────────────────────────

const ContinueBtn = ({
  onClick, disabled = false, label = 'Continue', sublabel = '',
}: {
  onClick: () => void; disabled?: boolean; label?: string; sublabel?: string;
}) => (
  <div className="sticky bottom-4 mt-8 flex justify-center z-30">
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-3 px-8 py-4 rounded-xl font-semibold text-white text-sm shadow-lg transition-all
        ${disabled ? 'bg-gray-300 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-xl'}`}
    >
      <span>{label}</span>
      {sublabel && <span className="text-blue-200 text-xs">· {sublabel}</span>}
      <ArrowRight className="w-4 h-4" />
    </button>
  </div>
);

// ═════════════════════════════════════════════════════════════════════════════
// MAIN WIZARD COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

const MentorshipWizard = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [state, setState] = useState<WizardState>({ subjects: [], diagnosticStarted: false });
  const [searchExam, setSearchExam] = useState('');
  const [matchProgress, setMatchProgress] = useState(0);
  const [matchLabel, setMatchLabel] = useState('Searching mentors…');
  const [completedTests, setCompletedTests] = useState<string[]>([]);

  // ── Matching animation ────────────────────────────────────────────────────

  useEffect(() => {
    if (step !== 7) return;
    const labels = [
      'Searching mentors…',
      'Checking language match…',
      'Verifying stage expertise…',
      'Checking capacity (< 20 students)…',
      'Assigning best match…',
    ];
    let i = 0;
    const timer = setInterval(() => {
      setMatchProgress((i + 1) * 20);
      setMatchLabel(labels[i]);
      i++;
      if (i >= labels.length) {
        clearInterval(timer);
        const mentor = assignMentor(
          state.language?.id ?? 'english',
          state.stage?.id ?? 'prelims',
          state.category?.id ?? 'banking',
        );
        setState(s => ({ ...s, assignedMentor: mentor ?? undefined }));
        setTimeout(() => setStep(8), 600);
      }
    }, 800);
    return () => clearInterval(timer);
  }, [step]);

  // ─── Category & stage ID mapping ─────────────────────────────────────────
  // mentorshipData.ts uses different IDs than mentorshipExamData.ts

  const CATEGORY_MAP: Record<string, string> = {
    'banking-insurance': 'banking',
    'civil-services':    'state',
    'banking-ssc-combo': 'banking',  // combo: show banking exams as primary
    'railway-ssc-combo': 'railway',  // combo: show railway exams as primary
    'upsc-civil-combo':  'upsc',     // combo: show upsc exams as primary
  };

  // Stage 'all' in mentorshipData maps to 'overall' in mentorshipExamData
  const STAGE_MAP: Record<string, string> = {
    'all': 'overall',
  };

  const resolvedCategoryId =
    CATEGORY_MAP[state.category?.id ?? ''] ?? (state.category?.id ?? '');

  const resolvedStageId =
    STAGE_MAP[state.stage?.id ?? ''] ?? (state.stage?.id ?? '');

  // ─── filtered exams ───────────────────────────────────────────────────────

  const categoryExams = targetExams.filter(e =>
    e.category === resolvedCategoryId &&
    (searchExam === '' || e.name.toLowerCase().includes(searchExam.toLowerCase()))
  );
  const popularExams = categoryExams.filter(e => e.popular);
  const otherExams = categoryExams.filter(e => !e.popular);

  // ─── available subjects for selected stage ────────────────────────────────

  const stageId = resolvedStageId as 'prelims' | 'mains' | 'interview' | 'overall' | undefined;
  const availableSubjects = subjectOptions.filter(s =>
    !stageId || s.stages.includes(stageId)
  );
  const recommended = state.targetExam ? (recommendedSubjects[state.targetExam.id] ?? []) : [];

  // ─── diagnostic tests for selections ─────────────────────────────────────

  const myTests = diagnosticTests
    .filter(t =>
      (!stageId || t.stages.includes(stageId)) &&
      t.categories.includes(resolvedCategoryId)
    )
    .slice(0, 5);

  // ─── handlers ─────────────────────────────────────────────────────────────

  const toggleSubject = (id: string) => {
    setState(s => ({
      ...s,
      subjects: s.subjects.includes(id) ? s.subjects.filter(x => x !== id) : [...s.subjects, id],
    }));
  };

  const selectAllSubjects = () => {
    setState(s => ({ ...s, subjects: availableSubjects.map(x => x.id) }));
  };

  const handleFinish = () => {
    localStorage.setItem('mentorshipWizard', JSON.stringify(state));
    localStorage.setItem('mentorshipSelection', JSON.stringify({
      category: state.category,
      stage: state.stage,
      targetExam: state.targetExam,
      subjects: state.subjects,
      language: state.language,
      assignedMentor: state.assignedMentor,
    }));
    navigate('/student/mentorship');
  };

  // ═══════════════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center justify-center gap-3">
            <Sparkles className="w-7 h-7 text-blue-600" />
            Find Your Perfect Mentorship
          </h1>
          <p className="text-gray-500 text-sm">Answer a few questions to get personalized mentorship recommendations</p>
        </div>

        {/* Progress */}
        {step < 7 && <ProgressBar step={step} total={STEPS.length} />}

        {/* ── STEP 1: Category ──────────────────────────────────────────────── */}
        {step === 1 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">Select Your Exam Category</h2>
            <p className="text-center text-gray-500 text-sm mb-8">Choose the exam family you are preparing for</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mentorshipCategories.map((cat) => {
                const selected = state.category?.id === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => { setState({ subjects: [], category: cat }); setStep(2); }}
                    className={`p-5 rounded-2xl border-2 transition-all text-left hover:shadow-lg hover:scale-[1.02]
                      ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                  >
                    <img src={cat.logo} alt={cat.name} className="w-12 h-12 mb-3 rounded-lg" />
                    <h3 className="text-[14px] font-bold text-gray-900 mb-1">{cat.name}</h3>
                    <p className="text-[11px] text-gray-500 mb-3 line-clamp-2">{cat.description}</p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{cat.studentsEnrolled.toLocaleString()} students</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── STEP 2: Stage ─────────────────────────────────────────────────── */}
        {step === 2 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">Select Exam Stage</h2>
            <p className="text-center text-sm text-gray-500 mb-8">
              Preparing for <span className="font-semibold text-blue-600">{state.category?.name}</span>
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
              {examStages.map((stage) => {
                const selected = state.stage?.id === stage.id;
                const hints: Record<string, string> = {
                  prelims: 'Speed + accuracy focused',
                  mains: 'Advanced problem solving + descriptive',
                  interview: 'Personality + communication',
                  overall: 'Full-cycle end-to-end guidance',
                };
                const icons: Record<string, string> = {
                  prelims: '⚡', mains: '🎯', interview: '🎤', overall: '🏆',
                };
                return (
                  <button
                    key={stage.id}
                    onClick={() => { setState(s => ({ ...s, stage })); setStep(3); }}
                    className={`p-6 rounded-2xl border-2 transition-all text-left hover:shadow-lg hover:scale-[1.03]
                      ${selected ? 'border-blue-500 bg-blue-50 scale-[1.03]' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                  >
                    <div className="text-3xl mb-3">{icons[stage.id] ?? '📋'}</div>
                    <h3 className="text-[15px] font-bold text-gray-900 mb-1">{stage.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">{hints[stage.id] ?? stage.description}</p>
                    {selected && (
                      <span className="inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <BackBtn onClick={() => setStep(1)} label="Back to Categories" />
          </div>
        )}

        {/* ── STEP 3: Target Exam ────────────────────────────────────────────── */}
        {step === 3 && (
          <div>
            <h2 className="text-2xl font-bold text-center mb-2">Select Your Target Exam</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              {state.category?.name} · {state.stage?.name}
            </p>

            {/* Search */}
            <div className="relative max-w-md mx-auto mb-8">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchExam}
                onChange={e => setSearchExam(e.target.value)}
                placeholder="Search exam..."
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 bg-white"
              />
            </div>

            {/* Popular */}
            {popularExams.length > 0 && searchExam === '' && (
              <div className="mb-8">
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">⭐ Popular Exams</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {popularExams.map(exam => {
                    const selected = state.targetExam?.id === exam.id;
                    return (
                      <button
                        key={exam.id}
                        onClick={() => setState(s => ({ ...s, targetExam: exam }))}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left hover:shadow-md
                          ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0
                          ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">{exam.name}</p>
                          {exam.tags && <p className="text-[10px] text-blue-600 font-medium">{exam.tags.join(' · ')}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* All / filtered */}
            {(searchExam ? categoryExams.length > 0 : otherExams.length > 0) && (
              <div>
                <h3 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                  {searchExam ? 'Search Results' : 'All Exams'}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {(searchExam ? categoryExams : otherExams).map(exam => {
                    const selected = state.targetExam?.id === exam.id;
                    return (
                      <button
                        key={exam.id}
                        onClick={() => setState(s => ({ ...s, targetExam: exam }))}
                        className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left hover:shadow-md
                          ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 flex items-center justify-center
                          ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                          {selected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <div>
                           <p className="text-sm font-semibold text-gray-900">{exam.name}</p>
                           {exam.tags && searchExam && <p className="text-[10px] text-blue-600 font-medium mt-0.5">{exam.tags.join(' · ')}</p>}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            {/* Empty state */}
            {categoryExams.length === 0 && (
              <div className="text-center py-12">
                <div className="text-4xl mb-3">🔍</div>
                <p className="text-gray-500 font-medium mb-1">No exams found for this category yet.</p>
                <p className="text-xs text-gray-400">
                  Exams for <span className="font-semibold">{state.category?.name}</span> are coming soon.
                  You can go back and pick a different category.
                </p>
              </div>
            )}

            <ContinueBtn
              onClick={() => { setSearchExam(''); setStep(4); }}
              disabled={!state.targetExam}
              label="Continue"
              sublabel={state.targetExam?.name}
            />
            <BackBtn onClick={() => setStep(2)} label="Back to Stage" />
          </div>
        )}

        {/* ── STEP 4: Subjects ──────────────────────────────────────────────── */}
        {step === 4 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-2">Select Subjects</h2>
            <p className="text-center text-sm text-gray-500 mb-6">
              {state.targetExam?.name} · {state.stage?.name}
            </p>

            {/* Smart recommendation */}
            {recommended.length > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-blue-800">
                    Recommended for {state.targetExam?.name} {state.stage?.name}
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    {recommended.map(id => subjectOptions.find(s => s.id === id)?.name).filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button
                  onClick={() => setState(s => ({ ...s, subjects: recommended }))}
                  className="ml-auto text-xs text-blue-600 font-semibold hover:underline whitespace-nowrap"
                >
                  Apply →
                </button>
              </div>
            )}

            <div className="flex justify-end mb-4">
              <button
                onClick={selectAllSubjects}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Select All
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {availableSubjects.map(subject => {
                const selected = state.subjects.includes(subject.id);
                const isRec = recommended.includes(subject.id);
                return (
                  <button
                    key={subject.id}
                    onClick={() => toggleSubject(subject.id)}
                    className={`flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left hover:shadow-md
                      ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-blue-200'}`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0
                      ${selected ? 'bg-blue-100' : 'bg-gray-50'}`}>
                      {subject.icon}
                    </div>
                    <div className="flex-1">
                      <p className={`text-sm font-bold ${selected ? 'text-blue-900' : 'text-gray-900'}`}>
                        {subject.name}
                      </p>
                      {isRec && (
                        <span className="text-[10px] text-blue-600 font-medium">⭐ Recommended</span>
                      )}
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0
                      ${selected ? 'border-blue-600 bg-blue-600' : 'border-gray-300'}`}>
                      {selected && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                    </div>
                  </button>
                );
              })}
            </div>

            <ContinueBtn
              onClick={() => setStep(5)}
              disabled={state.subjects.length === 0}
              label="Continue"
              sublabel={`${state.subjects.length} subject${state.subjects.length !== 1 ? 's' : ''} selected`}
            />
            <BackBtn onClick={() => setStep(3)} label="Back to Exam" />
          </div>
        )}

        {/* ── STEP 5: Language ──────────────────────────────────────────────── */}
        {step === 5 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-2">Choose Your Preferred Language</h2>
            <p className="text-center text-sm text-gray-500 mb-2">
              Your mentor, daily tasks, and guidance will be prioritized in this language.
            </p>
            <p className="text-center text-xs text-gray-400 mb-8">
              We support: English · हिन्दी · தமிழ் · മലയാളം · ಕನ್ನಡ · తెలుగు
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {languageOptions.map(lang => {
                const selected = state.language?.id === lang.id;
                return (
                  <button
                    key={lang.id}
                    onClick={() => setState(s => ({ ...s, language: lang }))}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-2 transition-all hover:shadow-lg hover:scale-[1.02]
                      ${selected ? 'border-blue-500 bg-blue-50 scale-[1.03] shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'}`}
                  >
                    <span className="text-3xl">{lang.flag}</span>
                    <span className="text-xl font-bold text-gray-900">{lang.nativeScript}</span>
                    <span className="text-xs text-gray-500 font-medium">{lang.name}</span>
                    {selected && (
                      <span className="mt-1 inline-flex items-center gap-1 text-xs text-blue-600 font-semibold">
                        <Check className="w-3 h-3" /> Selected
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <ContinueBtn
              onClick={() => setStep(6)}
              disabled={!state.language}
              label="Continue"
              sublabel={state.language?.name}
            />
            <BackBtn onClick={() => setStep(4)} label="Back to Subjects" />
          </div>
        )}

        {/* ── STEP 6: Confirm ───────────────────────────────────────────────── */}
        {step === 6 && (
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-2">Review Your Setup</h2>
            <p className="text-center text-sm text-gray-500 mb-8">
              Confirm your selections before we find you the perfect mentor.
            </p>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm divide-y divide-gray-100 mb-6">
              {[
                { label: 'Exam Category', value: state.category?.name, step: 1 },
                { label: 'Exam Stage', value: state.stage?.name, step: 2 },
                { label: 'Target Exam', value: state.targetExam?.name, step: 3 },
                {
                  label: 'Subjects',
                  value: state.subjects
                    .map(id => subjectOptions.find(s => s.id === id)?.name)
                    .filter(Boolean)
                    .join(', '),
                  step: 4,
                },
                { label: 'Language', value: `${state.language?.flag} ${state.language?.name}`, step: 5 },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-xs text-gray-400 font-medium mb-0.5">{row.label}</p>
                    <p className="text-sm font-bold text-gray-900">{row.value || '—'}</p>
                  </div>
                  <button
                    onClick={() => setStep(row.step)}
                    className="text-xs text-blue-600 hover:underline font-medium"
                  >
                    Edit
                  </button>
                </div>
              ))}
            </div>

            {/* Matching criteria callout */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="text-sm font-semibold text-blue-800 mb-2">
                🤖 Your mentor will be matched based on:
              </p>
              <ul className="space-y-1">
                {[
                  `Language: ${state.language?.name}`,
                  `Stage expertise: ${state.stage?.name}`,
                  `Category: ${state.category?.name}`,
                  'Capacity: mentor with < 20 students',
                ].map(item => (
                  <li key={item} className="flex items-center gap-2 text-xs text-blue-700">
                    <Check className="w-3 h-3 text-blue-500" /> {item}
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setStep(7)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-3 transition-all shadow-lg"
            >
              <Sparkles className="w-5 h-5" />
              Find My Mentor
              <ArrowRight className="w-5 h-5" />
            </button>

            <BackBtn onClick={() => setStep(5)} label="Back to Language" />
          </div>
        )}

        {/* ── STEP 7: Matching Animation ────────────────────────────────────── */}
        {step === 7 && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mx-auto mb-6 animate-pulse">
              <Sparkles className="w-10 h-10 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Finding your perfect mentor…</h2>
            <p className="text-sm text-gray-500 mb-8">{matchLabel}</p>

            {/* Progress bar */}
            <div className="w-full bg-gray-100 rounded-full h-2 mb-8 overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${matchProgress}%` }}
              />
            </div>

            <div className="space-y-3 text-left">
              {[
                { label: 'Matching language preference', done: matchProgress >= 20 },
                { label: 'Verifying stage expertise', done: matchProgress >= 40 },
                { label: 'Checking exam category knowledge', done: matchProgress >= 60 },
                { label: 'Confirming capacity (< 20 students)', done: matchProgress >= 80 },
                { label: 'Assigning best matching mentor', done: matchProgress >= 100 },
              ].map((item, i) => (
                <div key={i} className={`flex items-center gap-3 text-sm ${item.done ? 'text-green-700' : 'text-gray-400'}`}>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${item.done ? 'bg-green-500' : 'bg-gray-200'}`}>
                    {item.done && <Check className="w-3 h-3 text-white" />}
                  </div>
                  {item.label}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── STEP 8: Mentor Assigned ───────────────────────────────────────── */}
        {step === 8 && state.assignedMentor && (
          <div className="max-w-lg mx-auto text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Mentor Assigned Successfully!</h2>
            <p className="text-sm text-gray-500 mb-8">
              Your mentor will guide you through your {state.targetExam?.name} preparation.
            </p>

            {/* Mentor Card */}
            <div className="bg-white rounded-2xl border-2 border-blue-200 shadow-lg p-6 mb-8 text-left">
              <div className="flex items-start gap-4 mb-5">
                <img
                  src={state.assignedMentor.avatar}
                  alt={state.assignedMentor.name}
                  className="w-16 h-16 rounded-full border-4 border-blue-100 flex-shrink-0"
                />
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{state.assignedMentor.name}</h3>
                  <div className="flex items-center gap-1 mb-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(state.assignedMentor!.rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-200'}`} />
                    ))}
                    <span className="text-xs text-gray-600 ml-1">{state.assignedMentor.rating}/5</span>
                  </div>
                  <p className="text-xs text-gray-500">{state.assignedMentor.bio}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Language</p>
                  <p className="font-semibold text-gray-900">
                    {state.assignedMentor.languages.map(l => languageOptions.find(o => o.id === l)?.name).filter(Boolean).join(', ')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Stage</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {state.assignedMentor.stages.join(', ')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Students</p>
                  <p className="font-semibold text-gray-900">
                    {state.assignedMentor.studentCount}/{state.assignedMentor.maxStudents}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <p className="text-gray-500 mb-1">Response Time</p>
                  <p className="font-semibold text-gray-900">{state.assignedMentor.responseTime}</p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2 font-medium">Expertise</p>
                <div className="flex flex-wrap gap-2">
                  {state.assignedMentor.expertise.map(e => (
                    <span key={e} className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-[11px] font-medium">
                      {e}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={() => setStep(9)}
                className="py-3 px-5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <BookOpen className="w-4 h-4" /> Start Diagnostic Test
              </button>
              <button
                onClick={handleFinish}
                className="py-3 px-5 border-2 border-blue-600 text-blue-600 hover:bg-blue-50 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Chat with Mentor
              </button>
            </div>

            <button
              onClick={handleFinish}
              className="mt-3 text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Skip tests — go to dashboard
            </button>
          </div>
        )}

        {/* ── STEP 9: Diagnostic Tests ──────────────────────────────────────── */}
        {step === 9 && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-2">Start Your Assessment</h2>
            <p className="text-center text-sm text-gray-500 mb-2">
              Complete these 5 tests so your mentor can understand your strengths and weak areas.
            </p>
            <p className="text-center text-xs text-gray-400 mb-8">
              Based on: {state.targetExam?.name} · {state.stage?.name}
            </p>

            <div className="space-y-3 mb-8">
              {myTests.map((test, i) => {
                const done = completedTests.includes(test.id);
                return (
                  <div
                    key={test.id}
                    className={`flex items-center gap-5 p-5 rounded-xl border-2 transition-all
                      ${done ? 'bg-green-50 border-green-300' : `bg-white ${test.bgColor}`}`}
                  >
                    <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center text-sm font-bold text-gray-500 flex-shrink-0">
                      {done ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <h3 className={`text-sm font-bold ${done ? 'text-green-800 line-through' : 'text-gray-900'}`}>
                        {test.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}</span>
                        <span>{test.questions} questions</span>
                        <span className={`px-2 py-0.5 rounded-full font-medium
                          ${test.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                            test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                          {test.difficulty}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => !done && setCompletedTests(p => [...p, test.id])}
                      disabled={done}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all
                        ${done ? 'bg-green-100 text-green-700 cursor-default' : `${test.color} border-2 border-current hover:bg-gray-50`}`}
                    >
                      {done ? '✓ Done' : 'Start Test'}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Progress */}
            <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-gray-700">Tests Completed</span>
                <span className="font-bold text-blue-600">{completedTests.length}/{myTests.length}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="h-full bg-blue-600 rounded-full transition-all duration-500"
                  style={{ width: `${(completedTests.length / (myTests.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <button
              onClick={handleFinish}
              disabled={completedTests.length === 0}
              className={`w-full py-4 rounded-xl font-bold text-sm flex items-center justify-center gap-3 transition-all
                ${completedTests.length > 0
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'}`}
            >
              {completedTests.length === myTests.length
                ? '🎉 View My Results & Start Dashboard'
                : `Complete at least 1 test to continue (${completedTests.length}/${myTests.length})`}
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              onClick={handleFinish}
              className="mt-3 w-full text-xs text-gray-400 hover:text-gray-600 underline py-2"
            >
              Skip for now — complete later
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default MentorshipWizard;
