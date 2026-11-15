// Supabase Edge Function (Deno): AI-assisted aircraft identification.
// Secrets (set with `supabase secrets set`): VISION_API_URL, VISION_API_KEY, OCR_API_URL, OCR_API_KEY.
// Keys never reach the mobile app. Thresholds mirror src/services/identification/thresholds.ts.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { cors, json } from '../_shared/cors.ts';

const T = { detection: 0.6, family: 0.8, variant: 0.85, ocr: 0.9 };

interface VisionOut { detection: number; family?: { id: string; confidence: number }; variants: { typeId: string; confidence: number }[] }
interface OcrOut { text?: string; confidence: number }

async function callVision(imageUrl: string): Promise<VisionOut> {
  const r = await fetch(Deno.env.get('VISION_API_URL')!, { method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('VISION_API_KEY')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: imageUrl }) });
  if (!r.ok) throw new Error('vision provider error');
  return r.json();
}
async function callOcr(imageUrl: string): Promise<OcrOut> {
  const r = await fetch(Deno.env.get('OCR_API_URL')!, { method: 'POST', headers: { Authorization: `Bearer ${Deno.env.get('OCR_API_KEY')}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ image_url: imageUrl, pattern: 'aircraft_registration' }) });
  if (!r.ok) return { confidence: 0 };
  return r.json();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  const auth = req.headers.get('Authorization');
  if (!auth) return json({ error: 'unauthorised' }, 401);
  const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const { data: { user } } = await admin.auth.getUser(auth.replace('Bearer ', ''));
  if (!user) return json({ error: 'unauthorised' }, 401);

  const { sightingId } = await req.json();
  const { data: s } = await admin.from('sightings').select('*, photos(storage_path)').eq('id', sightingId).eq('user_id', user.id).single();
  if (!s) return json({ error: 'not found' }, 404);
  const { data: signed } = await admin.storage.from('photos').createSignedUrl(s.photos.storage_path, 120);
  const url = signed!.signedUrl;

  const vision = await callVision(url);
  const top = vision.variants.sort((a, b) => b.confidence - a.confidence)[0];
  const ocr = vision.detection >= T.detection ? await callOcr(url) : { confidence: 0 };

  let registration = null as null | { text: string; ocrConfidence: number; databaseMatch: boolean; consistentWithType: boolean; accepted: boolean };
  if (ocr.text) {
    const { data: reg } = await admin.from('aircraft_registrations').select('type_id').eq('registration', ocr.text.toUpperCase()).maybeSingle();
    const consistent = !!reg && reg.type_id === top?.typeId;
    registration = { text: ocr.text.toUpperCase(), ocrConfidence: ocr.confidence, databaseMatch: !!reg, consistentWithType: consistent, accepted: ocr.confidence >= T.ocr && !!reg && consistent && (top?.confidence ?? 0) >= T.variant };
  }
  // Optional supporting evidence: licensed flight data near airport/time.
  // NOTE: evidence can raise reviewer confidence but NEVER alone verifies a registration.

  let stage = 'needs_review';
  if (vision.detection >= T.detection && (vision.family?.confidence ?? 0) >= T.family) {
    stage = 'type_identified';
    if ((top?.confidence ?? 0) >= T.variant) stage = registration?.accepted ? 'registration_identified' : 'variant_identified';
  }
  const result = { detection: { found: vision.detection >= T.detection, confidence: vision.detection }, variant: top, alternatives: vision.variants.slice(1, 3), registration, stage, simulated: false };
  await admin.from('sightings').update({ stage, ai_result: result, confidence: top?.confidence, type_id: top?.typeId, registration: registration?.accepted ? registration.text : null }).eq('id', sightingId);
  return json(result);
});
