import { config, serviceModes } from '@/services/config';

export interface CheckoutItem { productId: string; name: string; qty: number; unitPence: number }
export interface CheckoutResult { orderId: string; simulated: boolean; totalPence: number }

/**
 * Payments. In demo mode NO payment is processed. In production the app asks
 * the backend `create-checkout` function to create a Stripe PaymentIntent /
 * Checkout Session (secret key server-side) and presents Stripe's own sheet.
 */
export interface PaymentService {
  readonly mode: 'demo' | 'live';
  checkout(items: CheckoutItem[], card?: { number: string }): Promise<CheckoutResult>;
  subscribePlus(plan: 'monthly' | 'annual'): Promise<{ simulated: boolean }>;
}

class TestPaymentService implements PaymentService {
  readonly mode = 'demo' as const;
  async checkout(items: CheckoutItem[], card?: { number: string }) {
    await new Promise((r) => setTimeout(r, 1400));
    const digits = (card?.number ?? '').replace(/\s/g, '');
    if (digits && digits !== '4242424242424242') throw new Error('Test mode: use card 4242 4242 4242 4242. No real cards are accepted.');
    const totalPence = items.reduce((s, i) => s + i.qty * i.unitPence, 0);
    return { orderId: `TEST-${Date.now().toString(36).toUpperCase()}`, simulated: true, totalPence };
  }
  async subscribePlus() {
    await new Promise((r) => setTimeout(r, 1200));
    return { simulated: true };
  }
}

class StripePaymentService implements PaymentService {
  readonly mode = 'live' as const;
  async checkout(items: CheckoutItem[]) {
    const res = await fetch(`${config.apiBaseUrl}/create-checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ items }) });
    if (!res.ok) throw new Error('Checkout unavailable');
    const data = await res.json();
    // Present Stripe PaymentSheet here with data.clientSecret (requires @stripe/stripe-react-native in a dev build).
    return { orderId: data.orderId, simulated: false, totalPence: data.totalPence };
  }
  async subscribePlus(plan: 'monthly' | 'annual') {
    const res = await fetch(`${config.apiBaseUrl}/create-checkout`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ subscription: plan }) });
    if (!res.ok) throw new Error('Subscription unavailable');
    return { simulated: false };
  }
}

export const paymentService: PaymentService = serviceModes.payments === 'live' ? new StripePaymentService() : new TestPaymentService();
