import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Card, Chip, Notice, ProgressBar, Segmented, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/aviation';
import { demoUsers } from '@/data/users';
import { airports, airportById } from '@/data/catalog';
import { useApp, totalXp } from '@/store/useApp';

type Scope = 'global' | 'airport' | 'versus';

export default function Leaderboard() {
  const profile = useApp((s) => s.profile);
  const myXp = useApp(totalXp);
  const showMe = useApp((s) => s.privacy.showInLeaderboards);
  const [scope, setScope] = useState<Scope>('global');
  const [airport, setAirport] = useState(profile?.homeAirportId ?? 'EGCC');
  const [period, setPeriod] = useState<'week' | 'month' | 'all'>('week');
  const factor = period === 'week' ? 0.04 : period === 'month' ? 0.15 : 1;
  const pool = demoUsers.filter((u) => u.id !== 'u_avteam' && (scope !== 'airport' || u.homeAirportId === airport || u.airportsVisited.includes(airport)));
  const rows = [
    ...pool.map((u) => ({ id: u.id, name: u.username, score: Math.round(u.xp * factor * (0.9 + (u.username.length % 5) / 20)), verified: Math.round(u.aircraftCollected * factor * 1.4), me: false })),
    ...(showMe ? [{ id: 'me', name: profile?.username ?? 'you', score: Math.round(myXp * factor * 1.8), verified: 3, me: true }] : []),
  ].sort((a, b) => b.score - a.score);
  return (
    <Screen header={<Header title="Leaderboards" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Segmented<Scope> value={scope} onChange={setScope} options={[{ key: 'global', label: 'Global' }, { key: 'airport', label: 'Airport' }, { key: 'versus', label: 'MAN vs AMS' }]} />
        {scope === 'airport' && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {airports.map((a) => <Chip key={a.id} small label={a.iata} active={airport === a.id} onPress={() => setAirport(a.id)} />)}
          </ScrollView>
        )}
        {scope !== 'versus' ? (
          <>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              {(['week', 'month', 'all'] as const).map((p) => <Chip key={p} small label={p === 'all' ? 'All time' : `This ${p}`} active={period === p} onPress={() => setPeriod(p)} />)}
            </View>
            <Notice icon="sparkles-outline" color={colors.cyan} text="Rankings use quality-weighted XP: verified, original and rare sightings count most. Upload volume alone doesn’t move you up." />
            {rows.length === 0 && <T muted>No ranked spotters at {airportById[airport]?.iata} yet.</T>}
            {rows.map((r, i) => (
              <Tap key={r.id} onPress={() => router.push(r.me ? '/profile' : `/user/${r.id}`)}>
                <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: r.me ? colors.primary : colors.border, backgroundColor: r.me ? 'rgba(61,139,255,0.08)' : colors.surface }}>
                  <T v="dataLarge" style={{ width: 34 }} color={i === 0 ? '#FFB547' : i === 1 ? '#C9D3E3' : i === 2 ? '#CD8A4A' : colors.textMuted}>{i + 1}</T>
                  <Avatar userId={r.me ? 'me' : r.id} size={40} />
                  <View style={{ flex: 1 }}>
                    <T v="title">@{r.name}{r.me ? ' (you)' : ''}</T>
                    <T v="caption" muted>{r.verified} verified sightings</T>
                  </View>
                  <T v="data">{r.score.toLocaleString()}</T>
                </Card>
              </Tap>
            ))}
            {!showMe && <T v="caption" dim>You’re hidden from leaderboards (Settings → Privacy).</T>}
          </>
        ) : (
          <Versus />
        )}
      </View>
    </Screen>
  );
}

function Versus() {
  const man = 48210, ams = 44890;
  return (
    <View style={{ gap: space.lg }}>
      <Card style={{ gap: 14 }}>
        <T v="overline" color={colors.cyan} center>Airport vs Airport · Week 1 of 2</T>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' }}>
          <View style={{ alignItems: 'center' }}><T v="hero">MAN</T><T v="data" color={colors.cyan}>{man.toLocaleString()}</T></View>
          <Ionicons name="flash" size={28} color={colors.sim} />
          <View style={{ alignItems: 'center' }}><T v="hero">AMS</T><T v="data" color={colors.review}>{ams.toLocaleString()}</T></View>
        </View>
        <View style={{ flexDirection: 'row', height: 10, borderRadius: 5, overflow: 'hidden' }}>
          <View style={{ flex: man, backgroundColor: colors.cyan }} />
          <View style={{ flex: ams, backgroundColor: colors.review }} />
        </View>
        <T v="small" muted center>Quality-weighted XP from verified sightings at each airport. Demo standings.</T>
      </Card>
      {[['Verified sightings', '1,284', '1,190'], ['Special liveries', '9', '12'], ['Rare+ aircraft', '31', '24'], ['Active spotters', '412', '388']].map(([k, a, b]) => (
        <View key={k} style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T v="data" color={colors.cyan}>{a}</T><T muted>{k}</T><T v="data" color={colors.review}>{b}</T></View>
      ))}
      <ProgressBar value={0.5} />
      <T v="caption" muted center>7 days remaining</T>
    </View>
  );
}
