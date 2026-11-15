import React from 'react';
import { ProfileView } from '@/components/ProfileView';
import { useApp, totalXp } from '@/store/useApp';

export default function MyProfile() {
  const profile = useApp((s) => s.profile)!;
  const collection = useApp((s) => s.collection);
  const myPosts = useApp((s) => s.myPosts);
  const follows = useApp((s) => s.follows);
  const checkins = useApp((s) => s.checkins);
  const plus = useApp((s) => s.plus.active);
  const xp = useApp(totalXp);
  const airportsVisited = Array.from(new Set([profile.homeAirportId, ...collection.map((c) => c.airportId)]));
  void checkins;
  return (
    <ProfileView
      isTab
      m={{
        id: profile.id,
        isMe: true,
        isDemo: false,
        username: profile.username,
        displayName: profile.displayName || profile.username,
        bio: profile.bio,
        homeAirportId: profile.homeAirportId,
        coverPhotoId: collection.find((c) => c.rarity === 'legendary')?.photoId ?? collection[0]?.photoId,
        favouriteTypeId: profile.favouriteTypeId,
        xp,
        followers: profile.id === 'me_demo' ? 214 : 0,
        following: Object.values(follows).filter(Boolean).length,
        aircraftCollected: collection.length,
        airportsVisited,
        plus,
        posts: myPosts,
        specialties: profile.interests.slice(0, 2),
        typesCollected: new Set(collection.map((c) => c.typeId)).size,
      }}
    />
  );
}
