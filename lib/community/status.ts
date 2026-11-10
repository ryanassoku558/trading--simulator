export async function communityStatus():Promise<{community:boolean;reviews:boolean;referrals:boolean}>{
 try{const response=await fetch("/api/community/status");if(!response.ok)return {community:false,reviews:false,referrals:false};const data=await response.json();return {community:data.community===true,reviews:data.reviews===true,referrals:data.referrals===true};}catch{return {community:false,reviews:false,referrals:false};}
}
