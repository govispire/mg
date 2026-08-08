import { useState, useEffect, useCallback, useMemo } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
export type DifficultyLevel = 'easy' | 'medium' | 'hard';
export type SituationCategory = 'interview' | 'essay' | 'business' | 'daily' | 'exam';
export type ExamCategory = 'banking' | 'ssc' | 'railway' | 'upsc' | 'state-psc' | 'defence' | 'general';
export type ContentStatus = 'draft' | 'pending_approval' | 'approved' | 'rejected';
export type WordStatus = 'new' | 'learning' | 'learned' | 'mastered';
export type SelfAssessment = 'i_know' | 'need_revision' | null;
export type LessonPhase = 'learning' | 'flashcards' | 'spelling' | 'quiz' | 'completed';
// Keep legacy alias for compatibility
export type VocabStatus = WordStatus;

export interface VocabCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  thumbnail?: string;
  examTags: ExamCategory[];
  isActive: boolean;
  createdAt: string;
}

export interface VocabLesson {
  id: string;
  categoryId: string;
  name: string;
  description: string;
  difficulty: DifficultyLevel;
  estimatedMinutes: number;
  wordIds: string[];
  thumbnail?: string;
  priority: 'high' | 'medium' | 'low';
  status: 'draft' | 'published';
  createdAt: string;
}

export interface VocabWord {
  id: string;
  word: string;
  pronunciation?: string;
  partOfSpeech?: string;
  meaning: string;
  shortDefinition?: string;
  detailedExplanation?: string;
  example: string;
  example2?: string;
  difficulty: DifficultyLevel;
  situation: SituationCategory;
  examCategory: ExamCategory;
  synonyms?: string[];
  antonyms?: string[];
  memoryTrick?: string;
  wordFamily?: { word: string; pos: string }[];
  wordTreeRoot?: string;
  wordTree?: string;
  imageUrl?: string;
  audioUrl?: string;
  isActive: boolean;
  uploadedBy: string;
  uploadedByRole: 'super-admin' | 'employee';
  contentStatus: ContentStatus;
  rejectionReason?: string;
  createdAt: string;
}

export interface QuizQuestion {
  id: string;
  lessonId: string;
  type: 'mcq' | 'image' | 'meaning' | 'synonym' | 'antonym' | 'fill_blank' | 'audio' | 'spelling' | 'missing_letter';
  question: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty: DifficultyLevel;
  marks: number;
  imageUrl?: string;
  audioUrl?: string;
  wordId?: string;
}

export interface VocabProgress {
  id: string;
  userId: string;
  wordId: string;
  lessonId?: string;
  status: WordStatus;
  selfAssessment?: SelfAssessment;
  assignedDate: string;
  timesShown: number;
  quizAttempts: number;
  quizAccuracy: number;
  learnedDate?: string;
  masteredDate?: string;
  nextRevisionDate?: string;
  revisionLevel: number;
  revisionAttempts: number;
  isBookmarked: boolean;
  isDifficult: boolean;
}

export interface LessonProgress {
  id: string;
  userId: string;
  lessonId: string;
  phase: LessonPhase;
  startedAt: string;
  completedAt?: string;
  flashcardsScore: number;
  spellingScore: number;
  quizScore: number;
  quizTotal: number;
  timeSpentSeconds: number;
  selfAssessments: Record<string, SelfAssessment>;
}

export interface RevisionEntry {
  id: string;
  userId: string;
  wordId: string;
  level: number;
  nextRevisionDate: string;
  lastRevisedDate?: string;
  accuracy: number;
  attempts: number;
}

export interface QuizAttempt {
  id: string;
  userId: string;
  wordId: string;
  lessonId?: string;
  selectedOption: string;
  correctOption: string;
  isCorrect: boolean;
  attemptDate: string;
}

