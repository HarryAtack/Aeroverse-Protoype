// Supabase Edge Function: creates Stripe PaymentIntents / subscriptions.
// Secrets: STRIPE_SECRET_KEY, STRIPE_PRICE_PLUS_MONTHLY, STRIPE_PRICE_PLUS_ANNUAL. Prices are read from the
// database, never trusted from the client. Stripe webhooks (separate function) fulfil orders.
import Stripe from 'npm:stripe@17';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user } } = await admin.auth.getUser((req.headers.get('Authorization') ?? '').replace('Bearer ', ''));
  if (!user) return json({ error: 'unauthorised' }, 401);
  const body = await req.json();
  if (body.subscription) {
    const price = Deno.env.get(body.subscription === 'annual' ? 'STRIPE_PRICE_PLUS_ANNUAL' : 'STRIPE_PRICE_PLUS_MONTHLY');
    const session = await stripe.checkout.sessions.create({ mode: 'subscription', line_items: [{ price, quantity: 1 }], client_reference_id: user.id, success_url: 'aeroverse://plus?ok=1', cancel_url: 'aeroverse://plus' });
    return json({ url: session.url });
  }
  const ids = (body.items as { productId: string; qty: number }[]).map((i) => i.productId);
  const { data: products } = await admin.from('marketplace_products').select('id, price_pence, kind').in('id', ids).eq('active', true);
  const total = (body.items as { productId: string; qty: number }[]).reduce((sum, i) => sum + (products?.find((p) => p.id === i.productId)?.price_pence ?? 0) * Math.min(10, i.qty), 0) + 399;
  const intent = await stripe.paymentIntents.create({ amount: total, currency: 'gbp', metadata: { user_id: user.id } });
  const { data: order } = await admin.from('orders').insert({ user_id: user.id, stripe_payment_intent: intent.id, total_pence: total, items: body.items }).select('id').single();
  return json({ clientSecret: intent.client_secret, orderId: order?.id, totalPence: total });
});
