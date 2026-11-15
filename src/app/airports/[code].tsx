import React, { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, EmptyState, IconButton, Input, Notice, ProgressBar, Tap } from '@/components/ui/primitives';
import { goBack } from '@/components/ui/Screen';
import { Avatar, Photo, PostCard, RarityBadge, VerificationBadge } from '@/components/aviation';
import { airportById, airlineById, typeById } from '@/data/catalog';
import { demoPosts } from '@/data/posts';
import { demoUsers, userById } from '@/data/users';
import { challenges } from '@/data/community';
import { spots, spotKindLabel } from '@/data/spots';
import { useApp } from '@/store/useApp';
import { useShallow } from 'zustand/react/shallow';
import { localRarity } from '@/services/rarity';
import { compact, timeAgo } from '@/utils/format';

type Tab = 'feed' | 'sightings' | 'leaders' | 'challenges' | 'spots' | 'stats' | 'discuss';
const TABS: { key: Tab; label: string }[] = [
  { key: 'feed', label: 'Feed' }, { key: 'sightings', label: 'Sightings' }, { key: 'leaders', label: 'Leaderboard' }, { key: 'challenges', label: 'Challenges' }, { key: 'spots', label: 'Spots' }, { key: 'stats', label: 'Stats' }, { key: 'discuss', label: 'Discussions' },
];
const THREADS = [
  { id: 't1', userId: 'u_sam', title: 'Runway direction tomorrow?', body: 'Forecast says westerlies — 23R/23L ops. RVP will be busy.', replies: 14, at: 3 },
  { id: 't2', userId: 'u_nina', title: 'Antonov visit rumours', body: 'Anyone seen the An-124 slot confirmed? Don’t trust unverified schedule screenshots.', replies: 31, at: 9 },
  { id: 't3', userId: 'u_tom', title: 'Best lens for RVP?', body: '100-400 seems to be the sweet spot for most movements.', replies: 22, at: 30 },
];

