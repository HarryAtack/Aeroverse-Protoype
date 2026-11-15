import React, { useState } from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Input, Tap } from '@/components/ui/primitives';
import { AuthShell } from '@/components/AuthShell';
import { authService, PASSWORD_RULES, validateEmail, validatePassword } from '@/services/auth';
import { useApp } from '@/store/useApp';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [terms, setTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async () => {
    const e: Record<string, string> = {};
    if (!validateEmail(email)) e.email = 'Enter a valid email address.';
    if (!validatePassword(password)) e.password = PASSWORD_RULES;
    if (confirm !== password) e.confirm = 'Passwords do not match.';
    if (!terms) e.terms = 'Please accept the Terms and Privacy Policy.';
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    try {
      const { user, devCode } = await authService.signUp(email, password);
      useApp.getState().setPendingEmail(user.email);
      router.replace({ pathname: '/auth/verify-email', params: devCode ? { dev: devCode } : {} });
    } catch (err) {
      setErrors({ form: (err as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Create account" subtitle="Join millions of aviation enthusiasts." back photo="b789vs">
      <Input label="Email" placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" value={email} onChangeText={setEmail} icon="mail-outline" error={errors.email} />
      <Input label="Password" placeholder="Create a password" secureTextEntry value={password} onChangeText={setPassword} icon="lock-closed-outline" error={errors.password} />
      <T v="caption" dim>{PASSWORD_RULES}</T>
      <Input label="Confirm password" placeholder="Repeat password" secureTextEntry value={confirm} onChangeText={setConfirm} icon="lock-closed-outline" error={errors.confirm} />
      <Tap onPress={() => setTerms(!terms)} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }} accessibilityRole="checkbox" accessibilityState={{ checked: terms }}>
        <Ionicons name={terms ? 'checkbox' : 'square-outline'} size={22} color={terms ? colors.primary : colors.textMuted} />
        <T v="small" muted style={{ flex: 1 }}>
          I agree to the <T v="small" color={colors.primary} onPress={() => router.push('/settings/legal?doc=terms')}>Terms of Service</T> and <T v="small" color={colors.primary} onPress={() => router.push('/settings/legal?doc=privacy')}>Privacy Policy</T>. I’m 13 or older.
        </T>
      </Tap>
      {errors.terms && <T v="small" color={colors.danger}>{errors.terms}</T>}
      {errors.form && <T v="small" color={colors.danger}>{errors.form}</T>}
      <Button title="Create account" onPress={submit} loading={loading} />
      <View style={{ alignItems: 'center' }}>
        <Tap onPress={() => router.replace('/auth/sign-in')}><T v="smallMedium" color={colors.primary}>Already have an account? Sign in</T></Tap>
      </View>
    </AuthShell>
  );
}
