import {it,expect} from 'vitest';
import {parseQuizDraft,emptyQuestion,quizUploadLimit} from '../lib/games/draft';
const draft={version:1,title:'My quiz',pack:'0',seconds:120,questions:[emptyQuestion()]};
it('restores incomplete work without requiring publish-ready answers',()=>{
 const restored=parseQuizDraft(JSON.stringify(draft));expect(restored.questions[0].question).toBe('');expect(restored.questions[0].options).toHaveLength(4);expect(restored.seconds).toBe(120);
});
it('rejects damaged, oversized, and unsupported saved browser data',()=>{
 for(const value of ['{',JSON.stringify({...draft,version:2}),JSON.stringify({...draft,questions:[]}),JSON.stringify({...draft,seconds:999}),JSON.stringify({...draft,pack:'unknown'}),JSON.stringify({...draft,questions:[{...emptyQuestion(),answer:9}]}),JSON.stringify({...draft,questions:[{...emptyQuestion(),options:[null,'Yes']}]}),' '.repeat(quizUploadLimit+1)])expect(()=>parseQuizDraft(value)).toThrow();
});
it('restores more than twenty questions and retains their answer keys and order',()=>{
 const questions=Array.from({length:40},(_,i)=>({question:`Question ${i}`,options:['No','Yes'],answer:i%2,explanation:'Review.'}));
 expect(parseQuizDraft(JSON.stringify({...draft,questions})).questions).toEqual(questions);
});
it('restores different photos on different question slides',()=>{
 const path='00000000-0000-4000-8000-000000000001/00000000-0000-4000-8000-000000000002.jpg';const questions=[{...emptyQuestion(),imagePath:path,imageAlt:'First photo'},{...emptyQuestion(),imagePath:path.replace('000000000002','000000000003'),imageAlt:'Second photo'}];expect(parseQuizDraft(JSON.stringify({...draft,questions})).questions).toEqual(questions);
});
