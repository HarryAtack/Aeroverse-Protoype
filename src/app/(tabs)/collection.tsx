import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radius, rarityColors, space } from '@/theme/tokens';
import type { CollectedAircraft } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, EmptyState, IconButton, ProgressBar, Segmented, Stat, Tap } from '@/components/ui/primitives';
import { AircraftArt, Photo, RarityBadge, VerificationBadge } from '@/components/aviation';
import { aircraftTypes, airlineById, airportById, manufacturerById, typeById } from '@/data/catalog';
import { collectionSets } from '@/data/community';
import { useApp, totalXp } from '@/store/useApp';
import { levelFromXp } from '@/services/xp';
import { rarityRank } from '@/services/rarity';
import { date } from '@/utils/format';
import { setProgress } from '@/services/collection';

type Tab = 'aircraft' | 'sets' | 'wanted';
const CATS = ['All', 'Airbus', 'Boeing', 'Regional', 'Widebody', 'Historic', 'Military', 'Rare+', 'Special liveries'] as const;

export default function Collection() {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const collection = useApp((s) => s.collection);
  const wishlist = useApp((s) => s.wishlist);
  const xp = useApp(totalXp);
  const [tab, setTab] = useState<Tab>('aircraft');
  const [cat, setCat] = useState<(typeof CATS)[number]>('All');
  const [sort, setSort] = useState<'recent' | 'rarity' | 'sightings'>('recent');
  const lvl = levelFromXp(xp);

  const typesCollected = new Set(collection.map((c) => c.typeId));
  const families = new Set(collection.map((c) => typeById[c.typeId]?.family));
  const mfrs = new Set(collection.map((c) => typeById[c.typeId]?.manufacturerId));
  const airlinesSet = new Set(collection.map((c) => c.airlineId));
  const completion = typesCollected.size / aircraftTypes.length;

  const filtered = useMemo(() => {
    let l = collection.filter((c) => {
      const t = typeById[c.typeId];
      switch (cat) {
        case 'Airbus': return t?.manufacturerId === 'airbus';
        case 'Boeing': return t?.manufacturerId === 'boeing';
        case 'Regional': return t?.category === 'regional';
        case 'Widebody': return (t?.wingspanM ?? 0) > 55 && t?.category !== 'military';
        case 'Historic': return t?.category === 'historic';
        case 'Military': return t?.category === 'military';
        case 'Rare+': return rarityRank(c.rarity) >= 2;
        case 'Special liveries': return c.specialLivery || c.rarity === 'special';
        default: return true;
      }
    });
    l = [...l].sort((a, b) => sort === 'rarity' ? rarityRank(b.rarity) - rarityRank(a.rarity) : sort === 'sightings' ? b.sightings - a.sightings : +new Date(b.firstSeen) - +new Date(a.firstSeen));
    return l;
  }, [collection, cat, sort]);

  const col = Math.min(width, 640);
  const tileW = (col - space.lg * 2 - 10) / 2;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.bg }} contentContainerStyle={{ paddingTop: insets.top + 8, paddingBottom: insets.bottom + 120, maxWidth: 640, width: '100%', alignSelf: 'center' }} showsVerticalScrollIndicator={false}>
      <View style={{ paddingHorizontal: space.lg, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: space.lg }}>
        <View>
          <T v="overline" color={colors.cyan}>Personal hangar</T>
          <T v="h1">My Collection</T>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton icon="trophy-outline" accessibilityLabel="Achievements" onPress={() => router.push('/achievements')} />
          <IconButton icon="camera-outline" accessibilityLabel="Add a sighting" onPress={() => router.push('/upload')} />
        </View>
      </View>

      <View style={{ marginHorizontal: space.lg, borderRadius: radius.xxl, overflow: 'hidden', marginBottom: space.lg, borderWidth: 1, borderColor: colors.borderStrong }}>
        <LinearGradient colors={['#13284A', '#0A1222']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ padding: space.lg, gap: space.lg }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: space.lg }}>
            <View style={styles.ring}>
              <T v="h2">{Math.round(completion * 100)}%</T>
              <T v="caption" muted>database</T>
            </View>
            <View style={{ flex: 1, gap: 6 }}>
              <T v="title">Level {lvl.level} collector</T>
              <ProgressBar value={lvl.progress} />
              <T v="caption" muted>{Math.round(lvl.current).toLocaleString()} / {Math.round(lvl.needed).toLocaleString()} XP to level {lvl.level + 1}</T>
            </View>
          </View>
          <View style={{ flexDirection: 'row' }}>
            <Stat value={collection.length} label="Aircraft" />
            <Stat value={typesCollected.size} label="Variants" />
            <Stat value={families.size} label="Families" />
            <Stat value={mfrs.size} label="Makers" />
            <Stat value={airlinesSet.size} label="Operators" />
          </View>
        </LinearGradient>
      </View>

      <Tap onPress={() => router.push('/cards')} style={{ marginHorizontal: space.lg, marginBottom: space.lg }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12, borderColor: 'rgba(180,108,255,0.4)' }}>
          <Ionicons name="albums" size={22} color={rarityColors.epic} />
          <View style={{ flex: 1 }}>
            <T v="title">Digital card collection</T>
            <T v="small" muted>{useApp.getState().ownedCards.length} unique cards · {Object.values(useApp.getState().packs).reduce((a, b) => a + b, 0)} packs to open</T>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
        </Card>
      </Tap>

      <View style={{ paddingHorizontal: space.lg, marginBottom: space.md }}>
        <Segmented<Tab> value={tab} onChange={setTab} options={[{ key: 'aircraft', label: `Aircraft (${collection.length})` }, { key: 'sets', label: 'Collections' }, { key: 'wanted', label: `Wanted (${wishlist.length})` }]} />
      </View>

      {tab === 'aircraft' && (
        <>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 6, marginBottom: space.sm }}>
            {CATS.map((c) => <Chip key={c} small label={c} active={cat === c} onPress={() => setCat(c)} />)}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 6, paddingHorizontal: space.lg, marginBottom: space.md, alignItems: 'center' }}>
            <T v="caption" muted>Sort:</T>
            {(['recent', 'rarity', 'sightings'] as const).map((s) => <Chip key={s} small label={s[0].toUpperCase() + s.slice(1)} active={sort === s} onPress={() => setSort(s)} />)}
          </View>
          {filtered.length === 0 ? (
            <EmptyState icon="albums-outline" title={collection.length ? 'Nothing in this category yet' : 'Your hangar is empty'} body={collection.length ? 'Try another category or go spotting!' : 'Upload your first aircraft photo to start your collection.'} action="Upload a sighting" onAction={() => router.push('/upload')} />
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: space.lg }}>
              {filtered.map((c) => <HangarTile key={c.id} c={c} width={tileW} />)}
            </View>
          )}
        </>
      )}

      {tab === 'sets' && (
        <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
          <T v="small" muted>Complete collections to earn bonus XP and badges. Missing aircraft are shown as silhouettes.</T>
          {collectionSets.map((s) => {
            const p = setProgress(s.items, collection);
            return (
              <Card key={s.id} style={{ gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                  <View style={styles.setIcon}><Ionicons name={s.icon as never} size={18} color={p.ratio === 1 ? colors.success : colors.cyan} /></View>
                  <View style={{ flex: 1 }}>
                    <T v="title">{s.name}</T>
                    <T v="small" muted>{s.description}</T>
                  </View>
                  <T v="data" color={p.ratio === 1 ? colors.success : colors.text}>{p.have.length}/{s.items.length}</T>
                </View>
                <ProgressBar value={p.ratio} color={p.ratio === 1 ? colors.success : colors.primary} />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {s.items.map((id) => {
                    const t = typeById[id];
                    const have = p.have.includes(id);
                    return (
                      <Tap key={id} onPress={() => router.push(`/aircraft/${id}`)} style={{ width: 92 }}>
                        {have ? <Photo id={t?.photoId} style={{ height: 60, borderRadius: 10 }} credit={false} /> : <AircraftArt style={{ height: 60, borderRadius: 10, opacity: 0.6 }} />}
                        <T v="caption" numberOfLines={1} color={have ? colors.text : colors.textDim} style={{ marginTop: 4 }}>{have ? '✓ ' : ''}{t?.variant}</T>
                      </Tap>
                    );
                  })}
                </ScrollView>
                <T v="caption" color={colors.sim}>Completion reward: +{s.rewardXp.toLocaleString()} XP{p.missing.length ? ` · Missing: ${p.missing.map((m) => typeById[m]?.variant).join(', ')}` : ' · Complete!'}</T>
              </Card>
            );
          })}
        </View>
      )}

      {tab === 'wanted' && (
        <View style={{ paddingHorizontal: space.lg, gap: 10 }}>
          {wishlist.length === 0 && <EmptyState icon="star-outline" title="No wanted aircraft" body="Add aircraft types from posts, the radar or the database. We’ll alert you when one is nearby." action="Browse aircraft" onAction={() => router.push('/explore')} />}
          {wishlist.map((id) => {
            const t = typeById[id];
            if (!t) return null;
            return (
              <Card key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => router.push(`/aircraft/${id}`)}>
                <Photo id={t.photoId} style={{ width: 80, height: 56, borderRadius: 10 }} credit={false} />
                <View style={{ flex: 1 }}>
                  <T v="title">{manufacturerById[t.manufacturerId]?.name} {t.variant}</T>
                  <T v="small" muted>{typesCollected.has(id) ? 'Collected ✓' : 'Not yet collected'} · alerts on</T>
                </View>
                <Button title="Remove" small full={false} variant="secondary" onPress={() => useApp.getState().toggleWishlist(id)} />
              </Card>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

function HangarTile({ c, width }: { c: CollectedAircraft; width: number }) {
  const t = typeById[c.typeId];
  const rc = rarityColors[c.rarity];
  return (
    <Tap onPress={() => router.push(`/hangar/${c.id}`)} style={{ width, borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: rc + '55' }} accessibilityLabel={`${t?.variant} ${c.registration ?? ''}`}>
      <Photo id={c.photoId ?? t?.photoId} style={{ height: width * 0.66 }} credit={false}>
        <LinearGradient colors={['transparent', 'rgba(5,8,15,0.85)']} style={[StyleSheet.absoluteFill, { top: '50%' }]} />
        <View style={{ position: 'absolute', top: 6, left: 6 }}><RarityBadge rarity={c.rarity} small /></View>
        <View style={{ position: 'absolute', top: 8, right: 8 }}><VerificationBadge stage={c.verification} compact /></View>
        <T v="data" style={{ position: 'absolute', bottom: 6, left: 8 }}>{c.registration ?? '—'}</T>
      </Photo>
      <View style={{ padding: 10, gap: 2 }}>
        <T v="title" numberOfLines={1}>{t?.variant}</T>
        <T v="caption" muted numberOfLines={1}>{airlineById[c.airlineId]?.name}</T>
        <T v="caption" dim numberOfLines={1}>{airportById[c.airportId]?.iata} · {date(c.firstSeen)} · ×{c.sightings}</T>
      </View>
    </Tap>
  );
}

const styles = StyleSheet.create({
  ring: { width: 88, height: 88, borderRadius: 44, borderWidth: 5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(61,139,255,0.08)' },
  setIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(92,225,255,0.1)', alignItems: 'center', justifyContent: 'center' },
});
