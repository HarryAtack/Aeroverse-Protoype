import { aircraftTypes, registrationByReg, typeById } from '@/data/catalog';
import { decideStage, THRESHOLDS } from './thresholds';
import type { Candidate, IdentificationInput, IdentificationResult, IdentificationService, PipelineStep } from './types';

/**
 * SIMULATED identification. It does NOT analyse image pixels.
 * - For bundled demo photos it replays a scripted scenario based on known ground truth.
 * - For your own photos it produces a deliberately low-confidence suggestion
 *   that always requires confirmation and human review.
 */
interface Scenario {
  det: number;
  family?: number;
  variant: Candidate;
  alts: Candidate[];
  reg?: { text: string; ocr: number };
  context?: { flightMatch?: string; note: string; supportive: boolean };
}

const SCENARIOS: Record<string, Scenario> = {
  a380: { det: 0.99, family: 0.98, variant: { typeId: 'a380-800', confidence: 0.97 }, alts: [], reg: { text: 'A6-EED', ocr: 0.95 }, context: { flightMatch: 'EK17 · DXB→MAN (sample schedule)', note: 'Operator and type match the sample schedule for this airport and time.', supportive: true } },
  b738jet2: { det: 0.99, family: 0.95, variant: { typeId: 'b737-800', confidence: 0.9 }, alts: [{ typeId: 'b737-8', confidence: 0.07 }], reg: { text: 'G-DRTA', ocr: 0.96 }, context: { note: 'Registered operator is based at this airport.', supportive: true } },
  b748lh: { det: 0.98, family: 0.96, variant: { typeId: 'b747-8i', confidence: 0.89 }, alts: [{ typeId: 'b747-400', confidence: 0.08 }], reg: { text: 'D-ABYF', ocr: 0.91 }, context: { note: 'No schedule data for this time — evidence neutral.', supportive: false } },
  a350ba: { det: 0.97, family: 0.93, variant: { typeId: 'a350-1000', confidence: 0.71 }, alts: [{ typeId: 'a350-900', confidence: 0.26 }], reg: { text: 'G-XWBD', ocr: 0.62 }, context: { note: 'Several A350s of this operator are scheduled — cannot narrow to one airframe.', supportive: false } },
  atr72: { det: 0.98, family: 0.92, variant: { typeId: 'atr72-600', confidence: 0.88 }, alts: [], context: { note: 'Type is consistent with regional schedules here.', supportive: true } },
  special: { det: 0.98, family: 0.9, variant: { typeId: 'b757-200', confidence: 0.86 }, alts: [], reg: { text: 'TF-FIU', ocr: 0.93 }, context: { note: 'Special livery recognised; matches registration database entry.', supportive: true } },
  an124: { det: 0.96, family: 0.66, variant: { typeId: 'an124', confidence: 0.6 }, alts: [{ typeId: 'b747-8f', confidence: 0.21 }], context: { note: 'Unusual visitor — no supporting schedule data.', supportive: false } },
};

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

function hash(s: string) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return Math.abs(h);
}

export class SimulatedIdentificationService implements IdentificationService {
  readonly mode = 'demo' as const;

