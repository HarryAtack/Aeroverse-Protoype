import React, { useEffect, useRef } from 'react';
import {
  ActivityIndicator,
  Animated,
  Pressable,
  PressableProps,
  StyleProp,
  StyleSheet,
  Switch,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, fonts, gradients, radius, space } from '@/theme/tokens';
import { T } from './Text';

export type IconName = React.ComponentProps<typeof Ionicons>['name'];

export function haptic(kind: 'light' | 'medium' | 'success' = 'light') {
  try {
    if (kind === 'success') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else Haptics.impactAsync(kind === 'medium' ? Haptics.ImpactFeedbackStyle.Medium : Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}

/** Pressable with a subtle scale + opacity response. */
export function Tap({ style, children, onPress, haptics = true, ...rest }: PressableProps & { style?: StyleProp<ViewStyle>; haptics?: boolean; children?: React.ReactNode }) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      onPress={(e) => {
        if (haptics) haptic();
        onPress?.(e);
      }}
      style={({ pressed }) => [style, pressed && { opacity: 0.82, transform: [{ scale: 0.98 }] }]}
    >
      {children}
    </Pressable>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'plus';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  loading,
  disabled,
  small,
  style,
  full = true,
  accessibilityLabel,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  loading?: boolean;
  disabled?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
  full?: boolean;
  accessibilityLabel?: string;
}) {
  const h = small ? 38 : 52;
  const content = (
    <View style={[styles.btnInner, { height: h, paddingHorizontal: small ? 14 : 20 }]}>
      {loading ? (
        <ActivityIndicator color={variant === 'secondary' || variant === 'ghost' ? colors.text : '#fff'} />
      ) : (
        <>
          {icon && <Ionicons name={icon} size={small ? 16 : 19} color={variant === 'ghost' ? colors.primary : variant === 'plus' ? '#2A1A05' : colors.text} />}
          <T v={small ? 'smallMedium' : 'title'} color={variant === 'ghost' ? colors.primary : variant === 'plus' ? '#2A1A05' : colors.text} style={{ fontFamily: fonts.bodySemi }}>
            {title}
          </T>
        </>
      )}
    </View>
  );
  const base: StyleProp<ViewStyle> = [
    { borderRadius: radius.lg, overflow: 'hidden', alignSelf: full ? 'stretch' : 'flex-start', opacity: disabled ? 0.45 : 1 },
    variant === 'secondary' && { backgroundColor: colors.surface3, borderWidth: 1, borderColor: colors.borderStrong },
    variant === 'ghost' && { backgroundColor: 'transparent' },
    variant === 'danger' && { backgroundColor: 'rgba(248,113,113,0.16)', borderWidth: 1, borderColor: 'rgba(248,113,113,0.4)' },
    style,
  ];
  return (
    <Tap onPress={onPress} disabled={disabled || loading} style={base} accessibilityLabel={accessibilityLabel ?? title}>
      {variant === 'primary' ? (
        <LinearGradient colors={[colors.primary, colors.primaryDeep]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {content}
        </LinearGradient>
      ) : variant === 'plus' ? (
        <LinearGradient colors={gradients.plus as unknown as string[] as [string, string, ...string[]]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          {content}
        </LinearGradient>
      ) : (
        content
      )}
    </Tap>
  );
}

export function IconButton({ icon, onPress, size = 40, color = colors.text, badge, glass = true, accessibilityLabel, style }: { icon: IconName; onPress?: () => void; size?: number; color?: string; badge?: number | boolean; glass?: boolean; accessibilityLabel: string; style?: StyleProp<ViewStyle> }) {
  return (
    <Tap
      onPress={onPress}
      accessibilityLabel={accessibilityLabel}
      hitSlop={6}
      style={[{ width: size, height: size, borderRadius: size / 2, alignItems: 'center', justifyContent: 'center' }, glass && { backgroundColor: colors.glass, borderWidth: 1, borderColor: colors.border }, style]}
    >
      <Ionicons name={icon} size={size * 0.5} color={color} />
      {!!badge && (
        <View style={styles.badgeDot}>
          {typeof badge === 'number' && <T v="caption" style={{ fontSize: 9, lineHeight: 11, color: '#fff' }}>{badge > 9 ? '9+' : badge}</T>}
        </View>
      )}
    </Tap>
  );
}

export function Card({ children, style, onPress, padded = true }: { children: React.ReactNode; style?: StyleProp<ViewStyle>; onPress?: () => void; padded?: boolean }) {
  const s = [styles.card, padded && { padding: space.lg }, style];
  if (onPress) return <Tap onPress={onPress} style={s}>{children}</Tap>;
  return <View style={s}>{children}</View>;
}

export function Chip({ label, active, onPress, icon, color, small }: { label: string; active?: boolean; onPress?: () => void; icon?: IconName; color?: string; small?: boolean }) {
  return (
    <Tap
      onPress={onPress}
      accessibilityState={{ selected: !!active }}
      style={[
        styles.chip,
        small && { height: 28, paddingHorizontal: 10 },
        active && { backgroundColor: 'rgba(61,139,255,0.18)', borderColor: colors.primary },
      ]}
    >
      {icon && <Ionicons name={icon} size={small ? 12 : 14} color={active ? colors.cyan : color ?? colors.textMuted} />}
      <T v={small ? 'caption' : 'smallMedium'} color={active ? colors.text : colors.textMuted}>{label}</T>
    </Tap>
  );
}

export function Pill({ label, color = colors.primary, icon, solid }: { label: string; color?: string; icon?: IconName; solid?: boolean }) {
  return (
    <View style={[styles.pill, { borderColor: color + '66', backgroundColor: solid ? color : color + '1F' }]}>
      {icon && <Ionicons name={icon} size={11} color={solid ? '#05080F' : color} />}
      <T v="caption" color={solid ? '#05080F' : color} style={{ fontFamily: fonts.bodySemi }}>{label}</T>
    </View>
  );
}

export function ProgressBar({ value, color = colors.primary, height = 6, track = colors.surface3, gradient = true }: { value: number; color?: string; height?: number; track?: string; gradient?: boolean }) {
  const anim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(anim, { toValue: Math.max(0, Math.min(1, value)), duration: 700, useNativeDriver: false }).start();
  }, [value, anim]);
  const width = anim.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  return (
    <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: 100, now: Math.round(value * 100) }} style={{ height, borderRadius: height, backgroundColor: track, overflow: 'hidden' }}>
      <Animated.View style={{ width, height: '100%', borderRadius: height, overflow: 'hidden', backgroundColor: color }}>
        {gradient && <LinearGradient colors={[colors.cyan, color]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFill} />}
      </Animated.View>
    </View>
  );
}

