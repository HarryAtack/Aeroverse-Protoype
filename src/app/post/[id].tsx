import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, EmptyState, Input, ListRow, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar, PostCard, verificationMeta } from '@/components/aviation';
import { postById } from '@/data/posts';
import { userById } from '@/data/users';
import { airportById, registrationByReg, typeById } from '@/data/catalog';
import { useApp } from '@/store/useApp';
import { useShallow } from 'zustand/react/shallow';
import { localRarity, rarityLabel } from '@/services/rarity';
import { dateTime, timeAgo } from '@/utils/format';

export default function PostDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const mine = useApp((s) => s.myPosts.find((p) => p.id === id));
  const post = mine ?? postById[id];
  const myComments = useApp(useShallow((s) => s.comments[id] ?? []));
  const blocked = useApp((s) => s.blocked);
  const profile = useApp((s) => s.profile);
  const [text, setText] = useState('');
  if (!post) return <Screen header={<Header title="Post" />}><EmptyState icon="image-outline" title="Post not found" body="It may have been removed." /></Screen>;
  const comments = [...post.comments, ...myComments].filter((c) => !blocked.includes(c.userId));
  const reg = post.registration ? registrationByReg[post.registration] : undefined;
  const t = typeById[post.typeId];
  const send = () => {
    const v = text.trim();
    if (!v) return;
    useApp.getState().addComment(post.id, v);
    setText('');
  };
  return (
    <Screen keyboard padded={false} header={<Header title="Sighting" subtitle={`${airportById[post.airportId]?.iata} · ${timeAgo(post.takenAt)}`} />}>
      <View style={{ maxWidth: 640, width: '100%', alignSelf: 'center', paddingTop: space.lg }}>
        <PostCard post={post} />
        <Card style={{ marginHorizontal: space.lg, marginBottom: space.lg }} padded={false}>
          <ListRow icon="airplane-outline" title={`${t?.variant ?? post.typeId}`} subtitle="Aircraft type · view details" onPress={() => router.push(`/aircraft/${post.typeId}`)} />
          <ListRow icon="barcode-outline" title={post.registration ?? 'Registration not confirmed'} subtitle={reg ? `${reg.livery ?? ''}${reg.notes ? ` · ${reg.notes}` : ''}` : 'No database entry linked'} />
          <ListRow icon="location-outline" title={airportById[post.airportId]?.name ?? ''} subtitle={post.location} onPress={() => router.push(`/airports/${post.airportId}`)} />
          <ListRow icon="time-outline" title={dateTime(post.takenAt)} subtitle="Date and time of sighting" />
          <ListRow icon={verificationMeta[post.verification].icon} iconColor={verificationMeta[post.verification].color} title={verificationMeta[post.verification].label} subtitle={verificationMeta[post.verification].description} />
          <ListRow icon="diamond-outline" title={`${rarityLabel[localRarity(post.typeId, post.airportId, post.registration)]} at ${airportById[post.airportId]?.iata}`} subtitle="Local rarity based on movement frequency" />
        </Card>
        <View style={{ paddingHorizontal: space.lg, gap: space.md }}>
          <T v="h3">Comments ({comments.length})</T>
          {comments.length === 0 && <T muted>No comments yet — start the conversation.</T>}
          {comments.map((c) => {
            const me = c.userId === 'me';
            const u = userById[c.userId];
            return (
              <View key={c.id} style={{ flexDirection: 'row', gap: 10 }}>
                <Tap onPress={() => router.push(me ? '/profile' : `/user/${c.userId}`)}><Avatar userId={c.userId} size={34} /></Tap>
                <View style={{ flex: 1, gap: 2 }}>
                  <T v="smallMedium">{me ? profile?.username : u?.username} <T v="caption" dim>· {timeAgo(c.createdAt)}</T></T>
                  <T>{c.text}</T>
                  <View style={{ flexDirection: 'row', gap: 14, marginTop: 2 }}>
                    <T v="caption" muted><Ionicons name="heart-outline" size={11} /> {c.likes}</T>
                    {!me && <Tap onPress={() => router.push(`/report?type=comment&id=${c.id}`)}><T v="caption" muted>Report</T></Tap>}
                  </View>
                </View>
              </View>
            );
          })}
          <View style={{ flexDirection: 'row', gap: 8, alignItems: 'flex-end', marginTop: space.md }}>
            <Input style={{ flex: 1 }} placeholder="Add a comment…" value={text} onChangeText={setText} onSubmitEditing={send} returnKeyType="send" maxLength={400} />
            <Button title="Post" small full={false} onPress={send} disabled={!text.trim()} style={{ marginBottom: 4 }} />
          </View>
          <T v="caption" dim>Be kind. Comments are moderated under the community guidelines.</T>
        </View>
      </View>
    </Screen>
  );
}
