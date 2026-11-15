import React, { useState } from 'react';
import { router, useLocalSearchParams } from 'expo-router';
import { colors } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Input, Notice } from '@/components/ui/primitives';
import { AuthShell } from '@/components/AuthShell';
import { authService } from '@/services/auth';
import { useApp } from '@/store/useApp';

export default function VerifyEmail() {
  const params = useLocalSearchParams<{ dev?: string }>();
  const email = useApp((s) => s.pendingEmail) ?? '';
  const [devCode, setDevCode] = useState(params.dev);
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const verify = async () => {
    setLoading(true);
    setError(undefined);
    try {
      const user = await authService.verifyEmail(email, code);
      useApp.getState().signIn(user.id, user.email);
      useApp.getState().setPendingEmail(undefined);
      useApp.getState().showToast('Email verified');
      router.replace('/onboarding');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const resend = async () => {
    const r = await authService.resendVerification(email);
    setDevCode(r.devCode);
    useApp.getState().showToast('A new code has been sent', 'info');
  };

  return (
    <AuthShell title="Verify your email" subtitle={`Enter the 6-digit code we sent to ${email || 'your inbox'}.`} back photo="b77wsq">
      {devCode && <Notice icon="code-slash" title="Development mode" text={`No email service is connected, so here is your code: ${devCode}`} />}
      <Input label="Verification code" placeholder="123456" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} icon="keypad-outline" error={error} />
      <Button title="Verify email" onPress={verify} loading={loading} disabled={code.length !== 6} />
      <Button title="Resend code" variant="ghost" onPress={resend} />
      <T v="caption" dim center>Can’t find it? Check your spam folder. Codes expire after 15 minutes in production.</T>
      <T v="caption" color={colors.textDim} center>Wrong email? Go back to create your account again.</T>
    </AuthShell>
  );
}
