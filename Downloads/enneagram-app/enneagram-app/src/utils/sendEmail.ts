import { TypeResult, UserInfo, EnneagramType } from '../types';
import { typeInfo } from '../data/typeInfo';
import { MAX_SCORE } from './calculateResult';

// ─────────────────────────────────────────────
// EmailJS 설정값 — emailjs.com 가입 후 아래 세 값을 교체하세요
// ─────────────────────────────────────────────
const EMAILJS_SERVICE_ID  = 'service_enneagram';   // EmailJS > Email Services 에서 확인
const EMAILJS_TEMPLATE_ID = 'template_enneagram';  // EmailJS > Email Templates 에서 확인
const EMAILJS_PUBLIC_KEY  = 'MIV6ZOURUEMUPOA0L';      // EmailJS > Account > Public Key

export async function sendResultEmail(userInfo: UserInfo, result: TypeResult): Promise<boolean> {
  try {
    const info = typeInfo[result.type];
    const genderLabel = userInfo.gender === 'male' ? '남성' : userInfo.gender === 'female' ? '여성' : '기타';
    const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });

    // 점수 순위 텍스트 (80점 만점)
    const scoreText = result.scores.slice(0, 9).map((s, i) =>
      `  ${i + 1}위. 유형 ${s.type} (${typeInfo[s.type as EnneagramType].name}): ${s.score}점 / ${MAX_SCORE}점`
    ).join('\n');

    const templateParams = {
      to_email:      'shinbekbum1000@gmail.com',
      user_name:     userInfo.name,
      user_age:      `${userInfo.age}세`,
      user_gender:   genderLabel,
      test_date:     today,
      main_type:     `유형 ${result.type} — ${info.name} (${info.nickname})`,
      health_level:  result.healthLevel.label,
      instinct:      result.instinctualVariant.label,
      integration:   `유형 ${result.integration} (${typeInfo[result.integration].name})`,
      disintegration:`유형 ${result.disintegration} (${typeInfo[result.disintegration].name})`,
      score_ranking: scoreText,
      max_score:     `${MAX_SCORE}점`,
      core_desire:   info.coreDesire,
      core_fear:     info.coreFear,
      ai_comment:    result.aiComment,
    };

    const emailjs = await import('@emailjs/browser');
    await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams, EMAILJS_PUBLIC_KEY);
    return true;
  } catch (err) {
    console.error('이메일 전송 실패:', err);
    return false;
  }
}
