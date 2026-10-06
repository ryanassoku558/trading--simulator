const url=process.env.NEXT_PUBLIC_SUPABASE_URL||"https://kbphftwnggadpfbyctve.supabase.co";
const apikey=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY||"sb_publishable_e5yQwNGx2QjM1nj0vBhnWA_rdLHikaP";
async function available(table:string){
 try {const response=await fetch(`${url}/rest/v1/${table}?select=*&limit=0`,{headers:{apikey},cache:"no-store",signal:AbortSignal.timeout(4000)});return response.ok;}catch{return false;}
}
export async function GET(){
 const tables=await Promise.all(["community_posts","community_replies","community_votes","community_scores","community_portfolios","learner_reviews"].map(available));
 return Response.json({community:tables.slice(0,5).every(Boolean),reviews:tables[5]},{headers:{"Cache-Control":"no-store"}});
}
