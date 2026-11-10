import {lessons,levels} from '@/lib/education';
import {starterModules,starterLessonIds} from './access';
// Every lesson belongs to one displayed module; Starter is always first.
export const learningModules=[...starterModules,...levels.map((title,i)=>({title,ids:lessons.filter(l=>l.level===i+1&&!starterLessonIds.includes(l.id)).map(l=>l.id)})).filter(m=>m.ids.length)];
