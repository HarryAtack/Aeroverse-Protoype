import React, { useEffect, useState } from 'react';
import { Linking, View } from 'react-native';
import * as Location from 'expo-location';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Notice, ToggleRow } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { useApp } from '@/store/useApp';

export default function Privacy() {
  const p = useApp((s) => s.privacy);
  const set = useApp.getState().setPrivacy;
  const [perm, setPerm] = useState<string>('checking…');
  useEffect(() => {
    Location.getForegroundPermissionsAsync().then((r) => setPerm(r.granted ? 'Allowed while using the app' : r.canAskAgain ? 'Not allowed' : 'Denied — change in device settings')).catch(() => setPerm('Unavailable'));
  }, []);
  return (
    <Screen header={<Header title="Privacy & location" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Notice icon="shield-checkmark-outline" color={colors.success} text="AeroVerse never shares your precise live location with other users. Location features are always optional." />
        <View style={{ gap: 6 }}>
          <T v="overline" color={colors.cyan}>Profile</T>
          <Card padded={false}>
            <ToggleRow icon="globe-outline" title="Public profile" subtitle="Off: only followers you approve can see your posts" value={p.profilePublic} onChange={(v) => set({ profilePublic: v })} />
            <ToggleRow icon="business-outline" title="Show home airport" value={p.showHomeAirport} onChange={(v) => set({ showHomeAirport: v })} />
            <ToggleRow icon="podium-outline" title="Appear on leaderboards" value={p.showInLeaderboards} onChange={(v) => set({ showInLeaderboards: v })} />
            <ToggleRow icon="pricetag-outline" title="Allow others to tag me" value={p.allowTagging} onChange={(v) => set({ allowTagging: v })} />
            <ToggleRow icon="sparkles-outline" title="Personalised feed" subtitle="Use your activity to rank your feed" value={p.personalisedFeed} onChange={(v) => set({ personalisedFeed: v })} />
          </Card>
        </View>
        <View style={{ gap: 6 }}>
          <T v="overline" color={colors.cyan}>Location</T>
          <Card padded={false}>
            <ToggleRow icon="location-outline" title="Share check-ins" subtitle="Others see the airport/spot you checked in at — never GPS coordinates" value={p.shareCheckins} onChange={(v) => set({ shareCheckins: v })} />
            <ToggleRow icon="navigate-outline" title="Use precise location on this device" subtitle="For nearby aircraft & spots. Stays on your device." value={p.preciseLocation} onChange={async (v) => { if (v) { const r = await Location.requestForegroundPermissionsAsync().catch(() => ({ granted: false })); if (!r.granted) { useApp.getState().showToast('Location permission not granted', 'info'); return; } setPerm('Allowed while using the app'); } set({ preciseLocation: v }); }} />
          </Card>
          <T v="caption" muted>Device permission: {perm}</T>
          <Button title="Open device settings" small variant="secondary" full={false} onPress={() => Linking.openSettings().catch(() => useApp.getState().showToast('Open your device settings to change permissions', 'info'))} />
        </View>
        <Card style={{ gap: 6 }}>
          <T v="title">Photo metadata</T>
          <T v="small" muted>EXIF GPS data is stripped from every upload before it’s stored. Only the airport you choose is attached to a sighting.</T>
        </Card>
      </View>
    </Screen>
  );
}
