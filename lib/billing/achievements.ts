import {achievements} from '@/lib/education';
export const starterAchievementCount=15;
export function canEarnAchievement(id:string,pro:boolean){const index=achievements.findIndex(a=>a.id===id);return index>=0&&(pro||index<starterAchievementCount);}
