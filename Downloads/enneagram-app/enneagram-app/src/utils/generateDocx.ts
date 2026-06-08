import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, PageBreak,
} from 'docx';
import { TypeResult, UserInfo, EnneagramType } from '../types';
import { typeInfo } from '../data/typeInfo';
import { deepAnalysisData } from '../data/deepAnalysis';

type DocChild = Paragraph | Table;

const hex = (color: string) => color.replace('#', '');

function cellBorder(color: string) {
  const b = { style: BorderStyle.SINGLE, size: 1, color: hex(color) };
  return { top: b, bottom: b, left: b, right: b };
}

function p(runs: TextRun[], opts: { align?: AlignmentType; before?: number; after?: number } = {}): Paragraph {
  return new Paragraph({
    children: runs,
    alignment: opts.align,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 0 },
  });
}

function run(text: string, opts: {
  bold?: boolean; italics?: boolean; color?: string; size?: number;
} = {}): TextRun {
  return new TextRun({
    text,
    bold: opts.bold,
    italics: opts.italics,
    color: opts.color ? hex(opts.color) : undefined,
    size: opts.size,
  });
}

function gap(before = 120, after = 80): Paragraph {
  return new Paragraph({ children: [], spacing: { before, after } });
}

function bullets(items: string[], color = '444444'): Paragraph[] {
  return items.map(item =>
    new Paragraph({
      children: [run(`• ${item}`, { color, size: 18 })],
      spacing: { before: 40, after: 40 },
    })
  );
}

function singleCell(
  children: Paragraph[],
  fill: string,
  borderColor = 'DDDDDD',
  margins = { top: 160, bottom: 160, left: 220, right: 220 }
): Table {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [9360],
    rows: [new TableRow({
      children: [new TableCell({
        width: { size: 9360, type: WidthType.DXA },
        borders: cellBorder(borderColor),
        shading: { fill: hex(fill), type: ShadingType.CLEAR },
        margins,
        children,
      })],
    })],
  });
}

function twoCol(
  left: Paragraph[], leftFill: string,
  right: Paragraph[], rightFill: string
): Table {
  const b = cellBorder('DDDDDD');
  const m = { top: 160, bottom: 160, left: 200, right: 200 };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [4680, 4680],
    rows: [new TableRow({
      children: [
        new TableCell({ width: { size: 4680, type: WidthType.DXA }, borders: b, shading: { fill: hex(leftFill), type: ShadingType.CLEAR }, margins: m, children: left }),
        new TableCell({ width: { size: 4680, type: WidthType.DXA }, borders: b, shading: { fill: hex(rightFill), type: ShadingType.CLEAR }, margins: m, children: right }),
      ],
    })],
  });
}

function threeCol(cols: { children: Paragraph[]; fill: string }[]): Table {
  const b = cellBorder('DDDDDD');
  const m = { top: 180, bottom: 180, left: 180, right: 180 };
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3120, 3120, 3120],
    rows: [new TableRow({
      children: cols.map(col => new TableCell({
        width: { size: 3120, type: WidthType.DXA },
        borders: b,
        shading: { fill: hex(col.fill), type: ShadingType.CLEAR },
        margins: m,
        children: col.children,
      })),
    })],
  });
}

function sectionHeader(emoji: string, title: string): DocChild[] {
  return [
    new Paragraph({
      children: [
        run(`${emoji}  `, { color: '#004D40', size: 28 }),
        run(title, { bold: true, color: '#004D40', size: 30 }),
      ],
      spacing: { before: 360, after: 80 },
    }),
    new Paragraph({
      children: [],
      border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: '00695C', space: 1 } },
      spacing: { before: 60, after: 100 },
    }),
    gap(40, 60),
  ];
}

