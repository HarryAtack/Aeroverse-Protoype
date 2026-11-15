import React, { useMemo, useRef, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { G, Line, Text as SvgText } from 'react-native-svg';
import { colors, fonts, radius, space } from '@/theme/tokens';
import type { SpotKind, SpottingLocation } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Chip, IconButton, Tap } from '@/components/ui/primitives';
import { goBack } from '@/components/ui/Screen';
import { Photo } from '@/components/aviation';
import { GeoMap, MapApi } from '@/components/map/GeoMap';
import { spots, spotKindLabel, kindIcon } from '@/data/spots';
import { runwayLines } from '@/data/runways';
import { airportById, airports } from '@/data/catalog';
import { useApp } from '@/store/useApp';


export default function SpottingMap() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ airport?: string }>();
  const profile = useApp((s) => s.profile);
  const added = useApp((s) => s.addedSpots);
  const saved = useApp((s) => s.savedSpots);
  const startAp = airportById[params.airport ?? profile?.homeAirportId ?? 'EGCC'] ?? airportById.EGCC;
  const map = useRef<MapApi>(null);
  const [kinds, setKinds] = useState<SpotKind[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [savedOnly, setSavedOnly] = useState(false);
  const [sel, setSel] = useState<SpottingLocation | null>(null);
  const all = useMemo(() => [...spots, ...added], [added]);
  const list = all.filter((s) => (!kinds.length || kinds.includes(s.kind)) && (!verifiedOnly || s.verified) && (!savedOnly || saved.includes(s.id)));

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GeoMap
        apiRef={map}
        style={StyleSheet.absoluteFill}
        initial={{ lat: startAp.lat, lon: startAp.lon, zoom: 12 }}
        minZoom={3}
        maxZoom={15}
        landColor="#13213A"
        waterColor="#0A1424"
        renderSvg={(vp, toScreen) => {
          const z = Math.log2(vp.k);
          if (z < 9) return null;
          return (
            <G>
              {Object.entries(runwayLines).map(([ap, lines]) => lines.map(([a, b, c, d, label]) => {
                const p1 = toScreen(a, b), p2 = toScreen(c, d);
                const w = Math.max(2, Math.min(14, vp.k / 900));
                return (
                  <G key={ap + label}>
                    <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#2A3B57" strokeWidth={w + 6} strokeLinecap="butt" />
                    <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#4A5F80" strokeWidth={w} strokeLinecap="butt" />
                    {z > 11 && <Line x1={p1.x} y1={p1.y} x2={p2.x} y2={p2.y} stroke="#E6EEF9" strokeOpacity={0.7} strokeWidth={1} strokeDasharray="8 8" />}
                    {z > 11 && <SvgText x={(p1.x + p2.x) / 2 + 10} y={(p1.y + p2.y) / 2 - 8} fill={colors.silver} fontSize={10} fontFamily={fonts.mono}>{label}</SvgText>}
                  </G>
                );
              }))}
            </G>
          );
        }}
        renderMarkers={(vp, toScreen) => {
          const z = Math.log2(vp.k);
          return (
            <>
              {z < 9 && airports.map((a) => {
                const p = toScreen(a.lat, a.lon);
                return (
                  <Tap key={a.id} onPress={() => map.current?.flyTo(a.lat, a.lon, 12)} style={{ position: 'absolute', left: p.x - 22, top: p.y - 12, width: 44, alignItems: 'center' }} accessibilityLabel={`Zoom to ${a.name}`}>
                    <View style={styles.apDot} />
                    <T v="caption" style={{ fontFamily: fonts.mono }}>{a.iata}</T>
                  </Tap>
                );
              })}
              {list.map((s) => {
                const p = toScreen(s.lat, s.lon);
                if (p.x < -30 || p.y < -30 || p.x > vp.w + 30 || p.y > vp.h + 30) return null;
                const c = s.verified ? colors.success : colors.warning;
                const active = sel?.id === s.id;
                return (
                  <Tap key={s.id} onPress={() => setSel(s)} style={{ position: 'absolute', left: p.x - 18, top: p.y - 40, alignItems: 'center' }} accessibilityLabel={`${s.name}, ${s.verified ? 'verified' : 'unverified'}`}>
                    <View style={[styles.pin, { borderColor: c, backgroundColor: active ? c : colors.bgElevated, transform: [{ scale: active ? 1.15 : 1 }] }]}>
                      <Ionicons name={kindIcon[s.kind] as never} size={16} color={active ? colors.bg : c} />
                    </View>
                    <View style={[styles.pinTail, { borderTopColor: c }]} />
                  </Tap>
                );
              })}
            </>
          );
        }}
      />

      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack('/explore')} />
          <View style={{ flex: 1 }}>
            <T v="h3">Spotting map</T>
            <T v="caption" muted>{list.length} locations · illustrative positions</T>
          </View>
          <IconButton icon="add" accessibilityLabel="Add a spotting location" onPress={() => router.push('/spotting/add')} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 10 }}>
          <Chip small icon="shield-checkmark-outline" label="Verified only" active={verifiedOnly} onPress={() => setVerifiedOnly(!verifiedOnly)} />
          <Chip small icon="bookmark-outline" label="Saved" active={savedOnly} onPress={() => setSavedOnly(!savedOnly)} />
          {(Object.keys(spotKindLabel) as SpotKind[]).map((k) => <Chip key={k} small label={spotKindLabel[k]} active={kinds.includes(k)} onPress={() => setKinds(kinds.includes(k) ? kinds.filter((x) => x !== k) : [...kinds, k])} />)}
        </ScrollView>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingTop: 8 }}>
          {airports.map((a) => <Chip key={a.id} small label={a.iata} onPress={() => map.current?.flyTo(a.lat, a.lon, 12)} />)}
          <Chip small label="UK overview" onPress={() => map.current?.flyTo(53, -2, 6)} />
        </ScrollView>
      </View>

      <View style={[styles.legend, { bottom: (sel ? 230 : 30) + insets.bottom }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={[styles.dot, { backgroundColor: colors.success }]} /><T v="caption">Verified / official</T></View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><View style={[styles.dot, { backgroundColor: colors.warning }]} /><T v="caption">Unverified suggestion</T></View>
      </View>
      <View style={[styles.zoom, { bottom: (sel ? 230 : 30) + insets.bottom }]}>
        <IconButton icon="add" accessibilityLabel="Zoom in" onPress={() => map.current?.zoomBy(2)} />
        <IconButton icon="remove" accessibilityLabel="Zoom out" onPress={() => map.current?.zoomBy(0.5)} />
      </View>

      {sel && (
        <Tap onPress={() => router.push(`/spotting/${sel.id}`)} style={[styles.preview, { bottom: insets.bottom + 16 }]} accessibilityLabel={`Open ${sel.name}`}>
          <Photo id={sel.photoIds[0]} style={{ width: 96, height: 96, borderRadius: 14 }} credit={false} />
          <View style={{ flex: 1, gap: 4 }}>
            <T v="caption" color={sel.verified ? colors.success : colors.warning}>{sel.verified ? '✓ VERIFIED · ' : '⚠ UNVERIFIED · '}{spotKindLabel[sel.kind].toUpperCase()}</T>
            <T v="title" numberOfLines={2}>{sel.name}</T>
            <T v="small" muted numberOfLines={2}>{sel.summary}</T>
            <T v="smallMedium">★ {sel.rating} <T v="caption" muted>({sel.ratingCount})</T></T>
          </View>
          <Tap onPress={() => setSel(null)} hitSlop={10} accessibilityLabel="Close preview"><Ionicons name="close" size={20} color={colors.textMuted} /></Tap>
        </Tap>
      )}
      {!sel && list.length === 0 && (
        <View style={[styles.preview, { bottom: insets.bottom + 16, flexDirection: 'column', alignItems: 'stretch' }]}>
          <T v="title">No locations match these filters</T>
          <Button title="Clear filters" small variant="secondary" onPress={() => { setKinds([]); setVerifiedOnly(false); setSavedOnly(false); }} />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 0, right: 0, top: 0, paddingHorizontal: space.lg, paddingBottom: 10, backgroundColor: 'rgba(5,8,15,0.88)' },
  pin: { width: 36, height: 36, borderRadius: 18, borderWidth: 2, alignItems: 'center', justifyContent: 'center' },
  pinTail: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 8, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -1 },
  apDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.primary, borderWidth: 2, borderColor: '#fff' },
  legend: { position: 'absolute', left: space.lg, gap: 4, padding: 10, borderRadius: radius.md, backgroundColor: 'rgba(8,13,24,0.9)', borderWidth: 1, borderColor: colors.border },
  zoom: { position: 'absolute', right: space.lg, gap: 8 },
  dot: { width: 10, height: 10, borderRadius: 5 },
  preview: { position: 'absolute', left: space.md, right: space.md, flexDirection: 'row', gap: 12, padding: 12, borderRadius: radius.xl, backgroundColor: 'rgba(8,13,24,0.97)', borderWidth: 1, borderColor: colors.borderStrong, alignItems: 'center', maxWidth: 620, alignSelf: 'center' },
});
