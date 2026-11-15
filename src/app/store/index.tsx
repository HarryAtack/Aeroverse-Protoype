import React, { useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { colors, radius, space } from '@/theme/tokens';
import type { ProductKind } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Card, Chip, IconButton, Notice, Pill, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Photo } from '@/components/aviation';
import { products } from '@/data/community';
import { useApp } from '@/store/useApp';
import { paymentService } from '@/services/payments';
import { money } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';

const KINDS: { key: ProductKind | 'all'; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'physical_cards', label: 'Trading cards' }, { key: 'print', label: 'Prints' }, { key: 'digital', label: 'Digital' }, { key: 'creator', label: 'Accessories' },
];

export default function Store() {
  const { width } = useWindowDimensions();
  const cart = useApp((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const [kind, setKind] = useState<ProductKind | 'all'>('all');
  const w = (Math.min(width, 640) - space.lg * 2 - 12) / 2;
  const list = products.filter((p) => kind === 'all' || p.kind === kind);
  return (
    <Screen header={<Header title="AeroVerse Store" subtitle="Marketplace" right={<IconButton icon="bag-outline" accessibilityLabel={`Cart, ${cart} items`} badge={cart} onPress={() => router.push('/store/cart')} />} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        {paymentService.mode === 'demo' && <Notice title="Test mode" text="This is a demonstration store. Checkout is simulated — no real payments are taken and nothing will ship." />}
        <Tap onPress={() => router.push('/plus')}>
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(255,181,71,0.45)', backgroundColor: 'rgba(255,181,71,0.06)' }}>
            <Ionicons name="diamond" size={24} color={colors.sim} />
            <View style={{ flex: 1 }}><T v="title" color={colors.sim}>AeroVerse Plus membership</T><T v="small" muted>From £4.99/month · test pricing</T></View>
            <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
          </Card>
        </Tap>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{KINDS.map((k) => <Chip key={k.key} small label={k.label} active={kind === k.key} onPress={() => setKind(k.key)} />)}</View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
          {list.map((p) => (
            <Tap key={p.id} onPress={() => router.push(`/store/${p.id}`)} style={[styles.product, { width: w }]}>
              <Photo id={p.photoIds[0]} style={{ height: w * 0.8 }} credit={false}>
                {p.badge && <View style={{ position: 'absolute', top: 8, left: 8 }}><Pill label={p.badge} color={colors.cyan} solid /></View>}
              </Photo>
              <View style={{ padding: 10, gap: 2 }}>
                <T v="title" numberOfLines={2}>{p.name}</T>
                <T v="caption" muted numberOfLines={1}>{p.subtitle}</T>
                <T v="data" style={{ marginTop: 4 }}>{money(p.pricePence)}</T>
              </View>
            </Tap>
          ))}
        </View>
        <Card style={{ gap: 6 }}>
          <T v="title">Creator products</T>
          <T v="small" muted>Prints and physical cards featuring community photos are only sold when the photographer has explicitly licensed the image. Photographers are credited and paid a royalty on every sale.</T>
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  product: { borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
