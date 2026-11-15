import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Input, Notice } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { products } from '@/data/community';
import { useApp } from '@/store/useApp';
import { paymentService } from '@/services/payments';
import { money } from '@/utils/format';

export default function Checkout() {
  const cart = useApp((s) => s.cart);
  const profile = useApp((s) => s.profile);
  const [name, setName] = useState(profile?.displayName ?? '');
  const [address, setAddress] = useState('');
  const [postcode, setPostcode] = useState('');
  const [card, setCard] = useState('4242 4242 4242 4242');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();
  const [done, setDone] = useState<{ orderId: string; total: number }>();
  const items = cart.map((c) => ({ ...c, p: products.find((p) => p.id === c.productId)! })).filter((x) => x.p);
  const physical = items.some((i) => i.p.kind !== 'digital');
  const total = items.reduce((a, i) => a + i.qty * i.p.pricePence, 0) + (physical ? 399 : 0);

  const pay = async () => {
    setError(undefined);
    if (physical && (!name || !address || !postcode)) return setError('Please complete your delivery details.');
    setLoading(true);
    try {
      const r = await paymentService.checkout(items.map((i) => ({ productId: i.productId, name: i.p.name, qty: i.qty, unitPence: i.p.pricePence })), { number: card });
      useApp.getState().addOrder({ id: r.orderId, items: cart, totalPence: total, createdAt: new Date().toISOString(), simulated: r.simulated });
      useApp.getState().clearCart();
      setDone({ orderId: r.orderId, total });
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <Screen header={<Header title="Order confirmed" back={false} />}>
        <View style={{ alignItems: 'center', gap: space.lg, paddingTop: space.xxl }}>
          <Ionicons name="checkmark-circle" size={72} color={colors.success} />
          <T v="h1" center>Thank you!</T>
          <T muted center>Order {done.orderId} · {money(done.total)}</T>
          <Notice text="This was a simulated test order. No payment was taken and nothing will be shipped." />
          <Button title="Back to store" onPress={() => router.replace('/store')} />
          <Button title="Go home" variant="ghost" onPress={() => router.replace('/(tabs)')} />
        </View>
      </Screen>
    );
  }

  return (
    <Screen keyboard header={<Header title="Checkout" subtitle="Test mode" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Notice title="Simulated checkout" text={paymentService.mode === 'demo' ? 'No payment provider is connected. Use test card 4242 4242 4242 4242 — no real card details are accepted or stored.' : 'Payments are processed securely by Stripe.'} />
        {physical && (
          <Card style={{ gap: 12 }}>
            <T v="title">Delivery</T>
            <Input label="Full name" value={name} onChangeText={setName} />
            <Input label="Address" value={address} onChangeText={setAddress} placeholder="1 Runway Way, Manchester" />
            <Input label="Postcode" value={postcode} onChangeText={setPostcode} autoCapitalize="characters" placeholder="M90 1QX" />
          </Card>
        )}
        <Card style={{ gap: 12 }}>
          <T v="title">Payment</T>
          <Input label="Test card number" value={card} onChangeText={setCard} keyboardType="number-pad" icon="card-outline" />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Input label="Expiry" value="12/30" editable={false} style={{ flex: 1 }} />
            <Input label="CVC" value="123" editable={false} style={{ flex: 1 }} />
          </View>
        </Card>
        {error && <T v="small" color={colors.danger}>{error}</T>}
        <Button title={`Pay ${money(total)} (test)`} icon="lock-closed" loading={loading} onPress={pay} disabled={!items.length} />
        <T v="caption" dim center>In production, card entry happens inside Stripe’s secure payment sheet; AeroVerse never sees card numbers.</T>
      </View>
    </Screen>
  );
}
