import React, { useEffect, useRef } from 'react';
import { Animated, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, ScrollViewInstance, ScrollViewProps, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, radius, space } from '@/theme/tokens';
import { T } from './Text';
import { IconButton, Tap } from './primitives';
import { useApp } from '@/store/useApp';

export function goBack(fallback = '/') {
  if (router.canGoBack()) router.back();
  else router.replace(fallback as never);
}

export function Header({ title, subtitle, right, back = true, transparent, large }: { title?: string; subtitle?: string; right?: React.ReactNode; back?: boolean; transparent?: boolean; large?: boolean }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: insets.top + 6 }, transparent && { position: 'absolute', left: 0, right: 0, top: 0, zIndex: 10, backgroundColor: 'transparent', borderBottomWidth: 0 }]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, minHeight: 44 }}>
        {back && <IconButton icon="chevron-back" accessibilityLabel="Go back" onPress={() => goBack()} />}
        <View style={{ flex: 1 }}>
          {!!title && <T v={large ? 'h1' : 'h3'} numberOfLines={1}>{title}</T>}
          {!!subtitle && <T v="small" muted numberOfLines={1}>{subtitle}</T>}
        </View>
        {right}
      </View>
    </View>
  );
}

export function Screen({ children, scroll = true, header, style, contentStyle, refreshControl, padded = true, keyboard, bottomInset = true, onScroll, scrollRef }: {
  children: React.ReactNode;
  scroll?: boolean;
  header?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  refreshControl?: ScrollViewProps['refreshControl'];
  padded?: boolean;
  keyboard?: boolean;
  bottomInset?: boolean;
  onScroll?: ScrollViewProps['onScroll'];
  scrollRef?: React.Ref<ScrollViewInstance>;
}) {
  const insets = useSafeAreaInsets();
  const body = scroll ? (
    <ScrollView
      ref={scrollRef}
      style={{ flex: 1 }}
      contentContainerStyle={[padded && { padding: space.lg }, { paddingBottom: (bottomInset ? insets.bottom : 0) + 110 }, contentStyle]}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      refreshControl={refreshControl}
      onScroll={onScroll}
      scrollEventThrottle={16}
    >
      {children}
    </ScrollView>
  ) : (
    <View style={[{ flex: 1 }, padded && { padding: space.lg }, contentStyle]}>{children}</View>
  );
  return (
    <View style={[{ flex: 1, backgroundColor: colors.bg }, style]}>
      {header}
      {keyboard ? (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
          {body}
        </KeyboardAvoidingView>
      ) : (
        body
      )}
    </View>
  );
}

/** Bottom sheet built on Modal with a slide + fade animation. */
export function Sheet({ visible, onClose, title, children, height }: { visible: boolean; onClose: () => void; title?: string; children: React.ReactNode; height?: number | `${number}%` }) {
  const insets = useSafeAreaInsets();
  const y = useRef(new Animated.Value(400)).current;
  useEffect(() => {
    if (visible) Animated.spring(y, { toValue: 0, useNativeDriver: true, damping: 22, stiffness: 220 }).start();
    else y.setValue(400);
  }, [visible, y]);
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <Pressable style={styles.backdrop} onPress={onClose} accessibilityLabel="Close" />
        <Animated.View style={[styles.sheet, { paddingBottom: insets.bottom + space.lg, transform: [{ translateY: y }] }, height ? { height } : { maxHeight: '88%' }]}>
          <View style={styles.grabber} />
          {title && (
            <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: space.lg, paddingBottom: space.md }}>
              <T v="h3" style={{ flex: 1 }}>{title}</T>
              <IconButton icon="close" size={34} accessibilityLabel="Close sheet" onPress={onClose} />
            </View>
          )}
          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: space.lg, paddingBottom: space.lg }} showsVerticalScrollIndicator={false}>
            {children}
          </ScrollView>
        </Animated.View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

/** Action list used for "…" menus (report, block, share…). */
export function ActionSheet({ visible, onClose, title, actions }: { visible: boolean; onClose: () => void; title?: string; actions: { label: string; icon: React.ComponentProps<typeof Ionicons>['name']; onPress: () => void; danger?: boolean }[] }) {
  return (
    <Sheet visible={visible} onClose={onClose} title={title}>
      <View style={{ gap: 6 }}>
        {actions.map((a) => (
          <Tap key={a.label} onPress={() => { onClose(); setTimeout(a.onPress, 220); }} style={styles.action}>
            <Ionicons name={a.icon} size={20} color={a.danger ? colors.danger : colors.text} />
            <T v="bodyMedium" color={a.danger ? colors.danger : colors.text}>{a.label}</T>
          </Tap>
        ))}
      </View>
    </Sheet>
  );
}

export function ToastHost() {
  const toast = useApp((s) => s.toast);
  const clear = useApp((s) => s.clearToast);
  const insets = useSafeAreaInsets();
  const a = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (!toast) return;
    a.setValue(0);
    Animated.spring(a, { toValue: 1, useNativeDriver: true, damping: 16 }).start();
    const t = setTimeout(() => Animated.timing(a, { toValue: 0, duration: 220, useNativeDriver: true }).start(() => clear()), 2600);
    return () => clearTimeout(t);
  }, [toast, a, clear]);
  if (!toast) return null;
  const icon = toast.kind === 'error' ? 'alert-circle' : toast.kind === 'info' ? 'information-circle' : toast.kind === 'xp' ? 'flash' : 'checkmark-circle';
  const color = toast.kind === 'error' ? colors.danger : toast.kind === 'xp' ? colors.sim : toast.kind === 'info' ? colors.cyan : colors.success;
  return (
    <Animated.View
      pointerEvents="none"
      accessibilityLiveRegion="polite"
      style={[styles.toast, { top: insets.top + 8, opacity: a, transform: [{ translateY: a.interpolate({ inputRange: [0, 1], outputRange: [-30, 0] }) }] }]}
    >
      <Ionicons name={icon} size={20} color={color} />
      <T v="smallMedium" style={{ flex: 1 }}>{toast.text}</T>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  header: { paddingHorizontal: space.lg, paddingBottom: 10, backgroundColor: colors.bg, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  sheet: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: colors.bgElevated, borderTopLeftRadius: radius.xxl, borderTopRightRadius: radius.xxl, borderWidth: 1, borderColor: colors.border, paddingTop: 10, maxWidth: 640, alignSelf: 'center', width: '100%' },
  grabber: { width: 40, height: 5, borderRadius: 3, backgroundColor: colors.borderStrong, alignSelf: 'center', marginBottom: 12 },
  action: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16, borderRadius: radius.lg, backgroundColor: colors.surface },
  toast: { position: 'absolute', left: space.lg, right: space.lg, zIndex: 999, flexDirection: 'row', alignItems: 'center', gap: 10, padding: 14, borderRadius: radius.lg, backgroundColor: 'rgba(17,26,45,0.97)', borderWidth: 1, borderColor: colors.borderStrong, maxWidth: 560, alignSelf: 'center' },
});

export { Ionicons };