export function SectionHeader({ title, action, onAction, overline, style }: { title: string; action?: string; onAction?: () => void; overline?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingHorizontal: space.lg, marginBottom: space.md }, style]}>
      <View style={{ flex: 1 }}>
        {overline && <T v="overline" color={colors.cyan} style={{ marginBottom: 4 }}>{overline}</T>}
        <T v="h3">{title}</T>
      </View>
      {action && (
        <Tap onPress={onAction} hitSlop={8} accessibilityLabel={`${action}: ${title}`}>
          <T v="smallMedium" color={colors.primary}>{action}</T>
        </Tap>
      )}
    </View>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: StyleSheet.hairlineWidth, backgroundColor: colors.borderStrong }, style]} />;
}

export function Input({ label, error, icon, style, right, ...rest }: TextInputProps & { label?: string; error?: string; icon?: IconName; right?: React.ReactNode }) {
  return (
    <View style={[{ gap: 6 }, style as StyleProp<ViewStyle>]}>
      {label && <T v="smallMedium" muted>{label}</T>}
      <View style={[styles.input, !!error && { borderColor: colors.danger }]}>
        {icon && <Ionicons name={icon} size={18} color={colors.textDim} />}
        <TextInput
          placeholderTextColor={colors.textDim}
          selectionColor={colors.primary}
          accessibilityLabel={label ?? rest.placeholder}
          {...rest}
          style={[{ flex: 1, color: colors.text, fontFamily: fonts.body, fontSize: 15, paddingVertical: 0, minHeight: 22 }, rest.multiline && { minHeight: 80, textAlignVertical: 'top' }]}
        />
        {right}
      </View>
      {!!error && <T v="small" color={colors.danger}>{error}</T>}
    </View>
  );
}

export function Segmented<K extends string>({ options, value, onChange, style }: { options: { key: K; label: string }[]; value: K; onChange: (k: K) => void; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={[styles.segment, style]} accessibilityRole="tablist">
      {options.map((o) => {
        const active = o.key === value;
        return (
          <Tap key={o.key} onPress={() => onChange(o.key)} accessibilityRole="tab" accessibilityState={{ selected: active }} style={[styles.segmentItem, active && { backgroundColor: colors.surface3, borderColor: colors.borderStrong }]}>
            <T v="smallMedium" color={active ? colors.text : colors.textMuted} numberOfLines={1}>{o.label}</T>
          </Tap>
        );
      })}
    </View>
  );
}

export function ListRow({ icon, title, subtitle, onPress, right, danger, iconColor, chevron = true }: { icon?: IconName; title: string; subtitle?: string; onPress?: () => void; right?: React.ReactNode; danger?: boolean; iconColor?: string; chevron?: boolean }) {
  return (
    <Tap onPress={onPress} disabled={!onPress} style={styles.row} haptics={!!onPress}>
      {icon && (
        <View style={[styles.rowIcon, danger && { backgroundColor: 'rgba(248,113,113,0.14)' }]}>
          <Ionicons name={icon} size={18} color={danger ? colors.danger : iconColor ?? colors.cyan} />
        </View>
      )}
      <View style={{ flex: 1 }}>
        <T v="bodyMedium" color={danger ? colors.danger : colors.text}>{title}</T>
        {subtitle && <T v="small" muted style={{ marginTop: 2 }}>{subtitle}</T>}
      </View>
      {right}
      {onPress && chevron && !right && <Ionicons name="chevron-forward" size={18} color={colors.textDim} />}
    </Tap>
  );
}

