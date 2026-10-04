export const Colors = {
  // Green and white palette shared by Hala screens and controls.
  background: '#FFFFFF',
  surface: '#FFFFFF',
  header: '#FFFFFF',
  tabBar: '#FFFFFF',
  surfaceRaised: '#F4F4F4',
  border: '#E2E5E3',

  textPrimary: '#232C33',
  textSecondary: '#5B5B5B',
  textMuted: '#737873',
  white: '#FFFFFF',
  black: '#000000',

  accent: '#005029',
  accentSoft: '#E7F3EC',
  brandGreen: '#005029',
  success: '#005029',
  successSoft: '#E7F3EC',
  danger: '#C62828',
  dangerSoft: '#FDECEC',
  warning: '#806400',
  warningSoft: '#FFF5D6',
  info: '#176B8A',
  purple: '#65509A',
  purpleSoft: '#F0EBF7',
  onAccent: '#FFFFFF',
  onMedia: '#FFFFFF',
  mapWater: '#DCEEF2',
  mapPark: '#CFE8D8',
  road: '#FFFFFF',

  // Keep white overlays for photographs and dark media viewers.
  overlaySubtle: '#0000001F',
  overlaySoft: '#00000073',
  overlay: '#000000CC',
  lightOverlaySubtle: '#FFFFFF26',
  lightOverlay: '#FFFFFF8C',
  transparent: 'transparent',
} as const;

export type AppColorName = keyof typeof Colors;
