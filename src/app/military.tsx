import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Card, IconButton, Notice, ProgressBar, SectionHeader, Tap } from '@/components/ui/primitives';
import { goBack } from '@/components/ui/Screen';
import { Photo, PostCard, RarityBadge } from '@/components/aviation';
import { aircraftTypes, manufacturerById } from '@/data/catalog';
import { achievements, collectionSets } from '@/data/community';
import { demoPosts } from '@/data/posts';
import { spots } from '@/data/spots';
import { useApp } from '@/store/useApp';
import { setProgress } from '@/services/collection';

const AIRSHOWS = [
  { name: 'Royal International Air Tattoo', where: 'RAF Fairford', when: 'July', spot: 's_riat' },
  { name: 'Farnborough International Airshow', where: 'Farnborough', when: 'July (even years)' },
  { name: 'Duxford Flying Days', where: 'IWM Duxford', when: 'May–September' },
  { name: 'Southport Airshow', where: 'Southport seafront', when: 'September' },
];

export default function Military() {
  const insets = useSafeAreaInsets();
  const collection = useApp((s) => s.collection);
  const types = aircraftTypes.filter((t) => t.category === 'military' || t.category === 'historic');
  const posts = demoPosts.filter((p) => p.military);
  const sets = collectionSets.filter((s) => s.category === 'military' || s.category === 'historic');
  const museums = spots.filter((s) => s.kind === 'museum' || s.kind === 'airshow');
  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingBottom: insets.bottom + 60, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <Photo id="typhoon" style={{ height: 280 + insets.top }}>
        <LinearGradient colors={['rgba(5,8,15,0.5)', 'rgba(20,26,18,0.3)', colors.bg]} style={StyleSheet.absoluteFill} />
        <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack('/explore')} style={{ position: 'absolute', top: insets.top + 8, left: space.lg }} />
        <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: 16 }}>
          <T v="overline" color="#A3B18A">AeroVerse · Military & Historic</T>
          <T v="hero">Warbirds, fast jets & heritage</T>
        </View>
      </Photo>
      <View style={{ padding: space.lg, gap: space.lg }}>
        <Notice icon="shield-checkmark-outline" color="#A3B18A" title="Public sources only" text="This section covers airshows, museums, heritage flights and public events. AeroVerse never tracks or publishes operational military movements, bases activity or sensitive information." />
      </View>
      <SectionHeader title="Military & historic collections" />
      <View style={{ paddingHorizontal: space.lg, gap: 10, marginBottom: space.xl }}>
        {sets.map((s) => {
          const p = setProgress(s.items, collection);
          return (
            <Card key={s.id} style={{ gap: 8 }} onPress={() => router.push('/collection')}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}><T v="title">{s.name}</T><T v="data">{p.have.length}/{s.items.length}</T></View>
              <T v="small" muted>{s.description}</T>
              <ProgressBar value={p.ratio} color="#A3B18A" />
            </Card>
          );
        })}
      </View>
      <SectionHeader title="Aircraft information" overline="Database" />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 10, marginBottom: space.xl }}>
        {types.map((t) => (
          <Tap key={t.id} onPress={() => router.push(`/aircraft/${t.id}`)} style={{ width: 150 }}>
            <Photo id={t.photoId} style={{ height: 100, borderRadius: 14 }} credit={false} />
            <T v="title" numberOfLines={1} style={{ marginTop: 6 }}>{t.variant}</T>
            <T v="caption" muted>{manufacturerById[t.manufacturerId]?.name} · {t.firstFlight}</T>
            <View style={{ marginTop: 4 }}><RarityBadge rarity={t.baseRarity} small /></View>
          </Tap>
        ))}
      </ScrollView>
      <SectionHeader title="Airshow calendar" />
      <View style={{ paddingHorizontal: space.lg, gap: 8, marginBottom: space.xl }}>
        {AIRSHOWS.map((a) => (
          <Card key={a.name} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={a.spot ? () => router.push(`/spotting/${a.spot}`) : undefined}>
            <Ionicons name="flag" size={20} color="#A3B18A" />
            <View style={{ flex: 1 }}><T v="title">{a.name}</T><T v="small" muted>{a.where} · usually {a.when}</T></View>
          </Card>
        ))}
        <T v="caption" dim>Dates vary year to year — always check the organiser’s official website.</T>
      </View>
      <SectionHeader title="Museums & heritage" />
      <View style={{ paddingHorizontal: space.lg, gap: 8, marginBottom: space.xl }}>
        {museums.map((m) => (
          <Card key={m.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }} onPress={() => router.push(`/spotting/${m.id}`)}>
            <Photo id={m.photoIds[0]} style={{ width: 70, height: 52, borderRadius: 10 }} credit={false} />
            <View style={{ flex: 1 }}><T v="title" numberOfLines={1}>{m.name}</T><T v="small" muted numberOfLines={1}>{m.summary}</T></View>
          </Card>
        ))}
      </View>
      <SectionHeader title="Military achievements" action="All" onAction={() => router.push('/achievements')} />
      <View style={{ paddingHorizontal: space.lg, gap: 8, marginBottom: space.xl }}>
        {achievements.filter((a) => a.military).map((a) => (
          <Card key={a.id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
            <Ionicons name={a.icon as never} size={22} color="#A3B18A" />
            <View style={{ flex: 1 }}><T v="title">{a.name}</T><T v="small" muted>{a.description}</T></View>
            <T v="caption" muted>{a.progress ?? 0}/{a.target}</T>
          </Card>
        ))}
      </View>
      <SectionHeader title="Military & historic feed" />
      {posts.map((p) => <PostCard key={p.id} post={p} />)}
    </ScrollView>
  );
}
