import { ImageSourcePropType } from 'react-native';

export const BUNDLED_BUTTON_ART: Record<string, ImageSourcePropType> = {
  'button-art-1': require('@/assets/images/custom/button-art-1.png'),
  'button-art-2': require('@/assets/images/custom/button-art-2.png'),
  'button-art-3': require('@/assets/images/custom/button-art-3.png'),
  'button-art-4': require('@/assets/images/custom/button-art-4.png'),
};

export const BUNDLED_PROFILE_ART: Record<string, ImageSourcePropType> = {
  'profile-avatar': require('@/assets/images/custom/profile-avatar.png'),
  'profile-banner': require('@/assets/images/custom/profile-banner.png'),
};

export const BUTTON_ART_OPTIONS = [
  { key: '', label: 'No bundled art' },
  { key: 'button-art-1', label: 'Bundled slot 1' },
  { key: 'button-art-2', label: 'Bundled slot 2' },
  { key: 'button-art-3', label: 'Bundled slot 3' },
  { key: 'button-art-4', label: 'Bundled slot 4' },
] as const;

export const PROFILE_AVATAR_OPTIONS = [
  { key: '', label: 'No bundled avatar' },
  { key: 'profile-avatar', label: 'Bundled avatar slot' },
] as const;

export const PROFILE_BANNER_OPTIONS = [
  { key: '', label: 'No bundled banner' },
  { key: 'profile-banner', label: 'Bundled banner slot' },
] as const;

export function getBundledButtonArt(key?: string | null): ImageSourcePropType | null {
  if (!key) return null;
  return BUNDLED_BUTTON_ART[key] ?? null;
}

export function getBundledProfileArt(key?: string | null): ImageSourcePropType | null {
  if (!key) return null;
  return BUNDLED_PROFILE_ART[key] ?? null;
}

export function cleanImageUri(value?: string | null): string {
  const next = String(value ?? '').trim();
  if (!next) return '';
  if (/^(https?:\/\/|file:\/\/|content:\/\/|data:image\/)/i.test(next)) return next;
  return '';
}
