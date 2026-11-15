import React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Redirect } from 'expo-router';
import { Tabs, BottomTabBarProps } from 'expo-router/js-tabs';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Tap } from '@/components/ui/primitives';
import { useApp } from '@/store/useApp';

const ICONS: Record<string, [string, string, string]> = {
  index: ['home', 'home-outline', 'Home'],
  explore: ['compass', 'compass-outline', 'Explore'],
  radar: ['radio', 'radio-outline', 'Radar'],
  collection: ['albums', 'albums-outline', 'Hangar'],
  profile: ['person-circle', 'person-circle-outline', 'Profile'],
};

function TabBar({ state, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const unread = useApp((s) => s.notifications.filter((n) => !n.read).length);
  return (
    <View style={[styles.wrap, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      {Platform.OS === 'ios' ? <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} /> : null}
      <View style={[StyleSheet.absoluteFill, { backgroundColor: Platform.OS === 'ios' ? 'rgba(5,8,15,0.72)' : 'rgba(7,11,20,0.97)' }]} />
      <View style={styles.row} accessibilityRole="tablist">
        {state.routes.map((r, i) => {
          const focused = state.index === i;
          const [on, off, label] = ICONS[r.name] ?? ['ellipse', 'ellipse-outline', r.name];
          const isRadar = r.name === 'radar';
          return (
            <Tap
              key={r.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              accessibilityLabel={label}
              onPress={() => {
                if (!focused) navigateToTab(r.key);
              }}
              style={styles.tab}
            >
              {isRadar ? (
                <View style={[styles.radar, focused && { backgroundColor: colors.primary, borderColor: colors.cyan }]}>
                  <Ionicons name={(focused ? on : off) as never} size={24} color={focused ? '#fff' : colors.cyan} />
                </View>
              ) : (
                <View>
                  <Ionicons name={(focused ? on : off) as never} size={24} color={focused ? colors.text : colors.textDim} />
                  {r.name === 'profile' && unread > 0 && <View style={styles.dot} />}
                </View>
              )}
              <T style={{ fontFamily: fonts.bodyMedium, fontSize: 10.5, marginTop: isRadar ? 2 : 4, color: focused ? colors.text : colors.textDim }}>{label}</T>
              {focused && !isRadar && <View style={styles.indicator} />}
            </Tap>
          );
        })}
      </View>
    </View>
  );
}

export default function TabsLayout() {
  const session = useApp((s) => s.session);
  const profile = useApp((s) => s.profile);
  if (!session) return <Redirect href="/auth/sign-in" />;
  if (!profile?.username) return <Redirect href="/onboarding" />;
  return (
    <Tabs tabBar={(p) => <TabBar {...p} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: colors.bg } }}>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="explore" />
      <Tabs.Screen name="radar" />
      <Tabs.Screen name="collection" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, bottom: 0, borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: colors.borderStrong, overflow: 'hidden' },
  row: { flexDirection: 'row', paddingTop: 8, maxWidth: 640, width: '100%', alignSelf: 'center' },
  tab: { flex: 1, alignItems: 'center', justifyContent: 'flex-end', minHeight: 48 },
  radar: { width: 46, height: 46, marginTop: -16, borderRadius: 23, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.surface2, borderWidth: 1.5, borderColor: colors.primary + '99' },
  indicator: { position: 'absolute', top: -8, width: 18, height: 3, borderRadius: 2, backgroundColor: colors.cyan },
  dot: { position: 'absolute', top: -1, right: -3, width: 9, height: 9, borderRadius: 5, backgroundColor: colors.live, borderWidth: 1.5, borderColor: colors.bg },
});
