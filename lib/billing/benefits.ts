import {lessons,achievements} from '@/lib/education';
import tutorials from '@/lib/education/tutorials.json';
import {learningModules} from './curriculum';
export const freeTutorialSlugs=tutorials.slice(0,5).map(t=>t.slug);
export const canWatchTutorial=(slug:string,pro:boolean)=>pro||freeTutorialSlugs.includes(slug);
export const psychologyLessonCount=learningModules.filter(m=>/psychology|emotions/i.test(m.title)).reduce((total,m)=>total+m.ids.length,0);
export const aiLessonCount=learningModules.filter(m=>m.title==='Trading with AI Tools').reduce((count,m)=>count+m.ids.length,0);
export const proBenefits=[
 `${learningModules.length} modules · ${lessons.length} lessons`,
 `${tutorials.length} narrated video tutorials with captions`,
 '4 financial tools · position sizing, risk, P/L & volatility',
 '3 visual strategy labs · 3 replay scenarios',
 `${psychologyLessonCount} planning & psychology lessons · 5 mood check-in options`,
 `1 AI trading module · ${aiLessonCount} lessons on research, testing & verification`,
 'Unlimited quiz retries · 5 questions per quiz',
 '3 practice modes · standard, high-volatility & replay',
 '16 interactive chart-tour steps · 8 advanced Pro steps',
 '8 simulator performance metrics',
 `${achievements.length} achievement badges · 4 mascot growth levels`,
 '$10,000 starting virtual cash · unlimited resets',
 '$5,000 virtual recharge at $0',
 '4× market movement speed in High-Volatility Mode',
 '1 daily warm-up · 3 rotating scenarios',
 '2 journal challenges · 1 chart competition · 1 equity goal',
 '24/7 automated guidance · unlimited personal practice reviews',
 'Priority support queue · up to 3 requests per hour',
];
