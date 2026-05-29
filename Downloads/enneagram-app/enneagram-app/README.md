# 에니어그램 성격 유형 검사 앱

> 144문항 기반 심층 에니어그램 성격 유형 검사 웹앱

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 `http://localhost:5173` 접속

### 3. 프로덕션 빌드

```bash
npm run build
```

`dist/` 폴더에 정적 파일이 생성됩니다.

---

## ☁️ 배포 방법

### Vercel (추천)

```bash
# Vercel CLI 설치
npm i -g vercel

# 배포
vercel
```

또는 GitHub 저장소를 Vercel에 연결하면 자동 배포됩니다.

### Netlify

```bash
# 빌드
npm run build

# dist 폴더를 Netlify에 드래그앤드롭 또는 CLI로 배포
npx netlify-cli deploy --prod --dir=dist
```

---

## 📁 프로젝트 구조

```
src/
├── components/
│   ├── IntroScreen.tsx     # 시작 화면
│   ├── QuizScreen.tsx      # 설문 화면 (144문항)
│   └── ResultScreen.tsx    # 결과 화면
├── data/
│   ├── questions.ts        # 144개 문항 데이터
│   └── typeInfo.ts         # 9가지 유형 정보
├── types/
│   └── index.ts            # TypeScript 타입 정의
├── utils/
│   └── calculateResult.ts  # 결과 계산 로직
├── App.tsx
├── main.tsx
└── index.css
```

---

## ✨ 주요 기능

| 기능 | 설명 |
|------|------|
| 144문항 검사 | 9가지 유형 × 16문항, 리커트 5점 척도 |
| 유형 판별 | 주 유형 및 상위 5개 유형 점수 분포 |
| 날개 분석 | 인접 유형과의 날개 관계 분석 |
| 건강 수준 | 건강/평균/스트레스 3단계 수준 분석 |
| 통합/분열 | 성장 방향과 스트레스 방향 안내 |
| 본능적 하위유형 | SP/SX/SO 본능 변형 분석 |
| 성장 가이드 | 유형별 구체적인 성장 실천 방법 |
| 레이더 차트 | 9가지 유형 점수 시각화 |

---

## 🎨 기술 스택

- **React 18** + **TypeScript**
- **Vite** (빌드 도구)
- **Tailwind CSS** (스타일링)
- **Recharts** (레이더 차트)
- **Google Fonts** (Cormorant Garamond, DM Sans, JetBrains Mono)

---

## 📝 커스터마이징

### 문항 수정
`src/data/questions.ts`에서 문항을 추가/수정할 수 있습니다.

### 유형 정보 수정
`src/data/typeInfo.ts`에서 각 유형의 설명과 특성을 수정할 수 있습니다.

### 결과 계산 로직
`src/utils/calculateResult.ts`에서 점수 계산 방식을 조정할 수 있습니다.

### Claude API 연동 (선택사항)
AI 코멘트 기능을 실제 Claude API로 업그레이드하려면:

1. `src/utils/calculateResult.ts`의 `generateAIComment` 함수를 수정
2. API 키를 환경 변수로 설정: `.env` 파일에 `VITE_ANTHROPIC_API_KEY=your_key`
3. Fetch 요청으로 Claude API 호출

---

## 📄 라이선스

개인 및 교육 목적으로 자유롭게 사용 가능합니다.
상업적 에니어그램 도구는 인증된 전문가의 검토를 권장합니다.
