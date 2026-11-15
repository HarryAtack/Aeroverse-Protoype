import React, { useEffect, useRef } from 'react';
import { Animated, Modal, StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, space } from '@/theme/tokens';
import { useApp, totalXp } from '@/store/useApp';
import { levelFromXp } from '@/services/xp';
import { T } from './ui/Text';
import { Button, haptic, ProgressBar } from './ui/primitives';

/** XP reward modal shown after a sighting, challenge claim or set completion. */
export function CelebrateHost() {
  const c = useApp((s) => s.celebrate);
  const xp = useApp(totalXp);
  const set = useApp((s) => s.setCelebrate);
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (c) {
      haptic('success');
      a.setValue(0);
      Animated.spring(a, { toValue: 1, damping: 13, useNativeDriver: true }).start();
    }
  }, [c, a]);
  if (!c) return null;
  const lvl = levelFromXp(xp);
  return (
    <Modal transparent visible animationType="fade" onRequestClose={() => set(null)}>
      <View style={styles.back}>
        <Animated.View style={[styles.card, { opacity: a, transform: [{ scale: a.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
          <LinearGradient colors={['rgba(255,181,71,0.25)', 'rgba(255,181,71,0)']} style={StyleSheet.absoluteFill} />
          <View style={styles.burst}><Ionicons name="flash" size={34} color={colors.sim} /></View>
          <T v="overline" color={colors.sim} center>XP earned</T>
          <T v="hero" center>+{c.total} XP</T>
          <T v="title" center muted style={{ marginBottom: space.md }}>{c.title}</T>
          <View style={{ alignSelf: 'stretch', gap: 8, marginBottom: space.lg }}>
            {c.lines.map((l) => (
              <View key={l.label} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T v="small" muted>{l.label}</T>
                <T v="smallMedium" color={l.amount ? colors.text : colors.textDim}>{l.amount ? `+${l.amount}` : '—'}</T>
              </View>
            ))}
          </View>
          <View style={{ alignSelf: 'stretch', gap: 6, marginBottom: space.lg }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <T v="smallMedium">Level {lvl.level}</T>
              <T v="small" muted>{Math.round(lvl.current)} / {Math.round(lvl.needed)} XP</T>
            </View>
            <ProgressBar value={lvl.progress} color={colors.sim} />
          </View>
          <Button title="Nice!" onPress={() => set(null)} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  back: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  card: { width: '100%', maxWidth: 380, backgroundColor: colors.bgElevated, borderRadius: radius.xxl, padding: space.xxl, alignItems: 'center', overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,181,71,0.35)' },
  burst: { width: 72, height: 72, borderRadius: 36, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(255,181,71,0.15)', marginBottom: space.md, borderWidth: 1, borderColor: 'rgba(255,181,71,0.4)' },
});
