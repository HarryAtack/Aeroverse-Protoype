/**
 * AeroVerse design tokens.
 * Dark-first palette: near-black navy foundations, aviation blue accents,
 * white type and subtle metallic detailing.
 */
export const colors = {
  bg: '#05080F',
  bgElevated: '#080D18',
  surface: '#0C1322',
  surface2: '#111A2D',
  surface3: '#17233B',
  border: 'rgba(148, 178, 255, 0.12)',
  borderStrong: 'rgba(148, 178, 255, 0.24)',
  glass: 'rgba(12, 19, 34, 0.72)',

  primary: '#3D8BFF',
  primaryDeep: '#1F5FD6',
  cyan: '#5CE1FF',
  silver: '#C9D3E3',
  steel: '#7C8BA6',

  text: '#F4F7FC',
  textMuted: '#9AA7BD',
  textDim: '#5F6D86',

  success: '#34D399',
  warning: '#FBBF24',
  danger: '#F87171',
  review: '#A78BFA',
  live: '#FF5A5F',
  sim: '#FFB547',

  overlay: 'rgba(3, 6, 12, 0.72)',
} as const;

export const rarityColors = {
  common: '#9AA6B8',
  uncommon: '#4ADE80',
  rare: '#3D8BFF',
  epic: '#B46CFF',
  legendary: '#FFB547',
  special: '#FF6BD6',
} as const;

export const gradients = {
  brand: ['#5CE1FF', '#3D8BFF', '#1F5FD6'] as const,
  night: ['#0B1830', '#05080F'] as const,
  metal: ['#E8EDF5', '#9FAABD', '#E8EDF5'] as const,
  cardShade: ['rgba(5,8,15,0)', 'rgba(5,8,15,0.55)', 'rgba(5,8,15,0.95)'] as const,
  plus: ['#FFD58A', '#FFB547', '#E07A1F'] as const,
  special: ['#5CE1FF', '#B46CFF', '#FF6BD6'] as const,
};

export const space = { xxs: 2, xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32, huge: 48 } as const;
export const radius = { sm: 8, md: 12, lg: 16, xl: 22, xxl: 28, pill: 999 } as const;

export const fonts = {
  display: 'SpaceGrotesk_700Bold',
  displayMedium: 'SpaceGrotesk_600SemiBold',
  mono: 'SpaceGrotesk_500Medium',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  bodySemi: 'Inter_600SemiBold',
  bodyBold: 'Inter_700Bold',
} as const;

export const type = {
  hero: { fontFamily: fonts.display, fontSize: 34, lineHeight: 38, letterSpacing: -0.8 },
  h1: { fontFamily: fonts.display, fontSize: 28, lineHeight: 32, letterSpacing: -0.6 },
  h2: { fontFamily: fonts.display, fontSize: 22, lineHeight: 27, letterSpacing: -0.3 },
  h3: { fontFamily: fonts.displayMedium, fontSize: 18, lineHeight: 23, letterSpacing: -0.2 },
  title: { fontFamily: fonts.bodySemi, fontSize: 16, lineHeight: 21 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 21 },
  bodyMedium: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 21 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 18 },
  smallMedium: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.bodyMedium, fontSize: 11, lineHeight: 14, letterSpacing: 0.3 },
  overline: { fontFamily: fonts.mono, fontSize: 11, lineHeight: 14, letterSpacing: 1.6, textTransform: 'uppercase' as const },
  data: { fontFamily: fonts.mono, fontSize: 15, lineHeight: 19, letterSpacing: 0.2 },
  dataLarge: { fontFamily: fonts.display, fontSize: 24, lineHeight: 28, letterSpacing: -0.4 },
} as const;

export type TypeVariant = keyof typeof type;

export const shadow = {
  glow: {
    shadowColor: colors.primary,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
};
