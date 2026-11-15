import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Animated, Easing, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, IconButton, Input, Notice, Tap, ToggleRow } from '@/components/ui/primitives';
import { goBack } from '@/components/ui/Screen';
import { Photo, SimBadge } from '@/components/aviation';
import { airports, typeById } from '@/data/catalog';
import { getPhoto } from '@/data/photos';
import { identificationService, PipelineStep } from '@/services/identification';
import { useApp, MySighting } from '@/store/useApp';
import { pct } from '@/utils/format';

const SAMPLES = [
  { key: 'a380', note: 'Clear registration' },
  { key: 'b738jet2', note: 'Clear registration' },
  { key: 'b748lh', note: 'Variant + reg' },
  { key: 'a350ba', note: 'Ambiguous variant' },
  { key: 'atr72', note: 'No registration visible' },
  { key: 'special', note: 'Special livery' },
  { key: 'an124', note: 'Low confidence' },
];

type Phase = 'pick' | 'details' | 'analysing';

export default function Upload() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ type?: string; reg?: string }>();
  const profile = useApp((s) => s.profile);
  const [phase, setPhase] = useState<Phase>('pick');
  const [uri, setUri] = useState<string>();
  const [sampleKey, setSampleKey] = useState<string>();
  const [airportId, setAirportId] = useState(profile?.homeAirportId ?? 'EGCC');
  const [caption, setCaption] = useState('');
  const [rights, setRights] = useState(false);
  const [share, setShare] = useState(true);
  const [precision, setPrecision] = useState<'airport' | 'hidden'>('airport');
  const [takenAt] = useState(new Date().toISOString());
  const [steps, setSteps] = useState<PipelineStep[]>([]);
  const [error, setError] = useState<string>();
  const [permissionMsg, setPermissionMsg] = useState<string>();

  const pick = async (source: 'camera' | 'library') => {
    setPermissionMsg(undefined);
    try {
      const perm = source === 'camera' ? await ImagePicker.requestCameraPermissionsAsync() : await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!perm.granted) {
        setPermissionMsg(source === 'camera' ? 'Camera access was not granted. You can enable it in your device settings, or choose a photo from your library.' : 'Photo library access was not granted. You can enable it in your device settings.');
        return;
      }
      const res = source === 'camera'
        ? await ImagePicker.launchCameraAsync({ quality: 0.85, exif: false })
        : await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.85, exif: false });
      if (!res.canceled && res.assets[0]) {
        setUri(res.assets[0].uri);
        setSampleKey(undefined);
        setPhase('details');
      }
    } catch {
      setPermissionMsg('Couldn’t open the picker on this device. Try a sample photo instead.');
    }
  };

  const chooseSample = (key: string) => {
    setSampleKey(key);
    setUri(undefined);
    setPhase('details');
  };

  const analyse = async () => {
    setError(undefined);
    if (!rights) { useApp.getState().showToast('Please confirm you have the right to share this photo', 'error'); return setError('Please confirm you took this photo or have the right to share it.'); }
    setPhase('analysing');
    try {
      const imageUri = uri ?? `sample:${sampleKey}`;
      const result = await identificationService.identify({ imageUri, sampleKey, airportId, takenAt }, setSteps);
      const id = `sg_${Date.now().toString(36)}`;
      const t = result.variant?.typeId ?? 'b737-800';
      const regDb = result.registration?.accepted ? result.registration.text : undefined;
      const sighting: MySighting = {
        id,
        photoUri: uri,
        photoId: sampleKey,
        sampleKey,
        typeId: params.type && !sampleKey ? params.type : t,
        registration: regDb,
        airlineId: inferAirline(t, regDb, sampleKey),
        airportId,
        takenAt,
        stage: result.stage,
        confidence: result.variant?.confidence ?? 0,
        caption,
        simulated: result.simulated,
        votes: { agree: 0, disagree: 0 },
        corrections: [],
        createdAt: new Date().toISOString(),
        result,
        shareToFeed: share,
        locationPrecision: precision,
      };
      useApp.getState().addSighting(sighting);
      setTimeout(() => router.replace(`/verification/${id}`), 500);
    } catch (e) {
      setError((e as Error).message || 'Identification failed. Please try again.');
      setPhase('details');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.head, { paddingTop: insets.top + 8 }]}>
        <IconButton icon="close" accessibilityLabel="Close upload" onPress={() => goBack('/(tabs)')} />
        <T v="h3" style={{ flex: 1, textAlign: 'center' }}>{phase === 'pick' ? 'Upload a sighting' : phase === 'details' ? 'Sighting details' : 'Identifying aircraft'}</T>
        <View style={{ width: 40 }} />
      </View>

      {phase === 'pick' && (
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + 40, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
          {identificationService.mode === 'demo' && (
            <Notice title="Simulated AI identification" text="No AI service is connected in this prototype. Sample photos replay realistic scenarios; your own photos get a deliberately low-confidence suggestion that you confirm and the community reviews." />
          )}
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Tap onPress={() => pick('camera')} style={styles.source} accessibilityLabel="Take a photo">
              <Ionicons name="camera" size={30} color={colors.cyan} />
              <T v="title">Camera</T>
              <T v="caption" muted>Take a photo</T>
            </Tap>
            <Tap onPress={() => pick('library')} style={styles.source} accessibilityLabel="Choose from library">
              <Ionicons name="images" size={30} color={colors.cyan} />
              <T v="title">Library</T>
              <T v="caption" muted>Choose a photo</T>
            </Tap>
          </View>
          {permissionMsg && <Notice icon="lock-closed-outline" color={colors.warning} text={permissionMsg} />}
          <View style={{ gap: 4 }}>
            <T v="h3">Try a sample photo</T>
            <T v="small" muted>Each sample demonstrates a different verification outcome.</T>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
            {SAMPLES.filter((s) => getPhoto(s.key)).map((s) => (
              <Tap key={s.key} onPress={() => chooseSample(s.key)} style={{ width: '48%', borderRadius: radius.lg, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }} accessibilityLabel={`Sample: ${s.note}`}>
                <Photo id={s.key} style={{ height: 100 }} credit="compact" />
                <View style={{ padding: 8 }}>
                  <T v="smallMedium">{s.note}</T>
                </View>
              </Tap>
            ))}
          </View>
          <T v="caption" dim>Tips: fill the frame, include the registration if visible, avoid heavy zoom on hazy days. EXIF location is stripped on upload.</T>
        </ScrollView>
      )}

      {phase === 'details' && (
        <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, paddingBottom: insets.bottom + 120, maxWidth: 640, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
          <View style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
            {uri ? <Image source={{ uri }} style={{ width: '100%', aspectRatio: 4 / 3 }} contentFit="cover" /> : <Photo id={sampleKey} style={{ width: '100%', aspectRatio: 4 / 3 }} />}
            <Tap onPress={() => setPhase('pick')} style={styles.change}><T v="smallMedium">Change photo</T></Tap>
          </View>
          {params.type && <Notice icon="information-circle" color={colors.cyan} text={`Logging a sighting of ${typeById[params.type]?.variant}${params.reg ? ` (${params.reg})` : ''}. The photo will still be checked.`} />}
          <View style={{ gap: 8 }}>
            <T v="title">Where was it taken?</T>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
              {airports.map((a) => <Chip key={a.id} label={a.iata} active={airportId === a.id} onPress={() => setAirportId(a.id)} />)}
            </ScrollView>
            <T v="caption" muted>Time: {new Date(takenAt).toLocaleString('en-GB')} (from upload time)</T>
          </View>
          <View style={{ gap: 8 }}>
            <T v="title">Location shown to others</T>
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <Chip icon="business-outline" label="Airport only" active={precision === 'airport'} onPress={() => setPrecision('airport')} />
              <Chip icon="eye-off-outline" label="Hide location" active={precision === 'hidden'} onPress={() => setPrecision('hidden')} />
            </View>
            <T v="caption" muted>Your precise GPS position is never published.</T>
          </View>
          <Tap onPress={() => setRights(!rights)} style={{ flexDirection: 'row', gap: 10 }} accessibilityRole="checkbox" accessibilityState={{ checked: rights }} accessibilityLabel="I took this photo or have the right to share it">
            <Ionicons name={rights ? 'checkbox' : 'square-outline'} size={22} color={rights ? colors.primary : colors.textMuted} />
            <T v="small" muted style={{ flex: 1 }}>
              I took this photo or have the right to share it. I keep ownership; AeroVerse may display it in the app. Any commercial use (cards, prints, ads) needs my separate, explicit licence.
            </T>
          </Tap>
          <Input label="Caption (optional)" placeholder="What made this sighting special?" value={caption} onChangeText={setCaption} multiline maxLength={500} />
          <Card padded={false}>
            <ToggleRow icon="people-outline" title="Share to the community feed" subtitle="After identification. You can change this later." value={share} onChange={setShare} />
          </Card>
          {error && <T v="small" color={colors.danger}>{error}</T>}
        </ScrollView>
      )}
      {phase === 'details' && (
        <View style={{ position: 'absolute', left: space.lg, right: space.lg, bottom: insets.bottom + 16 }}>
          <Button title="Identify aircraft" icon="scan" onPress={analyse} />
        </View>
      )}

      {phase === 'analysing' && <Analysing uri={uri} sampleKey={sampleKey} steps={steps} />}
    </View>
  );
}

