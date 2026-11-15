import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, gradients, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Input, Pill, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Photo } from '@/components/aviation';
import { airports } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { compact } from '@/utils/format';

export default function Airports() {
  const [q, setQ] = useState('');
  const joined = useApp((s) => s.joinedAirports);
  const home = useApp((s) => s.profile?.homeAirportId);
  const list = airports.filter((a) => `${a.name} ${a.iata} ${a.city} ${a.country}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <Screen header={<Header title="Airport communities" subtitle={`${airports.length} communities · more launching soon`} />}>
      <View style={{ gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Input placeholder="Search airports" value={q} onChangeText={setQ} icon="search" />
        {list.length === 0 && <T muted>No communities match “{q}”.</T>}
        {list.map((a) => (
          <Tap key={a.id} onPress={() => router.push(`/airports/${a.id}`)} style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
            <Photo id={a.photoId} style={{ height: 130 }} credit={false}>
              <LinearGradient colors={['rgba(5,8,15,0.15)', 'rgba(5,8,15,0.9)']} style={StyleSheet.absoluteFill} />
              <View style={{ position: 'absolute', top: 10, right: 10, flexDirection: 'row', gap: 6 }}>
                {home === a.id && <Pill label="Home" color={colors.cyan} solid />}
                {joined.includes(a.id) && home !== a.id && <Pill label="Joined" color={colors.success} />}
              </View>
              <View style={{ position: 'absolute', left: 14, right: 14, bottom: 12, flexDirection: 'row', alignItems: 'flex-end' }}>
                <View style={{ flex: 1 }}>
                  <T v="h2">{a.iata}</T>
                  <T v="small" muted>{a.name} · {a.country}</T>
                </View>
                <T v="caption" muted>{compact(a.members)} members</T>
              </View>
            </Photo>
          </Tap>
        ))}
      </View>
    </Screen>
  );
}
void gradients;
