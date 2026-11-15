import { serviceModes } from '@/services/config';
import { DevAuthService } from './DevAuthService';
import type { AuthService } from './types';

export * from './types';
export { TEST_ACCOUNTS } from './DevAuthService';

function make(): AuthService {
  if (serviceModes.auth === 'live') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SupabaseAuthService } = require('./SupabaseAuthService');
    return new SupabaseAuthService();
  }
  return new DevAuthService();
}
export const authService = make();
