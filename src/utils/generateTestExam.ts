/**
 * Shared utility: generates ExamConfig from category/examId/testId params.
 * Used by both TestWindow and EnhancedTestTypeGrid.
 */
import { ExamConfig, ExamQuestion, QuestionSet } from '@/types/exam';

// ── Shared set definitions ────────────────────────────────────────────────
const PUZZLE_SET: QuestionSet = {
    setId: 'puzzle-set-1',
    setType: 'puzzle_set' as const,
    title: 'Read the following information carefully and answer the questions given below.',
    sharedContent: `<p>Eight persons — A, B, C, D, E, F, G and H — are sitting around a circular table, all facing the centre. Each person likes a different colour: Red, Blue, Green, Yellow, Orange, Purple, Pink and Brown.</p><ul><li>A sits third to the left of E. The person who likes Blue sits to the immediate right of E.</li><li>Only two persons sit between B and F. B likes Purple.</li><li>D sits to the immediate left of G. D does not like Yellow or Orange.</li><li>H sits second to the right of C. H likes Green.</li><li>The person who likes Red sits exactly opposite the person who likes Blue.</li><li>F likes Pink. The person who likes Brown sits second to the left of the person who likes Orange.</li><li>G does not sit adjacent to E. C likes Yellow.</li></ul>`,
    questionIds: ['reasoning-q1', 'reasoning-q2', 'reasoning-q3', 'reasoning-q4', 'reasoning-q5'],
};

const DI_SET: QuestionSet = {
    setId: 'di-set-1',
    setType: 'di_set' as const,
    title: 'Study the following bar graph carefully and answer the questions given below.',
    sharedContent: `<p style="font-size:0.8rem;font-weight:600;margin-bottom:6px;">The following bar graph shows the number of candidates who <strong>Appeared</strong> and were <strong>Selected</strong> in a recruitment examination across five states.</p><p>UP: Appeared 8000, Selected 480 | Maharashtra: 6500/390 | Bihar: 7200/360 | Rajasthan: 5400/270 | Karnataka: 4800/240</p>`,
    questionIds: ['quantitative-q6', 'quantitative-q7', 'quantitative-q8', 'quantitative-q9', 'quantitative-q10'],
};

const RC_SET: QuestionSet = {
    setId: 'rc-set-1',
    setType: 'reading_comprehension' as const,
    title: 'Read the following passage carefully and answer the questions given below it.',
    sharedContent: `<p>Financial inclusion has emerged as a critical component of economic development in India. The Jan Dhan Yojana, launched in August 2014, aimed to provide universal access to banking facilities. Under this scheme, basic bank accounts are opened with zero minimum balance requirements, along with a RuPay debit card and accident insurance cover.</p><p>The scheme has achieved remarkable milestones: as of 2024, over 50 crore accounts have been opened. Women account holders constitute approximately 56% of the total beneficiaries. Rural and semi-urban branches hold about 67% of these accounts.</p><p>Zero-balance accounts have declined from 77% in 2015 to less than 8% in 2024, indicating active usage. The government has integrated Jan Dhan with Aadhaar and Mobile (JAM Trinity).</p>`,
    questionIds: ['english-q1', 'english-q2', 'english-q3', 'english-q4', 'english-q5'],
};

