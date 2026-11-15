import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, EmptyState, IconButton, Pill, SectionHeader, Tap } from '@/components/ui/primitives';
import { Header, Screen, goBack } from '@/components/ui/Screen';
import { Photo, RarityBadge } from '@/components/aviation';
import { aircraftTypes, airlineById, airports, manufacturerById, registrations, typeById } from '@/data/catalog';
import { demoPosts } from '@/data/posts';
import { localRarity } from '@/services/rarity';
import { useApp } from '@/store/useApp';
import { useShallow } from 'zustand/react/shallow';
import { timeAgo } from '@/utils/format';

export default function AircraftDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const t = typeById[id];
  const wanted = useApp((s) => s.wishlist.includes(id));
  const followed = useApp((s) => s.followedTypes.includes(id));
  const collected = useApp(useShallow((s) => s.collection.filter((c) => c.typeId === id)));
  if (!t) return <Screen header={<Header title="Aircraft" />}><EmptyState icon="airplane-outline" title="Aircraft not in database" body="Suggest it to the database team from Settings → Help." /></Screen>;
  const m = manufacturerById[t.manufacturerId];
  const family = aircraftTypes.filter((x) => x.family === t.family);
  const sightings = demoPosts.filter((p) => p.typeId === id);
  const regs = registrations.filter((r) => r.typeId === id);
  const { toggleWishlist, toggleFollowType, showToast } = useApp.getState();
  const military = t.category === 'military';
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 60, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Photo id={t.photoId} style={{ height: 300 + insets.top }}>
          <LinearGradient colors={['rgba(5,8,15,0.5)', 'transparent', colors.bg]} locations={[0, 0.4, 1]} style={StyleSheet.absoluteFill} />
          <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack()} style={{ position: 'absolute', top: insets.top + 8, left: space.lg }} />
          <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: 16, gap: 6 }}>
            <View style={{ flexDirection: 'row', gap: 6 }}>
              <RarityBadge rarity={t.baseRarity} />
              <Pill label={t.icao} color={colors.silver} />
              {!t.inProduction && <Pill label="Out of production" color={colors.steel} />}
            </View>
            <T v="overline" color={colors.cyan}>{m?.name} · {t.family} family</T>
            <T v="hero">{t.variant}</T>
          </View>
        </Photo>
        <View style={{ padding: space.lg, gap: space.lg }}>
          <T muted>{t.description}</T>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title={wanted ? 'Wanted ✓' : 'Add to wanted'} icon={wanted ? 'star' : 'star-outline'} small variant={wanted ? 'secondary' : 'primary'} onPress={() => { toggleWishlist(id); showToast(wanted ? 'Removed from wanted list' : 'Added to wanted list'); }} style={{ flex: 1 }} />
            <Button title={followed ? 'Following type' : 'Follow type'} icon={followed ? 'notifications' : 'notifications-outline'} small variant="secondary" onPress={() => { toggleFollowType(id); showToast(followed ? 'Type alerts off' : `Alerts on for ${t.variant}`, 'info'); }} style={{ flex: 1 }} />
          </View>
          {collected.length > 0 ? (
            <Card style={{ borderColor: colors.success + '66' }} onPress={() => router.push(`/hangar/${collected[0].id}`)}>
              <T v="title" color={colors.success}>✓ In your hangar · {collected.length} airframe{collected.length > 1 ? 's' : ''}</T>
              <T v="small" muted>{collected.map((c) => c.registration ?? 'unregistered').join(', ')}</T>
            </Card>
          ) : (
            <Card style={{ gap: 8 }}>
              <T v="title">Not collected yet</T>
              <T v="small" muted>Spot one and upload your photo to add it to your hangar.</T>
              <Button title="Log a sighting" icon="camera-outline" small full={false} onPress={() => router.push(`/upload?type=${id}`)} />
            </Card>
          )}
          <Card style={{ flexDirection: 'row', flexWrap: 'wrap', rowGap: 14 }}>
            {[
              ['First flight', t.firstFlight], ['Engines', t.engines], ['Length', `${t.lengthM} m`], ['Wingspan', `${t.wingspanM} m`],
              ...(t.rangeKm ? [['Range', `${t.rangeKm.toLocaleString()} km`]] : []), ...(t.seatsTypical ? [['Typical seats', t.seatsTypical]] : []),
            ].map(([k, v]) => (
              <View key={k} style={{ width: '50%', gap: 2 }}><T v="caption" muted>{k}</T><T v="bodyMedium">{v}</T></View>
            ))}
          </Card>
          <T v="caption" dim>Specifications are typical published figures and vary by configuration.</T>
          {!military && (
            <View style={{ gap: 8 }}>
              <T v="h3">Rarity by airport</T>
              <T v="small" muted>Rarity reflects how often this type visits each airport (demo frequency data).</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {airports.map((a) => (
                  <Tap key={a.id} onPress={() => router.push(`/airports/${a.id}`)} style={{ alignItems: 'center', gap: 4, width: '30%', paddingVertical: 8, backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border }}>
                    <T v="data">{a.iata}</T>
                    <RarityBadge rarity={localRarity(id, a.id)} small />
                  </Tap>
                ))}
              </View>
            </View>
          )}
          {military && <Card><T v="small" muted>Military aircraft are documented from public sources such as airshows and museums. AeroVerse never shows operational military movements.</T></Card>}
        </View>
        {family.length > 1 && (
          <>
            <SectionHeader title={`${t.family} family`} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 10, marginBottom: space.lg }}>
              {family.map((f) => (
                <Tap key={f.id} onPress={() => router.replace(`/aircraft/${f.id}`)} style={{ width: 140, opacity: f.id === id ? 1 : 0.85 }}>
                  <Photo id={f.photoId} style={{ height: 90, borderRadius: 12, borderWidth: f.id === id ? 2 : 0, borderColor: colors.cyan }} credit={false} />
                  <T v="title" numberOfLines={1} style={{ marginTop: 6 }}>{f.variant}</T>
                </Tap>
              ))}
            </ScrollView>
          </>
        )}
        {regs.length > 0 && (
          <View style={{ paddingHorizontal: space.lg, gap: 8, marginBottom: space.lg }}>
            <T v="h3">Registrations in database</T>
            {regs.map((r) => (
              <View key={r.reg} style={{ flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border }}>
                <T v="data">{r.reg}</T>
                <T v="small" muted>{airlineById[r.airlineId]?.name}{r.specialLivery ? ' · ✦ special livery' : ''}</T>
              </View>
            ))}
          </View>
        )}
        <View style={{ paddingHorizontal: space.lg, gap: 8 }}>
          <T v="h3">Recent sightings</T>
          {sightings.length === 0 && <T muted>No recent community sightings.</T>}
          {sightings.map((p) => (
            <Tap key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Photo id={p.photoId} style={{ width: 72, height: 52, borderRadius: 10 }} credit={false} />
              <View style={{ flex: 1 }}>
                <T v="bodyMedium">{p.registration ?? 'Unconfirmed reg'} · {airlineById[p.airlineId]?.name}</T>
                <T v="small" muted>{p.location} · {timeAgo(p.takenAt)}</T>
              </View>
            </Tap>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
void gradients;
