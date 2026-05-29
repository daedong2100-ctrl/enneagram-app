import React, { useState } from 'react';
import { UserInfo } from '../types';

interface UserInfoScreenProps {
  onNext: (info: UserInfo) => void;
  onBack: () => void;
}

const UserInfoScreen: React.FC<UserInfoScreenProps> = ({ onNext, onBack }) => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other' | ''>('');

  const isValid = name.trim() !== '' && age.trim() !== '' && gender !== '';

  const handleSubmit = () => {
    if (!isValid) return;
    onNext({ name: name.trim(), age: age.trim(), gender: gender as 'male' | 'female' | 'other' });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* 배경 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(245,166,35,0.05) 0%, transparent 70%)' }} />
      </div>

      <div className="relative z-10 w-full max-w-md animate-fade-in">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <div className="font-mono text-xs tracking-[0.3em] text-obsidian-500 uppercase mb-3">
            검사 시작 전
          </div>
          <h2 className="font-display text-3xl text-white font-light mb-2">
            기본 정보 입력
          </h2>
          <p className="font-body text-sm text-obsidian-400">
            결과 분석에 활용됩니다. 정확하게 입력해주세요.
          </p>
        </div>

        {/* 폼 카드 */}
        <div className="rounded-2xl p-6 space-y-5"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>

          {/* 이름 */}
          <div>
            <label className="font-mono text-xs text-obsidian-400 uppercase tracking-wider mb-2 block">
              이름
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름을 입력하세요"
              className="w-full px-4 py-3 rounded-xl font-body text-sm text-white placeholder-obsidian-600 outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: name ? '1px solid rgba(245,166,35,0.5)' : '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          {/* 나이 */}
          <div>
            <label className="font-mono text-xs text-obsidian-400 uppercase tracking-wider mb-2 block">
              나이
            </label>
            <input
              type="number"
              value={age}
              onChange={e => setAge(e.target.value)}
              placeholder="나이를 입력하세요"
              min="1"
              max="120"
              className="w-full px-4 py-3 rounded-xl font-body text-sm text-white placeholder-obsidian-600 outline-none transition-all duration-200"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: age ? '1px solid rgba(245,166,35,0.5)' : '1px solid rgba(255,255,255,0.1)',
              }}
            />
          </div>

          {/* 성별 */}
          <div>
            <label className="font-mono text-xs text-obsidian-400 uppercase tracking-wider mb-2 block">
              성별
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'male', label: '남성', emoji: '👨' },
                { value: 'female', label: '여성', emoji: '👩' },
                { value: 'other', label: '기타', emoji: '🧑' },
              ].map(opt => (
                <button
                  key={opt.value}
                  onClick={() => setGender(opt.value as 'male' | 'female' | 'other')}
                  className="py-3 rounded-xl font-body text-sm transition-all duration-200 flex flex-col items-center gap-1"
                  style={{
                    background: gender === opt.value ? 'rgba(245,166,35,0.15)' : 'rgba(255,255,255,0.04)',
                    border: gender === opt.value ? '1px solid rgba(245,166,35,0.5)' : '1px solid rgba(255,255,255,0.08)',
                    color: gender === opt.value ? '#F5A623' : '#787880',
                  }}
                >
                  <span className="text-lg">{opt.emoji}</span>
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 버튼들 */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onBack}
            className="px-6 py-3 rounded-full font-body text-sm transition-all duration-200"
            style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#787880' }}
          >
            ← 뒤로
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="flex-1 py-3 rounded-full font-body font-medium text-sm transition-all duration-300"
            style={{
              background: isValid ? 'linear-gradient(135deg, #F5A623, #C4851A)' : 'rgba(255,255,255,0.06)',
              color: isValid ? '#0D0D0F' : '#5c5c65',
              cursor: isValid ? 'pointer' : 'not-allowed',
              boxShadow: isValid ? '0 0 30px rgba(245,166,35,0.2)' : 'none',
            }}
          >
            검사 시작하기 →
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfoScreen;
