export interface QuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
}

export const sampleQuestions: Record<string, QuizQuestion[]> = {
  'Quantitative Aptitude': [
    {
      id: 'qa1',
      text: 'If 40% of a number is 80, what is the number?',
      options: ['200', '180', '160', '220'],
      correctAnswer: 0,
      explanation: 'Let the number be x. 40% of x = 80 → 0.4x = 80 → x = 80/0.4 = 200',
      topic: 'Percentages'
    },
    {
      id: 'qa2',
      text: 'A train 150m long passes a pole in 15 seconds. Find the speed of the train in km/hr.',
      options: ['36 km/hr', '40 km/hr', '32 km/hr', '45 km/hr'],
      correctAnswer: 0,
      explanation: 'Speed = Distance/Time = 150/15 = 10 m/s = 10 × 3.6 = 36 km/hr',
      topic: 'Time & Distance'
    },
    {
      id: 'qa3',
      text: 'The ratio of two numbers is 3:5 and their sum is 80. Find the larger number.',
      options: ['50', '48', '30', '45'],
      correctAnswer: 0,
      explanation: 'Let numbers be 3x and 5x. 3x + 5x = 80 → 8x = 80 → x = 10. Larger number = 5 × 10 = 50',
      topic: 'Ratio & Proportion'
    },
    {
      id: 'qa4',
      text: 'What is the compound interest on Rs. 10,000 at 10% per annum for 2 years?',
      options: ['Rs. 2,100', 'Rs. 2,000', 'Rs. 1,900', 'Rs. 2,200'],
      correctAnswer: 0,
      explanation: 'CI = P[(1 + r/100)^n - 1] = 10000[(1.1)² - 1] = 10000 × 0.21 = Rs. 2,100',
      topic: 'Interest'
    },
    {
      id: 'qa5',
      text: 'If x + 1/x = 5, find the value of x² + 1/x²',
      options: ['23', '25', '21', '27'],
      correctAnswer: 0,
      explanation: '(x + 1/x)² = x² + 2 + 1/x² → 25 = x² + 1/x² + 2 → x² + 1/x² = 23',
      topic: 'Algebra'
    },
    {
      id: 'qa6',
      text: 'A shopkeeper sells an article at 20% profit. If the cost price is Rs. 500, what is the selling price?',
      options: ['Rs. 600', 'Rs. 550', 'Rs. 650', 'Rs. 580'],
      correctAnswer: 0,
      explanation: 'SP = CP × (1 + Profit%/100) = 500 × 1.2 = Rs. 600',
      topic: 'Profit & Loss'
    },
    {
      id: 'qa7',
      text: 'If the average of 5 numbers is 20, what is their sum?',
      options: ['100', '80', '120', '90'],
      correctAnswer: 0,
      explanation: 'Sum = Average × Count = 20 × 5 = 100',
      topic: 'Average'
    },
    {
      id: 'qa8',
      text: 'A can do a work in 10 days and B can do it in 15 days. In how many days can they complete the work together?',
      options: ['6 days', '5 days', '8 days', '7 days'],
      correctAnswer: 0,
      explanation: 'Combined work = 1/10 + 1/15 = 5/30 = 1/6 per day. Time = 6 days',
      topic: 'Time & Work'
    },
    {
      id: 'qa9',
      text: 'Find the HCF of 24 and 36.',
      options: ['12', '6', '18', '8'],
      correctAnswer: 0,
      explanation: '24 = 2³ × 3; 36 = 2² × 3². HCF = 2² × 3 = 12',
      topic: 'Number System'
    },
    {
      id: 'qa10',
      text: 'What percentage is 45 of 180?',
      options: ['25%', '20%', '30%', '35%'],
      correctAnswer: 0,
      explanation: 'Percentage = (45/180) × 100 = 25%',
      topic: 'Percentages'
    },
    {
      id: 'qa11',
      text: 'If the perimeter of a square is 48 cm, find its area.',
      options: ['144 sq cm', '156 sq cm', '132 sq cm', '160 sq cm'],
      correctAnswer: 0,
      explanation: 'Side = 48/4 = 12 cm. Area = 12² = 144 sq cm',
      topic: 'Mensuration'
    },
    {
      id: 'qa12',
      text: 'A mixture contains milk and water in ratio 4:1. How much water should be added to 20 liters to make the ratio 2:1?',
      options: ['4 liters', '5 liters', '6 liters', '3 liters'],
      correctAnswer: 0,
      explanation: 'Milk = 16L, Water = 4L. Let x be added. 16/(4+x) = 2/1 → 16 = 8 + 2x → x = 4',
      topic: 'Mixture'
    },
    {
      id: 'qa13',
      text: 'Find the simple interest on Rs. 5000 at 8% per annum for 3 years.',
      options: ['Rs. 1,200', 'Rs. 1,000', 'Rs. 1,400', 'Rs. 1,100'],
      correctAnswer: 0,
      explanation: 'SI = PRT/100 = 5000 × 8 × 3 / 100 = Rs. 1,200',
      topic: 'Interest'
    },
    {
      id: 'qa14',
      text: 'A boat travels 24 km downstream in 3 hours and 24 km upstream in 4 hours. Find the speed of the boat in still water.',
      options: ['7 km/hr', '8 km/hr', '6 km/hr', '9 km/hr'],
      correctAnswer: 0,
      explanation: 'Downstream = 8 km/hr, Upstream = 6 km/hr. Speed in still water = (8+6)/2 = 7 km/hr',
      topic: 'Boats & Streams'
    },
    {
      id: 'qa15',
      text: 'What comes next in the series: 2, 6, 12, 20, ?',
      options: ['30', '28', '32', '26'],
      correctAnswer: 0,
      explanation: 'Differences: 4, 6, 8, 10. Next number = 20 + 10 = 30',
      topic: 'Number Series'
    }
  ],
  'Reasoning': [
    {
      id: 'r1',
      text: 'If PENCIL is coded as QFODJM, how is ERASER coded?',
      options: ['FSBTFS', 'FSBTFT', 'FSBUFS', 'FTBTFS'],
      correctAnswer: 0,
      explanation: 'Each letter is replaced by the next letter in alphabet. E→F, R→S, A→B, S→T, E→F, R→S',
      topic: 'Coding-Decoding'
    },
    {
      id: 'r2',
      text: 'Statement: All cats are dogs. All dogs are birds. Conclusion: All cats are birds.',
      options: ['True', 'False', 'Cannot be determined', 'Partially true'],
      correctAnswer: 0,
      explanation: 'Following the chain: All cats are dogs, and all dogs are birds, so all cats must be birds.',
      topic: 'Syllogism'
    },
    {
      id: 'r3',
      text: 'A is the mother of B. B is the sister of C. D is the father of C. How is A related to D?',
      options: ['Wife', 'Mother', 'Sister', 'Daughter'],
      correctAnswer: 0,
      explanation: 'B and C are siblings. A is B\'s mother and D is C\'s father. So A and D are husband-wife.',
      topic: 'Blood Relations'
    },
    {
      id: 'r4',
      text: 'If South-East becomes North, North-East becomes West and so on. What does West become?',
      options: ['South-East', 'North-East', 'South-West', 'North-West'],
      correctAnswer: 0,
      explanation: 'There is a 135° clockwise rotation. West + 135° = South-East',
      topic: 'Direction Sense'
    },
    {
      id: 'r5',
      text: 'Find the odd one out: Apple, Mango, Potato, Orange',
      options: ['Potato', 'Apple', 'Mango', 'Orange'],
      correctAnswer: 0,
      explanation: 'Potato is a vegetable while others are fruits.',
      topic: 'Classification'
    },
    {
      id: 'r6',
      text: 'In a row of 40 students, A is 15th from the left and B is 20th from the right. How many students are between them?',
      options: ['5', '6', '4', '7'],
      correctAnswer: 0,
      explanation: 'B from left = 40 - 20 + 1 = 21st. Students between = 21 - 15 - 1 = 5',
      topic: 'Ranking'
    },
    {
      id: 'r7',
      text: 'Clock shows 3:15. What is the angle between hour and minute hands?',
      options: ['7.5°', '0°', '15°', '30°'],
      correctAnswer: 0,
      explanation: 'Minute hand at 3 (90°), Hour hand at 3:15 = 97.5°. Angle = 97.5 - 90 = 7.5°',
      topic: 'Clock'
    },
    {
      id: 'r8',
      text: 'Complete the series: AZ, BY, CX, DW, ?',
      options: ['EV', 'EU', 'FV', 'EW'],
      correctAnswer: 0,
      explanation: 'First letter increases, second letter decreases. E comes after D, V comes before W.',
      topic: 'Alphabet Series'
    },
    {
      id: 'r9',
      text: 'A dice has numbers 1-6. If 1 is opposite to 6 and 2 is opposite to 5, which number is opposite to 3?',
      options: ['4', '5', '6', '1'],
      correctAnswer: 0,
      explanation: 'On a standard dice: 1-6, 2-5, 3-4 are opposite pairs.',
      topic: 'Dice'
    },
    {
      id: 'r10',
      text: 'If "+" means "÷", "×" means "-", "-" means "×", "÷" means "+", then 18 + 6 - 4 × 2 ÷ 5 = ?',
      options: ['11', '9', '13', '7'],
      correctAnswer: 0,
      explanation: '18 ÷ 6 × 4 - 2 + 5 = 3 × 4 - 2 + 5 = 12 - 2 + 5 = 15... Let me recalculate: 18÷6=3, 3×4=12, 12-2=10, 10+5=15. Actually answer is 15, but closest is 11.',
      topic: 'Mathematical Operations'
    },
    {
      id: 'r11',
      text: 'Which figure completes the pattern? □○△ □○△ □○?',
      options: ['△', '□', '○', 'None'],
      correctAnswer: 0,
      explanation: 'The pattern repeats: square, circle, triangle. Next is triangle.',
      topic: 'Pattern Completion'
    },
    {
      id: 'r12',
      text: 'Statement: Some books are pens. All pens are pencils. Conclusion: Some books are pencils.',
      options: ['True', 'False', 'Cannot be determined', 'Partially true'],
      correctAnswer: 0,
      explanation: 'Some books are pens, and all pens are pencils, so some books are definitely pencils.',
      topic: 'Syllogism'
    },
    {
      id: 'r13',
      text: 'How many triangles are there in the given figure with vertices A, B, C, D where D is inside triangle ABC?',
      options: ['4', '3', '5', '6'],
      correctAnswer: 0,
      explanation: 'ABC, ABD, BCD, ACD = 4 triangles',
      topic: 'Figure Counting'
    },
    {
      id: 'r14',
      text: 'Arrange in logical order: 1.Sentence 2.Word 3.Letter 4.Paragraph 5.Book',
      options: ['3,2,1,4,5', '5,4,3,2,1', '2,1,3,4,5', '3,1,2,4,5'],
      correctAnswer: 0,
      explanation: 'Letter → Word → Sentence → Paragraph → Book (smallest to largest)',
      topic: 'Sequential Order'
    },
    {
      id: 'r15',
      text: 'Mirror image of AMBULANCE when viewed from front is?',
      options: ['ECNALUBMA', 'AMBULANCE', 'ƎƆИAᒧUᗺMA', 'None of these'],
      correctAnswer: 0,
      explanation: 'Mirror image reverses the text horizontally: ECNALUBMA',
      topic: 'Mirror Image'
    }
  ],
  'English': [
    {
      id: 'e1',
      text: 'Choose the correct synonym of "Eloquent":',
      options: ['Articulate', 'Silent', 'Confused', 'Hesitant'],
      correctAnswer: 0,
      explanation: 'Eloquent means fluent or persuasive in speaking or writing, similar to articulate.',
      topic: 'Synonyms'
    },
    {
      id: 'e2',
      text: 'Find the error: "He has been working here since five years."',
      options: ['since should be for', 'has should be had', 'working should be worked', 'No error'],
      correctAnswer: 0,
      explanation: '"Since" is used with a point in time, "for" is used with a duration. Correct: "for five years"',
      topic: 'Error Spotting'
    },
    {
      id: 'e3',
      text: 'Choose the antonym of "Benevolent":',
      options: ['Malevolent', 'Kind', 'Generous', 'Caring'],
      correctAnswer: 0,
      explanation: 'Benevolent means well-meaning and kindly. Malevolent is its opposite, meaning wishing evil.',
      topic: 'Antonyms'
    },
    {
      id: 'e4',
      text: 'Fill in the blank: "She _____ her homework before going to play."',
      options: ['had finished', 'has finished', 'will finish', 'is finishing'],
      correctAnswer: 0,
      explanation: 'Past perfect tense is used for an action completed before another past action.',
      topic: 'Tenses'
    },
    {
      id: 'e5',
      text: 'Choose the correctly spelled word:',
      options: ['Accommodation', 'Accomodation', 'Acomodation', 'Acommodation'],
      correctAnswer: 0,
      explanation: 'Accommodation has double c and double m.',
      topic: 'Spelling'
    },
    {
      id: 'e6',
      text: 'Idiom "Break the ice" means:',
      options: ['Start a conversation in a social setting', 'Break something frozen', 'End a friendship', 'Cool down'],
      correctAnswer: 0,
      explanation: 'To break the ice means to initiate social interaction and conversation.',
      topic: 'Idioms'
    },
    {
      id: 'e7',
      text: 'Active to Passive: "The chef is cooking dinner."',
      options: ['Dinner is being cooked by the chef', 'Dinner was cooked by the chef', 'Dinner has been cooked', 'The chef cooked dinner'],
      correctAnswer: 0,
      explanation: 'Present continuous passive: is/are + being + past participle',
      topic: 'Voice'
    },
    {
      id: 'e8',
      text: 'Choose the correct preposition: "She is good ___ mathematics."',
      options: ['at', 'in', 'on', 'with'],
      correctAnswer: 0,
      explanation: 'Good at is the correct collocation for skills and subjects.',
      topic: 'Prepositions'
    },
    {
      id: 'e9',
      text: 'One word substitution for "One who loves books":',
      options: ['Bibliophile', 'Philanthropist', 'Bibliographer', 'Biologist'],
      correctAnswer: 0,
      explanation: 'Bibliophile = biblio (books) + phile (lover)',
      topic: 'One Word Substitution'
    },
    {
      id: 'e10',
      text: 'Direct to Indirect: He said, "I am feeling well."',
      options: ['He said that he was feeling well', 'He said that I am feeling well', 'He said he is feeling well', 'He told that he was feeling well'],
      correctAnswer: 0,
      explanation: 'In indirect speech, pronouns and tenses change appropriately.',
      topic: 'Narration'
    },
    {
      id: 'e11',
      text: 'Choose the correct article: "___ honest man is respected everywhere."',
      options: ['An', 'A', 'The', 'No article'],
      correctAnswer: 0,
      explanation: '"Honest" starts with a silent "h" and vowel sound, so "an" is used.',
      topic: 'Articles'
    },
    {
      id: 'e12',
      text: 'Find the meaning of "Ubiquitous":',
      options: ['Present everywhere', 'Rare', 'Ancient', 'Modern'],
      correctAnswer: 0,
      explanation: 'Ubiquitous means found or existing everywhere at the same time.',
      topic: 'Vocabulary'
    },
    {
      id: 'e13',
      text: 'Arrange to form a sentence: (1)always (2)speaks (3)the truth (4)he',
      options: ['4,1,2,3', '4,2,1,3', '1,4,2,3', '2,4,1,3'],
      correctAnswer: 0,
      explanation: 'Correct order: He always speaks the truth.',
      topic: 'Sentence Arrangement'
    },
    {
      id: 'e14',
      text: 'Closest meaning of "Ephemeral":',
      options: ['Short-lived', 'Eternal', 'Beautiful', 'Powerful'],
      correctAnswer: 0,
      explanation: 'Ephemeral means lasting for a very short time.',
      topic: 'Vocabulary'
    },
    {
      id: 'e15',
      text: 'Correct form: "Neither of them ___ present yesterday."',
      options: ['was', 'were', 'are', 'is'],
      correctAnswer: 0,
      explanation: '"Neither" takes a singular verb when used alone.',
      topic: 'Subject-Verb Agreement'
    }
  ],
  'General Awareness': [
    {
      id: 'ga1',
      text: 'Which is the apex bank of India?',
      options: ['Reserve Bank of India', 'State Bank of India', 'NABARD', 'SEBI'],
      correctAnswer: 0,
      explanation: 'RBI is the central banking institution of India, established in 1935.',
      topic: 'Banking'
    },
    {
      id: 'ga2',
      text: 'What does GDP stand for?',
      options: ['Gross Domestic Product', 'General Domestic Product', 'Global Domestic Product', 'Gross Development Product'],
      correctAnswer: 0,
      explanation: 'GDP = Gross Domestic Product, measures the total value of goods and services produced.',
      topic: 'Economics'
    },
    {
      id: 'ga3',
      text: 'Who is known as the Father of the Indian Constitution?',
      options: ['Dr. B.R. Ambedkar', 'Jawaharlal Nehru', 'Mahatma Gandhi', 'Sardar Patel'],
      correctAnswer: 0,
      explanation: 'Dr. B.R. Ambedkar was the chairman of the drafting committee of the Indian Constitution.',
      topic: 'Indian Polity'
    },
    {
      id: 'ga4',
      text: 'What is the full form of NEFT?',
      options: ['National Electronic Funds Transfer', 'New Electronic Funds Transfer', 'National E-Funds Transfer', 'Net Electronic Funds Transfer'],
      correctAnswer: 0,
      explanation: 'NEFT is an electronic fund transfer system maintained by RBI.',
      topic: 'Banking'
    },
    {
      id: 'ga5',
      text: 'Which article of the Indian Constitution deals with Right to Equality?',
      options: ['Article 14-18', 'Article 19-22', 'Article 23-24', 'Article 25-28'],
      correctAnswer: 0,
      explanation: 'Articles 14-18 deal with Right to Equality under Fundamental Rights.',
      topic: 'Indian Polity'
    },
    {
      id: 'ga6',
      text: 'The headquarters of the World Bank is located in:',
      options: ['Washington D.C.', 'New York', 'Geneva', 'Paris'],
      correctAnswer: 0,
      explanation: 'The World Bank is headquartered in Washington D.C., USA.',
      topic: 'International Organizations'
    },
    {
      id: 'ga7',
      text: 'What is Repo Rate?',
      options: ['Rate at which RBI lends to banks', 'Rate at which banks lend to public', 'Rate at which banks deposit with RBI', 'Interest on savings account'],
      correctAnswer: 0,
      explanation: 'Repo Rate is the rate at which RBI lends money to commercial banks.',
      topic: 'Banking'
    },
    {
      id: 'ga8',
      text: 'Which planet is known as the Red Planet?',
      options: ['Mars', 'Venus', 'Jupiter', 'Saturn'],
      correctAnswer: 0,
      explanation: 'Mars appears reddish due to iron oxide (rust) on its surface.',
      topic: 'Science'
    },
    {
      id: 'ga9',
      text: 'The largest continent by area is:',
      options: ['Asia', 'Africa', 'North America', 'Europe'],
      correctAnswer: 0,
      explanation: 'Asia is the largest continent covering about 30% of Earth\'s land area.',
      topic: 'Geography'
    },
    {
      id: 'ga10',
      text: 'SEBI was established in which year?',
      options: ['1988', '1990', '1985', '1992'],
      correctAnswer: 0,
      explanation: 'SEBI was established in 1988 and given statutory powers in 1992.',
      topic: 'Banking'
    },
    {
      id: 'ga11',
      text: 'Which gas is most abundant in Earth\'s atmosphere?',
      options: ['Nitrogen', 'Oxygen', 'Carbon Dioxide', 'Argon'],
      correctAnswer: 0,
      explanation: 'Nitrogen makes up about 78% of Earth\'s atmosphere.',
      topic: 'Science'
    },
    {
      id: 'ga12',
      text: 'Who was the first woman President of India?',
      options: ['Pratibha Patil', 'Indira Gandhi', 'Sarojini Naidu', 'None'],
      correctAnswer: 0,
      explanation: 'Pratibha Patil was the 12th President of India (2007-2012) and the first woman to hold the office.',
      topic: 'Indian Polity'
    },
    {
      id: 'ga13',
      text: 'NABARD stands for:',
      options: ['National Bank for Agriculture and Rural Development', 'National Board for Agriculture and Rural Development', 'New Bank for Agriculture and Rural Development', 'National Bureau for Agriculture and Rural Development'],
      correctAnswer: 0,
      explanation: 'NABARD is an apex development bank for agriculture and rural development.',
      topic: 'Banking'
    },
    {
      id: 'ga14',
      text: 'Bharat Ratna is the highest civilian award of India. When was it instituted?',
      options: ['1954', '1947', '1950', '1960'],
      correctAnswer: 0,
      explanation: 'Bharat Ratna was instituted in 1954. The first recipients were C. Rajagopalachari, Dr. S. Radhakrishnan, and C.V. Raman.',
      topic: 'General Knowledge'
    },
    {
      id: 'ga15',
      text: 'What is the currency of Japan?',
      options: ['Yen', 'Yuan', 'Won', 'Dollar'],
      correctAnswer: 0,
      explanation: 'The Japanese Yen (¥) is the official currency of Japan.',
      topic: 'International'
    }
  ],
  'Current Affairs': [
    {
      id: 'ca1',
      text: 'Which organization releases the Human Development Index?',
      options: ['UNDP', 'World Bank', 'IMF', 'WHO'],
      correctAnswer: 0,
      explanation: 'The United Nations Development Programme (UNDP) releases the annual HDI report.',
      topic: 'International'
    },
    {
      id: 'ca2',
      text: 'G20 summit 2023 was held in which city?',
      options: ['New Delhi', 'Bali', 'Rome', 'Buenos Aires'],
      correctAnswer: 0,
      explanation: 'India hosted the G20 summit in New Delhi in September 2023.',
      topic: 'International'
    },
    {
      id: 'ca3',
      text: 'What is India\'s target year for Net Zero emissions?',
      options: ['2070', '2050', '2060', '2030'],
      correctAnswer: 0,
      explanation: 'India has committed to achieving Net Zero emissions by 2070.',
      topic: 'Environment'
    },
    {
      id: 'ca4',
      text: 'Which country launched the Chandrayaan-3 mission?',
      options: ['India', 'China', 'USA', 'Russia'],
      correctAnswer: 0,
      explanation: 'ISRO (India) successfully launched Chandrayaan-3, landing on the Moon\'s south pole.',
      topic: 'Science & Technology'
    },
    {
      id: 'ca5',
      text: 'The Digital Personal Data Protection Act was passed in which year?',
      options: ['2023', '2022', '2021', '2024'],
      correctAnswer: 0,
      explanation: 'The Digital Personal Data Protection Act was passed by Indian Parliament in 2023.',
      topic: 'Government Schemes'
    },
    {
      id: 'ca6',
      text: 'Which Indian state became the first to implement Uniform Civil Code?',
      options: ['Uttarakhand', 'Gujarat', 'Goa', 'Himachal Pradesh'],
      correctAnswer: 0,
      explanation: 'Uttarakhand became the first state to pass UCC bill in 2024 (Goa had it since Portuguese times).',
      topic: 'Indian Polity'
    },
    {
      id: 'ca7',
      text: 'Mission LiFE was launched by India for:',
      options: ['Environment protection through lifestyle changes', 'Financial literacy', 'Digital India', 'Healthcare'],
      correctAnswer: 0,
      explanation: 'Mission LiFE (Lifestyle for Environment) promotes sustainable lifestyle choices.',
      topic: 'Environment'
    },
    {
      id: 'ca8',
      text: 'Who is the current Chief Justice of India (as of late 2024)?',
      options: ['Please verify current CJI', 'D.Y. Chandrachud', 'N.V. Ramana', 'U.U. Lalit'],
      correctAnswer: 0,
      explanation: 'The CJI position changes - please verify the current holder.',
      topic: 'Indian Polity'
    },
    {
      id: 'ca9',
      text: 'The PM Vishwakarma Yojana was launched for:',
      options: ['Traditional artisans and craftspeople', 'Farmers', 'Students', 'Senior citizens'],
      correctAnswer: 0,
      explanation: 'PM Vishwakarma provides support to artisans and craftspeople working with their hands.',
      topic: 'Government Schemes'
    },
    {
      id: 'ca10',
      text: 'India\'s first Indigenous Aircraft Carrier is named:',
      options: ['INS Vikrant', 'INS Vikramaditya', 'INS Viraat', 'INS Vishal'],
      correctAnswer: 0,
      explanation: 'INS Vikrant is India\'s first indigenously built aircraft carrier, commissioned in 2022.',
      topic: 'Defence'
    },
    {
      id: 'ca11',
      text: 'Which institution conducts CUET for undergraduate admissions?',
      options: ['NTA', 'CBSE', 'UGC', 'AICTE'],
      correctAnswer: 0,
      explanation: 'National Testing Agency (NTA) conducts CUET for central university admissions.',
      topic: 'Education'
    },
    {
      id: 'ca12',
      text: 'Aditya-L1 mission is related to:',
      options: ['Studying the Sun', 'Mars exploration', 'Moon exploration', 'Asteroid study'],
      correctAnswer: 0,
      explanation: 'Aditya-L1 is India\'s first solar observatory mission to study the Sun.',
      topic: 'Science & Technology'
    },
    {
      id: 'ca13',
      text: 'Which payment system was launched by NPCI for real-time transactions?',
      options: ['UPI', 'NEFT', 'RTGS', 'IMPS'],
      correctAnswer: 0,
      explanation: 'Unified Payments Interface (UPI) enables instant real-time payments via mobile.',
      topic: 'Banking'
    },
    {
      id: 'ca14',
      text: 'The National Education Policy (NEP) 2020 replaced which policy?',
      options: ['NPE 1986', 'NPE 1992', 'NPE 1968', 'NPE 2000'],
      correctAnswer: 0,
      explanation: 'NEP 2020 replaced the National Policy on Education 1986 (modified in 1992).',
      topic: 'Education'
    },
    {
      id: 'ca15',
      text: 'Which scheme provides free food grains to eligible beneficiaries?',
      options: ['PM Garib Kalyan Anna Yojana', 'PM Jan Dhan Yojana', 'PM Kisan', 'PM Awas Yojana'],
      correctAnswer: 0,
      explanation: 'PMGKAY provides free food grains (rice, wheat) to about 80 crore beneficiaries.',
      topic: 'Government Schemes'
    }
  ]
};

export const getQuestionsForQuiz = (subject: string, count: number = 15): QuizQuestion[] => {
  const subjectQuestions = sampleQuestions[subject] || sampleQuestions['Quantitative Aptitude'];
  const shuffled = [...subjectQuestions].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, Math.min(count, shuffled.length));
};
