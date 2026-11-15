import React, { useMemo, useState } from 'react';
import { FlatList, RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, gradients, radius, space } from '@/theme/tokens';
import type { Post } from '@/types/domain';
import { T } from '@/components/ui/Text';
import { Button, Card, IconButton, ProgressBar, SectionHeader, Segmented, Skeleton, Tap } from '@/components/ui/primitives';
import { Sheet } from '@/components/ui/Screen';
import { Avatar, Photo, PostCard, RarityBadge, VerificationBadge } from '@/components/aviation';
import { LogoLockup } from '@/components/brand/Logo';
import { demoPosts } from '@/data/posts';
import { demoUsers, userById } from '@/data/users';
import { airports, airlineById, airportById, typeById, typeLabel } from '@/data/catalog';
import { announcements, challenges, competitions } from '@/data/community';
import { useApp } from '@/store/useApp';
import { localRarity } from '@/services/rarity';
import { compact, timeAgo } from '@/utils/format';

type Feed = 'foryou' | 'following' | 'rare';

export default function Home() {
  const insets = useSafeAreaInsets();
  const [feed, setFeed] = useState<Feed>('foryou');
  const [refreshing, setRefreshing] = useState(false);
  const [collectPost, setCollectPost] = useState<Post | null>(null);
  const myPosts = useApp((s) => s.myPosts);
  const blocked = useApp((s) => s.blocked);
  const hidden = useApp((s) => s.hiddenPosts);
  const follows = useApp((s) => s.follows);
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  const profile = useApp((s) => s.profile);
  const home = airportById[profile?.homeAirportId ?? 'EGCC'];

  const posts = useMemo(() => {
    let list = [...myPosts, ...demoPosts].filter((p) => !blocked.includes(p.userId) && !hidden.includes(p.id));
    if (feed === 'following') list = list.filter((p) => follows[p.userId] || p.userId === 'me');
    if (feed === 'rare') list = list.filter((p) => p.rare || ['epic', 'legendary', 'special'].includes(localRarity(p.typeId, p.airportId, p.registration)));
    return list;
  }, [myPosts, blocked, hidden, feed, follows]);

  const refresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 900);
  };

  const modules: Record<number, React.ReactNode> = {
    0: <TrendingAircraft key="m0" />,
    2: <Photographers key="m1" />,
    4: <VerifiedSightings key="m2" homeId={home?.id} />,
    6: <FeaturedAirports key="m3" />,
    8: <Announcement key="m4" />,
    10: <RecommendedUsers key="m5" />,
  };

  const header = (
    <View>
      <FeaturedHero />
      <ChallengesStrip />
      <View style={{ paddingHorizontal: space.lg, marginBottom: space.lg }}>
        <Segmented<Feed> value={feed} onChange={setFeed} options={[{ key: 'foryou', label: 'For you' }, { key: 'following', label: 'Following' }, { key: 'rare', label: 'Rare' }]} />
      </View>
      {refreshing && (
        <View style={{ paddingHorizontal: space.lg, gap: 10, marginBottom: space.lg }}>
          <Skeleton height={44} />
          <Skeleton height={220} radius={20} />
        </View>
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={[styles.top, { paddingTop: insets.top + 6 }]}>
        <LogoLockup size={26} />
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <IconButton icon="search" accessibilityLabel="Search" onPress={() => router.push('/search')} />
          <IconButton icon="notifications-outline" accessibilityLabel={`Notifications, ${unread} unread`} badge={unread} onPress={() => router.push('/notifications')} />
        </View>
      </View>
      <FlatList
        data={posts}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.cyan} />}
        renderItem={({ item, index }) => (
          <View>
            <PostCard post={item} onCollect={setCollectPost} />
            {feed === 'foryou' && modules[index]}
          </View>
        )}
        ListEmptyComponent={
          <Card style={{ marginHorizontal: space.lg, alignItems: 'center', gap: 10 }}>
            <Ionicons name="people-outline" size={28} color={colors.cyan} />
            <T v="h3" center>{feed === 'following' ? 'Your following feed is quiet' : 'Nothing rare right now'}</T>
            <T muted center>{feed === 'following' ? 'Follow photographers and airport regulars to fill this feed.' : 'We’ll alert you when something unusual appears.'}</T>
            <Button title="Discover photographers" small full={false} onPress={() => router.push('/photographers')} />
          </Card>
        }
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      />
      <Tap onPress={() => router.push('/upload')} style={[styles.fab, { bottom: insets.bottom + 86 }]} accessibilityLabel="Upload an aircraft photo">
        <LinearGradient colors={[colors.cyan, colors.primary]} style={styles.fabInner}>
          <Ionicons name="camera" size={22} color="#fff" />
          <T v="title" style={{ color: '#fff' }}>Upload</T>
        </LinearGradient>
      </Tap>
      <CollectSheet post={collectPost} onClose={() => setCollectPost(null)} />
    </View>
  );
}

