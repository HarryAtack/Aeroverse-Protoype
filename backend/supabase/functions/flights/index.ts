// Supabase Edge Function: proxies a LICENSED flight-data provider.
// Secrets: FLIGHT_API_URL, FLIGHT_API_KEY. Do not scrape Flightradar24 or other restricted sources.
import { cors, json } from '../_shared/cors.ts';

const MILITARY_PREFIXES = ['RRR', 'RCH', 'CFC', 'GAF', 'NATO'];  // extend with provider military flags

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const u = new URL(req.url);
  const bbox = ['n', 's', 'e', 'w'].map((k) => u.searchParams.get(k));
  const r = await fetch(`${Deno.env.get('FLIGHT_API_URL')}/positions?bounds=${bbox.join(',')}`, { headers: { Authorization: `Bearer ${Deno.env.get('FLIGHT_API_KEY')}` } });
  if (!r.ok) return json({ error: 'provider unavailable' }, 502);
  const raw = await r.json() as Array<Record<string, unknown>>;
  const flights = raw
    .filter((f) => !f.military && !MILITARY_PREFIXES.some((p) => String(f.callsign ?? '').startsWith(p)))
    .filter((f) => !f.privacy_blocked)
    .map((f) => ({ ...f, simulated: false }));
  return json(flights);
});
