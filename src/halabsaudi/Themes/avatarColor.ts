import {Colors} from './Colors';

// /src/Themes/avatarColor.ts

export const COLORS = [
  Colors.purple,
  Colors.success,
  Colors.info,
  Colors.warning,
  Colors.accent,
  Colors.textMuted,
  Colors.accent,
  Colors.purple,
];

export function getAvatarColor(userId: string) {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    hash = userId.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % COLORS.length;
  return COLORS[index];
}