function CollectSheet({ post, onClose }: { post: Post | null; onClose: () => void }) {
  const wishlist = useApp((s) => s.wishlist);
  if (!post) return null;
  const t = typeById[post.typeId];
  const onList = wishlist.includes(post.typeId);
  return (
    <Sheet visible={!!post} onClose={onClose} title="Collect this aircraft">
      <View style={{ gap: space.md }}>
        <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Photo id={post.photoId} style={{ width: 88, height: 64, borderRadius: 12 }} credit={false} />
          <View style={{ flex: 1 }}>
            <T v="title">{typeLabel(post.typeId)}</T>
            <T v="small" muted>{airlineById[post.airlineId]?.name}{post.registration ? ` · ${post.registration}` : ''}</T>
          </View>
        </View>
        <T v="small" muted>AeroVerse collections are built from your own verified sightings. Seen this aircraft yourself? Upload your photo to add it to your hangar.</T>
        <Button title="Log my own sighting" icon="camera-outline" onPress={() => { onClose(); router.push(`/upload?type=${post.typeId}&reg=${post.registration ?? ''}`); }} />
        <Button
          title={onList ? 'On your wanted list' : `Add ${t?.variant ?? 'type'} to wanted list`}
          icon={onList ? 'checkmark-circle' : 'star-outline'}
          variant="secondary"
          onPress={() => { useApp.getState().toggleWishlist(post.typeId); useApp.getState().showToast(onList ? 'Removed from wanted list' : 'Added to wanted list — we’ll alert you when one is near', 'info'); onClose(); }}
        />
        <Button title="View aircraft details" variant="ghost" onPress={() => { onClose(); router.push(`/aircraft/${post.typeId}`); }} />
      </View>
    </Sheet>
  );
}

function FeaturedHero() {
  const c = competitions[3];
  const winner = c.entries[0];
  const u = userById[winner.userId];
  return (
    <Tap onPress={() => router.push(`/competitions/${c.id}`)} style={{ marginHorizontal: space.lg, marginBottom: space.lg, borderRadius: radius.xxl, overflow: 'hidden' }} accessibilityLabel="Featured photograph">
      <Photo id={winner.photoId} style={{ height: 230 }}>
        <LinearGradient colors={gradients.cardShade as unknown as [string, string, string]} style={StyleSheet.absoluteFill} />
        <View style={{ position: 'absolute', top: 14, left: 14, flexDirection: 'row', gap: 6 }}>
          <View style={styles.featuredPill}><Ionicons name="trophy" size={12} color={colors.sim} /><T v="caption" color={colors.sim}>FEATURED PHOTO</T></View>
        </View>
        <View style={{ position: 'absolute', left: 16, right: 16, bottom: 22 }}>
          <T v="h2">“{winner.title}”</T>
          <T v="small" muted>Winner · {c.title} competition · by @{u?.username}</T>
        </View>
      </Photo>
    </Tap>
  );
}

