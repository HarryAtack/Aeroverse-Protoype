import React, { useState } from 'react';
import { Platform, Share, View } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Notice } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { useApp } from '@/store/useApp';

export default function DataExport() {
  const [ready, setReady] = useState<string>();
  const [loading, setLoading] = useState(false);
  const s = useApp.getState();
  const build = () => JSON.stringify({
    exportedAt: new Date().toISOString(),
    account: s.session, profile: s.profile, collection: s.collection, sightings: s.sightings.map(({ result, ...x }) => ({ ...x, identification: result ? { stage: result.stage, simulated: result.simulated } : undefined })),
    posts: s.myPosts, comments: s.comments, xp: s.xpLedger, cards: s.ownedCards, orders: s.orders, follows: Object.keys(s.follows).filter((k) => s.follows[k]),
    privacy: s.privacy, notificationPreferences: s.notificationPrefs, blocked: s.blocked, reports: s.reports, checkins: s.checkins, reviews: s.myReviews, addedSpots: s.addedSpots,
  }, null, 2);
  const generate = async () => {
    setLoading(true);
    const json = build();
    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([json], { type: 'application/json' });
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'aeroverse-export.json';
        a.click();
      } else {
        const path = `${FileSystem.cacheDirectory}aeroverse-export.json`;
        await FileSystem.writeAsStringAsync(path, json);
        if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(path, { mimeType: 'application/json' });
        else await Share.share({ message: json });
      }
      setReady(`${(json.length / 1024).toFixed(1)} KB`);
    } catch {
      await Share.share({ message: json }).catch(() => {});
    }
    setLoading(false);
  };
  return (
    <Screen header={<Header title="Export my data" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <T muted>Download a machine-readable copy (JSON) of your profile, collection, sightings, posts, comments, XP history, cards, orders and settings.</T>
        <Card style={{ gap: 6 }}>
          <T v="title">Included</T>
          {['Profile & account details', 'Hangar, sightings and verification results', 'Posts, comments and reviews', 'XP history, cards and orders', 'Privacy and notification settings'].map((x) => <T key={x} v="small" muted>• {x}</T>)}
        </Card>
        <Button title="Generate export" icon="download-outline" loading={loading} onPress={generate} />
        {ready && <Notice icon="checkmark-circle" color={colors.success} text={`Export ready (${ready}).`} />}
        <T v="caption" dim>In production, exports include original photo files and are delivered via a secure, expiring link (GDPR Article 20).</T>
      </View>
    </Screen>
  );
}
