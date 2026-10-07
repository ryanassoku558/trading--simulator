export type Experience = "new" | "basics" | "experienced";
export interface User {
  id: string;
  name: string;
}
export interface OnboardingPreferences {
  experience: Experience;
  beginner: boolean;
}
export interface Profile extends User, OnboardingPreferences {
  onboarded: boolean;
  avatar?: "sprout" | "leaf" | "sun" | "moon";
  handle?: string;
  bio?: string;
  country?: string;
  timezone?: string;
  joinedAt?: string;
  achievementNotifications?: boolean;
  hideProfileInsights?: boolean;
}
export interface StockPriceHistory {
  date: string;
  price: number;
}
export interface Stock {
  assetType?: "Stock" | "ETF";
  ticker: string;
  company: string;
  price: number;
  change: number;
  cap: string;
  volume: string;
  description: string;
  color: string;
}
export interface Holding {
  ticker: string;
  shares: number;
  averageCost: number;
}
export interface Trade {
  id: string;
  date: string;
  ticker: string;
  side: "buy" | "sell";
  shares: number;
  price: number;
  total: number;
  realized: number;
  portfolioValue: number;
}
export interface Order {
  id: string;
  ticker: string;
  side: "buy" | "sell";
  shares: number;
  limit: number;
  status: "pending" | "filled" | "cancelled";
  date: string;
}
export interface Quiz {
  question: string;
  options: string[];
  answer: number;
  explanation: string;
}
export interface Lesson {
  id: number;
  level: number;
  title: string;
  explanation: string;
  example: string;
  why: string;
  quiz: Quiz;
}
export interface QuizAttempt {
  lessonId: number;
  correct: boolean;
  date: string;
}
export interface LearningProgress {
  starterModulesCompleted?: string[];
  quizPasses?: number;
  completed: number[];
  attempts: QuizAttempt[];
  xp: number;
  streak: number;
  lastDay: string;
}
export interface Achievement {
  id: string;
  title: string;
  description: string;
}
export interface UserAchievement {
  id: string;
  earned: boolean;
}
export interface VirtualAccount {
  cash: number;
  holdings: Holding[];
  trades: Trade[];
  orders: Order[];
}
export interface JournalEntry {
 tradeId: string; note: string; emotion: string; initialRisk?: number;
}
export interface PracticeChallenge { id: string; startedAt: string; startingEquity: number; startTradeCount: number; }
export interface State extends VirtualAccount {
 simulatorDeposits?: number;
 referralDeposits?: number;
 moods?: {id:string;date:string;mood:"Calm"|"Fear"|"Greed"|"Tilt"|"Hesitation"}[];
 returnGoal?: {startedAt:string;startingEquity:number;targetPercent:number};
 journal?: JournalEntry[];
 challenge?: PracticeChallenge;
  profile: Profile;
  learning: LearningProgress;
  watchlist: string[];
  tick: number;
  snapshots: { date: string; value: number }[];
}

export interface PriceCandle {
  period: string;
  open: number;
  high: number;
  low: number;
  close: number;
}
