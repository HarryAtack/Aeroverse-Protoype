import React from 'react';
import { View } from 'react-native';
import { space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, EmptyState } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { Avatar } from '@/components/aviation';
import { userById } from '@/data/users';
import { useApp } from '@/store/useApp';

export default function Blocked() {
  const blocked = useApp((s) => s.blocked);
  return (
    <Screen header={<Header title="Blocked users" />}>
      <View style={{ gap: space.md, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <T muted>Blocked users can’t see your profile or posts, comment on them, or message you. They aren’t notified.</T>
        {blocked.length === 0 && <EmptyState icon="ban-outline" title="No blocked users" body="You can block someone from their profile or any of their posts." />}
        {blocked.map((id) => (
          <Card key={id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Avatar userId={id} size={40} />
            <T v="title" style={{ flex: 1 }}>@{userById[id]?.username ?? id}</T>
            <Button title="Unblock" small full={false} variant="secondary" onPress={() => { useApp.getState().unblock(id); useApp.getState().showToast('Unblocked'); }} />
          </Card>
        ))}
      </View>
    </Screen>
  );
}
