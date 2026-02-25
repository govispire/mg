import React from 'react';
import { Calculator, Brain, BookOpen, Globe, Scale, Monitor, Shield, Zap, FileText, Building2, Users, Briefcase, FlaskConical, Leaf } from 'lucide-react';
import { examCategories, getExamsByCategory } from './examData';

// Topic Resources Interface
export interface TopicResources {
  videos: {
    id: string;
    title: string;
    instructor: string;
    duration: string;
    rating: number;
    completed: boolean;
  }[];
  pdfs: {
    id: string;
    title: string;
    type: 'notes' | 'pyq' | 'formulas' | 'summary';
    pages: number;
  }[];
  tests: {
    id: string;
    title: string;
    questions: number;
    difficulty: 'easy' | 'medium' | 'hard';
    duration: string;
  }[];
}

export interface TopicConfig {
  id: string;
  name: string;
  progress: number;
  videos: TopicResources['videos'];
  pdfs: TopicResources['pdfs'];
  tests: TopicResources['tests'];
}

export interface SubjectConfig {
  id: string;
  name: string;
  marks: number;
  iconName: string;
  iconBg: string;
  topics: TopicConfig[];
}

export interface TierConfig {
  id: string;
  name: string;
  duration: string;
  totalMarks: number;
  negativeMarking: string;
  sectionalCutoff: boolean;
  subjects: SubjectConfig[];
}

export interface ExamSyllabusConfig {
  examId: string;
  examName: string;
  fullName: string;
  stages: string;
  examDate: string;
  tiers: TierConfig[];
  logo: string;
  category: string;
}

