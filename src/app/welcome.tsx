import React, { useRef, useState } from 'react';
import { Animated, FlatList, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, space } from '@/theme/tokens';
import { T } from '@/components/ui/Text';
import { Button, Tap } from '@/components/ui/primitives';
import { Photo } from '@/components/aviation';
import { LogoLockup } from '@/components/brand/Logo';
import { useApp } from '@/store/useApp';

const SLIDES = [
  { photo: 'a380', icon: 'images-outline', over: 'Share', title: 'The world’s aviation community', body: 'Share aircraft photography, follow photographers and join your airport’s community.' },
  { photo: 'b748lh', icon: 'scan-outline', over: 'Identify', title: 'AI-assisted identification', body: 'Upload a photo and AeroVerse suggests the type, variant and registration — with honest confidence levels and community review.' },
  { photo: 'concorde', icon: 'albums-outline', over: 'Collect', title: 'Build your personal hangar', body: 'Collect aircraft, complete sets, earn rarity-based rewards and open digital trading cards.' },
  { photo: 'lhr', icon: 'radio-outline', over: 'Explore', title: 'Radar, spots and challenges', body: 'Explore flight radar, discover verified spotting locations and compete in quality-first challenges.' },
] as const;

export default function Welcome() {
  const win = useWindowDimensions();
  const [size, setSize] = useState({ width: win.width, height: win.height });
  const { width, height } = size;
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const ref = useRef<FlatList>(null);
  const x = useRef(new Animated.Value(0)).current;
  const finish = () => {
    useApp.getState().setIntroSeen();
    router.replace('/auth/sign-in');
  };
  const next = () => (i < SLIDES.length - 1 ? ref.current?.scrollToIndex({ index: i + 1 }) : finish());

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }} onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}>
      <Animated.FlatList
        key={Math.round(width)}
        ref={ref as never}
        data={SLIDES as unknown as (typeof SLIDES)[number][]}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        keyExtractor={(s) => s.photo}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x } } }], { useNativeDriver: false })}
        onMomentumScrollEnd={(e) => setI(Math.round(e.nativeEvent.contentOffset.x / width))}
        getItemLayout={(_, index) => ({ length: width, offset: width * index, index })}
        renderItem={({ item, index }) => {
          const scale = x.interpolate({ inputRange: [(index - 1) * width, index * width, (index + 1) * width], outputRange: [1.15, 1, 1.15], extrapolate: 'clamp' });
          return (
            <View style={{ width, height }}>
              <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ scale }] }]}>
                <Photo id={item.photo} style={StyleSheet.absoluteFill} credit="compact" />
              </Animated.View>
              <LinearGradient colors={['rgba(5,8,15,0.55)', 'rgba(5,8,15,0.1)', 'rgba(5,8,15,0.85)', colors.bg]} locations={[0, 0.3, 0.62, 0.85]} style={StyleSheet.absoluteFill} />
              <View style={{ position: 'absolute', left: space.xl, right: space.xl, bottom: insets.bottom + 150, gap: space.md, maxWidth: 520 }}>
                <View style={styles.iconWrap}><Ionicons name={item.icon} size={22} color={colors.cyan} /></View>
                <T v="overline" color={colors.cyan}>{item.over}</T>
                <T v="hero">{item.title}</T>
                <T v="body" muted style={{ fontSize: 16, lineHeight: 23 }}>{item.body}</T>
              </View>
            </View>
          );
        }}
      />
      <View style={{ position: 'absolute', top: insets.top + 12, left: space.xl, right: space.xl, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <LogoLockup size={24} />
        <Tap onPress={finish} hitSlop={10} accessibilityLabel="Skip introduction"><T v="smallMedium" muted>Skip</T></Tap>
      </View>
      <View style={{ position: 'absolute', left: space.xl, right: space.xl, bottom: insets.bottom + 28, gap: space.lg }}>
        <View style={{ flexDirection: 'row', gap: 6, justifyContent: 'center' }}>
          {SLIDES.map((_, k) => <View key={k} style={{ height: 6, width: k === i ? 22 : 6, borderRadius: 3, backgroundColor: k === i ? colors.cyan : colors.borderStrong }} />)}
        </View>
        <Button title={i === SLIDES.length - 1 ? 'Get started' : 'Continue'} icon={i === SLIDES.length - 1 ? 'airplane' : 'arrow-forward'} onPress={next} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconWrap: { width: 44, height: 44, borderRadius: 14, backgroundColor: 'rgba(92,225,255,0.12)', borderWidth: 1, borderColor: 'rgba(92,225,255,0.3)', alignItems: 'center', justifyContent: 'center' },
});
