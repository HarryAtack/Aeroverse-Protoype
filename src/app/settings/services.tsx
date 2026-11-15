import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Notice, Pill } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { serviceModes } from '@/services/config';
import { useApp } from '@/store/useApp';

const ROWS: { key: keyof typeof serviceModes; title: string; demo: string; live: string }[] = [
  { key: 'auth', title: 'Authentication', demo: 'Development auth — accounts stored on this device', live: 'Supabase Auth' },
  { key: 'flights', title: 'Flight data', demo: 'Simulated traffic — not real aircraft positions', live: 'Licensed flight-data provider via AeroVerse backend' },
  { key: 'identification', title: 'Aircraft identification', demo: 'Simulated AI — scripted scenarios, not image analysis', live: 'Vision + OCR via identify-aircraft Edge Function' },
  { key: 'payments', title: 'Payments', demo: 'Test checkout — no money taken', live: 'Stripe' },
  { key: 'push', title: 'Push notifications', demo: 'In-app notifications only', live: 'Expo Push via notification outbox' },
];

export default function Services() {
  return (
    <Screen header={<Header title="Data sources & services" />}>
      <View style={{ gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <T muted>AeroVerse is built on replaceable service adapters. This build runs these services in the following modes:</T>
        {ROWS.map((r) => {
          const live = serviceModes[r.key] === 'live';
          return (
            <Card key={r.key} style={{ gap: 6 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <T v="title">{r.title}</T>
                <Pill label={live ? 'LIVE' : 'DEMO'} color={live ? colors.success : colors.sim} solid />
              </View>
              <T v="small" muted>{live ? r.live : r.demo}</T>
            </Card>
          );
        })}
        <Notice icon="information-circle-outline" color={colors.cyan} text="AeroVerse does not scrape or copy data from Flightradar24 or other restricted sources. See docs/PRODUCTION_SERVICES.md for the services required in production." />
        <Card style={{ gap: 8 }}>
          <T v="title">Developer</T>
          <T v="small" muted>Reset all local demo data on this device, including test accounts’ progress.</T>
          <Button title="Reset demo data" variant="danger" small onPress={() => { useApp.getState().resetDemo(); router.replace('/welcome'); }} />
        </Card>
      </View>
    </Screen>
  );
}
