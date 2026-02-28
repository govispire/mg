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
    title: 'Study the following bar graph carefully and answer the questions given below.',
    sharedContent: `
<p style="font-size:0.8rem;font-weight:600;margin-bottom:6px;color:#1a1a1a;">
  The following bar graph shows the number of candidates who <strong>Appeared</strong> and were <strong>Selected</strong>
  in a recruitment examination conducted by a PSU bank across five states.
</p>

<!-- Inline SVG Bar Chart -->
<svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:440px;display:block;margin:0 auto 8px;font-family:sans-serif;">
  <!-- Background -->
  <rect width="460" height="260" fill="#fff" rx="4"/>

  <!-- Title -->
  <text x="230" y="18" text-anchor="middle" font-size="9.5" font-weight="bold" fill="#222">Number of Candidates Appeared &amp; Selected (in hundreds)</text>

  <!-- Y-axis gridlines and labels (0 to 90) -->
  <!-- y=200 is baseline (0), y=30 is top (90) — scale: 1 unit = (200-30)/90 ≈ 1.89px -->
  <line x1="55" y1="200" x2="430" y2="200" stroke="#ddd" stroke-width="0.8"/>
  <line x1="55" y1="162" x2="430" y2="162" stroke="#eee" stroke-width="0.6"/>
  <line x1="55" y1="124" x2="430" y2="124" stroke="#eee" stroke-width="0.6"/>
  <line x1="55" y1="86"  x2="430" y2="86"  stroke="#eee" stroke-width="0.6"/>
  <line x1="55" y1="48"  x2="430" y2="48"  stroke="#eee" stroke-width="0.6"/>
  <text x="50" y="203" text-anchor="end" font-size="8" fill="#555">0</text>
  <text x="50" y="165" text-anchor="end" font-size="8" fill="#555">20</text>
  <text x="50" y="127" text-anchor="end" font-size="8" fill="#555">40</text>
  <text x="50" y="89"  text-anchor="end" font-size="8" fill="#555">60</text>
  <text x="50" y="51"  text-anchor="end" font-size="8" fill="#555">80</text>

  <!-- Y-axis line -->
  <line x1="55" y1="30" x2="55" y2="200" stroke="#999" stroke-width="1"/>
  <!-- X-axis line -->
  <line x1="55" y1="200" x2="430" y2="200" stroke="#999" stroke-width="1"/>

  <!-- Y-axis label -->
  <text x="14" y="120" text-anchor="middle" font-size="8" fill="#555" transform="rotate(-90,14,120)">No. of Candidates (hundreds)</text>

  <!-- Group spacing: 5 groups, each 70px wide from x=60 -->
  <!-- State: UP  | Appeared=80, Selected=4.8 -->
  <rect x="64"  y="49"  width="18" height="151" fill="#1976d2"/>
  <rect x="84"  y="191" width="18" height="9"   fill="#e65100"/>
  <text x="83"  y="213" text-anchor="middle" font-size="8.5" fill="#333">UP</text>

  <!-- State: Maharashtra | Appeared=65, Selected=3.9 -->
  <rect x="134" y="77"  width="18" height="123" fill="#1976d2"/>
  <rect x="154" y="193" width="18" height="7"   fill="#e65100"/>
  <text x="153" y="213" text-anchor="middle" font-size="8.5" fill="#333">MH</text>

  <!-- State: Bihar | Appeared=72, Selected=3.6 -->
  <rect x="204" y="64"  width="18" height="136" fill="#1976d2"/>
  <rect x="224" y="193" width="18" height="7"   fill="#e65100"/>
  <text x="223" y="213" text-anchor="middle" font-size="8.5" fill="#333">Bihar</text>

  <!-- State: Rajasthan | Appeared=54, Selected=2.7 -->
  <rect x="274" y="98"  width="18" height="102" fill="#1976d2"/>
  <rect x="294" y="195" width="18" height="5"   fill="#e65100"/>
  <text x="293" y="213" text-anchor="middle" font-size="8.5" fill="#333">Raj.</text>

  <!-- State: Karnataka | Appeared=48, Selected=2.4 -->
  <rect x="344" y="109" width="18" height="91"  fill="#1976d2"/>
  <rect x="364" y="195" width="18" height="5"   fill="#e65100"/>
  <text x="373" y="213" text-anchor="middle" font-size="8.5" fill="#333">KA</text>

  <!-- Value labels on bars -->
  <text x="73"  y="46"  text-anchor="middle" font-size="7.5" fill="#1565c0" font-weight="bold">8000</text>
  <text x="143" y="74"  text-anchor="middle" font-size="7.5" fill="#1565c0" font-weight="bold">6500</text>
  <text x="213" y="61"  text-anchor="middle" font-size="7.5" fill="#1565c0" font-weight="bold">7200</text>
  <text x="283" y="95"  text-anchor="middle" font-size="7.5" fill="#1565c0" font-weight="bold">5400</text>
  <text x="353" y="106" text-anchor="middle" font-size="7.5" fill="#1565c0" font-weight="bold">4800</text>
  <text x="93"  y="188" text-anchor="middle" font-size="7"   fill="#bf360c">480</text>
  <text x="163" y="190" text-anchor="middle" font-size="7"   fill="#bf360c">390</text>
  <text x="233" y="190" text-anchor="middle" font-size="7"   fill="#bf360c">360</text>
  <text x="303" y="192" text-anchor="middle" font-size="7"   fill="#bf360c">270</text>
  <text x="373" y="192" text-anchor="middle" font-size="7"   fill="#bf360c">240</text>

  <!-- Legend -->
  <rect x="100" y="228" width="12" height="10" fill="#1976d2"/>
  <text x="115" y="237" font-size="8.5" fill="#333">Appeared</text>
  <rect x="200" y="228" width="12" height="10" fill="#e65100"/>
  <text x="215" y="237" font-size="8.5" fill="#333">Selected</text>
</svg>

<!-- Supporting data table for reference -->
<table style="width:100%;border-collapse:collapse;font-size:0.76rem;margin-top:4px;">
  <thead>
    <tr style="background:#1976d2;color:#fff;">
      <th style="padding:4px 6px;border:1px solid #1565c0;">State</th>
      <th style="padding:4px 6px;border:1px solid #1565c0;">Appeared</th>
      <th style="padding:4px 6px;border:1px solid #1565c0;">Selected</th>
      <th style="padding:4px 6px;border:1px solid #1565c0;">Selection %</th>
    </tr>
  </thead>
  <tbody>
    <tr><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">UP</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">8,000</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">480</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">6%</td></tr>
    <tr style="background:#f9f9f9;"><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">Maharashtra</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">6,500</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">390</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">6%</td></tr>
    <tr><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">Bihar</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">7,200</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">360</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">5%</td></tr>
    <tr style="background:#f9f9f9;"><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">Rajasthan</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">5,400</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">270</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">5%</td></tr>
    <tr><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">Karnataka</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">4,800</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">240</td><td style="padding:3px 6px;border:1px solid #ddd;text-align:center;">5%</td></tr>
  </tbody>
</table>`,
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

    // ── REASONING: Q1–Q5 Puzzle Set (DualPanel), Q6–Q35 Individual ──
    const reasoningQuestions: ExamQuestion[] = [
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
        {
            id: 'reasoning-q6', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 6, type: 'mcq',
            question: 'If GROUND is coded as HSPVOE, then PLANET is coded as:',
            options: [{ id: 'r6a', text: 'QMBOFV' }, { id: 'r6b', text: 'QMBOFS' }, { id: 'r6c', text: 'QMBOFU' }, { id: 'r6d', text: 'RMBOFV' }],
            correctAnswer: 'r6c', marks: 1, negativeMarks: 0.25, explanation: 'Each letter is shifted +1. P→Q,L→M,A→B,N→O,E→F,T→U = QMBOFU.'
        },
        {
            id: 'reasoning-q7', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 7, type: 'mcq',
            question: 'In a certain code "COME HERE" is written as "EPOG JGVG". How is "FAIR PLAY" written?',
            options: [{ id: 'r7a', text: 'HCKV RNCZ' }, { id: 'r7b', text: 'HCKV RNCA' }, { id: 'r7c', text: 'HBKV RNCZ' }, { id: 'r7d', text: 'IBKV RNCA' }],
            correctAnswer: 'r7a', marks: 1, negativeMarks: 0.25, explanation: 'Each letter is increased by 2 in the alphabet.'
        },
        {
            id: 'reasoning-q8', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 8, type: 'mcq',
            question: 'Statements: All Lions are Tigers. Some Tigers are Bears. No Bear is a Wolf. Conclusions: I. Some Lions are Bears. II. Some Tigers are not Wolves.',
            options: [{ id: 'r8a', text: 'Only I follows' }, { id: 'r8b', text: 'Only II follows' }, { id: 'r8c', text: 'Both I and II follow' }, { id: 'r8d', text: 'Neither follows' }],
            correctAnswer: 'r8b', marks: 1, negativeMarks: 0.25, explanation: 'Only II follows — some tigers being bears with no bear being a wolf means some tigers are not wolves.'
        },
        {
            id: 'reasoning-q9', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 9, type: 'mcq',
            question: 'P walks 6 km North, turns East and walks 4 km, then turns South and walks 6 km. How far is P from start?',
            options: [{ id: 'r9a', text: '4 km West' }, { id: 'r9b', text: '4 km East' }, { id: 'r9c', text: '6 km East' }, { id: 'r9d', text: '10 km East' }],
            correctAnswer: 'r9b', marks: 1, negativeMarks: 0.25, explanation: 'North and South cancel. P ends up 4 km East of start.'
        },
        {
            id: 'reasoning-q10', sectionId: 'reasoning', sectionName: 'Reasoning Ability', questionNumber: 10, type: 'mcq',
            question: 'Find the next term: 2, 5, 10, 17, 26, ?',
            options: [{ id: 'r10a', text: '35' }, { id: 'r10b', text: '36' }, { id: 'r10c', text: '37' }, { id: 'r10d', text: '38' }],
            correctAnswer: 'r10c', marks: 1, negativeMarks: 0.25, explanation: 'Differences: 3,5,7,9,11. Next = 26+11 = 37.'
        },
    ];

    const reasoningExtra = [
        'Six persons A,B,C,D,E,F stand in a row. B is between F and D. E is between A and C. A is to immediate left of F. Who is second from right?',
        'Which letter replaces "?" in: B, D, G, K, P, ?',
        'Pointing to a woman, Ram said "She is the daughter of my grandfather\'s only son." How is she related to Ram?',
        'Five books are stacked. Red is above Blue. Green is below Yellow but above White. Blue is not at bottom. Which book is at the bottom?',
        'If Monday=2, Wednesday=4, then Sunday=?',
        'If 2+3=10, 7+2=63, 6+5=66, then 8+4=?',
        'In a certain code MOBILE = LNAKJD. What is the code for STRONG?',
        'Arrange in ascending order of size: 1.Paragraph 2.Chapter 3.Sentence 4.Word 5.Page',
        'A is 3 ranks ahead of B in class of 50. B\'s rank from last is 12. What is A\'s rank from beginning?',
        'Which is odd one out: 16, 25, 36, 48, 64?',
        'Complete: 3, 8, 18, 38, 78, ?',
        'Two trains from stations 300 km apart, moving toward each other at 60 and 90 km/h, start at 9:00 AM. When do they meet?',
        'If FRIEND = GSJFOE, then ENEMY = ?',
        'How many squares are in a 3×3 grid?',
        'Statement: Some Pens are Books. No Book is Pencil. All Pencils are Scales. Is "Some Pens are Scales" true?',
        'Find the missing number: 6, 11, 21, 41, 81, ?',
        'P is heavier than Q. R is lighter than S. Q is heavier than R. Who is heaviest?',
        'In a code SPARK=72819 and ROPE=8647. What is SPORT?',
        'Ravi walks 5m North, 3m East, 2m South. What is his distance from starting point?',
        'What should replace ?: ZA, YB, XC, WD, ?',
        'How many triangles in a figure with 4 vertices where D is inside triangle ABC?',
        'Identify correct mirror image position if clock shows 3:30.',
        'In how many ways can letters of LEVEL be arranged?',
        'Find the ODD: BCDE, PQRS, MNOP, LMNO, WXYZ',
        'From 50 students, 30 like cricket, 25 like football, 10 like both. How many like neither?',
    ];

    for (let i = 0; i < 25; i++) {
        const qText = reasoningExtra[i];
        const opts = ['Option A', 'Option B', 'Option C', 'Option D'].map((t, idx) => ({ id: `rext${i}-${idx}`, text: t }));
        reasoningQuestions.push({
            id: `reasoning-q${i + 11}`, sectionId: 'reasoning', sectionName: 'Reasoning Ability',
            questionNumber: i + 11, type: 'mcq', question: qText, options: opts,
            correctAnswer: opts[0].id, marks: 1, negativeMarks: 0.25,
            explanation: `The correct answer is ${opts[0].text}.`,
        });
    }

    // ── QUANTITATIVE: Q1–Q5 Individual, Q6–Q10 DI Set (DualPanel), Q11–Q35 Individual ──
    const quantitativeQuestions: ExamQuestion[] = [
        {
            id: 'quantitative-q1', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 1, type: 'mcq',
            question: 'A sum of money at compound interest doubles in 5 years. In how many years will it become 16 times?',
            options: [{ id: 'qa1a', text: '10 years' }, { id: 'qa1b', text: '15 years' }, { id: 'qa1c', text: '20 years' }, { id: 'qa1d', text: '25 years' }],
            correctAnswer: 'qa1c', marks: 1, negativeMarks: 0.25, explanation: '2x→5yr, 4x→10yr, 8x→15yr, 16x→20yr.'
        },
        {
            id: 'quantitative-q2', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 2, type: 'mcq',
            question: 'Ratio of milk and water is 5:3. If 16 litres of water added, ratio becomes 5:7. Find initial quantity.',
            options: [{ id: 'qa2a', text: '24 litres' }, { id: 'qa2b', text: '32 litres' }, { id: 'qa2c', text: '40 litres' }, { id: 'qa2d', text: '48 litres' }],
            correctAnswer: 'qa2c', marks: 1, negativeMarks: 0.25, explanation: '5x/(3x+16)=5/7 → x=4. Total=8×4+8=40.'
        },
        {
            id: 'quantitative-q3', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 3, type: 'mcq',
            question: 'A train crosses a 240m platform in 24s and a pole in 8s. Find length of train.',
            options: [{ id: 'qa3a', text: '80 m' }, { id: 'qa3b', text: '100 m' }, { id: 'qa3c', text: '120 m' }, { id: 'qa3d', text: '160 m' }],
            correctAnswer: 'qa3c', marks: 1, negativeMarks: 0.25, explanation: 'L/8=(L+240)/24 → 2L=240 → L=120m.'
        },
        {
            id: 'quantitative-q4', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 4, type: 'mcq',
            question: 'Shopkeeper marks goods 30% above CP and gives 10% discount. Find profit %.',
            options: [{ id: 'qa4a', text: '15%' }, { id: 'qa4b', text: '17%' }, { id: 'qa4c', text: '17.5%' }, { id: 'qa4d', text: '18%' }],
            correctAnswer: 'qa4b', marks: 1, negativeMarks: 0.25, explanation: 'SP=130%×90%=117% of CP. Profit=17%.'
        },
        {
            id: 'quantitative-q5', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 5, type: 'mcq',
            question: 'Pipes A and B fill a tank in 15 hrs and 20 hrs. Pipe C empties in 25 hrs. All three open — time to fill?',
            options: [{ id: 'qa5a', text: '12 hours' }, { id: 'qa5b', text: '13.04 hours' }, { id: 'qa5c', text: '15 hours' }, { id: 'qa5d', text: 'None of these' }],
            correctAnswer: 'qa5b', marks: 1, negativeMarks: 0.25, explanation: 'Net=1/15+1/20−1/25=23/300. Time=300/23≈13.04hrs.'
        },


        // DI Set Q6–Q10 (DualPanel — Bar Graph)
        {
            id: 'quantitative-q6', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 6, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'What is the total number of candidates who appeared for the exam from UP and Bihar together?',
            options: [{ id: 'diq6a', text: '14,000' }, { id: 'diq6b', text: '15,200' }, { id: 'diq6c', text: '13,500' }, { id: 'diq6d', text: '16,000' }, { id: 'diq6e', text: 'None of these' }],
            correctAnswer: 'diq6b', marks: 1, negativeMarks: 0.25, explanation: 'UP Appeared = 8,000 + Bihar Appeared = 7,200 = 15,200.'
        },
        {
            id: 'quantitative-q7', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 7, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'What is the difference between the number of candidates selected from Maharashtra and Karnataka?',
            options: [{ id: 'diq7a', text: '100' }, { id: 'diq7b', text: '150' }, { id: 'diq7c', text: '120' }, { id: 'diq7d', text: '180' }, { id: 'diq7e', text: '130' }],
            correctAnswer: 'diq7b', marks: 1, negativeMarks: 0.25, explanation: 'Maharashtra Selected = 390, Karnataka Selected = 240. Difference = 390 − 240 = 150.'
        },
        {
            id: 'quantitative-q8', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 8, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'What percentage of candidates who appeared from Rajasthan were selected?',
            options: [{ id: 'diq8a', text: '4%' }, { id: 'diq8b', text: '5%' }, { id: 'diq8c', text: '6%' }, { id: 'diq8d', text: '7%' }, { id: 'diq8e', text: '3%' }],
            correctAnswer: 'diq8b', marks: 1, negativeMarks: 0.25, explanation: '(270 / 5400) × 100 = 5%.'
        },
        {
            id: 'quantitative-q9', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 9, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'The total number of candidates selected from all five states is:',
            options: [{ id: 'diq9a', text: '1,650' }, { id: 'diq9b', text: '1,720' }, { id: 'diq9c', text: '1,740' }, { id: 'diq9d', text: '1,800' }, { id: 'diq9e', text: '1,640' }],
            correctAnswer: 'diq9c', marks: 1, negativeMarks: 0.25, explanation: '480 + 390 + 360 + 270 + 240 = 1,740.'
        },
        {
            id: 'quantitative-q10', sectionId: 'quantitative', sectionName: 'Quantitative Aptitude', questionNumber: 10, type: 'mcq', setId: 'di-set-1', set: DI_SET,
            question: 'The number of candidates appeared from UP is approximately what percent more than that from Karnataka?',
            options: [{ id: 'diq10a', text: '60%' }, { id: 'diq10b', text: '62.5%' }, { id: 'diq10c', text: '66.7%' }, { id: 'diq10d', text: '70%' }, { id: 'diq10e', text: '58%' }],
            correctAnswer: 'diq10c', marks: 1, negativeMarks: 0.25, explanation: '((8000 − 4800) / 4800) × 100 = 3200/4800 × 100 = 66.67% ≈ 66.7%.'
        },
    ];



    const quantExtra = [
        'Find x: 2x²−7x+3=0', 'Average of 20 numbers is 46. One number 72 is replaced by 32. Find new average.',
        'Rs.12,000 amounts to Rs.15,000 in 4 years at SI. Find rate of interest.',
        'Least number divisible by 2,3,4,5,6 leaving remainder 1.',
        'Cylinder radius 7cm height 10cm. Find volume. (π=22/7)',
        'If CP of 12 oranges = SP of 8 oranges, find profit %.',
        'Class of 60: boys avg 55, girls avg 45, overall avg 51. Find number of boys.',
        'Two numbers in ratio 3:4. If 6 added to each, ratio becomes 4:5. Find numbers.',
        'Man bought goods for Rs.1600. Sold 40% at 20% loss. At what % profit sell rest to gain 10% overall?',
        'Simplify: (x²−9)/(x²−5x+6)', '√(0.0625)+√(0.25)=?',
        'Arrange 4 boys and 3 girls in a row so no two girls are adjacent.',
        '15% of 2/3 of 450=?', 'Boat speed 18km/h still water, river 6km/h. Time to travel 72km downstream?',
        'Difference between CI and SI on Rs.5000 at 10% for 2 years.',
        'If a:b=2:3 and b:c=4:5, find a:b:c.', 'Diagonal of rectangle is 25cm, area 300 sq cm. Find perimeter.',
        'Bag has 4 red and 5 blue balls. 2 drawn. Probability both are red?',
        '3x+2y=12 and 2x+3y=13. Find x+y.', 'Sum of first n natural numbers is 325. Find n.',
        'Train speed 90km/h. Express in m/s.', 'Person saves 25% of income. Expenditure rises 20%. Income must rise by what % to save same amount?',
        'log2=0.3010. Find log32.', 'HCF and LCM of 36,48,60.',
        'Agent charges 2% on first Rs.50,000 and 1% on rest. Commission on Rs.1,50,000?',
    ];

    for (let i = 0; i < 25; i++) {
        const opts = ['Option A', 'Option B', 'Option C', 'Option D'].map((t, idx) => ({ id: `qext${i}-${idx}`, text: t }));
        quantitativeQuestions.push({
            id: `quantitative-q${i + 11}`, sectionId: 'quantitative', sectionName: 'Quantitative Aptitude',
            questionNumber: i + 11, type: 'mcq', question: quantExtra[i],
            options: opts, correctAnswer: opts[0].id, marks: 1, negativeMarks: 0.25,
            explanation: `Solve step by step to get ${opts[0].text}.`,
        });
    }

    // ── ENGLISH: Q1–Q5 RC Set (DualPanel), Q6–Q30 Individual ──
    const englishQuestions: ExamQuestion[] = [
        {
            id: 'english-q1', sectionId: 'english', sectionName: 'English Language', questionNumber: 1, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'What best describes the primary objective of Jan Dhan Yojana?',
            options: [{ id: 'eq1a', text: 'To provide loans to farmers' }, { id: 'eq1b', text: 'To ensure universal access to banking facilities' }, { id: 'eq1c', text: 'To promote digital payment apps' }, { id: 'eq1d', text: 'To fund government schemes directly' }],
            correctAnswer: 'eq1b', marks: 1, negativeMarks: 0.25, explanation: 'Para 1 states the aim was to provide universal access to banking.'
        },
        {
            id: 'english-q2', sectionId: 'english', sectionName: 'English Language', questionNumber: 2, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'What percentage of Jan Dhan account holders are women?',
            options: [{ id: 'eq2a', text: '50%' }, { id: 'eq2b', text: '56%' }, { id: 'eq2c', text: '60%' }, { id: 'eq2d', text: '67%' }],
            correctAnswer: 'eq2b', marks: 1, negativeMarks: 0.25, explanation: 'Para 2 states women constitute approximately 56%.'
        },
        {
            id: 'english-q3', sectionId: 'english', sectionName: 'English Language', questionNumber: 3, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'What does the decline in zero-balance accounts from 77% to 8% indicate?',
            options: [{ id: 'eq3a', text: 'Failure of the scheme' }, { id: 'eq3b', text: 'People closing accounts' }, { id: 'eq3c', text: 'Active usage of accounts' }, { id: 'eq3d', text: 'Increase in digital fraud' }],
            correctAnswer: 'eq3c', marks: 1, negativeMarks: 0.25, explanation: 'Para 3 states this indicates active usage.'
        },
        {
            id: 'english-q4', sectionId: 'english', sectionName: 'English Language', questionNumber: 4, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'What does "JAM Trinity" refer to in the passage?',
            options: [{ id: 'eq4a', text: 'Jan Dhan, Aadhaar, Mobile' }, { id: 'eq4b', text: 'Jan Dhan, ATM, Mobile' }, { id: 'eq4c', text: 'Jan Dhan, Aadhaar, Money' }, { id: 'eq4d', text: 'Jobs, Aadhaar, Mobile' }],
            correctAnswer: 'eq4a', marks: 1, negativeMarks: 0.25, explanation: 'Last para defines JAM Trinity as Jan Dhan, Aadhaar and Mobile.'
        },
        {
            id: 'english-q5', sectionId: 'english', sectionName: 'English Language', questionNumber: 5, type: 'mcq', setId: 'rc-set-1', set: RC_SET,
            question: 'Which of the following is NOT mentioned as a challenge in the passage?',
            options: [{ id: 'eq5a', text: 'Digital literacy' }, { id: 'eq5b', text: 'Connectivity in remote areas' }, { id: 'eq5c', text: 'Lack of bank branches' }, { id: 'eq5d', text: 'Cyber fraud awareness' }],
            correctAnswer: 'eq5c', marks: 1, negativeMarks: 0.25, explanation: 'Lack of bank branches is not mentioned in the passage.'
        },
    ];

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
        englishQuestions.push({
            id: `english-q${i + 6}`, sectionId: 'english', sectionName: 'English Language',
            questionNumber: i + 6, type: 'mcq', question: q as string,
            options: (opts as string[]).map((t, idx) => ({ id: `eext${i}-${idx}`, text: t })),
            correctAnswer: `eext${i}-${ans as number}`,
            marks: 1, negativeMarks: 0.25,
            explanation: `The correct answer is "${(opts as string[])[ans as number]}".`,
        });
    });

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
