import 'server-only';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';
import { isProSubscription } from './access';
export function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw Error('Subscriptions are being prepared. Please try again once billing is connected.');
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
export function stripe() {
  if (!process.env.STRIPE_SECRET_KEY) throw Error('Payments are not available yet.');
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}
export async function identify(request: Request) {
  const token = request.headers.get('authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) throw Error('Sign in to manage your subscription.');
  const db = admin();
  const { data, error } = await db.auth.getUser(token);
  if (error || !data.user) throw Error('Your session expired. Please sign in again.');
  return { db, user: data.user };
}
export async function entitlement(request: Request) {
  const { db, user } = await identify(request);
  const { data, error } = await db.from('sprout_subscriptions').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw Error('Subscription setup is not complete yet.');
  return { db, user, subscription: data, pro: !!data && isProSubscription(data.status, data.expires_at) };
}
export function billingReady() { return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_PRICE_ID && process.env.STRIPE_WEBHOOK_SECRET && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_APP_URL); }
export function failure(error: unknown, status = 400) { return Response.json({ error: error instanceof Error ? error.message : 'Unable to complete this request.' }, { status, headers: { 'Cache-Control': 'no-store' } }); }
export async function reconcile(subscriptionId: string, userId: string) {
  const subscription = await stripe().subscriptions.retrieve(subscriptionId);
  const price = subscription.items.data[0]?.price;
  const validPrice = price?.id === process.env.STRIPE_PRICE_ID && price.unit_amount === 1000 && price.currency === 'usd' && price.recurring?.interval === 'month' && price.recurring.interval_count === 1 && subscription.items.data.length === 1;
  const expires = Math.min(...subscription.items.data.map(item => item.current_period_end));
  const { error } = await admin().from('sprout_subscriptions').upsert({ user_id: userId, provider: 'stripe', customer_id: typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id, subscription_id: subscription.id, status: validPrice && subscription.status === 'active' ? 'active' : 'inactive', expires_at: new Date(expires * 1000).toISOString(), cancel_at_period_end: subscription.cancel_at_period_end });
  if (error) throw Error('Subscription could not be updated.');
}
