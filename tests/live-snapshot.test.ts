import {it,expect} from 'vitest';
import {acceptSnapshot} from '../lib/games/snapshot';
const base={code:'TEST22',phase:'question' as const,index:0,serverNow:'2026-11-12T12:00:01Z',answeredCount:1,self:{submitted:true}};
it('rejects delayed phase, round and answer regressions while accepting progress',()=>{expect(acceptSnapshot({...base,phase:'reveal'},{...base,serverNow:'2026-11-12T12:00:05Z'})).toBe(false);expect(acceptSnapshot({...base,index:1},base)).toBe(false);expect(acceptSnapshot(base,{...base,self:{submitted:false}})).toBe(false);expect(acceptSnapshot(base,{...base,answeredCount:0})).toBe(false);expect(acceptSnapshot(base,{...base,index:1,serverNow:'2026-11-12T12:00:00Z',self:{submitted:false}})).toBe(true);});
