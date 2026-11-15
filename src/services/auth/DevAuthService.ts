import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AuthService, AuthUser } from './types';

/**
 * DEVELOPMENT authentication. Accounts live on this device only. Verification
 * and reset codes are shown in the UI instead of being emailed. Passwords are
 * salted + hashed, but this is NOT production-grade — use Supabase Auth
 * (SupabaseAuthService) for real accounts.
 */
const KEY = 'aeroverse.devAuth.v1';

interface DevAccount { id: string; email: string; hash: string; verified: boolean; code?: string }

export const TEST_ACCOUNTS = [
  { email: 'demo@aeroverse.app', password: 'Spotter2026', note: 'Pre-built collection, Manchester home airport' },
  { email: 'fresh@aeroverse.app', password: 'Spotter2026', note: 'Verified, but empty hangar — try onboarding from scratch' },
];

function hash(s: string) {
  let h1 = 0xdeadbeef ^ s.length, h2 = 0x41c6ce57 ^ s.length;
  for (let i = 0; i < s.length; i++) {
    const ch = s.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  return ((h2 >>> 0).toString(16) + (h1 >>> 0).toString(16)).padStart(16, '0');
}
const salted = (email: string, pw: string) => hash(`av::${email.toLowerCase()}::${pw}`);
const code6 = () => String(Math.floor(100000 + Math.random() * 900000));
const delay = (ms = 450) => new Promise((r) => setTimeout(r, ms));

async function load(): Promise<DevAccount[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const seeded = TEST_ACCOUNTS.map((a, i) => ({ id: i === 0 ? 'me_demo' : 'me_fresh', email: a.email, hash: salted(a.email, a.password), verified: true }));
  await save(seeded);
  return seeded;
}
async function save(a: DevAccount[]) {
  try { await AsyncStorage.setItem(KEY, JSON.stringify(a)); } catch {}
}
const toUser = (a: DevAccount): AuthUser => ({ id: a.id, email: a.email, emailVerified: a.verified });

export class DevAuthService implements AuthService {
  readonly mode = 'demo' as const;

  async signUp(email: string, password: string) {
    await delay();
    const all = await load();
    const e = email.trim().toLowerCase();
    if (all.some((a) => a.email === e)) throw new Error('An account with this email already exists.');
    const acc: DevAccount = { id: `me_${Date.now().toString(36)}`, email: e, hash: salted(e, password), verified: false, code: code6() };
    await save([...all, acc]);
    return { user: toUser(acc), devCode: acc.code };
  }
  async verifyEmail(email: string, code: string) {
    await delay();
    const all = await load();
    const acc = all.find((a) => a.email === email.trim().toLowerCase());
    if (!acc) throw new Error('Account not found.');
    if (acc.code !== code.trim()) throw new Error('That code is incorrect.');
    acc.verified = true; acc.code = undefined;
    await save(all);
    return toUser(acc);
  }
  async resendVerification(email: string) {
    const all = await load();
    const acc = all.find((a) => a.email === email.trim().toLowerCase());
    if (!acc) throw new Error('Account not found.');
    acc.code = code6();
    await save(all);
    return { devCode: acc.code };
  }
  async signIn(email: string, password: string) {
    await delay();
    const all = await load();
    const e = email.trim().toLowerCase();
    const acc = all.find((a) => a.email === e);
    if (!acc || acc.hash !== salted(e, password)) throw new Error('Email or password is incorrect.');
    return toUser(acc);
  }
  async requestPasswordReset(email: string) {
    await delay();
    const all = await load();
    const acc = all.find((a) => a.email === email.trim().toLowerCase());
    // Don't reveal whether the account exists.
    if (!acc) return {};
    acc.code = code6();
    await save(all);
    return { devCode: acc.code };
  }
  async resetPassword(email: string, code: string, newPassword: string) {
    await delay();
    const all = await load();
    const e = email.trim().toLowerCase();
    const acc = all.find((a) => a.email === e);
    if (!acc || acc.code !== code.trim()) throw new Error('That reset code is invalid or expired.');
    acc.hash = salted(e, newPassword); acc.code = undefined;
    await save(all);
  }
  async signOut() {}
  async deleteAccount(userId: string) {
    const all = await load();
    await save(all.filter((a) => a.id !== userId || a.id === 'me_demo' || a.id === 'me_fresh'));
  }
}
