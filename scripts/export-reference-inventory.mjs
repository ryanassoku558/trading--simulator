/** Export metadata only. Never publish the cached reference articles or provider data. */
import {readFileSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const cache=process.argv[2];if(!cache)throw new Error('Pass the local public-audit cache directory.');
const source=['public-inventory.json','additional-inventory.json'].flatMap(name=>JSON.parse(readFileSync(resolve(cache,name),'utf8')).pages);
const pages=source.map(({url,finalUrl,status,checkedAt,title,passwordForm,error})=>({url,finalUrl,status,checkedAt,title,access:passwordForm&&new URL(finalUrl).pathname.toLowerCase().includes('login')?'login-required':status===200?'public-response-not-full-workflow-verification':'unavailable',...(error?{error}: {})}));
writeFileSync('docs/stocktrak-public-inventory.json',JSON.stringify({reference:'https://www.stocktrak.com/',confirmedByUser:true,scope:'Sitemap URLs, homepage navigation and one additional layer of same-site public links; translated copies, archives and redirects are included. This is a discovered-page inventory, not proof of exhaustive URL coverage or verification of every interactive workflow.',requests:pages.length,successfulResponses:pages.filter(p=>p.status===200).length,uniqueSuccessfulDestinations:new Set(pages.filter(p=>p.status===200).map(p=>p.finalUrl)).size,pages},null,2)+'\n');
console.log(JSON.stringify({requests:pages.length,successful:pages.filter(p=>p.status===200).length,restricted:pages.filter(p=>p.access==='login-required').length}));
