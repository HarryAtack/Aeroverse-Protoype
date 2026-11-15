import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Chip, EmptyState, IconButton, Tap } from '@/components/ui/primitives';
import { goBack } from '@/components/ui/Screen';
import { Avatar, Photo } from '@/components/aviation';
import { aircraftTypes, airlines, airports, manufacturers, registrations, typeById, airlineById, manufacturerById } from '@/data/catalog';
import { demoUsers } from '@/data/users';
import { spots } from '@/data/spots';
import { cards, challenges } from '@/data/community';
import { flightProvider } from '@/services/flight';
import type { Flight } from '@/types/domain';

type Cat = 'all' | 'aircraft' | 'registrations' | 'manufacturers' | 'airlines' | 'airports' | 'flights' | 'people' | 'spots' | 'cards' | 'challenges';
const CATS: { key: Cat; label: string }[] = [
  { key: 'all', label: 'All' }, { key: 'aircraft', label: 'Aircraft types' }, { key: 'registrations', label: 'Registrations' }, { key: 'manufacturers', label: 'Manufacturers' }, { key: 'airlines', label: 'Airlines' },
  { key: 'airports', label: 'Airports' }, { key: 'flights', label: 'Flights' }, { key: 'people', label: 'Users & photographers' }, { key: 'spots', label: 'Spotting locations' }, { key: 'cards', label: 'Cards' }, { key: 'challenges', label: 'Challenges' },
];
const RECENT = ['A380', 'G-XWBD', 'Manchester', 'skyline_sam', 'BA117'];

