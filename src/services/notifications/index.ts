/**
 * Push notification architecture.
 * Production: register an Expo push token (expo-notifications, dev build) and
 * store it in `push_tokens`. Server-side triggers (rare aircraft at home
 * airport, follows, comments, challenge progress) enqueue rows in
 * `notification_outbox`; a scheduled Edge Function fans out via the Expo Push
 * API, respecting each user's `notification_preferences`.
 * Demo: notifications are generated in-app only.
 */
export interface PushService {
  readonly mode: 'demo' | 'live';
  register(): Promise<{ token?: string; status: 'granted' | 'denied' | 'unavailable' }>;
}

export const pushService: PushService = {
  mode: 'demo',
  async register() {
    return { status: 'unavailable' };
  },
};
