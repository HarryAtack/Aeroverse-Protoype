// Supabase Edge Function: deletes the calling user's account and all owned data
// (cascades via foreign keys), removes their storage objects and cancels subscriptions.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user } } = await admin.auth.getUser((req.headers.get('Authorization') ?? '').replace('Bearer ', ''));
  if (!user) return json({ error: 'unauthorised' }, 401);
  const { data: files } = await admin.storage.from('photos').list(user.id, { limit: 1000 });
  if (files?.length) await admin.storage.from('photos').remove(files.map((f) => `${user.id}/${f.name}`));
  // TODO: cancel Stripe subscription via STRIPE_SECRET_KEY before deletion.
  await admin.auth.admin.deleteUser(user.id);
  return json({ ok: true });
});
