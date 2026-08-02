// ─── Grammar Hub Data Layer ───────────────────────────────────────────────────
// Complete 30-topic curriculum: 8 levels, real quiz questions, visual examples

export interface QuizQuestion {
  question: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
  explanation: string;
}

export interface VisualExample {
  emoji: string;
  label: string;
  sentence: string;
}

export interface CommonMistake {
  wrong: string;
  correct: string;
  tip: string;
}

export interface PracticeItem {
  instruction: string;
  sentence: string;
  answer: string;
}

export interface GrammarTopic {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  levelId: string;
  difficulty: 1 | 2 | 3;
  timeMinutes: number;
  xpReward: number;
  definition: string;
  simpleExplanation: string;
  visualExamples: VisualExample[];
  memoryTrick: string;
  commonMistakes: CommonMistake[];
  practiceItems: PracticeItem[];
  quiz: QuizQuestion[];
  revisionPoints: string[];
}

export interface GrammarModule {
  id: string;
  title: string;
  description: string;
  topicIds: string[];
  order: number;
}

export interface GrammarLevel {
  id: string;
  number: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
  gradient: string;
  bgColor: string;
  minProgress: number; // 0–100 overall progress to unlock
  modules: GrammarModule[];
  badge: string;
  badgeIcon: string;
}

// ─── Topics ──────────────────────────────────────────────────────────────────