function ChallengesStrip() {
  const progress = useApp((s) => s.challengeProgress);
  const list = challenges.filter((c) => c.period === 'daily' || c.period === 'weekly');
  return (
    <View style={{ marginBottom: space.lg }}>
      <SectionHeader title="Today’s challenges" overline="Daily & weekly" action="All challenges" onAction={() => router.push('/challenges')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 10 }}>
        {list.map((c) => {
          const p = Math.min(c.target, progress[c.id] ?? c.progress);
          return (
            <Card key={c.id} style={{ width: 220, gap: 8 }} onPress={() => router.push('/challenges')}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={styles.chIcon}><Ionicons name={c.icon as never} size={16} color={colors.cyan} /></View>
                <T v="caption" color={colors.sim}>+{c.rewardXp} XP</T>
              </View>
              <T v="title" numberOfLines={1}>{c.title}</T>
              <T v="small" muted numberOfLines={2} style={{ minHeight: 36 }}>{c.description}</T>
              <ProgressBar value={p / c.target} />
              <T v="caption" muted>{p}/{c.target} · ends {timeAgo(c.endsAt)}</T>
            </Card>
          );
        })}
      </ScrollView>
    </View>
  );
}

function TrendingAircraft() {
  const items = ['b747-8f', 'a350-1000', 'b787-10', 'concorde', 'an124', 'b757-200'];
  return (
    <View style={{ marginBottom: space.xl }}>
      <SectionHeader title="Trending aircraft" overline="This week" action="Explore" onAction={() => router.push('/explore')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 10 }}>
        {items.map((id, i) => {
          const t = typeById[id];
          return (
            <Tap key={id} onPress={() => router.push(`/aircraft/${id}`)} style={{ width: 150 }}>
              <Photo id={t.photoId} style={{ height: 110, borderRadius: 16 }} credit={false}>
                <View style={{ position: 'absolute', top: 8, left: 8 }}><RarityBadge rarity={t.baseRarity} small /></View>
              </Photo>
              <T v="title" numberOfLines={1} style={{ marginTop: 8 }}>{t.variant}</T>
              <T v="caption" muted>↑ {[38, 31, 22, 18, 14, 11][i]}% sightings</T>
            </Tap>
          );
        })}
      </ScrollView>
    </View>
  );
}

function Photographers() {
  const list = demoUsers.filter((u) => u.photographer).slice(0, 6);
  return (
    <View style={{ marginBottom: space.xl }}>
      <SectionHeader title="Popular photographers" action="Discover" onAction={() => router.push('/photographers')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 10 }}>
        {list.map((u) => (
          <Tap key={u.id} onPress={() => router.push(`/user/${u.id}`)} style={{ width: 170, borderRadius: 18, overflow: 'hidden', backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border }}>
            <Photo id={u.coverPhotoId} style={{ height: 90 }} credit={false} />
            <View style={{ padding: 12, marginTop: -30, gap: 4 }}>
              <Avatar userId={u.id} size={44} ring />
              <T v="title" numberOfLines={1}>@{u.username}</T>
              <T v="caption" muted numberOfLines={1}>{u.specialties?.join(' · ')}</T>
              <T v="caption" color={colors.cyan}>{compact(u.followers)} followers</T>
            </View>
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
}

function VerifiedSightings({ homeId }: { homeId?: string }) {
  const list = demoPosts.filter((p) => p.verification === 'community_verified' || p.verification === 'registration_identified').slice(0, 4);
  const home = homeId ? airportById[homeId] : undefined;
  return (
    <View style={{ marginHorizontal: space.lg, marginBottom: space.xl, gap: space.md }}>
      <Card style={{ flexDirection: 'row', gap: 12, alignItems: 'center', borderColor: 'rgba(255,181,71,0.35)', backgroundColor: 'rgba(255,181,71,0.06)' }} onPress={() => router.push('/aircraft/an124')}>
        <Ionicons name="alert-circle" size={26} color={colors.sim} />
        <View style={{ flex: 1 }}>
          <T v="title">Rare alert · {home?.iata ?? 'MAN'}</T>
          <T v="small" muted>An Antonov An-124 is expected tomorrow (demo alert based on sample schedule data).</T>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textDim} />
      </Card>
      <T v="h3">Recent verified sightings</T>
      {list.map((p) => (
        <Tap key={p.id} onPress={() => router.push(`/post/${p.id}`)} style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
          <Photo id={p.photoId} style={{ width: 64, height: 48, borderRadius: 10 }} credit={false} />
          <View style={{ flex: 1 }}>
            <T v="bodyMedium" numberOfLines={1}>{typeById[p.typeId]?.variant} · {p.registration}</T>
            <T v="small" muted numberOfLines={1}>{airlineById[p.airlineId]?.name} · {airportById[p.airportId]?.iata} · {timeAgo(p.takenAt)}</T>
          </View>
          <VerificationBadge stage={p.verification} compact />
        </Tap>
      ))}
    </View>
  );
}

function FeaturedAirports() {
  return (
    <View style={{ marginBottom: space.xl }}>
      <SectionHeader title="Featured airports" action="All communities" onAction={() => router.push('/airports')} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: space.lg, gap: 10 }}>
        {airports.slice(0, 8).map((a) => (
          <Tap key={a.id} onPress={() => router.push(`/airports/${a.id}`)} style={{ width: 200, borderRadius: 18, overflow: 'hidden' }}>
            <Photo id={a.photoId} style={{ height: 120 }} credit={false}>
              <LinearGradient colors={gradients.cardShade as unknown as [string, string, string]} style={StyleSheet.absoluteFill} />
              <View style={{ position: 'absolute', left: 12, bottom: 10 }}>
                <T v="dataLarge">{a.iata}</T>
                <T v="caption" muted>{a.city} · {compact(a.members)} members</T>
              </View>
            </Photo>
          </Tap>
        ))}
      </ScrollView>
    </View>
  );
}