function inferAirline(typeId: string, reg?: string, sample?: string) {
  const bySample: Record<string, string> = { a380: 'ek', b738jet2: 'ls', b748lh: 'lh', a350ba: 'ba', atr72: 'lm', special: 'fi', an124: 'vda' };
  if (sample && bySample[sample]) return bySample[sample];
  return typeId.startsWith('a3') ? 'u2' : 'ls';
}

function Analysing({ uri, sampleKey, steps }: { uri?: string; sampleKey?: string; steps: PipelineStep[] }) {
  const scan = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const l = Animated.loop(Animated.sequence([Animated.timing(scan, { toValue: 1, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true }), Animated.timing(scan, { toValue: 0, duration: 1200, easing: Easing.inOut(Easing.quad), useNativeDriver: true })]));
    l.start();
    return () => l.stop();
  }, [scan]);
  return (
    <ScrollView contentContainerStyle={{ padding: space.lg, gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
      <View style={{ borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.primary }}>
        {uri ? <Image source={{ uri }} style={{ width: '100%', aspectRatio: 4 / 3 }} /> : <Photo id={sampleKey} style={{ width: '100%', aspectRatio: 4 / 3 }} />}
        <Animated.View pointerEvents="none" style={[styles.scanLine, { transform: [{ translateY: scan.interpolate({ inputRange: [0, 1], outputRange: [0, 260] }) }] }]} />
        {[styles.cTL, styles.cTR, styles.cBL, styles.cBR].map((c, i) => <View key={i} style={[styles.corner, c]} />)}
      </View>
      <SimBadge label={identificationService.mode === 'demo' ? 'SIMULATED ANALYSIS' : 'AI ANALYSIS'} />
      <View style={{ gap: 2 }}>
        {steps.map((s) => (
          <View key={s.id} style={styles.step}>
            <View style={{ width: 24, alignItems: 'center' }}>
              {s.status === 'running' ? <ActivityIndicator size="small" color={colors.cyan} /> : (
                <Ionicons
                  name={s.status === 'pass' ? 'checkmark-circle' : s.status === 'low' ? 'alert-circle' : s.status === 'fail' ? 'close-circle' : s.status === 'skipped' ? 'remove-circle-outline' : 'ellipse-outline'}
                  size={20}
                  color={s.status === 'pass' ? colors.success : s.status === 'low' ? colors.warning : s.status === 'fail' ? colors.danger : colors.textDim}
                />
              )}
            </View>
            <View style={{ flex: 1 }}>
              <T v="bodyMedium" color={s.status === 'pending' ? colors.textDim : colors.text}>{s.label}</T>
              {!!s.detail && <T v="small" muted>{s.detail}</T>}
            </View>
            {s.confidence !== undefined && <T v="data" color={s.confidence >= 0.85 ? colors.success : s.confidence >= 0.6 ? colors.warning : colors.danger} style={{ fontFamily: fonts.mono }}>{pct(s.confidence)}</T>}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  head: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  source: { flex: 1, alignItems: 'center', gap: 6, paddingVertical: 26, borderRadius: radius.xl, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.borderStrong },
  change: { position: 'absolute', top: 12, right: 12, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: 'rgba(5,8,15,0.75)' },
  step: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  scanLine: { position: 'absolute', left: 0, right: 0, top: 0, height: 2, backgroundColor: colors.cyan, shadowColor: colors.cyan, shadowOpacity: 1, shadowRadius: 10 },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: colors.cyan },
  cTL: { top: 10, left: 10, borderTopWidth: 3, borderLeftWidth: 3 },
  cTR: { top: 10, right: 10, borderTopWidth: 3, borderRightWidth: 3 },
  cBL: { bottom: 10, left: 10, borderBottomWidth: 3, borderLeftWidth: 3 },
  cBR: { bottom: 10, right: 10, borderBottomWidth: 3, borderRightWidth: 3 },
});
