
import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertTriangle, TrendingUp, TrendingDown } from 'lucide-react';
import { diagnosticTests } from '@/data/mentorshipExamData';
import launchExamWindow from '@/utils/launchExam';
import { getQuizCompletions } from '@/utils/quizAnalytics';

interface DiagnosticTestPageProps {
  categoryId?: string;
  stageId?: string;
}

// Fallback weak/strong topics if we don't compute them from real analysis in this view
const FALLBACK_TOPICS: Record<string, { weak: string[], strong: string[] }> = {
  'english': { weak: ['Reading Comprehension', 'Para Jumbles'], strong: ['Grammar', 'Vocabulary'] },
  'quant': { weak: ['Time & Work', 'Pipes & Cisterns'], strong: ['Number Series', 'Simplification'] },
  'reasoning': { weak: ['Seating Arrangement', 'Blood Relations'], strong: ['Coding-Decoding', 'Syllogism'] },
  'gk': { weak: ['Static GK', 'Banking Awareness'], strong: ['Current Affairs', 'Sports'] },
};

const DiagnosticTestPage: React.FC<DiagnosticTestPageProps> = ({
  categoryId = 'banking',
  stageId = 'prelims',
}) => {
  const [completedTests, setCompletedTests] = useState<string[]>([]);
  const [actualResults, setActualResults] = useState<Record<string, any>>({});
  const [activeResult, setActiveResult] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(true);

  const myTests = diagnosticTests
    .filter(t =>
      t.categories.includes(categoryId) &&
      (t.stages.includes(stageId as any))
    )
    .slice(0, 5);

  useEffect(() => {
    const refresh = () => {
      const completions = getQuizCompletions();
      const newCompleted: string[] = [];
      const newResults: Record<string, any> = {};
      
      myTests.forEach(t => {
         const resStr = localStorage.getItem('exam_result_' + t.id);
         if (resStr || completions[t.id]) {
             const res = resStr ? JSON.parse(resStr) : { correctAnswers: 0, score: completions[t.id]?.score || 0, timeTaken: 0 };
             newCompleted.push(t.id);
             newResults[t.id] = {
                 score: res.correctAnswers,
                 accuracy: res.score,
                 timeTaken: Math.max(1, Math.round(res.timeTaken / 60)) + ' min',
                 weakTopics: FALLBACK_TOPICS[t.id.split('-')[0]]?.weak || ['Application Concepts'],
                 strongTopics: FALLBACK_TOPICS[t.id.split('-')[0]]?.strong || ['Basics'],
             };
         }
      });
      
      setCompletedTests(newCompleted);
      setActualResults(newResults);
    };
    
    refresh();
    window.addEventListener('focus', refresh);
    return () => window.removeEventListener('focus', refresh);
  }, [categoryId, stageId]);

  const handleStartTest = (test: typeof myTests[0]) => {
    const subject = test.id.split('-')[0].charAt(0).toUpperCase() + test.id.split('-')[0].slice(1);
    launchExamWindow({
      quizId: test.id,
      title: test.title,
      subject: subject,
      duration: parseInt(test.duration) || 15,
      questions: test.questions,
      returnUrl: '/student/mentorship',
    });
  };

  const handleViewAnalysis = (test: typeof myTests[0]) => {
    const subject = test.id.split('-')[0].charAt(0).toUpperCase() + test.id.split('-')[0].slice(1);
    launchExamWindow({
      quizId: test.id,
      title: test.title,
      subject: subject,
      duration: parseInt(test.duration) || 15,
      questions: test.questions,
      returnUrl: '/student/mentorship',
      mode: 'analysis',
    });
  };

  // Overall statistics
  const allWeak = Object.values(actualResults).flatMap(r => r.weakTopics);
  const allStrong = Object.values(actualResults).flatMap(r => r.strongTopics);
  const avgAccuracy = completedTests.length > 0 
    ? Math.round(Object.values(actualResults).reduce((s, r) => s + r.accuracy, 0) / completedTests.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header summary */}
      {showSummary && completedTests.length > 0 && (
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-bold mb-1">📊 Overall Assessment Profile</h3>
              <p className="text-blue-200 text-sm">Based on {completedTests.length} completed test{completedTests.length !== 1 ? 's' : ''}</p>
            </div>
            <button onClick={() => setShowSummary(false)} className="text-blue-200 text-xs hover:text-white">Hide →</button>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{avgAccuracy}%</p>
              <p className="text-xs text-blue-200 mt-1">Avg Accuracy</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{completedTests.length}/{myTests.length}</p>
              <p className="text-xs text-blue-200 mt-1">Tests Done</p>
            </div>
            <div className="bg-white/10 rounded-xl p-4 text-center">
              <p className="text-2xl font-bold">{allWeak.length}</p>
              <p className="text-xs text-blue-200 mt-1">Weak Topics</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs font-semibold text-blue-200 mb-2 flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" /> Needs Attention
              </p>
              <div className="space-y-1.5">
                {[...new Set(allWeak)].slice(0, 4).map(t => (
                  <span key={t} className="block text-xs bg-red-400/20 text-white px-2.5 py-1 rounded-md">{t}</span>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-200 mb-2 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" /> Your Strengths
              </p>
              <div className="space-y-1.5">
                {[...new Set(allStrong)].slice(0, 4).map(t => (
                  <span key={t} className="block text-xs bg-green-400/20 text-white px-2.5 py-1 rounded-md">{t}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Test cards */}
      <div>
        <h3 className="text-base font-bold text-gray-900 mb-4">Your Diagnostic Tests</h3>
        <div className="space-y-3">
          {myTests.map((test, i) => {
            const done = completedTests.includes(test.id);
            const result = actualResults[test.id];
            const isOpen = activeResult === test.id;

            return (
              <div key={test.id} className={`rounded-xl border-2 overflow-hidden transition-all ${done ? 'border-green-200' : test.bgColor}`}>
                <div className="flex items-center gap-4 p-4">
                  <div className="w-8 h-8 rounded-full bg-white border-2 border-gray-200 flex items-center justify-center flex-shrink-0">
                    {done
                      ? <CheckCircle2 className="w-5 h-5 text-green-500" />
                      : <span className="text-sm font-bold text-gray-500">{i + 1}</span>
                    }
                  </div>

                  <div className="flex-1">
                    <h4 className={`text-sm font-bold ${done ? 'text-gray-900' : 'text-gray-800'}`}>
                      {test.title}
                    </h4>
                    <div className="flex items-center gap-3 mt-0.5 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {test.duration}</span>
                      <span>{test.questions} Qs</span>
                      <span className={`px-1.5 py-0.5 rounded font-medium
                        ${test.difficulty === 'Easy' ? 'bg-green-100 text-green-700' :
                          test.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                        {test.difficulty}
                      </span>
                      {done && result && (
                        <span className="text-green-600 font-semibold">Score: {result.accuracy}%</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap justify-end">
                    {done && result && (
                      <button
                        onClick={() => handleViewAnalysis(test)}
                        className="text-xs px-3 py-1.5 bg-blue-50 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition whitespace-nowrap"
                      >
                        Full Analysis
                      </button>
                    )}
                    {done && result && (
                      <button
                        onClick={() => setActiveResult(isOpen ? null : test.id)}
                        className="text-xs text-gray-600 font-semibold hover:underline whitespace-nowrap"
                      >
                        {isOpen ? 'Hide Quick Stats' : 'Quick Stats'}
                      </button>
                    )}
                    <button
                      onClick={() => !done && handleStartTest(test)}
                      disabled={done}
                      className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all flex-shrink-0 whitespace-nowrap
                        ${done
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : `bg-white ${test.color} border-2 border-current hover:shadow-md`}`}
                    >
                      {done ? '✓ Done' : 'Start Test'}
                    </button>
                  </div>
                </div>

                {/* Expandable Quick Stats */}
                {isOpen && result && (
                  <div className="px-4 pb-4 border-t border-gray-100 bg-gray-50">
                    <div className="grid grid-cols-3 gap-3 py-3 mb-3">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{result.score}/{test.questions}</p>
                        <p className="text-xs text-gray-500">Correct</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{result.accuracy}%</p>
                        <p className="text-xs text-gray-500">Accuracy</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{result.timeTaken}</p>
                        <p className="text-xs text-gray-500">Time</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs font-semibold text-red-600 mb-1.5 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Weak Topics
                        </p>
                        {result.weakTopics.map((t: string) => (
                          <span key={t} className="block text-xs text-gray-700 bg-red-50 px-2 py-1 rounded mb-1">{t}</span>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-green-600 mb-1.5 flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" /> Strong Topics
                        </p>
                        {result.strongTopics.map((t: string) => (
                          <span key={t} className="block text-xs text-gray-700 bg-green-50 px-2 py-1 rounded mb-1">{t}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Mentor note */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <img src="https://i.pravatar.cc/150?u=rajesh" alt="Mentor" className="w-8 h-8 rounded-full flex-shrink-0" />
          <div>
            <p className="text-sm font-bold text-gray-900 mb-1">Rajesh Kumar · Your Mentor</p>
            <p className="text-sm text-gray-700 leading-relaxed">
              I've analyzed your diagnostic results. Your <strong>Number Series</strong> and <strong>Grammar</strong> are strong — great! 
              Focus this week on <strong>Seating Arrangement</strong> and <strong>Reading Comprehension</strong>. 
              I've already added those to your daily tasks.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiagnosticTestPage;
