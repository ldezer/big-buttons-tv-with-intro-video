# TV Black Focus / Save / Layout Fixes

This build fixes the actual TV behavior requested:

- The loved-one screen now shows the logo/banner first, then the four main buttons, then the profile controls underneath.
- Removed the old focus-helper/status wording. The app now relies on the moving focus outline instead of text telling the user where they are.
- Changed TV focus styling to a strong black moving outline with black shadow/elevation.
- Added/kept large Save buttons on profile and button edit screens.
- Made color choices visibly render as large color circles instead of appearing blank.
- Updated the button art behavior: default buttons fall back to the 1/2/3/4 art slots; choosing an emoji stores an emoji-only state so the emoji replaces the art instead of stacking over it.
- Updated the GitHub Actions workflow with newArchEnabled=true so the Reanimated Android release build can pass.
- Added react-native-tv-focus.d.ts so TypeScript accepts TV focused/hasTVPreferredFocus/focusable properties.

Validation:

- `pnpm run check` passes with TypeScript.
