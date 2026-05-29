import { Answer, EnneagramType, TypeScore, WingInfo, HealthLevel, InstinctualVariant, TypeResult } from '../types';
import { questions } from '../data/questions';
import { typeInfo } from '../data/typeInfo';

// 16문항 × 5점 = 80점 만점
export const MAX_SCORE = 80;

export function calculateScores(answers: Answer[]): TypeScore[] {
  const scores: Record<EnneagramType, number> = {
    1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0
  };

  answers.forEach(answer => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question) {
      scores[question.type] += answer.value;
    }
  });

  const rawScores = Object.entries(scores).map(([type, total]) => {
    const t = Number(type) as EnneagramType;
    return { type: t, raw: total };
  });

  const maxScore = Math.max(...rawScores.map(s => s.raw));
  const minScore = Math.min(...rawScores.map(s => s.raw));
  const range = maxScore - minScore || 1;

  return rawScores.map(s => ({
    type: s.type,
    score: s.raw,
    percentage: Math.round(((s.raw - minScore) / range) * 100),
  })).sort((a, b) => b.score - a.score);
}

export function determineWing(dominantType: EnneagramType, scores: TypeScore[]): WingInfo {
  const wingOptions: Record<EnneagramType, [EnneagramType, EnneagramType]> = {
    1: [9, 2], 2: [1, 3], 3: [2, 4], 4: [3, 5],
    5: [4, 6], 6: [5, 7], 7: [6, 8], 8: [7, 9], 9: [8, 1],
  };

  const wings = wingOptions[dominantType];
  const scoreMap = Object.fromEntries(scores.map(s => [s.type, s.score]));
  const wing1Score = scoreMap[wings[0]] || 0;
  const wing2Score = scoreMap[wings[1]] || 0;
  const diff = Math.abs(wing1Score - wing2Score);
  const dominantWing = wing1Score > wing2Score ? wings[0] : wings[1];

  if (diff < 3) {
    return { dominant: dominantType, wing: null, label: `${dominantType}w (날개 균형)` };
  }
  return { dominant: dominantType, wing: dominantWing, label: `${dominantType}w${dominantWing}` };
}

export function determineHealthLevel(topScore: number, answers: Answer[], dominantType: EnneagramType): HealthLevel {
  const typeAnswers = answers.filter(a => {
    const q = questions.find(q => q.id === a.questionId);
    return q?.type === dominantType;
  });
  const avg = typeAnswers.reduce((sum, a) => sum + a.value, 0) / (typeAnswers.length || 1);

  if (avg >= 4.0) return { level: 'healthy', label: '건강한 수준', description: '자신의 핵심 두려움을 인식하고 통합된 방식으로 살아가고 있습니다.' };
  if (avg >= 2.8) return { level: 'average', label: '평균 수준', description: '핵심 패턴이 활성화되어 있으며, 자신의 유형의 특성들이 일상적으로 작동하고 있습니다.' };
  return { level: 'unhealthy', label: '스트레스 수준', description: '핵심 두려움에 의해 강하게 반응하고 있으며, 그림자 특성이 더 두드러지게 나타납니다.' };
}

export function determineInstinctualVariant(answers: Answer[]): InstinctualVariant {
  const spTypes = [1, 5, 9];
  const soTypes = [2, 3, 6];
  const sxTypes = [4, 7, 8];

  const spScore = answers.filter(a => { const q = questions.find(q => q.id === a.questionId); return q && spTypes.includes(q.type); }).reduce((sum, a) => sum + a.value, 0);
  const soScore = answers.filter(a => { const q = questions.find(q => q.id === a.questionId); return q && soTypes.includes(q.type); }).reduce((sum, a) => sum + a.value, 0);
  const sxScore = answers.filter(a => { const q = questions.find(q => q.id === a.questionId); return q && sxTypes.includes(q.type); }).reduce((sum, a) => sum + a.value, 0);

  if (spScore >= soScore && spScore >= sxScore) return { variant: 'sp', label: '자기보존 (SP)', description: '안전, 건강, 자원 확보에 초점을 두는 본능이 강합니다.' };
  if (soScore >= spScore && soScore >= sxScore) return { variant: 'so', label: '사회적 (SO)', description: '집단 내 역할과 지위, 소속감에 초점을 두는 본능이 강합니다.' };
  return { variant: 'sx', label: '성적/일대일 (SX)', description: '강렬한 일대일 연결과 깊은 경험에 초점을 두는 본능이 강합니다.' };
}

