// ─── Button Action Types ─────────────────────────────────────────────────────

export type ButtonActionType = 'google-images' | 'youtube' | 'choice' | 'url';

export interface GoogleImagesAction {
  type: 'google-images';
  query: string;
}

export interface YouTubeAction {
  type: 'youtube';
  query: string;
}

export interface ChoiceAction {
  type: 'choice';
  query: string;
}

export interface UrlAction {
  type: 'url';
  url: string;
}

export type ButtonAction = GoogleImagesAction | YouTubeAction | ChoiceAction | UrlAction;

// ─── Button ──────────────────────────────────────────────────────────────────

export interface BigButton {
  id: string;
  profileId: string;
  label: string;
  emoji: string;
  color: string;       // hex color for button background
  imageUri?: string;   // optional remote or local URI for full-tile art
  bundledArtKey?: string; // optional bundled asset slot name
  action: ButtonAction;
  isFavorite: boolean;
  order: number;
}

// ─── Profile Settings ────────────────────────────────────────────────────────

export type FontSize = 'large' | 'xlarge' | 'xxlarge';
export type ColumnCount = 1 | 2 | 3;

export interface ProfileSettings {
  spokenLabels: boolean;
  fontSize: FontSize;
  columns: ColumnCount;
}

// ─── Profile ─────────────────────────────────────────────────────────────────

export interface Profile {
  id: string;
  name: string;
  emoji: string;
  color: string;       // accent color hex
  avatarImageUri?: string;
  avatarBundledArtKey?: string;
  bannerImageUri?: string;
  bannerBundledArtKey?: string;
  backgroundImageUri?: string;
  buttons: BigButton[];
  settings: ProfileSettings;
  createdAt: number;
  updatedAt: number;
}

// ─── Quick Pack ──────────────────────────────────────────────────────────────

export type QuickPackButton = Omit<BigButton, 'id' | 'profileId'>;

export interface QuickPack {
  id: string;
  name: string;
  description: string;
  emoji: string;
  buttons: QuickPackButton[];
}

// ─── App Settings ────────────────────────────────────────────────────────────

export interface AppSettings {
  caregiverPin: string | null;
  defaultFontSize: FontSize;
  defaultColumns: ColumnCount;
  defaultSpokenLabels: boolean;
}

// ─── Font size map ────────────────────────────────────────────────────────────

export const FONT_SIZE_MAP: Record<FontSize, number> = {
  large: 22,
  xlarge: 28,
  xxlarge: 34,
};

// ─── Button color palette ─────────────────────────────────────────────────────

export const BUTTON_COLORS = [
  '#1565C0', // Blue
  '#D32F2F', // Red
  '#F9A825', // Yellow
  '#2E7D32', // Green
  '#6A1B9A', // Purple
  '#00838F', // Teal
  '#E65100', // Orange
  '#37474F', // Dark Gray
];

export const PROFILE_COLORS = [
  '#1565C0',
  '#D32F2F',
  '#F9A825',
  '#2E7D32',
  '#6A1B9A',
  '#00838F',
  '#E65100',
];
