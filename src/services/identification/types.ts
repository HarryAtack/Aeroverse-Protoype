import type { VerificationStage } from '@/types/domain';

export interface IdentificationInput {
  imageUri: string;
  /** When the user picks a bundled demo photo, its key lets the simulator use known ground truth. */
  sampleKey?: string;
  airportId: string;
  takenAt: string;
  /** Production: id of the sighting row whose photo was uploaded to Storage. */
  sightingId?: string;
}

export type PipelineStepId = 'upload' | 'detection' | 'family' | 'variant' | 'ocr' | 'database' | 'context';

export interface PipelineStep {
  id: PipelineStepId;
  label: string;
  status: 'pending' | 'running' | 'pass' | 'low' | 'fail' | 'skipped';
  confidence?: number;
  detail?: string;
}

export interface Candidate { typeId: string; confidence: number }

export interface IdentificationResult {
  id: string;
  simulated: boolean;
  detection: { found: boolean; confidence: number };
  family?: { manufacturerId: string; family: string; confidence: number };
  variant?: Candidate;
  alternatives: Candidate[];
  registration?: {
    text: string;
    ocrConfidence: number;
    databaseMatch: boolean;
    consistentWithType: boolean;
    /** True only when all registration checks passed the thresholds. */
    accepted: boolean;
  };
  context?: { flightMatch?: string; note: string; supportive: boolean };
  stage: VerificationStage;
  reasons: string[];
  steps: PipelineStep[];
}

export interface IdentificationService {
  readonly mode: 'demo' | 'live';
  identify(input: IdentificationInput, onStep: (steps: PipelineStep[]) => void): Promise<IdentificationResult>;
}
