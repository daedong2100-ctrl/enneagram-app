import type { VercelRequest, VercelResponse } from '@vercel/node';
import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageBreak,
} from 'docx';
import { Resend } from 'resend';

// ─── 타입 정의 ─────────────────────────────────
interface TypeScore { type: number; score: number; percentage: number }
interface TypeResult {
  type: number; scores: TypeScore[];
  healthLevel: { level: 'healthy'|'average'|'unhealthy'; label: string };
  integration: number; disintegration: number;
  instinctualVariant: { variant: 'sp'|'sx'|'so'; label: string; description: string };
  aiComment: string;
}
interface UserInfo { name: string; age: string; gender: 'male'|'female'|'other' }
interface RequestBody { userInfo: UserInfo; result: TypeResult }

// ─── 유형 정보 (간략) ──────────────────────────
const TYPE_NAMES: Record<number, string> = {
  1:'개혁가',2:'조력가',3:'성취가',4:'예술가',5:'탐구가',
  6:'충성가',7:'열정가',8:'도전가',9:'평화주의자',
};

// ─── docx 헬퍼 ────────────────────────────────
const hex = (c: string) => c.replace('#', '');

function cellBorder(color: string) {
  const b = { style: BorderStyle.SINGLE, size: 1, color: hex(color) };
  return { top: b, bottom: b, left: b, right: b };
}

function pr(text: string, opts: { bold?: boolean; italics?: boolean; color?: string; size?: number } = {}): TextRun {
  return new TextRun({ text, bold: opts.bold, italics: opts.italics, color: opts.color ? hex(opts.color) : undefined, size: opts.size });
}

function para(runs: TextRun[], before = 0, after = 0, align?: AlignmentType): Paragraph {
  return new Paragraph({ children: runs, alignment: align, spacing: { before, after } });
}

function gap(before = 120, after = 80): Paragraph {
  return new Paragraph({ children: [], spacing: { before, after } });
}

function singleCell(children: Paragraph[], fill: string, borderColor = 'DDDDDD'): Table {
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [9360],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: 9360, type: WidthType.DXA },
      borders: cellBorder(borderColor),
      shading: { fill: hex(fill), type: ShadingType.CLEAR },
      margins: { top: 160, bottom: 160, left: 220, right: 220 },
      children,
    })] })],
  });
}

function twoCol(left: Paragraph[], leftFill: string, right: Paragraph[], rightFill: string): Table {
  const b = cellBorder('DDDDDD'); const m = { top: 160, bottom: 160, left: 200, right: 200 };
  return new Table({
    width: { size: 9360, type: WidthType.DXA }, columnWidths: [4680, 4680],
    rows: [new TableRow({ children: [
      new TableCell({ width: { size: 4680, type: WidthType.DXA }, borders: b, shading: { fill: hex(leftFill), type: ShadingType.CLEAR }, margins: m, children: left }),
      new TableCell({ width: { size: 4680, type: WidthType.DXA }, borders: b, shading: { fill: hex(rightFill), type: ShadingType.CLEAR }, margins: m, children: right }),
    ] })],
  });
}

function sectionHeader(emoji: string, title: string): (Paragraph | Table)[] {
  return [
    new Paragraph({ children: [pr(`${emoji}  `, { color: '#004D40', size: 28 }), pr(title, { bold: true, color: '#004D40', size: 30 })], spacing: { before: 360, after: 80 } }),
    new Paragraph({ children: [], border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '00695C', space: 1 } }, spacing: { before: 60, after: 100 } }),
    gap(40, 60),
  ];
}

