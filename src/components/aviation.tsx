import React, { useMemo, useRef, useState } from 'react';
import { Animated, Pressable, Share, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Defs, G, LinearGradient as SvgLG, Path, Rect, Stop } from 'react-native-svg';
import { router } from 'expo-router';
import { colors, fonts, gradients, radius, rarityColors, space } from '@/theme/tokens';
import type { Post, Rarity, TradingCard, VerificationStage } from '@/types/domain';
import { getPhoto } from '@/data/photos';
import { airlineById, airportById, typeById, manufacturerById } from '@/data/catalog';
import { userById } from '@/data/users';
import { rarityLabel, localRarity } from '@/services/rarity';
import { useApp } from '@/store/useApp';
import { T } from './ui/Text';
import { ActionSheet } from './ui/Screen';
import { haptic, IconName, Pill, Tap } from './ui/primitives';
import { AIRCRAFT_PATH } from './brand/Logo';
import { timeAgo, compact } from '@/utils/format';

/* ---------------- Avatar ---------------- */

export function Avatar({ userId, size = 40, ring, uri, name, colorsOverride }: { userId?: string; size?: number; ring?: boolean; uri?: string; name?: string; colorsOverride?: [string, string] }) {
  const me = useApp((s) => s.profile);
  const isMe = userId === 'me' || (me && userId === me.id);
  const u = userId && !isMe ? userById[userId] : undefined;
  const label = (isMe ? me?.displayName || me?.username : u?.displayName ?? name) ?? '?';
  const grad = colorsOverride ?? (isMe ? me?.avatarColor : u?.avatarColor) ?? ['#3D8BFF', '#5CE1FF'];
  const img = uri ?? (isMe ? me?.avatarUri : undefined);
  const initials = label.split(/[\s_]+/).map((w) => w[0]).join('').slice(0, 2).toUpperCase();
  return (
    <View style={[{ width: size, height: size, borderRadius: size / 2, padding: ring ? 2 : 0 }, ring && { backgroundColor: colors.cyan }]} accessibilityLabel={`${label} avatar`}>
      {img ? (
        <Image source={{ uri: img }} style={{ flex: 1, borderRadius: size / 2 }} />
      ) : (
        <LinearGradient colors={grad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ flex: 1, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center', borderWidth: ring ? 2 : 0, borderColor: colors.bg }}>
          <T style={{ fontFamily: fonts.display, fontSize: size * 0.36, color: '#fff' }}>{initials}</T>
        </LinearGradient>
      )}
    </View>
  );
}

/* ---------------- Aircraft art fallback ---------------- */

export function AircraftArt({ style, tint = colors.primary, label }: { style?: StyleProp<ViewStyle>; tint?: string; label?: string }) {
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: colors.surface2 }, style]}>
      <Svg width="100%" height="100%" viewBox="0 0 160 100" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgLG id="sky" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#13284A" />
            <Stop offset="1" stopColor="#060A14" />
          </SvgLG>
          <SvgLG id="pl" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <Stop offset="1" stopColor={tint} stopOpacity="0.35" />
          </SvgLG>
        </Defs>
        <Rect x="0" y="0" width="160" height="100" fill="url(#sky)" />
        {[20, 40, 60, 80].map((y) => <Path key={y} d={`M0 ${y} H160`} stroke="#3D8BFF" strokeOpacity="0.07" />)}
        {[30, 60, 90, 120].map((x) => <Path key={x} d={`M${x} 0 V100`} stroke="#3D8BFF" strokeOpacity="0.07" />)}
        <G transform="translate(48 18) scale(0.64) rotate(60 50 50)">
          <Path d={AIRCRAFT_PATH} fill="url(#pl)" />
        </G>
      </Svg>
      {label && (
        <View style={{ position: 'absolute', bottom: 8, left: 10 }}>
          <T v="caption" muted>{label}</T>
        </View>
      )}
    </View>
  );
}

