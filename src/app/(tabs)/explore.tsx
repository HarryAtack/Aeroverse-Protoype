import React from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { SectionHeader, Tap } from '@/components/ui/primitives';
import { Photo, RarityBadge } from '@/components/aviation';
import { aircraftTypes, manufacturerById } from '@/data/catalog';
import { demoPosts } from '@/data/posts';
import { useApp } from '@/store/useApp';

const TILES: { title: string; sub: string; icon: string; route: string; photo: string; accent?: string }[] = [
  { title: 'Spotting Map', sub: 'Verified viewing areas & community spots', icon: 'map', route: '/spotting', photo: 'man' },
  { title: 'Airport Communities', sub: 'Local feeds, leaderboards, chat', icon: 'business', route: '/airports', photo: 'ams' },
  { title: 'Photographers', sub: 'Discover the best aviation photography', icon: 'aperture', route: '/photographers', photo: 'b789vs' },
  { title: 'Competitions', sub: 'Weekly, monthly & annual awards', icon: 'trophy', route: '/competitions', photo: 'b748lh', accent: colors.sim },
  { title: 'Military & Historic', sub: 'Airshows, museums, warbirds', icon: 'shield', route: '/military', photo: 'typhoon' },
  { title: 'Digital Cards', sub: 'Open packs, complete sets', icon: 'albums', route: '/cards', photo: 'concorde', accent: '#B46CFF' },
  { title: 'Store', sub: 'Physical cards & prints', icon: 'bag-handle', route: '/store', photo: 'a350qr' },
  { title: 'Challenges', sub: 'Daily, weekly, airport & global', icon: 'flag', route: '/challenges', photo: 'b738jet2' },
  { title: 'Leaderboards', sub: 'Quality-weighted rankings', icon: 'podium', route: '/leaderboard', photo: 'a320ezy' },
  { title: 'Review Queue', sub: 'Help verify community sightings', icon: 'people', route: '/review', photo: 'an124', accent: colors.review },
];

export default function Explore() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const plus = useApp((s) => s.plus.active);
  const col = Math.min(width, 640);
  const tileW = (col - space.lg * 2 - 10) / 2;
  const grid = demoPosts.slice(0, 9);

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120, maxWidth: 640, width: '100%', alignSelf: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: space.lg, gap: space.md, marginBottom: space.xl }}>
        <T v="h1">Explore</T>
        <Tap onPress={() => router.push('/search')} style={styles.search} accessibilityLabel="Search AeroVerse">
          <Ionicons name="search" size={18} color={colors.textDim} />
          <T muted>Registrations, types, airlines, airports, users…</T>
        </Tap>
      </View>

      {!plus && (
        <Tap onPress={() => router.push('/plus')} style={{ marginHorizontal: space.lg, marginBottom: space.xl, borderRadius: radius.xl, overflow: 'hidden' }}>
          <LinearGradient colors={['#2A1A05', '#4A2E0A']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space.lg, flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderColor: 'rgba(255,181,71,0.4)', borderRadius: radius.xl }}>
            <Ionicons name="diamond" size={26} color={colors.sim} />
            <View style={{ flex: 1 }}>
              <T v="title" color={colors.sim}>AeroVerse Plus</T>
              <T v="small" muted>Advanced stats, enhanced alerts, exclusive challenges.</T>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.sim} />
          </LinearGradient>
        </Tap>
      )}

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: space.lg, marginBottom: space.xl }}>
        {TILES.map((t) => (
          <Tap key={t.title} onPress={() => router.push(t.route as never)} style={{ width: tileW, height: 132, borderRadius: radius.xl, overflow: 'hidden' }} accessibilityLabel={t.title}>
            <Photo id={t.photo} style={StyleSheet.absoluteFill} credit={false} />
            <LinearGradient colors={['rgba(5,8,15,0.35)', 'rgba(5,8,15,0.92)']} style={StyleSheet.absoluteFill} />
            <View style={{ flex: 1, padding: 12, justifyContent: 'space-between' }}>
              <View style={[styles.tileIcon, t.accent ? { borderColor: t.accent + '88' } : null]}>
                <Ionicons name={t.icon as never} size={17} color={t.accent ?? colors.cyan} />
              </View>
              <View>
                <T v="title">{t.title}</T>
                <T v="caption" muted numberOfLines={2}>{t.sub}</T>
              </View>
            </View>
          </Tap>
        ))}
      </View>

      <SectionHeader title="Aircraft database" overline={`${aircraftTypes.length} types · growing`} action="Search" onAction={() => router.push('/search')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 10, marginBottom: space.xl }}>
        {aircraftTypes.map((t) => (
          <Tap key={t.id} onPress={() => router.push(`/aircraft/${t.id}`)} style={{ width: 140 }}>
            <Photo id={t.photoId} style={{ height: 96, borderRadius: 14 }} credit={false} />
            <T v="title" numberOfLines={1} style={{ marginTop: 6 }}>{t.variant}</T>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
              <T v="caption" muted>{manufacturerById[t.manufacturerId]?.name}</T>
            </View>
            <View style={{ marginTop: 4 }}><RarityBadge rarity={t.baseRarity} small /></View>
          </Tap>
        ))}
      </ScrollView>

      <SectionHeader title="Top photography this week" action="Photographers" onAction={() => router.push('/photographers')} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: space.lg, gap: 4 }}>
        {grid.map((p) => (
          <Tap key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ width: (col - space.lg * 2 - 8) / 3, aspectRatio: 1, borderRadius: 8, overflow: 'hidden' }}>
            <Photo id={p.photoId} style={StyleSheet.absoluteFill} credit={false} />
          </Tap>
        ))}
      </View>
      <T v="caption" dim style={{ paddingHorizontal: space.lg, marginTop: 8 }}>Demo imagery from Wikimedia Commons — full credits on each photo and in Settings → Attributions.</T>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  search: { flexDirection: 'row', alignItems: 'center', gap: 10, height: 48, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  tileIcon: { width: 34, height: 34, borderRadius: 11, backgroundColor: 'rgba(5,8,15,0.6)', borderWidth: 1, borderColor: 'rgba(92,225,255,0.4)', alignItems: 'center', justifyContent: 'center' },
});
void gradients;