export const grammarTopics: GrammarTopic[] = [

  // ── LEVEL 1: English Basics ─────────────────────────────────────────────
  {
    id: 'intro-english',
    title: 'What is English?',
    subtitle: 'Understanding language',
    emoji: '🌍',
    levelId: 'level-1',
    difficulty: 1,
    timeMinutes: 5,
    xpReward: 50,
    definition: 'English is a global language used to communicate ideas, feelings, and information through words and sentences.',
    simpleExplanation: 'English is a tool — like a paintbrush for your thoughts. When you speak or write in English, you are painting pictures with words. Every word you learn is a new colour added to your palette.',
    visualExamples: [
      { emoji: '🗣️', label: 'Speaking', sentence: 'We say words out loud to talk.' },
      { emoji: '✍️', label: 'Writing', sentence: 'We write words on paper or a screen.' },
      { emoji: '📖', label: 'Reading', sentence: 'We read words to understand ideas.' },
      { emoji: '👂', label: 'Listening', sentence: 'We listen to words to learn.' },
    ],
    memoryTrick: 'Think of English as SWRL — Speaking, Writing, Reading, Listening. These are the 4 pillars of any language.',
    commonMistakes: [
      { wrong: 'English is just for exams.', correct: 'English is a living skill used every day.', tip: 'Practice English in real life — read news, watch videos.' },
      { wrong: 'I need to be perfect from day one.', correct: 'Mistakes are how we learn.', tip: 'Every expert was once a beginner.' },
    ],
    practiceItems: [
      { instruction: 'Name one thing you can do in English:', sentence: 'I can ________ in English.', answer: 'read / write / speak / listen' },
      { instruction: 'Complete the sentence:', sentence: 'English has ______ main skills.', answer: '4' },
    ],
    quiz: [
      { question: 'Which of these is NOT a skill of English?', options: ['Speaking', 'Dreaming', 'Reading', 'Writing'], correctIndex: 1, explanation: 'The 4 skills of English are Speaking, Listening, Reading, and Writing.' },
      { question: 'What do we use language for?', options: ['Only exams', 'Cooking food', 'Communicating ideas', 'Building houses'], correctIndex: 2, explanation: 'Language is used to communicate ideas, feelings, and information.' },
      { question: 'Which skill do we use when watching a video?', options: ['Writing', 'Listening', 'Reading', 'Speaking'], correctIndex: 1, explanation: 'When we watch a video without subtitles, we use our Listening skill.' },
      { question: 'How many main language skills are there in English?', options: ['2', '3', '4', '5'], correctIndex: 2, explanation: 'There are 4 main skills: Speaking, Listening, Reading, and Writing.' },
      { question: 'The best way to improve English is to:', options: ['Only study grammar rules', 'Practise every day', 'Memorise the dictionary', 'Avoid making mistakes'], correctIndex: 1, explanation: 'Daily practice across all 4 skills is the fastest way to improve.' },
    ],
    revisionPoints: ['English has 4 skills: Speaking, Listening, Reading, Writing.', 'Language is a tool for communication.', 'Practice every day — mistakes are part of learning.'],
  },

  {
    id: 'alphabet-words',
    title: 'Alphabet & Words',
    subtitle: 'The building blocks',
    emoji: '🔤',
    levelId: 'level-1',
    difficulty: 1,
    timeMinutes: 6,
    xpReward: 60,
    definition: 'The English alphabet has 26 letters. Words are formed by combining these letters. Words are the smallest meaningful units of language.',
    simpleExplanation: 'Think of letters as LEGO pieces. Alone, one piece does not do much. But when you combine them — you build something amazing! The word "SUN" uses 3 letters, just like 3 LEGO bricks make a small shape.',
    visualExamples: [
      { emoji: '🐱', label: 'C-A-T', sentence: 'Three letters make a word: C + A + T = CAT' },
      { emoji: '🏠', label: 'H-O-U-S-E', sentence: 'Five letters: H + O + U + S + E = HOUSE' },
      { emoji: '🌟', label: 'S-T-A-R', sentence: 'Four letters: S + T + A + R = STAR' },
    ],
    memoryTrick: 'Letters → Words → Sentences → Paragraphs. It is a staircase. You cannot skip a step!',
    commonMistakes: [
      { wrong: 'Confusing B and D', correct: 'b has a bump on the right, d has a bump on the left', tip: 'Make a "bed" shape with your hands — left fist is b, right fist is d.' },
      { wrong: 'Confusing p and q', correct: 'p faces right, q faces left', tip: 'Imagine p is a person facing right, q is facing left.' },
    ],
    practiceItems: [
      { instruction: 'How many letters in "BOOK"?', sentence: 'B-O-O-K has ______ letters.', answer: '4' },
      { instruction: 'Arrange: A, T, C', sentence: 'The word is: ______', answer: 'CAT or ACT' },
    ],
    quiz: [
      { question: 'How many letters are in the English alphabet?', options: ['24', '25', '26', '27'], correctIndex: 2, explanation: 'The English alphabet has exactly 26 letters, from A to Z.' },
      { question: 'What do we call the letters A, E, I, O, U?', options: ['Consonants', 'Vowels', 'Nouns', 'Articles'], correctIndex: 1, explanation: 'A, E, I, O, U are called vowels. All other letters are consonants.' },
      { question: 'How many vowels are in the English alphabet?', options: ['3', '4', '5', '6'], correctIndex: 2, explanation: 'There are 5 vowels: A, E, I, O, U.' },
      { question: 'Which of these is a word?', options: ['XQZP', 'CAT', 'BVDK', 'ZZTT'], correctIndex: 1, explanation: 'CAT is a real English word with a meaning.' },
      { question: 'Words are made up of:', options: ['Numbers', 'Letters', 'Sentences', 'Paragraphs'], correctIndex: 1, explanation: 'Words are formed by combining letters of the alphabet.' },
    ],
    revisionPoints: ['26 letters in the English alphabet.', '5 vowels: A, E, I, O, U. Rest are consonants.', 'Words = letters combined in meaningful order.'],
  },

  // ── LEVEL 2: Parts of Speech ────────────────────────────────────────────
  {
    id: 'noun',
    title: 'Noun',
    subtitle: 'The name of everything',
    emoji: '🏷️',
    levelId: 'level-2',
    difficulty: 1,
    timeMinutes: 8,
    xpReward: 75,
    definition: 'A noun is the name of a person, place, animal, or thing.',
    simpleExplanation: 'Look around you right now. Everything you can see, touch, or name — that is a noun! Your phone is a noun. The room you are sitting in is a noun. Even YOU are a noun (a person). Nouns are the labels of the world.',
    visualExamples: [
      { emoji: '👨', label: 'Person', sentence: 'Ravi is a student.' },
      { emoji: '🏫', label: 'Place', sentence: 'Delhi is a big city.' },
      { emoji: '🐶', label: 'Animal', sentence: 'The dog is barking.' },
      { emoji: '📦', label: 'Thing', sentence: 'The box is heavy.' },
      { emoji: '💡', label: 'Idea', sentence: 'Kindness is important.' },
    ],
    memoryTrick: 'Remember PPAT: Person, Place, Animal, Thing. If it fits one of these — it\'s a noun!',
    commonMistakes: [
      { wrong: 'Running is a verb.', correct: 'Running can be a noun too! (Running is fun.)', tip: 'A noun can look like a verb if it names an activity — e.g., Swimming is my hobby.' },
      { wrong: 'Abstract things are not nouns.', correct: 'Love, hope, fear, kindness are all nouns.', tip: 'Nouns include ideas and feelings too — called abstract nouns.' },
    ],
    practiceItems: [
      { instruction: 'Find the noun:', sentence: 'The teacher wrote on the board.', answer: 'teacher, board' },
      { instruction: 'Is "happiness" a noun?', sentence: 'Happiness is a _______.', answer: 'noun (abstract noun)' },
      { instruction: 'Find all nouns:', sentence: 'Priya and Raj visited Agra yesterday.', answer: 'Priya, Raj, Agra' },
    ],
    quiz: [
      { question: 'Which of these is a noun?', options: ['Run', 'Beautiful', 'Table', 'Quickly'], correctIndex: 2, explanation: '"Table" is a thing — so it is a noun. Run is a verb, Beautiful is an adjective, Quickly is an adverb.' },
      { question: '"Honesty is the best policy." — What kind of noun is "honesty"?', options: ['Common noun', 'Proper noun', 'Abstract noun', 'Collective noun'], correctIndex: 2, explanation: 'Honesty is a feeling/quality we cannot see or touch — it is an abstract noun.' },
      { question: 'Which is a proper noun?', options: ['city', 'river', 'Ganga', 'mountain'], correctIndex: 2, explanation: 'Ganga is the specific name of a river — proper nouns are always capitalised.' },
      { question: '"A flock of birds flew over." — "Flock" is a:', options: ['Abstract noun', 'Proper noun', 'Collective noun', 'Common noun'], correctIndex: 2, explanation: 'Flock is a collective noun — it names a group of birds.' },
      { question: 'How many nouns are in: "The boy kicked the ball."', options: ['1', '2', '3', '4'], correctIndex: 1, explanation: 'Boy and ball are the two nouns in this sentence.' },
    ],
    revisionPoints: ['Noun = name of Person, Place, Animal, Thing, or Idea.', 'Types: Common, Proper, Abstract, Collective, Material.', 'Proper nouns are always capitalised.'],
  },

  {
    id: 'pronoun',
    title: 'Pronoun',
    subtitle: 'The noun\'s stand-in',
    emoji: '🎭',
    levelId: 'level-2',
    difficulty: 1,
    timeMinutes: 8,
    xpReward: 75,
    definition: 'A pronoun is a word that is used in place of a noun to avoid repetition.',
    simpleExplanation: 'Imagine you have a friend named Arnav. You would not say "Arnav went to school. Arnav ate lunch. Arnav played cricket." That sounds robotic! Instead you say "Arnav went to school. He ate lunch. He played cricket." The word "He" stands in for "Arnav" — that is a pronoun.',
    visualExamples: [
      { emoji: '👦', label: 'He', sentence: 'Rohit is here. He is my friend.' },
      { emoji: '👧', label: 'She', sentence: 'Sita sings well. She won the prize.' },
      { emoji: '📱', label: 'It', sentence: 'The phone is new. It costs ₹10,000.' },
      { emoji: '👥', label: 'They', sentence: 'Ram and Shyam came. They are brothers.' },
    ],
    memoryTrick: 'Pronouns are SUBSTITUTES — like a substitute teacher who replaces the main teacher. I, You, He, She, It, We, They are the most common ones.',
    commonMistakes: [
      { wrong: 'Me and Ravi went to school.', correct: 'Ravi and I went to school.', tip: 'When you are the subject, use "I" not "me". Remove the other person and test: "Me went to school" ❌ "I went to school" ✓' },
      { wrong: 'The team lost their match.', correct: 'The team lost its match.', tip: '"Team" is singular — use "its", not "their".' },
    ],
    practiceItems: [
      { instruction: 'Replace the noun with a pronoun:', sentence: 'Priya is a doctor. _______ works in a hospital.', answer: 'She' },
      { instruction: 'Choose correct pronoun:', sentence: 'The dog wagged _______ tail.', answer: 'its' },
    ],
    quiz: [
      { question: 'Which word is a pronoun?', options: ['Run', 'They', 'Blue', 'Table'], correctIndex: 1, explanation: '"They" is a pronoun used to refer to more than one person or thing.' },
      { question: '"She is a doctor." — What noun does "She" replace?', options: ['A noun of place', 'A noun of person', 'A noun of thing', 'An abstract noun'], correctIndex: 1, explanation: '"She" replaces a female person — a noun of person.' },
      { question: 'Which sentence uses a pronoun correctly?', options: ['Me and him went out.', 'He and I went out.', 'I and him went out.', 'Him and me went out.'], correctIndex: 1, explanation: '"He and I" is correct. Subject pronouns (I, He, She, We, They) are used when the pronoun is the subject.' },
      { question: 'What type of pronoun is "myself"?', options: ['Personal pronoun', 'Reflexive pronoun', 'Demonstrative pronoun', 'Relative pronoun'], correctIndex: 1, explanation: '"Myself" is a reflexive pronoun — the action reflects back on the subject.' },
      { question: '"This is my book." — "This" is a:', options: ['Personal pronoun', 'Reflexive pronoun', 'Demonstrative pronoun', 'Interrogative pronoun'], correctIndex: 2, explanation: '"This" points to something nearby — it is a demonstrative pronoun.' },
    ],
    revisionPoints: ['Pronoun replaces a noun to avoid repetition.', 'Common pronouns: I, you, he, she, it, we, they.', 'Use subject pronouns (I, he, she) when the pronoun is the subject of the sentence.'],
  },

  {
    id: 'verb',
    title: 'Verb',
    subtitle: 'The action word',
    emoji: '⚡',
    levelId: 'level-2',
    difficulty: 1,
    timeMinutes: 8,
    xpReward: 75,
    definition: 'A verb is a word that shows action, state, or occurrence in a sentence.',
    simpleExplanation: 'Every sentence MUST have a verb. Think of a verb as the engine of a sentence. Without it, the sentence does not move! "John football" is incomplete. "John plays football" ✓ — the verb "plays" makes it a sentence.',
    visualExamples: [
      { emoji: '🏃', label: 'Action', sentence: 'She runs every morning.' },
      { emoji: '💭', label: 'State', sentence: 'He seems happy today.' },
      { emoji: '💤', label: 'Being', sentence: 'I am a student.' },
      { emoji: '⚽', label: 'Occurrence', sentence: 'It happened yesterday.' },
    ],
    memoryTrick: 'Ask yourself: "What is happening in the sentence?" The answer is the verb. Every sentence needs at least one verb — it\'s the heartbeat of a sentence!',
    commonMistakes: [
      { wrong: 'He go to school every day.', correct: 'He goes to school every day.', tip: 'With he/she/it in present tense, add -s or -es to the verb.' },
      { wrong: 'She is knowing the answer.', correct: 'She knows the answer.', tip: 'Stative verbs (know, understand, believe) are NOT used in continuous tenses.' },
    ],
    practiceItems: [
      { instruction: 'Find the verb:', sentence: 'The children laughed loudly.', answer: 'laughed' },
      { instruction: 'Add the correct verb form:', sentence: 'He _______ (go) to the market yesterday.', answer: 'went' },
    ],
    quiz: [
      { question: 'Which word is a verb?', options: ['Beautiful', 'Quickly', 'Jump', 'Happiness'], correctIndex: 2, explanation: '"Jump" is an action — it is a verb. Beautiful is an adjective, Quickly is an adverb, Happiness is a noun.' },
      { question: '"The sun rises in the east." — The verb is:', options: ['Sun', 'Rises', 'East', 'The'], correctIndex: 1, explanation: '"Rises" shows what the sun does — it is the verb (action/occurrence).' },
      { question: 'He _____ to school every day. (correct form)', options: ['go', 'going', 'goes', 'gone'], correctIndex: 2, explanation: 'With a singular third-person subject (He), we add -s to the verb in simple present tense: "goes".' },
      { question: 'Which is a stative verb (NOT used in continuous tense)?', options: ['Run', 'Eat', 'Know', 'Play'], correctIndex: 2, explanation: '"Know" is a stative verb. We say "I know" not "I am knowing".' },
      { question: '"She was singing a song." — The main verb is:', options: ['She', 'Was', 'Singing', 'Song'], correctIndex: 2, explanation: '"Singing" is the main verb (action). "Was" is the auxiliary (helping) verb.' },
    ],
    revisionPoints: ['Verb = action, state, or occurrence.', 'Every sentence must have a verb.', 'Add -s/-es with He/She/It in simple present tense.', 'Stative verbs (know, like, believe) are not used in continuous forms.'],
  },

  {
    id: 'adjective',
    title: 'Adjective',
    subtitle: 'The describing word',
    emoji: '🎨',
    levelId: 'level-2',
    difficulty: 1,
    timeMinutes: 7,
    xpReward: 70,
    definition: 'An adjective is a word that describes or modifies a noun or pronoun.',
    simpleExplanation: 'Imagine you buy a "ball" vs a "big, red, bouncy ball". The second is so much more interesting! The words big, red, bouncy are adjectives — they paint a picture of the noun. Without adjectives, language is boring and unclear.',
    visualExamples: [
      { emoji: '🍎', label: 'Red apple', sentence: 'She ate a red apple.' },
      { emoji: '🦁', label: 'Fierce lion', sentence: 'A fierce lion roared.' },
      { emoji: '🌊', label: 'Deep ocean', sentence: 'The ocean is very deep.' },
      { emoji: '📚', label: 'Heavy bag', sentence: 'He carried a heavy bag.' },
    ],
    memoryTrick: 'Adjectives answer three questions: WHAT KIND? (red, tall), HOW MANY? (three, few), WHICH ONE? (this, that). If a word answers these questions before a noun — it\'s an adjective!',
    commonMistakes: [
      { wrong: 'She is more taller than me.', correct: 'She is taller than me.', tip: 'Never use "more" with adjectives that already have -er (taller, bigger, smarter).' },
      { wrong: 'This is the most best day.', correct: 'This is the best day.', tip: '"Best" is already a superlative. Do not add "most" before it.' },
    ],
    practiceItems: [
      { instruction: 'Find the adjective:', sentence: 'The old man walked slowly.', answer: 'old' },
      { instruction: 'Add an adjective:', sentence: 'She wore a _______ dress.', answer: 'beautiful / red / new (any adjective)' },
    ],
    quiz: [
      { question: 'Which word is an adjective?', options: ['Swim', 'Sadly', 'Brave', 'London'], correctIndex: 2, explanation: '"Brave" describes a quality — it is an adjective. Swim is a verb, Sadly is an adverb, London is a noun.' },
      { question: '"The tall girl won the race." — The adjective is:', options: ['Girl', 'Won', 'Tall', 'Race'], correctIndex: 2, explanation: '"Tall" describes the noun "girl" — it is an adjective.' },
      { question: 'Which is the correct comparative form of "good"?', options: ['Gooder', 'More good', 'Better', 'Goodest'], correctIndex: 2, explanation: 'Good → Better → Best. "Better" is the comparative form of "good".' },
      { question: '"She is the most intelligent student." — "Most intelligent" is:', options: ['Comparative degree', 'Superlative degree', 'Positive degree', 'Absolute degree'], correctIndex: 1, explanation: '"Most intelligent" is the superlative degree — comparing one to all others.' },
      { question: 'An adjective modifies a:', options: ['Verb', 'Adverb', 'Noun or Pronoun', 'Preposition'], correctIndex: 2, explanation: 'Adjectives describe or modify nouns and pronouns.' },
    ],
    revisionPoints: ['Adjective describes a noun/pronoun.', 'Three questions: What kind? How many? Which one?', 'Degrees: Positive (tall), Comparative (taller), Superlative (tallest).', 'Never use "more" with -er adjectives.'],
  },

  {
    id: 'adverb',
    title: 'Adverb',
    subtitle: 'Modifies verbs, adjectives, adverbs',
    emoji: '🏎️',
    levelId: 'level-2',
    difficulty: 2,
    timeMinutes: 8,
    xpReward: 80,
    definition: 'An adverb is a word that modifies a verb, an adjective, or another adverb. It tells how, when, where, or to what extent.',
    simpleExplanation: 'If verbs are engines, adverbs are the speed dial! "She ran" is okay. "She ran quickly" is better — "quickly" is the adverb that tells us HOW she ran. Many adverbs end in -ly, but not all.',
    visualExamples: [
      { emoji: '🏃‍♀️', label: 'How?', sentence: 'She ran quickly. (quickly = adverb)' },
      { emoji: '📅', label: 'When?', sentence: 'He arrived yesterday. (yesterday = adverb)' },
      { emoji: '📍', label: 'Where?', sentence: 'Put the book here. (here = adverb)' },
      { emoji: '📊', label: 'To what extent?', sentence: 'She is very smart. (very = adverb)' },
    ],
    memoryTrick: 'WHEN WHERE HOW EXTENT — the 4 questions an adverb answers. Adverbs are the "detail providers" of a sentence.',
    commonMistakes: [
      { wrong: 'He runs fastly.', correct: 'He runs fast.', tip: '"Fast" is both an adjective and an adverb. There is no word "fastly".' },
      { wrong: 'She spoke very softly. (wrong order)', correct: 'She spoke very softly. (correct order)', tip: 'Place adverbs as close as possible to the word they modify.' },
    ],
    practiceItems: [
      { instruction: 'Find the adverb:', sentence: 'He spoke angrily at the meeting.', answer: 'angrily' },
      { instruction: 'Fill in with an adverb:', sentence: 'The child slept _______.', answer: 'soundly / peacefully / well' },
    ],
    quiz: [
      { question: 'Which word is an adverb?', options: ['Happy', 'Happily', 'Happiness', 'Happier'], correctIndex: 1, explanation: '"Happily" tells how someone does something — it is an adverb ending in -ly.' },
      { question: '"She sings beautifully." — The adverb modifies the:', options: ['Noun', 'Adjective', 'Verb', 'Pronoun'], correctIndex: 2, explanation: '"Beautifully" tells us HOW she sings — it modifies the verb "sings".' },
      { question: 'In "He is very tall", "very" modifies:', options: ['He (pronoun)', 'Is (verb)', 'Tall (adjective)', 'The whole sentence'], correctIndex: 2, explanation: '"Very" intensifies the adjective "tall" — it is an adverb modifying an adjective.' },
      { question: 'Which sentence is correct?', options: ['He runs fastly.', 'He runs fast.', 'He runs faster.', 'He runs fastest.'], correctIndex: 1, explanation: '"Fast" does not need -ly. "Fastly" is not a valid English word.' },
      { question: '"Yesterday, I went to the market." — "Yesterday" is an adverb of:', options: ['Manner', 'Place', 'Time', 'Degree'], correctIndex: 2, explanation: '"Yesterday" tells WHEN — it is an adverb of time.' },
    ],
    revisionPoints: ['Adverb modifies verb, adjective, or another adverb.', 'Answers: How? When? Where? To what extent?', 'Many adverbs end in -ly, but not all (fast, hard, well).'],
  },

  {
    id: 'preposition',
    title: 'Preposition',
    subtitle: 'Shows relationship',
    emoji: '🔗',
    levelId: 'level-2',
    difficulty: 2,
    timeMinutes: 8,
    xpReward: 80,
    definition: 'A preposition is a word that shows the relationship between a noun/pronoun and other words in a sentence.',
    simpleExplanation: 'Prepositions are the "GPS" of sentences. They tell you WHERE something is, WHEN it happens, or HOW it relates to something else. The cat is ON the table / UNDER the table / IN the box — the word that changes each time is the preposition.',
    visualExamples: [
      { emoji: '📦', label: 'In/On/Under', sentence: 'The book is on the table.' },
      { emoji: '🕐', label: 'At/In/On (time)', sentence: 'The exam is at 10 AM.' },
      { emoji: '🗺️', label: 'To/From/Near', sentence: 'She walked to the market.' },
      { emoji: '🤝', label: 'With/Without', sentence: 'He came with his friend.' },
    ],
    memoryTrick: 'A preposition is anything a squirrel can do to a tree: IN the tree, ON the tree, UNDER the tree, NEAR the tree, AROUND the tree... these are prepositions!',
    commonMistakes: [
      { wrong: 'She is good in cooking.', correct: 'She is good at cooking.', tip: 'Use "good at" (not "good in") for skills and activities.' },
      { wrong: 'He arrived to the station.', correct: 'He arrived at the station.', tip: 'Use "arrived at" for specific places, "arrived in" for cities/countries.' },
    ],
    practiceItems: [
      { instruction: 'Fill in the preposition:', sentence: 'The cat is _______ the box.', answer: 'in / on / under / near' },
      { instruction: 'Correct the error:', sentence: 'She is afraid from dogs.', answer: 'She is afraid of dogs.' },
    ],
    quiz: [
      { question: 'Which is a preposition?', options: ['Run', 'Beautiful', 'Above', 'Quickly'], correctIndex: 2, explanation: '"Above" shows the position/relationship of things — it is a preposition.' },
      { question: '"The bird flew over the river." — The preposition is:', options: ['Bird', 'Flew', 'Over', 'River'], correctIndex: 2, explanation: '"Over" shows the relationship between the bird and the river — it is a preposition.' },
      { question: 'She is good ___ English.', options: ['in', 'at', 'on', 'with'], correctIndex: 1, explanation: 'We say "good at" when talking about skills. Good at English / Good at cooking.' },
      { question: 'He arrived ___ the airport.', options: ['in', 'to', 'at', 'on'], correctIndex: 2, explanation: '"Arrived at" is used for specific locations like airports, stations, buildings.' },
      { question: 'I will meet you ___ Monday.', options: ['in', 'at', 'on', 'by'], correctIndex: 2, explanation: 'Use "on" with days of the week: on Monday, on Friday, on Sunday.' },
    ],
    revisionPoints: ['Preposition shows relationship between nouns/pronouns and other words.', 'Common prepositions: in, on, at, of, to, from, with, under, over, near.', 'Good at (skills), arrived at (places), on + days, in + months/years.'],
  },

  {
    id: 'conjunction',
    title: 'Conjunction',
    subtitle: 'The connector word',
    emoji: '🔄',
    levelId: 'level-2',
    difficulty: 2,
    timeMinutes: 7,
    xpReward: 70,
    definition: 'A conjunction is a word that joins words, phrases, or clauses together.',
    simpleExplanation: 'Conjunctions are the "glue" of sentences. Without them, we would speak in short choppy sentences: "I was tired. I finished my work." With conjunctions: "I was tired, but I finished my work." Much better!',
    visualExamples: [
      { emoji: '➕', label: 'And (addition)', sentence: 'Ram and Shyam are friends.' },
      { emoji: '⚡', label: 'But (contrast)', sentence: 'She is smart but lazy.' },
      { emoji: '🔀', label: 'Or (choice)', sentence: 'Do you want tea or coffee?' },
      { emoji: '↩️', label: 'Because (reason)', sentence: 'I stayed home because it rained.' },
    ],
    memoryTrick: 'Remember FANBOYS for coordinating conjunctions: For, And, Nor, But, Or, Yet, So. These connect equal ideas.',
    commonMistakes: [
      { wrong: 'Although he was tired, but he continued.', correct: 'Although he was tired, he continued.', tip: 'Never use "although" and "but" together — they both show contrast.' },
      { wrong: 'Neither Ram or Shyam came.', correct: 'Neither Ram nor Shyam came.', tip: '"Neither...nor" always go together. "Either...or" always go together.' },
    ],
    practiceItems: [
      { instruction: 'Fill in FANBOYS conjunction:', sentence: 'I wanted to go, _______ I was too tired.', answer: 'but' },
      { instruction: 'Correct the conjunction pair:', sentence: 'Neither he or she came.', answer: 'Neither he nor she came.' },
    ],
    quiz: [
      { question: 'Which word is a conjunction?', options: ['Slowly', 'Although', 'Beautiful', 'Table'], correctIndex: 1, explanation: '"Although" joins two clauses showing contrast — it is a subordinating conjunction.' },
      { question: 'FANBOYS stands for coordinating conjunctions. Which is NOT one?', options: ['For', 'And', 'Because', 'So'], correctIndex: 2, explanation: '"Because" is a subordinating conjunction, not part of FANBOYS.' },
      { question: 'She studied hard, ___ she failed the exam.', options: ['and', 'or', 'but', 'so'], correctIndex: 2, explanation: '"But" shows contrast — she studied hard, yet she failed.' },
      { question: 'Which pair is always used together?', options: ['Either...or', 'Both...nor', 'Neither...or', 'Either...nor'], correctIndex: 0, explanation: '"Either...or" and "Neither...nor" are the correct correlative pairs.' },
      { question: '"Although/But" — which sentence is CORRECT?', options: ['Although he ran, but he missed the bus.', 'Although he ran, he missed the bus.', 'But he ran, although he missed the bus.', 'He ran although but he missed the bus.'], correctIndex: 1, explanation: 'Never use "although" and "but" together. Use one or the other.' },
    ],
    revisionPoints: ['Conjunction joins words, phrases, or clauses.', 'FANBOYS: coordinating conjunctions (For, And, Nor, But, Or, Yet, So).', 'Never use although+but or since+so together.', 'Neither...nor / Either...or (always paired).'],
  },

  {
    id: 'article',
    title: 'Articles',
    subtitle: 'A, An, The',
    emoji: '📰',
    levelId: 'level-2',
    difficulty: 2,
    timeMinutes: 9,
    xpReward: 85,
    definition: 'Articles (A, An, The) are words placed before nouns to define them as specific or non-specific.',
    simpleExplanation: '"A" and "An" say "any one of these" — they introduce something new or non-specific. "The" says "that specific one" — it refers to something already known. "I saw a dog" (any dog) vs "I saw the dog" (you know which dog).',
    visualExamples: [
      { emoji: '🐕', label: 'A dog (any dog)', sentence: 'I want a dog as a pet.' },
      { emoji: '🐕', label: 'The dog (specific)', sentence: 'The dog in our street is friendly.' },
      { emoji: '🍎', label: 'An apple (starts with vowel sound)', sentence: 'She ate an apple.' },
      { emoji: '🌙', label: 'The moon (unique)', sentence: 'The moon is bright tonight.' },
    ],
    memoryTrick: 'A/An = first introduction. The = second mention (you both know it now). Unique things (sun, moon, earth) always use "the". Before vowel SOUNDS (not letters) use "an".',
    commonMistakes: [
      { wrong: 'She is an honest girl.', correct: 'She is an honest girl. ✓ (h is silent, starts with vowel sound "o")', tip: 'An honest → "honest" sounds like "onest" — vowel sound, so use "an".' },
      { wrong: 'He is a university student.', correct: 'He is a university student. ✓ (u sounds like "yu" — consonant sound)', tip: 'Use "a" before words starting with a consonant SOUND like "yu".' },
    ],
    practiceItems: [
      { instruction: 'Fill in a/an/the:', sentence: '_______ Taj Mahal is _______ beautiful monument.', answer: 'The, a' },
      { instruction: 'Fill in a/an:', sentence: 'She is _______ honest officer.', answer: 'an (h is silent)' },
    ],
    quiz: [
      { question: 'Which sentence uses articles correctly?', options: ['She is an doctor.', 'She is a doctor.', 'She is the doctor.', 'She is doctor.'], correctIndex: 1, explanation: '"Doctor" starts with a consonant sound (d), so we use "a doctor".' },
      { question: '"___ honest person always tells the truth." — Fill in the blank:', options: ['A', 'An', 'The', 'No article needed'], correctIndex: 1, explanation: '"Honest" starts with a silent H — the vowel sound is "o" — so use "an".' },
      { question: '"___ sun rises in the east." — Fill in the blank:', options: ['A', 'An', 'The', 'No article'], correctIndex: 2, explanation: '"The sun" — there is only one sun (unique), so we always use "the".' },
      { question: 'When is "The" used?', options: ['Before something mentioned for the first time', 'Before something specific or already known', 'Before singular countable nouns only', 'Before vowel sounds only'], correctIndex: 1, explanation: '"The" is a definite article used when the reader/listener already knows which specific thing is meant.' },
      { question: 'He is ___ European. (European sounds like "yu-ropean")', options: ['an', 'a', 'the', 'no article'], correctIndex: 1, explanation: '"European" begins with a consonant sound "yu" — so we use "a", not "an".' },
    ],
    revisionPoints: ['A = before consonant sounds (a book, a car)', 'An = before vowel sounds (an apple, an honest man)', 'The = specific, previously mentioned, or unique (the sun, the Taj Mahal)', 'Go by SOUND not spelling: a university (yu-sound), an hour (silent h)'],
  },

  // ── LEVEL 3: Sentence Structure ─────────────────────────────────────────
  {
    id: 'sentence-structure',
    title: 'Sentence Structure',
    subtitle: 'Subject + Verb + Object',
    emoji: '🏗️',
    levelId: 'level-3',
    difficulty: 2,
    timeMinutes: 9,
    xpReward: 90,
    definition: 'A sentence is a group of words that expresses a complete thought. Every sentence has a subject and a verb, and usually an object.',
    simpleExplanation: 'Think of a sentence as a mini-story: WHO did WHAT to WHOM. "John (WHO) plays (WHAT) football (WHOM/WHAT)." This SVO structure — Subject + Verb + Object — is the backbone of English sentences.',
    visualExamples: [
      { emoji: '👦', label: 'Subject (John)', sentence: 'John — the one doing the action.' },
      { emoji: '⚽', label: 'Verb (plays)', sentence: 'Plays — the action being done.' },
      { emoji: '🏆', label: 'Object (football)', sentence: 'Football — receives the action.' },
      { emoji: '✅', label: 'Complete sentence', sentence: 'John plays football.' },
    ],
    memoryTrick: 'SVO = Subject + Verb + Object. Always ask: WHO does WHAT to WHAT/WHOM? The answers give you the SVO pattern.',
    commonMistakes: [
      { wrong: 'Ran the boy fast.', correct: 'The boy ran fast.', tip: 'In English, the Subject usually comes first.' },
      { wrong: 'She not go to school.', correct: 'She does not go to school.', tip: 'Negatives need an auxiliary verb: do/does/did + not + main verb.' },
    ],
    practiceItems: [
      { instruction: 'Identify S, V, O:', sentence: 'The dog chased the cat.', answer: 'S=dog, V=chased, O=cat' },
      { instruction: 'Arrange into a sentence:', sentence: 'quickly / the / runs / horse', answer: 'The horse runs quickly.' },
    ],
    quiz: [
      { question: 'In "Birds eat worms." — what is the subject?', options: ['eat', 'worms', 'Birds', 'the'], correctIndex: 2, explanation: '"Birds" is the doer of the action — it is the subject.' },
      { question: 'Which is a complete sentence?', options: ['Running in the park.', 'The tall man.', 'She sings beautifully.', 'Because it rained.'], correctIndex: 2, explanation: '"She sings beautifully" has a subject (She) and a verb (sings) — it is a complete sentence.' },
      { question: 'In SVO, what does "O" stand for?', options: ['Order', 'Object', 'Origin', 'Other'], correctIndex: 1, explanation: 'SVO = Subject + Verb + Object. The Object receives the action of the verb.' },
      { question: '"The teacher explained the lesson." — The object is:', options: ['teacher', 'explained', 'the', 'lesson'], correctIndex: 3, explanation: '"Lesson" is what was explained — it is the object of the verb "explained".' },
      { question: 'Which sentence has the correct word order?', options: ['Slowly walked she home.', 'She walked slowly home.', 'Home walked slowly she.', 'Walked she slowly home.'], correctIndex: 1, explanation: 'English follows Subject + Verb + Object/Complement + Adverb order typically.' },
    ],
    revisionPoints: ['Sentence = Subject + Verb (+ Object/Complement).', 'Subject does the action. Object receives it.', 'A sentence must have at least a subject and a verb.', 'SVO is the standard English word order.'],
  },

  // ── LEVEL 4: Grammar Rules ───────────────────────────────────────────────
  {
    id: 'tenses',
    title: 'Tenses',
    subtitle: 'Time in grammar',
    emoji: '⏰',
    levelId: 'level-4',
    difficulty: 2,
    timeMinutes: 12,
    xpReward: 100,
    definition: 'Tense shows the TIME of an action — whether it happened in the past, is happening now (present), or will happen in the future.',
    simpleExplanation: 'Tense is a time machine for sentences! Each tense has 4 forms — Simple, Continuous, Perfect, Perfect Continuous — giving us 12 tenses total. But the most used are the Simple and Perfect forms.',
    visualExamples: [
      { emoji: '⬅️', label: 'Past', sentence: 'He played cricket yesterday.' },
      { emoji: '▶️', label: 'Present', sentence: 'He plays cricket now.' },
      { emoji: '➡️', label: 'Future', sentence: 'He will play cricket tomorrow.' },
      { emoji: '🔄', label: 'Continuous (ongoing)', sentence: 'He is playing cricket.' },
    ],
    memoryTrick: 'SPPC — Simple, Progressive (Continuous), Perfect, Perfect Continuous. 3 times × 4 forms = 12 tenses total. Master these and you master English time!',
    commonMistakes: [
      { wrong: 'I am knowing the answer.', correct: 'I know the answer.', tip: 'Stative verbs (know, believe, understand, see, have) are not used in continuous tense.' },
      { wrong: 'She has went to school.', correct: 'She has gone to school.', tip: '"Has/have/had" uses the Past Participle form. Go → went → gone.' },
    ],
    practiceItems: [
      { instruction: 'Identify the tense:', sentence: 'They have finished their work.', answer: 'Present Perfect' },
      { instruction: 'Fill in the correct tense:', sentence: 'She _______ (study) for 3 hours when he called. (Past Perfect Continuous)', answer: 'had been studying' },
    ],
    quiz: [
      { question: '"She has eaten the cake." — This is:', options: ['Simple Past', 'Present Perfect', 'Past Perfect', 'Present Continuous'], correctIndex: 1, explanation: '"Has eaten" = have/has + past participle = Present Perfect tense.' },
      { question: 'He _______ (work) since morning. (Correct form)', options: ['is working', 'has been working', 'was working', 'had worked'], correctIndex: 1, explanation: '"Since morning" = from a point in the past till now = Present Perfect Continuous: "has been working".' },
      { question: 'Which tense uses had + past participle?', options: ['Present Perfect', 'Past Perfect', 'Future Perfect', 'Past Continuous'], correctIndex: 1, explanation: 'Past Perfect = had + past participle. Example: She had left before I arrived.' },
      { question: '"I am cooking dinner." — The tense is:', options: ['Simple Present', 'Present Continuous', 'Present Perfect', 'Past Continuous'], correctIndex: 1, explanation: '"Am cooking" = is/am/are + verb-ing = Present Continuous (action happening right now).' },
      { question: 'Which word tells us to use Past Perfect?', options: ['Yesterday', 'Before/After/By the time', 'Since', 'Now'], correctIndex: 1, explanation: '"Before", "after", and "by the time" signal Past Perfect as the earlier of two past actions.' },
    ],
    revisionPoints: ['12 tenses: 3 times (Past/Present/Future) × 4 aspects (Simple/Continuous/Perfect/Perfect Continuous).', 'Present Perfect: have/has + past participle.', 'Past Perfect: had + past participle.', 'Stative verbs (know, understand) never used in continuous form.'],
  },

  {
    id: 'subject-verb-agreement',
    title: 'Subject-Verb Agreement',
    subtitle: 'They must match',
    emoji: '🤝',
    levelId: 'level-4',
    difficulty: 2,
    timeMinutes: 10,
    xpReward: 90,
    definition: 'Subject and verb must agree in number — singular subjects take singular verbs, plural subjects take plural verbs.',
    simpleExplanation: 'Think of subject and verb as a married couple — they must match! If the subject is singular, the verb must be singular. "The dog barks" ✓ not "The dog bark" ✗. This rule seems simple but gets tricky with collective nouns, indefinite pronouns, and compound subjects.',
    visualExamples: [
      { emoji: '👦', label: 'Singular → singular verb', sentence: 'The boy runs fast.' },
      { emoji: '👦👦', label: 'Plural → plural verb', sentence: 'The boys run fast.' },
      { emoji: '🏫', label: 'Collective noun (usually singular)', sentence: 'The committee has decided.' },
      { emoji: '👥', label: 'Either/Neither → nearest subject rule', sentence: 'Neither Ram nor his friends are ready.' },
    ],
    memoryTrick: 'EITHER/NEITHER → look at the NEAREST subject. ONE OF → singular verb. EACH/EVERY/EITHER/NEITHER → always singular.',
    commonMistakes: [
      { wrong: 'Each of the students have passed.', correct: 'Each of the students has passed.', tip: '"Each" is always singular — use "has", not "have".' },
      { wrong: 'The number of students are increasing.', correct: 'The number of students is increasing.', tip: '"The number of" = singular. "A number of" = plural.' },
    ],
    practiceItems: [
      { instruction: 'Choose the correct verb:', sentence: 'Neither the teacher nor the students _______ (was/were) present.', answer: 'were (nearest subject = students, plural)' },
      { instruction: 'Correct the error:', sentence: 'Every man and woman are responsible.', answer: 'Every man and woman is responsible. (every = singular)' },
    ],
    quiz: [
      { question: '"Each of the boys ___ good at cricket." — Fill in:', options: ['are', 'were', 'is', 'be'], correctIndex: 2, explanation: '"Each" always takes a singular verb — "is".' },
      { question: '"A number of students ___ absent." — Fill in:', options: ['is', 'was', 'are', 'has been'], correctIndex: 2, explanation: '"A number of" = many, so it takes a plural verb — "are".' },
      { question: '"Neither the manager nor the workers ___ happy." — Fill in:', options: ['is', 'was', 'are', 'has been'], correctIndex: 2, explanation: 'Neither...nor: verb agrees with the nearest subject ("workers" = plural) → "are".' },
      { question: '"The committee ___ reached a decision." — Fill in:', options: ['have', 'were', 'has', 'are'], correctIndex: 2, explanation: '"The committee" acts as one body (singular) → "has".' },
      { question: '"Five kilometres ___ a long distance to walk." — Fill in:', options: ['are', 'were', 'is', 'have been'], correctIndex: 2, explanation: 'Distances, amounts, and periods of time are treated as singular → "is".' },
    ],
    revisionPoints: ['Singular subject → singular verb; Plural subject → plural verb.', 'Each, Every, Either, Neither → always singular.', 'Neither...nor / Either...or → verb agrees with nearest subject.', 'The number of → singular; A number of → plural.'],
  },

  {
    id: 'modal-verbs',
    title: 'Modal Verbs',
    subtitle: 'Can, Could, Will, Would...',
    emoji: '🎯',
    levelId: 'level-4',
    difficulty: 2,
    timeMinutes: 10,
    xpReward: 90,
    definition: 'Modal verbs are auxiliary verbs that express ability, permission, possibility, obligation, or advice.',
    simpleExplanation: 'Modals add flavour to sentences! "I go to school" vs "I must go to school" vs "I should go to school" vs "I might go to school." The same action has very different meanings. Modals tell us the attitude or likelihood of the action.',
    visualExamples: [
      { emoji: '💪', label: 'Can/Could = Ability', sentence: 'She can speak three languages.' },
      { emoji: '🚦', label: 'May/Might = Permission/Possibility', sentence: 'You may leave early today.' },
      { emoji: '📋', label: 'Must/Should = Obligation/Advice', sentence: 'You must wear a seatbelt.' },
      { emoji: '🔮', label: 'Will/Would = Future/Polite request', sentence: 'Would you please help me?' },
    ],
    memoryTrick: 'CAMP PW: Can, Ability; May, Permission; Must, Obligation; Probably → Might; Polite → Would. Modal + base form of verb (no "to" after modals!)',
    commonMistakes: [
      { wrong: 'She can to swim.', correct: 'She can swim.', tip: 'Never use "to" after modal verbs. Can swim ✓ Can to swim ✗' },
      { wrong: 'He musted go.', correct: 'He had to go.', tip: 'Modal verbs never change form (no -ed, -s, -ing). "Must" → past = "had to".' },
    ],
    practiceItems: [
      { instruction: 'Choose the correct modal:', sentence: 'You _______ not eat in the classroom. (prohibition)', answer: 'must' },
      { instruction: 'Fill in modal (polite request):', sentence: '_______ you please open the window?', answer: 'Could / Would' },
    ],
    quiz: [
      { question: 'Which sentence is correct?', options: ['She can to drive.', 'She can drives.', 'She can drive.', 'She can driving.'], correctIndex: 2, explanation: 'Modal + base verb (no "to", no -s, no -ing). "She can drive" ✓' },
      { question: '"You ___ see a doctor." (advice) — Best modal:', options: ['must', 'should', 'will', 'can'], correctIndex: 1, explanation: '"Should" gives advice/recommendation. "Must" is stronger obligation.' },
      { question: '"He ___ be in the office — his car is outside." (deduction)', options: ['should', 'would', 'must', 'might'], correctIndex: 2, explanation: '"Must" shows logical certainty/deduction: "He must be there" = I\'m almost certain.' },
      { question: 'Past tense of "must" is:', options: ['musted', 'must have', 'had to', 'was must'], correctIndex: 2, explanation: 'Modal verbs don\'t have past forms. "Must" → past obligation = "had to".' },
      { question: '"May I come in?" — "May" here expresses:', options: ['Ability', 'Permission', 'Obligation', 'Probability'], correctIndex: 1, explanation: '"May" is used for formal permission — "May I come in?" asks for permission.' },
    ],
    revisionPoints: ['Modal + base verb (never "to", never -s, never -ing).', 'Can = ability, May = permission, Must = strong obligation, Should = advice.', 'Must → past = had to. Will → past = would.', 'Must for deduction (It must be true). Might for weak possibility.'],
  },

  // ── LEVEL 5: Paragraphs ──────────────────────────────────────────────────
  {
    id: 'voice',
    title: 'Active & Passive Voice',
    subtitle: 'Who does the action?',
    emoji: '🔀',
    levelId: 'level-5',
    difficulty: 3,
    timeMinutes: 12,
    xpReward: 110,
    definition: 'In Active Voice, the subject performs the action. In Passive Voice, the subject receives the action.',
    simpleExplanation: 'Active: "The chef cooked the meal." (Chef = doer, meal = receiver). Passive: "The meal was cooked by the chef." (Meal = now the subject, but it receives the action). Passive voice is used when the doer is unknown, unimportant, or deliberately hidden.',
    visualExamples: [
      { emoji: '👨‍🍳', label: 'Active', sentence: 'The chef (S) cooked (V) the meal (O).' },
      { emoji: '🍽️', label: 'Passive', sentence: 'The meal (S) was cooked by the chef.' },
      { emoji: '🔨', label: 'Active', sentence: 'They are building a new bridge.' },
      { emoji: '🌉', label: 'Passive', sentence: 'A new bridge is being built.' },
    ],
    memoryTrick: 'Passive formula: Object + be (correct tense) + past participle + (by + agent). The "be" verb changes with tense: is/are (present), was/were (past), will be (future).',
    commonMistakes: [
      { wrong: 'The letter was wrote by him.', correct: 'The letter was written by him.', tip: 'Passive uses PAST PARTICIPLE not simple past. Write → wrote (simple past) → written (past participle).' },
      { wrong: 'Active to Passive: He knows the answer → The answer is known to him', correct: 'The answer is known to him. ✓', tip: '"Know" changes "to" not "by" in passive: known to, not known by.' },
    ],
    practiceItems: [
      { instruction: 'Convert to Passive:', sentence: 'She is writing a novel.', answer: 'A novel is being written by her.' },
      { instruction: 'Convert to Active:', sentence: 'The cake was eaten by the children.', answer: 'The children ate the cake.' },
    ],
    quiz: [
      { question: '"The book was written by Shakespeare." — This is:', options: ['Active voice', 'Passive voice', 'Direct speech', 'Indirect speech'], correctIndex: 1, explanation: '"The book" receives the action (was written) — this is passive voice.' },
      { question: 'Convert to Passive: "She is reading a book."', options: ['A book is being read by her.', 'A book was read by her.', 'A book has been read by her.', 'A book will be read by her.'], correctIndex: 0, explanation: 'Present Continuous Active → is/are being + past participle Passive.' },
      { question: 'The passive of "They will complete the project" is:', options: ['The project will complete by them.', 'The project will be completed by them.', 'The project will been completed by them.', 'The project is completed by them.'], correctIndex: 1, explanation: 'Future Active → will be + past participle Passive.' },
      { question: '"The cake was ate by them." — What is wrong?', options: ['Should be "were" not "was"', '"ate" should be "eaten" (past participle)', 'Should be "from them" not "by them"', 'Nothing is wrong'], correctIndex: 1, explanation: 'Passive requires past participle. Eat → ate (simple past) → eaten (past participle). "Was eaten".' },
      { question: 'Passive voice is used when:', options: ['The subject is known and important', 'The doer is unknown or unimportant', 'We want to write shorter sentences', 'We talk about future events only'], correctIndex: 1, explanation: 'Passive is used when the doer (agent) is unknown, unimportant, or obvious from context.' },
    ],
    revisionPoints: ['Active: Subject does the action.', 'Passive: Object becomes subject; formula = be (correct tense) + past participle.', 'Never use simple past in passive — always use past participle.', 'Passive is used when the doer is unknown or unimportant.'],
  },

  {
    id: 'narration',
    title: 'Direct & Indirect Speech',
    subtitle: 'Reporting what was said',
    emoji: '💬',
    levelId: 'level-5',
    difficulty: 3,
    timeMinutes: 12,
    xpReward: 110,
    definition: 'Direct speech reports the exact words spoken. Indirect (reported) speech reports what was said without quoting the exact words.',
    simpleExplanation: 'Direct: Ram said, "I am happy." (exact words, in quotes). Indirect: Ram said that he was happy. (reported, tense shifts back, pronouns change). When changing to indirect speech, the tense goes one step back into the past.',
    visualExamples: [
      { emoji: '💭', label: 'Direct', sentence: 'She said, "I love this place."' },
      { emoji: '📝', label: 'Indirect', sentence: 'She said that she loved that place.' },
      { emoji: '❓', label: 'Direct question', sentence: 'He asked, "Are you ready?"' },
      { emoji: '📢', label: 'Indirect question', sentence: 'He asked if I was ready.' },
    ],
    memoryTrick: 'Tense backshift rule: Present → Past, Present Continuous → Past Continuous, Present Perfect → Past Perfect, Simple Past → Past Perfect. "Is" → "was", "will" → "would", "can" → "could".',
    commonMistakes: [
      { wrong: 'He said that he is tired.', correct: 'He said that he was tired.', tip: 'When reporting verb is past (said), tense shifts back. Is → was.' },
      { wrong: 'She asked that where he lives.', correct: 'She asked where he lived.', tip: 'In indirect questions: no "that", use if/whether for yes-no questions, normal word order.' },
    ],
    practiceItems: [
      { instruction: 'Convert to Indirect speech:', sentence: 'He said, "I will help you."', answer: 'He said that he would help me.' },
      { instruction: 'Convert to Indirect:', sentence: 'She asked, "Where do you live?"', answer: 'She asked where I lived.' },
    ],
    quiz: [
      { question: '"He said, \'I am hungry.\'" → Indirect speech:', options: ['He said that he is hungry.', 'He said that he was hungry.', 'He said that I was hungry.', 'He told that he was hungry.'], correctIndex: 1, explanation: '"Am" (present) shifts to "was" (past) in indirect speech. Pronoun "I" changes to "he".' },
      { question: 'For yes/no questions in indirect speech, use:', options: ['that', 'what', 'if/whether', 'which'], correctIndex: 2, explanation: 'Yes/No questions use "if" or "whether" in indirect speech. "Are you ready?" → asked if I was ready.' },
      { question: '"Will" changes to ___ in indirect speech:', options: ['shall', 'would', 'could', 'should'], correctIndex: 1, explanation: '"Will" → "would" in indirect speech tense backshift.' },
      { question: 'Which is the correct indirect speech for: She said, "I can swim."', options: ['She said that she can swim.', 'She said that she could swim.', 'She said that I could swim.', 'She said that she swam.'], correctIndex: 1, explanation: '"Can" → "could" in indirect speech. Pronoun "I" → "she".' },
      { question: 'In indirect speech, quotation marks are:', options: ['Always used', 'Never used', 'Optional', 'Used only for questions'], correctIndex: 1, explanation: 'Indirect speech does NOT use quotation marks — the exact words are not repeated.' },
    ],
    revisionPoints: ['Direct: exact words in quotes. Indirect: reported words, no quotes.', 'Tense backshift: is→was, am→was, will→would, can→could, has→had.', 'Yes/No questions → if/whether. Wh-questions → wh-word.', 'Pronouns change based on who is speaking and reporting.'],
  },

  // ── LEVEL 6: Advanced Grammar ────────────────────────────────────────────
  {
    id: 'conditionals',
    title: 'Conditionals',
    subtitle: 'If-Then structures',
    emoji: '🔮',
    levelId: 'level-6',
    difficulty: 3,
    timeMinutes: 12,
    xpReward: 120,
    definition: 'Conditionals express the result of a possible or imagined situation. They use "if" clauses to show conditions and consequences.',
    simpleExplanation: 'There are 4 main types. Zero (always true facts), First (real possible future), Second (imaginary present/future), Third (imaginary past — regrets). Each type has a specific tense pattern that you must memorise.',
    visualExamples: [
      { emoji: '☀️', label: 'Zero (always true)', sentence: 'If you heat water, it boils.' },
      { emoji: '🎯', label: 'First (real possibility)', sentence: 'If I study, I will pass.' },
      { emoji: '🌙', label: 'Second (imaginary)', sentence: 'If I were rich, I would travel.' },
      { emoji: '⏮️', label: 'Third (past regret)', sentence: 'If I had studied, I would have passed.' },
    ],
    memoryTrick: '0: if+present, present. 1st: if+present, will+base. 2nd: if+past, would+base. 3rd: if+past perfect, would+have+past participle. The "if" clause tense is always one step behind the result.',
    commonMistakes: [
      { wrong: 'If I would study, I will pass.', correct: 'If I study, I will pass. (1st conditional)', tip: 'Never use "would" in the "if" clause.' },
      { wrong: 'If I was you, I would apologise.', correct: 'If I were you, I would apologise.', tip: 'In 2nd conditional, use "were" for all persons (not "was").' },
    ],
    practiceItems: [
      { instruction: 'Identify the conditional type:', sentence: 'If she had left earlier, she would have caught the train.', answer: 'Third conditional (past regret/imaginary)' },
      { instruction: 'Complete with correct tense:', sentence: 'If it _______ (rain), we will cancel the picnic.', answer: 'rains (1st conditional)' },
    ],
    quiz: [
      { question: '"If I were the PM, I would build more schools." — This is:', options: ['Zero conditional', 'First conditional', 'Second conditional', 'Third conditional'], correctIndex: 2, explanation: '2nd conditional: if + past simple, would + base verb. Imaginary present/future situation.' },
      { question: 'Which sentence is a Zero Conditional?', options: ['If it rains, I will stay home.', 'If water reaches 100°C, it boils.', 'If I had money, I would buy a car.', 'If I had studied, I would have passed.'], correctIndex: 1, explanation: 'Zero conditional: general truths/facts. If + present simple, present simple.' },
      { question: '"If I ___ you, I would accept the offer." — Fill in:', options: ['am', 'was', 'were', 'be'], correctIndex: 2, explanation: 'In 2nd conditional, always use "were" (not "was") for all persons in the if-clause.' },
      { question: 'Which mistake is in: "If she would have tried harder, she would have won."', options: ['would have → had', 'would have → has', 'would have won → had won', 'No mistake'], correctIndex: 0, explanation: 'In 3rd conditional if-clause: use "had + past participle" NOT "would have + past participle".' },
      { question: 'First conditional expresses:', options: ['Imaginary present', 'Past regret', 'Always-true facts', 'Real possible future'], correctIndex: 3, explanation: 'First conditional expresses real, possible situations in the future: If + present, will + base.' },
    ],
    revisionPoints: ['Zero: if+present, present (universal truths).', 'First: if+present, will+base (real future possibility).', 'Second: if+past, would+base (imaginary present). Use "were" not "was".', 'Third: if+past perfect, would+have+past participle (imaginary past).', 'Never use "would" in the if-clause.'],
  },

  {
    id: 'question-tags',
    title: 'Question Tags',
    subtitle: 'Isn\'t it? Aren\'t you?',
    emoji: '❓',
    levelId: 'level-6',
    difficulty: 3,
    timeMinutes: 8,
    xpReward: 100,
    definition: 'A question tag is a short question added at the end of a statement to seek agreement or confirmation.',
    simpleExplanation: 'You use question tags all the time in conversation: "It\'s a nice day, isn\'t it?" "You\'re coming, aren\'t you?" The key rule: if the main sentence is positive, the tag is negative. If the sentence is negative, the tag is positive — they are ALWAYS opposite.',
    visualExamples: [
      { emoji: '✅➡️❌', label: 'Positive → Negative tag', sentence: 'She is smart, isn\'t she?' },
      { emoji: '❌➡️✅', label: 'Negative → Positive tag', sentence: 'He can\'t swim, can he?' },
      { emoji: '👤', label: 'Pronoun must match', sentence: 'Ram is here, isn\'t he?' },
      { emoji: '🔄', label: 'Auxiliary repeats', sentence: 'They have eaten, haven\'t they?' },
    ],
    memoryTrick: 'OPPOSITE RULE: Positive statement → negative tag. Negative statement → positive tag. The auxiliary verb in the tag mirrors the one in the sentence.',
    commonMistakes: [
      { wrong: 'She is beautiful, is she?', correct: 'She is beautiful, isn\'t she?', tip: 'Positive statement → negative tag (isn\'t, aren\'t, wasn\'t, can\'t, won\'t).' },
      { wrong: 'I am right, am I not? → amn\'t I?', correct: 'I am right, aren\'t I?', tip: '"Aren\'t I?" is the accepted question tag for "I am..." (not "amn\'t I").' },
    ],
    practiceItems: [
      { instruction: 'Add the correct tag:', sentence: 'You will come, _______ ?', answer: 'won\'t you?' },
      { instruction: 'Add the correct tag:', sentence: 'He cannot drive, _______ ?', answer: 'can he?' },
    ],
    quiz: [
      { question: '"She works hard, ___ ___?" — Fill in tag:', options: ['does she', 'doesn\'t she', 'isn\'t she', 'wasn\'t she'], correctIndex: 1, explanation: 'Positive statement (works) → negative tag. Auxiliary = does → doesn\'t she?' },
      { question: '"They haven\'t arrived, ___ ___?"', options: ['haven\'t they', 'have they', 'aren\'t they', 'don\'t they'], correctIndex: 1, explanation: 'Negative statement (haven\'t) → positive tag → "have they?"' },
      { question: '"I am right, ___ ___?" — Correct tag:', options: ['am I not', 'aren\'t I', 'isn\'t I', 'amn\'t I'], correctIndex: 1, explanation: 'The accepted question tag for "I am" is "aren\'t I?" — not "amn\'t I".' },
      { question: 'Which rule applies to question tags?', options: ['Positive → Positive tag', 'Negative → Negative tag', 'Positive → Negative tag', 'No fixed rule'], correctIndex: 2, explanation: 'Positive statement → Negative tag. Negative statement → Positive tag. Always opposite.' },
      { question: '"Let\'s go, ___ ___?" — The tag is:', options: ['shall we', 'will we', 'won\'t we', 'don\'t we'], correctIndex: 0, explanation: '"Let\'s" suggestions always use "shall we?" as the question tag.' },
    ],
    revisionPoints: ['Positive statement → Negative tag.', 'Negative statement → Positive tag.', 'Tag must use the same auxiliary as the main sentence.', 'Pronoun in tag must match the subject.', '"I am" → aren\'t I? | "Let\'s" → shall we?'],
  },

  {
    id: 'punctuation',
    title: 'Punctuation',
    subtitle: 'The signs that matter',
    emoji: '✏️',
    levelId: 'level-6',
    difficulty: 2,
    timeMinutes: 9,
    xpReward: 90,
    definition: 'Punctuation marks are symbols used in writing to separate sentences and clarify meaning.',
    simpleExplanation: 'Punctuation is the "traffic signals" of writing. Without them, readers get confused. Consider: "Let\'s eat, Grandma!" vs "Let\'s eat Grandma!" A comma literally saved Grandma\'s life! Each punctuation mark has a specific job.',
    visualExamples: [
      { emoji: '.', label: 'Full Stop — ends a sentence', sentence: 'She is a doctor.' },
      { emoji: ',', label: 'Comma — pause or list', sentence: 'I bought milk, eggs, and bread.' },
      { emoji: '?', label: 'Question Mark — direct question', sentence: 'Are you ready?' },
      { emoji: ';', label: 'Semicolon — connects related clauses', sentence: 'She studies hard; she always passes.' },
    ],
    memoryTrick: '. ends. , pauses. ? asks. ! exclaims. ; connects equals. : introduces. \' shows possession/omission. " " quotes.',
    commonMistakes: [
      { wrong: 'Its a beautiful day.', correct: "It's a beautiful day.", tip: '"It\'s" = It is (apostrophe for omission). "Its" = belonging to it (no apostrophe).' },
      { wrong: 'She said "I am tired".', correct: 'She said, "I am tired."', tip: 'In British English, punctuation goes inside quotes. A comma before the quote is needed.' },
    ],
    practiceItems: [
      { instruction: 'Add correct punctuation:', sentence: 'Ram Shyam and Mohan are brothers', answer: 'Ram, Shyam, and Mohan are brothers.' },
      { instruction: 'Correct the apostrophe:', sentence: "The dog wagged it's tail.", answer: 'The dog wagged its tail.' },
    ],
    quiz: [
      { question: 'Which sentence uses a comma correctly?', options: ['She, is a doctor.', 'She is, a doctor.', 'I like tea, coffee, and juice.', 'I, like tea.'], correctIndex: 2, explanation: 'Commas separate items in a list: tea, coffee, and juice.' },
      { question: '"It\'s" means:', options: ['Belonging to it', 'It is / It has', 'This is', 'That is'], correctIndex: 1, explanation: '"It\'s" = contraction of "It is" or "It has". "Its" = possessive (belonging to it).' },
      { question: 'A semicolon is used to:', options: ['End a sentence', 'Show possession', 'Join two related independent clauses', 'Introduce a list after a colon'], correctIndex: 2, explanation: 'Semicolon (;) connects two closely related independent clauses without a conjunction.' },
      { question: '"Let\'s eat Grandma!" vs "Let\'s eat, Grandma!" — The difference is:', options: ['No difference', 'Comma changes the meaning completely', 'Only style difference', 'Exclamation mark changes meaning'], correctIndex: 1, explanation: 'The comma after "eat" makes "Grandma" the person being addressed, not being eaten!' },
      { question: 'Which punctuation introduces a list or explanation?', options: ['Semicolon (;)', 'Comma (,)', 'Colon (:)', 'Hyphen (-)'], correctIndex: 2, explanation: 'Colon (:) introduces a list, explanation, or quotation. "She has three pets: a dog, a cat, and a bird."' },
    ],
    revisionPoints: ['. ends sentences. , separates clauses/lists. ? for questions. ! for exclamations.', '; connects equal independent clauses. : introduces lists/explanations.', '"It\'s" = it is. "Its" = belonging to it.', 'Apostrophe: for contractions and possession.'],
  },

  // ── LEVEL 7: Exam Grammar ────────────────────────────────────────────────
  {
    id: 'error-spotting',
    title: 'Error Spotting',
    subtitle: 'Find the mistake',
    emoji: '🔍',
    levelId: 'level-7',
    difficulty: 3,
    timeMinutes: 12,
    xpReward: 130,
    definition: 'Error spotting tests your ability to identify grammatical errors in a given sentence or passage.',
    simpleExplanation: 'Error spotting is like being a grammar detective. You read a sentence and find what is wrong. Errors can be in subject-verb agreement, tense, articles, prepositions, modals, voice, or narration. A systematic approach — checking each element — is the key.',
    visualExamples: [
      { emoji: '❌', label: 'SVA Error', sentence: 'Each of the students have submitted their work.' },
      { emoji: '✅', label: 'Corrected', sentence: 'Each of the students has submitted his/her work.' },
      { emoji: '❌', label: 'Tense Error', sentence: 'She has went to market.' },
      { emoji: '✅', label: 'Corrected', sentence: 'She has gone to market.' },
    ],
    memoryTrick: 'CHECK LIST for error spotting: S-V Agreement → Tense → Article → Preposition → Pronoun → Conjunction → Modifier → Word Order.',
    commonMistakes: [
      { wrong: 'One of my friend is a doctor.', correct: 'One of my friends is a doctor.', tip: '"One of" is followed by a PLURAL noun. "One of my friends" (plural) + singular verb (is).' },
      { wrong: 'He is more better than her.', correct: 'He is better than her.', tip: 'Never use "more" with already comparative adjectives (better, taller, smarter).' },
    ],
    practiceItems: [
      { instruction: 'Spot and correct the error:', sentence: 'Neither of the boys have completed the task.', answer: '"have" → "has" (Neither = singular)' },
      { instruction: 'Spot the error:', sentence: 'She is too clever girl to be deceived.', answer: 'Remove "too" → "She is a clever girl to be deceived" OR use "too...to": "She is too clever to be deceived."' },
    ],
    quiz: [
      { question: 'Find the error: "The committee have reached a unanimous decision."', options: ['committee → committees', 'have → has', 'reached → reach', 'unanimous → unanimously'], correctIndex: 1, explanation: '"Committee" as a single unit takes singular verb "has", not "have".' },
      { question: 'Find the error: "He is one of the student who has worked hard."', options: ['"is" should be "are"', '"student" should be "students"', '"who" should be "whom"', '"worked" should be "work"'], correctIndex: 1, explanation: '"One of" is followed by a plural noun: "students" not "student".' },
      { question: 'Find the error: "No sooner did he entered the room than the phone rang."', options: ['"did" should be removed', '"entered" should be "enter"', '"than" should be "when"', '"rang" should be "rung"'], correctIndex: 1, explanation: '"No sooner did he" → base verb follows (did + base form): "enter" not "entered".' },
      { question: '"She is more wiser than her sister." — The error is:', options: ['"more" should be removed', '"wiser" should be "wise"', '"than" should be "then"', '"her" should be "she"'], correctIndex: 0, explanation: '"Wiser" is already comparative. Never use "more" + comparative adjective.' },
      { question: '"He told me that he will come tomorrow." — Error:', options: ['"told" should be "said"', '"that" should be removed', '"will" should be "would"', 'No error'], correctIndex: 2, explanation: 'In indirect speech with past reporting verb (told), "will" shifts to "would".' },
    ],
    revisionPoints: ['Error spotting checklist: SVA → Tense → Articles → Prepositions → Pronouns → Conjunctions.', '"One of" + plural noun + singular verb.', 'Neither/Either → singular verb.', 'Never double comparatives (more better, most tallest).', 'No sooner...than (not "when"), Hardly...when (not "than").'],
  },

  {
    id: 'sentence-improvement',
    title: 'Sentence Improvement',
    subtitle: 'Make it better',
    emoji: '🔧',
    levelId: 'level-7',
    difficulty: 3,
    timeMinutes: 10,
    xpReward: 120,
    definition: 'Sentence improvement involves replacing a grammatically incorrect or awkward part of a sentence with the correct alternative.',
    simpleExplanation: 'You are given a sentence with a highlighted/underlined part, and 4 options. Your job is to find which option correctly replaces the underlined part (or confirm "No improvement needed"). Think of it as editing — you are polishing raw sentences into correct ones.',
    visualExamples: [
      { emoji: '📝', label: 'Original', sentence: 'He is working here since 2010.' },
      { emoji: '✅', label: 'Improved', sentence: 'He has been working here since 2010.' },
      { emoji: '📝', label: 'Original', sentence: 'Scarcely had he entered than it started raining.' },
      { emoji: '✅', label: 'Improved', sentence: 'Scarcely had he entered when it started raining.' },
    ],
    memoryTrick: 'Focus on: 1. Tense consistency 2. Subject-verb agreement 3. Idiom usage 4. Prepositions 5. Articles. If none of the options fix the error, choose "No improvement".',
    commonMistakes: [
      { wrong: 'Choosing an option that fixes one error but creates another.', correct: 'Read the whole sentence with each option before choosing.', tip: 'Always read the complete sentence with each replacement option.' },
    ],
    practiceItems: [
      { instruction: 'Improve the underlined part: He has been waiting since two hours.', sentence: '"since two hours" should be:', answer: 'for two hours (duration = for, point in time = since)' },
      { instruction: 'Improve: She is the most tallest girl in class.', sentence: 'The error is:', answer: '"most tallest" → "tallest" (remove "most")' },
    ],
    quiz: [
      { question: '"He works here since 2015." — Improve the sentence:', options: ['He has worked here since 2015.', 'He had worked here since 2015.', 'He is working here since 2015.', 'He was working here since 2015.'], correctIndex: 0, explanation: '"Since" with a point in time requires Present Perfect: "has worked".' },
      { question: '"Scarcely had she sat ___ the phone rang."', options: ['than', 'then', 'when', 'that'], correctIndex: 2, explanation: '"Scarcely/Hardly/Barely...when" is the correct pair. Never "than".' },
      { question: '"No sooner did he arrive ___ it started raining."', options: ['when', 'then', 'that', 'than'], correctIndex: 3, explanation: '"No sooner...than" is the correct pair. "No sooner...when" is wrong.' },
      { question: '"The news are shocking." — Improve:', options: ['The news is shocking.', 'The news were shocking.', 'The news have been shocking.', 'No improvement needed.'], correctIndex: 0, explanation: '"News" is uncountable (singular). Use "is" not "are".' },
      { question: '"He is used to work late." — Improve:', options: ['He is used to works late.', 'He is used to worked late.', 'He is used to working late.', 'No improvement needed.'], correctIndex: 2, explanation: '"Used to + gerund (verb-ing)" for a current habit. "Used to + base verb" is only for past habits.' },
    ],
    revisionPoints: ['Since = point in time → Present Perfect. For = duration.', 'No sooner...than | Scarcely/Hardly/Barely...when.', '"News" is singular. "Police", "cattle", "people" are plural.', '"Be used to" + gerund (working). "Used to" + base verb (work, past habit).'],
  },

  {
    id: 'fillers',
    title: 'Fill in the Blanks',
    subtitle: 'Choose the right word',
    emoji: '📋',
    levelId: 'level-7',
    difficulty: 3,
    timeMinutes: 10,
    xpReward: 110,
    definition: 'Fill in the blanks (fillers) tests your ability to choose the grammatically correct word or phrase to complete a sentence.',
    simpleExplanation: 'Fillers test your knowledge of grammar rules in context. The correct answer always matches: tense, subject-verb agreement, correct preposition, right article, or the correct idiom. Read the whole sentence first, then eliminate wrong options.',
    visualExamples: [
      { emoji: '🎯', label: 'Preposition filler', sentence: 'She is good ___ mathematics. → at' },
      { emoji: '🎯', label: 'Article filler', sentence: '___ honest man is respected. → An' },
      { emoji: '🎯', label: 'Tense filler', sentence: 'By next year, I ___ finished. → will have' },
      { emoji: '🎯', label: 'Conjunction filler', sentence: 'She is beautiful ___ intelligent. → and' },
    ],
    memoryTrick: 'PACE strategy: Preview the sentence, Apply grammar rules, Check all options, Eliminate wrong ones.',
    commonMistakes: [
      { wrong: 'Guessing without reading the full sentence.', correct: 'Always read the complete sentence before choosing.', tip: 'Context clues in the sentence often reveal the correct answer.' },
    ],
    practiceItems: [
      { instruction: 'Fill in (preposition):', sentence: 'He is addicted ___ video games.', answer: 'to' },
      { instruction: 'Fill in (tense):', sentence: 'By the time she arrives, I _______ the food.', answer: 'will have cooked (Future Perfect)' },
    ],
    quiz: [
      { question: 'She is suffering ___ a cold.', options: ['with', 'from', 'of', 'by'], correctIndex: 1, explanation: '"Suffer from" is the correct collocation for illness/disease.' },
      { question: 'The thief was caught red-___. (idiom)', options: ['faced', 'handed', 'eyed', 'hearted'], correctIndex: 1, explanation: '"Caught red-handed" means caught in the act of doing something wrong.' },
      { question: '___ she works hard, she will succeed.', options: ['Although', 'Despite', 'If', 'However'], correctIndex: 2, explanation: '"If" introduces a condition for a result. "Although" and "Despite" show contrast. "However" is an adverb.' },
      { question: 'He is ___ only child of his parents.', options: ['a', 'an', 'the', 'no article'], correctIndex: 2, explanation: '"The only" — when there is just one specific thing, use "the".' },
      { question: 'They have been working ___ morning.', options: ['from', 'since', 'for', 'till'], correctIndex: 1, explanation: '"Since" is used with a specific point in time (morning, 2020, childhood).' },
    ],
    revisionPoints: ['Suffer from, good at, afraid of, addicted to — fixed prepositions.', 'Since = point in time. For = duration.', '"The only/best/first" → always use "the".', 'PACE: Preview → Apply rules → Check → Eliminate.'],
  },

  // ── LEVEL 8: Writing Mastery ─────────────────────────────────────────────
  {
    id: 'para-jumbles',
    title: 'Para Jumbles',
    subtitle: 'Arrange sentences',
    emoji: '🧩',
    levelId: 'level-8',
    difficulty: 3,
    timeMinutes: 10,
    xpReward: 130,
    definition: 'Para jumbles are sets of sentences that are jumbled. You must rearrange them into a logical, coherent paragraph.',
    simpleExplanation: 'Para jumbles test logical thinking + grammar. Look for: (1) The TOPIC SENTENCE — usually the most general statement. (2) CONNECTORS like "however", "therefore", "in addition", "first", "finally". (3) PRONOUNS — "he/she/it/they" must refer to a noun already introduced. (4) CHRONOLOGICAL or LOGICAL order of ideas.',
    visualExamples: [
      { emoji: '1️⃣', label: 'Find topic sentence', sentence: 'The most general/introductory sentence goes first.' },
      { emoji: '🔗', label: 'Find connectors', sentence: '"Furthermore", "However", "Finally" signal order.' },
      { emoji: '👤', label: 'Track pronouns', sentence: '"He said..." — "He" must refer to someone already named.' },
      { emoji: '✅', label: 'Build the paragraph', sentence: 'Topic → Supporting ideas → Conclusion.' },
    ],
    memoryTrick: 'TIPS: Topic first. Introduce before using pronouns. Place connectors logically. Summary/conclusion goes last.',
    commonMistakes: [
      { wrong: 'Starting with a sentence that has "however" or "therefore".', correct: 'These connectors suggest previous context — they cannot be the first sentence.', tip: 'Connector words (however, therefore, moreover, thus) indicate a continuation — they are never the opening sentence.' },
    ],
    practiceItems: [
      { instruction: 'Arrange logically (which comes first?):', sentence: 'A: He then moved to Delhi. B: Ram was born in Chennai. C: He studied there for 10 years.', answer: 'B → C → A' },
    ],
    quiz: [
      { question: 'Which sentence should NOT be the first in a paragraph?', options: ['Grammar is the backbone of any language.', 'Learning English opens many doors.', 'However, not everyone finds it easy to learn.', 'Reading is a fundamental skill.'], correctIndex: 2, explanation: '"However" signals a contrast to something already said — it cannot open a paragraph.' },
      { question: 'What does a topic sentence do?', options: ['Concludes the paragraph', 'Introduces the main idea', 'Provides a specific example', 'Gives evidence'], correctIndex: 1, explanation: 'The topic sentence introduces the main idea of the paragraph — it is usually the first sentence.' },
      { question: 'In para jumbles, "therefore" indicates:', options: ['The first sentence', 'A result or conclusion', 'A contrast', 'A question'], correctIndex: 1, explanation: '"Therefore" indicates a result/conclusion based on what was said before.' },
      { question: 'Which is the BEST first sentence for a paragraph about pollution?', options: ['It is destroying ecosystems worldwide.', 'Pollution has become a global crisis.', 'Therefore, we must act now.', 'Furthermore, the government is responding.'], correctIndex: 1, explanation: '"Pollution has become a global crisis" is a general statement that can open the paragraph. The others assume prior context.' },
      { question: 'If sentence B has "They won the match", "They" must refer to:', options: ['A team mentioned in sentence A', 'The next sentence', 'The last sentence', 'An unspecified group'], correctIndex: 0, explanation: 'A pronoun ("They") must refer back to a noun already introduced — in this case, the team must appear in sentence A (before B).' },
    ],
    revisionPoints: ['Topic sentence is always the most general/introductory.', 'Connectors (however, therefore, moreover) signal continuation — never first.', 'Pronouns must follow their nouns.', 'Chronological order: First → Then → Finally.'],
  },

  {
    id: 'cloze-test',
    title: 'Cloze Test',
    subtitle: 'Fill a whole passage',
    emoji: '📄',
    levelId: 'level-8',
    difficulty: 3,
    timeMinutes: 12,
    xpReward: 130,
    definition: 'A cloze test is a passage with blanks where you must fill in the most appropriate word based on context.',
    simpleExplanation: 'Unlike isolated fill-in-the-blank questions, a cloze test asks you to understand an entire passage and choose words that fit the overall theme, tone, and grammar. Read the WHOLE passage first, then fill blanks.',
    visualExamples: [
      { emoji: '📖', label: 'Read full passage first', sentence: 'Understand the topic and tone before filling any blank.' },
      { emoji: '🔤', label: 'Check grammar clues', sentence: 'Does the blank need a noun, verb, adjective, or preposition?' },
      { emoji: '🎯', label: 'Use context', sentence: 'The words before and after the blank guide your choice.' },
      { emoji: '🔄', label: 'Eliminate options', sentence: 'Cross out clearly wrong options to narrow choices.' },
    ],
    memoryTrick: 'RACE: Read the full passage first. Apply grammar rules. Check context. Eliminate wrong options.',
    commonMistakes: [
      { wrong: 'Filling blanks without reading the whole passage.', correct: 'Always read the full passage first to understand context.', tip: 'Theme and tone of the passage reveal what kind of word fits each blank.' },
    ],
    practiceItems: [
      { instruction: 'The passage is about climate change. Fill: The planet is _______ warmer each year.', sentence: 'Options: going, getting, taking, becoming', answer: 'getting (getting warmer = common collocation)' },
    ],
    quiz: [
      { question: 'What should you do FIRST in a cloze test?', options: ['Fill in the easiest blank', 'Read the whole passage', 'Start from the last blank', 'Eliminate all options first'], correctIndex: 1, explanation: 'Reading the full passage first gives you context and theme, which helps fill all blanks correctly.' },
      { question: 'The best strategy to eliminate wrong options is:', options: ['Guess randomly', 'Choose the longest option', 'Check grammar + meaning + context', 'Pick the first option'], correctIndex: 2, explanation: 'Correct answers must fit grammar (right part of speech), meaning (logical), and context (matches the passage\'s theme).' },
      { question: '"The economy has _____ significantly this year." — Best word:', options: ['fallen', 'grown', 'increased', 'Both B and C'], correctIndex: 3, explanation: 'Without passage context, both "grown" and "increased" are possible. In actual test, context determines the answer.' },
      { question: 'In a cloze test, a preposition blank is best filled by:', options: ['Any preposition', 'Reading the word before and after the blank', 'Guessing', 'The longest option'], correctIndex: 1, explanation: 'Prepositions depend heavily on the words around them (collocations). Check the word before and after.' },
      { question: 'If the passage is formal/serious, the blank should be filled with:', options: ['Casual/slang words', 'Formal vocabulary matching the tone', 'The simplest word available', 'Any grammatically correct word'], correctIndex: 1, explanation: 'In cloze tests, the correct word must match the tone and register of the passage.' },
    ],
    revisionPoints: ['Read the full passage first — understand theme and tone.', 'RACE: Read, Apply, Check, Eliminate.', 'Check: Is the blank a noun/verb/adj/prep? Does it collocate with surrounding words?', 'Match the register: formal passage → formal vocabulary.'],
  },

  {
    id: 'paragraph-writing',
    title: 'Paragraph Writing',
    subtitle: 'Structure your thoughts',
    emoji: '📝',
    levelId: 'level-8',
    difficulty: 3,
    timeMinutes: 12,
    xpReward: 130,
    definition: 'A paragraph is a group of related sentences that develop one main idea. It has a topic sentence, supporting sentences, and a concluding sentence.',
    simpleExplanation: 'A paragraph is like a mini-essay with 3 parts: (1) Topic Sentence — what the paragraph is about, (2) Supporting Sentences — evidence, examples, details, (3) Concluding Sentence — wraps up the idea. Every sentence in the paragraph must relate to the topic sentence.',
    visualExamples: [
      { emoji: '🎯', label: 'Topic Sentence', sentence: 'Reading is one of the best habits a person can develop.' },
      { emoji: '📊', label: 'Supporting', sentence: 'It improves vocabulary, enhances concentration, and broadens knowledge.' },
      { emoji: '💡', label: 'Supporting', sentence: 'Studies show that people who read daily are more creative and empathetic.' },
      { emoji: '✅', label: 'Conclusion', sentence: 'Therefore, everyone should make reading a daily habit.' },
    ],
    memoryTrick: 'TSC: Topic Sentence (main idea) → Support (3-5 details/examples/reasons) → Conclusion (restate or wrap up). One paragraph = one idea.',
    commonMistakes: [
      { wrong: 'Writing a paragraph with multiple unrelated ideas.', correct: 'One paragraph = one main idea only.', tip: 'If you find yourself switching topics, start a new paragraph.' },
      { wrong: 'No concluding sentence.', correct: 'Always end with a sentence that wraps up the idea.', tip: 'A concluding sentence gives the reader a sense of closure.' },
    ],
    practiceItems: [
      { instruction: 'Identify the parts: Topic/Support/Conclusion', sentence: '"Exercise keeps the body healthy. It strengthens muscles and improves blood circulation. Regular exercise also reduces stress. Thus, everyone should exercise daily."', answer: 'Topic: Exercise keeps body healthy. Support: Sentences 2&3. Conclusion: Thus, everyone should...' },
    ],
    quiz: [
      { question: 'The main idea of a paragraph is stated in the:', options: ['Supporting sentence', 'Concluding sentence', 'Topic sentence', 'Middle sentence'], correctIndex: 2, explanation: 'The topic sentence introduces the main idea — it is usually the first sentence of the paragraph.' },
      { question: 'How many main ideas should one paragraph have?', options: ['As many as possible', 'Two or three', 'Only one', 'Depends on length'], correctIndex: 2, explanation: 'One paragraph = one main idea. Multiple ideas require multiple paragraphs.' },
      { question: 'A concluding sentence should:', options: ['Introduce a new idea', 'Restate or wrap up the main idea', 'List more examples', 'Ask a question'], correctIndex: 1, explanation: 'A concluding sentence brings closure by restating the main idea or drawing a conclusion.' },
      { question: 'Which sentence would make the BEST topic sentence?', options: ['Moreover, trees provide oxygen.', 'Trees are essential for life on Earth.', 'Therefore, we must protect them.', 'For instance, the banyan tree.'], correctIndex: 1, explanation: '"Trees are essential for life" is a general statement of the main idea — perfect as a topic sentence.' },
      { question: 'Supporting sentences in a paragraph provide:', options: ['The main idea', 'Evidence, examples, and details', 'The conclusion', 'Transition to next paragraph'], correctIndex: 1, explanation: 'Supporting sentences develop the main idea with facts, examples, reasons, or details.' },
    ],
    revisionPoints: ['Paragraph structure: Topic Sentence → Supporting Sentences → Concluding Sentence.', 'One paragraph = one main idea.', 'Supporting sentences: facts, examples, reasons, details.', 'Concluding sentence: restate the main idea or draw a conclusion.'],
  },
];