/* ---------------- Photo with attribution ---------------- */

export function Photo({ id, style, credit = true, contentFit = 'cover', children, rounded }: { id?: string; style?: StyleProp<ViewStyle>; credit?: boolean | 'compact'; contentFit?: 'cover' | 'contain'; children?: React.ReactNode; rounded?: number }) {
  const p = getPhoto(id);
  if (!p) return <AircraftArt style={[style, rounded ? { borderRadius: rounded } : null]} label="Photo not yet available" />;
  return (
    <View style={[{ overflow: 'hidden', backgroundColor: colors.surface2 }, style, rounded ? { borderRadius: rounded } : null]}>
      <Image source={p.source} style={StyleSheet.absoluteFill} contentFit={contentFit} transition={250} accessibilityLabel={p.title ?? 'Aircraft photograph'} />
      {children}
      {credit && p.author !== 'You' && (
        <View style={[styles.credit, credit === 'compact' && { paddingVertical: 1 }]} pointerEvents="none">
          <T v="caption" style={{ fontSize: 9, lineHeight: 12, color: 'rgba(255,255,255,0.85)' }} numberOfLines={1}>
            © {p.author} · {p.license}{credit === 'compact' ? '' : ' · Wikimedia Commons'}
          </T>
        </View>
      )}
    </View>
  );
}

/* ---------------- Badges ---------------- */

export const verificationMeta: Record<VerificationStage, { label: string; color: string; icon: IconName; description: string }> = {
  detected: { label: 'Aircraft detected', color: colors.steel, icon: 'scan-outline', description: 'An aircraft is present, but nothing more has been confirmed.' },
  type_identified: { label: 'Type identified', color: colors.cyan, icon: 'airplane-outline', description: 'Manufacturer and aircraft family identified with high confidence.' },
  variant_identified: { label: 'Variant identified', color: colors.primary, icon: 'layers-outline', description: 'The specific variant was identified with high confidence.' },
  registration_identified: { label: 'Registration identified', color: colors.success, icon: 'barcode-outline', description: 'Registration read by OCR and matched to the database, with consistent type.' },
  community_verified: { label: 'Community verified', color: colors.success, icon: 'shield-checkmark', description: 'Confirmed by trusted community reviewers.' },
  needs_review: { label: 'Needs human review', color: colors.review, icon: 'people-outline', description: 'Confidence too low for automatic identification. Queued for community review.' },
  unverified: { label: 'Unverified', color: colors.textDim, icon: 'help-circle-outline', description: 'Not yet checked.' },
};

export function VerificationBadge({ stage, compact: c }: { stage: VerificationStage; compact?: boolean }) {
  const m = verificationMeta[stage];
  if (c) return <Ionicons name={m.icon} size={14} color={m.color} accessibilityLabel={m.label} />;
  return <Pill label={m.label} color={m.color} icon={m.icon} />;
}

export function RarityBadge({ rarity, small }: { rarity: Rarity; small?: boolean }) {
  const c = rarityColors[rarity];
  return <Pill label={small ? rarityLabel[rarity].replace(' Edition', '') : rarityLabel[rarity]} color={c} icon={rarity === 'special' ? 'sparkles' : rarity === 'legendary' ? 'star' : 'diamond-outline'} />;
}

export function SimBadge({ label = 'SIMULATED', style }: { label?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, backgroundColor: 'rgba(255,181,71,0.16)', borderWidth: 1, borderColor: 'rgba(255,181,71,0.5)', alignSelf: 'flex-start' }, style]}>
      <Ionicons name="flask-outline" size={11} color={colors.sim} />
      <T v="caption" color={colors.sim} style={{ fontFamily: fonts.mono, letterSpacing: 1 }}>{label}</T>
    </View>
  );
}

export function DemoTag() {
  return <Pill label="Demo" color={colors.steel} />;
}

/* ---------------- Post card ---------------- */

