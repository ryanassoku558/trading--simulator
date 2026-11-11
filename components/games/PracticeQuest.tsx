"use client";
import QuizTopicPicker from './QuizTopicPicker';
import {useState} from 'react';
import Link from 'next/link';
import {gameQuestions} from '@/lib/games/content';
export default function PracticeQuest(){
 const [pack,setPack]=useState('0'),[started,setStarted]=useState(false),[index,setIndex]=useState(0),[answers,setAnswers]=useState<number[]>([]),[streak,setStreak]=useState(0),[stars,setStars]=useState(0);
 const questions=gameQuestions(pack),question=questions[index],done=index>=questions.length,answered=answers.length>index;
 function reset(){setIndex(0);setAnswers([]);setStreak(0);setStars(0);setStarted(true);}
 return <section className="card practice-quest" aria-label="Solo practice quest"><span className="eyebrow">SMALL WINS, ONE QUESTION AT A TIME</span><h2>Practice quest</h2><p>Five questions. No timer. Earn practice stars and build a correct-answer streak. You can always review the explanation.</p>
 {!started?<><QuizTopicPicker value={pack} onChange={setPack} label="Choose a topic"/><button className="primary" onClick={reset}>Start five-question quest</button></>:done?<><h3>Quest complete!</h3><p>{answers.filter((a,i)=>a===questions[i].answer).length}/5 correct · {stars} practice stars</p><div className="quest-review"><h4>Keep these ideas growing</h4>{questions.map((q,i)=>answers[i]!==q.answer?<details key={i}><summary>{q.question}</summary><p>{q.explanation}</p></details>:null)}</div><div className="presentation-actions"><button className="primary" onClick={reset}>Try this quest again</button><button className="secondary" onClick={()=>setStarted(false)}>Choose another topic</button><Link href="/learn?lesson=1" className="text-link">Back to guided lessons →</Link></div></>:<>
 <div className="quest-stats"><strong>Question {index+1} / 5</strong><span>✦ {stars} stars</span><span>{streak} in a row</span></div><progress value={index} max={5} aria-label="Quest questions completed"/><h3>{question.question}</h3>
 <div className="live-answer-grid">{question.options.map((o,i)=><button key={o} className={`live-answer answer-${i} ${answered&&i===question.answer?'correct-answer':''}`} disabled={answered} onClick={()=>{if(answered)return;setAnswers([...answers,i]);const nextStreak=i===question.answer?streak+1:0;setStreak(nextStreak);if(i===question.answer)setStars(stars+10+Math.min(nextStreak-1,3)*2);}}><span>{String.fromCharCode(65+i)}</span>{o}</button>)}</div>
 {answered&&<div className="live-reveal" role="status"><strong>{answers[index]===question.answer?'Correct! Keep growing.':'Let’s learn from this one.'}</strong><p>{question.explanation}</p><button className="primary" onClick={()=>setIndex(index+1)}>{index===4?'See quest results':'Next question'}</button></div>}
 </>}
 <p className="small">Practice stars are just for this round. They don’t change lesson completion, account balances, or learning XP.</p></section>;
}
