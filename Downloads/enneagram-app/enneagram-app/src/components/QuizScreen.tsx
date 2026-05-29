import React, { useState, useEffect } from 'react';
import { Question, Answer } from '../types';

interface QuizScreenProps {
  questions: Question[];
  onComplete: (answers: Answer[]) => void;
}

const QUESTIONS_PER_PAGE = 1;

const scaleLabels = ['전혀 아니다', '아닌 편이다', '보통이다', '그런 편이다', '매우 그렇다'];
const scaleColors = ['#5B8FA8', '#7A9BAF', '#A0A0A8', '#C4956A', '#D4A444'];

const QuizScreen: React.FC<QuizScreenProps> = ({ questions, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedValue, setSelectedValue] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  const currentQuestion = questions[currentIndex];
  const progress = (currentIndex / questions.length) * 100;
  const answeredCurrent = answers.find(a => a.questionId === currentQuestion.id);

  useEffect(() => {
    const existing = answers.find(a => a.questionId === currentQuestion.id);
    setSelectedValue(existing?.value ?? null);
  }, [currentIndex, currentQuestion.id, answers]);

  const handleSelect = (value: number) => {
    setSelectedValue(value);
    setAnswers(prev => {
      const filtered = prev.filter(a => a.questionId !== currentQuestion.id);
      return [...filtered, { questionId: currentQuestion.id, value }];
    });

    // Auto-advance after short delay
    setTimeout(() => {
      if (currentIndex < questions.length - 1) {
        handleNext(value);
      } else {
        const finalAnswers = [...answers.filter(a => a.questionId !== currentQuestion.id),
          { questionId: currentQuestion.id, value }];
        onComplete(finalAnswers);
      }
    }, 350);
  };

  const handleNext = (overrideValue?: number) => {
    const val = overrideValue ?? selectedValue;
    if (val === null) return;

    setDirection('forward');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(i => i + 1);
      setAnimating(false);
    }, 200);
  };

  const handlePrev = () => {
    if (currentIndex === 0) return;
    setDirection('backward');
    setAnimating(true);
    setTimeout(() => {
      setCurrentIndex(i => i - 1);
      setAnimating(false);
    }, 200);
  };

  const groupedProgress = Array.from({ length: 9 }, (_, i) => {
    const typeAnswers = answers.filter(a => {
      const q = questions.find(q => q.id === a.questionId);
      return q?.type === (i + 1);
    });
    return { type: i + 1, count: typeAnswers.length, total: 16 };
  });

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header Progress */}
      <div className="fixed top-0 left-0 right-0 z-50 px-6 pt-4 pb-3"
        style={{ background: 'linear-gradient(to bottom, #0D0D0F, transparent)' }}>
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <span className="font-mono text-xs text-obsidian-400">
              {currentIndex + 1} / {questions.length}
            </span>
            <span className="font-body text-xs text-obsidian-400">
              {Math.round(progress)}% 완료
            </span>
          </div>
          <div className="h-0.5 rounded-full bg-obsidian-800 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{
                width: `${progress}%`,
                background: 'linear-gradient(to right, #F5A623, #C4851A)',
              }}
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-12">
        <div className="w-full max-w-xl">
          {/* Question Card */}
          <div
            className={`transition-all duration-200 ${animating
              ? direction === 'forward'
                ? 'opacity-0 translate-x-4'
                : 'opacity-0 -translate-x-4'
              : 'opacity-100 translate-x-0'
            }`}
          >
            {/* Question number badge */}
            <div className="mb-6 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono"
                style={{ background: 'rgba(245,166,35,0.12)', color: '#F5A623', border: '1px solid rgba(245,166,35,0.2)' }}>
                {currentIndex + 1}
              </div>
              <div className="h-px flex-1" style={{ background: 'rgba(245,166,35,0.15)' }} />
            </div>

            {/* Question Text */}
            <h2 className="font-display text-2xl md:text-3xl font-light text-white leading-relaxed mb-10">
              {currentQuestion.text}
            </h2>

            {/* Scale Options */}
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  onClick={() => handleSelect(value)}
                  className="w-full group flex items-center gap-4 p-4 rounded-xl transition-all duration-200"
                  style={{
                    background: selectedValue === value
                      ? `rgba(${value <= 2 ? '91,143,168' : value === 3 ? '160,160,168' : '212,164,68'},0.15)`
                      : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${selectedValue === value
                      ? scaleColors[value - 1] + '60'
                      : 'rgba(255,255,255,0.06)'}`,
                    transform: selectedValue === value ? 'scale(1.01)' : 'scale(1)',
                  }}
                >
                  {/* Value indicator */}
                  <div className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-mono transition-all duration-200"
                    style={{
                      background: selectedValue === value
                        ? scaleColors[value - 1]
                        : 'rgba(255,255,255,0.06)',
                      color: selectedValue === value ? '#0D0D0F' : '#787880',
                    }}>
                    {value}
                  </div>

                  {/* Label */}
                  <span className="font-body text-sm transition-colors duration-200"
                    style={{
                      color: selectedValue === value ? '#ffffff' : '#787880',
                    }}>
                    {scaleLabels[value - 1]}
                  </span>

                  {/* Visual bar */}
                  <div className="flex-1 flex items-center justify-end">
                    <div className="flex gap-0.5">
                      {Array.from({ length: value }).map((_, i) => (
                        <div key={i} className="w-1 rounded-full transition-all duration-200"
                          style={{
                            height: `${8 + i * 3}px`,
                            background: selectedValue === value ? scaleColors[value - 1] : 'rgba(255,255,255,0.1)',
                          }} />
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm transition-all duration-200 disabled:opacity-20"
              style={{ color: '#787880' }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              이전
            </button>

            <span className="font-mono text-xs text-obsidian-600">
              {answers.length} / {questions.length} 답변 완료
            </span>

            {selectedValue !== null && currentIndex < questions.length - 1 && (
              <button
                onClick={() => handleNext()}
                className="flex items-center gap-2 px-4 py-2 rounded-lg font-body text-sm transition-all duration-200"
                style={{ color: '#F5A623' }}
              >
                다음
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizScreen;
