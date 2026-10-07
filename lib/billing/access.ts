export const starterModules = [
  { title: 'Market Basics', ids: [1, 3, 4, 5] },
  { title: 'Candlesticks', ids: [18, 26, 27, 28] },
  { title: 'Chart Patterns', ids: [20, 29, 30, 112] },
  { title: 'Trend & Momentum', ids: [19, 55, 56, 113] },
  { title: 'Volume & Volatility', ids: [10, 36, 57, 58] },
];
export const starterLessonIds = starterModules.flatMap(m => m.ids);
export function canLearn(id: number, pro: boolean) { return pro || starterLessonIds.includes(id); }
export function isProSubscription(status: string, expires: string | null, now = Date.now()) {
  return status === 'active' && !!expires && Date.parse(expires) > now;
}
