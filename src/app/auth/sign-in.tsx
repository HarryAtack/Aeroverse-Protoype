import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Card, Input, Notice, Tap } from '@/components/ui/primitives';
import { AuthShell } from '@/components/AuthShell';
import { authService, TEST_ACCOUNTS, validateEmail } from '@/services/auth';
import { useApp } from '@/store/useApp';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const submit = async (e = email, p = password) => {
    setError(undefined);
    if (!validateEmail(e)) return setError('Enter a valid email address.');
    if (!p) return setError('Enter your password.');
    setLoading(true);
    try {
      const user = await authService.signIn(e, p);
      if (!user.emailVerified) {
        useApp.getState().setPendingEmail(user.email);
        router.push('/auth/verify-email');
        return;
      }
      useApp.getState().signIn(user.id, user.email);
      const prof = useApp.getState().profile;
      useApp.getState().showToast(`Welcome back${prof?.displayName ? `, ${prof.displayName.split(' ')[0]}` : ''}`);
      router.replace(prof?.username ? '/(tabs)' : '/onboarding');
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Sign in" subtitle="Welcome to the global aviation community.">
      {authService.mode === 'demo' && (
        <Notice title="Development authentication" text="Accounts are stored on this device only. Connect Supabase Auth for real accounts (see README)." />
      )}
      <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" autoComplete="email" value={email} onChangeText={setEmail} icon="mail-outline" />
      <Input
        label="Password"
        placeholder="Your password"
        secureTextEntry={!show}
        value={password}
        onChangeText={setPassword}
        icon="lock-closed-outline"
        autoComplete="password"
        onSubmitEditing={() => submit()}
        right={<Tap onPress={() => setShow(!show)} accessibilityLabel={show ? 'Hide password' : 'Show password'}><T v="smallMedium" color={colors.primary}>{show ? 'Hide' : 'Show'}</T></Tap>}
      />
      {error && <T v="small" color={colors.danger} accessibilityLiveRegion="assertive">{error}</T>}
      <Button title="Sign in" onPress={() => submit()} loading={loading} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Tap onPress={() => router.push('/auth/reset-password')}><T v="smallMedium" color={colors.primary}>Forgot password?</T></Tap>
        <Tap onPress={() => router.push('/auth/sign-up')}><T v="smallMedium" color={colors.primary}>Create account</T></Tap>
      </View>
      {authService.mode === 'demo' && (
        <Card style={{ gap: space.md }}>
          <T v="overline" color={colors.cyan}>Test accounts</T>
          {TEST_ACCOUNTS.map((a) => (
            <Tap key={a.email} onPress={() => { setEmail(a.email); setPassword(a.password); submit(a.email, a.password); }} style={{ gap: 2 }} accessibilityLabel={`Sign in as ${a.email}`}>
              <T v="bodyMedium">{a.email}</T>
              <T v="small" muted>Password: {a.password} · {a.note}</T>
            </Tap>
          ))}
        </Card>
      )}
    </AuthShell>
  );
}
