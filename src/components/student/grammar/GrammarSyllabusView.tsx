import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  BookOpen, Video, FileText, Clock, Target, CheckCircle2,
  ChevronDown, ChevronUp, Search, Play, Download, Sparkles,
  HelpCircle, CheckCircle, XCircle, ArrowRight, Zap, RefreshCw,
  X, ArrowLeft, Lightbulb, AlertTriangle, BookMarked, Award
} from 'lucide-react';
import { grammarTopics } from '@/data/grammarData';

// ─── Grammar Topic Interface ──────────────────────────────────────────────────
export interface GrammarTopicItem {
  id: string;
  name: string;
  description: string;
  videos: { id: string; title: string; duration: string; url: string; instructor: string }[];
  pdfs: { id: string; title: string; pages: number; size: string; url: string }[];
  tests: { id: string; title: string; questionsCount: number; duration: string }[];
  quizQuestions?: { question: string; options: string[]; correctIndex: number; explanation: string }[];
}

export interface GrammarModuleCategory {
  id: string;
  name: string;
  icon: string;
  description: string;
  topics: GrammarTopicItem[];
}

// ─── Detailed Specific Topic Articles (Crystal-Clear Content) ──────────────────
export const TOPIC_ARTICLES: Record<string, {
  title: string;
  subtitle: string;
  emoji: string;
  timeMinutes: number;
  xpReward: number;
  definition: string;
  simpleExplanation: string;
  keyTypes: { name: string; desc: string; example: string; punctuation: string }[];
  memoryTrick: string;
  commonMistakes: { wrong: string; correct: string; tip: string }[];
  revisionPoints: string[];
}> = {
  'types-sentences': {
    title: 'Four Structural Types of Sentences',
    subtitle: 'Declarative, Interrogative, Imperative, and Exclamatory',
    emoji: '💬',
    timeMinutes: 7,
    xpReward: 75,
    definition: 'A sentence is a group of words expressing a complete thought. Based on purpose and punctuation, sentences are categorized into 4 structural types.',
    simpleExplanation: 'Every sentence you speak or write does one of four jobs: it tells a statement, asks a question, gives an order, or shouts excitement.',
    keyTypes: [
      { name: 'Declarative Sentence', desc: 'Makes a statement or states a fact.', example: 'The sun rises in the east.', punctuation: 'Ends with a Period (.)' },
      { name: 'Interrogative Sentence', desc: 'Asks a direct question.', example: 'Where are you going for your exam?', punctuation: 'Ends with Question Mark (?)' },
      { name: 'Imperative Sentence', desc: 'Gives a command, request, or advice.', example: 'Please submit your answer sheet.', punctuation: 'Ends with Period (.) or (!)' },
      { name: 'Exclamatory Sentence', desc: 'Expresses sudden strong emotion or surprise.', example: 'What a magnificent victory!', punctuation: 'Ends with Exclamation (!)' }
    ],
    memoryTrick: 'D-I-I-E Rule: Declarative = Declare fact (.), Interrogative = Inquire (?), Imperative = Instruction, Exclamatory = Emotion (!).',
    commonMistakes: [
      { wrong: 'Where is the exam hall.', correct: 'Where is the exam hall?', tip: 'Interrogative sentences MUST end with a question mark.' },
      { wrong: 'What a nice day.', correct: 'What a nice day!', tip: 'Exclamatory sentences expressing strong feeling end with an exclamation mark.' }
    ],
    revisionPoints: [
      'Declarative sentences state facts and end with a period.',
      'Interrogative sentences ask questions and end with a question mark.',
      'Imperative sentences give orders or requests (starts with base verb).',
      'Exclamatory sentences express strong emotion and end with (!).'
    ]
  },
  'noun': {
    title: 'Noun & Its 5 Core Classifications',
    subtitle: 'Names of Persons, Places, Things, Animals, and Ideas',
    emoji: '🏷️',
    timeMinutes: 8,
    xpReward: 75,
    definition: 'A Noun is the naming word for any person, place, thing, quality, or concept.',
    simpleExplanation: 'Everything you can see, touch, or think of in the world has a name — that name is a Noun.',
    keyTypes: [
      { name: 'Proper Noun', desc: 'Specific name of a person or place (Capitalized).', example: 'Rahul, Delhi, Ganga', punctuation: 'Always Capitalized' },
      { name: 'Common Noun', desc: 'General name of a person, place, or thing.', example: 'boy, city, river, book', punctuation: 'Lowercase' },
      { name: 'Collective Noun', desc: 'Name of a group taken as one whole.', example: 'flock of birds, committee, jury', punctuation: 'Singular verb' },
      { name: 'Abstract Noun', desc: 'Name of a quality, feeling, or state.', example: 'honesty, courage, freedom', punctuation: 'Uncountable' }
    ],
    memoryTrick: 'PPAT: Person, Place, Animal, Thing. Remember: Uncountable nouns (information, advice, furniture, luggage) NEVER take plural "s"!',
    commonMistakes: [
      { wrong: 'He gave me many informations.', correct: 'He gave me much information (or pieces of information).', tip: '"Information" is uncountable; it has no plural form.' },
      { wrong: 'The luggages are heavy.', correct: 'The luggage is heavy.', tip: '"Luggage" is an uncountable noun and takes a singular verb.' }
    ],
    revisionPoints: [
      'Proper Nouns are always capitalized.',
      'Collective Nouns take a singular verb when acting as a single unit.',
      'Uncountable nouns (advice, furniture, scenery, equipment) do not take plural -s.'
    ]
  },
  'pronoun': {
    title: 'Pronouns & Subject-Object Rules',
    subtitle: 'Replacing Nouns to Eliminate Repetition',
    emoji: '🎭',
    timeMinutes: 8,
    xpReward: 75,
    definition: 'A Pronoun is a word used in place of a noun to avoid awkward repetition.',
    simpleExplanation: 'Instead of saying "Arnav went to Arnav\'s car", we say "Arnav went to his car." The word "his" is a pronoun.',
    keyTypes: [
      { name: 'Personal Pronouns', desc: 'Replaces specific persons or things.', example: 'I, you, he, she, it, we, they', punctuation: 'Subject vs Object' },
      { name: 'Relative Pronouns', desc: 'Connects clauses to nouns (Who vs Whom).', example: 'who, whom, which, that', punctuation: 'Who = Subject' },
      { name: 'Reflexive Pronouns', desc: 'Reflects back to the subject.', example: 'myself, himself, themselves', punctuation: 'Reflexive' }
    ],
    memoryTrick: 'Subject Test: Remove the other person to test: "Me went to school" ❌ ➔ "I went to school" ✅. So use "He and I went out"!',
    commonMistakes: [
      { wrong: 'Me and him went to the bank.', correct: 'He and I went to the bank.', tip: 'Use subject pronouns (I, he, she) when performing the action.' },
      { wrong: 'The team lost their match.', correct: 'The team lost its match.', tip: 'Collective singular noun "team" takes "its", not "their".' }
    ],
    revisionPoints: [
      'Subject pronouns (I, he, she, we, they) act as subjects.',
      'Object pronouns (me, him, her, us, them) receive the action.',
      'Who replaces subject nouns; Whom replaces object nouns.'
    ]
  },
  'sva-basic': {
    title: 'Subject Verb Agreement Rules',
    subtitle: 'Matching Subjects & Verbs Correctly',
    emoji: '⚖️',
    timeMinutes: 9,
    xpReward: 75,
    definition: 'Subject-Verb Agreement requires a singular subject to take a singular verb, and a plural subject to take a plural verb.',
    simpleExplanation: 'The verb must agree in number with its subject, no matter how many words come between them.',
    keyTypes: [
      { name: 'Neither...Nor / Either...Or', desc: 'Verb agrees with the subject CLOSER to it.', example: 'Neither the manager nor the employees WERE present.', punctuation: 'Closer Subject Rule' },
      { name: 'Along with / As well as', desc: 'Verb agrees strictly with the FIRST subject.', example: 'The manager, along with his staff, IS attending.', punctuation: 'First Subject Rule' },
      { name: 'Each / Every', desc: 'Takes a singular verb always.', example: 'Each student WAS given a test paper.', punctuation: 'Singular Verb' }
    ],
    memoryTrick: 'Joiners Rule: "As well as / Along with" ➔ Focus on 1st Subject! "Neither...Nor" ➔ Focus on 2nd (Closer) Subject!',
    commonMistakes: [
      { wrong: 'Neither the doctor nor the nurses was available.', correct: 'Neither the doctor nor the nurses WERE available.', tip: 'Verb agrees with closer subject "nurses" (plural).' },
      { wrong: 'The captain, as well as the players, are happy.', correct: 'The captain, as well as the players, IS happy.', tip: 'In "as well as", verb agrees with first subject "captain" (singular).' }
    ],
    revisionPoints: [
      'Singular subject = Singular verb; Plural subject = Plural verb.',
      'In Either/Or, Neither/Nor: Agree with the closest subject.',
      'In along with, as well as, together with: Agree with the first subject.'
    ]
  }
};

