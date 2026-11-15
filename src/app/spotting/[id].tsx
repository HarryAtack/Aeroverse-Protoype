import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, space } from '@/theme/tokens';
import type { Flight, InfoStatus } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Card, EmptyState, IconButton, Input, Notice, Pill, Tap } from '@/components/ui/primitives';
import { Sheet, goBack } from '@/components/ui/Screen';
import { Avatar, Photo } from '@/components/aviation';
import { spotById, spotKindLabel } from '@/data/spots';
import { airportById, typeById, anyAirport } from '@/data/catalog';
import { demoPosts } from '@/data/posts';
import { userById } from '@/data/users';
import { flightProvider, haversineKm } from '@/services/flight';
import { useApp } from '@/store/useApp';
import { useShallow } from 'zustand/react/shallow';
import { timeAgo } from '@/utils/format';

const statusMeta: Record<InfoStatus, { label: string; color: string; icon: string }> = {
  verified: { label: 'Verified', color: colors.success, icon: 'checkmark-circle' },
  community: { label: 'Community-reported', color: colors.warning, icon: 'people-circle' },
  unknown: { label: 'Unknown', color: colors.textDim, icon: 'help-circle' },
};

export default function SpotDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const added = useApp((s) => s.addedSpots.find((x) => x.id === id));
  const spot = spotById[id] ?? added;
  const saved = useApp((s) => s.savedSpots.includes(id));
  const myReview = useApp((s) => s.myReviews[id]);
  const checkins = useApp(useShallow((s) => s.checkins.filter((c) => c.spotId === id)));
  const shareCheckins = useApp((s) => s.privacy.shareCheckins);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [corrOpen, setCorrOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [text, setText] = useState('');
  const [corr, setCorr] = useState('');
  const [img, setImg] = useState(0);
  useEffect(() => flightProvider.subscribe({}, setFlights), []);
  if (!spot) return <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}><EmptyState title="Location not found" action="Back to map" onAction={() => router.replace('/spotting')} /></View>;
  const ap = spot.airportId ? airportById[spot.airportId] : undefined;
  const nearby = flights.map((f) => ({ f, d: haversineKm(spot.lat, spot.lon, f.lat, f.lon) })).filter((x) => x.d < 80).sort((a, b) => a.d - b.d).slice(0, 4);
  const recent = demoPosts.filter((p) => p.airportId === spot.airportId).slice(0, 4);
  const w = Math.min(width, 640);
  const { toggleSavedSpot, checkIn, addReview, suggestCorrection, showToast, addXp } = useApp.getState();
  const reviews = [...(myReview ? [myReview] : []), ...spot.reviews];

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 60, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View>
          <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} onMomentumScrollEnd={(e) => setImg(Math.round(e.nativeEvent.contentOffset.x / w))}>
            {spot.photoIds.map((p) => <Photo key={p} id={p} style={{ width: w, height: 280 + insets.top }} />)}
          </ScrollView>
          <LinearGradient pointerEvents="none" colors={['rgba(5,8,15,0.5)', 'transparent', colors.bg]} style={StyleSheet.absoluteFill} />
          <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack('/spotting')} style={{ position: 'absolute', top: insets.top + 8, left: space.lg }} />
          <IconButton icon={saved ? 'bookmark' : 'bookmark-outline'} color={saved ? colors.cyan : colors.text} accessibilityLabel={saved ? 'Unsave location' : 'Save location'} onPress={() => { toggleSavedSpot(id); showToast(saved ? 'Removed from saved locations' : 'Location saved'); }} style={{ position: 'absolute', top: insets.top + 8, right: space.lg }} />
          <View style={{ position: 'absolute', bottom: 14, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 5 }}>
            {spot.photoIds.map((_, i) => <View key={i} style={{ width: i === img ? 16 : 6, height: 6, borderRadius: 3, backgroundColor: i === img ? colors.cyan : 'rgba(255,255,255,0.4)' }} />)}
          </View>
        </View>
        <View style={{ padding: space.lg, gap: space.lg }}>
          <View style={{ gap: 8 }}>
            <View style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}>
              <Pill label={spot.verified ? 'Verified public location' : 'Unverified community suggestion'} color={spot.verified ? colors.success : colors.warning} icon={spot.verified ? 'shield-checkmark' : 'alert-circle'} />
              <Pill label={spotKindLabel[spot.kind]} color={colors.cyan} />
            </View>
            <T v="h1">{spot.name}</T>
            <T muted>{spot.summary}</T>
            <View style={{ flexDirection: 'row', gap: 14, alignItems: 'center' }}>
              <T v="title">★ {spot.rating}</T><T v="small" muted>{spot.ratingCount} ratings</T>
              {ap && <Tap onPress={() => router.push(`/airports/${ap.id}`)}><T v="smallMedium" color={colors.primary}>{ap.iata} community →</T></Tap>}
            </View>
          </View>
          {!spot.verified && <Notice icon="warning-outline" color={colors.warning} title="Not verified by AeroVerse" text="Community suggestions may be inaccurate. AeroVerse does not confirm public access rights. Never trespass or enter restricted areas." />}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <Button title="Check in" icon="location-outline" small style={{ flex: 1 }} onPress={() => { checkIn(id); if (checkins.length === 0) addXp(20, `Check-in · ${spot.name}`); showToast(shareCheckins ? 'Checked in · visible to others at airport level' : 'Checked in privately (sharing is off)'); }} />
            <Button title="Add photos" icon="camera-outline" small variant="secondary" style={{ flex: 1 }} onPress={() => router.push('/upload')} />
            <Button title="Review" icon="star-outline" small variant="secondary" style={{ flex: 1 }} onPress={() => setReviewOpen(true)} />
          </View>
          {checkins.length > 0 && <T v="caption" muted>You’ve checked in {checkins.length}× · last {timeAgo(checkins[0].at)} · {shareCheckins ? 'shared at airport level' : 'private'}</T>}

          <Card style={{ gap: 12 }}>
            <T v="overline" color={colors.cyan}>Location information</T>
            <InfoRow icon="eye-outline" label="Runway visibility" info={spot.runwayVisibility} />
            <InfoRow icon="car-outline" label="Parking" info={spot.parking} />
            <InfoRow icon="bus-outline" label="Public transport" info={spot.transport} />
            <View style={{ gap: 4 }}>
              <T v="smallMedium">Best for</T>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{spot.bestFor.map((b) => <Pill key={b} label={b} color={colors.silver} />)}</View>
            </View>
            <View style={{ gap: 4 }}>
              <T v="smallMedium">Facilities</T>
              <T v="small" muted>{spot.facilities.length ? spot.facilities.join(' · ') : 'None reported'}</T>
            </View>
            <T v="caption" dim>Position: {spot.lat.toFixed(4)}, {spot.lon.toFixed(4)} (approximate)</T>
          </Card>

          <Card style={{ gap: 6, borderColor: 'rgba(248,113,113,0.35)' }}>
            <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}><Ionicons name="shield-outline" size={18} color={colors.danger} /><T v="title">Safety & access</T></View>
            <T v="small" muted>{spot.safety}</T>
          </Card>

          <View style={{ gap: 8 }}>
            <T v="h3">Nearby aircraft activity</T>
            <T v="caption" color={colors.sim}>{flightProvider.mode === 'demo' ? 'Simulated demo traffic — not real positions.' : 'Live data'}</T>
            {nearby.length === 0 && <T muted>No aircraft within 80 km right now.</T>}
            {nearby.map(({ f, d }) => (
              <View key={f.id} style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <T v="small">{f.flightNumber} · {typeById[f.typeId]?.variant}</T>
                <T v="small" muted>{anyAirport(f.originId)?.iata}→{anyAirport(f.destinationId)?.iata} · {Math.round(d)} km · {f.altitudeFt.toLocaleString()} ft</T>
              </View>
            ))}
          </View>

          {recent.length > 0 && (
            <View style={{ gap: 8 }}>
              <T v="h3">Recent sightings here</T>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                {recent.map((p) => (
                  <Tap key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ width: 130 }}>
                    <Photo id={p.photoId} style={{ height: 90, borderRadius: 12 }} credit={false} />
                    <T v="caption" numberOfLines={1} style={{ marginTop: 4 }}>{typeById[p.typeId]?.variant}</T>
                  </Tap>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={{ gap: 8 }}>
            <T v="h3">Recently visited by</T>
            <T v="caption" muted>Only members who chose to share check-ins appear here, and only at airport level.</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              {spot.recentVisitorIds.map((u) => <Tap key={u} onPress={() => router.push(`/user/${u}`)}><Avatar userId={u} size={40} /></Tap>)}
              {shareCheckins && checkins.length > 0 && <Avatar userId="me" size={40} />}
            </View>
          </View>

          <View style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T v="h3">Reviews & comments</T>
              <Tap onPress={() => setReviewOpen(true)}><T v="smallMedium" color={colors.primary}>{myReview ? 'Edit yours' : 'Write a review'}</T></Tap>
            </View>
            {reviews.length === 0 && <T muted>No reviews yet.</T>}
            {reviews.map((r) => (
              <Card key={r.id} style={{ gap: 6 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Avatar userId={r.userId} size={28} />
                  <T v="smallMedium" style={{ flex: 1 }}>{r.userId === 'me' ? 'You' : `@${userById[r.userId]?.username}`}</T>
                  <T v="small" color={colors.sim}>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</T>
                </View>
                <T v="small">{r.text}</T>
                <T v="caption" dim>{timeAgo(r.createdAt)}</T>
              </Card>
            ))}
          </View>
          <Button title="Suggest a correction" icon="create-outline" variant="ghost" onPress={() => setCorrOpen(true)} />
          {spot.submittedBy && <T v="caption" dim center>Suggested by @{userById[spot.submittedBy]?.username ?? 'you'} · pending verification</T>}
        </View>
      </ScrollView>

      <Sheet visible={reviewOpen} onClose={() => setReviewOpen(false)} title="Rate this location">
        <View style={{ gap: space.md }}>
          <View style={{ flexDirection: 'row', gap: 8, justifyContent: 'center' }}>
            {[1, 2, 3, 4, 5].map((n) => <Tap key={n} onPress={() => setRating(n)} accessibilityLabel={`${n} stars`}><Ionicons name={n <= rating ? 'star' : 'star-outline'} size={34} color={colors.sim} /></Tap>)}
          </View>
          <Input placeholder="Views, light, access, tips…" value={text} onChangeText={setText} multiline />
          <Button title="Submit review" onPress={() => { if (!text.trim()) return showToast('Please write a short review', 'error'); addReview(id, rating, text.trim()); setReviewOpen(false); showToast('Thanks for your review!'); }} />
        </View>
      </Sheet>
      <Sheet visible={corrOpen} onClose={() => setCorrOpen(false)} title="Suggest a correction">
        <View style={{ gap: space.md }}>
          <T v="small" muted>Tell us what’s wrong — access changes, closures, parking, safety issues. Moderators review every report.</T>
          <Input placeholder="e.g. Car park now closes at 8pm" value={corr} onChangeText={setCorr} multiline />
          <Button title="Send to moderators" onPress={() => { if (!corr.trim()) return; suggestCorrection(id, corr.trim()); setCorr(''); setCorrOpen(false); showToast('Correction sent for review'); }} />
        </View>
      </Sheet>
    </View>
  );
}

function InfoRow({ icon, label, info }: { icon: string; label: string; info: { text: string; status: InfoStatus } }) {
  const m = statusMeta[info.status];
  return (
    <View style={{ flexDirection: 'row', gap: 10 }}>
      <Ionicons name={icon as never} size={18} color={colors.textMuted} style={{ marginTop: 2 }} />
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <T v="smallMedium">{label}</T>
          <Ionicons name={m.icon as never} size={13} color={m.color} />
          <T v="caption" color={m.color}>{m.label}</T>
        </View>
        <T v="small" muted>{info.text}</T>
      </View>
    </View>
  );
}
