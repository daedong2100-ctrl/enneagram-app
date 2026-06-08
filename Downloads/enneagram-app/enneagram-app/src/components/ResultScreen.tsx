import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, RadarChart, PolarGrid,
  PolarAngleAxis, Radar, ReferenceLine
} from 'recharts';
import { TypeResult, EnneagramType, UserInfo } from '../types';
import { typeInfo } from '../data/typeInfo';
import { MAX_SCORE } from '../utils/calculateResult';
import { deepAnalysisData } from '../data/deepAnalysis';
import { generateDocxBlob, downloadDocx } from '../utils/generateDocx';

interface ResultScreenProps {
  result: TypeResult;
  userInfo: UserInfo;
  onRetake: () => void;
}

const healthColors = { healthy: '#6B9E8B', average: '#D4A444', unhealthy: '#C45C3E' };
const typeColors: Record<number, string> = {
  1:'#8B9D6A',2:'#C4736A',3:'#D4A444',4:'#7A6E9E',
  5:'#5B8FA8',6:'#A0845C',7:'#D4956A',8:'#C45C3E',9:'#6B9E8B',
};

// ── 섹션 헤더 컴포넌트 ──
const SectionHeader: React.FC<{ code: string; title: string; color: string }> = ({ code, title, color }) => (
  <div className="px-5 py-3 flex items-center gap-2"
    style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
    <span className="font-mono text-xs tracking-wider uppercase" style={{ color }}>{code}</span>
    <span className="font-body text-sm text-white font-medium">{title}</span>
  </div>
);

// ── 카드 래퍼 컴포넌트 ──
const Card: React.FC<{ children: React.ReactNode; accent?: string }> = ({ children, accent }) => (
  <div className="rounded-2xl overflow-hidden"
    style={{
      background: accent ? `${accent}07` : 'rgba(255,255,255,0.03)',
      border: `1px solid ${accent ? accent + '25' : 'rgba(255,255,255,0.07)'}`,
    }}>
    {children}
  </div>
);