export async function generateDocxBlob(userInfo: UserInfo, result: TypeResult): Promise<Blob> {
  const info = typeInfo[result.type];
  const deep = deepAnalysisData[result.type];
  const today = new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
  const genderLabel = userInfo.gender === 'male' ? '남성' : userInfo.gender === 'female' ? '여성' : '기타';
  const tc = info.color; // type color (e.g. "#A0845C")

  const children: DocChild[] = [];
  function add(...items: (DocChild | DocChild[])[]) {
    for (const item of items) {
      if (Array.isArray(item)) children.push(...item);
      else children.push(item);
    }
  }

  // ══════════════════════════════
  // 표지
  // ══════════════════════════════
  add(gap(0, 0));

  // 헤더 박스 (dark green)
  add(singleCell([
    p([run('에니어그램 심층 분석 리포트', { bold: true, color: '#A8D8CF', size: 22 })], { align: AlignmentType.CENTER, after: 160 }),
    p([run(`${result.type}번 유형 · ${info.name} (${info.nickname})`, { bold: true, color: '#FFFFFF', size: 44 })], { align: AlignmentType.CENTER, after: 140 }),
    p([run(`${userInfo.name}  |  ${userInfo.age}세 ${genderLabel}  |  ${today}`, { color: '#C8E6E2', size: 20 })], { align: AlignmentType.CENTER }),
  ], '#004D40', '004D40'));

  add(gap(200, 100));

  // 안내 문구
  add(singleCell([
    p([run(
      '이 리포트는 당신의 따뜻한 내면을 더 선명하게 바라보고, 성장의 방향을 함께 탐색하기 위해 만들어졌습니다. 분석된 내용은 \'당신이 이렇다\'는 판정이 아니라, \'이런 경향이 있을 수 있다\'는 거울입니다. 편안한 마음으로 읽어주세요.',
      { italics: true, color: '#555555', size: 19 }
    )]),
  ], '#F5F5F5'));

  // ══════════════════════════════
  // 섹션 1: 전체 구조 분석
  // ══════════════════════════════
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('🗺', '전체 구조 분석 — 힘의 중심 역동'));

  add(threeCol([
    {
      fill: '#D6E4F7',
      children: [
        p([run('🧠  ', { size: 24, color: '#333333' }), run('머리 중심 (사고)', { bold: true, color: '#2E4172', size: 22 })], { align: AlignmentType.CENTER, after: 80 }),
        p([run(deep.powerCenter.head, { color: '#333333', size: 18 })]),
      ],
    },
    {
      fill: '#E8F5E9',
      children: [
        p([run('🌿  ', { size: 24, color: '#333333' }), run('장 중심 (본능)', { bold: true, color: '#2E7D32', size: 22 })], { align: AlignmentType.CENTER, after: 80 }),
        p([run(deep.powerCenter.gut, { color: '#333333', size: 18 })]),
      ],
    },
    {
      fill: '#FEF7E0',
      children: [
        p([run('❤️  ', { size: 24, color: '#333333' }), run('가슴 중심 (감정)', { bold: true, color: '#C6930A', size: 22 })], { align: AlignmentType.CENTER, after: 80 }),
        p([run(deep.powerCenter.heart, { color: '#333333', size: 18 })]),
      ],
    },
  ]));

  add(gap());

  // 사회적 스타일
  add(singleCell([
    p([
      run(`${deep.socialStyle.group}`, { bold: true, color: tc, size: 20 }),
      run(`  —  ${deep.socialStyle.coreAttitude}`, { italics: true, color: '#555555', size: 18 }),
    ], { after: 80 }),
    p([run('🏛 강점: ', { bold: true, color: '#00695C', size: 18 }), run(deep.socialStyle.strength, { color: '#333333', size: 18 })], { after: 60 }),
    p([run('⚠️ 그늘: ', { bold: true, color: '#C45C3E', size: 18 }), run(deep.socialStyle.shadow, { color: '#333333', size: 18 })]),
  ], '#F5F5F5'));

  // ══════════════════════════════
  // 섹션 2: 주 유형 심층
  // ══════════════════════════════
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('💙', `${result.type}번 유형의 심층`));

  // 슈퍼에고 인용구
  add(singleCell([
    p([run(`"${deep.superEgo.voice}"`, { bold: true, italics: true, color: '#006064', size: 26 })], { align: AlignmentType.CENTER, before: 20, after: 20 }),
    p([run('— 당신의 내면에서 끊임없이 울리는 슈퍼에고의 목소리', { italics: true, color: '#555555', size: 18 })], { align: AlignmentType.CENTER }),
  ], '#E0F7FA', '006064'));

  add(gap());
  add(p([run('이 목소리는 두 얼굴을 가지고 있습니다.', { bold: true, color: '#1B2A4A' })], { before: 200, after: 80 }));

  add(twoCol(
    [p([run('⚡  ', { color: '#333333' }), run('동력으로서의 슈퍼에고', { bold: true, color: '#00695C' })], { after: 80 }), ...bullets(deep.superEgo.asForce)],
    '#E0F2F1',
    [p([run('⚠️  ', { color: '#333333' }), run('족쇄로서의 슈퍼에고', { bold: true, color: '#C55A11' })], { after: 80 }), ...bullets(deep.superEgo.asChain)],
    '#FCE8DA'
  ));

  add(gap());
  add(p([run('기본 두려움과 기본 욕구', { bold: true, color: '#1B2A4A', size: 22 })], { before: 200, after: 80 }));

  add(twoCol(
    [p([run('😰  기본 두려움', { bold: true, color: '#880E4F' })], { after: 80 }), ...bullets(deep.fearDesire.fears)],
    '#FCE4EC',
    [p([run('🌱  기본 욕구', { bold: true, color: '#2E7D32' })], { after: 80 }), ...bullets(deep.fearDesire.desires)],
    '#E8F5E9'
  ));

  // ══════════════════════════════
  // 섹션 3: 악덕 & 미덕 + 갈등
  // ══════════════════════════════
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('⚖️', '악덕과 미덕, 방어기제'));

  add(twoCol(
    [
      p([run(`⚠️ 악덕 — ${deep.viceVirtue.vice.name}`, { bold: true, color: '#C45C3E', size: 18 })], { after: 80 }),
      p([run(deep.viceVirtue.vice.description, { color: '#333333', size: 18 })]),
    ],
    '#FCE8DA',
    [
      p([run(`🌟 미덕 — ${deep.viceVirtue.virtue.name}`, { bold: true, color: '#00695C', size: 18 })], { after: 80 }),
      p([run(deep.viceVirtue.virtue.description, { color: '#333333', size: 18 })]),
    ],
    '#E0F2F1'
  ));

  add(gap(80, 80));

  add(singleCell([
    p([run(`💡 방어기제 — ${deep.viceVirtue.defense.name}`, { bold: true, color: '#5B8FA8', size: 18 })], { after: 80 }),
    p([run(deep.viceVirtue.defense.description, { color: '#333333', size: 18 })]),
  ], '#E3F2FD', 'BBDEFB'));

  add(gap());
  add(p([run('갈등 대처 패턴', { bold: true, color: '#1B2A4A', size: 22 })], { before: 160, after: 80 }));

  add(twoCol(
    [p([run('🌋  내면의 실제', { bold: true, color: '#C45C3E', size: 18 })], { after: 80 }), p([run(deep.conflictStyle.inner, { color: '#333333', size: 18 })])],
    '#FCE8DA',
    [p([run('😊  외면의 모습', { bold: true, color: '#5B8FA8', size: 18 })], { after: 80 }), p([run(deep.conflictStyle.outer, { color: '#333333', size: 18 })])],
    '#E3F2FD'
  ));

  add(gap(80, 80));

  add(singleCell([
    p([run('💡 알아두면 좋은 것', { bold: true, color: '#D4A444', size: 18 })], { after: 60 }),
    p([run(deep.conflictStyle.insight, { color: '#333333', size: 18 })]),
  ], '#FFF8E1', 'FFE082'));

  // ══════════════════════════════
  // 섹션 4: 관계 & 번아웃
  // ══════════════════════════════
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('💞', '관계의 딜레마'));

  add(singleCell([
    p([run(deep.relationshipDilemma.core, { bold: true, color: '#1B2A4A', size: 20 })]),
  ], 'F0F8F7'));

  add(gap(80, 40));
  add(p([run(`• ${deep.relationshipDilemma.dynamic1}`, { color: '#555555', size: 18 })], { after: 40 }));
  add(p([run(`• ${deep.relationshipDilemma.dynamic2}`, { color: '#555555', size: 18 })], { after: 80 }));

  add(singleCell([
    p([run('🌱 해결의 실마리', { bold: true, color: '#00695C', size: 18 })], { after: 60 }),
    p([run(deep.relationshipDilemma.solution, { color: '#333333', size: 18 })]),
  ], '#E8F5E9'));

  add(gap());
  add(p([run('번아웃 신호와 자기돌봄 가이드', { bold: true, color: '#1B2A4A', size: 22 })], { before: 160, after: 80 }));

  add(twoCol(
    [p([run('🚨 번아웃 경고 신호', { bold: true, color: '#C45C3E', size: 18 })], { after: 80 }), ...bullets(deep.burnoutGuide.signals)],
    '#FFEBEE',
    [p([run('🌿 자기돌봄 처방', { bold: true, color: '#00695C', size: 18 })], { after: 80 }), ...bullets(deep.burnoutGuide.selfcare)],
    '#E8F5E9'
  ));

  // ══════════════════════════════
  // 섹션 5: 건강 수준
  // ══════════════════════════════
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('🌈', '건강 수준별 당신의 모습'));

  const isHealthy = result.healthLevel.level === 'healthy';
  const isAverage = result.healthLevel.level === 'average';
  const isUnhealthy = result.healthLevel.level === 'unhealthy';

  add(singleCell([
    p([run(`🌟 건강한 수준${isHealthy ? '  ← 현재' : ''}`, { bold: true, color: '#6B9E8B', size: 18 })], { after: 60 }),
    p([run(deep.healthLevelDetail.healthy, { color: '#333333', size: 18 })]),
  ], '#F1F8F6'));
  add(gap(60, 60));

  add(singleCell([
    p([run(`🔶 평균 수준${isAverage ? '  ← 현재' : ''}`, { bold: true, color: '#D4A444', size: 18 })], { after: 60 }),
    p([run(deep.healthLevelDetail.average, { color: '#333333', size: 18 })]),
  ], '#FFFDE7'));
  add(gap(60, 60));

  add(singleCell([
    p([run(`⚠️ 주의가 필요한 수준${isUnhealthy ? '  ← 현재' : ''}`, { bold: true, color: '#C45C3E', size: 18 })], { after: 60 }),
    p([run(deep.healthLevelDetail.warning, { color: '#333333', size: 18 })]),
  ], '#FFF3F0'));

  // ══════════════════════════════
  // 섹션 6: 성장 가이드
  // ══════════════════════════════
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('🌱', '성장 가이드'));

  // 통합/분열
  add(p([run('통합과 분열의 방향', { bold: true, color: '#1B2A4A', size: 22 })], { after: 80 }));

  add(twoCol(
    [
      p([run('성장할 때 →', { color: '#555555', size: 18 })], { align: AlignmentType.CENTER, after: 80 }),
      p([run(`유형 ${result.integration}`, { bold: true, color: '#6B9E8B', size: 36 })], { align: AlignmentType.CENTER, after: 60 }),
      p([run(typeInfo[result.integration].name, { bold: true, color: '#6B9E8B', size: 20 })], { align: AlignmentType.CENTER, after: 80 }),
      p([run(typeInfo[result.integration].healthyDescription, { color: '#333333', size: 18 })]),
    ],
    '#E8F5E9',
    [
      p([run('← 스트레스', { color: '#555555', size: 18 })], { align: AlignmentType.CENTER, after: 80 }),
      p([run(`유형 ${result.disintegration}`, { bold: true, color: '#C45C3E', size: 36 })], { align: AlignmentType.CENTER, after: 60 }),
      p([run(typeInfo[result.disintegration].name, { bold: true, color: '#C45C3E', size: 20 })], { align: AlignmentType.CENTER, after: 80 }),
      p([run(typeInfo[result.disintegration].unhealthyDescription, { color: '#333333', size: 18 })]),
    ],
    '#FFEBEE'
  ));

  add(gap());
  add(p([run('성장을 위한 세 가지 제안', { bold: true, color: '#1B2A4A', size: 22 })], { before: 160, after: 80 }));

  for (const g of deep.growthSuggestions) {
    add(singleCell([
      p([run(`${g.number}  ${g.icon}  ${g.title}`, { bold: true, color: tc, size: 20 })], { after: 80 }),
      p([run(g.body, { color: '#333333', size: 18 })], { after: 60 }),
      p([run('실천 방법: ', { bold: true, color: tc, size: 18 }), run(g.practice, { color: '#555555', size: 18 })]),
    ], '#F5F5F5'));
    add(gap(60, 60));
  }

  // 하위유형
  add(p([run(`하위유형 — ${result.instinctualVariant.label}`, { bold: true, color: '#1B2A4A', size: 22 })], { before: 160, after: 80 }));
  add(singleCell([
    p([run(result.instinctualVariant.description, { italics: true, color: '#555555', size: 18 })], { after: 80 }),
    p([run(typeInfo[result.type].subtypes[result.instinctualVariant.variant], { color: '#333333', size: 18 })]),
  ], '#F5F5F5'));

  // ══════════════════════════════
  // 섹션 E: 종합 분석 코멘트
  // ══════════════════════════════
  add(new Paragraph({ children: [new PageBreak()] }));
  add(sectionHeader('✨', '종합 분석 코멘트'));

  add(singleCell(
    result.aiComment.split('\n\n').map(para =>
      p([run(para, { color: '#333333', size: 18 })], { after: 100 })
    ),
    '#F5F5F5'
  ));

  add(gap());
  add(sectionHeader('🙏', '마치며'));
  add(singleCell([
    p([run(deep.closingMessage, { italics: true, color: '#1B2A4A', size: 20 })]),
  ], '#F0F8F7'));

  // ══════════════════════════════
  // 문서 생성
  // ══════════════════════════════
  const doc = new Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 15840 },
          margin: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
        },
      },
      children,
    }],
  });

  return Packer.toBlob(doc);
}

export function downloadDocx(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
