import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Divider, EmptyState, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Photo } from '@/components/aviation';
import { products } from '@/data/community';
import { useApp } from '@/store/useApp';
import { money } from '@/utils/format';

const SHIPPING = 399;

export default function Cart() {
  const cart = useApp((s) => s.cart);
  const items = cart.map((c) => ({ ...c, p: products.find((p) => p.id === c.productId)! })).filter((x) => x.p);
  const subtotal = items.reduce((a, i) => a + i.qty * i.p.pricePence, 0);
  const physical = items.some((i) => i.p.kind !== 'digital');
  const total = subtotal + (physical ? SHIPPING : 0);
  const { setCartQty } = useApp.getState();
  return (
    <Screen header={<Header title="Your cart" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        {items.length === 0 ? (
          <EmptyState icon="bag-outline" title="Your cart is empty" body="Browse trading cards, prints and more." action="Go to store" onAction={() => router.replace('/store')} />
        ) : (
          <>
            {items.map((i) => (
              <Card key={i.productId} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <Photo id={i.p.photoIds[0]} style={{ width: 70, height: 56, borderRadius: 10 }} credit={false} />
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="title" numberOfLines={1}>{i.p.name}</T>
                  <T v="small" muted>{money(i.p.pricePence)} each</T>
                  <View style={{ flexDirection: 'row', gap: 16, marginTop: 4, alignItems: 'center' }}>
                    <Tap onPress={() => setCartQty(i.productId, i.qty - 1)} accessibilityLabel="Decrease"><T v="h3">−</T></Tap>
                    <T v="data">{i.qty}</T>
                    <Tap onPress={() => setCartQty(i.productId, i.qty + 1)} accessibilityLabel="Increase"><T v="h3">+</T></Tap>
                    <Tap onPress={() => setCartQty(i.productId, 0)}><T v="small" color={colors.danger}>Remove</T></Tap>
                  </View>
                </View>
                <T v="data">{money(i.qty * i.p.pricePence)}</T>
              </Card>
            ))}
            <Card style={{ gap: 8 }}>
              <Row k="Subtotal" v={money(subtotal)} />
              {physical && <Row k="Shipping (UK)" v={money(SHIPPING)} />}
              <Divider />
              <Row k="Total" v={money(total)} bold />
            </Card>
            <Button title="Checkout (test mode)" icon="lock-closed-outline" onPress={() => router.push('/store/checkout')} />
          </>
        )}
      </View>
    </Screen>
  );
}

function Row({ k, v, bold }: { k: string; v: string; bold?: boolean }) {
  return <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T v={bold ? 'title' : 'body'} muted={!bold}>{k}</T><T v={bold ? 'dataLarge' : 'data'}>{v}</T></View>;
}
