import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, useWindowDimensions, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Defs, G, LinearGradient as SLG, Path, RadialGradient, Stop } from 'react-native-svg';
import { colors } from '@/theme/tokens';
import { AIRCRAFT_PATH, LogoMark, Wordmark } from './Logo';
import { T } from '@/components/ui/Text';

/**
 * Launch sequence: radar rings → sweep → aircraft crosses on a flight path →
 * mark resolves → wordmark reveals → dissolve into the app.
 * ~2.4 s on first launch, ~1.1 s on repeat launches. Tap anywhere to skip.
 */
export function LaunchAnimation({ short, onDone }: { short: boolean; onDone: () => void }) {
  const { width, height } = useWindowDimensions();
  const rings = useRef(new Animated.Value(0)).current;
  const sweep = useRef(new Animated.Value(0)).current;
  const plane = useRef(new Animated.Value(0)).current;
  const mark = useRef(new Animated.Value(0)).current;
  const word = useRef(new Animated.Value(0)).current;
  const out = useRef(new Animated.Value(1)).current;
  const done = useRef(false);

  const finish = () => {
    if (done.current) return;
    done.current = true;
    Animated.timing(out, { toValue: 0, duration: 380, easing: Easing.out(Easing.quad), useNativeDriver: true }).start(() => onDone());
  };

  useEffect(() => {
    const sweepLoop = Animated.loop(Animated.timing(sweep, { toValue: 1, duration: 2200, easing: Easing.linear, useNativeDriver: true }));
    sweepLoop.start();
    const s = short ? 0.45 : 1;
    Animated.sequence([
      Animated.timing(rings, { toValue: 1, duration: 500 * s, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.parallel([
        Animated.timing(plane, { toValue: 1, duration: 1300 * s, easing: Easing.inOut(Easing.cubic), useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(600 * s),
          Animated.spring(mark, { toValue: 1, damping: 12, stiffness: 120, useNativeDriver: true }),
        ]),
        Animated.sequence([Animated.delay(900 * s), Animated.timing(word, { toValue: 1, duration: 520, easing: Easing.out(Easing.cubic), useNativeDriver: true })]),
      ]),
      Animated.delay(short ? 120 : 420),
    ]).start(() => finish());
    return () => sweepLoop.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const R = Math.min(width, height) * 0.42;
  const rot = sweep.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  // Flight path: arc from lower-left to upper-right.
  const px = plane.interpolate({ inputRange: [0, 0.5, 1], outputRange: [-width * 0.65, 0, width * 0.7] });
  const py = plane.interpolate({ inputRange: [0, 0.5, 1], outputRange: [height * 0.28, -height * 0.02, -height * 0.32] });
  const pr = plane.interpolate({ inputRange: [0, 0.5, 1], outputRange: ['32deg', '58deg', '72deg'] });
  const po = plane.interpolate({ inputRange: [0, 0.1, 0.8, 1], outputRange: [0, 1, 1, 0] });

  return (
    <Animated.View style={[StyleSheet.absoluteFill, { zIndex: 1000, opacity: out }]}>
      <Pressable style={StyleSheet.absoluteFill} onPress={finish} accessibilityLabel="Skip intro animation">
        <LinearGradient colors={['#0B1A33', '#05080F', '#03050A']} style={StyleSheet.absoluteFill} />
        {/* radar rings */}
        <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: rings, transform: [{ scale: rings.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) }] }]}>
          <Svg width={R * 2.4} height={R * 2.4} viewBox="-120 -120 240 240">
            {[30, 60, 90, 118].map((r, i) => (
              <Circle key={r} r={r} stroke={colors.primary} strokeOpacity={0.22 - i * 0.04} strokeWidth={0.6} fill="none" />
            ))}
            <Path d="M-118 0H118M0 -118V118" stroke={colors.primary} strokeOpacity={0.12} strokeWidth={0.5} />
          </Svg>
        </Animated.View>
        {/* sweep */}
        <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: rings, transform: [{ rotate: rot }] }]}>
          <Svg width={R * 2.4} height={R * 2.4} viewBox="-120 -120 240 240">
            <Defs>
              <RadialGradient id="sw" cx="0" cy="0" r="118" gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={colors.cyan} stopOpacity="0" />
                <Stop offset="1" stopColor={colors.cyan} stopOpacity="0.35" />
              </RadialGradient>
            </Defs>
            <Path d="M0 0 L0 -118 A118 118 0 0 1 59 -102.2 Z" fill="url(#sw)" />
            <Path d="M0 0 L59 -102.2" stroke={colors.cyan} strokeOpacity={0.7} strokeWidth={0.8} />
          </Svg>
        </Animated.View>
        {/* aircraft on flight path with contrail */}
        <Animated.View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center', opacity: po, transform: [{ translateX: px }, { translateY: py }, { rotate: pr }] }]}>
          <View style={{ alignItems: 'center' }}>
            <Svg width={40} height={40} viewBox="0 0 100 100">
              <Path d={AIRCRAFT_PATH} fill="#EAF1FB" />
            </Svg>
            <Svg width={6} height={140}>
              <Defs>
                <SLG id="trail" x1="0" y1="0" x2="0" y2="1">
                  <Stop offset="0" stopColor="#fff" stopOpacity="0.6" />
                  <Stop offset="1" stopColor="#fff" stopOpacity="0" />
                </SLG>
              </Defs>
              <G>
                <Path d="M1.5 0 V140 M4.5 0 V140" stroke="url(#trail)" strokeWidth={1.2} />
              </G>
            </Svg>
          </View>
        </Animated.View>
        {/* mark + wordmark */}
        <View style={[StyleSheet.absoluteFill, { alignItems: 'center', justifyContent: 'center' }]}>
          <Animated.View style={{ opacity: mark, transform: [{ scale: mark.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] }}>
            <LogoMark size={Math.min(120, width * 0.3)} />
          </Animated.View>
          <Animated.View style={{ marginTop: 22, opacity: word, transform: [{ translateY: word.interpolate({ inputRange: [0, 1], outputRange: [12, 0] }) }] }}>
            <Wordmark size={Math.min(30, width * 0.075)} tagline />
          </Animated.View>
        </View>
        <Animated.View style={{ position: 'absolute', bottom: 40, left: 0, right: 0, alignItems: 'center', opacity: word }}>
          <T v="caption" dim>Tap to skip</T>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}
