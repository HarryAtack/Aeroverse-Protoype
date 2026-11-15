import React, { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import type { Achievement } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Card, Chip, ProgressBar, Tap } from '@/components/ui/primitives';
import { Header, Screen, Sheet } from '@/components/ui/Screen';
import { achievements } from '@/data/community';
import { useApp, totalXp } from '@/store/useApp';
import { levelFromXp, XP_RULES } from '@/services/xp';
import { date, timeAgo } from '@/utils/format';

const tier = { bronze: '#CD8A4A', silver: '#C9D3E3', gold: '#FFB547', platinum: '#5CE1FF' } as const;

export default function Achievements() {
  const { width } = useWindowDimensions();
  const xp = useApp(totalXp);
  const ledger = useApp((s) => s.xpLedger);
  const [sel, setSel] = useState<Achievement | null>(null);
  const [filter, setFilter] = useState<'all' | 'military'>('all');
  const lvl = levelFromXp(xp);
  const w = (Math.min(width, 640) - space.lg * 2 - 20) / 3;
  const list = achievements.filter((a) => filter === 'all' || a.military);
  return (
    <Screen header={<Header title="Achievements & XP" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Card style={{ gap: 10 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <T v="h2">Level {lvl.level}</T>
            <T v="dataLarge" color={colors.sim}>{xp.toLocaleString()} XP</T>
          </View>
          <ProgressBar value={lvl.progress} />
          <T v="caption" muted>{Math.round(lvl.needed - lvl.current).toLocaleString()} XP to level {lvl.level + 1}</T>
        </Card>
        <View style={{ flexDirection: 'row', gap: 6 }}>
          <Chip label="All badges" active={filter === 'all'} onPress={() => setFilter('all')} />
          <Chip label="Military & historic" icon="shield-outline" active={filter === 'military'} onPress={() => setFilter('military')} />
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {list.map((a) => (
            <Tap key={a.id} onPress={() => setSel(a)} style={{ width: w, alignItems: 'center', gap: 6, padding: 10, borderRadius: 16, backgroundColor: colors.surface, borderWidth: 1, borderColor: a.unlockedAt ? tier[a.tier] + '66' : colors.border, opacity: a.unlockedAt ? 1 : 0.6 }}>
              <View style={{ width: 54, height: 54, borderRadius: 27, borderWidth: 2, borderColor: tier[a.tier], alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name={(a.unlockedAt ? a.icon : 'lock-closed') as never} size={22} color={tier[a.tier]} />
              </View>
              <T v="smallMedium" center numberOfLines={1}>{a.name}</T>
              {!a.unlockedAt && a.target ? <View style={{ alignSelf: 'stretch' }}><ProgressBar value={(a.progress ?? 0) / a.target} height={4} /></View> : <T v="caption" muted>{a.tier}</T>}
            </Tap>
          ))}
        </View>
        <Card style={{ gap: 8 }}>
          <T v="title">How XP works</T>
          {[
            ['New manufacturer', XP_RULES.newManufacturer], ['New aircraft family', XP_RULES.newFamily], ['First sighting of a variant', XP_RULES.firstVariant], ['First visit to an airport', XP_RULES.firstAirportVisit],
            ['New airline', XP_RULES.newAirline], ['Verified photo', XP_RULES.verifiedPhoto], ['Legendary local rarity bonus', XP_RULES.rarityBonus.legendary], ['Improved photo of a repeat', XP_RULES.improvedPhoto], ['Repeat sighting (max 3/day)', XP_RULES.repeatSighting],
          ].map(([k, v]) => <View key={String(k)} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T v="small" muted>{k}</T><T v="smallMedium">+{v}</T></View>)}
          <T v="caption" dim>XP for sightings that need human review is held until they are verified.</T>
        </Card>
        <View style={{ gap: 8 }}>
          <T v="h3">XP history</T>
          {[...ledger].reverse().slice(0, 20).map((x) => (
            <View key={x.id} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 }}>
              <View style={{ flex: 1 }}><T v="small">{x.reason}</T><T v="caption" dim>{timeAgo(x.createdAt)}</T></View>
              <T v="smallMedium" color={colors.sim}>+{x.amount}</T>
            </View>
          ))}
        </View>
      </View>
      <Sheet visible={!!sel} onClose={() => setSel(null)} title={sel?.name}>
        {sel && (
          <View style={{ alignItems: 'center', gap: 10 }}>
            <View style={{ width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: tier[sel.tier], alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={sel.icon as never} size={38} color={tier[sel.tier]} />
            </View>
            <T v="overline" color={tier[sel.tier]}>{sel.tier} badge</T>
            <T center>{sel.description}</T>
            {sel.unlockedAt ? <T v="small" color={colors.success}>Unlocked {date(sel.unlockedAt)}</T> : sel.target ? <T v="small" muted>Progress {sel.progress ?? 0}/{sel.target}</T> : null}
          </View>
        )}
      </Sheet>
    </Screen>
  );
}
