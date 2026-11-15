import type { VerificationStage } from '@/types/domain';
import type { IdentificationResult } from './types';

/**
 * Confidence thresholds. The same values are enforced server-side in
 * backend/supabase/functions/identify-aircraft. A registration is only ever
 * "identified" when OCR confidence is high AND it matches the registration
 * database AND the database type agrees with the visual identification.
 * "Community verified" can only be reached through human review.
 */
export const THRESHOLDS = {
  detection: 0.6,
  family: 0.8,
  variant: 0.85,
  ocr: 0.9,
  communityVotesRequired: 3,
};

export function decideStage(r: Omit<IdentificationResult, 'stage' | 'reasons' | 'steps'>): { stage: VerificationStage; reasons: string[] } {
  const reasons: string[] = [];
  if (!r.detection.found || r.detection.confidence < THRESHOLDS.detection) {
    reasons.push('No aircraft detected with sufficient confidence.');
    return { stage: 'needs_review', reasons };
  }
  if (!r.family || r.family.confidence < THRESHOLDS.family) {
    reasons.push('Aircraft detected, but the family could not be identified confidently.');
    return { stage: 'needs_review', reasons };
  }
  let stage: VerificationStage = 'type_identified';
  if (r.variant && r.variant.confidence >= THRESHOLDS.variant) stage = 'variant_identified';
  else reasons.push('Variant uncertain — similar variants look alike from this angle.');

  if (r.registration) {
    if (r.registration.accepted) {
      if (stage === 'variant_identified') stage = 'registration_identified';
      else reasons.push('Registration read, but held back because the variant is not confirmed.');
    } else if (r.registration.ocrConfidence < THRESHOLDS.ocr) {
      reasons.push('Registration text is not clear enough to confirm. It has not been verified.');
    } else if (!r.registration.databaseMatch) {
      reasons.push('Registration text does not match any aircraft in the database.');
    } else if (!r.registration.consistentWithType) {
      reasons.push('Database type for this registration conflicts with the visual identification.');
    }
  } else {
    reasons.push('No registration visible in the photograph.');
  }
  return { stage, reasons };
}
