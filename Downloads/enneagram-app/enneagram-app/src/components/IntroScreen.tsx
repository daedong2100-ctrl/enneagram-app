import React from 'react';

interface IntroScreenProps {
  onStart: () => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{
            background: 'radial-gradient(circle, rgba(245,166,35,0.06) 0%, transparent 70%)',
          }} />
        <svg className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.04] animate-spin-slow"
          width="700" height="700" viewBox="0 0 700 700">
          <polygon points="350,50 650,200 650,500 350,650 50,500 50,200"
            fill="none" stroke="#F5A623" strokeWidth="1" />
          <polygon points="350,120 580,240 580,460 350,580 120,460 120,240"
            fill="none" stroke="#F5A623" strokeWidth="0.5" />
          {[0,1,2,3,4,5,6,7,8].map(i => {
            const angle = (i * 40 - 90) * Math.PI / 180;
            const x = 350 + 250 * Math.cos(angle);
            const y = 350 + 250 * Math.sin(angle);
            return <circle key={i} cx={x} cy={y} r="6" fill="#F5A623" />;
          })}
          {[0,1,2,3,4,5,6,7,8].map(i => {
            const a1 = (i * 40 - 90) * Math.PI / 180;
            const a2 = ((i + 3) % 9 * 40 - 90) * Math.PI / 180;
            const x1 = 350 + 250 * Math.cos(a1);
            const y1 = 350 + 250 * Math.sin(a1);
            const x2 = 350 + 250 * Math.cos(a2);
            const y2 = 350 + 250 * Math.sin(a2);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F5A623" strokeWidth="0.5" />;
          })}
        </svg>
      </div>

      <div className="relative z-10 max-w-2xl mx-auto text-center animate-fade-in">
        {/* Symbol */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="w-20 h-20 rounded-full border border-amber-DEFAULT/30 flex items-center justify-center"
              style={{ background: 'rgba(245,166,35,0.08)' }}>
              <svg width="40" height="40" viewBox="0 0 40 40">
                {[0,1,2,3,4,5,6,7,8].map(i => {
                  const angle = (i * 40 - 90) * Math.PI / 180;
                  const x = 20 + 15 * Math.cos(angle);
                  const y = 20 + 15 * Math.sin(angle);
                  return <circle key={i} cx={x} cy={y} r="2" fill="#F5A623" />;
                })}
                {[0,1,2,3,4,5,6,7,8].map(i => {
                  const a1 = (i * 40 - 90) * Math.PI / 180;
                  const a2 = ((i + 3) % 9 * 40 - 90) * Math.PI / 180;
                  return <line key={i}
                    x1={20 + 15 * Math.cos(a1)} y1={20 + 15 * Math.sin(a1)}
                    x2={20 + 15 * Math.cos(a2)} y2={20 + 15 * Math.sin(a2)}
                    stroke="#F5A623" strokeWidth="0.5" opacity="0.6" />;
                })}
              </svg>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <span className="text-xs font-mono tracking-[0.3em] text-amber-DEFAULT/60 uppercase">
            Enneagram Personality Test
          </span>
        </div>
        <h1 className="font-display text-5xl md:text-6xl font-light text-white mb-3 leading-tight">
          나를 알아가는<br />
          <span className="italic" style={{ color: '#F5A623' }}>9가지 여정</span>
        </h1>
        <p className="font-body text-obsidian-300 text-lg mb-2 font-light">
          에니어그램 심층 성격 유형 검사
        </p>

        {/* Divider */}
        <div className="flex items-center gap-4 my-8 justify-center">
          <div className="w-16 h-px bg-gradient-to-r from-transparent to-amber-DEFAULT/40" />
          <div className="w-1.5 h-1.5 rounded-full bg-amber-DEFAULT/60" />
          <div className="w-16 h-px bg-gradient-to-l from-transparent to-amber-DEFAULT/40" />
        </div>

        {/* Description */}
        <div className="mb-10 space-y-3">
          <p className="font-body text-obsidian-300 leading-relaxed text-base">
            에니어그램은 인간의 성격을 9가지 유형으로 분류하는 고대의 지혜와
            현대 심리학이 결합된 심오한 자기 이해 시스템입니다.
          </p>
          <p className="font-body text-obsidian-400 text-sm leading-relaxed">
            총 <span className="text-amber-DEFAULT font-medium">144개의 문항</span>에 솔직하게 답변해 주세요.
            소요 시간은 약 <span className="text-amber-DEFAULT font-medium">20-30분</span>입니다.
          </p>
        </div>

        {/* Features */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { icon: '🔍', label: '9가지 유형 분석' },
            { icon: '🌿', label: '날개 & 건강 수준' },
            { icon: '💫', label: '성장 방향 안내' },
          ].map((item, i) => (
            <div key={i} className="rounded-xl p-4 text-center"
              style={{ background: 'rgba(245,166,35,0.05)', border: '1px solid rgba(245,166,35,0.12)' }}>
              <div className="text-2xl mb-2">{item.icon}</div>
              <div className="font-body text-xs text-obsidian-300 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Start Button */}
        <button
          onClick={onStart}
          className="group relative inline-flex items-center gap-3 px-10 py-4 rounded-full font-body font-medium text-base transition-all duration-300"
          style={{
            background: 'linear-gradient(135deg, #F5A623, #C4851A)',
            color: '#0D0D0F',
            boxShadow: '0 0 40px rgba(245,166,35,0.25)',
          }}
        >
          <span>검사 시작하기</span>
          <svg className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <p className="mt-5 font-body text-xs text-obsidian-500">
          결과는 저장되지 않으며, 브라우저를 닫으면 사라집니다
        </p>
      </div>
    </div>
  );
};

export default IntroScreen;
