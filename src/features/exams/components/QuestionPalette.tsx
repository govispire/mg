import React from 'react';
import { Button } from '@/components/ui/button';
import { QuestionButton, getBgStyle, spriteMap } from '@/components/question-palette/QuestionButton';
import type { PaletteStatus } from '@/components/question-palette/QuestionButton';
import '@/components/question-palette/palette.css';

function toSpriteStatus(str: string): PaletteStatus {
  if (str === 'answered') return 'answered';
  if (str === 'not-answered') return 'not-answered';
  if (str === 'marked') return 'marked';
  if (str === 'answered-marked') return 'answered-marked';
  return 'not-visited';
}

const LEGEND: { status: PaletteStatus; label: string; key: keyof ReturnType<QuestionPaletteProps['getPaletteStats']> }[] = [
  { status: 'answered', label: 'Answered', key: 'answered' },
  { status: 'not-answered', label: 'Not Answered', key: 'notAnswered' },
  { status: 'marked', label: 'Marked', key: 'marked' },
  { status: 'answered-marked', label: 'Answered & Marked', key: 'answeredMarked' },
  { status: 'not-visited', label: 'Not Visited', key: 'notVisited' },
];

interface QuestionPaletteProps {
  showQuestionPalette: boolean;
  toggleQuestionPalette: () => void;
  isMobile: boolean;
  currentQuestion: { id: number; section: string };
  mockQuestions: Array<{
    id: number; section: string; question: string;
    options: string[]; answer: number | null; type: string;
  }>;
  getQuestionStatus: (questionId: number) => {
    status: string; label: string; bgColor: string; textColor: string;
  };
  getPaletteStats: () => {
    answered: number; notAnswered: number; marked: number;
    answeredMarked: number; notVisited: number; total: number;
  };
  goToQuestion: (questionId: number) => void;
}

const QuestionPalette: React.FC<QuestionPaletteProps> = ({
  showQuestionPalette, toggleQuestionPalette, isMobile,
  currentQuestion, mockQuestions, getQuestionStatus, getPaletteStats, goToQuestion
}) => {
  if (!showQuestionPalette) return null;
  const stats = getPaletteStats();

  return (
    <div className="border-t">
      {isMobile && (
        <div className="p-2 bg-white border-b flex justify-center">
          <Button variant="outline" size="sm" onClick={toggleQuestionPalette} className="w-full sm:w-auto">
            {showQuestionPalette ? 'Hide Question Palette' : 'Show Question Palette'}
          </Button>
        </div>
      )}

      <div className="bg-white p-3">
        <div className="mb-2">
          <h3 className="font-medium text-sm">{currentQuestion.section}</h3>
          <div className="text-sm mb-1">Choose a Question</div>
        </div>

        <div className="grid grid-cols-5 sm:grid-cols-8 md:grid-cols-10 gap-2 mb-4">
          {mockQuestions.map((question) => {
            const { status } = getQuestionStatus(question.id);
            return (
              <div key={question.id} className="flex items-center justify-center">
                <QuestionButton
                  questionNumber={question.id}
                  status={toSpriteStatus(status)}
                  isCurrent={currentQuestion.id === question.id}
                  size={40}
                  onClick={() => goToQuestion(question.id)}
                />
              </div>
            );
          })}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-xs">
          {LEGEND.map(({ status, label, key }) => {
            const bgStyle = getBgStyle(status, 24);
            const textColor = spriteMap[status]?.textColor ?? '#fff';
            return (
              <div key={status} className="flex items-center gap-2">
                <div className="relative flex-shrink-0" style={{ width: 24, height: 24 }}>
                  <span style={bgStyle} aria-hidden="true" />
                  <span style={{
                    position: 'absolute', inset: 0, display: 'grid', placeItems: 'center',
                    fontWeight: 700, fontSize: 9, color: textColor,
                  }}>
                    {stats[key]}
                  </span>
                </div>
                <span>{label} ({stats[key]})</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuestionPalette;
