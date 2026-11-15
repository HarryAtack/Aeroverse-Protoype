import { createClient, SupabaseClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '@/services/config';
import type { AuthService, AuthUser } from './types';

/**
 * Production authentication via Supabase Auth (email + password with OTP
 * email verification). Row Level Security in the database restricts every
 * table to the authenticated user — see backend/supabase/migrations.
 */
export class SupabaseAuthService implements AuthService {
  readonly mode = 'live' as const;
  private sb: SupabaseClient;
  constructor() {
    this.sb = createClient(config.supabaseUrl, config.supabaseAnonKey, {
      auth: { storage: AsyncStorage, persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
    });
  }
  private map(u: { id: string; email?: string; email_confirmed_at?: string | null }): AuthUser {
    return { id: u.id, email: u.email ?? '', emailVerified: !!u.email_confirmed_at };
  }
  async signUp(email: string, password: string) {
    const { data, error } = await this.sb.auth.signUp({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? 'Sign up failed');
    return { user: this.map(data.user) };
  }
  async verifyEmail(email: string, code: string) {
    const { data, error } = await this.sb.auth.verifyOtp({ email, token: code, type: 'signup' });
    if (error || !data.user) throw new Error(error?.message ?? 'Verification failed');
    return this.map(data.user);
  }
  async resendVerification(email: string) {
    const { error } = await this.sb.auth.resend({ type: 'signup', email });
    if (error) throw new Error(error.message);
    return {};
  }
  async signIn(email: string, password: string) {
    const { data, error } = await this.sb.auth.signInWithPassword({ email, password });
    if (error || !data.user) throw new Error(error?.message ?? 'Sign in failed');
    return this.map(data.user);
  }
  async requestPasswordReset(email: string) {
    const { error } = await this.sb.auth.resetPasswordForEmail(email);
    if (error) throw new Error(error.message);
    return {};
  }
  async resetPassword(email: string, code: string, newPassword: string) {
    const { error } = await this.sb.auth.verifyOtp({ email, token: code, type: 'recovery' });
    if (error) throw new Error(error.message);
    const r = await this.sb.auth.updateUser({ password: newPassword });
    if (r.error) throw new Error(r.error.message);
  }
  async signOut() {
    await this.sb.auth.signOut();
  }
  async deleteAccount() {
    // Deletion is performed by the `delete-account` Edge Function using the service role.
    const { error } = await this.sb.functions.invoke('delete-account');
    if (error) throw new Error(error.message);
  }
}
