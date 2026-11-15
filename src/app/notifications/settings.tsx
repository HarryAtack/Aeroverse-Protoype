import React from 'react';
import { ScrollView, View } from 'react-native';
import { colors, space } from '@/theme/tokens';
import type { NotificationCategory } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, Notice, ToggleRow } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { airports, aircraftTypes, airlines } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { pushService } from '@/services/notifications';
import { catMeta } from '@/components/notificationMeta';

export default function NotificationSettings() {
  const prefs = useApp((s) => s.notificationPrefs);
  const set = useApp.getState().setNotificationPrefs;
  const toggleIn = (k: 'airports' | 'types' | 'airlines', v: string) => set({ [k]: prefs[k].includes(v) ? prefs[k].filter((x) => x !== v) : [...prefs[k], v] });
  return (
    <Screen header={<Header title="Notification settings" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Card padded={false}>
          <ToggleRow icon="phone-portrait-outline" title="Push notifications" subtitle={pushService.mode === 'demo' ? 'Not configured in this prototype — in-app only' : 'Delivered to this device'} value={prefs.push} onChange={async (v) => { if (v) { const r = await pushService.register(); if (r.status !== 'granted') useApp.getState().showToast('Push isn’t configured in demo mode — you’ll still get in-app notifications', 'info'); } set({ push: v }); }} />
          <ToggleRow icon="moon-outline" title="Quiet hours (22:00–07:00)" subtitle="Hold non-urgent notifications overnight" value={prefs.quietHours} onChange={(v) => set({ quietHours: v })} />
        </Card>
        <View style={{ gap: 6 }}>
          <T v="overline" color={colors.cyan}>Categories</T>
          <Card padded={false}>
            {(Object.keys(catMeta) as NotificationCategory[]).map((c) => (
              <ToggleRow key={c} icon={catMeta[c].icon as never} title={catMeta[c].label} value={prefs.categories[c]} onChange={(v) => set({ categories: { ...prefs.categories, [c]: v } })} />
            ))}
          </Card>
        </View>
        <Pref title="Airports" sub="Rare-aircraft alerts and challenges for these airports.">
          {airports.map((a) => <Chip key={a.id} small label={a.iata} active={prefs.airports.includes(a.id)} onPress={() => toggleIn('airports', a.id)} />)}
        </Pref>
        <Pref title="Aircraft types" sub="Alert me when these types are near my airports.">
          {aircraftTypes.filter((t) => t.category !== 'military').map((t) => <Chip key={t.id} small label={t.variant} active={prefs.types.includes(t.id)} onPress={() => toggleIn('types', t.id)} />)}
        </Pref>
        <Pref title="Airlines" sub="Special liveries and visits from these operators.">
          {airlines.filter((a) => !a.military && a.iata !== '—').map((a) => <Chip key={a.id} small label={a.name} active={prefs.airlines.includes(a.id)} onPress={() => toggleIn('airlines', a.id)} />)}
        </Pref>
        <Notice icon="information-circle-outline" color={colors.cyan} text="Military aircraft alerts are not offered. Rare alerts are based on scheduled and community data, never on restricted sources." />
        <Button title="Save" onPress={() => useApp.getState().showToast('Notification preferences saved')} />
      </View>
    </Screen>
  );
}

function Pref({ title, sub, children }: { title: string; sub: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 6 }}>
      <T v="overline" color={colors.cyan}>{title}</T>
      <T v="small" muted>{sub}</T>
      <ScrollView horizontal={false}><View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>{children}</View></ScrollView>
    </View>
  );
}
