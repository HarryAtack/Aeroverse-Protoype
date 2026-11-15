import React from 'react';
import { StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Notice, Pill, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Photo } from '@/components/aviation';
import { competitions } from '@/data/community';
import { timeAgo } from '@/utils/format';

const statusColor = { open: colors.success, voting: colors.cyan, closed: colors.steel } as const;

export default function Competitions() {
  return (
    <Screen header={<Header title="Photo competitions" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Notice icon="ribbon-outline" color={colors.cyan} text="You keep the rights to every photo you enter. AeroVerse only displays entries in the app; any commercial use requires your separate licence and credit." />
        {competitions.map((c) => (
          <Tap key={c.id} onPress={() => router.push(`/competitions/${c.id}`)} style={{ borderRadius: radius.xl, overflow: 'hidden' }}>
            <Photo id={c.coverPhotoId} style={{ height: 170 }} credit={false}>
              <LinearGradient colors={['rgba(5,8,15,0.1)', 'rgba(5,8,15,0.92)']} style={StyleSheet.absoluteFill} />
              <View style={{ position: 'absolute', top: 10, left: 10, flexDirection: 'row', gap: 6 }}>
                <Pill label={c.status.toUpperCase()} color={statusColor[c.status]} solid />
                <Pill label={c.kind} color={colors.silver} />
              </View>
              <View style={{ position: 'absolute', left: 14, right: 14, bottom: 12 }}>
                <T v="h2">{c.title}</T>
                <T v="small" muted numberOfLines={1}>{c.theme}</T>
                <T v="caption" color={colors.sim}>🏆 {c.prize} · {c.status === 'closed' ? 'ended' : `ends ${timeAgo(c.endsAt)}`}</T>
              </View>
            </Photo>
          </Tap>
        ))}
      </View>
    </Screen>
  );
}