  async identify(input: IdentificationInput, onStep: (s: PipelineStep[]) => void): Promise<IdentificationResult> {
    const known = input.sampleKey ? SCENARIOS[input.sampleKey] : undefined;
    let sc: Scenario;
    if (known) sc = known;
    else {
      const civil = aircraftTypes.filter((t) => t.category === 'airliner');
      const h = hash(input.imageUri);
      const guess = civil[h % civil.length];
      const alt = civil[(h >> 3) % civil.length];
      sc = { det: 0.82, family: 0.5 + ((h >> 5) % 25) / 100, variant: { typeId: guess.id, confidence: 0.4 + ((h >> 7) % 20) / 100 }, alts: alt.id !== guess.id ? [{ typeId: alt.id, confidence: 0.18 }] : [], context: { note: 'Simulated service cannot analyse your own photo — please confirm the aircraft manually.', supportive: false } };
    }

    const steps: PipelineStep[] = [
      { id: 'upload', label: 'Secure upload', status: 'pending' },
      { id: 'detection', label: 'Aircraft detection', status: 'pending' },
      { id: 'family', label: 'Manufacturer & family', status: 'pending' },
      { id: 'variant', label: 'Variant classification', status: 'pending' },
      { id: 'ocr', label: 'Registration OCR', status: 'pending' },
      { id: 'database', label: 'Database cross-check', status: 'pending' },
      { id: 'context', label: 'Flight & location evidence', status: 'pending' },
    ];
    const set = (i: number, patch: Partial<PipelineStep>) => {
      steps[i] = { ...steps[i], ...patch };
      onStep([...steps]);
    };
    const run = async (i: number, ms: number, patch: Partial<PipelineStep>) => {
      set(i, { status: 'running' });
      await wait(ms);
      set(i, patch);
    };

    const t = typeById[sc.variant.typeId];
    await run(0, 500, { status: 'pass', detail: 'Encrypted upload · EXIF location stripped' });
    await run(1, 700, { status: sc.det >= THRESHOLDS.detection ? 'pass' : 'fail', confidence: sc.det, detail: '1 aircraft found' });
    const famOk = (sc.family ?? 0) >= THRESHOLDS.family;
    await run(2, 800, { status: famOk ? 'pass' : 'low', confidence: sc.family, detail: t ? `${t.manufacturerId === 'boeing' ? 'Boeing' : t.manufacturerId === 'airbus' ? 'Airbus' : t.family} · ${t.family} family` : '—' });
    const varOk = sc.variant.confidence >= THRESHOLDS.variant;
    await run(3, 800, famOk ? { status: varOk ? 'pass' : 'low', confidence: sc.variant.confidence, detail: t?.variant } : { status: 'skipped', detail: 'Family not confident' });

    let registration: IdentificationResult['registration'];
    if (sc.reg) {
      const db = registrationByReg[sc.reg.text];
      const consistent = !!db && db.typeId === sc.variant.typeId;
      const ocrOk = sc.reg.ocr >= THRESHOLDS.ocr;
      registration = { text: sc.reg.text, ocrConfidence: sc.reg.ocr, databaseMatch: !!db, consistentWithType: consistent, accepted: ocrOk && !!db && consistent && varOk };
      await run(4, 900, { status: ocrOk ? 'pass' : 'low', confidence: sc.reg.ocr, detail: ocrOk ? `Read “${sc.reg.text}”` : 'Text partially legible — not accepted' });
      await run(5, 600, ocrOk ? { status: db && consistent ? 'pass' : 'fail', detail: db ? (consistent ? 'Registration exists and type matches' : 'Type mismatch') : 'Not found in database' } : { status: 'skipped', detail: 'No confident registration to check' });
    } else {
      await run(4, 800, { status: 'fail', detail: known ? 'No registration visible' : 'Not available in simulation' });
      await run(5, 400, { status: 'skipped', detail: 'Nothing to cross-check' });
    }
    await run(6, 600, { status: sc.context?.supportive ? 'pass' : 'skipped', detail: sc.context?.note });

    const base = {
      id: `id_${Date.now()}`,
      simulated: true,
      detection: { found: sc.det >= THRESHOLDS.detection, confidence: sc.det },
      family: t && sc.family !== undefined ? { manufacturerId: t.manufacturerId, family: t.family, confidence: sc.family } : undefined,
      variant: sc.variant,
      alternatives: sc.alts,
      registration,
      context: sc.context,
    };
    const { stage, reasons } = decideStage(base);
    if (!known) reasons.unshift('Demo mode: this is a simulated suggestion, not a real analysis of your photo.');
    return { ...base, stage, reasons, steps };
  }
}
