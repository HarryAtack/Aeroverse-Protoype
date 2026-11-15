import React, { useState } from 'react';
import { ScrollView, Share, StyleSheet, useWindowDimensions, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, radius, space } from '@/theme/tokens';
import type { Post } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, EmptyState, IconButton, Pill, ProgressBar, Segmented, Stat, Tap } from '@/components/ui/primitives';
import { ActionSheet, Sheet, goBack } from '@/components/ui/Screen';
import { Avatar, DemoTag, Photo } from '@/components/aviation';
import { achievements } from '@/data/community';
import { airportById, aircraftTypes, typeById } from '@/data/catalog';
import { useApp, totalXp } from '@/store/useApp';
import { levelFromXp } from '@/services/xp';
import { compact } from '@/utils/format';

export interface ProfileModel {
  id: string;
  isMe: boolean;
  isDemo: boolean;
  username: string;
  displayName: string;
  bio: string;
  homeAirportId: string;
  coverPhotoId?: string;
  favouriteTypeId?: string;
  xp: number;
  followers: number;
  following: number;
  aircraftCollected: number;
  airportsVisited: string[];
  plus?: boolean;
  verified?: boolean;
  posts: Post[];
  specialties?: string[];
  typesCollected: number;
}

const tierColor = { bronze: '#CD8A4A', silver: '#C9D3E3', gold: '#FFB547', platinum: '#5CE1FF' } as const;

