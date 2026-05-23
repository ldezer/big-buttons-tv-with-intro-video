# Big Buttons Android TV final fix notes

This package was rebuilt around Android TV remote use. It is not a phone layout with small style tweaks.

## What changed

- Removed the intro video startup flow from `app/index.tsx`.
- Removed the bundled `assets/video/intro.mp4` file from the package.
- The app now opens directly into the first profile's Big Buttons screen, or caregiver setup if no profile exists.
- Replaced the app logo assets with the supplied Big Buttons image:
  - `assets/images/custom/big-buttons-logo.jpg`
  - `assets/images/tv_banner.png`
  - `assets/images/icon.png`
  - `assets/images/splash-icon.png`
  - Android adaptive icon assets.
- Added/updated Android TV manifest support using `plugins/withAndroidTv.js`:
  - adds Leanback TV support
  - marks touchscreen as not required
  - adds `LEANBACK_LAUNCHER`
  - sets `android:banner="@drawable/tv_banner"`
  - copies the TV banner into generated Android resources during prebuild.
- Rebuilt `app/loved-one/[profileId].tsx` so the TV home screen is:
  - Big Buttons logo at the top
  - four image-only big buttons in the middle
  - Create Profile / Edit Profile / Create Buttons / Back directly underneath.
- Removed visible word labels from the four main Big Buttons tiles.
- Added a reusable focus wrapper at `components/tv/tv-pressable.tsx`.
- Focus uses `onFocus` / `onBlur` state, not only text styling.
- Focused controls get a thick black outline, scale, shadow, elevation, and high z-index.
- Converted Create/Edit Button controls to TV focusable controls.
- Converted Profile edit controls to TV focusable controls.
- Create/Edit Button page now has a visible top `Save Button` and a bottom `Save Button`.
- Create/Edit Profile page has top and bottom `Save Profile` controls.
- Color options are visible as actual colored circles and focusable.
- Button visuals now prioritize one visual only:
  - custom image first
  - else emoji-only state
  - else default bundled art.
- GitHub Actions keeps `newArchEnabled=true` for Reanimated.

## Files most affected

- `app/index.tsx`
- `app/loved-one/[profileId].tsx`
- `app/caregiver/button-edit.tsx`
- `app/caregiver/profile-edit.tsx`
- `app/caregiver/buttons/[profileId].tsx`
- `components/tv/tv-pressable.tsx`
- `plugins/withAndroidTv.js`
- `app.config.ts`
- `app.config.js`
- `.github/workflows/build-tv-apk.yml`

## Test checklist

- Install APK on Android TV.
- App opens without video.
- Android TV Apps screen shows the Big Buttons image as the tile/banner/icon.
- Home screen shows logo, four image-only buttons, then admin/profile controls underneath.
- D-pad focus visibly moves with a thick black outline.
- Create/Edit Button page has visible Save Button at top and bottom.
- User can create a button, save it, and return without guessing where focus is.
- Profile color choices are visible and focusable.
