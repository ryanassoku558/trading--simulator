// Public browser configuration; never use a secret or service-role key here.
export const url='https://kbphftwnggadpfbyctve.supabase.co';
export const publicKey='sb_publishable_e5yQwNGx2QjM1nj0vBhnWA_rdLHikaP';
let session=null;
async function request(path,{method='GET',body,authenticated=false}={}){
 if(authenticated){if(!session)throw Error('Sign in to save your account.');if(session.expires_at<Date.now()+60000)await refresh();}
 const headers={apikey:publicKey,'Content-Type':'application/json'};
 if(authenticated)headers.Authorization=`Bearer ${session.access_token}`;
 if(path.startsWith('/rest/'))headers.Prefer='resolution=merge-duplicates,return=minimal';
 const response=await fetch(url+path,{method,headers,body:body===undefined?undefined:JSON.stringify(body)});
 const text=await response.text();let data;try{data=text?JSON.parse(text):null;}catch{throw Error('Unexpected response from Supabase.');}
 if(!response.ok)throw Error(data?.msg||data?.message||data?.error_description||'Supabase request failed.');return data;
}
function remember(data){session={...data,expires_at:Date.now()+data.expires_in*1000};}
async function refresh(){const data=await request('/auth/v1/token?grant_type=refresh_token',{method:'POST',body:{refresh_token:session.refresh_token}});remember(data);}
export async function signIn(email,password){remember(await request('/auth/v1/token?grant_type=password',{method:'POST',body:{email,password}}));return session.user;}
export async function signUp(email,password){const data=await request('/auth/v1/signup',{method:'POST',body:{email,password}});if(data.access_token){remember(data);return data.user;}return null;}
export async function signOut(){try{if(session)await request('/auth/v1/logout',{method:'POST',authenticated:true});}finally{session=null;}}
export async function loadAccount(){const rows=await request(`/rest/v1/paper_accounts?user_id=eq.${encodeURIComponent(session.user.id)}&select=account`,{authenticated:true});return rows[0]?.account||null;}
export async function saveAccount(account){await request('/rest/v1/paper_accounts?on_conflict=user_id',{method:'POST',authenticated:true,body:{user_id:session.user.id,account,updated_at:new Date().toISOString()}});}