export function ToggleRow({ title, subtitle, value, onChange, icon }: { title: string; subtitle?: string; value: boolean; onChange: (v: boolean) => void; icon?: IconName }) {
  return (
    <ListRow
      icon={icon}
      title={title}
      subtitle={subtitle}
      chevron={false}
      right={<Switch value={value} onValueChange={(v) => { haptic(); onChange(v); }} trackColor={{ true: colors.primary, false: colors.surface3 }} thumbColor="#fff" accessibilityLabel={title} />}
    />
  );
}

export function EmptyState({ icon = 'airplane-outline', title, body, action, onAction }: { icon?: IconName; title: string; body?: string; action?: string; onAction?: () => void }) {
  return (
    <View style={{ alignItems: 'center', padding: space.xxxl, gap: space.md }}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={30} color={colors.cyan} />
      </View>
      <T v="h3" center>{title}</T>
      {body && <T v="body" muted center>{body}</T>}
      {action && <Button title={action} onPress={onAction} full={false} small style={{ marginTop: space.sm }} />}
    </View>
  );
}

export function ErrorState({ title = 'Something went wrong', body, onRetry }: { title?: string; body?: string; onRetry?: () => void }) {
  return (
    <View style={{ alignItems: 'center', padding: space.xxl, gap: space.md }}>
      <View style={[styles.emptyIcon, { backgroundColor: 'rgba(248,113,113,0.12)', borderColor: 'rgba(248,113,113,0.3)' }]}>
        <Ionicons name="cloud-offline-outline" size={28} color={colors.danger} />
      </View>
      <T v="h3" center>{title}</T>
      {body && <T muted center>{body}</T>}
      {onRetry && <Button title="Try again" icon="refresh" variant="secondary" onPress={onRetry} full={false} small />}
    </View>
  );
}

export function Skeleton({ height = 16, width = '100%', radius: r = 8, style }: { height?: number; width?: number | `${number}%`; radius?: number; style?: StyleProp<ViewStyle> }) {
  const a = useRef(new Animated.Value(0.4)).current;
  useEffect(() => {
    const loop = Animated.loop(Animated.sequence([Animated.timing(a, { toValue: 1, duration: 700, useNativeDriver: true }), Animated.timing(a, { toValue: 0.4, duration: 700, useNativeDriver: true })]));
    loop.start();
    return () => loop.stop();
  }, [a]);
  return <Animated.View style={[{ height, width, borderRadius: r, backgroundColor: colors.surface3, opacity: a }, style]} />;
}

export function Stat({ value, label, icon, color = colors.text }: { value: string | number; label: string; icon?: IconName; color?: string }) {
  return (
    <View style={{ alignItems: 'flex-start', gap: 2, flex: 1 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
        {icon && <Ionicons name={icon} size={14} color={colors.cyan} />}
        <T v="dataLarge" color={color}>{value}</T>
      </View>
      <T v="caption" muted>{label}</T>
    </View>
  );
}

export function Notice({ icon = 'information-circle', text, color = colors.sim, style, title }: { icon?: IconName; text: string; color?: string; style?: StyleProp<ViewStyle>; title?: string }) {
  return (
    <View style={[styles.notice, { borderColor: color + '55', backgroundColor: color + '14' }, style]}>
      <Ionicons name={icon} size={18} color={color} style={{ marginTop: 1 }} />
      <View style={{ flex: 1, gap: 2 }}>
        {title && <T v="smallMedium" color={color}>{title}</T>}
        <T v="small" color={colors.textMuted}>{text}</T>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  btnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  card: { backgroundColor: colors.surface, borderRadius: radius.xl, borderWidth: 1, borderColor: colors.border },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 6, height: 34, paddingHorizontal: 14, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  pill: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 8, paddingVertical: 3, borderRadius: radius.pill, borderWidth: 1, alignSelf: 'flex-start' },
  input: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.surface2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.lg, paddingHorizontal: 14, paddingVertical: 14 },
  segment: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: radius.lg, padding: 4, borderWidth: 1, borderColor: colors.border },
  segmentItem: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 8, borderRadius: radius.md, borderWidth: 1, borderColor: 'transparent' },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 14, paddingHorizontal: space.lg, minHeight: 56 },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: 'rgba(92,225,255,0.1)', alignItems: 'center', justifyContent: 'center' },
  emptyIcon: { width: 68, height: 68, borderRadius: 34, backgroundColor: 'rgba(92,225,255,0.08)', borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  badgeDot: { position: 'absolute', top: 4, right: 4, minWidth: 16, height: 16, borderRadius: 8, backgroundColor: colors.live, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3, borderWidth: 2, borderColor: colors.bg },
  notice: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.lg, borderWidth: 1 },
});