export default function Search() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [cat, setCat] = useState<Cat>('all');
  const [flights, setFlights] = useState<Flight[]>([]);
  useEffect(() => flightProvider.subscribe({}, setFlights), []);
  const s = q.trim().toLowerCase();
  const has = (...xs: (string | undefined)[]) => xs.some((x) => x?.toLowerCase().includes(s));

  const r = useMemo(() => {
    if (!s) return null;
    return {
      aircraft: aircraftTypes.filter((t) => has(t.variant, t.family, t.icao, manufacturerById[t.manufacturerId]?.name)),
      registrations: registrations.filter((x) => has(x.reg, x.reg.replace('-', ''))),
      manufacturers: manufacturers.filter((m) => has(m.name)),
      airlines: airlines.filter((a) => has(a.name, a.iata, a.icao)),
      airports: airports.filter((a) => has(a.name, a.iata, a.id, a.city)),
      flights: flights.filter((f) => has(f.flightNumber, f.callsign)).slice(0, 6),
      people: demoUsers.filter((u) => has(u.username, u.displayName, ...(u.specialties ?? []))),
      spots: spots.filter((x) => has(x.name, x.summary)),
      cards: cards.filter((c) => has(c.number, typeById[c.typeId]?.variant, c.registration, c.specialEdition)),
      challenges: challenges.filter((c) => has(c.title, c.description)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s, flights]);

  const total = r ? Object.values(r).reduce((a, l) => a + l.length, 0) : 0;
  const show = (k: Cat) => cat === 'all' || cat === k;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 8, paddingHorizontal: space.lg, gap: 10, paddingBottom: 8 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack()} />
          <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, height: 46, paddingHorizontal: 14, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong }}>
            <Ionicons name="search" size={18} color={colors.textDim} />
            <TextInput autoFocus value={q} onChangeText={setQ} placeholder="Search AeroVerse" placeholderTextColor={colors.textDim} style={{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15 }} accessibilityLabel="Search AeroVerse" returnKeyType="search" />
            {!!q && <Tap onPress={() => setQ('')} accessibilityLabel="Clear"><Ionicons name="close-circle" size={18} color={colors.textDim} /></Tap>}
          </View>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {CATS.map((c) => <Chip key={c.key} small label={c.label} active={cat === c.key} onPress={() => setCat(c.key)} />)}
        </ScrollView>
      </View>
      <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + 60, maxWidth: 640, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        {!r && (
          <View style={{ gap: 10 }}>
            <T v="overline" color={colors.cyan}>Try searching</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{RECENT.map((x) => <Chip key={x} label={x} icon="time-outline" onPress={() => setQ(x)} />)}</View>
          </View>
        )}
        {r && total === 0 && <EmptyState icon="search-outline" title={`No results for “${q}”`} body="Check the spelling, or try a registration like G-XWBD, a type like 787, or an airport code like MAN." />}
        {r && show('aircraft') && r.aircraft.length > 0 && <Group title="Aircraft types">{r.aircraft.map((t) => <Row key={t.id} photo={t.photoId} title={`${manufacturerById[t.manufacturerId]?.name} ${t.variant}`} sub={`${t.icao} · ${t.family} family`} onPress={() => router.push(`/aircraft/${t.id}`)} />)}</Group>}
        {r && show('registrations') && r.registrations.length > 0 && <Group title="Registrations">{r.registrations.map((x) => <Row key={x.reg} icon="barcode-outline" title={x.reg} sub={`${typeById[x.typeId]?.variant} · ${airlineById[x.airlineId]?.name}`} onPress={() => router.push(`/aircraft/${x.typeId}`)} />)}</Group>}
        {r && show('manufacturers') && r.manufacturers.length > 0 && <Group title="Manufacturers">{r.manufacturers.map((m) => <Row key={m.id} icon="construct-outline" title={m.name} sub={`${aircraftTypes.filter((t) => t.manufacturerId === m.id).length} types in database`} onPress={() => { const t = aircraftTypes.find((x) => x.manufacturerId === m.id); if (t) router.push(`/aircraft/${t.id}`); }} />)}</Group>}
        {r && show('airlines') && r.airlines.length > 0 && <Group title="Airlines & operators">{r.airlines.map((a) => <Row key={a.id} icon="business-outline" title={a.name} sub={`${a.iata} / ${a.icao}`} onPress={() => setQ(a.iata !== '—' ? a.iata : a.name)} />)}</Group>}
        {r && show('airports') && r.airports.length > 0 && <Group title="Airports">{r.airports.map((a) => <Row key={a.id} photo={a.photoId} title={a.name} sub={`${a.iata} · ${a.city}`} onPress={() => router.push(`/airports/${a.id}`)} />)}</Group>}
        {r && show('flights') && r.flights.length > 0 && <Group title="Flights (simulated)">{r.flights.map((f) => <Row key={f.id} icon="airplane-outline" title={`${f.flightNumber} · ${typeById[f.typeId]?.variant}`} sub={`${f.callsign} · ${f.status} · open radar`} onPress={() => router.push('/radar')} />)}</Group>}
        {r && show('people') && r.people.length > 0 && <Group title="Users & photographers">{r.people.map((u) => <Row key={u.id} avatar={u.id} title={`@${u.username}`} sub={`${u.displayName}${u.photographer ? ' · Photographer' : ''}`} onPress={() => router.push(`/user/${u.id}`)} />)}</Group>}
        {r && show('spots') && r.spots.length > 0 && <Group title="Spotting locations">{r.spots.map((x) => <Row key={x.id} photo={x.photoIds[0]} title={x.name} sub={x.verified ? 'Verified' : 'Unverified suggestion'} onPress={() => router.push(`/spotting/${x.id}`)} />)}</Group>}
        {r && show('cards') && r.cards.length > 0 && <Group title="Digital cards">{r.cards.map((c) => <Row key={c.id} photo={c.photoId} title={`${c.number} · ${typeById[c.typeId]?.variant}`} sub={`${c.rarity}${c.specialEdition ? ` · ${c.specialEdition}` : ''}`} onPress={() => router.push(`/cards/${c.id}`)} />)}</Group>}
        {r && show('challenges') && r.challenges.length > 0 && <Group title="Challenges">{r.challenges.map((c) => <Row key={c.id} icon="flag-outline" title={c.title} sub={c.description} onPress={() => router.push('/challenges')} />)}</Group>}
      </ScrollView>
    </View>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ gap: 4 }}><T v="overline" color={colors.cyan} style={{ marginBottom: 4 }}>{title}</T>{children}</View>;
}
function Row({ title, sub, onPress, photo, icon, avatar }: { title: string; sub?: string; onPress: () => void; photo?: string; icon?: string; avatar?: string }) {
  return (
    <Tap onPress={onPress} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 }}>
      {photo ? <Photo id={photo} style={{ width: 52, height: 40, borderRadius: 8 }} credit={false} /> : avatar ? <Avatar userId={avatar} size={40} /> : (
        <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: colors.surface2, alignItems: 'center', justifyContent: 'center' }}><Ionicons name={(icon ?? 'ellipse') as never} size={18} color={colors.cyan} /></View>
      )}
      <View style={{ flex: 1 }}><T v="bodyMedium" numberOfLines={1}>{title}</T>{sub && <T v="small" muted numberOfLines={1}>{sub}</T>}</View>
      <Ionicons name="chevron-forward" size={16} color={colors.textDim} />
    </Tap>
  );
}
