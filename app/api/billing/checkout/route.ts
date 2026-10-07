import { billingReady, entitlement, stripe, failure } from '@/lib/billing/server';
export async function POST(request:Request) {
 try {
  if(!billingReady()) return failure(Error('Payments are not available yet. Your Starter access remains free.'),503);
  const {db,user,subscription,pro}=await entitlement(request);
  if(pro) return failure(Error('You already have Sprout Pro. Use Manage subscription.'),409);
  const app=new URL(process.env.NEXT_PUBLIC_APP_URL!).origin;
  if(request.headers.get("origin")!==app)return failure(Error("Open checkout from the Sprout website."),403);
  const payment=stripe(),price=await payment.prices.retrieve(process.env.STRIPE_PRICE_ID!);
  if(!price.active||price.unit_amount!==1000||price.currency!=='usd'||price.recurring?.interval!=='month'||price.recurring.interval_count!==1) throw Error('The monthly price needs to be configured correctly.');
  if(subscription?.subscription_id){const current=await payment.subscriptions.retrieve(subscription.subscription_id);if(!["canceled","incomplete_expired"].includes(current.status))return failure(Error("A subscription already exists. Use Manage billing to update it."),409);}
  if(subscription?.checkout_session_id){const existing=await payment.checkout.sessions.retrieve(subscription.checkout_session_id);if(existing.status==="open"&&existing.url)return Response.json({url:existing.url});}
  let customer=subscription?.customer_id;
  if(!customer){ const created=await payment.customers.create({email:user.email,metadata:{sprout_user_id:user.id}},{idempotencyKey:`sprout-customer-${user.id}`});customer=created.id;const {error}=await db.from('sprout_subscriptions').upsert({user_id:user.id,customer_id:customer,status:'inactive',provider:'stripe'});if(error)throw Error('Unable to prepare your subscription.'); }
  const session=await payment.checkout.sessions.create({customer,mode:'subscription',line_items:[{price:price.id,quantity:1}],client_reference_id:user.id,subscription_data:{metadata:{sprout_user_id:user.id}},success_url:`${app}/pricing?checkout=success`,cancel_url:`${app}/pricing?checkout=cancelled`},{idempotencyKey:`sprout-checkout-${user.id}-${Math.floor(Date.now()/3600000)}`});
  const {error:saveError}=await db.from("sprout_subscriptions").update({checkout_session_id:session.id}).eq("user_id",user.id);if(saveError)throw Error("Unable to save checkout. Please try again.");
  return Response.json({url:session.url});
 }catch(error){return failure(error);}
}
