import type {Stock} from '@/types';
// Illustrative practice seeds, not live quotes or historical exchange data.
export const cryptoAssets:Stock[]=[['BTC','Bitcoin',100000,'#d58b20'],['ETH','Ethereum',3000,'#7482cf'],['SOL','Solana',150,'#8b6bd4'],['XRP','XRP',2,'#52758e'],['DOGE','Dogecoin',.2,'#b09b48']].map(([symbol,name,price,color])=>({ticker:`${symbol}-USD`,company:`${name} (${symbol})`,assetType:'Crypto',price:Number(price),change:0,cap:'Not applicable',volume:'Unavailable',color:String(color),description:`${name} is a digital asset, not a share of a company. This is virtual crypto practice with generated prices: no real coins, wallet, custody, deposits, or withdrawals. Crypto prices can be volatile.`}));
const cryptoSymbols=new Set(cryptoAssets.map(a=>a.ticker));
export function isCryptoTicker(ticker:unknown){return typeof ticker==='string'&&cryptoSymbols.has(ticker);}
