import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, rarityColors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, haptic, Tap } from '@/components/ui/primitives';
import { TradingCardView } from '@/components/aviation';
import { LogoMark } from '@/components/brand/Logo';
import { cards, packTypes } from '@/data/community';
import { useApp } from '@/store/useApp';
import { rarityLabel } from '@/services/rarity';
import { goBack } from '@/components/ui/Screen';

/** Premium pack opening: charge → burst → cards revealed one by one with a flip. */
export default function OpenPack() {
  const { pack = 'pk_standard' } = useLocalSearchParams<{ pack: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const def = packTypes.find((p) => p.id === pack) ?? packTypes[0];
  const [phase, setPhase] = useState<'sealed' | 'opening' | 'reveal' | 'done'>('sealed');
  const [drawn, setDrawn] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const shake = useRef(new Animated.Value(0)).current;
  const glow = useRef(new Animated.Value(0)).current;
  const flip = useRef(new Animated.Value(0)).current;
  const ownedBefore = useRef(new Set(useApp.getState().ownedCards.map((o) => o.cardId))).current;

  useEffect(() => {
    const l = Animated.loop(Animated.sequence([Animated.timing(glow, { toValue: 1, duration: 1200, useNativeDriver: true }), Animated.timing(glow, { toValue: 0.3, duration: 1200, useNativeDriver: true })]));
    l.start();
    return () => l.stop();
  }, [glow]);

  const open = () => {
    const ids = useApp.getState().openPack(def.id);
    if (!ids.length) { useApp.getState().showToast('No packs left', 'error'); return goBack('/cards'); }
    setDrawn(ids);
    setPhase('opening');
    haptic('medium');
    Animated.sequence([
      ...[1, -1, 1, -1, 1, 0].map((v, i) => Animated.timing(shake, { toValue: v * (1 + i * 0.4), duration: 70, useNativeDriver: true })),
    ]).start(() => { haptic('success'); setPhase('reveal'); revealNext(0); });
  };
  const revealNext = (i: number) => {
    setIdx(i);
    flip.setValue(0);
    Animated.timing(flip, { toValue: 1, duration: 650, easing: Easing.out(Easing.back(1.4)), useNativeDriver: true }).start();
  };
  const next = () => {
    if (idx < drawn.length - 1) { haptic(); revealNext(idx + 1); }
    else setPhase('done');
  };

  const card = drawn[idx] ? cards.find((c) => c.id === drawn[idx]) : undefined;
  const cw = Math.min(width * 0.62, 280);

  return (
    <View style={{ flex: 1, backgroundColor: '#03050A' }}>
      <LinearGradient colors={['#0B1A33', '#03050A']} style={StyleSheet.absoluteFill} />
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: space.lg, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <T v="overline" color={colors.cyan}>{def.name}</T>
        <Tap onPress={() => router.back()} accessibilityLabel="Close"><Ionicons name="close" size={26} color={colors.text} /></Tap>
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.lg }}>
        {(phase === 'sealed' || phase === 'opening') && (
          <Tap onPress={phase === 'sealed' ? open : undefined} accessibilityLabel="Open pack">
            <Animated.View style={{ transform: [{ translateX: shake.interpolate({ inputRange: [-3, 3], outputRange: [-14, 14] }) }, { rotate: shake.interpolate({ inputRange: [-3, 3], outputRange: ['-4deg', '4deg'] }) }] }}>
              <Animated.View style={[styles.glow, { opacity: glow, width: cw + 60, height: cw * 1.5 + 60 }]} />
              <LinearGradient colors={['#1F5FD6', '#0B1830', '#5CE1FF']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width: cw, height: cw * 1.5, borderRadius: 22, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.35)' }}>
                <LogoMark size={cw * 0.42} />
                <T v="h2" style={{ marginTop: 14, letterSpacing: 4 }}>SERIES 1</T>
                <T v="caption" muted>{def.cards} cards · {def.guarantee}</T>
              </LinearGradient>
            </Animated.View>
          </Tap>
        )}
        {phase === 'sealed' && <T v="title" muted style={{ marginTop: 28 }}>Tap the pack to open</T>}

        {phase === 'reveal' && card && (
          <Tap onPress={next} style={{ alignItems: 'center' }} accessibilityLabel="Next card">
            <Animated.View style={{ transform: [{ perspective: 1000 }, { rotateY: flip.interpolate({ inputRange: [0, 1], outputRange: ['180deg', '0deg'] }) }, { scale: flip.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] }) }] }}>
              <View style={[styles.cardGlow, { shadowColor: rarityColors[card.rarity] }]}>
                <TradingCardView card={card} width={cw} />
              </View>
            </Animated.View>
            <Animated.View style={{ alignItems: 'center', marginTop: 20, opacity: flip }}>
              <T v="overline" color={rarityColors[card.rarity]}>{rarityLabel[card.rarity]}{!ownedBefore.has(card.id) ? ' · NEW' : ' · duplicate'}</T>
              <T v="caption" muted style={{ marginTop: 6 }}>Card {idx + 1} of {drawn.length} · tap to continue</T>
            </Animated.View>
          </Tap>
        )}

        {phase === 'done' && (
          <View style={{ alignItems: 'center', gap: space.lg, width: '100%' }}>
            <T v="h2">Pack opened!</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
              {drawn.map((id, i) => { const c = cards.find((x) => x.id === id)!; return <TradingCardView key={i} card={c} width={Math.min(100, (width - 60) / 3)} />; })}
            </View>
            <T muted center>{drawn.filter((d) => !ownedBefore.has(d)).length} new · {drawn.filter((d) => ownedBefore.has(d)).length} duplicates</T>
            <View style={{ width: '100%', gap: 10, maxWidth: 420 }}>
              <Button title="View collection" onPress={() => router.replace('/cards')} />
              {(useApp.getState().packs[def.id] ?? 0) > 0 && <Button title="Open another" variant="secondary" onPress={() => { setPhase('sealed'); setDrawn([]); setIdx(0); }} />}
            </View>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  glow: { position: 'absolute', left: -30, top: -30, borderRadius: 40, backgroundColor: 'rgba(92,225,255,0.18)' },
  cardGlow: { shadowOpacity: 0.9, shadowRadius: 30, shadowOffset: { width: 0, height: 0 }, elevation: 20 },
});
