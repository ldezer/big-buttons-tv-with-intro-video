# Big Buttons TV: Remote Hover/Focus + Save Fix

This package is the correction pass for the Android TV version.

## Changed

1. Removed intro video startup
- `app/index.tsx` routes directly into the app.
- `assets/video` was removed from this package.
- No `intro.mp4` reference remains in `app/`, `components/`, `assets/`, or `plugins/`.

2. Android TV app tile/banner/icon
- Regenerated `assets/images/tv_banner.png` from the uploaded Big Buttons image.
- Regenerated `assets/images/icon.png`, `android-icon-foreground.png`, `android-icon-background.png`, `android-icon-monochrome.png`, `splash-icon.png`, and `favicon.png` from the same uploaded image.
- `plugins/withAndroidTv.js` sets `android:banner="@drawable/tv_banner"` and adds `LEANBACK_LAUNCHER`.
- Expo prebuild was run locally and confirmed the generated AndroidManifest contains `android:banner="@drawable/tv_banner"` and `LEANBACK_LAUNCHER`.

3. Real hover/focus effect
- `components/tv/tv-pressable.tsx` now uses both `onFocus/onBlur` for TV remotes and `onHoverIn/onHoverOut` for mouse-style hover.
- Focused/hovered controls get a thick black outline, scale-up, shadow, high elevation, and high z-index.
- The focus styling is shared across the app instead of being hand-coded differently on each screen.

4. Save buttons
- `app/caregiver/profile-edit.tsx` has visible `Save Profile` buttons in the top header and bottom of the form.
- `app/caregiver/button-edit.tsx` has visible `Save Button` buttons in the top header and bottom of the form.
- Save buttons are disabled/dimmed until the user actually makes a valid change.
- Save buttons call the real save functions (`addProfile/updateProfile`, `addButton/updateButton`).

5. Form focus
- Create/edit profile and create/edit button pages now show black focus on buttons, color options, emoji options, toggles, and text inputs.

6. Main buttons
- The loved-one home screen keeps the four main buttons image-only.
- The button visual priority remains: custom image, else selected emoji, else default 1/2/3/4 art.

## Verified locally
- `pnpm run check` passed.
- `expo prebuild --platform android --clean --no-install` passed.
- Generated AndroidManifest confirmed TV banner and Leanback launcher category.

## Could not verify locally
- Full Gradle APK build could not be completed in the sandbox because Gradle needed to download from `services.gradle.org` and the sandbox has no internet access.
- GitHub Actions should perform the APK build because it has internet access.
