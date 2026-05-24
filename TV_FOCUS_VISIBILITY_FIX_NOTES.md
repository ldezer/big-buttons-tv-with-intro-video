# TV Focus Visibility + MENU Save Fix

This update fixes three things you reported about Big Buttons TV:

1. No visible indicator showing where the TV remote is pointing.
2. Save / Save Profile buttons hidden or hard to find.
3. The MENU button (the "three lines" key) on the Android TV / Fire TV remote did nothing.

## Why the previous fix did not work

This project uses stock `react-native` 0.81.5, not the `react-native-tvos`
fork. With stock React Native, `Pressable.onFocus` does **not** fire when
you move the D-pad on an Android TV / Fire TV remote. The previous fix wired
up handlers that never get called on the actual TV, which is why nothing
ever lit up on screen.

## What's new

### 1. Native key-event bridge — `plugins/withTVKeyEvents.js`
An Expo config plugin that, at prebuild time:

- Writes a small Kotlin helper `BigButtonsTVKeyEmitter.kt` into the Android
  package folder.
- Patches `MainActivity.kt` to override `dispatchKeyEvent` and forward every
  key down event (D-pad up/down/left/right, CENTER, ENTER, MENU) to JS via
  `DeviceEventEmitter` under the event name `BigButtonsTVKey`.
- For D-pad navigation keys, returns `true` so Android's default focus
  search does not also move focus. EXCEPTION: if the currently focused
  Android view is a text input (soft keyboard up), keys pass through so
  typing and in-field caret movement still work.

### 2. JS focus manager — `lib/tv-focus/focus-manager.tsx`
- `FocusProvider` — top-level provider that:
  - Subscribes to the native `BigButtonsTVKey` events.
  - Maintains a registry of every focusable element on screen with its
    measured screen rectangle.
  - Does spatial navigation on D-pad direction keys (primary-axis distance
    + 2x perpendicular penalty so DOWN prefers the nearest item below in
    roughly the same column).
  - Renders a **screen-level bright yellow ring with black shadow** at the
    focused element's rectangle. zIndex 99999, elevation 30 — this ring
    cannot be clipped by any parent View.
  - On CENTER / ENTER, invokes the focused entry's `onPress`.
  - On every screen change, automatically claims focus on the first element
    that declared `hasTVPreferredFocus`.
  - Also wires a web/keyboard fallback (arrows / Enter / Space / M) so you
    can test in the Expo web preview.
- `useFocusable(opts)` — lower-level hook used by TVPressable.
- `useMenuKey(handler)` — fires the handler when MENU (keycode 82) or
  MEDIA_MENU (305) is pressed.

### 3. Rewritten TVPressable — `components/tv/tv-pressable.tsx`
- Same props as before. **No code changes needed in the screens that already
  used TVPressable**, so every TV-facing screen (home, caregiver list,
  settings, profile edit, button edit, etc.) gets the new system
  automatically.
- Each TVPressable now registers itself with the focus manager and reports
  its on-screen rectangle through `onLayout`.
- The focused state is the union of:
  - The manager-tracked focus (driven by hardware keys)
  - The native `onFocus` (still useful on web / iOS)
  - Mouse hover
- The local focused style is also strengthened: 6 px black border, white
  background, full-opacity shadow, elevation 32. So even before the global
  yellow ring renders, the element itself visibly changes.

### 4. Sticky save bar — `components/tv/sticky-save-bar.tsx`
- Bottom-pinned overlay. `position: absolute`, zIndex 9999, elevation 50.
- Sits on top of any ScrollView content. Cannot be missed or scrolled past.
- Shows a hint: "Press the MENU button on your remote to save."
- Used on both `profile-edit` and `button-edit`. The header save button and
  the in-scroll save button are still there, so there are now three ways to
  save the same form.

### 5. MENU-key save binding
- `useMenuKey(() => { if (canSave) handleSave(); })` in both edit screens.
- Pressing the MENU button (the "three lines" key on Android TV and Fire TV
  remotes) saves the form immediately.

## Files changed

- `app/_layout.tsx` — wraps app in `<FocusProvider>`.
- `app/caregiver/profile-edit.tsx` — adds `useMenuKey`, `<StickySaveBar>`,
  extra bottom padding.
- `app/caregiver/button-edit.tsx` — same as profile-edit.
- `app.config.js` and `app.config.ts` — register the new
  `./plugins/withTVKeyEvents` plugin alongside the existing
  `./plugins/withAndroidTv`.

## Files added

- `plugins/withTVKeyEvents.js`
- `lib/tv-focus/focus-manager.tsx`
- `components/tv/sticky-save-bar.tsx`
- `components/tv/tv-pressable.tsx` (rewritten)

## How to test on the actual TV

1. Build and sideload the APK as usual (GitHub Actions workflow unchanged).
2. Open the app. You should see a bright yellow ring around the first big
   button on the home screen.
3. Move with the D-pad. The yellow ring should jump from item to item with
   every press.
4. Navigate into "Create Profile" or "Edit Profile". The first field has
   focus. Walk down through the form with DOWN — the ring follows.
5. At the bottom of the screen, you'll always see the black "Save Profile"
   button on a white bar.
6. Press the MENU button (the "three lines" key on your remote). The
   profile saves and you bounce back to the previous screen.
7. Same flow works on the Button edit screen.

## Known limitation

The element rectangles are cached on `onLayout`. If you scroll a ScrollView
without changing focus, the yellow ring stays at the last measured screen
position until you press a D-pad direction. In practice this is rarely
visible because D-pad navigation drives the scroll, but if you tap the
screen and then physically scroll, you may see the ring lag for one beat.

## Web preview testing

When running `pnpm dev:metro` and opening in a browser, the same focus
system runs in web fallback mode. Arrow keys, Enter, and Space drive
navigation; pressing `M` triggers the MENU action.