// ─── Seed Categories ──────────────────────────────────────────────────────────
const SEED_CATEGORIES: VocabCategory[] = [
  {
    id: 'cat1', name: 'Banking Vocabulary', icon: '🏦',
    description: 'High frequency vocabulary for IBPS, SBI, RBI, NABARD, IDBI and other banking exams.',
    color: 'from-blue-500 to-indigo-600', examTags: ['banking'],
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat2', name: 'SSC Vocabulary', icon: '📝',
    description: 'Essential words frequently asked in SSC CGL, CHSL, MTS, and other SSC exams.',
    color: 'from-emerald-500 to-teal-600', examTags: ['ssc'],
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat3', name: 'UPSC Vocabulary', icon: '⚖️',
    description: 'Advanced vocabulary for UPSC CSE prelims and mains, editorial words.',
    color: 'from-violet-500 to-purple-600', examTags: ['upsc'],
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat4', name: 'Editorial Vocabulary', icon: '📰',
    description: 'Words from The Hindu, Indian Express editorials — essential for comprehension.',
    color: 'from-rose-500 to-pink-600', examTags: ['banking', 'ssc', 'upsc'],
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat5', name: 'Idioms & Phrases', icon: '💬',
    description: 'Common idioms and phrases tested across competitive exams.',
    color: 'from-amber-500 to-orange-500', examTags: ['ssc', 'banking'],
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
  {
    id: 'cat6', name: 'One Word Substitution', icon: '🎯',
    description: 'Single words that replace a group of words — a must-have topic.',
    color: 'from-cyan-500 to-blue-600', examTags: ['ssc', 'banking', 'railway'],
    isActive: true, createdAt: '2025-01-01T00:00:00Z',
  },
];

// ─── Seed Words ───────────────────────────────────────────────────────────────
const SEED_WORDS: VocabWord[] = [
  {
    id: 'w-relation', word: 'relation', pronunciation: 'rɪˈleɪ.ʃən', partOfSpeech: 'noun',
    meaning: 'A person who is related to someone by blood or marriage',
    example: 'Uncle Joe is a distant relation on my mother\'s side.',
    difficulty: 'easy', situation: 'daily', examCategory: 'ssc',
    wordTreeRoot: 'rel',
    wordTree: 'rel > relate > relation > relational, relationship',
    imageUrl: 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved'
  },
  {
    id: 'w1', word: 'Resilient', pronunciation: 'rɪˈzɪliənt', partOfSpeech: 'Adjective',
    meaning: 'Able to recover quickly from difficult situations',
    shortDefinition: 'Quick to recover from setbacks',
    example: 'The team remained resilient despite repeated failures.',
    example2: 'She showed incredible resilience in the face of criticism.',
    difficulty: 'medium', situation: 'interview', examCategory: 'banking',
    synonyms: ['tough', 'strong', 'robust', 'durable', 'hardy', 'sturdy'],
    antonyms: ['weak', 'fragile', 'vulnerable', 'delicate'],
    memoryTrick: 'Resilient = Re + Silent. Imagine a rubber band — it bends, but never breaks.',
    wordFamily: [{ word: 'Resilience', pos: 'Noun' }, { word: 'Resiliency', pos: 'Noun' }, { word: 'Resiliently', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'w2', word: 'Acumen', pronunciation: 'ˈæk.jʊ.mən', partOfSpeech: 'Noun',
    meaning: 'The ability to make good judgements and quick decisions',
    shortDefinition: 'Sharpness of mind; keen insight',
    example: 'Her business acumen helped the company grow rapidly.',
    example2: 'The investor\'s financial acumen made him very wealthy.',
    difficulty: 'medium', situation: 'business', examCategory: 'banking',
    synonyms: ['shrewdness', 'insight', 'astuteness', 'wisdom'],
    antonyms: ['stupidity', 'ignorance', 'dullness'],
    memoryTrick: 'Acumen sounds like "A-Cue-Men" — a cue (hint) that sharpens the mind.',
    wordFamily: [{ word: 'Acuminous', pos: 'Adjective' }],
    imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'w3', word: 'Cogent', pronunciation: 'ˈkoʊdʒənt', partOfSpeech: 'Adjective',
    meaning: 'Clear, logical, and convincing — of an argument or case',
    shortDefinition: 'Powerfully persuasive',
    example: 'The lawyer presented a cogent argument in court.',
    example2: 'She made a cogent case for the new policy.',
    difficulty: 'hard', situation: 'essay', examCategory: 'upsc',
    synonyms: ['compelling', 'persuasive', 'convincing', 'forceful'],
    antonyms: ['weak', 'vague', 'unconvincing', 'feeble'],
    memoryTrick: 'CO-GENT = Common Genius — a genius argument that everyone agrees with.',
    wordFamily: [{ word: 'Cogently', pos: 'Adverb' }, { word: 'Cogency', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'w4', word: 'Prudent', pronunciation: 'ˈpruːdənt', partOfSpeech: 'Adjective',
    meaning: 'Acting with care and thought for the future; showing good judgment',
    shortDefinition: 'Wise and careful in practical matters',
    example: 'It is prudent to save money for emergencies.',
    example2: 'A prudent investor diversifies their portfolio.',
    difficulty: 'medium', situation: 'daily', examCategory: 'ssc',
    synonyms: ['wise', 'cautious', 'sensible', 'judicious'],
    antonyms: ['reckless', 'imprudent', 'foolish', 'careless'],
    memoryTrick: 'PRUDENT = "PRU-DENT" — a dentist who carefully checks each tooth is being prudent.',
    wordFamily: [{ word: 'Prudence', pos: 'Noun' }, { word: 'Prudently', pos: 'Adverb' }, { word: 'Imprudent', pos: 'Adjective' }],
    imageUrl: 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'w5', word: 'Tenacious', pronunciation: 'tɪˈneɪʃəs', partOfSpeech: 'Adjective',
    meaning: 'Not readily giving up; holding firmly to a position or belief',
    shortDefinition: 'Persistent and determined',
    example: 'The tenacious athlete never gave up despite losing.',
    example2: 'Tenacious negotiators rarely leave empty-handed.',
    difficulty: 'easy', situation: 'interview', examCategory: 'ssc',
    synonyms: ['persistent', 'determined', 'resolute', 'stubborn'],
    antonyms: ['weak', 'irresolute', 'yielding', 'spineless'],
    memoryTrick: 'TEN-ACIOUS — imagine holding on with all ten fingers — that\'s tenacity!',
    wordFamily: [{ word: 'Tenacity', pos: 'Noun' }, { word: 'Tenaciously', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-02T00:00:00Z',
  },
  {
    id: 'w6', word: 'Salient', pronunciation: 'ˈseɪliənt', partOfSpeech: 'Adjective',
    meaning: 'Most noticeable or important; standing out prominently',
    shortDefinition: 'Most prominent or important',
    example: 'The report highlighted the salient points of the investigation.',
    example2: 'The salient features of the budget were discussed.',
    difficulty: 'medium', situation: 'essay', examCategory: 'upsc',
    synonyms: ['prominent', 'notable', 'striking', 'conspicuous'],
    antonyms: ['minor', 'trivial', 'insignificant', 'hidden'],
    memoryTrick: 'SALIENT = SAIL-OUT. It sails out from the rest — it stands out!',
    wordFamily: [{ word: 'Salience', pos: 'Noun' }, { word: 'Saliently', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-03T00:00:00Z',
  },
  {
    id: 'w7', word: 'Ephemeral', pronunciation: 'ɪˈfemərəl', partOfSpeech: 'Adjective',
    meaning: 'Lasting for a very short time; transitory',
    shortDefinition: 'Short-lived; fleeting',
    example: 'Fame is often ephemeral in the world of social media.',
    example2: 'The beauty of cherry blossoms is ephemeral.',
    difficulty: 'hard', situation: 'essay', examCategory: 'upsc',
    synonyms: ['fleeting', 'transient', 'momentary', 'short-lived'],
    antonyms: ['permanent', 'eternal', 'enduring', 'lasting'],
    memoryTrick: 'EPHEMERAL = a day. In Greek, "ephemeros" means "lasting only a day".',
    wordFamily: [{ word: 'Ephemerally', pos: 'Adverb' }, { word: 'Ephemeralness', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1507400492013-16b15bf17086?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-05T00:00:00Z',
  },
  {
    id: 'w8', word: 'Pragmatic', pronunciation: 'præɡˈmætɪk', partOfSpeech: 'Adjective',
    meaning: 'Dealing with things sensibly and realistically based on practical considerations',
    shortDefinition: 'Practical and realistic',
    example: 'A pragmatic approach to solving the problem was adopted.',
    example2: 'She was pragmatic rather than idealistic about the project.',
    difficulty: 'medium', situation: 'business', examCategory: 'upsc',
    synonyms: ['practical', 'realistic', 'sensible', 'matter-of-fact'],
    antonyms: ['idealistic', 'impractical', 'unrealistic', 'quixotic'],
    memoryTrick: 'PRAGMATIC = PRACtical + autoMATIC — automatically practical!',
    wordFamily: [{ word: 'Pragmatism', pos: 'Noun' }, { word: 'Pragmatically', pos: 'Adverb' }, { word: 'Pragmatist', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-04T00:00:00Z',
  },
  {
    id: 'w9', word: 'Meticulous', pronunciation: 'mɪˈtɪkjʊləs', partOfSpeech: 'Adjective',
    meaning: 'Showing great attention to detail or being very careful and precise',
    shortDefinition: 'Extremely careful and precise',
    example: 'The meticulous accountant checked every figure twice.',
    example2: 'Meticulous planning went into the event.',
    difficulty: 'medium', situation: 'business', examCategory: 'banking',
    synonyms: ['careful', 'thorough', 'precise', 'painstaking'],
    antonyms: ['careless', 'sloppy', 'haphazard', 'negligent'],
    memoryTrick: 'METICULOUS = METRIC + ULOUS — someone who measures every metric very carefully.',
    wordFamily: [{ word: 'Meticulously', pos: 'Adverb' }, { word: 'Meticulousness', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-07T00:00:00Z',
  },
  {
    id: 'w10', word: 'Verbose', pronunciation: 'vɜːrˈboʊs', partOfSpeech: 'Adjective',
    meaning: 'Using or expressed in more words than are needed; wordy',
    shortDefinition: 'Unnecessarily wordy',
    example: 'His verbose speech bored the audience.',
    example2: 'The verbose report could have been summarized in one page.',
    difficulty: 'easy', situation: 'exam', examCategory: 'ssc',
    synonyms: ['wordy', 'long-winded', 'garrulous', 'prolix'],
    antonyms: ['concise', 'brief', 'terse', 'succinct'],
    memoryTrick: 'VERBOSE = VERB + OUSE — a house full of verbs = too many words!',
    wordFamily: [{ word: 'Verbosity', pos: 'Noun' }, { word: 'Verbosely', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-03T00:00:00Z',
  },
  {
    id: 'w11', word: 'Magnanimous', pronunciation: 'mæɡˈnænɪməs', partOfSpeech: 'Adjective',
    meaning: 'Very generous or forgiving, especially towards a rival or someone less powerful',
    shortDefinition: 'Very generous and forgiving',
    example: 'The magnanimous winner congratulated the loser graciously.',
    example2: 'She was magnanimous in defeat.',
    difficulty: 'hard', situation: 'interview', examCategory: 'banking',
    synonyms: ['generous', 'noble', 'benevolent', 'charitable'],
    antonyms: ['selfish', 'mean', 'petty', 'vindictive'],
    memoryTrick: 'MAGNA (great) + ANIMUS (spirit) = Great-spirited person.',
    wordFamily: [{ word: 'Magnanimity', pos: 'Noun' }, { word: 'Magnanimously', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-04T00:00:00Z',
  },
  {
    id: 'w12', word: 'Arduous', pronunciation: 'ˈɑːrdjuəs', partOfSpeech: 'Adjective',
    meaning: 'Involving or requiring strenuous effort; difficult and tiring',
    shortDefinition: 'Demanding great effort; hard',
    example: 'Climbing Mount Everest is an arduous task.',
    example2: 'The arduous journey took three weeks.',
    difficulty: 'medium', situation: 'exam', examCategory: 'banking',
    synonyms: ['difficult', 'laborious', 'strenuous', 'gruelling'],
    antonyms: ['easy', 'effortless', 'simple', 'painless'],
    memoryTrick: 'ARDUOUS = HARD + OUS — sounds like "harduous" — very hard!',
    wordFamily: [{ word: 'Arduously', pos: 'Adverb' }, { word: 'Arduousness', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-02T00:00:00Z',
  },
  {
    id: 'w13', word: 'Loquacious', pronunciation: 'ləˈkweɪʃəs', partOfSpeech: 'Adjective',
    meaning: 'Tending to talk a great deal; talkative',
    shortDefinition: 'Very talkative; chatty',
    example: 'The loquacious student always dominated discussions.',
    example2: 'She was naturally loquacious and made friends easily.',
    difficulty: 'hard', situation: 'daily', examCategory: 'ssc',
    synonyms: ['talkative', 'garrulous', 'chatty', 'voluble'],
    antonyms: ['taciturn', 'reserved', 'reticent', 'quiet'],
    memoryTrick: 'LOQUACIOUS = LOQUI (to speak in Latin). A loquacious person loves to loqui!',
    wordFamily: [{ word: 'Loquacity', pos: 'Noun' }, { word: 'Loquaciously', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1577962917302-cd874c4d31d9?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-05T00:00:00Z',
  },
  {
    id: 'w14', word: 'Lucid', pronunciation: 'ˈluːsɪd', partOfSpeech: 'Adjective',
    meaning: 'Expressed clearly and easy to understand; showing ability to think clearly',
    shortDefinition: 'Clear and easily understood',
    example: 'The professor gave a lucid explanation of the complex topic.',
    example2: 'His lucid writing made the textbook enjoyable.',
    difficulty: 'easy', situation: 'exam', examCategory: 'banking',
    synonyms: ['clear', 'intelligible', 'transparent', 'comprehensible'],
    antonyms: ['vague', 'unclear', 'obscure', 'muddled'],
    memoryTrick: 'LUCID = LUCI (light) + D. A lucid explanation shines light on a topic.',
    wordFamily: [{ word: 'Lucidity', pos: 'Noun' }, { word: 'Lucidly', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-06T00:00:00Z',
  },
  {
    id: 'w15', word: 'Intrepid', pronunciation: 'ɪnˈtrepɪd', partOfSpeech: 'Adjective',
    meaning: 'Fearless and adventurous; willing to do dangerous or difficult things',
    shortDefinition: 'Brave and fearless',
    example: 'The intrepid explorer ventured into the unknown jungle.',
    example2: 'Intrepid journalists reported from war zones.',
    difficulty: 'medium', situation: 'interview', examCategory: 'defence',
    synonyms: ['brave', 'fearless', 'courageous', 'bold'],
    antonyms: ['cowardly', 'timid', 'fearful', 'craven'],
    memoryTrick: 'IN (not) + TREPID (scared). Not scared at all = intrepid!',
    wordFamily: [{ word: 'Intrepidity', pos: 'Noun' }, { word: 'Intrepidly', pos: 'Adverb' }],
    imageUrl: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-06T00:00:00Z',
  },
  {
    id: 'w16', word: 'Disparate', pronunciation: 'ˈdɪspərɪt', partOfSpeech: 'Adjective',
    meaning: 'Essentially different in kind; not comparable or having a common measure',
    shortDefinition: 'Fundamentally different; not similar',
    example: 'The committee had disparate views on the proposal.',
    example2: 'The two cultures were so disparate that integration was difficult.',
    difficulty: 'hard', situation: 'essay', examCategory: 'upsc',
    synonyms: ['different', 'dissimilar', 'contrasting', 'divergent'],
    antonyms: ['similar', 'alike', 'comparable', 'homogeneous'],
    memoryTrick: 'DISPARATE = DIS (apart) + PARATE (prepare). Things so different they need separate preparation.',
    wordFamily: [{ word: 'Disparately', pos: 'Adverb' }, { word: 'Disparity', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-08T00:00:00Z',
  },
  {
    id: 'w17', word: 'Zeal', pronunciation: 'ziːl', partOfSpeech: 'Noun',
    meaning: 'Great energy or enthusiasm in pursuit of a cause or objective',
    shortDefinition: 'Fervent enthusiasm',
    example: 'She pursued her studies with great zeal.',
    example2: 'His zeal for justice inspired the whole team.',
    difficulty: 'easy', situation: 'daily', examCategory: 'general',
    synonyms: ['enthusiasm', 'passion', 'fervour', 'ardour'],
    antonyms: ['apathy', 'indifference', 'lethargy', 'disinterest'],
    memoryTrick: 'ZEAL sounds like REAL — real passion is zeal!',
    wordFamily: [{ word: 'Zealous', pos: 'Adjective' }, { word: 'Zealously', pos: 'Adverb' }, { word: 'Zealot', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1517486808906-6ca8b3f04846?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-07T00:00:00Z',
  },
  {
    id: 'w18', word: 'Candid', pronunciation: 'ˈkændɪd', partOfSpeech: 'Adjective',
    meaning: 'Truthful and straightforward; not hesitating to speak one\'s mind',
    shortDefinition: 'Honest and open; frank',
    example: 'She was candid about her mistakes in the interview.',
    example2: 'His candid advice helped her make a better decision.',
    difficulty: 'easy', situation: 'interview', examCategory: 'general',
    synonyms: ['frank', 'honest', 'forthright', 'open'],
    antonyms: ['evasive', 'deceptive', 'dishonest', 'guarded'],
    memoryTrick: 'CANDID = CAND (candle) + ID. A candle reveals what is hidden — like a candid person reveals truth.',
    wordFamily: [{ word: 'Candidly', pos: 'Adverb' }, { word: 'Candour', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-08T00:00:00Z',
  },
  {
    id: 'w19', word: 'Ominous', pronunciation: 'ˈɒmɪnəs', partOfSpeech: 'Adjective',
    meaning: 'Giving the impression that something bad or unpleasant is going to happen',
    shortDefinition: 'Threatening; warning of evil to come',
    example: 'The dark clouds were an ominous sign of the storm ahead.',
    example2: 'An ominous silence fell over the room.',
    difficulty: 'medium', situation: 'exam', examCategory: 'ssc',
    synonyms: ['threatening', 'foreboding', 'menacing', 'sinister'],
    antonyms: ['promising', 'auspicious', 'propitious', 'encouraging'],
    memoryTrick: 'OMINOUS = OMEN + OUS. Full of bad omens!',
    wordFamily: [{ word: 'Ominously', pos: 'Adverb' }, { word: 'Omen', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1504701954957-2010ec3bcec1?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-09T00:00:00Z',
  },
  {
    id: 'w20', word: 'Equivocal', pronunciation: 'ɪˈkwɪvəkəl', partOfSpeech: 'Adjective',
    meaning: 'Open to more than one interpretation; ambiguous; uncertain or questionable in nature',
    shortDefinition: 'Ambiguous; deliberately vague',
    example: 'The politician gave an equivocal answer to avoid controversy.',
    example2: 'His equivocal statement left everyone confused.',
    difficulty: 'hard', situation: 'essay', examCategory: 'upsc',
    synonyms: ['ambiguous', 'vague', 'unclear', 'evasive'],
    antonyms: ['unambiguous', 'clear', 'definite', 'explicit'],
    memoryTrick: 'EQUIVOCAL = EQUAL VOICE — speaking with two equal voices (two meanings).',
    wordFamily: [{ word: 'Equivocally', pos: 'Adverb' }, { word: 'Equivocate', pos: 'Verb' }, { word: 'Equivocation', pos: 'Noun' }],
    imageUrl: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=250&fit=crop',
    isActive: true, uploadedBy: 'sa1', uploadedByRole: 'super-admin',
    contentStatus: 'approved', createdAt: '2025-02-10T00:00:00Z',
  },
];

// ─── Seed Lessons ─────────────────────────────────────────────────────────────
const SEED_LESSONS: VocabLesson[] = [
  {
    id: 'l1', categoryId: 'cat1', name: 'Banking Confusing Words', priority: 'high',
    description: 'Words that are commonly confused in banking contexts.',
    difficulty: 'medium', estimatedMinutes: 30,
    wordIds: ['w1', 'w2', 'w9', 'w12', 'w14'],
    status: 'published', createdAt: '2025-02-01T00:00:00Z',
  },
  {
    id: 'l2', categoryId: 'cat1', name: 'Business & Finance Vocabulary', priority: 'high',
    description: 'Essential words for banking and financial topics.',
    difficulty: 'medium', estimatedMinutes: 25,
    wordIds: ['w8', 'w11', 'w18'],
    status: 'published', createdAt: '2025-02-02T00:00:00Z',
  },
  {
    id: 'l3', categoryId: 'cat2', name: 'SSC High Frequency Words', priority: 'high',
    description: 'Words that appear most frequently in SSC examinations.',
    difficulty: 'easy', estimatedMinutes: 20,
    wordIds: ['w4', 'w5', 'w10', 'w13', 'w17', 'w19'],
    status: 'published', createdAt: '2025-02-03T00:00:00Z',
  },
  {
    id: 'l4', categoryId: 'cat3', name: 'UPSC Editorial Words', priority: 'high',
    description: 'Advanced vocabulary from UPSC-level editorials.',
    difficulty: 'hard', estimatedMinutes: 40,
    wordIds: ['w3', 'w6', 'w7', 'w16', 'w20'],
    status: 'published', createdAt: '2025-02-04T00:00:00Z',
  },
  {
    id: 'l5', categoryId: 'cat4', name: 'The Hindu Editorial — Set 1', priority: 'medium',
    description: 'Words from The Hindu editorial section, batch 1.',
    difficulty: 'medium', estimatedMinutes: 35,
    wordIds: ['w3', 'w6', 'w15', 'w16'],
    status: 'published', createdAt: '2025-02-05T00:00:00Z',
  },
  {
    id: 'l6', categoryId: 'cat2', name: 'SSC Synonyms & Antonyms', priority: 'medium',
    description: 'Key synonym and antonym pairs for SSC exams.',
    difficulty: 'medium', estimatedMinutes: 25,
    wordIds: ['w4', 'w10', 'w18'],
    status: 'draft', createdAt: '2025-02-06T00:00:00Z',
  },
];

// ─── Seed Quiz Questions ──────────────────────────────────────────────────────
const SEED_QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1', lessonId: 'l1', wordId: 'w1', type: 'mcq', difficulty: 'medium', marks: 1,
    question: 'What is the meaning of "Resilient"?',
    options: ['Easily broken', 'Able to recover quickly from setbacks', 'Extremely stubborn', 'Overly cautious'],
    correctAnswer: 'Able to recover quickly from setbacks',
    explanation: 'Resilient comes from the Latin "resilire" meaning to spring back.',
  },
  {
    id: 'q2', lessonId: 'l1', wordId: 'w2', type: 'synonym', difficulty: 'medium', marks: 1,
    question: 'Which word is a synonym of "Acumen"?',
    options: ['Stupidity', 'Shrewdness', 'Recklessness', 'Confusion'],
    correctAnswer: 'Shrewdness',
    explanation: 'Acumen means sharpness of judgment, so shrewdness is its closest synonym.',
  },
  {
    id: 'q3', lessonId: 'l1', wordId: 'w9', type: 'antonym', difficulty: 'medium', marks: 1,
    question: 'Which word is an antonym of "Meticulous"?',
    options: ['Careful', 'Precise', 'Careless', 'Thorough'],
    correctAnswer: 'Careless',
    explanation: 'Meticulous means very careful, so careless is its antonym.',
  },
  {
    id: 'q4', lessonId: 'l1', wordId: 'w14', type: 'fill_blank', difficulty: 'easy', marks: 1,
    question: 'Complete: "The professor gave a ______ explanation of the complex topic."',
    options: ['verbose', 'lucid', 'vague', 'ominous'],
    correctAnswer: 'lucid',
    explanation: 'Lucid means clear and easy to understand.',
  },
  {
    id: 'q5', lessonId: 'l3', wordId: 'w4', type: 'mcq', difficulty: 'medium', marks: 1,
    question: '"Prudent" most closely means:',
    options: ['Reckless', 'Wise and careful', 'Honest', 'Talkative'],
    correctAnswer: 'Wise and careful',
    explanation: 'Prudent means showing good judgment and caution.',
  },
  {
    id: 'q6', lessonId: 'l4', wordId: 'w7', type: 'mcq', difficulty: 'hard', marks: 2,
    question: 'Which sentence uses "Ephemeral" correctly?',
    options: [
      'Her ephemeral nature made her very stubborn.',
      'The ephemeral beauty of cherry blossoms lasts only days.',
      'He was ephemeral in his approach to money.',
      'The soldier showed ephemeral courage in battle.',
    ],
    correctAnswer: 'The ephemeral beauty of cherry blossoms lasts only days.',
    explanation: 'Ephemeral means short-lived or transient.',
  },
  {
    id: 'q7', lessonId: 'l4', wordId: 'w20', type: 'meaning', difficulty: 'hard', marks: 2,
    question: 'What does "Equivocal" mean?',
    options: ['Very fair and equal', 'Ambiguous and open to multiple interpretations', 'Highly vocal', 'Extremely logical'],
    correctAnswer: 'Ambiguous and open to multiple interpretations',
    explanation: 'Equivocal means deliberately vague or having multiple meanings.',
  },
  {
    id: 'q8', lessonId: 'l3', wordId: 'w10', type: 'antonym', difficulty: 'easy', marks: 1,
    question: 'What is the antonym of "Verbose"?',
    options: ['Wordy', 'Garrulous', 'Concise', 'Loquacious'],
    correctAnswer: 'Concise',
    explanation: 'Verbose means using too many words; concise means brief and clear.',
  },
];

// ─── Storage Keys ─────────────────────────────────────────────────────────────
const KEYS = {
  WORDS: 'vocab_master',
  CATEGORIES: 'vocab_categories',
  LESSONS: 'vocab_lessons',
  PROGRESS: 'vocab_progress',
  LESSON_PROGRESS: 'vocab_lesson_progress',
  REVISION: 'vocab_revision',
  QUIZ_ATTEMPTS: 'vocab_quiz_attempts',
  QUIZ_QUESTIONS: 'vocab_quiz_questions',
  STREAK: 'vocab_streak',
};

const load = <T>(key: string, fallback: T): T => {
  try {
    const s = localStorage.getItem(key);
    return s ? JSON.parse(s) : fallback;
  } catch { return fallback; }
};

const todayStr = () => new Date().toISOString().split('T')[0];
const addDays = (days: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

const REVISION_SCHEDULE = [0, 1, 3, 7, 15, 30];

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useVocabulary(userId = 'student_1') {
  const [words, setWords] = useState<VocabWord[]>(() => load(KEYS.WORDS, SEED_WORDS));
  const [categories, setCategories] = useState<VocabCategory[]>(() => load(KEYS.CATEGORIES, SEED_CATEGORIES));
  const [lessons, setLessons] = useState<VocabLesson[]>(() => load(KEYS.LESSONS, SEED_LESSONS));
  const [progress, setProgress] = useState<VocabProgress[]>(() => load(KEYS.PROGRESS, []));
  const [lessonProgressList, setLessonProgressList] = useState<LessonProgress[]>(() => load(KEYS.LESSON_PROGRESS, []));
  const [revisionEntries, setRevisionEntries] = useState<RevisionEntry[]>(() => load(KEYS.REVISION, []));
  const [quizAttemptsList, setQuizAttemptsList] = useState<QuizAttempt[]>(() => load(KEYS.QUIZ_ATTEMPTS, []));
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>(() => load(KEYS.QUIZ_QUESTIONS, SEED_QUIZ_QUESTIONS));
  const [vocabStreak, setVocabStreak] = useState<number>(() => load(KEYS.STREAK, 0));

  // Persist
  useEffect(() => { localStorage.setItem(KEYS.WORDS, JSON.stringify(words)); }, [words]);
  useEffect(() => { localStorage.setItem(KEYS.CATEGORIES, JSON.stringify(categories)); }, [categories]);
  useEffect(() => { localStorage.setItem(KEYS.LESSONS, JSON.stringify(lessons)); }, [lessons]);
  useEffect(() => { localStorage.setItem(KEYS.PROGRESS, JSON.stringify(progress)); }, [progress]);
  useEffect(() => { localStorage.setItem(KEYS.LESSON_PROGRESS, JSON.stringify(lessonProgressList)); }, [lessonProgressList]);
  useEffect(() => { localStorage.setItem(KEYS.REVISION, JSON.stringify(revisionEntries)); }, [revisionEntries]);
  useEffect(() => { localStorage.setItem(KEYS.QUIZ_ATTEMPTS, JSON.stringify(quizAttemptsList)); }, [quizAttemptsList]);
  useEffect(() => { localStorage.setItem(KEYS.QUIZ_QUESTIONS, JSON.stringify(quizQuestions)); }, [quizQuestions]);

  // Derived: approved active words
  const activeWords = useMemo(() =>
    words.filter(w => w.isActive && w.contentStatus === 'approved'), [words]);

  const userProgress = useMemo(() =>
    progress.filter(p => p.userId === userId), [progress, userId]);

  const lessonProgress = useMemo(() =>
    lessonProgressList.filter(lp => lp.userId === userId), [lessonProgressList, userId]);

  const userRevision = useMemo(() =>
    revisionEntries.filter(r => r.userId === userId), [revisionEntries, userId]);

  const today = todayStr();

  const revisionQueue = useMemo(() =>
    userRevision.filter(r => r.nextRevisionDate <= today),
    [userRevision, today]);

  const allRevisionEntries = userRevision;

  // Today's words: due-for-revision + learning + new
  const todayWords = useMemo(() => {
    const overdueIds = new Set(revisionQueue.map(r => r.wordId));
    const learningIds = new Set(userProgress.filter(p => p.status === 'learning' || p.status === 'learned').map(p => p.wordId));
    const seenIds = new Set(userProgress.map(p => p.wordId));
    const result: VocabWord[] = [];
    const addUnique = (w: VocabWord) => { if (result.length < 20 && !result.find(r => r.id === w.id)) result.push(w); };
    activeWords.filter(w => overdueIds.has(w.id)).forEach(addUnique);
    activeWords.filter(w => learningIds.has(w.id) && !overdueIds.has(w.id)).forEach(addUnique);
    activeWords.filter(w => !seenIds.has(w.id)).forEach(addUnique);
    return result;
  }, [activeWords, userProgress, revisionQueue]);

  // Stats
  const stats = useMemo(() => {
    const learned = userProgress.filter(p => p.status === 'learned').length;
    const mastered = userProgress.filter(p => p.status === 'mastered').length;
    const inProgress = userProgress.filter(p => p.status === 'learning').length;
    const pending = revisionQueue.length;
    const allAttempts = quizAttemptsList.filter(a => a.userId === userId);
    const correct = allAttempts.filter(a => a.isCorrect).length;
    const accuracy = allAttempts.length > 0 ? Math.round((correct / allAttempts.length) * 100) : 0;
    const level = mastered < 20 ? 'Beginner' : mastered < 50 ? 'Intermediate' : mastered < 100 ? 'Advanced' : 'Expert';
    return { total: activeWords.length, learned, mastered, inProgress, pending, accuracy, streak: vocabStreak, level };
  }, [activeWords, userProgress, revisionQueue, quizAttemptsList, userId, vocabStreak]);

  // Helpers
  const getWordProgress = useCallback((wordId: string) =>
    userProgress.find(p => p.wordId === wordId), [userProgress]);

  const getLessonProgress = useCallback((lessonId: string) =>
    lessonProgress.find(lp => lp.lessonId === lessonId), [lessonProgress]);

  const lessonWords = useCallback((lessonId: string): VocabWord[] => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return [];
    return lesson.wordIds.map(id => activeWords.find(w => w.id === id)).filter(Boolean) as VocabWord[];
  }, [lessons, activeWords]);

  const wordsByCategory = useCallback((categoryId: string): VocabWord[] => {
    const catLessons = lessons.filter(l => l.categoryId === categoryId && l.status === 'published');
    const wordIds = new Set(catLessons.flatMap(l => l.wordIds));
    return activeWords.filter(w => wordIds.has(w.id));
  }, [lessons, activeWords]);

  const getQuestionsForLesson = useCallback((lessonId: string): QuizQuestion[] =>
    quizQuestions.filter(q => q.lessonId === lessonId), [quizQuestions]);

  // ── Progress mutations ────────────────────────────────────────────────────
  const upsertProgress = useCallback((wordId: string, updates: Partial<VocabProgress>) => {
    setProgress(prev => {
      const idx = prev.findIndex(p => p.userId === userId && p.wordId === wordId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], ...updates };
        return updated;
      }
      const newEntry: VocabProgress = {
        id: `${userId}_${wordId}`,
        userId, wordId, status: 'new', selfAssessment: null,
        assignedDate: todayStr(), timesShown: 1, quizAttempts: 0, quizAccuracy: 0,
        revisionLevel: 0, revisionAttempts: 0, isBookmarked: false, isDifficult: false,
        ...updates,
      };
      return [...prev, newEntry];
    });
  }, [userId]);

  const markWordSelfAssessment = useCallback((wordId: string, _lessonId: string, assessment: SelfAssessment) => {
    if (assessment === 'i_know') {
      upsertProgress(wordId, {
        selfAssessment: 'i_know',
        status: 'mastered',
        masteredDate: todayStr(),
        timesShown: (getWordProgress(wordId)?.timesShown || 0) + 1
      });
      // Remove from revision queue since student already knows it well
      setRevisionEntries(prev => prev.filter(r => !(r.userId === userId && r.wordId === wordId)));
    } else if (assessment === 'need_revision') {
      upsertProgress(wordId, {
        selfAssessment: 'need_revision',
        status: 'learning',
        isDifficult: true,
        timesShown: (getWordProgress(wordId)?.timesShown || 0) + 1
      });
      // Add directly to revision queue scheduled for TOMORROW!
      const tomorrowStr = addDays(1);
      setRevisionEntries(prev => {
        const idx = prev.findIndex(r => r.userId === userId && r.wordId === wordId);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = { ...updated[idx], level: 1, nextRevisionDate: tomorrowStr };
          return updated;
        }
        return [...prev, {
          id: `rev_${userId}_${wordId}`,
          userId,
          wordId,
          level: 1,
          nextRevisionDate: tomorrowStr,
          accuracy: 0,
          attempts: 1
        }];
      });
    }
  }, [upsertProgress, getWordProgress, userId]);

  const markBookmark = useCallback((wordId: string) => {
    const cur = getWordProgress(wordId);
    upsertProgress(wordId, { isBookmarked: !cur?.isBookmarked });
  }, [upsertProgress, getWordProgress]);

  const markDifficult = useCallback((wordId: string) => {
    const cur = getWordProgress(wordId);
    upsertProgress(wordId, { isDifficult: !cur?.isDifficult });
  }, [upsertProgress, getWordProgress]);

  // ── 4-Case Decision Logic ────────────────────────────────────────────────
  const upsertRevision = useCallback((wordId: string, level: number) => {
    const days = REVISION_SCHEDULE[Math.min(level, 5)];
    const nextDate = addDays(days);
    setRevisionEntries(prev => {
      const idx = prev.findIndex(r => r.userId === userId && r.wordId === wordId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], level, nextRevisionDate: nextDate, attempts: updated[idx].attempts + 1 };
        return updated;
      }
      return [...prev, {
        id: `rev_${userId}_${wordId}`, userId, wordId, level,
        nextRevisionDate: nextDate, accuracy: 0, attempts: 1,
      }];
    });
  }, [userId]);

  const applyDecisionLogic = useCallback((wordId: string, selfAssessment: SelfAssessment, quizCorrect: boolean) => {
    if (selfAssessment === 'i_know' && quizCorrect) {
      // MASTERED — no revision
      upsertProgress(wordId, { status: 'mastered', masteredDate: todayStr() });
      setRevisionEntries(prev => prev.filter(r => !(r.userId === userId && r.wordId === wordId)));
    } else if (selfAssessment === 'i_know' && !quizCorrect) {
      // LEARNING — add to revision level 1
      upsertProgress(wordId, { status: 'learning' });
      upsertRevision(wordId, 1);
    } else if (selfAssessment === 'need_revision' && !quizCorrect) {
      // LEARNING — keep in revision (or add at level 1 if not present)
      upsertProgress(wordId, { status: 'learning' });
      const existing = revisionEntries.find(r => r.userId === userId && r.wordId === wordId);
      upsertRevision(wordId, existing ? existing.level : 1);
    } else if (selfAssessment === 'need_revision' && quizCorrect) {
      // LEARNED — keep in revision, advance level
      const existing = revisionEntries.find(r => r.userId === userId && r.wordId === wordId);
      const newLevel = existing ? Math.min(existing.level + 1, 5) : 1;
      upsertProgress(wordId, { status: 'learned', learnedDate: todayStr() });
      upsertRevision(wordId, newLevel);
    }
  }, [upsertProgress, upsertRevision, userId, revisionEntries]);

  const advanceRevisionLevel = useCallback((wordId: string) => {
    const entry = revisionEntries.find(r => r.userId === userId && r.wordId === wordId);
    if (!entry) return;
    if (entry.level >= 5) {
      // Mastered after all revision levels
      upsertProgress(wordId, { status: 'mastered', masteredDate: todayStr() });
      setRevisionEntries(prev => prev.filter(r => !(r.userId === userId && r.wordId === wordId)));
    } else {
      upsertRevision(wordId, entry.level + 1);
      setRevisionEntries(prev => prev.map(r =>
        r.userId === userId && r.wordId === wordId
          ? { ...r, lastRevisedDate: todayStr(), accuracy: Math.min(r.accuracy + 10, 100) }
          : r
      ));
    }
  }, [revisionEntries, userId, upsertProgress, upsertRevision]);

  // ── Lesson phase tracking ─────────────────────────────────────────────────
  const updateLessonPhase = useCallback((lessonId: string, phase: LessonPhase, scores?: { flashcards?: number; spelling?: number; quiz?: number; quizTotal?: number }) => {
    setLessonProgressList(prev => {
      const idx = prev.findIndex(lp => lp.userId === userId && lp.lessonId === lessonId);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = {
          ...updated[idx], phase,
          ...(phase === 'completed' ? { completedAt: new Date().toISOString() } : {}),
          ...(scores?.flashcards !== undefined ? { flashcardsScore: scores.flashcards } : {}),
          ...(scores?.spelling !== undefined ? { spellingScore: scores.spelling } : {}),
          ...(scores?.quiz !== undefined ? { quizScore: scores.quiz } : {}),
          ...(scores?.quizTotal !== undefined ? { quizTotal: scores.quizTotal } : {}),
        };
        return updated;
      }
      return [...prev, {
        id: `lp_${userId}_${lessonId}`, userId, lessonId, phase,
        startedAt: new Date().toISOString(),
        flashcardsScore: 0, spellingScore: 0, quizScore: 0, quizTotal: 0,
        timeSpentSeconds: 0, selfAssessments: {},
      }];
    });
  }, [userId]);

  // ── Quiz attempt recording ─────────────────────────────────────────────────
  const recordQuizAttempt = useCallback((wordId: string, selected: string, correct: string, lessonId?: string): boolean => {
    const isCorrect = selected === correct;
    const attempt: QuizAttempt = {
      id: `${Date.now()}_${Math.random()}`, userId, wordId, lessonId,
      selectedOption: selected, correctOption: correct,
      isCorrect, attemptDate: new Date().toISOString(),
    };
    setQuizAttemptsList(prev => [...prev, attempt]);
    return isCorrect;
  }, [userId]);

  // ── Legacy support ─────────────────────────────────────────────────────────
  const markWord = useCallback((wordId: string, status: WordStatus) => {
    upsertProgress(wordId, { status });
  }, [upsertProgress]);

  // ── Admin: Words ──────────────────────────────────────────────────────────
  const addWord = useCallback((word: Omit<VocabWord, 'id' | 'createdAt'>) => {
    const newWord: VocabWord = { ...word, id: `w${Date.now()}`, createdAt: new Date().toISOString() };
    setWords(prev => [...prev, newWord]);
    return newWord;
  }, []);

  const updateWord = useCallback((id: string, updates: Partial<VocabWord>) => {
    setWords(prev => prev.map(w => w.id === id ? { ...w, ...updates } : w));
  }, []);

  const deleteWord = useCallback((id: string) => {
    setWords(prev => prev.filter(w => w.id !== id));
  }, []);

  const approveWord = useCallback((id: string) => {
    updateWord(id, { contentStatus: 'approved' });
  }, [updateWord]);

  const rejectWord = useCallback((id: string, reason: string) => {
    updateWord(id, { contentStatus: 'rejected', rejectionReason: reason });
  }, [updateWord]);

  // ── Admin: Categories ─────────────────────────────────────────────────────
  const addCategory = useCallback((cat: Omit<VocabCategory, 'id' | 'createdAt'>) => {
    const newCat: VocabCategory = { ...cat, id: `cat${Date.now()}`, createdAt: new Date().toISOString() };
    setCategories(prev => [...prev, newCat]);
    return newCat;
  }, []);

  const updateCategory = useCallback((id: string, updates: Partial<VocabCategory>) => {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteCategory = useCallback((id: string) => {
    setCategories(prev => prev.filter(c => c.id !== id));
  }, []);

  // ── Admin: Lessons ────────────────────────────────────────────────────────
  const addLesson = useCallback((lesson: Omit<VocabLesson, 'id' | 'createdAt'>) => {
    const newLesson: VocabLesson = { ...lesson, id: `l${Date.now()}`, createdAt: new Date().toISOString() };
    setLessons(prev => [...prev, newLesson]);
    return newLesson;
  }, []);

  const updateLesson = useCallback((id: string, updates: Partial<VocabLesson>) => {
    setLessons(prev => prev.map(l => l.id === id ? { ...l, ...updates } : l));
  }, []);

  const deleteLesson = useCallback((id: string) => {
    setLessons(prev => prev.filter(l => l.id !== id));
  }, []);

  // ── Admin: Quiz Questions ─────────────────────────────────────────────────
  const addQuizQuestion = useCallback((q: Omit<QuizQuestion, 'id'>) => {
    const newQ: QuizQuestion = { ...q, id: `q${Date.now()}` };
    setQuizQuestions(prev => [...prev, newQ]);
    return newQ;
  }, []);

  const updateQuizQuestion = useCallback((id: string, updates: Partial<QuizQuestion>) => {
    setQuizQuestions(prev => prev.map(q => q.id === id ? { ...q, ...updates } : q));
  }, []);

  const deleteQuizQuestion = useCallback((id: string) => {
    setQuizQuestions(prev => prev.filter(q => q.id !== id));
  }, []);

  const getWordsForRole = useCallback((role: 'super-admin' | 'employee', empId?: string) => {
    if (role === 'super-admin') return words;
    return words.filter(w => w.uploadedBy === (empId || userId));
  }, [words, userId]);

  // Word groups
  const wordsByDate = useMemo(() => {
    const map: Record<string, VocabWord[]> = {};
    userProgress.forEach(p => {
      const word = activeWords.find(w => w.id === p.wordId);
      if (word) {
        if (!map[p.assignedDate]) map[p.assignedDate] = [];
        if (!map[p.assignedDate].find(w => w.id === word.id)) map[p.assignedDate].push(word);
      }
    });
    return map;
  }, [activeWords, userProgress]);

  const wordsBySituation = useMemo(() => {
    const map: Record<SituationCategory, VocabWord[]> = { interview: [], essay: [], business: [], daily: [], exam: [] };
    activeWords.forEach(w => { if (map[w.situation]) map[w.situation].push(w); });
    return map;
  }, [activeWords]);

  // ── Admin: Bulk Word Import ───────────────────────────────────────────────
  const bulkAddWords = useCallback((newWords: Omit<VocabWord, 'id' | 'createdAt'>[], lessonId?: string) => {
    const added: VocabWord[] = [];
    setWords(prev => {
      const updated = [...prev];
      newWords.forEach(w => {
        const newWord: VocabWord = { ...w, id: `w${Date.now()}_${Math.random().toString(36).slice(2)}`, createdAt: new Date().toISOString() };
        updated.push(newWord);
        added.push(newWord);
      });
      return updated;
    });
    if (lessonId) {
      setTimeout(() => {
        setLessons(prev => prev.map(l =>
          l.id === lessonId ? { ...l, wordIds: [...l.wordIds, ...added.map(w => w.id)] } : l
        ));
      }, 50);
    }
    return added;
  }, []);

  // ── Admin: Auto-generate quiz questions for a word ─────────────────────────
  const autoGenerateQuizForWord = useCallback((word: VocabWord, lessonId: string, types: string[] = ['mcq', 'synonym', 'antonym', 'fill_blank', 'spelling', 'missing_letter']) => {
    const generated: QuizQuestion[] = [];
    const allWords = words.filter(w => w.id !== word.id && w.contentStatus === 'approved');
    const distractors = allWords.sort(() => Math.random() - 0.5).slice(0, 3);

    if (types.includes('mcq') && distractors.length >= 3) {
      const opts = [word.meaning, ...distractors.map(d => d.meaning)].sort(() => Math.random() - 0.5);
      generated.push({
        id: `q${Date.now()}_mcq_${word.id}`, lessonId, wordId: word.id,
        type: 'mcq', difficulty: word.difficulty, marks: 1,
        question: `What is the correct meaning of "${word.word}"?`,
        options: opts, correctAnswer: word.meaning,
        explanation: `${word.word} means: ${word.meaning}`,
      });
    }
    if (types.includes('synonym') && word.synonyms && word.synonyms.length >= 1 && distractors.length >= 3) {
      const correct = word.synonyms[0];
      const wrong = distractors.flatMap(d => d.synonyms || [d.word]).slice(0, 3);
      const opts = [correct, ...wrong].sort(() => Math.random() - 0.5);
      generated.push({
        id: `q${Date.now()}_syn_${word.id}`, lessonId, wordId: word.id,
        type: 'synonym', difficulty: word.difficulty, marks: 1,
        question: `Choose the correct SYNONYM of "${word.word}":`,
        options: opts.slice(0, 4), correctAnswer: correct,
        explanation: `A synonym of ${word.word} is ${correct}.`,
      });
    }
    if (types.includes('antonym') && word.antonyms && word.antonyms.length >= 1 && distractors.length >= 3) {
      const correct = word.antonyms[0];
      const wrong = distractors.flatMap(d => d.antonyms || [d.word]).slice(0, 3);
      const opts = [correct, ...wrong].sort(() => Math.random() - 0.5);
      generated.push({
        id: `q${Date.now()}_ant_${word.id}`, lessonId, wordId: word.id,
        type: 'antonym', difficulty: word.difficulty, marks: 1,
        question: `Choose the correct ANTONYM of "${word.word}":`,
        options: opts.slice(0, 4), correctAnswer: correct,
        explanation: `An antonym of ${word.word} is ${correct}.`,
      });
    }
    if (types.includes('fill_blank') && word.example) {
      const blank = word.example.replace(new RegExp(word.word, 'gi'), '______');
      const wrongWords = distractors.map(d => d.word);
      const opts = [word.word, ...wrongWords.slice(0, 3)].sort(() => Math.random() - 0.5);
      generated.push({
        id: `q${Date.now()}_fill_${word.id}`, lessonId, wordId: word.id,
        type: 'fill_blank', difficulty: word.difficulty, marks: 1,
        question: `Fill in the blank: "${blank}"`,
        options: opts.slice(0, 4), correctAnswer: word.word,
        explanation: `The correct word is "${word.word}": ${word.meaning}`,
      });
    }
    if (types.includes('spelling')) {
      const wrongSpellings = [
        word.word.replace(/[aeiou]/, 'a'), 
        word.word.replace(/(.)\1/, '$1'), 
        word.word + 'e'
      ].filter(w => w !== word.word).map(w => w.toLowerCase());
      
      const opts = [word.word, ...wrongSpellings.slice(0, 3)].sort(() => Math.random() - 0.5);
      generated.push({
        id: `q${Date.now()}_spell_${word.id}`, lessonId, wordId: word.id,
        type: 'spelling', difficulty: word.difficulty, marks: 1,
        question: `Which is the correct spelling?`,
        options: opts, correctAnswer: word.word,
        explanation: `The correct spelling is "${word.word}".`,
      });
    }
    if (types.includes('missing_letter')) {
      // Remove 1-2 random letters from the word
      let blanked = word.word;
      const removeCount = Math.max(1, Math.floor(word.word.length / 4));
      for (let i = 0; i < removeCount; i++) {
        const idx = Math.floor(Math.random() * blanked.length);
        blanked = blanked.substring(0, idx) + '_' + blanked.substring(idx + 1);
      }
      
      const opts = [word.word, distractors[0]?.word || '', distractors[1]?.word || '', distractors[2]?.word || ''].filter(Boolean).sort(() => Math.random() - 0.5);
      generated.push({
        id: `q${Date.now()}_missing_${word.id}`, lessonId, wordId: word.id,
        type: 'missing_letter', difficulty: word.difficulty, marks: 1,
        question: `Fill in the missing letters: ${blanked}`,
        options: opts, correctAnswer: word.word,
        explanation: `The complete word is "${word.word}".`,
      });
    }
    if (generated.length > 0) {
      setQuizQuestions(prev => [...prev, ...generated]);
    }
    return generated;
  }, [words]);

  return {
    // Student
    activeWords,
    todayWords,
    stats,
    vocabStreak,
    categories,
    lessons,
    userProgress,
    lessonProgress,
    revisionQueue,
    allRevisionEntries,
    quizAttempts: quizAttemptsList.filter(a => a.userId === userId),
    wordsByDate,
    wordsBySituation,
    getWordProgress,
    getLessonProgress,
    lessonWords,
    wordsByCategory,
    getQuestionsForLesson,
    markWordSelfAssessment,
    applyDecisionLogic,
    updateLessonPhase,
    markBookmark,
    markDifficult,
    advanceRevisionLevel,
    recordQuizAttempt,
    markWord,
    // Admin
    words,
    quizQuestions,
    addWord, updateWord, deleteWord, approveWord, rejectWord,
    addCategory, updateCategory, deleteCategory,
    addLesson, updateLesson, deleteLesson,
    addQuizQuestion, updateQuizQuestion, deleteQuizQuestion,
    bulkAddWords,
    autoGenerateQuizForWord,
    getWordsForRole,
  };
}
