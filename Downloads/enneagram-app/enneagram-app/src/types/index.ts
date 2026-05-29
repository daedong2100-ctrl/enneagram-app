export type EnneagramType = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

export interface UserInfo {
  name: string;
  age: string;
  gender: 'male' | 'female' | 'other';
}

export interface Question {
  id: number;
  text: string;
  type: EnneagramType;
}

export interface Answer {
  questionId: number;
  value: number;
}

export interface TypeScore {
  type: EnneagramType;
  score: number;
  percentage: number;
}

export interface WingInfo {
  dominant: EnneagramType;
  wing: EnneagramType | null;
  label: string;
}

export interface HealthLevel {
  level: 'healthy' | 'average' | 'unhealthy';
  label: string;
  description: string;
}

export interface InstinctualVariant {
  variant: 'sp' | 'sx' | 'so';
  label: string;
  description: string;
}

export interface TypeResult {
  type: EnneagramType;
  scores: TypeScore[];
  wing: WingInfo;
  healthLevel: HealthLevel;
  integration: EnneagramType;
  disintegration: EnneagramType;
  instinctualVariant: InstinctualVariant;
  aiComment: string;
}

export type AppScreen = 'intro' | 'userinfo' | 'quiz' | 'result';
