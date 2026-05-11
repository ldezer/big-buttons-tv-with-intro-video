# Big Buttons — Mobile App Design Document

## Concept
Big Buttons is a caregiver-made giant-button launcher for autistic users, people with I/DD, elderly users, or anyone who struggles with standard technology. It presents a calm, distraction-free interface with massive tap targets and optional spoken labels.

---

## Color Scheme
| Role | Color | Hex |
|------|-------|-----|
| Primary (Blue) | Bright accessible blue | `#1565C0` |
| Accent Red | Bold red for destructive/back | `#D32F2F` |
| Accent Yellow | Warm yellow for highlights | `#F9A825` |
| Background | Clean white | `#FFFFFF` |
| Surface | Off-white card | `#F5F5F5` |
| Foreground | Near-black text | `#1A1A1A` |
| Muted | Gray secondary text | `#757575` |
| Border | Light gray | `#E0E0E0` |

---

## Architecture

### Navigation Structure
```
Root Stack
├── /                     ← Mode selector (Loved-One vs Caregiver)
├── /loved-one/[profileId] ← Giant button launcher (Loved-One Mode)
├── /caregiver/           ← Caregiver dashboard (PIN-protected)
│   ├── /caregiver/profiles        ← Profile list
│   ├── /caregiver/profile/[id]    ← Edit profile
│   ├── /caregiver/buttons/[profileId] ← Button grid editor
│   ├── /caregiver/button-edit/[id]    ← Single button editor
│   ├── /caregiver/quick-packs         ← Template packs
│   └── /caregiver/settings            ← App settings
└── /action/              ← Button action handler (image/video/url)
    ├── /action/images    ← Google Images search result
    ├── /action/videos    ← YouTube search result
    └── /action/choice    ← Pictures vs Videos choice screen
```

### Data Model
```typescript
// Profile — one per loved one
interface Profile {
  id: string;
  name: string;
  emoji: string;       // avatar emoji
  color: string;       // accent color hex
  buttons: Button[];
  settings: ProfileSettings;
  createdAt: number;
  updatedAt: number;
}

interface ProfileSettings {
  spokenLabels: boolean;    // TTS on button tap
  fontSize: 'large' | 'xlarge' | 'xxlarge';
  columns: 1 | 2 | 3;
  theme: 'default' | 'high-contrast' | 'calm';
}

// Button — a single giant tap target
interface Button {
  id: string;
  profileId: string;
  label: string;
  emoji: string;        // displayed on button
  color: string;        // button background color
  action: ButtonAction;
  isFavorite: boolean;
  order: number;
}

// Button actions
type ButtonAction =
  | { type: 'google-images'; query: string }
  | { type: 'youtube'; query: string }
  | { type: 'choice'; query: string }   // shows Pictures/Videos choice
  | { type: 'url'; url: string };

// Quick Pack — preset button collections
interface QuickPack {
  id: string;
  name: string;
  description: string;
  emoji: string;
  buttons: Omit<Button, 'id' | 'profileId'>[];
}
```

### State Management
- **AppContext** — active profile, mode (loved-one/caregiver), PIN state
- **ProfilesContext** — all profiles, CRUD operations
- **AsyncStorage** — persistence layer for all data

---

## Screen List

### 1. Mode Selector (Home)
- Two giant buttons: "I am [Name]" (loved-one) and a small "Caregiver" button
- Shows profile picker if multiple profiles exist
- Clean white background, centered layout

### 2. Loved-One Mode — Button Launcher
- Full-screen grid of giant colored buttons
- Each button shows emoji + label in large font
- Tap triggers action (opens browser/choice screen)
- Optional spoken label on tap
- Minimal chrome — no nav bar, just a small "Home" button

### 3. Choice Screen (Pictures vs Videos)
- Two giant buttons: "Pictures" (red) and "Videos" (blue)
- Shown when button action is "choice"
- Opens Google Images or YouTube accordingly

### 4. Caregiver Dashboard
- Profile cards with edit/delete
- "Add Profile" button
- Quick access to Quick Packs
- Settings gear icon

### 5. Profile Editor
- Name, emoji, color picker
- Per-profile settings (spoken labels, font size, columns)
- Preview button

### 6. Button Grid Editor
- Drag-to-reorder grid of buttons
- Add/edit/delete buttons
- Toggle favorites
- Apply Quick Pack button

### 7. Button Editor
- Label input
- Emoji picker
- Color picker (red/blue/yellow + custom)
- Action type selector (Google Images / YouTube / Choice / URL)
- Query/URL input
- Preview

### 8. Quick Packs Screen
- Grid of preset packs (Animals, Food, Activities, etc.)
- Tap to preview, apply to profile

### 9. Settings Screen
- Default font size
- Default columns
- Caregiver PIN management
- About / version info

---

## Key User Flows

### Flow 1: Loved One Uses App
1. Open app → Mode Selector shows profile(s)
2. Tap profile → Loved-One Button Launcher
3. Tap a button (e.g., "Dogs") → Choice screen (Pictures / Videos)
4. Tap "Pictures" → Google Images search opens in browser
5. Done — no back navigation needed (home button returns to launcher)

### Flow 2: Caregiver Adds a Button
1. Open app → Tap "Caregiver" (small, bottom)
2. Enter PIN (if set) → Caregiver Dashboard
3. Tap profile → Button Grid Editor
4. Tap "+" → Button Editor
5. Enter label "Dogs", pick emoji 🐕, pick blue color
6. Select action "Google Images", enter query "cute dogs"
7. Tap Save → Button appears in grid
8. Tap "Done" → returns to dashboard

### Flow 3: Caregiver Applies Quick Pack
1. Caregiver Dashboard → Quick Packs
2. Browse packs (Animals, Food, Emotions, etc.)
3. Tap pack → Preview buttons
4. Tap "Apply to [Profile]" → buttons added to profile

---

## Accessibility Principles
- Minimum button size: 100×100pt
- Font size: 24–36pt minimum for button labels
- High contrast text on colored backgrounds
- Spoken labels via expo-speech on tap
- No time-limited interactions
- Simple, linear navigation — no nested menus in loved-one mode
- Keep-awake enabled in loved-one mode
