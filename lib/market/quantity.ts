import {isCryptoTicker} from "./crypto";
export function validAssetQuantity(ticker:unknown,value:unknown):value is number{
 if(typeof value!=='number'||!Number.isFinite(value)||value<=0||value>1000000)return false;
 return isCryptoTicker(ticker)?Number.isSafeInteger(Math.round(value*1e6))&&Math.abs(value*1e6-Math.round(value*1e6))<1e-7&&value>=.000001:Number.isSafeInteger(value);
}
export function normalizeQuantity(ticker:string,value:number){return isCryptoTicker(ticker)?Math.round(value*1e6)/1e6:value;}
