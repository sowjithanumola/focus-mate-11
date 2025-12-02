export interface DailyEntry {
  id: string;
  date: string; // ISO string YYYY-MM-DD
  subjects: string;
  durationMinutes: number;
  focusLevel: number; // 1-10
  remarks: string;
  timestamp: number;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface AIAnalysis {
  summary: string;
  trends: string[];
  mistakes: string[];
  suggestions: string[];
}

export enum ViewState {
  DAILY_LOG = 'DAILY_LOG',
  ANALYTICS = 'ANALYTICS',
  HISTORY = 'HISTORY',
  AI_COACH = 'AI_COACH'
}

export interface ChartDataPoint {
  day: string;
  duration: number;
  focus: number;
}