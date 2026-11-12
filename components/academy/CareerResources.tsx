import Link from 'next/link';
const paths=[
 ['Investment analysis','CFA Institute','https://www.cfainstitute.org/programs/cfa-program'],
 ['Financial planning','CFP Board','https://www.cfp.net/get-certified'],
 ['Accounting','AICPA & CIMA','https://www.aicpa-cima.com/resources/toolkit/cpa-exam'],
 ['Securities foundations','FINRA Securities Industry Essentials','https://www.finra.org/registration-exams-ce/qualification-exams/securities-industry-essentials-exam'],
 ['Securities licensing','FINRA qualification exams','https://www.finra.org/registration-exams-ce/qualification-exams'],
 ['State securities exams','NASAA exam information','https://www.nasaa.org/exams/'],
 ['Career exploration','US Bureau of Labor Statistics','https://www.bls.gov/ooh/business-and-financial/'],
 ['Skills and job research','CareerOneStop','https://www.careeronestop.org/']
];
export default function CareerResources(){return <section className="card research-workspace" aria-label="Career and certification resources"><span className="eyebrow">CONNECT LEARNING TO YOUR NEXT STEP</span><h2>Explore financial careers</h2><p>Use official organizations to check current education, experience, sponsorship, exam and renewal requirements. Sprout does not award these credentials, provide paid exam material or guarantee employment.</p><div className="research-table-wrap"><table><thead><tr><th>Interest</th><th>Official resource</th></tr></thead><tbody>{paths.map(([interest,name,url])=><tr key={url}><th scope="row">{interest}</th><td><a href={url} target="_blank" rel="noopener noreferrer">{name} ↗</a></td></tr>)}</tbody></table></div><p>These external resources may have eligibility rules, fees, regional restrictions or login requirements. Check the current official source before enrolling.</p><Link href="/learn?view=Modules&topic=Career%20development">Start the career and information-skills module →</Link></section>;}
