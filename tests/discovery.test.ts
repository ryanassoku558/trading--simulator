import {it,expect} from 'vitest';
import {glossary,mistakes,dailyWarmupIndex} from '@/lib/education/discovery';
import {lessons} from '@/lib/education';
it('glossary and mistakes link to valid lessons and offer actionable practice',()=>{for(const g of glossary)expect(lessons.some(l=>l.id===g[3])).toBe(true);for(const m of mistakes){expect(m.options[m.answer]).toBeTruthy();expect(lessons.some(l=>l.id===m.lesson)).toBe(true);}});
it('daily rotation changes at midnight in New York, not UTC',()=>{expect(dailyWarmupIndex(new Date('2026-10-06T03:59:00Z'))).not.toBe(dailyWarmupIndex(new Date('2026-10-06T04:00:00Z')));expect(dailyWarmupIndex(new Date('2026-10-06T04:00:00Z'))).toBe(dailyWarmupIndex(new Date('2026-10-06T23:59:00Z')));});