function Announcement() {
  const a = announcements[0];
  return (
    <Card style={{ marginHorizontal: space.lg, marginBottom: space.xl, overflow: 'hidden' }} onPress={() => router.push(a.route as never)}>
      <LinearGradient colors={['rgba(61,139,255,0.22)', 'rgba(61,139,255,0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
        <View style={styles.chIcon}><Ionicons name="megaphone-outline" size={18} color={colors.cyan} /></View>
        <View style={{ flex: 1 }}>
          <T v="overline" color={colors.cyan}>Community announcement</T>
          <T v="title">{a.title}</T>
          <T v="small" muted>{a.body}</T>
        </View>
      </View>
    </Card>
  );
}

function RecommendedUsers() {
  const follows = useApp((s) => s.follows);
  const list = demoUsers.filter((u) => !follows[u.id] && u.id !== 'u_avteam').slice(0, 5);
  if (!list.length) return null;
  return (
    <View style={{ marginHorizontal: space.lg, marginBottom: space.xl, gap: space.md }}>
      <T v="h3">Recommended for you</T>
      {list.map((u) => (
        <View key={u.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Tap onPress={() => router.push(`/user/${u.id}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
            <Avatar userId={u.id} size={42} />
            <View style={{ flex: 1 }}>
              <T v="bodyMedium">@{u.username}</T>
              <T v="small" muted numberOfLines={1}>{airportById[u.homeAirportId]?.iata} · {u.bio}</T>
            </View>
          </Tap>
          <Button title="Follow" small full={false} onPress={() => { useApp.getState().toggleFollow(u.id); useApp.getState().showToast(`Following @${u.username}`); }} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: 10, backgroundColor: colors.bg },
  fab: { position: 'absolute', right: space.lg, borderRadius: 28, overflow: 'hidden', shadowColor: colors.primary, shadowOpacity: 0.5, shadowRadius: 16, shadowOffset: { width: 0, height: 6 }, elevation: 8 },
  fabInner: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, height: 54 },
  featuredPill: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(5,8,15,0.7)', borderWidth: 1, borderColor: 'rgba(255,181,71,0.45)' },
  chIcon: { width: 32, height: 32, borderRadius: 10, backgroundColor: 'rgba(92,225,255,0.1)', alignItems: 'center', justifyContent: 'center' },
});
