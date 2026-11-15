import React, { useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import type { SpotKind } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Chip, Input, Notice, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { GeoMap, MapApi, unproject } from '@/components/map/GeoMap';
import { airportById, airports } from '@/data/catalog';
import { spotKindLabel } from '@/data/spots';
import { useApp } from '@/store/useApp';

const KINDS: SpotKind[] = ['public_spot', 'photo_position', 'observation_deck', 'museum', 'airshow', 'community'];

export default function AddSpot() {
  const params = useLocalSearchParams<{ airport?: string }>();
  const home = useApp((s) => s.profile?.homeAirportId) ?? 'EGCC';
  const [airportId, setAirportId] = useState(params.airport ?? home);
  const ap = airportById[airportId];
  const [name, setName] = useState('');
  const [kind, setKind] = useState<SpotKind>('public_spot');
  const [desc, setDesc] = useState('');
  const [legal, setLegal] = useState(false);
  const [pos, setPos] = useState({ lat: ap.lat, lon: ap.lon });
  const [error, setError] = useState<string>();
  const map = useRef<MapApi>(null);

  const submit = () => {
    if (name.trim().length < 4) return setError('Give the location a descriptive name.');
    if (!legal) return setError('Please confirm this location is publicly accessible.');
    const id = `s_user_${Date.now().toString(36)}`;
    useApp.getState().addSpot({
      id, name: name.trim(), kind: 'community', airportId, lat: pos.lat, lon: pos.lon, verified: false, summary: desc.trim() || `${spotKindLabel[kind]} suggested by the community.`,
      photoIds: [ap.photoId], rating: 0, ratingCount: 0, bestFor: [spotKindLabel[kind]],
      runwayVisibility: { text: 'Not yet verified.', status: 'unknown' }, parking: { text: 'Not yet verified.', status: 'unknown' }, transport: { text: 'Not yet verified.', status: 'unknown' },
      facilities: [], safety: 'Stay on public land and follow signage. Never enter airside or restricted areas.', reviews: [], recentVisitorIds: [], submittedBy: 'me',
    });
    useApp.getState().addXp(40, `Community contribution · ${name.trim()}`);
    useApp.getState().showToast('Thanks! Your suggestion is live as “unverified” while moderators review it.');
    router.replace(`/spotting/${id}`);
  };

  return (
    <Screen keyboard header={<Header title="Suggest a location" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Notice icon="shield-outline" color={colors.cyan} text="Only suggest places on public land with legal access. New suggestions are labelled “unverified” until moderators review them." />
        <View style={{ gap: 8 }}>
          <T v="title">Airport</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
            {airports.map((a) => <Chip key={a.id} small label={a.iata} active={a.id === airportId} onPress={() => { setAirportId(a.id); setPos({ lat: a.lat, lon: a.lon }); map.current?.flyTo(a.lat, a.lon, 12); }} />)}
          </ScrollView>
        </View>
        <View style={{ gap: 6 }}>
          <T v="title">Position</T>
          <T v="caption" muted>Drag the map so the crosshair sits on the location.</T>
          <View style={{ height: 240, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.borderStrong }}>
            <GeoMap apiRef={map} style={StyleSheet.absoluteFill} initial={{ lat: ap.lat, lon: ap.lon, zoom: 12 }} minZoom={4} maxZoom={15} onViewportChange={(vp) => { const p = unproject(vp.cx, vp.cy); setPos({ lat: p.lat, lon: p.lon }); }} />
            <View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
              <Ionicons name="add" size={36} color={colors.cyan} />
            </View>
          </View>
          <T v="caption" dim>{pos.lat.toFixed(4)}, {pos.lon.toFixed(4)}</T>
        </View>
        <Input label="Name" placeholder="e.g. Footpath by the 23R approach" value={name} onChangeText={setName} />
        <View style={{ gap: 8 }}>
          <T v="title">Type</T>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{KINDS.map((k) => <Chip key={k} small label={spotKindLabel[k]} active={kind === k} onPress={() => setKind(k)} />)}</View>
        </View>
        <Input label="Description" placeholder="What can you see? Parking, transport, best light…" value={desc} onChangeText={setDesc} multiline />
        <Tap onPress={() => setLegal(!legal)} style={{ flexDirection: 'row', gap: 10 }} accessibilityRole="checkbox" accessibilityState={{ checked: legal }}>
          <Ionicons name={legal ? 'checkbox' : 'square-outline'} size={22} color={legal ? colors.primary : colors.textMuted} />
          <T v="small" muted style={{ flex: 1 }}>I confirm this location is publicly and legally accessible, and that visiting it does not require trespassing or entering restricted areas.</T>
        </Tap>
        {error && <T v="small" color={colors.danger}>{error}</T>}
        <Button title="Submit suggestion" icon="send" onPress={submit} />
      </View>
    </Screen>
  );
}