export default function AirportCommunity() {
  const { code } = useLocalSearchParams<{ code: string }>();
  const insets = useSafeAreaInsets();
  const a = airportById[code];
  const joined = useApp((s) => s.joinedAirports.includes(code));
  const progress = useApp((s) => s.challengeProgress);
  const myThreads = useApp(useShallow((s) => s.comments[`airport:${code}`] ?? []));
  const [tab, setTab] = useState<Tab>('feed');
  const [draft, setDraft] = useState('');
  if (!a) return <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}><EmptyState title="Airport not found" action="All airports" onAction={() => router.replace('/airports')} /></View>;
  const posts = demoPosts.filter((p) => p.airportId === code);
  const locals = demoUsers.filter((u) => u.homeAirportId === code || u.airportsVisited.includes(code)).filter((u) => u.id !== 'u_avteam');
  const ch = challenges.filter((c) => c.airportId === code || c.period === 'global');
  const sp = spots.filter((s) => s.airportId === code);
  const top = Object.entries(a.typeFrequency).sort((x, y) => y[1] - x[1]).slice(0, 8);
  const { toggleJoinAirport, showToast, addComment } = useApp.getState();

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 60, maxWidth: 640, width: '100%', alignSelf: 'center' }} stickyHeaderIndices={[1]} showsVerticalScrollIndicator={false}>
        <View>
          <Photo id={a.photoId} style={{ height: 240 + insets.top }}>
            <LinearGradient colors={['rgba(5,8,15,0.5)', 'transparent', colors.bg]} style={StyleSheet.absoluteFill} />
            <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack()} style={{ position: 'absolute', top: insets.top + 8, left: space.lg }} />
            <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: 12 }}>
              <T v="overline" color={colors.cyan}>{a.id} · {a.city}, {a.country}</T>
              <T v="hero">{a.name}</T>
            </View>
          </Photo>
          <View style={{ paddingHorizontal: space.lg, gap: space.md, paddingBottom: space.md }}>
            <View style={{ flexDirection: 'row', gap: 16 }}>
              <T v="small" muted><T v="smallMedium">{compact(a.members + (joined ? 1 : 0))}</T> members</T>
              <T v="small" muted><T v="smallMedium">{a.runways.length}</T> runways</T>
              <T v="small" muted><T v="smallMedium">{sp.length}</T> spots</T>
            </View>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Button title={joined ? 'Joined' : 'Join community'} icon={joined ? 'checkmark' : 'add'} small variant={joined ? 'secondary' : 'primary'} style={{ flex: 1 }} onPress={() => { toggleJoinAirport(code); showToast(joined ? `Left ${a.iata} community` : `Welcome to the ${a.iata} community!`); }} />
              <Button title="Spotting map" icon="map-outline" small variant="secondary" style={{ flex: 1 }} onPress={() => router.push(`/spotting?airport=${code}`)} />
              <IconButton icon="radio-outline" accessibilityLabel="Show on radar" onPress={() => router.push('/radar')} size={38} />
            </View>
            {a.spottingNote && <Notice icon="information-circle-outline" color={colors.cyan} text={a.spottingNote} />}
          </View>
        </View>
        <View style={{ backgroundColor: colors.bg, paddingVertical: 8 }}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 6 }}>
            {TABS.map((t) => <Chip key={t.key} small label={t.label} active={tab === t.key} onPress={() => setTab(t.key)} />)}
          </ScrollView>
        </View>
        <View style={{ paddingTop: space.md }}>
          {tab === 'feed' && (posts.length ? posts.map((p) => <PostCard key={p.id} post={p} />) : <EmptyState icon="images-outline" title="No local posts yet" body="Be the first to post from here!" action="Upload" onAction={() => router.push('/upload')} />)}
          {tab === 'sightings' && (
            <View style={{ paddingHorizontal: space.lg, gap: 10 }}>
              <Card style={{ flexDirection: 'row', gap: 10, alignItems: 'center', borderColor: 'rgba(255,181,71,0.4)' }}>
                <Ionicons name="alert-circle" size={22} color={colors.sim} />
                <T v="small" style={{ flex: 1 }}>Rare-livery alerts for {a.iata} are on for community members. (Demo)</T>
              </Card>
              {[...posts, ...demoPosts.filter((p) => p.airportId !== code).slice(0, 3)].map((p) => (
                <Tap key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Photo id={p.photoId} style={{ width: 72, height: 52, borderRadius: 10 }} credit={false} />
                  <View style={{ flex: 1 }}>
                    <T v="bodyMedium">{typeById[p.typeId]?.variant} · {p.registration ?? '—'}</T>
                    <T v="small" muted>{airlineById[p.airlineId]?.name} · {timeAgo(p.takenAt)}</T>
                  </View>
                  <VerificationBadge stage={p.verification} compact />
                </Tap>
              ))}
            </View>
          )}
          {tab === 'leaders' && (
            <View style={{ paddingHorizontal: space.lg, gap: 8 }}>
              <T v="small" muted>Local photographers ranked by quality-weighted XP at {a.iata}.</T>
              {locals.sort((x, y) => y.xp - x.xp).map((u, i) => (
                <Card key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => router.push(`/user/${u.id}`)}>
                  <T v="dataLarge" style={{ width: 28 }}>{i + 1}</T>
                  <Avatar userId={u.id} size={38} />
                  <View style={{ flex: 1 }}><T v="title">@{u.username}</T><T v="caption" muted>{u.specialties?.join(' · ')}</T></View>
                  <T v="data">{Math.round(u.xp * 0.3).toLocaleString()}</T>
                </Card>
              ))}
              {locals.length === 0 && <T muted>No ranked locals yet.</T>}
            </View>
          )}
          {tab === 'challenges' && (
            <View style={{ paddingHorizontal: space.lg, gap: 10 }}>
              {ch.map((c) => {
                const p = Math.min(c.target, progress[c.id] ?? c.progress);
                return (
                  <Card key={c.id} style={{ gap: 8 }} onPress={() => router.push('/challenges')}>
                    <T v="title">{c.title}</T>
                    <T v="small" muted>{c.description}</T>
                    <ProgressBar value={p / c.target} />
                    <T v="caption" color={colors.sim}>{p}/{c.target} · +{c.rewardXp} XP</T>
                  </Card>
                );
              })}
              <Card style={{ gap: 6 }} onPress={() => router.push('/leaderboard')}>
                <T v="title">Airport vs Airport</T>
                <T v="small" muted>Represent {a.iata} in the current inter-airport competition →</T>
              </Card>
            </View>
          )}
          {tab === 'spots' && (
            <View style={{ paddingHorizontal: space.lg, gap: 10 }}>
              {sp.length === 0 && <EmptyState icon="map-outline" title="No spots listed yet" body="Know a safe, public viewing place? Suggest it." action="Add a location" onAction={() => router.push(`/spotting/add?airport=${code}`)} />}
              {sp.map((s) => (
                <Card key={s.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }} onPress={() => router.push(`/spotting/${s.id}`)}>
                  <Photo id={s.photoIds[0]} style={{ width: 72, height: 54, borderRadius: 10 }} credit={false} />
                  <View style={{ flex: 1 }}>
                    <T v="title" numberOfLines={1}>{s.name}</T>
                    <T v="small" color={s.verified ? colors.success : colors.warning}>{s.verified ? '✓ ' : '⚠ '}{spotKindLabel[s.kind]}</T>
                  </View>
                  <T v="smallMedium">★ {s.rating}</T>
                </Card>
              ))}
            </View>
          )}
          {tab === 'stats' && (
            <View style={{ paddingHorizontal: space.lg, gap: 12 }}>
              <Notice text="Illustrative demo statistics. Production stats come from licensed movement data and verified sightings." />
              <Card style={{ gap: 10 }}>
                <T v="title">Most common types (share of movements)</T>
                {top.map(([id, f]) => (
                  <Tap key={id} onPress={() => router.push(`/aircraft/${id}`)} style={{ gap: 4 }}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                      <T v="small">{typeById[id]?.variant}</T>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <RarityBadge rarity={localRarity(id, code)} small />
                        <T v="smallMedium" style={{ width: 44, textAlign: 'right' }}>{(f * 100).toFixed(1)}%</T>
                      </View>
                    </View>
                    <ProgressBar value={f / top[0][1]} height={4} />
                  </Tap>
                ))}
              </Card>
              <Card style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                {[['Sightings this week', '1,284'], ['Unique types', '64'], ['Active spotters', '412']].map(([k, v]) => <View key={k}><T v="dataLarge">{v}</T><T v="caption" muted>{k}</T></View>)}
              </Card>
            </View>
          )}
          {tab === 'discuss' && (
            <View style={{ paddingHorizontal: space.lg, gap: 10 }}>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end' }}>
                <Input style={{ flex: 1 }} placeholder={`Start a discussion in ${a.iata}…`} value={draft} onChangeText={setDraft} />
                <Button title="Post" small full={false} disabled={!draft.trim()} onPress={() => { addComment(`airport:${code}`, draft.trim()); setDraft(''); showToast('Posted to discussions'); }} style={{ marginBottom: 4 }} />
              </View>
              {[...myThreads].reverse().map((c) => (
                <Card key={c.id} style={{ gap: 4 }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Avatar userId="me" size={26} /><T v="smallMedium">You · {timeAgo(c.createdAt)}</T></View>
                  <T>{c.text}</T>
                </Card>
              ))}
              {THREADS.map((t) => (
                <Card key={t.id} style={{ gap: 6 }}>
                  <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Avatar userId={t.userId} size={26} /><T v="smallMedium">@{userById[t.userId]?.username} · {t.at}h</T></View>
                  <T v="title">{t.title}</T>
                  <T v="small" muted>{t.body}</T>
                  <T v="caption" color={colors.primary}>{t.replies} replies</T>
                </Card>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
