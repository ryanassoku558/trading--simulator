export interface LiveQuestion {question:string;options:string[];answer:number;explanation:string}
export function validateQuestions(value:unknown):LiveQuestion[]{
 if(!Array.isArray(value)||value.length<1)throw Error('Add at least one question.');
 return value.map((item,i)=>{
  const q=item as Partial<LiveQuestion>|null;
  if(!q||typeof q.question!=='string'||!q.question.trim()||q.question.length>300)throw Error(`Question ${i+1} needs a question (up to 300 characters).`);
  if(!Array.isArray(q.options)||q.options.length<2||q.options.length>4||q.options.some(o=>typeof o!=='string'||!o.trim()||o.length>150))throw Error(`Question ${i+1} needs 2–4 answers (up to 150 characters each).`);
  const options=q.options.map(o=>o.trim());
  if(new Set(options.map(o=>o.toLowerCase())).size!==options.length)throw Error(`Question ${i+1} has duplicate answers.`);
  if(!Number.isInteger(q.answer)||q.answer!<0||q.answer!>=options.length)throw Error(`Choose the correct answer for question ${i+1}.`);
  if(q.explanation!==undefined&&(typeof q.explanation!=='string'||q.explanation.length>600))throw Error('Keep explanations under 600 characters.');
  return {question:q.question.trim(),options,answer:q.answer!,explanation:q.explanation?.trim()||'Review the highlighted correct answer.'};
 });
}
