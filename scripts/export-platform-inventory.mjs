import {build} from 'esbuild';
import {writeFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
const {outputFiles}=await build({stdin:{contents:`
import {lessons} from './lib/education';
import {learningModules} from './lib/billing/curriculum';
import {starterLessonIds} from './lib/billing/access';
import {glossary} from './lib/education/discovery';
import tutorials from './lib/education/tutorials.json';
import onboarding from './lib/education/onboarding-tutorials.json';
export default {scope:'Current Sprout learning content. Definitions power Flashcards and Sprouty; there is no standalone glossary page.',modules:learningModules.map((m,i)=>({number:i+1,title:m.title,lessonIds:m.ids,starter:m.ids.every(id=>starterLessonIds.includes(id)),url:'/learn?view=Modules&q='+encodeURIComponent(m.title)})),lessons:lessons.map(l=>({id:l.id,title:l.title,level:l.level,url:'/learn?lesson='+l.id,hasExplanation:!!l.explanation.trim(),hasExample:!!l.example.trim(),hasLearningRationale:!!l.why.trim(),quizOptionCount:l.quiz.options.length})),glossary:glossary.map(([term,definition,example,lessonId])=>({term,definition,hasExample:!!example,lessonId})),tutorials,onboarding};
`,resolveDir:process.cwd(),loader:'ts'},bundle:true,platform:'node',format:'esm',write:false,tsconfig:'tsconfig.json',logLevel:'silent'});
const {default:inventory}=await import(`data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`);
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim();
await writeFile('docs/sprout-content-inventory.json',JSON.stringify({generatedAt:new Date().toISOString(),sourceCommit,includesWorkingTreeChanges:!!execFileSync('git',['status','--porcelain'],{encoding:'utf8'}).trim(),...inventory},null,2)+'\n');
console.log(JSON.stringify({modules:inventory.modules.length,lessons:inventory.lessons.length,glossaryTerms:inventory.glossary.length,tutorialEntries:inventory.tutorials.length,onboardingEntries:inventory.onboarding.length}));
