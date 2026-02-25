
import React from 'react';

interface QuestionContentProps {
  currentQuestion: {
    id: number;
    question: string;
    options: string[];
    section: string;
    type: string;
    answer: number | null;
  };
  currentQuestionIndex: number;
  answers: {[key: number]: number | null};
  handleAnswerSelect: (questionId: number, optionIndex: number) => void;
}

const QuestionContent: React.FC<QuestionContentProps> = ({
  currentQuestion,
  currentQuestionIndex,
  answers,
  handleAnswerSelect
}) => {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Question No. {currentQuestion.id}</h3>
      </div>
      
      {currentQuestionIndex === 1 ? (
        <div>
          {/* Data Interpretation Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Left column - Chart/Table */}
            <div className="border rounded p-4 bg-gray-50">
              <h4 className="font-medium mb-3">Data Chart</h4>
              <div className="aspect-video bg-white border flex items-center justify-center">
                <p className="text-center text-gray-500">
                  [Chart or image would be displayed here]
                </p>
              </div>
              <p className="mt-3 text-sm">
                Study the table/chart carefully and answer the following question.
              </p>
            </div>
            
            {/* Right column - Question and options */}
            <div>
              <p className="mb-6">{currentQuestion.question}</p>
              
              <div className="space-y-3">
                {currentQuestion.options.map((option, index) => (
                  <div 
                    key={index} 
                    className="flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleAnswerSelect(currentQuestion.id, index)}
                  >
                    <div className="w-5 h-5 flex items-center justify-center">
                      <input
                        type="radio"
                        checked={answers[currentQuestion.id] === index}
                        onChange={() => {}}
                        className="w-4 h-4"
                      />
                    </div>
                    <span>{option}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>
          {/* Standard Question Layout */}
          <p className="mb-6">{currentQuestion.question}</p>
          
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div 
                key={index} 
                className="flex items-center space-x-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handleAnswerSelect(currentQuestion.id, index)}
              >
                <div className="w-5 h-5 flex items-center justify-center">
                  <input
                    type="radio"
                    checked={answers[currentQuestion.id] === index}
                    onChange={() => {}}
                    className="w-4 h-4"
                  />
                </div>
                <span>{option}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default QuestionContent;
