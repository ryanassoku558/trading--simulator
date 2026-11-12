/** Public SEC EDGAR data. No account data or market prices enter this pipeline. */
export interface ReportedMetric {key:string;label:string;value:number;unit:string;end:string;start?:string;filed:string;form:string;accession:string;concept:string;description:string}
export interface ResearchCompany {symbol:string;cik:string;name:string;industry:string;exchanges:string[];fiscalYearEnd:string;retrievedAt:string;metrics:ReportedMetric[];revenueHistory:ReportedMetric[];filings:{form:string;filed:string;reportDate:string;title:string;url:string}[];source:string;factsAvailable:boolean}
type FactRow={val:number;end:string;start?:string;filed:string;form:string;accn:string};
type Facts={facts?:Record<string,Record<string,{units?:Record<string,FactRow[]>}>>};
const definitions=[
 ['revenue','Revenue',['RevenueFromContractWithCustomerExcludingAssessedTax','Revenues','SalesRevenueNet','RevenueFromContractWithCustomerIncludingAssessedTax'],'USD','Sales reported for a full fiscal year; not trailing twelve-month sales.'],
 ['netIncome','Net income',['NetIncomeLoss','ProfitLoss'],'USD','Annual profit or loss after expenses; accounting earnings differ from cash flow.'],
 ['operatingIncome','Operating income',['OperatingIncomeLoss'],'USD','Annual income from operations before non-operating items.'],
 ['operatingCash','Operating cash flow',['NetCashProvidedByUsedInOperatingActivities'],'USD','Annual cash generated or used by operating activities.'],
 ['eps','Diluted earnings per share',['EarningsPerShareDiluted'],'USD/shares','Annual diluted EPS as reported. Restatements and share splits can affect comparisons.'],
 ['assets','Total assets',['Assets'],'USD','A balance-sheet snapshot at the displayed date.'],
 ['liabilities','Total liabilities',['Liabilities'],'USD','Reported obligations at the displayed balance-sheet date.'],
 ['equity','Stockholders’ equity',['StockholdersEquity','StockholdersEquityIncludingPortionAttributableToNoncontrollingInterest'],'USD','Reported book equity, not market capitalization.'],
 ['cash','Cash and equivalents',['CashAndCashEquivalentsAtCarryingValue'],'USD','Cash and equivalents at the reporting date; excludes other investments unless included by the issuer.']
] as const;
export function extractMetrics(data:Facts){
 const metrics:ReportedMetric[]=[];let revenueHistory:ReportedMetric[]=[];
 for(const [key,label,tags,unit,description] of definitions){
  const annual=!['assets','liabilities','equity','cash'].includes(key);
  const candidates:ReportedMetric[]=[];
  for(const concept of tags)for(const row of data.facts?.['us-gaap']?.[concept]?.units?.[unit]??[]){
   if(!Number.isFinite(row.val)||!/^\d{4}-\d{2}-\d{2}$/.test(row.end)||!/^\d{4}-\d{2}-\d{2}$/.test(row.filed)||!['10-K','10-K/A',...(!annual?['10-Q','10-Q/A']:[])].includes(row.form))continue;
   const days=row.start?(Date.parse(row.end)-Date.parse(row.start))/86400000:0;
   if(annual&&(days<330||days>400))continue;
   candidates.push({key,label,value:row.val,unit,end:row.end,start:row.start,filed:row.filed,form:row.form,accession:row.accn,concept,description});
  }
  candidates.sort((a,b)=>b.end.localeCompare(a.end)||b.filed.localeCompare(a.filed));
  if(candidates[0])metrics.push(candidates[0]);
  if(key==='revenue')revenueHistory=candidates.filter((r,i,a)=>a.findIndex(x=>x.end===r.end)===i).slice(0,5).reverse();
 }
 return {metrics,revenueHistory};
}
const userAgent=process.env.SEC_USER_AGENT||'Sprout Trading Educational Research sprouttradinghelp@gmail.com';
let nextRequest=0;
async function secJson(url:string,seconds:number){
 // A conservative per-instance queue; Next's shared fetch cache reduces repeated upstream requests.
 const wait=Math.max(0,nextRequest-Date.now());nextRequest=Math.max(Date.now(),nextRequest)+250;
 if(wait>5000)throw new Error('Research is busy. Please retry shortly.');
 if(wait)await new Promise(resolve=>setTimeout(resolve,wait));
 const response=await fetch(url,{headers:{'User-Agent':userAgent,Accept:'application/json'},...(url.includes('/companyfacts/')?{cache:'no-store' as const}:{next:{revalidate:seconds}}),signal:AbortSignal.timeout(20000)});
 if(!response.ok)throw new Error('SEC data is temporarily unavailable. Open the SEC source or retry later.');
 return response.json();
}
export async function getCompanyResearch(symbol:string):Promise<ResearchCompany|null>{
 const tickers:Record<string,{ticker:string;cik_str:number;title:string}>=await secJson('https://www.sec.gov/files/company_tickers.json',86400);
 const normalized=symbol.replaceAll('.','-');
 const match=Object.values(tickers).find(row=>row.ticker.replaceAll('.','-')===normalized);
 if(!match)return null;
 const cik=String(match.cik_str).padStart(10,'0');
 const submissions=await secJson(`https://data.sec.gov/submissions/CIK${cik}.json`,3600);
 let facts:Facts={};let factsAvailable=true;
 try{facts=await secJson(`https://data.sec.gov/api/xbrl/companyfacts/CIK${cik}.json`,3600);}catch{factsAvailable=false;}
 const recent=submissions.filings?.recent??{};
 const filings:ResearchCompany['filings']=[];
 for(let i=0;i<(recent.form?.length??0)&&filings.length<30;i++){
  const document=recent.primaryDocument?.[i],accession=recent.accessionNumber?.[i];
  if(typeof document!=='string'||!/^[\w.\-]+$/.test(document)||typeof accession!=='string'||!/^\d{10}-\d{2}-\d{6}$/.test(accession))continue;
  filings.push({form:recent.form[i],filed:recent.filingDate[i],reportDate:recent.reportDate?.[i]||'',title:recent.primaryDocDescription?.[i]||recent.form[i],url:`https://www.sec.gov/Archives/edgar/data/${match.cik_str}/${accession.replaceAll('-','')}/${document}`});
 }
 return {symbol:match.ticker,cik,name:submissions.name||match.title,industry:submissions.sicDescription||'Not reported',exchanges:submissions.exchanges??[],fiscalYearEnd:submissions.fiscalYearEnd||'',retrievedAt:new Date().toISOString(),...extractMetrics(facts),filings,source:`https://www.sec.gov/edgar/browse/?CIK=${cik}&owner=exclude`,factsAvailable};
}
