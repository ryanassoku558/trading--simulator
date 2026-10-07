import Stripe from 'stripe';
import { admin, stripe, reconcile, failure } from '@/lib/billing/server';
export async function POST(request:Request){
 let event:Stripe.Event;
 try{const signature=request.headers.get('stripe-signature');if(!signature||!process.env.STRIPE_WEBHOOK_SECRET)throw Error('Missing webhook signature.');event=stripe().webhooks.constructEvent(await request.text(),signature,process.env.STRIPE_WEBHOOK_SECRET);}catch{return failure(Error('Invalid webhook signature.'),400);}
 try{
  let subscriptionId:string|undefined;
  if(event.type==='checkout.session.completed'){const session=event.data.object as Stripe.Checkout.Session;subscriptionId=typeof session.subscription==='string'?session.subscription:session.subscription?.id;}
  else if(event.type.startsWith('customer.subscription.'))subscriptionId=(event.data.object as Stripe.Subscription).id;
  if(subscriptionId){const payment=stripe(),subscription=await payment.subscriptions.retrieve(subscriptionId);const customer=typeof subscription.customer==='string'?subscription.customer:subscription.customer.id;const {data,error}=await admin().from('sprout_subscriptions').select('user_id').eq('customer_id',customer).maybeSingle();if(error||!data)throw Error('Subscription owner is unavailable.');if(subscription.metadata.sprout_user_id!==data.user_id)throw Error('Subscription owner does not match.');await reconcile(subscriptionId,data.user_id);}
  return Response.json({received:true});
 }catch(error){return failure(error,500);}
}
