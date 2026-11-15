import { serviceModes } from '@/services/config';
import { BackendIdentificationService } from './BackendIdentificationService';
import { SimulatedIdentificationService } from './SimulatedIdentificationService';
import type { IdentificationService } from './types';

export * from './types';
export * from './thresholds';

export const identificationService: IdentificationService =
  serviceModes.identification === 'live' ? new BackendIdentificationService() : new SimulatedIdentificationService();
