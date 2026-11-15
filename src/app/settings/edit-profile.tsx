import React, { useState } from 'react';
import { ScrollView, View } from 'react-native';
import { router } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Chip, Input, Tap } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/aviation';
import { airports, aircraftTypes } from '@/data/catalog';
import { demoUsers } from '@/data/users';
import { useApp } from '@/store/useApp';

export default function EditProfile() {
  const p = useApp((s) => s.profile)!;
  const [displayName, setDisplayName] = useState(p.displayName);
  const [username, setUsername] = useState(p.username);
  const [bio, setBio] = useState(p.bio);
  const [home, setHome] = useState(p.homeAirportId);
  const [fav, setFav] = useState(p.favouriteTypeId);
  const [avatarUri, setAvatarUri] = useState(p.avatarUri);
  const [error, setError] = useState<string>();
  const pick = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return useApp.getState().showToast('Photo access not granted', 'error');
    const r = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.7 });
    if (!r.canceled) setAvatarUri(r.assets[0].uri);
  };
  const save = () => {
    if (!/^[a-z0-9_]{3,20}$/.test(username)) return setError('Username: 3–20 lowercase letters, numbers or underscores.');
    if (username !== p.username && demoUsers.some((u) => u.username === username)) return setError('That username is taken.');
    useApp.getState().saveProfile({ displayName, username, bio, homeAirportId: home, favouriteTypeId: fav, avatarUri });
    useApp.getState().showToast('Profile updated');
    router.back();
  };
  return (
    <Screen keyboard header={<Header title="Edit profile" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <View style={{ alignItems: 'center', gap: 8 }}>
          <Avatar userId="me" uri={avatarUri} size={96} ring />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Tap onPress={pick}><T v="smallMedium" color={colors.primary}>Change photo</T></Tap>
            {avatarUri && <Tap onPress={() => setAvatarUri(undefined)}><T v="smallMedium" color={colors.danger}>Remove</T></Tap>}
          </View>
        </View>
        <Input label="Display name" value={displayName} onChangeText={setDisplayName} />
        <Input label="Username" value={username} onChangeText={(t) => setUsername(t.toLowerCase())} autoCapitalize="none" icon="at" />
        <Input label="Bio" value={bio} onChangeText={setBio} multiline maxLength={160} placeholder="Tell the community about your spotting" />
        <T v="caption" dim>{bio.length}/160</T>
        <View style={{ gap: 8 }}>
          <T v="smallMedium" muted>Home airport</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{airports.map((a) => <Chip key={a.id} small label={a.iata} active={home === a.id} onPress={() => setHome(a.id)} />)}</ScrollView>
        </View>
        <View style={{ gap: 8 }}>
          <T v="smallMedium" muted>Favourite aircraft</T>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>{aircraftTypes.map((t) => <Chip key={t.id} small label={t.variant} active={fav === t.id} onPress={() => setFav(t.id)} />)}</ScrollView>
        </View>
        {error && <T v="small" color={colors.danger}>{error}</T>}
        <Button title="Save changes" onPress={save} />
      </View>
    </Screen>
  );
}
