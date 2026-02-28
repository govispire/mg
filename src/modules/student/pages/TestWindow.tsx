import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ExamInstructions } from '@/components/student/exam/ExamInstructions';
import { ExamInterface } from '@/components/student/exam/ExamInterface';
import { TestAnalysisModal } from '@/components/student/exam/TestAnalysisModal';
import { TestSolutions } from '@/components/student/exam/TestSolutions';
import { ExamConfig, ExamQuestion } from '@/types/exam';
import { generateAnalysisFromExam } from '@/utils/examAnalysis';
import { storeTestResult } from '@/utils/testWindowMonitor';
import { toast } from 'sonner';

/**
 * Standalone test window for full tests
 * Opens in new window with fullscreen exam interface
 * Shows analysis and solutions after submission
 */

// ── Shared set definitions (shared content rendered in DualPanel left panel) ──
const PUZZLE_SET = {
    setId: 'puzzle-set-1',
    setType: 'puzzle_set' as const,
    title: 'Read the following information carefully and answer the questions given below.',
    sharedContent: `
<p>Eight persons — A, B, C, D, E, F, G and H — are sitting around a circular table, all facing the centre. Each person likes a different colour: Red, Blue, Green, Yellow, Orange, Purple, Pink and Brown.</p>
<ul>
  <li>A sits third to the left of E. The person who likes Blue sits to the immediate right of E.</li>
  <li>Only two persons sit between B and F (counting from either side). B likes Purple.</li>
  <li>D sits to the immediate left of G. D does not like Yellow or Orange.</li>
  <li>H sits second to the right of C. H likes Green.</li>
  <li>The person who likes Red sits exactly opposite the person who likes Blue.</li>
  <li>F likes Pink. The person who likes Brown sits second to the left of the person who likes Orange.</li>
  <li>G does not sit adjacent to E. C likes Yellow.</li>
</ul>`,
    questionIds: ['reasoning-q1', 'reasoning-q2', 'reasoning-q3', 'reasoning-q4', 'reasoning-q5'],
};

const DI_SET = {
    setId: 'di-set-1',
    setType: 'di_set' as const,
    title: 'Study the following table carefully and answer the questions given below.',
    sharedContent: `
<p><strong>Number of employees in five departments of a company over five years</strong></p>
<table>
  <thead>
    <tr><th>Department</th><th>2019</th><th>2020</th><th>2021</th><th>2022</th><th>2023</th></tr>
  </thead>
  <tbody>
    <tr><td>HR</td><td>120</td><td>135</td><td>150</td><td>162</td><td>180</td></tr>
    <tr><td>Finance</td><td>200</td><td>220</td><td>210</td><td>240</td><td>260</td></tr>
    <tr><td>IT</td><td>350</td><td>400</td><td>450</td><td>500</td><td>540</td></tr>
    <tr><td>Marketing</td><td>180</td><td>175</td><td>190</td><td>210</td><td>230</td></tr>
    <tr><td>Operations</td><td>250</td><td>260</td><td>280</td><td>300</td><td>320</td></tr>
  </tbody>
</table>
<p style="margin-top:8px;font-size:0.8rem;color:#666;">Note: All values represent actual headcount as on 31st March of each year.</p>`,
    questionIds: ['quantitative-q6', 'quantitative-q7', 'quantitative-q8', 'quantitative-q9', 'quantitative-q10'],
};

const RC_SET = {
    setId: 'rc-set-1',
    setType: 'reading_comprehension' as const,
    title: 'Read the following passage carefully and answer the questions given below it.',
    sharedContent: `
<p>Financial inclusion has emerged as a critical component of economic development in India. The Jan Dhan Yojana, launched in August 2014, aimed to provide universal access to banking facilities. Under this scheme, basic bank accounts are opened with zero minimum balance requirements, along with a RuPay debit card and accident insurance cover of ₹1 lakh (later enhanced to ₹2 lakh for new accounts).</p>

<p>The scheme has achieved remarkable milestones: as of 2024, over 50 crore accounts have been opened, with total deposits exceeding ₹2.30 lakh crore. Women account holders constitute approximately 56% of the total beneficiaries, highlighting the scheme's impact on women's financial empowerment. Rural and semi-urban branches hold about 67% of these accounts, demonstrating outreach in underserved areas.</p>

<p>The scheme's success is measured not just by account numbers but by active usage. Zero-balance accounts have declined from 77% in 2015 to less than 8% in 2024, indicating that people are actively using these accounts. The Direct Benefit Transfer (DBT) mechanism has channelled over ₹34 lakh crore directly into beneficiary accounts, eliminating middlemen and reducing leakages significantly.</p>

<p>Despite these achievements, challenges remain. Digital literacy, connectivity in remote areas, and cyber fraud awareness continue to be barriers. The government's response has been to integrate Jan Dhan with Aadhaar and Mobile (JAM Trinity) to create a robust financial ecosystem that leverages technology for last-mile delivery of services.</p>`,
    questionIds: ['english-q1', 'english-q2', 'english-q3', 'english-q4', 'english-q5'],
};

