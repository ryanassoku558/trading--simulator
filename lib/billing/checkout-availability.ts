// Sandbox credentials must never open checkout to public visitors.
export function hasLiveStripeKey(key:string|undefined){return !!key?.trim().startsWith('sk_live_');}