// ─── Word 문서 생성 ────────────────────────────
async function buildDocx(userInfo: UserInfo, result: TypeResult): Promise<Buffer> {
  const typeName = TYPE_NAMES[result.type] ?? `${result.type}번`;
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const genderLabel = userInfo.gender === 'male' ? '남성' : userInfo.gender === 'female' ? '여성' : '기타';

  const children: (Paragraph | Table)[] = [];
  const add = (...items: (Paragraph | Table | (Paragraph | Table)[])[]) => {
    for (const item of items) Array.isArray(item) ? children.push(...item) : children.push(item);
  };

  // 표지
  add(singleCell([
    para([pr('에니어그램 심층 분석 리포트', { bold: true, color: '#A8D8CF', size: 22 })], 0, 160, AlignmentType.CENTER),
    para([pr(`${result.type}번 유형 · ${typeName}`, { bold: true, color: '#FFFFFF', size: 44 })], 0, 140, AlignmentType.CENTER),
    para([pr(`${userInfo.name}  |  ${userInfo.age}세 ${genderLabel}  |  ${today}`, { color: '#C8E6E2', size: 20 })], 0, 0, AlignmentType.CENTER),
  ], '#004D40', '004D40'));

  add(gap(200, 100));

  // 점수 요약
  const top3 = result.scores.slice(0, 3);
  add(singleCell([
    para([pr('📊 주요 유형 점수', { bold: true, color: '#004D40', size: 20 })], 0, 100),
    ...top3.map((s, i) => para([
      pr(`  ${i + 1}위  유형 ${s.type} ${TYPE_NAMES[s.type] ?? ''}`, { bold: i === 0, color: i === 0 ? '#004D40' : '#555555', size: 18 }),
      pr(`  ${s.score}점 (${s.percentage.toFixed(0)}%)`, { color: '#666666', size: 18 }),
    ], 0, 40)),
    para([pr(`건강 수준: ${result.healthLevel.label}  |  본능 하위유형: ${result.instinctualVariant.label}`, { color: '#555555', size: 18 })], 80, 0),
  ], '#F5F5F5'));

  // 종합 코멘트
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('✨', '종합 분석 코멘트'));
  add(singleCell(
    result.aiComment.split('\n\n').map(p => para([pr(p, { color: '#333333', size: 18 })], 0, 100)),
    '#F5F5F5'
  ));

  // 성장 방향
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('🌱', '성장과 통합의 방향'));
  add(twoCol(
    [para([pr('성장할 때 →', { color: '#555555', size: 18 })], 0, 60, AlignmentType.CENTER),
     para([pr(`유형 ${result.integration}  ${TYPE_NAMES[result.integration] ?? ''}`, { bold: true, color: '#6B9E8B', size: 24 })], 0, 0, AlignmentType.CENTER)],
    '#E8F5E9',
    [para([pr('← 스트레스', { color: '#555555', size: 18 })], 0, 60, AlignmentType.CENTER),
     para([pr(`유형 ${result.disintegration}  ${TYPE_NAMES[result.disintegration] ?? ''}`, { bold: true, color: '#C45C3E', size: 24 })], 0, 0, AlignmentType.CENTER)],
    '#FFEBEE'
  ));

  const doc = new Document({
    sections: [{ properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 } } }, children }],
  });

  return Packer.toBuffer(doc);
}

// ─── API 핸들러 ────────────────────────────────
export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'RESEND_API_KEY 환경변수가 설정되지 않았습니다.' });

  try {
    const { userInfo, result } = req.body as RequestBody;
    if (!userInfo || !result) return res.status(400).json({ error: '데이터 누락' });

    const docxBuffer = await buildDocx(userInfo, result);
    const typeName = TYPE_NAMES[result.type] ?? `${result.type}번`;
    const fileName = `에니어그램_${result.type}번_${typeName}_${userInfo.name}.docx`;

    const resend = new Resend(apiKey);
    await resend.emails.send({
      from: 'Enneagram Report <onboarding@resend.dev>',
      to: ['shinbekbum1000@gmail.com'],
      subject: `[에니어그램] ${userInfo.name}님 — ${result.type}번 ${typeName} 결과 리포트`,
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #004D40;">에니어그램 심층 분석 리포트</h2>
          <p><b>${userInfo.name}</b>님 (${userInfo.age}세 ${userInfo.gender === 'male' ? '남성' : userInfo.gender === 'female' ? '여성' : '기타'})</p>
          <p>주 유형: <b>${result.type}번 ${typeName}</b></p>
          <p>건강 수준: ${result.healthLevel.label} | 하위유형: ${result.instinctualVariant.label}</p>
          <hr/>
          <p style="color:#555; font-size:13px;">Word 파일이 첨부되어 있습니다.</p>
        </div>
      `,
      attachments: [{
        filename: fileName,
        content: docxBuffer.toString('base64'),
        contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      }],
    });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('[send-report]', err);
    return res.status(500).json({ error: String(err) });
  }
}
