import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Card, ListRow, Pill } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/aviation';
import { useApp } from '@/store/useApp';
import { authService } from '@/services/auth';
import Constants from 'expo-constants';

export default function Settings() {
  const profile = useApp((s) => s.profile);
  const session = useApp((s) => s.session);
  const blocked = useApp((s) => s.blocked.length);
  const plus = useApp((s) => s.plus.active);
  const signOut = async () => {
    await authService.signOut();
    useApp.getState().signOut();
    router.replace('/auth/sign-in');
  };
  return (
    <Screen header={<Header title="Settings" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }} onPress={() => router.push('/settings/edit-profile')}>
          <Avatar userId="me" size={52} />
          <View style={{ flex: 1 }}>
            <T v="title">{profile?.displayName}</T>
            <T v="small" muted>@{profile?.username} · {session?.email}</T>
          </View>
          {plus && <Pill label="PLUS" color={colors.sim} icon="diamond" />}
        </Card>
        <Group title="Account">
          <ListRow icon="person-outline" title="Edit profile" onPress={() => router.push('/settings/edit-profile')} />
          <ListRow icon="key-outline" title="Change password" subtitle="Reset via email code" onPress={() => router.push('/auth/reset-password')} />
          <ListRow icon="diamond-outline" title="AeroVerse Plus" subtitle={plus ? 'Active (test)' : 'Not subscribed'} onPress={() => router.push('/plus')} />
          <ListRow icon="receipt-outline" title="Orders" subtitle={`${useApp.getState().orders.length} test orders`} onPress={() => router.push('/store')} />
        </Group>
        <Group title="Preferences">
          <ListRow icon="notifications-outline" title="Notifications" onPress={() => router.push('/notifications/settings')} />
          <ListRow icon="lock-closed-outline" title="Privacy & location" onPress={() => router.push('/settings/privacy')} />
          <ListRow icon="ban-outline" title="Blocked users" subtitle={`${blocked} blocked`} onPress={() => router.push('/settings/blocked')} />
        </Group>
        <Group title="Your data">
          <ListRow icon="download-outline" title="Export my data" subtitle="Download a copy of everything you’ve created" onPress={() => router.push('/settings/data-export')} />
          <ListRow icon="trash-outline" title="Delete account" danger onPress={() => router.push('/settings/delete-account')} />
        </Group>
        <Group title="About">
          <ListRow icon="server-outline" title="Data sources & service status" subtitle="Demo vs live services" onPress={() => router.push('/settings/services')} />
          <ListRow icon="images-outline" title="Photo attributions" subtitle="Credits for demo imagery" onPress={() => router.push('/settings/attributions')} />
          <ListRow icon="document-text-outline" title="Terms of Service" onPress={() => router.push('/settings/legal?doc=terms')} />
          <ListRow icon="shield-outline" title="Privacy Policy" onPress={() => router.push('/settings/legal?doc=privacy')} />
          <ListRow icon="people-outline" title="Community guidelines" onPress={() => router.push('/settings/legal?doc=guidelines')} />
          <ListRow icon="camera-outline" title="Photo rights & licensing" onPress={() => router.push('/settings/legal?doc=photos')} />
        </Group>
        <Card padded={false}>
          <ListRow icon="log-out-outline" title="Sign out" onPress={signOut} chevron={false} />
        </Card>
        <T v="caption" dim center>AeroVerse prototype v{Constants.expoConfig?.version ?? '0.1.0'} · Demo build</T>
      </View>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return <View style={{ gap: 6 }}><T v="overline" color={colors.cyan}>{title}</T><Card padded={false}>{children}</Card></View>;
}
