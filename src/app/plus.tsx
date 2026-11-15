import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { colors, gradients, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Notice, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { useApp } from '@/store/useApp';
import { paymentService } from '@/services/payments';
import { date } from '@/utils/format';

const BENEFITS = [
  ['stats-chart', 'Advanced collection statistics', 'Trends, heatmaps and per-airport breakdowns.'],
  ['notifications', 'Enhanced alerts', 'Multiple airports, custom rarity thresholds, instant rare-livery pings.'],
  ['business', 'Advanced airport statistics', 'Movement mixes, busiest hours and type frequencies.'],
  ['color-palette', 'Custom profile themes', 'Exclusive profile and hangar themes.'],
  ['folder-open', 'Extra collection organisation', 'Custom folders, tags and notes.'],
  ['flag', 'Exclusive challenges', 'Members-only monthly challenges and events.'],
  ['ribbon', 'Premium badges', 'Plus badge and founder-member flair.'],
];

export default function Plus() {
  const plus = useApp((s) => s.plus);
  const [plan, setPlan] = useState<'monthly' | 'annual'>('annual');
  const [loading, setLoading] = useState(false);
  const subscribe = async () => {
    setLoading(true);
    await paymentService.subscribePlus(plan);
    useApp.getState().setPlus({ active: true, plan, since: new Date().toISOString() });
    useApp.getState().addXp(100, 'Welcome to AeroVerse Plus');
    setLoading(false);
    useApp.getState().showToast('AeroVerse Plus activated (test subscription)');
  };
  return (
    <Screen header={<Header title="AeroVerse Plus" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ borderRadius: radius.xxl, overflow: 'hidden' }}>
          <LinearGradient colors={['#3A2408', '#120C04']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space.xxl, gap: 10, borderWidth: 1, borderColor: 'rgba(255,181,71,0.45)', borderRadius: radius.xxl }}>
            <Ionicons name="diamond" size={36} color={colors.sim} />
            <T v="hero">Plus</T>
            <T muted>Everything in AeroVerse, supercharged for serious spotters and photographers.</T>
          </LinearGradient>
        </View>
        {plus.active ? (
          <Card style={{ gap: 10, borderColor: 'rgba(255,181,71,0.45)' }}>
            <T v="title" color={colors.sim}>You’re a Plus member ✦</T>
            <T v="small" muted>{plus.plan === 'annual' ? 'Annual' : 'Monthly'} plan since {plus.since ? date(plus.since) : 'today'} · test subscription</T>
            <Button title="Cancel test subscription" variant="danger" onPress={() => { useApp.getState().setPlus({ active: false }); useApp.getState().showToast('Plus cancelled', 'info'); }} />
          </Card>
        ) : (
          <>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {(['monthly', 'annual'] as const).map((p) => (
                <Tap key={p} onPress={() => setPlan(p)} style={[styles.plan, plan === p && { borderColor: colors.sim, backgroundColor: 'rgba(255,181,71,0.08)' }]} accessibilityState={{ selected: plan === p }}>
                  {p === 'annual' && <View style={styles.save}><T v="caption" color="#2A1A05">SAVE 33%</T></View>}
                  <T v="title">{p === 'monthly' ? 'Monthly' : 'Annual'}</T>
                  <T v="h2">{p === 'monthly' ? '£4.99' : '£39.99'}</T>
                  <T v="caption" muted>{p === 'monthly' ? 'per month' : 'per year · £3.33/mo'}</T>
                </Tap>
              ))}
            </View>
            <Button title="Start 7-day free trial (test)" variant="plus" icon="diamond" loading={loading} onPress={subscribe} />
            <Notice text="Test pricing only. No payment is taken in this prototype. Cancel any time." />
          </>
        )}
        <View style={{ gap: 12 }}>
          {BENEFITS.map(([icon, title, sub]) => (
            <View key={title} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <View style={styles.bIcon}><Ionicons name={icon as never} size={18} color={colors.sim} /></View>
              <View style={{ flex: 1 }}><T v="title">{title}</T><T v="small" muted>{sub}</T></View>
            </View>
          ))}
        </View>
        <T v="caption" dim center>Plus never affects verification, leaderboards or pack odds. Free users get the full core experience.</T>
        <Button title="Back to store" variant="ghost" onPress={() => router.push('/store')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  plan: { flex: 1, padding: space.lg, borderRadius: radius.xl, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface, gap: 4 },
  save: { position: 'absolute', top: -10, right: 10, backgroundColor: colors.sim, borderRadius: 999, paddingHorizontal: 8, paddingVertical: 2 },
  bIcon: { width: 38, height: 38, borderRadius: 12, backgroundColor: 'rgba(255,181,71,0.1)', alignItems: 'center', justifyContent: 'center' },
});
void gradients;
