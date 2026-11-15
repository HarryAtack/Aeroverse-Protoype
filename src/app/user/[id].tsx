import React from 'react';
import { useLocalSearchParams } from 'expo-router';
import { ProfileView } from '@/components/ProfileView';
import { EmptyState } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { userById } from '@/data/users';
import { demoPosts } from '@/data/posts';
import { useApp } from '@/store/useApp';

export default function UserProfile() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const u = userById[id];
  const blocked = useApp((s) => s.blocked.includes(id));
  const following = useApp((s) => !!s.follows[id]);
  if (!u) return <Screen header={<Header title="Profile" />}><EmptyState icon="person-outline" title="User not found" body="This account may have been deleted." /></Screen>;
  if (blocked) return <Screen header={<Header title={`@${u.username}`} />}><EmptyState icon="ban-outline" title="You’ve blocked this user" body="Unblock them in Settings → Blocked users to see their profile." action="Unblock" onAction={() => useApp.getState().unblock(id)} /></Screen>;
  return (
    <ProfileView
      m={{
        id: u.id, isMe: false, isDemo: true, username: u.username, displayName: u.displayName, bio: u.bio, homeAirportId: u.homeAirportId,
        coverPhotoId: u.coverPhotoId, favouriteTypeId: u.favouriteTypeId, xp: u.xp, followers: u.followers + (following ? 1 : 0), following: u.following,
        aircraftCollected: u.aircraftCollected, airportsVisited: u.airportsVisited, plus: u.plus, verified: u.verifiedContributor,
        posts: demoPosts.filter((p) => p.userId === u.id), specialties: u.specialties, typesCollected: Math.min(28, Math.round(u.aircraftCollected / 10)),
      }}
    />
  );
}
