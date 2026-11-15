import React from 'react';
import { Text as RNText, TextProps, TextStyle } from 'react-native';
import { colors, type as typeScale, TypeVariant } from '@/theme/tokens';

export interface TProps extends TextProps {
  v?: TypeVariant;
  color?: string;
  muted?: boolean;
  dim?: boolean;
  center?: boolean;
  weight?: TextStyle['fontWeight'];
}

export function T({ v = 'body', color, muted, dim, center, style, ...rest }: TProps) {
  const c = color ?? (dim ? colors.textDim : muted ? colors.textMuted : colors.text);
  return (
    <RNText
      maxFontSizeMultiplier={1.4}
      {...rest}
      style={[typeScale[v] as TextStyle, { color: c }, center && { textAlign: 'center' }, style]}
    />
  );
}
