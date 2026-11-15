import React from 'react';
import { View } from 'react-native';
import Svg, { Circle, Defs, G, LinearGradient, Path, RadialGradient, Rect, Stop } from 'react-native-svg';
import { colors, fonts } from '@/theme/tokens';
import { T } from '@/components/ui/Text';

/** Top-down swept-wing airliner glyph, nose up, centred in a 100x100 box. */
export const AIRCRAFT_PATH =
  'M50 14 C53.2 14 54.8 19.5 54.8 26 L54.8 41 L84 55.5 L84 62 L54.8 54.5 L54.2 69.5 L64 76.5 L64 81 L50 77.6 L36 81 L36 76.5 L45.8 69.5 L45.2 54.5 L16 62 L16 55.5 L45.2 41 L45.2 26 C45.2 19.5 46.8 14 50 14 Z';

/**
 * The AeroVerse mark: an airliner banking through an open orbit ring,
 * with a radar arc and a "satellite" point representing the global network.
 */
export function LogoMark({ size = 64, mono = false }: { size?: number; mono?: boolean }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="ring" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={mono ? '#fff' : colors.cyan} />
          <Stop offset="0.55" stopColor={mono ? '#fff' : colors.primary} />
          <Stop offset="1" stopColor={mono ? '#fff' : colors.primaryDeep} stopOpacity={mono ? 1 : 0.9} />
        </LinearGradient>
        <LinearGradient id="metal" x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.5" stopColor="#C9D3E3" />
          <Stop offset="1" stopColor="#FFFFFF" />
        </LinearGradient>
        <RadialGradient id="sweep" cx="50" cy="50" r="44" gradientUnits="userSpaceOnUse">
          <Stop offset="0" stopColor={colors.cyan} stopOpacity="0" />
          <Stop offset="1" stopColor={colors.cyan} stopOpacity={mono ? 0 : 0.28} />
        </RadialGradient>
      </Defs>
      {/* radar wedge */}
      <Path d="M50 50 L50 6 A44 44 0 0 1 88.1 28 Z" fill="url(#sweep)" />
      {/* open orbit ring */}
      <Path
        d="M78.3 16.3 A44 44 0 1 0 93.6 44"
        stroke="url(#ring)"
        strokeWidth={5.2}
        strokeLinecap="round"
        fill="none"
      />
      {/* inner range ring */}
      <Circle cx="50" cy="50" r="27" stroke={mono ? '#fff' : colors.primary} strokeOpacity={0.35} strokeWidth={1.4} fill="none" />
      {/* satellite point */}
      <Circle cx="88.5" cy="29" r="4.6" fill={mono ? '#fff' : colors.cyan} />
      {/* aircraft, banking north-east */}
      <G transform="rotate(42 50 50)">
        <Path d={AIRCRAFT_PATH} fill={mono ? '#fff' : 'url(#metal)'} />
      </G>
    </Svg>
  );
}

export function Wordmark({ size = 22, tagline = false }: { size?: number; tagline?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <T
        style={{
          fontFamily: fonts.display,
          fontSize: size,
          lineHeight: size * 1.15,
          letterSpacing: size * 0.22,
          color: colors.text,
        }}
      >
        AERO<T style={{ fontFamily: fonts.display, fontSize: size, letterSpacing: size * 0.22, color: colors.cyan }}>VERSE</T>
      </T>
      {tagline && (
        <T v="overline" color={colors.textMuted} style={{ marginTop: 6, letterSpacing: 3 }}>
          The global aviation community
        </T>
      )}
    </View>
  );
}

export function LogoLockup({ size = 28 }: { size?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
      <LogoMark size={size + 6} />
      <T
        style={{ fontFamily: fonts.display, fontSize: size * 0.72, letterSpacing: size * 0.12, color: colors.text }}
      >
        AERO<T style={{ fontFamily: fonts.display, fontSize: size * 0.72, letterSpacing: size * 0.12, color: colors.cyan }}>VERSE</T>
      </T>
    </View>
  );
}

/** App icon artwork (used to render icon PNGs and inside the app). */
export function AppIcon({ size = 96 }: { size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id="bgI" x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#0E1F3D" />
          <Stop offset="1" stopColor="#03060C" />
        </LinearGradient>
      </Defs>
      <Rect x="0" y="0" width="100" height="100" rx="22" fill="url(#bgI)" />
      <G transform="translate(14 14) scale(0.72)">
        <LogoMarkPaths />
      </G>
    </Svg>
  );
}

function LogoMarkPaths() {
  return (
    <G>
      <Path d="M78.3 16.3 A44 44 0 1 0 93.6 44" stroke={colors.primary} strokeWidth={5.2} strokeLinecap="round" fill="none" />
      <Circle cx="50" cy="50" r="27" stroke={colors.primary} strokeOpacity={0.35} strokeWidth={1.4} fill="none" />
      <Circle cx="88.5" cy="29" r="4.6" fill={colors.cyan} />
      <G transform="rotate(42 50 50)">
        <Path d={AIRCRAFT_PATH} fill="#EEF2F8" />
      </G>
    </G>
  );
}
