import { describe, it, expect, vi, beforeEach } from 'vitest';

// ─── Mock AsyncStorage ────────────────────────────────────────────────────────
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    removeItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// ─── Types Tests ─────────────────────────────────────────────────────────────
describe('Types and constants', () => {
  it('FONT_SIZE_MAP has correct values', async () => {
    const { FONT_SIZE_MAP } = await import('../lib/types');
    expect(FONT_SIZE_MAP.large).toBe(22);
    expect(FONT_SIZE_MAP.xlarge).toBe(28);
    expect(FONT_SIZE_MAP.xxlarge).toBe(34);
  });

  it('BUTTON_COLORS contains red, blue, and yellow', async () => {
    const { BUTTON_COLORS } = await import('../lib/types');
    expect(BUTTON_COLORS).toContain('#1565C0'); // Blue
    expect(BUTTON_COLORS).toContain('#D32F2F'); // Red
    expect(BUTTON_COLORS).toContain('#F9A825'); // Yellow
  });

  it('PROFILE_COLORS is a non-empty array', async () => {
    const { PROFILE_COLORS } = await import('../lib/types');
    expect(PROFILE_COLORS.length).toBeGreaterThan(0);
  });
});

// ─── Storage Tests ────────────────────────────────────────────────────────────
describe('Storage utilities', () => {
  it('generateId returns a non-empty string', async () => {
    const { generateId } = await import('../lib/storage');
    const id = generateId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generateId returns unique IDs', async () => {
    const { generateId } = await import('../lib/storage');
    const ids = new Set(Array.from({ length: 10 }, () => generateId()));
    expect(ids.size).toBe(10);
  });

  it('DEFAULT_SETTINGS has expected shape', async () => {
    const { DEFAULT_SETTINGS } = await import('../lib/storage');
    expect(DEFAULT_SETTINGS.caregiverPin).toBeNull();
    expect(DEFAULT_SETTINGS.defaultFontSize).toBe('xlarge');
    expect(DEFAULT_SETTINGS.defaultColumns).toBe(2);
    expect(DEFAULT_SETTINGS.defaultSpokenLabels).toBe(false);
  });

  it('loadProfiles returns empty array when storage is empty', async () => {
    const { loadProfiles } = await import('../lib/storage');
    const profiles = await loadProfiles();
    expect(Array.isArray(profiles)).toBe(true);
    expect(profiles.length).toBe(0);
  });

  it('loadSettings returns defaults when storage is empty', async () => {
    const { loadSettings, DEFAULT_SETTINGS } = await import('../lib/storage');
    const settings = await loadSettings();
    expect(settings.defaultFontSize).toBe(DEFAULT_SETTINGS.defaultFontSize);
    expect(settings.defaultColumns).toBe(DEFAULT_SETTINGS.defaultColumns);
  });
});

// ─── Quick Packs Tests ────────────────────────────────────────────────────────
describe('Quick Packs', () => {
  it('QUICK_PACKS has at least 4 packs', async () => {
    const { QUICK_PACKS } = await import('../lib/quick-packs');
    expect(QUICK_PACKS.length).toBeGreaterThanOrEqual(4);
  });

  it('each pack has required fields', async () => {
    const { QUICK_PACKS } = await import('../lib/quick-packs');
    for (const pack of QUICK_PACKS) {
      expect(pack.id).toBeTruthy();
      expect(pack.name).toBeTruthy();
      expect(pack.emoji).toBeTruthy();
      expect(Array.isArray(pack.buttons)).toBe(true);
      expect(pack.buttons.length).toBeGreaterThan(0);
    }
  });

  it('each button in a pack has a valid action type', async () => {
    const { QUICK_PACKS } = await import('../lib/quick-packs');
    const validTypes = ['google-images', 'youtube', 'choice', 'url'];
    for (const pack of QUICK_PACKS) {
      for (const btn of pack.buttons) {
        expect(validTypes).toContain(btn.action.type);
        expect(btn.label).toBeTruthy();
        expect(btn.emoji).toBeTruthy();
        expect(btn.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
      }
    }
  });

  it('Animals pack has 6 buttons', async () => {
    const { QUICK_PACKS } = await import('../lib/quick-packs');
    const animals = QUICK_PACKS.find(p => p.id === 'animals');
    expect(animals).toBeDefined();
    expect(animals!.buttons.length).toBe(6);
  });
});

// ─── Button Action Logic Tests ────────────────────────────────────────────────
describe('Button action URL construction', () => {
  it('Google Images URL is correctly formed', () => {
    const query = 'cute dogs';
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=active`;
    expect(url).toBe('https://www.google.com/search?q=cute%20dogs&tbm=isch&safe=active');
  });

  it('YouTube URL is correctly formed', () => {
    const query = 'funny cats';
    const url = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    expect(url).toBe('https://www.youtube.com/results?search_query=funny%20cats');
  });

  it('URL with special characters is properly encoded', () => {
    const query = 'dogs & cats';
    const encoded = encodeURIComponent(query);
    expect(encoded).toBe('dogs%20%26%20cats');
  });
});

// ─── Text Color Logic Tests ───────────────────────────────────────────────────
describe('Text color contrast logic', () => {
  function getTextColor(bgColor: string): string {
    const hex = bgColor.replace('#', '');
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.6 ? '#1A1A1A' : '#FFFFFF';
  }

  it('returns dark text on yellow (light) background', () => {
    expect(getTextColor('#F9A825')).toBe('#1A1A1A');
  });

  it('returns white text on blue (dark) background', () => {
    expect(getTextColor('#1565C0')).toBe('#FFFFFF');
  });

  it('returns white text on red (dark) background', () => {
    expect(getTextColor('#D32F2F')).toBe('#FFFFFF');
  });

  it('returns dark text on white background', () => {
    expect(getTextColor('#FFFFFF')).toBe('#1A1A1A');
  });
});
