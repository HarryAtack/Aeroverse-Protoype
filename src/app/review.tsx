import React, { useState } from 'react';
import { View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Chip, EmptyState, Input, Notice, ProgressBar, Segmented } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar, Photo, VerificationBadge } from '@/components/aviation';
import { postById } from '@/data/posts';
import { userById } from '@/data/users';
import { aircraftTypes, airlineById, airportById, typeById, typeLabel } from '@/data/catalog';
import { THRESHOLDS } from '@/services/identification';
import { useApp } from '@/store/useApp';
import { useShallow } from 'zustand/react/shallow';
import { pct, timeAgo } from '@/utils/format';

const QUEUE = [
  { id: 'q1', userId: 'u_nina', photoId: 'an124', claim: 'an124', alt: 'b747-8f', note: 'AI family confidence 66% — registration not visible.', votes: { agree: 2, disagree: 0 } },
  { id: 'q2', userId: 'u_chloe', photoId: 'a350ba', claim: 'a350-1000', alt: 'a350-900', note: 'Variant 71% — submitter says six-wheel bogies are visible.', votes: { agree: 1, disagree: 1 } },
  { id: 'q3', userId: 'u_joost', photoId: 'e195e2', claim: 'e195-e2', alt: 'e190', note: 'Airshow demonstrator; registration obscured.', votes: { agree: 0, disagree: 0 } },
];
const REVIEWERS = ['u_sam', 'u_will', 'u_chloe', 'u_joost'];