// ─── Levels ──────────────────────────────────────────────────────────────────

export const grammarLevels: GrammarLevel[] = [
  {
    id: 'level-1',
    number: 1,
    title: 'English Basics',
    subtitle: 'Understanding the language',
    emoji: '🌱',
    color: '#10b981',
    gradient: 'from-emerald-400 to-teal-500',
    bgColor: 'bg-emerald-50',
    minProgress: 0,
    badge: 'Seed Learner',
    badgeIcon: '🌱',
    modules: [
      {
        id: 'mod-1-1',
        title: 'Language Foundations',
        description: 'What is English and how it works',
        topicIds: ['intro-english', 'alphabet-words'],
        order: 1,
      },
    ],
  },
  {
    id: 'level-2',
    number: 2,
    title: 'Parts of Speech',
    subtitle: 'Building blocks of language',
    emoji: '🔤',
    color: '#3b82f6',
    gradient: 'from-blue-400 to-indigo-500',
    bgColor: 'bg-blue-50',
    minProgress: 5,
    badge: 'Word Builder',
    badgeIcon: '🔤',
    modules: [
      {
        id: 'mod-2-1',
        title: 'Naming Words',
        description: 'Nouns, Pronouns, and Articles',
        topicIds: ['noun', 'pronoun', 'article'],
        order: 1,
      },
      {
        id: 'mod-2-2',
        title: 'Describing & Connecting',
        description: 'Verbs, Adjectives, Adverbs, Prepositions, Conjunctions',
        topicIds: ['verb', 'adjective', 'adverb', 'preposition', 'conjunction'],
        order: 2,
      },
    ],
  },
  {
    id: 'level-3',
    number: 3,
    title: 'Sentence Structure',
    subtitle: 'Building complete sentences',
    emoji: '🏗️',
    color: '#8b5cf6',
    gradient: 'from-violet-400 to-purple-500',
    bgColor: 'bg-violet-50',
    minProgress: 20,
    badge: 'Sentence Maker',
    badgeIcon: '🏗️',
    modules: [
      {
        id: 'mod-3-1',
        title: 'Sentence Basics',
        description: 'Subject, Verb, Object and sentence types',
        topicIds: ['sentence-structure'],
        order: 1,
      },
    ],
  },
  {
    id: 'level-4',
    number: 4,
    title: 'Grammar Rules',
    subtitle: 'Core grammar in action',
    emoji: '📏',
    color: '#f59e0b',
    gradient: 'from-amber-400 to-orange-500',
    bgColor: 'bg-amber-50',
    minProgress: 30,
    badge: 'Grammar Scholar',
    badgeIcon: '📏',
    modules: [
      {
        id: 'mod-4-1',
        title: 'Tense & Agreement',
        description: 'Tenses and Subject-Verb Agreement',
        topicIds: ['tenses', 'subject-verb-agreement'],
        order: 1,
      },
      {
        id: 'mod-4-2',
        title: 'Modals & Conditions',
        description: 'Modal verbs',
        topicIds: ['modal-verbs'],
        order: 2,
      },
    ],
  },
  {
    id: 'level-5',
    number: 5,
    title: 'Paragraphs',
    subtitle: 'Voice and Narration',
    emoji: '✍️',
    color: '#ec4899',
    gradient: 'from-pink-400 to-rose-500',
    bgColor: 'bg-pink-50',
    minProgress: 45,
    badge: 'Paragraph Pro',
    badgeIcon: '✍️',
    modules: [
      {
        id: 'mod-5-1',
        title: 'Voice & Speech',
        description: 'Active/Passive Voice and Direct/Indirect Speech',
        topicIds: ['voice', 'narration'],
        order: 1,
      },
    ],
  },
  {
    id: 'level-6',
    number: 6,
    title: 'Advanced Grammar',
    subtitle: 'Complex structures mastered',
    emoji: '🌳',
    color: '#06b6d4',
    gradient: 'from-cyan-400 to-teal-500',
    bgColor: 'bg-cyan-50',
    minProgress: 60,
    badge: 'Advanced Writer',
    badgeIcon: '🌳',
    modules: [
      {
        id: 'mod-6-1',
        title: 'Complex Structures',
        description: 'Conditionals, Question Tags, and Punctuation',
        topicIds: ['conditionals', 'question-tags', 'punctuation'],
        order: 1,
      },
    ],
  },
  {
    id: 'level-7',
    number: 7,
    title: 'Exam Grammar',
    subtitle: 'Crack every exam question',
    emoji: '🎯',
    color: '#f97316',
    gradient: 'from-orange-400 to-red-500',
    bgColor: 'bg-orange-50',
    minProgress: 75,
    badge: 'Exam Ready',
    badgeIcon: '🎯',
    modules: [
      {
        id: 'mod-7-1',
        title: 'Error Analysis',
        description: 'Error Spotting and Sentence Improvement',
        topicIds: ['error-spotting', 'sentence-improvement'],
        order: 1,
      },
      {
        id: 'mod-7-2',
        title: 'Fill the Gaps',
        description: 'Fillers and Cloze Test strategies',
        topicIds: ['fillers', 'cloze-test'],
        order: 2,
      },
    ],
  },
  {
    id: 'level-8',
    number: 8,
    title: 'Writing Mastery',
    subtitle: 'Write like a champion',
    emoji: '🏆',
    color: '#dc2626',
    gradient: 'from-rose-500 to-red-600',
    bgColor: 'bg-rose-50',
    minProgress: 88,
    badge: 'Grammar Master',
    badgeIcon: '🏆',
    modules: [
      {
        id: 'mod-8-1',
        title: 'Advanced Comprehension',
        description: 'Para Jumbles and Cloze Test mastery',
        topicIds: ['para-jumbles'],
        order: 1,
      },
      {
        id: 'mod-8-2',
        title: 'Writing Skills',
        description: 'Paragraph and Essay writing',
        topicIds: ['paragraph-writing'],
        order: 2,
      },
    ],
  },
];

// ─── Helper functions ────────────────────────────────────────────────────────

export const getTopicById = (id: string): GrammarTopic | undefined =>
  grammarTopics.find(t => t.id === id);

export const getLevelById = (id: string): GrammarLevel | undefined =>
  grammarLevels.find(l => l.id === id);

export const getTopicsForLevel = (levelId: string): GrammarTopic[] =>
  grammarTopics.filter(t => t.levelId === levelId);

export const getTotalTopics = (): number => grammarTopics.length;

export const TOTAL_XP = grammarTopics.reduce((sum, t) => sum + t.xpReward, 0);
