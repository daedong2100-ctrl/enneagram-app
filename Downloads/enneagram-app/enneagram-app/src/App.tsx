import React, { useState } from 'react';
import { AppScreen, Answer, TypeResult, UserInfo } from './types';
import { questions as allQuestions, shuffleQuestions } from './data/questions';
import { analyzeResults } from './utils/calculateResult';
import IntroScreen from './components/IntroScreen';
import UserInfoScreen from './components/UserInfoScreen';
import QuizScreen from './components/QuizScreen';
import ResultScreen from './components/ResultScreen';

function App() {
  const [screen, setScreen] = useState<AppScreen>('intro');
  const [result, setResult] = useState<TypeResult | null>(null);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [shuffledQuestions] = useState(() => shuffleQuestions(allQuestions));

  const handleStart = () => setScreen('userinfo');

  const handleUserInfo = (info: UserInfo) => {
    setUserInfo(info);
    setScreen('quiz');
  };

  const handleComplete = (answers: Answer[]) => {
    const analysisResult = analyzeResults(answers);
    setResult(analysisResult);
    setScreen('result');
    window.scrollTo(0, 0);
  };

  const handleRetake = () => {
    setResult(null);
    setUserInfo(null);
    setScreen('intro');
    window.scrollTo(0, 0);
  };

  return (
    <div className="min-h-screen" style={{ background: '#0D0D0F', color: '#ffffff' }}>
      {screen === 'intro' && <IntroScreen onStart={handleStart} />}
      {screen === 'userinfo' && (
        <UserInfoScreen onNext={handleUserInfo} onBack={() => setScreen('intro')} />
      )}
      {screen === 'quiz' && (
        <QuizScreen questions={shuffledQuestions} onComplete={handleComplete} />
      )}
      {screen === 'result' && result && userInfo && (
        <ResultScreen result={result} userInfo={userInfo} onRetake={handleRetake} />
      )}
    </div>
  );
}

export default App;
