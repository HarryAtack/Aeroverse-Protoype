import React from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView, Platform } from 'react-native';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Photo } from '@/components/aviation';
import { LogoMark } from '@/components/brand/Logo';
import { IconButton } from '@/components/ui/primitives';
import { goBack } from '@/components/ui/Screen';

export function AuthShell({ title, subtitle, children, back, photo = 'a380' }: { title: string; subtitle?: string; children: React.ReactNode; back?: boolean; photo?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <View style={{ height: 260 }}>
        <Photo id={photo} style={StyleSheet.absoluteFill} credit="compact" />
        <LinearGradient colors={['rgba(5,8,15,0.4)', 'rgba(5,8,15,0.6)', colors.bg]} style={StyleSheet.absoluteFill} />
      </View>
      {back && <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack('/auth/sign-in')} style={{ position: 'absolute', top: insets.top + 8, left: space.lg }} />}
      <KeyboardAvoidingView style={{ flex: 1, marginTop: -120 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: space.xl, paddingBottom: insets.bottom + 40, gap: space.lg, maxWidth: 520, width: '100%', alignSelf: 'center' }} keyboardShouldPersistTaps="handled">
          <LogoMark size={56} />
          <View style={{ gap: 6 }}>
            <T v="h1">{title}</T>
            {subtitle && <T muted>{subtitle}</T>}
          </View>
          {children}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}
