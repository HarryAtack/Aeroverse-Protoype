import React, { useState } from 'react';
import { useWindowDimensions, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, EmptyState, Notice, Pill, Tap } from '@/components/ui/primitives';
import { Header, Screen, Sheet } from '@/components/ui/Screen';
import { Avatar, Photo } from '@/components/aviation';
import { competitions } from '@/data/community';
import { userById } from '@/data/users';
import { useApp } from '@/store/useApp';
import { useShallow } from 'zustand/react/shallow';
import { timeAgo } from '@/utils/format';

export default function Competition() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { width } = useWindowDimensions();
  const c = competitions.find((x) => x.id === id);
  const votes = useApp((s) => s.competitionVotes);
  const myEntries = useApp(useShallow((s) => s.competitionEntries.filter((e) => e.competitionId === id)));
  const collection = useApp((s) => s.collection);
  const [submit, setSubmit] = useState(false);
  const [chosen, setChosen] = useState<string>();
  const [rights, setRights] = useState(false);
  if (!c) return <Screen header={<Header title="Competition" />}><EmptyState title="Competition not found" /></Screen>;
  const w = (Math.min(width, 640) - space.lg * 2 - 10) / 2;
  const entries = [...c.entries].sort((a, b) => b.votes - a.votes);
  const myPhotos = collection.filter((x) => x.photoId);
  return (
    <Screen header={<Header title={c.title} subtitle={`${c.kind} competition · ${c.status}`} />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Photo id={c.coverPhotoId} style={{ height: 200, borderRadius: 20 }} />
        <View style={{ gap: 6 }}>
          <T v="h2">{c.title}</T>
          <T muted>{c.theme}</T>
          <T v="small" color={colors.sim}>🏆 {c.prize}</T>
          <T v="caption" muted>{c.status === 'closed' ? 'Competition closed' : `Closes ${timeAgo(c.endsAt)}`} · {c.entries.length + myEntries.length} entries</T>
        </View>
        <Card style={{ gap: 6 }}>
          <T v="title">Rules & rights</T>
          <T v="small" muted>• One entry per person. Your own photo only.{'\n'}• You retain full copyright. Entering grants AeroVerse a non-exclusive licence to display the photo in the app for this competition only.{'\n'}• Prints, cards or advertising require a separate opt-in licence with credit and payment.{'\n'}• Votes from new or suspicious accounts are weighted down to prevent manipulation.</T>
        </Card>
        {c.status === 'open' && (myEntries.length ? <Notice icon="checkmark-circle" color={colors.success} text={`You entered “${myEntries[0].title}”. Good luck!`} /> : <Button title="Submit an entry" icon="cloud-upload-outline" onPress={() => setSubmit(true)} />)}
        {c.status === 'voting' && <Notice icon="thumbs-up-outline" color={colors.cyan} text="Voting is open — vote for your favourites below." />}
        {c.kind === 'annual' && entries.length === 0 && <EmptyState icon="trophy-outline" title="Submissions open in December" body="Eight categories, a panel of judges and a public vote. Start shooting!" />}
        {c.winners && (
          <View style={{ gap: 8 }}>
            <T v="h3">Winners</T>
            {c.winners.map((wid, i) => {
              const e = c.entries.find((x) => x.id === wid)!;
              return (
                <Card key={wid} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => router.push(`/user/${e.userId}`)}>
                  <T v="dataLarge" color={['#FFB547', '#C9D3E3', '#CD8A4A'][i]}>{i + 1}</T>
                  <Photo id={e.photoId} style={{ width: 64, height: 48, borderRadius: 8 }} credit={false} />
                  <View style={{ flex: 1 }}><T v="title">“{e.title}”</T><T v="small" muted>@{userById[e.userId]?.username} · {e.votes} votes</T></View>
                </Card>
              );
            })}
          </View>
        )}
        {entries.length > 0 && <T v="h3">Entries</T>}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {entries.map((e) => {
            const voted = !!votes[e.id];
            return (
              <View key={e.id} style={{ width: w, gap: 6 }}>
                <Photo id={e.photoId} style={{ height: w * 0.75, borderRadius: 14 }} credit="compact" />
                <T v="title" numberOfLines={1}>“{e.title}”</T>
                <Tap onPress={() => router.push(`/user/${e.userId}`)} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}><Avatar userId={e.userId} size={20} /><T v="caption" muted>@{userById[e.userId]?.username}</T></Tap>
                {c.status !== 'closed' && (
                  <Button title={`${voted ? 'Voted' : 'Vote'} · ${e.votes + (voted ? 1 : 0)}`} icon={voted ? 'heart' : 'heart-outline'} small variant={voted ? 'secondary' : 'primary'} onPress={() => useApp.getState().voteEntry(e.id)} />
                )}
              </View>
            );
          })}
        </View>
      </View>
      <Sheet visible={submit} onClose={() => setSubmit(false)} title="Submit your entry">
        <View style={{ gap: space.md }}>
          {myPhotos.length === 0 ? <T muted>You need a photo in your hangar first. Upload a sighting to enter.</T> : <T v="small" muted>Choose one of your hangar photos:</T>}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {myPhotos.map((p) => (
              <Tap key={p.id} onPress={() => setChosen(p.photoId)} style={{ width: '31%', borderRadius: 10, overflow: 'hidden', borderWidth: 2, borderColor: chosen === p.photoId ? colors.cyan : 'transparent' }}>
                <Photo id={p.photoId} style={{ height: 70 }} credit={false} />
              </Tap>
            ))}
          </View>
          <Tap onPress={() => setRights(!rights)} style={{ flexDirection: 'row', gap: 10 }} accessibilityRole="checkbox" accessibilityState={{ checked: rights }}>
            <Ionicons name={rights ? 'checkbox' : 'square-outline'} size={22} color={rights ? colors.primary : colors.textMuted} />
            <T v="small" muted style={{ flex: 1 }}>This is my own photograph. I grant a display-only licence for this competition and keep all other rights.</T>
          </Tap>
          {myPhotos.length === 0 ? <Button title="Upload a sighting" onPress={() => { setSubmit(false); router.push('/upload'); }} /> : (
            <Button title="Submit entry" disabled={!chosen || !rights} onPress={() => { useApp.getState().enterCompetition({ competitionId: c.id, photoId: chosen, title: 'My entry', at: new Date().toISOString() }); useApp.getState().addXp(30, `Competition entry · ${c.title}`); setSubmit(false); useApp.getState().showToast('Entry submitted!'); }} />
          )}
          <Pill label="Demo: entries are stored on this device" color={colors.steel} />
        </View>
      </Sheet>
    </Screen>
  );
}
