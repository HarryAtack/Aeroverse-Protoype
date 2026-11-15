import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Input, Notice } from '@/components/ui/primitives';
import { Header, Screen } from '@/components/ui/Screen';
import { useApp } from '@/store/useApp';
import { authService } from '@/services/auth';

export default function DeleteAccount() {
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const session = useApp((s) => s.session);
  const del = async () => {
    setLoading(true);
    try {
      await authService.deleteAccount(session?.userId ?? '');
    } catch {}
    useApp.getState().deleteAccountLocal();
    setLoading(false);
    router.replace('/auth/sign-in');
    setTimeout(() => useApp.getState().showToast('Your account and data have been deleted', 'info'), 300);
  };
  return (
    <Screen keyboard header={<Header title="Delete account" />}>
      <View style={{ gap: space.lg, maxWidth: 640, width: '100%', alignSelf: 'center' }}>
        <Notice icon="warning-outline" color={colors.danger} title="This can’t be undone" text="Your profile, hangar, photos, posts, comments, XP and cards will be permanently deleted. Active subscriptions are cancelled." />
        <Card style={{ gap: 6 }}>
          <T v="title">Before you go</T>
          <T v="small" muted>You can export your data first from Settings → Export my data. Photos licensed for printed products remain under any existing licence terms until they expire.</T>
        </Card>
        <Input label="Type DELETE to confirm" value={confirm} onChangeText={setConfirm} autoCapitalize="characters" />
        <Button title="Permanently delete my account" variant="danger" disabled={confirm !== 'DELETE'} loading={loading} onPress={del} />
        <Button title="Export my data first" variant="ghost" onPress={() => router.push('/settings/data-export')} />
        <T v="caption" dim>Demo note: test accounts demo@ and fresh@ are recreated automatically; their local data is wiped.</T>
      </View>
    </Screen>
  );
}