export function generateTestExam(category: string, examId: string, testId: string): ExamConfig {
    // ── REASONING: Q1-Q10 defined, Q11-Q35 auto-generated ──
    const reasoningQuestions: ExamQuestion[] = [
        { id: 'reasoning-q1', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 1, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET, topic: 'Seating Arrangement', difficulty: 'Medium', question: 'What is the position of A with respect to H?', options: [{ id: 'rq1-a', text: 'Third to the left' }, { id: 'rq1-b', text: 'Second to the right' }, { id: 'rq1-c', text: 'Immediate left' }, { id: 'rq1-d', text: 'Third to the right' }, { id: 'rq1-e', text: 'Cannot be determined' }], correctAnswer: 'rq1-a', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q2', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 2, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET, topic: 'Seating Arrangement', difficulty: 'Medium', question: 'Which colour does G like?', options: [{ id: 'rq2-a', text: 'Red' }, { id: 'rq2-b', text: 'Brown' }, { id: 'rq2-c', text: 'Orange' }, { id: 'rq2-d', text: 'Blue' }, { id: 'rq2-e', text: 'None of these' }], correctAnswer: 'rq2-c', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q3', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 3, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET, topic: 'Seating Arrangement', difficulty: 'Medium', question: 'How many persons sit between A and D (counting clockwise from A)?', options: [{ id: 'rq3-a', text: 'One' }, { id: 'rq3-b', text: 'Two' }, { id: 'rq3-c', text: 'Three' }, { id: 'rq3-d', text: 'Four' }, { id: 'rq3-e', text: 'None' }], correctAnswer: 'rq3-b', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q4', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 4, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET, topic: 'Seating Arrangement', difficulty: 'Hard', question: 'Who sits to the immediate right of the person who likes Brown?', options: [{ id: 'rq4-a', text: 'A' }, { id: 'rq4-b', text: 'B' }, { id: 'rq4-c', text: 'E' }, { id: 'rq4-d', text: 'F' }, { id: 'rq4-e', text: 'G' }], correctAnswer: 'rq4-d', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q5', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 5, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET, topic: 'Seating Arrangement', difficulty: 'Hard', question: 'Which of the following pairs sits exactly opposite each other?', options: [{ id: 'rq5-a', text: 'A and E' }, { id: 'rq5-b', text: 'B and G' }, { id: 'rq5-c', text: 'C and F' }, { id: 'rq5-d', text: 'D and H' }, { id: 'rq5-e', text: 'A and G' }], correctAnswer: 'rq5-c', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q6', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 6, type: 'mcq', topic: 'Coding-Decoding', difficulty: 'Easy', question: 'If GROUND is coded as HSPVOE, then PLANET is coded as:', options: [{ id: 'r6a', text: 'QMBOFV' }, { id: 'r6b', text: 'QMBOFS' }, { id: 'r6c', text: 'QMBOFU' }, { id: 'r6d', text: 'RMBOFV' }], correctAnswer: 'r6c', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q7', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 7, type: 'mcq', topic: 'Coding-Decoding', difficulty: 'Easy', question: 'In a certain code "COME HERE" is written as "EPOG JGVG". How is "FAIR PLAY" written?', options: [{ id: 'r7a', text: 'HCKV RNCZ' }, { id: 'r7b', text: 'HCKV RNCA' }, { id: 'r7c', text: 'HBKV RNCZ' }, { id: 'r7d', text: 'IBKV RNCA' }], correctAnswer: 'r7a', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q8', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 8, type: 'mcq', topic: 'Syllogism', difficulty: 'Medium', question: 'Statements: All Lions are Tigers. Some Tigers are Bears. No Bear is a Wolf. Conclusions: I. Some Lions are Bears. II. Some Tigers are not Wolves.', options: [{ id: 'r8a', text: 'Only I follows' }, { id: 'r8b', text: 'Only II follows' }, { id: 'r8c', text: 'Both I and II follow' }, { id: 'r8d', text: 'Neither follows' }], correctAnswer: 'r8b', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q9', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 9, type: 'mcq', topic: 'Direction Sense', difficulty: 'Easy', question: 'P walks 6 km North, turns East and walks 4 km, then turns South and walks 6 km. How far is P from start?', options: [{ id: 'r9a', text: '4 km West' }, { id: 'r9b', text: '4 km East' }, { id: 'r9c', text: '6 km East' }, { id: 'r9d', text: '10 km East' }], correctAnswer: 'r9b', marks: 1, negativeMarks: 0.25 },
        { id: 'reasoning-q10', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 10, type: 'mcq', topic: 'Number Series', difficulty: 'Easy', question: 'Find the next term: 2, 5, 10, 17, 26, ?', options: [{ id: 'r10a', text: '35' }, { id: 'r10b', text: '36' }, { id: 'r10c', text: '37' }, { id: 'r10d', text: '38' }], correctAnswer: 'r10c', marks: 1, negativeMarks: 0.25 },
    ];
    const reasoningTopics = ['Syllogism', 'Inequality', 'Blood Relations', 'Seating Arrangement', 'Coding-Decoding', 'Direction Sense', 'Order & Ranking', 'Puzzles', 'Input-Output', 'Alphanumeric Series', 'Number Series', 'Statement & Conclusions', 'Data Sufficiency', 'Cause & Effect', 'Miscellaneous'];
    for (let i = 0; i < 25; i++) {
        const topic = reasoningTopics[i % reasoningTopics.length];
        const opts = ['Option A', 'Option B', 'Option C', 'Option D'].map((t, idx) => ({ id: `rext${i}-${idx}`, text: t }));
        reasoningQuestions.push({
            id: `reasoning-q${i + 11}`, sectionId: 'reasoning', sectionName: 'Reasoning Ability',
            questionNumber: i + 11, type: 'mcq', topic, difficulty: 'Medium' as const,
            question: `Reasoning question ${i + 11} — ${topic}`, options: opts,
            correctAnswer: opts[0].id, marks: 1, negativeMarks: 0.25,
        });
    }

    // ── QUANTITATIVE ──
    const quantitativeQuestions: ExamQuestion[] = [
        { id: 'quantitative-q1', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 1, type: 'mcq', topic: 'Compound Interest', difficulty: 'Medium', question: 'A sum of money at compound interest doubles in 5 years. In how many years will it become 16 times?', options: [{ id: 'qa1a', text: '10 years' }, { id: 'qa1b', text: '15 years' }, { id: 'qa1c', text: '20 years' }, { id: 'qa1d', text: '25 years' }], correctAnswer: 'qa1c', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q2', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 2, type: 'mcq', topic: 'Ratio & Proportion', difficulty: 'Medium', question: 'Ratio of milk and water is 5:3. If 16 litres of water added, ratio becomes 5:7. Find initial quantity.', options: [{ id: 'qa2a', text: '24 litres' }, { id: 'qa2b', text: '32 litres' }, { id: 'qa2c', text: '40 litres' }, { id: 'qa2d', text: '48 litres' }], correctAnswer: 'qa2c', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q3', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 3, type: 'mcq', topic: 'Speed, Time & Distance', difficulty: 'Medium', question: 'A train crosses a 240m platform in 24s and a pole in 8s. Find length of train.', options: [{ id: 'qa3a', text: '80 m' }, { id: 'qa3b', text: '100 m' }, { id: 'qa3c', text: '120 m' }, { id: 'qa3d', text: '160 m' }], correctAnswer: 'qa3c', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q4', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 4, type: 'mcq', topic: 'Profit & Loss', difficulty: 'Easy', question: 'Shopkeeper marks goods 30% above CP and gives 10% discount. Find profit %.', options: [{ id: 'qa4a', text: '15%' }, { id: 'qa4b', text: '17%' }, { id: 'qa4c', text: '17.5%' }, { id: 'qa4d', text: '18%' }], correctAnswer: 'qa4b', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q5', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 5, type: 'mcq', topic: 'Pipes & Cisterns', difficulty: 'Medium', question: 'Pipes A and B fill a tank in 15 hrs and 20 hrs. Pipe C empties in 25 hrs. All three open — time to fill?', options: [{ id: 'qa5a', text: '12 hours' }, { id: 'qa5b', text: '13.04 hours' }, { id: 'qa5c', text: '15 hours' }, { id: 'qa5d', text: 'None of these' }], correctAnswer: 'qa5b', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q6', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 6, type: 'mcq', setId: 'di-set-1', set: DI_SET, topic: 'Data Interpretation', difficulty: 'Medium', question: 'What is the total number of candidates who appeared for the exam from UP and Bihar together?', options: [{ id: 'diq6a', text: '14,000' }, { id: 'diq6b', text: '15,200' }, { id: 'diq6c', text: '13,500' }, { id: 'diq6d', text: '16,000' }, { id: 'diq6e', text: 'None of these' }], correctAnswer: 'diq6b', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q7', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 7, type: 'mcq', setId: 'di-set-1', set: DI_SET, topic: 'Data Interpretation', difficulty: 'Medium', question: 'What is the difference between the number of candidates selected from Maharashtra and Karnataka?', options: [{ id: 'diq7a', text: '100' }, { id: 'diq7b', text: '150' }, { id: 'diq7c', text: '120' }, { id: 'diq7d', text: '180' }, { id: 'diq7e', text: '130' }], correctAnswer: 'diq7b', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q8', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 8, type: 'mcq', setId: 'di-set-1', set: DI_SET, topic: 'Data Interpretation', difficulty: 'Hard', question: 'What percentage of candidates who appeared from Rajasthan were selected?', options: [{ id: 'diq8a', text: '4%' }, { id: 'diq8b', text: '5%' }, { id: 'diq8c', text: '6%' }, { id: 'diq8d', text: '7%' }, { id: 'diq8e', text: '3%' }], correctAnswer: 'diq8b', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q9', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 9, type: 'mcq', setId: 'di-set-1', set: DI_SET, topic: 'Data Interpretation', difficulty: 'Medium', question: 'The total number of candidates selected from all five states is:', options: [{ id: 'diq9a', text: '1,650' }, { id: 'diq9b', text: '1,720' }, { id: 'diq9c', text: '1,740' }, { id: 'diq9d', text: '1,800' }, { id: 'diq9e', text: '1,640' }], correctAnswer: 'diq9c', marks: 1, negativeMarks: 0.25 },
        { id: 'quantitative-q10', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 10, type: 'mcq', setId: 'di-set-1', set: DI_SET, topic: 'Data Interpretation', difficulty: 'Hard', question: 'The number of candidates appeared from UP is approximately what percent more than that from Karnataka?', options: [{ id: 'diq10a', text: '60%' }, { id: 'diq10b', text: '62.5%' }, { id: 'diq10c', text: '66.7%' }, { id: 'diq10d', text: '70%' }, { id: 'diq10e', text: '58%' }], correctAnswer: 'diq10c', marks: 1, negativeMarks: 0.25 },
    ];
    const quantTopics = ['Simplification', 'Average', 'Percentage', 'Ratio & Proportion', 'Profit & Loss', 'Simple Interest', 'Compound Interest', 'Time & Work', 'Speed, Time & Distance', 'Mensuration', 'Quadratic Equations', 'Number Series', 'Data Sufficiency', 'Permutation & Combination', 'Probability'];
    for (let i = 0; i < 25; i++) {
        const topic = quantTopics[i % quantTopics.length];
        const opts = ['Option A', 'Option B', 'Option C', 'Option D'].map((t, idx) => ({ id: `qext${i}-${idx}`, text: t }));
        quantitativeQuestions.push({
            id: `quantitative-q${i + 11}`, sectionId: 'quantitative', sectionName: 'Quantitative Aptitude',
            questionNumber: i + 11, type: 'mcq', topic, difficulty: 'Medium' as const,
            question: `Quantitative question ${i + 11} — ${topic}`, options: opts,
            correctAnswer: opts[0].id, marks: 1, negativeMarks: 0.25,
        });
    }

    // ── ENGLISH ──
    const englishQuestions: ExamQuestion[] = [
        { id: 'english-q1', sectionId: 'english', sectionName: 'English Language', questionNumber: 1, type: 'mcq', setId: 'rc-set-1', set: RC_SET, topic: 'Reading Comprehension', difficulty: 'Medium', question: 'What best describes the primary objective of Jan Dhan Yojana?', options: [{ id: 'eq1a', text: 'To provide loans to farmers' }, { id: 'eq1b', text: 'To ensure universal access to banking facilities' }, { id: 'eq1c', text: 'To promote digital payment apps' }, { id: 'eq1d', text: 'To fund government schemes directly' }], correctAnswer: 'eq1b', marks: 1, negativeMarks: 0.25 },
        { id: 'english-q2', sectionId: 'english', sectionName: 'English Language', questionNumber: 2, type: 'mcq', setId: 'rc-set-1', set: RC_SET, topic: 'Reading Comprehension', difficulty: 'Easy', question: 'What percentage of Jan Dhan account holders are women?', options: [{ id: 'eq2a', text: '50%' }, { id: 'eq2b', text: '56%' }, { id: 'eq2c', text: '60%' }, { id: 'eq2d', text: '67%' }], correctAnswer: 'eq2b', marks: 1, negativeMarks: 0.25 },
        { id: 'english-q3', sectionId: 'english', sectionName: 'English Language', questionNumber: 3, type: 'mcq', setId: 'rc-set-1', set: RC_SET, topic: 'Reading Comprehension', difficulty: 'Medium', question: 'What does the decline in zero-balance accounts from 77% to 8% indicate?', options: [{ id: 'eq3a', text: 'Failure of the scheme' }, { id: 'eq3b', text: 'People closing accounts' }, { id: 'eq3c', text: 'Active usage of accounts' }, { id: 'eq3d', text: 'Increase in digital fraud' }], correctAnswer: 'eq3c', marks: 1, negativeMarks: 0.25 },
        { id: 'english-q4', sectionId: 'english', sectionName: 'English Language', questionNumber: 4, type: 'mcq', setId: 'rc-set-1', set: RC_SET, topic: 'Reading Comprehension', difficulty: 'Easy', question: 'What does "JAM Trinity" refer to in the passage?', options: [{ id: 'eq4a', text: 'Jan Dhan, Aadhaar, Mobile' }, { id: 'eq4b', text: 'Jan Dhan, ATM, Mobile' }, { id: 'eq4c', text: 'Jan Dhan, Aadhaar, Money' }, { id: 'eq4d', text: 'Jobs, Aadhaar, Mobile' }], correctAnswer: 'eq4a', marks: 1, negativeMarks: 0.25 },
        { id: 'english-q5', sectionId: 'english', sectionName: 'English Language', questionNumber: 5, type: 'mcq', setId: 'rc-set-1', set: RC_SET, topic: 'Reading Comprehension', difficulty: 'Medium', question: 'Which of the following is NOT mentioned as a challenge in the passage?', options: [{ id: 'eq5a', text: 'Digital literacy' }, { id: 'eq5b', text: 'Connectivity in remote areas' }, { id: 'eq5c', text: 'Lack of bank branches' }, { id: 'eq5d', text: 'Cyber fraud awareness' }], correctAnswer: 'eq5c', marks: 1, negativeMarks: 0.25 },
    ];
    const englishTopics = ['Reading Comprehension', 'Cloze Test', 'Error Detection', 'Fill in the Blanks', 'Para Jumbles', 'Vocabulary', 'Phrase Replacement', 'Word Usage', 'Sentence Improvement', 'Idioms & Phrases'];
    const englishExtra = [
        ['Choose SYNONYM of "PROLIFERATE":', ['Spread rapidly', 'Diminish', 'Restrict', 'Decline'], 0],
        ['Choose ANTONYM of "LOQUACIOUS":', ['Taciturn', 'Verbose', 'Garrulous', 'Chatty'], 0],
        ['Fill: "The committee _____ the proposal unanimously."', ['accepted', 'accept', 'accepts', 'accepting'], 0],
        ['Find ERROR: "Each of the students have submitted their assignment."', ['"have" should be "has"', 'No error', 'students→student', 'assignment→assignments'], 0],
        ['Active form of "The song was sung by her beautifully."', ['She sang the song beautifully', 'She beautifully sung the song', 'Her singing was beautiful', 'She has sung the song'], 0],
        ['Fill: "He has been working in this company ___ 2015."', ['since', 'for', 'from', 'by'], 0],
        ['"TO BURN THE MIDNIGHT OIL" means:', ['To cause fire', 'To work late into the night', 'To waste energy', 'To be very angry'], 1],
        ['Choose CORRECTLY SPELLED word:', ['Consciencious', 'Conscientious', 'Consientious', 'Consciontious'], 1],
        ['Indirect speech: He said, "I will come tomorrow."', ['He said he would come the next day', 'He said he will come tomorrow', 'He told he comes next day', 'He said that I will come tomorrow'], 0],
        ['Correct preposition: "She is good ___ mathematics."', ['at', 'in', 'on', 'with'], 0],
        ['Sentence Improvement: "Neither he nor his friends was present."', ['were present', 'are present', 'is present', 'No improvement'], 0],
        ['Cloze: "Banks play a _____ role in the _____ of the economy."', ['pivotal, development', 'trivial, destruction', 'minor, decline', 'crucial, downfall'], 0],
        ['One word substitution: "One who walks in sleep"', ['Somnambulism', 'Somniloquist', 'Somnambulist', 'Somnolent'], 2],
        ['Which word is MISSPELLED?', ['Occurrence', 'Accommodate', 'Necessary', 'Recieve'], 3],
        ['Fill: "The book, along with its supplements, ___ on the table."', ['is', 'are', 'were', 'have been'], 0],
        ['Figure of speech in "Time is money":', ['Metaphor', 'Simile', 'Personification', 'Alliteration'], 0],
        ['Synonym of PAUCITY:', ['Scarcity', 'Abundance', 'Excess', 'Plenty'], 0],
        ['Rearrange: P:the reason Q:he left R:is not clear S:why', ['SRQP', 'SQRP', 'QSRP', 'RSPQ'], 2],
        ['Fill: "He is as strong as ___."', ['an ox', 'a ox', 'the ox', 'oxen'], 0],
        ['Identify correct sentence:', ['I saw him leave the building', 'I seen him left the building', 'I seed him leave', 'I have saw him'], 0],
        ['ANTONYM of BENIGN:', ['Malignant', 'Kind', 'Gentle', 'Harmless'], 0],
        ['Phrasal verb meaning "to postpone":', ['Put off', 'Put on', 'Put up', 'Put away'], 0],
        ['Fill: "The police _____ investigating the case since last week."', ['have been', 'has been', 'is', 'are'], 0],
        ['Choose correctly spelled:', ['Accommodation', 'Accomodation', 'Acomodation', 'Acommodation'], 0],
        ['Fill: "Despite the _____ rain, the match continued."', ['torrential', 'scanty', 'mild', 'moderate'], 0],
    ];
    englishExtra.forEach(([q, opts, ans], i) => {
        const topic = englishTopics[(i + 1) % englishTopics.length];
        englishQuestions.push({
            id: `english-q${i + 6}`, sectionId: 'english', sectionName: 'English Language',
            questionNumber: i + 6, type: 'mcq', topic, difficulty: 'Medium' as const,
            question: q as string,
            options: (opts as string[]).map((t, idx) => ({ id: `eext${i}-${idx}`, text: t })),
            correctAnswer: `eext${i}-${ans as number}`,
            marks: 1, negativeMarks: 0.25,
        });
    });

    return {
        id: testId,
        title: `${category?.toUpperCase()} - ${examId?.toUpperCase()} Mock Test`,
        totalDuration: 60,
        languages: ['English', 'Hindi'],
        instructions: [],
        sections: [
            { id: 'reasoning', name: 'Reasoning Ability', questionsCount: 35, duration: 20, questions: reasoningQuestions },
            { id: 'quantitative', name: 'Quantitative Aptitude', questionsCount: 35, duration: 20, questions: quantitativeQuestions },
            { id: 'english', name: 'English Language', questionsCount: 30, duration: 20, questions: englishQuestions },
        ],
    };
}
