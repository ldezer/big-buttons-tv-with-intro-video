# Big Buttons — Project TODO

## Setup & Configuration
- [x] Configure red/blue/yellow color theme in theme.config.js
- [x] Update tailwind.config.js with brand colors
- [x] Update app.config.ts with app name and branding
- [x] Add icon mappings for all required icons

## Data Layer
- [x] Define TypeScript types (Profile, Button, ButtonAction, QuickPack)
- [x] Build ProfilesContext with AsyncStorage persistence
- [x] Build AppContext (active profile, mode, PIN state)
- [x] Seed default Quick Packs data

## Navigation
- [x] Set up root stack navigator (no tabs)
- [x] Mode selector screen (home)
- [x] Loved-One Mode route
- [x] Caregiver Mode routes (dashboard, profiles, buttons, settings)
- [x] Action/choice screen route

## Loved-One Mode
- [x] Mode selector / profile picker screen
- [x] Giant button launcher screen
- [x] Button grid (1/2/3 column layout)
- [x] Button action handler (open browser for images/videos/url)
- [x] Choice screen (Pictures vs Videos)
- [x] Spoken labels (expo-speech) on button tap
- [x] Keep-awake in loved-one mode

## Caregiver Mode
- [x] Caregiver dashboard screen
- [x] Profile list with add/edit/delete
- [x] Profile editor (name, emoji, color, settings)
- [x] Button grid editor with reorder
- [x] Button editor (label, emoji, color, action)
- [x] Quick Packs browser screen
- [x] Apply quick pack to profile
- [x] Favorites toggle on buttons
- [x] Settings screen (PIN, font size, columns)

## Branding & Assets
- [x] Generate app icon/logo
- [x] Apply icon to all required asset locations
- [x] Update app.config.ts with logoUrl

## Polish & Accessibility
- [x] Haptic feedback on button taps
- [x] Press animation on giant buttons
- [x] High contrast text on colored buttons
- [x] Accessible font sizes (min 24pt for buttons)
- [x] Caregiver PIN protection
