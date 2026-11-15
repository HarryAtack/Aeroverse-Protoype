import React, { useState } from 'react';
import { ScrollView, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, EmptyState, IconButton, Pill, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar, Photo } from '@/components/aviation';
import { products } from '@/data/community';
import { userById } from '@/data/users';
import { useApp } from '@/store/useApp';
import { money } from '@/utils/format';

export default function Product() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const p = products.find((x) => x.id === id);
  const cart = useApp((s) => s.cart.reduce((a, c) => a + c.qty, 0));
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  if (!p) return <Screen header={<Header title="Product" />}><EmptyState title="Product not found" /></Screen>;
  const photographer = p.photographerId ? userById[p.photographerId] : undefined;
  const w = Math.min(width, 640) - space.lg * 2;
  return (
    <Screen header={<Header title={p.name} right={<IconButton icon="bag-outline" accessibilityLabel="Cart" badge={cart} onPress={() => router.push('/store/cart')} />} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setImg(Math.round(e.nativeEvent.contentOffset.x / w))} style={{ borderRadius: 20 }}>
          {p.photoIds.map((ph) => <Photo key={ph} id={ph} style={{ width: w, height: w * 0.75 }} />)}
        </ScrollView>
        {p.photoIds.length > 1 && <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>{p.photoIds.map((_, i) => <View key={i} style={{ width: i === img ? 18 : 6, height: 6, borderRadius: 3, backgroundColor: i === img ? colors.cyan : colors.borderStrong }} />)}</View>}
        <View style={{ gap: 6 }}>
          <View style={{ flexDirection: 'row', gap: 6 }}>{p.badge && <Pill label={p.badge} color={colors.cyan} />}{p.limited && <Pill label={`Limited to ${p.limited.toLocaleString()}`} color={colors.sim} />}</View>
          <T v="h1">{p.name}</T>
          <T muted>{p.subtitle}</T>
          <T v="dataLarge" style={{ marginTop: 4 }}>{money(p.pricePence)}</T>
        </View>
        <T>{p.description}</T>
        {p.contents && (
          <Card style={{ gap: 6 }}>
            <T v="title">What’s included</T>
            {p.contents.map((c) => <T key={c} v="small" muted>• {c}</T>)}
            {p.kind === 'physical_cards' && <T v="caption" color={colors.cyan} style={{ marginTop: 4 }}>Fixed, fully disclosed contents — no randomised packs.</T>}
          </Card>
        )}
        {photographer && (
          <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => router.push(`/user/${photographer.id}`)}>
            <Avatar userId={photographer.id} size={40} />
            <View style={{ flex: 1 }}><T v="title">@{photographer.username}</T><T v="small" muted>Featured photographer · demo creator product</T></View>
          </Card>
        )}
        <T v="small" muted>{p.stock && p.stock < 100 ? `Only ${p.stock} left` : 'In stock'} · Ships in 3–5 working days (simulated)</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.surface, borderRadius: 14, paddingHorizontal: 10, height: 52, borderWidth: 1, borderColor: colors.border }}>
            <Tap onPress={() => setQty(Math.max(1, qty - 1))} accessibilityLabel="Decrease quantity"><T v="h3">−</T></Tap>
            <T v="data">{qty}</T>
            <Tap onPress={() => setQty(Math.min(10, qty + 1))} accessibilityLabel="Increase quantity"><T v="h3">+</T></Tap>
          </View>
          <Button title="Add to cart" icon="bag-add-outline" style={{ flex: 1 }} onPress={() => { useApp.getState().addToCart(p.id, qty); useApp.getState().showToast(`Added ${qty} × ${p.name}`); }} />
        </View>
      </View>
    </Screen>
  );
}