export default function ReviewQueue() {
  const params = useLocalSearchParams<{ post?: string }>();
  const votes = useApp((s) => s.reviewVotes);
  const mine = useApp(useShallow((s) => s.sightings.filter((x) => x.stage === 'needs_review' || (x.votes.agree > 0 && x.stage !== 'community_verified'))));
  const [tab, setTab] = useState<'community' | 'mine'>(params.post ? 'community' : 'community');
  const post = params.post ? postById[params.post] ?? useApp.getState().myPosts.find((p) => p.id === params.post) : undefined;
  const [corrType, setCorrType] = useState<string>();
  const [corrReg, setCorrReg] = useState('');
  const [corrNote, setCorrNote] = useState('');
  const st = useApp.getState();

  const simulateVote = (id: string) => {
    const s = useApp.getState().sightings.find((x) => x.id === id);
    if (!s) return;
    const agree = s.votes.agree + 1;
    const patch: Parameters<typeof st.updateSighting>[1] = { votes: { ...s.votes, agree } };
    if (agree >= THRESHOLDS.communityVotesRequired) {
      patch.stage = 'community_verified';
      if (s.hangarId) useApp.setState((x) => ({ collection: x.collection.map((c) => (c.id === s.hangarId ? { ...c, verification: 'community_verified' } : c)) }));
      if (s.xpPending) { st.addXp(s.xpPending + 50, `Community verified · ${typeLabel(s.typeId)}`); patch.xpAwarded = s.xpPending + 50; patch.xpPending = 0; }
      st.pushNotification({ category: 'milestone', title: 'Sighting verified!', body: `Your ${typeById[s.typeId]?.variant} was verified by the community. XP released.`, route: `/verification/${s.id}` });
      st.showToast('Community verified — XP released!', 'xp');
    } else st.showToast(`@${userById[REVIEWERS[agree % REVIEWERS.length]]?.username} agreed (${agree}/${THRESHOLDS.communityVotesRequired})`, 'info');
    st.updateSighting(id, patch);
  };

  return (
    <Screen header={<Header title="Review queue" subtitle="Human verification" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        {post && (
          <Card style={{ gap: 10, borderColor: colors.review + '66' }}>
            <T v="title">Suggest a correction</T>
            <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
              <Photo id={post.photoId} style={{ width: 72, height: 54, borderRadius: 8 }} credit={false} />
              <T v="small" muted style={{ flex: 1 }}>Currently: {typeLabel(post.typeId)} · {post.registration ?? 'no registration'}</T>
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
              {aircraftTypes.filter((t) => t.family === typeById[post.typeId]?.family || t.manufacturerId === typeById[post.typeId]?.manufacturerId).slice(0, 8).map((t) => <Chip key={t.id} small label={t.variant} active={corrType === t.id} onPress={() => setCorrType(t.id)} />)}
            </View>
            <Input placeholder="Correct registration (optional)" value={corrReg} onChangeText={setCorrReg} autoCapitalize="characters" />
            <Input placeholder="Evidence (required)" value={corrNote} onChangeText={setCorrNote} multiline />
            <Button title="Submit correction" disabled={!corrNote.trim()} onPress={() => { st.report('post', post.id, `correction:${corrType ?? ''}:${corrReg}:${corrNote}`); st.showToast('Correction submitted for review'); router.back(); }} />
          </Card>
        )}
        <Notice icon="people-outline" color={colors.review} text={`Sightings below AI confidence thresholds are reviewed by trusted members. ${THRESHOLDS.communityVotesRequired} independent agreeing reviews are needed for “Community verified”. You can’t review your own sightings.`} />
        <Segmented value={tab} onChange={setTab} options={[{ key: 'community', label: 'Help review' }, { key: 'mine', label: `My pending (${mine.length})` }]} />
        {tab === 'community' && QUEUE.map((q) => {
          const v = votes[q.id];
          return (
            <Card key={q.id} style={{ gap: 10 }}>
              <Photo id={q.photoId} style={{ height: 180, borderRadius: 12 }} />
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <Avatar userId={q.userId} size={26} />
                <T v="smallMedium">@{userById[q.userId]?.username}</T>
                <VerificationBadge stage="needs_review" />
              </View>
              <T v="title">Claimed: {typeLabel(q.claim)}</T>
              <T v="small" muted>{q.note} Alternative suggested: {typeLabel(q.alt)}.</T>
              <T v="caption" muted>{q.votes.agree + (v === 'agree' ? 1 : 0)} agree · {q.votes.disagree + (v === 'disagree' ? 1 : 0)} disagree</T>
              {v ? (
                <Notice icon="checkmark-circle" color={colors.success} text={`You voted “${v}”. Thanks for helping keep AeroVerse accurate!`} />
              ) : (
                <View style={{ flexDirection: 'row', gap: 8 }}>
                  <Button title="Agree" icon="thumbs-up-outline" small style={{ flex: 1 }} onPress={() => { st.voteReview(q.id, 'agree'); st.addXp(10, 'Community review'); }} />
                  <Button title="Disagree" icon="thumbs-down-outline" small variant="secondary" style={{ flex: 1 }} onPress={() => { st.voteReview(q.id, 'disagree'); st.addXp(10, 'Community review'); }} />
                  <Button title="Not sure" small variant="ghost" style={{ flex: 1 }} onPress={() => st.voteReview(q.id, 'unsure')} />
                </View>
              )}
            </Card>
          );
        })}
        {tab === 'mine' && (mine.length === 0 ? (
          <EmptyState icon="checkmark-done-outline" title="Nothing pending" body="Sightings that need human review will appear here." action="Upload a sighting" onAction={() => router.push('/upload')} />
        ) : mine.map((s) => (
          <Card key={s.id} style={{ gap: 10 }} onPress={() => router.push(`/verification/${s.id}`)}>
            <View style={{ flexDirection: 'row', gap: 12, alignItems: 'center' }}>
              <Photo id={s.photoId ?? (s.photoUri ? `uri:${s.photoUri}` : undefined)} style={{ width: 80, height: 60, borderRadius: 10 }} credit={false} />
              <View style={{ flex: 1 }}>
                <T v="title">{typeLabel(s.typeId)}</T>
                <T v="small" muted>{airlineById[s.airlineId]?.name} · {airportById[s.airportId]?.iata} · {timeAgo(s.createdAt)}</T>
                <T v="caption" muted>AI confidence {pct(s.confidence)}{s.xpPending ? ` · ${s.xpPending} XP held` : ''}</T>
              </View>
            </View>
            <ProgressBar value={s.votes.agree / THRESHOLDS.communityVotesRequired} color={colors.review} />
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
              <T v="caption" muted>{s.votes.agree}/{THRESHOLDS.communityVotesRequired} reviewer confirmations</T>
              <Button title="Simulate reviewer vote (demo)" icon="flask-outline" small full={false} variant="secondary" onPress={() => simulateVote(s.id)} />
            </View>
          </Card>
        )))}
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <Ionicons name="information-circle-outline" size={16} color={colors.textDim} />
          <T v="caption" dim style={{ flex: 1 }}>In production, reviewer weight depends on accuracy history, and disputed items escalate to moderators.</T>
        </View>
      </View>
    </Screen>
  );
}