export function ProfileView({ m, isTab }: { m: ProfileModel; isTab?: boolean }) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const following = useApp((s) => !!s.follows[m.id]);
  const notify = useApp((s) => !!s.notifyUsers[m.id]);
  const myXp = useApp(totalXp);
  const myCollection = useApp((s) => s.collection);
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  const [tab, setTab] = useState<'portfolio' | 'badges' | 'airports'>('portfolio');
  const [menu, setMenu] = useState(false);
  const [compare, setCompare] = useState(false);
  const lvl = levelFromXp(m.xp);
  const home = airportById[m.homeAirportId];
  const fav = m.favouriteTypeId ? typeById[m.favouriteTypeId] : undefined;
  const completion = m.typesCollected / aircraftTypes.length;
  const col = Math.min(width, 640);
  const share = () => Share.share({ message: `Check out @${m.username} on AeroVerse — aeroverse://user/${m.id}` }).catch(() => {});
  const { toggleFollow, toggleNotifyUser, block, showToast } = useApp.getState();
  const myTypes = new Set(myCollection.map((c) => c.typeId)).size;

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <ScrollView contentContainerStyle={{ paddingBottom: insets.bottom + 120, maxWidth: 640, width: '100%', alignSelf: 'center' }} showsVerticalScrollIndicator={false}>
        <View style={{ height: 200 + insets.top }}>
          {m.coverPhotoId ? <Photo id={m.coverPhotoId} style={StyleSheet.absoluteFill} credit="compact" /> : <LinearGradient colors={['#13284A', colors.bg]} style={StyleSheet.absoluteFill} />}
          <LinearGradient colors={['rgba(5,8,15,0.5)', 'rgba(5,8,15,0.1)', colors.bg]} style={StyleSheet.absoluteFill} />
          <View style={{ position: 'absolute', top: insets.top + 8, left: space.lg, right: space.lg, flexDirection: 'row', justifyContent: 'space-between' }}>
            {isTab ? <View /> : <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack()} />}
            <View style={{ flexDirection: 'row', gap: 8 }}>
              <IconButton icon="share-outline" accessibilityLabel="Share profile" onPress={share} />
              {m.isMe ? (
                <>
                  <IconButton icon="notifications-outline" accessibilityLabel="Notifications" badge={unread} onPress={() => router.push('/notifications')} />
                  <IconButton icon="settings-outline" accessibilityLabel="Settings" onPress={() => router.push('/settings')} />
                </>
              ) : (
                <IconButton icon="ellipsis-horizontal" accessibilityLabel="More options" onPress={() => setMenu(true)} />
              )}
            </View>
          </View>
        </View>

        <View style={{ paddingHorizontal: space.lg, marginTop: -54, gap: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' }}>
            <Avatar userId={m.isMe ? 'me' : m.id} size={96} ring />
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 6 }}>
              {m.isMe ? (
                <Button title="Edit profile" icon="create-outline" small full={false} variant="secondary" onPress={() => router.push('/settings/edit-profile')} />
              ) : (
                <>
                  <Button title={following ? 'Following' : 'Follow'} icon={following ? 'checkmark' : 'person-add-outline'} small full={false} variant={following ? 'secondary' : 'primary'} onPress={() => { toggleFollow(m.id); showToast(following ? `Unfollowed @${m.username}` : `Following @${m.username}`); }} />
                  <IconButton icon={notify ? 'notifications' : 'notifications-outline'} color={notify ? colors.cyan : colors.text} accessibilityLabel={notify ? 'Turn off post notifications' : 'Get notified when they post'} onPress={() => { toggleNotifyUser(m.id); showToast(notify ? 'Post notifications off' : `You’ll be notified when @${m.username} posts`, 'info'); }} size={38} />
                </>
              )}
            </View>
          </View>
          <View style={{ gap: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <T v="h2">{m.displayName}</T>
              {m.verified && <Ionicons name="checkmark-circle" size={18} color={colors.cyan} />}
              {m.plus && <Pill label="PLUS" color={colors.sim} icon="diamond" />}
              {m.isDemo && <DemoTag />}
            </View>
            <T v="bodyMedium" muted>@{m.username}</T>
          </View>
          {!!m.bio && <T>{m.bio}</T>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
            {home && <Chip small icon="location-outline" label={`${home.iata} · ${home.city}`} onPress={() => router.push(`/airports/${home.id}`)} />}
            {fav && <Chip small icon="heart-outline" label={fav.variant} onPress={() => router.push(`/aircraft/${fav.id}`)} />}
            {m.specialties?.map((s) => <Chip key={s} small label={s} />)}
          </View>

          <Card style={{ flexDirection: 'row' }}>
            <Stat value={m.aircraftCollected} label="Aircraft" />
            <Tap style={{ flex: 1 }} onPress={() => showToast(`${compact(m.followers)} followers`, 'info')}><Stat value={compact(m.followers)} label="Followers" /></Tap>
            <Stat value={compact(m.following)} label="Following" />
            <Stat value={m.airportsVisited.length} label="Airports" />
          </Card>

          <Card style={{ gap: 10 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <T v="title">Level {lvl.level}</T>
              <T v="small" muted>{m.xp.toLocaleString()} XP total</T>
            </View>
            <ProgressBar value={lvl.progress} />
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
              <T v="small" muted>Collection completion</T>
              <T v="smallMedium">{Math.round(completion * 100)}%</T>
            </View>
            <ProgressBar value={completion} color={colors.success} />
            {m.isMe ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 6 }}>
                <Button title="Hangar" icon="albums-outline" small variant="secondary" onPress={() => router.push('/collection')} style={{ flex: 1 }} />
                <Button title="Challenges" icon="flag-outline" small variant="secondary" onPress={() => router.push('/challenges')} style={{ flex: 1 }} />
              </View>
            ) : (
              <Button title="Compare stats" icon="git-compare-outline" small variant="secondary" onPress={() => setCompare(true)} />
            )}
          </Card>
        </View>

        <View style={{ padding: space.lg }}>
          <Segmented value={tab} onChange={setTab} options={[{ key: 'portfolio', label: 'Portfolio' }, { key: 'badges', label: 'Achievements' }, { key: 'airports', label: 'Airports' }]} />
        </View>

        {tab === 'portfolio' && (
          m.posts.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 3, paddingHorizontal: space.lg }}>
              {m.posts.map((p) => (
                <Tap key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ width: (col - space.lg * 2 - 6) / 3, aspectRatio: 1, borderRadius: 6, overflow: 'hidden' }}>
                  <Photo id={p.photoId} style={StyleSheet.absoluteFill} credit={false} />
                </Tap>
              ))}
            </View>
          ) : (
            <EmptyState icon="images-outline" title="No photos yet" body={m.isMe ? 'Upload your first aircraft photo to start your portfolio.' : 'This user hasn’t posted yet.'} action={m.isMe ? 'Upload' : undefined} onAction={() => router.push('/upload')} />
          )
        )}
        {tab === 'badges' && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, paddingHorizontal: space.lg }}>
            {achievements.slice(0, m.isMe ? 12 : 8).map((a, i) => {
              const unlocked = m.isMe ? !!a.unlockedAt : i % 3 !== 2;
              return (
                <Tap key={a.id} onPress={() => router.push('/achievements')} style={{ width: (col - space.lg * 2 - 30) / 4, alignItems: 'center', gap: 4, opacity: unlocked ? 1 : 0.4 }}>
                  <View style={[styles.badge, { borderColor: tierColor[a.tier] }]}><Ionicons name={a.icon as never} size={22} color={tierColor[a.tier]} /></View>
                  <T v="caption" center numberOfLines={2}>{a.name}</T>
                </Tap>
              );
            })}
          </View>
        )}
        {tab === 'airports' && (
          <View style={{ paddingHorizontal: space.lg, gap: 8 }}>
            {m.airportsVisited.length === 0 && <EmptyState icon="business-outline" title="No airport visits yet" body="Check in at spotting locations to log your airport visits." />}
            {m.airportsVisited.map((id) => {
              const a = airportById[id];
              if (!a) return null;
              return (
                <Card key={id} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }} onPress={() => router.push(`/airports/${id}`)}>
                  <Photo id={a.photoId} style={{ width: 64, height: 46, borderRadius: 10 }} credit={false} />
                  <View style={{ flex: 1 }}>
                    <T v="title">{a.name}</T>
                    <T v="small" muted>{a.iata} · {a.country}</T>
                  </View>
                  {id === m.homeAirportId && <Pill label="Home" color={colors.cyan} />}
                </Card>
              );
            })}
          </View>
        )}
      </ScrollView>
      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title={`@${m.username}`}
        actions={[
          { label: 'Share profile', icon: 'share-outline', onPress: share },
          { label: 'Compare stats', icon: 'git-compare-outline', onPress: () => setCompare(true) },
          { label: 'Report user', icon: 'flag-outline', danger: true, onPress: () => router.push(`/report?type=user&id=${m.id}`) },
          { label: 'Block user', icon: 'ban-outline', danger: true, onPress: () => { block(m.id); showToast(`@${m.username} blocked. Manage in Settings → Blocked users.`, 'info'); goBack(); } },
        ]}
      />
      <Sheet visible={compare} onClose={() => setCompare(false)} title="Compare stats">
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: space.md }}>
          <View style={{ alignItems: 'center', flex: 1, gap: 4 }}><Avatar userId="me" size={48} /><T v="smallMedium">You</T></View>
          <View style={{ alignItems: 'center', flex: 1, gap: 4 }}><Avatar userId={m.id} size={48} /><T v="smallMedium">@{m.username}</T></View>
        </View>
        {[
          ['Level', levelFromXp(myXp).level, lvl.level],
          ['Total XP', myXp, m.xp],
          ['Aircraft collected', myCollection.length, m.aircraftCollected],
          ['Variants', myTypes, m.typesCollected],
          ['Airports', useApp.getState().profile ? new Set(myCollection.map((c) => c.airportId)).size : 0, m.airportsVisited.length],
        ].map(([k, a, b]) => {
          const av = Number(a), bv = Number(b);
          return (
            <View key={String(k)} style={{ marginBottom: 12, gap: 6 }}>
              <T v="caption" muted center>{k}</T>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <T v="data" style={{ width: 70, textAlign: 'right' }} color={av >= bv ? colors.cyan : colors.text}>{av.toLocaleString()}</T>
                <View style={{ flex: 1, flexDirection: 'row', height: 8, borderRadius: 4, overflow: 'hidden', backgroundColor: colors.surface3 }}>
                  <View style={{ flex: av || 0.0001, backgroundColor: colors.cyan }} />
                  <View style={{ flex: bv || 0.0001, backgroundColor: colors.review }} />
                </View>
                <T v="data" style={{ width: 70 }} color={bv > av ? colors.review : colors.text}>{bv.toLocaleString()}</T>
              </View>
            </View>
          );
        })}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: { width: 56, height: 56, borderRadius: 28, borderWidth: 2, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface },
});
void gradients; void radius;
