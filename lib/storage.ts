import AsyncStorage from '@react-native-async-storage/async-storage';
import { Profile, AppSettings } from './types';
import { cleanImageUri } from './art';

const KEYS = {
  PROFILES: 'bb_profiles',
  SETTINGS: 'bb_settings',
};

export const DEFAULT_SETTINGS: AppSettings = {
  caregiverPin: null,
  defaultFontSize: 'xlarge',
  defaultColumns: 2,
  defaultSpokenLabels: false,
};

// ─── Profiles ────────────────────────────────────────────────────────────────

export async function loadProfiles(): Promise<Profile[]> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PROFILES);
    if (!raw) return createDefaultProfiles();
    const parsed = JSON.parse(raw) as Profile[];
    return normalizeProfiles(parsed);
  } catch {
    return [];
  }
}

export async function saveProfiles(profiles: Profile[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.PROFILES, JSON.stringify(profiles));
}

// ─── Settings ────────────────────────────────────────────────────────────────

export async function loadSettings(): Promise<AppSettings> {
  try {
    const raw = await AsyncStorage.getItem(KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } as AppSettings;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings: AppSettings): Promise<void> {
  await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}



function createDefaultProfiles(): Profile[] {
  const now = Date.now();
  const profileId = 'default_big_buttons_profile';
  return [
    {
      id: profileId,
      name: 'Big Buttons',
      emoji: '🔘',
      color: '#1565C0',
      avatarBundledArtKey: 'profile-avatar',
      bannerBundledArtKey: 'profile-banner',
      buttons: [
        {
          id: 'btn_animals',
          profileId,
          label: 'Animals',
          emoji: '🐶',
          color: '#D32F2F',
          bundledArtKey: 'button-art-1',
          action: { type: 'choice', query: 'cute animals' },
          isFavorite: true,
          order: 1,
        },
        {
          id: 'btn_cartoons',
          profileId,
          label: 'Cartoons',
          emoji: '📺',
          color: '#1565C0',
          bundledArtKey: 'button-art-2',
          action: { type: 'choice', query: 'funny cartoons for kids' },
          isFavorite: true,
          order: 2,
        },
        {
          id: 'btn_sports',
          profileId,
          label: 'Sports',
          emoji: '🏀',
          color: '#F9A825',
          bundledArtKey: 'button-art-3',
          action: { type: 'choice', query: 'sports highlights' },
          isFavorite: false,
          order: 3,
        },
        {
          id: 'btn_music',
          profileId,
          label: 'Music',
          emoji: '🎵',
          color: '#2E7D32',
          bundledArtKey: 'button-art-4',
          action: { type: 'youtube', query: 'happy music videos' },
          isFavorite: false,
          order: 4,
        },
      ],
      settings: {
        spokenLabels: false,
        fontSize: 'xlarge',
        columns: 2,
      },
      createdAt: now,
      updatedAt: now,
    },
  ];
}

function normalizeProfiles(profiles: Profile[]): Profile[] {
  return (profiles || []).map(profile => ({
    ...profile,
    avatarImageUri: cleanImageUri(profile.avatarImageUri),
    avatarBundledArtKey: profile.avatarBundledArtKey || '',
    bannerImageUri: cleanImageUri(profile.bannerImageUri),
    bannerBundledArtKey: profile.bannerBundledArtKey || '',
    backgroundImageUri: cleanImageUri(profile.backgroundImageUri),
    buttons: (profile.buttons || []).map(button => ({
      ...button,
      imageUri: cleanImageUri((button as any).imageUri),
      bundledArtKey: (button as any).bundledArtKey || '',
    })),
  }));
}
