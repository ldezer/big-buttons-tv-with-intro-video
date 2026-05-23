# Real Black Focus Fix Notes

This package specifically corrects the TV layout problems seen on the APK test:

- Big button labels/word pills were removed from the four main TV buttons.
- The four main buttons now show only the button art or the chosen emoji.
- Emoji mode replaces the art instead of stacking on top of it.
- A real black moving focus outline was added using onFocus/onBlur state, not just the unsupported focused style callback.
- Profile controls were moved directly under the four buttons.
- The controls under the buttons are Create Profile, Edit Profile, Create Buttons, and Back.
- The bottom helper/status text remains removed.
- The logo uses the Big Buttons image asset.
- The Pictures/Videos choice screen also uses the same real black focus outline.

Save buttons already exist on:
- app/caregiver/profile-edit.tsx as Save / Save Profile
- app/caregiver/button-edit.tsx as Save / Save Button