export function PostCard({ post, onCollect }: { post: Post; onCollect?: (p: Post) => void }) {
  const liked = useApp((s) => !!s.likes[post.id]);
  const saved = useApp((s) => !!s.saves[post.id]);
  const following = useApp((s) => !!s.follows[post.userId]);
  const myComments = useApp((s) => s.comments[post.id]?.length ?? 0);
  const { toggleLike, toggleSave, toggleFollow, hidePost, block, report, showToast } = useApp.getState();
  const [menu, setMenu] = useState(false);
  const heart = useRef(new Animated.Value(0)).current;
  const lastTap = useRef(0);
  const isMine = post.userId === 'me';
  const u = isMine ? undefined : userById[post.userId];
  const t = typeById[post.typeId];
  const al = airlineById[post.airlineId];
  const ap = airportById[post.airportId];
  const rarity = useMemo(() => localRarity(post.typeId, post.airportId, post.registration), [post]);

  const like = () => {
    if (!liked) {
      heart.setValue(0);
      Animated.sequence([Animated.spring(heart, { toValue: 1, useNativeDriver: true }), Animated.timing(heart, { toValue: 0, duration: 300, delay: 300, useNativeDriver: true })]).start();
    }
    toggleLike(post.id);
  };
  const onImagePress = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) { if (!liked) like(); haptic('medium'); }
    else setTimeout(() => { if (Date.now() - lastTap.current >= 300) router.push(`/post/${post.id}`); }, 310);
    lastTap.current = now;
  };
  const share = async () => {
    try {
      await Share.share({ message: `${t?.variant ?? 'Aircraft'}${post.registration ? ` ${post.registration}` : ''} at ${ap?.iata ?? ''} on AeroVerse — aeroverse://post/${post.id}` });
    } catch {}
  };

  return (
    <View style={styles.post}>
      <View style={styles.postHead}>
        <Tap onPress={() => router.push(isMine ? '/profile' : `/user/${post.userId}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flex: 1 }}>
          <Avatar userId={post.userId} size={38} />
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <T v="title" numberOfLines={1}>{isMine ? useApp.getState().profile?.username ?? 'you' : u?.username}</T>
              {u?.verifiedContributor && <Ionicons name="checkmark-circle" size={14} color={colors.cyan} />}
            </View>
            <T v="small" muted numberOfLines={1}>{ap?.iata ?? ''} · {post.location} · {timeAgo(post.takenAt)}</T>
          </View>
        </Tap>
        {!isMine && !following && (
          <Tap onPress={() => { toggleFollow(post.userId); showToast(`Following ${u?.username}`); }} style={styles.followBtn} accessibilityLabel={`Follow ${u?.username}`}>
            <T v="smallMedium" color={colors.primary}>Follow</T>
          </Tap>
        )}
        <Tap onPress={() => setMenu(true)} hitSlop={10} accessibilityLabel="Post options">
          <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
        </Tap>
      </View>

      <Pressable onPress={onImagePress} accessibilityRole="imagebutton" accessibilityLabel="Open post. Double tap to like.">
        <Photo id={post.photoId} style={{ width: '100%', aspectRatio: 4 / 3 }}>
          <LinearGradient colors={gradients.cardShade as unknown as [string, string, string]} style={[StyleSheet.absoluteFill, { top: '45%' }]} />
          <View style={{ position: 'absolute', top: 12, left: 12, flexDirection: 'row', gap: 6 }}>
            <VerificationBadge stage={post.verification} />
            {(post.rare || rarity === 'legendary' || rarity === 'special' || rarity === 'epic') && <RarityBadge rarity={rarity} small />}
          </View>
          <View style={{ position: 'absolute', left: 14, right: 14, bottom: 22 }}>
            <T v="overline" color={colors.cyan}>{al?.name}</T>
            <T v="h2">{t ? `${manufacturerById[t.manufacturerId]?.name} ${t.variant}` : post.typeId}</T>
            <T v="data" color={colors.silver}>{post.registration ?? 'Registration not confirmed'}</T>
          </View>
          <Animated.View pointerEvents="none" style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: heart, transform: [{ scale: heart.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1.2] }) }] }]}>
            <Ionicons name="heart" size={96} color="#fff" />
          </Animated.View>
        </Photo>
      </Pressable>

      <View style={styles.actions}>
        <Tap onPress={like} style={styles.actionBtn} accessibilityLabel={liked ? 'Unlike' : 'Like'} accessibilityState={{ selected: liked }}>
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={24} color={liked ? colors.live : colors.text} />
          <T v="smallMedium">{compact(post.likes + (liked ? 1 : 0))}</T>
        </Tap>
        <Tap onPress={() => router.push(`/post/${post.id}`)} style={styles.actionBtn} accessibilityLabel="Comments">
          <Ionicons name="chatbubble-outline" size={22} color={colors.text} />
          <T v="smallMedium">{compact(post.comments.length + myComments)}</T>
        </Tap>
        <Tap onPress={share} style={styles.actionBtn} accessibilityLabel="Share">
          <Ionicons name="paper-plane-outline" size={22} color={colors.text} />
          <T v="smallMedium">{compact(post.shares)}</T>
        </Tap>
        <View style={{ flex: 1 }} />
        {onCollect && (
          <Tap onPress={() => onCollect(post)} style={styles.collectBtn} accessibilityLabel="Collect this aircraft">
            <Ionicons name="add-circle" size={18} color={colors.cyan} />
            <T v="smallMedium" color={colors.cyan}>Collect</T>
          </Tap>
        )}
        <Tap onPress={() => toggleSave(post.id)} style={[styles.actionBtn, { marginLeft: 6 }]} accessibilityLabel={saved ? 'Unsave' : 'Save'}>
          <Ionicons name={saved ? 'bookmark' : 'bookmark-outline'} size={22} color={saved ? colors.cyan : colors.text} />
        </Tap>
      </View>
      {!!post.caption && (
        <T v="body" style={{ paddingHorizontal: space.lg, paddingBottom: space.md }} numberOfLines={3}>
          <T v="bodyMedium">{isMine ? 'you' : u?.username} </T>
          {post.caption}
        </T>
      )}
      <ActionSheet
        visible={menu}
        onClose={() => setMenu(false)}
        title="Post options"
        actions={[
          { label: 'Share post', icon: 'share-outline', onPress: share },
          { label: saved ? 'Remove from saved' : 'Save post', icon: 'bookmark-outline', onPress: () => toggleSave(post.id) },
          { label: 'View aircraft type', icon: 'airplane-outline', onPress: () => router.push(`/aircraft/${post.typeId}`) },
          { label: 'Suggest an identification correction', icon: 'create-outline', onPress: () => router.push(`/review?post=${post.id}`) },
          { label: 'Not interested', icon: 'eye-off-outline', onPress: () => { hidePost(post.id); showToast('We’ll show fewer posts like this', 'info'); } },
          ...(isMine ? [] : [
            { label: 'Report post', icon: 'flag-outline' as IconName, danger: true, onPress: () => router.push(`/report?type=post&id=${post.id}`) },
            { label: `Block ${u?.username}`, icon: 'ban-outline' as IconName, danger: true, onPress: () => { block(post.userId); report('user', post.userId, 'blocked'); showToast(`${u?.username} blocked`, 'info'); } },
          ]),
        ]}
      />
    </View>
  );
}

/* ---------------- Trading card ---------------- */

export function TradingCardView({ card, width = 160, count, owned = true, onPress }: { card: TradingCard; width?: number; count?: number; owned?: boolean; onPress?: () => void }) {
  const t = typeById[card.typeId];
  const al = airlineById[card.airlineId];
  const c = rarityColors[card.rarity];
  const h = width * 1.45;
  const p = getPhoto(card.photoId);
  const frame: [string, string, ...string[]] = card.rarity === 'special' ? (gradients.special as unknown as [string, string, string]) : card.rarity === 'legendary' ? ['#FFE3A3', '#FFB547', '#B9771E'] : [c, c + '55', c];
  const body = (
    <LinearGradient colors={frame} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={{ width, height: h, borderRadius: width * 0.08, padding: 3 }}>
      <View style={{ flex: 1, borderRadius: width * 0.07, backgroundColor: '#070B14', overflow: 'hidden' }}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: width * 0.06, paddingTop: width * 0.05 }}>
          <T style={{ fontFamily: fonts.mono, fontSize: width * 0.06, color: c, letterSpacing: 1 }}>{card.number}</T>
          <T style={{ fontFamily: fonts.mono, fontSize: width * 0.055, color: colors.textMuted }}>{rarityLabel[card.rarity].toUpperCase()}</T>
        </View>
        <View style={{ margin: width * 0.05, borderRadius: width * 0.04, overflow: 'hidden', height: h * 0.46, borderWidth: 1, borderColor: c + '66' }}>
          {owned ? <Photo id={card.photoId} style={{ flex: 1 }} credit={false} /> : <AircraftArt style={{ flex: 1 }} tint={c} />}
          {card.rarity === 'special' && owned && (
            <LinearGradient colors={['rgba(92,225,255,0.0)', 'rgba(180,108,255,0.25)', 'rgba(255,107,214,0.0)']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
          )}
        </View>
        <View style={{ paddingHorizontal: width * 0.06, gap: 1 }}>
          <T style={{ fontFamily: fonts.display, fontSize: width * 0.1, color: owned ? colors.text : colors.textDim }} numberOfLines={1}>{owned ? t?.variant : '???'}</T>
          <T style={{ fontFamily: fonts.bodyMedium, fontSize: width * 0.065, color: colors.textMuted }} numberOfLines={1}>{owned ? al?.name : 'Not collected'}</T>
          {owned && card.registration && <T style={{ fontFamily: fonts.mono, fontSize: width * 0.07, color: colors.silver }}>{card.registration}</T>}
        </View>
        <View style={{ position: 'absolute', bottom: width * 0.04, left: width * 0.06, right: width * 0.06 }}>
          {card.specialEdition && owned && <T style={{ fontFamily: fonts.bodySemi, fontSize: width * 0.055, color: rarityColors.special }} numberOfLines={1}>✦ {card.specialEdition}{card.limitedRun ? ` · /${card.limitedRun}` : ''}</T>}
          <T style={{ fontFamily: fonts.body, fontSize: width * 0.045, color: colors.textDim }} numberOfLines={1}>{owned && p ? `📷 ${p.author}` : card.series}</T>
        </View>
        {!!count && count > 1 && (
          <View style={{ position: 'absolute', top: h * 0.1, right: width * 0.08, backgroundColor: colors.bg, borderRadius: 10, paddingHorizontal: 6, borderWidth: 1, borderColor: c }}>
            <T v="caption" color={c}>×{count}</T>
          </View>
        )}
      </View>
    </LinearGradient>
  );
  return onPress ? <Tap onPress={onPress} accessibilityLabel={`${t?.variant} card ${card.number}`}>{body}</Tap> : body;
}

const styles = StyleSheet.create({
  credit: { position: 'absolute', right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.45)', paddingHorizontal: 6, paddingVertical: 2, borderTopLeftRadius: 6, maxWidth: '90%' },
  post: { backgroundColor: colors.surface, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.border, marginHorizontal: space.lg, marginBottom: space.lg },
  postHead: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: space.md, paddingHorizontal: space.lg },
  followBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, borderWidth: 1, borderColor: colors.primary + '88' },
  actions: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.md, paddingVertical: space.sm },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, padding: 6, marginRight: 8 },
  collectBtn: { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 999, backgroundColor: 'rgba(92,225,255,0.12)', borderWidth: 1, borderColor: 'rgba(92,225,255,0.35)' },
});
