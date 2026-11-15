import React from 'react';
import { Share, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { colors, rarityColors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, EmptyState, ListRow, Notice } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Photo, RarityBadge, VerificationBadge, verificationMeta } from '@/components/aviation';
import { airlineById, airportById, manufacturerById, registrationByReg, typeById } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { useShallow } from 'zustand/react/shallow';
import { rarityLabel, localRarity } from '@/services/rarity';
import { XP_RULES } from '@/services/xp';
import { date } from '@/utils/format';
import { LinearGradient } from 'expo-linear-gradient';

export default function HangarItem() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const c = useApp((s) => s.collection.find((x) => x.id === id));
  const profile = useApp((s) => s.profile);
  const sightings = useApp(useShallow((s) => s.sightings.filter((x) => x.hangarId === id)));
  if (!c) return <Screen header={<Header title="Aircraft" />}><EmptyState icon="albums-outline" title="Not in your hangar" body="This aircraft may have been removed." /></Screen>;
  const t = typeById[c.typeId];
  const reg = c.registration ? registrationByReg[c.registration] : undefined;
  const rc = rarityColors[c.rarity];
  return (
    <Screen header={<Header title={t?.variant ?? 'Aircraft'} subtitle={c.registration} right={<Button title="Share" small full={false} variant="secondary" icon="share-outline" onPress={() => Share.share({ message: `I collected ${t?.variant} ${c.registration ?? ''} on AeroVerse!` }).catch(() => {})} />} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <LinearGradient colors={[rc, rc + '33', rc]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ borderRadius: 24, padding: 3 }}>
          <View style={{ backgroundColor: '#070B14', borderRadius: 21, overflow: 'hidden' }}>
            <Photo id={c.photoId ?? t?.photoId} style={{ width: '100%', aspectRatio: 16 / 10 }} />
            <View style={{ padding: space.lg, gap: 6 }}>
              <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
                <RarityBadge rarity={c.rarity} />
                <VerificationBadge stage={c.verification} />
              </View>
              <T v="overline" color={colors.cyan}>{manufacturerById[t?.manufacturerId]?.name} · {t?.family}</T>
              <T v="h1">{t?.variant}</T>
              <T v="dataLarge" color={colors.silver}>{c.registration ?? 'Registration not recorded'}</T>
              <T muted>{airlineById[c.airlineId]?.name}{reg?.livery ? ` · ${reg.livery}` : ''}</T>
            </View>
          </View>
        </LinearGradient>
        {c.verification === 'needs_review' && <Notice icon="people-outline" color={colors.review} text="Pending community review. XP for this sighting is held until it’s verified." />}
        <Card padded={false}>
          <ListRow icon="calendar-outline" title={date(c.firstSeen)} subtitle="First collected" />
          <ListRow icon="location-outline" title={airportById[c.airportId]?.name ?? c.airportId} subtitle="Where first spotted" onPress={() => router.push(`/airports/${c.airportId}`)} />
          <ListRow icon="repeat-outline" title={`${c.sightings} sighting${c.sightings > 1 ? 's' : ''}`} subtitle="Repeat sightings earn small, capped XP — better photos earn more" />
          <ListRow icon="diamond-outline" title={`${rarityLabel[c.rarity]} when collected`} subtitle={`Currently ${rarityLabel[localRarity(c.typeId, profile?.homeAirportId, c.registration)]} at your home airport`} />
          <ListRow icon={verificationMeta[c.verification].icon} iconColor={verificationMeta[c.verification].color} title={verificationMeta[c.verification].label} subtitle={verificationMeta[c.verification].description} />
          <ListRow icon="aperture-outline" title={`Best photo score ${Math.round(c.bestPhotoScore * 100)}/100`} subtitle={`Upload a sharper shot for +${XP_RULES.improvedPhoto} XP`} />
          <ListRow icon="person-outline" title={`Collector: @${profile?.username}`} subtitle="Collector information" />
          <ListRow icon="airplane-outline" title="Aircraft type details" onPress={() => router.push(`/aircraft/${c.typeId}`)} />
        </Card>
        {sightings.length > 0 && (
          <Button title="View verification report" variant="secondary" icon="scan-outline" onPress={() => router.push(`/verification/${sightings[0].id}`)} />
        )}
        <Button title="Log another sighting" icon="camera-outline" onPress={() => router.push(`/upload?type=${c.typeId}&reg=${c.registration ?? ''}`)} />
      </View>
    </Screen>
  );
}