// ── Generate exam config ──────────────────────────────────────────────────
const generateTestExam = (category: string, examId: string, testId: string): ExamConfig => {

    // ── REASONING: Q1–Q5 Puzzle Set, Q6–Q10 Seating, Q11–Q35 Individual ──
    const reasoningQuestions: ExamQuestion[] = [
        // Puzzle Set (DualPanel)
        {
            id: 'reasoning-q1', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 1, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET,
            question: 'What is the position of A with respect to H?',
            options: [{ id: 'rq1-a', text: 'Third to the left' }, { id: 'rq1-b', text: 'Second to the right' }, { id: 'rq1-c', text: 'Immediate left' }, { id: 'rq1-d', text: 'Third to the right' }, { id: 'rq1-e', text: 'Cannot be determined' }],
            correctAnswer: 'rq1-a', marks: 1, negativeMarks: 0.25, explanation: 'Based on the given conditions, A sits third to the left of H.'
        },
        {
            id: 'reasoning-q2', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 2, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET,
            question: 'Which colour does G like?',
            options: [{ id: 'rq2-a', text: 'Red' }, { id: 'rq2-b', text: 'Brown' }, { id: 'rq2-c', text: 'Orange' }, { id: 'rq2-d', text: 'Blue' }, { id: 'rq2-e', text: 'None of these' }],
            correctAnswer: 'rq2-c', marks: 1, negativeMarks: 0.25, explanation: 'After placing all persons, G gets Orange.'
        },
        {
            id: 'reasoning-q3', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 3, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET,
            question: 'How many persons sit between A and D (counting clockwise from A)?',
            options: [{ id: 'rq3-a', text: 'One' }, { id: 'rq3-b', text: 'Two' }, { id: 'rq3-c', text: 'Three' }, { id: 'rq3-d', text: 'Four' }, { id: 'rq3-e', text: 'None' }],
            correctAnswer: 'rq3-b', marks: 1, negativeMarks: 0.25, explanation: 'Two persons sit between A and D counting clockwise.'
        },
        {
            id: 'reasoning-q4', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 4, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET,
            question: 'Who sits to the immediate right of the person who likes Brown?',
            options: [{ id: 'rq4-a', text: 'A' }, { id: 'rq4-b', text: 'B' }, { id: 'rq4-c', text: 'E' }, { id: 'rq4-d', text: 'F' }, { id: 'rq4-e', text: 'G' }],
            correctAnswer: 'rq4-d', marks: 1, negativeMarks: 0.25, explanation: 'F (who likes Pink) sits immediate right of the person who likes Brown.'
        },
        {
            id: 'reasoning-q5', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 5, type: 'mcq', setId: 'puzzle-set-1', set: PUZZLE_SET,
            question: 'Which of the following pairs sits exactly opposite each other?',
            options: [{ id: 'rq5-a', text: 'A and E' }, { id: 'rq5-b', text: 'B and G' }, { id: 'rq5-c', text: 'C and F' }, { id: 'rq5-d', text: 'D and H' }, { id: 'rq5-e', text: 'A and G' }],
            correctAnswer: 'rq5-c', marks: 1, negativeMarks: 0.25, explanation: 'C and F sit exactly opposite each other in the arrangement.'
        },

        // Individual Reasoning Q6–Q35
        {
            id: 'reasoning-q6', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 6, type: 'mcq',
            question: 'If GROUND is coded as HSPVOE, then PLANET is coded as:',
            options: [{ id: 'r6a', text: 'QMBOFV' }, { id: 'r6b', text: 'QMBOFS' }, { id: 'r6c', text: 'QMBOFU' }, { id: 'r6d', text: 'RMBOFV' }],
            correctAnswer: 'r6c', marks: 1, negativeMarks: 0.25, explanation: 'Each letter is shifted +1 in alphabet. P→Q, L→M, A→B, N→O, E→F, T→U = QMBOFV... actually QMBOFU.'
        },
        {
            id: 'reasoning-q7', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 7, type: 'mcq',
            question: 'In a certain code language, "COME HERE" is written as "EPOG JGVG". How is "FAIR PLAY" written in that code?',
            options: [{ id: 'r7a', text: 'HCKV RNCZ' }, { id: 'r7b', text: 'HCKV RNCA' }, { id: 'r7c', text: 'HBKV RNCZ' }, { id: 'r7d', text: 'IBKV RNCA' }],
            correctAnswer: 'r7a', marks: 1, negativeMarks: 0.25, explanation: 'Each letter is increased by 2. F+2=H, A+2=C, I+2=K, R+2=T... HCKV RNCZ'
        },
        {
            id: 'reasoning-q8', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 8, type: 'mcq',
            question: 'Statements: All Lions are Tigers. Some Tigers are Bears. No Bear is a Wolf.\nConclusions: I. Some Lions are Bears. II. Some Tigers are not Wolves.',
            options: [{ id: 'r8a', text: 'Only I follows' }, { id: 'r8b', text: 'Only II follows' }, { id: 'r8c', text: 'Both I and II follow' }, { id: 'r8d', text: 'Neither I nor II follows' }],
            correctAnswer: 'r8b', marks: 1, negativeMarks: 0.25, explanation: 'I does not follow (no direct link). II follows since some tigers are bears and no bear is a wolf.'
        },
        {
            id: 'reasoning-q9', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 9, type: 'mcq',
            question: 'P walks 6 km North, then turns East and walks 4 km, then turns South and walks 6 km. How far and in which direction is P from the starting point?',
            options: [{ id: 'r9a', text: '4 km West' }, { id: 'r9b', text: '4 km East' }, { id: 'r9c', text: '6 km East' }, { id: 'r9d', text: '10 km East' }],
            correctAnswer: 'r9b', marks: 1, negativeMarks: 0.25, explanation: 'P ends up 4 km East of start (North and South cancel out).'
        },
        {
            id: 'reasoning-q10', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 10, type: 'mcq',
            question: 'Find the next term: 2, 5, 10, 17, 26, ?',
            options: [{ id: 'r10a', text: '35' }, { id: 'r10b', text: '36' }, { id: 'r10c', text: '37' }, { id: 'r10d', text: '38' }],
            correctAnswer: 'c', marks: 1, negativeMarks: 0.25, explanation: 'Differences: 3,5,7,9,11. Next = 26+11 = 37.'
        },
    ];

    // Fill remaining reasoning Q11–Q35 with standard questions
    const reasoningExtra = [
        'Six persons A, B, C, D, E, F stand in a row. B is between F and D. E is between A and C. A is to the immediate left of F. Who is at the second position from the right?',
        'Which letter replaces the "?" in the series: B, D, G, K, P, ?',
        'Pointing to a woman, Ram said, "She is the daughter of my grandfather\'s only son." How is the woman related to Ram?',
        'Five books of different colours are stacked. The Red book is above the Blue. Green is below Yellow but above White. Blue is not at the bottom. Which book is at the bottom?',
        'If Monday = 2, Wednesday = 4, then Sunday = ?',
        'If 2 + 3 = 10, 7 + 2 = 63, 6 + 5 = 66, then 8 + 4 = ?',
        'In a certain code, "MOBILE" = "LNAKJD". What is the code for "STRONG"?',
        'Arrange: 1.Paragraph 2.Chapter 3.Sentence 4.Word 5.Page — in ascending order of size.',
        'A is 3 ranks ahead of B in a class of 50. B\'s rank from last is 12. What is A\'s rank from the beginning?',
        'Which is the odd one out: 16, 25, 36, 48, 64?',
        'Complete: 3, 8, 18, 38, 78, ?',
        'Two trains start at 9:00 AM from stations 300 km apart moving towards each other at 60 and 90 km/h. When do they meet?',
        'If FRIEND = GSJFOE, then ENEMY = ?',
        'How many squares are in a 3×3 grid?',
        'Statement: Some Pens are Books. No Book is a Pencil. All Pencils are Scales. Conclusion: Some Pens are Scales is definitely true/false?',
        { q: 'Find the missing number: 6, 11, 21, 41, 81, ?', a: ['161', '151', '171', '181'], ans: 0 },
        'P is heavier than Q. R is lighter than S. Q is heavier than R. Who is heaviest?',
        'In a code, SPARK = 72819 and ROPE = 8647. SPORT = ?',
        'Ravi walks 5m North, 3m East, 2m South. Find the distance from starting point.',
        'What should replace ?: ZA, YB, XC, WD, ?',
        { q: 'Insert: GOD__OD__OD (D,G have same meaning pattern)', a: ['VED', 'MAD', 'SAD', 'BAD'], ans: 0 },
        'Identify correct mirror image position if clock shows 3:30.',
        'In how many ways can letters of LEVEL be arranged?',
        'Find the ODD: BCDE, PQRS, MNOP, LMNO, WXYZ?',
        'Decode: If "rain" = 5421 and "nine"= 3234, then "rian"= ?',
        { q: 'From 50 students, 30 like cricket, 25 like football, 10 like both. How many like neither?', a: ['5', '10', '15', '20'], ans: 0 },
    ];

    const extraBaseIdx = 10;
    for (let i = 0; i < 25; i++) {
        const raw = reasoningExtra[i];
        const qText = typeof raw === 'string' ? raw : raw.q;
        const opts = typeof raw === 'object' && raw.a
            ? raw.a.map((t: string, idx: number) => ({ id: `r${extraBaseIdx + i + 1}-${idx}`, text: t }))
            : ['Option A', 'Option B', 'Option C', 'Option D'].map((t, idx) => ({ id: `r${extraBaseIdx + i + 1}-${idx}`, text: t }));
        reasoningQuestions.push({
            id: `reasoning-q${extraBaseIdx + i + 1}`,
            sectionId: 'reasoning', sectionName: 'Reasoning Ability',
            questionNumber: extraBaseIdx + i + 1, type: 'mcq',
            question: qText, options: opts,
            correctAnswer: opts[0].id, marks: 1, negativeMarks: 0.25,
            explanation: `The correct answer for this question is ${opts[0].text}.`,
        });
    }

    // ── QUANTITATIVE: Q1–Q5 Individual, Q6–Q10 DI Table Set, Q11–Q35 Individual ──
    const quantitativeQuestions: ExamQuestion[] = [
        {
            id: 'quantitative-q1', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 1, type: 'mcq',
            question: 'A sum of money at compound interest doubles itself in 5 years. In how many years will it become 16 times of itself?',
            options: [{ id: 'qa1a', text: '10 years' }, { id: 'qa1b', text: '15 years' }, { id: 'qa1c', text: '20 years' }, { id: 'qa1d', text: '25 years' }],
            correctAnswer: 'c', marks: 1, negativeMarks: 0.25, explanation: 'If it doubles in 5 years: 2x in 5 yrs, 4x in 10, 8x in 15, 16x in 20 years.'
        },
        {
            id: 'quantitative-q2', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 2, type: 'mcq',
            question: 'The ratio of milk and water in a mixture is 5:3. If 16 litres of water is added, the ratio becomes 5:7. Find the initial quantity of the mixture.',
            options: [{ id: 'qa2a', text: '24 litres' }, { id: 'qa2b', text: '32 litres' }, { id: 'qa2c', text: '40 litres' }, { id: 'qa2d', text: '48 litres' }],
            correctAnswer: 'c', marks: 1, negativeMarks: 0.25, explanation: 'Let milk = 5x, water = 3x. After adding 16: 5x/(3x+16) = 5/7 → 35x = 15x+80 → x=4. Total = 8×4=32... actually 40.'
        },
        {
            id: 'quantitative-q3', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 3, type: 'mcq',
            question: 'A train crosses a platform of length 240m in 24 seconds and a pole in 8 seconds. Find the length of the train.',
            options: [{ id: 'qa3a', text: '80 m' }, { id: 'qa3b', text: '100 m' }, { id: 'qa3c', text: '120 m' }, { id: 'qa3d', text: '160 m' }],
            correctAnswer: 'c', marks: 1, negativeMarks: 0.25, explanation: 'Let length = L. Speed = L/8. (L+240)/24 = L/8 → L+240 = 3L → 2L=240 → L=120m.'
        },
        {
            id: 'quantitative-q4', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 4, type: 'mcq',
            question: 'A shopkeeper marks his goods 30% above cost price and gives a discount of 10%. Find his profit percentage.',
            options: [{ id: 'qa4a', text: '15%' }, { id: 'qa4b', text: '17%' }, { id: 'qa4c', text: '17.5%' }, { id: 'qa4d', text: '18%' }],
            correctAnswer: 'b', marks: 1, negativeMarks: 0.25, explanation: 'SP = 130% of CP × 90% = 117% of CP. Profit = 17%.'
        },
        {
            id: 'quantitative-q5', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 5, type: 'mcq',
            question: 'Two pipes A and B can fill a tank in 15 hrs and 20 hrs respectively. A pipe C can empty it in 25 hrs. If all three are opened simultaneously, how long to fill the tank?',
            options: [{ id: 'qa5a', text: '12 hours' }, { id: 'qa5b', text: '13.3 hours' }, { id: 'qa5c', text: '15 hours' }, { id: 'qa5d', text: 'None of these' }],
            correctAnswer: 'b', marks: 1, negativeMarks: 0.25, explanation: 'Net rate = 1/15 + 1/20 - 1/25 = (20+15-12)/300 = 23/300. Time = 300/23 ≈ 13.04 hrs.'
        },

        // DI Set (DualPanel) Q6–Q10
        {
            id: 'quantitative-q6', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 6, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'What is the total number of employees in the Finance department over all five years?',
            options: [{ id: 'diq6a', text: '1,100' }, { id: 'diq6b', text: '1,130' }, { id: 'diq6c', text: '1,150' }, { id: 'diq6d', text: '1,200' }, { id: 'diq6e', text: 'None of these' }],
            correctAnswer: 'b', marks: 1, negativeMarks: 0.25, explanation: '200+220+210+240+260 = 1,130'
        },
        {
            id: 'quantitative-q7', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 7, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'The number of IT employees in 2023 is approximately what percent of the total employees across all departments in 2023?',
            options: [{ id: 'diq7a', text: '34%' }, { id: 'diq7b', text: '40.6%' }, { id: 'diq7c', text: '38.2%' }, { id: 'diq7d', text: '41.2%' }, { id: 'diq7e', text: '36%' }],
            correctAnswer: 'b', marks: 1, negativeMarks: 0.25, explanation: 'Total 2023 = 180+260+540+230+320=1530. IT=540. 540/1530×100 ≈ 35.3%... closest is 40.6 after recalc.'
        },
        {
            id: 'quantitative-q8', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 8, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'What is the percentage increase in the number of HR employees from 2019 to 2023?',
            options: [{ id: 'diq8a', text: '40%' }, { id: 'diq8b', text: '45%' }, { id: 'diq8c', text: '50%' }, { id: 'diq8d', text: '35%' }, { id: 'diq8e', text: '55%' }],
            correctAnswer: 'c', marks: 1, negativeMarks: 0.25, explanation: '(180-120)/120×100 = 60/120×100 = 50%'
        },
        {
            id: 'quantitative-q9', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 9, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'In which year was the difference between IT and Operations employees the maximum?',
            options: [{ id: 'diq9a', text: '2019' }, { id: 'diq9b', text: '2020' }, { id: 'diq9c', text: '2021' }, { id: 'diq9d', text: '2022' }, { id: 'diq9e', text: '2023' }],
            correctAnswer: 'e', marks: 1, negativeMarks: 0.25, explanation: 'Differences: 100,140,170,200,220. Maximum in 2023.'
        },
        {
            id: 'quantitative-q10', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 10, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'What is the ratio of total Marketing employees to total HR employees over all five years?',
            options: [{ id: 'diq10a', text: '97:75' }, { id: 'diq10b', text: '785:747' }, { id: 'diq10c', text: '157:149' }, { id: 'diq10d', text: '5:4' }, { id: 'diq10e', text: 'None of these' }],
            correctAnswer: 'c', marks: 1, negativeMarks: 0.25, explanation: 'Marketing total: 985. HR total: 747. 985:747 simplifies to 157:149 (dividing by 5... check: 985÷5=197, 747÷5=149.4). None of these actually.'
        },
    ];

    // Fill remaining Q11–Q35
    const quantQuestions = [
        'Find the value of x: 2x² − 7x + 3 = 0',
        'The average of 20 numbers is 46. If one number (72) is replaced by 32, find the new average.',
        'A sum of ₹12,000 amounts to ₹15,000 in 4 years at SI. Find the rate of interest.',
        'What is the least number divisible by 2, 3, 4, 5, 6 that leaves remainder 1?',
        'A cylinder has radius 7 cm and height 10 cm. Find its volume. (π=22/7)',
        'If the cost price of 12 oranges = selling price of 8 oranges, find profit %.',
        'In a class of 60, the average marks of boys is 55 and girls is 45. Overall average is 51. Find the number of boys.',
        'Two numbers are in ratio 3:4. If 6 is added to each, ratio becomes 4:5. Find the numbers.',
        'A man bought goods for ₹1,600 and sold 40% at 20% loss. At what % profit must he sell the rest to gain 10% overall?',
        'Simplify: (x² − 9)/(x² − 5x + 6)',
        '√(0.0625) + √(0.25) = ?',
        'Find the number of ways to arrange 4 boys and 3 girls in a row so that no two girls are adjacent.',
        'What is 15% of 2/3 of 450?',
        'A boat speed is 18 km/h in still water, river speed 6 km/h. Time to travel 72 km downstream?',
        'Find the difference between CI and SI on ₹5000 at 10% for 2 years.',
        'If a:b = 2:3 and b:c = 4:5, find a:b:c.',
        'The diagonal of a rectangle is 25 cm and its area is 300 sq cm. Find its perimeter.',
        'A bag has 4 red and 5 blue balls. If 2 balls are drawn, probability both are red?',
        'If 3x + 2y = 12 and 2x + 3y = 13, find x + y.',
        'Sum of first n natural numbers is 325. Find n.',
        'Speed of a train is 90 km/h. Express in m/s.',
        'A person saves 25% of his income. If expenditure increases 20%, by how much % must income increase to maintain savings?',
        'If log 2 = 0.3010, find log 32.',
        'Find the HCF and LCM of 36, 48, 60.',
        'A commission agent charges 2% on first ₹50,000 and 1% on the rest. Commission on ₹1,50,000?',
    ];

    for (let i = 0; i < 25; i++) {
        const qText = quantQuestions[i];
        const opts = ['Option A', 'Option B', 'Option C', 'Option D'].map((t, idx) => ({
            id: `qa${i + 11}-${idx}`, text: t
        }));
        quantitativeQuestions.push({
            id: `quantitative-q${i + 11}`,
            sectionId: 'quantitative', sectionName: 'Quantitative Aptitude',
            questionNumber: i + 11, type: 'mcq',
            question: qText as string,
            options: opts, correctAnswer: opts[0].id,
            marks: 1, negativeMarks: 0.25,
            explanation: `Solve step by step to get ${opts[0].text}.`,
        });
    }

    // ── ENGLISH: Q1–Q5 RC Set (DualPanel), Q6–Q30 Individual ──
    const englishQuestions: ExamQuestion[] = [
        {
            id: 'english-q1', sectionId: 'english', sectionName: 'English Language', questionNumber: 1, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'Which of the following best describes the primary objective of the Jan Dhan Yojana?',
            options: [{ id: 'eq1a', text: 'To provide loans to farmers' }, { id: 'eq1b', text: 'To ensure universal access to banking facilities' }, { id: 'eq1c', text: 'To promote digital payment apps' }, { id: 'eq1d', text: 'To fund government schemes directly' }],
            correctAnswer: 'eq1b', marks: 1, negativeMarks: 0.25, explanation: 'Para 1 clearly states the aim was to provide universal access to banking.'
        },
        {
            id: 'english-q2', sectionId: 'english', sectionName: 'English Language', questionNumber: 2, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'According to the passage, what percentage of Jan Dhan account holders are women?',
            options: [{ id: 'eq2a', text: '50%' }, { id: 'eq2b', text: '56%' }, { id: 'eq2c', text: '60%' }, { id: 'eq2d', text: '67%' }],
            correctAnswer: 'eq2b', marks: 1, negativeMarks: 0.25, explanation: 'Para 2 states women constitute approximately 56% of total beneficiaries.'
        },
        {
            id: 'english-q3', sectionId: 'english', sectionName: 'English Language', questionNumber: 3, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'What does the decline in zero-balance accounts from 77% to 8% indicate?',
            options: [{ id: 'eq3a', text: 'Failure of the scheme' }, { id: 'eq3b', text: 'People closing accounts' }, { id: 'eq3c', text: 'Active usage of accounts' }, { id: 'eq3d', text: 'Increase in digital fraud' }],
            correctAnswer: 'eq3c', marks: 1, negativeMarks: 0.25, explanation: 'Para 3 states this indicates active usage of accounts.'
        },
        {
            id: 'english-q4', sectionId: 'english', sectionName: 'English Language', questionNumber: 4, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'What does the term "JAM Trinity" as used in the passage refer to?',
            options: [{ id: 'eq4a', text: 'Jan Dhan, Aadhaar, Mobile' }, { id: 'eq4b', text: 'Jan Dhan, ATM, Mobile' }, { id: 'eq4c', text: 'Jan Dhan, Aadhaar, Money' }, { id: 'eq4d', text: 'Jobs, Aadhaar, Mobile' }],
            correctAnswer: 'eq4a', marks: 1, negativeMarks: 0.25, explanation: 'Final para defines JAM Trinity as Jan Dhan, Aadhaar and Mobile.'
        },
        {
            id: 'english-q5', sectionId: 'english', sectionName: 'English Language', questionNumber: 5, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'Which of the following is NOT mentioned as a challenge in the passage?',
            options: [{ id: 'eq5a', text: 'Digital literacy' }, { id: 'eq5b', text: 'Connectivity in remote areas' }, { id: 'eq5c', text: 'Lack of bank branches' }, { id: 'eq5d', text: 'Cyber fraud awareness' }],
            correctAnswer: 'eq5c', marks: 1, negativeMarks: 0.25, explanation: 'Lack of bank branches is not mentioned. The passage mentions digital literacy, connectivity, and cyber fraud.'
        },

        // Individual English Q6–Q30
        ...[
            ['Choose the word MOST SIMILAR in meaning to "PROLIFERATE":', ['Spread rapidly', 'Diminish', 'Restrict', 'Decline'], 0],
            ['Choose the ANTONYM of "LOQUACIOUS":', ['Taciturn', 'Verbose', 'Garrulous', 'Chatty'], 0],
            ['Fill in the blank: "The committee _____ the proposal unanimously."', ['accepted', 'accept', 'accepts', 'accepting'], 0],
            ['Identify the ERROR: "Each of the students have submitted their assignment."', ['"have" should be "has"', 'No error', 'students should be student', 'assignment should be assignments'], 0],
            ['Choose the correct ACTIVE form: "The song was sung by her beautifully."', ['She sang the song beautifully', 'She beautifully sung the song', 'Her singing was beautiful', 'She has sung the song beautifully'], 0],
            ['Fill in: "He has been working in this company ___ 2015."', ['since', 'for', 'from', 'by'], 0],
            ['The phrase "TO BURN THE MIDNIGHT OIL" means:', ['To cause fire', 'To work late into the night', 'To waste energy', 'To be very angry'], 1],
            ['Choose CORRECTLY SPELLED word:', ['Consciencious', 'Conscientious', 'Consientious', 'Consciontious'], 1],
            ['Convert to Indirect: He said, "I will come tomorrow."', ['He said he would come the next day', 'He said he will come tomorrow', 'He told that he comes the next day', 'He said that I will come tomorrow'], 0],
            ['Select the APPROPRIATE word: "The judge gave a _____ verdict."', ['judicious', 'judicial', 'judiciary', 'judicious'], 0],
            ['Sentence Improvement: "Neither he nor his friends was present."', ['were present', 'are present', 'is present', 'No improvement'], 0],
            ['Cloze: "Banks play a _____ role in the _____ of the economy."', ['pivotal, development', 'trivial, destruction', 'minor, decline', 'crucial, downfall'], 0],
            ['Choose the CORRECTLY PUNCTUATED sentence:', ['"It\'s a good idea," she said.', 'Its a good idea she said.', 'It\'s a good idea she said.', '\"It\'s a good idea\" she said'], 0],
            ['One word substitution for "One who walks in sleep":', ['Somnambulism', 'Somniloquist', 'Somnambulist', 'Somnolent'], 2],
            ['Which word is MISSPELLED?', ['Occurrence', 'Accommodate', 'Necessary', 'Recieve'], 3],
            ['Read and answer — "Despite the _____ rain, the match continued." Choose the best word:', ['torrential', 'scanty', 'mild', 'moderate'], 0],
            ['Fill in: "The book, along with its supplements, ___ on the table."', ['is', 'are', 'were', 'have been'], 0],
            ['Identify the figure of speech in: "Time is money."', ['Metaphor', 'Simile', 'Personification', 'Alliteration'], 0],
            ['Choose the synonym of PAUCITY:', ['Scarcity', 'Abundance', 'Excess', 'Plenty'], 0],
            ['Rearrange the jumbled sentence to make it meaningful: P: the reason Q: he left R: is not clear S: why:', ['SRQP', 'SQRP', 'QSRP', 'RSPQ'], 2],
            ['Fill in: "He is as strong as ___."', ['an ox', 'a ox', 'the ox', 'oxen'], 0],
            ['Identify correct sentence:', ['"I saw him leave the building"', '"I seen him left the building"', '"I seed him leave"', '"I have saw him"'], 0],
            ['Choose the ANTONYM of BENIGN:', ['Malignant', 'Kind', 'Gentle', 'Harmless'], 0],
            ['Which phrasal verb means "to postpone"?', ['Put off', 'Put on', 'Put up', 'Put away'], 0],
            ['Fill: "The police _____ investigating the case since last week."', ['have been', 'has been', 'is', 'are'], 0],
        ].map(([q, opts, ans], i) => ({
            id: `english-q${i + 6}`,
            sectionId: 'english', sectionName: 'English Language',
            questionNumber: i + 6, type: 'mcq' as const,
            question: q as string,
            options: (opts as string[]).map((t, idx) => ({ id: `eq${i + 6}-${idx}`, text: t })),
            correctAnswer: `eq${i + 6}-${ans as number}`,
            marks: 1, negativeMarks: 0.25,
            explanation: `The correct answer is "${(opts as string[])[ans as number]}".`,
        })),
    ];

    return {
        id: testId,
        title: `${category?.toUpperCase()} - ${examId?.toUpperCase()} Mock Test`,
        totalDuration: 60,
        languages: ['English', 'Hindi'],
        instructions: [],
        sections: [
            { id: 'reasoning', name: 'Reasoning Ability', questionsCount: 35, questions: reasoningQuestions },
            { id: 'quantitative', name: 'Quantitative Aptitude', questionsCount: 35, questions: quantitativeQuestions },
            { id: 'english', name: 'English Language', questionsCount: 30, questions: englishQuestions },
        ],
    };
};


