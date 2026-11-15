import React, { useState } from 'react';
import { router } from 'expo-router';
import { T } from '@/components/ui/Text';
import { Button, Input, Notice } from '@/components/ui/primitives';
import { AuthShell } from '@/components/AuthShell';
import { authService, PASSWORD_RULES, validateEmail, validatePassword } from '@/services/auth';
import { useApp } from '@/store/useApp';
import { colors } from '@/theme/tokens';

export default function ResetPassword() {
  const [step, setStep] = useState<'request' | 'reset'>('request');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [pw, setPw] = useState('');
  const [devCode, setDevCode] = useState<string>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const request = async () => {
    if (!validateEmail(email)) return setError('Enter a valid email address.');
    setLoading(true); setError(undefined);
    const r = await authService.requestPasswordReset(email);
    setDevCode(r.devCode);
    setLoading(false);
    setStep('reset');
  };
  const reset = async () => {
    if (!validatePassword(pw)) return setError(PASSWORD_RULES);
    setLoading(true); setError(undefined);
    try {
      await authService.resetPassword(email, code, pw);
      useApp.getState().showToast('Password updated — please sign in');
      router.replace('/auth/sign-in');
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset password" subtitle={step === 'request' ? 'We’ll send a reset code to your email.' : 'Enter the code and choose a new password.'} back photo="b748f">
      {step === 'request' ? (
        <>
          <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} icon="mail-outline" />
          {error && <T v="small" color={colors.danger}>{error}</T>}
          <Button title="Send reset code" onPress={request} loading={loading} />
        </>
      ) : (
        <>
          <Notice icon="mail-open-outline" color={colors.cyan} text="If an account exists for that email, a reset code is on its way." />
          {devCode && <Notice icon="code-slash" title="Development mode" text={`Reset code: ${devCode}`} />}
          <Input label="Reset code" keyboardType="number-pad" maxLength={6} value={code} onChangeText={setCode} icon="keypad-outline" />
          <Input label="New password" secureTextEntry value={pw} onChangeText={setPw} icon="lock-closed-outline" />
          {error && <T v="small" color={colors.danger}>{error}</T>}
          <Button title="Update password" onPress={reset} loading={loading} />
        </>
      )}
    </AuthShell>
  );
}
