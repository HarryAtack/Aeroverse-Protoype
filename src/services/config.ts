/**
 * Runtime configuration.
 *
 * Only PUBLIC values may be exposed to the app via EXPO_PUBLIC_* variables.
 * Secret keys (flight-data provider, vision/OCR provider, Stripe secret key)
 * must live in the backend (Supabase Edge Function secrets) and never ship
 * inside the mobile bundle.
 */
export const config = {
  supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL ?? '',
  supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '',
  /** Base URL of the AeroVerse backend (Supabase Edge Functions). */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? '',
  stripePublishableKey: process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '',
};

export type ServiceMode = 'demo' | 'live';

export const serviceModes = {
  auth: (config.supabaseUrl && config.supabaseAnonKey ? 'live' : 'demo') as ServiceMode,
  flights: (config.apiBaseUrl ? 'live' : 'demo') as ServiceMode,
  identification: (config.apiBaseUrl ? 'live' : 'demo') as ServiceMode,
  payments: (config.apiBaseUrl && config.stripePublishableKey ? 'live' : 'demo') as ServiceMode,
  push: 'demo' as ServiceMode,
};

export const isDemo = Object.values(serviceModes).some((m) => m === 'demo');