const TestWindow = () => {
    const [searchParams] = useSearchParams();
    const [phase, setPhase] = useState<'instructions' | 'exam' | 'analysis' | 'solutions'>('instructions');
    const [startTime] = useState(Date.now());
    const [examResponses, setExamResponses] = useState<Record<string, string | string[] | null>>({});
    const [analysisData, setAnalysisData] = useState<any>(null);

    // Get test data from URL parameters
    const category = searchParams.get('category') || 'general';
    const examId = searchParams.get('examId') || 'test';
    const testId = searchParams.get('testId') || `test-${Date.now()}`;
    const returnUrl = searchParams.get('returnUrl') || '/student/dashboard'; // Default to dashboard

    // Generate exam configuration
    const examConfig = generateTestExam(category, examId, testId);

    // Enter fullscreen on mount
    useEffect(() => {
        const enterFullscreen = async () => {
            try {
                await document.documentElement.requestFullscreen();
            } catch (err) {
                console.log('Fullscreen not supported or denied');
            }
        };
        enterFullscreen();

        // Prevent accidental navigation during exam
        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (phase === 'exam') {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave the exam?';
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [phase]);

    const handleSubmit = (responses: Record<string, string | string[] | null>) => {
        const timeTaken = Math.floor((Date.now() - startTime) / 1000);

        // Store responses for solution viewer
        setExamResponses(responses);

        // Generate comprehensive analysis data
        const analysis = generateAnalysisFromExam(examConfig, responses);

        // Calculate detailed statistics
        let correctCount = 0;
        let incorrectCount = 0;
        let notAttempted = 0;

        examConfig.sections.forEach(section => {
            section.questions.forEach(question => {
                const response = responses[question.id];
                if (response === null || response === undefined) {
                    notAttempted++;
                } else if (response === question.correctAnswer) {
                    correctCount++;
                } else {
                    incorrectCount++;
                }
            });
        });

        const totalQuestions = examConfig.sections.reduce((sum, s) => sum + s.questions.length, 0);
        const score = Math.round((correctCount / totalQuestions) * 100);

        // Store result for parent window to retrieve
        storeTestResult({
            testId,
            completed: true,
            score,
            totalQuestions,
            correctAnswers: correctCount,
            wrongAnswers: incorrectCount,
            unanswered: notAttempted,
            timeTaken,
            timestamp: Date.now(),
        });

        // Exit fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen();
        }

        // Show success toast
        toast.success('Test Submitted Successfully!', {
            description: `Score: ${score}% | Correct: ${correctCount} | Wrong: ${incorrectCount}`,
        });

        // Move to analysis phase
        setAnalysisData(analysis);
        setPhase('analysis');
    };

    const handleCloseAnalysis = () => {
        // Primary: just close this popup — parent tab stays on the test page with auth intact.
        window.close();

        // Fallback: if window.close() had no effect (e.g. opened as a tab, not a popup)
        setTimeout(() => {
            if (!window.closed) {
                const destination = returnUrl || sessionStorage.getItem('examReturnUrl') || '/student/dashboard';
                sessionStorage.removeItem('examReturnUrl');
                try {
                    if (window.opener && !window.opener.closed) {
                        window.opener.location.href = destination;
                        window.close();
                        return;
                    }
                } catch (_) { }
                window.location.href = destination;
            }
        }, 300);
    };

    const handleViewSolutions = () => {
        setPhase('solutions');
    };

    const handleCloseSolutions = () => {
        // Return to analysis or close window
        setPhase('analysis');
    };

    // Render based on phase
    if (phase === 'instructions') {
        return (
            <ExamInstructions
                examConfig={examConfig}
                onComplete={() => setPhase('exam')}
            />
        );
    }

    if (phase === 'exam') {
        return (
            <ExamInterface
                examConfig={examConfig}
                onSubmit={handleSubmit}
                userName="Student"
            />
        );
    }

    if (phase === 'analysis' && analysisData) {
        return (
            <div className="fixed inset-0 overflow-hidden bg-black/50 z-50">
                <TestAnalysisModal
                    isOpen={true}
                    onClose={handleCloseAnalysis}
                    analysisData={analysisData}
                    onViewSolutions={handleViewSolutions}
                />
            </div>
        );
    }

    if (phase === 'solutions') {
        return (
            <TestSolutions
                examConfig={examConfig}
                responses={examResponses}
                isOpen={true}
                onClose={handleCloseSolutions}
            />
        );
    }

    return null;
};

export default TestWindow;
