export interface AuthUser {
  id: string;
  email: string;
  emailVerified: boolean;
}

export interface AuthService {
  readonly mode: 'demo' | 'live';
  signUp(email: string, password: string): Promise<{ user: AuthUser; devCode?: string }>;
  verifyEmail(email: string, code: string): Promise<AuthUser>;
  resendVerification(email: string): Promise<{ devCode?: string }>;
  signIn(email: string, password: string): Promise<AuthUser>;
  requestPasswordReset(email: string): Promise<{ devCode?: string }>;
  resetPassword(email: string, code: string, newPassword: string): Promise<void>;
  signOut(): Promise<void>;
  deleteAccount(userId: string): Promise<void>;
}

export const PASSWORD_RULES = 'At least 8 characters, including a number.';
export function validatePassword(p: string) {
  return p.length >= 8 && /\d/.test(p);
}
export function validateEmail(e: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());
}