// Helper to generate topic resources
export const generateTopicResources = (topicName: string, subject: string): Omit<TopicConfig, 'id' | 'name' | 'progress'> => {
  // Generate random counts to make it look realistic (between 3 and 8)
  const videoCount = Math.floor(Math.random() * 5) + 4;
  const pdfCount = Math.floor(Math.random() * 4) + 3;
  const testCount = Math.floor(Math.random() * 3) + 2;

  const videos = Array.from({ length: videoCount }, (_, i) => ({
    id: `v${i + 1}-${topicName.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${topicName} - Part ${i + 1}: ${['Basics', 'Advanced Concepts', 'Problem Solving', 'Previous Year Questions', 'Shortcuts & Tricks', 'Live Class Recording'][i % 6]}`,
    instructor: ['Rahul Sharma', 'Priya Patel', 'Amit Kumar', 'Sneha Gupta', 'Vikram Singh'][i % 5],
    duration: `${Math.floor(Math.random() * 40) + 20}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
    rating: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1) as unknown as number,
    completed: Math.random() > 0.7
  }));

  const pdfs = Array.from({ length: pdfCount }, (_, i) => ({
    id: `p${i + 1}-${topicName.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${topicName} - ${['Class Notes', 'Practice Sheet', 'Formula Sheet', 'Previous Year Questions', 'Mind Map'][i % 5]}`,
    type: ['notes', 'pyq', 'formulas', 'summary', 'notes'][i % 5] as 'notes' | 'pyq' | 'formulas' | 'summary',
    pages: Math.floor(Math.random() * 15) + 5
  }));

  const tests = Array.from({ length: testCount }, (_, i) => ({
    id: `t${i + 1}-${topicName.toLowerCase().replace(/\s+/g, '-')}`,
    title: `${topicName} - ${['Topic Test', 'Sectional Test', 'Speed Test', 'High Level Questions'][i % 4]} ${i + 1}`,
    questions: [15, 20, 25, 30][i % 4],
    difficulty: ['easy', 'medium', 'hard'][i % 3] as 'easy' | 'medium' | 'hard',
    duration: `${[15, 20, 25, 30][i % 4]} min`
  }));

  return { videos, pdfs, tests };
};

// Get icon component by name
export const getIconByName = (name: string, className: string = "h-5 w-5 text-white"): React.ReactNode => {
  const icons: Record<string, React.ComponentType<{ className?: string }>> = {
    Calculator,
    Brain,
    BookOpen,
    Globe,
    Scale,
    Monitor,
    Shield,
    Zap,
    FileText,
    Building2,
    Users,
    Briefcase,
    FlaskConical,
    Leaf
  };

  const IconComponent = icons[name] || Calculator;
  return React.createElement(IconComponent, { className });
};

// Banking Exams Syllabus
const bankingSyllabus: Record<string, ExamSyllabusConfig> = {
  'ibps-po': {
    examId: 'ibps-po',
    examName: 'IBPS PO',
    fullName: 'Institute of Banking Personnel Selection - Probationary Officer',
    stages: 'Prelims + Mains + Interview',
    examDate: 'October 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    category: 'banking',
    tiers: [
      {
        id: 'prelims',
        name: 'Prelims',
        duration: '60 minutes',
        totalMarks: 100,
        negativeMarking: '0.25 marks per wrong answer',
        sectionalCutoff: true,
        subjects: [
          {
            id: 'quant-prelims',
            name: 'Quantitative Aptitude',
            marks: 35,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'simplification', name: 'Simplification & Approximation', progress: 0, ...generateTopicResources('Simplification & Approximation', 'Quant') },
              { id: 'number-series', name: 'Number Series', progress: 0, ...generateTopicResources('Number Series', 'Quant') },
              { id: 'number-systems', name: 'Number Systems', progress: 0, ...generateTopicResources('Number Systems', 'Quant') },
              { id: 'profit-loss', name: 'Profit & Loss', progress: 0, ...generateTopicResources('Profit & Loss', 'Quant') },
              { id: 'mixtures', name: 'Mixtures & Allegations', progress: 0, ...generateTopicResources('Mixtures & Allegations', 'Quant') },
              { id: 'si-ci', name: 'Simple & Compound Interest', progress: 0, ...generateTopicResources('Simple & Compound Interest', 'Quant') },
              { id: 'surds-indices', name: 'Surds & Indices', progress: 0, ...generateTopicResources('Surds & Indices', 'Quant') },
              { id: 'work-time', name: 'Work & Time', progress: 0, ...generateTopicResources('Work & Time', 'Quant') },
              { id: 'time-distance', name: 'Time & Distance', progress: 0, ...generateTopicResources('Time & Distance', 'Quant') },
              { id: 'mensuration', name: 'Mensuration (Cylinder, Cone, Sphere)', progress: 0, ...generateTopicResources('Mensuration', 'Quant') },
              { id: 'data-interpretation', name: 'Data Interpretation', progress: 0, ...generateTopicResources('Data Interpretation', 'Quant') },
              { id: 'ratio-proportion', name: 'Ratio & Proportion, Percentage', progress: 0, ...generateTopicResources('Ratio & Proportion', 'Quant') },
              { id: 'permutation-combination', name: 'Permutation, Combination & Probability', progress: 0, ...generateTopicResources('Permutation & Combination', 'Quant') },
            ]
          },
          {
            id: 'reasoning-prelims',
            name: 'Reasoning Ability',
            marks: 35,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'logical-reasoning', name: 'Logical Reasoning', progress: 0, ...generateTopicResources('Logical Reasoning', 'Reasoning') },
              { id: 'alphanumeric-series', name: 'Alphanumeric Series', progress: 0, ...generateTopicResources('Alphanumeric Series', 'Reasoning') },
              { id: 'ranking-direction', name: 'Ranking/Direction/Alphabet Test', progress: 0, ...generateTopicResources('Ranking & Direction', 'Reasoning') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Reasoning') },
              { id: 'coded-inequalities', name: 'Coded Inequalities', progress: 0, ...generateTopicResources('Coded Inequalities', 'Reasoning') },
              { id: 'seating-arrangement', name: 'Seating Arrangement', progress: 0, ...generateTopicResources('Seating Arrangement', 'Reasoning') },
              { id: 'puzzle', name: 'Puzzle', progress: 0, ...generateTopicResources('Puzzle', 'Reasoning') },
              { id: 'tabulation', name: 'Tabulation', progress: 0, ...generateTopicResources('Tabulation', 'Reasoning') },
              { id: 'syllogism', name: 'Syllogism', progress: 0, ...generateTopicResources('Syllogism', 'Reasoning') },
              { id: 'blood-relations', name: 'Blood Relations', progress: 0, ...generateTopicResources('Blood Relations', 'Reasoning') },
              { id: 'input-output', name: 'Input-Output', progress: 0, ...generateTopicResources('Input-Output', 'Reasoning') },
              { id: 'coding-decoding', name: 'Coding-Decoding', progress: 0, ...generateTopicResources('Coding-Decoding', 'Reasoning') },
            ]
          },
          {
            id: 'english-prelims',
            name: 'English Language',
            marks: 30,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 0, ...generateTopicResources('Reading Comprehension', 'English') },
              { id: 'cloze-test', name: 'Cloze Test', progress: 0, ...generateTopicResources('Cloze Test', 'English') },
              { id: 'para-jumbles', name: 'Para Jumbles', progress: 0, ...generateTopicResources('Para Jumbles', 'English') },
              { id: 'miscellaneous', name: 'Miscellaneous', progress: 0, ...generateTopicResources('Miscellaneous', 'English') },
              { id: 'fillers', name: 'Fillers', progress: 0, ...generateTopicResources('Fillers', 'English') },
              { id: 'error-spotting', name: 'Error Spotting', progress: 0, ...generateTopicResources('Error Spotting', 'English') },
              { id: 'paragraph-completion', name: 'Paragraph Completion', progress: 0, ...generateTopicResources('Paragraph Completion', 'English') },
              { id: 'sentence-rearrangement', name: 'Sentence Rearrangement', progress: 0, ...generateTopicResources('Sentence Rearrangement', 'English') },
            ]
          }
        ]
      },
      {
        id: 'mains',
        name: 'Mains',
        duration: '180 minutes',
        totalMarks: 200,
        negativeMarking: '0.25 marks per wrong answer',
        sectionalCutoff: true,
        subjects: [
          {
            id: 'reasoning-mains',
            name: 'Reasoning & Computer Aptitude',
            marks: 60,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'seating-arrangements', name: 'Seating Arrangements', progress: 0, ...generateTopicResources('Seating Arrangements', 'Reasoning') },
              { id: 'puzzles', name: 'Puzzles', progress: 0, ...generateTopicResources('Puzzles', 'Reasoning') },
              { id: 'inequalities', name: 'Inequalities', progress: 0, ...generateTopicResources('Inequalities', 'Reasoning') },
              { id: 'syllogism', name: 'Syllogism', progress: 0, ...generateTopicResources('Syllogism', 'Reasoning') },
              { id: 'input-output', name: 'Input-Output', progress: 0, ...generateTopicResources('Input-Output', 'Reasoning') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Reasoning') },
              { id: 'blood-relations', name: 'Blood Relations', progress: 0, ...generateTopicResources('Blood Relations', 'Reasoning') },
              { id: 'order-ranking', name: 'Order and Ranking', progress: 0, ...generateTopicResources('Order and Ranking', 'Reasoning') },
              { id: 'alphanumeric-series', name: 'Alphanumeric Series', progress: 0, ...generateTopicResources('Alphanumeric Series', 'Reasoning') },
              { id: 'distance-direction', name: 'Distance and Direction', progress: 0, ...generateTopicResources('Distance and Direction', 'Reasoning') },
              { id: 'verbal-reasoning', name: 'Verbal Reasoning', progress: 0, ...generateTopicResources('Verbal Reasoning', 'Reasoning') },
              { id: 'computer-fundamentals', name: 'Computer Fundamentals', progress: 0, ...generateTopicResources('Computer Fundamentals', 'Computer') },
              { id: 'internet', name: 'Internet & Networking', progress: 0, ...generateTopicResources('Internet & Networking', 'Computer') },
              { id: 'ms-office', name: 'MS Office', progress: 0, ...generateTopicResources('MS Office', 'Computer') },
              { id: 'computer-abbreviations', name: 'Computer Abbreviations', progress: 0, ...generateTopicResources('Computer Abbreviations', 'Computer') },
            ]
          },
          {
            id: 'english-mains',
            name: 'General English',
            marks: 40,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'cloze-test', name: 'Cloze Test', progress: 0, ...generateTopicResources('Cloze Test', 'English') },
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 0, ...generateTopicResources('Reading Comprehension', 'English') },
              { id: 'spotting-errors', name: 'Spotting Errors', progress: 0, ...generateTopicResources('Spotting Errors', 'English') },
              { id: 'sentence-improvement', name: 'Sentence Improvement', progress: 0, ...generateTopicResources('Sentence Improvement', 'English') },
              { id: 'sentence-correction', name: 'Sentence Correction', progress: 0, ...generateTopicResources('Sentence Correction', 'English') },
              { id: 'para-jumbles', name: 'Para Jumbles', progress: 0, ...generateTopicResources('Para Jumbles', 'English') },
              { id: 'fill-blanks', name: 'Fill in the Blanks', progress: 0, ...generateTopicResources('Fill in the Blanks', 'English') },
              { id: 'para-completion', name: 'Para/Sentence Completion', progress: 0, ...generateTopicResources('Sentence Completion', 'English') },
            ]
          },
          {
            id: 'quant-mains',
            name: 'Quantitative Aptitude',
            marks: 50,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'number-series', name: 'Number Series', progress: 0, ...generateTopicResources('Number Series', 'Quant') },
              { id: 'data-interpretation', name: 'Data Interpretation', progress: 0, ...generateTopicResources('Data Interpretation', 'Quant') },
              { id: 'simplification', name: 'Simplification/Approximation', progress: 0, ...generateTopicResources('Simplification', 'Quant') },
              { id: 'quadratic-equation', name: 'Quadratic Equation', progress: 0, ...generateTopicResources('Quadratic Equation', 'Quant') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Quant') },
              { id: 'mensuration', name: 'Mensuration', progress: 0, ...generateTopicResources('Mensuration', 'Quant') },
              { id: 'average', name: 'Average', progress: 0, ...generateTopicResources('Average', 'Quant') },
              { id: 'profit-loss', name: 'Profit and Loss', progress: 0, ...generateTopicResources('Profit and Loss', 'Quant') },
              { id: 'ratio-proportion', name: 'Ratio and Proportion', progress: 0, ...generateTopicResources('Ratio and Proportion', 'Quant') },
              { id: 'work-time-energy', name: 'Work, Time, and Energy', progress: 0, ...generateTopicResources('Work and Time', 'Quant') },
              { id: 'time-distance', name: 'Time and Distance', progress: 0, ...generateTopicResources('Time and Distance', 'Quant') },
              { id: 'probability', name: 'Probability', progress: 0, ...generateTopicResources('Probability', 'Quant') },
              { id: 'si-ci', name: 'Simple and Compound Interest', progress: 0, ...generateTopicResources('Simple and Compound Interest', 'Quant') },
              { id: 'permutation-combination', name: 'Permutation and Combination', progress: 0, ...generateTopicResources('Permutation and Combination', 'Quant') },
            ]
          },
          {
            id: 'ga-mains',
            name: 'General/Financial Awareness',
            marks: 40,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'current-affairs', name: 'Current Affairs', progress: 0, ...generateTopicResources('Current Affairs', 'GA') },
              { id: 'banking-awareness', name: 'Banking Awareness', progress: 0, ...generateTopicResources('Banking Awareness', 'GA') },
              { id: 'gk-updates', name: 'GK Updates', progress: 0, ...generateTopicResources('GK Updates', 'GA') },
              { id: 'currencies', name: 'Currencies', progress: 0, ...generateTopicResources('Currencies', 'GA') },
              { id: 'important-places', name: 'Important Places', progress: 0, ...generateTopicResources('Important Places', 'GA') },
              { id: 'books-authors', name: 'Books and Authors', progress: 0, ...generateTopicResources('Books and Authors', 'GA') },
              { id: 'awards', name: 'Awards', progress: 0, ...generateTopicResources('Awards', 'GA') },
              { id: 'headquarters', name: 'Headquarters', progress: 0, ...generateTopicResources('Headquarters', 'GA') },
              { id: 'pm-schemes', name: 'Prime Minister Schemes', progress: 0, ...generateTopicResources('PM Schemes', 'GA') },
              { id: 'important-days', name: 'Important Days', progress: 0, ...generateTopicResources('Important Days', 'GA') },
              { id: 'basic-computer', name: 'Basic Computer Knowledge', progress: 0, ...generateTopicResources('Basic Computer', 'GA') },
            ]
          }
        ]
      }
    ]
  },
  'sbi-po': {
    examId: 'sbi-po',
    examName: 'SBI PO',
    fullName: 'State Bank of India - Probationary Officer',
    stages: 'Prelims + Mains + Interview',
    examDate: 'November 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/sbi.webp',
    category: 'banking',
    tiers: [
      {
        id: 'prelims',
        name: 'Prelims',
        duration: '60 minutes',
        totalMarks: 100,
        negativeMarking: '0.25 marks per wrong answer',
        sectionalCutoff: true,
        subjects: [
          {
            id: 'reasoning-prelims',
            name: 'Reasoning Ability',
            marks: 35,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'logical-reasoning', name: 'Logical Reasoning', progress: 0, ...generateTopicResources('Logical Reasoning', 'Reasoning') },
              { id: 'alphanumeric-series', name: 'Alphanumeric Series', progress: 0, ...generateTopicResources('Alphanumeric Series', 'Reasoning') },
              { id: 'ranking-direction', name: 'Ranking/Direction/Alphabet Test', progress: 0, ...generateTopicResources('Ranking & Direction', 'Reasoning') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Reasoning') },
              { id: 'coded-inequalities', name: 'Coded Inequalities', progress: 0, ...generateTopicResources('Coded Inequalities', 'Reasoning') },
              { id: 'seating-arrangement', name: 'Seating Arrangement', progress: 0, ...generateTopicResources('Seating Arrangement', 'Reasoning') },
              { id: 'puzzle', name: 'Puzzle', progress: 0, ...generateTopicResources('Puzzle', 'Reasoning') },
              { id: 'tabulation', name: 'Tabulation', progress: 0, ...generateTopicResources('Tabulation', 'Reasoning') },
              { id: 'syllogism', name: 'Syllogism', progress: 0, ...generateTopicResources('Syllogism', 'Reasoning') },
              { id: 'blood-relations', name: 'Blood Relations', progress: 0, ...generateTopicResources('Blood Relations', 'Reasoning') },
              { id: 'input-output', name: 'Input-Output', progress: 0, ...generateTopicResources('Input-Output', 'Reasoning') },
              { id: 'coding-decoding', name: 'Coding-Decoding', progress: 0, ...generateTopicResources('Coding-Decoding', 'Reasoning') },
            ]
          },
          {
            id: 'quant-prelims',
            name: 'Quantitative Aptitude',
            marks: 35,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'simplification', name: 'Simplification & Approximation', progress: 0, ...generateTopicResources('Simplification & Approximation', 'Quant') },
              { id: 'number-series', name: 'Number Series', progress: 0, ...generateTopicResources('Number Series', 'Quant') },
              { id: 'number-systems', name: 'Number Systems', progress: 0, ...generateTopicResources('Number Systems', 'Quant') },
              { id: 'profit-loss', name: 'Profit & Loss', progress: 0, ...generateTopicResources('Profit & Loss', 'Quant') },
              { id: 'mixtures', name: 'Mixtures & Allegations', progress: 0, ...generateTopicResources('Mixtures & Allegations', 'Quant') },
              { id: 'si-ci', name: 'Simple & Compound Interest', progress: 0, ...generateTopicResources('Simple & Compound Interest', 'Quant') },
              { id: 'surds-indices', name: 'Surds & Indices', progress: 0, ...generateTopicResources('Surds & Indices', 'Quant') },
              { id: 'work-time', name: 'Work & Time', progress: 0, ...generateTopicResources('Work & Time', 'Quant') },
              { id: 'time-distance', name: 'Time & Distance', progress: 0, ...generateTopicResources('Time & Distance', 'Quant') },
              { id: 'mensuration', name: 'Mensuration (Cylinder, Cone, Sphere)', progress: 0, ...generateTopicResources('Mensuration', 'Quant') },
              { id: 'data-interpretation', name: 'Data Interpretation', progress: 0, ...generateTopicResources('Data Interpretation', 'Quant') },
              { id: 'ratio-proportion', name: 'Ratio & Proportion, Percentage', progress: 0, ...generateTopicResources('Ratio & Proportion', 'Quant') },
              { id: 'permutation-combination', name: 'Permutation, Combination & Probability', progress: 0, ...generateTopicResources('Permutation & Combination', 'Quant') },
            ]
          },
          {
            id: 'english-prelims',
            name: 'English Language',
            marks: 30,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 0, ...generateTopicResources('Reading Comprehension', 'English') },
              { id: 'cloze-test', name: 'Cloze Test', progress: 0, ...generateTopicResources('Cloze Test', 'English') },
              { id: 'para-jumbles', name: 'Para Jumbles', progress: 0, ...generateTopicResources('Para Jumbles', 'English') },
              { id: 'miscellaneous', name: 'Miscellaneous', progress: 0, ...generateTopicResources('Miscellaneous', 'English') },
              { id: 'fillers', name: 'Fillers', progress: 0, ...generateTopicResources('Fillers', 'English') },
              { id: 'error-spotting', name: 'Error Spotting', progress: 0, ...generateTopicResources('Error Spotting', 'English') },
              { id: 'paragraph-completion', name: 'Paragraph Completion', progress: 0, ...generateTopicResources('Paragraph Completion', 'English') },
              { id: 'sentence-rearrangement', name: 'Sentence Rearrangement', progress: 0, ...generateTopicResources('Sentence Rearrangement', 'English') },
            ]
          }
        ]
      },
      {
        id: 'mains',
        name: 'Mains',
        duration: '180 minutes + 30 minutes (Descriptive)',
        totalMarks: 250,
        negativeMarking: '0.25 marks per wrong answer',
        sectionalCutoff: true,
        subjects: [
          {
            id: 'data-analysis',
            name: 'Data Analysis & Interpretation',
            marks: 60,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'tabular-graph', name: 'Tabular Graph', progress: 0, ...generateTopicResources('Tabular Graph', 'Quant') },
              { id: 'line-graph', name: 'Line Graph', progress: 0, ...generateTopicResources('Line Graph', 'Quant') },
              { id: 'pie-chart', name: 'Pie Chart', progress: 0, ...generateTopicResources('Pie Chart', 'Quant') },
              { id: 'bar-graph', name: 'Bar Graph', progress: 0, ...generateTopicResources('Bar Graph', 'Quant') },
              { id: 'radar-graph', name: 'Radar Graph Case-let', progress: 0, ...generateTopicResources('Radar Graph', 'Quant') },
              { id: 'missing-di', name: 'Missing Case DI', progress: 0, ...generateTopicResources('Missing DI', 'Quant') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Quant') },
              { id: 'probability', name: 'Probability', progress: 0, ...generateTopicResources('Probability', 'Quant') },
              { id: 'permutation-combination', name: 'Permutation and Combination', progress: 0, ...generateTopicResources('Permutation and Combination', 'Quant') },
            ]
          },
          {
            id: 'reasoning-mains',
            name: 'Reasoning & Computer Aptitude',
            marks: 60,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'verbal-reasoning', name: 'Verbal Reasoning', progress: 0, ...generateTopicResources('Verbal Reasoning', 'Reasoning') },
              { id: 'syllogism', name: 'Syllogism', progress: 0, ...generateTopicResources('Syllogism', 'Reasoning') },
              { id: 'circular-seating', name: 'Circular Seating Arrangement', progress: 0, ...generateTopicResources('Circular Seating', 'Reasoning') },
              { id: 'linear-seating', name: 'Linear Seating Arrangement', progress: 0, ...generateTopicResources('Linear Seating', 'Reasoning') },
              { id: 'double-lineup', name: 'Double Lineup', progress: 0, ...generateTopicResources('Double Lineup', 'Reasoning') },
              { id: 'scheduling', name: 'Scheduling', progress: 0, ...generateTopicResources('Scheduling', 'Reasoning') },
              { id: 'input-output', name: 'Input-Output', progress: 0, ...generateTopicResources('Input-Output', 'Reasoning') },
              { id: 'blood-relations', name: 'Blood Relations', progress: 0, ...generateTopicResources('Blood Relations', 'Reasoning') },
              { id: 'directions-distances', name: 'Directions and Distances', progress: 0, ...generateTopicResources('Directions and Distances', 'Reasoning') },
              { id: 'ordering-ranking', name: 'Ordering and Ranking', progress: 0, ...generateTopicResources('Ordering and Ranking', 'Reasoning') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Reasoning') },
              { id: 'coding-decoding', name: 'Coding and Decoding', progress: 0, ...generateTopicResources('Coding and Decoding', 'Reasoning') },
              { id: 'coded-inequalities', name: 'Coded Inequalities', progress: 0, ...generateTopicResources('Coded Inequalities', 'Reasoning') },
              { id: 'course-of-action', name: 'Course of Action', progress: 0, ...generateTopicResources('Course of Action', 'Reasoning') },
              { id: 'critical-reasoning', name: 'Critical Reasoning', progress: 0, ...generateTopicResources('Critical Reasoning', 'Reasoning') },
              { id: 'analytical-decision', name: 'Analytical and Decision Making', progress: 0, ...generateTopicResources('Analytical Decision Making', 'Reasoning') },
              { id: 'computer-internet', name: 'Internet', progress: 0, ...generateTopicResources('Internet', 'Computer') },
              { id: 'computer-memory', name: 'Memory', progress: 0, ...generateTopicResources('Memory', 'Computer') },
              { id: 'computer-shortcuts', name: 'Keyboard Shortcuts', progress: 0, ...generateTopicResources('Keyboard Shortcuts', 'Computer') },
              { id: 'computer-abbreviation', name: 'Computer Abbreviation', progress: 0, ...generateTopicResources('Computer Abbreviation', 'Computer') },
              { id: 'ms-office', name: 'Microsoft Office', progress: 0, ...generateTopicResources('Microsoft Office', 'Computer') },
              { id: 'computer-hardware', name: 'Computer Hardware', progress: 0, ...generateTopicResources('Computer Hardware', 'Computer') },
              { id: 'computer-software', name: 'Computer Software', progress: 0, ...generateTopicResources('Computer Software', 'Computer') },
              { id: 'operating-system', name: 'Operating System', progress: 0, ...generateTopicResources('Operating System', 'Computer') },
              { id: 'networking', name: 'Networking', progress: 0, ...generateTopicResources('Networking', 'Computer') },
              { id: 'computer-fundamentals', name: 'Computer Fundamentals/Terminologies', progress: 0, ...generateTopicResources('Computer Fundamentals', 'Computer') },
            ]
          },
          {
            id: 'english-mains',
            name: 'English Language',
            marks: 40,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 0, ...generateTopicResources('Reading Comprehension', 'English') },
              { id: 'grammar', name: 'Grammar', progress: 0, ...generateTopicResources('Grammar', 'English') },
              { id: 'vocabulary', name: 'Vocabulary', progress: 0, ...generateTopicResources('Vocabulary', 'English') },
              { id: 'verbal-ability', name: 'Verbal Ability', progress: 0, ...generateTopicResources('Verbal Ability', 'English') },
              { id: 'word-association', name: 'Word Association', progress: 0, ...generateTopicResources('Word Association', 'English') },
              { id: 'sentence-improvement', name: 'Sentence Improvement', progress: 0, ...generateTopicResources('Sentence Improvement', 'English') },
              { id: 'para-jumbles', name: 'Para Jumbles', progress: 0, ...generateTopicResources('Para Jumbles', 'English') },
              { id: 'cloze-test', name: 'Cloze Test', progress: 0, ...generateTopicResources('Cloze Test', 'English') },
              { id: 'error-spotting', name: 'Error Spotting', progress: 0, ...generateTopicResources('Error Spotting', 'English') },
              { id: 'fill-blanks', name: 'Fill in the blanks', progress: 0, ...generateTopicResources('Fill in the blanks', 'English') },
            ]
          },
          {
            id: 'ga-mains',
            name: 'General/Economy/Banking Awareness',
            marks: 40,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'financial-awareness', name: 'Financial Awareness', progress: 0, ...generateTopicResources('Financial Awareness', 'GA') },
              { id: 'current-affairs', name: 'Current Affairs', progress: 0, ...generateTopicResources('Current Affairs', 'GA') },
              { id: 'general-knowledge', name: 'General Knowledge', progress: 0, ...generateTopicResources('General Knowledge', 'GA') },
              { id: 'static-awareness', name: 'Static Awareness', progress: 0, ...generateTopicResources('Static Awareness', 'GA') },
              { id: 'banking-financial', name: 'Banking and Financial Awareness', progress: 0, ...generateTopicResources('Banking Awareness', 'GA') },
            ]
          }
        ]
      }
    ]
  },
  'ibps-clerk': {
    examId: 'ibps-clerk',
    examName: 'IBPS Clerk',
    fullName: 'Institute of Banking Personnel Selection - Clerk',
    stages: 'Prelims + Mains',
    examDate: 'September 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/ibps_ygpzwj.webp',
    category: 'banking',
    tiers: [
      {
        id: 'prelims',
        name: 'Prelims',
        duration: '60 minutes',
        totalMarks: 100,
        negativeMarking: '0.25 marks per wrong answer',
        sectionalCutoff: true,
        subjects: [
          {
            id: 'quant-prelims',
            name: 'Numerical Ability',
            marks: 35,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'simplification', name: 'Simplification & Approximation', progress: 0, ...generateTopicResources('Simplification & Approximation', 'Quant') },
              { id: 'number-series', name: 'Number Series', progress: 0, ...generateTopicResources('Number Series', 'Quant') },
              { id: 'number-systems', name: 'Number Systems', progress: 0, ...generateTopicResources('Number Systems', 'Quant') },
              { id: 'profit-loss', name: 'Profit & Loss', progress: 0, ...generateTopicResources('Profit & Loss', 'Quant') },
              { id: 'mixtures', name: 'Mixtures & Allegations', progress: 0, ...generateTopicResources('Mixtures & Allegations', 'Quant') },
              { id: 'si-ci', name: 'Simple & Compound Interest', progress: 0, ...generateTopicResources('Simple & Compound Interest', 'Quant') },
              { id: 'surds-indices', name: 'Surds & Indices', progress: 0, ...generateTopicResources('Surds & Indices', 'Quant') },
              { id: 'work-time', name: 'Work & Time', progress: 0, ...generateTopicResources('Work & Time', 'Quant') },
              { id: 'time-distance', name: 'Time & Distance', progress: 0, ...generateTopicResources('Time & Distance', 'Quant') },
              { id: 'mensuration', name: 'Mensuration (Cylinder, Cone, Sphere)', progress: 0, ...generateTopicResources('Mensuration', 'Quant') },
              { id: 'data-interpretation', name: 'Data Interpretation', progress: 0, ...generateTopicResources('Data Interpretation', 'Quant') },
              { id: 'ratio-proportion', name: 'Ratio & Proportion, Percentage', progress: 0, ...generateTopicResources('Ratio & Proportion', 'Quant') },
              { id: 'permutation-combination', name: 'Permutation, Combination & Probability', progress: 0, ...generateTopicResources('Permutation & Combination', 'Quant') },
            ]
          },
          {
            id: 'reasoning-prelims',
            name: 'Reasoning Ability',
            marks: 35,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'logical-reasoning', name: 'Logical Reasoning', progress: 0, ...generateTopicResources('Logical Reasoning', 'Reasoning') },
              { id: 'alphanumeric-series', name: 'Alphanumeric Series', progress: 0, ...generateTopicResources('Alphanumeric Series', 'Reasoning') },
              { id: 'ranking-direction', name: 'Ranking/Direction/Alphabet Test', progress: 0, ...generateTopicResources('Ranking & Direction', 'Reasoning') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Reasoning') },
              { id: 'coded-inequalities', name: 'Coded Inequalities', progress: 0, ...generateTopicResources('Coded Inequalities', 'Reasoning') },
              { id: 'seating-arrangement', name: 'Seating Arrangement', progress: 0, ...generateTopicResources('Seating Arrangement', 'Reasoning') },
              { id: 'puzzle', name: 'Puzzle', progress: 0, ...generateTopicResources('Puzzle', 'Reasoning') },
              { id: 'tabulation', name: 'Tabulation', progress: 0, ...generateTopicResources('Tabulation', 'Reasoning') },
              { id: 'syllogism', name: 'Syllogism', progress: 0, ...generateTopicResources('Syllogism', 'Reasoning') },
              { id: 'blood-relations', name: 'Blood Relations', progress: 0, ...generateTopicResources('Blood Relations', 'Reasoning') },
              { id: 'input-output', name: 'Input-Output', progress: 0, ...generateTopicResources('Input-Output', 'Reasoning') },
              { id: 'coding-decoding', name: 'Coding-Decoding', progress: 0, ...generateTopicResources('Coding-Decoding', 'Reasoning') },
            ]
          },
          {
            id: 'english-prelims',
            name: 'English Language',
            marks: 30,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 0, ...generateTopicResources('Reading Comprehension', 'English') },
              { id: 'cloze-test', name: 'Cloze Test', progress: 0, ...generateTopicResources('Cloze Test', 'English') },
              { id: 'para-jumbles', name: 'Para Jumbles', progress: 0, ...generateTopicResources('Para Jumbles', 'English') },
              { id: 'miscellaneous', name: 'Miscellaneous', progress: 0, ...generateTopicResources('Miscellaneous', 'English') },
              { id: 'fillers', name: 'Fillers', progress: 0, ...generateTopicResources('Fillers', 'English') },
              { id: 'error-spotting', name: 'Error Spotting', progress: 0, ...generateTopicResources('Error Spotting', 'English') },
              { id: 'paragraph-completion', name: 'Paragraph Completion', progress: 0, ...generateTopicResources('Paragraph Completion', 'English') },
              { id: 'sentence-rearrangement', name: 'Sentence Rearrangement', progress: 0, ...generateTopicResources('Sentence Rearrangement', 'English') },
            ]
          }
        ]
      },
      {
        id: 'mains',
        name: 'Mains',
        duration: '160 minutes',
        totalMarks: 200,
        negativeMarking: '0.25 marks per wrong answer',
        sectionalCutoff: true,
        subjects: [
          {
            id: 'reasoning-mains',
            name: 'Reasoning & Computer Aptitude',
            marks: 60,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'seating-arrangements', name: 'Seating Arrangements', progress: 0, ...generateTopicResources('Seating Arrangements', 'Reasoning') },
              { id: 'puzzles', name: 'Puzzles', progress: 0, ...generateTopicResources('Puzzles', 'Reasoning') },
              { id: 'inequalities', name: 'Inequalities', progress: 0, ...generateTopicResources('Inequalities', 'Reasoning') },
              { id: 'syllogism', name: 'Syllogism', progress: 0, ...generateTopicResources('Syllogism', 'Reasoning') },
              { id: 'input-output', name: 'Input-Output', progress: 0, ...generateTopicResources('Input-Output', 'Reasoning') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Reasoning') },
              { id: 'blood-relations', name: 'Blood Relations', progress: 0, ...generateTopicResources('Blood Relations', 'Reasoning') },
              { id: 'order-ranking', name: 'Order and Ranking', progress: 0, ...generateTopicResources('Order and Ranking', 'Reasoning') },
              { id: 'alphanumeric-series', name: 'Alphanumeric Series', progress: 0, ...generateTopicResources('Alphanumeric Series', 'Reasoning') },
              { id: 'distance-direction', name: 'Distance and Direction', progress: 0, ...generateTopicResources('Distance and Direction', 'Reasoning') },
              { id: 'verbal-reasoning', name: 'Verbal Reasoning', progress: 0, ...generateTopicResources('Verbal Reasoning', 'Reasoning') },
              { id: 'computer-fundamentals', name: 'Computer Fundamentals', progress: 0, ...generateTopicResources('Computer Fundamentals', 'Computer') },
              { id: 'internet', name: 'Internet & Networking', progress: 0, ...generateTopicResources('Internet & Networking', 'Computer') },
              { id: 'ms-office', name: 'MS Office', progress: 0, ...generateTopicResources('MS Office', 'Computer') },
              { id: 'computer-abbreviations', name: 'Computer Abbreviations', progress: 0, ...generateTopicResources('Computer Abbreviations', 'Computer') },
            ]
          },
          {
            id: 'english-mains',
            name: 'General English',
            marks: 40,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'cloze-test', name: 'Cloze Test', progress: 0, ...generateTopicResources('Cloze Test', 'English') },
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 0, ...generateTopicResources('Reading Comprehension', 'English') },
              { id: 'spotting-errors', name: 'Spotting Errors', progress: 0, ...generateTopicResources('Spotting Errors', 'English') },
              { id: 'sentence-improvement', name: 'Sentence Improvement', progress: 0, ...generateTopicResources('Sentence Improvement', 'English') },
              { id: 'sentence-correction', name: 'Sentence Correction', progress: 0, ...generateTopicResources('Sentence Correction', 'English') },
              { id: 'para-jumbles', name: 'Para Jumbles', progress: 0, ...generateTopicResources('Para Jumbles', 'English') },
              { id: 'fill-blanks', name: 'Fill in the Blanks', progress: 0, ...generateTopicResources('Fill in the Blanks', 'English') },
              { id: 'para-completion', name: 'Para/Sentence Completion', progress: 0, ...generateTopicResources('Sentence Completion', 'English') },
            ]
          },
          {
            id: 'quant-mains',
            name: 'Quantitative Aptitude',
            marks: 50,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'number-series', name: 'Number Series', progress: 0, ...generateTopicResources('Number Series', 'Quant') },
              { id: 'data-interpretation', name: 'Data Interpretation', progress: 0, ...generateTopicResources('Data Interpretation', 'Quant') },
              { id: 'simplification', name: 'Simplification/Approximation', progress: 0, ...generateTopicResources('Simplification', 'Quant') },
              { id: 'quadratic-equation', name: 'Quadratic Equation', progress: 0, ...generateTopicResources('Quadratic Equation', 'Quant') },
              { id: 'data-sufficiency', name: 'Data Sufficiency', progress: 0, ...generateTopicResources('Data Sufficiency', 'Quant') },
              { id: 'mensuration', name: 'Mensuration', progress: 0, ...generateTopicResources('Mensuration', 'Quant') },
              { id: 'average', name: 'Average', progress: 0, ...generateTopicResources('Average', 'Quant') },
              { id: 'profit-loss', name: 'Profit and Loss', progress: 0, ...generateTopicResources('Profit and Loss', 'Quant') },
              { id: 'ratio-proportion', name: 'Ratio and Proportion', progress: 0, ...generateTopicResources('Ratio and Proportion', 'Quant') },
              { id: 'work-time-energy', name: 'Work, Time, and Energy', progress: 0, ...generateTopicResources('Work and Time', 'Quant') },
              { id: 'time-distance', name: 'Time and Distance', progress: 0, ...generateTopicResources('Time and Distance', 'Quant') },
              { id: 'probability', name: 'Probability', progress: 0, ...generateTopicResources('Probability', 'Quant') },
              { id: 'si-ci', name: 'Simple and Compound Interest', progress: 0, ...generateTopicResources('Simple and Compound Interest', 'Quant') },
              { id: 'permutation-combination', name: 'Permutation and Combination', progress: 0, ...generateTopicResources('Permutation and Combination', 'Quant') },
            ]
          },
          {
            id: 'ga-mains',
            name: 'General/Financial Awareness',
            marks: 40,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'current-affairs', name: 'Current Affairs', progress: 0, ...generateTopicResources('Current Affairs', 'GA') },
              { id: 'banking-awareness', name: 'Banking Awareness', progress: 0, ...generateTopicResources('Banking Awareness', 'GA') },
              { id: 'gk-updates', name: 'GK Updates', progress: 0, ...generateTopicResources('GK Updates', 'GA') },
              { id: 'currencies', name: 'Currencies', progress: 0, ...generateTopicResources('Currencies', 'GA') },
              { id: 'important-places', name: 'Important Places', progress: 0, ...generateTopicResources('Important Places', 'GA') },
              { id: 'books-authors', name: 'Books and Authors', progress: 0, ...generateTopicResources('Books and Authors', 'GA') },
              { id: 'awards', name: 'Awards', progress: 0, ...generateTopicResources('Awards', 'GA') },
              { id: 'headquarters', name: 'Headquarters', progress: 0, ...generateTopicResources('Headquarters', 'GA') },
              { id: 'pm-schemes', name: 'Prime Minister Schemes', progress: 0, ...generateTopicResources('PM Schemes', 'GA') },
              { id: 'important-days', name: 'Important Days', progress: 0, ...generateTopicResources('Important Days', 'GA') },
              { id: 'basic-computer', name: 'Basic Computer Knowledge', progress: 0, ...generateTopicResources('Basic Computer', 'GA') },
            ]
          }
        ]
      }
    ]
  }
};

// SSC Exams Syllabus
const sscSyllabus: Record<string, ExamSyllabusConfig> = {
  'ssc-cgl': {
    examId: 'ssc-cgl',
    examName: 'SSC CGL',
    fullName: 'Staff Selection Commission - Combined Graduate Level',
    stages: 'Tier 1 + Tier 2',
    examDate: 'July 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    category: 'ssc',
    tiers: [
      {
        id: 'tier1',
        name: 'Tier 1',
        duration: '60 minutes',
        totalMarks: 200,
        negativeMarking: '0.50 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'quant-tier1',
            name: 'Quantitative Aptitude',
            marks: 50,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'arithmetic', name: 'Arithmetic', progress: 60, ...generateTopicResources('Arithmetic', 'Quant') },
              { id: 'algebra', name: 'Algebra', progress: 45, ...generateTopicResources('Algebra', 'Quant') },
              { id: 'geometry', name: 'Geometry', progress: 55, ...generateTopicResources('Geometry', 'Quant') },
              { id: 'trigonometry', name: 'Trigonometry', progress: 40, ...generateTopicResources('Trigonometry', 'Quant') },
              { id: 'mensuration', name: 'Mensuration', progress: 50, ...generateTopicResources('Mensuration', 'Quant') },
            ]
          },
          {
            id: 'reasoning-tier1',
            name: 'General Intelligence & Reasoning',
            marks: 50,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'analogy', name: 'Analogy', progress: 70, ...generateTopicResources('Analogy', 'Reasoning') },
              { id: 'classification', name: 'Classification', progress: 65, ...generateTopicResources('Classification', 'Reasoning') },
              { id: 'series', name: 'Series', progress: 55, ...generateTopicResources('Series', 'Reasoning') },
              { id: 'coding-decoding', name: 'Coding-Decoding', progress: 60, ...generateTopicResources('Coding', 'Reasoning') },
              { id: 'paper-folding', name: 'Paper Folding & Cutting', progress: 45, ...generateTopicResources('Paper Folding', 'Reasoning') },
            ]
          },
          {
            id: 'english-tier1',
            name: 'English Language',
            marks: 50,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 50, ...generateTopicResources('RC', 'English') },
              { id: 'sentence-improvement', name: 'Sentence Improvement', progress: 55, ...generateTopicResources('Sentence', 'English') },
              { id: 'one-word-substitution', name: 'One Word Substitution', progress: 60, ...generateTopicResources('OWS', 'English') },
              { id: 'idioms-phrases', name: 'Idioms & Phrases', progress: 45, ...generateTopicResources('Idioms', 'English') },
            ]
          },
          {
            id: 'gk-tier1',
            name: 'General Awareness',
            marks: 50,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'history', name: 'History', progress: 40, ...generateTopicResources('History', 'GK') },
              { id: 'geography', name: 'Geography', progress: 45, ...generateTopicResources('Geography', 'GK') },
              { id: 'polity', name: 'Polity', progress: 50, ...generateTopicResources('Polity', 'GK') },
              { id: 'economics', name: 'Economics', progress: 35, ...generateTopicResources('Economics', 'GK') },
              { id: 'science', name: 'General Science', progress: 55, ...generateTopicResources('Science', 'GK') },
              { id: 'current-affairs', name: 'Current Affairs', progress: 30, ...generateTopicResources('Current Affairs', 'GK') },
            ]
          }
        ]
      },
      {
        id: 'tier2',
        name: 'Tier 2',
        duration: '180 minutes',
        totalMarks: 480,
        negativeMarking: '0.50 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'quant-tier2',
            name: 'Quantitative Aptitude',
            marks: 180,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'advanced-arithmetic', name: 'Advanced Arithmetic', progress: 35, ...generateTopicResources('Advanced Arithmetic', 'Quant') },
              { id: 'advanced-algebra', name: 'Advanced Algebra', progress: 30, ...generateTopicResources('Advanced Algebra', 'Quant') },
              { id: 'advanced-geometry', name: 'Advanced Geometry', progress: 40, ...generateTopicResources('Advanced Geometry', 'Quant') },
            ]
          },
          {
            id: 'english-tier2',
            name: 'English Language',
            marks: 180,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'advanced-rc', name: 'Advanced Reading Comprehension', progress: 25, ...generateTopicResources('Advanced RC', 'English') },
              { id: 'error-detection', name: 'Error Detection', progress: 45, ...generateTopicResources('Error', 'English') },
            ]
          },
          {
            id: 'stats',
            name: 'Statistics',
            marks: 60,
            iconName: 'Calculator',
            iconBg: 'bg-teal-500',
            topics: [
              { id: 'measures-central', name: 'Measures of Central Tendency', progress: 40, ...generateTopicResources('Central Tendency', 'Stats') },
              { id: 'probability', name: 'Probability', progress: 35, ...generateTopicResources('Probability', 'Stats') },
            ]
          },
          {
            id: 'reasoning-tier2',
            name: 'General Intelligence',
            marks: 60,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'advanced-reasoning', name: 'Advanced Reasoning', progress: 30, ...generateTopicResources('Advanced Reasoning', 'Reasoning') },
            ]
          }
        ]
      }
    ]
  },
  'ssc-chsl': {
    examId: 'ssc-chsl',
    examName: 'SSC CHSL',
    fullName: 'Staff Selection Commission - Combined Higher Secondary Level',
    stages: 'Tier 1 + Tier 2',
    examDate: 'August 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125092/ssc_rrghxu.webp',
    category: 'ssc',
    tiers: [
      {
        id: 'tier1',
        name: 'Tier 1',
        duration: '60 minutes',
        totalMarks: 200,
        negativeMarking: '0.50 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'quant-tier1',
            name: 'Quantitative Aptitude',
            marks: 50,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'arithmetic', name: 'Arithmetic', progress: 55, ...generateTopicResources('Arithmetic', 'Quant') },
              { id: 'algebra', name: 'Algebra', progress: 40, ...generateTopicResources('Algebra', 'Quant') },
            ]
          },
          {
            id: 'reasoning-tier1',
            name: 'General Intelligence',
            marks: 50,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'analogy', name: 'Analogy', progress: 65, ...generateTopicResources('Analogy', 'Reasoning') },
              { id: 'classification', name: 'Classification', progress: 60, ...generateTopicResources('Classification', 'Reasoning') },
            ]
          },
          {
            id: 'english-tier1',
            name: 'English Language',
            marks: 50,
            iconName: 'BookOpen',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'reading-comprehension', name: 'Reading Comprehension', progress: 45, ...generateTopicResources('RC', 'English') },
            ]
          },
          {
            id: 'gk-tier1',
            name: 'General Awareness',
            marks: 50,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'current-affairs', name: 'Current Affairs', progress: 35, ...generateTopicResources('Current Affairs', 'GK') },
              { id: 'static-gk', name: 'Static GK', progress: 40, ...generateTopicResources('Static GK', 'GK') },
            ]
          }
        ]
      }
    ]
  }
};

// Railway Exams Syllabus
const railwaySyllabus: Record<string, ExamSyllabusConfig> = {
  'rrb-ntpc': {
    examId: 'rrb-ntpc',
    examName: 'RRB NTPC',
    fullName: 'Railway Recruitment Board - Non Technical Popular Categories',
    stages: 'CBT 1 + CBT 2 + Skill Test',
    examDate: 'September 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    category: 'railway',
    tiers: [
      {
        id: 'cbt1',
        name: 'CBT Stage 1',
        duration: '90 minutes',
        totalMarks: 100,
        negativeMarking: '1/3 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'math-cbt1',
            name: 'Mathematics',
            marks: 30,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'number-system', name: 'Number System', progress: 55, ...generateTopicResources('Number System', 'Maths') },
              { id: 'percentage', name: 'Percentage', progress: 60, ...generateTopicResources('Percentage', 'Maths') },
              { id: 'ratio-proportion', name: 'Ratio & Proportion', progress: 50, ...generateTopicResources('Ratio', 'Maths') },
              { id: 'profit-loss', name: 'Profit & Loss', progress: 65, ...generateTopicResources('Profit Loss', 'Maths') },
              { id: 'time-work', name: 'Time & Work', progress: 45, ...generateTopicResources('Time Work', 'Maths') },
              { id: 'si-ci', name: 'Simple & Compound Interest', progress: 55, ...generateTopicResources('Interest', 'Maths') },
            ]
          },
          {
            id: 'reasoning-cbt1',
            name: 'General Intelligence & Reasoning',
            marks: 30,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'analogy', name: 'Analogy', progress: 70, ...generateTopicResources('Analogy', 'Reasoning') },
              { id: 'classification', name: 'Classification', progress: 65, ...generateTopicResources('Classification', 'Reasoning') },
              { id: 'series', name: 'Alphabetical & Number Series', progress: 60, ...generateTopicResources('Series', 'Reasoning') },
              { id: 'syllogism', name: 'Syllogism', progress: 55, ...generateTopicResources('Syllogism', 'Reasoning') },
            ]
          },
          {
            id: 'gk-cbt1',
            name: 'General Awareness',
            marks: 40,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'current-affairs', name: 'Current Affairs', progress: 35, ...generateTopicResources('Current Affairs', 'GK') },
              { id: 'history', name: 'Indian History', progress: 45, ...generateTopicResources('History', 'GK') },
              { id: 'geography', name: 'Geography', progress: 40, ...generateTopicResources('Geography', 'GK') },
              { id: 'science', name: 'General Science', progress: 50, ...generateTopicResources('Science', 'GK') },
              { id: 'polity', name: 'Indian Polity', progress: 45, ...generateTopicResources('Polity', 'GK') },
            ]
          }
        ]
      },
      {
        id: 'cbt2',
        name: 'CBT Stage 2',
        duration: '90 minutes',
        totalMarks: 120,
        negativeMarking: '1/3 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'math-cbt2',
            name: 'Mathematics',
            marks: 35,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'advanced-arithmetic', name: 'Advanced Arithmetic', progress: 40, ...generateTopicResources('Advanced Arithmetic', 'Maths') },
              { id: 'mensuration', name: 'Mensuration', progress: 35, ...generateTopicResources('Mensuration', 'Maths') },
            ]
          },
          {
            id: 'reasoning-cbt2',
            name: 'General Intelligence & Reasoning',
            marks: 35,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'advanced-reasoning', name: 'Advanced Reasoning', progress: 45, ...generateTopicResources('Advanced Reasoning', 'Reasoning') },
            ]
          },
          {
            id: 'gk-cbt2',
            name: 'General Awareness',
            marks: 50,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'advanced-gk', name: 'Advanced General Knowledge', progress: 30, ...generateTopicResources('Advanced GK', 'GK') },
            ]
          }
        ]
      }
    ]
  },
  'rrb-group-d': {
    examId: 'rrb-group-d',
    examName: 'RRB Group D',
    fullName: 'Railway Recruitment Board - Group D',
    stages: 'CBT + PET',
    examDate: 'October 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125088/RRB-NTPC_scjv3q.webp',
    category: 'railway',
    tiers: [
      {
        id: 'cbt',
        name: 'CBT',
        duration: '90 minutes',
        totalMarks: 100,
        negativeMarking: '1/3 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'math',
            name: 'Mathematics',
            marks: 25,
            iconName: 'Calculator',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'number-system', name: 'Number System', progress: 60, ...generateTopicResources('Number System', 'Maths') },
              { id: 'percentage', name: 'Percentage', progress: 55, ...generateTopicResources('Percentage', 'Maths') },
            ]
          },
          {
            id: 'reasoning',
            name: 'General Intelligence & Reasoning',
            marks: 25,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'analogy', name: 'Analogy', progress: 65, ...generateTopicResources('Analogy', 'Reasoning') },
            ]
          },
          {
            id: 'science',
            name: 'General Science',
            marks: 25,
            iconName: 'FlaskConical',
            iconBg: 'bg-teal-500',
            topics: [
              { id: 'physics', name: 'Physics', progress: 45, ...generateTopicResources('Physics', 'Science') },
              { id: 'chemistry', name: 'Chemistry', progress: 40, ...generateTopicResources('Chemistry', 'Science') },
              { id: 'biology', name: 'Biology', progress: 50, ...generateTopicResources('Biology', 'Science') },
            ]
          },
          {
            id: 'gk',
            name: 'General Awareness & Current Affairs',
            marks: 25,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'current-affairs', name: 'Current Affairs', progress: 35, ...generateTopicResources('Current Affairs', 'GK') },
            ]
          }
        ]
      }
    ]
  }
};

// UPSC Exams Syllabus
const upscSyllabus: Record<string, ExamSyllabusConfig> = {
  'upsc-cse': {
    examId: 'upsc-cse',
    examName: 'UPSC CSE',
    fullName: 'Union Public Service Commission - Civil Services Examination',
    stages: 'Prelims + Mains + Interview',
    examDate: 'June 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1744125077/IAS_qk287t.png',
    category: 'upsc',
    tiers: [
      {
        id: 'prelims',
        name: 'Prelims',
        duration: '2 hours each paper',
        totalMarks: 400,
        negativeMarking: '1/3 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'gs1',
            name: 'General Studies Paper 1',
            marks: 200,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'history', name: 'Indian History & Culture', progress: 40, ...generateTopicResources('History', 'GS') },
              { id: 'geography', name: 'Geography of India & World', progress: 35, ...generateTopicResources('Geography', 'GS') },
              { id: 'polity', name: 'Indian Polity & Governance', progress: 45, ...generateTopicResources('Polity', 'GS') },
              { id: 'economy', name: 'Economic & Social Development', progress: 30, ...generateTopicResources('Economy', 'GS') },
              { id: 'environment', name: 'Environment & Ecology', progress: 40, ...generateTopicResources('Environment', 'GS') },
              { id: 'science', name: 'General Science', progress: 50, ...generateTopicResources('Science', 'GS') },
              { id: 'current-affairs', name: 'Current Affairs', progress: 25, ...generateTopicResources('Current Affairs', 'GS') },
            ]
          },
          {
            id: 'csat',
            name: 'CSAT (Paper 2)',
            marks: 200,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'comprehension', name: 'Comprehension', progress: 45, ...generateTopicResources('Comprehension', 'CSAT') },
              { id: 'logical-reasoning', name: 'Logical Reasoning & Analytical Ability', progress: 50, ...generateTopicResources('Logical Reasoning', 'CSAT') },
              { id: 'decision-making', name: 'Decision Making & Problem Solving', progress: 35, ...generateTopicResources('Decision Making', 'CSAT') },
              { id: 'basic-numeracy', name: 'Basic Numeracy', progress: 55, ...generateTopicResources('Numeracy', 'CSAT') },
              { id: 'data-interpretation', name: 'Data Interpretation', progress: 40, ...generateTopicResources('DI', 'CSAT') },
            ]
          }
        ]
      },
      {
        id: 'mains',
        name: 'Mains',
        duration: '3 hours each paper',
        totalMarks: 1750,
        negativeMarking: 'No negative marking',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'essay',
            name: 'Essay',
            marks: 250,
            iconName: 'FileText',
            iconBg: 'bg-blue-500',
            topics: [
              { id: 'essay-writing', name: 'Essay Writing Techniques', progress: 30, ...generateTopicResources('Essay', 'Mains') },
            ]
          },
          {
            id: 'gs1-mains',
            name: 'GS Paper 1 (Culture, History, Geography)',
            marks: 250,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'art-culture', name: 'Indian Art & Culture', progress: 35, ...generateTopicResources('Art Culture', 'GS') },
              { id: 'modern-history', name: 'Modern Indian History', progress: 40, ...generateTopicResources('Modern History', 'GS') },
              { id: 'world-history', name: 'World History', progress: 30, ...generateTopicResources('World History', 'GS') },
              { id: 'geography-main', name: 'Physical, Human & Economic Geography', progress: 35, ...generateTopicResources('Geography Main', 'GS') },
            ]
          },
          {
            id: 'gs2-mains',
            name: 'GS Paper 2 (Governance, Constitution, IR)',
            marks: 250,
            iconName: 'Building2',
            iconBg: 'bg-indigo-500',
            topics: [
              { id: 'constitution', name: 'Indian Constitution', progress: 45, ...generateTopicResources('Constitution', 'GS') },
              { id: 'governance', name: 'Governance', progress: 35, ...generateTopicResources('Governance', 'GS') },
              { id: 'social-justice', name: 'Social Justice', progress: 30, ...generateTopicResources('Social Justice', 'GS') },
              { id: 'international-relations', name: 'International Relations', progress: 40, ...generateTopicResources('IR', 'GS') },
            ]
          },
          {
            id: 'gs3-mains',
            name: 'GS Paper 3 (Economy, Environment, Security)',
            marks: 250,
            iconName: 'Briefcase',
            iconBg: 'bg-emerald-500',
            topics: [
              { id: 'economy-main', name: 'Indian Economy', progress: 35, ...generateTopicResources('Economy Main', 'GS') },
              { id: 'science-tech', name: 'Science & Technology', progress: 40, ...generateTopicResources('Science Tech', 'GS') },
              { id: 'environment-main', name: 'Environment & Biodiversity', progress: 45, ...generateTopicResources('Environment Main', 'GS') },
              { id: 'security', name: 'Internal Security', progress: 30, ...generateTopicResources('Security', 'GS') },
            ]
          },
          {
            id: 'gs4-mains',
            name: 'GS Paper 4 (Ethics)',
            marks: 250,
            iconName: 'Scale',
            iconBg: 'bg-pink-500',
            topics: [
              { id: 'ethics', name: 'Ethics & Human Interface', progress: 40, ...generateTopicResources('Ethics', 'GS') },
              { id: 'aptitude', name: 'Aptitude & Foundational Values', progress: 35, ...generateTopicResources('Aptitude', 'GS') },
              { id: 'case-studies', name: 'Case Studies', progress: 30, ...generateTopicResources('Case Studies', 'GS') },
            ]
          }
        ]
      }
    ]
  }
};

// State PSC Exams Syllabus
const statePscSyllabus: Record<string, ExamSyllabusConfig> = {
  'tnpsc-group1': {
    examId: 'tnpsc-group1',
    examName: 'TNPSC Group 1',
    fullName: 'Tamil Nadu Public Service Commission - Group 1 Services',
    stages: 'Prelims + Mains + Interview',
    examDate: 'March 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748061570/png-transparent-government-of-tamil-nadu-seal-of-tamil-nadu-tamil-nadu-legislative-assembly-state-emblem-of-india-others-miscellaneous-emblem-food-thumbnail_sy4peu.png',
    category: 'state-psc',
    tiers: [
      {
        id: 'prelims',
        name: 'Prelims',
        duration: '3 hours',
        totalMarks: 300,
        negativeMarking: '1/3 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'gs',
            name: 'General Studies',
            marks: 200,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'history', name: 'Indian & Tamil Nadu History', progress: 40, ...generateTopicResources('History', 'GS') },
              { id: 'geography', name: 'Geography', progress: 35, ...generateTopicResources('Geography', 'GS') },
              { id: 'polity', name: 'Indian Polity & Constitution', progress: 45, ...generateTopicResources('Polity', 'GS') },
              { id: 'economy', name: 'Economy', progress: 30, ...generateTopicResources('Economy', 'GS') },
              { id: 'current-affairs', name: 'Current Affairs', progress: 25, ...generateTopicResources('Current Affairs', 'GS') },
            ]
          },
          {
            id: 'aptitude',
            name: 'Aptitude & Mental Ability',
            marks: 100,
            iconName: 'Brain',
            iconBg: 'bg-purple-500',
            topics: [
              { id: 'aptitude-reasoning', name: 'Aptitude & Reasoning', progress: 50, ...generateTopicResources('Aptitude', 'CSAT') },
            ]
          }
        ]
      }
    ]
  },
  'bpsc-pcs': {
    examId: 'bpsc-pcs',
    examName: 'BPSC',
    fullName: 'Bihar Public Service Commission - Combined Competitive Exam',
    stages: 'Prelims + Mains + Interview',
    examDate: 'December 2026',
    logo: 'https://res.cloudinary.com/dsyxrhbwb/image/upload/v1748062062/biharpol_dpbgss.jpg',
    category: 'state-psc',
    tiers: [
      {
        id: 'prelims',
        name: 'Prelims',
        duration: '2 hours',
        totalMarks: 150,
        negativeMarking: '0.25 marks per wrong answer',
        sectionalCutoff: false,
        subjects: [
          {
            id: 'gs',
            name: 'General Studies',
            marks: 150,
            iconName: 'Globe',
            iconBg: 'bg-amber-500',
            topics: [
              { id: 'history', name: 'Indian & Bihar History', progress: 45, ...generateTopicResources('History', 'GS') },
              { id: 'geography', name: 'Geography of India & Bihar', progress: 40, ...generateTopicResources('Geography', 'GS') },
              { id: 'polity', name: 'Indian Polity', progress: 50, ...generateTopicResources('Polity', 'GS') },
              { id: 'science', name: 'General Science', progress: 35, ...generateTopicResources('Science', 'GS') },
            ]
          }
        ]
      }
    ]
  }
};

// Combine all syllabus data
export const allSyllabusData: Record<string, ExamSyllabusConfig> = {
  ...bankingSyllabus,
  ...sscSyllabus,
  ...railwaySyllabus,
  ...upscSyllabus,
  ...statePscSyllabus
};

// Category to exam mapping
export const categoryExamMapping: Record<string, string[]> = {
  'banking': ['ibps-po', 'sbi-po', 'ibps-clerk'],
  'banking-insurance': ['ibps-po', 'sbi-po', 'ibps-clerk'],
  'ssc': ['ssc-cgl', 'ssc-chsl'],
  'railway': ['rrb-ntpc', 'rrb-group-d'],
  'railways-rrb': ['rrb-ntpc', 'rrb-group-d'],
  'upsc': ['upsc-cse'],
  'civil-services': ['upsc-cse', 'tnpsc-group1', 'bpsc-pcs'],
  'state-psc': ['tnpsc-group1', 'bpsc-pcs'],
  'tamil-nadu-exams': ['tnpsc-group1'],
  'bihar-exams': ['bpsc-pcs'],
};

// Get exams by category for syllabus
export const getExamsByCategoryForSyllabus = (categories: string[]): { id: string; name: string; category: string; logo: string }[] => {
  const exams: { id: string; name: string; category: string; logo: string }[] = [];
  const addedExamIds = new Set<string>();

  // Expand combo categories
  const expandedCategories = new Set<string>();
  categories.forEach(category => {
    expandedCategories.add(category);

    switch (category) {
      case 'banking-ssc-railway-combo':
        expandedCategories.add('banking');
        expandedCategories.add('banking-insurance');
        expandedCategories.add('ssc');
        expandedCategories.add('railway');
        expandedCategories.add('railways-rrb');
        break;
      case 'ssc-railway-combo':
        expandedCategories.add('ssc');
        expandedCategories.add('railway');
        expandedCategories.add('railways-rrb');
        break;
      case 'upsc-tnpsc-combo':
        expandedCategories.add('upsc');
        expandedCategories.add('civil-services');
        expandedCategories.add('tnpsc');
        expandedCategories.add('tamil-nadu-exams');
        break;
      case 'ssc-railway-defence-combo':
        expandedCategories.add('ssc');
        expandedCategories.add('railway');
        expandedCategories.add('railways-rrb');
        expandedCategories.add('defence');
        break;
    }
  });

  expandedCategories.forEach(category => {
    const examIds = categoryExamMapping[category] || [];
    examIds.forEach(examId => {
      if (!addedExamIds.has(examId) && allSyllabusData[examId]) {
        addedExamIds.add(examId);
        const examData = allSyllabusData[examId];
        exams.push({
          id: examId,
          name: examData.examName,
          category: examData.category,
          logo: examData.logo
        });
      }
    });
  });

  return exams;
};

// Get exam syllabus by ID
export const getExamSyllabus = (examId: string): ExamSyllabusConfig | undefined => {
  return allSyllabusData[examId];
};

// Get category name by ID
export const getCategoryName = (categoryId: string): string => {
  const category = examCategories.find(c => c.id === categoryId);
  return category?.name || categoryId;
};

// Comparison data interface
export interface ComparisonData {
  examName: string;
  totalMarks: number;
  duration: string;
  subjects: { name: string; marks: number }[];
  negativeMarking: string;
}

// Get comparison data for exams
export const getComparisonData = (examIds: string[]): ComparisonData[] => {
  return examIds.map(examId => {
    const exam = allSyllabusData[examId];
    if (!exam) return null;

    const firstTier = exam.tiers[0];
    return {
      examName: exam.examName,
      totalMarks: firstTier.totalMarks,
      duration: firstTier.duration,
      subjects: firstTier.subjects.map(s => ({ name: s.name, marks: s.marks })),
      negativeMarking: firstTier.negativeMarking
    };
  }).filter(Boolean) as ComparisonData[];
};
