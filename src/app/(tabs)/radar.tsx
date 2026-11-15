import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useIsFocused } from 'expo-router';
import Svg, { Circle, Defs, G, Path, RadialGradient, Stop, Text as SvgText } from 'react-native-svg';
import * as Location from 'expo-location';
import { colors, fonts, radius, space } from '@/theme/tokens';
import type { Flight } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Chip, IconButton, Notice, Tap } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/Screen';
import { Photo, SimBadge } from '@/components/aviation';
import { GeoMap, MapApi } from '@/components/map/GeoMap';
import { AIRCRAFT_PATH } from '@/components/brand/Logo';
import { flightProvider, greatCirclePath, haversineKm } from '@/services/flight';
import { airlineById, airports, anyAirport, typeById, typeLabel, manufacturerById, aircraftTypes } from '@/data/catalog';
import { useApp } from '@/store/useApp';

type Filters = { airlines: string[]; manufacturers: string[]; families: string[]; minAlt: number; status: string[] };
const EMPTY: Filters = { airlines: [], manufacturers: [], families: [], minAlt: 0, status: [] };

export default function Radar() {
  const insets = useSafeAreaInsets();
  const focused = useIsFocused();
  const profile = useApp((s) => s.profile);
  const tracked = useApp((s) => s.trackedFlights);
  const followedTypes = useApp((s) => s.followedTypes);
  const home = airports.find((a) => a.id === profile?.homeAirportId) ?? airports[0];
  const map = useRef<MapApi>(null);
  const [flights, setFlights] = useState<Flight[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [filterOpen, setFilterOpen] = useState(false);
  const [nearbyOpen, setNearbyOpen] = useState(false);
  const [center, setCenter] = useState({ lat: home.lat, lon: home.lon, label: home.iata });
  const sweep = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!focused) return;
    return flightProvider.subscribe({}, setFlights);
  }, [focused]);
  useEffect(() => {
    const l = Animated.loop(Animated.timing(sweep, { toValue: 1, duration: 4000, easing: Easing.linear, useNativeDriver: true }));
    l.start();
    return () => l.stop();
  }, [sweep]);

  const visible = useMemo(() => flights.filter((f) => {
    const t = typeById[f.typeId];
    if (filters.airlines.length && !filters.airlines.includes(f.airlineId)) return false;
    if (filters.manufacturers.length && !filters.manufacturers.includes(t?.manufacturerId)) return false;
    if (filters.families.length && !filters.families.includes(t?.family)) return false;
    if (f.altitudeFt < filters.minAlt) return false;
    if (filters.status.length && !filters.status.includes(f.status)) return false;
    return true;
  }), [flights, filters]);

  const sel = flights.find((f) => f.id === selected);
  const activeFilters = filters.airlines.length + filters.manufacturers.length + filters.families.length + filters.status.length + (filters.minAlt ? 1 : 0);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return { flights: [] as Flight[], airports: [] as typeof airports };
    return {
      flights: flights.filter((f) => [f.flightNumber, f.callsign, f.registration ?? '', typeLabel(f.typeId), airlineById[f.airlineId]?.name ?? ''].some((s) => s.toLowerCase().includes(q))).slice(0, 8),
      airports: airports.filter((a) => `${a.iata} ${a.id} ${a.name} ${a.city}`.toLowerCase().includes(q)).slice(0, 4),
    };
  }, [query, flights]);

  const nearby = useMemo(() => flights.map((f) => ({ f, d: haversineKm(center.lat, center.lon, f.lat, f.lon) })).filter((x) => x.d < 400).sort((a, b) => a.d - b.d).slice(0, 15), [flights, center]);

  const selectFlight = (f: Flight, fly = true) => {
    setSelected(f.id);
    setSearching(false);
    setQuery('');
    if (fly) map.current?.flyTo(f.lat, f.lon, Math.max(map.current.getZoom(), 6));
  };
  const centerOn = (lat: number, lon: number, label: string, zoom = 8) => {
    setCenter({ lat, lon, label });
    map.current?.flyTo(lat, lon, zoom);
  };
  const useMyLocation = async () => {
    try {
      const r = await Location.requestForegroundPermissionsAsync();
      if (!r.granted) return useApp.getState().showToast('Location not allowed — using your home airport', 'info');
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      centerOn(pos.coords.latitude, pos.coords.longitude, 'You', 8);
      useApp.getState().showToast('Centred on your location (kept on this device)', 'info');
    } catch {
      useApp.getState().showToast('Couldn’t get your location', 'error');
    }
  };

  const rot = sweep.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <GeoMap
        apiRef={map}
        style={StyleSheet.absoluteFill}
        initial={{ lat: home.lat - 1.5, lon: home.lon + 1, zoom: 5.3 }}
        minZoom={1.5}
        maxZoom={11}
        renderSvg={(vp, toScreen) => {
          const zoom = Math.log2(vp.k);
          return (
            <G>
              {/* range rings around the centre point */}
              {(() => {
                const c = toScreen(center.lat, center.lon);
                const pxPerKm = vp.k * 256 / (40075 * Math.cos((center.lat * Math.PI) / 180));
                return [50, 100, 200].map((km) => (
                  <G key={km}>
                    <Circle cx={c.x} cy={c.y} r={km * pxPerKm} stroke={colors.cyan} strokeOpacity={0.18} strokeDasharray="4 6" fill="none" />
                    {km * pxPerKm > 40 && <SvgText x={c.x + km * pxPerKm * 0.71 + 4} y={c.y - km * pxPerKm * 0.71} fill={colors.cyan} fillOpacity={0.5} fontSize={9} fontFamily={fonts.mono}>{km} km</SvgText>}
                  </G>
                ));
              })()}
              {/* airports */}
              {airports.map((a) => {
                const p = toScreen(a.lat, a.lon);
                if (p.x < -20 || p.y < -20 || p.x > vp.w + 20 || p.y > vp.h + 20) return null;
                return (
                  <G key={a.id}>
                    <Circle cx={p.x} cy={p.y} r={3.5} fill={colors.bg} stroke={colors.silver} strokeWidth={1.4} />
                    {zoom > 4 && <SvgText x={p.x + 6} y={p.y + 3} fill={colors.silver} fontSize={10} fontFamily={fonts.mono}>{a.iata}</SvgText>}
                  </G>
                );
              })}
              {/* selected route */}
              {sel && (() => {
                const o = anyAirport(sel.originId)!, d = anyAirport(sel.destinationId)!;
                const pts = greatCirclePath(o.lat, o.lon, d.lat, d.lon, 64).map((pt) => toScreen(pt.lat, pt.lon));
                const split = Math.round(sel.progress * 64);
                const toD = (arr: { x: number; y: number }[]) => arr.map((p, i) => `${i ? 'L' : 'M'}${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join('');
                const po = toScreen(o.lat, o.lon), pd = toScreen(d.lat, d.lon);
                return (
                  <G>
                    <Path d={toD(pts.slice(0, split + 1))} stroke={colors.cyan} strokeWidth={2.2} fill="none" />
                    <Path d={toD(pts.slice(split))} stroke={colors.cyan} strokeOpacity={0.6} strokeDasharray="5 6" strokeWidth={1.6} fill="none" />
                    <Circle cx={po.x} cy={po.y} r={5} fill={colors.cyan} />
                    <Circle cx={pd.x} cy={pd.y} r={5} fill="none" stroke={colors.cyan} strokeWidth={2} />
                    <SvgText x={po.x + 8} y={po.y - 6} fill={colors.text} fontSize={11} fontFamily={fonts.mono}>{o.iata}</SvgText>
                    <SvgText x={pd.x + 8} y={pd.y - 6} fill={colors.text} fontSize={11} fontFamily={fonts.mono}>{d.iata}</SvgText>
                  </G>
                );
              })()}
            </G>
          );
        }}
        renderMarkers={(vp, toScreen) => {
          const zoom = Math.log2(vp.k);
          return visible.map((f) => {
            const p = toScreen(f.lat, f.lon);
            if (p.x < -20 || p.y < -20 || p.x > vp.w + 20 || p.y > vp.h + 20) return null;
            const isSel = f.id === selected;
            const isTracked = tracked.includes(f.id) || followedTypes.includes(f.typeId);
            const size = isSel ? 30 : zoom > 6 ? 22 : 18;
            const fill = isSel ? colors.cyan : isTracked ? colors.sim : f.status === 'approach' || f.status === 'descending' ? '#8FB8FF' : '#E6EEF9';
            return (
              <Tap key={f.id} haptics={false} onPress={() => selectFlight(f, false)} accessibilityLabel={`Flight ${f.flightNumber}, ${typeLabel(f.typeId)}`} style={{ position: 'absolute', left: p.x - size / 2, top: p.y - size / 2, width: size, height: size, alignItems: 'center', justifyContent: 'center' }} hitSlop={8}>
                <View style={{ transform: [{ rotate: `${f.heading}deg` }] }}>
                  <Svg width={size} height={size} viewBox="0 0 100 100">
                    <Path d={AIRCRAFT_PATH} fill={fill} stroke={isSel ? '#fff' : colors.bg} strokeWidth={4} />
                  </Svg>
                </View>
                {(zoom > 6.5 || isSel) && (
                  <View style={styles.label} pointerEvents="none">
                    <T style={{ fontFamily: fonts.mono, fontSize: 9, color: colors.text }}>{f.flightNumber}</T>
                  </View>
                )}
              </Tap>
            );
          });
        }}
      />

      {/* sweep overlay */}
      <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', transform: [{ rotate: rot }] }]}>
        <Svg width={1400} height={1400} viewBox="-700 -700 1400 1400">
          <Defs>
            <RadialGradient id="rsw" cx="0" cy="0" r="700" gradientUnits="userSpaceOnUse">
              <Stop offset="0" stopColor={colors.cyan} stopOpacity="0.0" />
              <Stop offset="1" stopColor={colors.cyan} stopOpacity="0.10" />
            </RadialGradient>
          </Defs>
          <Path d="M0 0 L0 -700 A700 700 0 0 1 350 -606 Z" fill="url(#rsw)" />
          <Path d="M0 0 L350 -606" stroke={colors.cyan} strokeOpacity={0.25} strokeWidth={1} />
        </Svg>
      </Animated.View>

      {/* top bar */}
      <View style={[styles.top, { paddingTop: insets.top + 8 }]}>
        <View style={styles.search}>
          <Ionicons name="search" size={18} color={colors.textDim} />
          <TextInput
            value={query}
            onChangeText={(t) => { setQuery(t); setSearching(true); }}
            onFocus={() => setSearching(true)}
            placeholder="Flight, registration, type or airport"
            placeholderTextColor={colors.textDim}
            style={{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 }}
            accessibilityLabel="Search flights"
            autoCapitalize="characters"
          />
          {!!query && <Tap onPress={() => { setQuery(''); setSearching(false); }} accessibilityLabel="Clear search"><Ionicons name="close-circle" size={18} color={colors.textDim} /></Tap>}
        </View>
        <IconButton icon="options-outline" accessibilityLabel="Filters" badge={activeFilters || undefined} onPress={() => setFilterOpen(true)} size={46} />
      </View>
      <View style={[styles.simBar, { top: insets.top + 66 }]}>
        <SimBadge label={flightProvider.mode === 'demo' ? 'DEMO · SIMULATED TRAFFIC' : 'LIVE'} />
        <T v="caption" muted>{visible.length} aircraft{flightProvider.mode === 'demo' ? ' · not real positions' : ''}</T>
      </View>

      {searching && !!query && (
        <View style={[styles.results, { top: insets.top + 64 }]}>
          <ScrollView keyboardShouldPersistTaps="handled" style={{ maxHeight: 360 }}>
            {results.airports.map((a) => (
              <Tap key={a.id} onPress={() => { setSearching(false); setQuery(''); centerOn(a.lat, a.lon, a.iata, 8); }} style={styles.resultRow}>
                <Ionicons name="business-outline" size={18} color={colors.cyan} />
                <View style={{ flex: 1 }}><T v="bodyMedium">{a.name}</T><T v="small" muted>{a.iata} · Centre radar here</T></View>
              </Tap>
            ))}
            {results.flights.map((f) => (
              <Tap key={f.id} onPress={() => selectFlight(f)} style={styles.resultRow}>
                <Ionicons name="airplane" size={18} color={colors.cyan} />
                <View style={{ flex: 1 }}>
                  <T v="bodyMedium">{f.flightNumber} · {typeById[f.typeId]?.variant}</T>
                  <T v="small" muted>{airlineById[f.airlineId]?.name ?? 'Other operator'} · {anyAirport(f.originId)?.iata} → {anyAirport(f.destinationId)?.iata}{f.registration ? ` · ${f.registration}` : ''}</T>
                </View>
              </Tap>
            ))}
            {!results.airports.length && !results.flights.length && <T muted style={{ padding: space.lg }}>No aircraft or airports match “{query}”.</T>}
          </ScrollView>
        </View>
      )}

      {/* map controls */}
      <View style={[styles.controls, { bottom: (sel ? 300 : 110) + insets.bottom }]}>
        <IconButton icon="add" accessibilityLabel="Zoom in" onPress={() => map.current?.zoomBy(2)} size={42} />
        <IconButton icon="remove" accessibilityLabel="Zoom out" onPress={() => map.current?.zoomBy(0.5)} size={42} />
        <IconButton icon="home-outline" accessibilityLabel={`Centre on ${home.iata}`} onPress={() => centerOn(home.lat, home.lon, home.iata, 8)} size={42} />
        <IconButton icon="locate-outline" accessibilityLabel="Use my location" onPress={useMyLocation} size={42} />
        <IconButton icon="list-outline" accessibilityLabel="Nearby aircraft" onPress={() => setNearbyOpen(true)} size={42} />
      </View>

      {sel && <FlightPanel f={sel} onClose={() => setSelected(null)} bottom={insets.bottom + 86} />}

      <FilterSheet open={filterOpen} onClose={() => setFilterOpen(false)} filters={filters} setFilters={setFilters} />
      <Sheet visible={nearbyOpen} onClose={() => setNearbyOpen(false)} title={`Nearby ${center.label}`}>
        <T v="small" muted style={{ marginBottom: space.md }}>Within 400 km, closest first. {flightProvider.mode === 'demo' ? 'Simulated positions.' : ''}</T>
        {nearby.length === 0 && <T muted>No aircraft nearby right now.</T>}
        {nearby.map(({ f, d }) => (
          <Tap key={f.id} onPress={() => { setNearbyOpen(false); selectFlight(f); }} style={styles.resultRow}>
            <View style={{ width: 54 }}><T v="data">{Math.round(d)}<T v="caption" muted> km</T></T></View>
            <View style={{ flex: 1 }}>
              <T v="bodyMedium">{f.flightNumber} · {typeById[f.typeId]?.variant}</T>
              <T v="small" muted>{anyAirport(f.originId)?.iata} → {anyAirport(f.destinationId)?.iata} · {f.altitudeFt.toLocaleString()} ft · {f.status}</T>
            </View>
          </Tap>
        ))}
      </Sheet>
    </View>
  );
}

function FlightPanel({ f, onClose, bottom }: { f: Flight; onClose: () => void; bottom: number }) {
  const tracked = useApp((s) => s.trackedFlights.includes(f.id));
  const followType = useApp((s) => s.followedTypes.includes(f.typeId));
  const wanted = useApp((s) => s.wishlist.includes(f.typeId));
  const t = typeById[f.typeId];
  const al = airlineById[f.airlineId];
  const o = anyAirport(f.originId), d = anyAirport(f.destinationId);
  const { toggleTrackFlight, toggleFollowType, toggleWishlist, showToast } = useApp.getState();
  return (
    <View style={[styles.panel, { bottom }]}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Photo id={t?.photoId} style={{ width: 92, height: 70, borderRadius: 12 }} credit={false} />
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <T v="h3">{f.flightNumber}</T>
            <T v="caption" muted style={{ fontFamily: fonts.mono }}>{f.callsign}</T>
          </View>
          <T v="small" muted numberOfLines={1}>{al?.name ?? 'Other operator'} · {t ? `${manufacturerById[t.manufacturerId]?.name} ${t.variant}` : f.typeId}</T>
          <T v="small" color={colors.silver} style={{ fontFamily: fonts.mono }}>{f.registration ?? 'Registration not available'}{f.simulated && f.registration ? ' (sample)' : ''}</T>
        </View>
        <IconButton icon="close" size={32} accessibilityLabel="Close flight panel" onPress={onClose} />
      </View>
      <View style={styles.route}>
        <View style={{ alignItems: 'flex-start' }}><T v="dataLarge">{o?.iata}</T><T v="caption" muted>{o?.city}</T></View>
        <View style={{ flex: 1, paddingHorizontal: 10 }}>
          <View style={{ height: 2, backgroundColor: colors.surface3, borderRadius: 1 }}>
            <View style={{ width: `${f.progress * 100}%`, height: 2, backgroundColor: colors.cyan }} />
          </View>
          <T v="caption" muted center style={{ marginTop: 4 }}>{Math.round(f.progress * 100)}% · {f.status}</T>
        </View>
        <View style={{ alignItems: 'flex-end' }}><T v="dataLarge">{d?.iata}</T><T v="caption" muted>{d?.city}</T></View>
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.md }}>
        {[['Altitude', `${f.altitudeFt.toLocaleString()} ft`], ['Speed', `${f.groundSpeedKt} kt`], ['Heading', `${f.heading}°`]].map(([k, v]) => (
          <View key={k}><T v="caption" muted>{k}</T><T v="data">{v}</T></View>
        ))}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        <Chip icon={tracked ? 'eye' : 'eye-outline'} label={tracked ? 'Tracking' : 'Track flight'} active={tracked} onPress={() => { toggleTrackFlight(f.id); showToast(tracked ? 'Stopped tracking' : `Tracking ${f.flightNumber}`, 'info'); }} />
        <Chip icon={wanted ? 'star' : 'star-outline'} label={wanted ? 'Wanted' : 'Save to wanted list'} active={wanted} onPress={() => { toggleWishlist(f.typeId); showToast(wanted ? 'Removed from wanted list' : `${t?.variant} added to wanted list`); }} />
        <Chip icon={followType ? 'notifications' : 'notifications-outline'} label={followType ? `Following ${t?.family}` : `Follow ${t?.family} type`} active={followType} onPress={() => { toggleFollowType(f.typeId); showToast(followType ? 'Type alerts off' : `You’ll get alerts for ${t?.variant}`); }} />
        <Chip icon="information-circle-outline" label="Aircraft info" onPress={() => router.push(`/aircraft/${f.typeId}`)} />
      </ScrollView>
      {f.simulated && <T v="caption" color={colors.sim} style={{ marginTop: 10 }}>Simulated demo flight — position, timing and registration are illustrative.</T>}
    </View>
  );
}

function FilterSheet({ open, onClose, filters, setFilters }: { open: boolean; onClose: () => void; filters: Filters; setFilters: (f: Filters) => void }) {
  const toggle = (k: 'airlines' | 'manufacturers' | 'families' | 'status', v: string) => setFilters({ ...filters, [k]: filters[k].includes(v) ? filters[k].filter((x) => x !== v) : [...filters[k], v] });
  const fams = Array.from(new Set(aircraftTypes.filter((t) => t.category !== 'military' && t.category !== 'historic').map((t) => t.family)));
  const al = ['ek', 'ba', 'qr', 'vs', 'sq', 'lh', 'kl', 'ls', 'u2', 'fr', 'cv', 'lm', 'fi'];
  return (
    <Sheet visible={open} onClose={onClose} title="Filter radar">
      <View style={{ gap: space.lg }}>
        <Notice icon="shield-outline" color={colors.cyan} text="Military and privacy-blocked aircraft are never shown on AeroVerse radar." />
        <View style={{ gap: 8 }}>
          <T v="title">Airline</T>
          <View style={styles.wrap}>{al.map((a) => <Chip key={a} small label={airlineById[a].name} active={filters.airlines.includes(a)} onPress={() => toggle('airlines', a)} />)}</View>
        </View>
        <View style={{ gap: 8 }}>
          <T v="title">Manufacturer</T>
          <View style={styles.wrap}>{['airbus', 'boeing', 'embraer', 'atr'].map((m) => <Chip key={m} small label={manufacturerById[m].name} active={filters.manufacturers.includes(m)} onPress={() => toggle('manufacturers', m)} />)}</View>
        </View>
        <View style={{ gap: 8 }}>
          <T v="title">Aircraft family</T>
          <View style={styles.wrap}>{fams.map((f) => <Chip key={f} small label={f} active={filters.families.includes(f)} onPress={() => toggle('families', f)} />)}</View>
        </View>
        <View style={{ gap: 8 }}>
          <T v="title">Flight phase</T>
          <View style={styles.wrap}>{['climbing', 'cruising', 'descending', 'approach'].map((s) => <Chip key={s} small label={s} active={filters.status.includes(s)} onPress={() => toggle('status', s)} />)}</View>
        </View>
        <View style={{ gap: 8 }}>
          <T v="title">Minimum altitude</T>
          <View style={styles.wrap}>{[0, 10000, 30000].map((a) => <Chip key={a} small label={a ? `${a / 1000}k ft+` : 'Any'} active={filters.minAlt === a} onPress={() => setFilters({ ...filters, minAlt: a })} />)}</View>
        </View>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Button title="Reset" variant="secondary" onPress={() => setFilters(EMPTY)} style={{ flex: 1 }} />
          <Button title="Apply" onPress={onClose} style={{ flex: 1 }} />
        </View>
      </View>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  top: { position: 'absolute', left: 0, right: 0, top: 0, flexDirection: 'row', gap: 8, paddingHorizontal: space.lg, alignItems: 'center' },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 10, height: 46, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: 'rgba(12,19,34,0.92)', borderWidth: 1, borderColor: colors.borderStrong },
  simBar: { position: 'absolute', left: space.lg, flexDirection: 'row', alignItems: 'center', gap: 8 },
  results: { position: 'absolute', left: space.lg, right: space.lg, backgroundColor: colors.bgElevated, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.borderStrong, overflow: 'hidden', zIndex: 20 },
  resultRow: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 14, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  controls: { position: 'absolute', right: space.lg, gap: 8 },
  label: { position: 'absolute', top: '100%', backgroundColor: 'rgba(5,8,15,0.8)', paddingHorizontal: 4, borderRadius: 4, marginTop: 1 },
  panel: { position: 'absolute', left: space.md, right: space.md, padding: space.lg, borderRadius: radius.xl, backgroundColor: 'rgba(8,13,24,0.97)', borderWidth: 1, borderColor: colors.borderStrong, maxWidth: 620, alignSelf: 'center' },
  route: { flexDirection: 'row', alignItems: 'center', marginVertical: space.md },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
});