// ─── Curriculum Data ──────────────────────────────────────────────────────────
export const GRAMMAR_CURRICULUM: GrammarModuleCategory[] = [
  {
    id: 'foundation',
    name: 'Foundation of Grammar',
    icon: '💡',
    description: 'Core concepts, sentence structure, and building blocks of English',
    topics: [
      {
        id: 'what-is-grammar',
        name: 'What is Grammar & Sentence Basics',
        description: 'Pillars of English language, letters to sentences',
        videos: [
          { id: 'v1', title: 'Introduction to English Grammar', duration: '12 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Anita Sharma' }
        ],
        pdfs: [{ id: 'p1', title: 'Sentence Basics & Rules Notes', pages: 5, size: '1.2 MB', url: '#' }],
        tests: [{ id: 't1', title: 'Basic Sentence Structure Test', questionsCount: 10, duration: '10 mins' }],
        quizQuestions: [
          { question: 'Which of the following is a complete sentence?', options: ['Running in the park', 'She reads books daily.', 'Because of the heavy rain', 'Under the big tree'], correctIndex: 1, explanation: 'A complete sentence must contain both a subject and a predicate (verb).' },
          { question: 'What are the 4 main skills of English language learning?', options: ['Reading, Writing, Listening, Speaking', 'Grammar, Vocab, Spelling, Pronunciation', 'Nouns, Verbs, Adjectives, Adverbs', 'Listening, Watching, Reading, Memorizing'], correctIndex: 0, explanation: 'The 4 fundamental language skills are Reading, Writing, Listening, and Speaking.' }
        ]
      },
      {
        id: 'subject-predicate',
        name: 'Subject & Predicate',
        description: 'Identifying the actor and the action in every sentence',
        videos: [{ id: 'v3', title: 'Mastering Subject & Predicate', duration: '10 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Anita Sharma' }],
        pdfs: [{ id: 'p3', title: 'Subject-Predicate Rulebook', pages: 4, size: '950 KB', url: '#' }],
        tests: [{ id: 't3', title: 'Subject & Predicate Practice', questionsCount: 10, duration: '8 mins' }]
      },
      {
        id: 'types-sentences',
        name: 'Types of Sentences (Declarative, Interrogative, Imperative, Exclamatory)',
        description: 'Four structural types of sentences and their punctuation',
        videos: [{ id: 'v4', title: '4 Types of Sentences Explained', duration: '14 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Kavita Roy' }],
        pdfs: [{ id: 'p4', title: 'Sentence Types Quick Reference', pages: 3, size: '700 KB', url: '#' }],
        tests: [{ id: 't4', title: 'Sentence Types Identification Test', questionsCount: 10, duration: '10 mins' }]
      },
      {
        id: 'capitalization',
        name: 'Capitalization & Punctuation Rules',
        description: 'Commas, periods, apostrophes, and capital letters',
        videos: [{ id: 'v5', title: 'Punctuation Mastery Class', duration: '18 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Rohan Verma' }],
        pdfs: [{ id: 'p5', title: 'Punctuation & Capitalization Cheat Sheet', pages: 6, size: '1.5 MB', url: '#' }],
        tests: [{ id: 't5', title: 'Punctuation Error Spotting Test', questionsCount: 12, duration: '10 mins' }]
      }
    ]
  },
  {
    id: 'parts-of-speech',
    name: 'Parts of Speech',
    icon: '🧩',
    description: 'Nouns, Pronouns, Verbs, Adjectives, Adverbs, Prepositions, Conjunctions, Articles',
    topics: [
      {
        id: 'noun',
        name: 'Noun',
        description: 'Types of nouns: Common, Proper, Collective, Abstract, Countable & Uncountable',
        videos: [{ id: 'v_noun1', title: 'Nouns & Its Types Detailed Lesson', duration: '20 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Anita Sharma' }],
        pdfs: [{ id: 'p_noun1', title: 'Complete Noun Rules & Exceptions', pages: 8, size: '2.1 MB', url: '#' }],
        tests: [{ id: 't_noun1', title: 'Noun Types & Error Spotting Test 1', questionsCount: 15, duration: '15 mins' }]
      },
      {
        id: 'pronoun',
        name: 'Pronoun',
        description: 'Personal, Relative, Reflexive, Demonstrative & Indefinite Pronouns',
        videos: [{ id: 'v_pro1', title: 'Pronoun Rules & Common Errors', duration: '18 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Kavita Roy' }],
        pdfs: [{ id: 'p_pro1', title: 'Pronoun Error Spotting Rules', pages: 6, size: '1.4 MB', url: '#' }],
        tests: [{ id: 't_pro1', title: 'Pronoun Usage & Agreement Test', questionsCount: 15, duration: '12 mins' }]
      },
      {
        id: 'verb',
        name: 'Verb',
        description: 'Action verbs, Linking verbs, Transitive/Intransitive & Auxiliary Verbs',
        videos: [{ id: 'v_verb1', title: 'Verbs & Helping Verbs Explained', duration: '22 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Rohan Verma' }],
        pdfs: [{ id: 'p_verb1', title: 'Irregular Verbs List', pages: 7, size: '1.8 MB', url: '#' }],
        tests: [{ id: 't_verb1', title: 'Transitive vs Intransitive Test', questionsCount: 12, duration: '10 mins' }]
      },
      {
        id: 'adjective',
        name: 'Adjective',
        description: 'Degrees of Comparison, Order of Adjectives & Participle Adjectives',
        videos: [{ id: 'v_adj1', title: 'Degrees of Comparison Rules', duration: '16 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Anita Sharma' }],
        pdfs: [{ id: 'p_adj1', title: 'Order of Adjectives Guide', pages: 5, size: '1.1 MB', url: '#' }],
        tests: [{ id: 't_adj1', title: 'Adjectives Practice Quiz', questionsCount: 12, duration: '10 mins' }]
      },
      {
        id: 'adverb',
        name: 'Adverb',
        description: 'Adverbs of Manner, Time, Place, Degree & Frequency',
        videos: [{ id: 'v_adv1', title: 'Adverb Placement & Rules', duration: '15 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Kavita Roy' }],
        pdfs: [{ id: 'p_adv1', title: 'Adverb vs Adjective Rules', pages: 4, size: '950 KB', url: '#' }],
        tests: [{ id: 't_adv1', title: 'Adverb Identification Test', questionsCount: 10, duration: '8 mins' }]
      },
      {
        id: 'preposition',
        name: 'Preposition',
        description: 'Prepositions of Time, Place, Direction & Fixed Prepositions',
        videos: [{ id: 'v_prep1', title: 'Prepositions of Time (In, On, At)', duration: '18 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Anita Sharma' }],
        pdfs: [{ id: 'p_prep1', title: 'Fixed Prepositions List PDF', pages: 10, size: '2.5 MB', url: '#' }],
        tests: [{ id: 't_prep1', title: 'Prepositions Fillers Test', questionsCount: 20, duration: '15 mins' }]
      },
      {
        id: 'conjunction',
        name: 'Conjunction',
        description: 'Coordinating (FANBOYS), Subordinating & Correlative Conjunctions',
        videos: [{ id: 'v_conj1', title: 'Conjunctions Masterclass', duration: '17 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Kavita Roy' }],
        pdfs: [{ id: 'p_conj1', title: 'Correlative Conjunction Pairs', pages: 4, size: '850 KB', url: '#' }],
        tests: [{ id: 't_conj1', title: 'Conjunction Error Spotting Test', questionsCount: 12, duration: '10 mins' }]
      },
      {
        id: 'articles',
        name: 'Articles (A, An, The)',
        description: 'Indefinite vs Definite Articles & Omission of Articles (Zero Article)',
        videos: [{ id: 'v_art1', title: 'Articles Rules & Omission Cases', duration: '20 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Rohan Verma' }],
        pdfs: [{ id: 'p_art1', title: 'Articles Rules & Exceptions', pages: 6, size: '1.3 MB', url: '#' }],
        tests: [{ id: 't_art1', title: 'Articles Filler & Error Test', questionsCount: 15, duration: '12 mins' }]
      }
    ]
  },
  {
    id: 'subject-verb-agreement',
    name: 'Subject Verb Agreement',
    icon: '⚖️',
    description: 'Singular & Plural subjects, Collective nouns, Either/Or, Neither/Nor',
    topics: [
      {
        id: 'sva-basic',
        name: 'Basic Rules of Agreement',
        description: 'Matching singular/plural subjects with corresponding verb forms',
        videos: [{ id: 'v_sva1', title: 'SVA Top 15 Rules', duration: '25 mins', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', instructor: 'Rohan Verma' }],
        pdfs: [{ id: 'p_sva1', title: 'SVA Master Rulebook', pages: 9, size: '2.2 MB', url: '#' }],
        tests: [{ id: 't_sva1', title: 'SVA Practice Test 1', questionsCount: 15, duration: '12 mins' }]
      }
    ]
  }
];

const RECENTLY_VIEWED_KEY = 'grammar_recently_viewed_topics';
const COMPLETED_TOPICS_KEY = 'grammar_completed_topics_set';

// Get clean non-generic topic article data
const getCleanTopicArticle = (topic: GrammarTopicItem | null) => {
  if (!topic) return null;
  
  if (TOPIC_ARTICLES[topic.id]) {
    return TOPIC_ARTICLES[topic.id];
  }

  // Check grammarTopics data layer
  const found = grammarTopics.find(t => t.id === topic.id || t.title.toLowerCase().includes(topic.name.toLowerCase()));
  if (found) {
    return {
      title: found.title,
      subtitle: found.subtitle,
      emoji: found.emoji || '📘',
      timeMinutes: found.timeMinutes || 8,
      xpReward: found.xpReward || 75,
      definition: found.definition,
      simpleExplanation: found.simpleExplanation,
      keyTypes: found.visualExamples?.map(v => ({
        name: v.label,
        desc: v.sentence,
        example: v.sentence,
        punctuation: 'Grammar Rule'
      })) || [],
      memoryTrick: found.memoryTrick,
      commonMistakes: found.commonMistakes || [],
      revisionPoints: found.revisionPoints || []
    };
  }

  // Standard clean specific fallback
  return {
    title: topic.name,
    subtitle: topic.description,
    emoji: '📘',
    timeMinutes: 7,
    xpReward: 75,
    definition: `${topic.name} is a fundamental grammar rule tested extensively in Bank PO, SSC CGL, and Insurance competitive exams.`,
    simpleExplanation: `Mastering ${topic.name} helps you quickly identify error spotting patterns, complete fill-in-the-blanks, and solve sentence improvement questions with high accuracy.`,
    keyTypes: [
      { name: 'Core Rule 1', desc: 'Ensure proper subject-verb agreement and word order.', example: 'The rule applies directly in standard formal English.', punctuation: 'Grammar Standard' },
      { name: 'Core Rule 2', desc: 'Avoid double negatives and misplaced modifiers.', example: 'Keep modifiers adjacent to the word being modified.', punctuation: 'Syntax Rule' }
    ],
    memoryTrick: `Shortcut: Read the sentence aloud without modifying clauses to check if ${topic.name} sounds natural and grammatically sound.`,
    commonMistakes: [
      { wrong: 'Using incorrect tense or modifier position', correct: 'Align tense and modifier with the main clause.', tip: 'Verify clause boundary before marking answers.' }
    ],
    revisionPoints: [
      `Understand the core structural definition of ${topic.name}.`,
      `Apply modifier and subject-verb consistency rules in exam questions.`,
      `Complete the practice quiz to verify your speed and accuracy.`
    ]
  };
};

// ─── Main Component ───────────────────────────────────────────────────────────
export const GrammarSyllabusView: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['foundation', 'parts-of-speech']);
  const [completedTopics, setCompletedTopics] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem(COMPLETED_TOPICS_KEY);
      return saved ? new Set(JSON.parse(saved)) : new Set(['what-is-grammar']);
    } catch {
      return new Set(['what-is-grammar']);
    }
  });

  const [recentlyViewed, setRecentlyViewed] = useState<{ topicId: string; topicName: string; categoryName: string }[]>(() => {
    try {
      const saved = localStorage.getItem(RECENTLY_VIEWED_KEY);
      return saved ? JSON.parse(saved) : [
        { topicId: 'types-sentences', topicName: 'Types of Sentences', categoryName: 'Foundation of Grammar' },
        { topicId: 'noun', topicName: 'Noun', categoryName: 'Parts of Speech' }
      ];
    } catch {
      return [];
    }
  });

  // Modal States
  const [articleModal, setArticleModal] = useState<{
    isOpen: boolean;
    topic: GrammarTopicItem | null;
    categoryName: string;
  }>({ isOpen: false, topic: null, categoryName: '' });

  const [resourceModal, setResourceModal] = useState<{
    isOpen: boolean;
    topic: GrammarTopicItem | null;
    categoryName: string;
    activeTab: 'pdfs';
  }>({ isOpen: false, topic: null, categoryName: '', activeTab: 'pdfs' });

  const [testModal, setTestModal] = useState<{
    isOpen: boolean;
    topic: GrammarTopicItem | null;
    currentQuestion: number;
    userAnswers: Record<number, number>;
    submitted: boolean;
  }>({ isOpen: false, topic: null, currentQuestion: 0, userAnswers: {}, submitted: false });

  // Save completion state
  useEffect(() => {
    try {
      localStorage.setItem(COMPLETED_TOPICS_KEY, JSON.stringify(Array.from(completedTopics)));
    } catch (e) {
      console.error(e);
    }
  }, [completedTopics]);

  const trackRecentlyViewed = (topic: GrammarTopicItem, categoryName: string) => {
    const newRecent = [
      { topicId: topic.id, topicName: topic.name, categoryName },
      ...recentlyViewed.filter(r => r.topicId !== topic.id)
    ].slice(0, 5);
    setRecentlyViewed(newRecent);
    try {
      localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(newRecent));
    } catch (e) {
      console.error(e);
    }
  };

  const toggleCategory = (catId: string) => {
    setExpandedCategories(prev =>
      prev.includes(catId) ? prev.filter(id => id !== catId) : [...prev, catId]
    );
  };

  const toggleTopicCompletion = (topicId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setCompletedTopics(prev => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const openFullArticleModal = (topic: GrammarTopicItem, categoryName: string) => {
    trackRecentlyViewed(topic, categoryName);
    setArticleModal({
      isOpen: true,
      topic,
      categoryName,
    });
  };

  // Immediate transition from Article Reader to Practice Quiz
  const startQuizFromArticle = () => {
    if (!articleModal.topic) return;
    const currentTopic = articleModal.topic;
    setArticleModal({ isOpen: false, topic: null, categoryName: '' });

    setTestModal({
      isOpen: true,
      topic: currentTopic,
      currentQuestion: 0,
      userAnswers: {},
      submitted: false
    });
  };

  const openPdfDialog = (topic: GrammarTopicItem, categoryName: string) => {
    trackRecentlyViewed(topic, categoryName);
    setResourceModal({
      isOpen: true,
      topic,
      categoryName,
      activeTab: 'pdfs'
    });
  };

  const openQuizDialog = (topic: GrammarTopicItem, categoryName: string) => {
    trackRecentlyViewed(topic, categoryName);
    setTestModal({
      isOpen: true,
      topic,
      currentQuestion: 0,
      userAnswers: {},
      submitted: false
    });
  };

  const filteredCurriculum = useMemo(() => {
    if (!searchQuery.trim()) return GRAMMAR_CURRICULUM;
    const q = searchQuery.toLowerCase();
    return GRAMMAR_CURRICULUM.map(cat => ({
      ...cat,
      topics: cat.topics.filter(t =>
        t.name.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        cat.name.toLowerCase().includes(q)
      )
    })).filter(cat => cat.topics.length > 0);
  }, [searchQuery]);

  const totalTopicsCount = useMemo(() => {
    return GRAMMAR_CURRICULUM.reduce((acc, cat) => acc + cat.topics.length, 0);
  }, []);

  const overallProgressPct = Math.round((completedTopics.size / totalTopicsCount) * 100);

  const cleanArticleData = getCleanTopicArticle(articleModal.topic);

  return (
    <div className="space-y-6">
      {/* ── 1. HERO BANNER & HEADER ── */}
      <div className="rounded-2xl border border-purple-200/80 p-5 sm:p-7 relative overflow-hidden bg-gradient-to-r from-purple-900 via-indigo-900 to-slate-900 text-white shadow-md">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-purple-500/20 blur-2xl pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/20 border border-purple-400/30 text-purple-200 text-xs font-bold">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Syllabus-Based Grammar Hub</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Master English Grammar
            </h1>
            <p className="text-sm text-purple-100/90 leading-relaxed font-medium">
              Topic-wise article lessons, video explanations, study PDFs, and interactive practice tests — built for all competitive exams.
            </p>
          </div>

          {/* Quick Progress Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-xl shrink-0 min-w-[220px] flex flex-col justify-center">
            <div className="flex items-center justify-between text-xs font-bold text-purple-100 mb-1.5">
              <span>Syllabus Progress</span>
              <span className="text-amber-300">{overallProgressPct}%</span>
            </div>
            <Progress value={overallProgressPct} className="h-2.5 bg-purple-950/60" />
            <p className="text-[11px] text-purple-200/80 mt-2 font-medium">
              {completedTopics.size} of {totalTopicsCount} topics completed
            </p>
          </div>
        </div>
      </div>

      {/* ── 2. SEARCH & FILTER TOOLBAR ── */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search grammar topics (e.g. Noun, Tenses, Prepositions)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 h-10 text-xs font-semibold border border-slate-200 rounded-xl bg-slate-50 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500 transition-all text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedCategories(GRAMMAR_CURRICULUM.map(c => c.id))}
            className="h-9 px-3 rounded-xl text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Expand All
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedCategories([])}
            className="h-9 px-3 rounded-xl text-xs font-bold text-slate-700 border-slate-200 hover:bg-slate-50"
          >
            Collapse All
          </Button>
        </div>
      </div>

      {/* ── 3. CONTINUE LEARNING (RECENTLY VIEWED) ── */}
      {recentlyViewed.length > 0 && (
        <Card className="bg-gradient-to-r from-purple-50/80 via-indigo-50/50 to-blue-50/80 border border-purple-200/80 rounded-2xl shadow-xs">
          <CardContent className="p-4 space-y-3">
            <h3 className="font-black text-xs uppercase tracking-wider text-purple-900 flex items-center gap-2">
              <Clock className="h-4 w-4 text-purple-600" />
              <span>Continue Learning (Recently Viewed)</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2.5">
              {recentlyViewed.map((item) => (
                <button
                  key={item.topicId}
                  onClick={() => {
                    for (const cat of GRAMMAR_CURRICULUM) {
                      const topic = cat.topics.find(t => t.id === item.topicId);
                      if (topic) {
                        openFullArticleModal(topic, cat.name);
                        break;
                      }
                    }
                  }}
                  className="p-3 bg-white rounded-xl text-left hover:shadow-md hover:border-purple-300 transition-all border border-purple-100 shadow-xs flex flex-col justify-center group"
                >
                  <p className="text-xs font-black text-slate-900 truncate w-full group-hover:text-purple-600 transition-colors">{item.topicName}</p>
                  <p className="text-[11px] text-slate-500 font-semibold truncate w-full mt-0.5">{item.categoryName}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── 4. GRAMMAR ACCORDION MODULES LIST ── */}
      <div className="space-y-4">
        {filteredCurriculum.map((category) => {
          const completedCount = category.topics.filter(t => completedTopics.has(t.id)).length;
          const categoryProgress = Math.round((completedCount / category.topics.length) * 100);
          const isExpanded = expandedCategories.includes(category.id);

          return (
            <Card key={category.id} className="overflow-hidden border border-slate-200 rounded-2xl shadow-xs bg-white">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full p-4 sm:p-5 flex items-center gap-4 hover:bg-slate-50/70 transition-colors text-left"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-50 border border-purple-200 text-purple-600 flex items-center justify-center text-xl shrink-0 shadow-xs">
                  {category.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-base text-slate-900 tracking-tight">{category.name}</h3>
                  <div className="flex items-center gap-3 mt-1.5">
                    <Progress value={categoryProgress} className="h-2 flex-1 max-w-48 bg-slate-100" />
                    <span className="text-xs font-bold text-slate-600">
                      {completedCount} / {category.topics.length} topics completed ({categoryProgress}%)
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                    {category.topics.length} topics
                  </span>
                  {isExpanded ? <ChevronUp className="h-5 w-5 text-slate-500" /> : <ChevronDown className="h-5 w-5 text-slate-500" />}
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-slate-100 bg-slate-50/50 p-4 sm:p-5">
                  <div className="grid gap-2.5">
                    {category.topics.map((topic) => {
                      const isCompleted = completedTopics.has(topic.id);
                      const pdfCount = topic.pdfs?.length || 5;
                      const testCount = topic.tests?.length || 3;

                      return (
                        <div
                          key={topic.id}
                          className={`flex flex-col md:flex-row md:items-center gap-3 p-3.5 bg-white rounded-xl border transition-all ${
                            isCompleted
                              ? 'border-emerald-200 bg-emerald-50/40 shadow-xs'
                              : 'border-slate-200 hover:border-purple-300 shadow-xs'
                          }`}
                        >
                          <button
                            onClick={(e) => toggleTopicCompletion(topic.id, e)}
                            className={`flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${
                              isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-slate-300 hover:border-emerald-600'
                            }`}
                          >
                            {isCompleted && <CheckCircle2 className="h-3.5 w-3.5 text-white" />}
                          </button>

                          <div className="flex-1 min-w-0">
                            <p className={`font-bold text-xs sm:text-sm ${isCompleted ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                              {topic.name}
                            </p>
                            {topic.description && (
                              <p className="text-[11px] text-slate-500 truncate mt-0.5">{topic.description}</p>
                            )}
                          </div>

                          <div className="flex items-center gap-2 shrink-0 mt-2 md:mt-0">
                            {/* Read Button */}
                            <button
                              onClick={() => openFullArticleModal(topic, category.name)}
                              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-xs transition-all"
                            >
                              <BookOpen className="h-3.5 w-3.5 text-white" />
                              <span>Read</span>
                            </button>

                            {/* PDFs Badge */}
                            <button
                              onClick={() => openPdfDialog(topic, category.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-800 hover:bg-amber-100 transition-colors border border-amber-200 font-bold text-xs shadow-xs"
                            >
                              <FileText className="h-3.5 w-3.5 text-amber-600" />
                              <span>PDFs</span>
                              <span className="bg-amber-200/80 px-1.5 py-0.5 rounded-md text-[10px] text-amber-950 font-extrabold">{pdfCount}</span>
                            </button>

                            {/* Quiz Badge */}
                            <button
                              onClick={() => openQuizDialog(topic, category.name)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 transition-colors border border-emerald-200 font-bold text-xs shadow-xs"
                            >
                              <Zap className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Quiz</span>
                              <span className="bg-emerald-200/80 px-1.5 py-0.5 rounded-md text-[10px] text-emerald-950 font-extrabold">{testCount}</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* ── 5. REDESIGNED CLEAN LIGHT-THEMED ARTICLE & VIDEO READER MODAL ── */}
      {articleModal.isOpen && articleModal.topic && cleanArticleData && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm overflow-y-auto flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="max-w-5xl w-full bg-white rounded-3xl border border-slate-200 shadow-2xl overflow-hidden my-auto flex flex-col max-h-[90vh]">
            
            {/* Clean Light-Graded Header Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 text-white p-4 sm:p-5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-xl shrink-0">
                  {cleanArticleData.emoji}
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-black text-white">{cleanArticleData.title}</h2>
                  <p className="text-xs text-purple-200 font-semibold">{articleModal.categoryName}</p>
                </div>
              </div>

              {/* Stepper Indicator */}
              <div className="hidden md:flex items-center gap-2 bg-white/10 border border-white/15 px-3 py-1 rounded-full text-xs font-bold">
                <span className="text-amber-300 flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" /> Step 1: Read Lesson
                </span>
                <span className="text-white/40">➔</span>
                <span className="text-purple-200 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5" /> Step 2: Practice Quiz
                </span>
              </div>

              <button
                onClick={() => setArticleModal({ isOpen: false, topic: null, categoryName: '' })}
                className="w-9 h-9 rounded-xl bg-white/10 text-white hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Clean Article Content Area */}
            <div className="p-5 sm:p-7 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
              
              {/* Concept Summary Banner */}
              <div className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-indigo-700">
                  <span className="uppercase tracking-wider font-black flex items-center gap-1.5">
                    <BookMarked className="w-4 h-4 text-indigo-600" />
                    Concept Overview
                  </span>
                  <span className="text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-500" /> {cleanArticleData.timeMinutes} min read
                  </span>
                </div>
                <p className="text-sm font-extrabold text-slate-900 leading-relaxed">
                  "{cleanArticleData.definition}"
                </p>
                <p className="text-xs text-slate-600 font-medium leading-relaxed pt-1">
                  💡 <strong>Intuition:</strong> {cleanArticleData.simpleExplanation}
                </p>
              </div>

              {/* 2 Columns: Main Lesson Content + Video Explanation */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Left: Detailed Key Types & Rules (7 Cols) */}
                <div className="lg:col-span-7 space-y-4">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Types & Grammar Rules Breakdown</span>
                  </h3>

                  <div className="space-y-3">
                    {cleanArticleData.keyTypes.map((kt, idx) => (
                      <div key={idx} className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs space-y-2 hover:border-purple-200 transition-colors">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-black text-slate-900 flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-600" />
                            <span>{kt.name}</span>
                          </h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100">
                            {kt.punctuation}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium">{kt.desc}</p>
                        <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-800">
                          <span className="text-purple-700">Example:</span> "{kt.example}"
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Memory Trick Callout */}
                  {cleanArticleData.memoryTrick && (
                    <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4.5 space-y-1.5 shadow-2xs">
                      <h4 className="text-xs font-black text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-600 fill-current" />
                        <span>Memory Shortcut</span>
                      </h4>
                      <p className="text-xs font-bold text-amber-950 leading-relaxed">
                        {cleanArticleData.memoryTrick}
                      </p>
                    </div>
                  )}

                  {/* Common Exam Mistakes */}
                  {cleanArticleData.commonMistakes.length > 0 && (
                    <div className="space-y-2.5">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-rose-500" />
                        <span>Common Exam Mistakes</span>
                      </h3>
                      {cleanArticleData.commonMistakes.map((m, idx) => (
                        <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-4 space-y-1.5 shadow-2xs">
                          <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                            <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                            <span><strong>Incorrect:</strong> "{m.wrong}"</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs font-bold text-emerald-700">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                            <span><strong>Correct:</strong> "{m.correct}"</span>
                          </div>
                          <p className="text-[11px] text-slate-500 font-semibold pl-5 pt-0.5">Tip: {m.tip}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Video Tutorial & Summary (5 Cols) */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-2xs">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                      <span className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Video className="w-4 h-4 text-blue-600" />
                        Video Explanation
                      </span>
                      <Badge variant="outline" className="text-[10px] bg-blue-50 text-blue-700 border-blue-200 font-bold">
                        Secondary Tutorial
                      </Badge>
                    </div>

                    <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center shadow-inner">
                      {articleModal.topic.videos?.[0] ? (
                        <div className="p-4 text-center space-y-2">
                          <div className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center mx-auto shadow-md cursor-pointer transition-transform hover:scale-105">
                            <Play className="w-5 h-5 fill-current ml-0.5" />
                          </div>
                          <p className="text-xs font-bold text-white leading-tight">{articleModal.topic.videos[0].title}</p>
                          <p className="text-[11px] text-slate-300 font-medium">Instructor: {articleModal.topic.videos[0].instructor} • {articleModal.topic.videos[0].duration}</p>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400 font-bold">Video explanation available</p>
                      )}
                    </div>

                    <div className="p-3 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-900 font-semibold leading-relaxed">
                      💡 Read the concept rules on the left, then watch this video to lock in your understanding.
                    </div>
                  </div>

                  {/* Summary Checklist */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-2.5 shadow-2xs">
                    <h4 className="text-xs font-black uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Key Takeaways</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {cleanArticleData.revisionPoints.map((pt, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{pt}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

              </div>
            </div>

            {/* Bottom Footer: Immediately Start Quiz Button */}
            <div className="bg-slate-50 border-t border-slate-200 p-4 sm:px-7 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700">
                <CheckCircle className="w-4 h-4 text-emerald-600" />
                <span>Finished reading? Test your knowledge immediately with practice questions!</span>
              </div>

              <Button
                onClick={startQuizFromArticle}
                className="w-full sm:w-auto h-11 px-8 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-black text-xs shadow-md gap-2 tracking-wide"
              >
                <span>Take Practice Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>

          </div>
        </div>
      )}

      {/* ── 6. RESOURCE DIALOG MODAL (PDFS) ── */}
      <Dialog
        open={resourceModal.isOpen}
        onOpenChange={(open) => setResourceModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-xl bg-white rounded-2xl p-6 border border-slate-200 shadow-xl">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-black text-slate-900 flex items-center justify-between">
              <div>
                <span>PDF Study Notes: {resourceModal.topic?.name}</span>
                <p className="text-xs font-semibold text-slate-500 mt-0.5">{resourceModal.categoryName}</p>
              </div>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-3 py-3">
            {(resourceModal.topic?.pdfs || []).map((pdf) => (
              <div key={pdf.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{pdf.title}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold mt-0.5">{pdf.pages} Pages • {pdf.size}</p>
                  </div>
                </div>
                <Button size="sm" variant="outline" className="h-8 px-3 rounded-lg text-xs font-bold text-slate-700 border-slate-300 gap-1.5">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </Button>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* ── 7. TOPIC PRACTICE TEST MODAL ── */}
      <Dialog
        open={testModal.isOpen}
        onOpenChange={(open) => setTestModal(prev => ({ ...prev, isOpen: open }))}
      >
        <DialogContent className="max-w-xl bg-white rounded-2xl p-6 border border-slate-200 shadow-xl">
          <DialogHeader className="border-b border-slate-100 pb-3">
            <DialogTitle className="text-base font-black text-slate-900 flex items-center justify-between">
              <span>Topic Practice Quiz: {testModal.topic?.name}</span>
            </DialogTitle>
          </DialogHeader>

          {(() => {
            const questions = testModal.topic?.quizQuestions || [
              { question: `Which rule applies to ${testModal.topic?.name}?`, options: ['Option A (Correct)', 'Option B', 'Option C', 'Option D'], correctIndex: 0, explanation: 'Detailed rule explanation.' },
              { question: `Identify the correct usage for ${testModal.topic?.name}:`, options: ['Incorrect option', 'Correct option', 'Incorrect option', 'Incorrect option'], correctIndex: 1, explanation: 'Explanation of grammatical consistency.' }
            ];

            if (questions.length > 0) {
              return (
                <div className="space-y-4 py-2">
                  {!testModal.submitted ? (
                    <>
                      <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                        <span>Question {testModal.currentQuestion + 1} of {questions.length}</span>
                      </div>

                      <div className="p-4 bg-purple-50/60 border border-purple-200/80 rounded-xl">
                        <h4 className="text-xs sm:text-sm font-black text-slate-900 leading-relaxed">
                          {questions[testModal.currentQuestion].question}
                        </h4>
                      </div>

                      <div className="space-y-2">
                        {questions[testModal.currentQuestion].options.map((opt, idx) => {
                          const isSelected = testModal.userAnswers[testModal.currentQuestion] === idx;
                          return (
                            <button
                              key={idx}
                              onClick={() => setTestModal(prev => ({
                                ...prev,
                                userAnswers: { ...prev.userAnswers, [prev.currentQuestion]: idx }
                              }))}
                              className={`w-full p-3 rounded-xl border text-left text-xs font-bold transition-all flex items-center justify-between ${
                                isSelected
                                  ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                                  : 'bg-white text-slate-800 border-slate-200 hover:border-purple-300 hover:bg-slate-50'
                              }`}
                            >
                              <span>{opt}</span>
                              {isSelected && <CheckCircle className="w-4 h-4 text-white" />}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={testModal.currentQuestion === 0}
                          onClick={() => setTestModal(prev => ({ ...prev, currentQuestion: prev.currentQuestion - 1 }))}
                          className="h-8 text-xs font-bold"
                        >
                          Previous
                        </Button>

                        {testModal.currentQuestion < questions.length - 1 ? (
                          <Button
                            size="sm"
                            onClick={() => setTestModal(prev => ({ ...prev, currentQuestion: prev.currentQuestion + 1 }))}
                            className="h-8 text-xs font-bold bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Next Question
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => setTestModal(prev => ({ ...prev, submitted: true }))}
                            className="h-8 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white"
                          >
                            Submit Quiz
                          </Button>
                        )}
                      </div>
                    </>
                  ) : (
                    /* Quiz Submitted Results */
                    <div className="space-y-4 py-3 text-center">
                      <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                        <Sparkles className="w-8 h-8" />
                      </div>
                      <div>
                        <h3 className="text-lg font-black text-slate-900">Quiz Completed!</h3>
                        <p className="text-xs text-slate-500 font-semibold mt-1">
                          You answered {Object.keys(testModal.userAnswers).length} of {questions.length} questions correctly.
                        </p>
                      </div>
                      <Button
                        onClick={() => {
                          if (testModal.topic) {
                            setCompletedTopics(prev => new Set([...Array.from(prev), testModal.topic!.id]));
                          }
                          setTestModal(prev => ({ ...prev, isOpen: false }));
                        }}
                        className="w-full h-10 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl"
                      >
                        Claim XP & Complete Topic
                      </Button>
                    </div>
                  )}
                </div>
              );
            }

            return (
              <div className="py-6 text-center space-y-3">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Practice questions loading for {testModal.topic?.name}...</p>
                <Button
                  size="sm"
                  onClick={() => setTestModal(prev => ({ ...prev, isOpen: false }))}
                  className="h-8 text-xs font-bold bg-purple-600 text-white"
                >
                  Close
                </Button>
              </div>
            );
          })()}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default GrammarSyllabusView;
