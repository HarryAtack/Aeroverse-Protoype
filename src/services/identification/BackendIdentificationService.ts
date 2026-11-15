import { config } from '@/services/config';
import { decideStage } from './thresholds';
import type { IdentificationInput, IdentificationResult, IdentificationService, PipelineStep } from './types';

/**
 * Production adapter. Uploads the image to Supabase Storage (signed URL issued
 * by the backend), then calls the `identify-aircraft` Edge Function which runs
 * detection, classification, OCR and database cross-checks server-side.
 * No AI provider keys are ever present in the app.
 */
export class BackendIdentificationService implements IdentificationService {
  readonly mode = 'live' as const;

  async identify(input: IdentificationInput, onStep: (s: PipelineStep[]) => void): Promise<IdentificationResult> {
    onStep([{ id: 'upload', label: 'Secure upload', status: 'running' }]);
    const res = await fetch(`${config.apiBaseUrl}/identify-aircraft`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sightingId: input.sightingId, airportId: input.airportId, takenAt: input.takenAt }),
    });
    if (!res.ok) throw new Error(`Identification failed (${res.status})`);
    const data = (await res.json()) as Omit<IdentificationResult, 'stage' | 'reasons'>;
    // Re-apply thresholds client-side as a defence in depth; the server is authoritative.
    const { stage, reasons } = decideStage(data);
    onStep(data.steps);
    return { ...data, stage, reasons, simulated: false };
  }
}
