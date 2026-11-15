import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import type { ChallengePeriod } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, Notice, Pill, ProgressBar } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { challenges } from '@/data/community';
import { airportById } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { compact, timeAgo } from '@/utils/format';

const PERIODS: { key: ChallengePeriod; label: string }[] = [
  { key: 'daily', label: 'Daily' }, { key: 'weekly', label: 'Weekly' }, { key: 'monthly', label: 'Monthly' }, { key: 'airport', label: 'Airport' }, { key: 'global', label: 'Global' },
];

export default function Challenges() {
  const [period, setPeriod] = useState<ChallengePeriod>('daily');
  const progress = useApp((s) => s.challengeProgress);
  const claimed = useApp((s) => s.claimedChallenges);
  const list = challenges.filter((c) => c.period === period);
  return (
    <Screen header={<Header title="Challenges" right={<Button title="Leaderboards" icon="podium-outline" small full={false} variant="secondary" onPress={() => router.push('/leaderboard')} />} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {PERIODS.map((p) => <Chip key={p.key} label={p.label} active={period === p.key} onPress={() => setPeriod(p.key)} />)}
        </ScrollView>
        <Notice icon="ribbon-outline" color={colors.cyan} text="Challenges reward verified, original sightings — not upload volume. Duplicate or low-quality uploads don’t count." />
        {list.map((c) => {
          const p = Math.min(c.target, progress[c.id] ?? c.progress);
          const complete = p >= c.target;
          const isClaimed = claimed.includes(c.id);
          return (
            <Card key={c.id} style={{ gap: 10, borderColor: complete ? colors.success + '66' : colors.border }}>
              <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                <View style={{ width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', backgroundColor: complete ? 'rgba(52,211,153,0.12)' : 'rgba(92,225,255,0.1)' }}>
                  <Ionicons name={(complete ? 'checkmark-done' : c.icon) as never} size={20} color={complete ? colors.success : colors.cyan} />
                </View>
                <View style={{ flex: 1 }}>
                  <T v="title">{c.title}</T>
                  <T v="small" muted>{c.description}</T>
                </View>
              </View>
              <ProgressBar value={p / c.target} color={complete ? colors.success : colors.primary} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T v="caption" muted>{p}/{c.target} · {compact(c.participants)} taking part · ends {timeAgo(c.endsAt)}</T>
                {c.airportId && <Pill label={airportById[c.airportId]?.iata ?? ''} color={colors.cyan} />}
              </View>
              {complete ? (
                <Button title={isClaimed ? 'Reward claimed ✓' : `Claim +${c.rewardXp} XP & reward pack`} variant={isClaimed ? 'secondary' : 'primary'} small disabled={isClaimed} onPress={() => {
                  useApp.getState().claimChallenge(c.id, c.rewardXp);
                  useApp.getState().setCelebrate({ title: `Challenge complete: ${c.title}`, lines: [{ label: 'Challenge reward', amount: c.rewardXp }, { label: 'Challenge Reward Pack', amount: 0 }], total: c.rewardXp });
                }} />
              ) : (
                <T v="caption" color={colors.sim}>Reward: +{c.rewardXp} XP + Challenge Reward Pack</T>
              )}
            </Card>
          );
        })}
      </View>
    </Screen>
  );
}
