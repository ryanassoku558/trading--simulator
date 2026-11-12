import {chromium} from '@playwright/test';
import {X509Certificate,createHash} from 'node:crypto';
import {readFileSync,writeFileSync} from 'node:fs';
const certificate=process.env.NODE_EXTRA_CA_CERTS;
const ca=certificate?new X509Certificate(readFileSync(certificate)):null;
const pin=ca?createHash('sha256').update(ca.publicKey.export({type:'spki',format:'der'})).digest('base64'):null;
const browser=await chromium.launch({executablePath:'/usr/bin/chromium',headless:true,proxy:process.env.HTTPS_PROXY?{server:process.env.HTTPS_PROXY}:undefined,args:['--no-sandbox',...(pin?['--ignore-certificate-errors-spki-list='+pin]:[])]});
const page=await browser.newPage();const results=[];
for(const url of ['https://www.stocktrak.com/stock-market-simulations/','https://app.stocktrak.com/quotes/quotes?type=keyratios','https://app.stocktrak.com/quotes/quotes?type=earnings','https://www.stocktrak.com/tutorial-videos/']){
 const failures=[];page.on('requestfailed',r=>{if(failures.length<10)failures.push(new URL(r.url()).hostname);});
 try{await page.goto(url,{waitUntil:'domcontentloaded',timeout:60000});await page.waitForTimeout(5000);results.push({url,finalUrl:page.url(),title:await page.title(),headings:await page.locator('h1,h2').allTextContents(),frames:page.frames().map(f=>{try{return new URL(f.url()).origin;}catch{return 'blank';}}),passwordFields:await page.locator('input[type=password]').count(),mainText:(await page.locator('body').innerText()).slice(-2200),failedHosts:failures});}catch(e){results.push({url,error:String(e)});}
}
writeFileSync(process.argv[2]||'/tmp/stocktrak-browser-verification.json',JSON.stringify({checkedAt:new Date().toISOString(),results},null,2));
console.log(JSON.stringify(results.map(({mainText,...rest})=>rest),null,2));await browser.close();
