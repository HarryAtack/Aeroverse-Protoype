import React, { useMemo, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Chip, Input, Notice, ProgressBar, Tap } from '@/components/ui/primitives';
import { Photo, Avatar } from '@/components/aviation';
import { airports } from '@/data/catalog';
import { demoUsers } from '@/data/users';
import { useApp } from '@/store/useApp';

const INTERESTS = ['Airliners', 'Heavies', 'Special liveries', 'Cargo', 'Regional & turboprops', 'Military', 'Historic', 'Airshows', 'Photography', 'Flight tracking', 'Collecting cards', 'Bizjets'];
const AVATAR_COLORS: [string, string][] = [['#3D8BFF', '#5CE1FF'], ['#B46CFF', '#FF6BD6'], ['#FFB547', '#E07A1F'], ['#34D399', '#5CE1FF'], ['#F87171', '#FFB547'], ['#7C8BA6', '#C9D3E3']];

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const session = useApp((s) => s.session);
  const existing = useApp((s) => s.profile);
  const [step, setStep] = useState(0);
  const [username, setUsername] = useState(existing?.username ?? '');
  const [displayName, setDisplayName] = useState(existing?.displayName ?? '');
  const [color, setColor] = useState<[string, string]>(existing?.avatarColor ?? AVATAR_COLORS[0]);
  const [home, setHome] = useState(existing?.homeAirportId ?? 'EGCC');
  const [q, setQ] = useState('');
  const [interests, setInterests] = useState<string[]>(existing?.interests ?? []);
  const [loc, setLoc] = useState<'unknown' | 'granted' | 'denied'>('unknown');
  const [error, setError] = useState<string>();

  const usernameError = useMemo(() => {
    if (!username) return undefined;
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return '3–20 characters: lowercase letters, numbers and underscores.';
    if (demoUsers.some((u) => u.username === username)) return 'That username is taken.';
    return undefined;
  }, [username]);

  const filtered = airports.filter((a) => `${a.name} ${a.iata} ${a.city} ${a.country}`.toLowerCase().includes(q.toLowerCase()));
  const steps = ['Profile', 'Home airport', 'Interests', 'Location'];

  const next = () => {
    setError(undefined);
    if (step === 0) {
      if (!username || usernameError) return setError(usernameError ?? 'Choose a username.');
    }
    if (step === 2 && interests.length === 0) return setError('Pick at least one interest.');
    if (step < steps.length - 1) return setStep(step + 1);
    useApp.getState().saveProfile({ username, displayName: displayName || username, avatarColor: color, homeAirportId: home, interests, email: session?.email ?? '', id: session?.userId ?? 'me' });
    const s = useApp.getState();
    if (!s.joinedAirports.includes(home)) s.toggleJoinAirport(home);
    s.setNotificationPrefs({ airports: [home] });
    if (s.xpLedger.length === 0) s.addXp(50, 'Welcome to AeroVerse');
    s.showToast('Profile ready — welcome aboard!');
    router.replace('/(tabs)');
  };

  const requestLocation = async () => {
    try {
      const r = await Location.requestForegroundPermissionsAsync();
      setLoc(r.granted ? 'granted' : 'denied');
    } catch {
      setLoc('denied');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ paddingTop: insets.top + 12, paddingHorizontal: space.xl, gap: 10 }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <T v="overline" color={colors.cyan}>Step {step + 1} of {steps.length} · {steps[step]}</T>
          {step > 0 && <Tap onPress={() => setStep(step - 1)} accessibilityLabel="Previous step"><T v="smallMedium" color={colors.primary}>Back</T></Tap>}
        </View>
        <ProgressBar value={(step + 1) / steps.length} />
      </View>
      <ScrollView contentContainerStyle={{ padding: space.xl, gap: space.lg, paddingBottom: 140, maxWidth: 560, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
        {step === 0 && (
          <>
            <T v="h1">Create your spotter profile</T>
            <T muted>This is how the community will see you. You can change it later.</T>
            <View style={{ alignItems: 'center', gap: space.md }}>
              <Avatar size={92} name={displayName || username || 'You'} colorsOverride={color} ring />
              <View style={{ flexDirection: 'row', gap: 10 }}>
                {AVATAR_COLORS.map((c) => (
                  <Tap key={c[0] + c[1]} onPress={() => setColor(c)} accessibilityLabel="Avatar colour">
                    <LinearGradient colors={c} style={[{ width: 30, height: 30, borderRadius: 15 }, color === c && { borderWidth: 2, borderColor: '#fff' }]} />
                  </Tap>
                ))}
              </View>
            </View>
            <Input label="Username" placeholder="e.g. runway_rachel" autoCapitalize="none" value={username} onChangeText={(t) => setUsername(t.toLowerCase())} icon="at" error={usernameError} />
            <Input label="Display name (optional)" placeholder="Your name" value={displayName} onChangeText={setDisplayName} icon="person-outline" />
          </>
        )}
        {step === 1 && (
          <>
            <T v="h1">Choose your home airport</T>
            <T muted>We’ll personalise your feed, rarity levels, alerts and challenges around it.</T>
            <Input placeholder="Search airports" value={q} onChangeText={setQ} icon="search" />
            {filtered.map((a) => (
              <Tap key={a.id} onPress={() => setHome(a.id)} style={[styles.airport, home === a.id && { borderColor: colors.primary }]} accessibilityState={{ selected: home === a.id }}>
                <Photo id={a.photoId} style={{ width: 64, height: 48, borderRadius: 10 }} credit={false} />
                <View style={{ flex: 1 }}>
                  <T v="title">{a.name}</T>
                  <T v="small" muted>{a.iata} · {a.city}, {a.country}</T>
                </View>
                <Ionicons name={home === a.id ? 'radio-button-on' : 'radio-button-off'} size={22} color={home === a.id ? colors.primary : colors.textDim} />
              </Tap>
            ))}
            {filtered.length === 0 && <T muted>No airports match “{q}”. More airports are added as communities launch.</T>}
          </>
        )}
        {step === 2 && (
          <>
            <T v="h1">What are you into?</T>
            <T muted>Pick a few. This shapes recommendations — never who can see you.</T>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {INTERESTS.map((i) => (
                <Chip key={i} label={i} active={interests.includes(i)} onPress={() => setInterests(interests.includes(i) ? interests.filter((x) => x !== i) : [...interests, i])} />
              ))}
            </View>
          </>
        )}
        {step === 3 && (
          <>
            <T v="h1">Location is optional</T>
            <T muted>AeroVerse can use your location on this device to show nearby aircraft and spotting locations.</T>
            <View style={{ gap: 10 }}>
              {[
                ['eye-off-outline', 'Your precise location is never shown to other users.'],
                ['location-outline', 'Check-ins share the airport only, and only if you turn sharing on.'],
                ['settings-outline', 'You can change this any time in Settings → Privacy.'],
              ].map(([icon, text]) => (
                <View key={text} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
                  <Ionicons name={icon as never} size={20} color={colors.cyan} />
                  <T style={{ flex: 1 }}>{text}</T>
                </View>
              ))}
            </View>
            {loc === 'unknown' && <Button title="Allow location while using the app" icon="navigate-outline" variant="secondary" onPress={requestLocation} />}
            {loc === 'granted' && <Notice icon="checkmark-circle" color={colors.success} text="Location enabled on this device. It stays private." />}
            {loc === 'denied' && <Notice icon="information-circle" color={colors.cyan} text="No problem — AeroVerse will use your home airport instead." />}
          </>
        )}
        {error && <T v="small" color={colors.danger}>{error}</T>}
      </ScrollView>
      <View style={{ position: 'absolute', left: space.xl, right: space.xl, bottom: insets.bottom + 20, maxWidth: 520, alignSelf: 'center', width: '90%' }}>
        <Button title={step === steps.length - 1 ? (loc === 'unknown' ? 'Not now — finish' : 'Finish setup') : 'Continue'} icon={step === steps.length - 1 ? 'checkmark' : 'arrow-forward'} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  airport: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: radius.lg, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
});
