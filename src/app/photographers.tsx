import React, { useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { colors, radius, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Chip, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar, Photo } from '@/components/aviation';
import { demoUsers } from '@/data/users';
import { demoPosts } from '@/data/posts';
import { airportById } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { compact } from '@/utils/format';

const FILTERS = ['All', 'Heavies', 'Warbirds', 'Cargo', 'Approach shots', 'Asian carriers', 'Golden hour'];

export default function Photographers() {
  const { width } = useWindowDimensions();
  const follows = useApp((s) => s.follows);
  const blocked = useApp((s) => s.blocked);
  const [f, setF] = useState('All');
  const list = demoUsers.filter((u) => u.photographer && !blocked.includes(u.id) && (f === 'All' || u.specialties?.includes(f)));
  const w = Math.min(width, 640) - space.lg * 2;
  return (
    <Screen header={<Header title="Photographers" subtitle="Discover outstanding aviation photography" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
          {FILTERS.map((x) => <Chip key={x} small label={x} active={f === x} onPress={() => setF(x)} />)}
        </ScrollView>
        {list.length === 0 && <T muted>No photographers with this speciality yet.</T>}
        {list.map((u) => {
          const posts = demoPosts.filter((p) => p.userId === u.id).slice(0, 3);
          return (
            <View key={u.id} style={{ borderRadius: radius.xl, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
              <Tap onPress={() => router.push(`/user/${u.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 }}>
                <Avatar userId={u.id} size={48} />
                <View style={{ flex: 1 }}>
                  <T v="title">@{u.username}</T>
                  <T v="small" muted>{airportById[u.homeAirportId]?.iata} · {u.specialties?.join(' · ')} · {compact(u.followers)} followers</T>
                </View>
                <Button title={follows[u.id] ? 'Following' : 'Follow'} small full={false} variant={follows[u.id] ? 'secondary' : 'primary'} onPress={() => useApp.getState().toggleFollow(u.id)} />
              </Tap>
              <View style={{ flexDirection: 'row', gap: 2 }}>
                {posts.map((p) => (
                  <Tap key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ width: (w - 4) / 3, height: (w - 4) / 3 * 0.8 }}>
                    <Photo id={p.photoId} style={StyleSheet.absoluteFill} credit={false} />
                  </Tap>
                ))}
              </View>
            </View>
          );
        })}
        <T v="caption" dim center>Demo profiles. Sample images are Wikimedia Commons photographs, credited on each photo.</T>
      </View>
    </Screen>
  );
}