export function generateAIComment(result: Omit<TypeResult, 'aiComment'>): string {
  const info = typeInfo[result.type];
  const healthText = result.healthLevel.level === 'healthy' ? '건강하고 통합된' : result.healthLevel.level === 'average' ? '일반적인' : '스트레스가 많은';

  const comments: Record<EnneagramType, string[]> = {
    1: [`당신은 ${info.name}입니다. 내면에 강한 도덕적 나침반이 있으며, 세상을 더 나은 곳으로 만들고자 하는 진정한 열망이 있습니다.`, `${healthText} 상태에서 당신의 완벽주의는 ${result.healthLevel.level === 'healthy' ? '지혜로운 분별력과 수용력으로 승화되고 있습니다' : '자신과 타인에 대한 과도한 비판으로 나타날 수 있습니다'}.`, `성장의 방향은 유형 ${info.integration}(${typeInfo[info.integration].name})의 특성을 발전시키는 것입니다.`],
    2: [`당신은 ${info.name}입니다. 깊은 공감 능력과 따뜻한 마음으로 다른 사람들에게 자연스럽게 이끌리는 성향이 있습니다.`, `${healthText} 상태에서 당신의 헌신은 ${result.healthLevel.level === 'healthy' ? '무조건적인 사랑과 진정한 돌봄으로 아름답게 표현됩니다' : '인정에 대한 기대나 자기 부정으로 변질될 수 있습니다'}.`, `성장의 핵심은 자신의 필요와 감정을 인식하고 표현하는 것입니다.`],
    3: [`당신은 ${info.name}입니다. 목표를 향한 놀라운 추진력과 어떤 상황에서도 최선의 모습을 만들어내는 능력이 있습니다.`, `${healthText} 상태에서 당신의 성취 지향성은 ${result.healthLevel.level === 'healthy' ? '진정성 있는 영감으로 다른 사람들을 이끌고 있습니다' : '이미지 관리와 외적 인정에 대한 집착으로 나타날 수 있습니다'}.`, `성장을 위해 성과와 이미지를 내려놓고 진정한 자신이 누구인지 탐구하는 것이 핵심입니다.`],
    4: [`당신은 ${info.name}입니다. 깊은 감수성과 독특한 시각으로 세상의 아름다움과 의미를 감지하는 특별한 능력이 있습니다.`, `${healthText} 상태에서 당신의 감수성은 ${result.healthLevel.level === 'healthy' ? '창의적인 표현과 깊은 공감으로 승화되고 있습니다' : '결핍감과 자기 연민으로 이어질 수 있습니다'}.`, `성장의 방향은 현재에 집중하고 이상보다 현실 속에서 규율과 구조를 만들어가는 것입니다.`],
    5: [`당신은 ${info.name}입니다. 깊은 분석력과 관찰력으로 세상을 이해하고, 지식 속에서 안전함을 찾는 독특한 방식이 있습니다.`, `${healthText} 상태에서 당신의 탐구 성향은 ${result.healthLevel.level === 'healthy' ? '혁신적인 통찰과 독창적인 아이디어로 꽃피고 있습니다' : '고립과 감정적 분리로 나타날 수 있습니다'}.`, `성장을 위해 분석에서 행동으로, 관찰에서 참여로 나아가는 용기를 키워보세요.`],
    6: [`당신은 ${info.name}입니다. 깊은 충성심과 책임감, 그리고 위험을 미리 감지하는 날카로운 직관이 있습니다.`, `${healthText} 상태에서 당신의 안전 추구는 ${result.healthLevel.level === 'healthy' ? '용기 있는 행동과 신뢰할 수 있는 관계 구축으로 나타납니다' : '과도한 불안과 의심으로 이어질 수 있습니다'}.`, `성장의 핵심은 내면의 평화를 찾고, 외부 확인 없이도 자신을 신뢰하는 법을 배우는 것입니다.`],
    7: [`당신은 ${info.name}입니다. 삶에 대한 열정과 가능성에 대한 넘치는 상상력으로 주변 사람들에게 에너지를 줍니다.`, `${healthText} 상태에서 당신의 열정은 ${result.healthLevel.level === 'healthy' ? '진정한 충만함과 감사로 현재에 깊이 참여하고 있습니다' : '끊임없는 자극 추구와 불편한 감정 회피로 나타날 수 있습니다'}.`, `성장을 위해 깊이와 집중을 개발하고, 고통과 어두운 감정을 직면하는 것이 핵심입니다.`],
    8: [`당신은 ${info.name}입니다. 강한 의지와 보호 본능, 그리고 불의에 맞서는 용기 있는 정신이 있습니다.`, `${healthText} 상태에서 당신의 강인함은 ${result.healthLevel.level === 'healthy' ? '약자를 보호하고 정의를 실현하는 진정한 리더십으로 발휘됩니다' : '과도한 통제와 지배적 성향으로 나타날 수 있습니다'}.`, `성장의 방향은 취약함을 약점이 아닌 강점으로 수용하고 부드러운 힘을 개발하는 것입니다.`],
    9: [`당신은 ${info.name}입니다. 깊은 수용력과 중재 능력, 그리고 모든 관점을 이해하는 포용적인 본성이 있습니다.`, `${healthText} 상태에서 당신의 평화로움은 ${result.healthLevel.level === 'healthy' ? '진정한 통합과 지혜로 다른 사람들이 화합하도록 돕고 있습니다' : '갈등 회피와 자기 소멸로 나타날 수 있습니다'}.`, `성장의 핵심은 자신의 욕구와 의견을 인식하고 표현하는 것입니다.`],
  };

  return comments[result.type].join('\n\n');
}

export function analyzeResults(answers: Answer[]): TypeResult {
  const scores = calculateScores(answers);
  const dominantType = scores[0].type;
  const wing = determineWing(dominantType, scores);
  const healthLevel = determineHealthLevel(scores[0].score, answers, dominantType);
  const instinctualVariant = determineInstinctualVariant(answers);
  const info = typeInfo[dominantType];

  const partial = { type: dominantType, scores, wing, healthLevel, integration: info.integration, disintegration: info.disintegration, instinctualVariant };
  const aiComment = generateAIComment(partial as TypeResult);

  return { ...partial, aiComment };
}
