export const Colors = {
  // Compact HBS palette. Keep new screens on these semantic tokens only.
  background: '#101114',
  surface: '#191B20',
  surfaceRaised: '#23262D',
  border: '#343841',

  textPrimary: '#F5F6F8',
  textSecondary: '#ABB2BF',
  textMuted: '#8B919C',
  white: '#FFFFFF',
  black: '#000000',

  accent: '#E75049',
  accentSoft: '#3B2427',
  brandGreen: '#005029',
  success: '#7CC4A6',
  successSoft: '#243C34',
  warning: '#D0A700',
  warningSoft: '#3A3218',
  info: '#53BDEB',
  purple: '#7C5CFC',
  purpleSoft: '#302943',

  // Alpha colors use 8-digit hex instead of alpha color syntax.
  overlaySubtle: '#0000001F',
  overlaySoft: '#00000073',
  overlay: '#000000CC',
  lightOverlaySubtle: '#FFFFFF26',
  lightOverlay: '#FFFFFF8C',
  transparent: 'transparent',
} as const;

export type AppColorName = keyof typeof Colors;