const ResultScreen: React.FC<ResultScreenProps> = ({ result, userInfo, onRetake }) => {
  const [activeTab, setActiveTab] = useState<'overview'|'deep'|'chart'|'growth'>('overview');
  const [emailStatus, setEmailStatus] = useState<'idle'|'sending'|'success'|'error'>('idle');
  const [docxStatus, setDocxStatus] = useState<'idle'|'generating'|'done'|'error'>('idle');
  const info = typeInfo[result.type];
  const deep = deepAnalysisData[result.type];
  const today = new Date().toLocaleDateString('ko-KR', { year:'numeric', month:'long', day:'numeric' });
  const genderLabel = userInfo.gender === 'male' ? '남성' : userInfo.gender === 'female' ? '여성' : '기타';

  // 결과 화면 진입 시 자동 이메일 발송 (Word 첨부)
  useEffect(() => {
    setEmailStatus('sending');
    fetch('/api/send-report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userInfo, result }),
    })
      .then(r => r.ok ? setEmailStatus('success') : setEmailStatus('error'))
      .catch(() => setEmailStatus('error'));
  }, []);

  const handleDownloadDocx = async () => {
    setDocxStatus('generating');
    try {
      const blob = await generateDocxBlob(userInfo, result);
      const typeName = info.name;
      downloadDocx(blob, `에니어그램_${result.type}번_${typeName}_${userInfo.name}.docx`);
      setDocxStatus('done');
    } catch {
      setDocxStatus('error');
    }
  };

  const barData = [...result.scores].sort((a,b)=>a.type-b.type).map(s=>({
    label:`${s.type}`, score: s.score, type: s.type,
  }));
  const radarData = result.scores.map(s=>({ type:`유형 ${s.type}`, value: s.percentage }));

  const tabs = [
    { id:'overview', label:'📋 리포트' },
    { id:'deep',     label:'🧠 심층분석' },
    { id:'chart',    label:'📊 점수분포' },
    { id:'growth',   label:'🌱 성장가이드' },
  ] as const;

  return (
    <div className="min-h-screen px-4 py-10" style={{ background:'#0D0D0F' }}>
      <div className="max-w-2xl mx-auto">

        {/* ── 리포트 헤더 ── */}
        <div className="rounded-2xl overflow-hidden mb-6 animate-slide-up"
          style={{ border:`1px solid ${info.color}30`, background:`${info.color}08` }}>
          <div className="px-6 py-3 flex items-center justify-between"
            style={{ background:`${info.color}15`, borderBottom:`1px solid ${info.color}20` }}>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full" style={{ background:info.color }} />
              <span className="font-mono text-xs tracking-widest uppercase" style={{ color:info.color }}>
                Enneagram Personality Report
              </span>
            </div>
            <span className="font-mono text-xs text-obsidian-500">{today}</span>
          </div>

          {/* 사용자 정보 바 */}
          <div className="px-6 py-3 flex items-center gap-4"
            style={{ background:'rgba(255,255,255,0.03)', borderBottom:`1px solid ${info.color}15` }}>
            <div className="flex items-center gap-3 flex-1">
              <span className="text-lg">👤</span>
              <div>
                <span className="font-body text-sm text-white font-medium">{userInfo.name}</span>
                <span className="font-mono text-xs text-obsidian-500 ml-2">{userInfo.age}세 · {genderLabel}</span>
              </div>
            </div>
            {/* 이메일 발송 상태 + Word 다운로드 버튼 */}
            <div className="flex items-center gap-3">
              {emailStatus === 'sending' && (
                <span className="font-mono text-xs text-obsidian-400 animate-pulse">📧 전송 중...</span>
              )}
              {emailStatus === 'success' && (
                <span className="font-mono text-xs" style={{ color:'#6B9E8B' }}>📧 전송 완료 ✓</span>
              )}
              {emailStatus === 'error' && (
                <span className="font-mono text-xs text-obsidian-500">📧 전송 대기</span>
              )}
              <button
                onClick={handleDownloadDocx}
                disabled={docxStatus === 'generating'}
                className="px-3 py-1 rounded-lg font-mono text-xs transition-all duration-200"
                style={{
                  background: docxStatus === 'done' ? 'rgba(107,158,139,0.2)' : `${info.color}20`,
                  border: `1px solid ${docxStatus === 'done' ? 'rgba(107,158,139,0.5)' : info.color + '50'}`,
                  color: docxStatus === 'done' ? '#6B9E8B' : info.color,
                  opacity: docxStatus === 'generating' ? 0.6 : 1,
                }}
              >
                {docxStatus === 'generating' ? '⏳ 생성 중...' : docxStatus === 'done' ? '✓ Word 저장됨' : '📄 Word 다운로드'}
              </button>
            </div>
          </div>
          <div className="px-6 py-6">
            <div className="flex items-start gap-5 mb-5">
              <div className="flex-shrink-0 w-24 h-24 rounded-2xl flex flex-col items-center justify-center"
                style={{ background:`${info.color}20`, border:`2px solid ${info.color}50` }}>
                <span className="font-mono text-4xl font-bold leading-none" style={{ color:info.color }}>{result.type}</span>
                <span className="text-xl mt-1">{info.emoji}</span>
              </div>
              <div className="flex-1">
                <div className="font-mono text-xs text-obsidian-500 uppercase tracking-wider mb-1">주 유형</div>
                <div className="font-display text-3xl text-white font-light mb-1">{info.name}</div>
                <div className="font-body text-sm text-obsidian-400 mb-3">"{info.nickname}"</div>
                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full text-xs font-body"
                    style={{ background:`${healthColors[result.healthLevel.level]}15`, border:`1px solid ${healthColors[result.healthLevel.level]}40`, color:healthColors[result.healthLevel.level] }}>
                    {result.healthLevel.label}
                  </span>
                  <span className="px-3 py-1 rounded-full text-xs font-body"
                    style={{ background:'rgba(91,143,168,0.12)', border:'1px solid rgba(91,143,168,0.3)', color:'#5B8FA8' }}>
                    {result.instinctualVariant.label}
                  </span>
                </div>
              </div>
            </div>
            {/* 상위 3 유형 */}
            <div className="grid grid-cols-3 gap-2">
              {result.scores.slice(0,3).map((s,i)=>(
                <div key={s.type} className="rounded-xl p-3 text-center"
                  style={{ background:i===0?`${typeColors[s.type]}18`:'rgba(255,255,255,0.03)', border:`1px solid ${i===0?typeColors[s.type]+'40':'rgba(255,255,255,0.06)'}` }}>
                  <div className="font-mono text-xs text-obsidian-500 mb-1">#{i+1}</div>
                  <div className="font-mono text-xl font-bold" style={{ color:typeColors[s.type] }}>유형 {s.type}</div>
                  <div className="font-body text-xs text-obsidian-400 mt-0.5">{typeInfo[s.type].name}</div>
                  <div className="font-mono text-sm mt-1" style={{ color:typeColors[s.type] }}>{s.score}점</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── 탭 ── */}
        <div className="grid grid-cols-4 rounded-xl p-1 mb-6 gap-1"
          style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.06)' }}>
          {tabs.map(tab=>(
            <button key={tab.id} onClick={()=>setActiveTab(tab.id)}
              className="py-2 rounded-lg font-body text-xs transition-all duration-200"
              style={{ background:activeTab===tab.id?info.color:'transparent', color:activeTab===tab.id?'#0D0D0F':'#787880', fontWeight:activeTab===tab.id?'600':'400' }}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ══ TAB 1: 리포트 ══ */}
        {activeTab==='overview' && (
          <div className="space-y-4 animate-fade-in">

            {/* Section A: 핵심 동기 */}
            <Card>
              <SectionHeader code="Section A" title="핵심 동기 분석" color={info.color} />
              <div className="px-5 py-4 space-y-4">
                {[
                  { icon:'▶', label:'핵심 욕구', value:info.coreDesire },
                  { icon:'◆', label:'핵심 두려움', value:info.coreFear },
                  { icon:'◉', label:'행동 동기', value:info.coreMotivation },
                ].map((item,i)=>(
                  <div key={i}>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs" style={{ color:info.color }}>{item.icon}</span>
                      <span className="font-mono text-xs text-obsidian-500 uppercase tracking-wider">{item.label}</span>
                    </div>
                    <p className="font-body text-sm text-obsidian-200 leading-relaxed pl-4">{item.value}</p>
                    {i<2 && <div className="mt-3 h-px bg-obsidian-800" />}
                  </div>
                ))}
              </div>
            </Card>

            {/* Section B: 슈퍼에고 */}
            <Card>
              <SectionHeader code="Section B" title="내면의 목소리 (슈퍼에고)" color={info.color} />
              <div className="px-5 py-4">
                <div className="p-4 rounded-xl mb-4 text-center italic"
                  style={{ background:`${info.color}10`, border:`1px solid ${info.color}25` }}>
                  <p className="font-display text-base text-white">{deep.superEgo.voice}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ background:'rgba(107,158,139,0.08)', border:'1px solid rgba(107,158,139,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#6B9E8B' }}>⚡ 동력으로서</div>
                    <div className="space-y-1">
                      {deep.superEgo.asForce.map((f,i)=>(
                        <p key={i} className="font-body text-xs text-obsidian-300 leading-relaxed">• {f}</p>
                      ))}
                    </div>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background:'rgba(196,92,62,0.08)', border:'1px solid rgba(196,92,62,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#C45C3E' }}>⚠️ 족쇄로서</div>
                    <div className="space-y-1">
                      {deep.superEgo.asChain.map((c,i)=>(
                        <p key={i} className="font-body text-xs text-obsidian-300 leading-relaxed">• {c}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* Section C: 기본 두려움과 욕구 */}
            <Card>
              <SectionHeader code="Section C" title="기본 두려움과 기본 욕구" color={info.color} />
              <div className="px-5 py-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-xs mb-3 flex items-center gap-1" style={{ color:'#C45C3E' }}>😰 기본 두려움</div>
                  <div className="space-y-2">
                    {deep.fearDesire.fears.map((f,i)=>(
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background:'#C45C3E' }} />
                        <span className="font-body text-sm text-obsidian-200">{f}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs mb-3 flex items-center gap-1" style={{ color:'#6B9E8B' }}>🌱 기본 욕구</div>
                  <div className="space-y-2">
                    {deep.fearDesire.desires.map((d,i)=>(
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-1 h-1 rounded-full mt-2 flex-shrink-0" style={{ background:'#6B9E8B' }} />
                        <span className="font-body text-sm text-obsidian-200">{d}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Section D: 악덕과 미덕 */}
            <Card>
              <SectionHeader code="Section D" title="악덕과 미덕" color={info.color} />
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ background:'rgba(196,92,62,0.08)', border:'1px solid rgba(196,92,62,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#C45C3E' }}>⚠️ 악덕 — {deep.viceVirtue.vice.name}</div>
                    <p className="font-body text-xs text-obsidian-300 leading-relaxed">{deep.viceVirtue.vice.description}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background:'rgba(107,158,139,0.08)', border:'1px solid rgba(107,158,139,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#6B9E8B' }}>🌟 미덕 — {deep.viceVirtue.virtue.name}</div>
                    <p className="font-body text-xs text-obsidian-300 leading-relaxed">{deep.viceVirtue.virtue.description}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{ background:'rgba(91,143,168,0.08)', border:'1px solid rgba(91,143,168,0.2)' }}>
                  <div className="font-mono text-xs mb-2" style={{ color:'#5B8FA8' }}>💡 방어기제 — {deep.viceVirtue.defense.name}</div>
                  <p className="font-body text-sm text-obsidian-200 leading-relaxed">{deep.viceVirtue.defense.description}</p>
                </div>
              </div>
            </Card>

            {/* Section E: 종합 코멘트 */}
            <Card accent={info.color}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background:`${info.color}12`, borderBottom:`1px solid ${info.color}20` }}>
                <div className="w-1.5 h-1.5 rounded-full animate-pulse-slow" style={{ background:info.color }} />
                <span className="font-mono text-xs tracking-wider uppercase" style={{ color:info.color }}>Section E</span>
                <span className="font-body text-sm text-white font-medium">종합 분석 코멘트</span>
              </div>
              <div className="px-5 py-4 space-y-3">
                {result.aiComment.split('\n\n').map((p,i)=>(
                  <p key={i} className="font-body text-sm text-obsidian-200 leading-relaxed">{p}</p>
                ))}
              </div>
            </Card>

          </div>
        )}

        {/* ══ TAB 2: 심층 분석 ══ */}
        {activeTab==='deep' && (
          <div className="space-y-4 animate-fade-in">

            {/* 전체 구조 분석 */}
            <Card>
              <SectionHeader code="🗺 구조" title="힘의 중심 역동" color={info.color} />
              <div className="px-5 py-4 space-y-3">
                {[
                  { icon:'🧠', label:'사고 중심', value:deep.powerCenter.head, color:'#5B8FA8' },
                  { icon:'🌿', label:'본능 중심', value:deep.powerCenter.gut,  color:'#6B9E8B' },
                  { icon:'❤️', label:'감정 중심', value:deep.powerCenter.heart, color:'#C4736A' },
                ].map((item,i)=>(
                  <div key={i} className="p-4 rounded-xl"
                    style={{ background:`${item.color}0A`, border:`1px solid ${item.color}25` }}>
                    <div className="font-mono text-xs mb-2 flex items-center gap-1" style={{ color:item.color }}>
                      {item.icon} {item.label}
                    </div>
                    <p className="font-body text-sm text-obsidian-200 leading-relaxed">{item.value}</p>
                  </div>
                ))}
              </div>
            </Card>

            {/* 사회적 스타일 */}
            <Card>
              <SectionHeader code="🤝 스타일" title="사회적 스타일" color={info.color} />
              <div className="px-5 py-4">
                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 rounded-full text-xs font-mono"
                    style={{ background:`${info.color}15`, border:`1px solid ${info.color}35`, color:info.color }}>
                    {deep.socialStyle.group}
                  </span>
                  <p className="font-body text-sm text-obsidian-300 italic">{deep.socialStyle.coreAttitude}</p>
                </div>
                <div className="space-y-3">
                  <div className="p-3 rounded-xl" style={{ background:'rgba(107,158,139,0.08)', border:'1px solid rgba(107,158,139,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#6B9E8B' }}>🏛 강점</div>
                    <p className="font-body text-sm text-obsidian-200 leading-relaxed">{deep.socialStyle.strength}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background:'rgba(196,92,62,0.08)', border:'1px solid rgba(196,92,62,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#C45C3E' }}>⚠️ 그늘</div>
                    <p className="font-body text-sm text-obsidian-200 leading-relaxed">{deep.socialStyle.shadow}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 갈등 대처 */}
            <Card>
              <SectionHeader code="🌀 갈등" title="갈등 대처 패턴" color={info.color} />
              <div className="px-5 py-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl" style={{ background:'rgba(196,92,62,0.07)', border:'1px solid rgba(196,92,62,0.18)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#C45C3E' }}>🌋 내면의 실제</div>
                    <p className="font-body text-xs text-obsidian-300 leading-relaxed">{deep.conflictStyle.inner}</p>
                  </div>
                  <div className="p-3 rounded-xl" style={{ background:'rgba(91,143,168,0.07)', border:'1px solid rgba(91,143,168,0.18)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#5B8FA8' }}>😊 외면의 모습</div>
                    <p className="font-body text-xs text-obsidian-300 leading-relaxed">{deep.conflictStyle.outer}</p>
                  </div>
                </div>
                <div className="p-3 rounded-xl" style={{ background:'rgba(212,164,68,0.08)', border:'1px solid rgba(212,164,68,0.2)' }}>
                  <div className="font-mono text-xs mb-2" style={{ color:'#D4A444' }}>💡 알아두면 좋은 것</div>
                  <p className="font-body text-sm text-obsidian-200 leading-relaxed">{deep.conflictStyle.insight}</p>
                </div>
              </div>
            </Card>

            {/* 관계의 딜레마 */}
            <Card>
              <SectionHeader code="💞 관계" title="관계의 딜레마" color={info.color} />
              <div className="px-5 py-4 space-y-3">
                <div className="p-3 rounded-xl" style={{ background:`${info.color}0A`, border:`1px solid ${info.color}25` }}>
                  <p className="font-body text-sm text-white font-medium leading-relaxed">{deep.relationshipDilemma.core}</p>
                </div>
                <p className="font-body text-sm text-obsidian-300 leading-relaxed">• {deep.relationshipDilemma.dynamic1}</p>
                <p className="font-body text-sm text-obsidian-300 leading-relaxed">• {deep.relationshipDilemma.dynamic2}</p>
                <div className="p-3 rounded-xl" style={{ background:'rgba(107,158,139,0.08)', border:'1px solid rgba(107,158,139,0.2)' }}>
                  <div className="font-mono text-xs mb-2" style={{ color:'#6B9E8B' }}>🌱 해결의 실마리</div>
                  <p className="font-body text-sm text-obsidian-200 leading-relaxed">{deep.relationshipDilemma.solution}</p>
                </div>
              </div>
            </Card>

            {/* 번아웃 & 자기돌봄 */}
            <Card>
              <SectionHeader code="🛟 돌봄" title="번아웃 신호와 자기돌봄 가이드" color={info.color} />
              <div className="px-5 py-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="font-mono text-xs mb-3 flex items-center gap-1" style={{ color:'#C45C3E' }}>🚨 번아웃 경고 신호</div>
                    <div className="space-y-1.5">
                      {deep.burnoutGuide.signals.map((s,i)=>(
                        <p key={i} className="font-body text-xs text-obsidian-300 leading-relaxed">• {s}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="font-mono text-xs mb-3 flex items-center gap-1" style={{ color:'#6B9E8B' }}>🌿 자기돌봄 처방</div>
                    <div className="space-y-1.5">
                      {deep.burnoutGuide.selfcare.map((s,i)=>(
                        <p key={i} className="font-body text-xs text-obsidian-300 leading-relaxed">• {s}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            {/* 관계 지도 */}
            <Card>
              <SectionHeader code="💞 관계 지도" title="나와 잘 맞는 유형 · 도전이 되는 유형" color={info.color} />
              <div className="px-5 py-4 grid grid-cols-2 gap-4">
                <div>
                  <div className="font-mono text-xs mb-3" style={{ color:'#6B9E8B' }}>🤝 편안한 유형</div>
                  <div className="space-y-2">
                    {deep.relationshipMap.comfortable.map((r,i)=>(
                      <div key={i} className="p-2 rounded-lg" style={{ background:'rgba(107,158,139,0.06)', border:'1px solid rgba(107,158,139,0.15)' }}>
                        <div className="font-mono text-xs mb-1" style={{ color:typeColors[r.type] }}>유형 {r.type} {typeInfo[r.type as EnneagramType].name}</div>
                        <p className="font-body text-xs text-obsidian-400 leading-relaxed">{r.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="font-mono text-xs mb-3" style={{ color:'#D4A444' }}>⚡ 성장의 계기</div>
                  <div className="space-y-2">
                    {deep.relationshipMap.challenging.map((r,i)=>(
                      <div key={i} className="p-2 rounded-lg" style={{ background:'rgba(212,164,68,0.06)', border:'1px solid rgba(212,164,68,0.15)' }}>
                        <div className="font-mono text-xs mb-1" style={{ color:typeColors[r.type] }}>유형 {r.type} {typeInfo[r.type as EnneagramType].name}</div>
                        <p className="font-body text-xs text-obsidian-400 leading-relaxed">{r.reason}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* 건강 수준 */}
            <Card>
              <SectionHeader code="🌈 건강" title="건강 수준별 당신의 모습" color={info.color} />
              <div className="px-5 py-4 space-y-3">
                {([
                  { key:'healthy', icon:'🌟', label:'건강한 수준', desc:deep.healthLevelDetail.healthy },
                  { key:'average', icon:'🔶', label:'평균 수준',   desc:deep.healthLevelDetail.average },
                  { key:'warning', icon:'⚠️', label:'주의가 필요한 수준', desc:deep.healthLevelDetail.warning },
                ] as const).map((level,i) => {
                  const lkey = i===0?'healthy':i===1?'average':'unhealthy';
                  const isActive = result.healthLevel.level === lkey;
                  return (
                    <div key={i} className="p-3 rounded-xl"
                      style={{
                        background: isActive?`${healthColors[lkey as keyof typeof healthColors]}10`:'rgba(255,255,255,0.02)',
                        border:`1px solid ${isActive?healthColors[lkey as keyof typeof healthColors]+'40':'rgba(255,255,255,0.05)'}`,
                      }}>
                      <div className="font-mono text-xs mb-1.5 flex items-center gap-1" style={{ color:healthColors[lkey as keyof typeof healthColors] }}>
                        {level.icon} {level.label}{isActive && ' ← 현재'}
                      </div>
                      <p className="font-body text-sm text-obsidian-300">{level.desc}</p>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* 마치며 */}
            <Card accent={info.color}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background:`${info.color}12`, borderBottom:`1px solid ${info.color}20` }}>
                <span className="text-sm">✨</span>
                <span className="font-body text-sm text-white font-medium">마치며</span>
              </div>
              <div className="px-5 py-5">
                <p className="font-display text-base text-obsidian-100 leading-relaxed italic">{deep.closingMessage}</p>
              </div>
            </Card>

          </div>
        )}

        {/* ══ TAB 3: 점수 분포 ══ */}
        {activeTab==='chart' && (
          <div className="space-y-5 animate-fade-in">
            {/* 막대 그래프 */}
            <Card>
              <SectionHeader code="Bar Chart" title={`유형별 점수 (점 만점)`} color={info.color} />
              <div className="px-4 py-6">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barData} margin={{ top:30, right:60, left:-10, bottom:0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                      <XAxis dataKey="label" tick={{ fill:'#787880', fontSize:12, fontFamily:'JetBrains Mono' }} axisLine={{ stroke:'rgba(255,255,255,0.1)' }} tickLine={false} />
                      <YAxis domain={[0, MAX_SCORE]} ticks={[0,20,40,60,80]} tick={{ fill:'#5c5c65', fontSize:10, fontFamily:'JetBrains Mono' }} axisLine={false} tickLine={false} />
                      <ReferenceLine y={MAX_SCORE} stroke="rgba(245,166,35,0.3)" strokeDasharray="4 4" label={{ value:`만점(점)`, position:'right', fill:'rgba(245,166,35,0.6)', fontSize:10, fontFamily:'JetBrains Mono' }} />
                      <Tooltip cursor={{ fill:'rgba(255,255,255,0.03)' }}
                        contentStyle={{ background:'#1a1a20', border:'1px solid rgba(255,255,255,0.12)', borderRadius:'10px', color:'#fff', fontFamily:'DM Sans', fontSize:'12px' }}
                        formatter={(value:number,_name:string,props:any)=>{
                          const t = props.payload.type as EnneagramType;
                          return [`점 만점 중 ${value}점`, `유형 ${t}: ${typeInfo[t].name}`];
                        }} />
                      <Bar dataKey="score" radius={[6,6,0,0]}
                        label={{
                          position: 'top',
                          formatter: (v: number) => `${v}점`,
                          fill: '#a8a8ae',
                          fontSize: 11,
                          fontFamily: 'JetBrains Mono',
                        }}>
                        {barData.map((entry)=>(
                          <Cell key={entry.type}
                            fill={entry.type===result.type?typeColors[entry.type]:`${typeColors[entry.type]}55`} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-3 flex items-center justify-center gap-4 text-xs font-body text-obsidian-500">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ background:info.color }} />주 유형 ({result.type}번)
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded" style={{ background:'rgba(160,160,168,0.4)' }} />기타 유형
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-4 h-px" style={{ borderTop: '2px dashed rgba(245,166,35,0.4)' }} />만점 기준선 ({MAX_SCORE}점)
                  </div>
                </div>
              </div>
            </Card>

            {/* 레이더 차트 */}
            <Card>
              <SectionHeader code="Radar Chart" title="유형별 상대 분포" color={info.color} />
              <div className="px-4 py-4">
                <div className="h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid stroke="rgba(255,255,255,0.07)" />
                      <PolarAngleAxis dataKey="type" tick={{ fill:'#5c5c65', fontSize:10, fontFamily:'JetBrains Mono' }} />
                      <Radar name="점수" dataKey="value" stroke={info.color} fill={info.color} fillOpacity={0.15} strokeWidth={1.5} />
                      <Tooltip contentStyle={{ background:'#1a1a20', border:'1px solid rgba(255,255,255,0.1)', borderRadius:'8px', color:'#fff', fontFamily:'DM Sans', fontSize:'12px' }}
                        formatter={(v:number)=>[`${v}%`,'상대 점수']} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </Card>

            {/* 전체 순위표 */}
            <Card>
              <SectionHeader code="Ranking" title="전체 유형 점수 순위" color={info.color} />
              <div className="px-5 py-4 space-y-2">
                {result.scores.map((s,i)=>{
                  const t = typeInfo[s.type as EnneagramType];
                  const isDominant = s.type===result.type;
                  return (
                    <div key={s.type} className="flex items-center gap-3 py-1">
                      <span className="font-mono text-xs w-5 text-right" style={{ color:isDominant?'#F5A623':'#5c5c65' }}>{i+1}</span>
                      <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-mono"
                        style={{ background:isDominant?`${typeColors[s.type]}30`:'rgba(255,255,255,0.04)', color:isDominant?typeColors[s.type]:'#5c5c65', border:`1px solid ${isDominant?typeColors[s.type]+'50':'rgba(255,255,255,0.06)'}` }}>
                        {s.type}
                      </div>
                      <div className="w-16 font-body text-xs text-obsidian-400 truncate">{t.name}</div>
                      <div className="flex-1 h-1.5 rounded-full bg-obsidian-800 overflow-hidden">
                        <div className="h-full rounded-full"
                          style={{ width:`${s.percentage}%`, background:isDominant?`linear-gradient(to right, ${typeColors[s.type]}, ${typeColors[s.type]}aa)`:'rgba(255,255,255,0.12)' }} />
                      </div>
                      <span className="font-mono text-xs w-10 text-right" style={{ color:isDominant?typeColors[s.type]:'#5c5c65' }}>{s.score}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        )}

        {/* ══ TAB 4: 성장 가이드 ══ */}
        {activeTab==='growth' && (
          <div className="space-y-4 animate-fade-in">

            {/* 통합/분열 */}
            <Card>
              <SectionHeader code="📈 통합" title="통합과 분열의 방향" color={info.color} />
              <div className="px-5 py-5">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background:'rgba(107,158,139,0.1)', border:'1px solid rgba(107,158,139,0.3)' }}>
                    <div className="font-mono text-xs text-obsidian-500 mb-1">성장할 때 →</div>
                    <div className="font-mono text-3xl font-bold" style={{ color:'#6B9E8B' }}>{result.integration}</div>
                    <div className="font-display text-sm text-white mt-1">{typeInfo[result.integration].name}</div>
                  </div>
                  <div className="text-center px-2">
                    <div className="font-mono text-2xl font-bold" style={{ color:info.color }}>{result.type}</div>
                    <div className="font-body text-xs text-obsidian-500 mt-1">현재</div>
                  </div>
                  <div className="flex-1 p-4 rounded-xl text-center" style={{ background:'rgba(196,92,62,0.1)', border:'1px solid rgba(196,92,62,0.3)' }}>
                    <div className="font-mono text-xs text-obsidian-500 mb-1">← 스트레스</div>
                    <div className="font-mono text-3xl font-bold" style={{ color:'#C45C3E' }}>{result.disintegration}</div>
                    <div className="font-display text-sm text-white mt-1">{typeInfo[result.disintegration].name}</div>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl" style={{ background:'rgba(107,158,139,0.07)', border:'1px solid rgba(107,158,139,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#6B9E8B' }}>🕊 성장 방향 → 유형 {result.integration} 건강한 에너지 흡수</div>
                    <p className="font-body text-sm text-obsidian-200">{typeInfo[result.integration].healthyDescription}</p>
                  </div>
                  <div className="p-4 rounded-xl" style={{ background:'rgba(196,92,62,0.07)', border:'1px solid rgba(196,92,62,0.2)' }}>
                    <div className="font-mono text-xs mb-2" style={{ color:'#C45C3E' }}>📉 스트레스 방향 → 유형 {result.disintegration} 부정적 측면 주의</div>
                    <p className="font-body text-sm text-obsidian-200">{typeInfo[result.disintegration].unhealthyDescription}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* 성장 제안 3가지 */}
            <Card accent={info.color}>
              <div className="px-5 py-3 flex items-center gap-2"
                style={{ background:`${info.color}10`, borderBottom:`1px solid ${info.color}18` }}>
                <span className="font-mono text-xs tracking-wider uppercase" style={{ color:info.color }}>Practice</span>
                <span className="font-body text-sm text-white font-medium">성장을 위한 세 가지 제안</span>
              </div>
              <div className="px-5 py-2 mb-2">
                <p className="font-body text-xs text-obsidian-500 italic pt-3 pb-1">이 제안들은 당신이 부족하다는 의미가 아닙니다. 이미 훌륭한 당신이 더 오래, 더 건강하게 빛날 수 있도록 돕는 연료입니다.</p>
              </div>
              <div className="px-5 pb-4 space-y-4">
                {deep.growthSuggestions.map((g,i)=>(
                  <div key={i} className="rounded-xl overflow-hidden"
                    style={{ background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)' }}>
                    <div className="px-4 py-3 flex items-center gap-3"
                      style={{ background:'rgba(255,255,255,0.03)', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                      <span className="font-mono text-lg font-bold" style={{ color:info.color }}>{g.number}</span>
                      <span className="text-lg">{g.icon}</span>
                      <span className="font-body text-sm text-white font-medium">{g.title}</span>
                    </div>
                    <div className="px-4 py-3 space-y-2">
                      <p className="font-body text-sm text-obsidian-200 leading-relaxed">{g.body}</p>
                      <div className="p-2 rounded-lg" style={{ background:`${info.color}10`, border:`1px solid ${info.color}20` }}>
                        <span className="font-mono text-xs" style={{ color:info.color }}>실천 방법: </span>
                        <span className="font-body text-xs text-obsidian-200">{g.practice}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* 본능 하위유형 */}
            <Card>
              <SectionHeader code="🏡 하위유형" title={`자기보존/성적/사회적 — ${result.instinctualVariant.label}`} color={info.color} />
              <div className="px-5 py-4">
                <p className="font-body text-sm text-obsidian-300 leading-relaxed mb-4">{result.instinctualVariant.description}</p>
                <div className="h-px bg-obsidian-800 mb-4" />
                <p className="font-body text-sm text-obsidian-200 leading-relaxed">{typeInfo[result.type].subtypes[result.instinctualVariant.variant]}</p>
              </div>
            </Card>

          </div>
        )}

        {/* 다시 검사 */}
        <div className="mt-8 text-center">
          <button onClick={onRetake}
            className="px-8 py-3 rounded-full font-body text-sm transition-all duration-200"
            style={{ background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.09)', color:'#787880' }}>
            다시 검사하기
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResultScreen;
