const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://kbphftwnggadpfbyctve.supabase.co";
const apikey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"sb_publishable_e5yQwNGx2QjM1nj0vBhnWA_rdLHikaP";
async function available(table:string){
 try {const response=await fetch(`${url}/rest/v1/${table}?select=*&limit=0`,{headers:{apikey},cache:"no-store",signal:AbortSignal.timeout(4000)});return response.ok;}catch{return false;}
}
async function referralsAvailable(){
 try{const response=await fetch(`${url}/rest/v1/rpc/sprout_referral_status`,{method:"POST",headers:{apikey,"Content-Type":"application/json"},body:"{}",cache:"no-store",signal:AbortSignal.timeout(4000)});const data=await response.json();return data.code==="42501";}catch{return false;}
}
export async function GET(){
 const [tables,referrals]=await Promise.all([Promise.all(["community_posts","community_replies","community_votes","community_scores","community_portfolios","learner_reviews"].map(available)),referralsAvailable()]);
 return Response.json({community:tables.slice(0,5).every(Boolean),reviews:tables[5],referrals},{headers:{"Cache-Control":"no-store"}});
}
